import { convertArrayToString, downloadFile } from "../logic/Utils";
import styles from "../styles/QueueTrack.module.scss";
import { Dropdown } from "@nextui-org/react";
import AudioPlayer, { TrackWrapper } from "../logic/AudioPlayer";
import { openAddToPlaylist } from "./AddToPlaylist";
import { Link } from "react-router-dom";
import GlowEffect from "./GlowEffect";
import ImageWrapper from "./ImageWrapper";
import useTrackMeta from "../hooks/TrackMetaHook";

interface Props {
  track: TrackWrapper,
  index: number
}

export default function QueueTrack({ track, index }: Props) {
    const metadata = useTrackMeta(track.track);

    let dropdownItems = null;

    

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
                const filename = (metadata ? metadata.title : track.track.trackID) + ".mp3";
                downloadFile(track.track.getAudioUrl(), filename);
                break;
        }
    }

    if (index == -1) {
        dropdownItems = (
            <Dropdown.Menu onAction={contextMenu}>
                <Dropdown.Item key="track"><Link className={styles.dropdownLink} to={`/track/${track.track.trackID}`}>See Track Page</Link></Dropdown.Item>
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
                <Dropdown.Item key="track"><Link className={styles.dropdownLink} to={`/track/${track.track.trackID}`}>See Track Page</Link></Dropdown.Item>
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
                <Dropdown.Item key="track"><Link className={styles.dropdownLink} to={`/track/${track.track.trackID}`}>See Track Page</Link></Dropdown.Item>
                <Dropdown.Item key="playlist">Add to Playlist</Dropdown.Item>
                <Dropdown.Item key="remove">Remove from Queue</Dropdown.Item>
                <Dropdown.Item key="suggestions"><Link className={styles.dropdownLink} to={`/track/${track.track.trackID}/suggestions`}>See Suggested Tracks</Link></Dropdown.Item>
                <Dropdown.Item key="download">Download as MP3</Dropdown.Item>
            </Dropdown.Menu>
        )
    }

    return (
        <div className={styles.container + (index == -2 ? ` ${styles.history}` : "")}>
            <GlowEffect active={index == -1 && false} spread={100} image={track.track.getThumbnailUrl()}>
                <div className={styles.box}>
                    <div className={styles.image} onClick={() => contextMenu("play")}>
                        <ImageWrapper src={track.track.getThumbnailUrl()} loadingSize="lg" />
                    </div>
                    <div className={styles.info}>
                        <span className={styles.trackName}>{metadata ? metadata.title : track.track.trackID}</span>
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