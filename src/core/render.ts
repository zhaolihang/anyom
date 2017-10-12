import { VNode, VNodeType, Instance, NativeElement, createVoidNode } from "./vnode";
import { Component } from "./component";
import { initElementProps } from "./diff-patch";


export function findNativeElementByVNode(vnode: VNode): NativeElement {
    if (!vnode) {
        return;
    }
    if (vnode.type & VNodeType.Node) {
        return vnode.instance as NativeElement
    } else if (vnode.type & VNodeType.Component) {
        if (vnode.type & VNodeType.ComponentFunction) {
            return findNativeElementByVNode(vnode.lastResult)
        } else if (vnode.type & VNodeType.ComponentClass) {
            if (!vnode.instance) {
                return;
            }
            return findNativeElementByVNode((vnode.instance as Component).$$lastResult)
        }
    }
}


export function render(vnode: VNode, parentNode?: NativeElement): NativeElement {
    if (!vnode) {
        return;
    }
    let newParentNode = createInstanceByVNode(vnode, parentNode);
    let children = vnode.children;
    if (children) {
        let len = children.length
        for (let i = 0; i < len; i++) {
            render(children[i], newParentNode || parentNode);
        }
    }

    return newParentNode;
}



// 生命周期
function createInstanceByVNode(vnode: VNode, parentNode: NativeElement): NativeElement {
    if (vnode.type & VNodeType.Node) {
        if (vnode.type & VNodeType.Element) {
            return createElement(vnode, parentNode)
        } else if (vnode.type & VNodeType.Text) {
            return createText(vnode, parentNode);
        } else if (vnode.type & VNodeType.Void) {
            return createVoid(vnode, parentNode);
        }
    } else if (vnode.type & VNodeType.Component) {
        if (vnode.type & VNodeType.ComponentFunction) {
            return createFunctionComponent(vnode, parentNode)
        } else if (vnode.type & VNodeType.ComponentClass) {
            return createClassComponent(vnode, parentNode)
        }
    }
}


function createElement(vnode: VNode, parentNode: NativeElement): NativeElement {
    vnode.instance = document.createElement(vnode.tag as string);
    initElementProps(vnode);
    if (parentNode) {
        parentNode.appendChild(vnode.instance)
    }
    return vnode.instance
}


function createText(vnode: VNode, parentNode: NativeElement): NativeElement {
    vnode.instance = document.createTextNode(vnode.props.value);
    if (parentNode) {
        parentNode.appendChild(vnode.instance)
    }
    return vnode.instance
}


function createVoid(vnode: VNode, parentNode: NativeElement): NativeElement {
    vnode.instance = document.createTextNode('');
    if (parentNode) {
        parentNode.appendChild(vnode.instance)
    }
    return vnode.instance
}

function createFunctionComponent(vnode: VNode, parentNode: NativeElement) {
    let doRender = vnode.tag as Function
    vnode.instance = doRender;
    vnode.lastResult = doRender(vnode.props) || createVoidNode();
    let nativeEle = render(vnode.lastResult, parentNode);
    if (parentNode && nativeEle) {
        parentNode.appendChild(nativeEle)
    }
    return nativeEle;
}

function createClassComponent(vnode: VNode, parentNode: NativeElement) {
    let instance = new (vnode.tag as typeof Component)(vnode.props);
    vnode.instance = instance;
    instance.$$lastResult = instance.render() || createVoidNode();
    let nativeEle = render(instance.$$lastResult, parentNode)
    if (parentNode && nativeEle) {
        parentNode.appendChild(nativeEle)
    }
    return nativeEle;
}
