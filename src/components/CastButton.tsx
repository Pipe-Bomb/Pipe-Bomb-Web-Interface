import { useEffect, useRef } from "react";
import styles from "../styles/CastButton.module.scss";

export default function CastButton() {
    const container = useRef<HTMLDivElement>();

    useEffect(() => {
        if (!container.current) return;
        const castButton = container.current.querySelector("google-cast-launcher");
        if (!castButton) {
            container.current.appendChild(document.createElement("google-cast-launcher"));
        }
    })

    return (
        <div ref={container} className={styles.container}>
        
        </div>
    )
}