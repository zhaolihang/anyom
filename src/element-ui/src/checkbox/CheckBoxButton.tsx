import { Component } from '../../libs';
import { h, nextTick } from '../../../index';
import CheckBox from './CheckBox';

export default class CheckBoxButton extends CheckBox {
  static elementType = 'CheckboxButton';

  render() {
    const group = this.props.checkboxGroup;

    return (
      <label style={this.style()} className={this.className('el-checkbox-button', group.props.size ? 'el-checkbox-button--' + group.props.size : '', {
        'is-disabled': this.props.disabled,
        'is-checked': this.checked,
        'is-focus': this.focus
      })}>
        <input
          className="el-checkbox-button__original"
          type="checkbox"
          checked={this.checked}
          disabled={this.props.disabled}
          on-ocus={this.onFocus}
          on-lur={this.onBlur}
          on-hange={this.onChange}
        />
        <span className="el-checkbox-button__inner" style={this.checked ? {
          boxShadow: '-1px 0 0 0 ' + group.props.fill,
          backgroundColor: group.props.fill || '',
          borderColor: group.props.fill || '',
          color: group.props.textColor || ''
        } : {}}>
          {this.label || this.props.children}
        </span>
      </label>
    )
  }
}
