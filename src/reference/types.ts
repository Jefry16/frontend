export interface Currency {
	id: string;
	context: "currencies";
	code: string;
	name: string;
	symbol: string;
}

export interface Language {
	id: string;
	context: "languages";
	code: string;
	name: string;
}

export interface Country {
	id: string;
	context: "countries";
	code: string;
	name: string;
	flagUrl: string | null;
}

export interface Timezone {
	id: string;
	context: "timezones";
	name: string;
	cityName: string;
	country: Country;
}
