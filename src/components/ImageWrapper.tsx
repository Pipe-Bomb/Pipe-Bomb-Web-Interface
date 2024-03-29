import { useEffect, useRef, useState } from "react";
import styles from "../styles/ImageWrapper.module.scss"
import { Loading } from "@nextui-org/react";
import React from "react";

export interface ImageWrapperProps {
    src: string,
    fallback?: string,
    loadingSize?: "xs" | "sm" | "md" | "lg" | "xl"
}

const ImageWrapper = React.memo(function ImageWrapper({src, fallback, loadingSize}: ImageWrapperProps) {
    const image = useRef<HTMLImageElement>(null);
    const [loading, setLoading] = useState(true);
    const [activeSrc, setActiveSrc] = useState("");

    useEffect(() => {
        if (!image.current) return;

        image.current.src = src;
        setActiveSrc(image.current.src);
    }, [src]);

    function loadError() {
        if (!image.current) return;
        const newSrc = fallback || "/no-album-art.png";
        setActiveSrc(newSrc);
    }

    function loadSuccess() {
        setLoading(false);
        if (!image.current) return;
        setActiveSrc(image.current.src);
    }

    return (
        <div className={styles.container + (loading ? ` ${styles.loadingContainer}` : "")}>
            {loading && (
                <Loading className={styles.loading} size={loadingSize || "xl"} />
            )}
            
            <img ref={image} className={styles.image} src={activeSrc} onLoadStart={() => setLoading(true)} onError={loadError} onLoad={loadSuccess} />
        </div>
        
    )
});

export default ImageWrapper;