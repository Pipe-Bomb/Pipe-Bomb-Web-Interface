import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PipeBombConnection from "../logic/PipeBombConnection";
import User from "pipebomb.js/dist/User";
import Playlist from "pipebomb.js/dist/collection/Playlist";
import Loader from "../components/Loader";
import styles from "../styles/UserPage.module.scss"
import ImageWrapper from "../components/ImageWrapper";
import Account from "../logic/Account";
import { Text } from "@nextui-org/react"
import SquarePlaylist from "../components/SquarePlaylist";

export default function UserPage() {
    const userID = useParams().userID;

    const [user, setUser] = useState<User | false>(null);
    const [userImage, setUserImage] = useState<string>(null);
    const [playlists, setPlaylists] = useState<Playlist[]>(null);

    useEffect(() => {
        PipeBombConnection.getInstance().getApi().v1.getUser(userID)
        .then(userData => {
            setUser(userData.user);
            setUserImage(Account.getAvatarUrl(userData.user.userID));
            setPlaylists(userData.playlists);
        }).catch(e => {
            console.error(e);
            setUser(false);
        });
    }, [userID]);

    if (user === false) {
        return (
            <>
                <Text h1>Error 404</Text>
                <Text h3>User Not Found.</Text>
            </>
        )
    }

    if (!user) {
        return (
            <Loader text="Loading User..." />
        )
    }

    return (
        <>
            <div className={styles.top}>
                <div className={styles.topImage}>
                    <div className={styles.topImageInternal}>
                        <ImageWrapper src={userImage} />
                    </div>
                </div>
                <div className={styles.info}>
                    <Text h1>{ user.username }</Text>
                    <Text h2>{ user.userID }</Text>
                </div>
            </div>

            { !!playlists.length && (
                <div className={styles.playlists}>
                    <Text h2>Playlists</Text>
                    <div className={styles.playlistContainer}>
                        {playlists.map((playlist, index) => (
                            <div key={index} className={styles.playlist}>
                                <SquarePlaylist playlist={playlist} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}