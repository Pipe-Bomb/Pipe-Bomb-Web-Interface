import { Button, Grid, Text } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { MdRepeat, MdRepeatOne, MdOutlineDeleteOutline } from "react-icons/md";
import { ReactSortable } from "react-sortablejs";
import AudioPlayer from "../logic/AudioPlayer";
import styles from "../styles/Queue.module.scss";
import QueueTrack from "./QueueTrack";
import { IoMdShuffle } from "react-icons/io";
import { ViewportList } from "react-viewport-list";
import useCurrentTrack from "../hooks/CurrentTrackHook";

interface ItemInterface {
    id: number
}

export default function Queue() {
    const audioPlayer = AudioPlayer.getInstance();
    const [trackList, setTrackList] = useState(audioPlayer.getQueue());
    const [history, setHistory] = useState(audioPlayer.getHistory());
    const currentTrack = useRef<HTMLDivElement>(null);
    const nowPlaying = useCurrentTrack();

    const queueCallback = () => {
        setTrackList(audioPlayer.getQueue());
        setHistory(audioPlayer.getHistory());
    }

    function scroll() {
        queueCallback();
        setTimeout(() => {
            if (currentTrack.current) {
                const offset = currentTrack.current.offsetTop;
                const scroll = currentTrack.current.parentElement.scrollTop;
                if (Math.abs(offset - scroll - 200) < currentTrack.current.parentElement.parentElement.clientHeight / 2) {
                    currentTrack.current.parentElement.scrollTo({
                        top: offset - 200,
                        behavior: "smooth"
                    });
                }
            }
        }, 50);
    }

    useEffect(() => {
        audioPlayer.registerQueueCallback(queueCallback);

        return () => {
            audioPlayer.unregisterQueueCallback(queueCallback);
        }
    }, []);

    useEffect(scroll, [nowPlaying]);

    useEffect(() => {
        setTimeout(() => {
            if (!currentTrack.current) return;
            const scrollTop = currentTrack.current.offsetTop;
            currentTrack.current.parentElement.scrollTo({
                top: scrollTop - 200
            });
        });
    }, []);


    const itemList: ItemInterface[] = [];
    for (let i = 0; i < trackList.length; i++) {
        itemList.push({
            id: i
        });
    }

    function reArrangeQueue(event: ItemInterface[]) {
        let different = false;
        for (let i = 0; i < event.length; i++) {
            if (itemList[i].id != event[i].id) {
                different = true;
                break;
            }
        }
        if (!different) return;
        audioPlayer.setQueueOrder(event.map(item => item.id));
    }

    const track = audioPlayer.getCurrentTrack();

    return (
        <div className={styles.container}>
            
            <Grid.Container className={styles.topButtons} gap={1}>
                <Grid>
                    <Button className={styles.roundButton} auto light={!audioPlayer.isShuffled()} onPress={() => audioPlayer.setShuffled(!audioPlayer.isShuffled())}><IoMdShuffle /></Button>
                </Grid>
                <Grid>
                    <Button className={styles.roundButton} auto light={audioPlayer.getLoopStatus() == "none"} onPress={() => audioPlayer.cycleLoopStatus()}>
                        {audioPlayer.getLoopStatus() == "one" ? (
                            <MdRepeatOne />
                        ) : (
                            <MdRepeat />
                        )}
                    </Button>
                </Grid>
                <Grid>
                    <Button className={styles.roundButton} auto light onPress={() => audioPlayer.clearQueue()} disabled={!audioPlayer.getQueue().length}><MdOutlineDeleteOutline /></Button>
                </Grid>
            </Grid.Container>
            <div className={styles.scroll}>
                {history.length ? (
                    <Text h3 className={styles.queueTitle}>History</Text>
                ) : null}

                {!!history.length && (
                    <ViewportList items={history}>
                        {track => (
                            <QueueTrack key={track.queueID} track={track} index={-2} />
                        )}
                    </ViewportList>
                )}

                <div ref={currentTrack}></div>

                {track ? (
                    <div>
                        <Text h3 className={styles.queueTitle}>Now Playing</Text>
                        <QueueTrack key={track.queueID} track={track} index={-1} />
                    </div>
                ) : null}
                
                {!!trackList.length && (
                    <>
                        <Text h3 className={styles.queueTitle}>Queue</Text>
                        <ReactSortable list={itemList} setList={e => reArrangeQueue(e)} animation={100}>
                            {trackList.map((track, index) => (
                                <QueueTrack key={track.queueID} track={track} index={index} />
                            ))}
                        </ReactSortable>
                    </>
                )}
            </div>
        </div>
    )
}