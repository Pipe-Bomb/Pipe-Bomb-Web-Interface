import { useEffect, useState } from "react";
import PipeBombConnection from "../logic/PipeBombConnection";

export default function useAuthenticationStatus() {
    const connection = PipeBombConnection.getInstance()

    const [status, setStatus] = useState<"pending" | "authenticated" | "unauthenticated" | "disconnected" | "loading">(connection.getStatus());

    useEffect(() => {
        const callback = () => {
            setStatus(connection.getStatus());
        }

        connection.registerUpdateCallback(callback);

        return () => {
            connection.unregisterUpdateCallback(callback);
        }
    }, []);

    return status;
}