import { ITagType, VNode } from "./vnode";
import { Component } from "./component";
import { textNodeTagName } from "./h";
import { startsWith, endsWith } from "./utils";

export enum RNodeType {
    NATIVE = 'NATIVE',
    COMPONENT = 'COMPONENT',
}
// export interface RNodeProxy {
//     vNode: VNode;
//     parentNode: RNodeProxy;
//     childNodes: RNodeProxy[];

//     element: any;
//     rNodeType: RNodeType;

//     getElement(): HTMLElement;
//     getObjectAttribute(propName: string): any;

//     appendChild: (x: RNodeProxy) => void;
//     removeChild: (x: RNodeProxy) => void;
//     replaceChild: (newNode: RNodeProxy, oldNode: RNodeProxy) => void;
//     insertBefore: (newNode: RNodeProxy, insertTo: RNodeProxy | null) => void;

//     setAttribute: (propName: string, propValue: any, previous?: any) => void;
//     setAttributeObject: (propName: string, propValue: any, previous?: any) => void;
//     removeAttribute: (propName: string, previous?: any) => void;
// }


/**
 * RNodeProxy is a Proxy
 */
export class RNodeProxy {
    parentNode: RNodeProxy = null
    childNodes: RNodeProxy[] = [];

    rNodeType: RNodeType;
    element: any;

    getElement(): HTMLElement {
        if (this.rNodeType === RNodeType.NATIVE) {
            return (<HTMLElement>this.element);
        } else if (this.rNodeType === RNodeType.COMPONENT) {
            return this.componentGetElement();
        } else {
            throw new Error('未知类型');
        }
    }

    private componentGetElement(): HTMLElement {
        return (<Component>this.element).getRNode().getElement();
    }

    getObjectAttribute(propName: string): any {
        if (this.rNodeType === RNodeType.NATIVE) {
            return (<HTMLElement>this.element)[propName];
        } else {
            return this[propName];
        }
    }

    constructor(public vNode: VNode, context?: Component) {
        if (typeof (vNode.tagName) === 'string') {
            this.rNodeType = RNodeType.NATIVE;
            this.element = this.createXOMByVNode(vNode, context);
        } else if (typeof (vNode.tagName) === 'function') {
            this.rNodeType = RNodeType.COMPONENT;
            this.element = this.createComponentByVNode(vNode, context);
        } else {
            throw new Error('tagName 只能是string 或 Component的子类构造函数');
        }
    }

    private createXOMByVNode(vNode: VNode, context?: Component) {
        if (vNode.tagName === textNodeTagName) {
            return <Text>(document.createTextNode(vNode.properties.value));
        } else {
            let xomElement = <HTMLElement>(document.createElement(vNode.tagName));
            if (context && vNode.properties && vNode.properties.ref) {
                context.refs[vNode.properties.ref] = xomElement
            }
            return xomElement;
        }
    }

    private createComponentByVNode(vNode: VNode, context?: Component): Component {
        let Consr: typeof Component = vNode.tagName;
        let com: Component = new Consr(vNode.properties, context);
        if (!(com instanceof Component)) {
            throw new Error('tagName 不是 Component的子类构造函数');
        }
        return com;
    }

    appendChild(x: RNodeProxy) {
        x.parentNode = this;
        this.childNodes.push(x);
        ///
        if (this.rNodeType === RNodeType.NATIVE) {
            this.xomAppendChild(x);
        } else if (this.rNodeType === RNodeType.COMPONENT) {
            this.componentAppendChild(x);
        }
    }

    private xomAppendChild(x: RNodeProxy) {
        (this.element as HTMLElement).appendChild(x.getElement());
    }
    private componentAppendChild(x: RNodeProxy) {
        this.getElement().appendChild(x.getElement());
    }

