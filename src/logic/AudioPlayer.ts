import Track from "pipebomb.js/dist/music/Track";
import PipeBombConnection from "./PipeBombConnection";
import { convertArrayToString, generateNumberHash, generateRandomString, shuffle } from "./Utils";
import KeyboardShortcuts from "./KeyboardShortcuts";
import AudioWrapper from "./audio/AudioWrapper";
import { createNotification } from "../components/NotificationManager";

export interface VolumeStatus {
    volume: number,
    muted: boolean,
    enabled: boolean
}

export interface TrackWrapper {
    track: Track,
    queueID: number
}

export default class AudioPlayer {
    private static instance: AudioPlayer;
    public readonly audio = new AudioWrapper();
    private keyboardShortcuts = KeyboardShortcuts.getInstance();

    private currentTrack: TrackWrapper | null = null;
    private queue: TrackWrapper[] = [];
    private realQueue: TrackWrapper[] = [];
    private history: TrackWrapper[] = [];
    private paused = false;
    private volume = 100;
    private muted = false;
    private volumeEnabled = true;
    private takenQueueIds: number[] = [];
    private shuffled = false;
    private loopStatus: "none" | "all" | "one" = "none";
    private loopTrackPoint: TrackWrapper;

    private queueUpdateCallbacks: (() => void)[] = [];
    private volumeUpdateCallbacks: ((volume: VolumeStatus) => void)[] = [];
    private loudnessUpdateCallbacks: ((loudness: number) => void)[] = [];

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
                this.volume = newVolume;
                this.muted = newMuted;
                this.volumeEnabled = newEnabled;
                this.sendVolumeCallbacks();
            }
        });

        this.audio.registerEndEventListener(async () => {
            switch (this.loopStatus) {
                case "all":
                    if (!this.queue.length && this.loopTrackPoint && await this.playFromHistory(this.loopTrackPoint)) {
                        break;
                    }
                case "none":
                    this.nextTrack();
                    break;
                case "one":
                    this.playTrack(this.currentTrack, true, true);
                    break;
            }
        });

        // setInterval(() => {
        //     const volume = (Date.now() % 1000) / 1000;
        //     for (let callback of this.loudnessUpdateCallbacks) {
        //         callback(volume);
        //     }
        // }, 50);
    }

    public static getInstance() {
        if (!this.instance) this.instance = new AudioPlayer();
        return this.instance;
    }

    public getCurrentTrack() {
        return this.currentTrack;
    }

    public async playTrack(track: Track | TrackWrapper, forcePlay?: boolean, ignoreHistory?: boolean) {
        let trackWrapper: TrackWrapper;
        if (track instanceof Track) {
            trackWrapper = {
                track,
                queueID: this.generateQueueID(track)
            };
        } else {
            trackWrapper = track;
        }

        this.paused = false;
        if (this.currentTrack?.track.trackID == trackWrapper.track.trackID && !forcePlay) {
            if (!this.audio.activeType.isPaused()) this.audio.activeType.setPaused(false);
            return;
        } else {
            const url = `${PipeBombConnection.getInstance().getUrl()}/v1/audio/${trackWrapper.track.trackID}`;
            try {
                if (!ignoreHistory && this.currentTrack) {
                    this.history.push(this.currentTrack);
                    while (this.history.length > 1000) { // max 1000 songs in history
                        const track = this.history.shift();
                        const index = this.realQueue.indexOf(track);
                        if (index >= 0) this.realQueue.splice(index, 1);
                        this.removeQueueID(track.queueID);
                    }
                }
                this.currentTrack = trackWrapper;
                this.registerQueueID(trackWrapper);

                if (this.loopStatus == "all" && !this.loopTrackPoint) {
                    this.loopTrackPoint = this.currentTrack;
                }

                this.sendQueueCallbacks();
                await this.audio.activeType.setTrack(trackWrapper.track);
                if (!this.paused) this.audio.activeType.setPaused(false);
            } catch (e) {
                console.error("Error while loading audio!", url, e, trackWrapper.track);
                const trackName = trackWrapper.track.isUnknown() ? "track" : (await trackWrapper.track.getMetadata()).title;
                createNotification({
                    text: `Failed to play ${trackName}`,
                    status: "error"
                });
                this.nextTrack();
            }
        }

        if ("mediaSession" in navigator && this.currentTrack) {
            this.currentTrack.track.getMetadata().then(metadata => {
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

    public isShuffled() {
        return this.shuffled;
    }

    public getLoopStatus() {
        return this.loopStatus;
    }

    public setLoopStatus(status: "none" | "all" | "one") {
        this.loopStatus = status;
        if (status == "all") {
            if (this.currentTrack) {
                this.loopTrackPoint = this.currentTrack;
            } else {
                this.loopTrackPoint = null;
            }
            
        }
        this.sendQueueCallbacks();
    }

    public cycleLoopStatus() {
        const statuses: ("none" | "all" | "one")[] = ["none", "all", "one"];
        this.setLoopStatus(statuses[(statuses.indexOf(this.loopStatus) + 1) % statuses.length]);
    }

    public setShuffled(shuffled: boolean) {
        if (shuffled == this.shuffled) return;
        this.shuffled = shuffled;
        if (shuffled) {
            const shuffledQueue = shuffle(this.queue);
            this.queue.splice(0, this.queue.length, ...shuffledQueue);
        } else {
            const newQueue: TrackWrapper[] = [];
            for (let track of this.realQueue) {
                if (this.queue.includes(track)) {
                    newQueue.push(track);
                }
            }
            this.queue.splice(0, this.queue.length, ...newQueue);
        }
        this.sendQueueCallbacks();
    }

    public async pause() {
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
        await this.audio.activeType.setPaused(false);
    }

    public async nextTrack(ignoreHistory?: boolean) {
        const nextTrack = this.queue.shift();
        if (nextTrack) {
            await this.playTrack(nextTrack, true, ignoreHistory);
        } else {
            this.clearCurrent();
        }
    }

    public async previousTrack() {
        if (this.audio.activeType.getCurrentTime() > 10 || !this.history.length) {
            await this.setTime(0);
            await this.audio.activeType.setPaused(false);
        } else {
            await this.playFromHistory(this.history[this.history.length - 1]);
        }
    }

    public async playFromHistory(trackWrapper: TrackWrapper): Promise<boolean> {
        const index = this.history.indexOf(trackWrapper);
        if (index < 0) return false;
        const section = this.history.splice(index, this.history.length - index);
        if (this.currentTrack) section.push(this.currentTrack);
        this.queue.splice(0, 0, ...section);
        await this.nextTrack(true);
        return true;
    }

    private removeQueueID(id: number) {
        setTimeout(() => {
            const index = this.takenQueueIds.indexOf(id);
            if (index < 0) return;
            this.takenQueueIds.splice(index, 1);
        }, 60_000);
    }

    public async clearCurrent() {
        this.audio.activeType.setTrack(null);
        this.currentTrack = null;
        this.sendQueueCallbacks();
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

    private generateQueueID(track: Track) {
        let trackId = track.trackID;
        let hash: number = 0;
        do {
            if (hash) trackId += generateRandomString(1);
            hash = generateNumberHash(trackId);
        } while (this.takenQueueIds.includes(hash));
        
        return hash;
    }

    private registerQueueID(trackWrapper: TrackWrapper) {
        if (!this.takenQueueIds.includes(trackWrapper.queueID)) {
            this.takenQueueIds.push(trackWrapper.queueID);
        }
    }

    public addToQueue(tracks: Track[], shouldShuffle?: boolean, position?: number) {
        const trackWrappers: TrackWrapper[] = [];
        for (let track of tracks) {
            const trackWrapper: TrackWrapper = {
                track,
                queueID: this.generateQueueID(track)
            }
            trackWrappers.push(trackWrapper);
            this.registerQueueID(trackWrapper);
        }

        const shuffledQueue = shouldShuffle ? shuffle(trackWrappers) : trackWrappers;

        if (shouldShuffle) this.shuffled = true;

        if (position !== undefined) {
            this.queue.splice(position, 0, ...shuffledQueue);
            this.realQueue.splice(position, 0, ...trackWrappers);
        } else {
            this.queue.push(...shuffledQueue);
            this.realQueue.push(...trackWrappers);
        }
        this.sendQueueCallbacks();
    }

    public getQueue() {
        return Array.from(this.queue);
    }

    public getHistory() {
        return Array.from(this.history);
    }

    public setQueueOrder(order: number[]) {
        let newOrder: TrackWrapper[] = [];

        for (let index of order) {
            newOrder.push(this.queue[index]);
        }
        this.queue.splice(0, this.queue.length, ...newOrder);
        this.sendQueueCallbacks();
    }

    public removeFromQueue(index: number) {
        const track = this.queue.splice(index, 1)[0];
        if (!track) return;
        const realIndex = this.realQueue.indexOf(track);
        if (realIndex <= 0) {
            this.realQueue.splice(realIndex, 1);
        }
        this.sendQueueCallbacks();
    }

    public clearQueue() {
        this.queue.splice(0, this.queue.length);
        this.realQueue.splice(0, this.queue.length);
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

    public registerLoudnessCallback(callback: (loudness: number) => void) {
        this.loudnessUpdateCallbacks.push(callback);
    }

    public unregisterLoudnessCallback(callback: (loudness: number) => void) {
        const index = this.loudnessUpdateCallbacks.indexOf(callback);
        if (index < 0) return;
        this.loudnessUpdateCallbacks.splice(index, 1);
    }

    private sendQueueCallbacks() {
        for (let callbackFunction of this.queueUpdateCallbacks) {
            callbackFunction();
        }
    }
}