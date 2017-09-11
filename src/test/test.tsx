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
        let onclick = this.props.onclick;
        log('>>> Button render this.props ->', this.props);
        return (
            <button on-click={(e) => {
                if (onclick) {
                    onclick(e);
                }
            }} class={'button'} >{title || '按钮'}</button>
        );
    }
}


class App extends Component {
    render() {
        let buttonTitle = this.props.buttonTitle || '951';
        return (
            <div class={'app'}>
                <span style={{ display: 'block' }}>Hello world!</span>
                <Button ref='ButtonRef' onclick={() => {
                    log(this.refs)
                    this.setAttribute('buttonTitle', Math.random());
                }} title={buttonTitle}>
                    <div ref='div'>
                        this is a div
                    </div>
                </Button>
            </div>
        );
    }
}



let rootVNode1 = (<div style={'height:100px; background-color:red;'}>
    <Button title={'111'}></Button>
</div>)
let rootXom = document.getElementById('body');
let rootRNode = render(rootVNode1)
let root = new RNodeProxy(new VNode('div'));
root.appendChild(rootRNode);
rootXom.appendChild(root.getElement());

let rootVNode2 = (<div >
    <App>
    </App>
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
