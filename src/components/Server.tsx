import { Button, Grid, Loading, Text } from "@nextui-org/react";
import HostInfo from "pipebomb.js/dist/HostInfo";
import styles from "../styles/Server.module.scss";
import { MdLockOutline, MdLockOpen, MdSignalWifiBad, MdRefresh, MdOutlineDelete } from "react-icons/md";
import ServerIndex from "../logic/ServerIndex";
import useAuthenticationStatus from "../hooks/AuthenticationStatusHook";
import PipeBombConnection from "../logic/PipeBombConnection";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CustomModal from "./CustomModal";

interface Props {
    hostInfo: HostInfo,
    status: "secure" | "insecure" | "offline" | "checking" | "unknown"
}

export default function Server({ hostInfo, status }: Props) {
    const authState = useAuthenticationStatus();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const innerHTML = (() => {
        switch (status) {
            case "checking":
                return <Loading className={styles.icon} loadingCss={{ $$loadingSize: "50px", $$loadingBorder: "6px"}}></Loading>;
            case "offline":
                return <MdSignalWifiBad className={styles.icon} />
            case "secure":
                return <MdLockOutline className={styles.icon} />
            case "insecure":
                return <MdLockOpen className={styles.icon} />
        }
    })();

    function connect(createIfMissing?: boolean) {
        setModalOpen(false);
        if (!["secure", "insecure"].includes(status) || authState == "loading") return;
        setLoading(true);
        const host = `http${hostInfo.https ? "s" : ""}://${hostInfo.host}`;
        PipeBombConnection.getInstance().setHost(host, createIfMissing)
        .then(() => {
            localStorage.setItem("host", host);
        if (navigate) navigate("/");
        }).catch(e => {
            if (e?.statusCode == 401 && e?.response == "User does not exist") {
                setModalOpen(true);
            } else {
                console.error("failed to connect to", host, e);
            }
        }).finally(() => {
            setLoading(false);
        });
    }

    return (
        <div className={styles.container}>
            <div className={styles.iconContainer}>
                {innerHTML}
            </div>
            <div className={styles.content}>
                <Text h2>{hostInfo.name}</Text>
                <Text h4>{hostInfo.host}</Text>
                <Grid.Container alignItems="center">
                    <Grid>
                        <Button auto color="gradient" size="xl" className={styles.button} onPress={() => connect()} disabled={!["secure", "insecure"].includes(status) || authState == "loading"}>{
                            loading ? (
                                <Loading color="white" />
                            ) : "Connect"
                        }</Button>
                    </Grid>
                    <Grid>
                        <Button auto light className={styles.smallButton} onPress={() => ServerIndex.getInstance().checkServer(hostInfo)}><MdRefresh className={styles.buttonIcon} /></Button>
                    </Grid>
                    <Grid>
                        <Button auto light className={styles.smallButton} onPress={() => ServerIndex.getInstance().removeServer(hostInfo.host)}><MdOutlineDelete className={styles.buttonIcon} /></Button>
                    </Grid>
                </Grid.Container>
            </div>
            <CustomModal title="This is a new server" visible={modalOpen} onClose={() => setModalOpen(false)}>
                <p>Your account has not connected to this server before. Are you sure you want to register with <span className={styles.underline}>{hostInfo.name}</span>?</p>
                <Grid.Container justify="space-evenly">
                    <Grid>
                        <Button color="default" onPress={() => setModalOpen(false)}>Go Back</Button> 
                    </Grid>
                    <Grid>
                        <Button color="success" onPress={() => connect(true)}>Register</Button>
                    </Grid>
                </Grid.Container>
            </CustomModal>
        </div>
    )
}