import { render } from "../create-element";
import { h } from "../vnode";
import Col from "../element-ui/src/layout/Col";
import Row from "../element-ui/src/layout/Row";
import Button from "../element-ui/src/button/Button";
import ButtonGroup from "../element-ui/src/button/ButtonGroup";

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

firstVNode = <div>
    <div>
        <Button>默认按钮</Button>
        <Button type="primary">主要按钮</Button>
        <Button type="text">文字按钮</Button>
    </div>
    <div>
        <Button plain={true} disabled={true}>默认按钮</Button>
        <Button type="primary" disabled={true}>主要按钮</Button>
        <Button type="text" disabled={true}>文字按钮</Button>
    </div>

    <div className="intro-block">
        <div className="block">
            <span className="demonstration">默认显示颜色</span>
            <span className="wrapper">
                <Button type="success">成功按钮</Button>
                <Button type="warning">警告按钮</Button>
                <Button type="danger">危险按钮</Button>
                <Button type="info">信息按钮</Button>
            </span>
        </div>
        <div className="block">
            <span className="demonstration">hover 显示颜色</span>
            <span className="wrapper">
                <Button plain={true} type="success">成功按钮</Button>
                <Button plain={true} type="warning">警告按钮</Button>
                <Button plain={true} type="danger">危险按钮</Button>
                <Button plain={true} type="info">信息按钮</Button>
            </span>
        </div>
    </div>

    <div>
        <Button type="primary" icon="edit"></Button>
        <Button type="primary" icon="share"></Button>
        <Button type="primary" icon="delete"></Button>
        <Button type="primary" icon="search">搜索</Button>
        <Button type="primary">上传<i className="el-icon-upload el-icon-right"></i></Button>
    </div>

    <div>
        <ButtonGroup>
            <Button type="primary" icon="arrow-left">上一页</Button>
            <Button type="primary">下一页<i className="el-icon-arrow-right el-icon-right"></i></Button>
        </ButtonGroup>
        <ButtonGroup>
            <Button type="primary" icon="edit"></Button>
            <Button type="primary" icon="share"></Button>
            <Button type="primary" icon="delete"></Button>
        </ButtonGroup>
    </div>
    <div>
        <Button type="primary" loading={true}>加载中</Button>

    </div>
    <div>
        <Button type="primary" size="large">大型按钮</Button>
        <Button type="primary">正常按钮</Button>
        <Button type="primary" size="small">小型按钮</Button>
        <Button type="primary" size="mini">超小按钮</Button>
    </div>

    <Button type="primary">TEST</Button>
    <Button icon="search">TEST</Button>
    <Button nativeType="submit">TEST</Button>
    <Button loading={true}>TEST</Button>
    <Button disabled={true}>TEST</Button>
    <Button size="large">TEST</Button>
    <Button plain={true}>TEST</Button>
    <Button on-click={() => { log('but clicked') }}>TEST</Button>
</div>

let firstNodeProxy = render(firstVNode)
rootNodeProxy.appendChild(firstNodeProxy);

(window as any).rootnode = rootNodeProxy;