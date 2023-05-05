import ExternalCollection from "pipebomb.js/dist/collection/ExternalCollection";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import PipeBombConnection from "../logic/PipeBombConnection";
import Loader from "../components/Loader";
import { Button, Dropdown, Grid, Text } from "@nextui-org/react";
import styles from "../styles/ExternalPlaylistPage.module.scss"
import ImageWrapper from "../components/ImageWrapper";
import ListTrack from "../components/ListTrack";
import Track from "pipebomb.js/dist/music/Track";
import { MdMoreHoriz, MdPlayArrow, MdShuffle } from "react-icons/md";
import AudioPlayer from "../logic/AudioPlayer";
import { convertTracklistToM3u } from "../logic/Utils";

export default function ExternalPlaylistPage() {
    const collectionID = useParams().collectionID;
    const [collection, setCollection] = useState<ExternalCollection | false>(null);
    const [tracklist, setTracklist] = useState<Track[]>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setCollection(null);
        setLoading(true);
        PipeBombConnection.getInstance().getApi().v1.getExternalPlaylist(collectionID)
        .then(setCollection)
        .catch(() => setCollection(false));
    }, [collectionID]);

    function load() {
        if (!collection) return;     
        
        collection.loadNextPage().then(success => {
            setTracklist(collection.getTrackList());
            setLoading(success);
            if (success) {
                load();
            }
        });
    }

    useEffect(load, [collection]);

    useEffect(load, []);

    if (collection === false) {
        return (
            <>
                <Text h1>Error 404</Text>
                <Text h2>Playlist Not Found.</Text>
            </>
        )
    }

    if (!collection) {
        return (
            <Loader text="Loading Playlist..." />
        )
    }

    function playPlaylist() {
        if (!tracklist) return;
        AudioPlayer.getInstance().clearQueue();
        AudioPlayer.getInstance().addToQueue(tracklist);
        AudioPlayer.getInstance().nextTrack();
    }

    function shufflePlaylist() {
        if (!tracklist) return;
        AudioPlayer.getInstance().clearQueue();
        AudioPlayer.getInstance().addToQueue(tracklist, true);
        AudioPlayer.getInstance().nextTrack();
    }

    function contextMenu(button: React.Key) {
        switch (button) {
            case "m3u":
                if (tracklist) {
                    convertTracklistToM3u(PipeBombConnection.getInstance().getUrl(), tracklist, false, true);
                }
                break;
            case "queue":
                if (tracklist) {
                    AudioPlayer.getInstance().addToQueue(tracklist);
                }
                break;
        }
    }

     return (
        <>
            <div className={styles.top}>
                <div className={styles.imageContainer}>
                    <ImageWrapper src={collection.getThumbnailUrl()} />
                </div>
                <div className={styles.info}>
                    <Text h1>{collection.getName()}</Text>
                    <Text h5 className={styles.trackCount}>{collection.getTrackListLength()} track{collection.getTrackListLength() == 1 ? "" : "s"}</Text>
                </div>
            </div>
            <Grid.Container gap={2} alignItems="center" className={styles.buttons}>
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
                        <Dropdown.Menu onAction={contextMenu} disabledKeys={["like"]}>
                            <Dropdown.Item key="queue">Add to Queue</Dropdown.Item>
                            <Dropdown.Item key="like">Like Playlist</Dropdown.Item>
                            <Dropdown.Item key="m3u">Download as M3U</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Grid>
            </Grid.Container>
            <div className={styles.tracklist}>
                { tracklist && tracklist.map((track, index) => (
                    <ListTrack key={index} track={track} />
                ))}
                { loading && (
                    <div className={styles.loader}>
                        <Loader text="Loading tracks..." />
                    </div>
                )}
            </div>
        </>
    )
}