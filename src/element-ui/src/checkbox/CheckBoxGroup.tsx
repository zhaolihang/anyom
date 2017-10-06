import { Component } from '../../libs';
import { h, nextTick, cloneVNode } from '../../../index';
import CheckBox from './CheckBox';
import { VNode } from '../../../vnode';

export default class CheckBoxGroup extends Component {
  options: any[];
  protected initialState() {
    return {
      options: this.props.value || []
    }
  }


  onUpdateProps(props) {
    this.options = props.value
  }

  onChange(value: string, checked: boolean): void {
    const index = this.options.indexOf(value);
    if (checked) {
      if (index === -1) {
        this.options.push(value);
      }
    } else {
      this.options.splice(index, 1);
    }
    this.emit('change', this.options);
  }

  render() {
    const options = this.options;
    const children = this.props.children && this.props.children.map((child: VNode, index) => {
      if (!child) {
        return null;
      }

      const { elementType } = child.tag;
      // 过滤非Checkbox和CheckboxButton的子组件
      if (elementType !== 'Checkbox' && elementType !== 'CheckboxButton') {
        return null;
      }

      child = cloneVNode(child)
      let newProps = Object.assign({}, child.props, {
        checkboxGroup: this,
        checked: child.props.checked || options.indexOf(child.props.value) >= 0 || options.indexOf(child.props.label) >= 0,
      });
      let newOns = Object.assign({}, child.ons, {
        change: (v) => {
          this.onChange(child.props.value || child.props.label, v)
        },
      });
      child.props = newProps;
      child.ons = newOns;
      return child;
    });
    return (
      <div style={this.style()} className={this.className('el-checkbox-group')}>
        {children}
      </div>
    )
  }
}
