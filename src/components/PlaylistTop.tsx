import User from "pipebomb.js/dist/User"
import styles from "../styles/PlaylistTop.module.scss"
import ImageWrapper from "./ImageWrapper"
import { Button, Dropdown, Text } from "@nextui-org/react"
import { Link } from "react-router-dom"
import { MdMoreHoriz, MdPlayArrow, MdShuffle } from "react-icons/md"
import IconButton from "./IconButton"
import { IconContext } from "react-icons"
import useIsSelf from "../hooks/IsSelfHook"
import React from "react"

export interface PlaylistTopProps {
    name: string
    trackCount?: number
    onPlay: () => void
    onShuffle: () => void
    contextMenu: JSX.Element
    owner?: User
    image: string
}

const PlaylistTop = React.memo(function PlaylistTop({ name, trackCount, onPlay, onShuffle, contextMenu, owner, image }: PlaylistTopProps) {
    const self = useIsSelf(owner);

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.image}>
                    {typeof image == "string" ? (
                        <div className={styles.imageBorder}>
                            <ImageWrapper src={image} />
                        </div>
                    ) : image}
                </div>
                <div className={styles.info}>
                    <Text h1>{ name }</Text>
                    {!self && owner && (
                        <Text h4 className={styles.playlistAuthor}>by <Link to={`/user/${owner.userID}`} className={styles.link}>{ owner.username }</Link></Text>
                    )}
                    {trackCount !== undefined && (
                        <Text h5 className={styles.trackCount}>{trackCount} track{trackCount == 1 ? "" : "s"}</Text>
                    )}
                </div>
            </div>
            <div className={styles.buttons}>
                <IconButton size="xl" onClick={onPlay} color="gradient"><MdPlayArrow /></IconButton>
                <IconButton size="lg" onClick={onShuffle} bordered><MdShuffle /></IconButton>
                <Dropdown>
                    <Dropdown.Trigger>
                        <Button light auto size="lg">
                            <IconContext.Provider value={{size: "30px"}}>
                                <MdMoreHoriz />
                            </IconContext.Provider>
                        </Button>
                    </Dropdown.Trigger>
                    { contextMenu }
                </Dropdown>
            </div>
        </div>
    )
});

export default PlaylistTop;