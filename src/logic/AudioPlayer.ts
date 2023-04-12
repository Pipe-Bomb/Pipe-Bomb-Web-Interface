import Track from "pipebomb.js/dist/music/Track";
import PipeBombConnection from "./PipeBombConnection";
import { convertArrayToString } from "./Utils";
import KeyboardShortcuts from "./KeyboardShortcuts";
import AudioWrapper from "./audio/AudioWrapper";

export interface VolumeStatus {
    volume: number,
    muted: boolean,
    enabled: boolean
}

export default class AudioPlayer {
    private static instance: AudioPlayer;
    public readonly audio = new AudioWrapper();
    private keyboardShortcuts = KeyboardShortcuts.getInstance();

    private currentTrack: Track | null = null;
    private queue: Track[] = [];
    private paused = false;
    private volume = 100;
    private muted = false;
    private volumeEnabled = true;

    private queueUpdateCallbacks: (() => void)[] = [];
    private volumeUpdateCallbacks: ((volume: VolumeStatus) => void)[] = [];

    private constructor() {
        if ("mediaSession" in navigator) {
            navigator.mediaSession.setActionHandler("previoustrack", () => this.previousTrack());
            navigator.mediaSession.setActionHandler("nexttrack", () => this.nextTrack());
        }

        this.audio.registerUpdateEventListener(audioType => {
            this.paused = audioType.isPaused();

            const newVolume = audioType.getVolume();
            const newMuted = audioType.isMuted();
            const newEnabled = audioType.isVolumeEnabled();
            if (this.volume != newVolume || this.muted != newMuted || this.volumeEnabled != newEnabled) {
                console.log("audio shift!");
                this.volume = newVolume;
                this.muted = newMuted;
                this.volumeEnabled = newEnabled;
                this.sendVolumeCallbacks();
            }
        });

        this.audio.registerEndEventListener(() => this.nextTrack());
    }

    public static getInstance() {
        if (!this.instance) this.instance = new AudioPlayer();
        return this.instance;
    }

    public getCurrentTrack() {
        return this.currentTrack;
    }

    public async playTrack(track: Track, forcePlay?: boolean) {
        this.paused = false;
        if (this.currentTrack?.trackID == track.trackID && !forcePlay) {
            if (!this.audio.activeType.isPaused()) this.audio.activeType.setPaused(false);
            return;
        } else {
            const url = `${PipeBombConnection.getInstance().getUrl()}/v1/audio/${track.trackID}`;
            await this.audio.activeType.setMedia(url, track.isUnknown() ? null : await track.getMetadata());
            if (!this.paused) this.audio.activeType.setPaused(false);
        }
        
        this.currentTrack = track;
        this.sendQueueCallbacks();

        if ("mediaSession" in navigator && this.currentTrack) {
            this.currentTrack.getMetadata().then(metadata => {
                const mediaMeta = new MediaMetadata({
                    title: metadata.title,
                    artist: convertArrayToString(metadata.artists),
                    artwork: metadata.image ? [{
                        src: metadata.image
                    }] : undefined
                });
                document.title = metadata.title;
                navigator.mediaSession.metadata = mediaMeta;
            }).catch(error => {
                console.error(error);
            })
        }
    }

    public async pause() {
        console.log("pausing!");
        await this.audio.activeType.setPaused(true);
    }

    public async play() {
        if (this.audio.activeType.getCurrentTime() == this.audio.activeType.getDuration()) {
            await this.setTime(0);
            await this.audio.activeType.setPaused(false);
            return;
        }
        if (!this.currentTrack && this.queue.length) {
            await this.nextTrack();
            return;
        }
        console.log("resuming!");
        await this.audio.activeType.setPaused(false);
    }

    public async nextTrack() {
        const nextTrack = this.queue.shift();
        if (nextTrack) {
            await this.playTrack(nextTrack, true);
        } else {
            await this.pause();
            await this.setTime(0);
        }
    }

    public async previousTrack() {
        if (this.audio.activeType.getCurrentTime() > 10) {
            await this.setTime(0);
            await this.audio.activeType.setPaused(false);
        } else {
            console.log("no functionality");
        }
    }

    public async setTime(percent: number) {
        const time = this.audio.activeType.getDuration() / 100 * Math.min(Math.max(percent, 0), 100);
        await this.audio.activeType.seek(time);
    }

    public async addTime(seconds: number) {
        if (this.audio.activeType.isBuffering()) return;
        const time = Math.max(Math.min(this.audio.activeType.getCurrentTime() + seconds, this.audio.activeType.getDuration()), 0);
        if (time < this.audio.activeType.getDuration()) {
            await this.audio.activeType.seek(time);
        } else {
            await this.nextTrack();
        }
    }

    public addToQueue(tracks: Track[], position?: number) {
        if (position !== undefined) {
            this.queue.splice(position, 0, ...tracks);
        } else {
            this.queue.push(...tracks);
        }
        this.sendQueueCallbacks();
    }

    public getQueue() {
        return Array.from(this.queue);
    }

    public setQueueOrder(order: number[]) {
        let newOrder: Track[] = [];

        for (let index of order) {
            newOrder.push(this.queue[index]);
        }
        this.queue.splice(0, this.queue.length, ...newOrder);
        this.sendQueueCallbacks();
    }

    public removeFromQueue(index: number) {
        this.queue.splice(index, 1);
        this.sendQueueCallbacks();
    }

    public clearQueue() {
        this.queue.splice(0, this.queue.length);
        this.sendQueueCallbacks();
    }

    public getVolume(): VolumeStatus {
        return {
            volume: this.audio.activeType.getVolume(),
            muted: this.audio.activeType.isMuted(),
            enabled: this.audio.activeType.isVolumeEnabled()
        };
    }

    public registerVolumeCallback(callback: (volume: VolumeStatus) => void) {
        this.volumeUpdateCallbacks.push(callback);
    }

    public unregisterVolumeCallback(callback: (volume: VolumeStatus) => void) {
        const index = this.volumeUpdateCallbacks.indexOf(callback);
        if (index < 0) return;
        this.volumeUpdateCallbacks.splice(index, 1);
    }

    private sendVolumeCallbacks() {
        const volume = this.getVolume();
        for (let callbackFunction of this.volumeUpdateCallbacks) {
            callbackFunction(volume);
        }
    }

    public registerQueueCallback(callback: () => void) {
        this.queueUpdateCallbacks.push(callback);
    }

    public unregisterQueueCallback(callback: () => void) {
        const index = this.queueUpdateCallbacks.indexOf(callback);
        if (index < 0) return;
        this.queueUpdateCallbacks.splice(index, 1);
    }

    private sendQueueCallbacks() {
        for (let callbackFunction of this.queueUpdateCallbacks) {
            callbackFunction();
        }
    }
}