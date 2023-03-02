import { Button, Grid, Loading, Text } from '@nextui-org/react';
import Collection from 'pipebomb.js/dist/collection/Collection';
import Track from 'pipebomb.js/dist/music/Track';
import { useState, useEffect } from "react";
import PlaylistIndex from '../logic/PlaylistIndex';
import styles from "../styles/AddToPlaylist.module.scss";
import { openCreatePlaylist } from "./CreatePlaylist";
import CustomModal from './CustomModal';

let openModal = () => {};
let addToPlaylist = (playlistID: number) => {};
let selectedTrack: Track | null = null;

export function openAddToPlaylist(track: Track) {
    selectedTrack = track;
    openModal();
}

export function addTrack(playlist: Collection) {
    addToPlaylist(playlist.collectionID);
}

interface lastButton {
    playlistID: number,
    value: string | JSX.Element
}

export default function AddToPlaylist() {
    const [visible, setVisible] = useState(false);
    const [playlists, setPlaylists] = useState(PlaylistIndex.getInstance().getPlaylists());
    const [lastTrackButton, setLastTrackButton] = useState<lastButton>({
        playlistID: -1,
        value: ""
    });

    openModal = () => {
        setLastTrackButton({
            playlistID: -1,
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

    addToPlaylist = (playlistID: number) => {
        if (!selectedTrack || (lastTrackButton.playlistID == playlistID && lastTrackButton.value == "Added")) return;

        PlaylistIndex.getInstance().getPlaylist(playlistID)
        .then(playlist => {
            setLastTrackButton({
                playlistID: playlist.collectionID,
                value: <Loading type="points"></Loading>
            });

            if (!selectedTrack) return;
    
            playlist.addTracks(selectedTrack)
            .then(() => {
                setLastTrackButton({
                    playlistID: playlist.collectionID,
                    value: "Added"
                });
            }).catch(error => {
                console.error(error);
                setLastTrackButton({
                    playlistID: playlist.collectionID,
                    value: "Error"
                });
            });
        })
    }

    return (
        <>
            <CustomModal visible={visible} onClose={() => setVisible(false)} title="Add to Playlist">
                {playlists.map(playlist => (
                    <div key={playlist.collectionID} className={styles.playlist}>
                        <Text className={styles.name} h3>{playlist.getName()}</Text>
                        <Button className={styles.add} color="secondary" auto onPress={() => addToPlaylist(playlist.collectionID)} disabled={lastTrackButton.playlistID == playlist.collectionID}>{lastTrackButton.playlistID == playlist.collectionID ? lastTrackButton.value : "Add"}</Button>
                    </div>
                ))}
                <Grid.Container justify="flex-end">
                    <Grid>
                        <Button onPress={() => openCreatePlaylist(selectedTrack || undefined)} bordered auto>New Playlist</Button>
                    </Grid>
                </Grid.Container>
            </CustomModal>
        </>
    )
}