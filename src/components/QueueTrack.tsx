import { useState, useEffect, useRef } from "react";
import Track from "pipebomb.js/dist/music/Track";
import { convertArrayToString } from "../logic/Utils";
import styles from "../styles/QueueTrack.module.scss";
import { Loading, Dropdown } from "@nextui-org/react";
import AudioPlayer from "../logic/AudioPlayer";
import { openAddToPlaylist } from "./AddToPlaylist";
import { Link } from "react-router-dom";

interface Props {
  track: Track,
  index: number
}

export default function QueueTrack({ track, index }: Props) {
    const [metadata, setMetadata] = useState<any>(null);
    const [hasImage, setHasImage] = useState(false);

    const thumbnail = useRef(null);

    useEffect(() => {
        track.getMetadata()
        .then(data => {
            setMetadata(data);
            if (!data.image) {
                const element: any = thumbnail.current;
                if (!element) return;
                element.onload = () => {
                    setHasImage(true);
                }
                element.src = "/no-album-art.png";
                return;
            }
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

    let dropdownItems = null;

    if (thumbnail.current) {
        const element: any = thumbnail.current;
        element.referrerPolicy = "no-referrer";
    }

    

    function contextMenu(button: React.Key) {
        const audioPlayer = AudioPlayer.getInstance();
        switch (button) {
            case "play":
                if (index >= 0) {
                    audioPlayer.removeFromQueue(index);
                    audioPlayer.playTrack(track);
                }
                break;
            case "next-up":
                audioPlayer.removeFromQueue(index);
                audioPlayer.addToQueue([track], 0);
                break;
            case "remove":
                audioPlayer.removeFromQueue(index);
                break;
            case "playlist":
                openAddToPlaylist(track);
                break;
        }
    }

    if (index == -1) {
        dropdownItems = (
            <Dropdown.Menu disabledKeys={[]} onAction={contextMenu}>
                <Dropdown.Item key="playlist">Add to Playlist</Dropdown.Item>
                <Dropdown.Item key="suggestions"><Link className={styles.dropdownLink} to={`/track/${track.trackID}/suggestions`}>See Suggested Tracks</Link></Dropdown.Item>
            </Dropdown.Menu>
        );
    } else {
        dropdownItems = (
            <Dropdown.Menu disabledKeys={index == 0 ? ["next-up"] : []} onAction={contextMenu}>
                <Dropdown.Item key="play">Play Now</Dropdown.Item>
                <Dropdown.Item key="next-up">Play Next</Dropdown.Item>
                <Dropdown.Item key="playlist">Add to Playlist</Dropdown.Item>
                <Dropdown.Item key="remove">Remove from Queue</Dropdown.Item>
                <Dropdown.Item key="suggestions"><Link className={styles.dropdownLink} to={`/track/${track.trackID}/suggestions`}>See Suggested Tracks</Link></Dropdown.Item>
            </Dropdown.Menu>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.image} onClick={() => contextMenu("play")}>
                <img ref={thumbnail} className={styles.thumbnail} style={{display: hasImage ? "block" : "none"}} />
                {!hasImage && (<Loading loadingCss={{ $$loadingSize: "30px", $$loadingBorder: "3px" }} css={{margin: "8px"}} />)}
            </div>
            <div className={styles.info}>
                <span className={styles.trackName}>{metadata?.title || track.trackID}</span>
                {metadata && (
                    <span className={styles.artists}>{convertArrayToString(metadata.artists)}</span>
                )}
            </div>
            <Dropdown>
                <Dropdown.Button light className={styles.contextButton}></Dropdown.Button>
                    {dropdownItems}
            </Dropdown>
        </div>
    );
}