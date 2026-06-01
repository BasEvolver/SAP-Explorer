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

    async odataPost(apiPath: string, payload: any): Promise<any> {
        const servicePath = apiPath.split('/')[0];
        const tokenUrl = `${this.baseUrl}/${servicePath}/`;
        
        console.log(`[SAPClient] Initiating CSRF Token Handshake: ${tokenUrl}`);
        const { token, cookies } = await this.fetchCsrfTokenAndCookies(tokenUrl);
        
        const url = `${this.baseUrl}/${apiPath}`;
        console.log(`[SAPClient] Executing OData POST to: ${url}`);
        
        return new Promise<any>((resolve, reject) => {
            const urlObj = new URL(url);
            const options: https.RequestOptions = {
                hostname: urlObj.hostname,
                port: urlObj.port,
                path: urlObj.pathname + urlObj.search,
                method: 'POST',
                headers: {
                    'Authorization': this.authHeader,
                    'x-csrf-token': token,
                    'Cookie': cookies.join('; '),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                rejectUnauthorized: false
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
                        reject(new Error(`SAP POST Error ${res.statusCode}: ${res.statusMessage} - ${data}`));
                    } else {
                        try {
                            resolve(JSON.parse(data));
                        } catch (e) {
                            resolve({ status: "success", rawResponse: data });
                        }
                    }
                });
            });

            req.on('error', (e) => reject(e));
            req.write(JSON.stringify(payload));
            req.end();
        });
    }

    async odataPatch(apiPath: string, payload: any): Promise<any> {
        const servicePath = apiPath.split('/')[0];
        const tokenUrl = `${this.baseUrl}/${servicePath}/`;
        
        console.log(`[SAPClient] Initiating CSRF Token Handshake for PATCH: ${tokenUrl}`);
        const { token, cookies } = await this.fetchCsrfTokenAndCookies(tokenUrl);
        
        const url = `${this.baseUrl}/${apiPath}`;
        console.log(`[SAPClient] Executing OData PATCH to: ${url}`);
        
        return new Promise<any>((resolve, reject) => {
            const urlObj = new URL(url);
            const options: https.RequestOptions = {
                hostname: urlObj.hostname,
                port: urlObj.port,
                path: urlObj.pathname + urlObj.search,
                method: 'PATCH',
                headers: {
                    'Authorization': this.authHeader,
                    'x-csrf-token': token,
                    'Cookie': cookies.join('; '),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                rejectUnauthorized: false
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
                        reject(new Error(`SAP PATCH Error ${res.statusCode}: ${res.statusMessage} - ${data}`));
                    } else {
                        try {
                            resolve(JSON.parse(data));
                        } catch (e) {
                            resolve({ status: "success", rawResponse: data });
                        }
                    }
                });
            });

            req.on('error', (e) => reject(e));
            req.write(JSON.stringify(payload));
            req.end();
        });
    }


    private async fetchCsrfTokenAndCookies(urlStr: string): Promise<{ token: string, cookies: string[] }> {
        return new Promise((resolve, reject) => {
            const url = new URL(urlStr);
            const options: https.RequestOptions = {
                hostname: url.hostname,
                port: url.port,
                path: url.pathname + "?$format=json",
                method: 'GET',
                headers: {
                    'Authorization': this.authHeader,
                    'x-csrf-token': 'fetch'
                },
                rejectUnauthorized: false
            };

            const req = https.request(options, (res) => {
                const token = res.headers['x-csrf-token'] as string;
                const cookies = res.headers['set-cookie'] || [];
                
                if (!token) {
                    console.warn("[SAPClient] CSRF token fetch failed, proceeding with dummy token.");
                    resolve({ token: "dummy-token", cookies: [] });
                } else {
                    resolve({ token, cookies });
                }
            });

            req.on('error', (e) => reject(e));
            req.end();
        });
    }
}
