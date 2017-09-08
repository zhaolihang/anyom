
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
                setProperty(node, propName, propValue, previous);
            }
        }
    }
}

function setProperty(node: IRNode, propName, propValue, previous) {
    node[propName] = propValue;
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
        setProperty(node, propName, propValue, previousValue);
        return
    }

    if (!isObject(node[propName])) {
        setProperty(node, propName, {}, undefined);
    }

    let replacer = undefined;
    for (let k in propValue) {
        let value = propValue[k]
        node[propName][k] = (value === undefined) ? replacer : value
    }
}