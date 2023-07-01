import User from "pipebomb.js/dist/User"
import styles from "../styles/PlaylistTop.module.scss"
import ImageWrapper from "./ImageWrapper"
import { Button, Dropdown, Text } from "@nextui-org/react"
import { Link } from "react-router-dom"
import { MdMoreHoriz, MdPlayArrow, MdShuffle } from "react-icons/md"
import IconButton from "./IconButton"
import { IconContext } from "react-icons"
import useIsSelf from "../hooks/IsSelfHook"

export interface PlaylistTopProps {
    name: string
    trackCount?: number
    onPlay: () => void
    onShuffle: () => void
    contextMenu: JSX.Element
    owner?: User
    image: string
}

export default function PlaylistTop(props: PlaylistTopProps) {
    const self = useIsSelf(props.owner);

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.image}>
                    {typeof props.image == "string" ? (
                        <div className={styles.imageBorder}>
                            <ImageWrapper src={props.image} />
                        </div>
                    ) : props.image}
                </div>
                <div className={styles.info}>
                    <Text h1>{ props.name }</Text>
                    {!self && props.owner && (
                        <Text h4 className={styles.playlistAuthor}>by <Link to={`/user/${props.owner.userID}`} className={styles.link}>{ props.owner.username }</Link></Text>
                    )}
                    {props.trackCount !== undefined && (
                        <Text h5 className={styles.trackCount}>{props.trackCount} track{props.trackCount == 1 ? "" : "s"}</Text>
                    )}
                </div>
            </div>
            <div className={styles.buttons}>
                <IconButton size="xl" onClick={props.onPlay} color="gradient"><MdPlayArrow /></IconButton>
                <IconButton size="lg" onClick={props.onShuffle} bordered><MdShuffle /></IconButton>
                <Dropdown>
                    <Dropdown.Trigger>
                        <Button light auto size="lg">
                            <IconContext.Provider value={{size: "30px"}}>
                                <MdMoreHoriz />
                            </IconContext.Provider>
                        </Button>
                    </Dropdown.Trigger>
                    { props.contextMenu }
                </Dropdown>
            </div>
        </div>
    )
}