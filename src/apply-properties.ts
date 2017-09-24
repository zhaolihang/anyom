import { isObject, getPrototype } from "./utils";
import { IPropType, ICommandsType } from "./vnode";
import { RealNodeProxy } from "./element";

export function applyElementProps(node: RealNodeProxy, props: IPropType, previous?: IPropType) {

    for (let propName in props) {
        let propValue = props[propName];

        if (propValue === undefined) {
            if (previous) {
                node.removeNativeNodeAttribute(propName, previous);
            }
        } else {
            if (isObject(propValue)) {
                patchElementObject(node, props, previous, propName, propValue);
            } else {
                node.setNativeNodeAttribute(propName, propValue, previous);
            }
        }
    }

}

function patchElementObject(node: RealNodeProxy, props, previous, propName, propValue) {
    let previousValue = previous ? previous[propName] : undefined;

    if (previousValue && isObject(previousValue)
        && getPrototype(previousValue) !== getPrototype(propValue)) {
        node.setNativeNodeAttribute(propName, propValue, previousValue);
        return;
    }

    if (!isObject(node.getNativeNodeAttribute(propName))) {
        node.setNativeNodeAttribute(propName, {}, undefined);
    }

    node.setNativeNodeObjectAttribute(propName, propValue, previousValue);
}

export function applyRef(node: RealNodeProxy, newRef: string, previousRef?: string) {
    node.setRef(newRef, previousRef);
}

export function applyCommands(node: RealNodeProxy, cmdPatch: ICommandsType, previousCmds: ICommandsType, newCommands: ICommandsType) {
    for (let cmdName in cmdPatch) {
        let cmdValue = cmdPatch[cmdName];
        if (cmdValue === undefined) {
            if (previousCmds && (cmdName in previousCmds)) {
                node.removeCommand(cmdName, previousCmds[cmdName]);
            }
        } else {
            if (previousCmds && (cmdName in previousCmds)) {
                node.updateCommand(cmdName, cmdValue, previousCmds[cmdName])
            } else {
                node.addCommand(cmdName, cmdValue);
            }
        }
    }
    node.setCommands(newCommands);
}

export function applyComponentProps(node: RealNodeProxy, props, previousProps?) {
    node.setComponentProps(props, previousProps);
}