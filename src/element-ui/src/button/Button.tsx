import { Component } from '../../libs';
import { h } from '../../../index';

const defaultProps = {
  type: 'default',
  nativeType: 'button',
  loading: false,
  disabled: false,
  plain: false
};

export default class Button extends Component {

  protected initialProps(props) {
    return { ...defaultProps, ...props };
  }

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this)
  }

  onClick(e) {
    this.emit('click', e);
  }

  render() {
    return (
      <button style={this.style()} className={this.className('el-button', this.props.type && `el-button--${this.props.type}`, this.props.size && `el-button--${this.props.size}`, {
        'is-disabled': this.props.disabled,
        'is-loading': this.props.loading,
        'is-plain': this.props.plain
      })} disabled={this.props.disabled} type={this.props.nativeType} on-click={this.onClick}>
        {this.props.loading && <i className="el-icon-loading" />}
        {this.props.icon && !this.props.loading && <i className={`el-icon-${this.props.icon}`} />}
        <span>{this.props.children}</span>
      </button>
    )
  }
}

