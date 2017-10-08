import { NodeProxy } from "./node-proxy";

export function noop(...x: any[]): any;
export function noop() { };

export function isObject(x) {
    return typeof x === "object" && x !== null;
};

export function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value);
    } else if (value.__proto__) {
        return value.__proto__;
    } else if (value.constructor) {
        return value.constructor.prototype;
    }
}

export function overwrite(target, src) {
    for (let i in src) {
        target[i] = src[i];
    }
    return target;
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


export function ascending(a, b) {// 升序
    return a > b ? 1 : -1;
}


// Binary search for an index in the interval [left, right]
export function indexInRange(indices, left, right) {
    if (indices.length === 0) {
        return false;
    }

    let minIndex = 0;
    let maxIndex = indices.length - 1;
    let currentIndex;
    let currentItem;

    while (minIndex <= maxIndex) {
        currentIndex = ((maxIndex + minIndex) / 2) >> 0;
        currentItem = indices[currentIndex];

        if (minIndex === maxIndex) {
            return currentItem >= left && currentItem <= right;
        } else if (currentItem < left) {
            minIndex = currentIndex + 1;
        } else if (currentItem > right) {
            maxIndex = currentIndex - 1;
        } else {
            return true;
        }
    }

    return false;
}

const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop,
}
export function proxy(target: any, source: any, key: string) {
    if (target[key]) {
        console.warn('proxy prop [' + key + '] already exists')
        return;
    }
    sharedPropertyDefinition.get = function proxyGetter() {
        return source[key];
    }
    sharedPropertyDefinition.set = function proxySetter(val) {
        source[key] = val;
    }
    Object.defineProperty(target, key, sharedPropertyDefinition)
}



export function getParentNode(node: NodeProxy): NodeProxy {
    return node.parentNode
}

export function replaceChild(parentNode: NodeProxy, newNode: NodeProxy, oldNode: NodeProxy) {
    parentNode.replaceChild(newNode, oldNode);
}

export function getChildNodes(nodeProxy: NodeProxy): NodeProxy[] {
    return nodeProxy.childNodes;
}

export function removedChild(parent: NodeProxy, child: NodeProxy) {
    parent.removeChild(child);
}

export function removedChildWithArg(parent: NodeProxy, child: NodeProxy, recycle = false) {
    parent.removeChild(child, recycle);
}

export function appendChild(parent: NodeProxy, child: NodeProxy) {
    parent.removeChild(child);
}
export function insertChildWithArg(parent: NodeProxy, newNode: NodeProxy, insertTo: NodeProxy | null, recycle = false) {
    parent.insertBefore(newNode, insertTo, recycle);
}


export function setComponentProps(nodeProxy: NodeProxy, props, previous?: any) {
    nodeProxy.setComponentProps(props, previous);
}

export function setRef(nodeProxy: NodeProxy, patch) {
    nodeProxy.setRef(patch);
}

