import { useEffect, useState } from "react";
import User from "pipebomb.js/dist/User";
import PipeBombConnection from "../logic/PipeBombConnection";

export default function useIsSelf(user?: User) {
    const [isSelf, setIsSelf] = useState<boolean | null>(null);

    useEffect(() => {
        setIsSelf(null);
        
        if (user) {
            PipeBombConnection.getInstance().getUserData()
            .then(self => {
                setIsSelf(self.userID == user.userID);
            });
        }
    }, [user]);

    return isSelf;
}