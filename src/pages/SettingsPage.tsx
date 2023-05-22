import { Button, Dropdown, Grid, Spacer, Text } from "@nextui-org/react";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { getSetting, setSetting } from "../logic/SettingsIndex";
import Theme from "../logic/ThemeIndex";
import AudioPlayer from "../logic/AudioPlayer";
import LocalAudio from "../logic/audio/LocalAudio";
import Slider from "../components/Slider";
import useSetting from "../hooks/SettingHook";
import styles from "../styles/SettingsPage.module.scss"

export default function SettingsPage() {
    const [theme, setTheme] = useState<string>(getSetting("theme", "Classic"));
    const [themeChanged, setThemeChanged] = useState(false);
    const eqReload = useSetting("eq", "");

    useEffect(() => {
        if (theme == getSetting("theme", "Classic")) return;
        setSetting("theme", theme);
        setThemeChanged(true);
    }, [theme]);
    

    function logout() {
        localStorage.removeItem("username");
        localStorage.removeItem("host");
        localStorage.removeItem("privateKey");
        Cookies.remove("jwt");
        location.reload();
    }

    const localAudio = AudioPlayer.getInstance().audio.getAudioType("local") as LocalAudio;
    const nodes = localAudio.getEqNodes();

    return (
        <>
            <h1>Settings</h1>


            <Text h3>Theme</Text>
            {themeChanged && (
                <p>Reload for changes to take effect</p>
            )}
            <Dropdown>
                <Dropdown.Button color="secondary">
                    {theme}
                </Dropdown.Button>
                <Dropdown.Menu onSelectionChange={e => setTheme(e == "all" ? "Classic" : e.values().next().value)} disallowEmptySelection selectionMode="single">
                    {Theme.getThemeIds().map(name => (
                        <Dropdown.Item key={name}>{name}</Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown>

            <Spacer y={2} />

            <Text h3>Equalizer</Text>
            {!nodes.length ? (
                <p>Play a track to load the EQ</p>
            ) : (
                <Grid.Container justify="space-between" className={styles.eq}>
                    {nodes.map((node, index) => (
                        <Grid key={index} className={styles.eqOption}>
                            <Slider min={-60} max={30} value={node.getGain()} onChange={node.setGain} length={200} orientation="vertical" />
                            <span>{node.getGain()}DB</span>
                        </Grid>
                    ))}
                </Grid.Container>
            )}
            

            <Spacer y={2} />

            <Button color="error" onPress={logout}>Logout</Button>
        </>
    )
}