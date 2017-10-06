import { Component } from '../../libs';
import { h, nextTick } from '../../../index';
import View from '../../libs/view/index';
import Select from './Select';
import { require_condition } from '../../libs/utils/assert';


export default class Option extends Component {
    index: number
    visible: boolean
    hitState: boolean

    protected initialState() {
        return {
            index: -1,
            visible: true,
            hitState: false
        }
    }
    constructor(props: Object) {
        super(props);
        this.hoverItem = this.hoverItem.bind(this)
        this.selectOptionClick = this.selectOptionClick.bind(this)
        require_condition(this.props.parent instanceof Select);
    }

    mounted() {
        nextTick(() => {
            this.parent().onOptionCreate(this);
            this.index = this.parent().options.indexOf(this)
            if (this.currentSelected() === true) {
                this.parent().addOptionToValue(this, true);
            }
        });
    }

    unmounted() {
        this.parent().onOptionDestroy(this);
    }

    parent(): Select {
        return this.props.parent;
    }

    currentSelected(): boolean {
        return this.props.selected || (this.parent().props.multiple ?
            this.parent().value.indexOf(this.props.value) > -1 :
            this.parent().value === this.props.value);
    }

    currentLabel(): string {
        return this.props.label || ((typeof this.props.value === 'string' || typeof this.props.value === 'number') ? this.props.value : '');
    }

    itemSelected(): boolean {
        if (Object.prototype.toString.call(this.parent().selected) === '[object Object]') {
            return this === this.parent().selected;
        } else if (Array.isArray(this.parent().selected)) {
            return (this.parent().selected as Option[]).map(el => el.props.value).indexOf(this.props.value) > -1;
        }

        return false;
    }

    hoverItem() {
        if (!this.props.disabled && !this.parent().props.disabled) {
            this.parent().hoverIndex = this.parent().options.indexOf(this)
        }
    }

    selectOptionClick() {
        if (this.props.disabled !== true && this.parent().props.disabled !== true) {
            this.parent().onOptionClick(this);
        }
    }

    queryChange(query: string) {
        // query 里如果有正则中的特殊字符，需要先将这些字符转义
        const parsedQuery = query.replace(/(\^|\(|\)|\[|\]|\$|\*|\+|\.|\?|\\|\{|\}|\|)/g, '\\$1');
        const visible = new RegExp(parsedQuery, 'i').test(this.currentLabel());

        if (!visible) {
            this.parent().filteredOptionsCount = this.parent().filteredOptionsCount - 1
        }
        this.visible = visible;
    }

    resetIndex() {
        this.index = this.parent().options.indexOf(this)
    }

    render() {
        const { visible, index } = this;

        return (
            <View show={visible}>
                <li
                    style={this.style()}
                    className={this.className('el-select-dropdown__item', {
                        'selected': this.itemSelected(),
                        'is-disabled': this.props.disabled || this.parent().props.disabled,
                        'hover': this.parent().hoverIndex === index
                    })}
                    on-mouseenter={this.hoverItem}
                    on-click={this.selectOptionClick}
                >
                    {this.props.children || <span>{this.currentLabel()}</span>}
                </li>
            </View>
        )
    }
}
