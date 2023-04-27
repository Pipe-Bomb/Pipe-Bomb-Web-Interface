import Track, { TrackMeta } from "pipebomb.js/dist/music/Track";
import AudioPlayer from "../AudioPlayer";
import AudioType from "./AudioType";
import { convertArrayToString } from "../Utils";
import Axios from "axios";
import PipeBombConnection from "../PipeBombConnection";

declare const window: any;

window["__onGCastApiAvailable"] = (isAvailable: boolean) => {
    if (isAvailable) {
        setTimeout(() => {
            window.cast.framework.CastContext.getInstance().setOptions({
                receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
                autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
            });
        }, 1000);
    }
};


export default class ChromecastAudio extends AudioType {
    private static instance: ChromecastAudio;

    private track: Track = null;
    private meta: TrackMeta | null = null;
    private buffering = false;
    private castSession: any;
    private sessionEvents: Map<string, (e: any) => void> = new Map();
    private mediaSession: any;
    private lastTime = 0;
    private duration = 0;
    private player: any;
    private playerController: any;
    private lastIdleReason: string | null = null;
    private lastPlaying = false;

    private constructor() {
        super("chromecast");
        if (!window.cast) return;

        this.player = new window.cast.framework.RemotePlayer();
        this.playerController = new window.cast.framework.RemotePlayerController(this.player);

        window.cast.framework.CastContext.getInstance().addEventListener(window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED, (e: any) => {
            switch (e.sessionState) {
                case "SESSION_RESUMED":
                    AudioPlayer.getInstance().audio.changeAudioType("chromecast", true);
                    this.setCastSession(e.session);
                    break;
                case "SESSION_STARTED":
                    AudioPlayer.getInstance().audio.changeAudioType("chromecast");
                    this.setCastSession(e.session);
                    break;
                case "SESSION_ENDING":
                case "SESSION_ENDED":
                    if (AudioPlayer.getInstance().audio.activeType.ID == "chromecast") {
                        AudioPlayer.getInstance().audio.changeAudioType("local");
                    }
                    break;
            }
        });

        setTimeout(() => {
            const currentSession = window.cast.framework.CastContext.getInstance().getCurrentSession();
            if (currentSession) {
                AudioPlayer.getInstance().audio.changeAudioType("chromecast", true);
                this.setCastSession(currentSession);
            }
        });

        setInterval(() => {
            if (this.mediaSession) {
                const currentTime = this.mediaSession.getEstimatedTime();
                if (currentTime != this.lastTime) {
                    this.lastTime = currentTime;
                    this.update();
                }
            }
        }, 200);
    }

    public static getInstance(): ChromecastAudio {
        if (!this.instance) this.instance = new ChromecastAudio();
        return this.instance;
    }

    private setCastSession(castSession: any) {
        for (let handler of this.sessionEvents.keys()) {
            this.castSession.removeEventListener(handler, this.sessionEvents.get(handler));
        }

        this.castSession = castSession;
        for (let handler of Object.values(window.cast.framework.SessionEventType)) {
            const callback = (e: any) => {
                switch (handler) {
                    case window.cast.framework.SessionEventType.MEDIA_SESSION:
                        this.setMediaSession(e.mediaSession);
                        break;
                    case window.cast.framework.SessionEventType.VOLUME_CHANGED:
                        this.update();
                        break;
                }
            }

            castSession.addEventListener(handler, callback);
            let anyHandler: any = handler;
            this.sessionEvents.set(anyHandler, callback);
        }
        this.setMediaSession(this.castSession.getMediaSession());
    }

    private setMediaSession(mediaSession: any) {
        if (this.mediaSession) {
            this.mediaSession.removeUpdateListener(this.mediaListener);
        }
        this.mediaSession = mediaSession;

        if (this.mediaSession) {
            if (this.mediaSession.media) {
                const url = this.mediaSession.media.contentId;
                this.mediaListener(true);
                const trackId = url.split("/").pop();
                PipeBombConnection.getInstance().getApi().trackCache.getTrack(trackId).then(track => {
                    this.track = track;
                    AudioPlayer.getInstance().playTrack(track);
                }).catch(e => {
                    console.error(e);
                });
            }
            this.mediaSession.addUpdateListener(this.mediaListener);
            this.mediaSession.getStatus();
        }
    }

