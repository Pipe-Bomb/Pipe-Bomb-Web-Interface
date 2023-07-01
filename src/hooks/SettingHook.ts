import { useEffect, useState } from "react";
import { getSetting, registerSettingListener, unregisterSettingListener } from "../logic/SettingsIndex";

export default function useSetting(setting: string, defaultValue: string) {
    const [value, setValue] = useState(getSetting(setting, defaultValue));

    useEffect(() => {
        registerSettingListener(setting, setValue);

        return () => {
            unregisterSettingListener(setting, setValue);
        }
    }, []);

    return value;
}