
export function isObject(x) {
    return typeof x === "object" && x !== null;
};

export function isArray(x) {
    return Array.isArray(x);
}

export function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value)
    } else if (value.__proto__) {
        return value.__proto__
    } else if (value.constructor) {
        return value.constructor.prototype
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
    if (!(position < str.length))
        position = str.length;
    else
        position |= 0; // round position
    return str.substr(position - searchStr.length, searchStr.length) === searchStr;
}

