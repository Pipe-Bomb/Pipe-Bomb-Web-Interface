import Playlist from "pipebomb.js/dist/collection/Playlist";
import { useEffect, useState } from "react";
import PipeBombConnection from "../logic/PipeBombConnection";
import Axios from "axios";
import styles from "../styles/PlaylistImage.module.scss"
import LazyImage from "./LazyImage";
import { generateMeshGradient } from "meshgrad";
import { Loading } from "@nextui-org/react";

export interface PlaylistImageProps {
    playlist: Playlist
}

const meshes: Map<string, {[key: string]: string}> = new Map();

export default function PlaylistImage({ playlist }: PlaylistImageProps) {
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [loaded, setLoaded] = useState(false);

    function getMesh() {
        const css = (() => {
            let temp = meshes.get(playlist.collectionID);
            if (temp) return temp;

            const properties = generateMeshGradient(30, 'red', parseInt(playlist.collectionID)).split("; ");
            const out: {[key: string]: string} = {};
            for (let property of properties) {
                const split = property.split(":", 2);
                let key = split[0].trim().split("");
                for (let i = 0; i < key.length; i++) {
                    if (key[i] == "-" && i < key.length - 1) {
                        key.splice(i, 1);
                        key[i] = key[i].toUpperCase();
                    }
                }
                const finalKey = key.join("");
                out[finalKey] = split[1].trim();
            }
            meshes.set(playlist.collectionID, out);
            return out;
        })();
        return <div className={styles.mesh} style={css} ></div>;
    }
    
    useEffect(() => {
        setLoaded(false);
        playlist.getTrackList(PipeBombConnection.getInstance().getApi().trackCache)
        .then(tracks => {
            if (!tracks) {
                setImageUrls([]);
                return;
            }
            const checkCount = Math.min(tracks.length, 10);
            if (!checkCount) {
                setLoaded(true);
                return;
            }

            let checked = 0;
            const images: string[] = [];
            for (let i = 0; i < checkCount; i++) {
                Axios.head(tracks[i].getThumbnailUrl()).then(response => {
                    if (checked == -1 || images.length >= 4) return;
                    
                    if (response.status == 200) {
                        images.push(tracks[i].getThumbnailUrl());
                    }
                    if (++checked >= checkCount || images.length >= 4) {
                        checked = -1;
                        setImageUrls(images);
                        if (!images.length) setLoaded(true);
                    }
                }, () => {
                    if (++checked >= checkCount || images.length >= 4) {
                        checked = -1;
                        setImageUrls(images);
                        if (!images.length) setLoaded(true);
                    }
                });
            }
        }).catch(error => {
            console.error(error);
        });
    }, [playlist]);

    let loadedImages = 0;

    function load() {
        loadedImages++;

        let quota = imageUrls.length;
        if (quota < 4 && quota) {
            quota = 1;
        }

        if (loadedImages >= quota) {
            setLoaded(true);
        }
    }

    if (imageUrls.length == 4) { // collage
        return (
            <div className={styles.border}>
                <div className={styles.imageContainer + (loaded ? ` ${styles.loaded}` : "")}>
                    {!loaded && (
                        <div className={styles.loader}>
                            <Loading size="xl" className={styles.loaderIcon} />
                        </div>
                    )}
                    
                    <div className={styles.content}>
                        {imageUrls.map((image, index) => (
                            <LazyImage key={index} className={styles.quarterImage} src={image} onload={load} transition={0} />
                        ))}
                    </div>
                </div>
            </div>
            
        )
    } else if (imageUrls.length > 0) { // single image
        return (
            <div className={styles.border}>
                <div className={styles.imageContainer + (loaded ? ` ${styles.loaded}` : "")}>
                    {!loaded && (
                        <div className={styles.loader}>
                            <Loading size="xl" className={styles.loaderIcon} />
                        </div>
                    )}

                    <div className={styles.content}>
                        <LazyImage className={styles.singleImage} src={imageUrls[0]} onload={load} transition={0} />
                    </div>
                    
                </div>
            </div>
            
        )
    } else { // no image
        return (
            <div className={styles.border}>
                <div className={styles.imageContainer + (loaded ? ` ${styles.loaded}` : "")}>
                    {!loaded && (
                        <div className={styles.loader}>
                            <Loading size="xl" className={styles.loaderIcon} />
                        </div>
                    )}
                    
                    <div className={styles.content}>
                        {getMesh()}
                    </div>
                </div>
            </div>
        )
    }
}