import AudioType from "./AudioType";
import ChromecastAudio from "./ChromecastAudio";
import LocalAudio from "./LocalAudio";

export default class AudioWrapper {
    private audioTypes: Map<string, AudioType> = new Map();
    public activeType: AudioType;

    private updateEventListeners: ((audio: AudioType) => void)[] = [];
    private endEventListeners: (() => void)[] = [];

    public constructor() {
        const local = new LocalAudio();
        this.addAudioType(local);

        setTimeout(() => {
            this.addAudioType(ChromecastAudio.getInstance());
        }, 1000);
        

        this.activeType = local;
    }

    private addAudioType(type: AudioType) {
        if (this.audioTypes.has(type.ID)) return console.error(`Attemped to add audio type '${type.ID}' but it already exists!`);
        this.audioTypes.set(type.ID, type);

        type.registerUpdateEventListener(() => {
            if (type != this.activeType) return;
            for (let callback of this.updateEventListeners) {
                callback(this.activeType);
            }
        });

        type.onEnd(() => {
            if (type != this.activeType) return;
            console.log("detected track end!");
            for (let callback of this.endEventListeners) {
                callback();
            }
        });
    }

    public registerUpdateEventListener(callback: (audio: AudioType) => void) {
        const index = this.updateEventListeners.indexOf(callback);
        if (index < 0) this.updateEventListeners.push(callback);
    }

    public unregisterUpdateEventListener(callback: (audio: AudioType) => void) {
        const index = this.updateEventListeners.indexOf(callback);
        if (index >= 0) this.updateEventListeners.splice(index, 1);
    }

    public registerEndEventListener(callback: () => void) {
        const index = this.endEventListeners.indexOf(callback);
        if (index < 0) this.endEventListeners.push(callback);
    }

    public unregisterEndEventListener(callback: () => void) {
        const index = this.endEventListeners.indexOf(callback);
        if (index >= 0) this.endEventListeners.splice(index, 1);
    }

    public async changeAudioType(audioType: string, newAudioSettings?: boolean) {
        try {
            const newAudioType = this.audioTypes.get(audioType);
            if (!newAudioType) return console.error(`Attemped to use audio type '${audioType}' but it doesn't exist!`);
            if (newAudioType.ID == this.activeType.ID) return console.log("audio type is already", this.activeType.ID);
            const oldAudioType = this.activeType;
            try {
                await oldAudioType.setPaused(true);
            } catch {}

            if (!newAudioSettings) {
                try {
                    await newAudioType.setPaused(true);
                } catch {}
                if (oldAudioType.getCurrentMedia()) {
                    try {
                        await newAudioType.setMedia(oldAudioType.getCurrentMedia(), oldAudioType.getCurrentMeta());
                    } catch {}
                    try {
                        await newAudioType.seek(oldAudioType.getCurrentTime());
                    } catch {}
                }
                try {
                    await newAudioType.setMuted(oldAudioType.isMuted());
                } catch {}
            }
    
            this.activeType = newAudioType;
    
            for (let callback of this.updateEventListeners) {
                callback(this.activeType);
            }
        } catch (e) {
            console.error(e);
        }
    }
}