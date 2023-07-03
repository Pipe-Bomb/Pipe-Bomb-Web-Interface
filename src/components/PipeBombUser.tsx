import { Dropdown, Loading, User } from "@nextui-org/react";
import { useEffect, useState } from "react";
import styles from "../styles/PipeBombUser.module.scss";
import { Link } from "react-router-dom";
import PipeBombConnection, { UserData } from "../logic/PipeBombConnection";
import React from "react";

export interface UserProps {
    userInfo?: UserData
}

const PipeBombUser = React.memo(function PipeBombUser({ userInfo }: UserProps) {
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

    return (
        <div className={styles.container}>
            <Dropdown placement="top-right">
                <Dropdown.Trigger>
                    <User
                        className={styles.user}
                        as="button"
                        size="lg"
                        color="primary"
                        name={userData.username}
                        description={"@" + userData.userID}
                        src={url}
                    />
                </Dropdown.Trigger>
                <Dropdown.Menu>
                    <Dropdown.Item key="profile"><Link className={styles.dropdownLink} to={`/user/${userData.userID}`}>Profile</Link></Dropdown.Item>
                    <Dropdown.Item key="settings"><Link className={styles.dropdownLink} to={"/settings"}>Settings</Link></Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>            
        </div>
    )
});

export default PipeBombUser;