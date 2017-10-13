
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

export const CommandTriggerMap = new Map<NativeElement, CommandTrigger>();

export class CommandTrigger {
    cmdMap = new Map<string, any>()
    constructor(public nativeElement: NativeElement, cmdsArr: ReadonlyArray<Cmds>) {
        let len = cmdsArr.length
        let cmdMap = this.cmdMap;
        let cmdName;
        let cmds;
        for (let i = 0; i < len; i++) {
            cmds = cmdsArr[i];
            for (cmdName in cmds) {
                cmdMap.set(cmdName, cmds[cmdName]);
            }
        }
    }

    updateCmd(cmds: Cmds) {
        let cmdMap = this.cmdMap;
        let cmdName;
        for (cmdName in cmds) {
            cmdMap.set(cmdName, cmds[cmdName]);
        }
    }

    inserted() {
        this.cmdMap.forEach((cmdValue, cmdName) => {
            let cmd = Commands.get(cmdName);
            if (cmd && cmd.inserted) {
                cmd.inserted(this.nativeElement, cmdValue);
            }
        });
    }

    update() {
        // let cmdMap = this.cmdMap;
        // cmdMap.forEach((cmdValue, cmdName) => {
        //     let cmd = Commands.get(cmdName);
        //     if (cmd.inserted) {
        //         cmd.inserted(this.nativeElement, cmdValue);
        //     }
        // });
    }

    remove() {
        this.cmdMap.forEach((cmdValue, cmdName) => {
            let cmd = Commands.get(cmdName);
            if (cmd && cmd.remove) {
                cmd.remove(this.nativeElement, cmdValue);
            }
        });
    }
}