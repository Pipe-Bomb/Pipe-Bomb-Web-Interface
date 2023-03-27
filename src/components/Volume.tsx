import styles from "../styles/Volume.module.scss";
import { MdVolumeUp } from "react-icons/md";
import { Button } from "@nextui-org/react";

export default function Volume() {
    return (
        <div className={styles.container}>
            <Button auto rounded className={styles.roundButton} light>
                <MdVolumeUp />
            </Button>
            <div className={styles.popup}>
                <input type="range" min="0" max="100" />
            </div>
        </div>
    )
}