    removeChild(x: RNodeProxy, context?: Component) {
        let index = this.childNodes.indexOf(x);
        if (~index) {
            x.parentNode = null;
            this.childNodes.splice(index, 1);
        } else {
            throw Error('被移除的节点没找到,是否是算法错误');
        }
        ///
        if (this.rNodeType === RNodeType.NATIVE) {
            this.xomRemoveChild(x, context);
        } else if (this.rNodeType === RNodeType.COMPONENT) {
            this.componentRemoveChild(x, context);
        }
    }

    private xomRemoveChild(x: RNodeProxy, context?: Component) {
        if (context && x['ref']) {
            delete context.refs[x['ref']];
        }
        (this.element as HTMLElement).removeChild(x.getElement());
    }
    private componentRemoveChild(x: RNodeProxy, context?: Component) {
        if (context && x['ref']) {
            delete context.refs[x['ref']];
        }
        this.getElement().removeChild(x.getElement());
    }

    replaceChild(newNode: RNodeProxy, oldNode: RNodeProxy, context?: Component) {
        let index = this.childNodes.indexOf(oldNode);
        if (~index) {
            oldNode.parentNode = null;
            newNode.parentNode = this;
            this.childNodes.splice(index, 1, newNode);
        } else {
            throw Error('被替换的节点没找到,是否是算法错误');
        }
        ///
        if (this.rNodeType === RNodeType.NATIVE) {
            this.xomReplaceChild(newNode, oldNode);
        } else if (this.rNodeType === RNodeType.COMPONENT) {
            this.componentReplaceChild(newNode, oldNode);
        }
    }

    private xomReplaceChild(newNode: RNodeProxy, oldNode: RNodeProxy, context?: Component) {
        if (context && oldNode['ref']) {
            delete context.refs[oldNode['ref']];
        }
        (this.element as HTMLElement).replaceChild(newNode.getElement(), oldNode.getElement());
    }
    private componentReplaceChild(newNode: RNodeProxy, oldNode: RNodeProxy, context?: Component) {
        if (context && oldNode['ref']) {
            delete context.refs[oldNode['ref']];
        }
        this.getElement().replaceChild(newNode.getElement(), oldNode.getElement());
    }

    insertBefore(newNode: RNodeProxy, insertTo: RNodeProxy | null, context?: Component) {
        if (insertTo) {
            let index = this.childNodes.indexOf(insertTo);
            if (~index) {
                newNode.parentNode = this;
                this.childNodes.splice(index, 0, newNode);
            } else {
                throw Error('要插入的位置节点没找到,是否是算法错误');
            }
        } else {
            newNode.parentNode = this;
            this.childNodes.push(newNode);
        }
        ///
        if (this.rNodeType === RNodeType.NATIVE) {
            this.xomInsertBefore(newNode, insertTo);
        } else if (this.rNodeType === RNodeType.COMPONENT) {
            this.componentInsertBefore(newNode, insertTo);
        }
    }

    private xomInsertBefore(newNode: RNodeProxy, insertTo: RNodeProxy | null) {
        (this.element as HTMLElement).insertBefore(newNode.getElement(), insertTo && insertTo.getElement());
    }
    private componentInsertBefore(newNode: RNodeProxy, insertTo: RNodeProxy | null) {
        this.getElement().replaceChild(newNode.getElement(), insertTo && insertTo.getElement());
    }

    setAttribute(propName: string, propValue: any, previous?: any, context?: Component) {
        this[propName] = propValue;
        ///
        if (this.rNodeType === RNodeType.NATIVE) {
            this.xomSetAttribute(propName, propValue, previous, context);
        } else if (this.rNodeType === RNodeType.COMPONENT) {
            this.componentSetAttribute(propName, propValue, previous, context);
        }
    }

