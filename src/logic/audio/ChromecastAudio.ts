import { TrackMeta } from "pipebomb.js/dist/music/Track";
import AudioPlayer from "../AudioPlayer";
import AudioType from "./AudioType";
import { convertArrayToString } from "../Utils";
import PipeBombConnection from "../PipeBombConnection";
import Axios from "axios";

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

console.log("Chromecast module");


export default class ChromecastAudio extends AudioType {
    private player: any;
    private playerController: any;
    private url = "";
    private meta: TrackMeta | null = null;
    private buffering = false;
    private castSession: any;
    private sessionEvents: Map<string, (e: any) => void> = new Map();
    private mediaSession: any;

    public constructor() {
        super("chromecast");

        if (!window.cast) return;

        this.player = new window.cast.framework.RemotePlayer();
        this.playerController = new window.cast.framework.RemotePlayerController(this.player);

        this.playerController.addEventListener(window.cast.framework.RemotePlayerEventType.MEDIA_INFO_CHANGED, () => {
            console.log("media info changed");
            if (!this.castSession) return;

            const mediaStatus = this.castSession.getMediaSession();
            if (!mediaStatus) {
                console.log("cancelling media info change");
                this.end();
                return;
            }

            const mediaInfo = mediaStatus.media;
            console.log(mediaInfo);
        });

        this.playerController.addEventListener(window.cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED, () => {
            console.log("connection change");
            if (this.player.isConnected) {
                console.log("Connected to chromecast!");
                console.log("can control volume:", this.player.canControlVolume);
                this.update();
            } else {
                console.log('RemotePlayerController: Player disconnected');
                console.log(this.player.savedPlayerState);
            }
        });

        window.cast.framework.CastContext.getInstance().addEventListener(window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED, (e: any) => {
            console.log("session state changed");
            switch (e.sessionState) {
                case "SESSION_RESUMED":
                    console.log("Chromecast resumed!");
                    AudioPlayer.getInstance().audio.changeAudioType("chromecast", true);
                case "SESSION_STARTED":
                    console.log("Chromecast connected!");
                    AudioPlayer.getInstance().audio.changeAudioType("chromecast");
                    console.log("changed to chromecast");
                    this.setMediaSession(e.session);
            }
            console.log(e);
        });

        this.playerController.addEventListener(window.cast.framework.RemotePlayerEventType.ANY_CHANGE, (e: any) => {
            console.log("chromecast change:", e);

            switch (e.field) {
                case "playerState":
                    if (e.value == "PLAYING") {
                        this.buffering = false;
                        this.update();
                    }
                    if (e.value == "IDLE") {
                        this.buffering = false;
                        console.log("chromecast is idle");
                        this.update();
                    }
                    if (e.value == "BUFFERING") {
                        this.buffering = true;
                        this.update();
                    }
                    break;
                case "currentTime":
                    this.buffering = false;
                    this.update();
                    break;
                case "duration":
                case "volumeLevel":
                    console.log("updating!");
                    this.update();
                    break;
                case "isConnected":
                    if (!e.value) {
                        console.log("Chromecast stopped!");
                        AudioPlayer.getInstance().audio.changeAudioType("local");
                    }
                    break;
                case "displayStatus":
                    if (e.value) {
                        this.buffering = true;
                        this.update();
                    } else {
                        console.log("chromecast is inactive!");
                        this.buffering = false;
                    }
                    break;
                case "mediaInfo":
                    if (e.value) {
                        this.buffering = false;
                        this.update();
                    }
                    break;
            }
        });

        setTimeout(() => {
            const currentSession = window.cast.framework.CastContext.getInstance().getCurrentSession();
            if (currentSession) {
                AudioPlayer.getInstance().audio.changeAudioType("chromecast", true);
                this.setMediaSession(currentSession);
            }
        });
    }

