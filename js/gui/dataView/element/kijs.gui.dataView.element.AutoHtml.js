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

        html += '<div>';
        html += ' <span class="label">Nr. ' + this.dataIndex + '</span>';
        html += '</div>';

        kijs.Object.each(this._dataRow, function(key, val) {
            html += '<div>';
            html += ' <span class="label">' + key + ': </span>';
            html += ' <span class="value">' + val + '</span>';
            html += '</div>';
        }, this);

        this.html = html;
    }

};
