import { useState, useEffect, useRef } from "react";
import Track, { TrackMeta } from "pipebomb.js/dist/music/Track";
import { convertArrayToString, downloadFile } from "../logic/Utils";
import styles from "../styles/ListTrack.module.scss";
import { Dropdown, Loading } from "@nextui-org/react";
import AudioPlayer from "../logic/AudioPlayer";
import { openAddToPlaylist } from "./AddToPlaylist";
import { Link } from "react-router-dom";
import PipeBombConnection from "../logic/PipeBombConnection";
import Playlist from "pipebomb.js/dist/collection/Playlist";
import GlowEffect from "./GlowEffect";

interface Props {
  track: Track,
  parentPlaylist?: Playlist
}

export default function ListTrack({ track, parentPlaylist }: Props) {
    const [metadata, setMetadata] = useState<TrackMeta | null>(null);
    const [hasImage, setHasImage] = useState(false);
    const [active, setActive] = useState(false);

    const thumbnail = useRef(null);

    function queueCallback() {
        const newActive = AudioPlayer.getInstance().getCurrentTrack()?.trackID == track.trackID;
        if (newActive != active) setActive(newActive);
    }

    useEffect(() => {
        AudioPlayer.getInstance().registerQueueCallback(queueCallback);

        return () => {
            AudioPlayer.getInstance().unregisterQueueCallback(queueCallback);
        }
    });

    useEffect(() => {
        queueCallback();
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
            case "download":
                const filename = (metadata?.title || track.trackID) + ".mp3";
                downloadFile(`${PipeBombConnection.getInstance().getUrl()}/v1/audio/${track.trackID}`, filename);
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
                    <Dropdown.Item key="suggestions"><Link className={styles.dropdownLink} to={`/track/${track.trackID}/suggestions`}>See Suggested Tracks</Link></Dropdown.Item>
                    <Dropdown.Item key="download">Download as MP3</Dropdown.Item>
                    <Dropdown.Item key="remove" color="error">Remove from Playlist</Dropdown.Item>
                </Dropdown.Menu>
            )
        } else {
            return (
                <Dropdown.Menu disabledKeys={[]} onAction={contextMenu}>
                    <Dropdown.Item key="next-up">Play Next</Dropdown.Item>
                    <Dropdown.Item key="queue">Add to Queue</Dropdown.Item>
                    <Dropdown.Item key="playlist">Add to Playlist</Dropdown.Item>
                    <Dropdown.Item key="suggestions"><Link className={styles.dropdownLink} to={`/track/${track.trackID}/suggestions`}>See Suggested Tracks</Link></Dropdown.Item>
                    <Dropdown.Item key="download">Download as MP3</Dropdown.Item>
                </Dropdown.Menu>
            )
        }
    }

    return (
        <div className={styles.container} key={track.trackID}>
            <div className={styles.box}>
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
            <GlowEffect active={active} image={hasImage ? thumbnail.current.src : null} />
        </div>
    );
}