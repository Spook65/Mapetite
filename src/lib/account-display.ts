export interface AccountDisplaySource {
	name?: string | null;
	email?: string | null;
}

export function getAccountInitials(source: AccountDisplaySource | null | undefined) {
	const nameParts =
		source?.name
			?.trim()
			.split(/\s+/)
			.filter(Boolean) ?? [];

	if (nameParts.length >= 2) {
		return `${nameParts[0].charAt(0)}${nameParts[
			nameParts.length - 1
		].charAt(0)}`.toUpperCase();
	}

	if (nameParts.length === 1) {
		return nameParts[0].charAt(0).toUpperCase();
	}

	const email = source?.email?.trim();
	if (email) {
		return email.charAt(0).toUpperCase();
	}

	return "U";
}

export function getAccountFirstName(
	source: AccountDisplaySource | null | undefined,
) {
	return source?.name?.trim().split(/\s+/).filter(Boolean)[0] || "User";
}
