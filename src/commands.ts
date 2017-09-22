let Commands = {

}

export type ICommandObjType = {
    bind?: (node, newValue) => any,
    update?: (node, newValue, oldValue) => any,
    unbind?: (node) => any,
};

export function setCommand(name: string, cmdObj: ICommandObjType) {
    Commands[name] = cmdObj;
    return cmdObj;
}

export function getCommand(name: string): ICommandObjType {
    return Commands[name];
}