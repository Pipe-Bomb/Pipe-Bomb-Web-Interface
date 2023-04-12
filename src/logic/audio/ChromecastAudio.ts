import { TrackMeta } from "pipebomb.js/dist/music/Track";
import AudioPlayer from "../AudioPlayer";
import AudioType from "./AudioType";
import { convertArrayToString } from "../Utils";

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
    private player = new window.cast.framework.RemotePlayer();
    private playerController = new window.cast.framework.RemotePlayerController(this.player);
    private url = "";
    private meta: TrackMeta | null = null;
    private buffering = false;

    public constructor() {
        super("chromecast");

        this.playerController.addEventListener(window.cast.framework.RemotePlayerEventType.MEDIA_INFO_CHANGED, () => {
            console.log("media info changed");
            const session = this.getSession();
            if (!session) return;

            const mediaStatus = session.getMediaSession();
            if (!mediaStatus) return;

            const mediaInfo = mediaStatus.media;
            console.log(mediaInfo);
        });

        this.playerController.addEventListener(window.cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED, () => {
            if (this.player.isConnected) {
                console.log("Connected to chromecast!");
                console.log("can control volume:", this.player.canControlVolume);
                this.update();
            } else {
                console.log('RemotePlayerController: Player disconnected');
            }
        });

        window.cast.framework.CastContext.getInstance().addEventListener(window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED, (e: any) => {
            switch (e.sessionState) {
                case "SESSION_RESUMED":
                case "SESSION_STARTED":
                    console.log("Chromecast connected!");
                    AudioPlayer.getInstance().audio.changeAudioType("chromecast");
                    console.log("changed to chromecast");
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
                        this.end();
                    }
                    break;
                case "currentTime":
                    this.buffering = false;
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
            }
        });

        console.log(Object.keys(this.player));
    }

    private getSession() {
        return window.cast.framework.CastContext.getInstance().getCurrentSession();
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
        }
    }

    public isMuted(): boolean {
        return false;
    }

    public async setMedia(url: string, meta?: TrackMeta): Promise<void> {
        if (!url) return;
        this.url = url;
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
        this.getSession().loadMedia(request).then(
            () => {
                console.log('Load succeed');
                this.buffering = false;
                this.update();
            },
            (errorCode: any) => {
                console.log('Error code: ' + errorCode);
            }
        );
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