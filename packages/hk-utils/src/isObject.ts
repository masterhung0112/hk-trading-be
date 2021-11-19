export function isObject(v: any): v is Object {
	let is = false

	if (v != null) {
		const c = v.constructor
		is = c === null || c === Object
	}

	return is
}