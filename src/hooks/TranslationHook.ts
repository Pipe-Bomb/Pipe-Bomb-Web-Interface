import { useState, useEffect } from "react";
import { localise, registerLanguageChangeListener, unregisterLanguageChangeListener } from "../logic/LanguageAdapter";

/**
 * Get the localised string from the provided translation key.
 * @param translationKey the translation key to look up in the current language.
 */
export default function useTranslation(translationKey: string) : string {
	const [translation, setTranslation] = useState(localise(translationKey));
	
	function onLanguageChange() {
		setTranslation(localise(translationKey));
	}

	useEffect(() => {
		registerLanguageChangeListener(onLanguageChange);

		return () => {
			unregisterLanguageChangeListener(onLanguageChange);
		};
	}, []);
	
	return translation;
}