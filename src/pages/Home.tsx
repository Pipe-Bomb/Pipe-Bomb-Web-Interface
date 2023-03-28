import { Grid, Text } from "@nextui-org/react";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import PipeBombUser from "../components/PipeBombUser";
import SquarePlaylist from "../components/SquarePlaylist";
import Account, { UserDataFormat } from "../logic/Account";
import PlaylistIndex from "../logic/PlaylistIndex";

export default function Home() {
    const [playlists, setPlaylists] = useState(PlaylistIndex.getInstance().getPlaylists());
    const [userData, setUserData] = useState<UserDataFormat | null>(null);
    

    useEffect(() => {
        Account.getInstance().getUserData().then(setUserData);

        PlaylistIndex.getInstance().registerUpdateCallback(setPlaylists);

        return () => {
            PlaylistIndex.getInstance().unregisterUpdateCallback(setPlaylists);
        }
    }, []);

    function generatePlaylistHTML() {
        if (playlists === null) {
            return (
                <Loader text="Loading playlists" />
            )
        }

        if (playlists.length) {
            return (
                <>
                    <Text h2>Playlists</Text>
                    {playlists.map(playlist => <SquarePlaylist key={playlist.collectionID} playlist={playlist} />)}
                </>
            )
        }

        return (
            <Text h3>No playlists?</Text>
        )
    }

    const playlistHTML: JSX.Element | null = generatePlaylistHTML();


    return <>
        <Grid.Container justify="space-between" alignItems="center">
            <Grid>
                {userData ? (
                    <h1>Welcome, {userData.username}!</h1>
                ) : (
                    <h1>Welcome!</h1>
                )}
            </Grid>
            <Grid>
                <PipeBombUser />
            </Grid>
        </Grid.Container>
        
        
        {playlistHTML}
    </>
}