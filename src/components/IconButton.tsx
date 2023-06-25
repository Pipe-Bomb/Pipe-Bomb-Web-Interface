import { Button } from "@nextui-org/react"
import React from "react"
import { IconContext } from "react-icons"

export interface IconButtonProps {
    children: JSX.Element
    onClick?: () => void
    size?: "xs" | "sm" | "md" | "lg" | "xl"
    color?: "default" | "primary" | "secondary" | "success" | "error" | "warning" | "gradient",
    light?: boolean
    bordered?: boolean
}

const IconButton = React.memo(function IconButton({ children, onClick, size, color, light, bordered}: IconButtonProps) {
    const iconSize = {
        xs: 15,
        sm: 20,
        md: 25,
        lg: 30,
        xl: 35
    }[size || "md"];

    return (
        <Button light={light} bordered={bordered} onPress={onClick} size={size || "md"} auto color={color}>
            <IconContext.Provider value={{size: iconSize + "px"}}>
                { children }
            </IconContext.Provider>
        </Button>
    )
});

export default IconButton;