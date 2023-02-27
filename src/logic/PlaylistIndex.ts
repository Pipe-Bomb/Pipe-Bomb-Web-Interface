import PipeBombConnection from "./PipeBombConnection";
import Collection from "pipebomb.js/dist/collection/Collection";

export default class PlaylistIndex {
    private static instance: PlaylistIndex;

    private playlists: Map<number, Collection> = new Map();
    private callbacks: ((playlists: Collection[]) => void)[] = [];
    

    private constructor() {
        if (PipeBombConnection.getInstance().getUrl()) {
            this.checkPlaylists();
        }

        setInterval(() => {
            if (PipeBombConnection.getInstance().getUrl()) {
                this.checkPlaylists();
            }
        }, 10_000);
    }

    public static getInstance() {
        if (!this.instance) this.instance = new PlaylistIndex();
        return this.instance;
    }

    public async checkPlaylists() {
        const playlists = await PipeBombConnection.getInstance().getApi().v1.getPlaylists();

        let playlistIndexes: number[] = [];

        for (let playlist of playlists) {
            playlistIndexes.push(playlist.collectionID);
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
        for (let callback of this.callbacks) {
            callback(playlists);
        }
    }

    public registerUpdateCallback(callback: (playlists: Collection[]) => void) {
        this.callbacks.push(callback);
    }

    public unregisterUpdateCallback(callback: (playlists: Collection[]) => void) {
        const index = this.callbacks.indexOf(callback);
        if (index < 0) return;
        this.callbacks.splice(index, 1);
    }

    public getPlaylists() {
        return Array.from(this.playlists.values());
    }

    public async getPlaylist(playlistID: number) {
        const playlist = this.playlists.get(playlistID);
        return playlist || null;
    }
}