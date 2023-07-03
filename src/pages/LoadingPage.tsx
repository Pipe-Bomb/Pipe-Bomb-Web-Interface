import { Loading } from "@nextui-org/react"
import styles from "../styles/LoadingPage.module.scss"
import React from "react";

const LoadingPage = React.memo(function LoadingPage() {
    return (
        <div className={styles.container}>
            <Loading size="xl" />
        </div>
    )
});

export default LoadingPage;