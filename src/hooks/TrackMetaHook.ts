import Track, { TrackMeta } from "pipebomb.js/dist/music/Track";
import { useEffect, useState } from "react";

export default function useTrackMeta(track?: Track | false) {
    const [meta, setMeta] = useState<TrackMeta | false | null>(null);

    useEffect(() => {
        setMeta(null);

        if (track) {
            track.getMetadata()
            .then(setMeta)
            .catch(() => {
                setMeta(false);
            })
        } else if (track === null) {
            setMeta(null);
        } else {
            setMeta(false);
        }
    }, [track]);

    return meta;
}