import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PipeBombConnection from "../logic/PipeBombConnection";
import styles from "../styles/Playlist.module.scss";
import compactTrackStyles from "../styles/CompactTrack.module.scss";
import { Button, Dropdown, Grid, Text } from "@nextui-org/react";
import Loader from "../components/Loader";
import Track from "pipebomb.js/dist/music/Track";
import ListTrack from "../components/ListTrack";
import AudioPlayer from "../logic/AudioPlayer";
import { convertTracklistToM3u } from "../logic/Utils";
import { MdShuffle, MdPlayArrow, MdMoreHoriz } from "react-icons/md";
import PlaylistIndex from "../logic/PlaylistIndex";
import { useNavigate } from "react-router-dom";
import Account, { UserDataFormat } from "../logic/Account";
import CompactTrack from "../components/CompactTrack";
import PipeBombPlaylist from "pipebomb.js/dist/collection/Playlist";

let lastPlaylistID = "";

export default function Playlist() {
    let paramID: any = useParams().playlistID;
    const audioPlayer = AudioPlayer.getInstance();
    const [playlist, setPlaylist] = useState<PipeBombPlaylist | null>(null);
    const [trackList, setTrackList] = useState<Track[] | null | false>(false);
    const [errorCode, setErrorCode] = useState(0);
    const [selfInfo, setSelfInfo] = useState<UserDataFormat | null>(null);
    const [suggestions, setSuggestions] = useState<Track[] | null>(null);
    const navigate = useNavigate();


    const playlistID: string = paramID;

    const callback = (collection: PipeBombPlaylist) => {
        if (!collection) return;
        collection.getTrackList(PipeBombConnection.getInstance().getApi().trackCache)
        .then(tracks => {
            if (lastPlaylistID != paramID) return;
            setTrackList(tracks);

            collection.getSuggestedTracks(PipeBombConnection.getInstance().getApi().trackCache)
            .then(newSuggestions => {
                if (lastPlaylistID != paramID) return;
                setSuggestions(newSuggestions);
            })
        });
    }

    useEffect(() => {
        lastPlaylistID = paramID;
        setTrackList(false);
        setPlaylist(null);
        setSuggestions(null);

        let alive = true;
        PlaylistIndex.getInstance().getPlaylist(playlistID)
        .then(collection => {
            if (!alive) return;
            setPlaylist(collection);
            callback(collection);
        }).catch(error => {
            if (error?.statusCode == 400) {
                setErrorCode(400);
            } else {
                setErrorCode(500);
                console.error(error);
            }
        });

        return () => {
            alive = false;
        }
    }, [paramID]);

    useEffect(() => {
        if (!selfInfo) {
            Account.getInstance().getUserData().then(setSelfInfo);
        }

        if (playlist) {
            playlist.registerUpdateCallback(callback);
        }

        return () => {
            if (playlist) {
                playlist.unregisterUpdateCallback(callback);
            }
        }
    }, [playlist]);

    if (errorCode == 400) {
        return (
            <>
                <Text h1>Error 404</Text>
                <Text h3>Playlist Not Found.</Text>
            </>
        )
    }

    if (paramID === undefined || isNaN(parseInt(paramID)) || errorCode != 0) {
        return (
            <>
                <Text h1>Error 500</Text>
                <Text h3>Something went wrong!</Text>
            </>
        )
    }

    if (!playlist) {
        return <Loader text="Loading..."></Loader>
    }

    if (trackList === false) {
        return (
            <>
                <Text h1>{playlist.getName()}</Text>
                <Loader text="Loading Tracks..."></Loader>
            </>
        )
    }


    const newTrackList: Track[] = trackList || [];

    function playPlaylist() {
        if (!trackList) return;
        audioPlayer.clearQueue();
        audioPlayer.addToQueue(trackList, false, 0);
        audioPlayer.nextTrack();
    }

    function shufflePlaylist() {
        if (!trackList) return;
        audioPlayer.clearQueue();
        audioPlayer.addToQueue(trackList, true, 0);
        audioPlayer.nextTrack();
    }

    function playSuggestions() {
        if (!suggestions) return;
        audioPlayer.clearQueue();
        audioPlayer.addToQueue(suggestions, false, 0);
        audioPlayer.nextTrack();
    }

    function contextMenu(button: React.Key) {
        switch (button) {
            case "delete":
                playlist?.deleteCollection()
                .then(() => {
                    PlaylistIndex.getInstance().checkPlaylists();
                    navigate("/");
                })
                break;
            case "m3u":
                if (trackList) {
                    convertTracklistToM3u(PipeBombConnection.getInstance().getUrl(), trackList, false, true);
                }
                break;
            case "queue":
                if (trackList) {
                    audioPlayer.addToQueue(trackList);
                }
                break;
        }
    }

    const isOwnPlaylist = selfInfo && selfInfo.userID == playlist.owner.userID;

    function generateContextMenu() {
        if (isOwnPlaylist) {
            return (
                <Dropdown.Menu onAction={contextMenu} disabledKeys={["rename"]}>
                    <Dropdown.Item key="queue">Add to Queue</Dropdown.Item>
                    <Dropdown.Item key="rename">Rename Playlist</Dropdown.Item>
                    <Dropdown.Item key="m3u">Download as M3U</Dropdown.Item>
                    <Dropdown.Item key="delete" color="error">Delete Playlist</Dropdown.Item>
                </Dropdown.Menu>
            );
        } else {
            return (
                <Dropdown.Menu onAction={contextMenu} disabledKeys={["like"]}>
                    <Dropdown.Item key="queue">Add to Queue</Dropdown.Item>
                    <Dropdown.Item key="like">Like Playlist</Dropdown.Item>
                    <Dropdown.Item key="m3u">Download as M3U</Dropdown.Item>
                </Dropdown.Menu>
            )
        }
        
    }

    function generateSuggestions() {
        if (!suggestions || !playlist || !trackList) {
            return <Loader text="Loading Suggestions..." />;
        }

        if (!suggestions.length) {
            return <Text h3>Couldn't find any suggested tracks for this playlist</Text>;
        }

        const trackIDs = trackList.map(track => track.trackID);

        return <>
            <Grid.Container gap={2} alignItems="center">
                <Grid>
                    <Text h2>Suggested Tracks</Text>
                </Grid>
                <Grid>
                    <Button size="md" auto onPress={playSuggestions} className={styles.roundButton} color="gradient"><MdPlayArrow /></Button>
                </Grid>
            </Grid.Container>
            <div className={compactTrackStyles.group}>
                {suggestions.map((track, index) => (
                    <CompactTrack key={index} track={track} parentPlaylist={playlist} inverse={trackIDs.includes(track.trackID)} />
                ))}
            </div>
        </>
    }

    return (
        <>
            <Text h1>{playlist.getName()}</Text>
            {!isOwnPlaylist && (
                <Text h4 className={styles.playlistAuthor}>by <Link to={`/user/${playlist.owner.userID}`} className={styles.link}>{playlist.owner.username}</Link></Text>
            )}
            {trackList && (
                <Text h5 className={styles.trackCount}>{trackList.length} track{trackList.length == 1 ? "" : "s"}</Text>
            )}
            <Grid.Container gap={2} alignItems="center" className={styles.top}>
                <Grid>
                    <Button size="xl" auto onPress={playPlaylist} className={styles.roundButton} color="gradient"><MdPlayArrow /></Button>
                </Grid>
                <Grid>
                    <Button size="lg" auto onPress={shufflePlaylist} className={styles.roundButton} bordered><MdShuffle /></Button>
                </Grid>
                <Grid>
                    <Dropdown>
                        <Dropdown.Trigger>
                            <Button light size="xl" className={styles.contextButton}>
                                <MdMoreHoriz />
                            </Button>
                        </Dropdown.Trigger>
                        { generateContextMenu() }
                    </Dropdown>
                </Grid>
            </Grid.Container>
            {newTrackList.map((track, index) => (
                <ListTrack key={index} track={track} parentPlaylist={playlist} />
            ))}
            <div className={styles.suggestions}>
                { generateSuggestions() }
            </div>
        </>
    )
}