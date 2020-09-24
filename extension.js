const Gio = imports.gi.Gio;
const St = imports.gi.St;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Clutter = imports.gi.Clutter;
const Mainloop = imports.mainloop;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const centigrade = "\u00b0C"
const IndicaterName = "Pi Temp";


function exec(argv, flags = Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE) {
    return new Promise((resolve) => {
        let process = Gio.Subprocess.new(argv, flags);
        process.communicate_utf8_async(null, null, (source, result) => {
            let [ok, stdout, stderr] = source.communicate_utf8_finish(result)
            resolve([ok, stdout, stderr])
        })
    })
}

let PiTempIndicator = GObject.registerClass(class extends PanelMenu.Button {
    _init() {
        super._init(null, "PiTemp")
        // ICON adopted from https://iconape.com/orange-pi-logo-logo-icon-svg-png.html
        this._temperatureIcon = Gio.icon_new_for_string(Me.path + '/icons/pi-white.svg');
        this._initialIcon = new St.Icon({ style_class: 'system-status-icon' });
        this._initialIcon.gicon = this._temperatureIcon;
        this._label = new St.Label({
            text: "NaN",
            y_expand: true,
            y_align: Clutter.ActorAlign.CENTER
        })
        this._menuLayout = new St.BoxLayout();
        this._menuLayout.add(this._initialIcon)
        this._menuLayout.add(this._label)
        this.add_child(this._menuLayout)

        this._updateUI();
        this._updateUITimeoutId = Mainloop.timeout_add(2000, async () => {
            await this._updateUI();
            return true;
        });

        this.connect('destroy', this._onDestroy.bind(this));
    }
    async _updateUI() {
        const [ok, stdout, stderr] = await exec("ssh root@192.168.1.207 cat /sys/class/thermal/thermal_zone0/temp".split(" "))
        if (this._label != null) {
            if (ok) {
                let temp = Math.round(parseInt(stdout) / 1000)
                if (temp != NaN) {
                    this._label.text = `${temp}${centigrade}`
                    return
                }
            }
            log("Pi Temp: Failed to query temperature, message:")
            log(stdout)
            log(stderr)
            this._label.text = "NaN"
        }
    }
    _onDestroy() {
        this._label = null
        Mainloop.source_remove(this._updateUITimeoutId)
    }
})
class Extension {
    constructor() {
        this.indicator = null;
    }
    enable() {
        this.indicator = new PiTempIndicator();
        Main.panel.addToStatusArea(PiTempIndicator, this.indicator);
    }
    disable() {
        if (this.indicator != null) {
            this.indicator.destroy();
            this.indicator = null;
        }
    }

}
function init() {
    return new Extension();
}