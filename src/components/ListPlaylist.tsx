import { Link } from "react-router-dom";
import styles from "../styles/ListPlaylist.module.scss";
import ImageWrapper from "./ImageWrapper";
import { Text } from "@nextui-org/react"

export interface ListPlaylistProps {
    url: string,
    title: string,
    subtitle: string,
    image?: string
}

export default function ListPlaylist(props: ListPlaylistProps) {
    return (
        <div className={styles.container}>
            <Link to={props.url} className={styles.link}>
                <div className={styles.imageContainer}>
                    <ImageWrapper src={props.image} />
                </div>
                <div className={styles.info}>
                    <Text h3 className={styles.title}>{props.title}</Text>
                    <span className={styles.subtitle}>{props.subtitle}</span>
                </div>
            </Link>
        </div>
    )
}