import { h } from "../h";
import { diff } from "../diff";
import { patch } from "../patch";
import { render } from "../create-element";
import { VPatch, VPatchType, VNode } from "../vnode";
import { RNode } from "../element";
import { Component } from "../component";

let log = console.log;
let assert = console.assert;

class Button extends Component {
    render() {
        let children = this.props.children;
        log('>>> Button render this.props ->', this.props);
        return (
            <button class={'button'} name={'simple button'}>{children || '按钮'}</button>
        );
    }
}


class App extends Component {
    render() {
        return (
            <div class={'app'}>
                <Button>but</Button>
            </div>
        );
    }
}



let rootVNode1 = (<div>
    <input value={'123'} ></input>
</div>)
let rootXom = document.getElementById('body');
let rootRNode = render(rootVNode1)
let root = new RNode(new VNode('div'));
root.appendChild(rootRNode);
rootXom.appendChild(root.getElement());



let rootVNode2 = (<div >
    <input value={'00'} ></input>
    <Button></Button>
    <App></App>
</div>)

setTimeout(() => {
    let patches = diff(rootVNode1, rootVNode2);
    log('*********************************************');
    log(patches);

    log('---------------------------------------------');
    log(rootRNode);
    let newRootRNode = patch(rootRNode, patches);
    log('---------------------------------------------');
    log(newRootRNode);

    log('---------------------------------------------');
    log(newRootRNode === rootRNode);
}, 2000);
