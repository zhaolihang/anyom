import { isObject, getPrototype } from "./utils";
import { IPropType } from "./vnode";
import { RNodeProxy } from "./element";
import { Component } from "./component";

export function applyProperties(node: RNodeProxy, props: IPropType, previous?: IPropType, context?: Component) {

    for (let propName in props) {
        let propValue = props[propName];

        if (propValue === undefined) {
            removeAttribute(node, propName, previous, context);
        } else {
            if (isObject(propValue)) {
                patchObject(node, props, previous, propName, propValue, context);
            } else {
                setAttribute(node, propName, propValue, previous, context);
            }
        }
    }

}

function setAttribute(node: RNodeProxy, propName, propValue, previous, context?: Component) {
    node.setAttribute(propName, propValue, previous, context);
}

function setAttributeObject(node: RNodeProxy, propName, propValue, previous, context?: Component) {
    node.setAttributeObject(propName, propValue, previous, context);
}

function removeAttribute(node: RNodeProxy, propName, previous, context?: Component) {
    if (previous) {
        node.removeAttribute(propName, previous, context);
        node[propName] = null;
    }
}

function patchObject(node: RNodeProxy, props, previous, propName, propValue, context?: Component) {
    let previousValue = previous ? previous[propName] : undefined;

    if (previousValue && isObject(previousValue)
        && getPrototype(previousValue) !== getPrototype(propValue)) {
        setAttribute(node, propName, propValue, previousValue, context);
        return;
    }

    if (!isObject(node.getObjectAttribute(propName))) {
        setAttribute(node, propName, {}, undefined, context);
    }

    setAttributeObject(node, propName, propValue, previousValue, context);
}