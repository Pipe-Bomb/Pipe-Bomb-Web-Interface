import { useRef, useState } from "react";
import styles from "../styles/LazyImage.module.scss";

interface Props {
    src: string
    className?: string
    onload?: () => void
    onunload?: () => void
    transition?: number
}

export default function LazyImage({ src, className, onload, onunload, transition }: Props) {
    const image = useRef<HTMLImageElement>(null);
    const [loaded, setLoaded] = useState(false);
    
    const anyImage: any = image.current;
    if (anyImage) {
        anyImage.referrerPolicy = "no-referrer";
    }

    function load() {
        setLoaded(true);
        if (onload) onload();
    }

    function unload() {
        setLoaded(false)
        if (onunload) onunload();
    }

    if (transition == undefined) transition = 0.5;

    return (
        <img ref={image} style={{opacity: loaded ? 1 : 0, transition: `opacity ${transition}s`}} className={className + " " + styles.image} src={src} onLoad={load} onLoadStart={unload} />
    )
}