import styles from "./styles/App.module.scss";
import { Route, Routes } from "react-router-dom";
import Navbar from './components/Navbar';
import Search from "./pages/Search";
import Home from "./pages/Home";
import Player from "./components/Player";
import Playlist from "./pages/Playlist";
import AddToPlaylist from "./components/AddToPlaylist";
import Connect from "./pages/Connect";
import CreatePlaylist from "./components/CreatePlaylist";
import SuggestionsPlaylist from "./pages/SuggestionsPlaylist";
import Chart from "./pages/Chart";
import NotificationManager from "./components/NotificationManager";
import TrackPage from "./pages/TrackPage";
import Volume from "./components/Volume";
import CastButton from "./components/CastButton";
import { Button } from "@nextui-org/react";
import { VscLayoutSidebarRight } from "react-icons/vsc"
import { useState } from "react";
import UserPage from "./pages/UserPage";
import ExternalPlaylistPage from "./pages/ExternalPlaylistPage";
import ContextMenu from "./components/ContextMenu";
import Sidebar from "./components/Sidebar";
import BackgroundGlow from "./components/BackgroundGlow";

function App() {
    const [sidebarEnabled, setSidebarEnabled] = useState(true);

    function getRoutes() {
        return (
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search">
                    <Route index element={<Search />} />
                </Route>

                <Route path="/playlist">
                    <Route index element={<Search />} />
                    <Route path=":playlistID" element={<Playlist />}></Route>
                </Route>

                <Route path="/charts">
                    <Route index element={<Search />} />
                    <Route path=":chartID" element={<Chart />}></Route>
                </Route>

                <Route path="/track">
                    <Route path=":ID" element={<TrackPage />} />
                    <Route path=":ID/suggestions" element={<SuggestionsPlaylist />}></Route>
                </Route>

                <Route path="/user/:userID" element={<UserPage />} />

                <Route path="/collection/playlist/:collectionID" element={<ExternalPlaylistPage />} />
          </Routes>
        )
    }

    return (
        <>
            <NotificationManager />
            <Routes>
                <Route path="/connect" element={<Connect />} /> {/* connect route */}
                <Route path="*" element={
                    <>
                        <Navbar />
                        <Player>
                            <CastButton />
                            <Volume />
                            <Button auto rounded className={styles.roundButton} light={!sidebarEnabled} onPress={() => setSidebarEnabled(!sidebarEnabled)}><VscLayoutSidebarRight /></Button>
                        </Player>
                        <AddToPlaylist />
                        <CreatePlaylist />
                        <ContextMenu />

                        <div className={styles.content}>
                            <div className={styles.main}>
                                <div className={styles.page}>
                                    { getRoutes() }
                                </div>
                            </div>
                            <Sidebar enabled={sidebarEnabled} />
                        </div>
                    </>
                } />
            </Routes>
            <BackgroundGlow />
        </>
    )
}

export default App;
