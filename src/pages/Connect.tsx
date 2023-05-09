import ServerIndex from "../logic/ServerIndex";
import { useEffect, useState, useRef } from "react";
import Server from "../components/Server";
import styles from "../styles/Connect.module.scss";
import { Button, Grid, Input } from "@nextui-org/react";
import PipeBombConnection from "../logic/PipeBombConnection";
import HostInfo from "pipebomb.js/dist/HostInfo";
import PlaylistIndex from "../logic/PlaylistIndex";
import { NavigateFunction, useNavigate } from "react-router-dom";

let navigate: NavigateFunction;

export function connectToHost(hostInfo: HostInfo, status: string) {
    if (!["secure", "insecure"].includes(status)) return;
    if (!ServerIndex.getInstance().getServer(hostInfo.host)) {
        return;
    }
    const host = `http${hostInfo.https ? "s" : ""}://${hostInfo.host}`;
    PipeBombConnection.getInstance().setHost(host);
    PlaylistIndex.getInstance().checkPlaylists();
    localStorage.setItem("host", host);
    if (navigate) navigate("/");
}

export default function Connect() {
    const serverIndex = ServerIndex.getInstance();
    const [servers, setServers] = useState(serverIndex.getServers());
    const input = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState("");
    navigate = useNavigate();

    useEffect(() => {
        serverIndex.registerUpdateCallback(setServers);
        return () => {
            serverIndex.unregisterUpdateCallback(setServers);
        }
    }, []);

    function addServer() {
        if (!value) return;

        ServerIndex.getInstance().addServer(value);
        setValue("");
    }

    function keyPress(event: React.KeyboardEvent) {
        if (event.key !== "Enter") return;
        addServer();
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Connect to Server</h1>
            <Grid.Container className={styles.addContainer} alignItems="center" gap={3}>
                <Grid style={{flexGrow: 1}}>
                    <Input ref={input} clearable underlined labelPlaceholder="Server URL" size="xl" fullWidth onKeyDown={keyPress} onChange={e => setValue(e.target.value)} initialValue={value} />
                </Grid>
                <Grid>
                    <Button auto size="lg" bordered onPress={addServer}>Add</Button>
                </Grid>
            </Grid.Container>
            {servers.map(server => (
                <Server key={server.host} hostInfo={server} status={serverIndex.getServerStatus(server)} connectCallback={connectToHost}></Server>
            ))}
        </div>
    )
}