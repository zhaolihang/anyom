import { Component } from '../../libs';
import { h, cloneVNode } from '../../../index';
import { VNode } from '../../../vnode';

export default class OptionGroup extends Component {
  render() {
    return (
      <ul style={this.style()} className={this.className('el-select-group__wrap')}>
        <li className="el-select-group__title">{this.props.label}</li>
        <li>
          <ul className="el-select-group">
            {this.props.children.map((child: VNode) => {
              child = cloneVNode(child)
              child.props = Object.assign({}, child.props, { parent: this.props.parent });
              return child;
            })}
          </ul>
        </li>
      </ul>
    )
  }
}
