import { useEffect, useRef } from "react";
import styles from "../styles/CastButton.module.scss";
import React from "react";

const CastButton = React.memo(function CastButton() {
    const container = useRef<HTMLDivElement>();

    useEffect(() => {
        if (!container.current) return;
        const castButton = container.current.querySelector("google-cast-launcher");
        if (!castButton) {
            container.current.appendChild(document.createElement("google-cast-launcher"));
        }
    })

    return (
        <div className={styles.container}>
            <div ref={container} className={styles.sizer}></div>
        </div>
    )
});

export default CastButton;