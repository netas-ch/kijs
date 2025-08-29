/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.dataView.element.ListView
// --------------------------------------------------------------
kijs.gui.dataView.element.ListView = class kijs_gui_dataView_element_ListView extends kijs.gui.dataView.element.Base {


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    update() {

        // Icon
        let iconMap = null;
        let iconChar = null;
        let iconCls = null;
        let iconAnimationCls = null;
        let iconColor = null;

        if (!kijs.isEmpty(this._parentEl.iconMapField)) {
            iconMap = this.dataRow[this._parentEl.iconMapField];
        } else {
            iconMap = this._parentEl.iconMap;
        }
        if (!kijs.isEmpty(this._parentEl.iconCharField)) {
            iconChar = this.dataRow[this._parentEl.iconCharField];
        } else {
            iconChar = this._parentEl.iconChar;
        }
        if (!kijs.isEmpty(this._parentEl.iconClsField)) {
            iconCls = this.dataRow[this._parentEl.iconClsField];
        } else {
            iconCls = this._parentEl.iconCls;
        }
        if (!kijs.isEmpty(this._parentEl.iconAnimationClsField)) {
            iconAnimationCls = this.dataRow[this._parentEl.iconAnimationClsField];
        } else {
            iconAnimationCls = this._parentEl.iconAnimationCls;
        }
        if (!kijs.isEmpty(this._parentEl.iconColorField)) {
            iconColor = this.dataRow[this._parentEl.iconColorField];
        } else {
            iconColor = this._parentEl.iconColor;
        }

        let iconArgs = {parent: this};
        if (!kijs.isEmpty(iconMap)) {
            iconArgs.iconMap = iconMap;
        }
        if (!kijs.isEmpty(iconChar)) {
            iconArgs.iconChar = iconChar;
        }
        if (!kijs.isEmpty(iconCls)) {
            iconArgs.iconCls = iconCls;
        }
        if (!kijs.isEmpty(iconAnimationCls)) {
            iconArgs.iconAnimationCls = iconAnimationCls;
        }
        if (!kijs.isEmpty(iconColor)) {
            iconArgs.iconColor = iconColor;
        }

        let iconEl = new kijs.gui.Icon(iconArgs);


        // Caption
        let caption = '';
        if (!kijs.isEmpty(this._parentEl.captionField) && !kijs.isEmpty(this.dataRow[this._parentEl.captionField])) {
            caption = this.dataRow[this._parentEl.captionField];
        }
        let captionEl = new kijs.gui.Element({
            htmlDisplayType: this._parentEl.captionHtmlDisplayType,
            nodeTagName: 'span',
            html: caption,
            cls: 'kijs-caption'
        });

        // Tooltip
        let tooltip = '';
        if (!kijs.isEmpty(this._parentEl.tooltipField) && !kijs.isEmpty(this.dataRow[this._parentEl.tooltipField])) {
            tooltip = this.dataRow[this._parentEl.tooltipField];
        }

        // Checkbox
        let cls = '';
        if (this._parentEl.showCheckBoxes) {
            switch (this._parentEl.selectType) {
                case 'single':
                case 'singleAndEmpty':
                    cls = 'kijs-display-options';
                    break;

                case 'simple':
                case 'multi':
                    cls = 'kijs-display-checkboxes';
                    break;

            }
        }

        this._dom.clsRemove(['kijs-display-options', 'kijs-display-checkboxes']);
        if (cls) {
            this._dom.clsAdd(cls);
        }

        this.tooltip = tooltip;

        this.removeAll();
        this.add([iconEl, captionEl]);
    }

};
