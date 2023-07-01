import Playlist from "pipebomb.js/dist/collection/Playlist";
import styles from "../styles/PlaylistCollection.module.scss"
import ListPlaylist from "./ListPlaylist";

export interface PlaylistCollectionProps {
    playlists?: Playlist[],
    children?: JSX.Element | JSX.Element[]
}

export default function PlaylistCollection({ playlists, children }: PlaylistCollectionProps) {
    return (
        <div className={styles.container}>
            {playlists && playlists.map((playlist, index) => (
                <ListPlaylist key={index} url={`/playlist/${playlist.collectionID}`} title={playlist.getName()} subtitle="Pipe Bomb Playlist" image={playlist.getThumbnailUrl()} />
            ))}
            { children }
        </div>
    )
}