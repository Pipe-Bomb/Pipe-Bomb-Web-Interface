import TrackList from "pipebomb.js/dist/collection/TrackList";
import styles from "../styles/SquareChart.module.scss";
import { Link } from "react-router-dom";
import { Text } from "@nextui-org/react";

export interface SquareChartProps {
    chart: TrackList
}

export default function SquareChart({ chart }: SquareChartProps) {
    return (
        <div className={styles.container}>
            <Link to={`/charts/${chart.collectionID.split("/").pop()}`} className={styles.link}>
                <div className={styles.title}>
                    <Text h3>{chart.collectionName}</Text>
                </div>
            </Link>
        </div>
    )
}