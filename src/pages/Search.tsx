import { Input, Button, Loading } from "@nextui-org/react";
import { useState, useRef, useEffect } from "react";
import PipeBombConnection from "../logic/PipeBombConnection";
import Track from "pipebomb.js/dist/music/Track";
import ListTrack from "../components/ListTrack";
import styles from "../styles/Search.module.scss";
import Loader from "../components/Loader";
import ServiceInfo from "pipebomb.js/dist/ServiceInfo";

let value = "";
let storedTrackList: Track[] = [];
let storedPlatform = "Youtube Music";

export default function Search() {
    const input = useRef<HTMLInputElement>(null);
    const [currentPlatform, setCurrentPlatform] = useState(storedPlatform);
    const [services, setServices] = useState<ServiceInfo[] | null>(null);
    const [trackList, setTrackList] = useState(storedTrackList);
    const [loading, setLoading] = useState(false);

    function keyPress(event: React.KeyboardEvent) {
        if (event.key !== "Enter") return;
        search();
    }

    useEffect(() => {
        if (services === null) {
            PipeBombConnection.getInstance().getApi().v1.getServices()
            .then(setServices)
            .catch(e => {
                console.error(e);
            });
        }
    });

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

    function generateServices() {
        if (services === null) {
            return <Loader text="Loading Services..."></Loader>;
        } else {
            const serverUrl = PipeBombConnection.getInstance().getUrl();
            return <>
                <div className={styles.buttonGroup}>
                    { services.map(service => (
                        <Button className={styles.serviceButton} key={service.name} disabled={currentPlatform == service.name} onPress={() => setPlatform(service.name)} light={currentPlatform != service.name} auto>
                            <img className={styles.icon} src={`${serverUrl}/v1/serviceicon/${service.name}`} />
                            {service.name}
                        </Button>
                    )) }
                </div>
                <div className={styles.list}>
                    { generateList() }
                </div>
            </>;
        }
    }

    function generateList() {
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
        { generateServices() }
    </>
  );
}