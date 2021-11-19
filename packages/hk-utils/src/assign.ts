import { copy } from './copy'
import { isObject } from './isObject'

export function assign(targ: Record<string, any>, ...args: any[]): any {
	for (let i = 1; i < args.length; i++) {
		const src = args[i]

		for (const key in src) {
			if (isObject(targ[key]))
				assign(targ[key], copy(src[key]))
			else
				targ[key] = copy(src[key])
		}
	}

	return targ
}