import { h, cloneVNode } from '../../../index';
import { Component, View } from '../../libs';
import debounce from 'throttle-debounce/debounce';
import { reset as CSSreset } from '../../libs/utils/style';
import Popper from '../../libs/utils/popper';
import { addResizeListener, removeResizeListener } from '../../libs/utils/resize-event';
import Input from '../input/Input';
import { Scrollbar } from '../scrollbar/Scrollbar';
import Tag from '../tag/Tag';
import i18n from '../locale/index';
import { VNode } from '../../../vnode';
import Option from './Option';

CSSreset(`
  .el-select-dropdown {
    position: absolute !important;
  }
`)

type State = {
    options: Array<Object>,
    isSelect: boolean,
    inputLength: number,
    inputWidth: number,
    inputHovering: boolean,
    filteredOptionsCount: number,
    optionsCount: number,
    hoverIndex: number,
    bottomOverflowBeforeHidden: number,
    cachedPlaceHolder: string,
    currentPlaceholder: string,
    selectedLabel: string,
    value: any,
    visible: boolean,
    query: string,
    selected: any,
    voidRemoteQuery: boolean,
    valueChangeBySelected: boolean,
    selectedInit: boolean,
    dropdownUl?: HTMLElement
};

const sizeMap: { [size: string]: number } = {
    'large': 42,
    'small': 30,
    'mini': 22
};

export default class Select extends Component {
    popperJS: any;
    popper: HTMLElement;
    reference: HTMLElement;
    timeout: any;
    debouncedOnInputChange: Function;
    dropdownUl?: HTMLElement

    options: any[];
    isSelect: boolean;
    inputLength: number;
    inputWidth: number;
    inputHovering: boolean;
    filteredOptionsCount: number;
    optionsCount: number;
    hoverIndex: number;
    bottomOverflowBeforeHidden: number;
    cachedPlaceHolder: string;
    currentPlaceholder: string;
    selectedLabel: string;
    selectedInit: boolean;
    visible: boolean;
    selected: Option[] | Option;
    value: any;
    valueChangeBySelected: boolean;
    voidRemoteQuery: boolean;
    query: string;

    protected initialState() {
        let props = this.props

        return {
            options: [],
            isSelect: true,
            inputLength: 20,
            inputWidth: 0,
            inputHovering: false,
            filteredOptionsCount: 0,
            optionsCount: 0,
            hoverIndex: -1,
            bottomOverflowBeforeHidden: 0,
            cachedPlaceHolder: props.placeholder || i18n.t('el.select.placeholder'),
            currentPlaceholder: props.placeholder || i18n.t('el.select.placeholder'),
            selectedLabel: '',
            selectedInit: props.multiple ? true : false,
            visible: false,
            selected: props.multiple ? [] : undefined,
            value: props.value,
            valueChangeBySelected: false,
            voidRemoteQuery: props.remote ? true : false,
            query: '',
        }
    }


    constructor(props) {
        super(props);
        this.debouncedOnInputChange = debounce(this.debounce(), () => {
            this.onInputChange();
        });
        this.handleClickOutside = this.handleClickOutside.bind(this)
        this.toggleMenu = this.toggleMenu.bind(this)
    }

    created() {
        this.$watcher('visible', () => {
            this.onVisibleChange(this.visible);
            this.emit('visibleChange', this.visible)
        });

        this.$watcher('value', () => {
            this.onValueChange(this.value);
        });
        this.$watcher('query', () => {
            console.log('onQueryChange')
            this.onQueryChange(this.query);
        });

        this.$watcher('selected', () => {
            if (Array.isArray(this.selected)) {
                this.onSelectedChange(this.selected);
            }
        });
    }


    mounted() {
        addResizeListener(this.$refs.root, this.resetInputWidth.bind(this));
        this.reference = (this.$refs.reference as Component).getNodeProxy().getNativeNode();
        this.popper = this.$refs.popper;
        this.handleValueChange();
    }

    onUpdateProps(props) {
        this.currentPlaceholder = props.placeholder;
        this.value = props.value;
        this.handleValueChange();
    }

