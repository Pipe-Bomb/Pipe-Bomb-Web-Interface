import { Button, Grid, Loading, Text } from "@nextui-org/react";
import HostInfo from "pipebomb.js/dist/HostInfo";
import styles from "../styles/Server.module.scss";
import { MdLockOutline, MdLockOpen, MdSignalWifiBad, MdRefresh, MdOutlineDelete } from "react-icons/md";
import ServerIndex from "../logic/ServerIndex";

interface Props {
    hostInfo: HostInfo,
    status: "secure" | "insecure" | "offline" | "checking" | "unknown",
    connectCallback: (hostInfo: HostInfo, status: string) => void
}

export default function Server({ hostInfo, status, connectCallback }: Props) {
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
                        <Button auto color="gradient" size="xl" className={styles.button} onPress={() => connectCallback(hostInfo, status)} disabled={!["secure", "insecure"].includes(status)}>Connect</Button>
                    </Grid>
                    <Grid>
                        <Button auto light className={styles.smallButton} onPress={() => ServerIndex.getInstance().checkServer(hostInfo)}><MdRefresh className={styles.buttonIcon} /></Button>
                    </Grid>
                    <Grid>
                        <Button auto light className={styles.smallButton} onPress={() => ServerIndex.getInstance().removeServer(hostInfo.host)}><MdOutlineDelete className={styles.buttonIcon} /></Button>
                    </Grid>
                </Grid.Container>
            </div>
        </div>
    )
}