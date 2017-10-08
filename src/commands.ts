
const Commands = new Map<string, any>();

export type ICommandObjType = {
    bind?: (node, newValue) => any,
    update?: (node, newValue, oldValue) => any,
    unbind?: (node, oldValue) => any,
};

export function setCommand(name: string, cmdObj: ICommandObjType) {
    if (Commands.has(name)) {
        return Commands.get(name);
    }
    Commands.set(name, cmdObj);
    return cmdObj;
}

export function hasCommand(name: string): boolean {
    return Commands.has(name);
}

export function getCommand(name: string): ICommandObjType {
    return Commands.get(name);
}
