export default class Language {
	private i18n: string;
	private displayName: string;
	private translations?: Map<string, string>;

	public constructor(i18n: string, displayName: string) {
		this.i18n = i18n;
		this.displayName = displayName;
	}

	/**
	 * Resolve the language data, if not already loaded.
	 */
	public async resolve() : Promise<void> {
		if (!this.translations) {
			const response = await fetch(`lang/${this.i18n}.json`);
			const json = await response.json();
			this.translations = new Map(Object.entries(json));
		}
	}

	public getDisplayName(): string {
		return this.displayName;
	}
}