export const ComponentHooks = new Set<string>();
ComponentHooks.add("onComponentWillMount");
ComponentHooks.add("onComponentDidMount");
ComponentHooks.add("onComponentWillUnmount");
ComponentHooks.add("onComponentShouldUpdate");
ComponentHooks.add("onComponentWillUpdate");
ComponentHooks.add("onComponentDidUpdate");


// We need EMPTY_OBJ defined in one place.
// Its used for comparison so we cant inline it into shared
export const EMPTY_OBJ = {};

if (process.env.NODE_ENV !== "production") {
  Object.freeze(EMPTY_OBJ);
}

export const isBrowser = !!(typeof window !== "undefined" && window.document);

export const isArray = Array.isArray;

export function isNullOrUndef(o: any): o is undefined | null {
  return isUndefined(o) || isNull(o);
}

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

export function isObject(x) {
  return typeof x === "object" && x !== null;
}

export function eventAttr(name: string) {
  if (name[0] === 'o' && name[1] === 'n') {
    return name.substring(2).toLowerCase();
  }
}