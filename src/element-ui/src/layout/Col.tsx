import { Component } from '../../libs';
import { h } from '../../../index';
import Row from './Row';


const defaultProps = {
  span: 24,
  tag: 'div'
}

export default class Col extends Component {

  getGutter() {
    let parent = this.proxyOwner.parentNode
    while (parent && !(parent.element instanceof Row)) {
      parent = parent.parentNode;
    }
    return parent ? parent.element.props.gutter : 0;
  }

  getStyle(): { paddingLeft: string, paddingRight: string } {
    const style: any = {};
    let gutter = this.getGutter();
    if (gutter) {
      style.paddingLeft = `${gutter / 2}px`;
      style.paddingRight = style.paddingLeft;
    }

    return style;
  }

  protected initialProps(props) {
    return { ...defaultProps, ...props };
  }

  render() {
    let classList = [];

    ['span', 'offset', 'pull', 'push'].forEach(prop => {
      if (this.props[prop]) {
        classList.push(
          prop !== 'span'
            ? `el-col-${prop}-${this.props[prop]}`
            : `el-col-${this.props[prop]}`
        );
      }
    });

    ['xs', 'sm', 'md', 'lg'].forEach(size => {
      if (typeof this.props[size] === 'object') {
        let props = this.props[size];
        Object.keys(props).forEach(prop => {
          classList.push(
            prop !== 'span'
              ? `el-col-${size}-${prop}-${props[prop]}`
              : `el-col-${size}-${props[prop]}`
          );
        });
      } else {
        if (this.props[size]) {
          classList.push(`el-col-${size}-${Number(this.props[size])}`);
        }
      }
    });

    return h(this.props.tag, {
      className: this.className('el-col', classList),
      style: this.style(this.getStyle())
    });
  }
}
