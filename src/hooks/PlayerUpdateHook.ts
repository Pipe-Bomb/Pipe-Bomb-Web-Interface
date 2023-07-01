import { useEffect, useState } from "react";
import AudioType, { AudioTypeStatus } from "../logic/audio/AudioType";
import AudioPlayer from "../logic/AudioPlayer";

export interface PlayerUpdateHookProps {
    currentTime?: boolean,
    duration?: boolean,
    paused?: boolean,
    buffering?: boolean,
    volume?: boolean,
    muted?: boolean
}

const keys = [
    "currentTime",
    "duration",
    "paused",
    "buffering",
    "volume",
    "muted"
];

export default function usePlayerUpdate(properties: PlayerUpdateHookProps) {
    const audioPlayer = AudioPlayer.getInstance();

    const [status, setStatus] = useState<AudioTypeStatus>(audioPlayer.audio.activeType.getStatus());

    const listeners = keys.map(key => !!properties[key]);

    useEffect(() => {
        function callback(audio: AudioType) {
            const newStatus = audio.getStatus();

            for (let key of keys) {
                if (newStatus[key] !== status[key]) {
                    setStatus(newStatus);
                    return;
                }
            }            
        }

        audioPlayer.audio.registerUpdateEventListener(callback);

        return () => {
            audioPlayer.audio.unregisterUpdateEventListener(callback);
        }
    }, listeners);

    return status;
}