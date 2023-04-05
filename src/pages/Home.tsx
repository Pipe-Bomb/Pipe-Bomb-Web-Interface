import { Grid, Text } from "@nextui-org/react";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import PipeBombUser from "../components/PipeBombUser";
import SquarePlaylist from "../components/SquarePlaylist";
import Account, { UserDataFormat } from "../logic/Account";
import PlaylistIndex from "../logic/PlaylistIndex";
import styles from "../styles/Home.module.scss";
import TrackList from "pipebomb.js/dist/collection/TrackList";
import PipeBombConnection from "../logic/PipeBombConnection";
import ChartIndex from "../logic/ChartIndex";
import SquareChart from "../components/SquareChart";

export default function Home() {
    const [playlists, setPlaylists] = useState(PlaylistIndex.getInstance().getPlaylists());
    const [charts, setCharts] = useState<TrackList[] | null>(null);
    const [userData, setUserData] = useState<UserDataFormat | null>(null);
    
    function reload() {
        ChartIndex.getInstance().getCharts().then(setCharts);
    }

    useEffect(() => {
        Account.getInstance().getUserData().then(setUserData);

        PipeBombConnection.getInstance().registerUpdateCallback(reload);
        PlaylistIndex.getInstance().registerUpdateCallback(setPlaylists);
        reload();

        return () => {
            PipeBombConnection.getInstance().unregisterUpdateCallback(reload);
            PlaylistIndex.getInstance().unregisterUpdateCallback(setPlaylists);
        }
    }, []);

    function generatePlaylistHTML() {
        if (playlists === null) {
            return (
                <div className={styles.loaderContainer}>
                    <Loader text="Loading Playlists" />
                </div>
            )
        }

        if (playlists.length) {
            return (
                <>
                    <Text h2 className={styles.title}>Playlists</Text>
                    <div className={styles.playlistContainer}>
                        {playlists.map((playlist, index) => (
                            <div key={index} className={styles.playlist}>
                                <SquarePlaylist playlist={playlist} />
                            </div>
                        ))}
                    </div>
                </>
            )
        }

        return null;
    }

    function generateChartHTML() {
        if (charts === null) {
            return (
                <div className={styles.loaderContainer}>
                    <Loader text="Loading Charts" />
                </div>
            )
        }

        if (charts.length) {
            return (
                <>
                    <Text h2 className={styles.title}>Charts</Text>
                    <div className={styles.playlistContainer}>
                        {charts.map((chart, index) => (
                            <div key={index} className={styles.playlist}>
                                <SquareChart chart={chart} />
                            </div>
                        ))}
                    </div>
                </>
            )
        }

        return null;
    }


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
        
        
        { generatePlaylistHTML() }
        { generateChartHTML() }
        
        <div className={styles.bottom}></div>
    </>
}