import { Modal, Text } from "@nextui-org/react";
import { MutableRefObject, ReactNode } from "react";
import styles from "../styles/CustomModal.module.scss";

interface Props {
    children: ReactNode,
    visible?: boolean,
    onClose?: () => void,
    ref?: MutableRefObject<HTMLInputElement | null>,
    title: string
}

export default function CustomModal(props: Props) {
    function close() {
        if (props.onClose) props.onClose();
    }

    return (
        <>
            <Modal
                closeButton
                open={props.visible || false}
                onClose={close}
                width="600px"
                scroll
            >
                <Modal.Header>
                    <Text h2 className={styles.title}>{props.title}</Text>
                </Modal.Header>
                <Modal.Body>
                    <div className={styles.contents}>
                        {props.children}
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}