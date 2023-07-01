import { useRef } from "react"
import styles from "../styles/Slider.module.scss"

export interface SliderProps {
    min: number
    max: number
    value: number
    onChange: (value: number) => void
    disabled?: boolean
    orientation?: "horizontal" | "vertical"
    length: number
}

export default function Slider(props: SliderProps) {
    const input = useRef<HTMLInputElement>(null);

    const percentage = (props.value - props.min) / (props.max - props.min) * 100;

    const css = {
        "--gradient": `linear-gradient(90deg, var(--nextui-colors-primary) 0%, var(--nextui-colors-primary) ${percentage}%, var(--nextui-colors-accents2) ${percentage}%, var(--nextui-colors-accents2) 100%)`,
        "--length": props.length + "px"
    };

    return (
        <div className={styles.container + " " + styles[props.orientation || "horizontal"]} style={css as any}>
            <input ref={input} type="range" min={props.min} max={props.max} value={props.value} onInput={e => props.onChange(parseInt(e.currentTarget.value))} className={props.disabled ? styles.disabled : styles.enabled} />
        </div>
    )
}