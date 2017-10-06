import { render } from "../create-element";
import { h } from "../vnode";
import Col from "../element-ui/src/layout/Col";
import Row from "../element-ui/src/layout/Row";
import Button from "../element-ui/src/button/Button";
import ButtonGroup from "../element-ui/src/button/ButtonGroup";
import Radio from "../element-ui/src/radio/Radio";
import { Component } from "../index";
import RadioGroup from "../element-ui/src/radio/RadioGroup";
import RadioButton from "../element-ui/src/radio/RadioButton";
import CheckBox from "../element-ui/src/checkbox/CheckBox";
import CheckBoxGroup from "../element-ui/src/checkbox/CheckBoxGroup";
import Input from "../element-ui/src/input/Input";
import InputNumber from "../element-ui/src/input-number/InputNumber";

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


class RadioTest extends Component {

    value: number;
    radio3: string;
    radio4: string;
    radio5: string;
    protected initialState() {
        return {
            value: 0,
            radio3: '上海',
            radio4: '上海',
            radio5: '上海'
        }
    }

    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    onChange(v) {
        this.value = v;
    }
    render() {
        return <div>
            <div>
                <RadioGroup value={this.value} on-change={this.onChange}>
                    <Radio value={3}>备选项3</Radio>
                    <Radio value={6}>备选项6</Radio>
                    <Radio value={9}>备选项9</Radio>
                </RadioGroup>
            </div>
            <div>
                <RadioGroup value={this.radio3} on-change={(v) => { this.radio3 = v }}>
                    <RadioButton value="上海" />
                    <RadioButton value="北京" />
                    <RadioButton value="广州" />
                    <RadioButton value="深圳" />
                </RadioGroup>
                <RadioGroup value={this.radio4} on-change={(v) => { this.radio4 = v }}>
                    <RadioButton value="上海" />
                    <RadioButton value="北京" />
                    <RadioButton value="广州" disabled={true} />
                    <RadioButton value="深圳" />
                </RadioGroup>
                <RadioGroup value={this.radio5} disabled={true}>
                    <RadioButton value="上海" />
                    <RadioButton value="北京" />
                    <RadioButton value="广州" />
                    <RadioButton value="深圳" />
                </RadioGroup>
            </div>
        </div>
    }

}
firstVNode = <div>
    <RadioTest ></RadioTest>
</div>

class CheckBoxIndeterminate extends Component {

    checkAll: boolean;
    cities: string[];
    checkedCities: string[];
    isIndeterminate: boolean;
    protected initialState() {
        return {
            checkAll: false,
            cities: ['上海', '北京', '广州', '深圳'],
            checkedCities: ['上海', '北京'],
            isIndeterminate: true,
        }
    }

    constructor(props) {
        super(props);
        this.handleCheckAllChange = this.handleCheckAllChange.bind(this);
        this.handleCheckedCitiesChange = this.handleCheckedCitiesChange.bind(this);
    }


    handleCheckAllChange(checked) {
        const checkedCities = checked ? ['上海', '北京', '广州', '深圳'] : [];
        this.isIndeterminate = false;
        this.checkAll = checked;
        this.checkedCities = checkedCities;
    }

    handleCheckedCitiesChange(value) {
        const checkedCount = value.length;
        const citiesLength = this.cities.length;

        this.isIndeterminate = checkedCount > 0 && checkedCount < citiesLength;
        this.checkAll = checkedCount === citiesLength;
        this.checkedCities = value;
    }

    render() {
        return <div>
            <CheckBox
                checked={this.checkAll}
                indeterminate={this.isIndeterminate}
                on-change={this.handleCheckAllChange}>全选</CheckBox>
            <CheckBoxGroup
                value={this.checkedCities}
                on-change={this.handleCheckedCitiesChange}>
                {
                    this.cities.map((city, index) =>
                        <CheckBox key={index} label={city}></CheckBox>
                    )
                }
            </CheckBoxGroup>
        </div>
    }
}


firstVNode = <div>
    <div>
        <CheckBox checked>备选项</CheckBox>
    </div>
    <div>
        <CheckBox disabled>备选项1</CheckBox>
        <CheckBox checked disabled>备选项2</CheckBox>
    </div>
    <div>
        <CheckBoxGroup value={['复选框 A', '选中且禁用']}>
            <CheckBox label="复选框 A"></CheckBox>
            <CheckBox label="复选框 B"></CheckBox>
            <CheckBox label="复选框 C"></CheckBox>
            <CheckBox label="禁用" disabled></CheckBox>
            <CheckBox label="选中且禁用" disabled></CheckBox>
        </CheckBoxGroup>
    </div>
    <div>
        <CheckBoxIndeterminate></CheckBoxIndeterminate>
    </div>
</div>

firstVNode = <div>
    <Input
        type="textarea"
        autosize={{ minRows: 2, maxRows: 4 }}
        placeholder="请输入内容"
    />
    <div className="demo-input" >
        <Input placeholder="请输入内容" size="large" />
        <Input placeholder="请输入内容" />
        <Input placeholder="请输入内容" size="small" />
        <Input placeholder="请输入内容" size="mini" />
    </div>
</div>


firstVNode = <div>
    <div>
        <InputNumber size="large" defaultValue={5}></InputNumber>
        <InputNumber defaultValue={6}></InputNumber>
        <InputNumber size="small" controls={false} defaultValue={7}></InputNumber>
    </div>
</div>




let firstNodeProxy = render(firstVNode)
rootNodeProxy.appendChild(firstNodeProxy);
log(firstNodeProxy);
(window as any).rootnode = rootNodeProxy;