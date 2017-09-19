import { h } from "../h";
import { diff } from "../diff";
import { patch } from "../patch";
import { render } from "../create-element";
import { VPatch, VPatchType, VNode } from "../vnode";
import { RealNodeProxy } from "../element";
import { Component } from "../component";

const log = console.log;
const assert = console.assert;

const rootRealNode = document.getElementById('body');
const rootRealNodeProxy = new RealNodeProxy(new VNode('div'));
rootRealNode.appendChild(rootRealNodeProxy.getRealNode());



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
            }} class={'button'} >{title || '按钮'}
            </button>
        );
    }
}


class App extends Component {
    render() {
        let btnTitle = this.props.btnTitle || 'SecondBut';
        let name = this.props.name;
        let input = name ? <input key={'input1'}></input> : <input key={'input2'}></input>;
        return (
            <div class={'app'}>
                <span style={{ display: 'block' }}>Hello world!</span>
                <Button onclick={() => {
                    this.setAttribute('name', !!!name);
                }} title={btnTitle}>
                </Button>
                {input}
            </div>
        );
    }
}


let firstVNode = (<div style={'height:100px; background-color:red;'}>
    <Button title={'FirstButton'}></Button>
</div>)

let firstRealNode = render(firstVNode)
rootRealNodeProxy.appendChild(firstRealNode);

let secondVNode = (<div >
    <App>
    </App>
</div >)

setTimeout(() => {
    let patches = diff(firstVNode, secondVNode);
    log('*********************************************');
    log(patches);

    log('---------------------------------------------');
    log(firstRealNode);
    let newRootRNode = patch(firstRealNode, patches);
    log('---------------------------------------------');
    log(newRootRNode);

    log('---------------------------------------------');
    log(newRootRNode === firstRealNode);
}, 1000);
