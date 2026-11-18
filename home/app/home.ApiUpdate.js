/* global kijs */

// --------------------------------------------------------------
// home.ApiUpdate
// --------------------------------------------------------------
/**
 * Aktualisiert die API-Dokumentation (home/data/api.sqlite) und zeigt dabei
 * ein Fenster mit dem Fortschritt an. Das Update läuft in Schritten über die
 * RPCs api.updateStart, api.updateFile (einmal pro Datei) und api.updateFinish.
 *
 * @example
 * const stats = await new home.ApiUpdate().run();
 */
home.ApiUpdate = class home_ApiUpdate {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor() {
        this._btnClose = null;
        this._cancelled = false;
        this._infoEl = null;
        this._progressBar = null;
        this._running = false;
        this._win = null;
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Startet das Update und zeigt den Fortschritt an
     * @returns {Promise}  Zusammenfassung (Anzahl Klassen, Lücken, Fehler)
     *                     oder null bei Abbruch oder Fehler
     */
    async run() {
        this._createWindow();
        this._running = true;
        const startTime = Date.now();

        try {
            // 1. Start: Dateiliste
            const startData = await this._rpc('api.updateStart');
            if (!startData) {
                return this._end(null);
            }
            const files = startData.files;

            // 2. Dateien einzeln parsen
            const errors = [];
            for (let i=0; i<files.length; i++) {
                if (this._cancelled) {
                    await this._rpc('api.updateCancel');
                    this._infoEl.html = 'Abgebrochen.';
                    return this._end(null);
                }

                this._progressBar.bottomCaption = kijs.String.htmlspecialchars(files[i].file);
                const fileData = await this._rpc('api.updateFile', { idx: i });
                if (!fileData) {
                    await this._rpc('api.updateCancel');
                    return this._end(null);
                }
                if (fileData.error) {
                    errors.push(fileData.file + ': ' + fileData.error);
                }
                this._progressBar.percent = Math.round((i + 1) / (files.length + 1) * 100);
            }

            // 3. Abschluss
            this._progressBar.bottomCaption = 'Vererbung und Lückenbericht...';
            const stats = await this._rpc('api.updateFinish');
            if (!stats) {
                await this._rpc('api.updateCancel');
                return this._end(null);
            }
            stats.seconds = ((Date.now() - startTime) / 1000).toFixed(1);
            this._progressBar.percent = 100;
            this._progressBar.bottomCaption = '';
            this._infoEl.html = this._getSummaryHtml(stats);

            return this._end(stats);

        } catch (ex) {
            this._infoEl.html = 'Fehler: ' + kijs.String.htmlspecialchars(ex.message);
            await this._rpc('api.updateCancel');
            return this._end(null);
        }
    }


    // PROTECTED
    /**
     * Erstellt das Fenster mit der Fortschrittsanzeige
     */
    _createWindow() {
        this._progressBar = new kijs.gui.ProgressBar({
            caption: 'Dateien parsen',
            showPercent: true
        });

        this._infoEl = new kijs.gui.Element({
            html: '',
            style: { marginTop: '10px' }
        });

        this._btnClose = new kijs.gui.Button({
            caption: 'Abbrechen',
            on: {
                click: this.#onBtnCloseClick,
                context: this
            }
        });

        this._win = new kijs.gui.Window({
            caption: 'API aktualisieren',
            iconMap: 'kijs.iconMap.Fa.arrows-rotate',
            modal: true,
            closable: false,
            width: 480,
            innerStyle: {
                padding: '10px'
            },
            elements: [
                this._progressBar,
                this._infoEl
            ],
            footerElements: [
                this._btnClose
            ]
        });
        this._win.show();
    }

    /**
     * Schliesst den Ablauf ab: Schaltfläche wird zu «Schliessen»
     * @param {Object|null} result
     * @returns {Object|null}
     */
    _end(result) {
        this._running = false;
        this._btnClose.caption = 'Schliessen';
        this._btnClose.disabled = false;
        if (result === null && this._infoEl.html === '') {
            this._infoEl.html = 'Das Update wurde nicht abgeschlossen.';
        }
        return result;
    }

    /**
     * Gibt die Zusammenfassung als HTML zurück
     * @param {Object} stats
     * @returns {String}
     */
    _getSummaryHtml(stats) {
        let html = '<b>Fertig</b> in ' + stats.seconds + ' s<br>';
        html += stats.files + ' Dateien, ' + stats.classes + ' Klassen<br>';
        html += stats.issues + ' Lücken in der Doku<br>';
        if (stats.errors) {
            html += '<br><b>' + stats.errors + ' Fehler:</b><ul>';
            kijs.Array.each(stats.errorList, function(err) {
                html += '<li>' + kijs.String.htmlspecialchars(err.file + ': ' + err.message) + '</li>';
            }, this);
            html += '</ul>';
        }
        return html;
    }

    /**
     * Führt einen RPC aus. Fehler zeigt kijs.gui.Rpc selbst an.
     * @param {String} remoteFn
     * @param {Object} [requestData]
     * @returns {Promise}  response.data oder null bei einem Fehler
     */
    async _rpc(remoteFn, requestData) {
        const rpcData = await kijs.getRpc('app').do({
            remoteFn: remoteFn,
            requestData: requestData || {},
            waitMaskTarget: 'none'
        });
        if (!kijs.isEmpty(rpcData.response.errorType)) {
            return null;
        }
        return rpcData.response.data;
    }


    // PRIVATE
    // LISTENERS
    #onBtnCloseClick(e) {
        if (this._running) {
            this._cancelled = true;
            this._btnClose.disabled = true;
        } else {
            this._win.destruct();
            this._win = null;
        }
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        if (this._win) {
            this._win.destruct();
        }

        this._btnClose = null;
        this._infoEl = null;
        this._progressBar = null;
        this._win = null;
    }

};
