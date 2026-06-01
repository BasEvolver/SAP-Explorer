import { exec } from "child_process";
import { promisify } from "util";
import { CALApplianceDetails, CALStatus } from "./cal";

const execAsync = promisify(exec);

export interface AzureVM {
  name: string;
  resourceGroup: string;
  powerState: string;
  provisioningState: string;
}

export class AzureVMClient {
  private static instance: AzureVMClient;

  private constructor() {}

  public static getInstance(): AzureVMClient {
    if (!AzureVMClient.instance) {
      AzureVMClient.instance = new AzureVMClient();
    }
    return AzureVMClient.instance;
  }

  /**
   * Run a local az CLI command and parse the JSON output
   */
  private async runAzCommand(command: string): Promise<any> {
    try {
      const { stdout } = await execAsync(command);
      return stdout ? JSON.parse(stdout) : null;
    } catch (error: any) {
      // Check if the error indicates that the user is not logged in
      const errStr = error.stderr || error.message || "";
      if (errStr.includes("az login") || errStr.includes("expired") || errStr.includes("Interactive authentication")) {
        throw new Error("AZURE_LOGIN_REQUIRED");
      }
      throw error;
    }
  }

  /**
   * Automatically discovers SAP/HANA-related Virtual Machines in the Azure subscription
   */
  public async discoverSAPVMs(): Promise<AzureVM[]> {
    console.log("[AzureVMClient] Querying Azure VMs in subscription...");
    
    // Command to list all VMs in the active subscription with powerState details
    const cmd = 'az vm list --show-details --query "[].{name:name, resourceGroup:resourceGroup, powerState:powerState, provisioningState:provisioningState}" -o json';
    const vms: any[] = await this.runAzCommand(cmd);

    if (!vms || vms.length === 0) {
      return [];
    }

    // Filter to find VMs matching SAP, HANA, or EVOSND resource groups
    return vms.filter(vm => {
      const name = (vm.name || "").toLowerCase();
      const rg = (vm.resourceGroup || "").toLowerCase();
      
      return (
        name.includes("vhcal") || 
        name.includes("s4h") || 
        name.includes("hana") || 
        name.includes("sap") ||
        rg.includes("evosnd") || 
        rg.includes("s4h")
      );
    });
  }

  /**
   * Get overall status of discovered SAP VMs
   */
  public async getStatus(): Promise<CALApplianceDetails> {
    try {
      const vms = await this.discoverSAPVMs();
      
      if (vms.length === 0) {
        return {
          id: "azure-fallback",
          name: "Azure VM Mode (No VMs Found)",
          status: "CONFIG_ERROR",
          rawStatus: "No SAP-related virtual machines found in active Azure subscription.",
        };
      }

      // If multiple VMs exist, let's aggregate status (if any is active/activating, etc.)
      const firstVM = vms[0];
      let status: CALStatus = "SUSPENDED";
      let rawStates: string[] = [];

      vms.forEach(vm => {
        const powerState = (vm.powerState || "").toLowerCase();
        rawStates.push(`${vm.name}: ${vm.powerState}`);

        if (powerState.includes("running")) {
          status = "ACTIVE";
        } else if (powerState.includes("starting")) {
          status = "ACTIVATING";
        } else if (powerState.includes("stopping") || powerState.includes("deallocating")) {
          status = "SUSPENDING";
        }
      });

      // Special case: if one is starting and others are stopped, overall is activating
      const hasStarting = vms.some(v => (v.powerState || "").toLowerCase().includes("starting"));
      const hasStopping = vms.some(v => (v.powerState || "").toLowerCase().includes("stopping") || (v.powerState || "").toLowerCase().includes("deallocating"));
      const hasRunning = vms.some(v => (v.powerState || "").toLowerCase().includes("running"));
      const allDeallocated = vms.every(v => (v.powerState || "").toLowerCase().includes("deallocated"));

      if (hasStarting) {
        status = "ACTIVATING";
      } else if (hasStopping) {
        status = "SUSPENDING";
      } else if (hasRunning) {
        status = "ACTIVE";
      } else if (allDeallocated) {
        status = "SUSPENDED";
      }

      return {
        id: firstVM.name,
        name: `Azure VM: ${firstVM.name} (${vms.length} Node${vms.length > 1 ? 's' : ''})`,
        status,
        rawStatus: rawStates.join(", "),
        cloudProvider: "Microsoft Azure",
        region: firstVM.resourceGroup,
      };
    } catch (error: any) {
      if (error.message === "AZURE_LOGIN_REQUIRED") {
        return {
          id: "azure-fallback",
          name: "Azure VM Mode",
          status: "CONFIG_ERROR",
          rawStatus: "AZURE_LOGIN_REQUIRED",
        };
      }
      
      console.error("[AzureVMClient] Error fetching status:", error);
      return {
        id: "azure-fallback",
        name: "Azure VM Mode (Error)",
        status: "ERROR",
        rawStatus: error.message || "Azure CLI error",
      };
    }
  }

  /**
   * Start the discovered virtual machines
   */
  public async startVMs(): Promise<{ success: boolean; message: string }> {
    try {
      const vms = await this.discoverSAPVMs();
      if (vms.length === 0) {
        return { success: false, message: "No SAP virtual machines found in Azure to start." };
      }

      console.log(`[AzureVMClient] Starting ${vms.length} virtual machine(s)...`);
      
      // Trigger start command for all discovered VMs in parallel
      const startPromises = vms.map(vm => {
        const cmd = `az vm start --name ${vm.name} --resource-group ${vm.resourceGroup} --no-wait`;
        return execAsync(cmd);
      });

      await Promise.all(startPromises);
      return { success: true, message: `Starting ${vms.length} SAP virtual machine(s) in Azure...` };
    } catch (error: any) {
      if (error.message === "AZURE_LOGIN_REQUIRED") {
        return { success: false, message: "Azure session expired. Please run 'az login' in your command terminal." };
      }
      return { success: false, message: error.message || "Failed to start Azure virtual machines." };
    }
  }

  /**
   * Stop / Deallocate the discovered virtual machines to save compute charges
   */
  public async stopVMs(): Promise<{ success: boolean; message: string }> {
    try {
      const vms = await this.discoverSAPVMs();
      if (vms.length === 0) {
        return { success: false, message: "No SAP virtual machines found in Azure to stop." };
      }

      console.log(`[AzureVMClient] Stopping/Deallocating ${vms.length} virtual machine(s)...`);

      // Trigger deallocate command for all discovered VMs in parallel
      const stopPromises = vms.map(vm => {
        const cmd = `az vm deallocate --name ${vm.name} --resource-group ${vm.resourceGroup} --no-wait`;
        return execAsync(cmd);
      });

      await Promise.all(stopPromises);
      return { success: true, message: `Stopping/Deallocating ${vms.length} SAP virtual machine(s) in Azure...` };
    } catch (error: any) {
      if (error.message === "AZURE_LOGIN_REQUIRED") {
        return { success: false, message: "Azure session expired. Please run 'az login' in your command terminal." };
      }
      return { success: false, message: error.message || "Failed to stop Azure virtual machines." };
    }
  }
}
