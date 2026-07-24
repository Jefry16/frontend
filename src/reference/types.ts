// Platform reference data (read-only). Mirrors the backend reference responses;
// identity fields follow the house rule (`id` + `context`, never `type`).

export interface Currency {
	id: string;
	context: "currencies";
	code: string;
	name: string;
	symbol: string;
}

// The platform's supported content languages — the master list operators enable
// a subset of. The Languages settings picker builds its options from this.
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
	flagUrl: string;
}

// The backend nests the country reference inside the timezone.
export interface Timezone {
	id: string;
	context: "timezones";
	name: string;
	cityName: string;
	country: Country;
}
