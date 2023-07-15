import Language from "./Language";

interface LanguageMeta {
	displayName: string;
}

interface LanguagesIndex {
	languages: {
		[key: string]: LanguageMeta
	},
	default: string
}

export default class LanguageAdapter {
	private languages : Map<string, Language>;
	private defaultLanguage : string;

	public constructor() {
		// default values
		this.languages = new Map();
		this.defaultLanguage = "en-GB";

		// load language index
		fetch("lang/index.json")
		.then(response => response.json())
		.then((data: LanguagesIndex) => {
			// read index data
			for (const [key, value] of Object.entries(data.languages)) {
				this.languages.set(key, new Language(key, value.displayName));
			}

			this.defaultLanguage = data.default;

			// load preferred language
			this.getLanguage();
		})
		.catch(error => {
			// TODO how should errors be handled? Build in the default en-US translation, or just show translation keys? Show error page?
			console.log(error);
		});
	}

	private getPreferredLanguage() : string {
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

	public getLanguage(): Language {
		const language: Language = this.languages.get(this.getPreferredLanguage());
		language.resolve();
		return language;
	}
}