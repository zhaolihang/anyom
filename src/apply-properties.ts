import { isObject, getPrototype } from "./utils";
import { IPropType, ICommandsType } from "./vnode";
import { RealNodeProxy } from "./element";

export function applyProperties(node: RealNodeProxy, props: IPropType, previous?: IPropType) {

    for (let propName in props) {
        let propValue = props[propName];

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

function setAttribute(node: RealNodeProxy, propName, propValue, previous) {
    node.setAttribute(propName, propValue, previous);
}

function removeAttribute(node: RealNodeProxy, propName, previous) {
    if (previous) {
        node.removeAttribute(propName, previous);
    }
}

function patchObject(node: RealNodeProxy, props, previous, propName, propValue) {
    let previousValue = previous ? previous[propName] : undefined;

    if (previousValue && isObject(previousValue)
        && getPrototype(previousValue) !== getPrototype(propValue)) {
        setAttribute(node, propName, propValue, previousValue);
        return;
    }

    if (!isObject(node.getAttribute(propName))) {
        setAttribute(node, propName, {}, undefined);
    }

    node.setObjectAttribute(propName, propValue, previousValue);
}

export function applyRef(node: RealNodeProxy, newRef: string, previousRef?: string) {
    node.setRef(newRef, previousRef);
}

export function applyCommands(node: RealNodeProxy, cmdPatch: ICommandsType, previousCmds?: ICommandsType) {
    node.setCommands(cmdPatch, previousCmds);
}