import { Loading } from "@nextui-org/react"
import styles from "../styles/LoadingPage.module.scss"

export default function LoadingPage() {
    return (
        <div className={styles.container}>
            <Loading size="xl" />
        </div>
    )
}