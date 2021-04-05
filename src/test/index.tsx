import { h, VNode, VNodeType } from "../core/vnode";
import { render } from "../core/render";
import { Component } from "../core/component";
import { setCommand } from "../core/command";
let log = console.log;
setCommand('cmd-tester', {
    inserted(node, newV) {
        log('cmd-tester  inserted', node, newV);
    },
    update(node, newV, oldV) {
        log('cmd-tester  update', node, newV, oldV);
    },
    remove(node, oldV) {
        log('cmd-tester  remove', node, oldV);
    },
});

class FirstComponent extends Component {

    state = { clickCount: 0 }

    private onClick() {
        this.state.clickCount++;
        this.setState(this.state);
    }

    render() {
        let clickFun = this.onClick.bind(this);
        var text = 'clickCount:' + this.state.clickCount;
        return <div onClick={clickFun}>{text}</div>;
    }
}

function SecondComponent(props) {
    return <div>Static Component</div>
}

function PluginTest(props) {
    let num = Math.random();
    return <div cmd-tester={num}>PluginTest+{num}</div>
}

let rootVNode = <div><FirstComponent /><SecondComponent /><PluginTest /></div>
render(rootVNode, document.body);





let body = document.body
import { diff } from "../core/diff-patch";


// class AbstructCom0 extends Component {
//     render() {
//         // log(this)
//         return <div>AbstructCom0</div>
//     }
// }

// class AbstructCom1 extends Component {
//     render() {
//         // log(this)
//         return <div {...this.props} >AbstructCom1</div>
//     }
// }

// class AbstructCom2 extends Component {
//     render() {
//         if (this.props.nouse) {
//             return <AbstructCom1 nouse={this.props.nouse}></AbstructCom1>
//         } else {
//             return <AbstructCom0 nouse={this.props.nouse}></AbstructCom0>
//         }
//     }
// }

// function AbstructCom3(props) {
//     return <AbstructCom2 nouse={props.nouse} cmd-tester={props.nouse}></AbstructCom2>
// }



// class FirstComponent extends Component {

//     state = { clickCount: 0 }

//     private onClick() {
//         this.state.clickCount++;
//         this.setState(this.state);
//     }

//     render() {
//         let clickFun = this.onClick.bind(this);
//         var text = 'clickCount:' + this.state.clickCount;
//         return <div onClick={clickFun}>{text}</div>;
//     }
// }

// function SecondComponent(props) {
//     return <div>Static Component</div>
// }

// let rootVNode = <div><FirstComponent /><SecondComponent /></div>
// render(rootVNode, document.body, null) ;

// // var b = 

// //                 <div class="a" id="b">我是内容</div >
// // let a =
// //                 {
// //                     tag: 'div',        // 元素标签
// //                     type: 2,           // Element类型
// //                     props: {           // 属性
// //                         class: 'a',
// //                         id: 'b'
// //                     },
// //                     children: [         // 子元素
// //                         {
// //                             type: 1,           // Text类型
// //                             props: {           // 属性
// //                                 value: '我是内容', // 文本内容
// //                             },
// //                             children:[]         // 子元素
// //                         }
// //                     ] 
// //                 }

// // onClick() // 用户操作
// //     Component.setState(state) // 更新组件状态
// //         queueComponent(Component) // 加入更新队列
// //             queue.push(Component)

// // flushSchedulerQueue() // 每一帧更新队列中的组件
// //     Component.$$updateComponent(); // 更新组件
// //         Component = queue.pop()
// //         currentVNode = Component.render() // 生成新的VNode
// //         diff(lastVNode, currentVNode) // 对比&更新


// // let vnode1 = <div style={{ background: "blue" }} ><AbstructCom3 nouse={0}></AbstructCom3></div>
// // let vnode2 = <div style={{ background: "red" }} ><AbstructCom3 nouse={1}></AbstructCom3></div>

// // let ele = render(vnode1, body, null)
// // log(vnode1)

// // let debug = 0;
// // setTimeout(() => {

// //     diff(vnode1, vnode2, null)
// //     // log(vnode2);

// // }, 1000);



