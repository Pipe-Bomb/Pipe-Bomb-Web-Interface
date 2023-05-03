import { Button, Grid, Progress, Text } from "@nextui-org/react";
import styles from "../styles/Player.module.scss";
import { MdSkipNext, MdSkipPrevious, MdPlayArrow, MdPause } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import AudioPlayer from "../logic/AudioPlayer";
import { convertArrayToString, formatTime } from "../logic/Utils";
import KeyboardShortcuts from "../logic/KeyboardShortcuts";
import ImageWrapper from "./ImageWrapper";
import useTrackMeta from "../hooks/TrackMetaHook";
import usePlayerUpdate from "../hooks/PlayerUpdateHook";

interface PlayerProps {
    children?: JSX.Element | JSX.Element[]
}

export default function Player({ children }: PlayerProps) {
    const audioPlayer = AudioPlayer.getInstance();
    const [currentlyPlaying, setCurrentlyPlaying] = useState(audioPlayer.getCurrentTrack()?.track);
    const [dummyReload, setDummyReload] = useState(false);

    const progressValue = useRef(-1);
    const slider = useRef<HTMLInputElement>(null);

    const status = usePlayerUpdate({
        currentTime: true,
        duration: true,
        paused: true,
        buffering: true
    });

    useEffect(() => {
        if (slider.current != null && progressValue.current == -1) {
            const sliderElement: any = slider.current;
            sliderElement.value = status.currentTime / status.duration * 100;
        }
    }, [status]);

    const metadata = useTrackMeta(currentlyPlaying);

    const queueCallback = () => {
        setCurrentlyPlaying(audioPlayer.getCurrentTrack()?.track);
    }

    const mouseUpHandler = () => {
        if (progressValue.current != -1) {
            audioPlayer.setTime(progressValue.current);
        }
        progressValue.current = -1;
    }



    useEffect(() => {
        audioPlayer.registerQueueCallback(queueCallback);
        document.addEventListener("mouseup", mouseUpHandler);

        return () => {
            audioPlayer.unregisterQueueCallback(queueCallback);
            document.removeEventListener("mouseup", mouseUpHandler);
        }
    }, []);

    function sliderKeyDown(e: React.KeyboardEvent) {
        KeyboardShortcuts.getInstance().keypress(e.nativeEvent);
    }

    

    

    function progressChange(event: React.FormEvent) {
        const anyTarget: any = event.target;
        progressValue.current = anyTarget.valueAsNumber;
        setDummyReload(!dummyReload);
    }

    return (
        <div className={styles.container}>
            <div className={styles.currentTrackContainer}>
                <div className={styles.image}>
                    {currentlyPlaying && (
                        <ImageWrapper src={currentlyPlaying.getThumbnailUrl()} />
                    )}
                </div>
                <div className={styles.content}>
                    <Text className={styles.title}>{metadata ? metadata.title : currentlyPlaying?.trackID}</Text>
                    <Text className={styles.artist}>{convertArrayToString(metadata ? metadata.artists : [])}</Text>
                </div>
            </div>

            <div className={styles.progressContainer}>
                <div className={styles.buttons}>
                    <Grid.Container justify={"center"}>
                        <Grid>
                            <Button tabIndex={-1} auto rounded className={styles.roundButton} light onPress={() => audioPlayer.previousTrack()}><MdSkipPrevious /></Button>
                        </Grid>
                        <Grid>
                            {status.paused || !currentlyPlaying ? (<Button tabIndex={-1} auto rounded light className={styles.roundButton} onPress={() => audioPlayer.play()}><MdPlayArrow /></Button>) : (<Button tabIndex={-1} auto rounded light className={styles.roundButton} onPress={() => audioPlayer.pause()}><MdPause /></Button>)}
                        </Grid>
                        <Grid>
                            <Button tabIndex={-1} auto rounded light className={styles.roundButton} onPress={() => audioPlayer.nextTrack()}><MdSkipNext /></Button>
                        </Grid>
                    </Grid.Container>
                </div>

                <span className={styles.time}>{currentlyPlaying && status.duration != -1 ? formatTime(progressValue.current == -1 ? status.currentTime : (progressValue.current / 100 * status.duration)) : ""}</span>
                <div className={styles.progressBar}>
                    {status.buffering || !currentlyPlaying ? null : (
                        <input ref={slider} tabIndex={-1} min={0} max={100} step={0.1} type="range" className={styles.progressRange + (progressValue.current == -1 ? "" : ` ${styles.progressActive}`)} onInput={e => progressChange(e)} onKeyDown={sliderKeyDown} />
                    )}
                    <div className={styles.progress}>
                        <Progress
                            color="primary"
                            value={progressValue.current == -1 ? (status.currentTime / status.duration * 100) : (progressValue.current)}
                            size="xs"
                            indeterminated={status.buffering}
                            animated={false}
                            max={100}
                        />
                    </div>
                </div>
                <span className={styles.time}>{currentlyPlaying && status.duration != -1 ? formatTime(status.duration) : ""}</span>
            </div>
            <div className={styles.rightContainer}>
                { children }
            </div>
        </div>
    )
}