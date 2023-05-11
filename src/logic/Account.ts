import Cookies from "js-cookie";
import Axios from "axios";
import PipeBombConnection from "./PipeBombConnection";
import { generateHash } from "./Utils";

export interface UserDataFormat {
    username: string,
    userID: string,
    email: string,
    rawID: string
}

export default class Account {
    private static instance: Account;

    private token: string | null = null;
    private username: string | null = null;
    private userID: string | null = null;
    private rawID: string | null = null;
    private email: string | null = null;

    private dataAwaitCallbacks: (() => void)[] = [];

    private constructor() {
        if (location.hash.length > 1) {
            let tempToken = location.hash.substring(1);
            PipeBombConnection.getInstance().setToken(tempToken);
            this.verifyToken(tempToken)
            .then(data => {
                if (!data) {
                    this.redirect();
                    return;
                }
            });

        } else {
            this.token = Cookies.get("pipebomb-token") || null;

            if (!this.token) {
               this.redirect();
               return;
            }

            PipeBombConnection.getInstance().setToken(this.token);

            this.verifyToken(this.token)
            .then(data => {
                if (!data) {
                    this.redirect();
                    return;
                }
            });
        }
    }

    private redirect() {
        const url = window.location.href;
        window.location.href = "https://eyezah.com/authenticate?client-id=57524&identifier=" + btoa(url.includes("#") ? url.split("#")[0] : url);
    }

    public static getInstance() {
        if (!this.instance) this.instance = new Account();
        return this.instance;
    }

    public getToken() {
        return this.token;
    }

    private verifyToken(token: string) {
        return new Promise<boolean>(resolve => {
            Axios.get(`https://eyezah.com/authenticate/api/get-user?token=${token}`)
            .then(data => {
                const response: any = data.data;
                if (typeof response?.id == "string" && typeof response?.username == "string" && typeof response?.email == "string") {
                    this.userID = response.id;
                    this.rawID = this.userID.includes("@") ? this.userID.split("@", 2)[1] : this.userID;
                    this.username = response.username;
                    this.email = response.email;
                    this.token = token;
                    Cookies.set("pipebomb-token", token, {
                        expires: 365
                    });

                    // history.pushState("", document.title, location.pathname + location.search);

                    while (this.dataAwaitCallbacks.length) {
                        const callback = this.dataAwaitCallbacks.shift();
                        if (callback) callback();
                    }
                    return resolve(true);
                }

                resolve(false);
            }, error => {
                console.error(error);
                resolve(false);
            });
        })
    }

    public async getUserData() {
        return new Promise<UserDataFormat>((resolve) => {
            if (this.userID && this.username && this.email) return resolve({
                username: this.username,
                userID: this.userID,
                email: this.email,
                rawID: this.rawID
            });

            this.dataAwaitCallbacks.push(() => {
                resolve({
                    username: this.username || "",
                    userID: this.userID || "",
                    email: this.email || "",
                    rawID: this.rawID || ""
                });
            });
        });
    }

    public static getAvatarUrl(userID: string) {
        const value = generateHash(userID)();
        const imageID = Math.floor(value * 100001);
        return `https://www.thiswaifudoesnotexist.net/example-${imageID}.jpg`;
    }
}