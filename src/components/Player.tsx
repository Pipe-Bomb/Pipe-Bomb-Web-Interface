import { Button, Dropdown, Grid, Progress, Text } from "@nextui-org/react";
import styles from "../styles/Player.module.scss";
import { MdSkipNext, MdSkipPrevious, MdPlayArrow, MdPause } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import AudioPlayer from "../logic/AudioPlayer";
import { convertArrayToString, downloadFile, formatTime } from "../logic/Utils";
import KeyboardShortcuts from "../logic/KeyboardShortcuts";
import ImageWrapper from "./ImageWrapper";
import useTrackMeta from "../hooks/TrackMetaHook";
import usePlayerUpdate from "../hooks/PlayerUpdateHook";
import { Link } from "react-router-dom";
import { openContextMenu } from "./ContextMenu";
import { openAddToPlaylist } from "./AddToPlaylist";
import PipeBombConnection from "../logic/PipeBombConnection";
import React from "react";

interface PlayerProps {
    children?: JSX.Element | JSX.Element[]
}

const Player = React.memo(function Player({ children }: PlayerProps) {
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

    function contextMenuOpened(button: React.Key) {
        switch (button) {
            case "playlist":
                openAddToPlaylist(currentlyPlaying);
                break;
            case "download":
                const filename = (metadata ? metadata.title : currentlyPlaying.trackID) + ".mp3";
                downloadFile(currentlyPlaying.getAudioUrl(), filename);
                break;
            case "share":
                PipeBombConnection.getInstance().copyLink("track", currentlyPlaying.trackID);
                break;
        }
    }

    const contextMenu = (
        <Dropdown.Menu onAction={contextMenuOpened}>
            <Dropdown.Item key="track"><Link className={styles.dropdownLink} to={`/track/${currentlyPlaying?.trackID}`}>See Track Page</Link></Dropdown.Item>
            <Dropdown.Item key="share">Copy Link</Dropdown.Item>
            <Dropdown.Item key="playlist">Add to Playlist</Dropdown.Item>
            <Dropdown.Item key="suggestions"><Link className={styles.dropdownLink} to={`/track/${currentlyPlaying?.trackID}/suggestions`}>See Suggested Tracks</Link></Dropdown.Item>
            <Dropdown.Item key="download">Download as MP3</Dropdown.Item>
        </Dropdown.Menu>
    )

    return (
        <div className={styles.container}>
            <div className={styles.currentTrackContainer}>
                {currentlyPlaying && (
                    <>
                        <div className={styles.image}>
                            <Link to={`/track/${currentlyPlaying.trackID}`} onContextMenu={e => openContextMenu(e, contextMenu)}>
                                <ImageWrapper src={currentlyPlaying.getThumbnailUrl()} />
                            </Link>
                        </div>
                        <div className={styles.content}>
                            <Link to={`/track/${currentlyPlaying.trackID}`} onContextMenu={e => openContextMenu(e, contextMenu)}><Text className={styles.title}>{metadata ? metadata.title : currentlyPlaying.trackID}</Text></Link>
                            <Text className={styles.artist}>{convertArrayToString(metadata ? metadata.artists : [])}</Text>
                        </div>
                    </>
                )}
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
});

export default Player;