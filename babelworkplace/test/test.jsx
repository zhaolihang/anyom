var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { diff } from "../diff";
import { patch } from "../patch";
import { render } from "../create-element";
import { Component } from "../component";
import { setCommand } from "../commands";
import { VNode, h } from "../vnode";
var log = console.log;
{
    var body = document.getElementsByTagName("body")[0];
    var temp = document.createElement("div");
    temp.innerHTML = "<div id=\"fullscreenshadow_for_dragmovepanel\" style=\"display:none;position:fixed;top:0;left:0;width:10000px;height:10000px;z-index:500;\"></div>";
    var shadow = temp.removeChild(temp.childNodes[0]);
    body.insertBefore(shadow, body.childNodes[0]);
    shadow.addEventListener("mousedown", function (event) { }, false);
    shadow.addEventListener("mousemove", function (event) { }, false);
    shadow.addEventListener("mouseend", function (event) { }, false);
}
var draggableDataName = 'html_draggable_droppable_dataname';
setCommand('draggable', {
    bind: function (node, newValue) {
        log('draggable bind');
        node.draggable = true;
        var data = newValue;
        node[draggableDataName] = data;
        var addDragCb = function (el) {
            el.onselectstart = function () {
                return false;
            };
            el.ondragstart = function (ev) {
                var el = ev.target;
                var h5dragedData = el[draggableDataName];
                ev.dataTransfer.effectAllowed = "copy";
                ev.dataTransfer.setData("h5dragedData", JSON.stringify(h5dragedData));
                return true;
            };
            el.ondragend = function (ev) {
                ev.dataTransfer.clearData("h5dragedData");
                return false;
            };
        };
        addDragCb(node);
    },
    update: function (node, newValue, oldValue) {
        log('draggable update');
        var data = newValue;
        node[draggableDataName] = data;
    },
    unbind: function (node, oldValue) {
        log('draggable unbind');
    },
});
setCommand('droppable', {
    bind: function (node, newValue) {
        log('droppable bind');
        var cb = newValue;
        var startColor = undefined;
        var timeID;
        var ishight = false;
        var hightLightElm = function () {
            if (startColor === undefined) {
                startColor = node.style.backgroundColor;
                node.style.backgroundColor = "red";
            }
        };
        var unHightLightElm = function () {
            node.style.backgroundColor = startColor;
            startColor = undefined;
        };
        var hightLight = function () {
            hightLightElm();
            if (timeID) {
                clearTimeout(timeID);
            }
            timeID = setTimeout(function () {
                timeID = 0;
                unHightLightElm();
            }, 100);
        };
        node.ondragover = function (ev) {
            ev.preventDefault();
            hightLight();
            return true;
        };
        node.ondragenter = function (ev) {
            return true;
        };
        node.ondrop = function (ev) {
            ev.preventDefault();
            var h5dragedData = ev.dataTransfer.getData("h5dragedData");
            var error;
            try {
                h5dragedData = JSON.parse(h5dragedData);
            }
            catch (e) {
                error = 'error: droped data isnot JSON!';
            }
            if (typeof cb === 'function') {
                cb(error, h5dragedData);
            }
            return false;
        };
    },
    update: function (node, newValue, oldValue) {
        log('droppable update');
    },
    unbind: function (node) {
        log('droppable unbind');
    },
});
setCommand('dragmove', {
    bind: function (node, newValue) {
        log('dragmove bind');
        var dragEl = node;
        dragEl.style.position = 'fixed';
        var nMouseX, nMouseY, nStartX, nStartY;
        var bMouseUp = true;
        dragEl.addEventListener('mousedown', function (mousedownEv) {
            var shouldExit = true;
            for (var target = mousedownEv.target; target; target = target.parentNode) {
                if (target === dragEl) {
                    shouldExit = false;
                    break;
                }
            }
            if (shouldExit) {
                return;
            }
            var shadow = document.getElementById('fullscreenshadow_for_dragmovepanel');
            if (shadow) {
                shadow.style.display = "block";
            }
            bMouseUp = false;
            nStartX = nStartY = 0;
            nMouseX = mousedownEv.clientX;
            nMouseY = mousedownEv.clientY;
            var moveEl = dragEl;
            moveEl.style.zIndex = '1001';
            for (var offParent = moveEl; offParent; offParent = offParent.offsetParent) {
                nStartX += offParent.offsetLeft;
                nStartY += offParent.offsetTop;
            }
            var mousemoveHandler = function (mousemoveEv) {
                if (bMouseUp) {
                    return;
                }
                moveEl.style.left = String(nStartX + mousemoveEv.clientX - nMouseX) + "px";
                moveEl.style.top = String(nStartY + mousemoveEv.clientY - nMouseY) + "px";
                mousemoveEv.stopPropagation();
                mousemoveEv.preventDefault();
            };
            var mouseupHandler = function (mouseupEv) {
                bMouseUp = true;
                moveEl.style.zIndex = '1000';
                var shadow = document.getElementById('fullscreenshadow_for_dragmovepanel');
                if (shadow) {
                    shadow.style.display = "none";
                }
                document.removeEventListener('mousemove', mousemoveHandler);
                document.removeEventListener('mouseup', mouseupHandler);
                mouseupEv.stopPropagation();
                mouseupEv.preventDefault();
            };
            document.addEventListener('mousemove', mousemoveHandler);
            document.addEventListener('mouseup', mouseupHandler);
            mousedownEv.stopPropagation();
            mousedownEv.preventDefault();
        });
    },
    update: function (node, newValue, oldValue) {
        log('dragmove update');
    },
    unbind: function (node) {
        log('dragmove unbind');
    },
});
var rootNode = document.getElementById('body');
var rootNodeProxy = render(new VNode('div'));
rootNode.appendChild(rootNodeProxy.getNativeNode());
var Tag = /** @class */ (function (_super) {
    __extends(Tag, _super);
    function Tag() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Tag.prototype.mounted = function () {
        log('Tag mounted');
    };
    Tag.prototype.unmounted = function () {
        log('Tag unmounted');
    };
    Tag.prototype.render = function () {
        return (<div>small tag</div>);
    };
    return Tag;
}(Component));
var Button = /** @class */ (function (_super) {
    __extends(Button, _super);
    function Button() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Button.prototype.created = function () {
        log('Button created');
    };
    Button.prototype.mounted = function () {
        log('Button mounted');
    };
    Button.prototype.unmounted = function () {
        log('Button unmounted');
    };
    Button.prototype.beforeUpdate = function () {
        log('Button beforeUpdate');
    };
    Button.prototype.afterUpdate = function () {
        log('Button afterUpdate');
    };
    Button.prototype.render = function () {
        var title = this.props.title;
        var onclick = this.props.onclick;
        return (<button className={'button'} on-click={function (e) {
            if (onclick) {
                onclick(e);
            }
        }}>
                {title || '按钮'}
                <Tag></Tag>
            </button>);
    };
    return Button;
}(Component));
var App = /** @class */ (function (_super) {
    __extends(App, _super);
    function App() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    App.prototype.created = function () {
        log('App created');
        this.state = {
            isName: true,
            num: 0,
            btnTitle: 'SecondBut',
        };
    };
    App.prototype.mounted = function () {
        log('App mounted');
    };
    App.prototype.unmounted = function () {
        log('App unmounted');
    };
    App.prototype.beforeUpdate = function () {
        log('App beforeUpdate');
    };
    App.prototype.afterUpdate = function () {
        log('App afterUpdate');
    };
    App.prototype.render = function () {
        var _this = this;
        var testspread = { a: 0, c: 0 };
        var isName = this.state.isName;
        var btnTitle = this.state.btnTitle;
        var num = this.state.num;
        var input = isName ? <input key='name' ref={function (elm) { _this.refs.name = elm; }} type='text' placeholder='name'></input> : <input key='password' ref={function (elm) { _this.refs.password = elm; }} type='password' placeholder='password'></input>;
        return (<div v-bind={{ a: 0 }} {...testspread} className={'app'}>
                <span style={{ display: 'block' }}>Hello world!</span>
                <Button ref={function (elm) { _this.refs.button = elm; }} onclick={function () {
            log('test ref name =', _this.refs.name);
            _this.setState(Object.assign({}, _this.state, {
                isName: !isName,
                num: num + 1,
            }));
        }} title={btnTitle}>
                </Button>
                {input}
            </div>);
    };
    return App;
}(Component));
var firstVNode = (<div>
    <Button></Button>
    <div key={'1'}>111</div>
    <div key={'2'}>222</div>
    <div key={'3'}>333</div>
    <div key={'4'}>444</div>
</div>);
var firstNodeProxy = render(firstVNode);
rootNodeProxy.appendChild(firstNodeProxy);
var secondVNode = (<div>

    <div key={'draggable'} cmds={{ draggable: { a: 123 } }}>draggable</div>
    <div key={'4'}>444</div>
    <div key={'3'}>333</div>
    <div key={'droppable'} cmds={{
    droppable: function (error, data) {
        if (!error) {
            log('droppable', data);
            return;
        }
        log(error);
    },
}}>droppable</div>
    <img height="100" src="http://nodejs.cn/static/images/logo.svg"></img>
    <App>
    </App>
    <div cmds={{ dragmove: true }} innerHTML="<div>I'm from innerHtml</div>"></div>
</div>);
setTimeout(function () {
    var patches = diff(firstVNode, secondVNode);
    log('*********************************************');
    log('patches', patches);
    log('---------------------------------------------');
    log('firstNodeProxy', firstNodeProxy);
    var newFirstNodeProxy = patch(firstNodeProxy, patches);
    log('---------------------------------------------');
    log('newFirstNodeProxy', newFirstNodeProxy);
    log('---------------------------------------------');
    log('newFirstNodeProxy === firstNodeProxy', newFirstNodeProxy === firstNodeProxy);
}, 1000);
window.rootnode = rootNodeProxy;
//# sourceMappingURL=test.jsx.map