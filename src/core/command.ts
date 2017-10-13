
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

export const CommandsTriggerMap = new Map<NativeElement, CommandsTrigger>();

export class CommandsTrigger {

    constructor(public nativeElement: NativeElement, public cmdsArr: Cmds[]) {
    }

    inserted() {
        let arr = this.cmdsArr
        let len = arr.length

        for (let i = 0; i < len; i++) {
            let cmds = arr[i];
            for (let cmdName in cmds) {
                let cmd = Commands.get(cmdName);
                if (cmd.inserted) {
                    cmd.inserted(this.nativeElement, cmds[cmdName]);
                }
            }
        }
    }

    update() {
        let arr = this.cmdsArr
        let len = arr.length

        for (let i = 0; i < len; i++) {
            let cmds = arr[i];
            for (let cmdName in cmds) {
                let cmd = Commands.get(cmdName);
                if (cmd.update) {
                    // cmd.update(this.nativeElement, cmds[cmdName]);
                }
            }
        }
    }

    remove() {
        let arr = this.cmdsArr
        let len = arr.length

        for (let i = 0; i < len; i++) {
            let cmds = arr[i];
            for (let cmdName in cmds) {
                let cmd = Commands.get(cmdName);
                if (cmd.remove) {
                    cmd.remove(this.nativeElement, cmds[cmdName]);
                }
            }
        }
    }
}