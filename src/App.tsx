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

function App() {

  return (
    <>
      <Routes>
        <Route path="/connect" element={<Connect />} /> {/* connect route */}
        <Route path="*" element={<> {/* all other routes */}

          <SideBar></SideBar>
          <Player></Player>
          <AddToPlaylist></AddToPlaylist>
          <CreatePlaylist></CreatePlaylist>
          <div className={styles.content}>
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

              {/* <Route path="*" element={<Test2 />} /> */}
            </Routes>
          </div>
          
        </>} />
      </Routes>
    </>
  );
}

export default App;