    afterUpdate() {
        const { visible } = this;

        if (visible) {
            if (this.popperJS) {
                this.popperJS.update();
            } else {
                this.popperJS = new Popper(this.reference, this.popper, {
                    gpuAcceleration: false
                });
            }
        } else {
            if (this.popperJS) {
                this.popperJS.destroy();
            }
            delete this.popperJS;
        }
        this.inputWidth = this.reference.getBoundingClientRect().width;
    }

    unmounted() {
        removeResizeListener(this.$refs.root, this.resetInputWidth.bind(this));
        if (this.popperJS) {
            this.popperJS.destroy();
        }
    }

    debounce(): number {
        return this.props.remote ? 300 : 0;
    }

    handleClickOutside() {
        this.visible = false;
    }

    handleValueChange() {
        const { multiple } = this.props;
        const { value, options } = this;

        if (multiple && Array.isArray(value)) {
            this.selected = options.reduce((prev, curr) => {
                return value.indexOf(curr.props.value) > -1 ? prev.concat(curr) : prev;
            }, []);
            this.onSelectedChange(this.selected, false);
        } else {
            const selected = options.filter(option => {
                return option.props.value === value
            })[0];

            if (selected) {
                this.selectedLabel = selected.props.label || selected.props.value;
            }
        }
    }

    onVisibleChange(visible: boolean) {
        const { multiple, filterable } = this.props;
        let { query, dropdownUl, selected, selectedLabel, bottomOverflowBeforeHidden } = this;

        if (!visible) {
            this.reference.querySelector('input').blur();

            if (this.$refs.root.querySelector('.el-input__icon')) {
                const elements = this.$refs.root.querySelector('.el-input__icon');

                for (let i = 0; i < elements.length; i++) {
                    elements[i].classList.remove('is-reverse');
                }
            }

            if (this.$refs.input) {
                this.$refs.input.blur();
            }

            this.resetHoverIndex();

            if (!multiple) {
                if (dropdownUl && selected) {
                    const element: any = (selected as Component).getNodeProxy().getNativeNode()
                    bottomOverflowBeforeHidden = element.getBoundingClientRect().bottom - this.popper.getBoundingClientRect().bottom;
                }

                if (selected && (selected as Option).props) {
                    if ((selected as Option).props.value) {
                        selectedLabel = (selected as Option).currentLabel();
                    }
                } else if (filterable) {
                    selectedLabel = '';
                }
                this.bottomOverflowBeforeHidden = bottomOverflowBeforeHidden;
                this.selectedLabel = selectedLabel;
            }
        } else {
            let icon = this.$refs.root.querySelector('.el-input__icon');

            if (icon && !icon.classList.contains('el-icon-circle-close')) {
                const elements = this.$refs.root.querySelector('.el-input__icon');

                for (let i = 0; i < elements.length; i++) {
                    elements[i].classList.add('is-reverse');
                }
            }

            if (this.popperJS) {
                this.popperJS.update();
            }

            if (filterable) {
                query = selectedLabel;

                if (multiple) {
                    this.$refs.input.focus();
                } else {
                    this.$refs.reference.focus();
                }
            }

            if (!dropdownUl) {
                let dropdownChildNodes = this.popper.childNodes;
                dropdownUl = [].filter.call(dropdownChildNodes, item => item.tagName === 'UL')[0];
            }

            if (!multiple && dropdownUl) {
                if (bottomOverflowBeforeHidden > 0) {
                    dropdownUl.scrollTop += bottomOverflowBeforeHidden;
                }
            }
            this.query = query || '', dropdownUl
        }
    }

