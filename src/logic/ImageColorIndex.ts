import extractColors from "extract-colors";

const imageIndex: Map<string, ImageColor> = new Map();

const defaultColors = [
    [
        "rgba(255, 0, 255, 1)",
        "rgba(255, 0, 255, 0)"
    ],
    [
        "rgba(255, 255, 0, 1)",
        "rgba(255, 255, 0, 0)"
    ],
    [
        "rgba(0, 255, 255, 1)",
        "rgba(0, 255, 255, 0)"
    ],
    [
        "rgba(0, 255, 0, 1)",
        "rgba(0, 255, 0, 0)"
    ],
    [
        "rgba(0, 0, 255, 1)",
        "rgba(0, 0, 255, 0)"
    ],
    [
        "rgba(255,0,0, 1)",
        "rgba(255,0,0, 0)"
    ]
];


export class ImageColor {
    private timer: ReturnType<typeof setTimeout>;

    public constructor(public readonly url: string, private colors?: string[][]) {
        if (!this.colors) {
            this.colors = defaultColors;
        }
        imageIndex.set(url, this);
        this.resetTimer();
    }

    private resetTimer() {
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            if (imageIndex.get(this.url) == this) {
                imageIndex.delete(this.url);
            }
        }, 60_000);
    }

    public getColors() {
        this.resetTimer();
        return this.colors;
    }
}

export function getColorsForImage(url: string): string[][] | null {
    const colorObject = imageIndex.get(url);
    if (!colorObject) return null;
    return colorObject.getColors();
}

export function setColorsForImage(imageColor: ImageColor) {
    imageIndex.set(imageColor.url, imageColor);
}

export function getDefaultColors() {
    return defaultColors;
}



const loadCallbacks: Map<string, ((colors: string[][]) => void)[]> = new Map();

export function loadColorsForImage(url: string) {
    return new Promise<string[][]>(resolve => {
        const callbacks = loadCallbacks.get(url);
        if (callbacks) {
            callbacks.push(resolve);
            return;
        }

        const newCallbacks = [];
        loadCallbacks.set(url, newCallbacks);

        function pushToCallbacks(colorObject: ImageColor) {
            setColorsForImage(colorObject);
            loadCallbacks.delete(colorObject.url);
            const colors = colorObject.getColors();
            resolve(colors);
            for (let callback of newCallbacks) {
                callback(colors);
            }
        }

        const img = new Image();

        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;

            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            extractColors(imageData)
            .then(colors => {
                interface ColorWrapper {
                    strings: string[],
                    saturation: number
                };

                const colorWrappers: ColorWrapper[] = colors.map(color => {
                    return {
                        saturation: color.saturation,
                        strings: [
                            `rgba(${color.red}, ${color.green}, ${color.blue}, 1)`,
                            `rgba(${color.red}, ${color.green}, ${color.blue}, 0)`
                        ]
                    };
                });

                colorWrappers.sort((a, b) => {
                    if (a.saturation > b.saturation) {
                      return -1;
                    }
                    if (a.saturation < b.saturation){
                      return 1;
                    }
                    return 0;
                });

                const colorObject = new ImageColor(url, colorWrappers.map(color => color.strings));
                pushToCallbacks(colorObject);

            }).catch(() => {
                console.error("failed to load colors for image", url);
                pushToCallbacks(new ImageColor(url));
            });
        }

        img.onerror = () => {
            pushToCallbacks(new ImageColor(url));
        }

        img.crossOrigin = "anonymous";
        img.src = url;   
    });
}