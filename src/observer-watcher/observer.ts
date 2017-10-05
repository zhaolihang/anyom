import Dep from './dep'
import { arrayMethods } from './array'
import {
    def,
    hasProto,
    isObject,
    hasOwn,
    isPlainObject,
    isValidArrayIndex
} from "./utils"
import Watcher from "./watcher"

const arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * By default, when a reactive property is set, the new value is
 * also converted to become reactive. However when passing down props,
 * we don't want to force conversion because the value may be a nested value
 * under a frozen data structure. Converting it would defeat the optimization.
 */
export const observerState = {
    shouldConvert: true,
    isSettingProps: false
}

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 */
export class Observer {
    value: any;
    dep: Dep = new Dep();

    constructor(value: any) {
        this.value = value;
        def(value, '__observer__', this);

        if (Array.isArray(value)) {
            hasProto ? protoAugment(value, arrayMethods) : copyAugment(value, arrayMethods, arrayKeys);
            this.observeArray(value);
        } else {
            this.walk(value);
        }

    }

    /**
   * Walk through each property and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
    walk(obj: Object) {
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            defineReactive(obj, keys[i], obj[keys[i]]);
        }
    }

    /**
   * Observe a list of Array items.
   */
    observeArray(items: Array<any>) {
        for (let i = 0, l = items.length; i < l; i++) {
            observe(items[i]);
        }
    }
}

// helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment(target, src: Object, keys?: any) {
    /* eslint-disable no-proto */
    target.__proto__ = src;
    /* eslint-enable no-proto */
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
function copyAugment(target: Object, src: Object, keys: Array<string>) {
    for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i];
        def(target, key, src[key]);
    }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
export function observe(value: any): Observer | void {
    if (!isObject(value)) {
        return;
    }

    let ob: Observer | void;

    if (hasOwn(value, '__observer__') && value.__observer__ instanceof Observer) {
        ob = value.__observer__;
    } else if (observerState.shouldConvert && (Array.isArray(value)
        || isPlainObject(value)) && Object.isExtensible(value)) {
        ob = new Observer(value);
    }

    return ob;

}

export function getObserver(value: any) {
    return value && value.__observer__
}
/**
 * Define a reactive property on an Object.
 */
export function defineReactive(obj: Object, key: string, val: any) {
    const dep = new Dep();

    const property = Object.getOwnPropertyDescriptor(obj, key);
    if (property && property.configurable === false) {
        return;
    }

    // cater for pre-defined getter/setters
    const getter = property && property.get;
    const setter = property && property.set;

    let childOb = observe(val)
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function reactiveGetter() {

            const value = getter ? getter.call(obj) : val;

            if (Dep.target) {
                dep.depend();
                if (childOb) {
                    childOb.dep.depend();
                }

                if (Array.isArray(value)) {
                    dependArray(value);
                }
            }

            return value;
        },

        set: function reactiveSetter(newVal) {

            const value = getter ? getter.call(obj) : val;

            if (newVal === value || (newVal !== newVal && value !== value)) {
                return;
            }

            if (setter) {
                setter.call(obj, newVal);
            } else {
                val = newVal;
            }

            childOb = observe(newVal);
            dep.notify();
        }
    })
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
export function set(target: Array<any> | Object, key: any, val: any): any {

    if (Array.isArray(target) && isValidArrayIndex(key)) {
        target.length = Math.max(target.length, key);
        target.splice(key, 1, val);
        return val;
    }

    if (hasOwn(target, key)) {
        target[key] = val;
        return val;
    }

    const ob = (target as any).__observer__;

    if (!ob) {
        target[key] = val;
        return val;
    }

    defineReactive(ob.value, key, val);
    ob.dep.notify();

    return val;
}

/**
 * Delete a property and trigger change if necessary.
 */
export function del(target: Array<any> | Object, key: any) {

    if (Array.isArray(target) && isValidArrayIndex(key)) {
        target.splice(key, 1);
        return;
    }

    const ob = (target as any).__observer__;

    if (!hasOwn(target, key)) {
        return;
    }

    delete target[key];
    if (!ob) {
        return;
    }

    ob.dep.notify();
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray(value: Array<any>) {
    for (let e, i = 0, l = value.length; i < l; i++) {
        e = value[i];
        e && e.__observer__ && e.__observer__.dep.depend();

        if (Array.isArray(e)) {
            dependArray(e);
        }

    }
}
