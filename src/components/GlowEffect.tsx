import { useEffect, useState } from "react";
import styles from "../styles/GlowEffect.module.scss"
import { extractColors } from "extract-colors";
import AudioPlayer from "../logic/AudioPlayer";

export interface GlowEffectProps {
    active: boolean,
    image?: string
}

const defaultColors = [
    [
        "rgba(255, 0, 255, 1)",
        "rgba(255, 0, 255, 0)"
    ],
    [
        "rgba(255, 255, 0, 1)",
        "rgba(255, 255, 0, 0)"
    ],
    [
        "rgba(0, 255, 255, 1)",
        "rgba(0, 255, 255, 0)"
    ],
    [
        "rgba(0, 255, 0, 1)",
        "rgba(0, 255, 0, 0)"
    ],
    [
        "rgba(0, 0, 255, 1)",
        "rgba(0, 0, 255, 0)"
    ],
    [
        "rgba(255,0,0, 1)",
        "rgba(255,0,0, 0)"
    ]
];

export default function GlowEffect(props: GlowEffectProps) {
    const [colorList, setColorList] = useState<string[][] | null>(null);
    const [brightness, setBrightness] = useState(1);

    useEffect(() => {
        setColorList(null);
        const img = new Image();

        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;

            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            extractColors(imageData)
            .then(colors => {
                interface ColorWrapper {
                    strings: string[],
                    saturation: number
                };

                const colorWrappers: ColorWrapper[] = colors.map(color => {
                    return {
                        saturation: color.saturation,
                        strings: [
                            `rgba(${color.red}, ${color.green}, ${color.blue}, 1)`,
                            `rgba(${color.red}, ${color.green}, ${color.blue}, 0)`
                        ]
                    };
                });

                

                colorWrappers.sort((a, b) => {
                    if (a.saturation > b.saturation) {
                      return -1;
                    }
                    if (a.saturation < b.saturation){
                      return 1;
                    }
                    return 0;
                });

                setColorList(colorWrappers.map(color => color.strings));
            }).catch(e => {
                console.error(e);
            });
        }

        img.crossOrigin = "anonymous";
        img.src = props.image;   
    }, [props.image]);

    useEffect(() => {
        if (props.active) {
            AudioPlayer.getInstance().registerLoudnessCallback(setBrightness);

            return () => {
                AudioPlayer.getInstance().unregisterLoudnessCallback(setBrightness);
            }
        }
    });

    if (!props.active) {
        return null;
    }

    const colors = colorList || defaultColors;

    return (
        <div className={styles.container} style={{opacity: brightness}}>
            <div className={styles.animationContainer}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={styles.svg}>
                    <defs>
                        <radialGradient id="Gradient1" cx="50%" cy="50%" fx="0.441602%" fy="50%" r=".5"><animate attributeName="fx" dur="34s" values="0%;3%;0%" repeatCount="indefinite"></animate><stop offset="0%" stopColor={colors[0 % colors.length][0]}></stop><stop offset="100%" stopColor={colors[0 % colors.length][1]}></stop></radialGradient>
                        <radialGradient id="Gradient2" cx="50%" cy="50%" fx="2.68147%" fy="50%" r=".5"><animate attributeName="fx" dur="23.5s" values="0%;3%;0%" repeatCount="indefinite"></animate><stop offset="0%" stopColor={colors[1 % colors.length][0]}></stop><stop offset="100%" stopColor={colors[1 % colors.length][1]}></stop></radialGradient>
                        <radialGradient id="Gradient3" cx="50%" cy="50%" fx="0.836536%" fy="50%" r=".5"><animate attributeName="fx" dur="21.5s" values="0%;3%;0%" repeatCount="indefinite"></animate><stop offset="0%" stopColor={colors[2 % colors.length][0]}></stop><stop offset="100%" stopColor={colors[2 % colors.length][1]}></stop></radialGradient>
                        <radialGradient id="Gradient4" cx="50%" cy="50%" fx="4.56417%" fy="50%" r=".5"><animate attributeName="fx" dur="23s" values="0%;5%;0%" repeatCount="indefinite"></animate><stop offset="0%" stopColor={colors[3 % colors.length][0]}></stop><stop offset="100%" stopColor={colors[3 % colors.length][1]}></stop></radialGradient>
                        <radialGradient id="Gradient5" cx="50%" cy="50%" fx="2.65405%" fy="50%" r=".5"><animate attributeName="fx" dur="24.5s" values="0%;5%;0%" repeatCount="indefinite"></animate><stop offset="0%" stopColor={colors[4 % colors.length][0]}></stop><stop offset="100%" stopColor={colors[4 % colors.length][1]}></stop></radialGradient>
                        <radialGradient id="Gradient6" cx="50%" cy="50%" fx="0.981338%" fy="50%" r=".5"><animate attributeName="fx" dur="25.5s" values="0%;5%;0%" repeatCount="indefinite"></animate><stop offset="0%" stopColor={colors[5 % colors.length][0]}></stop><stop offset="100%" stopColor={colors[5 % colors.length][1]}></stop></radialGradient>
                    </defs>
                    {/* <rect x="0" y="0" width="100%" height="100%" fill="url(#Gradient4)">
                    <animate attributeName="x" dur="20s" values="25%;0%;25%" repeatCount="indefinite" />
                    <animate attributeName="y" dur="21s" values="0%;25%;0%" repeatCount="indefinite" />
                    <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="17s" repeatCount="indefinite"/>
                    </rect>
                    <rect x="0" y="0" width="100%" height="100%" fill="url(#Gradient5)">
                    <animate attributeName="x" dur="23s" values="0%;-25%;0%" repeatCount="indefinite" />
                    <animate attributeName="y" dur="24s" values="25%;-25%;25%" repeatCount="indefinite" />
                    <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="18s" repeatCount="indefinite"/>
                    </rect>
                    <rect x="0" y="0" width="100%" height="100%" fill="url(#Gradient6)">
                    <animate attributeName="x" dur="25s" values="-25%;0%;-25%" repeatCount="indefinite" />
                    <animate attributeName="y" dur="26s" values="0%;-25%;0%" repeatCount="indefinite" />
                    <animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur="19s" repeatCount="indefinite"/>
                    </rect> */}
                    <rect x="13.744%" y="1.18473%" width="100%" height="100%" fill="url(#Gradient1)" transform="rotate(334.41 50 50)"><animate attributeName="x" dur="20s" values="25%;0%;25%" repeatCount="indefinite"></animate><animate attributeName="y" dur="21s" values="0%;25%;0%" repeatCount="indefinite"></animate><animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="7s" repeatCount="indefinite"></animateTransform></rect>
                    <rect x="-2.17916%" y="35.4267%" width="100%" height="100%" fill="url(#Gradient2)" transform="rotate(255.072 50 50)"><animate attributeName="x" dur="23s" values="-25%;0%;-25%" repeatCount="indefinite"></animate><animate attributeName="y" dur="24s" values="0%;50%;0%" repeatCount="indefinite"></animate><animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="12s" repeatCount="indefinite"></animateTransform></rect>
                    <rect x="9.00483%" y="14.5733%" width="100%" height="100%" fill="url(#Gradient3)" transform="rotate(139.903 50 50)"><animate attributeName="x" dur="25s" values="0%;25%;0%" repeatCount="indefinite"></animate><animate attributeName="y" dur="12s" values="0%;25%;0%" repeatCount="indefinite"></animate><animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur="9s" repeatCount="indefinite"></animateTransform></rect>
                </svg>
            </div>
        </div>
    )
}