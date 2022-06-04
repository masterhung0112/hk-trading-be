export function isObject(v: any): v is object {
	return typeof v === 'object' &&
		v === Object(v) &&
		Object.prototype.toString.call(v) !== '[object Array]' &&
		Object.prototype.toString.call(v) !== '[object Date]'
}