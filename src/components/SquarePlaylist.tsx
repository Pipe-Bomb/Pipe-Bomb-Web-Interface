import styles from "../styles/SquarePlaylist.module.scss";
import { useState, useEffect } from "react";
import PipeBombConnection from "../logic/PipeBombConnection";
import { Link } from "react-router-dom";
import { Text } from "@nextui-org/react";
import { generateMeshGradient } from 'meshgrad';
import LazyImage from "./LazyImage";
import Playlist from "pipebomb.js/dist/collection/Playlist";
import Axios from "axios";

interface Props {
    playlist: Playlist
}

const meshes: Map<string, {[key: string]: string}> = new Map();

export default function SquarePlaylist({ playlist }: Props) {
    const [imageUrls, setImageUrls] = useState<string[]>([]);

    useEffect(() => {
        playlist.getTrackList(PipeBombConnection.getInstance().getApi().trackCache)
        .then(tracks => {
            if (!tracks) {
                setImageUrls([]);
                return;
            }
            const checkCount = Math.min(tracks.length, 10);
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
                    }
                }, () => {
                    if (++checked >= checkCount || images.length >= 4) {
                        checked = -1;
                        setImageUrls(images);
                    }
                });
            }
        }).catch(error => {
            console.error(error);
        });
    }, []);

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
        return <div className={styles.singleImage} style={css} ></div>;
    }

    function generateImageHTML() {
        if (imageUrls.length == 4) { // collage
            return (
                <div className={styles.imageContainer}>
                    {getMesh()}
                    {imageUrls.map((image, index) => (
                        <LazyImage key={index} className={styles.quarterImage} src={image} />
                    ))}
                </div>
            )
        } else if (imageUrls.length > 0) { // single image
            return (
                <div className={styles.imageContainer}>
                    {getMesh()}
                    <LazyImage className={styles.singleImage} src={imageUrls[0]} />
                </div>
            )
        } else { // no image
            

            return <div className={styles.imageContainer}>
                {getMesh()}
            </div>
        }
    }

    return (
        <div className={styles.container}>
            <Link to={`/playlist/${playlist.collectionID}`} className={styles.link}>
                {generateImageHTML()}
                <div className={styles.title}>
                    <Text h3>{playlist.getName()}</Text>
                </div>
            </Link>
        </div>
    )
}