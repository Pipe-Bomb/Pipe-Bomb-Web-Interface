import { Loading, User } from "@nextui-org/react";
import { useEffect, useState } from "react";
import Account, { UserDataFormat } from "../logic/Account";
import styles from "../styles/PipeBombUser.module.scss";

export interface UserProps {
    userInfo?: UserDataFormat
}

export default function PipeBombUser({ userInfo }: UserProps) {
    const [userData, setUserData] = useState<UserDataFormat | null>(userInfo || null);

    useEffect(() => {
        if (!userInfo) {
            Account.getInstance().getUserData().then(setUserData);
        }
    }, [userInfo]);

    if (!userData) {
        return <Loading className={styles.loader} />
    }

    const url = Account.getAvatarUrl(userData.userID);

    return <div className={styles.container}>
        <User
            className={styles.user}
            as="button"
            size="lg"
            color="primary"
            name={userData.username}
            description={"@" + userData.userID}
            src={url}
        />
    </div>
}