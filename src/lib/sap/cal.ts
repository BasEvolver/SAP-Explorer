import { Buffer } from "buffer";

export type CALStatus = "ACTIVE" | "SUSPENDED" | "ACTIVATING" | "SUSPENDING" | "ERROR" | "CONFIG_ERROR";

export interface CALApplianceDetails {
  id: string;
  name: string;
  status: CALStatus;
  rawStatus?: string;
  cloudProvider?: string;
  region?: string;
  endpoints?: string[];
}

export class SAPCalClient {
  private static instance: SAPCalClient;
  private apiUrl: string;
  private applianceId: string;
  private clientId: string;
  private clientSecret: string;
  private tokenUrl: string;
  
  // Cache the token to prevent redundant OAuth requests
  private cachedToken: string | null = null;
  private tokenExpiryTime: number = 0;

  private constructor() {
    this.apiUrl = process.env.SAP_CAL_API_URL || "https://cal.sap.com/api";
    this.applianceId = process.env.SAP_CAL_APPLIANCE_ID || "";
    this.clientId = process.env.SAP_CAL_CLIENT_ID || "";
    this.clientSecret = process.env.SAP_CAL_CLIENT_SECRET || "";
    this.tokenUrl = process.env.SAP_CAL_TOKEN_URL || "";
  }

  public static getInstance(): SAPCalClient {
    if (!SAPCalClient.instance) {
      SAPCalClient.instance = new SAPCalClient();
    }
    return SAPCalClient.instance;
  }

  /**
   * Check if the client is correctly configured in .env.local
   */
  public isConfigured(): boolean {
    return !!(this.applianceId && this.clientId && this.clientSecret && this.tokenUrl);
  }

  /**
   * Fetches/retrieves an OAuth 2.0 access token using client credentials
   */
  private async getAccessToken(): Promise<string> {
    // If we have a cached token that is still valid (with a 60-second buffer), use it
    if (this.cachedToken && Date.now() < this.tokenExpiryTime - 60000) {
      return this.cachedToken;
    }

    if (!this.isConfigured()) {
      throw new Error("SAP CAL API is not fully configured. Please check your .env.local variables.");
    }

    console.log("[SAPCalClient] Requesting new OAuth access token...");
    
    const basicAuth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
    
    const response = await fetch(this.tokenUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to retrieve OAuth token: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.access_token) {
      throw new Error("Token request succeeded but did not return access_token.");
    }

    this.cachedToken = data.access_token;
    // Set expiry time based on expires_in (seconds)
    const expiresIn = data.expires_in || 3600;
    this.tokenExpiryTime = Date.now() + (expiresIn * 1000);

    return this.cachedToken!;
  }

  /**
   * General request helper for CAL endpoints
   */
  private async makeCALRequest(endpoint: string, method: "GET" | "POST" = "GET"): Promise<any> {
    const token = await this.getAccessToken();
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${this.apiUrl}${cleanEndpoint}`;

    console.log(`[SAPCalClient] ${method} request to ${url}`);

    const response = await fetch(url, {
      method,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`SAP CAL API error: ${response.status} ${response.statusText} - ${text}`);
    }

    if (method === "POST") {
      // POST requests might return empty or metadata responses
      const text = await response.text();
      return text ? JSON.parse(text) : { success: true };
    }

    return response.json();
  }

  /**
   * Get current appliance details and parse status
   */
  public async getApplianceStatus(): Promise<CALApplianceDetails> {
    if (!this.isConfigured()) {
      return {
        id: this.applianceId,
        name: "Not Configured",
        status: "CONFIG_ERROR",
      };
    }

    try {
      // CAL endpoint: /workloads/v1/appliances/{id}
      const data = await this.makeCALRequest(`/workloads/v1/appliances/${this.applianceId}`, "GET");
      
      // Parse status
      const rawStatus = data.status || "";
      let status: CALStatus = "ERROR";

      // Normalize SAP CAL statuses (e.g. Active, Suspended, Activating, Suspending, etc.)
      const normalizedRaw = rawStatus.toUpperCase();
      if (normalizedRaw.includes("ACTIVATING") || normalizedRaw.includes("STARTING") || normalizedRaw.includes("PREPARING")) {
        status = "ACTIVATING";
      } else if (normalizedRaw.includes("SUSPENDING") || normalizedRaw.includes("STOPPING")) {
        status = "SUSPENDING";
      } else if (normalizedRaw.includes("ACTIVE") || normalizedRaw.includes("STARTED")) {
        status = "ACTIVE";
      } else if (normalizedRaw.includes("SUSPENDED") || normalizedRaw.includes("STOPPED")) {
        status = "SUSPENDED";
      } else if (normalizedRaw.includes("ERROR") || normalizedRaw.includes("FAILED")) {
        status = "ERROR";
      }

      return {
        id: data.id || this.applianceId,
        name: data.name || "SAP Instance",
        status,
        rawStatus: rawStatus,
        cloudProvider: data.cloudProvider,
        region: data.region,
        endpoints: data.endpoints || [],
      };
    } catch (error: any) {
      console.error("[SAPCalClient] Error checking appliance status:", error);
      return {
        id: this.applianceId,
        name: "SAP S/4HANA CAL Instance",
        status: "ERROR",
        rawStatus: error.message || "Unknown API Error",
      };
    }
  }

  /**
   * Trigger appliance activation (Start)
   */
  public async activateAppliance(): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      return { success: false, message: "SAP CAL API is not fully configured." };
    }

    try {
      // CAL endpoint: /workloads/v1/appliances/{id}/activate
      await this.makeCALRequest(`/workloads/v1/appliances/${this.applianceId}/activate`, "POST");
      return { success: true, message: "Activation triggered successfully." };
    } catch (error: any) {
      console.error("[SAPCalClient] Error activating appliance:", error);
      return { success: false, message: error.message || "Failed to trigger activation." };
    }
  }

  /**
   * Trigger appliance suspension (Stop)
   */
  public async suspendAppliance(): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      return { success: false, message: "SAP CAL API is not fully configured." };
    }

    try {
      // CAL endpoint: /workloads/v1/appliances/{id}/suspend
      await this.makeCALRequest(`/workloads/v1/appliances/${this.applianceId}/suspend`, "POST");
      return { success: true, message: "Suspension triggered successfully." };
    } catch (error: any) {
      console.error("[SAPCalClient] Error suspending appliance:", error);
      return { success: false, message: error.message || "Failed to trigger suspension." };
    }
  }
}
