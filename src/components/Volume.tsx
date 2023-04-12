import styles from "../styles/Volume.module.scss";
import { MdVolumeDown, MdVolumeMute, MdVolumeOff, MdVolumeUp } from "react-icons/md";
import { Button } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import AudioPlayer from "../logic/AudioPlayer";

export default function Volume() {
    const audioPlayer = AudioPlayer.getInstance();

    const input = useRef(null);
    const [volume, setVolume] = useState(audioPlayer.getVolume());

    useEffect(() => {
        audioPlayer.registerVolumeCallback(setVolume);

        return () => {
            audioPlayer.unregisterVolumeCallback(setVolume);
        }
    });

    function volumeChange(e: React.FormEvent<HTMLInputElement>) {
        const newVolume = parseInt(e.currentTarget.value);
        audioPlayer.audio.activeType.setVolume(newVolume);
        audioPlayer.audio.activeType.setMuted(false);
        setVolume(audioPlayer.getVolume());
    }

    function toggleMute() {
        audioPlayer.audio.activeType.setMuted(!volume.muted);
    }

    const css: any = {
        "--gradient": `linear-gradient(90deg, var(--nextui-colors-primary) 0%, var(--nextui-colors-primary) ${volume.volume}%, var(--nextui-colors-accents2) ${volume.volume}%, var(--nextui-colors-accents2) 100%)`
    };

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
            <div className={styles.popup} style={css}>
                <div className={styles.content}>
                    <input ref={input} type="range" min="0" max="100" value={volume.volume} onInput={volumeChange} className={volume.enabled ? styles.enabled : styles.disabled} />
                </div>
            </div>
        </div>
    )
}