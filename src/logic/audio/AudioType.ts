import { TrackMeta } from "pipebomb.js/dist/music/Track";

export interface AudioTypeStatus {
    currentTime: number,
    duration: number,
    paused: boolean,
    buffering: boolean,
    volume: number,
    muted: boolean
}

export default abstract class AudioType {

    public constructor(public readonly ID: string) {}

    private updateEventListeners: (() => void)[] = [];
    private endCallback: (() => void) | null = null;

    public registerUpdateEventListener(callback: () => void) {
        const index = this.updateEventListeners.indexOf(callback);
        if (index < 0) this.updateEventListeners.push(callback);
    }

    public unregisterUpdateEventListener(callback: () => void) {
        const index = this.updateEventListeners.indexOf(callback);
        if (index >= 0) this.updateEventListeners.splice(index, 1);
    }

    protected update() {
        for (let callback of this.updateEventListeners) {
            callback();
        }
    }

    public getStatus(): AudioTypeStatus {
        return {
            currentTime: this.getCurrentTime(),
            duration: this.getDuration(),
            paused: this.isPaused(),
            buffering: this.isBuffering(),
            volume: this.getVolume(),
            muted: this.isMuted()
        }
    }

    public onEnd(callback: () => void) {
        this.endCallback = callback;
    }

    protected end() {
        if (this.endCallback) this.endCallback();
    }

    public abstract terminate(): void;

    public abstract getCurrentTime(): number;
    public abstract getDuration(): number;
    public abstract seek(time: number): Promise<void>;

    public abstract setPaused(paused: boolean): Promise<void>;
    public abstract isPaused(): boolean;

    public abstract setVolume(volume: number): Promise<void>;
    public abstract getVolume(): number;
    public abstract isVolumeEnabled(): boolean;

    public abstract setMuted(muted: boolean): Promise<void>;
    public abstract isMuted(): boolean;

    public abstract setMedia(url: string, meta?: TrackMeta): Promise<void>;
    public abstract getCurrentMedia(): string;
    public abstract getCurrentMeta(): TrackMeta | null;
    public abstract isBuffering(): boolean;
}