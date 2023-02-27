import PipeBomb from "pipebomb.js";
import HostInfo from "pipebomb.js/dist/HostInfo";
import { removeProtocol } from "./Utils";

export default class ServerIndex {
    private static instance: ServerIndex;
    private servers: HostInfo[] = [];
    private statuses: Map<string, "secure" | "insecure" | "offline" | "checking"> = new Map();
    private currentlyChecking = false;
    private updateCallbacks: ((hosts: HostInfo[]) => void)[] = [];

    private constructor() {
        this.loadServers();
    }

    public static getInstance() {
        if (!this.instance) this.instance = new ServerIndex();
        return this.instance;
    }

    private loadServers() {
        const value = localStorage.getItem("savedServers");
        if (!value) return;
        try {
            const json = JSON.parse(value);
            const newServers: HostInfo[] = [];
            const usedHosts: string[] = [];
            for (let entry of json) {
                if (typeof entry?.host == "string" && typeof entry?.name == "string" && typeof entry?.https == "boolean") {
                    const host = removeProtocol(entry.host);
                    if (usedHosts.includes(host)) continue;
                    usedHosts.push(host);
                    newServers.push({
                        host,
                        name: entry.name,
                        https: entry.https
                    });
                }
            }
            this.servers = newServers;
            this.checkServers();
            return true;
        } catch {
            this.saveServers();
            return false;
        }
    }

    private checkServers(): Promise<void> {
        return new Promise(async resolve => {
            if (this.currentlyChecking) return resolve();
            this.currentlyChecking = true;
            const toCheck = Array.from(this.servers);
            const checkCount = toCheck.length;
            let checked = 0;
            while (toCheck.length) {
                const hostInfo = toCheck.shift();
                if (!hostInfo) break;

                this.checkServer(hostInfo)
                .then(() => {
                    checked++;
                    if (checked >= checkCount) {
                        this.currentlyChecking = false;
                        resolve();
                    }
                });
            }
        });
    }

    public checkServer(hostInfo: HostInfo): Promise<void> {
        return new Promise(resolve => {
            const host = removeProtocol(hostInfo.host);
            this.statuses.set(host, "checking");
            this.pushToCallbacks();
            PipeBomb.checkHost(hostInfo.host)
            .then(newHostInfo => {
                if (newHostInfo) {
                    hostInfo.https = newHostInfo.https;
                    hostInfo.name = newHostInfo.name;
                    this.statuses.set(host, newHostInfo.https ? "secure" : "insecure");
                } else {
                    this.statuses.set(host, "offline");
                }
                this.pushToCallbacks();
                this.saveServers();
                resolve();
            });
        });
    }

    private saveServers() {
        localStorage.setItem("savedServers", JSON.stringify(this.servers));
    }

    public getServer(host: string): HostInfo | null {
        host = removeProtocol(host);
        for (let hostInfo of this.servers) {
            if (hostInfo.host == host) return hostInfo;
        }
        return null;
    }

    public getServers() {
        return Array.from(this.servers);
    }

    public async addServer(host: string) {
        host = removeProtocol(host);
        if (this.getServer(host)) throw "already exists";
        if (this.servers.length >= 10) throw "max servers";
        const tempInfo = {
            host: removeProtocol(host),
            https: false,
            name: "New Server"
        };
        this.servers.push(tempInfo);
        this.statuses.set(tempInfo.host, "checking");
        await this.checkServer(tempInfo);
    }

    public async removeServer(host: string) {
        host = removeProtocol(host);
        const hostInfo = this.getServer(host);
        this.statuses.delete(host);
        if (!hostInfo) return;
        const index = this.servers.indexOf(hostInfo);
        if (index < 0) return;
        this.servers.splice(index, 1);
        this.saveServers();
        this.pushToCallbacks();
    }

    public registerUpdateCallback(callback: (hosts: HostInfo[]) => void) {
        this.updateCallbacks.push(callback);
    }

    public unregisterUpdateCallback(callback: (hosts: HostInfo[]) => void) {
        const index = this.updateCallbacks.indexOf(callback);
        if (index < 0) return;
        this.updateCallbacks.splice(index, 1);
    }

    private pushToCallbacks() {
        const out = this.getServers();
        for (let callback of this.updateCallbacks) {
            callback(out);
        }
    }

    public getServerStatus(hostInfo: HostInfo) {
        return this.statuses.get(hostInfo.host) || "unknown";
    }
}