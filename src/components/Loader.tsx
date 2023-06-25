import { Loading } from "@nextui-org/react";
import styles from "../styles/Loader.module.scss";
import React from "react";

interface Props {
    text?: string
}

const Loader = React.memo(function Loader({ text }: Props) {
    return (
        <div className={styles.loading}>
            <Loading color="primary" size="xl" className={styles.text}>{text}</Loading>
        </div>
    )
});

export default Loader;