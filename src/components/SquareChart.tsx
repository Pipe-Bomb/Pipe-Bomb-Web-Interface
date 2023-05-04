import TrackList from "pipebomb.js/dist/collection/TrackList";
import styles from "../styles/SquareChart.module.scss";
import { Link } from "react-router-dom";
import { Text } from "@nextui-org/react";
import LazyImage from "./LazyImage";
import PipeBombConnection from "../logic/PipeBombConnection";

export interface SquareChartProps {
    chart: TrackList
}

export default function SquareChart({ chart }: SquareChartProps) {
    return (
        <div className={styles.container}>
            <Link to={`/charts/${chart.collectionID.split("/").pop()}`} className={styles.link}>
                <div className={styles.imageContainer}>
                    <LazyImage src={PipeBombConnection.getInstance().getUrl() + "/v1/serviceicon/" + chart.service} />
                </div>
                <div className={styles.title}>
                    <Text h3>{chart.getName()}</Text>
                </div>
            </Link>
        </div>
    )
}