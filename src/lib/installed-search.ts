interface InstalledSearchEntryOptions {
	hasResults: boolean;
	isEditing: boolean;
}

interface InstalledQualifierOptions {
	country: string;
	isDisclosed: boolean | null;
	region: string;
}

export function shouldShowInstalledSearchEntry({
	hasResults,
	isEditing,
}: InstalledSearchEntryOptions) {
	return isEditing || !hasResults;
}

export function shouldShowInstalledQualifiers({
	country,
	isDisclosed,
	region,
}: InstalledQualifierOptions) {
	if (isDisclosed !== null) return isDisclosed;
	return Boolean(region.trim() || country.trim());
}
