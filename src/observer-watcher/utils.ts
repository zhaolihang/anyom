export function isObject(obj: any): boolean {
    return obj !== null && typeof obj === 'object';
}

export function isPlainObject(obj: any): boolean {
    return Object.prototype.toString.call(obj) === '[object Object]';
}

export function isValidArrayIndex(val: any): boolean {
    const n = parseFloat(val);
    return n >= 0 && Math.floor(n) === n && isFinite(val);
}

export const hasProto = '__proto__' in {};

export function hasOwn(obj: Object | Array<any>, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

export function def(obj: Object, key: string, val: any, enumerable?: boolean) {
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true
    });
}

export function remove(arr: Array<any>, item: any): Array<any> | void {
    if (arr.length) {
        const index = arr.indexOf(item);
        if (index > -1) {
            return arr.splice(index, 1);
        }
    }
}

const bailRE = /[^\w.$]/
export function segmentsPath(path: string) {
    if (bailRE.test(path)) {
        throw Error('bad path ' + path);
    }
    const segments = path.split('.');
    return segments;
}

export function getObjBySegments(obj: any, segments: string[]): any {
    for (let i = 0; i < segments.length; i++) {
        if (!obj) {
            return;
        }
        obj = obj[segments[i]];
    }
    return obj;
}

export function parsePath(path: string) {
    const segments = segmentsPath(path);
    return function (obj) {
        return getObjBySegments(obj, segments);
    }
}


interface ISet {
    has(key: string | number): boolean;
    add(key: string | number): any;
    clear(): void;
}

class Set implements ISet {
    set: Object;

    constructor() {
        this.set = Object.create(null);
    }

    has(key: string | number) {
        return this.set[key] === true;
    }

    add(key: string | number) {
        this.set[key] = true;
    }

    clear() {
        this.set = Object.create(null);
    }
}

export { ISet, Set };
