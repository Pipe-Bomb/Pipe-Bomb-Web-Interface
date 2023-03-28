import PipeBomb from "pipebomb.js";

export default class PipeBombConnection {
    private static instance: PipeBombConnection;
    private api: PipeBomb;
    private url: string = "";
    private token: string = "";
    
    private constructor() {
        this.api = new PipeBomb("");
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
    }

    public setToken(token: string) {
        if (this.token == token) return;
        this.token = token;
        this.api.setToken(token);
    }
}