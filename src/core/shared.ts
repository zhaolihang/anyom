export const ComponentHooks = new Set<string>();
ComponentHooks.add("onComponentWillMount");
ComponentHooks.add("onComponentDidMount");
ComponentHooks.add("onComponentWillUnmount");
ComponentHooks.add("onComponentShouldUpdate");
ComponentHooks.add("onComponentWillUpdate");
ComponentHooks.add("onComponentDidUpdate");

export const isBrowser = !!(typeof window !== "undefined" && window.document);

export const isArray = Array.isArray;

export function isInvalid(o: any): o is null | false | true | undefined {
  return isNull(o) || o === false || isTrue(o) || isUndefined(o);
}

export function isString(o: any): o is string {
  return typeof o === "string";
}

export function isNull(o: any): o is null {
  return o === null;
}

export function isTrue(o: any): o is true {
  return o === true;
}

export function isUndefined(o: any): o is undefined {
  return o === void 0;
}

export function isNullOrUndef(o: any): o is undefined {
  return isNull(o) || isUndefined(o);
}

export function isObject(x) {
  return typeof x === "object" && x !== null;
}

export function isFunction(x) {
  return typeof x === "function";
}

export function isEventAttr(name: string) {
  return name[0] === 'o' && name[1] === 'n'
}


export function deepEqual(a, b) {
  if (a === b) return true;

  let arrA = isArray(a);
  let arrB = isArray(b);
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


const noop: any = () => { }
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

