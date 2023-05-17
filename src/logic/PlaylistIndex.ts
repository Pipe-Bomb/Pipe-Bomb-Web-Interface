import Playlist from "pipebomb.js/dist/collection/Playlist";
import PipeBombConnection from "./PipeBombConnection";

export default class PlaylistIndex {
    private static instance: PlaylistIndex;

    private playlists: Map<string, Playlist> | null = null;
    private callbacks: ((playlists: Playlist[]) => void)[] = [];
    

    private constructor() {
        if (PipeBombConnection.getInstance().getUrl()) {
            this.checkPlaylists();
        }

        setInterval(() => {
            if (PipeBombConnection.getInstance().getUrl()) {
                if (PipeBombConnection.getInstance().getStatus() == "authenticated") {
                    this.checkPlaylists();
                }
            }
        }, 10_000);

        PipeBombConnection.getInstance().registerUpdateCallback(() => {
            if (PipeBombConnection.getInstance().getStatus() == "authenticated") {
                this.playlists = null;
                this.checkPlaylists();
            }
        });
    }

    public static getInstance() {
        if (!this.instance) this.instance = new PlaylistIndex();
        return this.instance;
    }

    public async checkPlaylists() {
        if (PipeBombConnection.getInstance().getStatus() != "authenticated") return;
        
        const playlists = await PipeBombConnection.getInstance().getApi().v1.getPlaylists();
        if (!this.playlists) this.playlists = new Map();

        let playlistIndexes: string[] = [];

        for (let playlist of playlists) {
            playlistIndexes.push(playlist.collectionID);
            if (!this.playlists) this.playlists = new Map();
            this.playlists.set(playlist.collectionID, playlist);
        }

        for (let [key] of this.playlists.entries()) {
            if (!playlistIndexes.includes(key)) this.playlists.delete(key);
        }
        this.updateCallbacks();
        return Array.from(playlists.values());
    }

    private updateCallbacks() {
        const playlists = this.getPlaylists();
        if (!playlists) return;
        for (let callback of this.callbacks) {
            callback(playlists);
        }
    }

    public registerUpdateCallback(callback: (playlists: Playlist[]) => void) {
        this.callbacks.push(callback);
    }

    public unregisterUpdateCallback(callback: (playlists: Playlist[]) => void) {
        const index = this.callbacks.indexOf(callback);
        if (index < 0) return;
        this.callbacks.splice(index, 1);
    }

    public getPlaylists() {
        if (!this.playlists) return null;
        return Array.from(this.playlists.values());
    }

    public async getPlaylist(playlistID: string) {
        if (this.playlists) {
            const playlist = this.playlists.get(playlistID);
            if (playlist) {
                return playlist;
            }
        }
        const newPlaylist = await PipeBombConnection.getInstance().getApi().v1.getPlaylist(playlistID);

        return newPlaylist || null;
    }
}