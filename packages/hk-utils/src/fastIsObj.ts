export function fastIsObj(v: any): v is object {
	return v !== null && typeof v === 'object'
}