import { Button, Grid, Progress, Loading, Text, Popover } from "@nextui-org/react";
import styles from "../styles/Player.module.scss";
import { MdQueueMusic, MdSkipNext, MdSkipPrevious, MdPlayArrow, MdPause } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import AudioPlayer from "../logic/AudioPlayer";
import AudioPlayerStatus from "../logic/AudioPlayerStatus";
import { convertArrayToString, formatTime } from "../logic/Utils";
import QueueTrack from "./QueueTrack";
import { ReactSortable } from "react-sortablejs";
import Queue from "./Queue";
import KeyboardShortcuts from "../logic/KeyboardShortcuts";

interface ItemInterface {
    id: number
}

interface PlayerProps {
    showQueue: boolean
}


export default function Player({ showQueue }: PlayerProps) {
    const audioPlayer = AudioPlayer.getInstance();

    const progressValue = useRef(-1);
    const slider = useRef<HTMLInputElement>(null);

    const thumbnail = useRef(null);
    const [title, setTitle] = useState("");
    const [artist, setArtist] = useState("");

    const [hasImage, setHasImage] = useState<boolean | null>(null);

    let [audioStatus, setAudioStatus] = useState(audioPlayer.getStatus());

    const [trackList, setTrackList] = useState(audioPlayer.getQueue());

    const callback = (newStatus: AudioPlayerStatus) => {
        if (slider.current != null && progressValue.current == -1) {
            const sliderElement: any = slider.current;
            sliderElement.value = newStatus.time / newStatus.duration * 100;
        }
        setAudioStatus(newStatus);
        setTrackList(newStatus.queue);
    }

    let mouseUpHandler = () => {
        if (progressValue.current != -1) {
            audioPlayer.setTime(progressValue.current);
        }
        progressValue.current = -1;
    }

    useEffect(() => {
        audioPlayer.registerCallback(callback);
        document.addEventListener("mouseup", mouseUpHandler);

        return () => {
            audioPlayer.unregisterCallback(callback);
            document.removeEventListener("mouseup", mouseUpHandler);
        }
    }, []);

    function sliderKeyDown(e: React.KeyboardEvent) {
        KeyboardShortcuts.getInstance().keypress(e.nativeEvent);
    }

    useEffect(() => {
        audioStatus.track?.getMetadata()
        .then(data => {

            if (!data.image) {
                const element: any = thumbnail.current;
                if (element) {
                    element.onload = () => {
                        setHasImage(true);
                    }
                    element.src = "/no-album-art.png";
                }
            } else {
                const icon = data.image || "/no-album-art.png";
            
                const element: any = thumbnail.current;
                if (element) {
                    element.onload = () => {
                        setHasImage(true);
                    }
                    element.src = icon;
                }
            }

            setTitle(data.title);
            setArtist(convertArrayToString(data.artists));
        }).catch(error => {
            console.error(error);
            const element: any = thumbnail.current;
            if (!element) return;
            element.onload = () => {
                setHasImage(true);
            }
            element.src = "/no-album-art.png";
        });

        return () => {}
    }, [audioStatus.track]);

    

    

    function progressChange(event: React.FormEvent) {
        const anyTarget: any = event.target;
        progressValue.current = anyTarget.valueAsNumber;
        setAudioStatus({
            ...audioStatus,
            key: ((audioStatus.key || 0) + 1) % 10
        });
    }

    return (
        <div className={styles.container}>
            <div className={styles.currentTrackContainer}>
                <div className={styles.image}>
                    <img ref={thumbnail} className={styles.thumbnail} style={{display: hasImage ? "block" : "none"}} />
                    {hasImage === false && (<Loading loadingCss={{ $$loadingSize: "80px", $$loadingBorder: "10px" }} css={{margin: "10px"}} />)}
                </div>
                <div className={styles.content}>
                    <Text className={styles.title}>{title}</Text>
                    <Text className={styles.artist}>{artist}</Text>
                </div>
            </div>

            <div className={styles.progressContainer}>
                <div className={styles.buttons}>
                    <Grid.Container justify={"center"}>
                        <Grid>
                            <Button tabIndex={-1} auto rounded className={styles.roundButton} light onPress={() => audioPlayer.previousTrack()}><MdSkipPrevious /></Button>
                        </Grid>
                        <Grid>
                            {audioStatus.paused || !audioStatus.track ? (<Button tabIndex={-1} auto rounded light className={styles.roundButton} onPress={() => audioPlayer.play()}><MdPlayArrow /></Button>) : (<Button tabIndex={-1} auto rounded light className={styles.roundButton} onPress={() => audioPlayer.pause()}><MdPause /></Button>)}
                        </Grid>
                        <Grid>
                            <Button tabIndex={-1} auto rounded light className={styles.roundButton} onPress={() => audioPlayer.nextTrack()}><MdSkipNext /></Button>
                        </Grid>
                    </Grid.Container>
                </div>

                <span className={styles.time}>{audioStatus.track && audioStatus.duration != -1 ? formatTime(progressValue.current == -1 ? (audioStatus.seekTime == -1 ? audioStatus.time : audioStatus.seekTime) : (progressValue.current / 100 * audioStatus.duration)) : ""}</span>
                <div className={styles.progressBar}>
                    {audioStatus.loading || !audioStatus.track ? null : (
                        <input ref={slider} tabIndex={-1} min={0} max={100} step={0.1} type="range" className={styles.progressRange + (progressValue.current == -1 ? "" : ` ${styles.progressActive}`)} onInput={e => progressChange(e)} onKeyDown={sliderKeyDown} />
                    )}
                    <div className={styles.progress}>
                        <Progress
                            color="primary"
                            value={progressValue.current == -1 ? (audioStatus.time / audioStatus.duration * 100) : (progressValue.current)}
                            size="xs"
                            indeterminated={audioStatus.loading}
                            animated={false}
                            max={100}
                        />
                    </div>
                </div>
                <span className={styles.time}>{audioStatus.track && audioStatus.duration != -1 ? formatTime(audioStatus.duration) : ""}</span>
            </div>
            {showQueue && (
                <Queue />
            )}
        </div>
    )
}