import { useRef } from "react";
import styles from "../styles/LazyImage.module.scss";

interface Props {
    src: string
    className?: string
}

export default function LazyImage({ src, className }: Props) {
    const image = useRef<HTMLImageElement>(null);
    
    const anyImage: any = image.current;
    anyImage.referrerPolicy = "no-referrer";

    function load() {
        if (image.current) {
            image.current.style.opacity = "1";
        }
    }

    return (
        <img ref={image} className={className + " " + styles.image} src={src} onLoad={load} />
    )
}