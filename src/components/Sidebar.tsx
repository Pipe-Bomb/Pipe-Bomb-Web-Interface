import { useState } from "react";
import Lyrics from "./Lyrics";
import Queue from "./Queue";
import styles from "../styles/Sidebar.module.scss"
import { Button } from "@nextui-org/react";
import { MdOutlineLyrics, MdQueueMusic } from "react-icons/md";
import React from "react";

export interface SidebarProps {
    enabled: boolean
}

const Sidebar = React.memo(function Sidebar({ enabled }: SidebarProps) {
    const [state, setState] = useState("queue");


    function getContents() {
        switch (state) {
            case "lyrics":
                return <Lyrics />
            default:
                return <Queue />
        }
    }

    return (
        <div className={styles.container + (enabled ? "" : ` ${styles.inactive}`)}>
            <div className={styles.widthContainer}>
                <div className={styles.content}>
                    { getContents() }
                </div>
                <div className={styles.buttons}>
                    <Button className={styles.roundButton} light={state != "queue"} auto onPress={() => setState("queue")}><MdQueueMusic /></Button>
                    <Button className={styles.roundButton} light={state != "lyrics"} auto onPress={() => setState("lyrics")}><MdOutlineLyrics /></Button>
                </div>
            </div>
        </div>
    )
});

export default Sidebar;