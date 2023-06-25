import { Link } from "react-router-dom";
import styles from "../styles/Navbar.module.scss";
import PlaylistIndex from "../logic/PlaylistIndex";
import { useEffect, useRef, useState } from "react";
import PipeBombConnection from "../logic/PipeBombConnection";
import { useNavigate } from 'react-router-dom';
import { Button } from "@nextui-org/react";
import { openCreatePlaylist } from "./CreatePlaylist";
import { GoPlus } from "react-icons/go";
import { MdHome, MdSearch, MdOutlinePlaylistPlay } from "react-icons/md";
import { IoServer } from "react-icons/io5";
import Loader from "./Loader";
import Playlist from "pipebomb.js/dist/collection/Playlist";
import React from "react";

const Navbar = React.memo(function Navbar() {
    const playlistIndex = PlaylistIndex.getInstance();
    const [playlists, setPlaylists] = useState(playlistIndex.getPlaylists());
    const navigate = useNavigate();
    const logoID = getComputedStyle(document.body).getPropertyValue("--nextui-colors-logoID") || "main";
    const logo = useRef(null);

    function playlistsUpdated(playlists: Playlist[]) {
        setPlaylists(playlists);
    }

    useEffect(() => {
        playlistIndex.registerUpdateCallback(playlistsUpdated);

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
            <img src={`/logos/${logoID}.png`} className={styles.image} ref={logo} style={{opacity: logo.current ? 1 : 0}} />
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
});

export default Navbar;