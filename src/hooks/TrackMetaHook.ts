import Track, { TrackMeta } from "pipebomb.js/dist/music/Track";
import { useEffect, useState } from "react";

export default function useTrackMeta(track?: Track | false) {
    const [meta, setMeta] = useState<TrackMeta | false | null>(track ? track.getMetadata() : null);

    useEffect(() => {
        if (track && meta == track.getMetadata() && meta) {
            return;
        }

        setMeta(null);

        if (track) {
            track.loadMetadata()
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