    onValueChange(val) {
        const { multiple } = this.props;

        let {
            options,
            valueChangeBySelected,
            selectedInit,
            selected,
            selectedLabel,
            currentPlaceholder,
            cachedPlaceHolder
        } = this;

        if (valueChangeBySelected) {
            this.valueChangeBySelected = false;
        }

        if (multiple && Array.isArray(val)) {
            this.resetInputHeight();

            selectedInit = true;
            selected = [];
            currentPlaceholder = cachedPlaceHolder;

            val.forEach(item => {
                let option = options.filter(option => option.props.value === item)[0];
                if (option) {
                    this.addOptionToValue(option);
                }
            });
        }

        if (!multiple) {
            let option = options.filter(option => option.props.value === val)[0];

            if (option) {
                this.addOptionToValue(option);
            } else {
                selected = {} as any;
                selectedLabel = '';
            }
        }
        this.selectedInit = selectedInit;
        this.selected = selected;
        this.currentPlaceholder = currentPlaceholder;
        this.selectedLabel = selectedLabel;
        this.resetHoverIndex();
    }

    onSelectedChange(val: any, bubble: boolean = true) {
        const { form } = this.props;
        const { multiple, filterable } = this.props;
        let { query, hoverIndex, inputLength, selectedInit, currentPlaceholder, cachedPlaceHolder, valueChangeBySelected } = this

        if (multiple) {
            if (val.length > 0) {
                currentPlaceholder = '';
            } else {
                currentPlaceholder = cachedPlaceHolder;
            }
            this.currentPlaceholder = currentPlaceholder;
            this.resetInputHeight();

            valueChangeBySelected = true;

            if (bubble) {
                this.emit('change', val.map(item => item.props.value), val)
                form && form.onFieldChange();
            }

            if (filterable) {
                query = '';
                hoverIndex = -1;
                inputLength = 20;
                if (this.$refs.input) {
                    this.$refs.input.focus();
                }
            }
            this.valueChangeBySelected = valueChangeBySelected;
            this.query = query;
            this.hoverIndex = hoverIndex;
            this.inputLength = inputLength;
            this.valueChangeBySelected = valueChangeBySelected;
            if (this.$refs.input) {
                this.$refs.input.value = '';
            }
        } else {
            if (selectedInit) {
                this.selectedInit = false;
            }
            if (bubble) {
                this.emit('change', val.props.value, val)
                form && form.onFieldChange();
            }
        }
    }

    onQueryChange(query: string) {
        const { multiple, filterable, remote, remoteMethod, filterMethod } = this.props;
        let { voidRemoteQuery, hoverIndex, options, optionsCount } = this

        if (this.popperJS) {
            this.popperJS.update();
        }

        if (multiple && filterable) {
            this.resetInputHeight();
        }

        if (remote && typeof remoteMethod === 'function') {
            hoverIndex = -1;
            voidRemoteQuery = query === '';

            remoteMethod(query);

            options.forEach(option => {
                option.resetIndex();
            });
        } else if (typeof filterMethod === 'function') {
            filterMethod(query);
        } else {
            this.filteredOptionsCount = optionsCount
            options.forEach(option => {
                option.queryChange(query);
            });
        }
        this.hoverIndex = hoverIndex;
        this.voidRemoteQuery = voidRemoteQuery;
    }

    optionsAllDisabled(options): boolean {
        return options.length === (options.filter(item => item.props.disabled === true).length);
    }

    iconClass(): string {
        return this.showCloseIcon() ? 'circle-close' : (this.props.remote && this.props.filterable ? '' : `caret-top ${this.visible ? 'is-reverse' : ''}`);
    }

    showCloseIcon(): boolean {
        let criteria = this.props.clearable && this.inputHovering && !this.props.multiple && this.options.indexOf(this.selected) > -1;

        if (!this.$refs.root) return false;

        let icon = this.$refs.root.querySelector('.el-input__icon');

        if (icon) {
            if (criteria) {
                icon.addEventListener('click', this.deleteSelected.bind(this));
                icon.classList.add('is-show-close');
            } else {
                icon.removeEventListener('click', this.deleteSelected.bind(this));
                icon.classList.remove('is-show-close');
            }
        }

        return criteria;
    }

