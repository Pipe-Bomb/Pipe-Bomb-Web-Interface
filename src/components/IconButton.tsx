import { Button } from "@nextui-org/react"
import { IconContext } from "react-icons"

export interface IconButtonProps {
    children: JSX.Element
    onClick?: () => void
    size?: "xs" | "sm" | "md" | "lg" | "xl"
    color?: "default" | "primary" | "secondary" | "success" | "error" | "warning" | "gradient",
    light?: boolean
    bordered?: boolean
}

export default function IconButton(props: IconButtonProps) {
    if (!props.size) props.size = "md";

    const iconSize = {
        xs: 15,
        sm: 20,
        md: 25,
        lg: 30,
        xl: 35
    }[props.size];

    return (
        <Button light={props.light} bordered={props.bordered} onPress={() => { props.onClick ? props.onClick() : null }} size={props.size} auto color={props.color}>
            <IconContext.Provider value={{size: iconSize + "px"}}>
                { props.children }
            </IconContext.Provider>
        </Button>
    )
}