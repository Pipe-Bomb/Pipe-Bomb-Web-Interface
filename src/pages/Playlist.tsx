import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PipeBombConnection from "../logic/PipeBombConnection";
import Collection from "pipebomb.js/dist/collection/Collection";
import styles from "../styles/Playlist.module.scss";
import { Button, Dropdown, Grid, Text } from "@nextui-org/react";
import Loader from "../components/Loader";
import Track from "pipebomb.js/dist/music/Track";
import ListTrack from "../components/ListTrack";
import AudioPlayer from "../logic/AudioPlayer";
import { shuffle } from "../logic/Utils";
import { MdShuffle, MdPlayArrow, MdMoreHoriz } from "react-icons/md";
import PlaylistIndex from "../logic/PlaylistIndex";
import { useNavigate } from "react-router-dom";

export default function Playlist() {
    let paramID: any = useParams().playlistID;
    const audioPlayer = AudioPlayer.getInstance();
    const [playlist, setPlaylist] = useState<Collection | null>(null);
    const [trackList, setTrackList] = useState<Track[] | null | false>(false);
    const [errorCode, setErrorCode] = useState(0);
    const navigate = useNavigate();


    const playlistID: number = paramID;

    useEffect(() => {
        setPlaylist(null);
        PipeBombConnection.getInstance().getApi().v1.getPlaylist(playlistID)
        .then(collection => {
            setPlaylist(collection);
            collection.getTrackList(PipeBombConnection.getInstance().getApi().trackCache)
            .then(tracks => {
                setTrackList(tracks);
            }).catch(error => {
                console.error(error);
            })
        }).catch(error => {
            if (error?.statusCode == 400) {
                setErrorCode(400);
            } else {
                setErrorCode(500);
                console.error(error);
            }
        });
    }, [paramID]);

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
        audioPlayer.addToQueue(trackList, 0);
        audioPlayer.nextTrack();
    }

    function shufflePlaylist() {
        if (!trackList) return;
        audioPlayer.addToQueue(shuffle(trackList), 0);
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
        }
    }

    return (
        <>
            <Text h1>{playlist.getName()}</Text>
            <Grid.Container gap={2} alignItems="center">
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
                        <Dropdown.Menu onAction={contextMenu} disabledKeys={["rename"]}>
                            <Dropdown.Item key="rename">Rename Playlist</Dropdown.Item>
                            <Dropdown.Item key="delete" color="error">Delete Playlist</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Grid>
            </Grid.Container>
            {newTrackList.map((track, index) => (
                <ListTrack key={index} track={track} parentPlaylist={playlist} />
            ))}
        </>
    )
}