    emptyText() {
        const { loading, filterable } = this.props;
        const { voidRemoteQuery, options, filteredOptionsCount } = this;

        if (loading) {
            return i18n.t('el.select.loading');
        } else {
            if (voidRemoteQuery) {
                this.voidRemoteQuery = false;
                return false;
            }
            if (filterable && filteredOptionsCount === 0) {
                return i18n.t('el.select.noMatch');
            }
            if (options.length === 0) {
                return i18n.t('el.select.noData');
            }
        }

        return null;
    }

    handleClose() {
        this.visible = false
    }

    toggleLastOptionHitState(hit?: boolean): any {
        const { selected } = this;

        if (!Array.isArray(selected)) return;

        const option = selected[selected.length - 1];

        if (!option) return;

        if (hit === true || hit === false) {
            return option.hitState = hit;
        }

        option.hitState = !option.hitState;

        return option.hitState;
    }

    deletePrevTag(e) {
        if (e.target.value.length <= 0 && !this.toggleLastOptionHitState()) {
            const { selected } = this;
            (selected as Option[]).pop();
        }
    }

    addOptionToValue(option: any, init?: boolean) {
        const { multiple, remote } = this.props;
        let { selected, selectedLabel, hoverIndex, value } = this;

        if (multiple) {
            if ((selected as Option[]).indexOf(option) === -1 && (remote ? value.indexOf(option.props.value) === -1 : true)) {
                this.selectedInit = !!init;

                (selected as Option[]).push(option);

                this.resetHoverIndex();
            }
        } else {
            this.selectedInit = !!init;

            selected = option;
            selectedLabel = option.currentLabel();
            hoverIndex = option.index;
        }
        this.selected = selected
        this.selectedLabel = selectedLabel
        this.hoverIndex = hoverIndex
    }

    managePlaceholder() {
        let { currentPlaceholder, cachedPlaceHolder } = this;

        if (currentPlaceholder !== '') {
            currentPlaceholder = this.$refs.input.value ? '' : cachedPlaceHolder;
        }
        this.currentPlaceholder = currentPlaceholder
    }

    resetInputState(e) {
        if (e.keyCode !== 8) {
            this.toggleLastOptionHitState(false);
        }
        this.inputLength = this.$refs.input.value.length * 15 + 20
    }

    resetInputWidth() {
        this.inputWidth = this.reference.getBoundingClientRect().width
    }

    resetInputHeight() {
        let inputChildNodes = this.reference.childNodes;
        let input = [].filter.call(inputChildNodes, item => item.tagName === 'INPUT')[0];

        input.style.height = Math.max(this.$refs.tags.clientHeight + 6, sizeMap[this.props.size] || 36) + 'px';

        if (this.popperJS) {
            this.popperJS.update();
        }
    }

    resetHoverIndex() {
        const { multiple } = this.props;
        let { hoverIndex, options, selected } = this

        setTimeout(() => {
            if (!multiple) {
                hoverIndex = options.indexOf(selected);
            } else {
                if ((selected as Option[]).length > 0) {
                    hoverIndex = Math.min.apply(null, (selected as Option[]).map(item => options.indexOf(item)));
                } else {
                    hoverIndex = -1;
                }
            }
            this.hoverIndex = hoverIndex
        }, 300);
    }

    toggleMenu() {
        const { filterable, disabled } = this.props;
        const { query, visible } = this

        if (filterable && query === '' && visible) {
            return;
        }

        if (!disabled) {
            this.visible = !visible
        }
    }

    navigateOptions(direction: string) {
        let { visible, hoverIndex, options } = this

        if (!visible) {
            this.visible = true
            return
        }

        let skip;

        if (options.length != options.filter(item => item.props.disabled === true).length) {
            if (direction === 'next') {
                hoverIndex++;

                if (hoverIndex === options.length) {
                    hoverIndex = 0;
                }

                if (options[hoverIndex].props.disabled === true ||
                    options[hoverIndex].props.groupDisabled === true ||
                    !options[hoverIndex].visible) {
                    skip = 'next';
                }
            }

            if (direction === 'prev') {
                hoverIndex--;

                if (hoverIndex < 0) {
                    hoverIndex = options.length - 1;
                }

                if (options[hoverIndex].props.disabled === true ||
                    options[hoverIndex].props.groupDisabled === true ||
                    !options[hoverIndex].visible) {
                    skip = 'prev';
                }
            }
        }
        this.hoverIndex = hoverIndex
        this.options = options
        if (skip) {
            this.navigateOptions(skip);
        }
        this.resetScrollTop();
    }

