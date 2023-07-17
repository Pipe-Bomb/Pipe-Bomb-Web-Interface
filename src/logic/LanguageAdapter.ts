import { Dispatch, SetStateAction, useState } from "react";
import Language from "./Language";
import axios from 'axios';

// Interface for structure of the language metadata file
interface LanguageMeta {
	displayName: string;
}

interface LanguagesIndex {
	languages: {
		[key: string]: LanguageMeta
	},
	default: string
}

// Interface for Listeners
type LanguageChangeListener = () => void;

let languages : Map<string, Language>;
let defaultLanguage : Language;
let currentLanguage : Language;

let listeners : LanguageChangeListener[];

/**
 * Get first preferred language by the browser that we also support.
 * In the case of a generic language such as "en" being supported, any particular localisation
 * ("en-US", "en-GB") will match. If the user has a particular localisation preferred for that language,
 * at another point in the list, that will be prioritised.
 * @returns the first language the user's browser prefers that we support. If there are no languages in common, returns
 * the default language.
 */
function getPreferredLanguage() : string {
	if (navigator.languages) {
		// Find first language we support
		for (let language of navigator.languages) {
			if (this.languages.has(language)) {
				return language;
			}
		}
	} else {
		// old browsers
		if (this.languages.has(navigator.language)) {
			return navigator.language;
		}
	}

	return this.defaultLanguage;
}

export function initialiseLanguageAdapter() {
	// initialise
	languages = new Map();

	// set dummy value for current and default language to begin with.
	defaultLanguage = currentLanguage = new Language("xx-XX", "No Translation");

	// load language index for metadata such as supported languages
	axios.get("lang/index.json")
	.then(response => response.data)
	.then((data: LanguagesIndex) => {
		// read index data
		for (const [key, value] of Object.entries(data.languages)) {
			languages.set(key, new Language(key, value.displayName));
		}

		// load default language
		defaultLanguage = loadLanguage(data.default);

		// load preferred language
		loadLanguage(getPreferredLanguage());
	})
	.catch(error => {
		// TODO how should errors be handled? Build in the default en-US translation, or just show translation keys? Show error page?
		console.log(error);
	});
}

export function loadLanguage(language: string) : Language {
	currentLanguage = this.languages.get(language);

	currentLanguage.resolve().then(() => {
		// update listeners
	});
	
	return currentLanguage;
}

/**
 * Localise the given translation key to the current language.
 * @param key the translation key to localise.
 * @returns the localisation for the given translation key, searching first in the current language, falling back on the default language, and finally using the translation key
 * if no translation is found.
 */
export function localise(key: string): string {
	return currentLanguage.localise(key) ?? defaultLanguage.localise(key) ?? key;
}

export function registerLanguageChangeListener(listener: LanguageChangeListener): void {
	listeners.push(listener);
}

export function unregisterLanguageChangeListener(listener: LanguageChangeListener): void {
	let i : number = listeners.indexOf(listener);
	
	if (i > -1) {
		listeners.splice(i, 1);
	}
}