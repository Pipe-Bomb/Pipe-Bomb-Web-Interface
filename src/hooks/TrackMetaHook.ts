import Track, { TrackMeta } from "pipebomb.js/dist/music/Track";
import { useEffect, useState } from "react";

export default function useTrackMeta(track?: Track) {
    const [meta, setMeta] = useState<TrackMeta>(null);

    useEffect(() => {
        setMeta(null);

        if (track) {
            track.getMetadata().then(setMeta)
        }
    }, [track]);

    return meta;
}