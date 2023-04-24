import { Button, Popover, Text } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { MdQueueMusic } from "react-icons/md";
import { ReactSortable } from "react-sortablejs";
import AudioPlayer from "../logic/AudioPlayer";
import AudioPlayerStatus from "../logic/AudioPlayerStatus";
import styles from "../styles/Queue.module.scss";
import QueueTrack from "./QueueTrack";
import AudioType from "../logic/audio/AudioType";

interface ItemInterface {
    id: number
}

interface QueueProps {
    sideBar?: boolean
}

export default function Queue({ sideBar }: QueueProps) {
    const audioPlayer = AudioPlayer.getInstance();
    const [trackList, setTrackList] = useState(audioPlayer.getQueue());

    const queueCallback = () => {
        setTrackList(audioPlayer.getQueue());
    }

    useEffect(() => {
        audioPlayer.registerQueueCallback(queueCallback);

        return () => {
            audioPlayer.unregisterQueueCallback(queueCallback);
        }
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

    if (sideBar) {
        return (
            <div className={styles.rightSideContainer}>
                {track ? (
                    <>
                        <Text h3 className={styles.queueTitle}>Now Playing</Text>
                        <QueueTrack track={track} index={-1} />
                    </>
                ) : null}
                
                <Text h3 className={styles.queueTitle}>Queue</Text>
                <ReactSortable list={itemList} setList={event => reArrangeQueue(event)} animation={100}>
                    {trackList.map((track, index) => (
                        <QueueTrack key={index} track={track} index={index} />
                    ))}
                </ReactSortable>
            </div>
        )
    }


    return (
        <div className={styles.queueContainer}>
            <Popover placement={"top-right"}>
                <Popover.Trigger>
                    <Button auto rounded className={styles.roundButton + " " + styles.queueButton} light><MdQueueMusic /></Button>
                </Popover.Trigger>
                <Popover.Content className={styles.queuePopover}>
                    {track ? (
                        <>
                            <Text h3 className={styles.queueTitle}>Now Playing</Text>
                            <QueueTrack key={-1} track={track} index={-1} />
                        </>
                    ) : null}
                    
                    <Text h3 className={styles.queueTitle}>Queue</Text>
                    <ReactSortable list={itemList} setList={event => reArrangeQueue(event)} animation={100}>
                        {trackList.map((track, index) => (
                            <QueueTrack key={index} track={track} index={index} />
                        ))}
                    </ReactSortable>
                </Popover.Content>
            </Popover>
        </div>
    )
}