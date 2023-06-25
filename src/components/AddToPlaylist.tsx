import { Button, Grid, Loading, Text } from '@nextui-org/react';
import Track from 'pipebomb.js/dist/music/Track';
import { useState, useEffect } from "react";
import PlaylistIndex from '../logic/PlaylistIndex';
import styles from "../styles/AddToPlaylist.module.scss";
import { openCreatePlaylist } from "./CreatePlaylist";
import CustomModal from './CustomModal';
import Loader from './Loader';
import Playlist from 'pipebomb.js/dist/collection/Playlist';
import { createNotification } from './NotificationManager';
import React from 'react';

let openModal = () => {};
let addToPlaylist = (playlistID: string) => {};
let selectedTrack: Track | null = null;

export function openAddToPlaylist(track: Track) {
    selectedTrack = track;
    openModal();
}

export function addTrack(playlist: Playlist) {
    addToPlaylist(playlist.collectionID);
}

interface lastButton {
    playlistID: string,
    value: string | JSX.Element
}

const AddToPlaylist = React.memo(function AddToPlaylist() {
    const [visible, setVisible] = useState(false);
    const [playlists, setPlaylists] = useState(PlaylistIndex.getInstance().getPlaylists());
    const [lastTrackButton, setLastTrackButton] = useState<lastButton>({
        playlistID: "",
        value: ""
    });

    openModal = () => {
        setLastTrackButton({
            playlistID: "",
            value: ""
        });
        setVisible(true);
    }

    useEffect(() => {
        PlaylistIndex.getInstance().registerUpdateCallback(setPlaylists);

        return () => {
            PlaylistIndex.getInstance().unregisterUpdateCallback(setPlaylists);
        }
    }, []);

    addToPlaylist = (playlistID: string) => {
        if (!selectedTrack || (lastTrackButton.playlistID == playlistID && lastTrackButton.value == "Added")) return;

        PlaylistIndex.getInstance().getPlaylist(playlistID)
        .then(playlist => {
            setLastTrackButton({
                playlistID: playlist.collectionID,
                value: <Loading type="points"></Loading>
            });

            if (!selectedTrack) return;
    
            playlist.addTracks(selectedTrack)
            .then(async () => {
                let trackName = "track";
                if (selectedTrack && !selectedTrack.isUnknown()) {
                    trackName = (await selectedTrack.loadMetadata()).title;
                }
                createNotification({
                    text: `Added ${trackName} to ${playlist.getName()}`
                });
                setLastTrackButton({
                    playlistID: playlist.collectionID,
                    value: "Added"
                });
            }).catch(async (error: any) => {
                console.error(error);
                let trackName = "track";
                if (selectedTrack && !selectedTrack.isUnknown()) {
                    trackName = (await selectedTrack.loadMetadata()).title;
                }
                createNotification({
                    text: `Failed to add ${trackName} to ${playlist.getName()}`
                });
                setLastTrackButton({
                    playlistID: playlist.collectionID,
                    value: "Error"
                });
            });
        })
    }

    function generatePlaylistHTML() {
        if (!playlists) return <Loader text="Loading Playlists" />;

        return playlists.map(playlist => (
            <div key={playlist.collectionID} className={styles.playlist}>
                <Text className={styles.name} h3>{playlist.getName()}</Text>
                <Button className={styles.add} color="secondary" auto onPress={() => addToPlaylist(playlist.collectionID)} disabled={lastTrackButton.playlistID == playlist.collectionID}>{lastTrackButton.playlistID == playlist.collectionID ? lastTrackButton.value : "Add"}</Button>
            </div>
        ));
    }

    return (
        <>
            <CustomModal visible={visible} onClose={() => setVisible(false)} title="Add to Playlist">
                { generatePlaylistHTML() }
                <Grid.Container justify="flex-end">
                    <Grid>
                        <Button onPress={() => openCreatePlaylist(selectedTrack || undefined)} bordered auto>New Playlist</Button>
                    </Grid>
                </Grid.Container>
            </CustomModal>
        </>
    )
});

export default AddToPlaylist;