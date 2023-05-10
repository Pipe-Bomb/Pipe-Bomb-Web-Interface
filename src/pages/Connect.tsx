import ServerIndex from "../logic/ServerIndex";
import { useEffect, useState, useRef } from "react";
import Server from "../components/Server";
import styles from "../styles/Connect.module.scss";
import { Button, Grid, Input, Text } from "@nextui-org/react";
import PipeBombConnection from "../logic/PipeBombConnection";
import HostInfo from "pipebomb.js/dist/HostInfo";
import PlaylistIndex from "../logic/PlaylistIndex";
import { NavigateFunction, useNavigate } from "react-router-dom";
import ServerInfo from "pipebomb.js/dist/ServerInfo";
import Loader from "../components/Loader";
import PublicServer from "../components/PublicServer";

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

    const [registryServers, setRegistryServers] = useState<ServerInfo[] | null | false>(null);

    useEffect(() => {
        serverIndex.registerUpdateCallback(setServers);

        PipeBombConnection.getInstance().getApi().v1.getRegistryServers("https://registry.pipebomb.net")
        .then(setRegistryServers)
        .catch(() => setRegistryServers(false));

        return () => {
            serverIndex.unregisterUpdateCallback(setServers);
        }
    }, []);

    function addServer(url?: string) {
        if (!url) url = value;
        if (!url) return;

        ServerIndex.getInstance().addServer(url);
        setValue("");
    }

    function keyPress(event: React.KeyboardEvent) {
        if (event.key !== "Enter") return;
        addServer();
    }

    function generateRegistryHTML() {
        if (registryServers === false) {
            return (
                <Text h4>Couldn't contact public server registry</Text>
            )
        }

        if (!registryServers) {
            return (
                <div className={styles.loader}>
                    <Loader />
                </div>
            )
        }

        return (
            <div className={styles.publicServers}>
                {registryServers.map((server, index) => (
                    <PublicServer server={server} key={index} connectCallback={host => addServer(host.host)} />
                ))}
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Connect to Server</h1>
            <Grid.Container className={styles.addContainer} alignItems="center" gap={3}>
                <Grid style={{flexGrow: 1}}>
                    <Input ref={input} clearable underlined labelPlaceholder="Server URL" size="xl" fullWidth onKeyDown={keyPress} onChange={e => setValue(e.target.value)} initialValue={value} />
                </Grid>
                <Grid>
                    <Button auto size="lg" bordered onPress={() => addServer()}>Add</Button>
                </Grid>
            </Grid.Container>
            <div className={styles.servers}>
                {servers.map(server => (
                    <Server key={server.host} hostInfo={server} status={serverIndex.getServerStatus(server)} connectCallback={connectToHost}></Server>
                ))}
            </div>
            <Text h2>Public Servers</Text>
            { generateRegistryHTML() }
        </div>
    )
}