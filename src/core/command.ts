// command.ts
import { NativeNode, Cmds } from "./vnode";

export type ICommandObjType = {
    inserted?: (node: NativeNode, newValue) => any,
    update?: (node: NativeNode, newValue, oldValue) => any,
    remove?: (node: NativeNode, oldValue) => any,
};

export const Commands = new Map<string, ICommandObjType>();

export function setCommand(name: string, cmdObj: ICommandObjType) {
    if (Commands.has(name)) {
        return Commands.get(name);
    }
    Commands.set(name, cmdObj);
    return cmdObj;
}

export function getCommand(name: string): ICommandObjType {
    return Commands.get(name);
}

export function hasCommand(name: string): boolean {
    return Commands.has(name);
}
