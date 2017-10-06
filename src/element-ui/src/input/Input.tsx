import { Component } from '../../libs';
import { h } from '../../../index';
import calcTextareaHeight from './calcTextareaHeight'

type State = {
  textareaStyle: { resize: string, height?: string }
}


const defaultProps = {
  type: 'text',
  autosize: false,
  rows: 2,
  autoComplete: 'off'
}


export default class Input extends Component {

  textareaStyle: any;
  protected initialProps(props) {
    return { ...defaultProps, ...props };
  }

  protected initialState() {
    return {
      textareaStyle: { resize: this.props.resize },
    }
  }

  constructor(props: Object) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleIconClick = this.handleIconClick.bind(this);
  }

  mounted() {
    this.resizeTextarea();
  }

  focus(): void {
    setTimeout(() => {
      (this.$refs.input || this.$refs.textarea).focus();
    });
  }

  blur(): void {
    setTimeout(() => {
      (this.$refs.input || this.$refs.textarea).blur();
    });
  }

  /* Instance Methods> */

  fixControlledValue(value) {
    if (typeof value === 'undefined' || value === null) {
      return '';
    }
    return value;
  }

  handleChange(e): void {
    this.emit('change', e.target.value)
    this.resizeTextarea();
  }

  handleFocus(e): void {
    this.emit('focus', e)
  }

  handleBlur(e): void {
    this.emit('blur', e)
  }

  handleIconClick(): void {
    this.emit('iconClick')
  }

  resizeTextarea(): void {
    const { autosize, type } = this.props;

    if (!autosize || type !== 'textarea') {
      return;
    }

    const minRows = autosize.minRows;
    const maxRows = autosize.maxRows;
    const textareaCalcStyle = calcTextareaHeight(this.$refs.textarea, minRows, maxRows);
    this.textareaStyle = Object.assign({}, this.textareaStyle, textareaCalcStyle)
  }

  render() {
    const { type, size, prepend, append, icon, autoComplete, validating, rows,
      ...otherProps
    } = this.props;

    const classname = this.classNames(
      type === 'textarea' ? 'el-textarea' : 'el-input',
      size && `el-input--${size}`, {
        'is-disabled': this.props.disabled,
        'el-input-group': prepend || append,
        'el-input-group--append': !!append,
        'el-input-group--prepend': !!prepend
      }
    );

    if ('value' in this.props) {
      otherProps.value = this.fixControlledValue(this.props.value);

      delete otherProps.defaultValue;
    }

    delete otherProps.resize;
    delete otherProps.style;
    delete otherProps.autosize;

    if (type === 'textarea') {
      return (
        <div style={this.style()} className={this.className(classname)}>
          <textarea { ...otherProps }
            ref="textarea"
            className="el-textarea__inner"
            style={this.textareaStyle}
            rows={rows}
            on-change={this.handleChange}
            on-focus={this.handleFocus}
            on-blur={this.handleBlur}
          ></textarea>
        </div>
      )
    } else {
      return (
        <div style={this.style()} className={this.className(classname)} on-mouseEnter={(e) => { this.emit('mouseEnter', e) }} on-mouseLeave={(e) => { this.emit('mouseLeave', e) }}>
          {prepend && <div className="el-input-group__prepend">{prepend}</div>}
          {typeof icon === 'string' ? <i className={`el-input__icon el-icon-${icon}`} on-click={this.handleIconClick}>{prepend}</i> : icon}
          <input { ...otherProps }
            ref="input"
            type={type}
            className="el-input__inner"
            autoComplete={autoComplete}
            on-change={this.handleChange}
            on-focus={this.handleFocus}
            on-blur={this.handleBlur}
          />
          {validating && <i className="el-input__icon el-icon-loading"></i>}
          {append && <div className="el-input-group__append">{append}</div>}
        </div>
      )
    }
  }
}
