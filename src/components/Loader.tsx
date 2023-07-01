import { Loading } from "@nextui-org/react";
import styles from "../styles/Loader.module.scss";

interface Props {
    text?: string
}

export default function Loader({ text }: Props) {
    return (
        <div className={styles.loading}>
            <Loading color="primary" size="xl" className={styles.text}>{text}</Loading>
        </div>
    )
}