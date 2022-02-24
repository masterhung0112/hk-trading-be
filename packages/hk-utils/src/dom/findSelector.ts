import { domAttr } from '../attr/domAttr'
import { memoize } from '../memorize'
import { isString } from '../primitives/isString'
import { toDomNode, toDomNodes } from '../toDomNode'
import { index } from './filter'

const escapeFn = inBrowser && window.CSS && CSS.escape || function (css) { return css.replace(/([^\x7f-\uFFFF\w-])/g, match => `\\${match}`); };
export function escape(css) {
    return isString(css) ? escapeFn.call(null, css) : ''
}

function domPath(element: Element) {
    const names = []
    while (element.parentNode) {
        const id = domAttr(element, 'id')
        if (id) {
            names.unshift(`#${escape(id)}`)
            break
        } else {
            let {tagName} = element
            if (tagName !== 'HTML') {
                tagName += `:nth-child(${index(element) + 1})`
            }
            names.unshift(tagName)
            element = element.parentNode
        }
    }
    return names.join(' > ')
}

const contextSelectorRe = /(^|[^\\],)\s*[!>+~-]/
const contextSanitizeRe = /([!>+~-])(?=\s+[!>+~-]|\s*$)/g

const isContextSelector = memoize(selector => selector.match(contextSelectorRe))

const selectorRe = /.*?[^\\](?:,|$)/g

const splitSelector = memoize(selector =>
    selector.match(selectorRe)?.map(s =>
        s.replace(/,$/, '').trim()
    )
)

function _query(targetSelector: string, context = document, queryFn: string) {

    if (!targetSelector || !isString(targetSelector)) {
        return targetSelector
    }

    targetSelector = targetSelector.replace(contextSanitizeRe, '$1 *')

    if (isContextSelector(targetSelector)) {
        selector = splitSelector(targetSelector).map(selector => {

            let ctx = context

            if (selector[0] === '!') {

                const selectors = selector.substr(1).trim().split(' ')
                ctx = closest(parent(context), selectors[0])
                selector = selectors.slice(1).join(' ').trim()

            }

            if (selector[0] === '-') {

                const selectors = selector.substr(1).trim().split(' ')
                const prev = (ctx || context).previousElementSibling
                ctx = matches(prev, selector.substr(1)) ? prev : null
                selector = selectors.slice(1).join(' ')

            }

            if (!ctx) {
                return null
            }

            return `${domPath(ctx)} ${selector}`

        }).filter(Boolean).join(',')

        context = document
    }

    try {
        return context[queryFn](selector)
    } catch (e) {
        return null
    }

}

export function find(selector, context) {
    return toDomNode(_query(selector, context, 'querySelector'))
}

export function findAll(selector, context) {
    return toDomNodes(_query(selector, context, 'querySelectorAll'))
}