const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
function init() {
}

class SSRWidget {
    constructor() {
        this.settings = ExtensionUtils.getSettings();
        this.prefsWidget = new Gtk.Grid({
        });
        this.prefsWidget.margin = this.prefsWidget.row_spacing = this.prefsWidget.column_spacing = 20;
        this.prefsWidget.attach(new Gtk.Label({ label: "Warning Limit", halign: Gtk.Align.END }), 0, 0, 1, 1);
        let warningLimit = Gtk.SpinButton.new_with_range(1, 65, 1);
        this.prefsWidget.attach(warningLimit, 1, 0, 1, 1);
        this.settings.bind('warning-limit', warningLimit, 'value', Gio.SettingsBindFlags.DEFAULT);

        this.prefsWidget.attach(new Gtk.Label({ label: "Pi Address", halign: Gtk.Align.END }), 0, 1, 1, 1);
        let updateDeviceIP = new Gtk.Entry();
        this.prefsWidget.attach(updateDeviceIP, 1, 1, 1, 1);
        updateDeviceIP.set_text(this.settings.get_string('pi-ip'))
        updateDeviceIP.connect("changed", (source) => {
            this.settings.set_string('pi-ip', source.get_text())
        })
        updateDeviceIP.connect("activate", (source) => {
            this.settings.set_string('pi-ip', source.get_text())
        })

        this.prefsWidget.attach(new Gtk.Label({ label: 'Poll Sensors Every (sec)', halign: Gtk.Align.END }), 2, 0, 1, 1);
        let updateTime = Gtk.SpinButton.new_with_range(1, 60, 1);
        this.prefsWidget.attach(updateTime, 3, 0, 1, 1);
        this.settings.bind('update-time', updateTime, 'value', Gio.SettingsBindFlags.DEFAULT);

        this._addSwitch({
            key: 'show-decimal-value', y: 1, x: 2,
            label: 'Show Decimal Value',
            help: "Show two digits after decimal"
        });

    }
    _addSwitch(params) {
        let lbl = new Gtk.Label({ label: params.label, halign: Gtk.Align.END });
        this.prefsWidget.attach(lbl, params.x, params.y, 1, 1);
        let sw = new Gtk.Switch({ halign: Gtk.Align.END, valign: Gtk.Align.CENTER });
        this.prefsWidget.attach(sw, params.x + 1, params.y, 1, 1);
        if (params.help) {
            lbl.set_tooltip_text(params.help);
            sw.set_tooltip_text(params.help);
        }
        this.settings.bind(params.key, sw, 'active', Gio.SettingsBindFlags.DEFAULT);
    }
}

function buildPrefsWidget() {

    let widget = new SSRWidget();
    widget.prefsWidget.show_all()
    return widget.prefsWidget;
}
