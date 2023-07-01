import { useEffect, useRef, useState } from "react";
import styles from "../styles/ContextMenu.module.scss"
import { Dropdown } from "@nextui-org/react";

let privateSetContent: (content: JSX.Element) => void;
let mouseEvent: React.MouseEvent;

export function openContextMenu(e: React.MouseEvent, content: JSX.Element) {
    e.preventDefault();
    mouseEvent = e;
    if (privateSetContent) privateSetContent(content);
}

export default function ContextMenu() {
    const [content, setContent] = useState<JSX.Element>(null);
    const container = useRef<HTMLDivElement>();
    const button = useRef(null);
    const [dummy, reload] = useState(false);
    privateSetContent = setContent;

    useEffect(() => {
        if (container.current && mouseEvent && button.current && content) {
            const div = container.current;
            div.style.left = mouseEvent.pageX + "px";
            div.style.top = mouseEvent.pageY - 40 + "px";
            button.current.click();
        }
    }, [mouseEvent, content]);

    function close() {
        mouseEvent = null;
        setTimeout(() => {
            setContent(
                <Dropdown.Menu>
                    <Dropdown.Item>dummy</Dropdown.Item>
                </Dropdown.Menu>
            );
        });
    }

    return (
        <div ref={container} className={styles.container}>
            <Dropdown disableAnimation placement="bottom-left" onClose={close}>
                <Dropdown.Button ref={button}>Click</Dropdown.Button>
                { content }
            </Dropdown>
        </div>
    )
}