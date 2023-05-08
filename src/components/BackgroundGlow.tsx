import GlowEffect from "./GlowEffect";
import styles from "../styles/BackgroundGlow.module.scss"

export default function BackgroundGlow() {
    return (
        <div className={styles.container}>
            <GlowEffect active={true} durationMultiplier={10} spread={20} />
        </div>
    )
}