import { Button, Grid, Loading, Text } from '@nextui-org/react';
import Collection from 'pipebomb.js/dist/collection/Collection';
import Track from 'pipebomb.js/dist/music/Track';
import { useState, useEffect } from "react";
import PlaylistIndex from '../logic/PlaylistIndex';
import styles from "../styles/AddToPlaylist.module.scss";
import { openCreatePlaylist } from "./CreatePlaylist";
import CustomModal from './CustomModal';

let openModal = () => {};
let addToPlaylist = (playlist: Collection) => {};
let selectedTrack: Track | null = null;

export function openAddToPlaylist(track: Track) {
    selectedTrack = track;
    openModal();
}

export function addTrack(playlist: Collection) {
    addToPlaylist(playlist);
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

    addToPlaylist = (playlist: Collection) => {
        if (!selectedTrack || (lastTrackButton.playlistID == playlist.collectionID && lastTrackButton.value == "Added")) return;
        
        setLastTrackButton({
            playlistID: playlist.collectionID,
            value: <Loading type="points"></Loading>
        });

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
    }

    return (
        <>
            <CustomModal visible={visible} onClose={() => setVisible(false)} title="Add to Playlist">
                {playlists.map(playlist => (
                    <div key={playlist.collectionID} className={styles.playlist}>
                        <Text className={styles.name} h3>{playlist.getName()}</Text>
                        <Button className={styles.add} color="secondary" auto onPress={() => addToPlaylist(playlist)} disabled={lastTrackButton.playlistID == playlist.collectionID}>{lastTrackButton.playlistID == playlist.collectionID ? lastTrackButton.value : "Add"}</Button>
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