    resetScrollTop() {
        const element: any = (this.options[this.hoverIndex] as Component).getNodeProxy().getNativeNode()
        const bottomOverflowDistance = element.getBoundingClientRect().bottom - this.popper.getBoundingClientRect().bottom;
        const topOverflowDistance = element.getBoundingClientRect().top - this.popper.getBoundingClientRect().top;

        if (this.dropdownUl) {
            if (bottomOverflowDistance > 0) {
                this.dropdownUl.scrollTop += bottomOverflowDistance;
            }
            if (topOverflowDistance < 0) {
                this.dropdownUl.scrollTop += topOverflowDistance;
            }
        }
    }

    selectOption() {
        let { hoverIndex, options } = this

        if (options[hoverIndex]) {
            this.onOptionClick(options[hoverIndex]);
        }
    }

    deleteSelected(e) {
        e.stopPropagation();

        if (this.selectedLabel != '') {
            this.selected = {} as any;
            this.selectedLabel = '';
            this.visible = false;

            this.props.form && this.props.form.onFieldChange();

            if (this.props.onChange) {
                this.props.onChange('');
            }

            if (this.props.onClear) {
                this.props.onClear();
            }
        }
    }

    deleteTag(tag: any) {
        const index = (this.selected as Option[]).indexOf(tag);

        if (index > -1 && !this.props.disabled) {
            const selected = (this.selected as Option[]).slice(0);

            selected.splice(index, 1);
            this.selected = selected
            if (this.props.onRemoveTag) {
                this.props.onRemoveTag(tag.props.value);
            }
        }
    }

    handleIconClick(event) {
        if (this.iconClass().indexOf('circle-close') > -1) {
            this.deleteSelected(event);
        } else {
            this.toggleMenu();
        }
    }

    onInputChange() {
        if (this.props.filterable && this.selectedLabel !== this.value) {
            this.query = this.selectedLabel
        }
    }

    onOptionCreate(option: any) {
        this.options.push(option);
        this.optionsCount++;
        this.filteredOptionsCount++;

        this.handleValueChange();
    }

    onOptionDestroy(option: any) {
        this.optionsCount--;
        this.filteredOptionsCount--;

        const index = this.options.indexOf(option);

        if (index > -1) {
            this.options.splice(index, 1);
        }

        this.options.forEach(el => {
            if (el != option) {
                el.resetIndex();
            }
        });

        this.handleValueChange();
    }

    onOptionClick(option: any) {
        const { multiple } = this.props;
        let { visible, selected, selectedLabel } = this

        if (!multiple) {
            selected = option;
            selectedLabel = option.currentLabel();
            visible = false;
        } else {
            let optionIndex = -1;

            selected = (this.selected as Option[]).slice(0);

            selected.forEach((item, index) => {
                if (item === option || item.currentLabel() === option.currentLabel()) {
                    optionIndex = index;
                }
            });

            if (optionIndex > -1) {
                selected.splice(optionIndex, 1);
            } else {
                selected.push(option);
            }
        }

        this.selected = selected;
        this.selectedLabel = selectedLabel;
        if (!multiple) {
            this.onSelectedChange(this.selected);

        }
        this.visible = visible;

    }

    onMouseDown(event) {
        event.preventDefault();
        if (this.$refs.input) {
            this.$refs.input.focus();
        }
        this.toggleMenu();
    }

    onMouseEnter() {
        this.inputHovering = true
    }

    onMouseLeave() {
        this.inputHovering = false
    }

