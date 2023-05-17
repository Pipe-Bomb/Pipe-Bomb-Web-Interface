import { Button, Input, Loading } from "@nextui-org/react";
import useAuthenticationStatus from "../hooks/AuthenticationStatusHook";
import styles from "../styles/LoginPage.module.scss";
import { useRef, useState } from "react";
import PipeBombConnection from "../logic/PipeBombConnection";
import CustomModal from "../components/CustomModal";

export default function LoginPage() {
    const authStatus = useAuthenticationStatus();
    const form = useRef<HTMLFormElement>();

    const [username, setUsername] = useState<string>(undefined);
    const [password, setPassword] = useState<string>(undefined);

    const [modalOpen, setModalOpen] = useState(false);

    function submit() {
        if (authStatus != "unauthenticated") return;

        const usernameElement: any = form.current.elements.namedItem("username");
        const username: string = usernameElement.value;

        const passwordElement: any = form.current.elements.namedItem("password");
        const password: string = passwordElement.value;

        if (!username || !password) return;

        PipeBombConnection.getInstance().login(username, password);
    }

    function keyPress(event: React.KeyboardEvent) {
        if (event.key == "Enter") submit();
    }

    let usernameMessage = "";
    let usernameStatus: "default" | "primary" | "secondary" | "success" | "warning" | "error";
    if (typeof username == "string") {
        if (!username.length) {
            usernameMessage = "Please enter your username";
            usernameStatus = "error";
        } else if (username.length < 5) {
            usernameMessage = "Usernames shorter than 5 characters are insecure";
            usernameStatus = "warning";
        }
    }



    let passwordMessage = "";
    let passwordStatus: "default" | "primary" | "secondary" | "success" | "warning" | "error";
    if (typeof password == "string") {
        if (!password.length) {
            passwordMessage = "Please enter your password";
            passwordStatus = "error";
        } else if (password.length < 10) {
            passwordMessage = "Passwords shorter than 10 characters are insecure";
            passwordStatus = "warning";
        } else if (password.length >= 20) {
            passwordMessage = "This is an awesome password";
            passwordStatus = "success";
        }
    }

    return (
        <>
            <div className={styles.container}>
                <h1 className={styles.title}>Login</h1>
                <form className={styles.modal} ref={form}>
                    <p className={styles.notice}>Enter the credentials to a new or existing account</p>
                    <div className={styles.input}>
                        <Input width="100%" name="username" bordered labelPlaceholder="Username" value={username || ""} onKeyDown={keyPress} onInput={e => setUsername(e.currentTarget.value)} helperColor={usernameStatus} helperText={usernameMessage} />
                    </div>
                    
                    <div className={styles.input}>
                        <Input.Password width="100%" name="password" bordered labelPlaceholder="Password" value={password || ""} onKeyDown={keyPress} onInput={e => setPassword(e.currentTarget.value)} helperColor={passwordStatus} helperText={passwordMessage} />
                    </div>
                    
                    <Button onPress={submit} disabled={!username || !password}>{
                        authStatus == "unauthenticated" ? "Login" : (
                            <Loading color={"white"} />
                        )
                    }</Button>
                    <div>
                        <Button className={styles.modalOpen} size="xs" light auto onPress={() => setModalOpen(true)}>How does this work?</Button>
                    </div>
                </form>
            </div>
            <CustomModal title="Pipe Bomb User Accounts" visible={modalOpen} onClose={() => setModalOpen(false)}>
                <p>Because Pipe Bomb accounts can be used on any Pipe Bomb server without a centralized database, accounts don't use the standard username + password model.</p>
                <p>Your username and password are used to create a public and private key pair, which is also used to generate your user ID.</p>
                <p>If you can prove to a Pipe Bomb server that you have both the public and private keys used to generate your user ID, the server considers you the owner of the account.</p>
                <p>Because of this architecture, there is no "registration" of accounts. You can just enter any username and password, and your keys will be generated behind the scenes for you.</p>
                <p>However there is a caveat. You cannot change your username or password, as the new combination would generate completely different keys and a different user ID, effectively logging you into a different account.</p>
                <p>Because your account keys are generated using both your username and password, usernames are not unique. Two accounts with the same username but different passwords will generate different keys and a differrent user ID.</p>
                <Button className={styles.modalClose} onPress={() => setModalOpen(false)}>Close</Button>
            </CustomModal>
        </>
    )
}