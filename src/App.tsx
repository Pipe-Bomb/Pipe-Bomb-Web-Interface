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
import useWindowSize from "./logic/WindowSizeHook";
import Queue from "./components/Queue";
import AudioPlayer from "./logic/AudioPlayer";
import { useEffect, useState } from "react";
import SuggestionsPlaylist from "./pages/SuggestionsPlaylist";
import Chart from "./pages/Chart";
import NotificationManager from "./components/NotificationManager";

function App() {
  const size = useWindowSize();
  const [playerActive, setPlayerActive] = useState(false);
  const audioPlayer = AudioPlayer.getInstance();

  const callback = () => {
    const newPlayerActive = !!audioPlayer.getCurrentTrack() || !!audioPlayer.getQueue().length;
    if (newPlayerActive != playerActive) setPlayerActive(newPlayerActive);
  }
  useEffect(() => {
    audioPlayer.registerQueueCallback(callback);

    return () => {
        audioPlayer.unregisterQueueCallback(callback);
    }
}, []);

  function getRoutes() {
    return (
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/test2" element={<Test2 />} />
        <Route path="/track/:trackId" element={<Track />} /> */}

        <Route path="/search">
          <Route index element={<Search />} />
          {/* <Route path=":serviceName" element={<Test2 />}></Route> */}
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

        {/* <Route path="*" element={<Test2 />} /> */}
      </Routes>
    )
  }

  const doRightSide = size.width && size.width >= 1800 || false;

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
              {doRightSide && playerActive && (
                <div className={styles.rightSpace}>
                  <Queue sideBar />
                </div>
              )}
            </div>
          </>
        } />
      </Routes>
    </>
  );
}

export default App;
