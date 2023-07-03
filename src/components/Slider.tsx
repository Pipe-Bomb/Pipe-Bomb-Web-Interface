import { useRef } from "react"
import styles from "../styles/Slider.module.scss"
import React from "react"

export interface SliderProps {
    min: number
    max: number
    value: number
    onChange: (value: number) => void
    disabled?: boolean
    orientation?: "horizontal" | "vertical"
    length: number
}

const Slider = React.memo(function Slider({ min, max, value, onChange, disabled, orientation, length }: SliderProps) {
    const input = useRef<HTMLInputElement>(null);

    const percentage = (value - min) / (max - min) * 100;

    const css = {
        "--gradient": `linear-gradient(90deg, var(--nextui-colors-primary) 0%, var(--nextui-colors-primary) ${percentage}%, var(--nextui-colors-accents2) ${percentage}%, var(--nextui-colors-accents2) 100%)`,
        "--length": length + "px"
    };

    return (
        <div className={styles.container + " " + styles[orientation || "horizontal"]} style={css as any}>
            <input ref={input} type="range" min={min} max={max} value={value} onInput={e => onChange(parseInt(e.currentTarget.value))} className={disabled ? styles.disabled : styles.enabled} />
        </div>
    )
});

export default Slider;