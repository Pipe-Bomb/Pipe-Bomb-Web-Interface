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
import AudioPlayerStatus from "./logic/AudioPlayerStatus";
import SuggestionsPlaylist from "./pages/SuggestionsPlaylist";
import Chart from "./pages/Chart";

function App() {
  const size = useWindowSize();
  const [playerActive, setPlayerActive] = useState(false);

  const callback = (newStatus: AudioPlayerStatus) => {
    const newPlayerActive = !!newStatus.track || !!newStatus.queue.length;
    if (newPlayerActive != playerActive) setPlayerActive(newPlayerActive);
  }

  const audioPlayer = AudioPlayer.getInstance();
  useEffect(() => {
    audioPlayer.registerCallback(callback);

    return () => {
        audioPlayer.unregisterCallback(callback);
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
      <Routes>
        <Route path="/connect" element={<Connect />} /> {/* connect route */}
        <Route path="*" element={<> {/* all other routes */}

          <SideBar></SideBar>
          <Player showQueue={!doRightSide}></Player>
          <AddToPlaylist></AddToPlaylist>
          <CreatePlaylist></CreatePlaylist>
            {doRightSide ? (
              <div className={styles.content}>
                <div className={styles.main}>
                  { getRoutes() }
                </div>
                {playerActive && (
                  <div className={styles.rightSpace}>
                    <Queue sideBar />
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.content}>
                <div className={styles.main}>
                  { getRoutes() }
                </div>
              </div>
            )}
        </>} />
      </Routes>
    </>
  );
}

export default App;
