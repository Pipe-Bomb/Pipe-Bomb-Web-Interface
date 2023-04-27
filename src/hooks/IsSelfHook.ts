import { useEffect, useState } from "react";
import Account from "../logic/Account";
import User from "pipebomb.js/dist/User";

export default function useIsSelf(user?: User) {
    const [isSelf, setIsSelf] = useState<boolean | null>(null);

    useEffect(() => {
        setIsSelf(null);
        
        if (user) {
            Account.getInstance().getUserData()
            .then(self => {
                setIsSelf(self.userID == user.userID);
            });
        }
    }, [user]);

    return isSelf;
}