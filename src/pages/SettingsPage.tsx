import { Button } from "@nextui-org/react";
import Cookies from "js-cookie";

export default function SettingsPage() {

    function logout() {
        localStorage.removeItem("username");
        localStorage.removeItem("host");
        localStorage.removeItem("privateKey");
        Cookies.remove("jwt");
        location.reload();
    }

    return (
        <>
            <h1>Settings</h1>

            <Button color="error" onPress={logout}>Logout</Button>
        </>
    )
}