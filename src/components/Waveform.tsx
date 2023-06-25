import { useEffect, useRef, useState } from "react";
import styles from "../styles/Waveform.module.scss"
import { lerp } from "../logic/Utils";
import React from "react";


export interface WaveformProps {
    url?: string | null,
    active?: boolean,
    percent: number,
    segments?: number
}

const anyWindow: any = window;
window.AudioContext = window.AudioContext || anyWindow.webkitAudioContext;

const Waveform = React.memo(function Waveform({ url, active, percent, segments }: WaveformProps) {
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer>(null);
    const [currentBuffer, setCurrentBuffer] = useState<null | number[]>(null);
    const loaded = useRef(false);
    const canvas = useRef(null);
    const currentLerp = useRef<() => number>(() => 0);
    const currentUrl = useRef(url);

    if (!segments) {
        segments = 100;
    }

    useEffect(() => {
        if (!audioBuffer) {
            draw(null, active ? 1 : 0);
            return;
        }

        const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
        const samples = segments; // Number of samples we want to have in our final data set
        const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
        const filteredData = [];
        for (let i = 0; i < samples; i++) {
            let blockStart = blockSize * i; // the location of the first sample in the block
            let sum = 0;
            for (let j = 0; j < blockSize; j++) {
                sum = sum + Math.abs(rawData[blockStart + j]) // find the sum of all the samples in the block
            }
            filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
        }

        const normalized = normalizeData(filteredData);
        setCurrentBuffer(normalized);
        loaded.current = true;

        currentLerp.current();

        if (active) {
            const end = active ? 1 : 0;

            currentLerp.current = lerp(0, end, 50, value => {
                draw(normalized, value);
            });
        } else {
            draw(normalized, 0);
        }
    }, [audioBuffer, segments]);

    function normalizeData(filteredData: number[]) {
        const multiplier = Math.pow(Math.max(...filteredData), -1);
        return filteredData.map(n => n * multiplier);
    }

    function draw(normalizedData: number[], stage: number) {
        const anyCanvas: any = canvas.current;
        const newCanvas: HTMLCanvasElement = anyCanvas;
        if (!newCanvas) return;

        const dpr = window.devicePixelRatio || 1;
        newCanvas.width = newCanvas.offsetWidth * dpr;
        newCanvas.height = newCanvas.offsetHeight * dpr;
        const ctx = newCanvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, newCanvas.width, newCanvas.height);
        ctx.scale(dpr, dpr);

        if (stage) {
            const singleWidth = newCanvas.width / dpr / segments;
            const height = newCanvas.height / dpr - 2;

            if (!loaded.current) {
                for (let i = 0; i < segments; i++) {
                    ctx.strokeStyle = "#fff";
                    ctx.beginPath();
                    const singleHeight = newCanvas.height / dpr * (1 - Math.pow(Math.sin(i / 3) / 10 + 0.6, 1.5));
                    const newHeight = (height - singleHeight);
                    ctx.fillStyle = "#121212";
                    ctx.rect(i * singleWidth + 3, singleHeight + 3 + (newHeight * (1 - stage)), singleWidth - 4, newHeight * stage);
                    ctx.fill();
                }

                ctx.beginPath();
                ctx.fillStyle = "#fff";

                for (let i = 0; i < segments; i++) {
                    const singleHeight = newCanvas.height / dpr * (1 - Math.pow(Math.sin(i / 3) / 10 + 0.6, 1.5));
                    const newHeight = (height - singleHeight);
                    ctx.rect(i * singleWidth, Math.min(singleHeight + (newHeight * (1 - stage)), height), singleWidth - 4, newHeight * stage);
                    
                }
                ctx.fill();
                ctx.clip();
                const color = getComputedStyle(document.documentElement).getPropertyValue("--nextui-colors-primary");
                ctx.fillStyle = color;
                ctx.fillRect(0, 0, newCanvas.width / dpr / 100 * percent, newCanvas.height / dpr);
            } else {
                for (let i = 0; i < normalizedData.length; i++) {
                    ctx.beginPath();
                    const singleHeight = newCanvas.height / dpr * (1 - Math.pow(normalizedData[i], 1.5));
                    const newHeight = (height - singleHeight);

                    ctx.fillStyle = "#121212";
                    ctx.rect(i * singleWidth + 3, Math.min(singleHeight + 3 + (newHeight * (1 - stage)), height + 3), singleWidth - 4, newHeight * stage);
                    ctx.fill();
    
                    
                }

                ctx.beginPath();
                ctx.fillStyle = "#fff";

                for (let i = 0; i < normalizedData.length; i++) {
                    const singleHeight = newCanvas.height / dpr * (1 - Math.pow(normalizedData[i], 1.5));
                    const newHeight = (height - singleHeight);
                    ctx.rect(i * singleWidth, Math.min(singleHeight + (newHeight * (1 - stage)), height), singleWidth - 4, newHeight * stage);
                    
                }
                ctx.fill();
                ctx.clip();
                const color = getComputedStyle(document.documentElement).getPropertyValue("--nextui-colors-primary");
                ctx.fillStyle = color;
                ctx.fillRect(0, 0, newCanvas.width / dpr / 100 * percent, newCanvas.height / dpr);
            }
        } else {
            const height = newCanvas.height / dpr - 2;
            const width = newCanvas.width / dpr;

            ctx.beginPath();
            ctx.fillStyle = "#121212";
            ctx.rect(2, height, width - 2, 2);
            ctx.fill();

            ctx.beginPath();
            ctx.fillStyle = "#fff";
            ctx.rect(0, height - 2, width - 2, 2);
            ctx.fill();
            ctx.clip();

            const color = getComputedStyle(document.documentElement).getPropertyValue("--nextui-colors-primary");
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, newCanvas.width / dpr / 100 * percent, newCanvas.height / dpr);
        }
    }

    useEffect(() => {
        if (currentBuffer) {
            const value = currentLerp.current();

            const end = active ? 1 : 0;

            currentLerp.current = lerp(value, end, 50, value => {
                draw(currentBuffer, value);
            });
        }
    }, [active]);

    useEffect(() => {
        draw(currentBuffer || [], active ? 1 : 0);
    }, [percent]);
    
    useEffect(() => {
        currentUrl.current = url;

        const ctx = new AudioContext();
        loaded.current = false;
        draw([], active ? 1 : 0);

        if (!url) return;

        fetch(url)
        .then(response => response.arrayBuffer())
        .then(async arrayBuffer => {
            if (currentUrl.current != url) return;
            const newBuffer = await ctx.decodeAudioData(arrayBuffer);
            if (currentUrl.current != url) return;
            setAudioBuffer(newBuffer);          
        });
    }, [url]);

    return (
        <canvas ref={canvas} className={styles.canvas}></canvas>
    )
});

export default Waveform;