import PipeBomb from "pipebomb.js";
import Cookies from "js-cookie";
import { copyTextToClipboard } from "./Utils";
import { createNotification } from "../components/NotificationManager";

export default class PipeBombConnection {
    private static instance: PipeBombConnection;
    private api: PipeBomb;
    private url: string = "";
    private token: string = "";
    private eventListeners: ((api: PipeBombConnection) => void)[] = [];
    
    private constructor() {
        this.api = new PipeBomb("", {
            token: Cookies.get("pipebomb-token")
        });
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

    public setHost(host: string) {
        if (this.url == host) return;
        this.url = host;
        this.api.setHost(host);
        for (let callback of this.eventListeners) {
            callback(this);
        }
    }

    public setToken(token: string) {
        if (this.token == token) return;
        this.token = token;
        this.api.setToken(token);
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
}