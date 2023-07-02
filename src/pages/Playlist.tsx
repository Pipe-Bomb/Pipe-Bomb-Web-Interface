import { useParams } from "react-router-dom";
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
import { MdPlayArrow } from "react-icons/md";
import PlaylistIndex from "../logic/PlaylistIndex";
import { useNavigate } from "react-router-dom";
import CompactTrack from "../components/CompactTrack";
import PipeBombPlaylist from "pipebomb.js/dist/collection/Playlist";
import PlaylistTop from "../components/PlaylistTop";
import useIsSelf from "../hooks/IsSelfHook";
import { ViewportList } from "react-viewport-list";
import { openRenamePlaylist } from "../components/RenamePlaylist"

let lastPlaylistID = "";

export default function Playlist() {
    let paramID: any = useParams().playlistID;
    const audioPlayer = AudioPlayer.getInstance();
    const [playlist, setPlaylist] = useState<PipeBombPlaylist | null>(null);
    const [trackList, setTrackList] = useState<Track[] | null | false>(false);
    const [errorCode, setErrorCode] = useState(0);
    const [suggestions, setSuggestions] = useState<Track[] | null>(null);
    const navigate = useNavigate();
    const self = useIsSelf(playlist?.owner);


    const playlistID: string = paramID;

    const callback = (collection: PipeBombPlaylist) => {
        if (!collection) return;
        collection.getTrackList()
        .then(tracks => {
            if (lastPlaylistID != paramID) return;
            setTrackList(tracks);

            collection.getSuggestedTracks()
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

    if (paramID === undefined || errorCode != 0) {
        return (
            <>
                <Text h1>Error 500</Text>
                <Text h3>Something went wrong!</Text>
            </>
        )
    }

    if (!playlist) {
        return <Loader text="Loading"></Loader>
    }

    if (trackList === false) {
        return (
            <>
                <Text h1>{playlist.getName()}</Text>
                <Loader text="Loading Tracks"></Loader>
            </>
        )
    }


    const newTrackList: Track[] = trackList || [];

    function playPlaylist() {
        if (!trackList) return;
        audioPlayer.clearQueue();
        audioPlayer.addToQueue(trackList, false, 0);
        audioPlayer.nextTrack();
        audioPlayer.setAutoplayTracks("playlist", playlist.collectionID, async () => {
            return await playlist.getSuggestedTracks();
        });
    }

    function shufflePlaylist() {
        if (!trackList) return;
        audioPlayer.clearQueue();
        audioPlayer.addToQueue(trackList, true, 0);
        audioPlayer.nextTrack();
        audioPlayer.setAutoplayTracks("playlist", playlist.collectionID, async () => {
            return await playlist.getSuggestedTracks();
        });
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
            case "rename":
                openRenamePlaylist(playlist);
                break;
            case "share":
                PipeBombConnection.getInstance().copyLink("playlist", playlist.collectionID);
                break;
        }
    }

    function generateContextMenu() {
        if (self) {
            return (
                <Dropdown.Menu onAction={contextMenu}>
                    <Dropdown.Item key="queue">Add to Queue</Dropdown.Item>
                    <Dropdown.Item key="share">Copy Link</Dropdown.Item>
                    <Dropdown.Item key="rename">Rename Playlist</Dropdown.Item>
                    <Dropdown.Item key="m3u">Download as M3U</Dropdown.Item>
                    <Dropdown.Item key="delete" color="error">Delete Playlist</Dropdown.Item>
                </Dropdown.Menu>
            );
        } else {
            return (
                <Dropdown.Menu onAction={contextMenu} disabledKeys={["like"]}>
                    <Dropdown.Item key="queue">Add to Queue</Dropdown.Item>
                    <Dropdown.Item key="share">Copy Link</Dropdown.Item>
                    <Dropdown.Item key="like">Like Playlist</Dropdown.Item>
                    <Dropdown.Item key="m3u">Download as M3U</Dropdown.Item>
                </Dropdown.Menu>
            )
        }
        
    }

    function generateSuggestions() {
        if (!suggestions || !playlist || !trackList) {
            return <Loader text="Loading Suggestions" />;
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
            <PlaylistTop name={playlist.getName()} trackCount={trackList ? trackList.length : undefined} onPlay={playPlaylist} onShuffle={shufflePlaylist} owner={playlist.owner} image={playlist.getThumbnailUrl()} contextMenu={generateContextMenu()} />
            <ViewportList items={newTrackList}>
                {(track, index) => (
                    <ListTrack key={index} track={track} parentPlaylist={playlist} />
                )}
            </ViewportList>
            <div className={styles.suggestions}>
                { generateSuggestions() }
            </div>
        </>
    )
}