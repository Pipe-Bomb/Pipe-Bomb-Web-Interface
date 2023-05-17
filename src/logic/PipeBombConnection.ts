import PipeBomb from "pipebomb.js";
import Cookies from "js-cookie";
import { copyTextToClipboard, generateHash, wait } from "./Utils";
import { createNotification } from "../components/NotificationManager";
import PrivateKeyGeneratorWorker from "./workers/PrivateKeyGeneratorWorker?worker";

interface PrivateKeyGenerationInterface {
    privateKey: string,
    time: number
}

export interface UserData {
    userID: string
    username: string
}

export default class PipeBombConnection {
    private static instance: PipeBombConnection;
    private api: PipeBomb;
    private url: string = "";
    private token: string = "";
    private eventListeners: ((api: PipeBombConnection) => void)[] = [];
    private authenticationLoading = false;
    private connectionLoading = false;

    private privateKey: string;
    private publicKey: string;
    private userID: string;
    private username: string;
    
    private constructor() {
        this.privateKey = localStorage.getItem("privateKey") || null;
        if (this.privateKey) {
            try {
                const keys = PipeBomb.getAccountKeys(this.privateKey);
                this.publicKey = keys.publicKey;
                this.userID = keys.userID;
            } catch {
                this.privateKey = null;
                localStorage.removeItem("privateKey");
            }
        }

        this.username = localStorage.getItem("username") || null;
        this.url = localStorage.getItem("host") || null;
        this.token = Cookies.get("jwt") || null;

        this.api = new PipeBomb(this.url || "", {
            token: this.token || undefined,
            privateKey: this.privateKey || undefined
        });

        if (this.privateKey && this.username) {
            this.loginWithKey(this.username, this.privateKey, {
                quiet: true
            });
        }
    }

    public setUsername(username: string) {
        this.username = username;
        localStorage.setItem("username", username);
    }

    private static generatePrivateKey(userHash: string): Promise<PrivateKeyGenerationInterface> {
        return new Promise((resolve, reject) => {
            const worker = new PrivateKeyGeneratorWorker();
            worker.postMessage(userHash);
            worker.onmessage = message => {
                if (message.data.error) {
                    reject();
                } else {
                    resolve(message.data);
                }
            }
        });
    }

    public async login(username: string, password: string, createIfMissing?: boolean) {
        this.authenticationLoading = true;
        this.updateCallbacks();
        try {
            const hash = PipeBomb.getCredentialHash(username, password);
            const key = await PipeBombConnection.generatePrivateKey(hash);
            return await this.loginWithKey(username, key.privateKey, { createIfMissing });
        } catch (e) {
            this.authenticationLoading = false;
            this.updateCallbacks();
            throw e;
        }
    }

    public async loginWithKey(username: string, privateKey: string, options?: {
        createIfMissing?: boolean,
        quiet?: boolean
    }) {
        let publicKey: string, userID: string;
        try {
            const keys = PipeBomb.getAccountKeys(privateKey);
            publicKey = keys.publicKey;
            userID = keys.userID;
        } catch {
            throw "Invalid private key";
        }
        localStorage.setItem("privateKey", privateKey);
        localStorage.setItem("username", username);
        this.privateKey = privateKey;
        this.publicKey = publicKey;
        this.userID = userID;
        this.username = username;

        if (!this.api.context.getAddress()) {
            this.authenticationLoading = false;
            this.updateCallbacks();
            return;
        }

        try {
            this.authenticationLoading = true;
            if (!options?.quiet) this.updateCallbacks();
            const token = await this.api.authenticate(username, {
                privateKey: privateKey,
                createIfMissing: !!options?.createIfMissing
            });
            Cookies.set("jwt", token, {
                expires: 365
            });
            this.token = token;
        } catch {
            this.token = null;
            Cookies.remove("jwt");
        } finally {
            this.authenticationLoading = false;
            this.updateCallbacks();
        }
    }

    public getStatus() {
        if (this.authenticationLoading) return "pending";
        if (!this.privateKey || !this.username) return "unauthenticated";
        if (this.connectionLoading) return "loading";
        if (!this.token || !this.url) return "disconnected";
        return "authenticated";
    }

    public static getInstance() {
        if (!this.instance) this.instance = new PipeBombConnection();
        return this.instance;
    }

    public getApi() {
        return this.api;
    }

    public getUrl() {
        return this.url;
    }

    public async setHost(host: string, createIfMissing?: boolean) {
        if (this.connectionLoading || !this.username) return;

        this.connectionLoading = true;
        this.updateCallbacks();

        await wait(1000);

        this.api.context.setHost(host);
        try {
            const token = await this.api.authenticate(this.username, {
                privateKey: this.privateKey,
                createIfMissing: !!createIfMissing
            });
            Cookies.set("jwt", token, {
                expires: 365
            });
    
            this.url = host;
            this.token = token;
            this.api.context.setHost(host);
            
        } finally {
            this.connectionLoading = false;
            this.updateCallbacks();
        }
        
    }

    public getUserData(): Promise<UserData> {
        return new Promise(async resolve => {
            while (!this.publicKey) {
                await wait(100);
            }
            resolve({
                userID: this.userID,
                username: this.username
            })
        });
    }

    private updateCallbacks() {
        for (let callback of this.eventListeners) {
            callback(this);
        }
    }

    public registerUpdateCallback(callback: (api: PipeBombConnection) => void) {
        if (!this.eventListeners.includes(callback)) this.eventListeners.push(callback);
    }

    public unregisterUpdateCallback(callback: (api: PipeBombConnection) => void) {
        const index = this.eventListeners.indexOf(callback);
        if (index < 0) return;
        this.eventListeners.splice(index, 1);
    }

    public copyLink(subject: string, id: string) {
        if (typeof id != "string") {
            const anyId: any = id;
            id = anyId.toString();
        }
        if (id.includes("@")) {
            const parts = id.split("@", 2);
            copyTextToClipboard(`http://${parts[0]}/${subject}/${parts[1]}`);
        } else {
            copyTextToClipboard(`${this.api.context.getHost()}/${subject}/${id}`);
        }
        
        createNotification({
            text: "Copied link to clipboard!",
            status: "normal"
        })
    }

    public static getAvatarUrl(userID: string) {
        const value = generateHash(userID)();
        const imageID = Math.floor(value * 100001);
        return `https://www.thiswaifudoesnotexist.net/example-${imageID}.jpg`;
    }
}