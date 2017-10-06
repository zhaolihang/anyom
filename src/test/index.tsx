import { render } from "../create-element";
import { h } from "../vnode";
import { Row, Col } from "../element-ui/src/layout/index";

const log = console.log;

const rootNode = document.getElementById('body');
const rootNodeProxy = render(<div />)
rootNode.appendChild(rootNodeProxy.getNativeNode());

// layout test
let firstVNode = <div className='demo-layout'>
    <Row type="flex" className="row-bg" justify="center">
        <Col span="6"><div className="grid-content bg-purple"></div></Col>
        <Col span="6"><div className="grid-content bg-purple-light"></div></Col>
        <Col span="6"><div className="grid-content bg-purple"></div></Col>
    </Row>
    <Row>
        <Col span="24"><div className="grid-content bg-purple-dark"></div></Col>
    </Row>
    <Row>
        <Col span="12"><div className="grid-content bg-purple"></div></Col>
        <Col span="12"><div className="grid-content bg-purple-light"></div></Col>
    </Row>
    <Row>
        <Col span="8"><div className="grid-content bg-purple"></div></Col>
        <Col span="8"><div className="grid-content bg-purple-light"></div></Col>
        <Col span="8"><div className="grid-content bg-purple"></div></Col>
    </Row>
    <Row>
        <Col span="6"><div className="grid-content bg-purple"></div></Col>
        <Col span="6"><div className="grid-content bg-purple-light"></div></Col>
        <Col span="6"><div className="grid-content bg-purple"></div></Col>
        <Col span="6"><div className="grid-content bg-purple-light"></div></Col>
    </Row>
    <Row>
        <Col span="4"><div className="grid-content bg-purple"></div></Col>
        <Col span="4"><div className="grid-content bg-purple-light"></div></Col>
        <Col span="4"><div className="grid-content bg-purple"></div></Col>
        <Col span="4"><div className="grid-content bg-purple-light"></div></Col>
        <Col span="4"><div className="grid-content bg-purple"></div></Col>
        <Col span="4"><div className="grid-content bg-purple-light"></div></Col>
    </Row>
    <Row gutter="20">
        <Col span="6"><div className="grid-content bg-purple"></div></Col>
        <Col span="6"><div className="grid-content bg-purple"></div></Col>
        <Col span="6"><div className="grid-content bg-purple"></div></Col>
        <Col span="6"><div className="grid-content bg-purple"></div></Col>
    </Row>



    <Row gutter="20">
        <Col span="16"><div className="grid-content bg-purple"></div></Col>
        <Col span="8"><div className="grid-content bg-purple"></div></Col>
    </Row>
    <Row gutter="20">
        <Col span="8"><div className="grid-content bg-purple"></div></Col>
        <Col span="8"><div className="grid-content bg-purple"></div></Col>
        <Col span="4"><div className="grid-content bg-purple"></div></Col>
        <Col span="4"><div className="grid-content bg-purple"></div></Col>
    </Row>
    <Row gutter="20">
        <Col span="4"><div className="grid-content bg-purple"></div></Col>
        <Col span="16"><div className="grid-content bg-purple"></div></Col>
        <Col span="4"><div className="grid-content bg-purple"></div></Col>
    </Row>

    <Row gutter="20">
        <Col span="6"><div className="grid-content bg-purple"></div></Col>
        <Col span="6" offset="6"><div className="grid-content bg-purple"></div></Col>
    </Row>

    <Row gutter="20">
        <Col span="6" offset="6"><div className="grid-content bg-purple"></div></Col>
        <Col span="6" offset="6"><div className="grid-content bg-purple"></div></Col>
    </Row>

    <Row gutter="20">
        <Col span="12" offset="6"><div className="grid-content bg-purple"></div></Col>
    </Row>

    <Row type="flex" className="row-bg">
        <Col span="6"><div className="grid-content bg-purple"></div></Col>
        <Col span="6"><div className="grid-content bg-purple-light"></div></Col>
        <Col span="6"><div className="grid-content bg-purple"></div></Col>
    </Row>

    <Row type="flex" className="row-bg" justify="center">
        <Col span="6"><div className="grid-content bg-purple"></div></Col>
        <Col span="6"><div className="grid-content bg-purple-light"></div></Col>
        <Col span="6"><div className="grid-content bg-purple"></div></Col>
    </Row>

    <Row type="flex" className="row-bg" justify="end">
        <Col span="6"><div className="grid-content bg-purple"></div></Col>
        <Col span="6"><div className="grid-content bg-purple-light"></div></Col>
        <Col span="6"><div className="grid-content bg-purple"></div></Col>
    </Row>

    <Row type="flex" className="row-bg" justify="space-between">
        <Col span="6"><div className="grid-content bg-purple"></div></Col>
        <Col span="6"><div className="grid-content bg-purple-light"></div></Col>
        <Col span="6"><div className="grid-content bg-purple"></div></Col>
    </Row>

    <Row type="flex" className="row-bg" justify="space-around">
        <Col span="6"><div className="grid-content bg-purple"></div></Col>
        <Col span="6"><div className="grid-content bg-purple-light"></div></Col>
        <Col span={6}><div className="grid-content bg-purple"></div></Col>
    </Row>

    <Row gutter="10">
        <Col xs="8" sm="6" md="4" lg="3"><div className="grid-content bg-purple"></div></Col>
        <Col xs="4" sm="6" md="8" lg="9"><div className="grid-content bg-purple-light"></div></Col>
        <Col xs="4" sm="6" md="8" lg="9"><div className="grid-content bg-purple"></div></Col>
        <Col xs="8" sm="6" md="4" lg="3"><div className="grid-content bg-purple-light"></div></Col>
    </Row>

    <Row tag="section">
        <Col span="24"><div className="grid-content bg-purple-dark"></div></Col>
    </Row>

    <Row>
        <Col tag="section" span="24"><div className="grid-content bg-purple-dark"></div></Col>
    </Row>

    <Row type="flex" align="middle" className="row-bg">
        <Col span="6"><div className="grid-content bg-purple"></div></Col>
        <Col span="6"><div className="grid-content bg-purple-light"></div></Col>
        <Col span="6"><div className="grid-content bg-purple"></div></Col>
    </Row>

    <Row type="flex" align="bottom" className="row-bg">
        <Col span="6"><div className="grid-content bg-purple"></div></Col>
        <Col span="6"><div className="grid-content bg-purple-light"></div></Col>
        <Col span="6"><div className="grid-content bg-purple"></div></Col>
    </Row>

    <Row gutter="20">
        <Col span="12" push="12"><div className="grid-content bg-purple"></div></Col>
    </Row>

    <Row gutter="20">
        <Col span="12" pull={12}><div className="grid-content bg-purple"></div></Col>
    </Row>

</div>

let firstNodeProxy = render(firstVNode)
rootNodeProxy.appendChild(firstNodeProxy);

(window as any).rootnode = rootNodeProxy;