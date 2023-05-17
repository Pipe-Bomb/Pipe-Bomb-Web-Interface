import { Loading, User } from "@nextui-org/react";
import { useEffect, useState } from "react";
import styles from "../styles/PipeBombUser.module.scss";
import { Link } from "react-router-dom";
import PipeBombConnection, { UserData } from "../logic/PipeBombConnection";

export interface UserProps {
    userInfo?: UserData
}

export default function PipeBombUser({ userInfo }: UserProps) {
    const [userData, setUserData] = useState<UserData | null>(userInfo || null);

    useEffect(() => {
        if (!userInfo) {
            PipeBombConnection.getInstance().getUserData().then(setUserData);
        }
    }, [userInfo]);

    if (!userData) {
        return <Loading className={styles.loader} />
    }

    const url = PipeBombConnection.getAvatarUrl(userData.userID);

    return <div className={styles.container}>
        <Link to={`/user/${userData.userID}`}>
            <User
                className={styles.user}
                as="button"
                size="lg"
                color="primary"
                name={userData.username}
                description={"@" + userData.userID}
                src={url}
            />
        </Link>
        
    </div>
}