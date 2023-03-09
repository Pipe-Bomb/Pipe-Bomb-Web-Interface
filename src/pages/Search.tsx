import { Input, Button, Loading } from "@nextui-org/react";
import { useState, useRef, useEffect } from "react";
import PipeBombConnection from "../logic/PipeBombConnection";
import Track from "pipebomb.js/dist/music/Track";
import ListTrack from "../components/ListTrack";
import styles from "../styles/Search.module.scss";
import Loader from "../components/Loader";

let value = "";
let storedTrackList: Track[] = [];
let storedPlatform = "Youtube Music";

export default function Search() {
    const input = useRef<HTMLInputElement>(null);
    const [currentPlatform, setCurrentPlatform] = useState(storedPlatform);
    const [trackList, setTrackList] = useState(storedTrackList);
    const [loading, setLoading] = useState(false);

    function keyPress(event: React.KeyboardEvent) {
        if (event.key !== "Enter") return;
        search();
    }

    function search() {
        const target = input.current?.value;

        if (!target) return;
        setLoading(true);
        PipeBombConnection.getInstance().getApi().v1.search(storedPlatform, target)
        .then((tracks) => {
            storedTrackList = tracks;
            setTrackList(tracks);
            setLoading(false);
        }).catch((error) => {
            console.error(error);
            setTrackList([]);
            setLoading(false);
        });
    }

    function setPlatform(platform: string) {
        if (storedPlatform == platform) return;
        storedPlatform = platform;
        setCurrentPlatform(storedPlatform);
        search();
    }

    function generateHtml() {
        if (loading) {
            return <Loader text="Searching..."></Loader>;
        } else {
            return <>
                {trackList.map((track, index) => (
                    <ListTrack key={index} track={track} />
                ))}
            </>
        }
    }

    return (
        <>
        <div className={styles.top}>
            <Input
                ref={input}
                size="xl"
                placeholder="Search"
                clearable
                bordered
                fullWidth
                onKeyDown={keyPress}
                onChange={e => value = e.target.value}
                className={styles.bar}
                initialValue={value}
                autoFocus
            />
            <Button
                size="lg"
                bordered onPress={search}
                className={styles.button}
                auto
            >
                Search
            </Button>
        </div>
        <Button.Group bordered className={styles.serviceButtons} css={{margin: "calc(20px + 1rem) 0 0 0"}}>
            <Button disabled={currentPlatform == "Youtube Music"} onPress={() => setPlatform("Youtube Music")}>Youtube Music</Button>
            <Button disabled={currentPlatform == "SoundCloud"} onPress={() => setPlatform("SoundCloud")}>SoundCloud</Button>
        </Button.Group>
        <div className={styles.list}>
            {generateHtml()}
        </div>
    </>
  );
}