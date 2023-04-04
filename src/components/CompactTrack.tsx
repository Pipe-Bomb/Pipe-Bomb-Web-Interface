import { useState, useEffect, useRef } from "react";
import Track, { TrackMeta } from "pipebomb.js/dist/music/Track";
import { convertArrayToString, downloadFile } from "../logic/Utils";
import styles from "../styles/CompactTrack.module.scss";
import { Button, Dropdown, Loading } from "@nextui-org/react";
import AudioPlayer from "../logic/AudioPlayer";
import { openAddToPlaylist } from "./AddToPlaylist";
import { Link } from "react-router-dom";
import PipeBombConnection from "../logic/PipeBombConnection";
import { FaPlus, FaMinus } from "react-icons/fa";
import Account, { UserDataFormat } from "../logic/Account";
import Playlist from "pipebomb.js/dist/collection/Playlist";

interface Props {
  track: Track,
  parentPlaylist?: Playlist
  inverse?: boolean
}

export default function CompactTrack({ track, parentPlaylist, inverse }: Props) {
    const [metadata, setMetadata] = useState<TrackMeta | null>(null);
    const [hasImage, setHasImage] = useState(false);
    const [currentlyAdding, setCurrentlyAdding] = useState(false);
    const [selfInfo, setSelfInfo] = useState<UserDataFormat | null>(null);

    const thumbnail = useRef(null);

    useEffect(() => {
        if (!selfInfo) {
            Account.getInstance().getUserData().then(setSelfInfo);
        }
        
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

    function addToPlaylist() {
        if (!parentPlaylist) return;
        setCurrentlyAdding(true);
        if (inverse) {
            parentPlaylist.removeTracks(track)
            .finally(() => {
                setCurrentlyAdding(false);
            })
        } else {
            parentPlaylist.addTracks(track)
            .finally(() => {
                setCurrentlyAdding(false);
            });
        }
    }

    return (
        <div className={styles.container} key={track.trackID}>
            <div className={styles.image} onClick={playTrack}>
                <img ref={thumbnail} className={styles.thumbnail} style={{display: hasImage ? "block" : "none"}} />
                {!hasImage && (<Loading loadingCss={{ $$loadingSize: "40px", $$loadingBorder: "5px" }} css={{margin: "10px"}} />)}
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
            {parentPlaylist && selfInfo?.userID == parentPlaylist.owner.userID && (
                <Button auto className={styles.addButton} light onPress={addToPlaylist} disabled={currentlyAdding}>{currentlyAdding ? (
                    <Loading type="points"></Loading>
                ) : (
                    inverse ? (
                        <FaMinus />
                    ) : (
                        <FaPlus />
                    )
                )}</Button>
            )}
        </div>
    );
}