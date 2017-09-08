
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
