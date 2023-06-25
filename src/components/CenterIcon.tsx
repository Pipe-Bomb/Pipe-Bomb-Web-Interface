import { IconContext } from "react-icons"
import styles from "../styles/CenterIcon.module.scss"
import { Text } from "@nextui-org/react"
import React from "react";

export interface CenterIconProps {
    icon: JSX.Element,
    text: string
}

const CenterIcon = React.memo(function CenterIcon({ icon, text }: CenterIconProps) {
    return (
        <div className={styles.container}>
            <IconContext.Provider value={{size: "200px"}}>
                { icon }
            </IconContext.Provider>
            <Text h1>{ text }</Text>
        </div>
    )
});

export default CenterIcon;