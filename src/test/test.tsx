import { h } from "../h";
import { diff } from "../diff";
import { patch } from "../patch";
import { render } from "../create-element";
import { VPatch, VPatchType, VNode } from "../vnode";
import { RNodeProxy } from "../element";
import { Component } from "../component";

let log = console.log;
let assert = console.assert;

class Button extends Component {
    render() {
        let title = this.props.title;
        log('>>> Button render this.props ->', this.props);
        return (
            <button on-click={(e) => {
                log(e);
                this.setAttribute('title', Math.random());
            }} class={'button'} name={'simple button'}>{title || '按钮'}</button>
        );
    }
}


class App extends Component {
    render() {
        return (
            <div class={'app'}>
                Hello world!
                <Button title={'951'}></Button>
            </div>
        );
    }
}



let rootVNode1 = (<div>
    <Button title={'111'}></Button>
</div>)
let rootXom = document.getElementById('body');
let rootRNode = render(rootVNode1)
let root = new RNodeProxy(new VNode('div'));
root.appendChild(rootRNode);
rootXom.appendChild(root.getElement());

let rootVNode2 = (<div >
    <Button title={'222'}></Button>
</div >)

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
}, 1000);
