import { Button, Grid, Progress, Loading, Text, Popover } from "@nextui-org/react";
import styles from "../styles/Player.module.scss";
import { MdSkipNext, MdSkipPrevious, MdPlayArrow, MdPause } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import AudioPlayer from "../logic/AudioPlayer";
import AudioPlayerStatus from "../logic/AudioPlayerStatus";
import { convertArrayToString, formatTime } from "../logic/Utils";
import Queue from "./Queue";
import KeyboardShortcuts from "../logic/KeyboardShortcuts";
import Volume from "./Volume";
import CastButton from "./CastButton";
import AudioType from "../logic/audio/AudioType";

interface PlayerProps {
    showQueue: boolean
}


export default function Player({ showQueue }: PlayerProps) {
    const audioPlayer = AudioPlayer.getInstance();
    const [dummyReload, setDummyReload] = useState(false);;

    const progressValue = useRef(-1);
    const slider = useRef<HTMLInputElement>(null);

    const thumbnail = useRef<HTMLImageElement>(null);
    const [title, setTitle] = useState("");
    const [artist, setArtist] = useState("");

    const [hasImage, setHasImage] = useState<boolean | null>(null);

    let [audioStatus, setAudioStatus] = useState(audioPlayer.audio.activeType.getStatus());

    const audioCallback = (audio: AudioType) => {
        if (slider.current != null && progressValue.current == -1) {
            const sliderElement: any = slider.current;
            sliderElement.value = audio.getCurrentTime() / audio.getDuration() * 100;
        }
        setAudioStatus(audio.getStatus());
    }

    const queueCallback = () => {
        const currentTrack = audioPlayer.getCurrentTrack();
        if (currentTrack) {
            if (currentTrack.track.isUnknown()) {
                setHasImage(false);
            }
            currentTrack.track.getMetadata()
            .then(data => {
    
                if (!data.image) {
                    const element = thumbnail.current;
                    if (element) {
                        element.onload = () => {
                            setHasImage(true);
                        }
                        element.src = "/no-album-art.png";
                    }
                } else {
                    const icon = data.image || "/no-album-art.png";
                
                    const element = thumbnail.current;
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
                const element = thumbnail.current;
                if (!element) return;
                element.onload = () => {
                    setHasImage(true);
                }
                element.src = "/no-album-art.png";
            });
        } else {
            setTitle("");
            setArtist("");
            setHasImage(null);
        }
    }

    const mouseUpHandler = () => {
        if (progressValue.current != -1) {
            audioPlayer.setTime(progressValue.current);
        }
        progressValue.current = -1;
    }



    useEffect(() => {
        audioPlayer.registerQueueCallback(queueCallback);
        audioPlayer.audio.registerUpdateEventListener(audioCallback);
        document.addEventListener("mouseup", mouseUpHandler);

        return () => {
            audioPlayer.unregisterQueueCallback(queueCallback);
            audioPlayer.audio.unregisterUpdateEventListener(audioCallback);
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

    const track = audioPlayer.getCurrentTrack();

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
                            {audioStatus.paused || !track ? (<Button tabIndex={-1} auto rounded light className={styles.roundButton} onPress={() => audioPlayer.play()}><MdPlayArrow /></Button>) : (<Button tabIndex={-1} auto rounded light className={styles.roundButton} onPress={() => audioPlayer.pause()}><MdPause /></Button>)}
                        </Grid>
                        <Grid>
                            <Button tabIndex={-1} auto rounded light className={styles.roundButton} onPress={() => audioPlayer.nextTrack()}><MdSkipNext /></Button>
                        </Grid>
                    </Grid.Container>
                </div>

                <span className={styles.time}>{track && audioStatus.duration != -1 ? formatTime(progressValue.current == -1 ? audioStatus.currentTime : (progressValue.current / 100 * audioStatus.duration)) : ""}</span>
                <div className={styles.progressBar}>
                    {audioStatus.buffering || !track ? null : (
                        <input ref={slider} tabIndex={-1} min={0} max={100} step={0.1} type="range" className={styles.progressRange + (progressValue.current == -1 ? "" : ` ${styles.progressActive}`)} onInput={e => progressChange(e)} onKeyDown={sliderKeyDown} />
                    )}
                    <div className={styles.progress}>
                        <Progress
                            color="primary"
                            value={progressValue.current == -1 ? (audioStatus.currentTime / audioStatus.duration * 100) : (progressValue.current)}
                            size="xs"
                            indeterminated={audioStatus.buffering}
                            animated={false}
                            max={100}
                        />
                    </div>
                </div>
                <span className={styles.time}>{track && audioStatus.duration != -1 ? formatTime(audioStatus.duration) : ""}</span>
            </div>
            <div className={styles.rightContainer}>
                <CastButton />
                <Volume />
                {showQueue && (
                    <Queue />
                )}
            </div>
        </div>
    )
}