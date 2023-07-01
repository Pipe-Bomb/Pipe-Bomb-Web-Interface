import Track from "pipebomb.js/dist/music/Track";
import { useEffect, useState } from "react";
import PipeBombConnection from "../logic/PipeBombConnection";

export default function useTrack(trackID: string) {
    const [track, setTrack] = useState<Track | false | null>(null);

    useEffect(() => {
        PipeBombConnection.getInstance().getApi().trackCache.getTrack(trackID)
        .then(setTrack)
        .catch(() => {
            setTrack(false);
        });
    }, [trackID]);

    return track;
}