import Track from "pipebomb.js/dist/music/Track"

export default interface AudioPlayerStatus {
    paused: boolean,
    time: number,
    duration: number,
    loading: boolean,
    track: Track | null,
    queue: Track[],
    key?: number
}