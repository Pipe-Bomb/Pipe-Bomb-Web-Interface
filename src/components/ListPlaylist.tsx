import { Link } from "react-router-dom";
import styles from "../styles/ListPlaylist.module.scss";
import ImageWrapper from "./ImageWrapper";
import { Text } from "@nextui-org/react"
import React from "react";

export interface ListPlaylistProps {
    url: string,
    title: string,
    subtitle: string,
    image?: string
}

const ListPlaylist = React.memo(function ListPlaylist({ url, title, subtitle, image }: ListPlaylistProps) {
    return (
        <div className={styles.container}>
            <Link to={url} className={styles.link}>
                <div className={styles.imageContainer}>
                    <div className={styles.image}>
                        <ImageWrapper src={image} />
                    </div>
                </div>
                <div className={styles.info}>
                    <Text h3 className={styles.title}>{title}</Text>
                    <span className={styles.subtitle}>{subtitle}</span>
                </div>
            </Link>
        </div>
    )
});

export default ListPlaylist;