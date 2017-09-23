import { isObject, getPrototype } from "./utils";
import { IPropType, ICommandsType } from "./vnode";
import { RealNodeProxy } from "./element";

export function applyElementProps(node: RealNodeProxy, props: IPropType, previous?: IPropType) {

    for (let propName in props) {
        let propValue = props[propName];

        if (propValue === undefined) {
            removeElementAttribute(node, propName, previous);
        } else {
            if (isObject(propValue)) {
                patchElementObject(node, props, previous, propName, propValue);
            } else {
                setElementAttribute(node, propName, propValue, previous);
            }
        }
    }

}

function setElementAttribute(node: RealNodeProxy, propName, propValue, previous) {
    node.setElementAttribute(propName, propValue, previous);
}

function removeElementAttribute(node: RealNodeProxy, propName, previous) {
    if (previous) {
        node.removeElementAttribute(propName, previous);
    }
}

function patchElementObject(node: RealNodeProxy, props, previous, propName, propValue) {
    let previousValue = previous ? previous[propName] : undefined;

    if (previousValue && isObject(previousValue)
        && getPrototype(previousValue) !== getPrototype(propValue)) {
        setElementAttribute(node, propName, propValue, previousValue);
        return;
    }

    if (!isObject(node.getElementAttribute(propName))) {
        setElementAttribute(node, propName, {}, undefined);
    }

    node.setElementObjectAttribute(propName, propValue, previousValue);
}

export function applyRef(node: RealNodeProxy, newRef: string, previousRef?: string) {
    node.setRef(newRef, previousRef);
}

export function applyCommands(node: RealNodeProxy, cmdPatch: ICommandsType, previousCmds?: ICommandsType) {
    for (let cmdName in cmdPatch) {
        let cmdValue = cmdPatch[cmdName];
        if (cmdValue === undefined) {
            removeCommand(node, cmdName, previousCmds);
        } else {
            setCommand(node, cmdName, cmdValue, previousCmds);
        }
    }
}

function removeCommand(node: RealNodeProxy, cmdName: string, previousCmds?: ICommandsType) {
    if (previousCmds && (cmdName in previousCmds)) {
        node.removeCommand(cmdName, previousCmds[cmdName]);
    }
}

function setCommand(node: RealNodeProxy, cmdName: string, cmdValue: any, previousCmds?: ICommandsType) {
    if (previousCmds && (cmdName in previousCmds)) {
        node.updateCommand(cmdName, cmdValue, previousCmds[cmdName])
    } else {
        node.addCommand(cmdName, cmdValue);
    }
}

export function applyComponentProps(node: RealNodeProxy, props, previousProps?) {
    node.setComponentProps(props, previousProps);
}