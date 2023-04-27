import Track, { TrackMeta } from "pipebomb.js/dist/music/Track";

export function convertArrayToString(items: string[]) {
    let out = "";
    for (let i = 0; i < items.length; i++) {
        if (i > 0) {
            if (i == items.length - 2) {
                out += " & ";
            } else {
                out += ", ";
            }
        }
        out += items[i];
    }
    return out;
}

export function formatTime(time: number) {
    let seconds: number | string = Math.floor(time);
    let minutes: number | string = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    let hours = Math.floor(minutes / 60);
    minutes -= hours * 60;

    if (seconds < 10) seconds = "0" + seconds;
    if (hours) {
        if (minutes < 10) minutes = "0" + minutes;
        return `${hours}:${minutes}:${seconds}`;
    }
    return `${minutes}:${seconds}`;
}

export function shuffle<Type>(array: Type[]) {
    const dupe = Array.from(array);
    let currentIndex = dupe.length,  randomIndex;
  
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [dupe[currentIndex], dupe[randomIndex]] = [dupe[randomIndex], dupe[currentIndex]];
    }
  
    return dupe;
}

export function removeProtocol(url: string) {
    const remove = ["http://", "https://"];
    for (let protocol of remove) {
        if (url.toLowerCase().startsWith(protocol)) {
            url = url.substring(protocol.length);
            return url;
        }
    }
    return url;
}

export async function downloadFile(url: string, filename: string) {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(link.href);
}

export function downloadAsFile(contents: string, filename: string) {
    var link = document.createElement("a");
    link.href = "data:text/plain;charset=utf-8," + encodeURIComponent(contents);
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(link.href);
}

export function generateHash(seed?: string | number) {
    function nextHash(a: number) { 
        return function() {
          var t = a += 0x6D2B79F5;
          t = Math.imul(t ^ t >>> 15, t | 1);
          t ^= t + Math.imul(t ^ t >>> 7, t | 61);
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }

    function generate(seed: string) {
        var hash = 0, i, chr;
        if (seed.length === 0) return hash;
        for (i = 0; i < seed.length; i++) {
            chr = seed.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        return hash;
    }

    const anySeed: any = seed;
    let numberSeed: number;

    if (!seed) {
        seed = "";
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 20; i++) {
            seed += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        numberSeed = generate(seed);
    } else if (isNaN(anySeed) || parseInt(anySeed) != parseFloat(anySeed)) {
        seed = seed.toString().substring(0, 20);
        while (seed.length < 20) seed += "0";
        numberSeed = generate(seed.toString());
    } else {
        numberSeed = parseInt(anySeed);
    }

    return nextHash(numberSeed);
}

export function convertTracklistToM3u(pipeBombUrl: string, tracks: Track[], m3u8: boolean, download?: boolean) {
    return new Promise<string>(async (resolve) => {
        const trackList = Array.from(tracks);
        const originalTrackList = Array.from(tracks);
        const trackListLength = trackList.length;
        const trackMetas: TrackMeta[] = Array(tracks.length).fill(null);
        let loadedCount = 0;
    
        function loadTrackMeta(index: number, track: Track) {
            track.getMetadata()
            .then(meta => {
                trackMetas[index] = meta;
            }).catch(e => {
                console.error("failed to get meta for track", track.trackID);
            }).finally(() => {
                if (++loadedCount >= trackListLength) {
    
                    const lines: string[] = [];
    
                    if (m3u8) {
                        lines.push("#EXTM3U", "#EXT-X-VERSION:3");
                        for (let i = 0; i < trackListLength; i++) {
                            if (trackMetas[i]) {
                                lines.push(`#EXTINF:-1,${convertArrayToString(trackMetas[i].artists)} - ${trackMetas[i].title}`)
                                lines.push(`#EXT-X-THUMBNAIL:${originalTrackList[i].getThumbnailUrl()}`);
                                lines.push(originalTrackList[i].getAudioUrl());
                            }
                        }
                        lines.push("#EXT-X-ENDLIST");
                    } else {
                        lines.push("#EXTM3U");
                        for (let i = 0; i < trackListLength; i++) {
                            if (trackMetas[i]) {
                                lines.push(`#EXTINF:-1,${convertArrayToString(trackMetas[i].artists)} - ${trackMetas[i].title}`)
                                lines.push(originalTrackList[i].getAudioUrl());
                            }
                        }
                    }
                    const out = lines.join("\n");
                    resolve(out);

                    if (download) {
                        downloadAsFile(out, "Pipe Bomb Playlist.m3u" + (m3u8 ? "8" : ""));
                    }
                } else {
                    const newTrack = trackList.shift();
                    if (newTrack) {
                        loadTrackMeta(trackListLength - trackList.length - 1, newTrack);
                    }
                }
            });
        }
    
        for (let i = 0; i < 10; i++) {
            const track = trackList.shift();
            if (!track) break;
            loadTrackMeta(i, track);
        }
    });
}

export function wait(milliseconds: number) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

export function generateNumberHash(input: string) {
    let hash = 0;
    if (!input.length) return 0;

    for (let i = 0; i < input.length; i++) {
        let chr = input.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

export function generateRandomString(length: number) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}