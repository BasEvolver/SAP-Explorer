import { parseStringPromise } from 'xml2js';
import * as https from 'https';

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
            const cause = error.cause ? ` (${error.cause.message || error.cause.code})` : "";
            return { status: "error", message: `${error.message}${cause}` };
        }
    }

    private async makeRequest(urlStr: string, accept: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const url = new URL(urlStr);
            const options: https.RequestOptions = {
                hostname: url.hostname,
                port: url.port,
                path: url.pathname + url.search,
                method: 'GET',
                headers: {
                    'Authorization': this.authHeader,
                    'Accept': accept
                },
                rejectUnauthorized: false // Bulletproof TLS bypass
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
                        reject(new Error(`SAP Error ${res.statusCode}: ${res.statusMessage} - ${data}`));
                    } else {
                        resolve(data);
                    }
                });
            });

            req.on('error', (e) => {
                reject(e);
            });

            // Set a 15-second timeout so it doesn't hang indefinitely
            req.setTimeout(15000, () => {
                req.destroy(new Error("Connection timed out. Check AWS Security Group firewall."));
            });

            req.end();
        });
    }

    async odataQuery(apiPath: string, filters: string = "") {
        const url = `${this.baseUrl}/${apiPath}?$format=json${filters}`;
        console.log(`[SAPClient] Fetching: ${url}`);

        try {
            const responseText = await this.makeRequest(url, 'application/json');
            return JSON.parse(responseText);
        } catch (error: any) {
            const cause = error.code ? ` (${error.code})` : "";
            throw new Error(`Network request failed: ${error.message}${cause}`);
        }
    }

    async getMetadata(apiPath: string) {
        // Drop the service path and fetch $metadata
        const servicePath = apiPath.split('/')[0];
        const url = `${this.baseUrl}/${servicePath}/$metadata`;
        console.log(`[SAPClient] Fetching Metadata: ${url}`);

        try {
            const xmlText = await this.makeRequest(url, 'application/xml');
            const json = await parseStringPromise(xmlText, { explicitArray: false });
            return json;
        } catch (error: any) {
            const cause = error.code ? ` (${error.code})` : "";
            throw new Error(`Network request failed: ${error.message}${cause}`);
        }
    }
}
