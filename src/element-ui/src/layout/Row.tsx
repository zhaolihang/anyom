
import { Component } from '../../libs';
import { h } from '../../../index';
import { VNode } from '../../../vnode';
import Col from './Col';

const defaultProps = {
  justify: 'start',
  align: 'top',
  tag: 'div'
};

export default class Row extends Component {

  getStyle(): { marginLeft: string, marginRight: string } {
    const style: any = {};

    if (this.props.gutter) {
      style.marginLeft = `-${this.props.gutter / 2}px`;
      style.marginRight = style.marginLeft;
    }

    return style;
  }

  protected initialProps(props) {
    return { ...defaultProps, ...props };
  }

  render() {
    let children = this.props.children && this.props.children.map((vnode: VNode) => {
      if (this.props.gutter) {
        if (vnode.tag === Col) {
          let props = Object.assign({}, vnode.props, {
            gutter: this.props.gutter,
          });
          vnode.props = props;
        }
      }
      return vnode;
    });
    return h(this.props.tag, {
      className: this.className('el-row',
        this.props.justify !== 'start' && `is-justify-${this.props.justify}`,
        this.props.align !== 'top' && `is-align-${this.props.align}`, {
          'el-row--flex': true
        }
      ),
      style: this.style(this.getStyle())
    }, children);
  }
}
