import { Text } from "@nextui-org/react";
import { useEffect, useState } from "react";
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

    function playlistHtml() {
        if (playlists.length) {
            return (
                <>
                    <Text h2>Playlists</Text>
                    {playlists.map(playlist => <SquarePlaylist key={playlist.collectionID} playlist={playlist} />)}
                </>
            )
        } else {
            return <></>
        }
    }


    return <>
        <h1>Pipe Bomb</h1>
        {playlistHtml()}
    </>
}