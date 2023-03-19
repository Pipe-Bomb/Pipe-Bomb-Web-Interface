import AudioPlayer from "./AudioPlayer";

export default class KeyboardShortcuts {
    private static instance: KeyboardShortcuts;

    private constructor() {
        document.addEventListener("keydown", e => {
            if (e.target != document.body) return;
            this.keypress(e);
        });
    }

    public keypress(e: KeyboardEvent) {
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
            
            case "0":
                player.setTime(0);
                break;
            case "1":
                player.setTime(10);
                break;
            case "2":
                player.setTime(20);
                break;
            case "3":
                player.setTime(30);
                break;
            case "4":
                player.setTime(40);
                break;
            case "5":
                player.setTime(50);
                break;
            case "6":
                player.setTime(60);
                break;
            case "7":
                player.setTime(70);
                break;
            case "8":
                player.setTime(80);
                break;
            case "9":
                player.setTime(90);
                break;
            


            default: return;
        }
        e.preventDefault();
    }

    public static getInstance() {
        if (!this.instance) this.instance = new KeyboardShortcuts();
        return this.instance;
    }
}