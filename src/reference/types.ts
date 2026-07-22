// Platform reference data (read-only). Mirrors the backend reference responses;
// identity fields follow the house rule (`id` + `context`, never `type`).

export interface Currency {
	id: string;
	context: "currencies";
	code: string;
	name: string;
	symbol: string;
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
