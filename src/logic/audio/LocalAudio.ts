import { TrackMeta } from "pipebomb.js/dist/music/Track";
import AudioType from "./AudioType";

export default class LocalAudio extends AudioType {
    private audio = new Audio();
    private buffering = false;
    private lastBuffer = 0;
    private url = "";
    private meta: TrackMeta | null;

    public constructor() {
        super("local");

        this.audio.ontimeupdate = () => {
            this.update();
        }

        this.audio.onplaying = () => {
            this.buffering = false;
            this.update();
        }

        this.audio.oncanplay = () => {
            this.buffering = false;
            this.lastBuffer = 0;
            this.update();
        }

        this.audio.onerror = e => {
            console.error(e);
        }

        this.audio.onpause = () => this.update();
        this.audio.onplay = () => this.update();
        this.audio.onloadeddata = () => this.update();

        this.audio.onwaiting = () => {
            const timestamp = Date.now();
            this.lastBuffer = timestamp;
            setTimeout(() => {
                if (this.lastBuffer == timestamp) {
                    this.buffering = true;
                    this.update();
                }
            }, 100);
        }

        this.audio.onended = () => this.end();
    }


    public getCurrentTime() {
        return this.audio.currentTime;
    }

    public getDuration() {
        if (isNaN(this.audio.duration)) return 0;
        return this.audio.duration;
    }

    public async seek(time: number) {
        this.audio.currentTime = time;
    }

    public async setPaused(paused: boolean) {
        if (paused) {
            this.audio.pause();
        } else {
            this.audio.play();
        }
    }

    public isPaused() {
        return this.audio.paused;
    }

    public async setVolume(volume: number) {
        this.audio.volume = volume / 100;
    }

    public getVolume() {
        return this.audio.volume * 100;
    }

    public isVolumeEnabled() {
        return true;
    }

    public async setMuted(muted: boolean) {
        this.audio.muted = muted;
    }

    public isMuted(): boolean {
        return this.audio.muted;
    }

    public async setMedia(url: string, meta?: TrackMeta) {
        this.url = url;
        this.audio.src = url;
        this.meta = meta || null;
        this.audio.load();
    }

    public getCurrentMedia() {
        return this.url;
    }

    public getCurrentMeta() {
        return this.meta;
    }

    public isBuffering() {
        return this.buffering;
    }
}