// Disable TLS validation for the SAP CAL self-signed certificate.
// This is acceptable for a sandbox environment, but shouldn't be used in production.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { parseStringPromise } from 'xml2js';

export class SAPClient {
    private static instance: SAPClient;
    private baseUrl: string;
    private authHeader: string;

    private constructor() {
        this.baseUrl = process.env.SAP_BASE_URL || "https://vhcals4hcs.dummy.nodomain:44301/sap/opu/odata/sap";
        const user = process.env.SAP_USER || "Bas";
        const pass = process.env.SAP_PASSWORD || "Aria1234";
        this.authHeader = 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64');
    }

    public static getInstance(): SAPClient {
        if (!SAPClient.instance) {
            SAPClient.instance = new SAPClient();
        }
        return SAPClient.instance;
    }

    async ping() {
        try {
            // Test connection to the Chart of Accounts API to verify everything is working
            const response = await this.odataQuery("API_GLACCOUNTINCHARTOFACCOUNTS_SRV/A_GLAccountInChartOfAccounts", "&$top=1");
            return { status: "connected", testData: response };
        } catch (error: any) {
            return { status: "error", message: error.message };
        }
    }

    async odataQuery(apiPath: string, filters: string = "") {
        const url = `${this.baseUrl}/${apiPath}?$format=json${filters}`;
        console.log(`[SAPClient] Fetching: ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': this.authHeader,
                'Accept': 'application/json'
            },
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`SAP Error ${response.status}: ${response.statusText} - ${text}`);
        }

        return await response.json();
    }

    async getMetadata(apiPath: string) {
        // Drop the service path and fetch $metadata
        const servicePath = apiPath.split('/')[0];
        const url = `${this.baseUrl}/${servicePath}/$metadata`;
        console.log(`[SAPClient] Fetching Metadata: ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': this.authHeader,
                'Accept': 'application/xml' // Metadata is XML
            },
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`SAP Metadata Error ${response.status}: ${response.statusText} - ${text}`);
        }

        const xmlText = await response.text();
        const json = await parseStringPromise(xmlText, { explicitArray: false });
        return json;
    }
}
