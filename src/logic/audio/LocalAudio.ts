import Track, { TrackMeta } from "pipebomb.js/dist/music/Track";
import AudioType from "./AudioType";
import AudioPlayer from "../AudioPlayer";

const anyWindow: any = window;
const AudioContext = window.AudioContext || anyWindow.webkitAudioContext;

export default class LocalAudio extends AudioType {
    private audio = new Audio();
    private audioContext: AudioContext;
    private gain: GainNode;
    private buffering = false;
    private lastBuffer = 0;
    private track: Track = null;
    private meta: TrackMeta | null;
    private lastPause: boolean = false;

    public constructor() {
        super("local");
        this.audio.crossOrigin = "anonymous";
        
        setTimeout(() => {
            const audioPlayer = AudioPlayer.getInstance();
            let lastVolume = -1;
            try {
                this.audioContext = new AudioContext();
                const source = this.audioContext.createMediaElementSource(this.audio);
                this.gain = this.audioContext.createGain();
                source.connect(this.gain);
                this.gain.connect(this.audioContext.destination);
                

                const filter = this.audioContext.createBiquadFilter();
                filter.type = "lowpass";
                filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
                source.connect(filter);

                const analyserNode = this.audioContext.createAnalyser();
                filter.connect(analyserNode);
                
    
                const pcmData = new Float32Array(analyserNode.fftSize);
                function onFrame() {
                    analyserNode.getFloatTimeDomainData(pcmData);
                    let sumSquares = 0.0;
                    for (const amplitude of pcmData) {
                        sumSquares += amplitude * amplitude;
                    }
                    const volume = Math.sqrt(sumSquares / pcmData.length);
                    if (volume != lastVolume) {
                        lastVolume = volume;
                        audioPlayer.setLoudness(volume);
                    }
                };
                setInterval(() => onFrame(), 50);
            } catch (e) {
                console.error(e);
            }
        });

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
                if (this.lastBuffer == timestamp && this.track) {
                    this.buffering = true;
                    this.update();
                }
            }, 100);
        }

        this.audio.onended = () => {
            this.track = null;
            this.end();
        }
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
        if (this.gain) {
            this.gain.gain.setValueAtTime(volume / 100, this.audioContext.currentTime);
        } else {
            this.audio.volume = volume / 100;
        }
        this.update();
    }

    public getVolume() {
        if (this.gain) {
            return this.gain.gain.value * 100;
        }
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
            if (this.track) {
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
                this.setPaused(false);
                this.update();
            } else {
                this.audio.src = "";
                this.setPaused(true);
                this.update();
            }
        });   
    }

    public getCurrentTrack() {
        return this.track;
    }

    public getCurrentMeta() {
        return this.meta;
    }

    public isBuffering() {
        return this.buffering;
    }
}