import styles from "./styles/App.module.scss";
import { Route, Routes } from "react-router-dom";
import SideBar from './components/SideBar';
import Search from "./pages/Search";
import Home from "./pages/Home";
import Player from "./components/Player";
import Playlist from "./pages/Playlist";
import AddToPlaylist from "./components/AddToPlaylist";
import Connect from "./pages/Connect";
import CreatePlaylist from "./components/CreatePlaylist";
import useWindowSize from "./hooks/WindowSizeHook";
import SuggestionsPlaylist from "./pages/SuggestionsPlaylist";
import Chart from "./pages/Chart";
import NotificationManager from "./components/NotificationManager";
import SidebarState from "./components/SidebarState";
import { useState } from "react";

export let setSidebar: (state: "queue" | "lyrics") => void = null;
let currentSidebarState: "queue" | "lyrics" = "queue";

export const getSidebarState = () => {
    return currentSidebarState;
}

function App() {
    const size = useWindowSize();
    const [sidebarState, setSidebarState] = useState<"queue" | "lyrics">("queue");
    setSidebar = setSidebarState;
    currentSidebarState = sidebarState;

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
                    <Route path=":ID/suggestions" element={<SuggestionsPlaylist />}></Route>
                </Route>
          </Routes>
        )
    }

    const doRightSide = size.width && size.width >= 1800;

    return (
        <>
            <NotificationManager />
            <Routes>
                <Route path="/connect" element={<Connect />} /> {/* connect route */}
                <Route path="*" element={
                    <>
                        <SideBar></SideBar>
                        <Player showQueue={!doRightSide}></Player>
                        <AddToPlaylist></AddToPlaylist>
                        <CreatePlaylist></CreatePlaylist>

                        <div className={styles.content}>
                            <div className={styles.main}>
                                <div className={styles.page}>
                                    { getRoutes() }
                                </div>
                            </div>
                            {doRightSide && (
                                <div className={styles.rightSpace}>
                                    <SidebarState state={sidebarState} />
                                </div>
                            )}
                        </div>
                    </>
                } />
            </Routes>
        </>
    )
}

export default App;
