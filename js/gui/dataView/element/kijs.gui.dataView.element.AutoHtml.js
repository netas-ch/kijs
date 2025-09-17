/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.dataView.element.AutoHtml
// --------------------------------------------------------------
kijs.gui.dataView.element.AutoHtml = class kijs_gui_dataView_element_AutoHtml extends kijs.gui.dataView.element.Base {


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    update() {
        let html = '';

        kijs.Object.each(this._dataRow, function(key, val) {
            html += '<div>';
            html += ' <span class="label">' + key + ': </span>';
            html += ' <span class="value">' + val + '</span>';
            html += '</div>';
        }, this);

        this.html = html;

        // Disabled
        if (!kijs.isEmpty(this._parentEl.disabledField) && !kijs.isEmpty(this.dataRow[this._parentEl.disabledField]) && !!this.dataRow[this._parentEl.disabledField]) {
            this.disabled = true;
        }
    }

};
