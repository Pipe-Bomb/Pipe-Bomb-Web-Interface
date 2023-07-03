import { Button, Grid, Input, Loading } from '@nextui-org/react';
import React, { useState, useRef } from "react";
import PlaylistIndex from '../logic/PlaylistIndex';
import CustomModal from './CustomModal';
import Playlist from 'pipebomb.js/dist/collection/Playlist';

let openModal: () => void = () => {};
let currentPlaylist: Playlist | null = null;

export function openRenamePlaylist(playlist?: Playlist) {
    currentPlaylist = playlist || null;
    openModal();
}

const RenamePlaylist = React.memo(function RenamePlaylist() {
    const input = useRef<HTMLInputElement>(null);
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    openModal = () => {
        setVisible(true);
    }

    function keyPress(event: React.KeyboardEvent) {
        if (event.key !== "Enter") return;
        setPlaylistName();
    }

    function setPlaylistName() {
        if (!input.current || !input.current.value) return;
        if (!currentPlaylist) return; // cannot change name of null

        setLoading(true);
        currentPlaylist.setName(input.current.value)
        .then(() => {
            PlaylistIndex.getInstance().checkPlaylists()
            .then(playlists => {
                setLoading(false);
                setVisible(false);
            }).catch(error => {
                setLoading(false);
                setVisible(false);
                console.error(error);
            });
        }).catch(error => {
            setLoading(false);
            setVisible(false);
            console.error(error);
        });
    }

    return (
        <CustomModal visible={visible} onClose={() => setVisible(false)} title="Rename Playlist">
            <Grid.Container gap={2} alignItems="center">
                <Grid css={{flexGrow: 1}}>
                    <Input onKeyDown={keyPress} ref={input} labelPlaceholder="Playlist Name" initialValue={currentPlaylist?.getName()} size="xl" bordered fullWidth disabled={loading} autoFocus></Input>
                </Grid>
                <Grid>
                    <Button auto color="gradient" size="lg" onPress={setPlaylistName} disabled={loading}>
                        {loading ? (
                            <Loading type="points"></Loading>
                        ) : (
                            "Rename"
                        )}
                    </Button>
                </Grid>
            </Grid.Container>
        </CustomModal>
    )
});

export default RenamePlaylist;