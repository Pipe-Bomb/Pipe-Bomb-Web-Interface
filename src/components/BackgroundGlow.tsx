import GlowEffect from "./GlowEffect";
import styles from "../styles/BackgroundGlow.module.scss"
import useCurrentTrack from "../hooks/CurrentTrackHook";
import React from "react";

const BackgroundGlow = React.memo(function BackgroundGlow() {
    const currentTrack = useCurrentTrack();

    return (
        <div className={styles.container}>
            <svg viewBox="0 0 2000 2000" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="none" className={styles.grain}>
                <filter id='noiseFilter'>
                    <feTurbulence 
                    type='fractalNoise' 
                    baseFrequency='0.9' 
                    numOctaves='3' 
                    stitchTiles='stitch'/>
                </filter>
                <rect width='100%' height='100%' filter='url(#noiseFilter)'/>
            </svg>
            <GlowEffect active={true} durationMultiplier={10} spread={40} staticBrightness={true} image={currentTrack?.getThumbnailUrl()} />
        </div>
    )
});

export default BackgroundGlow;