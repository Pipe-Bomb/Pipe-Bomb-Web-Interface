import { useEffect, useRef, useState } from "react";
import styles from "../styles/GlowEffect.module.scss"
import AudioPlayer from "../logic/AudioPlayer";
import { getColorsForImage, getDefaultColors, loadColorsForImage } from "../logic/ImageColorIndex";

export interface GlowEffectProps {
    active: boolean,
    image?: string,
    spread?: number
    children?: JSX.Element | JSX.Element[],
    durationMultiplier?: number
}

export default function GlowEffect(props: GlowEffectProps) {
    const [colorList, setColorList] = useState<string[][] | null>(props.image ? getColorsForImage(props.image) : null);
    const [brightness, setBrightness] = useState(1);
    const container = useRef<HTMLDivElement>(null);

    const durationMultiplier = props.durationMultiplier || 1;

    useEffect(() => {
        setColorList(null);
        loadColorsForImage(props.image).then(setColorList);
    }, [props.image]);

    function loudnessCallback(loudness: number) {
        if (props.active) {
            setBrightness(loudness);
        }
    }

    useEffect(() => {
        if (props.active) {
            AudioPlayer.getInstance().registerLoudnessCallback(loudnessCallback);

            return () => {
                AudioPlayer.getInstance().unregisterLoudnessCallback(loudnessCallback);
            }
        }
    });

    if (!props.active) {
        return (
            <div className={styles.container}>
                <div className={styles.background}>
                    <div className={styles.children}>
                        { props.children }
                    </div>
                </div>
            </div>
        )
    }

    const colors = colorList || getDefaultColors();

    const style: any = {
        "--glowEffect-offset": -(props.spread ?? 0) + "px",
        "--glowEffect-spread": (props.spread ?? 0) + "px"
    }

    return (
        <div className={styles.container} style={style} ref={container}>
            <div className={styles.background}>
                <div className={styles.children}>
                    { props.children }
                </div>
            </div>
            <div className={styles.glow} style={{opacity: brightness}}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={styles.svg}>
                    <defs>
                        <radialGradient id="Gradient1" cx="50%" cy="50%" fx="0.441602%" fy="50%" r=".5"><animate attributeName="fx" dur={durationMultiplier * 34 + "s"} values="0%;3%;0%" repeatCount="indefinite"></animate><stop offset="0%" stopColor={colors[0 % colors.length][0]}></stop><stop offset="100%" stopColor={colors[0 % colors.length][1]}></stop></radialGradient>
                        <radialGradient id="Gradient2" cx="50%" cy="50%" fx="2.68147%" fy="50%" r=".5"><animate attributeName="fx" dur={durationMultiplier * 23.5 + "s"} values="0%;3%;0%" repeatCount="indefinite"></animate><stop offset="0%" stopColor={colors[1 % colors.length][0]}></stop><stop offset="100%" stopColor={colors[1 % colors.length][1]}></stop></radialGradient>
                        <radialGradient id="Gradient3" cx="50%" cy="50%" fx="0.836536%" fy="50%" r=".5"><animate attributeName="fx" dur={durationMultiplier * 21.5 + "s"} values="0%;3%;0%" repeatCount="indefinite"></animate><stop offset="0%" stopColor={colors[2 % colors.length][0]}></stop><stop offset="100%" stopColor={colors[2 % colors.length][1]}></stop></radialGradient>
                        <radialGradient id="Gradient4" cx="50%" cy="50%" fx="4.56417%" fy="50%" r=".5"><animate attributeName="fx" dur={durationMultiplier * 23 + "s"} values="0%;5%;0%" repeatCount="indefinite"></animate><stop offset="0%" stopColor={colors[3 % colors.length][0]}></stop><stop offset="100%" stopColor={colors[3 % colors.length][1]}></stop></radialGradient>
                        <radialGradient id="Gradient5" cx="50%" cy="50%" fx="2.65405%" fy="50%" r=".5"><animate attributeName="fx" dur={durationMultiplier * 24.5 + "s"} values="0%;5%;0%" repeatCount="indefinite"></animate><stop offset="0%" stopColor={colors[4 % colors.length][0]}></stop><stop offset="100%" stopColor={colors[4 % colors.length][1]}></stop></radialGradient>
                        <radialGradient id="Gradient6" cx="50%" cy="50%" fx="0.981338%" fy="50%" r=".5"><animate attributeName="fx" dur={durationMultiplier * 25.5 + "s"} values="0%;5%;0%" repeatCount="indefinite"></animate><stop offset="0%" stopColor={colors[5 % colors.length][0]}></stop><stop offset="100%" stopColor={colors[5 % colors.length][1]}></stop></radialGradient>
                    </defs>
                    <rect x="13.744%" y="1.18473%" width="100%" height="100%" fill="url(#Gradient1)" transform="rotate(334.41 50 50)"><animate attributeName="x" dur={durationMultiplier * 20 + "s"} values="25%;0%;25%" repeatCount="indefinite"></animate><animate attributeName="y" dur="21s" values="0%;25%;0%" repeatCount="indefinite"></animate><animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur={durationMultiplier * 7 + "s"} repeatCount="indefinite"></animateTransform></rect>
                    <rect x="-2.17916%" y="35.4267%" width="100%" height="100%" fill="url(#Gradient2)" transform="rotate(255.072 50 50)"><animate attributeName="x" dur={durationMultiplier * 23 + "s"} values="-25%;0%;-25%" repeatCount="indefinite"></animate><animate attributeName="y" dur="24s" values="0%;50%;0%" repeatCount="indefinite"></animate><animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur={durationMultiplier * 12 + "s"} repeatCount="indefinite"></animateTransform></rect>
                    <rect x="9.00483%" y="14.5733%" width="100%" height="100%" fill="url(#Gradient3)" transform="rotate(139.903 50 50)"><animate attributeName="x" dur={durationMultiplier * 25 + "s"} values="0%;25%;0%" repeatCount="indefinite"></animate><animate attributeName="y" dur="12s" values="0%;25%;0%" repeatCount="indefinite"></animate><animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur={durationMultiplier * 9 + "s"} repeatCount="indefinite"></animateTransform></rect>
                </svg>
            </div>
        </div>
    )
}