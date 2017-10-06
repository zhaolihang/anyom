import { Component } from '../../libs';
import { h, nextTick } from '../../../index';

const defaultProps = {
  checked: false,
  focus: false
};


export default class CheckBox extends Component {
  static elementType = 'Checkbox';

  checked: boolean;
  focus: boolean;
  label: string;
  protected initialState() {
    return {
      checked: this.props.checked,
      focus: this.props.focus,
      label: this.getLabel(this.props)
    }
  }

  protected initialProps(props) {
    return { ...defaultProps, ...props };
  }
  onUpdateProps(props) {
    this.checked = props.checked;
    this.focus = props.focus;
    this.label = this.getLabel(props);
  }


  constructor(props: Object) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  onFocus(): void {
    this.focus = true;
  }

  onBlur(): void {
    this.focus = false;
  }

  onChange(e): void {
    if (e.target instanceof HTMLInputElement) {
      const label = this.label;
      const { trueLabel, falseLabel } = this.props;

      const checked = e.target.checked;
      const group = this.props.checkboxGroup;

      if (group) {
        const length = group.options.length + (checked ? 1 : -1);

        if (group.props.min !== undefined && length < group.props.min) {
          return;
        }

        if (group.props.max !== undefined && length > group.props.max) {
          return;
        }
      }

      let newLabel = label;

      if (this.props.trueLabel || this.props.falseLabel) {
        newLabel = checked ? trueLabel : falseLabel;
      }

      this.checked = checked;
      this.label = newLabel;
      this.emit('change', checked)
    }
  }

  getLabel(props): string {
    if (props.trueLabel || props.falseLabel) {
      return props.checked ? props.trueLabel : props.falseLabel;
    } else {
      return props.label;
    }
  }

  render() {
    return (
      <label style={this.style()} className={this.className('el-checkbox')}>
        <span className={this.classNames('el-checkbox__input', {
          'is-disabled': this.props.disabled,
          'is-checked': this.checked,
          'is-indeterminate': this.props.indeterminate,
          'is-focus': this.focus
        })}>
          <span className="el-checkbox__inner"></span>
          <input
            className="el-checkbox__original"
            type="checkbox"
            checked={this.checked}
            disabled={this.props.disabled}
            on-focus={this.onFocus}
            on-clur={this.onBlur}
            on-change={this.onChange}
          />
        </span>
        <span className="el-checkbox__label">
          {this.props.children || this.label}
        </span>
      </label>
    )
  }
}
