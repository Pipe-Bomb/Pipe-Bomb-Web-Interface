const settings: Map<string, string | number | boolean> = new Map();

export function loadSettings() {
    const json = localStorage.getItem("settings");
    if (!json) return;
    try {
        const data = JSON.parse(json);
        if (typeof data != "object" || Array.isArray(data)) throw null;

        for (let setting of Object.keys(data)) {
            if (typeof setting != "string") continue;
            const value: string | number | boolean = data[setting];
            if (["string", "number", "boolean"].includes(typeof value)) {
                settings.set(setting, value);
            }
        }
    } finally {
        saveSettings();
    }
}
loadSettings();

export function saveSettings() {
    const settingsObject: {
        [key: string]: string | number | boolean
    } = {};

    for (let setting of settings.keys()) {
        settingsObject[setting] = settings.get(setting);
    }

    localStorage.setItem("settings", JSON.stringify(settingsObject));
}

export function getSetting(setting: string, defaultValue?: any): any {
    const value = settings.get(setting);
    if (value !== undefined) return value;
    if (defaultValue !== undefined) return defaultValue;
    return null;
}

export function setSetting(setting: string, value: string | number | boolean) {
    settings.set(setting, value);
    saveSettings();
}