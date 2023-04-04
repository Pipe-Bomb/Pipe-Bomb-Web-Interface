import { Text } from "@nextui-org/react";
import styles from "../styles/NumberWrapper.module.scss";

export interface NumberWrapperProps {
    children: JSX.Element | JSX.Element[],
    number: number
}

export default function NumberWrapper({ children, number }: NumberWrapperProps) {
    return (
        <div className={styles.container}>
            <Text h1 className={styles.number}>{ number }</Text>
            { children }
        </div>
    )
}