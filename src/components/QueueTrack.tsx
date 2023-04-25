import { useState, useEffect, useRef } from "react";
import Track from "pipebomb.js/dist/music/Track";
import { convertArrayToString, downloadFile } from "../logic/Utils";
import styles from "../styles/QueueTrack.module.scss";
import { Loading, Dropdown } from "@nextui-org/react";
import AudioPlayer, { TrackWrapper } from "../logic/AudioPlayer";
import { openAddToPlaylist } from "./AddToPlaylist";
import { Link } from "react-router-dom";
import PipeBombConnection from "../logic/PipeBombConnection";
import GlowEffect from "./GlowEffect";

interface Props {
  track: TrackWrapper,
  index: number
}

export default function QueueTrack({ track, index }: Props) {
    const [metadata, setMetadata] = useState<any>(null);
    const [hasImage, setHasImage] = useState(false);

    const thumbnail = useRef(null);

    useEffect(() => {
        track.track.getMetadata()
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
                if (index == -2) {
                    audioPlayer.playFromHistory(track);
                } else if (index != -1) {
                    audioPlayer.removeFromQueue(index);
                    audioPlayer.playTrack(track);
                }
                break;
            case "next-up":
                audioPlayer.removeFromQueue(index);
                audioPlayer.addToQueue([track.track], false, 0);
                break;
            case "remove":
                audioPlayer.removeFromQueue(index);
                break;
            case "playlist":
                openAddToPlaylist(track.track);
                break;
            case "download":
                const filename = (metadata?.title || track.track.trackID) + ".mp3";
                downloadFile(`${PipeBombConnection.getInstance().getUrl()}/v1/audio/${track.track.trackID}`, filename);
                break;
        }
    }

    if (index == -1) {
        dropdownItems = (
            <Dropdown.Menu onAction={contextMenu}>
                <Dropdown.Item key="playlist">Add to Playlist</Dropdown.Item>
                <Dropdown.Item key="suggestions"><Link className={styles.dropdownLink} to={`/track/${track.track.trackID}/suggestions`}>See Suggested Tracks</Link></Dropdown.Item>
                <Dropdown.Item key="download">Download as MP3</Dropdown.Item>
            </Dropdown.Menu>
        );
    } else if (index == -2) {
        dropdownItems = (
            <Dropdown.Menu onAction={contextMenu}>
                <Dropdown.Item key="play">Play Now</Dropdown.Item>
                <Dropdown.Item key="next-up">Play Next</Dropdown.Item>
                <Dropdown.Item key="playlist">Add to Playlist</Dropdown.Item>
                <Dropdown.Item key="suggestions"><Link className={styles.dropdownLink} to={`/track/${track.track.trackID}/suggestions`}>See Suggested Tracks</Link></Dropdown.Item>
                <Dropdown.Item key="download">Download as MP3</Dropdown.Item>
            </Dropdown.Menu>
        )
    } else {
        dropdownItems = (
            <Dropdown.Menu disabledKeys={index == 0 ? ["next-up"] : []} onAction={contextMenu}>
                <Dropdown.Item key="play">Play Now</Dropdown.Item>
                <Dropdown.Item key="next-up">Play Next</Dropdown.Item>
                <Dropdown.Item key="playlist">Add to Playlist</Dropdown.Item>
                <Dropdown.Item key="remove">Remove from Queue</Dropdown.Item>
                <Dropdown.Item key="suggestions"><Link className={styles.dropdownLink} to={`/track/${track.track.trackID}/suggestions`}>See Suggested Tracks</Link></Dropdown.Item>
                <Dropdown.Item key="download">Download as MP3</Dropdown.Item>
            </Dropdown.Menu>
        )
    }

    return (
        <div className={styles.container + (index == -2 ? ` ${styles.history}` : "")}>
            <GlowEffect active={index == -1 && false} spread={100} image={hasImage ? thumbnail.current.src : null}>
                <div className={styles.box}>
                    <div className={styles.image} onClick={() => contextMenu("play")}>
                        <img ref={thumbnail} className={styles.thumbnail} style={{display: hasImage ? "block" : "none"}} />
                        {!hasImage && (<Loading loadingCss={{ $$loadingSize: "30px", $$loadingBorder: "3px" }} css={{margin: "8px"}} />)}
                    </div>
                    <div className={styles.info}>
                        <span className={styles.trackName}>{metadata?.title || track.track.trackID}</span>
                        {metadata && (
                            <span className={styles.artists}>{convertArrayToString(metadata.artists)}</span>
                        )}
                    </div>
                    <Dropdown>
                        <Dropdown.Button light className={styles.contextButton}></Dropdown.Button>
                            {dropdownItems}
                    </Dropdown>
                </div>
            </GlowEffect>
        </div>
    );
}