import AudioPlayer from "./AudioPlayer";

export default class KeyboardShortcuts {
    private static instance: KeyboardShortcuts;

    private constructor() {
        document.addEventListener("keydown", e => {
            if (e.target != document.body) return;

            const player = AudioPlayer.getInstance();

            switch (e.key) {
                case " ":
                    if (player.getStatus().paused) {
                        player.play();
                    } else {
                        player.pause();
                    }
                    break;
                case "ArrowLeft":
                    if (e.shiftKey) {
                        player.previousTrack();
                    } else {
                        player.addTime(-10);
                    }
                    break;
                case "ArrowRight":
                    if (e.shiftKey) {
                        player.nextTrack();
                    } else {
                        player.addTime(10);
                    }
                    break;

                default: return;
            }
            e.preventDefault();
        });
    }

    public static getInstance() {
        if (!this.instance) this.instance = new KeyboardShortcuts();
        return this.instance;
    }
}