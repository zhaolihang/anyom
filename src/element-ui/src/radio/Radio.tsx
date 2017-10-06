
import { Component } from '../../libs';
import { h } from '../../../index';

export default class Radio extends Component {
  static elementType = 'Radio';

  checked: boolean;
  focus: boolean;
  protected initialState() {
    return {
      checked: this.getChecked(this.props),
      focus: false,
    }
  }

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  onUpdateProps(props) {
    this.checked = this.getChecked(props);
  }

  onChange(e) {
    const checked = e.target.checked;
    if (checked) {
      this.emit('change', this.props.value)
    }
  }

  onFocus() {
    this.focus = true;
  }

  onBlur() {
    this.focus = false;
  }

  getChecked(props): boolean {
    return props.model == props.value || Boolean(props.checked)
  }

  render() {
    const { checked, focus } = this;
    const { disabled, value, children } = this.props;
    return (
      <label style={this.style()} className={this.className('el-radio')}>
        <span className={this.classNames({
          'el-radio__input': true,
          'is-checked': checked,
          'is-disabled': disabled,
          'is-focus': focus
        })}>
          <span className="el-radio__inner"></span>
          <input
            type="radio"
            className="el-radio__original"
            checked={checked}
            disabled={disabled}
            on-change={this.onChange}
            on-focus={this.onFocus}
            on-blur={this.onBlur}
          />
        </span>
        <span className="el-radio__label">
          {children || value}
        </span>
      </label>
    )
  }
}
