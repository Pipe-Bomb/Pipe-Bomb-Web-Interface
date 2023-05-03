import styles from "../styles/Lyric.module.scss"

export interface LyricProps {
    words: string
    active: boolean,
    percent: number
}

export default function Lyric(props: LyricProps) {
    if (!props.active) {
        return (
            <p className={styles.lyric + (props.active ? ` ${styles.activeLyric}` : "")} >
                <span>{ props.words }</span>
            </p>
        )
    }

    const split = props.words.split("");

    const activeLyricCount = Math.round(split.length / 100 * props.percent);

    return (
        <p className={styles.lyric + (props.active ? ` ${styles.activeLyric}` : "")} >
            <span>{ split.splice(0, activeLyricCount).join("") }</span>
            <span className={styles.backgroundLyric}>{ split.join("") }</span>
        </p>
    )
}