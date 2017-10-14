
import { NativeElement, Cmds } from "./vnode";

export const Commands = new Map<string, ICommandObjType>();

export type ICommandObjType = {
    inserted?: (node, newValue) => any,
    update?: (node, newValue, oldValue) => any,
    remove?: (node, oldValue) => any,
};

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
