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

export function isObject(x) {
  return typeof x === "object" && x !== null;
}

export function isEventAttr(name: string) {
  return name[0] === 'o' && name[1] === 'n'
}