    private xomSetAttribute(propName: string, propValue: any, previous?: any, context?: Component) {
        let element: HTMLElement = this.element;
        if (propName === 'ref') {
            if (context) {
                context.refs[propValue] = element;
                if (previous && previous[propName]) {
                    if (context.refs[previous[propName]] === element) {
                        delete context.refs[previous[propName]]
                    }
                }
            }
            return;
        }
        let event = this.getXOMEventName(propName);
        if (event) {
            if (previous && previous[propName]) {
                element.removeEventListener(event.name, previous[propName], event.capture);
            }
            if (!(typeof propValue === 'function')) {
                throw new Error('事件的值必须是函数');
            }
            element.addEventListener(event.name, propValue, event.capture);
            return;
        }

        if (element.setAttribute) {
            if (propName === 'style' && typeof propValue === 'string') {
                element.style.cssText = propValue;
            } else {
                if (typeof propValue === 'object') {
                    element[propName] = propValue;
                } else {
                    element.setAttribute(propName, propValue);
                }
            }
        } else {
            if (element instanceof Text) {
                if ((element as Text).nodeValue != propValue) {
                    (element as Text).nodeValue = propValue;
                }
            }
        }
    }
    private componentSetAttribute(propName: string, propValue: any, previous?: any, context?: Component) {
        (this.element as Component).setAttribute(propName, propValue, previous, context);
    }

    setAttributeObject(propName: string, propValue: any, previous?: any, context?: Component) {
        this[propName] = this[propName] || {}
        let replacer = undefined;
        for (let k in propValue) {
            let value = propValue[k]
            this[propName][k] = (value === undefined) ? replacer : value
        }

        ///
        if (this.rNodeType === RNodeType.NATIVE) {
            this.xomSetAttributeObject(propName, propValue, previous);
        } else if (this.rNodeType === RNodeType.COMPONENT) {
            this.componentSetAttributeObject(propName, propValue, previous);
        }

    }

    private xomSetAttributeObject(propName: string, propValue: any, previous?: any) {
        let element = (this.element as HTMLElement);
        element[propName] || (element[propName] = {});
        let replacer = undefined;
        for (let k in propValue) {
            let value = propValue[k]
            element[propName][k] = (value === undefined) ? replacer : value
        }
    }

    private componentSetAttributeObject(propName: string, propValue: any, previous?: any) {
        (this.element as Component).setAttributeObject(propName, propValue, previous);
    }

    removeAttribute(propName: string, previous?: any, context?: Component) {
        delete this[propName];
        ///
        if (this.rNodeType === RNodeType.NATIVE) {
            this.xomRemoveAttribute(propName, previous, context);
        } else if (this.rNodeType === RNodeType.COMPONENT) {
            this.componentRemoveAttribute(propName, previous, context);
        }
    }

    private xomRemoveAttribute(propName: string, previous?: any, context?: Component) {
        let element: HTMLElement = this.element;

        if (propName === 'ref' && previous && previous[propName]) {
            if (context) {
                let propValue = previous[propName];
                if (context.refs[propValue] === element) {
                    delete context.refs[propValue]
                }
            }
            return;
        }
        let event = this.getXOMEventName(propName);
        if (event) {
            if (previous && previous[propName]) {
                element.removeEventListener(event.name, previous[propName], event.capture);
            }
        } else {
            if (previous && previous[propName] && typeof previous[propName] === 'object') {
                element[propName] = undefined;
            } else {
                element.removeAttribute(propName);
            }
        }
    }
    private componentRemoveAttribute(propName: string, previous?: any, context?: Component) {
        (this.element as Component).removeAttribute(propName, previous, context);
    }

    private getXOMEventName(propName: string) {
        //propName eg: 'on-click-capture'
        propName = propName.toLowerCase();
        if (startsWith(propName, 'on-')) {
            if (endsWith(propName, '-capture')) {
                return { name: propName.substring(3, propName.length - 1 - 8), capture: true };
            } else {
                return { name: propName.substring(3), capture: false };
            }
        }
    }

}

export function createRNodeProxyByVNode(vnode: VNode, context?: Component): RNodeProxy {
    return new RNodeProxy(vnode, context);
}
