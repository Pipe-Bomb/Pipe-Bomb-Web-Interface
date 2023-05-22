import Track, { TrackMeta } from "pipebomb.js/dist/music/Track";
import AudioType from "./AudioType";
import AudioPlayer from "../AudioPlayer";
import { getSetting, setSetting } from "../SettingsIndex";

const anyWindow: any = window;
const AudioContext = window.AudioContext || anyWindow.webkitAudioContext;

export interface EqNode {
    node: BiquadFilterNode
    frequency: number
    setGain: (gain: number) => void
    getGain: () => number
}

export default class LocalAudio extends AudioType {
    private audio = new Audio();
    private audioContext: AudioContext;
    private gain: GainNode;
    private buffering = false;
    private lastBuffer = 0;
    private track: Track = null;
    private meta: TrackMeta | null;
    private lastPause: boolean = false;
    private eqNodes: EqNode[] = [];
    private eqGain: GainNode = null;

    public constructor() {
        super("local");
        this.audio.crossOrigin = "anonymous";
        
        this.audio.volume = getSetting("volume", 1);
        this.audio.muted = getSetting("mute", false);

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

    public getFrequencyResponse(response: Float32Array) {
        const magCombined = new Float32Array(response.length);
        const magCurr = new Float32Array(this.eqNodes.length);
        const phaseCurr = new Float32Array(this.eqNodes.length);

        for (let node of this.eqNodes) {
            node.node.getFrequencyResponse(response, magCurr, phaseCurr);

            for (let j = 0; j < response.length; j++) {
                const magDb = Math.log(magCurr[j]) * 20;
                magCombined[j] += magDb;
            }
        }

        return magCombined;
    }

    public getEqNodes() {
        return Array.from(this.eqNodes);
    }

    private calculateEqGain() {
        if (!this.eqGain) return;

        let maxGain = -60;

        for (let node of this.eqNodes) {
            const gain = node.getGain();
            if (maxGain < gain) maxGain = gain;
        }

        const gain = 1 - maxGain / 45;
        this.eqGain.gain.setValueAtTime(gain, this.audioContext.currentTime);
    }

    private setupAudioContext() {
        const audioPlayer = AudioPlayer.getInstance();
        let lastVolume = -1;
        this.audioContext = new AudioContext();
        const source = this.audioContext.createMediaElementSource(this.audio);
        this.gain = this.audioContext.createGain();
        this.gain.gain.setValueAtTime(this.audio.volume, this.audioContext.currentTime);
        this.audio.volume = 1;
        source.connect(this.gain);


        const frequencies = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
        let storedEqSettings: any[];
        try {
            storedEqSettings = JSON.parse(getSetting("eq", []));
        } catch {
            storedEqSettings = [];
        }

        for (let frequency of frequencies) {
            const filter = this.audioContext.createBiquadFilter();
            if (!this.eqNodes.length) {
                filter.type = "lowshelf";
            } else if (this.eqNodes.length == frequencies.length - 1) {
                filter.type = "highshelf";
            } else {
                filter.type = "peaking";
            }
            
            filter.frequency.value = frequency;
            let gainValue = 0;

            for (let eqSetting of storedEqSettings) {
                if (typeof eqSetting?.frequency != "number" || typeof eqSetting?.value != "number" || !frequencies.includes(eqSetting.frequency)) {
                    storedEqSettings.splice(storedEqSettings.indexOf(eqSetting), 1);
                } else if (eqSetting.frequency == frequency) {
                    const value = eqSetting.value as number;
                    if (value >= -60 && value <= 30) {
                        filter.gain.setValueAtTime(value, this.audioContext.currentTime);
                        gainValue = value;
                    } else {
                        storedEqSettings.splice(storedEqSettings.indexOf(eqSetting), 1);
                    }
                }
            }

            if (this.eqNodes.length) {
                this.eqNodes[this.eqNodes.length - 1].node.connect(filter);
            }


            const localAudio = this;
            this.eqNodes.push({
                node: filter,
                frequency,
                setGain: (gain: number) => {
                    if (gain < -60 || gain > 30) return;
                    filter.gain.setValueAtTime(gain, this.audioContext.currentTime);
                    gainValue = gain;
                    localAudio.calculateEqGain();
                    for (let eqSetting of storedEqSettings) {
                        if (eqSetting.freqency == frequency) {
                            eqSetting.value = gain;
                            setSetting("eq", JSON.stringify(storedEqSettings));
                            return;
                        }
                    }
                    storedEqSettings.push({
                        frequency,
                        value: gain
                    });
                    setSetting("eq", JSON.stringify(storedEqSettings));
                },
                getGain: () => gainValue
            });
        }
        setSetting("eq", JSON.stringify(storedEqSettings));

        this.gain.connect(this.eqNodes[0].node);
        this.eqGain = this.audioContext.createGain();
        this.calculateEqGain();
        this.eqNodes[this.eqNodes.length - 1].node.connect(this.eqGain);
        this.eqGain.connect(this.audioContext.destination);
        

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
        setSetting("volume", volume / 100);
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
        setSetting("mute", muted);
        this.update();
    }

    public isMuted(): boolean {
        return this.audio.muted;
    }

    public async setTrack(track: Track): Promise<void> {
        try {
            if (!this.audioContext) {
                this.setupAudioContext();
            }
        } catch (e) {
            console.error(e);
        }

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