    private setMediaSession(castSession: any) {
        if (this.castSession) {
            console.log("replacing old session");
            for (let eventId of this.sessionEvents.keys()) {
                console.log(eventId);
                this.castSession.removeEventListener(eventId, this.sessionEvents.get(eventId));
            }
        }
        console.log("creating new session");
        this.castSession = castSession;

        for (let handler of Object.values(window.cast.framework.SessionEventType)) {

            const callback = (e: any) => {
                console.log(handler, "event!!", e);
                if (handler == "mediasession") {
                    console.log("detected media session!", e.mediaSession);
                    this.mediaSession = e.mediaSession;
                    console.log("getting status");
                    this.mediaSession.getStatus(new window.chrome.cast.media.GetStatusRequest(), () => {
                        console.log("status update concluded");
                        this.update();
                    }, (e: any) => {
                        console.error(e);
                    });
                    const currentSession = window.cast.framework.CastContext.getInstance().getCurrentSession();
                    console.log("SWAPPING SESSION", currentSession == this.castSession);
                    // if (currentSession) {
                    //     AudioPlayer.getInstance().audio.changeAudioType("chromecast", true);
                    //     this.setMediaSession(currentSession);
                    // }
                }
            }

            castSession.addEventListener(handler, callback);
            let anyHandler: any = handler;
            this.sessionEvents.set(anyHandler, callback);
        }

        

        const media = castSession.getMediaSession();
        console.log("media:", media);
        if (media) {
            console.log("session already contained media!");
            console.log("was previously playing", media.media.contentId, media.media.metadata);
            const trackId = media.media.contentId.split("/").pop();
            console.log(trackId);
            PipeBombConnection.getInstance().getApi().trackCache.getTrack(trackId)
            .then(track => {
                AudioPlayer.getInstance().playTrack(track);
            }).catch(e => {
                console.error(e);
            });
        }
        // console.log(session.ja);
        // const sessionManager = new window.cast.framework.CastSession(session, window.cast.framework.SessionState.SESSION_STARTED);
        // console.log(sessionManager);


        // console.log(session.appId);
        castSession.getSessionObj().addMediaListener((mediaListener: any) => {
            console.log("received media listener", mediaListener);
        });
    }

    public getCurrentTime(): number {
        return this.player.currentTime;
    }

    public getDuration(): number {
        return this.player.duration;
    }

    public async seek(time: number): Promise<void> {
        console.log("seeking to", time);
        this.player.currentTime = time;
        this.playerController.seek();
        this.buffering = true;
        this.update();
    }

    public async setPaused(paused: boolean): Promise<void> {
        console.log("paused?", paused);
        if (paused != this.player.isPaused) {
            console.log("playing or pausing");
            this.playerController.playOrPause();
        }
    }

    public isPaused(): boolean {
        return this.player.isPaused;
    }

    public async setVolume(volume: number): Promise<void> {
        // if (!this.volumeEnabled) return;
        this.player.volumeLevel = volume / 100
        this.playerController.setVolumeLevel();
        this.update();
    }

    public getVolume(): number {
        return this.player.volumeLevel * 100;
    }

    public isVolumeEnabled() {
        return true;
    }

    public async setMuted(muted: boolean): Promise<void> {
        if (muted != this.player.isMuted) {
            this.playerController.muteOrUnmute();
            this.update();
        }
    }

    public isMuted(): boolean {
        return this.player.isMuted;
    }

    public async setMedia(url: string, meta?: TrackMeta): Promise<void> {
        return new Promise(async (resolve, reject) => {
            console.log(url);
            if (!url || url == this.url) return;
            this.url = url;
            this.buffering = true;
            this.update();
            console.log("checking url head");
            try {
                const { status } = await Axios.head(url);
                console.log("status code", status);
                if (!status.toString().startsWith("2")) {
                    throw `Bad status code: ${status}`;
                }

                console.log("casting to chromecast", url);
                const mediaInfo = new window.chrome.cast.media.MediaInfo(url, "audio/mpeg");
                mediaInfo.metadata = new window.chrome.cast.media.MusicTrackMediaMetadata();
                if (meta) {
                    this.meta = meta;
                    mediaInfo.metadata.artist = convertArrayToString(meta.artists);
                    mediaInfo.metadata.title = meta.title;
                    if (meta.image) {
                        mediaInfo.metadata.images = [
                            new window.chrome.cast.Image(meta.image)
                        ];
                    }
                } else {
                    this.meta = null;
                    mediaInfo.metadata.title = "Pipe Bomb";
                }
                
                const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
                this.castSession.loadMedia(request).then(
                    () => {
                        console.log('Load succeed');
                        this.buffering = false;
                        this.update();
                        resolve();
                    }, reject
                );
            } catch (e) {
                reject(e);
            }
        });
    }

    public getCurrentMedia(): string {
        return this.url;
    }

    public getCurrentMeta() {
        return this.meta;
    }

    public isBuffering(): boolean {
        return this.buffering;
    }
}