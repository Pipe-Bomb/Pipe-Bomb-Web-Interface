const settings: Map<string, string | number | boolean> = new Map();
const settingsListeners: Map<string, ((value: any) => void)[]> = new Map();

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

    const listeners = settingsListeners.get(setting);
    if (listeners) {
        for (let callback of listeners) {
            callback(value);
        }
    }

    saveSettings();
}

export function registerSettingListener(setting: string, callback: (value: any) => void) {
    const array = settingsListeners.get(setting);
    if (array) {
        if (array.indexOf(callback) < 0) {
            array.push(callback);
        }
    } else {
        settingsListeners.set(setting, [callback]);
    }
}

export function unregisterSettingListener(setting: string, callback: (value: any) => void) {
    const array = settingsListeners.get(setting);
    if (!array) return;
    const index = array.indexOf(callback);
    if (index >= 0) {
        array.splice(index, 1);
    }
}