import { Component, h } from '../../../index';

const defaultProps = {
  component: 'span'
}

export default class View extends Component {
  protected initialProps(props) {
    return { ...defaultProps, ...props };
  }

  render() {
    const style = this.props.hasOwnProperty('show') && !this.props.show && {
      display: 'none'
    };

    return h(this.props.component, {
      style: Object.assign({}, this.props.style, style),
      className: this.props.className
    }, this.props.children)

  }
}
