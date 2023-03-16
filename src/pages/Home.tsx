import { Text } from "@nextui-org/react";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import SquarePlaylist from "../components/SquarePlaylist";
import PlaylistIndex from "../logic/PlaylistIndex";

export default function Home() {
    const [playlists, setPlaylists] = useState(PlaylistIndex.getInstance().getPlaylists());

    useEffect(() => {
        PlaylistIndex.getInstance().registerUpdateCallback(setPlaylists);

        return () => {
            PlaylistIndex.getInstance().unregisterUpdateCallback(setPlaylists);
        }
    }, []);

    function generatePlaylistHTML() {
        if (playlists === null) {
            console.log("playlists was null!");
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
        <h1>Pipe Bomb</h1>
        {playlistHTML}
    </>
}