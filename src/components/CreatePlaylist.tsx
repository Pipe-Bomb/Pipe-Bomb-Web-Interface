import { Button, Grid, Input, Loading, Modal, Text } from '@nextui-org/react';
import Track from 'pipebomb.js/dist/music/Track';
import { useState, useRef } from "react";
import PipeBombConnection from '../logic/PipeBombConnection';
import PlaylistIndex from '../logic/PlaylistIndex';
import { addTrack } from './AddToPlaylist';
import CustomModal from './CustomModal';
import React from 'react';

let openModal = () => {};
let currentTrack: Track | null = null;

export function openCreatePlaylist(track?: Track) {
    currentTrack = track || null;
    openModal();
}

const CreatePlaylist = React.memo(function CreatePlaylist() {
    const input = useRef<HTMLInputElement>(null);
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);


    openModal = () => {
        setVisible(true);
    }

    function keyPress(event: React.KeyboardEvent) {
        if (event.key !== "Enter") return;
        newPlaylist();
    }

    function newPlaylist() {
        if (!input.current || !input.current.value) return;
        setLoading(true);
        PipeBombConnection.getInstance().getApi().v1.createPlaylist(input.current.value)
        .then(playlist => {
            if (currentTrack) {
                addTrack(playlist);
            }
            PlaylistIndex.getInstance().checkPlaylists()
            .then(playlist => {
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

    if (input.current) {
        input.current.value = "";
    }

    return (
        <CustomModal visible={visible} onClose={() => setVisible(false)} title="Create New Playlist">
            <Grid.Container gap={2} alignItems="center">
                <Grid css={{flexGrow: 1}}>
                    <Input onKeyDown={keyPress} ref={input} labelPlaceholder="Playlist Name" size="xl" bordered fullWidth disabled={loading} autoFocus></Input>
                </Grid>
                <Grid>
                    <Button auto color="gradient" size="lg" onPress={newPlaylist} disabled={loading}>
                        {loading ? (
                            <Loading type="points"></Loading>
                        ) : (
                            "Create"
                        )}
                    </Button>
                </Grid>
            </Grid.Container>
        </CustomModal>
    )
});

export default CreatePlaylist;