import { Component } from '../../libs';
import { h } from '../../../index';

import Radio from './Radio';
import RadioGroup from './RadioGroup';

export default class RadioButton extends Radio {
  static elementType = 'RadioButton';

  activeStyle(): { backgroundColor: string, borderColor: string, color: string } {
    return {
      backgroundColor: this.props.fill || '',
      borderColor: this.props.fill || '',
      color: this.props.textColor || ''
    };
  }

  render() {
    return (
      <label style={this.style()} className={this.className('el-radio-button',
        this.props.size && `el-radio-button--${this.props.size}`, {
          'is-active': this.checked
        })
      }>
        <input
          type="radio"
          className="el-radio-button__orig-radio"
          checked={this.checked}
          disabled={this.props.disabled}
          on-change={this.onChange}
        />
        <span className="el-radio-button__inner" style={this.checked ? this.activeStyle() : {}}>
          {this.props.children || this.props.value}
        </span>
      </label>
    )
  }
}
