
import { isObject, getPrototype } from "./utils";
import { IRNode, IPropType } from "./vnode";

export function applyProperties(node: IRNode, props: IPropType, previous?: IPropType) {
    for (let propName in props) {
        let propValue = props[propName]

        if (propValue === undefined) {
            removeProperty(node, propName, propValue, previous);
        } else {
            if (isObject(propValue)) {
                patchObject(node, props, previous, propName, propValue);
            } else {
                node[propName] = propValue
            }
        }
    }
}

function removeProperty(node, propName, propValue, previous) {
    if (previous) {
        node[propName] = null
    }
}

function patchObject(node, props, previous, propName, propValue) {
    let previousValue = previous ? previous[propName] : undefined

    if (previousValue && isObject(previousValue) &&
        getPrototype(previousValue) !== getPrototype(propValue)) {
        node[propName] = propValue
        return
    }

    if (!isObject(node[propName])) {
        node[propName] = {}
    }

    let replacer = undefined;
    for (let k in propValue) {
        let value = propValue[k]
        node[propName][k] = (value === undefined) ? replacer : value
    }
}