import { isObject, getPrototype } from "./utils";
import { IPropType } from "./vnode";
import { IRNode } from "./element";

export function applyProperties(node: IRNode, props: IPropType, previous?: IPropType) {
    for (let propName in props) {
        let propValue = props[propName]

        if (propValue === undefined) {
            removeAttribute(node, propName, previous);
        } else {
            if (isObject(propValue)) {
                patchObject(node, props, previous, propName, propValue);
            } else {
                setAttribute(node, propName, propValue, previous);
            }
        }
    }
}

function setAttribute(node: IRNode, propName, propValue, previous) {
    node.setAttribute(propName, propValue, previous);
}

function setAttributeObject(node: IRNode, propName, propValue, previous) {
    node.setAttributeObject(propName, propValue, previous);
}

function removeAttribute(node, propName, previous) {
    if (previous) {
        node.removeAttribute(propName, previous);
        node[propName] = null
    }
}

function patchObject(node, props, previous, propName, propValue) {
    let previousValue = previous ? previous[propName] : undefined

    if (previousValue && isObject(previousValue) &&
        getPrototype(previousValue) !== getPrototype(propValue)) {
        setAttribute(node, propName, propValue, previousValue);
        return
    }

    if (!isObject(node[propName])) {
        setAttribute(node, propName, {}, undefined);
    }

    setAttributeObject(node, propName, propValue, previousValue);
}