import { h, VNode, VNodeType } from "../core/vnode";
import { render } from "../core/render";
import { diff } from "../core/diff";
import { patch } from "../core/patch";
import { Component } from "../core/component";
let body = document.body
let log = console.log;


class Button extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick(e) {
        if (this.props.onClick) {
            this.props.onClick(e)
        }
    }

    render() {
        return (
            <button onClick={this.onClick}>
                button
            </button>
        )
    }
}

function App(props) {
    return (
        <div>
            {props.text}
        </div>
    )
}


class TestCom extends Component {

    num = 0;

    constructor(props) {
        super(props)
        this.onClick = this.onClick.bind(this);
    }

    onClick() {
        this.setState({
            appText: 'appText' + this.num++
        });
    }

    getInitialState() {
        return {
            appText: 'appText'
        }
    }


    render() {
        return (
            <div>
                <Button onClick={this.onClick}>
                </Button>
                <App text={this.state.appText}>
                </App>
            </div>

        )
    }
}

let vnode1 = <div style={{ backgroundColor: 'red', height: '50px' }}>
    <TestCom></TestCom>
</div >
let vnode2 = <div >
    <TestCom></TestCom>
</div >


vnode1 = <div>
    <div key={'a'}>
        a
    </div>
    <div key={'b'}>
        b
    </div>
    <div key={'c'}>
        c
    </div>
    <div key={'d'}>
        d
    </div>
    <div key={'e'}>
        e
    </div>
</div>

vnode2 = <div>
    <div key={'e'}>
        e
    </div>
    <div key={'a'}>
        a
    </div>
    <div key={'b'}>
        b
    </div>
    <div key={'c'}>
        c
    </div>
    <div key={'d'}>
        d
    </div>
    <div key={'f'}>
        f
    </div>
</div>

let ele = render(vnode1, body)

setTimeout(() => {

    diff(vnode1, vnode2)
    log(vnode2);

}, 1000);



