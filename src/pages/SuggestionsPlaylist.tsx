import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Grid, Text } from "@nextui-org/react";
import { TrackMeta } from "pipebomb.js/dist/music/Track";
import PipeBombConnection from "../logic/PipeBombConnection";
import Loader from "../components/Loader";
import ListTrack from "../components/ListTrack";
import AudioPlayer from "../logic/AudioPlayer";
import { shuffle } from "../logic/Utils";
import styles from "../styles/Playlist.module.scss";
import { MdPlayArrow, MdShuffle } from "react-icons/md";
import TrackList from "pipebomb.js/dist/collection/TrackList";

let lastPlaylistID = "";

export default function SuggestionsPlaylist() {
    let paramID: any = useParams().ID;
    const [trackMeta, setTrackMeta] = useState<TrackMeta | null | false>(null);
    const [suggestions, setSuggestions] = useState<TrackList | null | false>(null);

    const api = PipeBombConnection.getInstance().getApi();
    const audioPlayer = AudioPlayer.getInstance();

    useEffect(() => {
        setTrackMeta(null);
        setSuggestions(null);
        lastPlaylistID = paramID;

        api.trackCache.getTrack(paramID)
        .then(track => {
            if (lastPlaylistID != paramID) return;
            track.getMetadata()
            .then(meta => {
                if (lastPlaylistID != paramID) return;
                setTrackMeta(meta);

                track.getSuggestedTracks(api.collectionCache, api.trackCache)
                .then(suggestions => {
                    if (lastPlaylistID != paramID) return;
                    if (!suggestions) {
                        setSuggestions(false);
                    } else {
                        setSuggestions(suggestions);
                    }
                }).catch(e => {
                    console.error(e);
                    if (lastPlaylistID != paramID) return;
                    setSuggestions(false); 
                });
            }).catch(e => {
                console.error(e);
                if (lastPlaylistID != paramID) return;
                setTrackMeta(false);
            })
        }).catch(e => {
            console.error(e);
            if (lastPlaylistID != paramID) return;
            setTrackMeta(false);
        });
        
    }, [paramID]);

    if (trackMeta === null) {
        return <Loader text="Loading..." />
    }

    if (!trackMeta) {
        return <>
            <Text h1>Error 404</Text>
            <Text h3>Track Not Found.</Text>
        </>
    }

    function generateListHTML() {
        if (suggestions === null) {
            return <>
                {trackMeta && (
                    <Text h4>A collection of tracks similar to <span className={styles.underline}>{trackMeta.title}</span></Text>
                )}
                <Loader text="Loading Tracks..." />
            </>
        }

        if (!suggestions || !suggestions.getTrackList().length) {
            const title = trackMeta ? trackMeta.title : "Unknown Track";
            return <Text h4>Couldn't find any tracks like <span className={styles.underline}>{title}</span></Text>
        }

        return (
            <>
                {trackMeta && (
                    <Text h4>A collection of tracks similar to <span className={styles.underline}>{trackMeta.title}</span></Text>
                )}
                <Grid.Container gap={2} alignItems="center">
                    <Grid>
                        <Button size="xl" auto onPress={playPlaylist} className={styles.roundButton} color="gradient"><MdPlayArrow /></Button>
                    </Grid>
                    <Grid>
                        <Button size="lg" auto onPress={shufflePlaylist} className={styles.roundButton} bordered><MdShuffle /></Button>
                    </Grid>
                </Grid.Container>
                { suggestions.getTrackList().map((track, index) => (
                    <ListTrack key={index} track={track} />
                ))}
            </>
        )
    }

    function playPlaylist() {
        if (!suggestions) return;
        audioPlayer.addToQueue(suggestions.getTrackList(), 0);
        audioPlayer.nextTrack();
    }

    function shufflePlaylist() {
        if (!suggestions) return;
        audioPlayer.addToQueue(shuffle(suggestions.getTrackList()), 0);
        audioPlayer.nextTrack();
    }

    return (
        <>
            <Text h1>Suggestions</Text>
            
            { generateListHTML() }
        </>
    )
}