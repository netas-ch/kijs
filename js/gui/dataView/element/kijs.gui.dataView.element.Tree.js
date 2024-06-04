/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.dataView.element.ListView
// --------------------------------------------------------------
kijs.gui.dataView.element.Tree = class kijs_gui_dataView_element_Tree extends kijs.gui.dataView.element.Base {


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    update() {
        let iconArgs = null;

        // expand Icon
        iconArgs = {
            parent: this,
            cls: 'kijs-expandIcon',
            iconMap: 'kijs.iconMap.blank'
        };
        if (!kijs.isEmpty(this.parent.childsField) && !kijs.isEmpty(this.dataRow[this.parent.childsField])) {
            iconArgs.iconMap = 'kijs.iconMap.Fa.chevron-right';
        }
        let expandIconEl = new kijs.gui.Icon(iconArgs);


        // Icon/Cls
        iconArgs = {parent: this};
        if (!kijs.isEmpty(this.parent.iconClsField) && !kijs.isEmpty(this.dataRow[this.parent.iconClsField])) {
            iconArgs.iconCls = this.dataRow[this.parent.iconClsField];
        }
        if (!kijs.isEmpty(this.parent.iconColorField) && !kijs.isEmpty(this.dataRow[this.parent.iconColorField])) {
            iconArgs.iconColor = this.dataRow[this.parent.iconColorField];
        }
        if (!kijs.isEmpty(this.parent.iconCharField) && !kijs.isEmpty(this.dataRow[this.parent.iconCharField])) {
            iconArgs.iconChar = this.dataRow[this.parent.iconCharField];
        }
        if (!kijs.isEmpty(this.parent.iconMapField) && !kijs.isEmpty(this.dataRow[this.parent.iconMapField])) {
            iconArgs.iconMap = this.dataRow[this.parent.iconMapField];
        }
        let iconEl = new kijs.gui.Icon(iconArgs);

        // Caption
        let caption = '';
        if (!kijs.isEmpty(this.parent.captionField) && !kijs.isEmpty(this.dataRow[this.parent.captionField])) {
            caption = this.dataRow[this.parent.captionField];
        }
        let captionEl = new kijs.gui.Element({
            htmlDisplayType: this.parent.captionHtmlDisplayType,
            nodeTagName: 'span',
            html: caption,
            cls: 'kijs-caption'
        });

        // Tooltip
        let tooltip = '';
        if (!kijs.isEmpty(this.parent.tooltipField) && !kijs.isEmpty(this.dataRow[this.parent.tooltipField])) {
            tooltip = this.dataRow[this.parent.tooltipField];
        }

        // Checkbox
        let cls = '';
        if (this.parent.showCheckBoxes) {
            switch (this.parent.selectType) {
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
        this.add([expandIconEl, iconEl, captionEl]);
    }

};
