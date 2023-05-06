import { useState, useEffect, useRef } from "react";
import Track, { TrackMeta } from "pipebomb.js/dist/music/Track";
import { convertArrayToString, downloadFile } from "../logic/Utils";
import styles from "../styles/CompactTrack.module.scss";
import { Button, Dropdown, Loading } from "@nextui-org/react";
import AudioPlayer from "../logic/AudioPlayer";
import { openAddToPlaylist } from "./AddToPlaylist";
import { Link } from "react-router-dom";
import { FaPlus, FaMinus } from "react-icons/fa";
import Account, { UserDataFormat } from "../logic/Account";
import Playlist from "pipebomb.js/dist/collection/Playlist";
import GlowEffect from "./GlowEffect";
import ImageWrapper from "./ImageWrapper";
import useTrackMeta from "../hooks/TrackMetaHook";
import useIsSelf from "../hooks/IsSelfHook";
import useCurrentTrack from "../hooks/CurrentTrackHook";

interface Props {
  track: Track,
  parentPlaylist?: Playlist
  inverse?: boolean
}

export default function CompactTrack({ track, parentPlaylist, inverse }: Props) {
    const metadata = useTrackMeta(track);
    const [currentlyAdding, setCurrentlyAdding] = useState(false);
    const isSelfOwned = useIsSelf(parentPlaylist?.owner);
    const currentTrack = useCurrentTrack();

    function playTrack() {
        AudioPlayer.getInstance().playTrack(track);
    }

    function contextMenu(button: React.Key) {
        const audioPlayer = AudioPlayer.getInstance();
        switch (button) {
            case "queue":
                AudioPlayer.getInstance().addToQueue([track]);
                break;
            case "next-up":
                audioPlayer.addToQueue([track], false, 0);
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
                const filename = (metadata ? metadata.title : track.trackID) + ".mp3";
                downloadFile(track.getAudioUrl(), filename);
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
        <div className={styles.container}>
            <GlowEffect active={currentTrack?.trackID == track.trackID} image={track.getThumbnailUrl()} spread={10}>
                <div className={styles.box}>
                    <div className={styles.image} onClick={playTrack}>
                        <ImageWrapper src={track.getThumbnailUrl()} loadingSize="md" />
                    </div>
                    <div className={styles.info}>
                        <div>
                            <span className={styles.trackName} onClick={playTrack}>{metadata ? metadata.title : track.trackID}</span>
                        </div>
                        {metadata && (
                            <span className={styles.artists}>{convertArrayToString(metadata.artists)}</span>
                        )}
                    </div>
                    <Dropdown>
                        <Dropdown.Button light className={styles.contextButton}></Dropdown.Button>
                        {dropdown()}
                    </Dropdown>
                    {isSelfOwned && (
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
            </GlowEffect>
        </div>
    );
}