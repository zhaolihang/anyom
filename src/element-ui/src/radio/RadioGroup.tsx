import { Component } from '../../libs';
import { h, cloneVNode } from '../../../index';
import { VNode, VNodeType } from '../../../vnode';

export default class RadioGroup extends Component {

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(value) {
    this.emit('change', value)
  }

  render() {
    return (
      <div ref="RadioGroup" style={this.style()} className={this.className('el-radio-group')}>
        {
          this.props.children && this.props.children.map((vnode: VNode) => {
            if (!vnode) {
              return null;
            }
            if (vnode.type === VNodeType.Component) {
              if (vnode.tag.elementType !== 'Radio' && vnode.tag.elementType !== 'RadioButton') {
                return null;
              }
            }

            vnode = cloneVNode(vnode)
            let ons = Object.assign({}, vnode.ons, {
              change: this.onChange
            })
            let props = Object.assign({}, vnode.props, {
              model: this.props.value,
              size: this.props.size,
              disabled: vnode.props && vnode.props.disabled || this.props.disabled,
              backgroundColor: this.props.fill || '',
              borderColor: this.props.fill || '',
              color: this.props.textColor || ''
            });
            vnode.ons = ons;
            vnode.props = props;
            return vnode;
          })
        }
      </div>
    )
  }// render

}