    render() {
        const { multiple, size, disabled, filterable, loading } = this.props;
        const { selected, inputWidth, inputLength, query, selectedLabel, visible, options, filteredOptionsCount, currentPlaceholder } = this

        return (
            <div ref="root" cmd-clickOutside={this.handleClickOutside} style={this.style()} className={this.className('el-select')}>
                {
                    multiple && (
                        <div ref="tags" className="el-select__tags" on-click={this.toggleMenu} style={{
                            maxWidth: inputWidth - 32
                        }}>
                            {
                                (selected as Option[]).map(el => {
                                    return (
                                        <Tag
                                            type="primary"
                                            key={el.props.value}
                                            hit={el.hitState}
                                            closable={!disabled}
                                            closeTransition={true}
                                            on-close={this.deleteTag.bind(this, el)}
                                        >
                                            <span className="el-select__tags-text">{el.currentLabel()}</span>
                                        </Tag>
                                    )
                                })
                            }
                            {
                                filterable && (
                                    <input
                                        ref="input"
                                        type="text"
                                        className={this.classNames('el-select__input', size && `is-${size}`)}
                                        style={{ width: inputLength, maxWidth: inputWidth - 42 }}
                                        disabled={disabled}
                                        defaultValue={query}
                                        on-keyup={this.managePlaceholder.bind(this)}
                                        on-keydown={(e) => {
                                            this.resetInputState(e);

                                            switch (e.keyCode) {
                                                case 27:
                                                    this.visible = false; e.preventDefault();
                                                    break;
                                                case 8:
                                                    this.deletePrevTag(e);
                                                    break;
                                                case 13:
                                                    this.selectOption(); e.preventDefault();
                                                    break;
                                                case 38:
                                                    this.navigateOptions('prev'); e.preventDefault();
                                                    break;
                                                case 40:
                                                    this.navigateOptions('next'); e.preventDefault();
                                                    break;
                                                default:
                                                    break;
                                            }
                                        }}
                                        on-input={(e) => {
                                            clearTimeout(this.timeout);

                                            this.timeout = setTimeout(() => {
                                                this.query = this.value
                                            }, this.debounce());

                                            this.value = e.target.value;
                                        }}
                                    />
                                )
                            }
                        </div>
                    )
                }
                <Input
                    ref="reference"
                    value={selectedLabel}
                    type="text"
                    placeholder={currentPlaceholder}
                    name="name"
                    size={size}
                    disabled={disabled}
                    readOnly={!filterable || multiple}
                    icon={this.iconClass() || undefined}
                    on-change={value => { this.selectedLabel = value; }}
                    on-iconClick={this.handleIconClick.bind(this)}
                    on-mousedown={this.onMouseDown.bind(this)}
                    on-mouseenter={this.onMouseEnter.bind(this)}
                    on-mouseleave={this.onMouseLeave.bind(this)}
                    on-keyup={this.debouncedOnInputChange.bind(this)}
                    on-keydown={(e) => {
                        switch (e.keyCode) {
                            case 9:
                            case 27:
                                this.visible = false; e.preventDefault();
                                break;
                            case 13:
                                this.selectOption(); e.preventDefault();
                                break;
                            case 38:
                                this.navigateOptions('prev'); e.preventDefault();
                                break;
                            case 40:
                                this.navigateOptions('next'); e.preventDefault();
                                break;
                            default:
                                break;
                        }
                    }}
                />
                <View show={visible && this.emptyText() !== false}>
                    <div ref="popper" className={this.classNames('el-select-dropdown', {
                        'is-multiple': multiple
                    })} style={{
                        minWidth: inputWidth,
                    }}>
                        <View show={options.length > 0 && filteredOptionsCount > 0 && !loading}>
                            <Scrollbar
                                viewComponent="ul"
                                wrapClass="el-select-dropdown__wrap"
                                viewClass="el-select-dropdown__list"
                            >
                                {this.props.children.map((child: VNode) => {
                                    child = cloneVNode(child)
                                    child.props = Object.assign({}, child.props, { parent: this });
                                    return child;
                                })}
                            </Scrollbar>
                        </View>
                        {this.emptyText() && <p className="el-select-dropdown__empty">{this.emptyText()}</p>}
                    </div>
                </View>
            </div>
        )
    }
}
