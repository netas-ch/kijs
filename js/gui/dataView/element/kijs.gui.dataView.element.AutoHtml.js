/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.dataView.element.AutoHtml
// --------------------------------------------------------------
/**
 * Element für kijs.gui.DataView, das alle Felder des Datensatzes als «Feldname: Wert» untereinander
 * anzeigt. Standard-Element der DataView.
 */
kijs.gui.dataView.element.AutoHtml = class kijs_gui_dataView_element_AutoHtml extends kijs.gui.dataView.element.Base {


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Erstellt pro Feld des Datensatzes eine Zeile mit Feldname und Wert.
     * @returns {undefined}
     */
    update() {
        let html = '';

        kijs.Object.each(this._dataRow, function(key, val) {
            html += '<div>';
            html += ' <span class="label">' + key + ': </span>';
            html += ' <span class="value">' + val + '</span>';
            html += '</div>';
        }, this);

        this.html = html;
    }

};
