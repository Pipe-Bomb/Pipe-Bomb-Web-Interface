import Track, { TrackMeta } from "pipebomb.js/dist/music/Track";
import AudioType from "./AudioType";

export default class LocalAudio extends AudioType {
    private audio = new Audio();
    private buffering = false;
    private lastBuffer = 0;
    private track: Track = null;
    private lastPause: boolean = false;

    public constructor() {
        super("local");

        this.audio.ontimeupdate = () => {
            this.update();
        }

        this.audio.onplaying = () => {
            this.buffering = false;
            this.lastPause = false;
            this.update();
        }

        this.audio.oncanplay = () => {
            this.buffering = false;
            this.lastBuffer = 0;
            this.update();
        }

        this.audio.onerror = e => {
            if (this.track) {
                console.error(e);
            }
        }

        this.audio.onpause = () => {
            if (!this.buffering && !this.lastPause) {
                this.lastPause = true;
            }
            this.update();
        }

        this.audio.onplay = () => {
            this.lastPause = false;
            this.update();
        }

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

    public terminate() {
        this.audio.pause();   
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
        this.lastPause = paused;
        if (paused) {
            this.audio.pause();
        } else {
            this.audio.play();
        }
        this.update();
    }

    public isPaused() {
        return this.lastPause;
    }

    public async setVolume(volume: number) {
        this.audio.volume = volume / 100;
        this.update();
    }

    public getVolume() {
        return this.audio.volume * 100;
    }

    public isVolumeEnabled() {
        return true;
    }

    public async setMuted(muted: boolean) {
        this.audio.muted = muted;
        this.update();
    }

    public isMuted(): boolean {
        return this.audio.muted;
    }

    public async setTrack(track: Track): Promise<void> {
        return new Promise(async (resolve, reject) => {
            this.track = track;
            this.audio.src = track.getAudioUrl();
            let completed = false;

            this.audio.addEventListener("error", e => {
                if (completed) return;
                completed = true;
                this.buffering = false;
                reject(e);
            }, { once: true });

            this.audio.addEventListener("loadeddata", () => {
                if (completed) return;
                completed = true;
                resolve();
            });

            if (track) {
                this.buffering = true;
            }
            
            this.audio.load();
            this.update();
        });   
    }

    public getCurrentTrack() {
        return this.track;
    }

    public isBuffering() {
        return this.buffering;
    }
}