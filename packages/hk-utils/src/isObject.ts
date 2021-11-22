export function isObject(v: any): v is Object {
	return typeof v === 'object' &&
		v === Object(v) &&
		Object.prototype.toString.call(v) !== '[object Array]' &&
		Object.prototype.toString.call(v) !== '[object Date]'
}