    private mediaListener(alive: boolean) {
        const t = ChromecastAudio.getInstance();
        if (!t.mediaSession) {
            t.duration = 0;
            this.update();
            return;
        }

        if (t.mediaSession.media) {
            if (t.mediaSession.media.contentId == t.track?.getAudioUrl()) {
                t.duration = t.mediaSession.media.duration;

                if (t.lastIdleReason != t.mediaSession.idleReason) {
                    t.lastIdleReason = t.mediaSession.idleReason;
        
                    if (t.lastIdleReason == "FINISHED") {
                        t.end();
                    }
                }

                switch (t.mediaSession.playerState) {
                    case "PLAYING":
                        if (!t.lastPlaying || t.buffering) {
                            t.lastPlaying = true;
                            t.buffering = false;
                            t.update();
                        }
                        break;
                    case "PAUSED":
                        if (t.lastPlaying || t.buffering) {
                            t.lastPlaying = false;
                            t.buffering = false;
                            t.update();
                        }
                        break;
                    case "BUFFERING":
                        if (!t.buffering) {
                            t.buffering = true;
                            t.update();
                        }
                        break;
                }
            } else {
                t.duration = 0;
            }
        }

        t.update();
    }

    public terminate() {
        if (this.castSession) {
            this.castSession.endSession(true);
        }
    }

    public getCurrentTime() {
        if (this.mediaSession && this.mediaSession.media && this.mediaSession.media.contentId == this.track?.getAudioUrl()) {
            return this.mediaSession.getEstimatedTime();
        }
        return 0;
    }

    public getDuration(): number {
        return this.duration;
    }

    public async seek(time: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.mediaSession) return reject();

            const request = new window.chrome.cast.media.SeekRequest();
            this.buffering = true;
            this.update();
            request.currentTime = time;
            this.mediaSession.seek(request, () => {
                this.buffering = false;
                resolve();
            }, (e: any) => {
                console.error(e);
                this.buffering = false;
                this.update();
            });
        });
    }

    public async setPaused(paused: boolean): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.mediaSession) return reject();
            if ((this.mediaSession.playerState == "PLAYING") != paused) return resolve();

            if (paused) {
                this.mediaSession.pause(new window.chrome.cast.media.PauseRequest(), () => {
                    this.lastPlaying = false;
                    this.update();
                    resolve();
                }, (e: any) => {
                    console.error(e);
                    reject();
                });
            } else {
                this.mediaSession.play(new window.chrome.cast.media.PlayRequest(), () => {
                    this.lastPlaying = true;
                    this.update();
                    resolve();
                }, (e: any) => {
                    console.error(e);
                    reject();
                });
            }
        });
    }

    public isPaused(): boolean {
        return !this.lastPlaying;
    }

    public async setVolume(volume: number): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (this.castSession) {
                const error = await this.castSession.setVolume(Math.max(Math.min(volume / 100, 1), 0));
                if (error) {
                    console.error(error);
                    reject();
                } else {
                    this.update();
                    resolve();
                }
            }
        });
    }

    public getVolume(): number {
        // if (this.mediaSession && this.mediaSession.volume.level !== null) {
        //     return this.mediaSession.volume.level * 100;
        // }
        if (this.castSession) {
            return this.castSession.getVolume() * 100;
        }
        return 100;
    }

    public isVolumeEnabled() {
        if (this.mediaSession) {
            return this.mediaSession.supportedMediaCommands.includes("stream_volume");
        }
        return true;
    }

    public async setMuted(muted: boolean): Promise<void> {
        if (this.castSession) {
            this.castSession.setMute(muted);
            this.update();
        }
    }

    public isMuted(): boolean {
        if (this.castSession) {
            return this.castSession.isMute();
        }
        return false;
    }

    public async setTrack(track: Track): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (track.trackID == this.track?.trackID) return;
            this.track = track;
            this.buffering = true;
            this.mediaListener(true);
            try {
                const { status } = await Axios.head(track.getAudioUrl());
                if (!status.toString().startsWith("2")) {
                    throw `Bad status code: ${status}`;
                }

                const mediaInfo = new window.chrome.cast.media.MediaInfo(track.getAudioUrl(), "audio/mpeg");
                mediaInfo.metadata = new window.chrome.cast.media.MusicTrackMediaMetadata();
                
                const meta = await track.getMetadata();

                if (meta) {
                    this.meta = meta;
                    mediaInfo.metadata.artist = convertArrayToString(meta.artists);
                    mediaInfo.metadata.title = meta.title;
                    mediaInfo.metadata.images = [
                        new window.chrome.cast.Image(track.getThumbnailUrl())
                    ];
                } else {
                    this.meta = null;
                    mediaInfo.metadata.title = "Pipe Bomb";
                }
                
                const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
                this.castSession.loadMedia(request).then((e: any) => {
                    if (e) {
                        console.error(e);
                        this.buffering = false;
                        this.update();
                        reject();
                    } else {
                        this.buffering = false;
                        this.update();
                        resolve();
                    }
                });
            } catch (e) {
                this.buffering = false;
                this.track = null;
                this.update();
                reject(e);
            }
        });
    }

    public getCurrentTrack() {
        return this.track;
    }

    public isBuffering(): boolean {
        return this.buffering;
    }
}