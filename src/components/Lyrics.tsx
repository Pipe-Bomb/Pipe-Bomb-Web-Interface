import { useEffect, useRef, useState } from "react";
import useCurrentTrack from "../hooks/CurrentTrackHook"
import { Lyrics as PipeBombLyrics } from "pipebomb.js/dist/music/Track";
import usePlayerUpdate from "../hooks/PlayerUpdateHook";
import styles from "../styles/Lyrics.module.scss"
import AudioPlayer from "../logic/AudioPlayer";
import Loader from "./Loader";

export default function Lyrics() {
    const track = useCurrentTrack();
    const [lyrics, setLyrics] = useState<PipeBombLyrics | null | false>(null);
    const [activeLyric, setActiveLyric] = useState(-1);
    const scrollRef = useRef<HTMLDivElement>(null);

    const audioStatus = usePlayerUpdate({
        currentTime: true
    });

    useEffect(() => {
        setLyrics(null);
        if (track) {
            track.getLyrics().then(newLyrics => {
                if (!newLyrics) {
                    return setLyrics(false);
                }

                newLyrics.lyrics.unshift({
                    time: 0,
                    words: ""
                });
                setLyrics(newLyrics);
            });
        }
    }, [track]);

    useEffect(() => {
        if (!lyrics || !lyrics.synced) return setActiveLyric(-1);
        
        for (let i = 0; i < lyrics.lyrics.length; i++) {
            const checkingLyric = lyrics.lyrics[i];
            if (audioStatus.currentTime < checkingLyric.time - 1) {
                setActiveLyric(i - 1);
                return;
            }
        }
        setActiveLyric(lyrics.lyrics.length - 1);
    }, [audioStatus]);

    useEffect(() => {
        if (!scrollRef.current) return;

        const activeElement: HTMLParagraphElement = scrollRef.current.querySelector(`[data-index="${activeLyric}"]`);
        if (activeElement) {
            const currentScroll = scrollRef.current.parentElement.scrollTop;
            const scrollTarget = activeElement.offsetTop - scrollRef.current.parentElement.clientHeight / 2;

            scrollRef.current.parentElement.scrollTo({
                top: scrollTarget,
                behavior: currentScroll ? "smooth" : undefined
            });
        }
    }, [activeLyric]);

    useEffect(() => {
        setTimeout(() => {
            if (!scrollRef.current) return;
            scrollRef.current.parentElement.scrollTo({
                top: 0
            });
        });
    }, []);

    if (!track) {
        return (
            <>
                <h1>Lyrics</h1>
                <h3>Play a track to view its lyrics.</h3>
            </>
        )
    }

    if (lyrics === null) {
        return (
            <>
                <h1>Lyrics</h1>
                <Loader text="Loading lyrics..." />
            </>
        )
    }

    if (!lyrics) {
        return (
            <>
                <h1>Lyrics</h1>
                <h3>We couldn't find any lyrics for this track.</h3>
            </>
        )
    }

    function lyricScroll(time: number) {
        AudioPlayer.getInstance().audio.activeType.seek(time);
    }

    function generateLyrics() {
        if (!lyrics) return null;

        if (lyrics.synced) {
            return lyrics.lyrics.map((lyric, index) => (
                <p key={index} className={styles.lyric + (index == activeLyric ? ` ${styles.activeLyric}` : "")} data-index={index} onClick={() => lyricScroll(lyric.time)}>{ lyric.words }</p>
            ));
        }

        return lyrics.lyrics.map((lyric, index) => (
            <p key={index} className={styles.lyric} data-index={index}>{ lyric.words }</p>
        ))
    }

    return (
        <div className={styles.container}>
            <h1>Lyrics</h1>
            {!lyrics.synced && (
                <h4>These lyrics aren't synced with the track.</h4>
            )}
            
            <div className={styles.fadeContainer + (lyrics.synced ? ` ${styles.synced}` : "")}>
                <div className={styles.mainContainer}>
                    <div className={styles.scrollContainer} ref={scrollRef}>
                        { generateLyrics() }
                    </div>
                </div>
            </div>
        </div>
    )
}