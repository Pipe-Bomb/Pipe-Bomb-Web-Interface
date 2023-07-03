import TrackList from "pipebomb.js/dist/collection/TrackList";
import styles from "../styles/SquareChart.module.scss";
import { Link } from "react-router-dom";
import { Text } from "@nextui-org/react";
import ImageWrapper from "./ImageWrapper";
import React from "react";

export interface SquareChartProps {
    chart: TrackList
}

const SquareChart = React.memo(function SquareChart({ chart }: SquareChartProps) {
    return (
        <div className={styles.container}>
            <Link to={`/charts/${chart.collectionID.split("/").pop()}`} className={styles.link}>
                <div className={styles.imageContainer}>
                    <ImageWrapper src={chart.thumbnail} />
                </div>
                <div className={styles.title}>
                    <Text h3>{chart.getName()}</Text>
                </div>
            </Link>
        </div>
    )
});

export default SquareChart;