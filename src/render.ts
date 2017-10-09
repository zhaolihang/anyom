import { VNode, VNodeType, Instance, NativeElement } from "./vnode";
import { Component } from "./component";

export function render(vnode: VNode, parentNode?: NativeElement) {
    let newParentNode = createInstanceByVNode(vnode, parentNode);
    let children = vnode.children;
    if (children) {
        let len = children.length
        for (let i = 0; i < len; i++) {
            render(children[i], newParentNode);
        }
    }
}


// 生命周期
function createInstanceByVNode(vnode: VNode, parentNode: NativeElement): NativeElement {
    if (vnode.type & VNodeType.Node) {
        if (vnode.type & VNodeType.Element) {
            return createElement(vnode, parentNode)
        } else if (vnode.type & VNodeType.Text) {
            return createTextNode(vnode, parentNode);
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
    if (parentNode) {
        parentNode.appendChild(vnode.instance)
    }
    return vnode.instance
}

function createTextNode(vnode: VNode, parentNode: NativeElement): NativeElement {
    vnode.instance = document.createTextNode(vnode.props.value);
    if (parentNode) {
        parentNode.appendChild(vnode.instance)
    }
    return vnode.instance
}

function createFunctionComponent(vnode: VNode, parentNode: NativeElement) {
    vnode.instance = vnode.tag as Function;
    return parentNode
}
function createClassComponent(vnode: VNode, parentNode: NativeElement) {
    vnode.instance = new (vnode.tag as typeof Component)(vnode.props);
    return parentNode
}


function getFirstChild(parentNode: NativeElement): NativeElement {
    return parentNode.firstChild
}

