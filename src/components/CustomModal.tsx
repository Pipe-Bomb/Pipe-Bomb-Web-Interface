import { Modal, Text } from "@nextui-org/react";
import { MutableRefObject, ReactNode } from "react";
import styles from "../styles/CustomModal.module.scss";
import React from "react";

interface Props {
    children: ReactNode,
    visible?: boolean,
    onClose?: () => void,
    title: string
}

const CustomModal = React.memo(function CustomModal({ children, visible, onClose, title}: Props) {
    return (
        <>
            <Modal
                closeButton
                open={visible || false}
                onClose={onClose}
                width="600px"
                scroll
            >
                <Modal.Header>
                    <Text h2 className={styles.title}>{title}</Text>
                </Modal.Header>
                <Modal.Body>
                    <div className={styles.contents}>
                        {children}
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
});

export default CustomModal;