export function fastIsObj(v: any): v is Object {
	return v !== null && typeof v === 'object'
}