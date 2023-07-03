import { NotificationInfo } from "./NotificationManager"
import styles from "../styles/Notification.module.scss"
import React from "react";

export interface NotificationProps {
    data: NotificationInfo,
    alive: boolean
}

const Notification = React.memo(function Notification({ data, alive }: NotificationProps) {
    const status = data.status || "normal";

    return (
        <div className={styles.container + (alive ? "" : ` ${styles.inactive}`) + ` ${styles["status-" + status]}`}>
            <div className={styles.content}>
                <span className={styles.text}>{ data.text }</span>
            </div>
        </div>
    )
});

export default Notification;