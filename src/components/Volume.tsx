import styles from "../styles/Volume.module.scss";
import { MdVolumeDown, MdVolumeMute, MdVolumeOff, MdVolumeUp } from "react-icons/md";
import { Button } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import AudioPlayer from "../logic/AudioPlayer";
import Slider from "./Slider";
import React from "react";

const Volume = React.memo(function Volume() {
    const audioPlayer = AudioPlayer.getInstance();

    const input = useRef(null);
    const [volume, setVolume] = useState(audioPlayer.getVolume());

    useEffect(() => {
        audioPlayer.registerVolumeCallback(setVolume);

        return () => {
            audioPlayer.unregisterVolumeCallback(setVolume);
        }
    });

    function volumeChange(value: number) {
        audioPlayer.audio.activeType.setVolume(value);
        audioPlayer.audio.activeType.setMuted(false);
        setVolume(audioPlayer.getVolume());
    }

    function toggleMute() {
        audioPlayer.audio.activeType.setMuted(!volume.muted);
    }

    function generateButton() {
        if (volume.muted) {
            return <MdVolumeOff />
        }
        if (volume.volume > 50) {
            return <MdVolumeUp />
        }
        if (volume.volume > 0) {
            return <MdVolumeDown />
        }
        return <MdVolumeMute />
    }

    return (
        <div className={styles.container}>
            <Button auto rounded className={styles.roundButton} light onPress={toggleMute}>
                { generateButton() }
            </Button>
            <div className={styles.mouseEvents}>
                <div className={styles.popup}>
                    <div className={styles.content}>
                    <Slider min={0} max={100} value={volume.volume} onChange={volumeChange} length={110} orientation="vertical" />
                    </div>                    
                </div>
            </div>
        </div>
    )
});

export default Volume;