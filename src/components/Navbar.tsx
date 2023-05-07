import { Link } from "react-router-dom";
import styles from "../styles/Navbar.module.scss";
import PlaylistIndex from "../logic/PlaylistIndex";
import { useEffect, useState } from "react";
import PipeBombConnection from "../logic/PipeBombConnection";
import { useNavigate } from 'react-router-dom';
import { connectToHost } from "../pages/Connect";
import ServerIndex from "../logic/ServerIndex";
import Account from "../logic/Account";
import { Button } from "@nextui-org/react";
import { openCreatePlaylist } from "./CreatePlaylist";
import { GoPlus } from "react-icons/go";
import { MdHome, MdSearch, MdOutlinePlaylistPlay } from "react-icons/md";
import { IoServer } from "react-icons/io5";
import Loader from "./Loader";
import Playlist from "pipebomb.js/dist/collection/Playlist";

export default function Navbar() {
    const playlistIndex = PlaylistIndex.getInstance();
    const [playlists, setPlaylists] = useState(playlistIndex.getPlaylists());
    const navigate = useNavigate();
    const logoID = getComputedStyle(document.body).getPropertyValue("--nextui-colors-logoID") || "main";

    function playlistsUpdated(playlists: Playlist[]) {
        setPlaylists(playlists);
    }

    Account.getInstance();

    useEffect(() => {
        playlistIndex.registerUpdateCallback(playlistsUpdated);
        if (!PipeBombConnection.getInstance().getUrl()) {
            const host = localStorage.getItem("host");
            let connected = false;
            if (host) {
                const hostInfo = ServerIndex.getInstance().getServer(host);
                if (hostInfo) {
                    connectToHost(hostInfo, "secure");   
                    connected = true;
                }
            }
            if (!connected) {
                navigate("/connect");
            }
        }

        return () => {
            playlistIndex.unregisterUpdateCallback(playlistsUpdated);
        }
    }, []);

    function generatePlaylistHTML() {
        if (playlists === null) {
            return (
                <Loader />
            )
        }
        return playlists.map((playlist, index) => (
            <Link key={index} to={`/playlist/${playlist.collectionID}`} className={styles.playlist}>
                <MdOutlinePlaylistPlay className={styles.playlistIcon} />
                {playlist.getName()}
            </Link>
        ))
    }

    return <div className={styles.sideBar}>
        <Link to="/" className={styles.logo}>
            <img src={`/logos/${logoID}.png`} className={styles.image} />
        </Link>
        <div className={styles.topLinks}>
            <Button className={styles.topLink} onPress={() => navigate("/")}>
                <MdHome className={styles.topLinkIcon} />
                Home
            </Button>
            <Button className={styles.topLink} onPress={() => navigate("/search")}>
                <MdSearch className={styles.topLinkIcon} />
                Search
            </Button>
            <Button className={styles.topLink} onPress={() => navigate("/connect")}>
                <IoServer className={styles.topLinkIcon} />
                Change Server
            </Button>
            
            <Button className={styles.topLink} onPress={() => openCreatePlaylist()}>
                <GoPlus className={styles.topLinkIcon} />
                Create Playlist
            </Button>
        </div>
        <div className={styles.playlistTop}>

        </div>
        <div className={styles.playlists}>
            { generatePlaylistHTML() }
        </div>
    </div>
}