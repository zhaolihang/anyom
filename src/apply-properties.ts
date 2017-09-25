import { isObject, getPrototype } from "./utils";
import { IPropType, ICommandsType } from "./vnode";
import { NodeProxy } from "./element";

export function applyNativeNodeProps(proxy: NodeProxy, props: IPropType, previous?: IPropType) {

    for (let propName in props) {
        let propValue = props[propName];

        if (propValue === undefined) {
            if (previous) {
                proxy.removeNativeNodeAttribute(propName, previous);
            }
        } else {
            if (isObject(propValue)) {
                patchNativeNodeObject(proxy, props, previous, propName, propValue);
            } else {
                proxy.setNativeNodeAttribute(propName, propValue, previous);
            }
        }
    }

}

function patchNativeNodeObject(proxy: NodeProxy, props, previous, propName, propValue) {
    let previousValue = previous ? previous[propName] : undefined;

    if (previousValue && isObject(previousValue)
        && getPrototype(previousValue) !== getPrototype(propValue)) {
        proxy.setNativeNodeAttribute(propName, propValue, previousValue);
        return;
    }

    if (!isObject(proxy.getNativeNodeAttribute(propName))) {
        proxy.setNativeNodeAttribute(propName, {}, undefined);
    }

    proxy.setNativeNodeObjectAttribute(propName, propValue, previousValue);
}

export function applyRef(proxy: NodeProxy, newRef: string, previousRef?: string) {
    proxy.setRef(newRef, previousRef);
}

export function applyCommands(proxy: NodeProxy, cmdPatch: ICommandsType, previousCmds: ICommandsType, newCommands: ICommandsType) {
    for (let cmdName in cmdPatch) {
        let cmdValue = cmdPatch[cmdName];
        if (cmdValue === undefined) {
            if (previousCmds && (cmdName in previousCmds)) {
                proxy.removeCommand(cmdName, previousCmds[cmdName]);
            }
        } else {
            if (previousCmds && (cmdName in previousCmds)) {
                proxy.updateCommand(cmdName, cmdValue, previousCmds[cmdName])
            } else {
                proxy.addCommand(cmdName, cmdValue);
            }
        }
    }
    proxy.setCommands(newCommands);
}

export function applyComponentProps(proxy: NodeProxy, props, previousProps?) {
    proxy.setComponentProps(props, previousProps);
}