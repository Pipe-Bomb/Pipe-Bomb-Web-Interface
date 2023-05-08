import GlowEffect from "./GlowEffect";
import styles from "../styles/BackgroundGlow.module.scss"
import useCurrentTrack from "../hooks/CurrentTrackHook";

export default function BackgroundGlow() {
    const currentTrack = useCurrentTrack();

    return (
        <div className={styles.container}>
            <GlowEffect active={true} durationMultiplier={10} spread={40} image={currentTrack?.getThumbnailUrl()} />
        </div>
    )
}