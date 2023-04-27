import { useEffect, useState } from "react";
import AudioPlayer from "../logic/AudioPlayer";

export default function useCurrentTrack() {
    const audioPlayer = AudioPlayer.getInstance();
    const [currentTrack, setCurrentTrack] = useState(audioPlayer.getCurrentTrack()?.track || null);

    useEffect(() => {
        function callback() {
            setCurrentTrack(audioPlayer.getCurrentTrack()?.track || null);
        }

        audioPlayer.registerQueueCallback(callback);

        return () => {
            audioPlayer.unregisterQueueCallback(callback);
        }
    });

    return currentTrack;
}