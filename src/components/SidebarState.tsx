import Lyrics from "./Lyrics";
import Queue from "./Queue";

export interface SidebarStateProps {
    state: "queue" | "lyrics"
}

export default function SidebarState({ state }: SidebarStateProps) {
    switch (state) {
        case "lyrics":
            return <Lyrics />
        default:
            return <Queue sideBar />
    }
}