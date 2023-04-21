import { NotificationInfo } from "./NotificationManager"
import styles from "../styles/Notification.module.scss"

export interface NotificationProps {
    data: NotificationInfo,
    alive: boolean
}

export default function Notification({ data, alive }: NotificationProps) {

    return (
        <div className={styles.container + (alive ? "" : ` ${styles.inactive}`)}>
            <div className={styles.content}>
                <span className={styles.text}>{ data.text }</span>
            </div>
        </div>
    )
}