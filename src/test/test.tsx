import { h } from "../h";
import { diff } from "../diff";
import { patch } from "../patch";
import { render } from "../create-element";
import { VPatch, VPatchType, VNode } from "../vnode";
import { RealNodeProxy } from "../element";
import { Component } from "../component";

const log = console.log;
const assert = console.assert;

const rootNode = document.getElementById('body');
let divVNode = new VNode('div');
const rootRealNodeProxy = new RealNodeProxy(divVNode);
rootNode.appendChild(rootRealNodeProxy.getRealNode());



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
    created() {
        log('created');
    }
    mounted() {
        log('mounted');
    }
    unmounted() {
        log('unmounted');
    }
    updated() {
        log('updated');
    }

    render() {
        let btnTitle = this.props.btnTitle || 'SecondBut';
        let isName = this.props.isName;
        let input = isName ? <input key='name' ref='name' type='text' placeholder='name'></input> : <input key='password' ref='password' type='password' placeholder='password'></input>;
        return (
            <div class={'app'}>
                <span style={{ display: 'block' }}>Hello world!</span>
                <Button ref="button" onclick={() => {
                    this.setAttribute('isName', !!!isName);
                }} title={btnTitle}>
                </Button>
                {input}
            </div>
        );
    }
}


let firstVNode = (<div commands={[{ name: 'cmd', value: { a: 123 } }]}>
    {/* <Button title={'FirstButton'}></Button> */}
    <div key={'1'}>111</div>
    <div key={'2'}>222</div>
    <div key={'3'}>333</div>
    <div key={'4'}>444</div>
</div>)

let firstNode = render(firstVNode)
rootRealNodeProxy.appendChild(firstNode);

let secondVNode = (<div commands={[{ name: 'cmd', value: { a: 123 } }]}>

    <div key={'10'}>101010</div>
    <div key={'4'}>444</div>
    <div key={'3'}>333</div>
    <div key={'2'}>222</div>
    <img height="100" src="http://nodejs.cn/static/images/logo.svg"></img>
    <App>
    </App>
    <div innerHTML="<div>I'm from innerHtml</div>"></div>
</div >)

setTimeout(() => {
    let patches = diff(firstVNode, secondVNode);
    log('*********************************************');
    log(patches);

    log('---------------------------------------------');
    log(firstNode);
    let newRootRNode = patch(firstNode, patches);
    log('---------------------------------------------');
    log(newRootRNode);

    log('---------------------------------------------');
    log(newRootRNode === firstNode);
}, 1000);

(window as any).getRootNode = function () {
    return rootRealNodeProxy;
}