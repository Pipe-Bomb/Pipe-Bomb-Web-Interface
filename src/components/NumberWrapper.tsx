import { Text } from "@nextui-org/react";
import styles from "../styles/NumberWrapper.module.scss";
import React from "react";

export interface NumberWrapperProps {
    children: JSX.Element | JSX.Element[],
    number: number
}

const NumberWrapper = React.memo(function NumberWrapper({ children, number }: NumberWrapperProps) {
    return (
        <div className={styles.container}>
            <Text h1 className={styles.number}>{ number }</Text>
            <div className={styles.children}>
                { children }
            </div>
        </div>
    )
});

export default NumberWrapper;