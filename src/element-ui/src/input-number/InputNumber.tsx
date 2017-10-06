
import { Component } from '../../libs';
import { h } from '../../../index';

import Input from '../input/Input';
import { accAdd, accSub } from './util';

const defaultProps = {
  step: 1,
  controls: true,
  max: Infinity,
  min: 0
}

export default class InputNumber extends Component {
  timeout: any;

  value: any;
  inputActive: boolean;
  protected initialState() {
    return {
      value: this.props.defaultValue,
      inputActive: false
    }
  }
  protected initialProps(props) {
    return { ...defaultProps, ...props };
  }

  onUpdateProps(props) {
    this.value = props.value;
  }

  constructor(props: Object) {
    super(props);
    this.onInput = this.onInput.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onBlur = this.onBlur.bind(this)
    this.decrease = this.decrease.bind(this)
    this.increase = this.increase.bind(this)
  }

  onKeyDown(e): void {
    switch (e.keyCode) {
      case 38: // KeyUp
        e.preventDefault();
        this.increase();
        break;
      case 40: // KeyDown
        e.preventDefault();
        this.decrease();
        break;
      default:
        break;
    }
  }

  onBlur(): void {
    let value = this.value;

    if (this.isValid) {
      value = Number(value);

      if (value > this.props.max) {
        value = Number(this.props.max);
      } else if (value < this.props.min) {
        value = Number(this.props.min);
      }
    } else {
      value = undefined;
    }
    this.value = value;
    this.onChange();
  }

  onInput(value) {
    this.value = value;
    clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {
      this.onBlur();
    }, 750);
  }

  onChange() {
    this.emit('change', this.value)
  }

  get isValid(): boolean {
    return this.value !== '' && !isNaN(Number(this.value));
  }

  get minDisabled(): boolean {
    return !this.isValid || (this.value - Number(this.props.step) < this.props.min);
  }

  get maxDisabled(): boolean {
    return !this.isValid || (this.value + Number(this.props.step) > this.props.max);
  }

  increase(): void {
    const { step, max, disabled, min } = this.props;
    let { value, inputActive } = this;

    if (this.maxDisabled) {
      inputActive = false;
    } else {
      if (value + Number(step) > max || disabled) return;
      if (value + Number(step) < min) value = min - Number(step);

      value = accAdd(step, value);
    }
    this.value = value;
    this.inputActive = inputActive;
    this.onChange();
  }

  decrease(): void {
    const { step, min, disabled, max } = this.props;
    let { value, inputActive } = this;

    if (this.minDisabled) {
      inputActive = false;
    } else {
      if (value - Number(step) < min || disabled) return;
      if (value - Number(step) > max) value = Number(max) + Number(step);
      value = accSub(value, step);
    }

    this.value = value;
    this.inputActive = inputActive;
    this.onChange();
  }

  activeInput(disabled: boolean): void {
    if (!this.props.disabled && !disabled) {
      this.inputActive = true;
    }
  }

  inactiveInput(disabled: boolean): void {
    if (!this.props.disabled && !disabled) {
      this.inputActive = false;
    }
  }

  render() {
    const { controls, disabled, size } = this.props;
    const { value, inputActive } = this;

    return (
      <div style={this.style()} className={this.className('el-input-number', size && `el-input-number--${size}`, {
        'is-disabled': disabled,
        'is-without-controls': !controls
      })}>
        {
          controls && (
            <span
              className={this.classNames("el-input-number__decrease", {
                'is-disabled': this.minDisabled
              })}
              on-click={this.decrease}
            >
              <i className="el-icon-minus"></i>
            </span>
          )
        }
        {
          controls && (
            <span
              className={this.classNames("el-input-number__increase", {
                'is-disabled': this.maxDisabled
              })}
              on-click={this.increase}
            >
              <i className="el-icon-plus"></i>
            </span>
          )
        }
        <Input
          ref="input"
          className={this.classNames({
            'is-active': inputActive
          })}
          value={value}
          disabled={disabled}
          size={size}
          on-change={this.onInput}
          on-keydown={this.onKeyDown}
          on-blur={this.onBlur} />
      </div>
    )
  }
}


