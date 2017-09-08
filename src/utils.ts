
export function isObject(x) {
    return typeof x === "object" && x !== null;
};

export function isArray(x) {
    return Array.isArray(x);
}