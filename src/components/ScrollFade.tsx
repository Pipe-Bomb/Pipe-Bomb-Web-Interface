import styles from "../styles/ScrollFade.module.scss"

export interface ScrollFadeProps {
    children: JSX.Element | JSX.Element[],
    ref?: React.LegacyRef<HTMLDivElement>
}

export default function ScrollFade({ children, ref }: ScrollFadeProps) {
    return (
        <div className={styles.container} ref={ref}>
            { children }
        </div>
    )
}