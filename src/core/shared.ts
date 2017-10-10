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

export const NO_OP = "$NO_OP";
export const ERROR_MSG =
  "a runtime error occured! Use Inferno in development environment to find the error.";

// This should be boolean and not reference to window.document
export const isBrowser = !!(typeof window !== "undefined" && window.document);

export function toArray(children): any[] {
  return isArray(children) ? children : children ? [children] : children;
}

// this is MUCH faster than .constructor === Array and instanceof Array
// in Node 7 and the later versions of V8, slower in older versions though
export const isArray = Array.isArray;

export function isStringOrNumber(o: any): o is string | number {
  const type = typeof o;
  return type === "string" || type === "number";
}

export function isNullOrUndef(o: any): o is undefined | null {
  return isUndefined(o) || isNull(o);
}

export function isInvalid(o: any): o is null | false | true | undefined {
  return isNull(o) || o === false || isTrue(o) || isUndefined(o);
}

export function isFunction(o: any): o is Function {
  return typeof o === "function";
}

export function isString(o: any): o is string {
  return typeof o === "string";
}

export function isNumber(o: any): o is number {
  return typeof o === "number";
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
};

export function throwError(message?: string) {
  if (!message) {
    message = ERROR_MSG;
  }
  throw new Error(`Inferno Error: ${message}`);
}

export function warning(message: string) {
  console.warn(message);
}

export function eventAttr(name: string) {
  if (name[0] === 'o' && name[1] === 'n') {
    return name.substring(2).toLowerCase();
  }
}

export function combineFrom(first?: {} | null, second?: {} | null): object {
  const out = {};
  if (first) {
    for (const key in first) {
      out[key] = first[key];
    }
  }
  if (second) {
    for (const key in second) {
      out[key] = second[key];
    }
  }
  return out;
}

/*
 * This is purely a tiny event-emitter/pubsub
 */
export interface LifecycleClass {
  listeners: Array<() => void>;
  addListener(callback: Function): void;
  trigger(): void;
}

export function Lifecycle() {
  this.listeners = [];
}

Lifecycle.prototype.addListener = function addListener(callback) {
  this.listeners.push(callback);
};
Lifecycle.prototype.trigger = function trigger() {
  const listeners = this.listeners;

  let listener;
  // We need to remove current listener from array when calling it, because more listeners might be added
  while ((listener = listeners.shift())) {
    listener();
  }
};
