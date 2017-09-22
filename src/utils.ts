
export function isObject(x) {
    return typeof x === "object" && x !== null;
};

export function isArray(x) {
    return Array.isArray(x);
}

export function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value);
    } else if (value.__proto__) {
        return value.__proto__;
    } else if (value.constructor) {
        return value.constructor.prototype;
    }
}

/** Copy own-properties from `src` onto `target`.
 *	@returns target
 */
export function overwrite(target, src) {
    for (let i in src) {
        target[i] = src[i];
    }
    return target;
}

export function startsWith(str: string, searchStr: string, position = 0) {
    return str.substr(position || 0, searchStr.length) === searchStr;
}

export function endsWith(str: string, searchStr: string, position = 0) {
    if (!(position < str.length)) {
        position = str.length;
    }
    else {
        position |= 0; // round position
    }
    return str.substr(position - searchStr.length, searchStr.length) === searchStr;
}

export function deepEqual(a, b) {
    if (a === b) return true;

    let arrA = Array.isArray(a);
    let arrB = Array.isArray(b);
    let i;

    if (arrA && arrB) {
        if (a.length != b.length) return false;
        for (i = 0; i < a.length; i++)
            if (!deepEqual(a[i], b[i])) return false;
        return true;
    }

    if (arrA != arrB) return false;

    if (a && b && typeof a === 'object' && typeof b === 'object') {
        let keys = Object.keys(a);
        if (keys.length !== Object.keys(b).length) return false;

        let dateA = a instanceof Date;
        let dateB = b instanceof Date;
        if (dateA && dateB) return a.getTime() == b.getTime();
        if (dateA != dateB) return false;

        let regexpA = a instanceof RegExp;
        let regexpB = b instanceof RegExp;
        if (regexpA && regexpB) return a.toString() == b.toString();
        if (regexpA != regexpB) return false;

        for (i = 0; i < keys.length; i++)
            if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

        for (i = 0; i < keys.length; i++)
            if (!deepEqual(a[keys[i]], b[keys[i]])) return false;

        return true;
    }

    return false;
}
