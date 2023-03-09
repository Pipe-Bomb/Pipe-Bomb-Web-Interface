import { useState, useEffect, useRef } from "react";
import Track from "pipebomb.js/dist/music/Track";
import { convertArrayToString } from "../logic/Utils";
import styles from "../styles/ListTrack.module.scss";
import { Dropdown, Loading } from "@nextui-org/react";
import AudioPlayer from "../logic/AudioPlayer";
import Collection from "pipebomb.js/dist/collection/Collection";
import { openAddToPlaylist } from "./AddToPlaylist";

interface Props {
  track: Track,
  parentPlaylist?: Collection
}

export default function ListTrack({ track, parentPlaylist }: Props) {
    const [metadata, setMetadata] = useState<any>(null);
    const [hasImage, setHasImage] = useState(false);

    const thumbnail = useRef(null);

    useEffect(() => {
        track.getMetadata()
        .then(data => {
            if (!data) {
                const element: any = thumbnail.current;
                if (!element) return;
                element.onload = () => {
                    setHasImage(true);
                }
                element.src = "/no-album-art.png";
                return;
            }
            setMetadata(data);
            const icon = data.image || "/no-album-art.png";
            
            const element: any = thumbnail.current;
            if (!element) return;
            element.onload = () => {
                setHasImage(true);
            }
            element.src = icon;
        }).catch(error => {
            console.error(error);
            const element: any = thumbnail.current;
            if (!element) return;
            element.onload = () => {
                setHasImage(true);
            }
            element.src = "/no-album-art.png";
        });
    }, [track]);

    function playTrack() {
        AudioPlayer.getInstance().playTrack(track);
    }

    if (thumbnail.current) {
        const element: any = thumbnail.current;
        element.referrerPolicy = "no-referrer";
    }

    function contextMenu(button: React.Key) {
        const audioPlayer = AudioPlayer.getInstance();
        switch (button) {
            case "queue":
                AudioPlayer.getInstance().addToQueue([track]);
                break;
            case "next-up":
                audioPlayer.addToQueue([track], 0);
                break;
            case "playlist":
                openAddToPlaylist(track);
                break;
            case "remove":
                if (parentPlaylist) {
                    parentPlaylist.removeTracks(track);
                }
                break;
        }
    }

    function dropdown() {
        if (parentPlaylist) {
            return (
                <Dropdown.Menu disabledKeys={[]} onAction={contextMenu}>
                    <Dropdown.Item key="next-up">Play Next</Dropdown.Item>
                    <Dropdown.Item key="queue">Add to Queue</Dropdown.Item>
                    <Dropdown.Item key="playlist">Add to Playlist</Dropdown.Item>
                    <Dropdown.Item key="remove" color="error">Remove from Playlist</Dropdown.Item>
                </Dropdown.Menu>
            )
        } else {
            return (
                <Dropdown.Menu disabledKeys={[]} onAction={contextMenu}>
                    <Dropdown.Item key="next-up">Play Next</Dropdown.Item>
                    <Dropdown.Item key="queue">Add to Queue</Dropdown.Item>
                    <Dropdown.Item key="playlist">Add to Playlist</Dropdown.Item>
                </Dropdown.Menu>
            )
        }
    }

    return (
        <div className={styles.container} key={track.trackID}>
            <div className={styles.image} onClick={playTrack}>
                <img ref={thumbnail} className={styles.thumbnail} style={{display: hasImage ? "block" : "none"}} />
                {!hasImage && (<Loading loadingCss={{ $$loadingSize: "80px", $$loadingBorder: "10px" }} css={{margin: "10px"}} />)}
            </div>
            <div className={styles.info}>
                <div>
                    <span className={styles.trackName} onClick={playTrack}>{metadata?.title || track.trackID}</span>
                </div>
                {metadata && (
                    <span className={styles.artists}>{convertArrayToString(metadata.artists)}</span>
                )}
            </div>
            <Dropdown>
                <Dropdown.Button light className={styles.contextButton}></Dropdown.Button>
                {dropdown()}
            </Dropdown>
        </div>
    );
}