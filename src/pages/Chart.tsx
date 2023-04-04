import { useParams } from "react-router-dom";
import AudioPlayer from "../logic/AudioPlayer";
import TrackList from "pipebomb.js/dist/collection/TrackList";
import { useEffect, useState } from "react";
import ChartIndex from "../logic/ChartIndex";
import Loader from "../components/Loader";
import { Button, Grid, Text } from "@nextui-org/react";
import { shuffle } from "../logic/Utils";
import styles from "../styles/Chart.module.scss";
import { MdPlayArrow, MdShuffle } from "react-icons/md";
import ListTrack from "../components/ListTrack";
import NumberWrapper from "../components/NumberWrapper";
import Track from "pipebomb.js/dist/music/Track";

export default function Chart() {
    let paramID: any = useParams().chartID;
    const audioPlayer = AudioPlayer.getInstance();
    const [chart, setChart] = useState<TrackList | null>(null);
    const [trackList, setTrackList] = useState<Track[] | null>();
    
    useEffect(() => {
        ChartIndex.getInstance().getChart(paramID)
        .then(chart => {
            if (!chart) {
                console.error("invalid chart!");
            } else {
                setChart(chart);
                const newTrackList = chart.getTrackList();
                if (newTrackList) {
                    setTrackList(newTrackList);
                } else {
                    console.log("NOT TRACK LSIT!!!");
                }
            }
        });
    }, []);

    if (!chart || !trackList) {
        return <Loader text="Loading..."></Loader>
    }

    function playChart() {
        if (!trackList) return;
        audioPlayer.addToQueue(trackList, 0);
        audioPlayer.nextTrack();
    }

    function shuffleChart() {
        if (!trackList) return;
        audioPlayer.addToQueue(shuffle(trackList), 0);
        audioPlayer.nextTrack();
    }

    return (
        <>
            <Text h1>{chart.collectionName}</Text>
            <Grid.Container gap={2} alignItems="center" className={styles.top}>
                <Grid>
                    <Button size="xl" auto onPress={playChart} className={styles.roundButton} color="gradient"><MdPlayArrow /></Button>
                </Grid>
                <Grid>
                    <Button size="lg" auto onPress={shuffleChart} className={styles.roundButton} bordered><MdShuffle /></Button>
                </Grid>
            </Grid.Container>
            {trackList.map((track, index) => (
                <NumberWrapper key={index} number={index + 1}>
                    <ListTrack track={track} />
                </NumberWrapper>
            ))}
        </>
    )
}