// /home/antonio/.config/HyprPanel/lib/session.ts
import GLib from "gi://GLib?version=2.0";
Object.assign(globalThis, {
  OPTIONS: `${GLib.get_user_cache_dir()}/ags/hyprpanel/options.json`,
  TMP: `${GLib.get_tmp_dir()}/ags/hyprpanel`,
  USER: GLib.get_user_name()
});
Utils.ensureDirectory(TMP);
App.addIcons(`${App.configDir}/assets`);

// /home/antonio/.config/HyprPanel/globals/variables.ts
var isHexColor = (value) => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
};

// /home/antonio/.config/HyprPanel/lib/option.ts
import { Variable as Variable2 } from "resource:///com/github/Aylur/ags/variable.js";
function mkOptions(cacheFile, object, confFile = "config.json") {
  for (const opt of getOptions(object))
    opt.init(cacheFile);
  Utils.ensureDirectory(cacheFile.split("/").slice(0, -1).join("/"));
  const configFile = `${TMP}/${confFile}`;
  const values = getOptions(object).reduce((obj, { id, value }) => ({ [id]: value, ...obj }), {});
  Utils.writeFileSync(JSON.stringify(values, null, 2), configFile);
  Utils.monitorFile(configFile, () => {
    const cache = JSON.parse(Utils.readFile(configFile) || "{}");
    for (const opt of getOptions(object)) {
      if (JSON.stringify(cache[opt.id]) !== JSON.stringify(opt.value))
        opt.value = cache[opt.id];
    }
  });
  function sleep(ms = 0) {
    return new Promise((r) => setTimeout(r, ms));
  }
  const reset = async ([opt, ...list] = getOptions(object), id = opt?.reset()) => {
    if (!opt)
      return sleep().then(() => []);
    return id ? [id, ...await sleep(50).then(() => reset(list))] : await sleep().then(() => reset(list));
  };
  const resetTheme = async ([opt, ...list] = getOptions(object), id = opt?.doResetColor()) => {
    if (!opt)
      return sleep().then(() => []);
    return id ? [id, ...await sleep(50).then(() => resetTheme(list))] : await sleep().then(() => resetTheme(list));
  };
  return Object.assign(object, {
    configFile,
    array: () => getOptions(object),
    async reset() {
      return (await reset()).join("\n");
    },
    async resetTheme() {
      return (await resetTheme()).join("\n");
    },
    handler(deps, callback) {
      for (const opt of getOptions(object)) {
        if (deps.some((i) => opt.id.startsWith(i)))
          opt.connect("changed", callback);
      }
    }
  });
}

class Opt extends Variable2 {
  static {
    Service.register(this);
  }
  constructor(initial, { persistent = false } = {}) {
    super(initial);
    this.initial = initial;
    this.persistent = persistent;
  }
  initial;
  id = "";
  persistent;
  toString() {
    return `${this.value}`;
  }
  toJSON() {
    return `opt:${this.value}`;
  }
  getValue = () => {
    return super.getValue();
  };
  init(cacheFile) {
    const cacheV = JSON.parse(Utils.readFile(cacheFile) || "{}")[this.id];
    if (cacheV !== undefined)
      this.value = cacheV;
    this.connect("changed", () => {
      const cache = JSON.parse(Utils.readFile(cacheFile) || "{}");
      cache[this.id] = this.value;
      Utils.writeFileSync(JSON.stringify(cache, null, 2), cacheFile);
    });
  }
  reset() {
    if (this.persistent)
      return;
    if (JSON.stringify(this.value) !== JSON.stringify(this.initial)) {
      this.value = this.initial;
      return this.id;
    }
  }
  doResetColor() {
    if (this.persistent)
      return;
    const isColor = isHexColor(this.value);
    if (JSON.stringify(this.value) !== JSON.stringify(this.initial) && isColor) {
      this.value = this.initial;
      return this.id;
    }
    return;
  }
}
var opt = (initial, opts) => new Opt(initial, opts);
var getOptions = (object, path = "") => {
  return Object.keys(object).flatMap((key) => {
    const obj = object[key];
    const id = path ? path + "." + key : key;
    if (obj instanceof Variable2) {
      const optValue = obj;
      optValue.id = id;
      return optValue;
    }
    if (typeof obj === "object" && obj !== null) {
      return getOptions(obj, id);
    }
    return [];
  });
};

// /home/antonio/.config/HyprPanel/options.ts
var colors = {
  rosewater: "#f5e0dc",
  flamingo: "#f2cdcd",
  pink: "#f5c2e7",
  mauve: "#cba6f7",
  red: "#f38ba8",
  maroon: "#eba0ac",
  peach: "#fab387",
  yellow: "#f9e2af",
  green: "#a6e3a1",
  teal: "#94e2d5",
  sky: "#89dceb",
  sapphire: "#74c7ec",
  blue: "#89b4fa",
  lavender: "#b4befe",
  text: "#cdd6f4",
  subtext1: "#bac2de",
  subtext2: "#a6adc8",
  overlay2: "#9399b2",
  overlay1: "#7f849c",
  overlay0: "#6c7086",
  surface2: "#585b70",
  surface1: "#45475a",
  surface0: "#313244",
  base2: "#242438",
  base: "#1e1e2e",
  mantle: "#181825",
  crust: "#11111b"
};
var secondary_colors = {
  text: "#cdd6f3",
  pink: "#f5c2e6",
  red: "#f38ba7",
  peach: "#fab386",
  mantle: "#181824",
  surface1: "#454759",
  surface0: "#313243",
  overlay1: "#7f849b",
  lavender: "#b4befd",
  mauve: "#cba6f6",
  green: "#a6e3a0",
  sky: "#89dcea",
  teal: "#94e2d4",
  yellow: "#f9e2ad",
  maroon: "#eba0ab",
  crust: "#11111a",
  surface2: "#585b69"
};
var tertiary_colors = {
  pink: "#f5c2e8",
  red: "#f38ba9",
  mantle: "#181826",
  surface0: "#313245",
  overlay1: "#7f849d",
  lavender: "#b4beff",
  mauve: "#cba6f8",
  green: "#a6e3a2",
  sky: "#89dcec",
  teal: "#94e2d6",
  yellow: "#f9e2ae",
  maroon: "#eba0ad",
  crust: "#11111c",
  surface2: "#585b71"
};
var options2 = mkOptions(OPTIONS, {
  theme: {
    matugen: opt(false),
    matugen_settings: {
      mode: opt("dark"),
      scheme_type: opt("tonal-spot"),
      variation: opt("standard_1"),
      contrast: opt(0)
    },
    font: {
      size: opt("1.2rem"),
      name: opt("Ubuntu Nerd Font"),
      weight: opt(600)
    },
    notification: {
      scaling: opt(100),
      background: opt(tertiary_colors.mantle),
      opacity: opt(100),
      actions: {
        background: opt(secondary_colors.lavender),
        text: opt(colors.mantle)
      },
      label: opt(colors.lavender),
      border: opt(secondary_colors.surface0),
      border_radius: opt("0.6em"),
      time: opt(secondary_colors.overlay1),
      text: opt(colors.text),
      labelicon: opt(colors.lavender),
      close_button: {
        background: opt(secondary_colors.red),
        label: opt(colors.crust)
      }
    },
    osd: {
      scaling: opt(100),
      duration: opt(2500),
      enable: opt(true),
      orientation: opt("vertical"),
      opacity: opt(100),
      bar_container: opt(colors.crust),
      icon_container: opt(tertiary_colors.lavender),
      bar_color: opt(tertiary_colors.lavender),
      bar_empty_color: opt(colors.surface0),
      bar_overflow_color: opt(secondary_colors.red),
      icon: opt(colors.crust),
      label: opt(tertiary_colors.lavender),
      monitor: opt(0),
      active_monitor: opt(true),
      radius: opt("0.4em"),
      margins: opt("0px 5px 0px 0px"),
      location: opt("right"),
      muted_zero: opt(false)
    },
    bar: {
      scaling: opt(100),
      floating: opt(false),
      location: opt("top"),
      layer: opt("top"),
      margin_top: opt("0.5em"),
      opacity: opt(100),
      margin_bottom: opt("0em"),
      margin_sides: opt("0.5em"),
      border_radius: opt("0.4em"),
      outer_spacing: opt("1.6em"),
      label_spacing: opt("0.5em"),
      transparent: opt(false),
      dropdownGap: opt("2.9em"),
      background: opt(colors.crust),
      buttons: {
        style: opt("default"),
        enableBorders: opt(false),
        borderSize: opt("0.1em"),
        monochrome: opt(false),
        spacing: opt("0.25em"),
        padding_x: opt("0.7rem"),
        padding_y: opt("0.2rem"),
        y_margins: opt("0.4em"),
        radius: opt("0.3em"),
        opacity: opt(100),
        background_opacity: opt(100),
        background_hover_opacity: opt(100),
        background: opt(colors.base2),
        icon_background: opt(colors.base2),
        hover: opt(colors.surface1),
        text: opt(colors.lavender),
        icon: opt(colors.lavender),
        dashboard: {
          background: opt(colors.base2),
          enableBorder: opt(false),
          border: opt(colors.yellow),
          icon: opt(colors.yellow),
          spacing: opt("0.5em")
        },
        workspaces: {
          background: opt(colors.base2),
          enableBorder: opt(false),
          smartHighlight: opt(true),
          border: opt(colors.pink),
          available: opt(colors.sky),
          occupied: opt(colors.flamingo),
          active: opt(colors.pink),
          hover: opt(colors.pink),
          numbered_active_highlight_border: opt("0.2em"),
          numbered_active_highlight_padding: opt("0.2em"),
          numbered_active_highlighted_text_color: opt(colors.mantle),
          numbered_active_underline_color: opt(colors.pink),
          spacing: opt("0.5em"),
          fontSize: opt("1.2em")
        },
        windowtitle: {
          background: opt(colors.base2),
          enableBorder: opt(false),
          border: opt(colors.pink),
          text: opt(colors.pink),
          icon: opt(colors.pink),
          icon_background: opt(colors.base2),
          spacing: opt("0.5em")
        },
        media: {
          enableBorder: opt(false),
          border: opt(colors.lavender),
          background: opt(colors.base2),
          text: opt(colors.lavender),
          icon: opt(colors.lavender),
          icon_background: opt(colors.base2),
          spacing: opt("0.5em")
        },
        volume: {
          enableBorder: opt(false),
          border: opt(colors.maroon),
          background: opt(colors.base2),
          text: opt(colors.maroon),
          icon: opt(colors.maroon),
          icon_background: opt(colors.base2),
          spacing: opt("0.5em")
        },
        network: {
          enableBorder: opt(false),
          border: opt(colors.mauve),
          background: opt(colors.base2),
          text: opt(colors.mauve),
          icon: opt(colors.mauve),
          icon_background: opt(colors.base2),
          spacing: opt("0.5em")
        },
        bluetooth: {
          enableBorder: opt(false),
          border: opt(colors.sky),
          background: opt(colors.base2),
          text: opt(colors.sky),
          icon: opt(colors.sky),
          icon_background: opt(colors.base2),
          spacing: opt("0.5em")
        },
        systray: {
          enableBorder: opt(false),
          border: opt(colors.lavender),
          background: opt(colors.base2),
          spacing: opt("0.5em")
        },
        battery: {
          enableBorder: opt(false),
          border: opt(colors.yellow),
          background: opt(colors.base2),
          text: opt(colors.yellow),
          icon: opt(colors.yellow),
          icon_background: opt(colors.base2),
          spacing: opt("0.5em")
        },
        clock: {
          enableBorder: opt(false),
          border: opt(colors.pink),
          background: opt(colors.base2),
          text: opt(colors.pink),
          icon: opt(colors.pink),
          icon_background: opt(colors.base2),
          spacing: opt("0.5em")
        },
        notifications: {
          enableBorder: opt(false),
          border: opt(colors.lavender),
          background: opt(colors.base2),
          icon: opt(colors.lavender),
          icon_background: opt(colors.base2),
          total: opt(colors.lavender),
          spacing: opt("0.5em")
        },
        modules: {
          ram: {
            enableBorder: opt(false),
            border: opt(colors.yellow),
            background: opt(colors.base2),
            text: opt(colors.yellow),
            icon: opt(colors.yellow),
            icon_background: opt(colors.base2),
            spacing: opt("0.45em")
          },
          cpu: {
            enableBorder: opt(false),
            border: opt(colors.red),
            background: opt(colors.base2),
            text: opt(colors.red),
            icon: opt(colors.red),
            icon_background: opt(colors.base2),
            spacing: opt("0.5em")
          },
          storage: {
            enableBorder: opt(false),
            border: opt(colors.pink),
            background: opt(colors.base2),
            text: opt(colors.pink),
            icon: opt(colors.pink),
            icon_background: opt(colors.base2),
            spacing: opt("0.45em")
          },
          netstat: {
            enableBorder: opt(false),
            border: opt(colors.green),
            background: opt(colors.base2),
            text: opt(colors.green),
            icon: opt(colors.green),
            icon_background: opt(colors.base2),
            spacing: opt("0.45em")
          },
          kbLayout: {
            enableBorder: opt(false),
            border: opt(colors.sky),
            background: opt(colors.base2),
            text: opt(colors.sky),
            icon: opt(colors.sky),
            icon_background: opt(colors.base2),
            spacing: opt("0.45em")
          },
          updates: {
            enableBorder: opt(false),
            border: opt(colors.mauve),
            background: opt(colors.base2),
            text: opt(colors.mauve),
            icon: opt(colors.mauve),
            icon_background: opt(colors.base2),
            spacing: opt("0.45em")
          },
          weather: {
            enableBorder: opt(false),
            border: opt(colors.lavender),
            background: opt(colors.base2),
            text: opt(colors.lavender),
            icon: opt(colors.lavender),
            icon_background: opt(colors.base2),
            spacing: opt("0.45em")
          },
          power: {
            enableBorder: opt(false),
            border: opt(colors.red),
            background: opt(colors.base2),
            icon: opt(colors.red),
            icon_background: opt(colors.base2),
            spacing: opt("0.45em")
          },
          submap: {
            enableBorder: opt(false),
            border: opt(colors.teal),
            background: opt(colors.base2),
            text: opt(colors.teal),
            icon: opt(colors.teal),
            icon_background: opt(colors.base2),
            spacing: opt("0.45em")
          }
        }
      },
      menus: {
        monochrome: opt(false),
        background: opt(colors.crust),
        opacity: opt(100),
        cards: opt(colors.base),
        card_radius: opt("0.4em"),
        border: {
          size: opt("0.13em"),
          radius: opt("0.7em"),
          color: opt(colors.surface0)
        },
        text: opt(colors.text),
        dimtext: opt(colors.surface2),
        feinttext: opt(colors.surface0),
        label: opt(colors.lavender),
        popover: {
          text: opt(colors.lavender),
          background: opt(secondary_colors.mantle),
          border: opt(secondary_colors.mantle)
        },
        listitems: {
          passive: opt(colors.text),
          active: opt(secondary_colors.lavender)
        },
        icons: {
          passive: opt(colors.surface2),
          active: opt(colors.lavender)
        },
        switch: {
          enabled: opt(colors.lavender),
          disabled: opt(tertiary_colors.surface0),
          puck: opt(secondary_colors.surface1)
        },
        check_radio_button: {
          background: opt(colors.surface1),
          active: opt(tertiary_colors.lavender)
        },
        buttons: {
          default: opt(colors.lavender),
          active: opt(secondary_colors.pink),
          disabled: opt(tertiary_colors.surface2),
          text: opt(secondary_colors.mantle)
        },
        iconbuttons: {
          passive: opt(secondary_colors.text),
          active: opt(tertiary_colors.lavender)
        },
        progressbar: {
          foreground: opt(colors.lavender),
          background: opt(colors.surface1)
        },
        slider: {
          primary: opt(colors.lavender),
          background: opt(tertiary_colors.surface2),
          backgroundhover: opt(colors.surface1),
          puck: opt(colors.overlay0)
        },
        dropdownmenu: {
          background: opt(colors.crust),
          text: opt(colors.text),
          divider: opt(colors.base)
        },
        tooltip: {
          background: opt(colors.crust),
          text: opt(tertiary_colors.lavender)
        },
        menu: {
          media: {
            scaling: opt(100),
            song: opt(tertiary_colors.lavender),
            artist: opt(tertiary_colors.teal),
            album: opt(tertiary_colors.pink),
            background: {
              color: opt(colors.crust)
            },
            card: {
              color: opt(colors.base),
              tint: opt(85)
            },
            border: {
              color: opt(colors.surface0)
            },
            buttons: {
              inactive: opt(colors.surface2),
              enabled: opt(secondary_colors.teal),
              background: opt(tertiary_colors.lavender),
              text: opt(colors.crust)
            },
            slider: {
              primary: opt(colors.pink),
              background: opt(tertiary_colors.surface2),
              backgroundhover: opt(colors.surface1),
              puck: opt(colors.overlay0)
            }
          },
          volume: {
            scaling: opt(100),
            card: {
              color: opt(colors.base)
            },
            background: {
              color: opt(colors.crust)
            },
            border: {
              color: opt(colors.surface0)
            },
            label: {
              color: opt(colors.maroon)
            },
            text: opt(colors.text),
            listitems: {
              passive: opt(colors.text),
              active: opt(secondary_colors.maroon)
            },
            iconbutton: {
              passive: opt(colors.text),
              active: opt(colors.maroon)
            },
            icons: {
              passive: opt(colors.overlay2),
              active: opt(colors.maroon)
            },
            audio_slider: {
              primary: opt(colors.maroon),
              background: opt(tertiary_colors.surface2),
              backgroundhover: opt(colors.surface1),
              puck: opt(colors.surface2)
            },
            input_slider: {
              primary: opt(colors.maroon),
              background: opt(tertiary_colors.surface2),
              backgroundhover: opt(colors.surface1),
              puck: opt(colors.surface2)
            }
          },
          network: {
            scaling: opt(100),
            card: {
              color: opt(colors.base)
            },
            background: {
              color: opt(colors.crust)
            },
            border: {
              color: opt(colors.surface0)
            },
            label: {
              color: opt(colors.mauve)
            },
            text: opt(colors.text),
            status: {
              color: opt(colors.overlay0)
            },
            listitems: {
              passive: opt(colors.text),
              active: opt(secondary_colors.mauve)
            },
            icons: {
              passive: opt(colors.overlay2),
              active: opt(colors.mauve)
            },
            iconbuttons: {
              passive: opt(colors.text),
              active: opt(colors.mauve)
            }
          },
          bluetooth: {
            scaling: opt(100),
            card: {
              color: opt(colors.base)
            },
            background: {
              color: opt(colors.crust)
            },
            border: {
              color: opt(colors.surface0)
            },
            label: {
              color: opt(colors.sky)
            },
            text: opt(colors.text),
            status: opt(colors.overlay0),
            switch_divider: opt(colors.surface1),
            switch: {
              enabled: opt(colors.sky),
              disabled: opt(tertiary_colors.surface0),
              puck: opt(secondary_colors.surface1)
            },
            listitems: {
              passive: opt(colors.text),
              active: opt(secondary_colors.sky)
            },
            icons: {
              passive: opt(colors.overlay2),
              active: opt(colors.sky)
            },
            iconbutton: {
              passive: opt(colors.text),
              active: opt(colors.sky)
            }
          },
          systray: {
            dropdownmenu: {
              background: opt(colors.crust),
              text: opt(colors.text),
              divider: opt(colors.base)
            }
          },
          battery: {
            scaling: opt(100),
            card: {
              color: opt(colors.base)
            },
            background: {
              color: opt(colors.crust)
            },
            border: {
              color: opt(colors.surface0)
            },
            label: {
              color: opt(colors.yellow)
            },
            text: opt(colors.text),
            listitems: {
              passive: opt(secondary_colors.text),
              active: opt(colors.yellow)
            },
            icons: {
              passive: opt(colors.overlay2),
              active: opt(colors.yellow)
            },
            slider: {
              primary: opt(colors.yellow),
              background: opt(tertiary_colors.surface2),
              backgroundhover: opt(colors.surface1),
              puck: opt(colors.overlay0)
            }
          },
          clock: {
            scaling: opt(100),
            card: {
              color: opt(colors.base)
            },
            background: {
              color: opt(colors.crust)
            },
            border: {
              color: opt(colors.surface0)
            },
            text: opt(colors.text),
            time: {
              time: opt(colors.pink),
              timeperiod: opt(colors.teal)
            },
            calendar: {
              yearmonth: opt(colors.teal),
              weekdays: opt(colors.pink),
              paginator: opt(secondary_colors.pink),
              currentday: opt(colors.pink),
              days: opt(colors.text),
              contextdays: opt(colors.surface2)
            },
            weather: {
              icon: opt(colors.pink),
              temperature: opt(colors.text),
              status: opt(colors.teal),
              stats: opt(colors.pink),
              thermometer: {
                extremelyhot: opt(colors.red),
                hot: opt(colors.peach),
                moderate: opt(colors.lavender),
                cold: opt(colors.blue),
                extremelycold: opt(colors.sky)
              },
              hourly: {
                time: opt(colors.pink),
                icon: opt(colors.pink),
                temperature: opt(colors.pink)
              }
            }
          },
          dashboard: {
            scaling: opt(100),
            confirmation_scaling: opt(100),
            card: {
              color: opt(colors.base)
            },
            background: {
              color: opt(colors.crust)
            },
            border: {
              color: opt(colors.surface0)
            },
            profile: {
              name: opt(colors.pink),
              size: opt("8.5em"),
              radius: opt("0.4em")
            },
            powermenu: {
              shutdown: opt(colors.red),
              restart: opt(colors.peach),
              logout: opt(colors.green),
              sleep: opt(colors.sky),
              confirmation: {
                card: opt(colors.base),
                background: opt(colors.crust),
                border: opt(colors.surface0),
                label: opt(colors.lavender),
                body: opt(colors.text),
                confirm: opt(colors.green),
                deny: opt(colors.red),
                button_text: opt(secondary_colors.crust)
              }
            },
            shortcuts: {
              background: opt(colors.lavender),
              text: opt(secondary_colors.mantle),
              recording: opt(colors.green)
            },
            controls: {
              disabled: opt(colors.surface2),
              wifi: {
                background: opt(colors.mauve),
                text: opt(secondary_colors.mantle)
              },
              bluetooth: {
                background: opt(colors.sky),
                text: opt(secondary_colors.mantle)
              },
              notifications: {
                background: opt(colors.yellow),
                text: opt(secondary_colors.mantle)
              },
              volume: {
                background: opt(colors.maroon),
                text: opt(secondary_colors.mantle)
              },
              input: {
                background: opt(colors.pink),
                text: opt(secondary_colors.mantle)
              }
            },
            directories: {
              left: {
                top: {
                  color: opt(colors.pink)
                },
                middle: {
                  color: opt(colors.yellow)
                },
                bottom: {
                  color: opt(colors.maroon)
                }
              },
              right: {
                top: {
                  color: opt(colors.teal)
                },
                middle: {
                  color: opt(colors.mauve)
                },
                bottom: {
                  color: opt(colors.lavender)
                }
              }
            },
            monitors: {
              bar_background: opt(colors.surface1),
              cpu: {
                icon: opt(colors.maroon),
                bar: opt(tertiary_colors.maroon),
                label: opt(colors.maroon)
              },
              ram: {
                icon: opt(colors.yellow),
                bar: opt(tertiary_colors.yellow),
                label: opt(colors.yellow)
              },
              gpu: {
                icon: opt(colors.green),
                bar: opt(tertiary_colors.green),
                label: opt(colors.green)
              },
              disk: {
                icon: opt(colors.pink),
                bar: opt(tertiary_colors.pink),
                label: opt(colors.pink)
              }
            }
          },
          power: {
            scaling: opt(90),
            radius: opt("0.4em"),
            background: {
              color: opt(colors.crust)
            },
            border: {
              color: opt(colors.surface0)
            },
            buttons: {
              shutdown: {
                background: opt(colors.base),
                icon_background: opt(secondary_colors.red),
                text: opt(colors.red),
                icon: opt(secondary_colors.mantle)
              },
              restart: {
                background: opt(colors.base),
                icon_background: opt(secondary_colors.peach),
                text: opt(colors.peach),
                icon: opt(secondary_colors.mantle)
              },
              logout: {
                background: opt(colors.base),
                icon_background: opt(secondary_colors.green),
                text: opt(colors.green),
                icon: opt(secondary_colors.mantle)
              },
              sleep: {
                background: opt(colors.base),
                icon_background: opt(secondary_colors.sky),
                text: opt(colors.sky),
                icon: opt(secondary_colors.mantle)
              }
            }
          },
          notifications: {
            scaling: opt(100),
            height: opt("58em"),
            label: opt(colors.lavender),
            no_notifications_label: opt(colors.surface0),
            background: opt(colors.crust),
            card: opt(colors.base),
            border: opt(colors.surface0),
            switch_divider: opt(colors.surface1),
            clear: opt(colors.red),
            switch: {
              enabled: opt(colors.lavender),
              disabled: opt(tertiary_colors.surface0),
              puck: opt(secondary_colors.surface1)
            },
            pager: {
              show: opt(true),
              background: opt(colors.crust),
              button: opt(colors.lavender),
              label: opt(colors.overlay2)
            },
            scrollbar: {
              color: opt(colors.lavender),
              width: opt("0.35em"),
              radius: opt("0.2em")
            }
          }
        }
      }
    }
  },
  bar: {
    scrollSpeed: opt(5),
    layouts: opt({
      "1": {
        left: ["dashboard", "workspaces", "windowtitle"],
        middle: ["media"],
        right: ["volume", "clock", "notifications"]
      },
      "2": {
        left: ["dashboard", "workspaces", "windowtitle"],
        middle: ["media"],
        right: ["volume", "clock", "notifications"]
      },
      "0": {
        left: ["dashboard", "workspaces", "windowtitle"],
        middle: ["media"],
        right: ["volume", "network", "bluetooth", "battery", "systray", "clock", "notifications"]
      }
    }),
    launcher: {
      icon: opt("\uDB82\uDCC7"),
      rightClick: opt(""),
      middleClick: opt(""),
      scrollUp: opt(""),
      scrollDown: opt("")
    },
    windowtitle: {
      custom_title: opt(true),
      title_map: opt([]),
      class_name: opt(true),
      label: opt(true),
      icon: opt(true),
      truncation: opt(true),
      truncation_size: opt(50),
      leftClick: opt(""),
      rightClick: opt(""),
      middleClick: opt(""),
      scrollUp: opt(""),
      scrollDown: opt("")
    },
    workspaces: {
      show_icons: opt(false),
      showAllActive: opt(true),
      ignored: opt(""),
      show_numbered: opt(false),
      showWsIcons: opt(false),
      numbered_active_indicator: opt("underline"),
      icons: {
        available: opt("\uF10C"),
        active: opt("\uF111"),
        occupied: opt("\uF192")
      },
      workspaceIconMap: opt({}),
      workspaces: opt(10),
      spacing: opt(1),
      monitorSpecific: opt(true),
      hideUnoccupied: opt(true),
      workspaceMask: opt(false),
      reverse_scroll: opt(false),
      scroll_speed: opt(5)
    },
    volume: {
      label: opt(true),
      rightClick: opt(""),
      middleClick: opt(""),
      scrollUp: opt("pactl set-sink-volume @DEFAULT_SINK@ +5%"),
      scrollDown: opt("pactl set-sink-volume @DEFAULT_SINK@ -5%")
    },
    network: {
      truncation: opt(true),
      truncation_size: opt(7),
      label: opt(true),
      rightClick: opt(""),
      middleClick: opt(""),
      scrollUp: opt(""),
      scrollDown: opt("")
    },
    bluetooth: {
      label: opt(true),
      rightClick: opt(""),
      middleClick: opt(""),
      scrollUp: opt(""),
      scrollDown: opt("")
    },
    battery: {
      label: opt(true),
      rightClick: opt(""),
      middleClick: opt(""),
      scrollUp: opt(""),
      scrollDown: opt("")
    },
    systray: {
      ignore: opt([])
    },
    clock: {
      icon: opt("\uDB83\uDE17"),
      showIcon: opt(true),
      showTime: opt(true),
      format: opt("%a %b %d  %I:%M:%S %p"),
      rightClick: opt(""),
      middleClick: opt(""),
      scrollUp: opt(""),
      scrollDown: opt("")
    },
    media: {
      show_artist: opt(false),
      truncation: opt(true),
      show_label: opt(true),
      truncation_size: opt(30),
      show_active_only: opt(false),
      rightClick: opt(""),
      middleClick: opt("")
    },
    notifications: {
      show_total: opt(false),
      rightClick: opt(""),
      middleClick: opt(""),
      scrollUp: opt(""),
      scrollDown: opt("")
    },
    customModules: {
      scrollSpeed: opt(5),
      ram: {
        label: opt(true),
        labelType: opt("percentage"),
        round: opt(true),
        pollingInterval: opt(2000),
        leftClick: opt(""),
        rightClick: opt(""),
        middleClick: opt("")
      },
      cpu: {
        label: opt(true),
        round: opt(true),
        pollingInterval: opt(2000),
        leftClick: opt(""),
        rightClick: opt(""),
        middleClick: opt(""),
        scrollUp: opt(""),
        scrollDown: opt("")
      },
      storage: {
        label: opt(true),
        icon: opt("\uDB80\uDECA"),
        round: opt(false),
        labelType: opt("percentage"),
        pollingInterval: opt(2000),
        leftClick: opt(""),
        rightClick: opt(""),
        middleClick: opt("")
      },
      netstat: {
        label: opt(true),
        networkInterface: opt(""),
        icon: opt("\uDB81\uDD9F"),
        round: opt(true),
        labelType: opt("full"),
        rateUnit: opt("auto"),
        pollingInterval: opt(2000),
        leftClick: opt(""),
        rightClick: opt(""),
        middleClick: opt("")
      },
      kbLayout: {
        label: opt(true),
        labelType: opt("code"),
        icon: opt("\uDB80\uDF0C"),
        leftClick: opt(""),
        rightClick: opt(""),
        middleClick: opt(""),
        scrollUp: opt(""),
        scrollDown: opt("")
      },
      updates: {
        updateCommand: opt("$HOME/.config/ags/scripts/checkUpdates.sh -arch"),
        label: opt(true),
        padZero: opt(true),
        icon: opt("\uDB80\uDFD6"),
        pollingInterval: opt(1000 * 60 * 60 * 6),
        leftClick: opt(""),
        rightClick: opt(""),
        middleClick: opt(""),
        scrollUp: opt(""),
        scrollDown: opt("")
      },
      submap: {
        label: opt(true),
        enabledIcon: opt("\uDB80\uDF10"),
        disabledIcon: opt("\uDB80\uDF0C"),
        enabledText: opt("Submap On"),
        disabledText: opt("Submap off"),
        leftClick: opt(""),
        rightClick: opt(""),
        middleClick: opt(""),
        scrollUp: opt(""),
        scrollDown: opt("")
      },
      weather: {
        label: opt(true),
        unit: opt("imperial"),
        leftClick: opt(""),
        rightClick: opt(""),
        middleClick: opt(""),
        scrollUp: opt(""),
        scrollDown: opt("")
      },
      power: {
        icon: opt("\uF011"),
        showLabel: opt(true),
        leftClick: opt("menu:powerdropdown"),
        rightClick: opt(""),
        middleClick: opt(""),
        scrollUp: opt(""),
        scrollDown: opt("")
      }
    }
  },
  menus: {
    power: {
      showLabel: opt(true),
      confirmation: opt(true),
      sleep: opt("systemctl suspend"),
      reboot: opt("systemctl reboot"),
      logout: opt("pkill Hyprland"),
      shutdown: opt("shutdown now")
    },
    dashboard: {
      powermenu: {
        confirmation: opt(true),
        sleep: opt("systemctl suspend"),
        reboot: opt("systemctl reboot"),
        logout: opt("pkill Hyprland"),
        shutdown: opt("shutdown now"),
        avatar: {
          image: opt("avatar-default-symbolic"),
          name: opt("system")
        }
      },
      stats: {
        enable_gpu: opt(false)
      },
      shortcuts: {
        left: {
          shortcut1: {
            icon: opt("\uDB80\uDDE9"),
            tooltip: opt("Microsoft Edge"),
            command: opt("microsoft-edge-stable")
          },
          shortcut2: {
            icon: opt("\uF1BC"),
            tooltip: opt("Spotify"),
            command: opt("spotify-launcher")
          },
          shortcut3: {
            icon: opt("\uF1FF"),
            tooltip: opt("Discord"),
            command: opt("discord")
          },
          shortcut4: {
            icon: opt("\uE68F"),
            tooltip: opt("Search Apps"),
            command: opt("rofi -show drun")
          }
        },
        right: {
          shortcut1: {
            icon: opt("\uF1FB"),
            tooltip: opt("Color Picker"),
            command: opt("hyprpicker -a")
          },
          shortcut3: {
            icon: opt("\uDB80\uDD00"),
            tooltip: opt("Screenshot"),
            command: opt('bash -c "$HOME/.config/ags/services/snapshot.sh"')
          }
        }
      },
      directories: {
        left: {
          directory1: {
            label: opt("\uDB80\uDE4D Downloads"),
            command: opt('bash -c "dolphin $HOME/Downloads/"')
          },
          directory2: {
            label: opt("\uDB80\uDE4F Videos"),
            command: opt('bash -c "dolphin $HOME/Videos/"')
          },
          directory3: {
            label: opt("\uDB81\uDE9D Projects"),
            command: opt('bash -c "dolphin $HOME/Projects/"')
          }
        },
        right: {
          directory1: {
            label: opt("\uDB86\uDDF6 Documents"),
            command: opt('bash -c "dolphin $HOME/Documents/"')
          },
          directory2: {
            label: opt("\uDB80\uDE4F Pictures"),
            command: opt('bash -c "dolphin $HOME/Pictures/"')
          },
          directory3: {
            label: opt("\uDB84\uDCB5 Home"),
            command: opt('bash -c "dolphin $HOME/"')
          }
        }
      }
    },
    clock: {
      time: {
        military: opt(false)
      },
      weather: {
        enabled: opt(true),
        interval: opt(60000),
        unit: opt("imperial"),
        location: opt("Los Angeles"),
        key: opt(JSON.parse(Utils.readFile(`${App.configDir}/.weather.json`) || "{}")?.weather_api_key || "")
      }
    }
  },
  scalingPriority: opt("gdk"),
  terminal: opt("kitty"),
  tear: opt(false),
  wallpaper: {
    enable: opt(true),
    image: opt(""),
    pywal: opt(false)
  },
  notifications: {
    position: opt("top right"),
    ignore: opt([]),
    displayedTotal: opt(10),
    monitor: opt(0),
    active_monitor: opt(true),
    timeout: opt(7000),
    cache_actions: opt(true)
  },
  dummy: opt(true)
});
globalThis["options"] = options2;
var options_default = options2;

// /home/antonio/.config/HyprPanel/lib/icons.ts
var icons_default = {
  missing: "image-missing-symbolic",
  nix: {
    nix: "nix-snowflake-symbolic"
  },
  app: {
    terminal: "terminal-symbolic"
  },
  fallback: {
    executable: "application-x-executable",
    notification: "dialog-information-symbolic",
    video: "video-x-generic-symbolic",
    audio: "audio-x-generic-symbolic"
  },
  ui: {
    close: "window-close-symbolic",
    colorpicker: "color-select-symbolic",
    info: "info-symbolic",
    link: "external-link-symbolic",
    lock: "system-lock-screen-symbolic",
    menu: "open-menu-symbolic",
    refresh: "view-refresh-symbolic",
    search: "system-search-symbolic",
    settings: "emblem-system-symbolic",
    themes: "preferences-desktop-theme-symbolic",
    tick: "object-select-symbolic",
    time: "hourglass-symbolic",
    toolbars: "toolbars-symbolic",
    warning: "dialog-warning-symbolic",
    avatar: "avatar-default-symbolic",
    arrow: {
      right: "pan-end-symbolic",
      left: "pan-start-symbolic",
      down: "pan-down-symbolic",
      up: "pan-up-symbolic"
    }
  },
  audio: {
    mic: {
      muted: "microphone-disabled-symbolic",
      low: "microphone-sensitivity-low-symbolic",
      medium: "microphone-sensitivity-medium-symbolic",
      high: "microphone-sensitivity-high-symbolic"
    },
    volume: {
      muted: "audio-volume-muted-symbolic",
      low: "audio-volume-low-symbolic",
      medium: "audio-volume-medium-symbolic",
      high: "audio-volume-high-symbolic",
      overamplified: "audio-volume-overamplified-symbolic"
    },
    type: {
      headset: "audio-headphones-symbolic",
      speaker: "audio-speakers-symbolic",
      card: "audio-card-symbolic"
    },
    mixer: "mixer-symbolic"
  },
  powerprofile: {
    balanced: "power-profile-balanced-symbolic",
    "power-saver": "power-profile-power-saver-symbolic",
    performance: "power-profile-performance-symbolic"
  },
  asusctl: {
    profile: {
      Balanced: "power-profile-balanced-symbolic",
      Quiet: "power-profile-power-saver-symbolic",
      Performance: "power-profile-performance-symbolic"
    },
    mode: {
      Integrated: "processor-symbolic",
      Hybrid: "controller-symbolic"
    }
  },
  battery: {
    charging: "battery-flash-symbolic",
    warning: "battery-empty-symbolic"
  },
  bluetooth: {
    enabled: "bluetooth-active-symbolic",
    disabled: "bluetooth-disabled-symbolic"
  },
  brightness: {
    indicator: "display-brightness-symbolic",
    keyboard: "keyboard-brightness-symbolic",
    screen: "display-brightness-symbolic"
  },
  powermenu: {
    sleep: "weather-clear-night-symbolic",
    reboot: "system-reboot-symbolic",
    logout: "system-log-out-symbolic",
    shutdown: "system-shutdown-symbolic"
  },
  recorder: {
    recording: "media-record-symbolic"
  },
  notifications: {
    noisy: "org.gnome.Settings-notifications-symbolic",
    silent: "notifications-disabled-symbolic",
    message: "chat-bubbles-symbolic"
  },
  trash: {
    full: "user-trash-full-symbolic",
    empty: "user-trash-symbolic"
  },
  mpris: {
    shuffle: {
      enabled: "media-playlist-shuffle-symbolic",
      disabled: "media-playlist-consecutive-symbolic"
    },
    loop: {
      none: "media-playlist-repeat-symbolic",
      track: "media-playlist-repeat-song-symbolic",
      playlist: "media-playlist-repeat-symbolic"
    },
    playing: "media-playback-pause-symbolic",
    paused: "media-playback-start-symbolic",
    stopped: "media-playback-start-symbolic",
    prev: "media-skip-backward-symbolic",
    next: "media-skip-forward-symbolic"
  },
  system: {
    cpu: "org.gnome.SystemMonitor-symbolic",
    ram: "drive-harddisk-solidstate-symbolic",
    temp: "temperature-symbolic"
  },
  color: {
    dark: "dark-mode-symbolic",
    light: "light-mode-symbolic"
  }
};

// /home/antonio/.config/HyprPanel/lib/utils.ts
import Gdk from "gi://Gdk";
import GLib2 from "gi://GLib?version=2.0";
import GdkPixbuf from "gi://GdkPixbuf";

// /home/antonio/.config/HyprPanel/lib/constants/colors.ts
var namedColors = new Set([
  "alice blue",
  "antique white",
  "aqua",
  "aquamarine",
  "azure",
  "beige",
  "bisque",
  "black",
  "blanched almond",
  "blue",
  "blue violet",
  "brown",
  "burlywood",
  "cadet blue",
  "chartreuse",
  "chocolate",
  "coral",
  "cornflower blue",
  "cornsilk",
  "crimson",
  "cyan",
  "dark blue",
  "dark cyan",
  "dark goldenrod",
  "dark gray",
  "dark green",
  "dark khaki",
  "dark magenta",
  "dark olive green",
  "dark orange",
  "dark orchid",
  "dark red",
  "dark salmon",
  "dark sea green",
  "dark slate blue",
  "dark slate gray",
  "dark turquoise",
  "dark violet",
  "deep pink",
  "deep sky blue",
  "dim gray",
  "dodger blue",
  "firebrick",
  "floral white",
  "forest green",
  "fuchsia",
  "gainsboro",
  "ghost white",
  "gold",
  "goldenrod",
  "gray",
  "green",
  "green yellow",
  "honeydew",
  "hot pink",
  "indian red",
  "indigo",
  "ivory",
  "khaki",
  "lavender",
  "lavender blush",
  "lawn green",
  "lemon chiffon",
  "light blue",
  "light coral",
  "light cyan",
  "light goldenrod yellow",
  "light green",
  "light grey",
  "light pink",
  "light salmon",
  "light sea green",
  "light sky blue",
  "light slate gray",
  "light steel blue",
  "light yellow",
  "lime",
  "lime green",
  "linen",
  "magenta",
  "maroon",
  "medium aquamarine",
  "medium blue",
  "medium orchid",
  "medium purple",
  "medium sea green",
  "medium slate blue",
  "medium spring green",
  "medium turquoise",
  "medium violet red",
  "midnight blue",
  "mint cream",
  "misty rose",
  "moccasin",
  "navajo white",
  "navy",
  "old lace",
  "olive",
  "olive drab",
  "orange",
  "orange red",
  "orchid",
  "pale goldenrod",
  "pale green",
  "pale turquoise",
  "pale violet red",
  "papaya whip",
  "peach puff",
  "peru",
  "pink",
  "plum",
  "powder blue",
  "purple",
  "red",
  "rosy brown",
  "royal blue",
  "saddle brown",
  "salmon",
  "sandy brown",
  "sea green",
  "seashell",
  "sienna",
  "silver",
  "sky blue",
  "slate blue",
  "slate gray",
  "snow",
  "spring green",
  "steel blue",
  "tan",
  "teal",
  "thistle",
  "tomato",
  "turquoise",
  "violet",
  "wheat",
  "white",
  "white smoke",
  "yellow",
  "yellow green"
]);

// /home/antonio/.config/HyprPanel/lib/utils.ts
async function bash(strings, ...values) {
  const cmd = typeof strings === "string" ? strings : strings.flatMap((str, i) => str + `${values[i] ?? ""}`).join("");
  return Utils.execAsync(["bash", "-c", cmd]).catch((err) => {
    console.error(cmd, err);
    return "";
  });
}
async function sh(cmd) {
  return Utils.execAsync(cmd).catch((err) => {
    console.error(typeof cmd === "string" ? cmd : cmd.join(" "), err);
    return "";
  });
}
function forMonitors(widget) {
  const n = Gdk.Display.get_default()?.get_n_monitors() || 1;
  return range(n, 0).flatMap(widget);
}
function range(length, start = 1) {
  return Array.from({ length }, (_, i) => i + start);
}
function dependencies(...bins) {
  const missing = bins.filter((bin) => Utils.exec({
    cmd: `which ${bin}`,
    out: () => false,
    err: () => true
  }));
  if (missing.length > 0) {
    console.warn(Error(`missing dependencies: ${missing.join(", ")}`));
    Notify({
      summary: "Dependencies not found!",
      body: `The following dependencies are missing: ${missing.join(", ")}`,
      iconName: icons_default.ui.warning,
      timeout: 7000
    });
  }
  return missing.length === 0;
}
function getPosition(pos) {
  const positionMap = {
    top: ["top"],
    "top right": ["top", "right"],
    "top left": ["top", "left"],
    bottom: ["bottom"],
    "bottom right": ["bottom", "right"],
    "bottom left": ["bottom", "left"],
    right: ["right"],
    left: ["left"]
  };
  return positionMap[pos] || ["top"];
}
var isAnImage = (imgFilePath) => {
  try {
    GdkPixbuf.Pixbuf.new_from_file(imgFilePath);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
var Notify = (notifPayload) => {
  let command = "notify-send";
  command += ` "${notifPayload.summary} "`;
  if (notifPayload.body)
    command += ` "${notifPayload.body}" `;
  if (notifPayload.appName)
    command += ` -a "${notifPayload.appName}"`;
  if (notifPayload.iconName)
    command += ` -i "${notifPayload.iconName}"`;
  if (notifPayload.urgency)
    command += ` -u "${notifPayload.urgency}"`;
  if (notifPayload.timeout !== undefined)
    command += ` -t ${notifPayload.timeout}`;
  if (notifPayload.category)
    command += ` -c "${notifPayload.category}"`;
  if (notifPayload.transient)
    command += ` -e`;
  if (notifPayload.id !== undefined)
    command += ` -r ${notifPayload.id}`;
  Utils.execAsync(command);
};
var isValidGjsColor = (color) => {
  const colorLower = color.toLowerCase().trim();
  if (namedColors.has(colorLower)) {
    return true;
  }
  const hexColorRegex = /^#(?:[a-fA-F0-9]{3,4}|[a-fA-F0-9]{6,8})$/;
  const rgbRegex = /^rgb\(\s*(\d{1,3}%?\s*,\s*){2}\d{1,3}%?\s*\)$/;
  const rgbaRegex = /^rgba\(\s*(\d{1,3}%?\s*,\s*){3}(0|1|0?\.\d+)\s*\)$/;
  if (hexColorRegex.test(color)) {
    return true;
  }
  if (rgbRegex.test(colorLower) || rgbaRegex.test(colorLower)) {
    return true;
  }
  return false;
};

// /home/antonio/.config/HyprPanel/services/Wallpaper.ts
var hyprland = await Service.import("hyprland");
var WP = `${Utils.HOME}/.config/background`;

class Wallpaper extends Service {
  static {
    Service.register(this, {}, {
      wallpaper: ["string"]
    });
  }
  #blockMonitor = false;
  #isRunning = false;
  #wallpaper() {
    if (!dependencies("swww"))
      return;
    hyprland.monitors.map((m) => m.name);
    sh("hyprctl cursorpos").then((pos) => {
      sh([
        "swww",
        "img",
        "--invert-y",
        "--transition-type",
        "grow",
        "--transition-duration",
        "1.5",
        "--transition-fps",
        "30",
        "--transition-pos",
        pos.replace(" ", ""),
        WP
      ]).then(() => {
        this.changed("wallpaper");
      });
    });
  }
  async#setWallpaper(path) {
    this.#blockMonitor = true;
    await sh(`cp ${path} ${WP}`);
    this.#wallpaper();
    this.#blockMonitor = false;
  }
  set = (path) => {
    this.#setWallpaper(path);
  };
  isRunning = () => {
    return this.#isRunning;
  };
  get wallpaper() {
    return WP;
  }
  constructor() {
    super();
    options_default.wallpaper.enable.connect("changed", () => {
      if (options_default.wallpaper.enable.value) {
        this.#isRunning = true;
        Utils.execAsync("swww-daemon").then(() => {
          this.#wallpaper();
        }).catch(() => null);
      } else {
        this.#isRunning = false;
        Utils.execAsync("pkill swww-daemon").catch(() => null);
      }
    });
    if (!dependencies("swww") || !options_default.wallpaper.enable.value)
      return this;
    this.#isRunning = true;
    Utils.monitorFile(WP, () => {
      if (!this.#blockMonitor)
        this.#wallpaper();
    });
    Utils.execAsync("swww-daemon").then(() => {
      this.#wallpaper();
    }).catch(() => null);
  }
}
var Wallpaper_default = new Wallpaper;

// /home/antonio/.config/HyprPanel/scss/optionsTrackers.ts
var { matugen } = options_default.theme;
var { mode, scheme_type, contrast } = options_default.theme.matugen_settings;
var ensureMatugenWallpaper = () => {
  const wallpaperPath = options_default.wallpaper.image.value;
  if (matugen.value && (!options_default.wallpaper.image.value.length || !isAnImage(wallpaperPath))) {
    Notify({
      summary: "Matugen Failed",
      body: "Please select a wallpaper in 'Theming > General' first.",
      iconName: icons_default.ui.warning,
      timeout: 7000
    });
    matugen.value = false;
  }
};
var initializeTrackers = (resetCssFunc) => {
  matugen.connect("changed", () => {
    ensureMatugenWallpaper();
    options_default.resetTheme();
  });
  mode.connect("changed", () => {
    options_default.resetTheme();
  });
  scheme_type.connect("changed", () => {
    options_default.resetTheme();
  });
  contrast.connect("changed", () => {
    options_default.resetTheme();
  });
  Wallpaper_default.connect("changed", () => {
    console.info("Wallpaper changed, regenerating Matugen colors...");
    if (options_default.theme.matugen.value) {
      options_default.resetTheme();
      resetCssFunc();
    }
  });
  options_default.wallpaper.image.connect("changed", () => {
    if (!Wallpaper_default.isRunning() && options_default.theme.matugen.value || !options_default.wallpaper.enable.value) {
      console.info("Wallpaper path changed, regenerating Matugen colors...");
      options_default.resetTheme();
      resetCssFunc();
    }
    if (options_default.wallpaper.pywal.value && dependencies("wal")) {
      const wallpaperPath = options_default.wallpaper.image.value;
      bash(`wal -i ${wallpaperPath}`);
    }
  });
};

// /home/antonio/.config/HyprPanel/lib/types/defaults/options.ts
var defaultColorMap = {
  rosewater: "#f5e0dc",
  flamingo: "#f2cdcd",
  pink: "#f5c2e7",
  mauve: "#cba6f7",
  red: "#f38ba8",
  maroon: "#eba0ac",
  peach: "#fab387",
  yellow: "#f9e2af",
  green: "#a6e3a1",
  teal: "#94e2d5",
  sky: "#89dceb",
  sapphire: "#74c7ec",
  blue: "#89b4fa",
  lavender: "#b4befe",
  text: "#cdd6f4",
  subtext1: "#bac2de",
  subtext2: "#a6adc8",
  overlay2: "#9399b2",
  overlay1: "#7f849c",
  overlay0: "#6c7086",
  surface2: "#585b70",
  surface1: "#45475a",
  surface0: "#313244",
  base2: "#242438",
  base: "#1e1e2e",
  mantle: "#181825",
  crust: "#11111b",
  surface1_2: "#454759",
  text2: "#cdd6f3",
  pink2: "#f5c2e6",
  red2: "#f38ba7",
  peach2: "#fab386",
  mantle2: "#181824",
  surface0_2: "#313243",
  surface2_2: "#585b69",
  overlay1_2: "#7f849b",
  lavender2: "#b4befd",
  mauve2: "#cba6f6",
  green2: "#a6e3a0",
  sky2: "#89dcea",
  teal2: "#94e2d4",
  yellow2: "#f9e2ad",
  maroon2: "#eba0ab",
  crust2: "#11111a",
  pink3: "#f5c2e8",
  red3: "#f38ba9",
  mantle3: "#181826",
  surface0_3: "#313245",
  surface2_3: "#585b71",
  overlay1_3: "#7f849d",
  lavender3: "#b4beff",
  mauve3: "#cba6f8",
  green3: "#a6e3a2",
  sky3: "#89dcec",
  teal3: "#94e2d6",
  yellow3: "#f9e2ae",
  maroon3: "#eba0ad",
  crust3: "#11111c"
};

// /home/antonio/.config/HyprPanel/services/matugen/variations.ts
var getMatugenVariations = (matugenColors, variation) => {
  const matVtns = {
    standard_1: {
      rosewater: matugenColors.secondary,
      flamingo: matugenColors.secondary,
      pink: matugenColors.tertiary,
      mauve: matugenColors.primary,
      red: matugenColors.tertiary,
      maroon: matugenColors.primary,
      peach: matugenColors.tertiary,
      yellow: matugenColors.secondary,
      green: matugenColors.primary,
      teal: matugenColors.secondary,
      sky: matugenColors.secondary,
      sapphire: matugenColors.primary,
      blue: matugenColors.primary,
      lavender: matugenColors.primary,
      text: matugenColors.on_background,
      subtext1: matugenColors.outline,
      subtext2: matugenColors.outline,
      overlay2: matugenColors.outline,
      overlay1: matugenColors.outline,
      overlay0: matugenColors.outline,
      surface2: matugenColors.outline,
      surface1: matugenColors.surface_bright,
      surface0: matugenColors.surface_bright,
      base2: matugenColors.inverse_on_surface,
      base: matugenColors.inverse_on_surface,
      mantle: matugenColors.surface_dim,
      crust: matugenColors.surface_dim,
      notifications_closer: matugenColors.primary,
      notifications_background: matugenColors.surface_dim,
      dashboard_btn_text: matugenColors.surface_dim,
      red2: matugenColors.tertiary,
      peach2: matugenColors.tertiary,
      pink2: matugenColors.tertiary,
      mantle2: matugenColors.surface_dim,
      surface1_2: matugenColors.inverse_on_surface,
      surface0_2: matugenColors.surface_bright,
      overlay1_2: matugenColors.outline,
      text2: matugenColors.on_background,
      lavender2: matugenColors.primary,
      crust2: matugenColors.surface_dim,
      maroon2: matugenColors.primary,
      mauve2: matugenColors.primary,
      green2: matugenColors.primary,
      surface2_2: matugenColors.surface,
      sky2: matugenColors.secondary,
      teal2: matugenColors.secondary,
      yellow2: matugenColors.secondary,
      pink3: matugenColors.tertiary,
      red3: matugenColors.secondary,
      mantle3: matugenColors.inverse_on_surface,
      surface0_3: matugenColors.outline,
      surface2_3: matugenColors.outline,
      overlay1_3: matugenColors.outline,
      lavender3: matugenColors.primary,
      mauve3: matugenColors.primary,
      green3: matugenColors.primary,
      sky3: matugenColors.secondary,
      teal3: matugenColors.secondary,
      yellow3: matugenColors.secondary,
      maroon3: matugenColors.primary,
      crust3: matugenColors.surface_dim
    },
    standard_2: {
      rosewater: matugenColors.primary,
      flamingo: matugenColors.primary,
      pink: matugenColors.tertiary,
      mauve: matugenColors.secondary,
      red: matugenColors.tertiary,
      maroon: matugenColors.secondary,
      peach: matugenColors.tertiary,
      yellow: matugenColors.primary,
      green: matugenColors.secondary,
      teal: matugenColors.primary,
      sky: matugenColors.primary,
      sapphire: matugenColors.secondary,
      blue: matugenColors.secondary,
      lavender: matugenColors.secondary,
      text: matugenColors.on_background,
      subtext1: matugenColors.outline,
      subtext2: matugenColors.outline,
      overlay2: matugenColors.outline,
      overlay1: matugenColors.outline,
      overlay0: matugenColors.outline,
      surface2: matugenColors.outline,
      surface1: matugenColors.surface_bright,
      surface0: matugenColors.surface_bright,
      base2: matugenColors.inverse_on_surface,
      base: matugenColors.inverse_on_surface,
      mantle: matugenColors.surface_dim,
      crust: matugenColors.surface_dim,
      notifications_closer: matugenColors.tertiary,
      notifications_background: matugenColors.surface_dim,
      dashboard_btn_text: matugenColors.surface_dim,
      red2: matugenColors.tertiary,
      peach2: matugenColors.tertiary,
      pink2: matugenColors.tertiary,
      mantle2: matugenColors.surface_dim,
      surface1_2: matugenColors.inverse_on_surface,
      surface0_2: matugenColors.surface_bright,
      overlay1_2: matugenColors.outline,
      text2: matugenColors.on_background,
      lavender2: matugenColors.secondary,
      crust2: matugenColors.surface_dim,
      maroon2: matugenColors.secondary,
      surface2_2: matugenColors.surface,
      mauve2: matugenColors.secondary,
      green2: matugenColors.secondary,
      sky2: matugenColors.primary,
      teal2: matugenColors.primary,
      yellow2: matugenColors.primary,
      pink3: matugenColors.tertiary,
      red3: matugenColors.secondary,
      mantle3: matugenColors.inverse_on_surface,
      surface0_3: matugenColors.outline,
      surface2_3: matugenColors.outline,
      overlay1_3: matugenColors.outline,
      lavender3: matugenColors.secondary,
      mauve3: matugenColors.secondary,
      green3: matugenColors.secondary,
      sky3: matugenColors.primary,
      teal3: matugenColors.primary,
      yellow3: matugenColors.primary,
      maroon3: matugenColors.secondary,
      crust3: matugenColors.surface_dim
    },
    standard_3: {
      rosewater: matugenColors.secondary,
      flamingo: matugenColors.secondary,
      pink: matugenColors.secondary,
      mauve: matugenColors.primary,
      red: matugenColors.secondary,
      maroon: matugenColors.primary,
      peach: matugenColors.secondary,
      yellow: matugenColors.secondary,
      green: matugenColors.primary,
      teal: matugenColors.secondary,
      sky: matugenColors.secondary,
      sapphire: matugenColors.primary,
      blue: matugenColors.primary,
      lavender: matugenColors.primary,
      text: matugenColors.on_background,
      subtext1: matugenColors.outline,
      subtext2: matugenColors.outline,
      overlay2: matugenColors.outline,
      overlay1: matugenColors.outline,
      overlay0: matugenColors.outline,
      surface2: matugenColors.outline,
      surface1: matugenColors.surface_bright,
      surface0: matugenColors.surface_bright,
      base2: matugenColors.inverse_on_surface,
      base: matugenColors.inverse_on_surface,
      mantle: matugenColors.surface_dim,
      crust: matugenColors.surface_dim,
      notifications_closer: matugenColors.secondary,
      notifications_background: matugenColors.surface_dim,
      dashboard_btn_text: matugenColors.surface_dim,
      red2: matugenColors.secondary,
      peach2: matugenColors.secondary,
      pink2: matugenColors.secondary,
      mantle2: matugenColors.surface_dim,
      surface1_2: matugenColors.inverse_on_surface,
      surface0_2: matugenColors.surface_bright,
      surface2_2: matugenColors.surface,
      overlay1_2: matugenColors.outline,
      text2: matugenColors.on_background,
      lavender2: matugenColors.primary,
      crust2: matugenColors.surface_dim,
      maroon2: matugenColors.primary,
      mauve2: matugenColors.primary,
      green2: matugenColors.primary,
      sky2: matugenColors.secondary,
      teal2: matugenColors.secondary,
      yellow2: matugenColors.secondary,
      pink3: matugenColors.secondary,
      red3: matugenColors.secondary,
      mantle3: matugenColors.inverse_on_surface,
      surface0_3: matugenColors.outline,
      surface2_3: matugenColors.outline,
      overlay1_3: matugenColors.outline,
      lavender3: matugenColors.primary,
      mauve3: matugenColors.primary,
      green3: matugenColors.primary,
      sky3: matugenColors.secondary,
      teal3: matugenColors.secondary,
      yellow3: matugenColors.secondary,
      maroon3: matugenColors.primary,
      crust3: matugenColors.surface_dim
    },
    vivid_1: {
      rosewater: matugenColors.surface,
      flamingo: matugenColors.surface,
      pink: matugenColors.surface,
      mauve: matugenColors.surface,
      red: matugenColors.surface,
      maroon: matugenColors.surface,
      peach: matugenColors.surface,
      yellow: matugenColors.surface,
      green: matugenColors.surface,
      teal: matugenColors.surface,
      sky: matugenColors.surface,
      sapphire: matugenColors.surface,
      blue: matugenColors.surface,
      lavender: matugenColors.surface,
      text: matugenColors.surface,
      subtext1: matugenColors.primary_container,
      subtext2: matugenColors.primary_container,
      overlay2: matugenColors.primary_container,
      overlay1: matugenColors.primary_container,
      overlay0: matugenColors.primary_container,
      surface2: matugenColors.surface_container_high,
      surface1: matugenColors.surface_container_high,
      surface0: matugenColors.surface_container_high,
      base2: matugenColors.primary,
      base: matugenColors.primary,
      mantle: matugenColors.surface_container_low,
      crust: matugenColors.surface_container_lowest,
      red2: matugenColors.primary_container,
      peach2: matugenColors.primary_container,
      pink2: matugenColors.primary_container,
      mantle2: matugenColors.primary,
      surface1_2: matugenColors.primary,
      surface0_2: matugenColors.primary,
      overlay1_2: matugenColors.surface_container_high,
      text2: matugenColors.outline,
      lavender2: matugenColors.primary_container,
      crust2: matugenColors.primary,
      maroon2: matugenColors.primary_container,
      mauve2: matugenColors.primary_container,
      surface2_2: matugenColors.primary_container,
      green2: matugenColors.primary_container,
      sky2: matugenColors.primary_container,
      teal2: matugenColors.primary_container,
      yellow2: matugenColors.primary_container,
      pink3: matugenColors.primary_fixed,
      red3: matugenColors.secondary,
      mantle3: matugenColors.primary,
      surface0_3: matugenColors.primary,
      surface2_3: matugenColors.outline,
      overlay1_3: matugenColors.primary,
      lavender3: matugenColors.primary,
      mauve3: matugenColors.primary,
      green3: matugenColors.primary_fixed,
      sky3: matugenColors.primary,
      teal3: matugenColors.primary,
      yellow3: matugenColors.primary_fixed,
      maroon3: matugenColors.primary_fixed,
      crust3: matugenColors.primary
    },
    vivid_2: {
      rosewater: matugenColors.surface,
      flamingo: matugenColors.surface,
      pink: matugenColors.surface,
      mauve: matugenColors.surface,
      red: matugenColors.surface,
      maroon: matugenColors.surface,
      peach: matugenColors.surface,
      yellow: matugenColors.surface,
      green: matugenColors.surface,
      teal: matugenColors.surface,
      sky: matugenColors.surface,
      sapphire: matugenColors.surface,
      blue: matugenColors.surface,
      lavender: matugenColors.surface,
      text: matugenColors.surface,
      subtext1: matugenColors.secondary_container,
      subtext2: matugenColors.secondary_container,
      overlay2: matugenColors.secondary_container,
      overlay1: matugenColors.secondary_container,
      overlay0: matugenColors.secondary_container,
      surface2: matugenColors.surface_container_high,
      surface1: matugenColors.surface_container_high,
      surface0: matugenColors.surface_container_high,
      base2: matugenColors.secondary,
      base: matugenColors.secondary,
      mantle: matugenColors.surface_container_low,
      crust: matugenColors.surface_container_lowest,
      red2: matugenColors.secondary_container,
      peach2: matugenColors.secondary_container,
      pink2: matugenColors.secondary_container,
      surface2_2: matugenColors.primary_container,
      mantle2: matugenColors.secondary,
      surface1_2: matugenColors.secondary,
      surface0_2: matugenColors.secondary,
      overlay1_2: matugenColors.surface_container_high,
      text2: matugenColors.outline,
      lavender2: matugenColors.secondary_container,
      crust2: matugenColors.secondary,
      maroon2: matugenColors.secondary_container,
      mauve2: matugenColors.secondary_container,
      green2: matugenColors.secondary_container,
      sky2: matugenColors.secondary_container,
      teal2: matugenColors.secondary_container,
      yellow2: matugenColors.secondary_container,
      pink3: matugenColors.secondary_fixed,
      red3: matugenColors.secondary,
      mantle3: matugenColors.secondary,
      surface0_3: matugenColors.secondary,
      surface2_3: matugenColors.outline,
      overlay1_3: matugenColors.secondary,
      lavender3: matugenColors.secondary,
      mauve3: matugenColors.secondary,
      green3: matugenColors.secondary_fixed,
      sky3: matugenColors.secondary,
      teal3: matugenColors.secondary,
      yellow3: matugenColors.secondary_fixed,
      maroon3: matugenColors.secondary_fixed,
      crust3: matugenColors.secondary
    },
    vivid_3: {
      rosewater: matugenColors.surface,
      flamingo: matugenColors.surface,
      pink: matugenColors.surface,
      mauve: matugenColors.surface,
      red: matugenColors.surface,
      maroon: matugenColors.surface,
      peach: matugenColors.surface,
      yellow: matugenColors.surface,
      green: matugenColors.surface,
      teal: matugenColors.surface,
      sky: matugenColors.surface,
      sapphire: matugenColors.surface,
      blue: matugenColors.surface,
      lavender: matugenColors.surface,
      text: matugenColors.surface,
      subtext1: matugenColors.tertiary_container,
      subtext2: matugenColors.tertiary_container,
      overlay2: matugenColors.tertiary_container,
      overlay1: matugenColors.tertiary_container,
      overlay0: matugenColors.tertiary_container,
      surface2: matugenColors.surface_container_high,
      surface1: matugenColors.surface_container_high,
      surface0: matugenColors.surface_container_high,
      base2: matugenColors.tertiary,
      base: matugenColors.tertiary,
      mantle: matugenColors.surface_container_low,
      crust: matugenColors.surface_container_lowest,
      red2: matugenColors.tertiary_container,
      peach2: matugenColors.tertiary_container,
      pink2: matugenColors.tertiary_container,
      mantle2: matugenColors.tertiary,
      surface1_2: matugenColors.tertiary,
      surface0_2: matugenColors.tertiary,
      overlay1_2: matugenColors.surface_container_high,
      text2: matugenColors.outline,
      lavender2: matugenColors.tertiary_container,
      surface2_2: matugenColors.primary_container,
      crust2: matugenColors.tertiary,
      maroon2: matugenColors.tertiary_container,
      mauve2: matugenColors.tertiary_container,
      green2: matugenColors.tertiary_container,
      sky2: matugenColors.tertiary_container,
      teal2: matugenColors.tertiary_container,
      yellow2: matugenColors.tertiary_container,
      pink3: matugenColors.tertiary_fixed,
      red3: matugenColors.secondary,
      mantle3: matugenColors.tertiary,
      surface0_3: matugenColors.tertiary,
      surface2_3: matugenColors.outline,
      overlay1_3: matugenColors.tertiary,
      lavender3: matugenColors.tertiary,
      mauve3: matugenColors.tertiary,
      green3: matugenColors.tertiary_fixed,
      sky3: matugenColors.tertiary,
      teal3: matugenColors.tertiary,
      yellow3: matugenColors.tertiary_fixed,
      maroon3: matugenColors.tertiary_fixed,
      crust3: matugenColors.tertiary
    },
    monochrome_1: {
      rosewater: matugenColors.primary,
      flamingo: matugenColors.primary,
      pink: matugenColors.primary,
      mauve: matugenColors.primary,
      red: matugenColors.primary,
      maroon: matugenColors.primary,
      peach: matugenColors.primary,
      yellow: matugenColors.primary,
      green: matugenColors.primary,
      teal: matugenColors.primary,
      sky: matugenColors.primary,
      sapphire: matugenColors.primary,
      blue: matugenColors.primary,
      lavender: matugenColors.primary,
      text: matugenColors.on_background,
      subtext1: matugenColors.outline,
      subtext2: matugenColors.outline,
      overlay2: matugenColors.outline,
      overlay1: matugenColors.outline,
      overlay0: matugenColors.outline,
      surface2: matugenColors.outline,
      surface1: matugenColors.surface_bright,
      surface0: matugenColors.surface_bright,
      base2: matugenColors.inverse_on_surface,
      base: matugenColors.inverse_on_surface,
      mantle: matugenColors.surface_dim,
      crust: matugenColors.surface_dim,
      notifications_closer: matugenColors.primary,
      notifications_background: matugenColors.surface_dim,
      dashboard_btn_text: matugenColors.surface_dim,
      red2: matugenColors.primary,
      peach2: matugenColors.primary,
      pink2: matugenColors.primary,
      mantle2: matugenColors.surface_dim,
      surface1_2: matugenColors.inverse_on_surface,
      surface0_2: matugenColors.surface_bright,
      surface2_2: matugenColors.surface,
      overlay1_2: matugenColors.outline,
      text2: matugenColors.on_background,
      lavender2: matugenColors.primary,
      crust2: matugenColors.surface_dim,
      maroon2: matugenColors.primary,
      mauve2: matugenColors.primary,
      green2: matugenColors.primary,
      sky2: matugenColors.primary,
      teal2: matugenColors.primary,
      yellow2: matugenColors.primary,
      pink3: matugenColors.primary,
      red3: matugenColors.secondary,
      mantle3: matugenColors.inverse_on_surface,
      surface0_3: matugenColors.outline,
      surface2_3: matugenColors.outline,
      overlay1_3: matugenColors.outline,
      lavender3: matugenColors.primary,
      mauve3: matugenColors.primary,
      green3: matugenColors.primary,
      sky3: matugenColors.primary,
      teal3: matugenColors.primary,
      yellow3: matugenColors.primary,
      maroon3: matugenColors.primary,
      crust3: matugenColors.surface_dim
    },
    monochrome_2: {
      rosewater: matugenColors.secondary,
      flamingo: matugenColors.secondary,
      pink: matugenColors.secondary,
      mauve: matugenColors.secondary,
      red: matugenColors.secondary,
      maroon: matugenColors.secondary,
      peach: matugenColors.secondary,
      yellow: matugenColors.secondary,
      green: matugenColors.secondary,
      teal: matugenColors.secondary,
      sky: matugenColors.secondary,
      sapphire: matugenColors.secondary,
      blue: matugenColors.secondary,
      lavender: matugenColors.secondary,
      text: matugenColors.on_background,
      subtext1: matugenColors.outline,
      subtext2: matugenColors.outline,
      overlay2: matugenColors.outline,
      overlay1: matugenColors.outline,
      overlay0: matugenColors.outline,
      surface2: matugenColors.outline,
      surface1: matugenColors.surface_bright,
      surface0: matugenColors.surface_bright,
      base2: matugenColors.inverse_on_surface,
      base: matugenColors.inverse_on_surface,
      mantle: matugenColors.surface_dim,
      crust: matugenColors.surface_dim,
      notifications_closer: matugenColors.secondary,
      notifications_background: matugenColors.surface_dim,
      dashboard_btn_text: matugenColors.surface_dim,
      red2: matugenColors.secondary,
      peach2: matugenColors.secondary,
      pink2: matugenColors.secondary,
      mantle2: matugenColors.surface_dim,
      surface1_2: matugenColors.inverse_on_surface,
      surface0_2: matugenColors.surface_bright,
      overlay1_2: matugenColors.outline,
      surface2_2: matugenColors.surface,
      text2: matugenColors.on_background,
      lavender2: matugenColors.secondary,
      crust2: matugenColors.surface_dim,
      maroon2: matugenColors.secondary,
      mauve2: matugenColors.secondary,
      green2: matugenColors.secondary,
      sky2: matugenColors.secondary,
      teal2: matugenColors.secondary,
      yellow2: matugenColors.secondary,
      pink3: matugenColors.secondary,
      red3: matugenColors.secondary,
      mantle3: matugenColors.inverse_on_surface,
      surface0_3: matugenColors.outline,
      surface2_3: matugenColors.outline,
      overlay1_3: matugenColors.outline,
      lavender3: matugenColors.secondary,
      mauve3: matugenColors.secondary,
      green3: matugenColors.secondary,
      sky3: matugenColors.secondary,
      teal3: matugenColors.secondary,
      yellow3: matugenColors.secondary,
      maroon3: matugenColors.secondary,
      crust3: matugenColors.surface_dim
    },
    monochrome_3: {
      rosewater: matugenColors.tertiary,
      flamingo: matugenColors.tertiary,
      pink: matugenColors.tertiary,
      mauve: matugenColors.tertiary,
      red: matugenColors.tertiary,
      maroon: matugenColors.tertiary,
      peach: matugenColors.tertiary,
      yellow: matugenColors.tertiary,
      green: matugenColors.tertiary,
      teal: matugenColors.tertiary,
      sky: matugenColors.tertiary,
      sapphire: matugenColors.tertiary,
      blue: matugenColors.tertiary,
      lavender: matugenColors.tertiary,
      text: matugenColors.on_background,
      subtext1: matugenColors.outline,
      subtext2: matugenColors.outline,
      overlay2: matugenColors.outline,
      overlay1: matugenColors.outline,
      overlay0: matugenColors.outline,
      surface2: matugenColors.outline,
      surface1: matugenColors.surface_bright,
      surface0: matugenColors.surface_bright,
      base2: matugenColors.inverse_on_surface,
      base: matugenColors.inverse_on_surface,
      mantle: matugenColors.surface_dim,
      crust: matugenColors.surface_dim,
      notifications_closer: matugenColors.tertiary,
      notifications_background: matugenColors.surface_dim,
      dashboard_btn_text: matugenColors.surface_dim,
      red2: matugenColors.tertiary,
      peach2: matugenColors.tertiary,
      pink2: matugenColors.tertiary,
      mantle2: matugenColors.surface_dim,
      surface1_2: matugenColors.inverse_on_surface,
      surface0_2: matugenColors.surface_bright,
      overlay1_2: matugenColors.outline,
      text2: matugenColors.on_background,
      lavender2: matugenColors.tertiary,
      crust2: matugenColors.surface_dim,
      maroon2: matugenColors.tertiary,
      surface2_2: matugenColors.surface,
      mauve2: matugenColors.tertiary,
      green2: matugenColors.tertiary,
      sky2: matugenColors.tertiary,
      teal2: matugenColors.tertiary,
      yellow2: matugenColors.tertiary,
      pink3: matugenColors.tertiary,
      red3: matugenColors.secondary,
      mantle3: matugenColors.inverse_on_surface,
      surface0_3: matugenColors.outline,
      surface2_3: matugenColors.outline,
      overlay1_3: matugenColors.outline,
      lavender3: matugenColors.tertiary,
      mauve3: matugenColors.tertiary,
      green3: matugenColors.tertiary,
      sky3: matugenColors.tertiary,
      teal3: matugenColors.tertiary,
      yellow3: matugenColors.tertiary,
      maroon3: matugenColors.tertiary,
      crust3: matugenColors.surface_dim
    }
  };
  return matVtns[variation];
};

// /home/antonio/.config/HyprPanel/services/matugen/index.ts
async function generateMatugenColors() {
  if (!matugen2.value || !dependencies("matugen")) {
    return;
  }
  const wallpaperPath = options_default.wallpaper.image.value;
  try {
    if (!wallpaperPath.length || !isAnImage(wallpaperPath)) {
      Notify({
        summary: "Matugen Failed",
        body: "Please select a wallpaper in 'Theming > General' first.",
        iconName: icons_default.ui.warning,
        timeout: 7000
      });
      return;
    }
    const normalizedContrast = contrast2.value > 1 ? 1 : contrast2.value < -1 ? -1 : contrast2.value;
    const contents = await bash(`matugen image ${wallpaperPath} -t scheme-${scheme_type2.value} --contrast ${normalizedContrast} --json hex`);
    return JSON.parse(contents).colors[options_default.theme.matugen_settings.mode.value];
  } catch (error) {
    const errMsg = `An error occurred while generating matugen colors: ${error}`;
    console.error(errMsg);
    return;
  }
}
var { scheme_type: scheme_type2, contrast: contrast2 } = options_default.theme.matugen_settings;
var { matugen: matugen2 } = options_default.theme;
var updateOptColor = (color, opt2) => {
  opt2.value = color;
};
var isColorValid = (color) => {
  return defaultColorMap.hasOwnProperty(color);
};
var replaceHexValues = (incomingHex, matugenColors) => {
  if (!options_default.theme.matugen.value) {
    return incomingHex;
  }
  const matugenVariation = getMatugenVariations(matugenColors, options_default.theme.matugen_settings.variation.value);
  updateOptColor(matugenVariation.base, options_default.theme.bar.menus.menu.media.card.color);
  for (const curColor of Object.keys(defaultColorMap)) {
    const currentColor = curColor;
    if (!isColorValid(currentColor)) {
      continue;
    }
    const curColorValue = defaultColorMap[currentColor];
    if (curColorValue === incomingHex) {
      return matugenVariation[currentColor];
    }
  }
  return incomingHex;
};

// /home/antonio/.config/HyprPanel/scss/style.ts
function extractVariables(theme, prefix = "", matugenColors) {
  let result = [];
  for (const key in theme) {
    if (!theme.hasOwnProperty(key)) {
      continue;
    }
    const value = theme[key];
    const newPrefix = prefix ? `${prefix}-${key}` : key;
    const isColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value.value);
    const replacedValue = isColor && matugenColors !== undefined ? replaceHexValues(value.value, matugenColors) : value.value;
    if (typeof value === "function") {
      result.push(`\$${newPrefix}: ${replacedValue};`);
      continue;
    }
    if (typeof value !== "object" || value === null || Array.isArray(value))
      continue;
    if (typeof value.value !== "undefined") {
      result.push(`\$${newPrefix}: ${replacedValue};`);
    } else {
      result = result.concat(extractVariables(value, newPrefix, matugenColors));
    }
  }
  return result;
}
var deps = ["font", "theme", "bar.flatButtons", "bar.position", "bar.battery.charging", "bar.battery.blocks"];
var resetCss = async () => {
  if (!dependencies("sass"))
    return;
  try {
    const matugenColors = await generateMatugenColors();
    const variables = [...extractVariables(options_default.theme, "", matugenColors)];
    const vars = `${TMP}/variables.scss`;
    const css = `${TMP}/main.css`;
    const scss = `${TMP}/entry.scss`;
    const localScss = `${App.configDir}/scss/main.scss`;
    const themeVariables = variables;
    const integratedVariables = themeVariables;
    const imports2 = [vars].map((f) => `@import '${f}';`);
    await Utils.writeFile(integratedVariables.join("\n"), vars);
    let mainScss = Utils.readFile(localScss);
    mainScss = `${imports2}\n${mainScss}`;
    await Utils.writeFile(mainScss, scss);
    await bash(`sass --load-path=${App.configDir}/scss/ ${scss} ${css}`);
    App.applyCss(css, true);
  } catch (error) {
    console.error(error);
  }
};
initializeTrackers(resetCss);
Utils.monitorFile(`${App.configDir}/scss/style`, resetCss);
options_default.handler(deps, resetCss);
await resetCss();

// /home/antonio/.config/HyprPanel/globals/useTheme.ts
import Gio2 from "gi://Gio";

// /home/antonio/.config/HyprPanel/widget/settings/shared/FileChooser.ts
import Gtk from "gi://Gtk?version=3.0";
import Gio from "gi://Gio";
var whiteListedThemeProp = ["theme.bar.buttons.style"];
var loadJsonFile = (filePath) => {
  const file = Gio.File.new_for_path(filePath);
  const [success, content] = file.load_contents(null);
  if (!success) {
    console.error(`Failed to import: ${filePath}`);
    return null;
  }
  const jsonString = new TextDecoder("utf-8").decode(content);
  return JSON.parse(jsonString);
};
var saveConfigToFile = (config, filePath) => {
  const file = Gio.File.new_for_path(filePath);
  const outputStream = file.replace(null, false, Gio.FileCreateFlags.NONE, null);
  const dataOutputStream = new Gio.DataOutputStream({ base_stream: outputStream });
  const jsonString = JSON.stringify(config, null, 2);
  dataOutputStream.put_string(jsonString, null);
  dataOutputStream.close(null);
};
var filterConfigForThemeOnly = (config) => {
  const filteredConfig = {};
  for (const key in config) {
    const value = config[key];
    if (typeof value === "string" && hexColorPattern.test(value)) {
      filteredConfig[key] = config[key];
    } else if (whiteListedThemeProp.includes(key)) {
      filteredConfig[key] = config[key];
    }
  }
  return filteredConfig;
};
var filterConfigForNonTheme = (config) => {
  const filteredConfig = {};
  for (const key in config) {
    if (whiteListedThemeProp.includes(key)) {
      continue;
    }
    const value = config[key];
    if (!(typeof value === "string" && hexColorPattern.test(value))) {
      filteredConfig[key] = config[key];
    }
  }
  return filteredConfig;
};
var saveFileDialog = (filePath, themeOnly) => {
  const original_file_path = filePath;
  const file = Gio.File.new_for_path(original_file_path);
  const [success, content] = file.load_contents(null);
  if (!success) {
    console.error(`Could not find 'config.json' at ${TMP}`);
    return;
  }
  const jsonString = new TextDecoder("utf-8").decode(content);
  const jsonObject = JSON.parse(jsonString);
  const filterHexColorPairs = (jsonObject2) => {
    const filteredObject = {};
    for (const key in jsonObject2) {
      const value = jsonObject2[key];
      if (typeof value === "string" && isHexColor(value)) {
        filteredObject[key] = jsonObject2[key];
      } else if (whiteListedThemeProp.includes(key)) {
        filteredObject[key] = jsonObject2[key];
      }
    }
    return filteredObject;
  };
  const filterOutHexColorPairs = (jsonObject2) => {
    const filteredObject = {};
    for (const key in jsonObject2) {
      if (whiteListedThemeProp.includes(key)) {
        continue;
      }
      const value = jsonObject2[key];
      if (!(typeof value === "string" && isHexColor(value))) {
        filteredObject[key] = jsonObject2[key];
      }
    }
    return filteredObject;
  };
  const filteredJsonObject = themeOnly ? filterHexColorPairs(jsonObject) : filterOutHexColorPairs(jsonObject);
  const filteredContent = JSON.stringify(filteredJsonObject, null, 2);
  const dialog = new Gtk.FileChooserDialog({
    title: "Save File As",
    action: Gtk.FileChooserAction.SAVE
  });
  dialog.add_button(Gtk.STOCK_CANCEL, Gtk.ResponseType.CANCEL);
  dialog.add_button(Gtk.STOCK_SAVE, Gtk.ResponseType.ACCEPT);
  dialog.set_current_name(themeOnly ? "hyprpanel_theme.json" : "hyprpanel_config.json");
  const response = dialog.run();
  if (response === Gtk.ResponseType.ACCEPT) {
    const file_path = dialog.get_filename();
    console.info(`Original file path: ${file_path}`);
    const getIncrementedFilePath = (filePath2) => {
      let increment = 1;
      const baseName = filePath2.replace(/(\.\w+)$/, "");
      const match = filePath2.match(/(\.\w+)$/);
      const extension = match ? match[0] : "";
      let newFilePath = filePath2;
      let file2 = Gio.File.new_for_path(newFilePath);
      while (file2.query_exists(null)) {
        newFilePath = `${baseName}_${increment}${extension}`;
        file2 = Gio.File.new_for_path(newFilePath);
        increment++;
      }
      return newFilePath;
    };
    const finalFilePath = getIncrementedFilePath(file_path);
    console.info(`File will be saved at: ${finalFilePath}`);
    try {
      const save_file = Gio.File.new_for_path(finalFilePath);
      const outputStream = save_file.replace(null, false, Gio.FileCreateFlags.NONE, null);
      const dataOutputStream = new Gio.DataOutputStream({
        base_stream: outputStream
      });
      dataOutputStream.put_string(filteredContent, null);
      dataOutputStream.close(null);
      Notify({
        summary: "File Saved Successfully",
        body: `At ${finalFilePath}.`,
        iconName: icons_default.ui.info,
        timeout: 5000
      });
    } catch (e) {
      if (e instanceof Error) {
        console.error("Failed to write to file:", e.message);
      }
    }
  }
  dialog.destroy();
};
var importFiles = (themeOnly = false) => {
  const dialog = new Gtk.FileChooserDialog({
    title: `Import ${themeOnly ? "Theme" : "Config"}`,
    action: Gtk.FileChooserAction.OPEN
  });
  dialog.set_current_folder(`${App.configDir}/themes`);
  dialog.add_button(Gtk.STOCK_CANCEL, Gtk.ResponseType.CANCEL);
  dialog.add_button(Gtk.STOCK_OPEN, Gtk.ResponseType.ACCEPT);
  const response = dialog.run();
  if (response === Gtk.ResponseType.CANCEL) {
    dialog.destroy();
    return;
  }
  if (response === Gtk.ResponseType.ACCEPT) {
    const filePath = dialog.get_filename();
    if (filePath === null) {
      Notify({
        summary: "Failed to import",
        body: "No file selected.",
        iconName: icons_default.ui.warning,
        timeout: 5000
      });
      return;
    }
    const importedConfig = loadJsonFile(filePath);
    if (!importedConfig) {
      dialog.destroy();
      return;
    }
    Notify({
      summary: `Importing ${themeOnly ? "Theme" : "Config"}`,
      body: `Importing: ${filePath}`,
      iconName: icons_default.ui.info,
      timeout: 7000
    });
    const tmpConfigFile = Gio.File.new_for_path(`${TMP}/config.json`);
    const optionsConfigFile = Gio.File.new_for_path(OPTIONS);
    const [tmpSuccess, tmpContent] = tmpConfigFile.load_contents(null);
    const [optionsSuccess, optionsContent] = optionsConfigFile.load_contents(null);
    if (!tmpSuccess || !optionsSuccess) {
      console.error("Failed to read existing configuration files.");
      dialog.destroy();
      return;
    }
    let tmpConfig = JSON.parse(new TextDecoder("utf-8").decode(tmpContent));
    let optionsConfig = JSON.parse(new TextDecoder("utf-8").decode(optionsContent));
    if (themeOnly) {
      const filteredConfig = filterConfigForThemeOnly(importedConfig);
      tmpConfig = { ...tmpConfig, ...filteredConfig };
      optionsConfig = { ...optionsConfig, ...filteredConfig };
    } else {
      const filteredConfig = filterConfigForNonTheme(importedConfig);
      tmpConfig = { ...tmpConfig, ...filteredConfig };
      optionsConfig = { ...optionsConfig, ...filteredConfig };
    }
    saveConfigToFile(tmpConfig, `${TMP}/config.json`);
    saveConfigToFile(optionsConfig, OPTIONS);
  }
  dialog.destroy();
  bash("pkill ags && ags");
};

// /home/antonio/.config/HyprPanel/globals/useTheme.ts
var hexColorPattern = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
globalThis.useTheme = (filePath) => {
  const importedConfig = loadJsonFile(filePath);
  if (!importedConfig) {
    return;
  }
  Notify({
    summary: `Importing Theme`,
    body: `Importing: ${filePath}`,
    iconName: icons_default.ui.info,
    timeout: 7000
  });
  const tmpConfigFile = Gio2.File.new_for_path(`${TMP}/config.json`);
  const optionsConfigFile = Gio2.File.new_for_path(OPTIONS);
  const [tmpSuccess, tmpContent] = tmpConfigFile.load_contents(null);
  const [optionsSuccess, optionsContent] = optionsConfigFile.load_contents(null);
  if (!tmpSuccess || !optionsSuccess) {
    console.error("Failed to read existing configuration files.");
    return;
  }
  let tmpConfig = JSON.parse(new TextDecoder("utf-8").decode(tmpContent));
  let optionsConfig = JSON.parse(new TextDecoder("utf-8").decode(optionsContent));
  const filteredConfig = filterConfigForThemeOnly(importedConfig);
  tmpConfig = { ...tmpConfig, ...filteredConfig };
  optionsConfig = { ...optionsConfig, ...filteredConfig };
  saveConfigToFile(tmpConfig, `${TMP}/config.json`);
  saveConfigToFile(optionsConfig, OPTIONS);
  bash("pkill ags && ags");
};

// /home/antonio/.config/HyprPanel/globals/utilities.ts
globalThis.isWindowVisible = (windowName) => {
  const appWindow = App.getWindow(windowName);
  if (appWindow === undefined) {
    return false;
  }
  return appWindow.visible;
};

// /home/antonio/.config/HyprPanel/globals/mousePos.ts
var globalMousePosVar = Variable([0, 0]);
globalThis["globalMousePos"] = globalMousePosVar;

// /home/antonio/.config/HyprPanel/modules/bar/utils.ts
var closeAllMenus = () => {
  const menuWindows = App.windows.filter((w) => {
    if (w.name) {
      return /.*menu/.test(w.name);
    }
    return false;
  }).map((w) => w.name);
  menuWindows.forEach((w) => {
    if (w) {
      App.closeWindow(w);
    }
  });
};
var openMenu = (clicked, event, window) => {
  const middleOfButton = Math.floor(clicked.get_allocated_width() / 2);
  const xAxisOfButtonClick = clicked.get_pointer()[0];
  const middleOffset = middleOfButton - xAxisOfButtonClick;
  const clickPos = event.get_root_coords();
  const adjustedXCoord = clickPos[1] + middleOffset;
  const coords = [adjustedXCoord, clickPos[2]];
  globalMousePos.value = coords;
  closeAllMenus();
  App.toggleWindow(window);
};

// /home/antonio/.config/HyprPanel/customModules/utils.ts
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
var { scrollSpeed } = options_default.bar.customModules;
var runAsyncCommand = (cmd, events, fn) => {
  if (cmd.startsWith("menu:")) {
    const menuName = cmd.split(":")[1].trim().toLowerCase();
    openMenu(events.clicked, events.event, `${menuName}menu`);
    return;
  }
  Utils.execAsync(`bash -c "${cmd}"`).then((output) => {
    if (fn !== undefined) {
      fn(output);
    }
  }).catch((err) => console.error(`Error running command "${cmd}": ${err})`));
};
var throttledScrollHandler = (interval) => throttle((cmd, events, fn) => {
  runAsyncCommand(cmd, events, fn);
}, 200 / interval);
var dummyVar = Variable("");
var inputHandler = (self, { onPrimaryClick, onSecondaryClick, onMiddleClick, onScrollUp, onScrollDown }) => {
  const sanitizeInput = (input) => {
    if (input === undefined) {
      return "";
    }
    return input.value;
  };
  const updateHandlers = () => {
    const interval = scrollSpeed.value;
    const throttledHandler = throttledScrollHandler(interval);
    self.on_primary_click = (clicked, event) => runAsyncCommand(sanitizeInput(onPrimaryClick?.cmd || dummyVar), { clicked, event }, onPrimaryClick.fn);
    self.on_secondary_click = (clicked, event) => runAsyncCommand(sanitizeInput(onSecondaryClick?.cmd || dummyVar), { clicked, event }, onSecondaryClick.fn);
    self.on_middle_click = (clicked, event) => runAsyncCommand(sanitizeInput(onMiddleClick?.cmd || dummyVar), { clicked, event }, onMiddleClick.fn);
    self.on_scroll_up = (clicked, event) => throttledHandler(sanitizeInput(onScrollUp?.cmd || dummyVar), { clicked, event }, onScrollUp.fn);
    self.on_scroll_down = (clicked, event) => throttledHandler(sanitizeInput(onScrollDown?.cmd || dummyVar), { clicked, event }, onScrollDown.fn);
  };
  updateHandlers();
  const sanitizeVariable = (someVar) => {
    if (someVar === undefined || typeof someVar.bind !== "function") {
      return dummyVar.bind("value");
    }
    return someVar.bind("value");
  };
  Utils.merge([
    scrollSpeed.bind("value"),
    sanitizeVariable(onPrimaryClick),
    sanitizeVariable(onSecondaryClick),
    sanitizeVariable(onMiddleClick),
    sanitizeVariable(onScrollUp),
    sanitizeVariable(onScrollDown)
  ], updateHandlers);
};
var divide = ([total, used], round) => {
  const percentageTotal = used / total * 100;
  if (round) {
    return total > 0 ? Math.round(percentageTotal) : 0;
  }
  return total > 0 ? parseFloat(percentageTotal.toFixed(2)) : 0;
};
var formatSizeInKiB = (sizeInBytes, round) => {
  const sizeInGiB = sizeInBytes / 1024 ** 1;
  return round ? Math.round(sizeInGiB) : parseFloat(sizeInGiB.toFixed(2));
};
var formatSizeInMiB = (sizeInBytes, round) => {
  const sizeInGiB = sizeInBytes / 1024 ** 2;
  return round ? Math.round(sizeInGiB) : parseFloat(sizeInGiB.toFixed(2));
};
var formatSizeInGiB = (sizeInBytes, round) => {
  const sizeInGiB = sizeInBytes / 1024 ** 3;
  return round ? Math.round(sizeInGiB) : parseFloat(sizeInGiB.toFixed(2));
};
var formatSizeInTiB = (sizeInBytes, round) => {
  const sizeInGiB = sizeInBytes / 1024 ** 4;
  return round ? Math.round(sizeInGiB) : parseFloat(sizeInGiB.toFixed(2));
};
var autoFormatSize = (sizeInBytes, round) => {
  if (sizeInBytes >= 1024 ** 4)
    return formatSizeInTiB(sizeInBytes, round);
  if (sizeInBytes >= 1024 ** 3)
    return formatSizeInGiB(sizeInBytes, round);
  if (sizeInBytes >= 1024 ** 2)
    return formatSizeInMiB(sizeInBytes, round);
  if (sizeInBytes >= 1024 ** 1)
    return formatSizeInKiB(sizeInBytes, round);
  return sizeInBytes;
};
var getPostfix = (sizeInBytes) => {
  if (sizeInBytes >= 1024 ** 4)
    return "TiB";
  if (sizeInBytes >= 1024 ** 3)
    return "GiB";
  if (sizeInBytes >= 1024 ** 2)
    return "MiB";
  if (sizeInBytes >= 1024 ** 1)
    return "KiB";
  return "B";
};
var renderResourceLabel = (lblType, rmUsg, round) => {
  const { used, total, percentage, free } = rmUsg;
  const formatFunctions = {
    TiB: formatSizeInTiB,
    GiB: formatSizeInGiB,
    MiB: formatSizeInMiB,
    KiB: formatSizeInKiB,
    B: (size) => size
  };
  const totalSizeFormatted = autoFormatSize(total, round);
  const postfix = getPostfix(total);
  const formatUsed = formatFunctions[postfix] || formatFunctions["B"];
  const usedSizeFormatted = formatUsed(used, round);
  if (lblType === "used/total") {
    return `${usedSizeFormatted}/${totalSizeFormatted} ${postfix}`;
  }
  if (lblType === "used") {
    return `${autoFormatSize(used, round)} ${getPostfix(used)}`;
  }
  if (lblType === "free") {
    return `${autoFormatSize(free, round)} ${getPostfix(free)}`;
  }
  return `${percentage}%`;
};
var formatTooltip = (dataType, lblTyp) => {
  switch (lblTyp) {
    case "used":
      return `Used ${dataType}`;
    case "free":
      return `Free ${dataType}`;
    case "used/total":
      return `Used/Total ${dataType}`;
    case "percentage":
      return `Percentage ${dataType} Usage`;
    default:
      return "";
  }
};

// /home/antonio/.config/HyprPanel/modules/bar/menu/index.ts
var { rightClick, middleClick, scrollUp, scrollDown } = options_default.bar.launcher;
var Menu = () => {
  return {
    component: Widget.Box({
      className: Utils.merge([options_default.theme.bar.buttons.style.bind("value")], (style) => {
        const styleMap = {
          default: "style1",
          split: "style2",
          wave: "style3",
          wave2: "style3"
        };
        return `dashboard ${styleMap[style]}`;
      }),
      child: Widget.Label({
        class_name: "bar-menu_label bar-button_icon txt-icon bar",
        label: options_default.bar.launcher.icon.bind("value")
      })
    }),
    isVisible: true,
    boxClass: "dashboard",
    props: {
      on_primary_click: (clicked, event) => {
        openMenu(clicked, event, "dashboardmenu");
      },
      setup: (self) => {
        self.hook(options_default.bar.scrollSpeed, () => {
          const throttledHandler = throttledScrollHandler(options_default.bar.scrollSpeed.value);
          self.on_secondary_click = (clicked, event) => {
            runAsyncCommand(rightClick.value, { clicked, event });
          };
          self.on_middle_click = (clicked, event) => {
            runAsyncCommand(middleClick.value, { clicked, event });
          };
          self.on_scroll_up = (clicked, event) => {
            throttledHandler(scrollUp.value, { clicked, event });
          };
          self.on_scroll_down = (clicked, event) => {
            throttledHandler(scrollDown.value, { clicked, event });
          };
        });
      }
    }
  };
};

// /home/antonio/.config/HyprPanel/modules/bar/workspaces/helpers.ts
function throttle2(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
var hyprland2 = await Service.import("hyprland");
var { workspaces, reverse_scroll, ignored } = options_default.bar.workspaces;
var getWorkspacesForMonitor = (curWs, wsRules, monitor) => {
  if (!wsRules || !Object.keys(wsRules).length) {
    return true;
  }
  const monitorMap = {};
  const workspaceMonitorList = hyprland2?.workspaces?.map((m) => ({ id: m.monitorID, name: m.monitor }));
  const monitors = [
    ...new Map([...workspaceMonitorList, ...hyprland2.monitors].map((item) => [item.id, item])).values()
  ];
  monitors.forEach((m) => monitorMap[m.id] = m.name);
  const currentMonitorName = monitorMap[monitor];
  const monitorWSRules = wsRules[currentMonitorName];
  if (monitorWSRules === undefined) {
    return true;
  }
  return monitorWSRules.includes(curWs);
};
var getWorkspaceRules = () => {
  try {
    const rules = Utils.exec("hyprctl workspacerules -j");
    const workspaceRules = {};
    JSON.parse(rules).forEach((rule) => {
      const workspaceNum = parseInt(rule.workspaceString, 10);
      if (isNaN(workspaceNum)) {
        return;
      }
      if (Object.hasOwnProperty.call(workspaceRules, rule.monitor)) {
        workspaceRules[rule.monitor].push(workspaceNum);
      } else {
        workspaceRules[rule.monitor] = [workspaceNum];
      }
    });
    return workspaceRules;
  } catch (err) {
    console.error(err);
    return {};
  }
};
var getCurrentMonitorWorkspaces = (monitor) => {
  if (hyprland2.monitors.length === 1) {
    return Array.from({ length: workspaces.value }, (_, i) => i + 1);
  }
  const monitorWorkspaces = getWorkspaceRules();
  const monitorMap = {};
  hyprland2.monitors.forEach((m) => monitorMap[m.id] = m.name);
  const currentMonitorName = monitorMap[monitor];
  return monitorWorkspaces[currentMonitorName];
};
var isWorkspaceIgnored = (ignoredWorkspaces, workspaceNumber) => {
  if (ignoredWorkspaces.value === "")
    return false;
  const ignoredWsRegex = new RegExp(ignoredWorkspaces.value);
  return ignoredWsRegex.test(workspaceNumber.toString());
};
var navigateWorkspace = (direction, currentMonitorWorkspaces, activeWorkspaces, ignoredWorkspaces) => {
  const workspacesList = activeWorkspaces ? hyprland2.workspaces.filter((ws) => hyprland2.active.monitor.id === ws.monitorID).map((ws) => ws.id) : currentMonitorWorkspaces.value || Array.from({ length: workspaces.value }, (_, i) => i + 1);
  if (workspacesList.length === 0)
    return;
  const currentIndex = workspacesList.indexOf(hyprland2.active.workspace.id);
  const step = direction === "next" ? 1 : -1;
  let newIndex = (currentIndex + step + workspacesList.length) % workspacesList.length;
  let attempts = 0;
  while (attempts < workspacesList.length) {
    const targetWS = workspacesList[newIndex];
    if (!isWorkspaceIgnored(ignoredWorkspaces, targetWS)) {
      hyprland2.messageAsync(`dispatch workspace ${targetWS}`);
      return;
    }
    newIndex = (newIndex + step + workspacesList.length) % workspacesList.length;
    attempts++;
  }
};
var goToNextWS = (currentMonitorWorkspaces, activeWorkspaces, ignoredWorkspaces) => {
  navigateWorkspace("next", currentMonitorWorkspaces, activeWorkspaces, ignoredWorkspaces);
};
var goToPrevWS = (currentMonitorWorkspaces, activeWorkspaces, ignoredWorkspaces) => {
  navigateWorkspace("prev", currentMonitorWorkspaces, activeWorkspaces, ignoredWorkspaces);
};
var createThrottledScrollHandlers = (scrollSpeed2, currentMonitorWorkspaces, activeWorkspaces = false) => {
  const throttledScrollUp = throttle2(() => {
    if (reverse_scroll.value) {
      goToPrevWS(currentMonitorWorkspaces, activeWorkspaces, ignored);
    } else {
      goToNextWS(currentMonitorWorkspaces, activeWorkspaces, ignored);
    }
  }, 200 / scrollSpeed2);
  const throttledScrollDown = throttle2(() => {
    if (reverse_scroll.value) {
      goToNextWS(currentMonitorWorkspaces, activeWorkspaces, ignored);
    } else {
      goToPrevWS(currentMonitorWorkspaces, activeWorkspaces, ignored);
    }
  }, 200 / scrollSpeed2);
  return { throttledScrollUp, throttledScrollDown };
};

// /home/antonio/.config/HyprPanel/modules/bar/workspaces/utils.ts
var hyprland3 = await Service.import("hyprland");
var { monochrome, background } = options_default.theme.bar.buttons;
var { background: wsBackground, active } = options_default.theme.bar.buttons.workspaces;
var { showWsIcons, showAllActive, numbered_active_indicator: activeIndicator } = options_default.bar.workspaces;
var isWorkspaceActiveOnMonitor = (monitor, monitors, i) => {
  return showAllActive.value && monitors[monitor]?.activeWorkspace?.id === i;
};
var getWsIcon = (wsIconMap, i) => {
  const iconEntry = wsIconMap[i];
  if (!iconEntry) {
    return `${i}`;
  }
  const hasIcon = typeof iconEntry === "object" && "icon" in iconEntry && iconEntry.icon !== "";
  if (typeof iconEntry === "string" && iconEntry !== "") {
    return iconEntry;
  }
  if (hasIcon) {
    return iconEntry.icon;
  }
  return `${i}`;
};
var getWsColor = (wsIconMap, i, smartHighlight, monitor, monitors) => {
  const iconEntry = wsIconMap[i];
  const hasColor = typeof iconEntry === "object" && "color" in iconEntry && isValidGjsColor(iconEntry.color);
  if (!iconEntry) {
    return "";
  }
  if (showWsIcons.value && smartHighlight && activeIndicator.value === "highlight" && (hyprland3.active.workspace.id === i || isWorkspaceActiveOnMonitor(monitor, monitors, i))) {
    const iconColor = monochrome.value ? background : wsBackground;
    const iconBackground = hasColor && isValidGjsColor(iconEntry.color) ? iconEntry.color : active.value;
    const colorCss = `color: ${iconColor};`;
    const backgroundCss = `background: ${iconBackground};`;
    return colorCss + backgroundCss;
  }
  if (hasColor && isValidGjsColor(iconEntry.color)) {
    return `color: ${iconEntry.color}; border-bottom-color: ${iconEntry.color};`;
  }
  return "";
};
var renderClassnames = (showIcons, showNumbered, numberedActiveIndicator, showWsIcons2, smartHighlight, monitor, monitors, i) => {
  if (showIcons) {
    return "workspace-icon txt-icon bar";
  }
  if (showNumbered || showWsIcons2) {
    const numActiveInd = hyprland3.active.workspace.id === i || isWorkspaceActiveOnMonitor(monitor, monitors, i) ? numberedActiveIndicator : "";
    const wsIconClass = showWsIcons2 ? "txt-icon" : "";
    const smartHighlightClass = smartHighlight ? "smart-highlight" : "";
    const className = `workspace-number can_${numberedActiveIndicator} ${numActiveInd} ${wsIconClass} ${smartHighlightClass}`;
    return className.trim();
  }
  return "default";
};
var renderLabel = (showIcons, available, active2, occupied, workspaceMask, showWsIcons2, wsIconMap, i, index, monitor, monitors) => {
  if (showIcons) {
    if (hyprland3.active.workspace.id === i || isWorkspaceActiveOnMonitor(monitor, monitors, i)) {
      return active2;
    }
    if ((hyprland3.getWorkspace(i)?.windows || 0) > 0) {
      return occupied;
    }
    if (monitor !== -1) {
      return available;
    }
  }
  if (showWsIcons2) {
    return getWsIcon(wsIconMap, i);
  }
  return workspaceMask ? `${index + 1}` : `${i}`;
};

// /home/antonio/.config/HyprPanel/modules/bar/workspaces/variants/occupied.ts
var hyprland4 = await Service.import("hyprland");
var { workspaces: workspaces2, monitorSpecific, workspaceMask, spacing, ignored: ignored2, showAllActive: showAllActive2 } = options_default.bar.workspaces;
var occupiedWses = (monitor) => {
  return Widget.Box({
    children: Utils.merge([
      monitorSpecific.bind("value"),
      hyprland4.bind("workspaces"),
      workspaceMask.bind("value"),
      workspaces2.bind("value"),
      options_default.bar.workspaces.show_icons.bind("value"),
      options_default.bar.workspaces.icons.available.bind("value"),
      options_default.bar.workspaces.icons.active.bind("value"),
      options_default.bar.workspaces.icons.occupied.bind("value"),
      options_default.bar.workspaces.show_numbered.bind("value"),
      options_default.bar.workspaces.numbered_active_indicator.bind("value"),
      spacing.bind("value"),
      hyprland4.active.workspace.bind("id"),
      options_default.bar.workspaces.workspaceIconMap.bind("value"),
      options_default.bar.workspaces.showWsIcons.bind("value"),
      options_default.theme.matugen.bind("value"),
      options_default.theme.bar.buttons.workspaces.smartHighlight.bind("value"),
      hyprland4.bind("monitors"),
      ignored2.bind("value"),
      showAllActive2.bind("value")
    ], (monitorSpecific2, wkSpaces, workspaceMask2, totalWkspcs, showIcons, available, active2, occupied, showNumbered, numberedActiveIndicator, spacing2, activeId, wsIconMap, showWsIcons2, matugen3, smartHighlight, monitors) => {
      let allWkspcs = range(totalWkspcs || 8);
      const activeWorkspaces = wkSpaces.map((w) => w.id);
      const workspaceRules = getWorkspaceRules();
      const workspaceMonitorList = hyprland4?.workspaces?.map((m) => ({
        id: m.monitorID,
        name: m.monitor
      }));
      const curMonitor = hyprland4.monitors.find((m) => m.id === monitor) || workspaceMonitorList.find((m) => m.id === monitor);
      const workspacesWithRules = Object.keys(workspaceRules).reduce((acc, k) => {
        return [...acc, ...workspaceRules[k]];
      }, []);
      const activesForMonitor = activeWorkspaces.filter((w) => {
        if (curMonitor && Object.hasOwnProperty.call(workspaceRules, curMonitor.name) && workspacesWithRules.includes(w)) {
          return workspaceRules[curMonitor.name].includes(w);
        }
        return true;
      });
      if (monitorSpecific2) {
        const wrkspcsInRange = range(totalWkspcs).filter((w) => {
          return getWorkspacesForMonitor(w, workspaceRules, monitor);
        });
        allWkspcs = [...new Set([...activesForMonitor, ...wrkspcsInRange])];
      } else {
        allWkspcs = [...new Set([...allWkspcs, ...activeWorkspaces])];
      }
      return allWkspcs.filter((workspaceNumber) => {
        return !isWorkspaceIgnored(ignored2, workspaceNumber);
      }).sort((a, b) => {
        return a - b;
      }).map((i, index) => {
        return Widget.Button({
          class_name: "workspace-button",
          on_primary_click: () => {
            hyprland4.messageAsync(`dispatch workspace ${i}`);
          },
          child: Widget.Label({
            attribute: i,
            vpack: "center",
            css: `margin: 0rem ${0.375 * spacing2}rem;` + `${showWsIcons2 && !matugen3 ? getWsColor(wsIconMap, i, smartHighlight, monitor, monitors) : ""}`,
            class_name: renderClassnames(showIcons, showNumbered, numberedActiveIndicator, showWsIcons2, smartHighlight, monitor, monitors, i),
            label: renderLabel(showIcons, available, active2, occupied, workspaceMask2, showWsIcons2, wsIconMap, i, index, monitor, monitors),
            setup: (self) => {
              self.toggleClassName("active", activeId === i);
              self.toggleClassName("occupied", (hyprland4.getWorkspace(i)?.windows || 0) > 0);
            }
          })
        });
      });
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/bar/workspaces/variants/default.ts
var hyprland5 = await Service.import("hyprland");
var { workspaces: workspaces3, monitorSpecific: monitorSpecific2, workspaceMask: workspaceMask2, spacing: spacing2, ignored: ignored3 } = options_default.bar.workspaces;
var defaultWses = (monitor) => {
  return Widget.Box({
    children: Utils.merge([workspaces3.bind("value"), monitorSpecific2.bind("value"), ignored3.bind("value")], (workspaces4, monitorSpecific3) => {
      return range(workspaces4 || 8).filter((workspaceNumber) => {
        if (!monitorSpecific3) {
          return true;
        }
        const workspaceRules = getWorkspaceRules();
        return getWorkspacesForMonitor(workspaceNumber, workspaceRules, monitor) && !isWorkspaceIgnored(ignored3, workspaceNumber);
      }).sort((a, b) => {
        return a - b;
      }).map((i, index) => {
        return Widget.Button({
          class_name: "workspace-button",
          on_primary_click: () => {
            hyprland5.messageAsync(`dispatch workspace ${i}`);
          },
          child: Widget.Label({
            attribute: i,
            vpack: "center",
            css: Utils.merge([
              spacing2.bind("value"),
              options_default.bar.workspaces.showWsIcons.bind("value"),
              options_default.bar.workspaces.workspaceIconMap.bind("value"),
              options_default.theme.matugen.bind("value"),
              options_default.theme.bar.buttons.workspaces.smartHighlight.bind("value"),
              hyprland5.bind("monitors"),
              hyprland5.active.workspace.bind("id")
            ], (sp, showWsIcons2, workspaceIconMap, matugen3, smartHighlight, monitors) => {
              return `margin: 0rem ${0.375 * sp}rem;` + `${showWsIcons2 && !matugen3 ? getWsColor(workspaceIconMap, i, smartHighlight, monitor, monitors) : ""}`;
            }),
            class_name: Utils.merge([
              options_default.bar.workspaces.show_icons.bind("value"),
              options_default.bar.workspaces.show_numbered.bind("value"),
              options_default.bar.workspaces.numbered_active_indicator.bind("value"),
              options_default.bar.workspaces.showWsIcons.bind("value"),
              options_default.theme.bar.buttons.workspaces.smartHighlight.bind("value"),
              hyprland5.bind("monitors"),
              options_default.bar.workspaces.icons.available.bind("value"),
              options_default.bar.workspaces.icons.active.bind("value"),
              hyprland5.active.workspace.bind("id")
            ], (showIcons, showNumbered, numberedActiveIndicator, showWsIcons2, smartHighlight, monitors) => {
              return renderClassnames(showIcons, showNumbered, numberedActiveIndicator, showWsIcons2, smartHighlight, monitor, monitors, i);
            }),
            label: Utils.merge([
              options_default.bar.workspaces.show_icons.bind("value"),
              options_default.bar.workspaces.icons.available.bind("value"),
              options_default.bar.workspaces.icons.active.bind("value"),
              options_default.bar.workspaces.icons.occupied.bind("value"),
              options_default.bar.workspaces.workspaceIconMap.bind("value"),
              options_default.bar.workspaces.showWsIcons.bind("value"),
              workspaceMask2.bind("value"),
              hyprland5.bind("monitors"),
              hyprland5.active.workspace.bind("id")
            ], (showIcons, available, active2, occupied, wsIconMap, showWsIcons2, workspaceMask3, monitors) => {
              return renderLabel(showIcons, available, active2, occupied, workspaceMask3, showWsIcons2, wsIconMap, i, index, monitor, monitors);
            }),
            setup: (self) => {
              self.hook(hyprland5, () => {
                self.toggleClassName("active", hyprland5.active.workspace.id === i);
                self.toggleClassName("occupied", (hyprland5.getWorkspace(i)?.windows || 0) > 0);
              });
            }
          })
        });
      });
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/bar/workspaces/index.ts
var { workspaces: workspaces4, scroll_speed } = options_default.bar.workspaces;
var Workspaces = (monitor = -1) => {
  const currentMonitorWorkspaces = Variable(getCurrentMonitorWorkspaces(monitor));
  workspaces4.connect("changed", () => {
    currentMonitorWorkspaces.value = getCurrentMonitorWorkspaces(monitor);
  });
  return {
    component: Widget.Box({
      class_name: "workspaces-box-container",
      child: options_default.bar.workspaces.hideUnoccupied.bind("value").as((hideUnoccupied) => hideUnoccupied ? occupiedWses(monitor) : defaultWses(monitor))
    }),
    isVisible: true,
    boxClass: "workspaces",
    props: {
      setup: (self) => {
        Utils.merge([scroll_speed.bind("value"), options_default.bar.workspaces.hideUnoccupied.bind("value")], (scroll_speed2, hideUnoccupied) => {
          const { throttledScrollUp, throttledScrollDown } = createThrottledScrollHandlers(scroll_speed2, currentMonitorWorkspaces, hideUnoccupied);
          self.on_scroll_up = throttledScrollUp;
          self.on_scroll_down = throttledScrollDown;
        });
      }
    }
  };
};

// /home/antonio/.config/HyprPanel/modules/bar/window_title/index.ts
var hyprland6 = await Service.import("hyprland");
var { leftClick, rightClick: rightClick2, middleClick: middleClick2, scrollDown: scrollDown2, scrollUp: scrollUp2 } = options_default.bar.windowtitle;
var filterTitle = (windowtitle) => {
  const windowTitleMap = [
    ...options_default.bar.windowtitle.title_map.value,
    ["kitty", "\uDB80\uDD1B", "Kitty Terminal"],
    ["firefox", "\uDB80\uDE39", "Firefox"],
    ["microsoft-edge", "\uDB80\uDDE9", "Edge"],
    ["discord", "\uF1FF", "Discord"],
    ["vesktop", "\uF1FF", "Vesktop"],
    ["org.kde.dolphin", "\uF07C", "Dolphin"],
    ["plex", "\uDB81\uDEBA", "Plex"],
    ["steam", "\uF1B6", "Steam"],
    ["spotify", "\uDB81\uDCC7", "Spotify"],
    ["ristretto", "\uDB80\uDEE9", "Ristretto"],
    ["obsidian", "\uDB85\uDCE7", "Obsidian"],
    ["google-chrome", "\uF268", "Google Chrome"],
    ["brave-browser", "\uDB81\uDD9F", "Brave Browser"],
    ["chromium", "\uF268", "Chromium"],
    ["opera", "\uF26A", "Opera"],
    ["vivaldi", "\uDB81\uDD9F", "Vivaldi"],
    ["waterfox", "\uDB81\uDD9F", "Waterfox"],
    ["thorium", "\uDB81\uDD9F", "Waterfox"],
    ["tor-browser", "\uF371", "Tor Browser"],
    ["floorp", "\uDB80\uDE39", "Floorp"],
    ["gnome-terminal", "\uE795", "GNOME Terminal"],
    ["konsole", "\uE795", "Konsole"],
    ["alacritty", "\uE795", "Alacritty"],
    ["wezterm", "\uE795", "Wezterm"],
    ["foot", "\uDB83\uDF52", "Foot Terminal"],
    ["tilix", "\uE795", "Tilix"],
    ["xterm", "\uE795", "XTerm"],
    ["urxvt", "\uE795", "URxvt"],
    ["st", "\uE795", "st Terminal"],
    ["code", "\uDB82\uDE1E", "Visual Studio Code"],
    ["vscode", "\uDB82\uDE1E", "VS Code"],
    ["sublime-text", "\uE7AA", "Sublime Text"],
    ["atom", "\uE764", "Atom"],
    ["android-studio", "\uDB80\uDC34", "Android Studio"],
    ["intellij-idea", "\uE7B5", "IntelliJ IDEA"],
    ["pycharm", "\uDB84\uDCD6", "PyCharm"],
    ["webstorm", "\uDB84\uDCD6", "WebStorm"],
    ["phpstorm", "\uDB84\uDCD6", "PhpStorm"],
    ["eclipse", "\uE79E", "Eclipse"],
    ["netbeans", "\uE79B", "NetBeans"],
    ["docker", "\uF21F", "Docker"],
    ["vim", "\uE7C5", "Vim"],
    ["neovim", "\uF36F", "Neovim"],
    ["neovide", "\uF36F", "Neovide"],
    ["emacs", "\uE632", "Emacs"],
    ["slack", "\uDB81\uDCB1", "Slack"],
    ["telegram-desktop", "\uF2C6", "Telegram"],
    ["org.telegram.desktop", "\uE217", "Telegram"],
    ["whatsapp", "\uDB81\uDDA3", "WhatsApp"],
    ["teams", "\uDB80\uDEBB", "Microsoft Teams"],
    ["skype", "\uDB81\uDCAF", "Skype"],
    ["thunderbird", "\uF370", "Thunderbird"],
    ["nautilus", "\uDB81\uDF70", "Files (Nautilus)"],
    ["thunar", "\uDB81\uDF70", "Thunar"],
    ["pcmanfm", "\uDB81\uDF70", "PCManFM"],
    ["nemo", "\uDB81\uDF70", "Nemo"],
    ["ranger", "\uDB81\uDF70", "Ranger"],
    ["doublecmd", "\uDB81\uDF70", "Double Commander"],
    ["krusader", "\uDB81\uDF70", "Krusader"],
    ["vlc", "\uDB81\uDD7C", "VLC Media Player"],
    ["mpv", "\uF36E", "MPV"],
    ["rhythmbox", "\uDB81\uDCC3", "Rhythmbox"],
    ["gimp", "\uF338", "GIMP"],
    ["inkscape", "\uF33B", "Inkscape"],
    ["krita", "\uF33D", "Krita"],
    ["blender", "\uDB80\uDCAB", "Blender"],
    ["kdenlive", "\uF33C", "Kdenlive"],
    ["lutris", "\uDB83\uDEB5", "Lutris"],
    ["heroic", "\uDB83\uDEB5", "Heroic Games Launcher"],
    ["minecraft", "\uDB80\uDF73", "Minecraft"],
    ["csgo", "\uDB83\uDEB5", "CS:GO"],
    ["dota2", "\uDB83\uDEB5", "Dota 2"],
    ["evernote", "\uEF98", "Evernote"],
    ["sioyek", "\uE28A", "Sioyek"],
    ["dropbox", "\uDB80\uDDE3", "Dropbox"],
    ["^$", "\uDB80\uDDC4", "Desktop"],
    ["(.+)", "\uDB82\uDCC6", `${windowtitle.class.charAt(0).toUpperCase() + windowtitle.class.slice(1)}`]
  ];
  const foundMatch = windowTitleMap.find((wt) => RegExp(wt[0]).test(windowtitle.class.toLowerCase()));
  if (!foundMatch || foundMatch.length !== 3) {
    return {
      icon: windowTitleMap[windowTitleMap.length - 1][1],
      label: windowTitleMap[windowTitleMap.length - 1][2]
    };
  }
  return {
    icon: foundMatch[1],
    label: foundMatch[2]
  };
};
var getTitle = (client, useCustomTitle, useClassName) => {
  if (useCustomTitle)
    return filterTitle(client).label;
  if (useClassName)
    return client.class;
  const title = client.title;
  if (title.length === 0 || title.match(/^ *$/)) {
    return client.class;
  }
  return title;
};
var truncateTitle = (title, max_size) => {
  if (max_size > 0 && title.length > max_size) {
    return title.substring(0, max_size).trim() + "...";
  }
  return title;
};
var ClientTitle = () => {
  const { custom_title, class_name, label, icon, truncation, truncation_size } = options_default.bar.windowtitle;
  return {
    component: Widget.Box({
      className: Utils.merge([options_default.theme.bar.buttons.style.bind("value"), label.bind("value")], (style, showLabel) => {
        const styleMap = {
          default: "style1",
          split: "style2",
          wave: "style3",
          wave2: "style3"
        };
        return `windowtitle-container ${styleMap[style]} ${!showLabel ? "no-label" : ""}`;
      }),
      children: Utils.merge([
        hyprland6.active.bind("client"),
        custom_title.bind("value"),
        class_name.bind("value"),
        label.bind("value"),
        icon.bind("value"),
        truncation.bind("value"),
        truncation_size.bind("value")
      ], (client, useCustomTitle, useClassName, showLabel, showIcon, truncate, truncationSize) => {
        const children = [];
        if (showIcon) {
          children.push(Widget.Label({
            class_name: "bar-button-icon windowtitle txt-icon bar",
            label: filterTitle(client).icon
          }));
        }
        if (showLabel) {
          children.push(Widget.Label({
            class_name: `bar-button-label windowtitle ${showIcon ? "" : "no-icon"}`,
            label: truncateTitle(getTitle(client, useCustomTitle, useClassName), truncate ? truncationSize : -1)
          }));
        }
        return children;
      })
    }),
    isVisible: true,
    boxClass: "windowtitle",
    props: {
      setup: (self) => {
        self.hook(options_default.bar.scrollSpeed, () => {
          const throttledHandler = throttledScrollHandler(options_default.bar.scrollSpeed.value);
          self.on_primary_click = (clicked, event) => {
            runAsyncCommand(leftClick.value, { clicked, event });
          };
          self.on_secondary_click = (clicked, event) => {
            runAsyncCommand(rightClick2.value, { clicked, event });
          };
          self.on_middle_click = (clicked, event) => {
            runAsyncCommand(middleClick2.value, { clicked, event });
          };
          self.on_scroll_up = (clicked, event) => {
            throttledHandler(scrollUp2.value, { clicked, event });
          };
          self.on_scroll_down = (clicked, event) => {
            throttledHandler(scrollDown2.value, { clicked, event });
          };
        });
      }
    }
  };
};

// /home/antonio/.config/HyprPanel/lib/shared/media.ts
var mpris = await Service.import("mpris");
var getCurrentPlayer = (activePlayer = mpris.players[0]) => {
  const statusOrder = {
    Playing: 1,
    Paused: 2,
    Stopped: 3
  };
  if (mpris.players.length === 0) {
    return mpris.players[0];
  }
  const isPlaying = mpris.players.some((p) => p.play_back_status === "Playing");
  const playerStillExists = mpris.players.some((p) => activePlayer.bus_name === p.bus_name);
  const nextPlayerUp = mpris.players.sort((a, b) => statusOrder[a.play_back_status] - statusOrder[b.play_back_status])[0];
  if (isPlaying || !playerStillExists) {
    return nextPlayerUp;
  }
  return activePlayer;
};

// /home/antonio/.config/HyprPanel/modules/bar/media/index.ts
var mpris2 = await Service.import("mpris");
var { show_artist, truncation, truncation_size, show_label, show_active_only, rightClick: rightClick3, middleClick: middleClick3 } = options_default.bar.media;
var Media = () => {
  const activePlayer = Variable(mpris2.players[0]);
  const isVis = Variable(!show_active_only.value);
  show_active_only.connect("changed", () => {
    isVis.value = !show_active_only.value || mpris2.players.length > 0;
  });
  mpris2.connect("changed", () => {
    const curPlayer = getCurrentPlayer(activePlayer.value);
    activePlayer.value = curPlayer;
    isVis.value = !show_active_only.value || mpris2.players.length > 0;
  });
  const getIconForPlayer = (playerName) => {
    const windowTitleMap = [
      ["Firefox", "\uDB80\uDE39"],
      ["Microsoft Edge", "\uDB80\uDDE9"],
      ["Discord", "\uF1FF"],
      ["Plex", "\uDB81\uDEBA"],
      ["Spotify", "\uDB81\uDCC7"],
      ["(.*)", "\uDB81\uDF5A"]
    ];
    const foundMatch = windowTitleMap.find((wt) => RegExp(wt[0], "i").test(playerName));
    return foundMatch ? foundMatch[1] : "\uDB81\uDF5A";
  };
  const songIcon = Variable("");
  const mediaLabel = Utils.watch("Media", [mpris2, show_artist, truncation, truncation_size, show_label], () => {
    if (activePlayer.value && show_label.value) {
      const { track_title, identity, track_artists } = activePlayer.value;
      songIcon.value = getIconForPlayer(identity);
      const trackArtist = show_artist.value ? ` - ${track_artists.join(", ")}` : ``;
      const truncatedLabel = truncation.value ? `${track_title + trackArtist}`.substring(0, truncation_size.value) : `${track_title + trackArtist}`;
      return track_title.length === 0 ? `No media playing...` : truncatedLabel.length < truncation_size.value || !truncation.value ? `${truncatedLabel}` : `${truncatedLabel.substring(0, truncatedLabel.length - 3)}...`;
    } else {
      songIcon.value = getIconForPlayer(activePlayer.value?.identity || "");
      return `Media`;
    }
  });
  return {
    component: Widget.Box({
      visible: false,
      child: Widget.Box({
        className: Utils.merge([options_default.theme.bar.buttons.style.bind("value"), show_label.bind("value")], (style) => {
          const styleMap = {
            default: "style1",
            split: "style2",
            wave: "style3",
            wave2: "style3"
          };
          return `media-container ${styleMap[style]}`;
        }),
        child: Widget.Box({
          children: [
            Widget.Label({
              class_name: "bar-button-icon media txt-icon bar",
              label: songIcon.bind("value").as((v) => v || "\uDB81\uDF5A")
            }),
            Widget.Label({
              class_name: "bar-button-label media",
              label: mediaLabel
            })
          ]
        })
      })
    }),
    isVis,
    boxClass: "media",
    props: {
      on_scroll_up: () => activePlayer.value?.next(),
      on_scroll_down: () => activePlayer.value?.previous(),
      on_primary_click: (clicked, event) => {
        openMenu(clicked, event, "mediamenu");
      },
      onSecondaryClick: (clicked, event) => {
        runAsyncCommand(rightClick3.value, { clicked, event });
      },
      onMiddleClick: (clicked, event) => {
        runAsyncCommand(middleClick3.value, { clicked, event });
      }
    }
  };
};

// /home/antonio/.config/HyprPanel/lib/shared/notifications.ts
var filterNotifications = (notifications, filter) => {
  const notifFilter = new Set(filter.map((name) => name.toLowerCase().replace(/\s+/g, "_")));
  const filteredNotifications = notifications.filter((notif) => {
    const normalizedAppName = notif.app_name.toLowerCase().replace(/\s+/g, "_");
    return !notifFilter.has(normalizedAppName);
  });
  return filteredNotifications;
};

// /home/antonio/.config/HyprPanel/modules/bar/notifications/index.ts
var { show_total, rightClick: rightClick4, middleClick: middleClick4, scrollUp: scrollUp3, scrollDown: scrollDown3 } = options_default.bar.notifications;
var { ignore } = options_default.notifications;
var notifs = await Service.import("notifications");
var Notifications = () => {
  return {
    component: Widget.Box({
      hpack: "start",
      className: Utils.merge([options_default.theme.bar.buttons.style.bind("value"), show_total.bind("value")], (style, showTotal) => {
        const styleMap = {
          default: "style1",
          split: "style2",
          wave: "style3",
          wave2: "style3"
        };
        return `notifications-container ${styleMap[style]} ${!showTotal ? "no-label" : ""}`;
      }),
      child: Widget.Box({
        hpack: "start",
        class_name: "bar-notifications",
        children: Utils.merge([notifs.bind("notifications"), notifs.bind("dnd"), show_total.bind("value"), ignore.bind("value")], (notif, dnd, showTotal, ignoredNotifs) => {
          const filteredNotifications = filterNotifications(notif, ignoredNotifs);
          const notifIcon = Widget.Label({
            hpack: "center",
            class_name: "bar-button-icon notifications txt-icon bar",
            label: dnd ? "\uDB80\uDC9B" : filteredNotifications.length > 0 ? "\uDB84\uDD6B" : "\uDB80\uDC9A"
          });
          const notifLabel = Widget.Label({
            hpack: "center",
            class_name: "bar-button-label notifications",
            label: filteredNotifications.length.toString()
          });
          if (showTotal) {
            return [notifIcon, notifLabel];
          }
          return [notifIcon];
        })
      })
    }),
    isVisible: true,
    boxClass: "notifications",
    props: {
      on_primary_click: (clicked, event) => {
        openMenu(clicked, event, "notificationsmenu");
      },
      setup: (self) => {
        self.hook(options_default.bar.scrollSpeed, () => {
          const throttledHandler = throttledScrollHandler(options_default.bar.scrollSpeed.value);
          self.on_secondary_click = (clicked, event) => {
            runAsyncCommand(rightClick4.value, { clicked, event });
          };
          self.on_middle_click = (clicked, event) => {
            runAsyncCommand(middleClick4.value, { clicked, event });
          };
          self.on_scroll_up = (clicked, event) => {
            throttledHandler(scrollUp3.value, { clicked, event });
          };
          self.on_scroll_down = (clicked, event) => {
            throttledHandler(scrollDown3.value, { clicked, event });
          };
        });
      }
    }
  };
};

// /home/antonio/.config/HyprPanel/modules/bar/volume/index.ts
var audio = await Service.import("audio");
var { rightClick: rightClick5, middleClick: middleClick5, scrollUp: scrollUp4, scrollDown: scrollDown4 } = options_default.bar.volume;
var Volume = () => {
  const icons = {
    101: "\uDB81\uDD7E",
    66: "\uDB81\uDD7E",
    34: "\uDB81\uDD80",
    1: "\uDB81\uDD7F",
    0: "\uDB81\uDF5F"
  };
  const getIcon = () => {
    const icon = Utils.merge([audio.speaker.bind("is_muted"), audio.speaker.bind("volume")], (isMuted, vol) => {
      if (isMuted)
        return 0;
      const foundVol = [101, 66, 34, 1, 0].find((threshold) => threshold <= vol * 100);
      if (foundVol !== undefined) {
        return foundVol;
      }
      return 101;
    });
    return icon.as((i) => i !== undefined ? icons[i] : icons[101]);
  };
  const volIcn = Widget.Label({
    hexpand: true,
    label: getIcon(),
    class_name: "bar-button-icon volume txt-icon bar"
  });
  const volPct = Widget.Label({
    hexpand: true,
    label: audio.speaker.bind("volume").as((v) => `${Math.round(v * 100)}%`),
    class_name: "bar-button-label volume"
  });
  return {
    component: Widget.Box({
      hexpand: true,
      vexpand: true,
      className: Utils.merge([options_default.theme.bar.buttons.style.bind("value"), options_default.bar.volume.label.bind("value")], (style, showLabel) => {
        const styleMap = {
          default: "style1",
          split: "style2",
          wave: "style3",
          wave2: "style3"
        };
        return `volume-container ${styleMap[style]} ${!showLabel ? "no-label" : ""}`;
      }),
      children: options_default.bar.volume.label.bind("value").as((showLabel) => {
        if (showLabel) {
          return [volIcn, volPct];
        }
        return [volIcn];
      })
    }),
    isVisible: true,
    boxClass: "volume",
    props: {
      onPrimaryClick: (clicked, event) => {
        openMenu(clicked, event, "audiomenu");
      },
      setup: (self) => {
        self.hook(options_default.bar.scrollSpeed, () => {
          const throttledHandler = throttledScrollHandler(options_default.bar.scrollSpeed.value);
          self.on_secondary_click = (clicked, event) => {
            runAsyncCommand(rightClick5.value, { clicked, event });
          };
          self.on_middle_click = (clicked, event) => {
            runAsyncCommand(middleClick5.value, { clicked, event });
          };
          self.on_scroll_up = (clicked, event) => {
            throttledHandler(scrollUp4.value, { clicked, event });
          };
          self.on_scroll_down = (clicked, event) => {
            throttledHandler(scrollDown4.value, { clicked, event });
          };
        });
      }
    }
  };
};

// /home/antonio/.config/HyprPanel/modules/bar/network/index.ts
var network = await Service.import("network");
var {
  label: networkLabel,
  truncation: truncation2,
  truncation_size: truncation_size2,
  rightClick: rightClick6,
  middleClick: middleClick6,
  scrollDown: scrollDown5,
  scrollUp: scrollUp5
} = options_default.bar.network;
var Network = () => {
  return {
    component: Widget.Box({
      vpack: "fill",
      vexpand: true,
      className: Utils.merge([options_default.theme.bar.buttons.style.bind("value"), networkLabel.bind("value")], (style, showLabel) => {
        const styleMap = {
          default: "style1",
          split: "style2",
          wave: "style3",
          wave2: "style3"
        };
        return `network-container ${styleMap[style]}${!showLabel ? " no-label" : ""}`;
      }),
      children: [
        Widget.Icon({
          class_name: "bar-button-icon network-icon",
          icon: Utils.merge([network.bind("primary"), network.bind("wifi"), network.bind("wired")], (pmry, wfi, wrd) => {
            if (pmry === "wired") {
              return wrd.icon_name;
            }
            return wfi.icon_name;
          })
        }),
        Widget.Box({
          child: Utils.merge([
            network.bind("primary"),
            network.bind("wifi"),
            networkLabel.bind("value"),
            truncation2.bind("value"),
            truncation_size2.bind("value")
          ], (pmry, wfi, showLbl, trunc, tSize) => {
            if (!showLbl) {
              return Widget.Box();
            }
            if (pmry === "wired") {
              return Widget.Label({
                class_name: "bar-button-label network-label",
                label: "Wired".substring(0, tSize)
              });
            }
            return Widget.Label({
              class_name: "bar-button-label network-label",
              label: wfi.ssid ? `${trunc ? wfi.ssid.substring(0, tSize) : wfi.ssid}` : "--"
            });
          })
        })
      ]
    }),
    isVisible: true,
    boxClass: "network",
    props: {
      on_primary_click: (clicked, event) => {
        openMenu(clicked, event, "networkmenu");
      },
      setup: (self) => {
        self.hook(options_default.bar.scrollSpeed, () => {
          const throttledHandler = throttledScrollHandler(options_default.bar.scrollSpeed.value);
          self.on_secondary_click = (clicked, event) => {
            runAsyncCommand(rightClick6.value, { clicked, event });
          };
          self.on_middle_click = (clicked, event) => {
            runAsyncCommand(middleClick6.value, { clicked, event });
          };
          self.on_scroll_up = (clicked, event) => {
            throttledHandler(scrollUp5.value, { clicked, event });
          };
          self.on_scroll_down = (clicked, event) => {
            throttledHandler(scrollDown5.value, { clicked, event });
          };
        });
      }
    }
  };
};

// /home/antonio/.config/HyprPanel/modules/bar/bluetooth/index.ts
var bluetooth = await Service.import("bluetooth");
var { label, rightClick: rightClick7, middleClick: middleClick7, scrollDown: scrollDown6, scrollUp: scrollUp6 } = options_default.bar.bluetooth;
var Bluetooth = () => {
  const btIcon = Widget.Label({
    label: bluetooth.bind("enabled").as((v) => v ? "\uDB80\uDCAF" : "\uDB80\uDCB2"),
    class_name: "bar-button-icon bluetooth txt-icon bar"
  });
  const btText = Widget.Label({
    label: Utils.merge([bluetooth.bind("enabled"), bluetooth.bind("connected_devices")], (btEnabled, btDevices) => {
      return btEnabled && btDevices.length ? ` Connected (${btDevices.length})` : btEnabled ? "On" : "Off";
    }),
    class_name: "bar-button-label bluetooth"
  });
  return {
    component: Widget.Box({
      className: Utils.merge([options_default.theme.bar.buttons.style.bind("value"), label.bind("value")], (style, showLabel) => {
        const styleMap = {
          default: "style1",
          split: "style2",
          wave: "style3",
          wave2: "style3"
        };
        return `bluetooth-container ${styleMap[style]} ${!showLabel ? "no-label" : ""}`;
      }),
      children: options_default.bar.bluetooth.label.bind("value").as((showLabel) => {
        if (showLabel) {
          return [btIcon, btText];
        }
        return [btIcon];
      })
    }),
    isVisible: true,
    boxClass: "bluetooth",
    props: {
      setup: (self) => {
        self.hook(options_default.bar.scrollSpeed, () => {
          const throttledHandler = throttledScrollHandler(options_default.bar.scrollSpeed.value);
          self.on_secondary_click = (clicked, event) => {
            runAsyncCommand(rightClick7.value, { clicked, event });
          };
          self.on_middle_click = (clicked, event) => {
            runAsyncCommand(middleClick7.value, { clicked, event });
          };
          self.on_scroll_up = (clicked, event) => {
            throttledHandler(scrollUp6.value, { clicked, event });
          };
          self.on_scroll_down = (clicked, event) => {
            throttledHandler(scrollDown6.value, { clicked, event });
          };
        });
      },
      on_primary_click: (clicked, event) => {
        openMenu(clicked, event, "bluetoothmenu");
      }
    }
  };
};

// /home/antonio/.config/HyprPanel/modules/bar/battery/index.ts
var battery = await Service.import("battery");
var { label: show_label2, rightClick: rightClick8, middleClick: middleClick8, scrollUp: scrollUp7, scrollDown: scrollDown7 } = options_default.bar.battery;
var BatteryLabel = () => {
  const isVis = Variable(battery.available);
  const batIcon = Utils.merge([battery.bind("percent"), battery.bind("charging"), battery.bind("charged")], (batPercent, batCharging, batCharged) => {
    if (batCharged)
      return `battery-level-100-charged-symbolic`;
    else
      return `battery-level-${Math.floor(batPercent / 10) * 10}${batCharging ? "-charging" : ""}-symbolic`;
  });
  battery.connect("changed", ({ available }) => {
    isVis.value = available;
  });
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    return { hours, minutes };
  };
  const generateTooltip = (timeSeconds, isCharging, isCharged) => {
    if (isCharged) {
      return "Fully Charged!!!";
    }
    const { hours, minutes } = formatTime(timeSeconds);
    if (isCharging) {
      return `${hours} hours ${minutes} minutes until full`;
    } else {
      return `${hours} hours ${minutes} minutes left`;
    }
  };
  return {
    component: Widget.Box({
      className: Utils.merge([options_default.theme.bar.buttons.style.bind("value"), show_label2.bind("value")], (style, showLabel) => {
        const styleMap = {
          default: "style1",
          split: "style2",
          wave: "style3",
          wave2: "style3"
        };
        return `battery-container ${styleMap[style]} ${!showLabel ? "no-label" : ""}`;
      }),
      visible: battery.bind("available"),
      tooltip_text: battery.bind("time_remaining").as((t) => t.toString()),
      children: Utils.merge([battery.bind("available"), show_label2.bind("value")], (batAvail, showLabel) => {
        if (batAvail && showLabel) {
          return [
            Widget.Icon({
              class_name: "bar-button-icon battery",
              icon: batIcon
            }),
            Widget.Label({
              class_name: "bar-button-label battery",
              label: battery.bind("percent").as((p) => `${Math.floor(p)}%`)
            })
          ];
        } else if (batAvail && !showLabel) {
          return [
            Widget.Icon({
              class_name: "bar-button-icon battery",
              icon: batIcon
            })
          ];
        } else {
          return [];
        }
      }),
      setup: (self) => {
        self.hook(battery, () => {
          if (battery.available) {
            self.tooltip_text = generateTooltip(battery.time_remaining, battery.charging, battery.charged);
          }
        });
      }
    }),
    isVis,
    boxClass: "battery",
    props: {
      setup: (self) => {
        self.hook(options_default.bar.scrollSpeed, () => {
          const throttledHandler = throttledScrollHandler(options_default.bar.scrollSpeed.value);
          self.on_secondary_click = (clicked, event) => {
            runAsyncCommand(rightClick8.value, { clicked, event });
          };
          self.on_middle_click = (clicked, event) => {
            runAsyncCommand(middleClick8.value, { clicked, event });
          };
          self.on_scroll_up = (clicked, event) => {
            throttledHandler(scrollUp7.value, { clicked, event });
          };
          self.on_scroll_down = (clicked, event) => {
            throttledHandler(scrollDown7.value, { clicked, event });
          };
        });
      },
      onPrimaryClick: (clicked, event) => {
        openMenu(clicked, event, "energymenu");
      }
    }
  };
};

// /home/antonio/.config/HyprPanel/modules/bar/clock/index.ts
import GLib3 from "gi://GLib";
var { format, icon, showIcon, showTime, rightClick: rightClick9, middleClick: middleClick9, scrollUp: scrollUp8, scrollDown: scrollDown8 } = options_default.bar.clock;
var { style } = options_default.theme.bar.buttons;
var date = Variable(GLib3.DateTime.new_now_local(), {
  poll: [1000, () => GLib3.DateTime.new_now_local()]
});
var time = Utils.derive([date, format], (c, f) => c.format(f) || "");
var Clock = () => {
  const clockTime = Widget.Label({
    class_name: "bar-button-label clock bar",
    label: time.bind()
  });
  const clockIcon = Widget.Label({
    label: icon.bind("value"),
    class_name: "bar-button-icon clock txt-icon bar"
  });
  return {
    component: Widget.Box({
      className: Utils.merge([style.bind("value"), showIcon.bind("value"), showTime.bind("value")], (btnStyle, shwIcn, shwLbl) => {
        const styleMap = {
          default: "style1",
          split: "style2",
          wave: "style3",
          wave2: "style3"
        };
        return `clock-container ${styleMap[btnStyle]} ${!shwLbl ? "no-label" : ""} ${!shwIcn ? "no-icon" : ""}`;
      }),
      children: Utils.merge([showIcon.bind("value"), showTime.bind("value")], (shIcn, shTm) => {
        if (shIcn && !shTm) {
          return [clockIcon];
        } else if (shTm && !shIcn) {
          return [clockTime];
        }
        return [clockIcon, clockTime];
      })
    }),
    isVisible: true,
    boxClass: "clock",
    props: {
      setup: (self) => {
        self.hook(options_default.bar.scrollSpeed, () => {
          const throttledHandler = throttledScrollHandler(options_default.bar.scrollSpeed.value);
          self.on_secondary_click = (clicked, event) => {
            runAsyncCommand(rightClick9.value, { clicked, event });
          };
          self.on_middle_click = (clicked, event) => {
            runAsyncCommand(middleClick9.value, { clicked, event });
          };
          self.on_scroll_up = (clicked, event) => {
            throttledHandler(scrollUp8.value, { clicked, event });
          };
          self.on_scroll_down = (clicked, event) => {
            throttledHandler(scrollDown8.value, { clicked, event });
          };
        });
      },
      on_primary_click: (clicked, event) => {
        openMenu(clicked, event, "calendarmenu");
      }
    }
  };
};

// /home/antonio/.config/HyprPanel/modules/bar/systray/index.ts
var systemtray = await Service.import("systemtray");
var { ignore: ignore2 } = options_default.bar.systray;
var SysTray = () => {
  const isVis = Variable(false);
  const items = Utils.merge([systemtray.bind("items"), ignore2.bind("value")], (items2, ignored4) => {
    const filteredTray = items2.filter(({ id }) => !ignored4.includes(id));
    isVis.value = filteredTray.length > 0;
    return filteredTray.map((item) => {
      return Widget.Button({
        cursor: "pointer",
        child: Widget.Icon({
          class_name: "systray-icon",
          icon: item.bind("icon")
        }),
        on_primary_click: (_, event) => item.activate(event),
        on_secondary_click: (_, event) => item.openMenu(event),
        onMiddleClick: () => Notify({ summary: "App Name", body: item.id }),
        tooltip_markup: item.bind("tooltip_markup")
      });
    });
  });
  return {
    component: Widget.Box({
      class_name: "systray-container",
      children: items
    }),
    isVisible: true,
    boxClass: "systray",
    isVis,
    props: {}
  };
};

// /home/antonio/.config/HyprPanel/customModules/module.ts
var { style: style2 } = options_default.theme.bar.buttons;
var undefinedVar = Variable(undefined);
var module = ({
  icon: icon2,
  textIcon,
  label: label2,
  tooltipText,
  boxClass,
  props = {},
  showLabelBinding = undefinedVar.bind("value"),
  showLabel,
  labelHook,
  hook
}) => {
  const getIconWidget = () => {
    let iconWidget;
    if (icon2 !== undefined) {
      iconWidget = Widget.Icon({
        class_name: `txt-icon bar-button-icon module-icon ${boxClass}`,
        icon: icon2
      });
    } else if (textIcon !== undefined) {
      iconWidget = Widget.Label({
        class_name: `txt-icon bar-button-icon module-icon ${boxClass}`,
        label: textIcon
      });
    }
    return iconWidget;
  };
  return {
    component: Widget.Box({
      className: Utils.merge([style2.bind("value"), showLabelBinding], (style3, shwLabel) => {
        const shouldShowLabel = shwLabel || showLabel;
        const styleMap = {
          default: "style1",
          split: "style2",
          wave: "style3",
          wave2: "style3"
        };
        return `${boxClass} ${styleMap[style3]} ${!shouldShowLabel ? "no-label" : ""}`;
      }),
      tooltip_text: tooltipText,
      children: Utils.merge([showLabelBinding], (showLabelBinding2) => {
        const childrenArray = [];
        const iconWidget = getIconWidget();
        if (iconWidget !== undefined) {
          childrenArray.push(iconWidget);
        }
        if (showLabelBinding2) {
          childrenArray.push(Widget.Label({
            class_name: `bar-button-label module-label ${boxClass}`,
            label: label2,
            setup: labelHook
          }));
        }
        return childrenArray;
      }),
      setup: hook
    }),
    tooltip_text: tooltipText,
    isVisible: true,
    boxClass,
    props
  };
};

// /home/antonio/.config/HyprPanel/customModules/ram/computeRam.ts
var GLib4 = imports.gi.GLib;
var calculateRamUsage = (round) => {
  try {
    const [success, meminfoBytes] = GLib4.file_get_contents("/proc/meminfo");
    if (!success || !meminfoBytes) {
      throw new Error("Failed to read /proc/meminfo or file content is null.");
    }
    const meminfo = new TextDecoder("utf-8").decode(meminfoBytes);
    const totalMatch = meminfo.match(/MemTotal:\s+(\d+)/);
    const availableMatch = meminfo.match(/MemAvailable:\s+(\d+)/);
    if (!totalMatch || !availableMatch) {
      throw new Error("Failed to parse /proc/meminfo for memory values.");
    }
    const totalRamInBytes = parseInt(totalMatch[1], 10) * 1024;
    const availableRamInBytes = parseInt(availableMatch[1], 10) * 1024;
    let usedRam = totalRamInBytes - availableRamInBytes;
    usedRam = isNaN(usedRam) || usedRam < 0 ? 0 : usedRam;
    return {
      percentage: divide([totalRamInBytes, usedRam], round.value),
      total: totalRamInBytes,
      used: usedRam,
      free: availableRamInBytes
    };
  } catch (error) {
    console.error("Error calculating RAM usage:", error);
    return { total: 0, used: 0, percentage: 0, free: 0 };
  }
};

// /home/antonio/.config/HyprPanel/lib/types/defaults/bar.ts
var LABEL_TYPES = ["used/total", "used", "free", "percentage"];
var NETWORK_LABEL_TYPES = ["full", "in", "out"];

// /home/antonio/.config/HyprPanel/customModules/PollVar.ts
import GLib5 from "gi://GLib?version=2.0";
var pollVariable = (targetVariable, trackers, pollingInterval, someFunc, ...params) => {
  let intervalInstance = null;
  const intervalFn = (pollIntrvl) => {
    if (intervalInstance !== null) {
      GLib5.source_remove(intervalInstance);
    }
    intervalInstance = Utils.interval(pollIntrvl, () => {
      targetVariable.value = someFunc(...params);
    });
  };
  Utils.merge([pollingInterval, ...trackers], (pollIntrvl) => {
    intervalFn(pollIntrvl);
  });
};
var pollVariableBash = (targetVariable, trackers, pollingInterval, someCommand, someFunc, ...params) => {
  let intervalInstance = null;
  const intervalFn = (pollIntrvl) => {
    if (intervalInstance !== null) {
      GLib5.source_remove(intervalInstance);
    }
    intervalInstance = Utils.interval(pollIntrvl, () => {
      Utils.execAsync(`bash -c "${someCommand}"`).then((res) => {
        try {
          targetVariable.value = someFunc(res, ...params);
        } catch (error) {
          console.warn(`An error occurred when running interval bash function: ${error}`);
        }
      }).catch((err) => console.error(`Error running command "${someCommand}": ${err}`));
    });
  };
  Utils.merge([pollingInterval, ...trackers], (pollIntrvl) => {
    intervalFn(pollIntrvl);
  });
};

// /home/antonio/.config/HyprPanel/customModules/ram/index.ts
var { label: label2, labelType, round, leftClick: leftClick2, rightClick: rightClick10, middleClick: middleClick10, pollingInterval } = options_default.bar.customModules.ram;
var defaultRamData = { total: 0, used: 0, percentage: 0, free: 0 };
var ramUsage = Variable(defaultRamData);
pollVariable(ramUsage, [round.bind("value")], pollingInterval.bind("value"), calculateRamUsage, round);
var Ram = () => {
  const ramModule = module({
    textIcon: "\uEFC5",
    label: Utils.merge([ramUsage.bind("value"), labelType.bind("value"), round.bind("value")], (rmUsg, lblTyp, round2) => {
      const returnValue = renderResourceLabel(lblTyp, rmUsg, round2);
      return returnValue;
    }),
    tooltipText: labelType.bind("value").as((lblTyp) => {
      return formatTooltip("RAM", lblTyp);
    }),
    boxClass: "ram",
    showLabelBinding: label2.bind("value"),
    props: {
      setup: (self) => {
        inputHandler(self, {
          onPrimaryClick: {
            cmd: leftClick2
          },
          onSecondaryClick: {
            cmd: rightClick10
          },
          onMiddleClick: {
            cmd: middleClick10
          },
          onScrollUp: {
            fn: () => {
              labelType.value = LABEL_TYPES[(LABEL_TYPES.indexOf(labelType.value) + 1) % LABEL_TYPES.length];
            }
          },
          onScrollDown: {
            fn: () => {
              labelType.value = LABEL_TYPES[(LABEL_TYPES.indexOf(labelType.value) - 1 + LABEL_TYPES.length) % LABEL_TYPES.length];
            }
          }
        });
      }
    }
  });
  return ramModule;
};

// /home/antonio/.config/HyprPanel/customModules/cpu/computeCPU.ts
import GTop from "gi://GTop";
var previousCpuData = new GTop.glibtop_cpu;
GTop.glibtop_get_cpu(previousCpuData);
var computeCPU = () => {
  const currentCpuData = new GTop.glibtop_cpu;
  GTop.glibtop_get_cpu(currentCpuData);
  const totalDiff = currentCpuData.total - previousCpuData.total;
  const idleDiff = currentCpuData.idle - previousCpuData.idle;
  const cpuUsagePercentage = totalDiff > 0 ? (totalDiff - idleDiff) / totalDiff * 100 : 0;
  previousCpuData = currentCpuData;
  return cpuUsagePercentage;
};

// /home/antonio/.config/HyprPanel/customModules/cpu/index.ts
var { label: label3, round: round2, leftClick: leftClick3, rightClick: rightClick11, middleClick: middleClick11, scrollUp: scrollUp9, scrollDown: scrollDown9, pollingInterval: pollingInterval2 } = options_default.bar.customModules.cpu;
var cpuUsage = Variable(0);
pollVariable(cpuUsage, [round2.bind("value")], pollingInterval2.bind("value"), computeCPU);
var Cpu = () => {
  const renderLabel2 = (cpuUsg, rnd) => {
    return rnd ? `${Math.round(cpuUsg)}%` : `${cpuUsg.toFixed(2)}%`;
  };
  const cpuModule = module({
    textIcon: "\uF4BC",
    label: Utils.merge([cpuUsage.bind("value"), round2.bind("value")], (cpuUsg, rnd) => {
      return renderLabel2(cpuUsg, rnd);
    }),
    tooltipText: "CPU",
    boxClass: "cpu",
    showLabelBinding: label3.bind("value"),
    props: {
      setup: (self) => {
        inputHandler(self, {
          onPrimaryClick: {
            cmd: leftClick3
          },
          onSecondaryClick: {
            cmd: rightClick11
          },
          onMiddleClick: {
            cmd: middleClick11
          },
          onScrollUp: {
            cmd: scrollUp9
          },
          onScrollDown: {
            cmd: scrollDown9
          }
        });
      }
    }
  });
  return cpuModule;
};

// /home/antonio/.config/HyprPanel/customModules/storage/computeStorage.ts
import GTop2 from "gi://GTop";
var computeStorage = (round3) => {
  try {
    const currentFsUsage = new GTop2.glibtop_fsusage;
    GTop2.glibtop_get_fsusage(currentFsUsage, "/");
    const total = currentFsUsage.blocks * currentFsUsage.block_size;
    const available = currentFsUsage.bavail * currentFsUsage.block_size;
    const used = total - available;
    return {
      total,
      used,
      free: available,
      percentage: divide([total, used], round3.value)
    };
  } catch (error) {
    console.error("Error calculating RAM usage:", error);
    return { total: 0, used: 0, percentage: 0, free: 0 };
  }
};

// /home/antonio/.config/HyprPanel/customModules/storage/index.ts
var { label: label4, labelType: labelType2, icon: icon2, round: round3, leftClick: leftClick4, rightClick: rightClick12, middleClick: middleClick12, pollingInterval: pollingInterval3 } = options_default.bar.customModules.storage;
var defaultStorageData = { total: 0, used: 0, percentage: 0, free: 0 };
var storageUsage = Variable(defaultStorageData);
pollVariable(storageUsage, [round3.bind("value")], pollingInterval3.bind("value"), computeStorage, round3);
var Storage = () => {
  const storageModule = module({
    textIcon: icon2.bind("value"),
    label: Utils.merge([storageUsage.bind("value"), labelType2.bind("value"), round3.bind("value")], (storage, lblTyp, round4) => {
      return renderResourceLabel(lblTyp, storage, round4);
    }),
    tooltipText: labelType2.bind("value").as((lblTyp) => {
      return formatTooltip("Storage", lblTyp);
    }),
    boxClass: "storage",
    showLabelBinding: label4.bind("value"),
    props: {
      setup: (self) => {
        inputHandler(self, {
          onPrimaryClick: {
            cmd: leftClick4
          },
          onSecondaryClick: {
            cmd: rightClick12
          },
          onMiddleClick: {
            cmd: middleClick12
          },
          onScrollUp: {
            fn: () => {
              labelType2.value = LABEL_TYPES[(LABEL_TYPES.indexOf(labelType2.value) + 1) % LABEL_TYPES.length];
            }
          },
          onScrollDown: {
            fn: () => {
              labelType2.value = LABEL_TYPES[(LABEL_TYPES.indexOf(labelType2.value) - 1 + LABEL_TYPES.length) % LABEL_TYPES.length];
            }
          }
        });
      }
    }
  });
  return storageModule;
};

// /home/antonio/.config/HyprPanel/customModules/netstat/computeNetwork.ts
import GLib6 from "gi://GLib";

// /home/antonio/.config/HyprPanel/lib/types/defaults/netstat.ts
var GET_DEFAULT_NETSTAT_DATA = (dataType) => {
  if (dataType === "auto") {
    return { in: `0 Kib/s`, out: `0 Kib/s` };
  }
  return { in: `0 ${dataType}/s`, out: `0 ${dataType}/s` };
};

// /home/antonio/.config/HyprPanel/customModules/netstat/computeNetwork.ts
var previousNetUsage = { rx: 0, tx: 0, time: 0 };
var formatRate = (rate, type, round4) => {
  const fixed = round4 ? 0 : 2;
  switch (true) {
    case type === "KiB":
      return `${(rate / 1000).toFixed(fixed)} KiB/s`;
    case type === "MiB":
      return `${(rate / 1e6).toFixed(fixed)} MiB/s`;
    case type === "GiB":
      return `${(rate / 1e9).toFixed(fixed)} GiB/s`;
    case rate >= 1e9:
      return `${(rate / 1e9).toFixed(fixed)} GiB/s`;
    case rate >= 1e6:
      return `${(rate / 1e6).toFixed(fixed)} MiB/s`;
    case rate >= 1000:
      return `${(rate / 1000).toFixed(fixed)} KiB/s`;
    default:
      return `${rate.toFixed(fixed)} bytes/s`;
  }
};
var parseInterfaceData = (line) => {
  const trimmedLine = line.trim();
  if (!trimmedLine || trimmedLine.startsWith("Inter-") || trimmedLine.startsWith("face")) {
    return null;
  }
  const [iface, rx, , , , , , , , tx] = trimmedLine.split(/\s+/);
  const rxValue = parseInt(rx, 10);
  const txValue = parseInt(tx, 10);
  const cleanedIface = iface.replace(":", "");
  return { name: cleanedIface, rx: rxValue, tx: txValue };
};
var isValidInterface = (iface, interfaceName) => {
  if (!iface)
    return false;
  if (interfaceName)
    return iface.name === interfaceName;
  return iface.name !== "lo" && iface.rx > 0 && iface.tx > 0;
};
var getNetworkUsage = (interfaceName = "") => {
  const [success, data] = GLib6.file_get_contents("/proc/net/dev");
  if (!success) {
    console.error("Failed to read /proc/net/dev");
    return { name: "", rx: 0, tx: 0 };
  }
  const lines = new TextDecoder("utf-8").decode(data).split("\n");
  for (const line of lines) {
    const iface = parseInterfaceData(line);
    if (isValidInterface(iface, interfaceName)) {
      return iface;
    }
  }
  return { name: "", rx: 0, tx: 0 };
};
var computeNetwork = (round4, interfaceNameVar, dataType) => {
  const rateUnit = dataType.value;
  const interfaceName = interfaceNameVar ? interfaceNameVar.value : "";
  const DEFAULT_NETSTAT_DATA = GET_DEFAULT_NETSTAT_DATA(rateUnit);
  try {
    const { rx, tx, name } = getNetworkUsage(interfaceName);
    const currentTime = Date.now();
    if (!name) {
      return DEFAULT_NETSTAT_DATA;
    }
    if (previousNetUsage.time === 0) {
      previousNetUsage = { rx, tx, time: currentTime };
      return DEFAULT_NETSTAT_DATA;
    }
    const timeDiff = Math.max((currentTime - previousNetUsage.time) / 1000, 1);
    const rxRate = (rx - previousNetUsage.rx) / timeDiff;
    const txRate = (tx - previousNetUsage.tx) / timeDiff;
    previousNetUsage = { rx, tx, time: currentTime };
    return {
      in: formatRate(rxRate, rateUnit, round4.value),
      out: formatRate(txRate, rateUnit, round4.value)
    };
  } catch (error) {
    console.error("Error calculating network usage:", error);
    return DEFAULT_NETSTAT_DATA;
  }
};

// /home/antonio/.config/HyprPanel/customModules/netstat/index.ts
var {
  label: label5,
  labelType: labelType3,
  networkInterface,
  rateUnit,
  icon: icon3,
  round: round4,
  leftClick: leftClick5,
  rightClick: rightClick13,
  middleClick: middleClick13,
  pollingInterval: pollingInterval4
} = options_default.bar.customModules.netstat;
var networkUsage = Variable(GET_DEFAULT_NETSTAT_DATA(rateUnit.value));
pollVariable(networkUsage, [rateUnit.bind("value"), networkInterface.bind("value"), round4.bind("value")], pollingInterval4.bind("value"), computeNetwork, round4, networkInterface, rateUnit);
var Netstat = () => {
  const renderNetworkLabel = (lblType, network2) => {
    switch (lblType) {
      case "in":
        return `\u2193 ${network2.in}`;
      case "out":
        return `\u2191 ${network2.out}`;
      default:
        return `\u2193 ${network2.in} \u2191 ${network2.out}`;
    }
  };
  const netstatModule = module({
    textIcon: icon3.bind("value"),
    label: Utils.merge([networkUsage.bind("value"), labelType3.bind("value")], (network2, lblTyp) => renderNetworkLabel(lblTyp, network2)),
    tooltipText: labelType3.bind("value").as((lblTyp) => {
      return lblTyp === "full" ? "Ingress / Egress" : lblTyp === "in" ? "Ingress" : "Egress";
    }),
    boxClass: "netstat",
    showLabelBinding: label5.bind("value"),
    props: {
      setup: (self) => {
        inputHandler(self, {
          onPrimaryClick: {
            cmd: leftClick5
          },
          onSecondaryClick: {
            cmd: rightClick13
          },
          onMiddleClick: {
            cmd: middleClick13
          },
          onScrollUp: {
            fn: () => {
              labelType3.value = NETWORK_LABEL_TYPES[(NETWORK_LABEL_TYPES.indexOf(labelType3.value) + 1) % NETWORK_LABEL_TYPES.length];
            }
          },
          onScrollDown: {
            fn: () => {
              labelType3.value = NETWORK_LABEL_TYPES[(NETWORK_LABEL_TYPES.indexOf(labelType3.value) - 1 + NETWORK_LABEL_TYPES.length) % NETWORK_LABEL_TYPES.length];
            }
          }
        });
      }
    }
  });
  return netstatModule;
};

// /home/antonio/.config/HyprPanel/customModules/kblayout/layouts.ts
var layoutMap = {
  "Abkhazian (Russia)": "RU (Ab)",
  Akan: "GH (Akan)",
  Albanian: "AL",
  "Albanian (Plisi)": "AL (Plisi)",
  "Albanian (Veqilharxhi)": "AL (Veqilharxhi)",
  Amharic: "ET",
  Arabic: "ARA",
  "Arabic (Algeria)": "DZ (Ar)",
  "Arabic (AZERTY, Eastern Arabic numerals)": "ARA (Azerty Digits)",
  "Arabic (AZERTY)": "ARA (Azerty)",
  "Arabic (Buckwalter)": "ARA (Buckwalter)",
  "Arabic (Eastern Arabic numerals)": "ARA (Digits)",
  "Arabic (Macintosh)": "ARA (Mac)",
  "Arabic (Morocco)": "MA",
  "Arabic (OLPC)": "ARA (Olpc)",
  "Arabic (Pakistan)": "PK (Ara)",
  "Arabic (QWERTY, Eastern Arabic numerals)": "ARA (Qwerty Digits)",
  "Arabic (QWERTY)": "ARA (Qwerty)",
  "Arabic (Syria)": "SY",
  Armenian: "AM",
  "Armenian (alt. eastern)": "AM (Eastern-Alt)",
  "Armenian (alt. phonetic)": "AM (Phonetic-Alt)",
  "Armenian (eastern)": "AM (Eastern)",
  "Armenian (phonetic)": "AM (Phonetic)",
  "Armenian (western)": "AM (Western)",
  "Asturian (Spain, with bottom-dot H and L)": "ES (Ast)",
  Avatime: "GH (Avn)",
  Azerbaijani: "AZ",
  "Azerbaijani (Cyrillic)": "AZ (Cyrillic)",
  "Azerbaijani (Iran)": "IR (Azb)",
  Bambara: "ML",
  Bangla: "BD",
  "Bangla (India, Baishakhi InScript)": "IN (Ben Inscript)",
  "Bangla (India, Baishakhi)": "IN (Ben Baishakhi)",
  "Bangla (India, Bornona)": "IN (Ben Bornona)",
  "Bangla (India, Gitanjali)": "IN (Ben Gitanjali)",
  "Bangla (India, Probhat)": "IN (Ben Probhat)",
  "Bangla (India)": "IN (Ben)",
  "Bangla (Probhat)": "BD (Probhat)",
  Bashkirian: "RU (Bak)",
  Belarusian: "BY",
  "Belarusian (intl.)": "BY (Intl)",
  "Belarusian (Latin)": "BY (Latin)",
  "Belarusian (legacy)": "BY (Legacy)",
  "Belarusian (phonetic)": "BY (Phonetic)",
  Belgian: "BE",
  "Belgian (alt.)": "BE (Oss)",
  "Belgian (ISO, alt.)": "BE (Iso-Alternate)",
  "Belgian (Latin-9 only, alt.)": "BE (Oss Latin9)",
  "Belgian (no dead keys)": "BE (Nodeadkeys)",
  "Belgian (Wang 724 AZERTY)": "BE (Wang)",
  "Berber (Algeria, Latin)": "DZ",
  "Berber (Algeria, Tifinagh)": "DZ (Ber)",
  "Berber (Morocco, Tifinagh alt.)": "MA (Tifinagh-Alt)",
  "Berber (Morocco, Tifinagh extended phonetic)": "MA (Tifinagh-Extended-Phonetic)",
  "Berber (Morocco, Tifinagh extended)": "MA (Tifinagh-Extended)",
  "Berber (Morocco, Tifinagh phonetic, alt.)": "MA (Tifinagh-Alt-Phonetic)",
  "Berber (Morocco, Tifinagh phonetic)": "MA (Tifinagh-Phonetic)",
  "Berber (Morocco, Tifinagh)": "MA (Tifinagh)",
  Bosnian: "BA",
  "Bosnian (US, with Bosnian digraphs)": "BA (Unicodeus)",
  "Bosnian (US)": "BA (Us)",
  "Bosnian (with Bosnian digraphs)": "BA (Unicode)",
  "Bosnian (with guillemets)": "BA (Alternatequotes)",
  Braille: "BRAI",
  "Braille (left-handed inverted thumb)": "BRAI (Left Hand Invert)",
  "Braille (left-handed)": "BRAI (Left Hand)",
  "Braille (right-handed inverted thumb)": "BRAI (Right Hand Invert)",
  "Braille (right-handed)": "BRAI (Right Hand)",
  "Breton (France)": "FR (Bre)",
  Bulgarian: "BG",
  "Bulgarian (enhanced)": "BG (Bekl)",
  "Bulgarian (new phonetic)": "BG (Bas Phonetic)",
  "Bulgarian (traditional phonetic)": "BG (Phonetic)",
  Burmese: "MM",
  "Burmese Zawgyi": "MM (Zawgyi)",
  "Cameroon (AZERTY, intl.)": "CM (Azerty)",
  "Cameroon (Dvorak, intl.)": "CM (Dvorak)",
  "Cameroon Multilingual (QWERTY, intl.)": "CM (Qwerty)",
  "Canadian (CSA)": "CA (Multix)",
  "Catalan (Spain, with middle-dot L)": "ES (Cat)",
  Cherokee: "US (Chr)",
  Chinese: "CN",
  Chuvash: "RU (Cv)",
  "Chuvash (Latin)": "RU (Cv Latin)",
  CloGaelach: "IE (CloGaelach)",
  "Crimean Tatar (Turkish Alt-Q)": "UA (Crh Alt)",
  "Crimean Tatar (Turkish F)": "UA (Crh F)",
  "Crimean Tatar (Turkish Q)": "UA (Crh)",
  Croatian: "HR",
  "Croatian (US, with Croatian digraphs)": "HR (Unicodeus)",
  "Croatian (US)": "HR (Us)",
  "Croatian (with Croatian digraphs)": "HR (Unicode)",
  "Croatian (with guillemets)": "HR (Alternatequotes)",
  Czech: "CZ",
  "Czech (QWERTY, extended backslash)": "CZ (Qwerty Bksl)",
  "Czech (QWERTY, Macintosh)": "CZ (Qwerty-Mac)",
  "Czech (QWERTY)": "CZ (Qwerty)",
  "Czech (UCW, only accented letters)": "CZ (Ucw)",
  "Czech (US, Dvorak, UCW support)": "CZ (Dvorak-Ucw)",
  "Czech (with <\\|> key)": "CZ (Bksl)",
  Danish: "DK",
  "Danish (Dvorak)": "DK (Dvorak)",
  "Danish (Macintosh, no dead keys)": "DK (Mac Nodeadkeys)",
  "Danish (Macintosh)": "DK (Mac)",
  "Danish (no dead keys)": "DK (Nodeadkeys)",
  "Danish (Windows)": "DK (Winkeys)",
  Dari: "AF",
  "Dari (Afghanistan, OLPC)": "AF (Fa-Olpc)",
  Dhivehi: "MV",
  Dutch: "NL",
  "Dutch (Macintosh)": "NL (Mac)",
  "Dutch (standard)": "NL (Std)",
  "Dutch (US)": "NL (Us)",
  Dzongkha: "BT",
  "English (Australian)": "AU",
  "English (Cameroon)": "CM",
  "English (Canada)": "CA (Eng)",
  "English (classic Dvorak)": "US (Dvorak-Classic)",
  "English (Colemak-DH ISO)": "US (Colemak Dh Iso)",
  "English (Colemak-DH)": "US (Colemak Dh)",
  "English (Colemak)": "US (Colemak)",
  "English (Dvorak, alt. intl.)": "US (Dvorak-Alt-Intl)",
  "English (Dvorak, intl., with dead keys)": "US (Dvorak-Intl)",
  "English (Dvorak, left-handed)": "US (Dvorak-L)",
  "English (Dvorak, Macintosh)": "US (Dvorak-Mac)",
  "English (Dvorak, right-handed)": "US (Dvorak-R)",
  "English (Dvorak)": "US (Dvorak)",
  "English (Ghana, GILLBT)": "GH (Gillbt)",
  "English (Ghana, multilingual)": "GH (Generic)",
  "English (Ghana)": "GH",
  "English (India, with rupee)": "IN (Eng)",
  "English (intl., with AltGr dead keys)": "US (Altgr-Intl)",
  "English (Macintosh)": "US (Mac)",
  "English (Mali, US, intl.)": "ML (Us-Intl)",
  "English (Mali, US, Macintosh)": "ML (Us-Mac)",
  "English (Nigeria)": "NG",
  "English (Norman)": "US (Norman)",
  "English (programmer Dvorak)": "US (Dvp)",
  "English (South Africa)": "ZA",
  "English (the divide/multiply toggle the layout)": "US (Olpc2)",
  "English (UK, Colemak-DH)": "GB (Colemak Dh)",
  "English (UK, Colemak)": "GB (Colemak)",
  "English (UK, Dvorak, with UK punctuation)": "GB (Dvorakukp)",
  "English (UK, Dvorak)": "GB (Dvorak)",
  "English (UK, extended, Windows)": "GB (Extd)",
  "English (UK, intl., with dead keys)": "GB (Intl)",
  "English (UK, Macintosh, intl.)": "GB (Mac Intl)",
  "English (UK, Macintosh)": "GB (Mac)",
  "English (UK)": "GB",
  "English (US, alt. intl.)": "US (Alt-Intl)",
  "English (US, euro on 5)": "US (Euro)",
  "English (US, intl., with dead keys)": "US (Intl)",
  "English (US, Symbolic)": "US (Symbolic)",
  "English (US)": "US",
  "English (Workman, intl., with dead keys)": "US (Workman-Intl)",
  "English (Workman)": "US (Workman)",
  Esperanto: "EPO",
  "Esperanto (Brazil, Nativo)": "BR (Nativo-Epo)",
  "Esperanto (legacy)": "EPO (Legacy)",
  "Esperanto (Portugal, Nativo)": "PT (Nativo-Epo)",
  Estonian: "EE",
  "Estonian (Dvorak)": "EE (Dvorak)",
  "Estonian (no dead keys)": "EE (Nodeadkeys)",
  "Estonian (US)": "EE (Us)",
  Ewe: "GH (Ewe)",
  Faroese: "FO",
  "Faroese (no dead keys)": "FO (Nodeadkeys)",
  Filipino: "PH",
  "Filipino (Capewell-Dvorak, Baybayin)": "PH (Capewell-Dvorak-Bay)",
  "Filipino (Capewell-Dvorak, Latin)": "PH (Capewell-Dvorak)",
  "Filipino (Capewell-QWERF 2006, Baybayin)": "PH (Capewell-Qwerf2k6-Bay)",
  "Filipino (Capewell-QWERF 2006, Latin)": "PH (Capewell-Qwerf2k6)",
  "Filipino (Colemak, Baybayin)": "PH (Colemak-Bay)",
  "Filipino (Colemak, Latin)": "PH (Colemak)",
  "Filipino (Dvorak, Baybayin)": "PH (Dvorak-Bay)",
  "Filipino (Dvorak, Latin)": "PH (Dvorak)",
  "Filipino (QWERTY, Baybayin)": "PH (Qwerty-Bay)",
  Finnish: "FI",
  "Finnish (classic, no dead keys)": "FI (Nodeadkeys)",
  "Finnish (classic)": "FI (Classic)",
  "Finnish (Macintosh)": "FI (Mac)",
  "Finnish (Windows)": "FI (Winkeys)",
  French: "FR",
  "French (alt., Latin-9 only)": "FR (Oss Latin9)",
  "French (alt., no dead keys)": "FR (Oss Nodeadkeys)",
  "French (alt.)": "FR (Oss)",
  "French (AZERTY, AFNOR)": "FR (Afnor)",
  "French (AZERTY)": "FR (Azerty)",
  "French (BEPO, AFNOR)": "FR (Bepo Afnor)",
  "French (BEPO, Latin-9 only)": "FR (Bepo Latin9)",
  "French (BEPO)": "FR (Bepo)",
  "French (Cameroon)": "CM (French)",
  "French (Canada, Dvorak)": "CA (Fr-Dvorak)",
  "French (Canada, legacy)": "CA (Fr-Legacy)",
  "French (Canada)": "CA",
  "French (Democratic Republic of the Congo)": "CD",
  "French (Dvorak)": "FR (Dvorak)",
  "French (legacy, alt., no dead keys)": "FR (Latin9 Nodeadkeys)",
  "French (legacy, alt.)": "FR (Latin9)",
  "French (Macintosh)": "FR (Mac)",
  "French (Mali, alt.)": "ML (Fr-Oss)",
  "French (Morocco)": "MA (French)",
  "French (no dead keys)": "FR (Nodeadkeys)",
  "French (Switzerland, Macintosh)": "CH (Fr Mac)",
  "French (Switzerland, no dead keys)": "CH (Fr Nodeadkeys)",
  "French (Switzerland)": "CH (Fr)",
  "French (Togo)": "TG",
  "French (US)": "FR (Us)",
  "Friulian (Italy)": "IT (Fur)",
  Fula: "GH (Fula)",
  Ga: "GH (Ga)",
  Georgian: "GE",
  "Georgian (ergonomic)": "GE (Ergonomic)",
  "Georgian (France, AZERTY Tskapo)": "FR (Geo)",
  "Georgian (Italy)": "IT (Geo)",
  "Georgian (MESS)": "GE (Mess)",
  German: "DE",
  "German (Austria, Macintosh)": "AT (Mac)",
  "German (Austria, no dead keys)": "AT (Nodeadkeys)",
  "German (Austria)": "AT",
  "German (dead acute)": "DE (Deadacute)",
  "German (dead grave acute)": "DE (Deadgraveacute)",
  "German (dead tilde)": "DE (Deadtilde)",
  "German (Dvorak)": "DE (Dvorak)",
  "German (E1)": "DE (E1)",
  "German (E2)": "DE (E2)",
  "German (Macintosh, no dead keys)": "DE (Mac Nodeadkeys)",
  "German (Macintosh)": "DE (Mac)",
  "German (Neo 2)": "DE (Neo)",
  "German (no dead keys)": "DE (Nodeadkeys)",
  "German (QWERTY)": "DE (Qwerty)",
  "German (Switzerland, legacy)": "CH (Legacy)",
  "German (Switzerland, Macintosh)": "CH (De Mac)",
  "German (Switzerland, no dead keys)": "CH (De Nodeadkeys)",
  "German (Switzerland)": "CH",
  "German (T3)": "DE (T3)",
  "German (US)": "DE (Us)",
  Greek: "GR",
  "Greek (extended)": "GR (Extended)",
  "Greek (no dead keys)": "GR (Nodeadkeys)",
  "Greek (polytonic)": "GR (Polytonic)",
  "Greek (simple)": "GR (Simple)",
  Gujarati: "IN (Guj)",
  "Hanyu Pinyin Letters (with AltGr dead keys)": "CN (Altgr-Pinyin)",
  "Hausa (Ghana)": "GH (Hausa)",
  "Hausa (Nigeria)": "NG (Hausa)",
  Hawaiian: "US (Haw)",
  Hebrew: "IL",
  "Hebrew (Biblical, Tiro)": "IL (Biblical)",
  "Hebrew (lyx)": "IL (Lyx)",
  "Hebrew (phonetic)": "IL (Phonetic)",
  "Hindi (Bolnagri)": "IN (Bolnagri)",
  "Hindi (KaGaPa, phonetic)": "IN (Hin-Kagapa)",
  "Hindi (Wx)": "IN (Hin-Wx)",
  Hungarian: "HU",
  "Hungarian (no dead keys)": "HU (Nodeadkeys)",
  "Hungarian (QWERTY, 101-key, comma, dead keys)": "HU (101 Qwerty Comma Dead)",
  "Hungarian (QWERTY, 101-key, comma, no dead keys)": "HU (101 Qwerty Comma Nodead)",
  "Hungarian (QWERTY, 101-key, dot, dead keys)": "HU (101 Qwerty Dot Dead)",
  "Hungarian (QWERTY, 101-key, dot, no dead keys)": "HU (101 Qwerty Dot Nodead)",
  "Hungarian (QWERTY, 102-key, comma, dead keys)": "HU (102 Qwerty Comma Dead)",
  "Hungarian (QWERTY, 102-key, comma, no dead keys)": "HU (102 Qwerty Comma Nodead)",
  "Hungarian (QWERTY, 102-key, dot, dead keys)": "HU (102 Qwerty Dot Dead)",
  "Hungarian (QWERTY, 102-key, dot, no dead keys)": "HU (102 Qwerty Dot Nodead)",
  "Hungarian (QWERTY)": "HU (Qwerty)",
  "Hungarian (QWERTZ, 101-key, comma, dead keys)": "HU (101 Qwertz Comma Dead)",
  "Hungarian (QWERTZ, 101-key, comma, no dead keys)": "HU (101 Qwertz Comma Nodead)",
  "Hungarian (QWERTZ, 101-key, dot, dead keys)": "HU (101 Qwertz Dot Dead)",
  "Hungarian (QWERTZ, 101-key, dot, no dead keys)": "HU (101 Qwertz Dot Nodead)",
  "Hungarian (QWERTZ, 102-key, comma, dead keys)": "HU (102 Qwertz Comma Dead)",
  "Hungarian (QWERTZ, 102-key, comma, no dead keys)": "HU (102 Qwertz Comma Nodead)",
  "Hungarian (QWERTZ, 102-key, dot, dead keys)": "HU (102 Qwertz Dot Dead)",
  "Hungarian (QWERTZ, 102-key, dot, no dead keys)": "HU (102 Qwertz Dot Nodead)",
  "Hungarian (standard)": "HU (Standard)",
  Icelandic: "IS",
  "Icelandic (Dvorak)": "IS (Dvorak)",
  "Icelandic (Macintosh, legacy)": "IS (Mac Legacy)",
  "Icelandic (Macintosh)": "IS (Mac)",
  Igbo: "NG (Igbo)",
  Indian: "IN",
  "Indic IPA": "IN (Iipa)",
  "Indonesian (Arab Melayu, extended phonetic)": "ID (Melayu-Phoneticx)",
  "Indonesian (Arab Melayu, phonetic)": "ID (Melayu-Phonetic)",
  "Indonesian (Arab Pegon, phonetic)": "ID (Pegon-Phonetic)",
  "Indonesian (Latin)": "ID",
  Inuktitut: "CA (Ike)",
  Iraqi: "IQ",
  Irish: "IE",
  "Irish (UnicodeExpert)": "IE (UnicodeExpert)",
  Italian: "IT",
  "Italian (IBM 142)": "IT (Ibm)",
  "Italian (intl., with dead keys)": "IT (Intl)",
  "Italian (Macintosh)": "IT (Mac)",
  "Italian (no dead keys)": "IT (Nodeadkeys)",
  "Italian (US)": "IT (Us)",
  "Italian (Windows)": "IT (Winkeys)",
  Japanese: "JP",
  "Japanese (Dvorak)": "JP (Dvorak)",
  "Japanese (Kana 86)": "JP (Kana86)",
  "Japanese (Kana)": "JP (Kana)",
  "Japanese (Macintosh)": "JP (Mac)",
  "Japanese (OADG 109A)": "JP (OADG109A)",
  Javanese: "ID (Javanese)",
  "Kabyle (AZERTY, with dead keys)": "DZ (Azerty-Deadkeys)",
  "Kabyle (QWERTY, UK, with dead keys)": "DZ (Qwerty-Gb-Deadkeys)",
  "Kabyle (QWERTY, US, with dead keys)": "DZ (Qwerty-Us-Deadkeys)",
  Kalmyk: "RU (Xal)",
  Kannada: "IN (Kan)",
  "Kannada (KaGaPa, phonetic)": "IN (Kan-Kagapa)",
  Kashubian: "PL (Csb)",
  Kazakh: "KZ",
  "Kazakh (extended)": "KZ (Ext)",
  "Kazakh (Latin)": "KZ (Latin)",
  "Kazakh (with Russian)": "KZ (Kazrus)",
  "Khmer (Cambodia)": "KH",
  Kikuyu: "KE (Kik)",
  Komi: "RU (Kom)",
  Korean: "KR",
  "Korean (101/104-key compatible)": "KR (Kr104)",
  "Kurdish (Iran, Arabic-Latin)": "IR (Ku Ara)",
  "Kurdish (Iran, F)": "IR (Ku F)",
  "Kurdish (Iran, Latin Alt-Q)": "IR (Ku Alt)",
  "Kurdish (Iran, Latin Q)": "IR (Ku)",
  "Kurdish (Iraq, Arabic-Latin)": "IQ (Ku Ara)",
  "Kurdish (Iraq, F)": "IQ (Ku F)",
  "Kurdish (Iraq, Latin Alt-Q)": "IQ (Ku Alt)",
  "Kurdish (Iraq, Latin Q)": "IQ (Ku)",
  "Kurdish (Syria, F)": "SY (Ku F)",
  "Kurdish (Syria, Latin Alt-Q)": "SY (Ku Alt)",
  "Kurdish (Syria, Latin Q)": "SY (Ku)",
  "Kurdish (Turkey, F)": "TR (Ku F)",
  "Kurdish (Turkey, Latin Alt-Q)": "TR (Ku Alt)",
  "Kurdish (Turkey, Latin Q)": "TR (Ku)",
  Kyrgyz: "KG",
  "Kyrgyz (phonetic)": "KG (Phonetic)",
  Lao: "LA",
  "Lao (STEA)": "LA (Stea)",
  Latvian: "LV",
  "Latvian (adapted)": "LV (Adapted)",
  "Latvian (apostrophe)": "LV (Apostrophe)",
  "Latvian (ergonomic, \u016AGJRMV)": "LV (Ergonomic)",
  "Latvian (F)": "LV (Fkey)",
  "Latvian (modern)": "LV (Modern)",
  "Latvian (tilde)": "LV (Tilde)",
  Lithuanian: "LT",
  "Lithuanian (IBM LST 1205-92)": "LT (Ibm)",
  "Lithuanian (LEKP)": "LT (Lekp)",
  "Lithuanian (LEKPa)": "LT (Lekpa)",
  "Lithuanian (Ratise)": "LT (Ratise)",
  "Lithuanian (standard)": "LT (Std)",
  "Lithuanian (US)": "LT (Us)",
  "Lower Sorbian": "DE (Dsb)",
  "Lower Sorbian (QWERTZ)": "DE (Dsb Qwertz)",
  Macedonian: "MK",
  "Macedonian (no dead keys)": "MK (Nodeadkeys)",
  "Malay (Jawi, Arabic Keyboard)": "MY",
  "Malay (Jawi, phonetic)": "MY (Phonetic)",
  Malayalam: "IN (Mal)",
  "Malayalam (enhanced InScript, with rupee)": "IN (Mal Enhanced)",
  "Malayalam (Lalitha)": "IN (Mal Lalitha)",
  Maltese: "MT",
  "Maltese (UK, with AltGr overrides)": "MT (Alt-Gb)",
  "Maltese (US, with AltGr overrides)": "MT (Alt-Us)",
  "Maltese (US)": "MT (Us)",
  "Manipuri (Eeyek)": "IN (Eeyek)",
  Maori: "MAO",
  "Marathi (enhanced InScript)": "IN (Marathi)",
  "Marathi (KaGaPa, phonetic)": "IN (Mar-Kagapa)",
  Mari: "RU (Chm)",
  Mmuock: "CM (Mmuock)",
  Moldavian: "MD",
  "Moldavian (Gagauz)": "MD (Gag)",
  Mon: "MM (Mnw)",
  "Mon (A1)": "MM (Mnw-A1)",
  Mongolian: "MN",
  "Mongolian (Bichig)": "CN (Mon Trad)",
  "Mongolian (Galik)": "CN (Mon Trad Galik)",
  "Mongolian (Manchu Galik)": "CN (Mon Manchu Galik)",
  "Mongolian (Manchu)": "CN (Mon Trad Manchu)",
  "Mongolian (Todo Galik)": "CN (Mon Todo Galik)",
  "Mongolian (Todo)": "CN (Mon Trad Todo)",
  "Mongolian (Xibe)": "CN (Mon Trad Xibe)",
  Montenegrin: "ME",
  "Montenegrin (Cyrillic, with guillemets)": "ME (Cyrillicalternatequotes)",
  "Montenegrin (Cyrillic, ZE and ZHE swapped)": "ME (Cyrillicyz)",
  "Montenegrin (Cyrillic)": "ME (Cyrillic)",
  "Montenegrin (Latin, QWERTY)": "ME (Latinyz)",
  "Montenegrin (Latin, Unicode, QWERTY)": "ME (Latinunicodeyz)",
  "Montenegrin (Latin, Unicode)": "ME (Latinunicode)",
  "Montenegrin (Latin, with guillemets)": "ME (Latinalternatequotes)",
  "N'Ko (AZERTY)": "GN",
  Nepali: "NP",
  "Northern Saami (Finland)": "FI (Smi)",
  "Northern Saami (Norway, no dead keys)": "NO (Smi Nodeadkeys)",
  "Northern Saami (Norway)": "NO (Smi)",
  "Northern Saami (Sweden)": "SE (Smi)",
  Norwegian: "NO",
  "Norwegian (Colemak)": "NO (Colemak)",
  "Norwegian (Dvorak)": "NO (Dvorak)",
  "Norwegian (Macintosh, no dead keys)": "NO (Mac Nodeadkeys)",
  "Norwegian (Macintosh)": "NO (Mac)",
  "Norwegian (no dead keys)": "NO (Nodeadkeys)",
  "Norwegian (Windows)": "NO (Winkeys)",
  Occitan: "FR (Oci)",
  Ogham: "IE (Ogam)",
  "Ogham (IS434)": "IE (Ogam Is434)",
  "Ol Chiki": "IN (Olck)",
  "Old Turkic": "TR (Otk)",
  "Old Turkic (F)": "TR (Otkf)",
  Oriya: "IN (Ori)",
  "Oriya (Bolnagri)": "IN (Ori-Bolnagri)",
  "Oriya (Wx)": "IN (Ori-Wx)",
  "Ossetian (Georgia)": "GE (Os)",
  "Ossetian (legacy)": "RU (Os Legacy)",
  "Ossetian (Windows)": "RU (Os Winkeys)",
  "Ottoman (F)": "TR (Otf)",
  "Ottoman (Q)": "TR (Ot)",
  "Pannonian Rusyn": "RS (Rue)",
  Pashto: "AF (Ps)",
  "Pashto (Afghanistan, OLPC)": "AF (Ps-Olpc)",
  Persian: "IR",
  "Persian (with Persian keypad)": "IR (Pes Keypad)",
  Polish: "PL",
  "Polish (British keyboard)": "GB (Pl)",
  "Polish (Dvorak, with Polish quotes on key 1)": "PL (Dvorak Altquotes)",
  "Polish (Dvorak, with Polish quotes on quotemark key)": "PL (Dvorak Quotes)",
  "Polish (Dvorak)": "PL (Dvorak)",
  "Polish (legacy)": "PL (Legacy)",
  "Polish (programmer Dvorak)": "PL (Dvp)",
  "Polish (QWERTZ)": "PL (Qwertz)",
  Portuguese: "PT",
  "Portuguese (Brazil, Dvorak)": "BR (Dvorak)",
  "Portuguese (Brazil, IBM/Lenovo ThinkPad)": "BR (Thinkpad)",
  "Portuguese (Brazil, Nativo for US keyboards)": "BR (Nativo-Us)",
  "Portuguese (Brazil, Nativo)": "BR (Nativo)",
  "Portuguese (Brazil, no dead keys)": "BR (Nodeadkeys)",
  "Portuguese (Brazil)": "BR",
  "Portuguese (Macintosh, no dead keys)": "PT (Mac Nodeadkeys)",
  "Portuguese (Macintosh)": "PT (Mac)",
  "Portuguese (Nativo for US keyboards)": "PT (Nativo-Us)",
  "Portuguese (Nativo)": "PT (Nativo)",
  "Portuguese (no dead keys)": "PT (Nodeadkeys)",
  "Punjabi (Gurmukhi Jhelum)": "IN (Jhelum)",
  "Punjabi (Gurmukhi)": "IN (Guru)",
  Romanian: "RO",
  "Romanian (Germany, no dead keys)": "DE (Ro Nodeadkeys)",
  "Romanian (Germany)": "DE (Ro)",
  "Romanian (standard)": "RO (Std)",
  "Romanian (Windows)": "RO (Winkeys)",
  Russian: "RU",
  "Russian (Belarus)": "BY (Ru)",
  "Russian (Czech, phonetic)": "CZ (Rus)",
  "Russian (DOS)": "RU (Dos)",
  "Russian (engineering, EN)": "RU (Ruchey En)",
  "Russian (engineering, RU)": "RU (Ruchey Ru)",
  "Russian (Georgia)": "GE (Ru)",
  "Russian (Germany, phonetic)": "DE (Ru)",
  "Russian (Kazakhstan, with Kazakh)": "KZ (Ruskaz)",
  "Russian (legacy)": "RU (Legacy)",
  "Russian (Macintosh)": "RU (Mac)",
  "Russian (phonetic, AZERTY)": "RU (Phonetic Azerty)",
  "Russian (phonetic, Dvorak)": "RU (Phonetic Dvorak)",
  "Russian (phonetic, French)": "RU (Phonetic Fr)",
  "Russian (phonetic, Windows)": "RU (Phonetic Winkeys)",
  "Russian (phonetic, YAZHERTY)": "RU (Phonetic YAZHERTY)",
  "Russian (phonetic)": "RU (Phonetic)",
  "Russian (Poland, phonetic Dvorak)": "PL (Ru Phonetic Dvorak)",
  "Russian (Sweden, phonetic, no dead keys)": "SE (Rus Nodeadkeys)",
  "Russian (Sweden, phonetic)": "SE (Rus)",
  "Russian (typewriter, legacy)": "RU (Typewriter-Legacy)",
  "Russian (typewriter)": "RU (Typewriter)",
  "Russian (Ukraine, standard RSTU)": "UA (Rstu Ru)",
  "Russian (US, phonetic)": "US (Rus)",
  "Saisiyat (Taiwan)": "TW (Saisiyat)",
  Samogitian: "LT (Sgs)",
  "Sanskrit (KaGaPa, phonetic)": "IN (San-Kagapa)",
  "Scottish Gaelic": "GB (Gla)",
  Serbian: "RS",
  "Serbian (Cyrillic, with guillemets)": "RS (Alternatequotes)",
  "Serbian (Cyrillic, ZE and ZHE swapped)": "RS (Yz)",
  "Serbian (Latin, QWERTY)": "RS (Latinyz)",
  "Serbian (Latin, Unicode, QWERTY)": "RS (Latinunicodeyz)",
  "Serbian (Latin, Unicode)": "RS (Latinunicode)",
  "Serbian (Latin, with guillemets)": "RS (Latinalternatequotes)",
  "Serbian (Latin)": "RS (Latin)",
  "Serbian (Russia)": "RU (Srp)",
  "Serbo-Croatian (US)": "US (Hbs)",
  Shan: "MM (Shn)",
  "Shan (Zawgyi Tai)": "MM (Zgt)",
  Sicilian: "IT (Scn)",
  Silesian: "PL (Szl)",
  Sindhi: "PK (Snd)",
  "Sinhala (phonetic)": "LK",
  "Sinhala (US)": "LK (Us)",
  Slovak: "SK",
  "Slovak (extended backslash)": "SK (Bksl)",
  "Slovak (QWERTY, extended backslash)": "SK (Qwerty Bksl)",
  "Slovak (QWERTY)": "SK (Qwerty)",
  Slovenian: "SI",
  "Slovenian (US)": "SI (Us)",
  "Slovenian (with guillemets)": "SI (Alternatequotes)",
  Spanish: "ES",
  "Spanish (dead tilde)": "ES (Deadtilde)",
  "Spanish (Dvorak)": "ES (Dvorak)",
  "Spanish (Latin American, Colemak)": "LATAM (Colemak)",
  "Spanish (Latin American, dead tilde)": "LATAM (Deadtilde)",
  "Spanish (Latin American, Dvorak)": "LATAM (Dvorak)",
  "Spanish (Latin American, no dead keys)": "LATAM (Nodeadkeys)",
  "Spanish (Latin American)": "LATAM",
  "Spanish (Macintosh)": "ES (Mac)",
  "Spanish (no dead keys)": "ES (Nodeadkeys)",
  "Spanish (Windows)": "ES (Winkeys)",
  "Swahili (Kenya)": "KE",
  "Swahili (Tanzania)": "TZ",
  Swedish: "SE",
  "Swedish (Dvorak, intl.)": "SE (Us Dvorak)",
  "Swedish (Dvorak)": "SE (Dvorak)",
  "Swedish (Macintosh)": "SE (Mac)",
  "Swedish (no dead keys)": "SE (Nodeadkeys)",
  "Swedish (Svdvorak)": "SE (Svdvorak)",
  "Swedish (US)": "SE (Us)",
  "Swedish Sign Language": "SE (Swl)",
  Syriac: "SY (Syc)",
  "Syriac (phonetic)": "SY (Syc Phonetic)",
  Taiwanese: "TW",
  "Taiwanese (indigenous)": "TW (Indigenous)",
  Tajik: "TJ",
  "Tajik (legacy)": "TJ (Legacy)",
  "Tamil (InScript, with Arabic numerals)": "IN (Tam)",
  "Tamil (InScript, with Tamil numerals)": "IN (Tam Tamilnumbers)",
  "Tamil (Sri Lanka, TamilNet '99, TAB encoding)": "LK (Tam TAB)",
  "Tamil (Sri Lanka, TamilNet '99)": "LK (Tam Unicode)",
  "Tamil (TamilNet '99 with Tamil numerals)": "IN (Tamilnet Tamilnumbers)",
  "Tamil (TamilNet '99, TAB encoding)": "IN (Tamilnet TAB)",
  "Tamil (TamilNet '99, TSCII encoding)": "IN (Tamilnet TSCII)",
  "Tamil (TamilNet '99)": "IN (Tamilnet)",
  Tarifit: "MA (Rif)",
  Tatar: "RU (Tt)",
  Telugu: "IN (Tel)",
  "Telugu (KaGaPa, phonetic)": "IN (Tel-Kagapa)",
  "Telugu (Sarala)": "IN (Tel-Sarala)",
  Thai: "TH",
  "Thai (Pattachote)": "TH (Pat)",
  "Thai (TIS-820.2538)": "TH (Tis)",
  Tibetan: "CN (Tib)",
  "Tibetan (with ASCII numerals)": "CN (Tib Asciinum)",
  Tswana: "BW",
  Turkish: "TR",
  "Turkish (Alt-Q)": "TR (Alt)",
  "Turkish (E)": "TR (E)",
  "Turkish (F)": "TR (F)",
  "Turkish (Germany)": "DE (Tr)",
  "Turkish (intl., with dead keys)": "TR (Intl)",
  Turkmen: "TM",
  "Turkmen (Alt-Q)": "TM (Alt)",
  Udmurt: "RU (Udm)",
  Ukrainian: "UA",
  "Ukrainian (homophonic)": "UA (Homophonic)",
  "Ukrainian (legacy)": "UA (Legacy)",
  "Ukrainian (macOS)": "UA (MacOS)",
  "Ukrainian (phonetic)": "UA (Phonetic)",
  "Ukrainian (standard RSTU)": "UA (Rstu)",
  "Ukrainian (typewriter)": "UA (Typewriter)",
  "Ukrainian (Windows)": "UA (Winkeys)",
  "Urdu (alt. phonetic)": "IN (Urd-Phonetic3)",
  "Urdu (Pakistan, CRULP)": "PK (Urd-Crulp)",
  "Urdu (Pakistan, NLA)": "PK (Urd-Nla)",
  "Urdu (Pakistan)": "PK",
  "Urdu (phonetic)": "IN (Urd-Phonetic)",
  "Urdu (Windows)": "IN (Urd-Winkeys)",
  Uyghur: "CN (Ug)",
  Uzbek: "UZ",
  "Uzbek (Afghanistan, OLPC)": "AF (Uz-Olpc)",
  "Uzbek (Afghanistan)": "AF (Uz)",
  "Uzbek (Latin)": "UZ (Latin)",
  Vietnamese: "VN",
  "Vietnamese (France)": "VN (Fr)",
  "Vietnamese (US)": "VN (Us)",
  Wolof: "SN",
  Yakut: "RU (Sah)",
  Yoruba: "NG (Yoruba)",
  "Unknown Layout": "Unknown"
};

// /home/antonio/.config/HyprPanel/customModules/kblayout/getLayout.ts
var getKeyboardLayout = (obj, format2) => {
  const hyprctlDevices = JSON.parse(obj);
  const keyboards = hyprctlDevices["keyboards"];
  if (keyboards.length === 0) {
    return format2 === "code" ? "Unknown" : "Unknown Layout";
  }
  let mainKb = keyboards.find((kb) => kb.main);
  if (!mainKb) {
    mainKb = keyboards[keyboards.length - 1];
  }
  const layout = mainKb["active_keymap"];
  const foundLayout = layoutMap[layout];
  return format2 === "code" ? foundLayout || layout : layout;
};

// /home/antonio/.config/HyprPanel/customModules/kblayout/index.ts
var hyprland7 = await Service.import("hyprland");
var { label: label6, labelType: labelType4, icon: icon4, leftClick: leftClick6, rightClick: rightClick14, middleClick: middleClick14, scrollUp: scrollUp10, scrollDown: scrollDown10 } = options_default.bar.customModules.kbLayout;
var KbInput = () => {
  const keyboardModule = module({
    textIcon: icon4.bind("value"),
    tooltipText: "",
    labelHook: (self) => {
      self.hook(hyprland7, () => {
        Utils.execAsync("hyprctl devices -j").then((obj) => {
          self.label = getKeyboardLayout(obj, labelType4.value);
        }).catch((err) => {
          console.error(err);
        });
      }, "keyboard-layout");
      self.hook(labelType4, () => {
        Utils.execAsync("hyprctl devices -j").then((obj) => {
          self.label = getKeyboardLayout(obj, labelType4.value);
        }).catch((err) => {
          console.error(err);
        });
      });
    },
    boxClass: "kblayout",
    showLabelBinding: label6.bind("value"),
    props: {
      setup: (self) => {
        inputHandler(self, {
          onPrimaryClick: {
            cmd: leftClick6
          },
          onSecondaryClick: {
            cmd: rightClick14
          },
          onMiddleClick: {
            cmd: middleClick14
          },
          onScrollUp: {
            cmd: scrollUp10
          },
          onScrollDown: {
            cmd: scrollDown10
          }
        });
      }
    }
  });
  return keyboardModule;
};

// /home/antonio/.config/HyprPanel/customModules/updates/index.ts
var {
  updateCommand,
  label: label7,
  padZero,
  pollingInterval: pollingInterval5,
  icon: icon5,
  leftClick: leftClick7,
  rightClick: rightClick15,
  middleClick: middleClick15,
  scrollUp: scrollUp11,
  scrollDown: scrollDown11
} = options_default.bar.customModules.updates;
var pendingUpdates = Variable(" 0");
var processUpdateCount = (updateCount) => {
  if (!padZero.value)
    return updateCount;
  return `${updateCount.padStart(2, "0")}`;
};
pollVariableBash(pendingUpdates, [padZero.bind("value")], pollingInterval5.bind("value"), updateCommand.value, processUpdateCount);
var Updates = () => {
  const updatesModule = module({
    textIcon: icon5.bind("value"),
    tooltipText: pendingUpdates.bind("value").as((v) => `${v} updates available`),
    boxClass: "updates",
    label: pendingUpdates.bind("value"),
    showLabelBinding: label7.bind("value"),
    props: {
      setup: (self) => {
        inputHandler(self, {
          onPrimaryClick: {
            cmd: leftClick7
          },
          onSecondaryClick: {
            cmd: rightClick15
          },
          onMiddleClick: {
            cmd: middleClick15
          },
          onScrollUp: {
            cmd: scrollUp11
          },
          onScrollDown: {
            cmd: scrollDown11
          }
        });
      }
    }
  });
  return updatesModule;
};

// /home/antonio/.config/HyprPanel/customModules/submap/index.ts
var hyprland8 = await Service.import("hyprland");
var {
  label: label8,
  enabledIcon,
  disabledIcon,
  enabledText,
  disabledText,
  leftClick: leftClick8,
  rightClick: rightClick16,
  middleClick: middleClick16,
  scrollUp: scrollUp12,
  scrollDown: scrollDown12
} = options_default.bar.customModules.submap;
var submapStatus = Variable(false);
hyprland8.connect("submap", () => {
  submapStatus.value = !submapStatus.value;
});
var Submap = () => {
  const submapModule = module({
    textIcon: Utils.merge([submapStatus.bind("value"), enabledIcon.bind("value"), disabledIcon.bind("value")], (status, enabled, disabled) => {
      return status ? enabled : disabled;
    }),
    tooltipText: Utils.merge([submapStatus.bind("value"), enabledText.bind("value"), disabledText.bind("value")], (status, enabled, disabled) => {
      return status ? enabled : disabled;
    }),
    boxClass: "submap",
    label: Utils.merge([submapStatus.bind("value"), enabledText.bind("value"), disabledText.bind("value")], (status, enabled, disabled) => {
      return status ? enabled : disabled;
    }),
    showLabelBinding: label8.bind("value"),
    props: {
      setup: (self) => {
        inputHandler(self, {
          onPrimaryClick: {
            cmd: leftClick8
          },
          onSecondaryClick: {
            cmd: rightClick16
          },
          onMiddleClick: {
            cmd: middleClick16
          },
          onScrollUp: {
            cmd: scrollUp12
          },
          onScrollDown: {
            cmd: scrollDown12
          }
        });
      }
    }
  });
  return submapModule;
};

// /home/antonio/.config/HyprPanel/lib/types/defaults/weather.ts
var DEFAULT_WEATHER = {
  location: {
    name: "Tahiti",
    region: "Somewhere",
    country: "United States of America",
    lat: 0,
    lon: 0,
    tz_id: "Tahiti",
    localtime_epoch: 1721981457,
    localtime: "2024-07-26 1:10"
  },
  current: {
    last_updated_epoch: 1721980800,
    last_updated: "2024-07-26 01:00",
    temp_c: 0,
    temp_f: 0,
    is_day: 0,
    condition: {
      text: "Clear",
      icon: "//cdn.weatherapi.com/weather/64x64/night/113.png",
      code: 1000
    },
    wind_mph: 0,
    wind_kph: 0,
    wind_degree: 0,
    wind_dir: "NW",
    pressure_mb: 0,
    pressure_in: 0,
    precip_mm: 0,
    precip_in: 0,
    humidity: 0,
    cloud: 0,
    feelslike_c: 0,
    feelslike_f: 0,
    windchill_c: 0,
    windchill_f: 0,
    heatindex_c: 0,
    heatindex_f: 0,
    dewpoint_c: 0,
    dewpoint_f: 0,
    vis_km: 0,
    vis_miles: 0,
    uv: 0,
    gust_mph: 0,
    gust_kph: 0
  },
  forecast: {
    forecastday: [
      {
        date: "2024-07-26",
        date_epoch: 1721952000,
        day: {
          maxtemp_c: 0,
          maxtemp_f: 0,
          mintemp_c: 0,
          mintemp_f: 0,
          avgtemp_c: 0,
          avgtemp_f: 0,
          maxwind_mph: 0,
          maxwind_kph: 0,
          totalprecip_mm: 0,
          totalprecip_in: 0,
          totalsnow_cm: 0,
          avgvis_km: 0,
          avgvis_miles: 0,
          avghumidity: 0,
          daily_will_it_rain: 0,
          daily_chance_of_rain: 0,
          daily_will_it_snow: 0,
          daily_chance_of_snow: 0,
          condition: {
            text: "Sunny",
            icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
            code: 1000
          },
          uv: 0
        },
        astro: {
          sunrise: "06:01 AM",
          sunset: "08:10 PM",
          moonrise: "11:32 PM",
          moonset: "12:01 PM",
          moon_phase: "Waning Gibbous",
          moon_illumination: 0,
          is_moon_up: 0,
          is_sun_up: 0
        },
        hour: [
          {
            time_epoch: 1721977200,
            time: "2024-07-26 00:00",
            temp_c: 0,
            temp_f: 0,
            is_day: 0,
            condition: {
              text: "Clear ",
              icon: "//cdn.weatherapi.com/weather/64x64/night/113.png",
              code: 1000
            },
            wind_mph: 0,
            wind_kph: 0,
            wind_degree: 0,
            wind_dir: "N",
            pressure_mb: 0,
            pressure_in: 0,
            precip_mm: 0,
            precip_in: 0,
            snow_cm: 0,
            humidity: 0,
            cloud: 0,
            feelslike_c: 0,
            feelslike_f: 0,
            windchill_c: 0,
            windchill_f: 0,
            heatindex_c: 0,
            heatindex_f: 0,
            dewpoint_c: 0,
            dewpoint_f: 0,
            will_it_rain: 0,
            chance_of_rain: 0,
            will_it_snow: 0,
            chance_of_snow: 0,
            vis_km: 0,
            vis_miles: 0,
            gust_mph: 0,
            gust_kph: 0,
            uv: 0
          },
          {
            time_epoch: 1721980800,
            time: "2024-07-26 01:00",
            temp_c: 0,
            temp_f: 0,
            is_day: 0,
            condition: {
              text: "Clear ",
              icon: "//cdn.weatherapi.com/weather/64x64/night/113.png",
              code: 1000
            },
            wind_mph: 0,
            wind_kph: 0,
            wind_degree: 0,
            wind_dir: "N",
            pressure_mb: 0,
            pressure_in: 0,
            precip_mm: 0,
            precip_in: 0,
            snow_cm: 0,
            humidity: 0,
            cloud: 0,
            feelslike_c: 0,
            feelslike_f: 0,
            windchill_c: 0,
            windchill_f: 0,
            heatindex_c: 0,
            heatindex_f: 0,
            dewpoint_c: 0,
            dewpoint_f: 0,
            will_it_rain: 0,
            chance_of_rain: 0,
            will_it_snow: 0,
            chance_of_snow: 0,
            vis_km: 0,
            vis_miles: 0,
            gust_mph: 0,
            gust_kph: 0,
            uv: 0
          },
          {
            time_epoch: 1721984400,
            time: "2024-07-26 02:00",
            temp_c: 0,
            temp_f: 0,
            is_day: 0,
            condition: {
              text: "Clear ",
              icon: "//cdn.weatherapi.com/weather/64x64/night/113.png",
              code: 1000
            },
            wind_mph: 0,
            wind_kph: 0,
            wind_degree: 0,
            wind_dir: "N",
            pressure_mb: 0,
            pressure_in: 0,
            precip_mm: 0,
            precip_in: 0,
            snow_cm: 0,
            humidity: 0,
            cloud: 0,
            feelslike_c: 0,
            feelslike_f: 0,
            windchill_c: 0,
            windchill_f: 0,
            heatindex_c: 0,
            heatindex_f: 0,
            dewpoint_c: 0,
            dewpoint_f: 0,
            will_it_rain: 0,
            chance_of_rain: 0,
            will_it_snow: 0,
            chance_of_snow: 0,
            vis_km: 0,
            vis_miles: 0,
            gust_mph: 0,
            gust_kph: 0,
            uv: 0
          },
          {
            time_epoch: 1721988000,
            time: "2024-07-26 03:00",
            temp_c: 0,
            temp_f: 0,
            is_day: 0,
            condition: {
              text: "Clear ",
              icon: "//cdn.weatherapi.com/weather/64x64/night/113.png",
              code: 1000
            },
            wind_mph: 0,
            wind_kph: 0,
            wind_degree: 0,
            wind_dir: "N",
            pressure_mb: 0,
            pressure_in: 0,
            precip_mm: 0,
            precip_in: 0,
            snow_cm: 0,
            humidity: 0,
            cloud: 0,
            feelslike_c: 0,
            feelslike_f: 0,
            windchill_c: 0,
            windchill_f: 0,
            heatindex_c: 0,
            heatindex_f: 0,
            dewpoint_c: 0,
            dewpoint_f: 0,
            will_it_rain: 0,
            chance_of_rain: 0,
            will_it_snow: 0,
            chance_of_snow: 0,
            vis_km: 0,
            vis_miles: 0,
            gust_mph: 0,
            gust_kph: 0,
            uv: 0
          },
          {
            time_epoch: 1721991600,
            time: "2024-07-26 04:00",
            temp_c: 0,
            temp_f: 0,
            is_day: 0,
            condition: {
              text: "Clear ",
              icon: "//cdn.weatherapi.com/weather/64x64/night/113.png",
              code: 1000
            },
            wind_mph: 0,
            wind_kph: 0,
            wind_degree: 0,
            wind_dir: "N",
            pressure_mb: 0,
            pressure_in: 0,
            precip_mm: 0,
            precip_in: 0,
            snow_cm: 0,
            humidity: 0,
            cloud: 0,
            feelslike_c: 0,
            feelslike_f: 0,
            windchill_c: 0,
            windchill_f: 0,
            heatindex_c: 0,
            heatindex_f: 0,
            dewpoint_c: 0,
            dewpoint_f: 0,
            will_it_rain: 0,
            chance_of_rain: 0,
            will_it_snow: 0,
            chance_of_snow: 0,
            vis_km: 0,
            vis_miles: 0,
            gust_mph: 0,
            gust_kph: 0,
            uv: 0
          },
          {
            time_epoch: 1721995200,
            time: "2024-07-26 05:00",
            temp_c: 0,
            temp_f: 0,
            is_day: 0,
            condition: {
              text: "Clear ",
              icon: "//cdn.weatherapi.com/weather/64x64/night/113.png",
              code: 1000
            },
            wind_mph: 0,
            wind_kph: 0,
            wind_degree: 0,
            wind_dir: "N",
            pressure_mb: 0,
            pressure_in: 0,
            precip_mm: 0,
            precip_in: 0,
            snow_cm: 0,
            humidity: 0,
            cloud: 0,
            feelslike_c: 0,
            feelslike_f: 0,
            windchill_c: 0,
            windchill_f: 0,
            heatindex_c: 0,
            heatindex_f: 0,
            dewpoint_c: 0,
            dewpoint_f: 0,
            will_it_rain: 0,
            chance_of_rain: 0,
            will_it_snow: 0,
            chance_of_snow: 0,
            vis_km: 0,
            vis_miles: 0,
            gust_mph: 0,
            gust_kph: 0,
            uv: 0
          },
          {
            time_epoch: 1721998800,
            time: "2024-07-26 06:00",
            temp_c: 0,
            temp_f: 0,
            is_day: 0,
            condition: {
              text: "Clear ",
              icon: "//cdn.weatherapi.com/weather/64x64/night/113.png",
              code: 1000
            },
            wind_mph: 0,
            wind_kph: 0,
            wind_degree: 0,
            wind_dir: "N",
            pressure_mb: 0,
            pressure_in: 0,
            precip_mm: 0,
            precip_in: 0,
            snow_cm: 0,
            humidity: 0,
            cloud: 0,
            feelslike_c: 0,
            feelslike_f: 0,
            windchill_c: 0,
            windchill_f: 0,
            heatindex_c: 0,
            heatindex_f: 0,
            dewpoint_c: 0,
            dewpoint_f: 0,
            will_it_rain: 0,
            chance_of_rain: 0,
            will_it_snow: 0,
            chance_of_snow: 0,
            vis_km: 0,
            vis_miles: 0,
            gust_mph: 0,
            gust_kph: 0,
            uv: 0
          },
          {
            time_epoch: 1722002400,
            time: "2024-07-26 07:00",
            temp_c: 0,
            temp_f: 0,
            is_day: 1,
            condition: {
              text: "Sunny",
              icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
              code: 1000
            },
            wind_mph: 0,
            wind_kph: 0,
            wind_degree: 0,
            wind_dir: "N",
            pressure_mb: 0,
            pressure_in: 0,
            precip_mm: 0,
            precip_in: 0,
            snow_cm: 0,
            humidity: 0,
            cloud: 0,
            feelslike_c: 0,
            feelslike_f: 0,
            windchill_c: 0,
            windchill_f: 0,
            heatindex_c: 0,
            heatindex_f: 0,
            dewpoint_c: 0,
            dewpoint_f: 0,
            will_it_rain: 0,
            chance_of_rain: 0,
            will_it_snow: 0,
            chance_of_snow: 0,
            vis_km: 0,
            vis_miles: 0,
            gust_mph: 0,
            gust_kph: 0,
            uv: 7
          },
          {
            time_epoch: 1722006000,
            time: "2024-07-26 08:00",
            temp_c: 0,
            temp_f: 0,
            is_day: 1,
            condition: {
              text: "Sunny",
              icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
              code: 1000
            },
            wind_mph: 0,
            wind_kph: 0,
            wind_degree: 0,
            wind_dir: "N",
            pressure_mb: 0,
            pressure_in: 0,
            precip_mm: 0,
            precip_in: 0,
            snow_cm: 0,
            humidity: 0,
            cloud: 0,
            feelslike_c: 0,
            feelslike_f: 0,
            windchill_c: 0,
            windchill_f: 0,
            heatindex_c: 0,
            heatindex_f: 0,
            dewpoint_c: 0,
            dewpoint_f: 0,
            will_it_rain: 0,
            chance_of_rain: 0,
            will_it_snow: 0,
            chance_of_snow: 0,
            vis_km: 0,
            vis_miles: 0,
            gust_mph: 0,
            gust_kph: 0,
            uv: 7
          },
          {
            time_epoch: 1722009600,
            time: "2024-07-26 09:00",
            temp_c: 0,
            temp_f: 0,
            is_day: 1,
            condition: {
              text: "Sunny",
              icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
              code: 1000
            },
            wind_mph: 0,
            wind_kph: 0,
            wind_degree: 0,
            wind_dir: "N",
            pressure_mb: 0,
            pressure_in: 0,
            precip_mm: 0,
            precip_in: 0,
            snow_cm: 0,
            humidity: 0,
            cloud: 0,
            feelslike_c: 0,
            feelslike_f: 0,
            windchill_c: 0,
            windchill_f: 0,
            heatindex_c: 0,
            heatindex_f: 0,
            dewpoint_c: 0,
            dewpoint_f: 0,
            will_it_rain: 0,
            chance_of_rain: 0,
            will_it_snow: 0,
            chance_of_snow: 0,
            vis_km: 0,
            vis_miles: 0,
            gust_mph: 0,
            gust_kph: 0,
            uv: 8
          },
          {
            time_epoch: 1722013200,
            time: "2024-07-26 10:00",
            temp_c: 0,
            temp_f: 0,
            is_day: 1,
            condition: {
              text: "Sunny",
              icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
              code: 1000
            },
            wind_mph: 0,
            wind_kph: 0,
            wind_degree: 0,
            wind_dir: "N",
            pressure_mb: 0,
            pressure_in: 0,
            precip_mm: 0,
            precip_in: 0,
            snow_cm: 0,
            humidity: 0,
            cloud: 0,
            feelslike_c: 0,
            feelslike_f: 0,
            windchill_c: 0,
            windchill_f: 0,
            heatindex_c: 0,
            heatindex_f: 0,
            dewpoint_c: 0,
            dewpoint_f: 0,
            will_it_rain: 0,
            chance_of_rain: 0,
            will_it_snow: 0,
            chance_of_snow: 0,
            vis_km: 0,
            vis_miles: 0,
            gust_mph: 0,
            gust_kph: 0,
            uv: 8
          },
          {
            time_epoch: 1722016800,
            time: "2024-07-26 11:00",
            temp_c: 0,
            temp_f: 0,
            is_day: 1,
            condition: {
              text: "Sunny",
              icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
              code: 1000
            },
            wind_mph: 0,
            wind_kph: 0,
            wind_degree: 0,
            wind_dir: "N",
            pressure_mb: 0,
            pressure_in: 0,
            precip_mm: 0,
            precip_in: 0,
            snow_cm: 0,
            humidity: 0,
            cloud: 0,
            feelslike_c: 0,
            feelslike_f: 0,
            windchill_c: 0,
            windchill_f: 0,
            heatindex_c: 0,
            heatindex_f: 0,
            dewpoint_c: 0,
            dewpoint_f: 0,
            will_it_rain: 0,
            chance_of_rain: 0,
            will_it_snow: 0,
            chance_of_snow: 0,
            vis_km: 0,
            vis_miles: 0,
            gust_mph: 0,
            gust_kph: 0,
            uv: 9
          },
          {
            time_epoch: 1722020400,
            time: "2024-07-26 12:00",
            temp_c: 0,
            temp_f: 0,
            is_day: 1,
            condition: {
              text: "Sunny",
              icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
              code: 1000
            },
            wind_mph: 0,
            wind_kph: 0,
            wind_degree: 0,
            wind_dir: "N",
            pressure_mb: 0,
            pressure_in: 0,
            precip_mm: 0,
            precip_in: 0,
            snow_cm: 0,
            humidity: 0,
            cloud: 0,
            feelslike_c: 0,
            feelslike_f: 0,
            windchill_c: 0,
            windchill_f: 0,
            heatindex_c: 0,
            heatindex_f: 0,
            dewpoint_c: 0,
            dewpoint_f: 0,
            will_it_rain: 0,
            chance_of_rain: 0,
            will_it_snow: 0,
            chance_of_snow: 0,
            vis_km: 0,
            vis_miles: 0,
            gust_mph: 0,
            gust_kph: 0,
            uv: 9
          },
          {
            time_epoch: 1722024000,
            time: "2024-07-26 13:00",
            temp_c: 0,
            temp_f: 0,
            is_day: 1,
            condition: {
              text: "Sunny",
              icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
              code: 1000
            },
            wind_mph: 0,
            wind_kph: 0,
            wind_degree: 0,
            wind_dir: "N",
            pressure_mb: 0,
            pressure_in: 0,
            precip_mm: 0,
            precip_in: 0,
            snow_cm: 0,
            humidity: 0,
            cloud: 0,
            feelslike_c: 0,
            feelslike_f: 0,
            windchill_c: 0,
            windchill_f: 0,
            heatindex_c: 0,
            heatindex_f: 0,
            dewpoint_c: 0,
            dewpoint_f: 0,
            will_it_rain: 0,
            chance_of_rain: 0,
            will_it_snow: 0,
            chance_of_snow: 0,
            vis_km: 0,
            vis_miles: 0,
            gust_mph: 0,
            gust_kph: 0,
            uv: 9
          },
          {
            time_epoch: 1722027600,
            time: "2024-07-26 14:00",
            temp_c: 0,
            temp_f: 0,
            is_day: 1,
            condition: {
              text: "Sunny",
              icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
              code: 1000
            },
            wind_mph: 0,
            wind_kph: 0,
            wind_degree: 0,
            wind_dir: "N",
            pressure_mb: 0,
            pressure_in: 0,
            precip_mm: 0,
            precip_in: 0,
            snow_cm: 0,
            humidity: 0,
            cloud: 0,
            feelslike_c: 0,
            feelslike_f: 0,
            windchill_c: 0,
            windchill_f: 0,
            heatindex_c: 0,
            heatindex_f: 0,
            dewpoint_c: 0,
            dewpoint_f: 0,
            will_it_rain: 0,
            chance_of_rain: 0,
            will_it_snow: 0,
            chance_of_snow: 0,
            vis_km: 0,
            vis_miles: 0,
            gust_mph: 0,
            gust_kph: 0,
            uv: 10
          },
          {
            time_epoch: 1722031200,
            time: "2024-07-26 15:00",
            temp_c: 0,
            temp_f: 0,
            is_day: 1,
            condition: {
              text: "Sunny",
              icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
              code: 1000
            },
            wind_mph: 0,
            wind_kph: 0,
            wind_degree: 0,
            wind_dir: "N",
            pressure_mb: 0,
            pressure_in: 0,
            precip_mm: 0,
            precip_in: 0,
            snow_cm: 0,
            humidity: 0,
            cloud: 0,
            feelslike_c: 0,
            feelslike_f: 0,
            windchill_c: 0,
            windchill_f: 0,
            heatindex_c: 0,
            heatindex_f: 0,
            dewpoint_c: 0,
            dewpoint_f: 0,
            will_it_rain: 0,
            chance_of_rain: 0,
            will_it_snow: 0,
            chance_of_snow: 0,
            vis_km: 0,
            vis_miles: 0,
            gust_mph: 0,
            gust_kph: 0,
            uv: 10
          },
          {
            time_epoch: 1722034800,
            time: "2024-07-26 16:00",
            temp_c: 0,
            temp_f: 0,
            is_day: 1,
            condition: {
              text: "Sunny",
              icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
              code: 1000
            },
            wind_mph: 0,
            wind_kph: 0,
            wind_degree: 0,
            wind_dir: "N",
            pressure_mb: 0,
            pressure_in: 0,
            precip_mm: 0,
            precip_in: 0,
            snow_cm: 0,
            humidity: 0,
            cloud: 0,
            feelslike_c: 0,
            feelslike_f: 0,
            windchill_c: 0,
            windchill_f: 0,
            heatindex_c: 0,
            heatindex_f: 0,
            dewpoint_c: 0,
            dewpoint_f: 0,
            will_it_rain: 0,
            chance_of_rain: 0,
            will_it_snow: 0,
            chance_of_snow: 0,
            vis_km: 0,
            vis_miles: 0,
            gust_mph: 0,
            gust_kph: 0,
            uv: 10
          },
          {
            time_epoch: 1722038400,
            time: "2024-07-26 17:00",
            temp_c: 0,
            temp_f: 0,
            is_day: 1,
            condition: {
              text: "Sunny",
              icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
              code: 1000
            },
            wind_mph: 0,
            wind_kph: 0,
            wind_degree: 0,
            wind_dir: "N",
            pressure_mb: 0,
            pressure_in: 0,
            precip_mm: 0,
            precip_in: 0,
            snow_cm: 0,
            humidity: 0,
            cloud: 0,
            feelslike_c: 0,
            feelslike_f: 0,
            windchill_c: 0,
            windchill_f: 0,
            heatindex_c: 0,
            heatindex_f: 0,
            dewpoint_c: 0,
            dewpoint_f: 0,
            will_it_rain: 0,
            chance_of_rain: 0,
            will_it_snow: 0,
            chance_of_snow: 0,
            vis_km: 0,
            vis_miles: 0,
            gust_mph: 0,
            gust_kph: 0,
            uv: 10
          },
          {
            time_epoch: 1722042000,
            time: "2024-07-26 18:00",
            temp_c: 0,
            temp_f: 0,
            is_day: 1,
            condition: {
              text: "Sunny",
              icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
              code: 1000
            },
            wind_mph: 0,
            wind_kph: 0,
            wind_degree: 0,
            wind_dir: "N",
            pressure_mb: 0,
            pressure_in: 0,
            precip_mm: 0,
            precip_in: 0,
            snow_cm: 0,
            humidity: 0,
            cloud: 0,
            feelslike_c: 0,
            feelslike_f: 0,
            windchill_c: 0,
            windchill_f: 0,
            heatindex_c: 0,
            heatindex_f: 0,
            dewpoint_c: 0,
            dewpoint_f: 0,
            will_it_rain: 0,
            chance_of_rain: 0,
            will_it_snow: 0,
            chance_of_snow: 0,
            vis_km: 0,
            vis_miles: 0,
            gust_mph: 0,
            gust_kph: 0,
            uv: 9
          },
          {
            time_epoch: 1722045600,
            time: "2024-07-26 19:00",
            temp_c: 0,
            temp_f: 0,
            is_day: 1,
            condition: {
              text: "Sunny",
              icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
              code: 1000
            },
            wind_mph: 0,
            wind_kph: 0,
            wind_degree: 0,
            wind_dir: "N",
            pressure_mb: 0,
            pressure_in: 0,
            precip_mm: 0,
            precip_in: 0,
            snow_cm: 0,
            humidity: 0,
            cloud: 0,
            feelslike_c: 0,
            feelslike_f: 0,
            windchill_c: 0,
            windchill_f: 0,
            heatindex_c: 0,
            heatindex_f: 0,
            dewpoint_c: 0,
            dewpoint_f: 0,
            will_it_rain: 0,
            chance_of_rain: 0,
            will_it_snow: 0,
            chance_of_snow: 0,
            vis_km: 0,
            vis_miles: 0,
            gust_mph: 0,
            gust_kph: 0,
            uv: 9
          },
          {
            time_epoch: 1722049200,
            time: "2024-07-26 20:00",
            temp_c: 0,
            temp_f: 0,
            is_day: 1,
            condition: {
              text: "Sunny",
              icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
              code: 1000
            },
            wind_mph: 0,
            wind_kph: 0,
            wind_degree: 0,
            wind_dir: "N",
            pressure_mb: 0,
            pressure_in: 0,
            precip_mm: 0,
            precip_in: 0,
            snow_cm: 0,
            humidity: 0,
            cloud: 0,
            feelslike_c: 0,
            feelslike_f: 0,
            windchill_c: 0,
            windchill_f: 0,
            heatindex_c: 0,
            heatindex_f: 0,
            dewpoint_c: 0,
            dewpoint_f: 0,
            will_it_rain: 0,
            chance_of_rain: 0,
            will_it_snow: 0,
            chance_of_snow: 0,
            vis_km: 0,
            vis_miles: 0,
            gust_mph: 0,
            gust_kph: 0,
            uv: 8
          },
          {
            time_epoch: 1722052800,
            time: "2024-07-26 21:00",
            temp_c: 0,
            temp_f: 0,
            is_day: 0,
            condition: {
              text: "Clear ",
              icon: "//cdn.weatherapi.com/weather/64x64/night/113.png",
              code: 1000
            },
            wind_mph: 0,
            wind_kph: 0,
            wind_degree: 0,
            wind_dir: "N",
            pressure_mb: 0,
            pressure_in: 0,
            precip_mm: 0,
            precip_in: 0,
            snow_cm: 0,
            humidity: 0,
            cloud: 0,
            feelslike_c: 0,
            feelslike_f: 0,
            windchill_c: 0,
            windchill_f: 0,
            heatindex_c: 0,
            heatindex_f: 0,
            dewpoint_c: 0,
            dewpoint_f: 0,
            will_it_rain: 0,
            chance_of_rain: 0,
            will_it_snow: 0,
            chance_of_snow: 0,
            vis_km: 0,
            vis_miles: 0,
            gust_mph: 0,
            gust_kph: 0,
            uv: 0
          },
          {
            time_epoch: 1722056400,
            time: "2024-07-26 22:00",
            temp_c: 0,
            temp_f: 0,
            is_day: 0,
            condition: {
              text: "Clear ",
              icon: "//cdn.weatherapi.com/weather/64x64/night/113.png",
              code: 1000
            },
            wind_mph: 0,
            wind_kph: 0,
            wind_degree: 0,
            wind_dir: "N",
            pressure_mb: 0,
            pressure_in: 0,
            precip_mm: 0,
            precip_in: 0,
            snow_cm: 0,
            humidity: 0,
            cloud: 0,
            feelslike_c: 0,
            feelslike_f: 0,
            windchill_c: 0,
            windchill_f: 0,
            heatindex_c: 0,
            heatindex_f: 0,
            dewpoint_c: 0,
            dewpoint_f: 0,
            will_it_rain: 0,
            chance_of_rain: 0,
            will_it_snow: 0,
            chance_of_snow: 0,
            vis_km: 0,
            vis_miles: 0,
            gust_mph: 0,
            gust_kph: 0,
            uv: 0
          },
          {
            time_epoch: 1722060000,
            time: "2024-07-26 23:00",
            temp_c: 0,
            temp_f: 0,
            is_day: 0,
            condition: {
              text: "Clear ",
              icon: "//cdn.weatherapi.com/weather/64x64/night/113.png",
              code: 1000
            },
            wind_mph: 0,
            wind_kph: 0,
            wind_degree: 0,
            wind_dir: "N",
            pressure_mb: 0,
            pressure_in: 0,
            precip_mm: 0,
            precip_in: 0,
            snow_cm: 0,
            humidity: 0,
            cloud: 0,
            feelslike_c: 0,
            feelslike_f: 0,
            windchill_c: 0,
            windchill_f: 0,
            heatindex_c: 0,
            heatindex_f: 0,
            dewpoint_c: 0,
            dewpoint_f: 0,
            will_it_rain: 0,
            chance_of_rain: 0,
            will_it_snow: 0,
            chance_of_snow: 0,
            vis_km: 0,
            vis_miles: 0,
            gust_mph: 0,
            gust_kph: 0,
            uv: 0
          }
        ]
      }
    ]
  }
};

// /home/antonio/.config/HyprPanel/globals/weather.ts
import GLib7 from "gi://GLib?version=2.0";

// /home/antonio/.config/HyprPanel/modules/icons/weather.ts
var weatherIcons = {
  warning: "\uDB83\uDF2F",
  sunny: "\uDB81\uDD99",
  clear: "\uDB81\uDD94",
  partly_cloudy: "\uDB81\uDD95",
  partly_cloudy_night: "\uDB83\uDF31",
  cloudy: "\uDB81\uDD90",
  overcast: "\uDB81\uDD95",
  mist: "\uDB81\uDD91",
  patchy_rain_nearby: "\uDB83\uDF33",
  patchy_rain_possible: "\uDB83\uDF33",
  patchy_snow_possible: "\uDB83\uDF34",
  patchy_sleet_possible: "\uDB81\uDE7F",
  patchy_freezing_drizzle_possible: "\uDB81\uDE7F",
  thundery_outbreaks_possible: "\uDB81\uDE7E",
  blowing_snow: "\uDB83\uDF36",
  blizzard: "\uDB83\uDF36",
  fog: "\uDB81\uDD91",
  freezing_fog: "\uDB81\uDD91",
  patchy_light_drizzle: "\uDB83\uDF33",
  light_drizzle: "\uDB83\uDF33",
  freezing_drizzle: "\uDB81\uDE7F",
  heavy_freezing_drizzle: "\uDB81\uDE7F",
  patchy_light_rain: "\uDB83\uDF33",
  light_rain: "\uDB83\uDF33",
  moderate_rain_at_times: "\uDB81\uDD97",
  moderate_rain: "\uDB83\uDF33",
  heavy_rain_at_times: "\uDB81\uDD96",
  heavy_rain: "\uDB81\uDD96",
  light_freezing_rain: "\uDB81\uDE7F",
  moderate_or_heavy_freezing_rain: "\uDB81\uDE7F",
  light_sleet: "\uDB81\uDE7F",
  moderate_or_heavy_sleet: "\uDB81\uDE7F",
  patchy_light_snow: "\uDB83\uDF34",
  light_snow: "\uDB83\uDF34",
  patchy_moderate_snow: "\uDB83\uDF34",
  moderate_snow: "\uDB83\uDF36",
  patchy_heavy_snow: "\uDB83\uDF36",
  heavy_snow: "\uDB83\uDF36",
  ice_pellets: "\uDB81\uDD92",
  light_rain_shower: "\uDB81\uDD96",
  moderate_or_heavy_rain_shower: "\uDB81\uDD96",
  torrential_rain_shower: "\uDB81\uDD96",
  light_sleet_showers: "\uDB83\uDF35",
  moderate_or_heavy_sleet_showers: "\uDB83\uDF35",
  light_snow_showers: "\uDB83\uDF35",
  moderate_or_heavy_snow_showers: "\uDB83\uDF35",
  light_showers_of_ice_pellets: "\uDB81\uDD92",
  moderate_or_heavy_showers_of_ice_pellets: "\uDB81\uDD92",
  patchy_light_rain_with_thunder: "\uDB81\uDE7E",
  moderate_or_heavy_rain_with_thunder: "\uDB81\uDE7E",
  patchy_light_snow_with_thunder: "\uDB83\uDF36",
  moderate_or_heavy_snow_with_thunder: "\uDB83\uDF36"
};

// /home/antonio/.config/HyprPanel/globals/weather.ts
var { key, interval, location } = options_default.menus.clock.weather;
var globalWeatherVar = Variable(DEFAULT_WEATHER);
var weatherIntervalInstance = null;
var weatherIntervalFn = (weatherInterval, loc, weatherKey) => {
  if (weatherIntervalInstance !== null) {
    GLib7.source_remove(weatherIntervalInstance);
  }
  const formattedLocation = loc.replace(" ", "%20");
  weatherIntervalInstance = Utils.interval(weatherInterval, () => {
    Utils.execAsync(`curl "https://api.weatherapi.com/v1/forecast.json?key=${weatherKey}&q=${formattedLocation}&days=1&aqi=no&alerts=no"`).then((res) => {
      try {
        if (typeof res !== "string") {
          return globalWeatherVar.value = DEFAULT_WEATHER;
        }
        const parsedWeather = JSON.parse(res);
        if (Object.keys(parsedWeather).includes("error")) {
          return globalWeatherVar.value = DEFAULT_WEATHER;
        }
        return globalWeatherVar.value = parsedWeather;
      } catch (error) {
        globalWeatherVar.value = DEFAULT_WEATHER;
        console.warn(`Failed to parse weather data: ${error}`);
      }
    }).catch((err) => {
      console.error(`Failed to fetch weather: ${err}`);
      globalWeatherVar.value = DEFAULT_WEATHER;
    });
  });
};
Utils.merge([key.bind("value"), interval.bind("value"), location.bind("value")], (weatherKey, weatherInterval, loc) => {
  if (!weatherKey) {
    return globalWeatherVar.value = DEFAULT_WEATHER;
  }
  weatherIntervalFn(weatherInterval, loc, weatherKey);
});
var getTemperature = (wthr, unt) => {
  if (unt === "imperial") {
    return `${Math.ceil(wthr.current.temp_f)}\xB0 F`;
  } else {
    return `${Math.ceil(wthr.current.temp_c)}\xB0 C`;
  }
};
var getWeatherIcon = (fahren) => {
  const icons = {
    100: "\uF2C7",
    75: "\uF2C8",
    50: "\uF2C9",
    25: "\uF2CA",
    0: "\uF2CB"
  };
  const colors2 = {
    100: "weather-color red",
    75: "weather-color orange",
    50: "weather-color lavender",
    25: "weather-color blue",
    0: "weather-color sky"
  };
  const threshold = fahren < 0 ? 0 : [100, 75, 50, 25, 0].find((threshold2) => threshold2 <= fahren) || 0;
  const icon6 = icons[threshold || 50];
  const color = colors2[threshold || 50];
  return {
    icon: icon6,
    color
  };
};
var getWindConditions = (wthr, unt) => {
  if (unt === "imperial") {
    return `${Math.floor(wthr.current.wind_mph)} mph`;
  }
  return `${Math.floor(wthr.current.wind_kph)} kph`;
};
var getRainChance = (wthr) => `${wthr.forecast.forecastday[0].day.daily_chance_of_rain}%`;
var isValidWeatherIconTitle = (title) => {
  return title in weatherIcons;
};
var getWeatherStatusTextIcon = (wthr) => {
  let iconQuery = wthr.current.condition.text.trim().toLowerCase().replaceAll(" ", "_");
  if (!wthr.current.is_day && iconQuery === "partly_cloudy") {
    iconQuery = "partly_cloudy_night";
  }
  if (isValidWeatherIconTitle(iconQuery)) {
    return weatherIcons[iconQuery];
  } else {
    console.warn(`Unknown weather icon title: ${iconQuery}`);
    return weatherIcons["warning"];
  }
};
globalThis["globalWeatherVar"] = globalWeatherVar;

// /home/antonio/.config/HyprPanel/customModules/weather/index.ts
var { label: label9, unit, leftClick: leftClick9, rightClick: rightClick17, middleClick: middleClick17, scrollUp: scrollUp13, scrollDown: scrollDown13 } = options_default.bar.customModules.weather;
var Weather = () => {
  const weatherModule = module({
    textIcon: Utils.merge([globalWeatherVar.bind("value")], (wthr) => {
      const weatherStatusIcon = getWeatherStatusTextIcon(wthr);
      return weatherStatusIcon;
    }),
    tooltipText: globalWeatherVar.bind("value").as((v) => `Weather Status: ${v.current.condition.text}`),
    boxClass: "weather-custom",
    label: Utils.merge([globalWeatherVar.bind("value"), unit.bind("value")], (wthr, unt) => {
      if (unt === "imperial") {
        return `${Math.ceil(wthr.current.temp_f)}\xB0 F`;
      } else {
        return `${Math.ceil(wthr.current.temp_c)}\xB0 C`;
      }
    }),
    showLabelBinding: label9.bind("value"),
    props: {
      setup: (self) => {
        inputHandler(self, {
          onPrimaryClick: {
            cmd: leftClick9
          },
          onSecondaryClick: {
            cmd: rightClick17
          },
          onMiddleClick: {
            cmd: middleClick17
          },
          onScrollUp: {
            cmd: scrollUp13
          },
          onScrollDown: {
            cmd: scrollDown13
          }
        });
      }
    }
  });
  return weatherModule;
};

// /home/antonio/.config/HyprPanel/customModules/power/index.ts
var { icon: icon6, leftClick: leftClick10, rightClick: rightClick18, middleClick: middleClick18, scrollUp: scrollUp14, scrollDown: scrollDown14 } = options_default.bar.customModules.power;
var Power = () => {
  const powerModule = module({
    tooltipText: "Power Menu",
    textIcon: icon6.bind("value"),
    boxClass: "powermodule",
    props: {
      setup: (self) => {
        inputHandler(self, {
          onPrimaryClick: {
            cmd: leftClick10
          },
          onSecondaryClick: {
            cmd: rightClick18
          },
          onMiddleClick: {
            cmd: middleClick18
          },
          onScrollUp: {
            cmd: scrollUp14
          },
          onScrollDown: {
            cmd: scrollDown14
          }
        });
      }
    }
  });
  return powerModule;
};

// /home/antonio/.config/HyprPanel/modules/shared/barItemBox.ts
var BarItemBox = (child) => {
  const computeVisible = () => {
    if (child.isVis !== undefined) {
      return child.isVis.bind("value");
    }
    return child.isVisible;
  };
  return Widget.Button({
    class_name: options_default.theme.bar.buttons.style.bind("value").as((style3) => {
      const styleMap = {
        default: "style1",
        split: "style2",
        wave: "style3",
        wave2: "style4"
      };
      const boxClassName = Object.hasOwnProperty.call(child, "boxClass") ? child.boxClass : "";
      return `bar_item_box_visible ${styleMap[style3]} ${boxClassName}`;
    }),
    child: child.component,
    visible: computeVisible(),
    ...child.props
  });
};

// /home/antonio/.config/HyprPanel/modules/bar/Bar.ts
import Gdk2 from "gi://Gdk?version=3.0";

// /home/antonio/.config/HyprPanel/modules/bar/SideEffects.ts
var { showIcon: showIcon2, showTime: showTime2 } = options_default.bar.clock;
showIcon2.connect("changed", () => {
  if (!showTime2.value && !showIcon2.value) {
    showTime2.value = true;
  }
});
showTime2.connect("changed", () => {
  if (!showTime2.value && !showIcon2.value) {
    showIcon2.value = true;
  }
});
var { label: label10, icon: icon7 } = options_default.bar.windowtitle;
label10.connect("changed", () => {
  if (!label10.value && !icon7.value) {
    icon7.value = true;
  }
});
icon7.connect("changed", () => {
  if (!label10.value && !icon7.value) {
    label10.value = true;
  }
});

// /home/antonio/.config/HyprPanel/modules/bar/Bar.ts
function getGdkMonitors() {
  const display = Gdk2.Display.get_default();
  if (display === null) {
    console.error("Failed to get Gdk display.");
    return {};
  }
  const numGdkMonitors = display.get_n_monitors();
  const gdkMonitors = {};
  for (let i = 0;i < numGdkMonitors; i++) {
    const curMonitor = display.get_monitor(i);
    if (curMonitor === null) {
      console.warn(`Monitor at index ${i} is null.`);
      continue;
    }
    const model = curMonitor.get_model() || "";
    const geometry = curMonitor.get_geometry();
    const scaleFactor = curMonitor.get_scale_factor();
    const key2 = `${model}_${geometry.width}x${geometry.height}_${scaleFactor}`;
    gdkMonitors[i] = { key: key2, model, used: false };
  }
  return gdkMonitors;
}
var hyprland9 = await Service.import("hyprland");
var { layouts } = options_default.bar;
var { location: location2 } = options_default.theme.bar;
var getLayoutForMonitor = (monitor, layouts2) => {
  const matchingKey = Object.keys(layouts2).find((key2) => key2 === monitor.toString());
  const wildcard = Object.keys(layouts2).find((key2) => key2 === "*");
  if (matchingKey) {
    return layouts2[matchingKey];
  }
  if (wildcard) {
    return layouts2[wildcard];
  }
  return {
    left: ["dashboard", "workspaces", "windowtitle"],
    middle: ["media"],
    right: ["volume", "network", "bluetooth", "battery", "systray", "clock", "notifications"]
  };
};
var widget = {
  battery: () => BarItemBox(BatteryLabel()),
  dashboard: () => BarItemBox(Menu()),
  workspaces: (monitor) => BarItemBox(Workspaces(monitor)),
  windowtitle: () => BarItemBox(ClientTitle()),
  media: () => BarItemBox(Media()),
  notifications: () => BarItemBox(Notifications()),
  volume: () => BarItemBox(Volume()),
  network: () => BarItemBox(Network()),
  bluetooth: () => BarItemBox(Bluetooth()),
  clock: () => BarItemBox(Clock()),
  systray: () => BarItemBox(SysTray()),
  ram: () => BarItemBox(Ram()),
  cpu: () => BarItemBox(Cpu()),
  storage: () => BarItemBox(Storage()),
  netstat: () => BarItemBox(Netstat()),
  kbinput: () => BarItemBox(KbInput()),
  updates: () => BarItemBox(Updates()),
  submap: () => BarItemBox(Submap()),
  weather: () => BarItemBox(Weather()),
  power: () => BarItemBox(Power())
};
var gdkMonitorIdToHyprlandId = (monitor, usedHyprlandMonitors) => {
  const gdkMonitors = getGdkMonitors();
  if (Object.keys(gdkMonitors).length === 0) {
    console.error("No GDK monitors were found.");
    return monitor;
  }
  const gdkMonitor = gdkMonitors[monitor];
  const directMatch = hyprland9.monitors.find((hypMon) => {
    const hyprlandKey = `${hypMon.model}_${hypMon.width}x${hypMon.height}_${hypMon.scale}`;
    return gdkMonitor.key.startsWith(hyprlandKey) && !usedHyprlandMonitors.has(hypMon.id) && hypMon.id === monitor;
  });
  if (directMatch) {
    usedHyprlandMonitors.add(directMatch.id);
    return directMatch.id;
  }
  const hyprlandMonitor = hyprland9.monitors.find((hypMon) => {
    const hyprlandKey = `${hypMon.model}_${hypMon.width}x${hypMon.height}_${hypMon.scale}`;
    return gdkMonitor.key.startsWith(hyprlandKey) && !usedHyprlandMonitors.has(hypMon.id);
  });
  if (hyprlandMonitor) {
    usedHyprlandMonitors.add(hyprlandMonitor.id);
    return hyprlandMonitor.id;
  }
  const fallbackMonitor = hyprland9.monitors.find((hypMon) => !usedHyprlandMonitors.has(hypMon.id));
  if (fallbackMonitor) {
    usedHyprlandMonitors.add(fallbackMonitor.id);
    return fallbackMonitor.id;
  }
  for (let i = 0;i < hyprland9.monitors.length; i++) {
    if (!usedHyprlandMonitors.has(i)) {
      usedHyprlandMonitors.add(i);
      return i;
    }
  }
  console.warn(`Returning original monitor index as a last resort: ${monitor}`);
  return monitor;
};
var Bar = (() => {
  const usedHyprlandMonitors = new Set;
  return (monitor) => {
    const hyprlandMonitor = gdkMonitorIdToHyprlandId(monitor, usedHyprlandMonitors);
    return Widget.Window({
      name: `bar-${hyprlandMonitor}`,
      class_name: "bar",
      monitor,
      visible: true,
      anchor: location2.bind("value").as((ln) => [ln, "left", "right"]),
      exclusivity: "exclusive",
      layer: Utils.merge([options_default.theme.bar.layer.bind("value"), options_default.tear.bind("value")], (barLayer, tear) => {
        if (tear && barLayer === "overlay") {
          return "top";
        }
        return barLayer;
      }),
      child: Widget.Box({
        class_name: "bar-panel-container",
        child: Widget.CenterBox({
          class_name: "bar-panel",
          css: "padding: 1px",
          startWidget: Widget.Box({
            class_name: "box-left",
            hexpand: true,
            setup: (self) => {
              self.hook(layouts, (self2) => {
                const foundLayout = getLayoutForMonitor(hyprlandMonitor, layouts.value);
                self2.children = foundLayout.left.filter((mod) => Object.keys(widget).includes(mod)).map((w) => widget[w](hyprlandMonitor));
              });
            }
          }),
          centerWidget: Widget.Box({
            class_name: "box-center",
            hpack: "center",
            setup: (self) => {
              self.hook(layouts, (self2) => {
                const foundLayout = getLayoutForMonitor(hyprlandMonitor, layouts.value);
                self2.children = foundLayout.middle.filter((mod) => Object.keys(widget).includes(mod)).map((w) => widget[w](hyprlandMonitor));
              });
            }
          }),
          endWidget: Widget.Box({
            class_name: "box-right",
            hpack: "end",
            setup: (self) => {
              self.hook(layouts, (self2) => {
                const foundLayout = getLayoutForMonitor(hyprlandMonitor, layouts.value);
                self2.children = foundLayout.right.filter((mod) => Object.keys(widget).includes(mod)).map((w) => widget[w](hyprlandMonitor));
              });
            }
          })
        })
      })
    });
  };
})();

// /home/antonio/.config/HyprPanel/globals/window.ts
var WINDOW_LAYOUTS = [
  "center",
  "top",
  "top-right",
  "top-center",
  "top-left",
  "bottom-left",
  "bottom-center",
  "bottom-right"
];

// /home/antonio/.config/HyprPanel/modules/menus/shared/popup/index.ts
var Padding = (name, opts) => Widget.EventBox({
  class_name: opts?.className || "",
  hexpand: true,
  vexpand: typeof opts?.vexpand === "boolean" ? opts.vexpand : true,
  can_focus: false,
  child: Widget.Box(),
  setup: (w) => w.on("button-press-event", () => App.toggleWindow(name))
});
var PopupRevealer = (name, child, transition = "slide_down") => Widget.Box({ css: "padding: 1px;" }, Widget.Revealer({
  transition,
  child: Widget.Box({
    class_name: `window-content ${name}-window`,
    child
  }),
  transitionDuration: 200,
  setup: (self) => self.hook(App, (_, wname, visible) => {
    if (wname === name)
      self.reveal_child = visible;
  })
}));
var Layout = (name, child, transition) => ({
  center: () => Widget.CenterBox({}, Padding(name, {}), Widget.CenterBox({ vertical: true }, Padding(name, {}), PopupRevealer(name, child, transition), Padding(name, {})), Padding(name, {})),
  top: () => Widget.CenterBox({}, Padding(name, {}), Widget.Box({ vertical: true }, PopupRevealer(name, child, transition), Padding(name, {})), Padding(name, {})),
  "top-right": () => Widget.Box({}, Padding(name, {}), Widget.Box({
    hexpand: false,
    vertical: true
  }, Padding(name, {
    vexpand: false,
    className: "event-top-padding"
  }), PopupRevealer(name, child, transition), Padding(name, {}))),
  "top-center": () => Widget.Box({}, Padding(name, {}), Widget.Box({
    hexpand: false,
    vertical: true
  }, Padding(name, {
    vexpand: false,
    className: "event-top-padding"
  }), PopupRevealer(name, child, transition), Padding(name, {})), Padding(name, {})),
  "top-left": () => Widget.Box({}, Widget.Box({
    hexpand: false,
    vertical: true
  }, Padding(name, {
    vexpand: false,
    className: "event-top-padding"
  }), PopupRevealer(name, child, transition), Padding(name, {})), Padding(name, {})),
  "bottom-left": () => Widget.Box({}, Widget.Box({
    hexpand: false,
    vertical: true
  }, Padding(name, {}), PopupRevealer(name, child, transition)), Padding(name, {})),
  "bottom-center": () => Widget.Box({}, Padding(name, {}), Widget.Box({
    hexpand: false,
    vertical: true
  }, Padding(name, {}), PopupRevealer(name, child, transition)), Padding(name, {})),
  "bottom-right": () => Widget.Box({}, Padding(name, {}), Widget.Box({
    hexpand: false,
    vertical: true
  }, Padding(name, {}), PopupRevealer(name, child, transition)))
});
var isValidLayout = (layout) => {
  return WINDOW_LAYOUTS.includes(layout);
};
var popup_default = ({
  name,
  child,
  layout = "center",
  transition,
  exclusivity = "ignore",
  ...props
}) => {
  const layoutFn = isValidLayout(layout) ? layout : "center";
  const layoutWidget = Layout(name, child, transition)[layoutFn]();
  return Widget.Window({
    name,
    class_names: [name, "popup-window"],
    setup: (w) => w.keybind("Escape", () => App.closeWindow(name)),
    visible: false,
    keymode: "on-demand",
    exclusivity,
    layer: "top",
    anchor: ["top", "bottom", "right", "left"],
    child: layoutWidget,
    ...props
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/power/helpers/actions.ts
var { sleep, reboot, logout, shutdown } = options_default.menus.dashboard.powermenu;

class PowerMenu extends Service {
  static {
    Service.register(this, {}, {
      title: ["string"],
      cmd: ["string"]
    });
  }
  #title = "";
  #cmd = "";
  get title() {
    return this.#title;
  }
  action(action) {
    [this.#cmd, this.#title] = {
      sleep: [sleep.value, "Sleep"],
      reboot: [reboot.value, "Reboot"],
      logout: [logout.value, "Log Out"],
      shutdown: [shutdown.value, "Shutdown"]
    }[action];
    this.notify("cmd");
    this.notify("title");
    this.emit("changed");
    App.closeWindow("powermenu");
    App.openWindow("verification");
  }
  customAction(action, cmnd) {
    [this.#cmd, this.#title] = [cmnd, action];
    this.notify("cmd");
    this.notify("title");
    this.emit("changed");
    App.closeWindow("powermenu");
    App.openWindow("verification");
  }
  shutdown = () => {
    this.action("shutdown");
  };
  exec = () => {
    App.closeWindow("verification");
    Utils.execAsync(this.#cmd);
  };
}
var powermenu = new PowerMenu;
Object.assign(globalThis, { powermenu });
var actions_default = powermenu;

// /home/antonio/.config/HyprPanel/modules/icons/index.ts
var icons_default2 = {
  missing: "image-missing-symbolic",
  nix: {
    nix: "nix-snowflake-symbolic"
  },
  app: {
    terminal: "terminal-symbolic"
  },
  fallback: {
    executable: "application-x-executable",
    notification: "dialog-information-symbolic",
    video: "video-x-generic-symbolic",
    audio: "audio-x-generic-symbolic"
  },
  ui: {
    close: "window-close-symbolic",
    colorpicker: "color-select-symbolic",
    info: "info-symbolic",
    link: "external-link-symbolic",
    lock: "system-lock-screen-symbolic",
    menu: "open-menu-symbolic",
    refresh: "view-refresh-symbolic",
    search: "system-search-symbolic",
    settings: "emblem-system-symbolic",
    themes: "preferences-desktop-theme-symbolic",
    tick: "object-select-symbolic",
    time: "hourglass-symbolic",
    toolbars: "toolbars-symbolic",
    warning: "dialog-warning-symbolic",
    avatar: "avatar-default-symbolic",
    arrow: {
      right: "pan-end-symbolic",
      left: "pan-start-symbolic",
      down: "pan-down-symbolic",
      up: "pan-up-symbolic"
    }
  },
  audio: {
    mic: {
      muted: "microphone-disabled-symbolic",
      low: "microphone-sensitivity-low-symbolic",
      medium: "microphone-sensitivity-medium-symbolic",
      high: "microphone-sensitivity-high-symbolic"
    },
    volume: {
      muted: "audio-volume-muted-symbolic",
      low: "audio-volume-low-symbolic",
      medium: "audio-volume-medium-symbolic",
      high: "audio-volume-high-symbolic",
      overamplified: "audio-volume-overamplified-symbolic"
    },
    type: {
      headset: "audio-headphones-symbolic",
      speaker: "audio-speakers-symbolic",
      card: "audio-card-symbolic"
    },
    mixer: "mixer-symbolic"
  },
  powerprofile: {
    balanced: "power-profile-balanced-symbolic",
    "power-saver": "power-profile-power-saver-symbolic",
    performance: "power-profile-performance-symbolic"
  },
  asusctl: {
    profile: {
      Balanced: "power-profile-balanced-symbolic",
      Quiet: "power-profile-power-saver-symbolic",
      Performance: "power-profile-performance-symbolic"
    },
    mode: {
      Integrated: "processor-symbolic",
      Hybrid: "controller-symbolic"
    }
  },
  battery: {
    charging: "battery-flash-symbolic",
    warning: "battery-empty-symbolic"
  },
  bluetooth: {
    enabled: "bluetooth-active-symbolic",
    disabled: "bluetooth-disabled-symbolic"
  },
  brightness: {
    indicator: "display-brightness-symbolic",
    keyboard: "keyboard-brightness-symbolic",
    screen: "display-brightness-symbolic"
  },
  powermenu: {
    sleep: "weather-clear-night-symbolic",
    reboot: "system-reboot-symbolic",
    logout: "system-log-out-symbolic",
    shutdown: "system-shutdown-symbolic"
  },
  recorder: {
    recording: "media-record-symbolic"
  },
  notifications: {
    noisy: "org.gnome.Settings-notifications-symbolic",
    silent: "notifications-disabled-symbolic",
    message: "chat-bubbles-symbolic"
  },
  trash: {
    full: "user-trash-full-symbolic",
    empty: "user-trash-symbolic"
  },
  mpris: {
    shuffle: {
      enabled: "media-playlist-shuffle-symbolic",
      disabled: "media-playlist-consecutive-symbolic"
    },
    loop: {
      none: "media-playlist-repeat-symbolic",
      track: "media-playlist-repeat-song-symbolic",
      playlist: "media-playlist-repeat-symbolic"
    },
    playing: "media-playback-pause-symbolic",
    paused: "media-playback-start-symbolic",
    stopped: "media-playback-start-symbolic",
    prev: "media-skip-backward-symbolic",
    next: "media-skip-forward-symbolic"
  },
  system: {
    cpu: "org.gnome.SystemMonitor-symbolic",
    ram: "drive-harddisk-solidstate-symbolic",
    temp: "temperature-symbolic"
  },
  color: {
    dark: "dark-mode-symbolic",
    light: "light-mode-symbolic"
  },
  weather: {
    warning: "dialog-warning-symbolic",
    sunny: "weather-clear-symbolic",
    clear: "weather-clear-night-symbolic",
    partly_cloudy: "weather-few-clouds-symbolic",
    partly_cloudy_night: "weather-few-clouds-night-symbolic",
    cloudy: "weather-overcast-symbolic",
    overcast: "weather-overcast-symbolic",
    mist: "weather-overcast-symbolic",
    patchy_rain_nearby: "weather-showers-scattered-symbolic",
    patchy_rain_possible: "weather-showers-scattered-symbolic",
    patchy_snow_possible: "weather-snow-symbolic",
    patchy_sleet_possible: "weather-snow-symbolic",
    patchy_freezing_drizzle_possible: "weather-showers-scattered-symbolic",
    thundery_outbreaks_possible: "weather-overcast-symbolic",
    blowing_snow: "weather-snow-symbolic",
    blizzard: "weather-snow-symbolic",
    fog: "weather-fog-symbolic",
    freezing_fog: "weather-fog-symbolic",
    patchy_light_drizzle: "weather-showers-scattered-symbolic",
    light_drizzle: "weather-showers-symbolic",
    freezing_drizzle: "weather-showers-symbolic",
    heavy_freezing_drizzle: "weather-showers-symbolic",
    patchy_light_rain: "weather-showers-scattered-symbolic",
    light_rain: "weather-showers-symbolic",
    moderate_rain_at_times: "weather-showers-symbolic",
    moderate_rain: "weather-showers-symbolic",
    heavy_rain_at_times: "weather-showers-symbolic",
    heavy_rain: "weather-showers-symbolic",
    light_freezing_rain: "weather-showers-symbolic",
    moderate_or_heavy_freezing_rain: "weather-showers-symbolic",
    light_sleet: "weather-snow-symbolic",
    moderate_or_heavy_sleet: "weather-snow-symbolic",
    patchy_light_snow: "weather-snow-symbolic",
    light_snow: "weather-snow-symbolic",
    patchy_moderate_snow: "weather-snow-symbolic",
    moderate_snow: "weather-snow-symbolic",
    patchy_heavy_snow: "weather-snow-symbolic",
    heavy_snow: "weather-snow-symbolic",
    ice_pellets: "weather-showers-symbolic",
    light_rain_shower: "weather-showers-symbolic",
    moderate_or_heavy_rain_shower: "weather-showers-symbolic",
    torrential_rain_shower: "weather-showers-symbolic",
    light_sleet_showers: "weather-showers-symbolic",
    moderate_or_heavy_sleet_showers: "weather-showers-symbolic",
    light_snow_showers: "weather-snow-symbolic",
    moderate_or_heavy_snow_showers: "weather-snow-symbolic",
    light_showers_of_ice_pellets: "weather-showers-symbolic",
    moderate_or_heavy_showers_of_ice_pellets: "weather-showers-symbolic",
    patchy_light_rain_with_thunder: "weather-showers-scattered-symbolic",
    moderate_or_heavy_rain_with_thunder: "weather-showers-symbolic",
    patchy_light_snow_with_thunder: "weather-snow-symbolic",
    moderate_or_heavy_snow_with_thunder: "weather-snow-symbolic"
  }
};

// /home/antonio/.config/HyprPanel/modules/menus/power/index.ts
var SysButton = (action, label11) => Widget.Button({
  class_name: `widget-button powermenu-button-${action}`,
  on_clicked: () => actions_default.action(action),
  child: Widget.Box({
    vertical: true,
    class_name: "system-button widget-box",
    children: [
      Widget.Icon({
        class_name: `system-button_icon ${action}`,
        icon: icons_default2.powermenu[action]
      }),
      Widget.Label({
        class_name: `system-button_label ${action}`,
        label: label11
      })
    ]
  })
});
var power_default = () => popup_default({
  name: "powermenu",
  transition: "crossfade",
  child: Widget.Box({
    class_name: "powermenu horizontal",
    children: [
      SysButton("shutdown", "SHUTDOWN"),
      SysButton("logout", "LOG OUT"),
      SysButton("reboot", "REBOOT"),
      SysButton("sleep", "SLEEP")
    ]
  })
});

// /home/antonio/.config/HyprPanel/modules/menus/power/verification.ts
var verification_default = () => popup_default({
  name: "verification",
  transition: "crossfade",
  child: Widget.Box({
    class_name: "verification",
    child: Widget.Box({
      class_name: "verification-content",
      expand: true,
      vertical: true,
      children: [
        Widget.Box({
          class_name: "text-box",
          vertical: true,
          children: [
            Widget.Label({
              class_name: "title",
              label: actions_default.bind("title").as((t) => t.toUpperCase())
            }),
            Widget.Label({
              class_name: "desc",
              label: actions_default.bind("title").as((p) => `Are you sure you want to ${p.toLowerCase()}?`)
            })
          ]
        }),
        Widget.Box({
          class_name: "buttons horizontal",
          vexpand: true,
          vpack: "end",
          homogeneous: true,
          children: [
            Widget.Button({
              class_name: "verification-button bar-verification_yes",
              child: Widget.Label("Yes"),
              on_clicked: actions_default.exec
            }),
            Widget.Button({
              class_name: "verification-button bar-verification_no",
              child: Widget.Label("No"),
              on_clicked: () => App.toggleWindow("verification")
            })
          ]
        })
      ]
    })
  })
});

// /home/antonio/.config/HyprPanel/modules/menus/shared/dropdown/locationHandler/index.ts
var hyprland10 = await Service.import("hyprland");
var { location: location3 } = options_default.theme.bar;
var { scalingPriority } = options_default;
var moveBoxToCursor = (self, fixed) => {
  if (fixed) {
    return;
  }
  globalMousePos.connect("changed", async ({ value }) => {
    const curHyprlandMonitor = hyprland10.monitors.find((m) => m.id === hyprland10.active.monitor.id);
    const dropdownWidth = self.child.get_allocation().width;
    const dropdownHeight = self.child.get_allocation().height;
    let hyprScaling = 1;
    try {
      const monitorInfo = await bash("hyprctl monitors -j");
      const parsedMonitorInfo = JSON.parse(monitorInfo);
      const foundMonitor = parsedMonitorInfo.find((monitor) => monitor.id === hyprland10.active.monitor.id);
      hyprScaling = foundMonitor?.scale || 1;
    } catch (error) {
      console.error(`Error parsing hyprland monitors: ${error}`);
    }
    let monWidth = curHyprlandMonitor?.width;
    let monHeight = curHyprlandMonitor?.height;
    if (monWidth === undefined || monHeight === undefined || hyprScaling === undefined) {
      return;
    }
    const gdkScale = Utils.exec('bash -c "echo $GDK_SCALE"');
    if (scalingPriority.value === "both") {
      const scale = parseFloat(gdkScale);
      monWidth = monWidth / scale;
      monHeight = monHeight / scale;
      monWidth = monWidth / hyprScaling;
      monHeight = monHeight / hyprScaling;
    } else if (/^\d+(.\d+)?$/.test(gdkScale) && scalingPriority.value === "gdk") {
      const scale = parseFloat(gdkScale);
      monWidth = monWidth / scale;
      monHeight = monHeight / scale;
    } else {
      monWidth = monWidth / hyprScaling;
      monHeight = monHeight / hyprScaling;
    }
    const isVertical = curHyprlandMonitor?.transform !== undefined ? curHyprlandMonitor.transform % 2 !== 0 : false;
    if (isVertical) {
      [monWidth, monHeight] = [monHeight, monWidth];
    }
    let marginRight = monWidth - dropdownWidth / 2;
    marginRight = fixed ? marginRight - monWidth / 2 : marginRight - value[0];
    let marginLeft = monWidth - dropdownWidth - marginRight;
    const minimumMargin = 0;
    if (marginRight < minimumMargin) {
      marginRight = minimumMargin;
      marginLeft = monWidth - dropdownWidth - minimumMargin;
    }
    if (marginLeft < minimumMargin) {
      marginLeft = minimumMargin;
      marginRight = monWidth - dropdownWidth - minimumMargin;
    }
    self.set_margin_left(marginLeft);
    self.set_margin_right(marginRight);
    if (location3.value === "top") {
      self.set_margin_top(0);
      self.set_margin_bottom(monHeight);
    } else {
      self.set_margin_bottom(0);
      self.set_margin_top(monHeight - dropdownHeight);
    }
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/shared/dropdown/eventBoxes/index.ts
var createEventBox = (className, windowName) => {
  return Widget.EventBox({
    class_name: className,
    hexpand: true,
    vexpand: false,
    can_focus: false,
    child: Widget.Box(),
    setup: (w) => {
      w.on("button-press-event", () => App.toggleWindow(windowName));
    }
  });
};
var barEventMargins = (windowName, location4 = "top") => {
  if (location4 === "top") {
    return [
      createEventBox("mid-eb event-top-padding-static", windowName),
      createEventBox("mid-eb event-top-padding", windowName)
    ];
  } else {
    return [
      createEventBox("mid-eb event-bottom-padding", windowName),
      createEventBox("mid-eb event-bottom-padding-static", windowName)
    ];
  }
};

// /home/antonio/.config/HyprPanel/modules/menus/shared/dropdown/index.ts
var { location: location4 } = options_default.theme.bar;
var initRender = Variable(true);
setTimeout(() => {
  initRender.value = false;
}, 2000);
var dropdown_default = ({
  name,
  child,
  transition,
  exclusivity = "ignore",
  fixed = false,
  ...props
}) => Widget.Window({
  name,
  class_names: [name, "dropdown-menu"],
  setup: (w) => w.keybind("Escape", () => App.closeWindow(name)),
  visible: initRender.bind("value"),
  keymode: "on-demand",
  exclusivity,
  layer: "top",
  anchor: location4.bind("value").as((ln) => [ln, "left"]),
  child: Widget.EventBox({
    class_name: "parent-event",
    on_primary_click: () => App.closeWindow(name),
    on_secondary_click: () => App.closeWindow(name),
    child: Widget.Box({
      class_name: "top-eb",
      vertical: true,
      children: [
        Widget.Box({
          className: "event-box-container",
          children: location4.bind("value").as((lcn) => {
            if (lcn === "top") {
              return barEventMargins(name);
            } else {
              return [];
            }
          })
        }),
        Widget.EventBox({
          class_name: "in-eb menu-event-box",
          on_primary_click: () => {
            return true;
          },
          on_secondary_click: () => {
            return true;
          },
          setup: (self) => {
            moveBoxToCursor(self, fixed);
          },
          child: Widget.Box({
            class_name: "dropdown-menu-container",
            css: "padding: 1px; margin: -1px;",
            child: Widget.Revealer({
              revealChild: false,
              setup: (self) => self.hook(App, (_, wname, visible) => {
                if (wname === name)
                  self.reveal_child = visible;
              }),
              transition,
              transitionDuration: 350,
              child: Widget.Box({
                class_name: "dropdown-menu-container",
                can_focus: true,
                children: [child]
              })
            })
          })
        }),
        Widget.Box({
          className: "event-box-container",
          children: location4.bind("value").as((lcn) => {
            if (lcn === "bottom") {
              return barEventMargins(name);
            } else {
              return [];
            }
          })
        })
      ]
    })
  }),
  ...props
});

// /home/antonio/.config/HyprPanel/modules/menus/audio/utils.ts
var speakerIcons = {
  101: "audio-volume-overamplified-symbolic",
  66: "audio-volume-high-symbolic",
  34: "audio-volume-medium-symbolic",
  1: "audio-volume-low-symbolic",
  0: "audio-volume-muted-symbolic"
};
var inputIcons = {
  101: "microphone-sensitivity-high-symbolic",
  66: "microphone-sensitivity-high-symbolic",
  34: "microphone-sensitivity-medium-symbolic",
  1: "microphone-sensitivity-low-symbolic",
  0: "microphone-disabled-symbolic"
};
var getIcon = (audioVol, isMuted) => {
  const thresholds = [101, 66, 34, 1, 0];
  const icon8 = isMuted ? 0 : thresholds.find((threshold) => threshold <= audioVol * 100) || 0;
  return {
    spkr: speakerIcons[icon8],
    mic: inputIcons[icon8]
  };
};

// /home/antonio/.config/HyprPanel/modules/menus/audio/active/SelectedInput.ts
var audio2 = await Service.import("audio");
var renderActiveInput = () => {
  return [
    Widget.Box({
      class_name: "menu-slider-container input",
      children: [
        Widget.Button({
          vexpand: false,
          vpack: "end",
          setup: (self) => {
            self.hook(audio2, () => {
              const mic = audio2.microphone;
              const className = `menu-active-button input ${mic.is_muted ? "muted" : ""}`;
              return self.class_name = className;
            });
          },
          on_primary_click: () => audio2.microphone.is_muted = !audio2.microphone.is_muted,
          child: Widget.Icon({
            class_name: "menu-active-icon input",
            setup: (self) => {
              self.hook(audio2, () => {
                const isMicMuted = audio2.microphone.is_muted !== null ? audio2.microphone.is_muted : true;
                if (audio2.microphone.volume > 0) {
                  self.icon = getIcon(audio2.microphone.volume, isMicMuted)["mic"];
                  return;
                }
                self.icon = getIcon(100, false)["mic"];
              });
            }
          })
        }),
        Widget.Box({
          vertical: true,
          children: [
            Widget.Label({
              class_name: "menu-active input",
              hpack: "start",
              truncate: "end",
              wrap: true,
              label: audio2.bind("microphone").as((v) => v.description === null ? "No input device found..." : v.description)
            }),
            Widget.Slider({
              value: audio2.microphone.bind("volume").as((v) => v),
              class_name: "menu-active-slider menu-slider inputs",
              draw_value: false,
              hexpand: true,
              min: 0,
              max: 1,
              onChange: ({ value }) => audio2.microphone.volume = value
            })
          ]
        }),
        Widget.Label({
          class_name: "menu-active-percentage input",
          vpack: "end",
          label: audio2.microphone.bind("volume").as((v) => `${Math.round(v * 100)}%`)
        })
      ]
    })
  ];
};

// /home/antonio/.config/HyprPanel/modules/menus/audio/active/SelectedPlayback.ts
var audio3 = await Service.import("audio");
var renderActivePlayback = () => {
  return [
    Widget.Box({
      class_name: "menu-slider-container playback",
      children: [
        Widget.Button({
          vexpand: false,
          vpack: "end",
          setup: (self) => {
            self.hook(audio3, () => {
              const spkr = audio3.speaker;
              const className = `menu-active-button playback ${spkr.is_muted ? "muted" : ""}`;
              return self.class_name = className;
            });
          },
          on_primary_click: () => audio3.speaker.is_muted = !audio3.speaker.is_muted,
          child: Widget.Icon({
            class_name: "menu-active-icon playback",
            setup: (self) => {
              self.hook(audio3, () => {
                const isSpeakerMuted = audio3.speaker.is_muted !== null ? audio3.speaker.is_muted : true;
                self.icon = getIcon(audio3.speaker.volume, isSpeakerMuted)["spkr"];
              });
            }
          })
        }),
        Widget.Box({
          vertical: true,
          children: [
            Widget.Label({
              class_name: "menu-active playback",
              hpack: "start",
              truncate: "end",
              expand: true,
              wrap: true,
              label: audio3.bind("speaker").as((v) => v.description || "")
            }),
            Widget.Slider({
              value: audio3["speaker"].bind("volume"),
              class_name: "menu-active-slider menu-slider playback",
              draw_value: false,
              hexpand: true,
              min: 0,
              max: 1,
              onChange: ({ value }) => audio3.speaker.volume = value
            })
          ]
        }),
        Widget.Label({
          vpack: "end",
          class_name: "menu-active-percentage playback",
          label: audio3.speaker.bind("volume").as((v) => `${Math.round(v * 100)}%`)
        })
      ]
    })
  ];
};

// /home/antonio/.config/HyprPanel/modules/menus/audio/active/index.ts
var activeDevices = () => {
  return Widget.Box({
    class_name: "menu-section-container volume",
    vertical: true,
    children: [
      Widget.Box({
        class_name: "menu-label-container volume selected",
        hpack: "fill",
        child: Widget.Label({
          class_name: "menu-label audio volume",
          hexpand: true,
          hpack: "start",
          label: "Volume"
        })
      }),
      Widget.Box({
        class_name: "menu-items-section selected",
        vertical: true,
        children: [
          Widget.Box({
            class_name: "menu-active-container playback",
            vertical: true,
            children: renderActivePlayback()
          }),
          Widget.Box({
            class_name: "menu-active-container input",
            vertical: true,
            children: renderActiveInput()
          })
        ]
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/audio/available/InputDevices.ts
var audio4 = await Service.import("audio");
var renderInputDevices = (inputDevices) => {
  if (inputDevices.length === 0) {
    return [
      Widget.Button({
        class_name: `menu-unfound-button input`,
        child: Widget.Box({
          children: [
            Widget.Box({
              hpack: "start",
              children: [
                Widget.Label({
                  class_name: "menu-button-name input",
                  label: "No input devices found..."
                })
              ]
            })
          ]
        })
      })
    ];
  }
  return inputDevices.map((device) => {
    return Widget.Button({
      on_primary_click: () => audio4.microphone = device,
      class_name: `menu-button audio input ${device}`,
      child: Widget.Box({
        children: [
          Widget.Box({
            hpack: "start",
            children: [
              Widget.Label({
                wrap: true,
                class_name: audio4.microphone.bind("description").as((v) => device.description === v ? "menu-button-icon active input txt-icon" : "menu-button-icon input txt-icon"),
                label: "\uEC1C"
              }),
              Widget.Label({
                truncate: "end",
                wrap: true,
                class_name: audio4.microphone.bind("description").as((v) => device.description === v ? "menu-button-name active input" : "menu-button-name input"),
                label: device.description
              })
            ]
          })
        ]
      })
    });
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/audio/available/PlaybackDevices.ts
var audio5 = await Service.import("audio");
var renderPlaybacks = (playbackDevices) => {
  return playbackDevices.map((device) => {
    if (device.description === "Dummy Output") {
      return Widget.Box({
        class_name: "menu-unfound-button playback",
        child: Widget.Box({
          children: [
            Widget.Label({
              class_name: "menu-button-name playback",
              label: "No playback devices found..."
            })
          ]
        })
      });
    }
    return Widget.Button({
      class_name: `menu-button audio playback ${device}`,
      on_primary_click: () => audio5.speaker = device,
      child: Widget.Box({
        children: [
          Widget.Box({
            hpack: "start",
            children: [
              Widget.Label({
                truncate: "end",
                wrap: true,
                class_name: audio5.speaker.bind("description").as((v) => device.description === v ? "menu-button-icon active playback txt-icon" : "menu-button-icon playback txt-icon"),
                label: "\uE638"
              }),
              Widget.Label({
                truncate: "end",
                wrap: true,
                class_name: audio5.speaker.bind("description").as((v) => device.description === v ? "menu-button-name active playback" : "menu-button-name playback"),
                label: device.description
              })
            ]
          })
        ]
      })
    });
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/audio/available/index.ts
var audio6 = await Service.import("audio");
var availableDevices = () => {
  return Widget.Box({
    vertical: true,
    children: [
      Widget.Box({
        class_name: "menu-section-container playback",
        vertical: true,
        children: [
          Widget.Box({
            class_name: "menu-label-container playback",
            hpack: "fill",
            child: Widget.Label({
              class_name: "menu-label audio playback",
              hexpand: true,
              hpack: "start",
              label: "Playback Devices"
            })
          }),
          Widget.Box({
            class_name: "menu-items-section playback",
            vertical: true,
            children: [
              Widget.Box({
                class_name: "menu-container playback",
                vertical: true,
                children: [
                  Widget.Box({
                    vertical: true,
                    children: audio6.bind("speakers").as((v) => renderPlaybacks(v))
                  })
                ]
              })
            ]
          }),
          Widget.Box({
            class_name: "menu-label-container input",
            hpack: "fill",
            child: Widget.Label({
              class_name: "menu-label audio input",
              hexpand: true,
              hpack: "start",
              label: "Input Devices"
            })
          }),
          Widget.Box({
            class_name: "menu-items-section input",
            vertical: true,
            children: [
              Widget.Box({
                class_name: "menu-container input",
                vertical: true,
                children: [
                  Widget.Box({
                    vertical: true,
                    children: audio6.bind("microphones").as((v) => renderInputDevices(v))
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/audio/index.ts
var audio_default = () => {
  return dropdown_default({
    name: "audiomenu",
    transition: "crossfade",
    child: Widget.Box({
      class_name: "menu-items audio",
      hpack: "fill",
      hexpand: true,
      child: Widget.Box({
        vertical: true,
        hpack: "fill",
        hexpand: true,
        class_name: "menu-items-container audio",
        children: [activeDevices(), availableDevices()]
      })
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/network/ethernet/index.ts
var network2 = await Service.import("network");
var Ethernet = () => {
  return Widget.Box({
    class_name: "menu-section-container ethernet",
    vertical: true,
    children: [
      Widget.Box({
        class_name: "menu-label-container",
        hpack: "fill",
        child: Widget.Label({
          class_name: "menu-label",
          hexpand: true,
          hpack: "start",
          label: "Ethernet"
        })
      }),
      Widget.Box({
        class_name: "menu-items-section",
        vertical: true,
        child: Widget.Box({
          class_name: "menu-content",
          vertical: true,
          setup: (self) => {
            self.hook(network2, () => {
              return self.child = Widget.Box({
                class_name: "network-element-item",
                child: Widget.Box({
                  hpack: "start",
                  children: [
                    Widget.Icon({
                      class_name: `network-icon ethernet ${network2.wired.state === "activated" ? "active" : ""}`,
                      tooltip_text: network2.wired.internet,
                      icon: `${network2.wired["icon_name"]}`
                    }),
                    Widget.Box({
                      class_name: "connection-container",
                      vertical: true,
                      children: [
                        Widget.Label({
                          class_name: "active-connection",
                          hpack: "start",
                          truncate: "end",
                          wrap: true,
                          label: `Ethernet Connection ${network2.wired.state !== "unknown" && typeof network2.wired?.speed === "number" ? `(${network2.wired?.speed / 1000} Gbps)` : ""}`
                        }),
                        Widget.Label({
                          hpack: "start",
                          class_name: "connection-status dim",
                          label: network2.wired.internet.charAt(0).toUpperCase() + network2.wired.internet.slice(1)
                        })
                      ]
                    })
                  ]
                })
              });
            });
          }
        })
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/network/utils.ts
var getWifiIcon = (iconName) => {
  const deviceIconMap = [
    ["network-wireless-acquiring", "\uDB82\uDD29"],
    ["network-wireless-connected", "\uDB82\uDD28"],
    ["network-wireless-encrypted", "\uDB82\uDD2A"],
    ["network-wireless-hotspot", "\uDB82\uDD28"],
    ["network-wireless-no-route", "\uDB82\uDD29"],
    ["network-wireless-offline", "\uDB82\uDD2E"],
    ["network-wireless-signal-excellent", "\uDB82\uDD28"],
    ["network-wireless-signal-good", "\uDB82\uDD25"],
    ["network-wireless-signal-ok", "\uDB82\uDD22"],
    ["network-wireless-signal-weak", "\uDB82\uDD1F"],
    ["network-wireless-signal-none", "\uDB82\uDD2F"]
  ];
  const foundMatch = deviceIconMap.find((icon8) => RegExp(icon8[0]).test(iconName.toLowerCase()));
  return foundMatch ? foundMatch[1] : "\uDB82\uDD28";
};

// /home/antonio/.config/HyprPanel/globals/network.ts
var WIFI_STATUS_MAP = {
  unknown: "Status Unknown",
  unmanaged: "Unmanaged",
  unavailable: "Unavailable",
  disconnected: "Disconnected",
  prepare: "Preparing Connecting",
  config: "Connecting",
  need_auth: "Needs Authentication",
  ip_config: "Requesting IP",
  ip_check: "Checking Access",
  secondaries: "Waiting on Secondaries",
  activated: "Connected",
  deactivating: "Disconnecting",
  failed: "Connection Failed"
};

// /home/antonio/.config/HyprPanel/modules/menus/network/wifi/WirelessAPs.ts
var renderWAPs = (self, network3, staging, connecting) => {
  const getIdBySsid = (ssid, nmcliOutput) => {
    const lines = nmcliOutput.trim().split("\n");
    for (const line of lines) {
      const columns = line.trim().split(/\s{2,}/);
      if (columns[0].includes(ssid)) {
        return columns[1];
      }
    }
  };
  const isValidWifiStatus = (status) => {
    return status in WIFI_STATUS_MAP;
  };
  const getWifiStatus = () => {
    const wifiState = network3.wifi.state?.toLowerCase();
    if (wifiState && isValidWifiStatus(wifiState)) {
      return WIFI_STATUS_MAP[wifiState];
    }
    return WIFI_STATUS_MAP["unknown"];
  };
  self.hook(network3, () => {
    Utils.merge([staging.bind("value"), connecting.bind("value")], () => {
      let WAPs = network3.wifi._device !== undefined ? network3.wifi["access_points"] : [];
      const dedupeWAPs = () => {
        const dedupMap = {};
        WAPs.forEach((item) => {
          if (item.ssid !== null && !Object.hasOwnProperty.call(dedupMap, item.ssid)) {
            dedupMap[item.ssid] = item;
          }
        });
        return Object.keys(dedupMap).map((itm) => dedupMap[itm]);
      };
      WAPs = dedupeWAPs();
      const isInStaging = (wap) => {
        if (Object.keys(staging.value).length === 0) {
          return false;
        }
        return wap.bssid === staging.value.bssid;
      };
      const isDisconnecting = (wap) => {
        if (wap.ssid === network3.wifi.ssid) {
          return network3.wifi.state.toLowerCase() === "deactivating";
        }
        return false;
      };
      const filteredWAPs = WAPs.filter((ap) => {
        return ap.ssid !== "Unknown" && !isInStaging(ap);
      }).sort((a, b) => {
        if (network3.wifi.ssid === a.ssid) {
          return -1;
        }
        if (network3.wifi.ssid === b.ssid) {
          return 1;
        }
        return b.strength - a.strength;
      });
      if (filteredWAPs.length <= 0 && Object.keys(staging.value).length === 0) {
        return self.child = Widget.Label({
          class_name: "waps-not-found dim",
          expand: true,
          hpack: "center",
          vpack: "center",
          label: "No Wi-Fi Networks Found"
        });
      }
      return self.children = filteredWAPs.map((ap) => {
        return Widget.Box({
          children: [
            Widget.Button({
              on_primary_click: () => {
                if (ap.bssid === connecting.value || ap.active) {
                  return;
                }
                connecting.value = ap.bssid || "";
                Utils.execAsync(`nmcli device wifi connect ${ap.bssid}`).then(() => {
                  connecting.value = "";
                  staging.value = {};
                }).catch((err) => {
                  if (err.toLowerCase().includes("secrets were required, but not provided")) {
                    staging.value = ap;
                  } else {
                    Utils.notify({
                      summary: "Network",
                      body: err,
                      timeout: 5000
                    });
                  }
                  connecting.value = "";
                });
              },
              class_name: "network-element-item",
              child: Widget.Box({
                hexpand: true,
                children: [
                  Widget.Box({
                    hpack: "start",
                    hexpand: true,
                    children: [
                      Widget.Label({
                        vpack: "start",
                        class_name: `network-icon wifi ${ap.ssid === network3.wifi.ssid ? "active" : ""} txt-icon`,
                        label: getWifiIcon(`${ap["iconName"]}`)
                      }),
                      Widget.Box({
                        class_name: "connection-container",
                        vpack: "center",
                        vertical: true,
                        children: [
                          Widget.Label({
                            vpack: "center",
                            class_name: "active-connection",
                            hpack: "start",
                            truncate: "end",
                            wrap: true,
                            label: ap.ssid
                          }),
                          Widget.Revealer({
                            revealChild: ap.ssid === network3.wifi.ssid,
                            child: Widget.Label({
                              hpack: "start",
                              class_name: "connection-status dim",
                              label: getWifiStatus()
                            })
                          })
                        ]
                      })
                    ]
                  }),
                  Widget.Revealer({
                    hpack: "end",
                    vpack: "start",
                    reveal_child: ap.bssid === connecting.value || isDisconnecting(ap),
                    child: Widget.Spinner({
                      vpack: "start",
                      class_name: "spinner wap"
                    })
                  })
                ]
              })
            }),
            Widget.Revealer({
              vpack: "start",
              reveal_child: ap.bssid !== connecting.value && ap.active,
              child: Widget.Button({
                tooltip_text: "Delete/Forget Network",
                class_name: "menu-icon-button network disconnect",
                on_primary_click: () => {
                  connecting.value = ap.bssid || "";
                  Utils.execAsync("nmcli connection show --active").then(() => {
                    Utils.execAsync("nmcli connection show --active").then((res) => {
                      const connectionId = getIdBySsid(ap.ssid || "", res);
                      if (connectionId === undefined) {
                        console.error(`Error while forgetting "${ap.ssid}": Connection ID not found`);
                        return;
                      }
                      Utils.execAsync(`nmcli connection delete ${connectionId} "${ap.ssid}"`).then(() => connecting.value = "").catch((err) => {
                        connecting.value = "";
                        console.error(`Error while forgetting "${ap.ssid}": ${err}`);
                      });
                    });
                  });
                },
                child: Widget.Label({
                  class_name: "txt-icon delete-network",
                  label: "\uDB81\uDE83"
                })
              })
            })
          ]
        });
      });
    });
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/network/wifi/APStaging.ts
var renderWapStaging = (self, network3, staging, connecting) => {
  Utils.merge([network3.bind("wifi"), staging.bind("value")], () => {
    if (!Object.keys(staging.value).length) {
      return self.child = Widget.Box();
    }
    return self.child = Widget.Box({
      class_name: "network-element-item staging",
      vertical: true,
      children: [
        Widget.Box({
          hpack: "fill",
          hexpand: true,
          children: [
            Widget.Icon({
              class_name: `network-icon wifi`,
              icon: `${staging.value.iconName}`
            }),
            Widget.Box({
              class_name: "connection-container",
              hexpand: true,
              vertical: true,
              children: [
                Widget.Label({
                  class_name: "active-connection",
                  hpack: "start",
                  truncate: "end",
                  wrap: true,
                  label: staging.value.ssid
                })
              ]
            }),
            Widget.Revealer({
              hpack: "end",
              reveal_child: connecting.bind("value").as((c) => staging.value.bssid === c),
              child: Widget.Spinner({
                class_name: "spinner wap"
              })
            })
          ]
        }),
        Widget.Box({
          class_name: "network-password-input-container",
          hpack: "fill",
          hexpand: true,
          children: [
            Widget.Entry({
              hpack: "start",
              hexpand: true,
              visibility: false,
              class_name: "network-password-input",
              placeholder_text: "enter password",
              onAccept: (selfInp) => {
                connecting.value = staging.value.bssid || "";
                Utils.execAsync(`nmcli dev wifi connect ${staging.value.bssid} password ${selfInp.text}`).catch((err) => {
                  connecting.value = "";
                  console.error(`Failed to connect to wifi: ${staging.value.ssid}... ${err}`);
                  Utils.notify({
                    summary: "Network",
                    body: err,
                    timeout: 5000
                  });
                }).then(() => {
                  connecting.value = "";
                  staging.value = {};
                });
                selfInp.text = "";
              }
            }),
            Widget.Button({
              hpack: "end",
              class_name: "close-network-password-input-button",
              on_primary_click: () => {
                connecting.value = "";
                staging.value = {};
              },
              child: Widget.Icon({
                class_name: "close-network-password-input-icon",
                icon: "window-close-symbolic"
              })
            })
          ]
        })
      ]
    });
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/network/wifi/index.ts
var network3 = await Service.import("network");
var Staging = Variable({});
var Connecting = Variable("");
var searchInProgress = Variable(false);
var startRotation = () => {
  searchInProgress.value = true;
  setTimeout(() => {
    searchInProgress.value = false;
  }, 5 * 1000);
};
var Wifi = () => {
  return Widget.Box({
    class_name: "menu-section-container wifi",
    vertical: true,
    children: [
      Widget.Box({
        class_name: "menu-label-container",
        hpack: "fill",
        children: [
          Widget.Label({
            class_name: "menu-label",
            hexpand: true,
            hpack: "start",
            label: "Wi-Fi"
          }),
          Widget.Button({
            vpack: "center",
            hpack: "end",
            class_name: "menu-icon-button search network",
            on_primary_click: () => {
              startRotation();
              network3.wifi.scan();
            },
            child: Widget.Icon({
              class_name: searchInProgress.bind("value").as((v) => v ? "spinning" : ""),
              icon: "view-refresh-symbolic"
            })
          })
        ]
      }),
      Widget.Box({
        class_name: "menu-items-section",
        vertical: true,
        children: [
          Widget.Box({
            class_name: "wap-staging",
            setup: (self) => {
              renderWapStaging(self, network3, Staging, Connecting);
            }
          }),
          Widget.Box({
            class_name: "available-waps",
            vertical: true,
            setup: (self) => {
              renderWAPs(self, network3, Staging, Connecting);
            }
          })
        ]
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/network/index.ts
var network_default = () => {
  return dropdown_default({
    name: "networkmenu",
    transition: "crossfade",
    child: Widget.Box({
      class_name: "menu-items network",
      child: Widget.Box({
        vertical: true,
        hexpand: true,
        class_name: "menu-items-container network",
        children: [Ethernet(), Wifi()]
      })
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/bluetooth/devices/label.ts
var label11 = (bluetooth2) => {
  const searchInProgress2 = Variable(false);
  const startRotation2 = () => {
    searchInProgress2.value = true;
    setTimeout(() => {
      searchInProgress2.value = false;
    }, 10 * 1000);
  };
  return Widget.Box({
    class_name: "menu-label-container",
    hpack: "fill",
    vpack: "start",
    children: [
      Widget.Label({
        class_name: "menu-label",
        vpack: "center",
        hpack: "start",
        label: "Bluetooth"
      }),
      Widget.Box({
        class_name: "controls-container",
        vpack: "start",
        children: [
          Widget.Switch({
            class_name: "menu-switch bluetooth",
            hexpand: true,
            hpack: "end",
            active: bluetooth2.bind("enabled"),
            on_activate: ({ active: active2 }) => {
              searchInProgress2.value = false;
              Utils.execAsync(["bash", "-c", `bluetoothctl power ${active2 ? "on" : "off"}`]).catch((err) => console.error(`bluetoothctl power ${active2 ? "on" : "off"}`, err));
            }
          }),
          Widget.Separator({
            class_name: "menu-separator bluetooth"
          }),
          Widget.Button({
            vpack: "center",
            class_name: "menu-icon-button search",
            on_primary_click: () => {
              startRotation2();
              Utils.execAsync(["bash", "-c", "bluetoothctl --timeout 120 scan on"]).catch((err) => {
                searchInProgress2.value = false;
                console.error("bluetoothctl --timeout 120 scan on", err);
              });
            },
            child: Widget.Icon({
              class_name: searchInProgress2.bind("value").as((v) => v ? "spinning" : ""),
              icon: "view-refresh-symbolic"
            })
          })
        ]
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/bluetooth/devices/connectedControls.ts
var connectedControls = (dev, connectedDevices) => {
  if (!connectedDevices.includes(dev.address)) {
    return Widget.Box({});
  }
  return Widget.Box({
    vpack: "start",
    class_name: "bluetooth-controls",
    children: [
      Widget.Button({
        class_name: "menu-icon-button unpair bluetooth",
        child: Widget.Label({
          tooltip_text: dev.paired ? "Unpair" : "Pair",
          class_name: "menu-icon-button-label unpair bluetooth txt-icon",
          label: dev.paired ? "\uF0C1" : "\uF127"
        }),
        on_primary_click: () => Utils.execAsync([
          "bash",
          "-c",
          `bluetoothctl ${dev.paired ? "unpair" : "pair"} ${dev.address}`
        ]).catch((err) => console.error(`bluetoothctl ${dev.paired ? "unpair" : "pair"} ${dev.address}`, err))
      }),
      Widget.Button({
        class_name: "menu-icon-button disconnect bluetooth",
        child: Widget.Label({
          tooltip_text: dev.connected ? "Disconnect" : "Connect",
          class_name: "menu-icon-button-label disconnect bluetooth txt-icon",
          label: dev.connected ? "\uDB85\uDE16" : "\uEAD0"
        }),
        on_primary_click: () => dev.setConnection(!dev.connected)
      }),
      Widget.Button({
        class_name: "menu-icon-button untrust bluetooth",
        child: Widget.Label({
          tooltip_text: dev.trusted ? "Untrust" : "Trust",
          class_name: "menu-icon-button-label untrust bluetooth txt-icon",
          label: dev.trusted ? "\uED9F" : "\uDB85\uDDA1"
        }),
        on_primary_click: () => Utils.execAsync([
          "bash",
          "-c",
          `bluetoothctl ${dev.trusted ? "untrust" : "trust"} ${dev.address}`
        ]).catch((err) => console.error(`bluetoothctl ${dev.trusted ? "untrust" : "trust"} ${dev.address}`, err))
      }),
      Widget.Button({
        class_name: "menu-icon-button delete bluetooth",
        child: Widget.Label({
          tooltip_text: "Forget",
          class_name: "menu-icon-button-label delete bluetooth txt-icon",
          label: "\uDB80\uDDB4"
        }),
        on_primary_click: () => {
          Utils.execAsync(["bash", "-c", `bluetoothctl remove ${dev.address}`]).catch((err) => console.error("Bluetooth Remove", err));
        }
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/bluetooth/utils.ts
var getBluetoothIcon = (iconName) => {
  const deviceIconMap = [
    ["^audio-card*", "\uDB80\uDF84"],
    ["^audio-headphones*", "\uDB80\uDECB"],
    ["^audio-headset*", "\uDB80\uDECE"],
    ["^audio-input*", "\uDB80\uDF6C"],
    ["^audio-speakers*", "\uDB81\uDCC3"],
    ["^bluetooth*", "\uDB80\uDCAF"],
    ["^camera*", "\uDB80\uDD00"],
    ["^computer*", "\uDB81\uDFC0"],
    ["^input-gaming*", "\uDB80\uDF6C"],
    ["^input-keyboard*", "\uDB80\uDF0C"],
    ["^input-mouse*", "\uDB80\uDF7D"],
    ["^input-tablet*", "\uDB81\uDCF6"],
    ["^media*", "\uDB85\uDEDF"],
    ["^modem*", "\uDB84\uDC87"],
    ["^network*", "\uDB84\uDC87"],
    ["^phone*", "\uDB80\uDD1E"],
    ["^printer*", "\uDB81\uDC2A"],
    ["^scanner*", "\uDB81\uDEAB"],
    ["^video-camera*", "\uDB81\uDD67"]
  ];
  const foundMatch = deviceIconMap.find((icon8) => RegExp(icon8[0]).test(iconName.toLowerCase()));
  return foundMatch ? foundMatch[1] : "\uDB80\uDCAF";
};

// /home/antonio/.config/HyprPanel/modules/menus/bluetooth/devices/devicelist.ts
var devices = (bluetooth2, self) => {
  return self.hook(bluetooth2, () => {
    if (!bluetooth2.enabled) {
      return self.child = Widget.Box({
        class_name: "bluetooth-items",
        vertical: true,
        expand: true,
        vpack: "center",
        hpack: "center",
        children: [
          Widget.Label({
            class_name: "bluetooth-disabled dim",
            hexpand: true,
            label: "Bluetooth is disabled"
          })
        ]
      });
    }
    const availableDevices2 = bluetooth2.devices.filter((btDev) => btDev.name !== null).sort((a, b) => {
      if (a.connected || a.paired) {
        return -1;
      }
      if (b.connected || b.paired) {
        return 1;
      }
      return b.name - a.name;
    });
    const conDevNames = availableDevices2.filter((d) => d.connected || d.paired).map((d) => d.address);
    if (!availableDevices2.length) {
      return self.child = Widget.Box({
        class_name: "bluetooth-items",
        vertical: true,
        expand: true,
        vpack: "center",
        hpack: "center",
        children: [
          Widget.Label({
            class_name: "no-bluetooth-devices dim",
            hexpand: true,
            label: "No devices currently found"
          }),
          Widget.Label({
            class_name: "search-bluetooth-label dim",
            hexpand: true,
            label: "Press '\uDB81\uDC50' to search"
          })
        ]
      });
    }
    return self.child = Widget.Box({
      vertical: true,
      children: availableDevices2.map((device) => {
        return Widget.Box({
          children: [
            Widget.Button({
              hexpand: true,
              class_name: `bluetooth-element-item ${device}`,
              on_primary_click: () => {
                if (!conDevNames.includes(device.address))
                  device.setConnection(true);
              },
              child: Widget.Box({
                hexpand: true,
                children: [
                  Widget.Box({
                    hexpand: true,
                    hpack: "start",
                    class_name: "menu-button-container",
                    children: [
                      Widget.Label({
                        vpack: "start",
                        class_name: `menu-button-icon bluetooth ${conDevNames.includes(device.address) ? "active" : ""} txt-icon`,
                        label: getBluetoothIcon(`${device["icon_name"]}-symbolic`)
                      }),
                      Widget.Box({
                        vertical: true,
                        vpack: "center",
                        children: [
                          Widget.Label({
                            vpack: "center",
                            hpack: "start",
                            class_name: "menu-button-name bluetooth",
                            truncate: "end",
                            wrap: true,
                            label: device.alias
                          }),
                          Widget.Revealer({
                            hpack: "start",
                            reveal_child: device.connected || device.paired,
                            child: Widget.Label({
                              hpack: "start",
                              class_name: "connection-status dim",
                              label: device.connected ? "Connected" : "Paired"
                            })
                          })
                        ]
                      })
                    ]
                  }),
                  Widget.Box({
                    hpack: "end",
                    children: device.connecting ? [
                      Widget.Spinner({
                        vpack: "start",
                        class_name: "spinner bluetooth"
                      })
                    ] : []
                  })
                ]
              })
            }),
            connectedControls(device, conDevNames)
          ]
        });
      })
    });
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/bluetooth/devices/index.ts
var bluetooth2 = await Service.import("bluetooth");
var Devices = () => {
  return Widget.Box({
    class_name: "menu-section-container",
    vertical: true,
    children: [
      label11(bluetooth2),
      Widget.Box({
        class_name: "menu-items-section",
        child: Widget.Box({
          class_name: "menu-content",
          vertical: true,
          setup: (self) => {
            devices(bluetooth2, self);
          }
        })
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/bluetooth/index.ts
var bluetooth_default = () => {
  return dropdown_default({
    name: "bluetoothmenu",
    transition: "crossfade",
    child: Widget.Box({
      class_name: "menu-items bluetooth",
      hpack: "fill",
      hexpand: true,
      child: Widget.Box({
        vertical: true,
        hpack: "fill",
        hexpand: true,
        class_name: "menu-items-container bluetooth",
        child: Devices()
      })
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/media/components/mediainfo.ts
var media = await Service.import("mpris");
var MediaInfo = (getPlayerInfo) => {
  return Widget.Box({
    class_name: "media-indicator-current-media-info",
    hpack: "center",
    hexpand: true,
    vertical: true,
    children: [
      Widget.Box({
        class_name: "media-indicator-current-song-name",
        hpack: "center",
        children: [
          Widget.Label({
            truncate: "end",
            max_width_chars: 31,
            wrap: true,
            class_name: "media-indicator-current-song-name-label",
            setup: (self) => {
              self.hook(media, () => {
                const curPlayer = getPlayerInfo();
                return self.label = curPlayer !== undefined && curPlayer["track_title"].length ? curPlayer["track_title"] : "No Media Currently Playing";
              });
            }
          })
        ]
      }),
      Widget.Box({
        class_name: "media-indicator-current-song-author",
        hpack: "center",
        children: [
          Widget.Label({
            truncate: "end",
            wrap: true,
            max_width_chars: 35,
            class_name: "media-indicator-current-song-author-label",
            setup: (self) => {
              self.hook(media, () => {
                const curPlayer = getPlayerInfo();
                const makeArtistList = (trackArtists) => {
                  if (trackArtists.length === 1 && !trackArtists[0].length) {
                    return "-----";
                  }
                  return trackArtists.join(", ");
                };
                return self.label = curPlayer !== undefined && curPlayer["track_artists"].length ? makeArtistList(curPlayer["track_artists"]) : "-----";
              });
            }
          })
        ]
      }),
      Widget.Box({
        class_name: "media-indicator-current-song-album",
        hpack: "center",
        children: [
          Widget.Label({
            truncate: "end",
            wrap: true,
            max_width_chars: 40,
            class_name: "media-indicator-current-song-album-label",
            setup: (self) => {
              self.hook(media, () => {
                const curPlayer = getPlayerInfo();
                return self.label = curPlayer !== undefined && curPlayer["track_album"].length ? curPlayer["track_album"] : "---";
              });
            }
          })
        ]
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/media/components/controls.ts
var media2 = await Service.import("mpris");
var Controls = (getPlayerInfo) => {
  const isValidLoopStatus = (status) => ["none", "track", "playlist"].includes(status);
  const isValidPlaybackStatus = (status) => ["playing", "paused", "stopped"].includes(status);
  const isLoopActive = (player) => {
    return player["loop_status"] !== null && ["track", "playlist"].includes(player["loop_status"].toLowerCase()) ? "active" : "";
  };
  const isShuffleActive = (player) => {
    return player["shuffle_status"] !== null && player["shuffle_status"] ? "active" : "";
  };
  return Widget.Box({
    class_name: "media-indicator-current-player-controls",
    vertical: true,
    children: [
      Widget.Box({
        class_name: "media-indicator-current-controls",
        hpack: "center",
        children: [
          Widget.Box({
            class_name: "media-indicator-control shuffle",
            children: [
              Widget.Button({
                hpack: "center",
                hasTooltip: true,
                setup: (self) => {
                  self.hook(media2, () => {
                    const foundPlayer = getPlayerInfo();
                    if (foundPlayer === undefined) {
                      self.tooltip_text = "Unavailable";
                      self.class_name = "media-indicator-control-button shuffle disabled";
                      return;
                    }
                    self.tooltip_text = foundPlayer.shuffle_status !== null ? foundPlayer.shuffle_status ? "Shuffling" : "Not Shuffling" : null;
                    self.on_primary_click = () => {
                      foundPlayer.shuffle();
                    };
                    self.class_name = `media-indicator-control-button shuffle ${isShuffleActive(foundPlayer)} ${foundPlayer.shuffle_status !== null ? "enabled" : "disabled"}`;
                  });
                },
                child: Widget.Icon(icons_default2.mpris.shuffle["enabled"])
              })
            ]
          }),
          Widget.Box({
            children: [
              Widget.Button({
                hpack: "center",
                child: Widget.Icon(icons_default2.mpris.prev),
                setup: (self) => {
                  self.hook(media2, () => {
                    const foundPlayer = getPlayerInfo();
                    if (foundPlayer === undefined) {
                      self.class_name = "media-indicator-control-button prev disabled";
                      return;
                    }
                    self.on_primary_click = () => {
                      foundPlayer.previous();
                    };
                    self.class_name = `media-indicator-control-button prev ${foundPlayer.can_go_prev !== null && foundPlayer.can_go_prev ? "enabled" : "disabled"}`;
                  });
                }
              })
            ]
          }),
          Widget.Box({
            children: [
              Widget.Button({
                hpack: "center",
                setup: (self) => {
                  self.hook(media2, () => {
                    const foundPlayer = getPlayerInfo();
                    if (foundPlayer === undefined) {
                      self.class_name = "media-indicator-control-button play disabled";
                      return;
                    }
                    self.on_primary_click = () => {
                      foundPlayer.playPause();
                    };
                    self.class_name = `media-indicator-control-button play ${foundPlayer.can_play !== null ? "enabled" : "disabled"}`;
                  });
                },
                child: Widget.Icon({
                  icon: Utils.watch(icons_default2.mpris.paused, media2, "changed", () => {
                    const foundPlayer = getPlayerInfo();
                    if (foundPlayer === undefined) {
                      return icons_default2.mpris["paused"];
                    }
                    const playbackStatus = foundPlayer.play_back_status?.toLowerCase();
                    if (playbackStatus && isValidPlaybackStatus(playbackStatus)) {
                      return icons_default2.mpris[playbackStatus];
                    } else {
                      return icons_default2.mpris["paused"];
                    }
                  })
                })
              })
            ]
          }),
          Widget.Box({
            class_name: `media-indicator-control next`,
            children: [
              Widget.Button({
                hpack: "center",
                child: Widget.Icon(icons_default2.mpris.next),
                setup: (self) => {
                  self.hook(media2, () => {
                    const foundPlayer = getPlayerInfo();
                    if (foundPlayer === undefined) {
                      self.class_name = "media-indicator-control-button next disabled";
                      return;
                    }
                    self.on_primary_click = () => {
                      foundPlayer.next();
                    };
                    self.class_name = `media-indicator-control-button next ${foundPlayer.can_go_next !== null && foundPlayer.can_go_next ? "enabled" : "disabled"}`;
                  });
                }
              })
            ]
          }),
          Widget.Box({
            class_name: "media-indicator-control loop",
            children: [
              Widget.Button({
                hpack: "center",
                setup: (self) => {
                  self.hook(media2, () => {
                    const foundPlayer = getPlayerInfo();
                    if (foundPlayer === undefined) {
                      self.tooltip_text = "Unavailable";
                      self.class_name = "media-indicator-control-button shuffle disabled";
                      return;
                    }
                    self.tooltip_text = foundPlayer.loop_status !== null ? foundPlayer.loop_status ? "Shuffling" : "Not Shuffling" : null;
                    self.on_primary_click = () => {
                      foundPlayer.loop();
                    };
                    self.class_name = `media-indicator-control-button loop ${isLoopActive(foundPlayer)} ${foundPlayer.loop_status !== null ? "enabled" : "disabled"}`;
                  });
                },
                child: Widget.Icon({
                  setup: (self) => {
                    self.hook(media2, () => {
                      const foundPlayer = getPlayerInfo();
                      if (foundPlayer === undefined) {
                        self.icon = icons_default2.mpris.loop["none"];
                        return;
                      }
                      const loopStatus = foundPlayer.loop_status?.toLowerCase();
                      if (loopStatus && isValidLoopStatus(loopStatus)) {
                        self.icon = icons_default2.mpris.loop[loopStatus];
                      } else {
                        self.icon = icons_default2.mpris.loop["none"];
                      }
                    });
                  }
                })
              })
            ]
          })
        ]
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/media/components/bar.ts
var media3 = await Service.import("mpris");
var Bar2 = (getPlayerInfo) => {
  return Widget.Box({
    class_name: "media-indicator-current-progress-bar",
    hexpand: true,
    children: [
      Widget.Box({
        hexpand: true,
        child: Widget.Slider({
          hexpand: true,
          tooltip_text: "--",
          class_name: "menu-slider media progress",
          draw_value: false,
          on_change: ({ value }) => {
            const foundPlayer = getPlayerInfo(media3);
            if (foundPlayer === undefined) {
              return;
            }
            return foundPlayer.position = value * foundPlayer.length;
          },
          setup: (self) => {
            const update = () => {
              const foundPlayer = getPlayerInfo(media3);
              if (foundPlayer !== undefined) {
                const value = foundPlayer.length ? foundPlayer.position / foundPlayer.length : 0;
                self.value = value > 0 ? value : 0;
              } else {
                self.value = 0;
              }
            };
            self.hook(media3, update);
            self.poll(1000, update);
            const updateTooltip = () => {
              const foundPlayer = getPlayerInfo(media3);
              if (foundPlayer === undefined) {
                self.tooltip_text = "00:00";
                return;
              }
              const curHour = Math.floor(foundPlayer.position / 3600);
              const curMin = Math.floor(foundPlayer.position % 3600 / 60);
              const curSec = Math.floor(foundPlayer.position % 60);
              if (typeof foundPlayer.position === "number" && foundPlayer.position >= 0) {
                self.tooltip_text = `${curHour > 0 ? (curHour < 10 ? "0" + curHour : curHour) + ":" : ""}${curMin < 10 ? "0" + curMin : curMin}:${curSec < 10 ? "0" + curSec : curSec}`;
              } else {
                self.tooltip_text = `00:00`;
              }
            };
            self.poll(1000, updateTooltip);
            self.hook(media3, updateTooltip);
          }
        })
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/media/media.ts
var media4 = await Service.import("mpris");
var { tint, color } = options_default.theme.bar.menus.menu.media.card;
var generateAlbumArt = (imageUrl) => {
  const userTint = tint.value;
  const userHexColor = color.value;
  const r = parseInt(userHexColor.slice(1, 3), 16);
  const g = parseInt(userHexColor.slice(3, 5), 16);
  const b = parseInt(userHexColor.slice(5, 7), 16);
  const alpha = userTint / 100;
  const css = `background-image: linear-gradient(
                rgba(${r}, ${g}, ${b}, ${alpha}),
                rgba(${r}, ${g}, ${b}, ${alpha}),
                ${userHexColor} 65em
            ), url("${imageUrl}");`;
  return css;
};
var Media2 = () => {
  const curPlayer = Variable("");
  media4.connect("changed", () => {
    const statusOrder = {
      Playing: 1,
      Paused: 2,
      Stopped: 3
    };
    const isPlaying = media4.players.find((p) => p["play_back_status"] === "Playing");
    const playerStillExists = media4.players.some((p) => curPlayer.value === p["bus_name"]);
    const nextPlayerUp = media4.players.sort((a, b) => statusOrder[a["play_back_status"]] - statusOrder[b["play_back_status"]])[0].bus_name;
    if (isPlaying || !playerStillExists) {
      curPlayer.value = nextPlayerUp;
    }
  });
  const getPlayerInfo = () => {
    return media4.players.find((p) => p.bus_name === curPlayer.value) || media4.players[0];
  };
  return Widget.Box({
    class_name: "menu-section-container",
    children: [
      Widget.Box({
        class_name: "menu-items-section",
        vertical: false,
        child: Widget.Box({
          class_name: "menu-content",
          children: [
            Widget.Box({
              class_name: "media-content",
              child: Widget.Box({
                class_name: "media-indicator-right-section",
                hpack: "fill",
                hexpand: true,
                vertical: true,
                children: [MediaInfo(getPlayerInfo), Controls(getPlayerInfo), Bar2(getPlayerInfo)]
              })
            })
          ],
          setup: (self) => {
            self.hook(media4, () => {
              const curPlayer2 = getPlayerInfo();
              if (curPlayer2 !== undefined) {
                self.css = generateAlbumArt(curPlayer2.track_cover_url);
              }
            });
            Utils.merge([color.bind("value"), tint.bind("value")], () => {
              const curPlayer2 = getPlayerInfo();
              if (curPlayer2 !== undefined) {
                self.css = generateAlbumArt(curPlayer2.track_cover_url);
              }
            });
          }
        })
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/media/index.ts
var media_default = () => {
  return dropdown_default({
    name: "mediamenu",
    transition: "crossfade",
    child: Widget.Box({
      class_name: "menu-items media",
      hpack: "fill",
      hexpand: true,
      child: Widget.Box({
        class_name: "menu-items-container media",
        hpack: "fill",
        hexpand: true,
        child: Media2()
      })
    })
  });
};

// /home/antonio/.config/HyprPanel/globals/notification.ts
var removingNotifications2 = Variable(false);
var getNotificationIcon = (app_name, app_icon, app_entry) => {
  let icon8 = icons_default2.fallback.notification;
  if (Utils.lookUpIcon(app_name) || Utils.lookUpIcon(app_name.toLowerCase() || "")) {
    icon8 = Utils.lookUpIcon(app_name) ? app_name : Utils.lookUpIcon(app_name.toLowerCase()) ? app_name.toLowerCase() : "";
  }
  if (Utils.lookUpIcon(app_icon) && icon8 === "") {
    icon8 = app_icon;
  }
  if (Utils.lookUpIcon(app_entry || "") && icon8 === "") {
    icon8 = app_entry || "";
  }
  return icon8;
};
var closeNotifications = async (notifications) => {
  removingNotifications2.value = true;
  for (const notif of notifications) {
    notif.close();
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  removingNotifications2.value = false;
};
globalThis["removingNotifications"] = removingNotifications2;

// /home/antonio/.config/HyprPanel/modules/menus/notifications/controls/index.ts
var Controls2 = (notifs2) => {
  return Widget.Box({
    class_name: "notification-menu-controls",
    expand: false,
    vertical: false,
    children: [
      Widget.Box({
        class_name: "menu-label-container notifications",
        hpack: "start",
        vpack: "center",
        expand: true,
        children: [
          Widget.Label({
            class_name: "menu-label notifications",
            label: "Notifications"
          })
        ]
      }),
      Widget.Box({
        hpack: "end",
        vpack: "center",
        expand: false,
        children: [
          Widget.Switch({
            class_name: "menu-switch notifications",
            vpack: "center",
            active: notifs2.bind("dnd").as((dnd) => !dnd),
            on_activate: ({ active: active2 }) => {
              notifs2.dnd = !active2;
            }
          }),
          Widget.Box({
            children: [
              Widget.Separator({
                hpack: "center",
                vexpand: true,
                vertical: true,
                class_name: "menu-separator notification-controls"
              }),
              Widget.Button({
                className: "clear-notifications-button",
                tooltip_text: "Clear Notifications",
                on_primary_click: () => {
                  if (removingNotifications.value) {
                    return;
                  }
                  closeNotifications(notifs2.notifications);
                },
                child: Widget.Label({
                  class_name: removingNotifications.bind("value").as((removing) => {
                    return removing ? "clear-notifications-label txt-icon removing" : "clear-notifications-label txt-icon";
                  }),
                  label: "\uF2D3"
                })
              })
            ]
          })
        ]
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/notifications/utils.ts
var notifHasImg = (notif) => {
  return notif.image !== undefined && notif.image.length ? true : false;
};

// /home/antonio/.config/HyprPanel/modules/menus/notifications/notification/header/index.ts
import GLib8 from "gi://GLib";

// /home/antonio/.config/HyprPanel/modules/menus/notifications/notification/header/icon.ts
var NotificationIcon = ({ app_entry = "", app_icon = "", app_name = "" }) => {
  return Widget.Box({
    css: `
                min-width: 2rem;
                min-height: 2rem;
              `,
    child: Widget.Icon({
      class_name: "notification-icon menu",
      icon: getNotificationIcon(app_name, app_icon, app_entry)
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/notifications/notification/header/index.ts
var { military } = options_default.menus.clock.time;
var Header = (notif) => {
  const time2 = (time3, format2 = "%I:%M %p") => {
    return GLib8.DateTime.new_from_unix_local(time3).format(military.value ? "%H:%M" : format2) || "--:--";
  };
  return Widget.Box({
    vertical: false,
    hexpand: true,
    children: [
      Widget.Box({
        class_name: "notification-card-header menu",
        hpack: "start",
        children: [NotificationIcon(notif)]
      }),
      Widget.Box({
        class_name: "notification-card-header menu",
        hexpand: true,
        vpack: "start",
        children: [
          Widget.Label({
            class_name: "notification-card-header-label menu",
            hpack: "start",
            hexpand: true,
            vexpand: true,
            max_width_chars: !notifHasImg(notif) ? 34 : 22,
            truncate: "end",
            wrap: true,
            label: notif["summary"]
          })
        ]
      }),
      Widget.Box({
        class_name: "notification-card-header menu",
        hpack: "end",
        vpack: "start",
        hexpand: true,
        child: Widget.Label({
          vexpand: true,
          class_name: "notification-time",
          label: time2(notif.time)
        })
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/notifications/notification/actions/index.ts
var Actions = (notif, notifs2) => {
  if (notif.actions !== undefined && notif.actions.length > 0) {
    return Widget.Box({
      class_name: "notification-card-actions menu",
      hexpand: true,
      vpack: "end",
      children: notif.actions.map((action) => {
        return Widget.Button({
          hexpand: true,
          class_name: "notification-action-buttons menu",
          on_primary_click: () => {
            if (action.id.includes("scriptAction:-")) {
              App.closeWindow("notificationsmenu");
              Utils.execAsync(`${action.id.replace("scriptAction:-", "")}`).catch((err) => console.error(err));
              notifs2.CloseNotification(notif.id);
            } else {
              App.closeWindow("notificationsmenu");
              notif.invoke(action.id);
            }
          },
          child: Widget.Box({
            hpack: "center",
            hexpand: true,
            children: [
              Widget.Label({
                class_name: "notification-action-buttons-label menu",
                hexpand: true,
                max_width_chars: 15,
                truncate: "end",
                wrap: true,
                label: action.label
              })
            ]
          })
        });
      })
    });
  }
  return Widget.Box({
    class_name: "spacer"
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/notifications/notification/image/index.ts
var Image = (notif) => {
  if (notifHasImg(notif)) {
    return Widget.Box({
      class_name: "notification-card-image-container menu",
      hpack: "center",
      vpack: "center",
      vexpand: false,
      child: Widget.Box({
        hpack: "center",
        vexpand: false,
        class_name: "notification-card-image menu",
        css: `background-image: url("${notif.image}")`
      })
    });
  }
  return Widget.Box();
};

// /home/antonio/.config/HyprPanel/modules/menus/notifications/notification/placeholder/index.ts
var Placeholder = (notifs2) => {
  return Widget.Box({
    class_name: "notification-label-container",
    vpack: "fill",
    hpack: "center",
    expand: true,
    child: Widget.Box({
      vpack: "center",
      vertical: true,
      expand: true,
      children: [
        Widget.Label({
          vpack: "center",
          class_name: "placeholder-label dim bell",
          label: notifs2.bind("dnd").as((dnd) => dnd ? "\uDB80\uDC9B" : "\uDB80\uDC9A")
        }),
        Widget.Label({
          vpack: "start",
          class_name: "placehold-label dim message",
          label: "You're all caught up :)"
        })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/notifications/notification/body/index.ts
var Body = (notif) => {
  return Widget.Box({
    vpack: "start",
    hexpand: true,
    class_name: "notification-card-body menu",
    children: [
      Widget.Label({
        hexpand: true,
        use_markup: true,
        xalign: 0,
        justification: "left",
        truncate: "end",
        lines: 2,
        max_width_chars: !notifHasImg(notif) ? 35 : 28,
        wrap: true,
        class_name: "notification-card-body-label menu",
        label: notif["body"]
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/notifications/notification/close/index.ts
var CloseButton = (notif, notifs2) => {
  return Widget.Button({
    class_name: "close-notification-button menu",
    on_primary_click: () => {
      notifs2.CloseNotification(notif.id);
    },
    child: Widget.Label({
      class_name: "txt-icon notif-close",
      label: "\uDB80\uDD5C",
      hpack: "center"
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/notifications/notification/index.ts
var { displayedTotal, ignore: ignore3 } = options_default.notifications;
var NotificationCard = (notifs2, curPage) => {
  return Widget.Scrollable({
    vscroll: "automatic",
    child: Widget.Box({
      class_name: "menu-content-container notifications",
      hpack: "center",
      vexpand: true,
      spacing: 0,
      vertical: true,
      setup: (self) => {
        Utils.merge([
          notifs2.bind("notifications"),
          curPage.bind("value"),
          displayedTotal.bind("value"),
          ignore3.bind("value")
        ], (notifications, currentPage, dispTotal, ignoredNotifs) => {
          const filteredNotifications = filterNotifications(notifications, ignoredNotifs);
          const sortedNotifications = filteredNotifications.sort((a, b) => b.time - a.time);
          if (filteredNotifications.length <= 0) {
            return self.children = [Placeholder(notifs2)];
          }
          const pageStart = (currentPage - 1) * dispTotal;
          const pageEnd = currentPage * dispTotal;
          return self.children = sortedNotifications.slice(pageStart, pageEnd).map((notif) => {
            return Widget.Box({
              class_name: "notification-card-content-container",
              children: [
                Widget.Box({
                  class_name: "notification-card menu",
                  vpack: "start",
                  hexpand: true,
                  vexpand: false,
                  children: [
                    Image(notif),
                    Widget.Box({
                      vpack: "center",
                      vertical: true,
                      hexpand: true,
                      class_name: `notification-card-content ${!notifHasImg(notif) ? "noimg" : " menu"}`,
                      children: [Header(notif), Body(notif), Actions(notif, notifs2)]
                    })
                  ]
                }),
                CloseButton(notif, notifs2)
              ]
            });
          });
        });
      }
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/notifications/pager/index.ts
var notifs2 = await Service.import("notifications");
var { displayedTotal: displayedTotal2 } = options_default.notifications;
var { show: showPager } = options_default.theme.bar.menus.menu.notifications.pager;
var NotificationPager = (curPage) => {
  return Widget.Box({
    class_name: "notification-menu-pager",
    hexpand: true,
    vexpand: false,
    children: Utils.merge([
      curPage.bind("value"),
      displayedTotal2.bind("value"),
      notifs2.bind("notifications"),
      showPager.bind("value")
    ], (currentPage, dispTotal, _, showPgr) => {
      if (showPgr === false) {
        return [];
      }
      return [
        Widget.Button({
          hexpand: true,
          hpack: "start",
          class_name: `pager-button left ${currentPage <= 1 ? "disabled" : ""}`,
          onPrimaryClick: () => {
            curPage.value = 1;
          },
          child: Widget.Label({
            className: "pager-button-label",
            label: "\uF100"
          })
        }),
        Widget.Button({
          hexpand: true,
          hpack: "start",
          class_name: `pager-button left ${currentPage <= 1 ? "disabled" : ""}`,
          onPrimaryClick: () => {
            curPage.value = currentPage <= 1 ? 1 : currentPage - 1;
          },
          child: Widget.Label({
            className: "pager-button-label",
            label: "\uF104"
          })
        }),
        Widget.Label({
          hexpand: true,
          hpack: "center",
          class_name: "pager-label",
          label: `${currentPage} / ${Math.ceil(notifs2.notifications.length / dispTotal) || 1}`
        }),
        Widget.Button({
          hexpand: true,
          hpack: "end",
          class_name: `pager-button right ${currentPage >= Math.ceil(notifs2.notifications.length / dispTotal) ? "disabled" : ""}`,
          onPrimaryClick: () => {
            const maxPage = Math.ceil(notifs2.notifications.length / displayedTotal2.value);
            curPage.value = currentPage >= maxPage ? currentPage : currentPage + 1;
          },
          child: Widget.Label({
            className: "pager-button-label",
            label: "\uF105"
          })
        }),
        Widget.Button({
          hexpand: true,
          hpack: "end",
          class_name: `pager-button right ${currentPage >= Math.ceil(notifs2.notifications.length / dispTotal) ? "disabled" : ""}`,
          onPrimaryClick: () => {
            const maxPage = Math.ceil(notifs2.notifications.length / displayedTotal2.value);
            curPage.value = maxPage;
          },
          child: Widget.Label({
            className: "pager-button-label",
            label: "\uDB80\uDD3E"
          })
        })
      ];
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/notifications/index.ts
var notifs3 = await Service.import("notifications");
var { displayedTotal: displayedTotal3 } = options_default.notifications;
var notifications_default = () => {
  const curPage = Variable(1);
  Utils.merge([curPage.bind("value"), displayedTotal3.bind("value"), notifs3.bind("notifications")], (currentPage, dispTotal, notifications) => {
    if (notifications.length <= (currentPage - 1) * dispTotal) {
      curPage.value = currentPage <= 1 ? 1 : currentPage - 1;
    }
  });
  return dropdown_default({
    name: "notificationsmenu",
    transition: "crossfade",
    child: Widget.Box({
      class_name: "notification-menu-content",
      css: "padding: 1px; margin: -1px;",
      hexpand: true,
      vexpand: false,
      children: [
        Widget.Box({
          class_name: "notification-card-container menu",
          vertical: true,
          hexpand: false,
          vexpand: false,
          children: [Controls2(notifs3), NotificationCard(notifs3, curPage), NotificationPager(curPage)]
        })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/calendar/time/index.ts
var { military: military2 } = options_default.menus.clock.time;
var time2 = Variable("", {
  poll: [1000, 'date "+%I:%M:%S"']
});
var period = Variable("", {
  poll: [1000, 'date "+%p"']
});
var militaryTime = Variable("", {
  poll: [1000, 'date "+%H:%M:%S"']
});
var TimeWidget = () => {
  return Widget.Box({
    class_name: "calendar-menu-item-container clock",
    hexpand: true,
    vpack: "center",
    hpack: "fill",
    child: Widget.Box({
      hexpand: true,
      vpack: "center",
      hpack: "center",
      class_name: "clock-content-items",
      children: military2.bind("value").as((is24hr) => {
        if (!is24hr) {
          return [
            Widget.Box({
              hpack: "center",
              children: [
                Widget.Label({
                  class_name: "clock-content-time",
                  label: time2.bind()
                })
              ]
            }),
            Widget.Box({
              hpack: "center",
              children: [
                Widget.Label({
                  vpack: "end",
                  class_name: "clock-content-period",
                  label: period.bind()
                })
              ]
            })
          ];
        }
        return [
          Widget.Box({
            hpack: "center",
            children: [
              Widget.Label({
                class_name: "clock-content-time",
                label: militaryTime.bind()
              })
            ]
          })
        ];
      })
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/calendar/calendar.ts
var CalendarWidget = () => {
  return Widget.Box({
    class_name: "calendar-menu-item-container calendar",
    hpack: "fill",
    vpack: "fill",
    expand: true,
    child: Widget.Box({
      class_name: "calendar-container-box",
      child: Widget.Calendar({
        expand: true,
        hpack: "fill",
        vpack: "fill",
        class_name: "calendar-menu-widget",
        showDayNames: true,
        showDetails: false,
        showHeading: true
      })
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/calendar/weather/icon/index.ts
var TodayIcon = (theWeather) => {
  return Widget.Box({
    vpack: "center",
    hpack: "start",
    class_name: "calendar-menu-weather today icon container",
    child: Widget.Label({
      class_name: "calendar-menu-weather today icon txt-icon",
      label: theWeather.bind("value").as((w) => {
        return getWeatherStatusTextIcon(w);
      })
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/calendar/weather/stats/index.ts
var { unit: unit2 } = options_default.menus.clock.weather;
var TodayStats = (theWeather) => {
  return Widget.Box({
    class_name: "calendar-menu-weather today stats container",
    hpack: "end",
    vpack: "center",
    vertical: true,
    children: [
      Widget.Box({
        class_name: "weather wind",
        children: [
          Widget.Label({
            class_name: "weather wind icon txt-icon",
            label: "\uE27E"
          }),
          Widget.Label({
            class_name: "weather wind label",
            label: Utils.merge([theWeather.bind("value"), unit2.bind("value")], (wthr, unt) => {
              return getWindConditions(wthr, unt);
            })
          })
        ]
      }),
      Widget.Box({
        class_name: "weather precip",
        children: [
          Widget.Label({
            class_name: "weather precip icon txt-icon",
            label: "\uE371"
          }),
          Widget.Label({
            class_name: "weather precip label",
            label: theWeather.bind("value").as((v) => getRainChance(v))
          })
        ]
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/calendar/weather/temperature/index.ts
var { unit: unit3 } = options_default.menus.clock.weather;
var TodayTemperature = (theWeather) => {
  return Widget.Box({
    hpack: "center",
    vpack: "center",
    vertical: true,
    children: [
      Widget.Box({
        hexpand: true,
        vpack: "center",
        class_name: "calendar-menu-weather today temp container",
        vertical: false,
        children: [
          Widget.Box({
            hexpand: true,
            hpack: "center",
            children: [
              Widget.Label({
                class_name: "calendar-menu-weather today temp label",
                label: Utils.merge([theWeather.bind("value"), unit3.bind("value")], (wthr, unt) => {
                  return getTemperature(wthr, unt);
                })
              }),
              Widget.Label({
                class_name: theWeather.bind("value").as((v) => `calendar-menu-weather today temp label icon txt-icon ${getWeatherIcon(Math.ceil(v.current.temp_f)).color}`),
                label: theWeather.bind("value").as((v) => getWeatherIcon(Math.ceil(v.current.temp_f)).icon)
              })
            ]
          })
        ]
      }),
      Widget.Box({
        hpack: "center",
        child: Widget.Label({
          max_width_chars: 17,
          truncate: "end",
          lines: 2,
          class_name: theWeather.bind("value").as((v) => `calendar-menu-weather today condition label ${getWeatherIcon(Math.ceil(v.current.temp_f)).color}`),
          label: theWeather.bind("value").as((v) => v.current.condition.text)
        })
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/calendar/weather/hourly/utils.ts
var getNextEpoch = (wthr, hoursFromNow) => {
  const currentEpoch = wthr.location.localtime_epoch;
  const epochAtHourStart = currentEpoch - currentEpoch % 3600;
  let nextEpoch = 3600 * hoursFromNow + epochAtHourStart;
  const curHour = new Date(currentEpoch * 1000).getHours();
  if (curHour > 19) {
    const hoursToRewind = curHour - 19;
    nextEpoch = 3600 * hoursFromNow + epochAtHourStart - hoursToRewind * 3600;
  }
  return nextEpoch;
};

// /home/antonio/.config/HyprPanel/modules/menus/calendar/weather/hourly/icon/index.ts
var HourlyIcon = (theWeather, hoursFromNow) => {
  const getIconQuery = (wthr) => {
    const nextEpoch = getNextEpoch(wthr, hoursFromNow);
    const weatherAtEpoch = wthr.forecast.forecastday[0].hour.find((h) => h.time_epoch === nextEpoch);
    if (weatherAtEpoch === undefined) {
      return "warning";
    }
    let iconQuery = weatherAtEpoch.condition.text.trim().toLowerCase().replaceAll(" ", "_");
    if (!weatherAtEpoch?.is_day && iconQuery === "partly_cloudy") {
      iconQuery = "partly_cloudy_night";
    }
    if (isValidWeatherIconTitle(iconQuery)) {
      return iconQuery;
    } else {
      return "warning";
    }
  };
  return Widget.Box({
    hpack: "center",
    child: theWeather.bind("value").as((w) => {
      const iconQuery = getIconQuery(w);
      const weatherIcn = weatherIcons[iconQuery] || weatherIcons["warning"];
      return Widget.Label({
        hpack: "center",
        class_name: "hourly-weather-icon txt-icon",
        label: weatherIcn
      });
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/calendar/weather/hourly/temperature/index.ts
var { unit: unit4 } = options_default.menus.clock.weather;
var HourlyTemp = (theWeather, hoursFromNow) => {
  return Widget.Label({
    class_name: "hourly-weather-temp",
    label: Utils.merge([theWeather.bind("value"), unit4.bind("value")], (wthr, unt) => {
      if (!Object.keys(wthr).length) {
        return "-";
      }
      const nextEpoch = getNextEpoch(wthr, hoursFromNow);
      const weatherAtEpoch = wthr.forecast.forecastday[0].hour.find((h) => h.time_epoch === nextEpoch);
      if (unt === "imperial") {
        return `${weatherAtEpoch ? Math.ceil(weatherAtEpoch.temp_f) : "-"}\xB0 F`;
      }
      return `${weatherAtEpoch ? Math.ceil(weatherAtEpoch.temp_c) : "-"}\xB0 C`;
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/calendar/weather/hourly/time/index.ts
var HourlyTime = (theWeather, hoursFromNow) => {
  return Widget.Label({
    class_name: "hourly-weather-time",
    label: theWeather.bind("value").as((w) => {
      if (!Object.keys(w).length) {
        return "-";
      }
      const nextEpoch = getNextEpoch(w, hoursFromNow);
      const dateAtEpoch = new Date(nextEpoch * 1000);
      let hours = dateAtEpoch.getHours();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      return `${hours}${ampm}`;
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/calendar/weather/hourly/index.ts
var Hourly = (theWeather) => {
  return Widget.Box({
    vertical: false,
    hexpand: true,
    hpack: "fill",
    class_name: "hourly-weather-container",
    children: [1, 2, 3, 4].map((hoursFromNow) => {
      return Widget.Box({
        class_name: "hourly-weather-item",
        hexpand: true,
        vertical: true,
        children: [
          HourlyTime(theWeather, hoursFromNow),
          HourlyIcon(theWeather, hoursFromNow),
          HourlyTemp(theWeather, hoursFromNow)
        ]
      });
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/calendar/weather/index.ts
var WeatherWidget = () => {
  return Widget.Box({
    class_name: "calendar-menu-item-container weather",
    child: Widget.Box({
      class_name: "weather-container-box",
      setup: (self) => {
        return self.child = Widget.Box({
          vertical: true,
          hexpand: true,
          children: [
            Widget.Box({
              class_name: "calendar-menu-weather today",
              hexpand: true,
              children: [
                TodayIcon(globalWeatherVar),
                TodayTemperature(globalWeatherVar),
                TodayStats(globalWeatherVar)
              ]
            }),
            Widget.Separator({
              class_name: "menu-separator weather"
            }),
            Hourly(globalWeatherVar)
          ]
        });
      }
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/calendar/index.ts
var { enabled: weatherEnabled } = options_default.menus.clock.weather;
var calendar_default = () => {
  return dropdown_default({
    name: "calendarmenu",
    transition: "crossfade",
    child: Widget.Box({
      class_name: "calendar-menu-content",
      css: "padding: 1px; margin: -1px;",
      vexpand: false,
      children: [
        Widget.Box({
          class_name: "calendar-content-container",
          vertical: true,
          children: [
            Widget.Box({
              class_name: "calendar-content-items",
              vertical: true,
              children: weatherEnabled.bind("value").as((isWeatherEnabled) => {
                return [TimeWidget(), CalendarWidget(), ...isWeatherEnabled ? [WeatherWidget()] : []];
              })
            })
          ]
        })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/energy/profiles/index.ts
var powerProfiles = await Service.import("powerprofiles");
var EnergyProfiles = () => {
  const isValidProfile = (profile) => profile === "power-saver" || profile === "balanced" || profile === "performance";
  return Widget.Box({
    class_name: "menu-section-container energy",
    vertical: true,
    children: [
      Widget.Box({
        class_name: "menu-label-container",
        hpack: "fill",
        child: Widget.Label({
          class_name: "menu-label",
          hexpand: true,
          hpack: "start",
          label: "Power Profile"
        })
      }),
      Widget.Box({
        class_name: "menu-items-section",
        vpack: "fill",
        vexpand: true,
        vertical: true,
        children: powerProfiles.bind("profiles").as((profiles) => {
          return profiles.map((prof) => {
            const profileLabels = {
              "power-saver": "Power Saver",
              balanced: "Balanced",
              performance: "Performance"
            };
            const profileType = prof.Profile;
            if (!isValidProfile(profileType)) {
              return profileLabels.balanced;
            }
            return Widget.Button({
              on_primary_click: () => {
                powerProfiles.active_profile = prof.Profile;
              },
              class_name: powerProfiles.bind("active_profile").as((active2) => {
                return `power-profile-item ${active2 === prof.Profile ? "active" : ""}`;
              }),
              child: Widget.Box({
                children: [
                  Widget.Icon({
                    class_name: "power-profile-icon",
                    icon: icons_default2.powerprofile[profileType]
                  }),
                  Widget.Label({
                    class_name: "power-profile-label",
                    label: profileLabels[profileType]
                  })
                ]
              })
            });
          });
        })
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/services/Brightness.ts
if (!dependencies("brightnessctl"))
  App.quit();
var get = (args) => Number(Utils.exec(`brightnessctl ${args}`));
var screen = await bash`ls -w1 /sys/class/backlight | head -1`;
var kbd = await bash`ls -w1 /sys/class/leds | head -1`;

class Brightness extends Service {
  static {
    Service.register(this, {}, {
      screen: ["float", "rw"],
      kbd: ["int", "rw"]
    });
  }
  #kbdMax = get(`--device ${kbd} max`);
  #kbd = get(`--device ${kbd} get`);
  #screenMax = get(`--device ${screen} max`);
  #screen = get(`--device ${screen} get`) / (get(`--device ${screen} max`) || 1);
  get kbd() {
    return this.#kbd;
  }
  get screen() {
    return this.#screen;
  }
  set kbd(value) {
    if (value < 0 || value > this.#kbdMax)
      return;
    sh(`brightnessctl -d ${kbd} s ${value} -q`).then(() => {
      this.#kbd = value;
      this.changed("kbd");
    });
  }
  set screen(percent) {
    if (percent < 0)
      percent = 0;
    if (percent > 1)
      percent = 1;
    sh(`brightnessctl set ${Math.round(percent * 100)}% -d ${screen} -q`).then(() => {
      this.#screen = percent;
      this.changed("screen");
    });
  }
  constructor() {
    super();
    const screenPath = `/sys/class/backlight/${screen}/brightness`;
    const kbdPath = `/sys/class/leds/${kbd}/brightness`;
    Utils.monitorFile(screenPath, async (f) => {
      const v = await Utils.readFileAsync(f);
      this.#screen = Number(v) / this.#screenMax;
      this.changed("screen");
    });
    Utils.monitorFile(kbdPath, async (f) => {
      const v = await Utils.readFileAsync(f);
      this.#kbd = Number(v) / this.#kbdMax;
      this.changed("kbd");
    });
  }
}
var Brightness_default = new Brightness;

// /home/antonio/.config/HyprPanel/modules/menus/energy/brightness/index.ts
var Brightness2 = () => {
  return Widget.Box({
    class_name: "menu-section-container brightness",
    vertical: true,
    children: [
      Widget.Box({
        class_name: "menu-label-container",
        hpack: "fill",
        child: Widget.Label({
          class_name: "menu-label",
          hexpand: true,
          hpack: "start",
          label: "Brightness"
        })
      }),
      Widget.Box({
        class_name: "menu-items-section",
        vpack: "fill",
        vexpand: true,
        vertical: true,
        child: Widget.Box({
          class_name: "brightness-container",
          children: [
            Widget.Icon({
              vexpand: true,
              vpack: "center",
              class_name: "brightness-slider-icon",
              icon: icons_default2.brightness.screen
            }),
            Widget.Slider({
              vpack: "center",
              vexpand: true,
              value: Brightness_default.bind("screen"),
              class_name: "menu-active-slider menu-slider brightness",
              draw_value: false,
              hexpand: true,
              min: 0,
              max: 1,
              onChange: ({ value }) => Brightness_default.screen = value
            }),
            Widget.Label({
              vpack: "center",
              vexpand: true,
              class_name: "brightness-slider-label",
              label: Brightness_default.bind("screen").as((b) => `${Math.round(b * 100)}%`)
            })
          ]
        })
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/energy/index.ts
var energy_default = () => {
  return dropdown_default({
    name: "energymenu",
    transition: "crossfade",
    child: Widget.Box({
      class_name: "menu-items energy",
      hpack: "fill",
      hexpand: true,
      child: Widget.Box({
        vertical: true,
        hpack: "fill",
        hexpand: true,
        class_name: "menu-items-container energy",
        children: [Brightness2(), EnergyProfiles()]
      })
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/dashboard/profile/index.ts
import GdkPixbuf2 from "gi://GdkPixbuf";
var { image, name } = options_default.menus.dashboard.powermenu.avatar;
var { confirmation, shutdown: shutdown2, logout: logout2, sleep: sleep2, reboot: reboot2 } = options_default.menus.dashboard.powermenu;
var Profile = () => {
  const handleClick = (action) => {
    const actions = {
      shutdown: shutdown2.value,
      reboot: reboot2.value,
      logout: logout2.value,
      sleep: sleep2.value
    };
    App.closeWindow("dashboardmenu");
    if (!confirmation.value) {
      Utils.execAsync(actions[action]).catch((err) => console.error(`Failed to execute ${action} command. Error: ${err}`));
    } else {
      actions_default.action(action);
    }
  };
  const getIconForButton = (txtIcon) => {
    return Widget.Label({
      className: "txt-icon",
      label: txtIcon
    });
  };
  return Widget.Box({
    class_name: "profiles-container",
    hpack: "fill",
    hexpand: true,
    children: [
      Widget.Box({
        class_name: "profile-picture-container dashboard-card",
        hexpand: true,
        vertical: true,
        children: [
          Widget.Box({
            hpack: "center",
            class_name: "profile-picture",
            css: image.bind("value").as((i) => {
              try {
                GdkPixbuf2.Pixbuf.new_from_file(i);
                return `background-image: url("${i}")`;
              } catch {
                return `background-image: url("${App.configDir}/assets/hyprpanel.png")`;
              }
            })
          }),
          Widget.Label({
            hpack: "center",
            class_name: "profile-name",
            label: name.bind("value").as((v) => {
              if (v === "system") {
                return Utils.exec("bash -c whoami");
              }
              return v;
            })
          })
        ]
      }),
      Widget.Box({
        class_name: "power-menu-container dashboard-card",
        vertical: true,
        vexpand: true,
        children: [
          Widget.Button({
            class_name: "dashboard-button shutdown",
            on_clicked: () => handleClick("shutdown"),
            tooltip_text: "Shut Down",
            vexpand: true,
            child: getIconForButton("\uDB81\uDC25")
          }),
          Widget.Button({
            class_name: "dashboard-button restart",
            on_clicked: () => handleClick("reboot"),
            tooltip_text: "Restart",
            vexpand: true,
            child: getIconForButton("\uDB81\uDF09")
          }),
          Widget.Button({
            class_name: "dashboard-button lock",
            on_clicked: () => handleClick("logout"),
            tooltip_text: "Log Out",
            vexpand: true,
            child: getIconForButton("\uDB83\uDFC5")
          }),
          Widget.Button({
            class_name: "dashboard-button sleep",
            on_clicked: () => handleClick("sleep"),
            tooltip_text: "Sleep",
            vexpand: true,
            child: getIconForButton("\uDB82\uDD04")
          })
        ]
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/dashboard/shortcuts/index.ts
var hyprland11 = await Service.import("hyprland");
var { left, right } = options_default.menus.dashboard.shortcuts;
var Shortcuts = () => {
  const isRecording = Variable(false, {
    poll: [
      1000,
      `${App.configDir}/services/screen_record.sh status`,
      (out) => {
        if (out === "recording") {
          return true;
        }
        return false;
      }
    ]
  });
  const handleClick = (action, tOut = 250) => {
    App.closeWindow("dashboardmenu");
    setTimeout(() => {
      Utils.execAsync(action).then((res) => {
        return res;
      }).catch((err) => err);
    }, tOut);
  };
  const recordingDropdown = Widget.Menu({
    class_name: "dropdown recording",
    hpack: "fill",
    hexpand: true,
    setup: (self) => {
      self.hook(hyprland11, () => {
        const displays = hyprland11.monitors.map((mon) => {
          return Widget.MenuItem({
            label: `Display ${mon.name}`,
            on_activate: () => {
              App.closeWindow("dashboardmenu");
              Utils.execAsync(`${App.configDir}/services/screen_record.sh start ${mon.name}`).catch((err) => console.error(err));
            }
          });
        });
        return self.children = [
          ...displays
        ];
      });
    }
  });
  const cmdLn = (sCut) => {
    return sCut.command.value.length > 0;
  };
  const leftCardHidden = Variable(!(cmdLn(left.shortcut1) || cmdLn(left.shortcut2) || cmdLn(left.shortcut3) || cmdLn(left.shortcut4)));
  const createButton = (shortcut, className) => {
    if (shortcut.configurable !== false) {
      return Widget.Button({
        vexpand: true,
        tooltip_text: shortcut.tooltip.value,
        class_name: className,
        on_primary_click: () => handleClick(shortcut.command.value),
        child: Widget.Label({
          class_name: "button-label txt-icon",
          label: shortcut.icon.value
        })
      });
    } else {
      return Widget.Button({
        vexpand: true,
        tooltip_text: shortcut.tooltip,
        class_name: className,
        on_primary_click: (_, event) => {
          if (shortcut.command === "settings-dialog") {
            App.closeWindow("dashboardmenu");
            App.toggleWindow("settings-dialog");
          } else if (shortcut.command === "record") {
            if (isRecording.value === true) {
              App.closeWindow("dashboardmenu");
              return Utils.execAsync(`${App.configDir}/services/screen_record.sh stop`).catch((err) => console.error(err));
            } else {
              recordingDropdown.popup_at_pointer(event);
            }
          }
        },
        child: Widget.Label({
          class_name: "button-label txt-icon",
          label: shortcut.icon
        })
      });
    }
  };
  const createButtonIfCommandExists = (shortcut, className, command) => {
    if (command.length > 0) {
      return createButton(shortcut, className);
    }
    return Widget.Box();
  };
  return Widget.Box({
    class_name: "shortcuts-container",
    hpack: "fill",
    hexpand: true,
    children: [
      Widget.Box({
        child: Utils.merge([
          left.shortcut1.command.bind("value"),
          left.shortcut2.command.bind("value"),
          left.shortcut1.tooltip.bind("value"),
          left.shortcut2.tooltip.bind("value"),
          left.shortcut1.icon.bind("value"),
          left.shortcut2.icon.bind("value"),
          left.shortcut3.command.bind("value"),
          left.shortcut4.command.bind("value"),
          left.shortcut3.tooltip.bind("value"),
          left.shortcut4.tooltip.bind("value"),
          left.shortcut3.icon.bind("value"),
          left.shortcut4.icon.bind("value")
        ], () => {
          const isVisibleLeft = cmdLn(left.shortcut1) || cmdLn(left.shortcut2);
          const isVisibleRight = cmdLn(left.shortcut3) || cmdLn(left.shortcut4);
          if (!isVisibleLeft && !isVisibleRight) {
            leftCardHidden.value = true;
            return Widget.Box();
          }
          leftCardHidden.value = false;
          return Widget.Box({
            class_name: "container most-used dashboard-card",
            children: [
              Widget.Box({
                className: `card-button-section-container ${isVisibleRight && isVisibleLeft ? "visible" : ""}`,
                child: isVisibleLeft ? Widget.Box({
                  vertical: true,
                  hexpand: true,
                  vexpand: true,
                  children: [
                    createButtonIfCommandExists(left.shortcut1, `dashboard-button top-button ${cmdLn(left.shortcut2) ? "paired" : ""}`, left.shortcut1.command.value),
                    createButtonIfCommandExists(left.shortcut2, "dashboard-button", left.shortcut2.command.value)
                  ]
                }) : Widget.Box({
                  children: []
                })
              }),
              Widget.Box({
                className: "card-button-section-container",
                child: isVisibleRight ? Widget.Box({
                  vertical: true,
                  hexpand: true,
                  vexpand: true,
                  children: [
                    createButtonIfCommandExists(left.shortcut3, `dashboard-button top-button ${cmdLn(left.shortcut4) ? "paired" : ""}`, left.shortcut3.command.value),
                    createButtonIfCommandExists(left.shortcut4, "dashboard-button", left.shortcut4.command.value)
                  ]
                }) : Widget.Box({
                  children: []
                })
              })
            ]
          });
        })
      }),
      Widget.Box({
        child: Utils.merge([
          right.shortcut1.command.bind("value"),
          right.shortcut1.tooltip.bind("value"),
          right.shortcut1.icon.bind("value"),
          right.shortcut3.command.bind("value"),
          right.shortcut3.tooltip.bind("value"),
          right.shortcut3.icon.bind("value"),
          leftCardHidden.bind("value"),
          isRecording.bind("value")
        ], () => {
          return Widget.Box({
            class_name: `container utilities dashboard-card ${!leftCardHidden.value ? "paired" : ""}`,
            children: [
              Widget.Box({
                className: `card-button-section-container visible`,
                child: Widget.Box({
                  vertical: true,
                  hexpand: true,
                  vexpand: true,
                  children: [
                    createButtonIfCommandExists(right.shortcut1, "dashboard-button top-button paired", right.shortcut1.command.value),
                    createButtonIfCommandExists({
                      tooltip: "HyprPanel Configuration",
                      command: "settings-dialog",
                      icon: "\uDB81\uDC93",
                      configurable: false
                    }, "dashboard-button", "settings-dialog")
                  ]
                })
              }),
              Widget.Box({
                className: "card-button-section-container",
                child: Widget.Box({
                  vertical: true,
                  hexpand: true,
                  vexpand: true,
                  children: [
                    createButtonIfCommandExists(right.shortcut3, "dashboard-button top-button paired", right.shortcut3.command.value),
                    createButtonIfCommandExists({
                      tooltip: "Record Screen",
                      command: "record",
                      icon: "\uDB81\uDC4A",
                      configurable: false
                    }, `dashboard-button record ${isRecording.value ? "active" : ""}`, "record")
                  ]
                })
              })
            ]
          });
        })
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/dashboard/controls/index.ts
var network4 = await Service.import("network");
var bluetooth3 = await Service.import("bluetooth");
var notifications = await Service.import("notifications");
var audio7 = await Service.import("audio");
var Controls3 = () => {
  return Widget.Box({
    class_name: "dashboard-card controls-container",
    hpack: "fill",
    vpack: "fill",
    expand: true,
    children: [
      Widget.Button({
        tooltip_text: "Toggle Wifi",
        expand: true,
        setup: (self) => {
          self.hook(network4, () => {
            return self.class_name = `dashboard-button wifi ${!network4.wifi.enabled ? "disabled" : ""}`;
          });
        },
        on_primary_click: () => network4.toggleWifi(),
        child: Widget.Label({
          class_name: "txt-icon",
          setup: (self) => {
            self.hook(network4, () => {
              return self.label = network4.wifi.enabled ? "\uDB82\uDD28" : "\uDB82\uDD2D";
            });
          }
        })
      }),
      Widget.Button({
        tooltip_text: "Toggle Bluetooth",
        expand: true,
        class_name: bluetooth3.bind("enabled").as((btOn) => `dashboard-button bluetooth ${!btOn ? "disabled" : ""}`),
        on_primary_click: () => bluetooth3.toggle(),
        child: Widget.Label({
          class_name: "txt-icon",
          label: bluetooth3.bind("enabled").as((btOn) => btOn ? "\uDB80\uDCAF" : "\uDB80\uDCB2")
        })
      }),
      Widget.Button({
        tooltip_text: "Toggle Notifications",
        expand: true,
        class_name: notifications.bind("dnd").as((dnd) => `dashboard-button notifications ${dnd ? "disabled" : ""}`),
        on_primary_click: () => notifications.dnd = !notifications.dnd,
        child: Widget.Label({
          class_name: "txt-icon",
          label: notifications.bind("dnd").as((dnd) => dnd ? "\uDB80\uDC9B" : "\uDB80\uDC9A")
        })
      }),
      Widget.Button({
        tooltip_text: "Toggle Mute (Playback)",
        expand: true,
        on_primary_click: () => audio7.speaker.is_muted = !audio7.speaker.is_muted,
        setup: (self) => {
          self.hook(audio7, () => {
            return self.class_name = `dashboard-button playback ${audio7.speaker.is_muted ? "disabled" : ""}`;
          });
        },
        child: Widget.Label({
          class_name: "txt-icon",
          setup: (self) => {
            self.hook(audio7, () => {
              return self.label = audio7.speaker.is_muted ? "\uDB81\uDD81" : "\uDB81\uDD7E";
            });
          }
        })
      }),
      Widget.Button({
        tooltip_text: "Toggle Mute (Microphone)",
        expand: true,
        on_primary_click: () => audio7.microphone.is_muted = !audio7.microphone.is_muted,
        setup: (self) => {
          self.hook(audio7, () => {
            return self.class_name = `dashboard-button input ${audio7.microphone.is_muted ? "disabled" : ""}`;
          });
        },
        child: Widget.Label({
          class_name: "txt-icon",
          setup: (self) => {
            self.hook(audio7, () => {
              return self.label = audio7.microphone.is_muted ? "\uDB80\uDF6D" : "\uDB80\uDF6C";
            });
          }
        })
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/dashboard/stats/index.ts
var { terminal } = options_default;
var { enable_gpu } = options_default.menus.dashboard.stats;
var Stats = () => {
  const divide2 = ([total, free]) => free / total;
  const formatSizeInGB = (sizeInKB) => Number((sizeInKB / 1024 ** 2).toFixed(2));
  const cpu = Variable(0, {
    poll: [
      2000,
      "top -b -n 1",
      (out) => {
        if (typeof out !== "string") {
          return 0;
        }
        const cpuOut = out.split("\n").find((line) => line.includes("Cpu(s)"));
        if (cpuOut === undefined) {
          return 0;
        }
        const freeCpu = parseFloat(cpuOut.split(/\s+/)[1].replace(",", "."));
        return divide2([100, freeCpu]);
      }
    ]
  });
  const ram = Variable({ total: 0, used: 0, percentage: 0 }, {
    poll: [
      2000,
      "free",
      (out) => {
        if (typeof out !== "string") {
          return { total: 0, used: 0, percentage: 0 };
        }
        const ramOut = out.split("\n").find((line) => line.includes("Mem:"));
        if (ramOut === undefined) {
          return { total: 0, used: 0, percentage: 0 };
        }
        const [totalRam, usedRam] = ramOut.split(/\s+/).splice(1, 2).map(Number);
        return {
          percentage: divide2([totalRam, usedRam]),
          total: formatSizeInGB(totalRam),
          used: formatSizeInGB(usedRam)
        };
      }
    ]
  });
  const gpu = Variable(0);
  const GPUStat = Widget.Box({
    child: enable_gpu.bind("value").as((gpStat) => {
      if (!gpStat || !dependencies("gpustat")) {
        return Widget.Box();
      }
      return Widget.Box({
        vertical: true,
        children: [
          Widget.Box({
            class_name: "stat gpu",
            hexpand: true,
            vpack: "center",
            setup: (self) => {
              const getGpuUsage = () => {
                if (!enable_gpu.value) {
                  gpu.value = 0;
                  return;
                }
                Utils.execAsync("gpustat --json").then((out) => {
                  if (typeof out !== "string") {
                    return 0;
                  }
                  try {
                    const data = JSON.parse(out);
                    const totalGpu = 100;
                    const usedGpu = data.gpus.reduce((acc, gpu2) => {
                      return acc + gpu2["utilization.gpu"];
                    }, 0) / data.gpus.length;
                    gpu.value = divide2([totalGpu, usedGpu]);
                  } catch (e) {
                    console.error("Error getting GPU stats:", e);
                    gpu.value = 0;
                  }
                }).catch((err) => {
                  console.error(`An error occurred while fetching GPU stats: ${err}`);
                });
              };
              self.poll(2000, getGpuUsage);
              Utils.merge([gpu.bind("value"), enable_gpu.bind("value")], (gpu2, enableGpu) => {
                if (!enableGpu) {
                  return self.children = [];
                }
                return self.children = [
                  Widget.Button({
                    on_primary_click: terminal.bind("value").as((term) => {
                      return () => {
                        App.closeWindow("dashboardmenu");
                        Utils.execAsync(`bash -c "${term} -e btop"`).catch((err) => `Failed to open btop: ${err}`);
                      };
                    }),
                    child: Widget.Label({
                      class_name: "txt-icon",
                      label: "\uDB82\uDCAE"
                    })
                  }),
                  Widget.Button({
                    on_primary_click: terminal.bind("value").as((term) => {
                      return () => {
                        App.closeWindow("dashboardmenu");
                        Utils.execAsync(`bash -c "${term} -e btop"`).catch((err) => `Failed to open btop: ${err}`);
                      };
                    }),
                    child: Widget.LevelBar({
                      class_name: "stats-bar",
                      hexpand: true,
                      vpack: "center",
                      value: gpu2
                    })
                  })
                ];
              });
            }
          }),
          Widget.Box({
            hpack: "end",
            children: Utils.merge([gpu.bind("value"), enable_gpu.bind("value")], (gpuUsed, enableGpu) => {
              if (!enableGpu) {
                return [];
              }
              return [
                Widget.Label({
                  class_name: "stat-value gpu",
                  label: `${Math.floor(gpuUsed * 100)}%`
                })
              ];
            })
          })
        ]
      });
    })
  });
  const storage = Variable({ total: 0, used: 0, percentage: 0 }, {
    poll: [
      2000,
      "df -B1 /",
      (out) => {
        if (typeof out !== "string") {
          return { total: 0, used: 0, percentage: 0 };
        }
        const dfOut = out.split("\n").find((line) => line.startsWith("/"));
        if (dfOut === undefined) {
          return { total: 0, used: 0, percentage: 0 };
        }
        const parts = dfOut.split(/\s+/);
        const size = parseInt(parts[1], 10);
        const used = parseInt(parts[2], 10);
        const sizeInGB = formatSizeInGB(size);
        const usedInGB = formatSizeInGB(used);
        return {
          total: Math.floor(sizeInGB / 1000),
          used: Math.floor(usedInGB / 1000),
          percentage: divide2([size, used])
        };
      }
    ]
  });
  return Widget.Box({
    class_name: "dashboard-card stats-container",
    vertical: true,
    vpack: "fill",
    hpack: "fill",
    expand: true,
    children: [
      Widget.Box({
        vertical: true,
        children: [
          Widget.Box({
            class_name: "stat cpu",
            hexpand: true,
            vpack: "center",
            children: [
              Widget.Button({
                on_primary_click: terminal.bind("value").as((term) => {
                  return () => {
                    App.closeWindow("dashboardmenu");
                    Utils.execAsync(`bash -c "${term} -e btop"`).catch((err) => `Failed to open btop: ${err}`);
                  };
                }),
                child: Widget.Label({
                  class_name: "txt-icon",
                  label: "\uF4BC"
                })
              }),
              Widget.Button({
                on_primary_click: terminal.bind("value").as((term) => {
                  return () => {
                    App.closeWindow("dashboardmenu");
                    Utils.execAsync(`bash -c "${term} -e btop"`).catch((err) => `Failed to open btop: ${err}`);
                  };
                }),
                child: Widget.LevelBar({
                  class_name: "stats-bar",
                  hexpand: true,
                  vpack: "center",
                  bar_mode: "continuous",
                  max_value: 1,
                  value: cpu.bind("value")
                })
              })
            ]
          }),
          Widget.Label({
            hpack: "end",
            class_name: "stat-value cpu",
            label: cpu.bind("value").as((v) => `${Math.floor(v * 100)}%`)
          })
        ]
      }),
      Widget.Box({
        vertical: true,
        children: [
          Widget.Box({
            class_name: "stat ram",
            vpack: "center",
            hexpand: true,
            children: [
              Widget.Button({
                on_primary_click: terminal.bind("value").as((term) => {
                  return () => {
                    App.closeWindow("dashboardmenu");
                    Utils.execAsync(`bash -c "${term} -e btop"`).catch((err) => `Failed to open btop: ${err}`);
                  };
                }),
                child: Widget.Label({
                  class_name: "txt-icon",
                  label: "\uEFC5"
                })
              }),
              Widget.Button({
                on_primary_click: terminal.bind("value").as((term) => {
                  return () => {
                    App.closeWindow("dashboardmenu");
                    Utils.execAsync(`bash -c "${term} -e btop"`).catch((err) => `Failed to open btop: ${err}`);
                  };
                }),
                child: Widget.LevelBar({
                  class_name: "stats-bar",
                  hexpand: true,
                  vpack: "center",
                  value: ram.bind("value").as((v) => v.percentage)
                })
              })
            ]
          }),
          Widget.Label({
            hpack: "end",
            class_name: "stat-value ram",
            label: ram.bind("value").as((v) => `${v.used}/${v.total} GB`)
          })
        ]
      }),
      GPUStat,
      Widget.Box({
        vertical: true,
        children: [
          Widget.Box({
            class_name: "stat storage",
            hexpand: true,
            vpack: "center",
            children: [
              Widget.Button({
                on_primary_click: terminal.bind("value").as((term) => {
                  return () => {
                    App.closeWindow("dashboardmenu");
                    Utils.execAsync(`bash -c "${term} -e btop"`).catch((err) => `Failed to open btop: ${err}`);
                  };
                }),
                child: Widget.Label({
                  class_name: "txt-icon",
                  label: "\uDB80\uDECA"
                })
              }),
              Widget.Button({
                on_primary_click: terminal.bind("value").as((term) => {
                  return () => {
                    App.closeWindow("dashboardmenu");
                    Utils.execAsync(`bash -c "${term} -e btop"`).catch((err) => `Failed to open btop: ${err}`);
                  };
                }),
                child: Widget.LevelBar({
                  class_name: "stats-bar",
                  hexpand: true,
                  vpack: "center",
                  value: storage.bind("value").as((v) => v.percentage)
                })
              })
            ]
          }),
          Widget.Label({
            hpack: "end",
            class_name: "stat-value storage",
            label: storage.bind("value").as((v) => `${v.used}/${v.total} GB`)
          })
        ]
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/dashboard/directories/index.ts
var { left: left2, right: right2 } = options_default.menus.dashboard.directories;
var Directories = () => {
  return Widget.Box({
    class_name: "dashboard-card directories-container",
    vpack: "fill",
    hpack: "fill",
    expand: true,
    children: [
      Widget.Box({
        vertical: true,
        expand: true,
        class_name: "section right",
        children: [
          Widget.Button({
            hpack: "start",
            expand: true,
            class_name: "directory-link left top",
            on_primary_click: left2.directory1.command.bind("value").as((cmd) => {
              return () => {
                App.closeWindow("dashboardmenu");
                Utils.execAsync(cmd);
              };
            }),
            child: Widget.Label({
              hpack: "start",
              label: left2.directory1.label.bind("value")
            })
          }),
          Widget.Button({
            expand: true,
            hpack: "start",
            class_name: "directory-link left middle",
            on_primary_click: left2.directory2.command.bind("value").as((cmd) => {
              return () => {
                App.closeWindow("dashboardmenu");
                Utils.execAsync(cmd);
              };
            }),
            child: Widget.Label({
              hpack: "start",
              label: left2.directory2.label.bind("value")
            })
          }),
          Widget.Button({
            expand: true,
            hpack: "start",
            class_name: "directory-link left bottom",
            on_primary_click: left2.directory3.command.bind("value").as((cmd) => {
              return () => {
                App.closeWindow("dashboardmenu");
                Utils.execAsync(cmd);
              };
            }),
            child: Widget.Label({
              hpack: "start",
              label: left2.directory3.label.bind("value")
            })
          })
        ]
      }),
      Widget.Box({
        vertical: true,
        expand: true,
        class_name: "section left",
        children: [
          Widget.Button({
            hpack: "start",
            expand: true,
            class_name: "directory-link right top",
            on_primary_click: right2.directory1.command.bind("value").as((cmd) => {
              return () => {
                App.closeWindow("dashboardmenu");
                Utils.execAsync(cmd);
              };
            }),
            child: Widget.Label({
              hpack: "start",
              label: right2.directory1.label.bind("value")
            })
          }),
          Widget.Button({
            expand: true,
            hpack: "start",
            class_name: "directory-link right middle",
            on_primary_click: right2.directory2.command.bind("value").as((cmd) => {
              return () => {
                App.closeWindow("dashboardmenu");
                Utils.execAsync(cmd);
              };
            }),
            child: Widget.Label({
              hpack: "start",
              label: right2.directory2.label.bind("value")
            })
          }),
          Widget.Button({
            expand: true,
            hpack: "start",
            class_name: "directory-link right bottom",
            on_primary_click: right2.directory3.command.bind("value").as((cmd) => {
              return () => {
                App.closeWindow("dashboardmenu");
                Utils.execAsync(cmd);
              };
            }),
            child: Widget.Label({
              hpack: "start",
              label: right2.directory3.label.bind("value")
            })
          })
        ]
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/dashboard/index.ts
var dashboard_default = () => {
  return dropdown_default({
    name: "dashboardmenu",
    transition: "crossfade",
    child: Widget.Box({
      class_name: "dashboard-menu-content",
      css: "padding: 1px; margin: -1px;",
      vexpand: false,
      children: [
        Widget.Box({
          class_name: "dashboard-content-container",
          vertical: true,
          children: [
            Widget.Box({
              class_name: "dashboard-content-items",
              vertical: true,
              children: [Profile(), Shortcuts(), Controls3(), Directories(), Stats()]
            })
          ]
        })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/powerDropdown/button.ts
var { confirmation: confirmation2, shutdown: shutdown3, logout: logout3, sleep: sleep3, reboot: reboot3, showLabel } = options_default.menus.power;
var PowerButton = (action) => {
  const handleClick = (action2) => {
    const actions = {
      shutdown: shutdown3.value,
      reboot: reboot3.value,
      logout: logout3.value,
      sleep: sleep3.value
    };
    App.closeWindow("powerdropdownmenu");
    if (!confirmation2.value) {
      Utils.execAsync(actions[action2]).catch((err) => console.error(`Failed to execute ${action2} command. Error: ${err}`));
    } else {
      actions_default.customAction(action2, actions[action2]);
    }
  };
  const powerIconMap = {
    shutdown: "\uDB81\uDC25",
    reboot: "\uDB81\uDF09",
    logout: "\uDB83\uDFC5",
    sleep: "\uDB82\uDD04"
  };
  return Widget.Button({
    className: showLabel.bind("value").as((shwLbl) => {
      return `power-menu-button ${action} ${!shwLbl ? "no-label" : ""}`;
    }),
    on_clicked: () => handleClick(action),
    child: Widget.Box({
      vertical: false,
      children: showLabel.bind("value").as((shwLbl) => {
        if (shwLbl) {
          return [
            Widget.Label({
              label: powerIconMap[action],
              className: `power-button-icon ${action}-icon txt-icon`
            }),
            Widget.Label({
              hpack: "center",
              hexpand: true,
              label: action.charAt(0).toUpperCase() + action.slice(1),
              className: `power-button-label ${action}-label show-label`
            })
          ];
        }
        return [
          Widget.Label({
            label: powerIconMap[action],
            className: `power-button-icon ${action}-icon no-label txt-icon`
          })
        ];
      })
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/powerDropdown/index.ts
var powerDropdown_default = () => {
  return dropdown_default({
    name: "powerdropdownmenu",
    transition: "crossfade",
    child: Widget.Box({
      class_name: "menu-items power-dropdown",
      child: Widget.Box({
        vertical: true,
        hexpand: true,
        class_name: "menu-items-container power-dropdown",
        children: [PowerButton("shutdown"), PowerButton("reboot"), PowerButton("logout"), PowerButton("sleep")]
      })
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/menus/main.ts
var main_default = [
  power_default(),
  verification_default(),
  audio_default(),
  network_default(),
  bluetooth_default(),
  media_default(),
  notifications_default(),
  calendar_default(),
  energy_default(),
  dashboard_default(),
  powerDropdown_default()
];

// /home/antonio/.config/HyprPanel/widget/RegularWindow.ts
import Gtk2 from "gi://Gtk?version=3.0";
var RegularWindow_default = Widget.subclass(Gtk2.Window);

// /home/antonio/.config/HyprPanel/widget/settings/shared/Label.ts
var Label = (name2, sub = "", subtitleLink = "") => {
  const subTitle = () => {
    if (subtitleLink.length) {
      return Widget.Button({
        hpack: "start",
        vpack: "center",
        class_name: "options-sublabel-link",
        label: sub,
        on_primary_click: () => Utils.execAsync(`bash -c 'xdg-open ${subtitleLink}'`)
      });
    }
    return Widget.Label({
      hpack: "start",
      vpack: "center",
      class_name: "options-sublabel",
      label: sub
    });
  };
  return Widget.Box({
    vertical: true,
    hpack: "start",
    children: [
      Widget.Label({
        hpack: "start",
        vpack: "center",
        class_name: "options-label",
        label: name2
      }),
      subTitle()
    ]
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/shared/components/number.ts
var numberInputter = (self, opt2, min, max, increment = 1, isUnsaved) => {
  return self.children = [
    Widget.Box({
      class_name: "unsaved-icon-container",
      child: isUnsaved.bind("value").as((unsvd) => {
        if (unsvd) {
          return Widget.Icon({
            class_name: "unsaved-icon",
            icon: icons_default.ui.warning,
            tooltipText: "Press 'Enter' to apply your changes."
          });
        }
        return Widget.Box();
      })
    }),
    Widget.SpinButton({
      setup(self2) {
        self2.set_range(min, max);
        self2.set_increments(1 * increment, 5 * increment);
        self2.on("value-changed", () => {
          opt2.value = self2.value;
        });
        self2.hook(opt2, () => {
          self2.value = opt2.value;
          isUnsaved.value = Number(self2.text) !== opt2.value;
        });
        self2.connect("key-release-event", () => {
          isUnsaved.value = Number(self2.text) !== opt2.value;
        });
      }
    })
  ];
};

// /home/antonio/.config/HyprPanel/widget/settings/shared/components/object.ts
var objectInputter = (self, opt2, isUnsaved, className) => {
  return self.children = [
    Widget.Box({
      class_name: "unsaved-icon-container",
      child: isUnsaved.bind("value").as((unsvd) => {
        if (unsvd) {
          return Widget.Icon({
            class_name: "unsaved-icon",
            icon: icons_default.ui.warning,
            tooltipText: "Press 'Enter' to apply your changes."
          });
        }
        return Widget.Box();
      })
    }),
    Widget.Entry({
      class_name: className,
      on_change: (self2) => isUnsaved.value = self2.text !== JSON.stringify(opt2.value),
      on_accept: (self2) => opt2.value = JSON.parse(self2.text || ""),
      setup: (self2) => self2.hook(opt2, () => {
        self2.text = JSON.stringify(opt2.value);
        isUnsaved.value = self2.text !== JSON.stringify(opt2.value);
      })
    })
  ];
};

// /home/antonio/.config/HyprPanel/widget/settings/shared/components/string.ts
var stringInputter = (self, opt2, isUnsaved) => {
  return self.children = [
    Widget.Box({
      class_name: "unsaved-icon-container",
      child: isUnsaved.bind("value").as((unsvd) => {
        if (unsvd) {
          return Widget.Icon({
            class_name: "unsaved-icon",
            icon: icons_default.ui.warning,
            tooltipText: "Press 'Enter' to apply your changes."
          });
        }
        return Widget.Box();
      })
    }),
    Widget.Entry({
      class_name: isUnsaved.bind("value").as((unsaved) => unsaved ? "unsaved" : ""),
      on_change: (self2) => isUnsaved.value = self2.text !== opt2.value,
      on_accept: (self2) => {
        opt2.value = self2.text;
      },
      setup: (self2) => self2.hook(opt2, () => {
        isUnsaved.value = self2.text !== opt2.value;
        self2.text = opt2.value;
      })
    })
  ];
};

// /home/antonio/.config/HyprPanel/widget/settings/shared/components/boolean.ts
var booleanInputter = (self, opt2, disabledBinding, dependencies2) => {
  return self.child = Widget.Switch({
    sensitive: disabledBinding !== undefined ? disabledBinding.bind("value").as((disabled) => !disabled) : true
  }).on("notify::active", (self2) => {
    if (disabledBinding !== undefined && disabledBinding.value) {
      return;
    }
    if (self2.active && dependencies2 !== undefined && !dependencies2.every((d) => dependencies(d))) {
      self2.active = false;
      return;
    }
    opt2.value = self2.active;
  }).hook(opt2, (self2) => {
    self2.active = opt2.value;
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/shared/components/image.ts
var imageInputter = (self, opt2) => {
  return self.child = Widget.FileChooserButton({
    class_name: "image-chooser",
    on_file_set: ({ uri }) => {
      opt2.value = uri.replace("file://", "");
    }
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/shared/components/import.ts
var importInputter = (self, exportData) => {
  return self.child = Widget.Box({
    children: [
      Widget.Button({
        class_name: "options-import",
        label: "import",
        on_clicked: () => {
          importFiles(exportData?.themeOnly);
        }
      }),
      Widget.Button({
        class_name: "options-export",
        label: "export",
        on_clicked: () => {
          saveFileDialog(exportData?.filePath, exportData?.themeOnly);
        }
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/shared/components/wallpaper.ts
var wallpaperInputter = (self, opt2) => {
  if (typeof opt2.value === "string") {
    return self.child = Widget.FileChooserButton({
      on_file_set: ({ uri }) => {
        const newValue = uri.replace("file://", "");
        opt2.value = newValue;
        if (options.wallpaper.enable.value) {
          Wallpaper_default.set(newValue);
        }
      }
    });
  }
};

// /home/antonio/.config/HyprPanel/widget/settings/shared/components/color.ts
import Gdk3 from "gi://Gdk";
var colorInputter = (self, opt2) => {
  return self.child = Widget.ColorButton().hook(opt2, (self2) => {
    const rgba = new Gdk3.RGBA;
    rgba.parse(opt2.value);
    self2.rgba = rgba;
  }).on("color-set", ({ rgba: { red, green, blue } }) => {
    const hex = (n) => {
      const c = Math.floor(255 * n).toString(16);
      return c.length === 1 ? `0${c}` : c;
    };
    opt2.value = `#${hex(red)}${hex(green)}${hex(blue)}`;
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/shared/components/enum.ts
var enumInputter = (self, opt2, values) => {
  const lbl = Widget.Label({ label: opt2.bind().as((v) => `${v}`) });
  const step = (dir) => {
    const i = values.findIndex((i2) => i2 === lbl.label);
    opt2.setValue(dir > 0 ? i + dir > values.length - 1 ? values[0] : values[i + dir] : i + dir < 0 ? values[values.length - 1] : values[i + dir]);
  };
  const next = Widget.Button({
    child: Widget.Icon(icons_default.ui.arrow.right),
    on_clicked: () => step(1)
  });
  const prev = Widget.Button({
    child: Widget.Icon(icons_default.ui.arrow.left),
    on_clicked: () => step(-1)
  });
  return self.child = Widget.Box({
    class_name: "enum-setter",
    children: [lbl, prev, next]
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/shared/components/font.ts
var fontInputter = (self, opt2) => {
  return self.child = Widget.FontButton({
    show_size: false,
    use_size: false,
    setup: (self2) => self2.hook(opt2, () => self2.font = opt2.value).on("font-set", ({ font }) => opt2.value = font.split(" ").slice(0, -1).join(" "))
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/shared/Inputter.ts
var Inputter = ({
  opt: opt2,
  type = typeof opt2.value,
  enums,
  disabledBinding,
  dependencies: dependencies2,
  exportData,
  min = 0,
  max = 1e6,
  increment = 1
}, className, isUnsaved) => {
  return Widget.Box({
    vpack: "center",
    class_name: /export|import/.test(type || "") ? "" : "inputter-container",
    setup: (self) => {
      switch (type) {
        case "number":
          return numberInputter(self, opt2, min, max, increment, isUnsaved);
        case "float":
        case "object":
          return objectInputter(self, opt2, isUnsaved, className);
        case "string":
          return stringInputter(self, opt2, isUnsaved);
        case "enum":
          return enumInputter(self, opt2, enums);
        case "boolean":
          return booleanInputter(self, opt2, disabledBinding, dependencies2);
        case "img":
          return imageInputter(self, opt2);
        case "config_import":
          return importInputter(self, exportData);
        case "wallpaper":
          return wallpaperInputter(self, opt2);
        case "font":
          return fontInputter(self, opt2);
        case "color":
          return colorInputter(self, opt2);
        default:
          return self.child = Widget.Label({
            label: `No setter with type ${type}`
          });
      }
    }
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/shared/Option.ts
var Option = (props, className = "") => {
  const isUnsaved = Variable(false);
  return Widget.Box({
    class_name: "option-item",
    hexpand: true,
    children: [
      Widget.Box({
        hpack: "start",
        vpack: "center",
        hexpand: true,
        child: Label(props.title, props.subtitle || "", props.subtitleLink)
      }),
      Inputter(props, className, isUnsaved),
      Widget.Button({
        vpack: "center",
        class_name: "reset-options",
        child: Widget.Icon(icons_default.ui.refresh),
        on_clicked: () => props.opt.reset(),
        sensitive: props.opt.bind().as((v) => v !== props.opt.initial)
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/shared/Header.ts
var Header2 = (headerName) => {
  return Widget.Box({
    class_name: "options-header",
    children: [
      Widget.Label({
        class_name: "label-name",
        label: headerName
      }),
      Widget.Separator({
        vpack: "center",
        hexpand: true,
        class_name: "menu-separator"
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/pages/theme/bar/index.ts
var BarTheme = () => {
  return Widget.Scrollable({
    vscroll: "always",
    hscroll: "automatic",
    class_name: "bar-theme-page paged-container",
    child: Widget.Box({
      vertical: true,
      children: [
        Header2("General"),
        Option({ opt: options_default.theme.bar.transparent, title: "Transparent", type: "boolean" }),
        Option({ opt: options_default.theme.bar.background, title: "Background Color", type: "color" }),
        Option({
          opt: options_default.theme.bar.buttons.style,
          title: "Button Style",
          type: "enum",
          enums: ["default", "split", "wave", "wave2"]
        }),
        Option({
          opt: options_default.theme.bar.opacity,
          title: "Background Opacity",
          type: "number",
          increment: 5,
          min: 0,
          max: 100
        }),
        Option({
          opt: options_default.theme.bar.buttons.opacity,
          title: "Button Opacity",
          type: "number",
          increment: 5,
          min: 0,
          max: 100
        }),
        Option({
          opt: options_default.theme.bar.buttons.background_opacity,
          title: "Button Background Opacity",
          type: "number",
          increment: 5,
          min: 0,
          max: 100
        }),
        Option({
          opt: options_default.theme.bar.buttons.background_hover_opacity,
          title: "Button Background Hover Opacity",
          type: "number",
          increment: 5,
          min: 0,
          max: 100
        }),
        Option({
          opt: options_default.theme.bar.buttons.monochrome,
          title: "Use Global Colors",
          type: "boolean",
          disabledBinding: options_default.theme.matugen
        }),
        Option({ opt: options_default.theme.bar.buttons.background, title: "Button Background", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.hover, title: "Button Hover", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.text, title: "Button Text", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.icon, title: "Button Icon", type: "color" }),
        Option({
          opt: options_default.theme.bar.buttons.icon_background,
          title: "Button Icon Background",
          subtitle: "Applies a background color to the icon section of the button.\nRequires 'split' button styling.",
          type: "color"
        }),
        Header2("Dashboard Button"),
        Option({ opt: options_default.theme.bar.buttons.dashboard.background, title: "Background", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.dashboard.icon, title: "Icon", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.dashboard.border, title: "Border", type: "color" }),
        Header2("Workspaces"),
        Option({ opt: options_default.theme.bar.buttons.workspaces.background, title: "Background", type: "color" }),
        Option({
          opt: options_default.theme.bar.buttons.workspaces.hover,
          title: "Workspace Hover Color",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.buttons.workspaces.available,
          title: "Workspace Available Color",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.buttons.workspaces.occupied,
          title: "Workspace Occupied Color",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.buttons.workspaces.active,
          title: "Workspace Active Color",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.buttons.workspaces.numbered_active_highlighted_text_color,
          title: "Highlighted Workspace Text Color",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.buttons.workspaces.numbered_active_underline_color,
          title: "Workspace Underline Color",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.buttons.workspaces.border, title: "Border", type: "color" }),
        Header2("Window Title"),
        Option({ opt: options_default.theme.bar.buttons.windowtitle.background, title: "Background", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.windowtitle.text, title: "Text", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.windowtitle.icon, title: "Icon", type: "color" }),
        Option({
          opt: options_default.theme.bar.buttons.windowtitle.icon_background,
          title: "Button Icon Background",
          subtitle: "Applies a background color to the icon section of the button.\nRequires 'split' button styling.",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.buttons.windowtitle.border, title: "Border", type: "color" }),
        Header2("Media"),
        Option({ opt: options_default.theme.bar.buttons.media.background, title: "Background", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.media.text, title: "Text", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.media.icon, title: "Icon", type: "color" }),
        Option({
          opt: options_default.theme.bar.buttons.media.icon_background,
          title: "Button Icon Background",
          subtitle: "Applies a background color to the icon section of the button.\nRequires 'split' button styling.",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.buttons.media.border, title: "Border", type: "color" }),
        Header2("Volume"),
        Option({ opt: options_default.theme.bar.buttons.volume.background, title: "Background", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.volume.text, title: "Text", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.volume.icon, title: "Icon", type: "color" }),
        Option({
          opt: options_default.theme.bar.buttons.volume.icon_background,
          title: "Button Icon Background",
          subtitle: "Applies a background color to the icon section of the button.\nRequires 'split' button styling.",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.buttons.volume.border, title: "Border", type: "color" }),
        Header2("Network"),
        Option({ opt: options_default.theme.bar.buttons.network.background, title: "Background", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.network.text, title: "Text", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.network.icon, title: "Icon", type: "color" }),
        Option({
          opt: options_default.theme.bar.buttons.network.icon_background,
          title: "Button Icon Background",
          subtitle: "Applies a background color to the icon section of the button.\nRequires 'split' button styling.",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.buttons.network.border, title: "Border", type: "color" }),
        Header2("Bluetooth"),
        Option({ opt: options_default.theme.bar.buttons.bluetooth.background, title: "Background", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.bluetooth.text, title: "Text", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.bluetooth.icon, title: "Icon", type: "color" }),
        Option({
          opt: options_default.theme.bar.buttons.bluetooth.icon_background,
          title: "Button Icon Background",
          subtitle: "Applies a background color to the icon section of the button.\nRequires 'split' button styling.",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.buttons.bluetooth.border, title: "Border", type: "color" }),
        Header2("System Tray"),
        Option({ opt: options_default.theme.bar.buttons.systray.background, title: "Background", type: "color" }),
        Header2("Battery"),
        Option({ opt: options_default.theme.bar.buttons.battery.background, title: "Background", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.battery.text, title: "Text", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.battery.icon, title: "Icon", type: "color" }),
        Option({
          opt: options_default.theme.bar.buttons.battery.icon_background,
          title: "Button Icon Background",
          subtitle: "Applies a background color to the icon section of the button.\nRequires 'split' button styling.",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.buttons.battery.border, title: "Border", type: "color" }),
        Header2("Clock"),
        Option({ opt: options_default.theme.bar.buttons.clock.background, title: "Background", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.clock.text, title: "Text", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.clock.icon, title: "Icon", type: "color" }),
        Option({
          opt: options_default.theme.bar.buttons.clock.icon_background,
          title: "Button Icon Background",
          subtitle: "Applies a background color to the icon section of the button.\nRequires 'split' button styling.",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.buttons.clock.border, title: "Border", type: "color" }),
        Header2("Notifications"),
        Option({ opt: options_default.theme.bar.buttons.notifications.background, title: "Background", type: "color" }),
        Option({
          opt: options_default.theme.bar.buttons.notifications.total,
          title: "Notification Count",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.buttons.notifications.icon, title: "Icon", type: "color" }),
        Option({
          opt: options_default.theme.bar.buttons.notifications.icon_background,
          title: "Button Icon Background",
          subtitle: "Applies a background color to the icon section of the button.\nRequires 'split' button styling.",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.buttons.notifications.border, title: "Border", type: "color" })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/pages/theme/notifications/index.ts
var NotificationsTheme = () => {
  return Widget.Scrollable({
    vscroll: "automatic",
    hscroll: "automatic",
    class_name: "notifications-theme-page paged-container",
    vexpand: true,
    child: Widget.Box({
      vertical: true,
      children: [
        Header2("Notifications Theme Settings"),
        Option({ opt: options_default.theme.notification.background, title: "Notification Background", type: "color" }),
        Option({
          opt: options_default.theme.notification.opacity,
          title: "Notification Opacity",
          type: "number",
          increment: 5,
          min: 0,
          max: 100
        }),
        Option({
          opt: options_default.theme.notification.actions.background,
          title: "Action Button Background",
          subtitle: "Buttons that perform actions within a notification",
          type: "color"
        }),
        Option({
          opt: options_default.theme.notification.actions.text,
          title: "Action Button Text Color",
          type: "color"
        }),
        Option({ opt: options_default.theme.notification.label, title: "Label", type: "color" }),
        Option({ opt: options_default.theme.notification.border, title: "Border", type: "color" }),
        Option({ opt: options_default.theme.notification.time, title: "Time Stamp", type: "color" }),
        Option({ opt: options_default.theme.notification.text, title: "Body Text", type: "color" }),
        Option({
          opt: options_default.theme.notification.labelicon,
          title: "Label Icon",
          subtitle: "Icon that accompanies the label. Doesn't apply if icon is an app icon.",
          type: "color"
        }),
        Option({
          opt: options_default.theme.notification.close_button.background,
          title: "Dismiss Button",
          type: "color"
        }),
        Option({
          opt: options_default.theme.notification.close_button.label,
          title: "Dismiss Button Text",
          type: "color"
        })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/pages/theme/menus/battery.ts
var BatteryMenuTheme = () => {
  return Widget.Scrollable({
    vscroll: "automatic",
    hscroll: "automatic",
    class_name: "menu-theme-page battery paged-container",
    vexpand: true,
    child: Widget.Box({
      vertical: true,
      children: [
        Header2("Battery Menu Theme Settings"),
        Option({ opt: options_default.theme.bar.menus.menu.battery.text, title: "Text", type: "color" }),
        Header2("Card"),
        Option({ opt: options_default.theme.bar.menus.menu.battery.card.color, title: "Card", type: "color" }),
        Header2("Background"),
        Option({
          opt: options_default.theme.bar.menus.menu.battery.background.color,
          title: "Background",
          type: "color"
        }),
        Header2("Border"),
        Option({ opt: options_default.theme.bar.menus.menu.battery.border.color, title: "Border", type: "color" }),
        Header2("Label"),
        Option({ opt: options_default.theme.bar.menus.menu.battery.label.color, title: "Label", type: "color" }),
        Header2("List Items"),
        Option({
          opt: options_default.theme.bar.menus.menu.battery.listitems.active,
          title: "Active/Hover",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.battery.listitems.passive,
          title: "Passive",
          type: "color"
        }),
        Header2("Icons"),
        Option({ opt: options_default.theme.bar.menus.menu.battery.icons.active, title: "Active", type: "color" }),
        Option({ opt: options_default.theme.bar.menus.menu.battery.icons.passive, title: "Passive", type: "color" }),
        Header2("Slider"),
        Option({ opt: options_default.theme.bar.menus.menu.battery.slider.primary, title: "Primary", type: "color" }),
        Option({
          opt: options_default.theme.bar.menus.menu.battery.slider.background,
          title: "Background",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.battery.slider.backgroundhover,
          title: "Background (Hover)",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.menus.menu.battery.slider.puck, title: "Puck", type: "color" })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/pages/theme/menus/bluetooth.ts
var BluetoothMenuTheme = () => {
  return Widget.Scrollable({
    vscroll: "automatic",
    hscroll: "automatic",
    class_name: "menu-theme-page bluetooth paged-container",
    vexpand: true,
    child: Widget.Box({
      vertical: true,
      children: [
        Header2("Bluetooth Menu Theme Settings"),
        Option({ opt: options_default.theme.bar.menus.menu.bluetooth.text, title: "Text", type: "color" }),
        Header2("Card"),
        Option({ opt: options_default.theme.bar.menus.menu.bluetooth.card.color, title: "Card", type: "color" }),
        Header2("Background"),
        Option({
          opt: options_default.theme.bar.menus.menu.bluetooth.background.color,
          title: "Background",
          type: "color"
        }),
        Header2("Border"),
        Option({ opt: options_default.theme.bar.menus.menu.bluetooth.border.color, title: "Border", type: "color" }),
        Header2("Label"),
        Option({ opt: options_default.theme.bar.menus.menu.bluetooth.label.color, title: "Label", type: "color" }),
        Header2("Status"),
        Option({
          opt: options_default.theme.bar.menus.menu.bluetooth.status,
          title: "Connection Status",
          type: "color"
        }),
        Header2("List Items"),
        Option({
          opt: options_default.theme.bar.menus.menu.bluetooth.listitems.active,
          title: "Active/Hover",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.bluetooth.listitems.passive,
          title: "Passive",
          type: "color"
        }),
        Header2("Icons"),
        Option({ opt: options_default.theme.bar.menus.menu.bluetooth.icons.active, title: "Active", type: "color" }),
        Option({ opt: options_default.theme.bar.menus.menu.bluetooth.icons.passive, title: "Passive", type: "color" }),
        Header2("Icon Buttons"),
        Option({
          opt: options_default.theme.bar.menus.menu.bluetooth.iconbutton.active,
          title: "Active",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.bluetooth.iconbutton.passive,
          title: "Passive",
          type: "color"
        }),
        Header2("Switch"),
        Option({ opt: options_default.theme.bar.menus.menu.bluetooth.switch.enabled, title: "Enabled", type: "color" }),
        Option({
          opt: options_default.theme.bar.menus.menu.bluetooth.switch.disabled,
          title: "Disabled",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.menus.menu.bluetooth.switch.puck, title: "Puck", type: "color" }),
        Header2("Switch Divider"),
        Option({
          opt: options_default.theme.bar.menus.menu.bluetooth.switch_divider,
          title: "Switch Divider",
          type: "color"
        })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/pages/theme/menus/clock.ts
var ClockMenuTheme = () => {
  return Widget.Scrollable({
    vscroll: "automatic",
    hscroll: "automatic",
    class_name: "menu-theme-page clock paged-container",
    vexpand: true,
    child: Widget.Box({
      vertical: true,
      children: [
        Header2("Clock Menu Theme Settings"),
        Option({ opt: options_default.theme.bar.menus.menu.clock.text, title: "Text", type: "color" }),
        Header2("Card"),
        Option({ opt: options_default.theme.bar.menus.menu.clock.card.color, title: "Card", type: "color" }),
        Header2("Background"),
        Option({
          opt: options_default.theme.bar.menus.menu.clock.background.color,
          title: "Background",
          type: "color"
        }),
        Header2("Border"),
        Option({ opt: options_default.theme.bar.menus.menu.clock.border.color, title: "Border", type: "color" }),
        Header2("Time"),
        Option({ opt: options_default.theme.bar.menus.menu.clock.time.time, title: "Time", type: "color" }),
        Option({
          opt: options_default.theme.bar.menus.menu.clock.time.timeperiod,
          title: "Period",
          subtitle: "AM/PM",
          type: "color"
        }),
        Header2("Calendar"),
        Option({
          opt: options_default.theme.bar.menus.menu.clock.calendar.yearmonth,
          title: "Year/Month",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.menus.menu.clock.calendar.weekdays, title: "Weekdays", type: "color" }),
        Option({
          opt: options_default.theme.bar.menus.menu.clock.calendar.paginator,
          title: "Navigation Arrows (Hover)",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.clock.calendar.currentday,
          title: "Current Day",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.menus.menu.clock.calendar.days, title: "Days", type: "color" }),
        Option({
          opt: options_default.theme.bar.menus.menu.clock.calendar.contextdays,
          title: "Trailing/Leading Days",
          type: "color"
        }),
        Header2("Weather"),
        Option({
          opt: options_default.theme.bar.menus.menu.clock.weather.icon,
          title: "Current Weather Icon",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.clock.weather.temperature,
          title: "Current Temperature",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.clock.weather.status,
          title: "Current Status",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.clock.weather.stats,
          title: "Current Stats",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.clock.weather.thermometer.extremelyhot,
          title: "Thermometer - Extremely Hot",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.clock.weather.thermometer.hot,
          title: "Thermometer - Hot",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.clock.weather.thermometer.moderate,
          title: "Thermometer - Moderate",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.clock.weather.thermometer.cold,
          title: "Thermometer - Cold",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.clock.weather.thermometer.extremelycold,
          title: "Thermometer - Extremely Cold",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.clock.weather.hourly.time,
          title: "Hourly Weather Time",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.clock.weather.hourly.icon,
          title: "Hourly Weather Icon",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.clock.weather.hourly.temperature,
          title: "Hourly Weather Temperature",
          type: "color"
        })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/pages/theme/menus/dashboard.ts
var DashboardMenuTheme = () => {
  return Widget.Scrollable({
    vscroll: "always",
    hscroll: "automatic",
    class_name: "menu-theme-page dashboard paged-container",
    vexpand: true,
    child: Widget.Box({
      vertical: true,
      children: [
        Header2("Card"),
        Option({ opt: options_default.theme.bar.menus.menu.dashboard.card.color, title: "Card", type: "color" }),
        Header2("Background"),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.background.color,
          title: "Background",
          type: "color"
        }),
        Header2("Border"),
        Option({ opt: options_default.theme.bar.menus.menu.dashboard.border.color, title: "Border", type: "color" }),
        Header2("Profile"),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.profile.name,
          title: "Profile Name",
          type: "color"
        }),
        Header2("Power Menu"),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.powermenu.shutdown,
          title: "Shutdown",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.powermenu.restart,
          title: "Restart",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.powermenu.logout,
          title: "Log Out",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.menus.menu.dashboard.powermenu.sleep, title: "Sleep", type: "color" }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.powermenu.confirmation.card,
          title: "Confirmation Dialog Card",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.powermenu.confirmation.background,
          title: "Confirmation Dialog Background",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.powermenu.confirmation.border,
          title: "Confirmation Dialog Border",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.powermenu.confirmation.label,
          title: "Confirmation Dialog Label",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.powermenu.confirmation.body,
          title: "Confirmation Dialog Description",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.powermenu.confirmation.confirm,
          title: "Confirmation Dialog Confirm Button",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.powermenu.confirmation.deny,
          title: "Confirmation Dialog Cancel Button",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.powermenu.confirmation.button_text,
          title: "Confirmation Dialog Button Text",
          type: "color"
        }),
        Header2("Shortcuts"),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.shortcuts.background,
          title: "Primary",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.menus.menu.dashboard.shortcuts.text, title: "Text", type: "color" }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.shortcuts.recording,
          title: "Recording",
          subtitle: "Color of the Record button when recording is in progress",
          type: "color"
        }),
        Header2("Controls"),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.controls.disabled,
          title: "Module Off",
          subtitle: "Button color when element is disabled",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.controls.wifi.background,
          title: "Wifi Button",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.controls.wifi.text,
          title: "Wifi Button Text",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.controls.bluetooth.background,
          title: "Bluetooth Button",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.controls.bluetooth.text,
          title: "Bluetooth Button Text",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.controls.notifications.background,
          title: "Notifications Button",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.controls.notifications.text,
          title: "Notifications Button Text",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.controls.volume.background,
          title: "Volume Button",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.controls.volume.text,
          title: "Volume Button Text",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.controls.input.background,
          title: "Input Button",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.controls.input.text,
          title: "Input Button Text",
          type: "color"
        }),
        Header2("Directories"),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.directories.left.top.color,
          title: "Directory: Left - Top",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.directories.left.middle.color,
          title: "Directory: Left - Middle",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.directories.left.bottom.color,
          title: "Directory: Left - Bottom",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.directories.right.top.color,
          title: "Directory: Right - Top",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.directories.right.middle.color,
          title: "Directory: Right - Middle",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.directories.right.bottom.color,
          title: "Directory: Right - Bottom",
          type: "color"
        }),
        Header2("System Stats"),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.monitors.bar_background,
          title: "Bar Background",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.monitors.cpu.icon,
          title: "CPU Icon",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.monitors.cpu.bar,
          title: "CPU Bar",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.monitors.cpu.label,
          title: "CPU Label",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.monitors.ram.icon,
          title: "RAM Icon",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.monitors.ram.bar,
          title: "RAM Bar",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.monitors.ram.label,
          title: "RAM Label",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.monitors.gpu.icon,
          title: "GPU Icon",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.monitors.gpu.bar,
          title: "GPU Bar",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.monitors.gpu.label,
          title: "GPU Label",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.monitors.disk.icon,
          title: "Disk Icon",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.monitors.disk.bar,
          title: "Disk Bar",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.monitors.disk.label,
          title: "Disk Label",
          type: "color"
        })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/pages/theme/menus/index.ts
var MenuTheme = () => {
  return Widget.Scrollable({
    vscroll: "automatic",
    hscroll: "automatic",
    class_name: "menu-theme-page paged-container",
    vexpand: true,
    child: Widget.Box({
      vertical: true,
      children: [
        Header2("General"),
        Option({
          opt: options_default.dummy,
          title: "Theme",
          subtitle: "WARNING: Importing a theme will replace your current theme color settings.",
          type: "config_import",
          exportData: {
            filePath: OPTIONS,
            themeOnly: true
          }
        }),
        Option({
          opt: options_default.theme.bar.menus.monochrome,
          title: "Use Global Colors",
          type: "boolean",
          disabledBinding: options_default.theme.matugen
        }),
        Option({
          opt: options_default.wallpaper.pywal,
          title: "Generate Pywal Colors",
          subtitle: "Whether to also generate pywal colors with chosen wallpaper",
          type: "boolean"
        }),
        Option({
          opt: options_default.wallpaper.enable,
          title: "Apply Wallpapers",
          subtitle: "Whether to apply the wallpaper or to only use it for Matugen color generation.",
          type: "boolean"
        }),
        Option({
          opt: options_default.wallpaper.image,
          title: "Wallpaper",
          subtitle: options_default.wallpaper.image.bind("value"),
          type: "wallpaper"
        }),
        Option({ opt: options_default.theme.bar.menus.background, title: "Background Color", type: "color" }),
        Option({
          opt: options_default.theme.bar.menus.opacity,
          title: "Menu Opacity",
          type: "number",
          increment: 5,
          min: 0,
          max: 100
        }),
        Option({ opt: options_default.theme.bar.menus.cards, title: "Cards", type: "color" }),
        Option({ opt: options_default.theme.bar.menus.card_radius, title: "Card Radius", type: "string" }),
        Option({ opt: options_default.theme.bar.menus.text, title: "Primary Text", type: "color" }),
        Option({ opt: options_default.theme.bar.menus.dimtext, title: "Dim Text", type: "color" }),
        Option({ opt: options_default.theme.bar.menus.feinttext, title: "Feint Text", type: "color" }),
        Option({ opt: options_default.theme.bar.menus.label, title: "Label Color", type: "color" }),
        Header2("Border"),
        Option({ opt: options_default.theme.bar.menus.border.size, title: "Border Width", type: "string" }),
        Option({ opt: options_default.theme.bar.menus.border.radius, title: "Border Radius", type: "string" }),
        Option({ opt: options_default.theme.bar.menus.border.color, title: "Border Color", type: "color" }),
        Header2("Popover"),
        Option({ opt: options_default.theme.bar.menus.popover.text, title: "Text", type: "color" }),
        Option({ opt: options_default.theme.bar.menus.popover.background, title: "Background", type: "color" }),
        Header2("List Items"),
        Option({
          opt: options_default.theme.bar.menus.listitems.active,
          title: "Active",
          subtitle: "Items of a list (network name, bluetooth device name, playback device, etc.) when active or hovered.",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.menus.listitems.passive, title: "Passive", type: "color" }),
        Header2("Icons"),
        Option({ opt: options_default.theme.bar.menus.icons.active, title: "Active", type: "color" }),
        Option({ opt: options_default.theme.bar.menus.icons.passive, title: "Passive", type: "color" }),
        Header2("Switch"),
        Option({ opt: options_default.theme.bar.menus.switch.enabled, title: "Enabled", type: "color" }),
        Option({ opt: options_default.theme.bar.menus.switch.disabled, title: "Disabled", type: "color" }),
        Option({ opt: options_default.theme.bar.menus.switch.puck, title: "Puck", type: "color" }),
        Header2("Check/Radio Buttons"),
        Option({
          opt: options_default.theme.bar.menus.check_radio_button.background,
          title: "Background",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.menus.check_radio_button.active, title: "Active", type: "color" }),
        Header2("Buttons"),
        Option({ opt: options_default.theme.bar.menus.buttons.default, title: "Primary", type: "color" }),
        Option({ opt: options_default.theme.bar.menus.buttons.active, title: "Active", type: "color" }),
        Option({ opt: options_default.theme.bar.menus.buttons.disabled, title: "Disabled", type: "color" }),
        Option({ opt: options_default.theme.bar.menus.buttons.text, title: "Text", type: "color" }),
        Header2("Icon Buttons"),
        Option({ opt: options_default.theme.bar.menus.iconbuttons.passive, title: "Primary", type: "color" }),
        Option({ opt: options_default.theme.bar.menus.iconbuttons.active, title: "Active/Hovered", type: "color" }),
        Header2("Progress Bar"),
        Option({ opt: options_default.theme.bar.menus.progressbar.foreground, title: "Primary", type: "color" }),
        Option({ opt: options_default.theme.bar.menus.progressbar.background, title: "Background", type: "color" }),
        Header2("Slider"),
        Option({ opt: options_default.theme.bar.menus.slider.primary, title: "Primary", type: "color" }),
        Option({ opt: options_default.theme.bar.menus.slider.background, title: "Background", type: "color" }),
        Option({
          opt: options_default.theme.bar.menus.slider.backgroundhover,
          title: "Background (Hover)",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.menus.slider.puck, title: "Puck", type: "color" }),
        Header2("Dropdown Menu"),
        Option({ opt: options_default.theme.bar.menus.dropdownmenu.background, title: "Background", type: "color" }),
        Option({ opt: options_default.theme.bar.menus.dropdownmenu.text, title: "Text", type: "color" }),
        Option({ opt: options_default.theme.bar.menus.dropdownmenu.divider, title: "Divider", type: "color" }),
        Header2("Tooltips"),
        Option({ opt: options_default.theme.bar.menus.tooltip.background, title: "Background", type: "color" }),
        Option({ opt: options_default.theme.bar.menus.tooltip.text, title: "Text", type: "color" })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/pages/theme/menus/media.ts
var MediaMenuTheme = () => {
  return Widget.Scrollable({
    vscroll: "automatic",
    hscroll: "automatic",
    class_name: "menu-theme-page media paged-container",
    vexpand: true,
    child: Widget.Box({
      vertical: true,
      children: [
        Header2("Media Menu Theme Settings"),
        Option({ opt: options_default.theme.bar.menus.menu.media.song, title: "Song", type: "color" }),
        Option({ opt: options_default.theme.bar.menus.menu.media.artist, title: "Artist", type: "color" }),
        Option({ opt: options_default.theme.bar.menus.menu.media.album, title: "Album", type: "color" }),
        Header2("Background"),
        Option({
          opt: options_default.theme.bar.menus.menu.media.background.color,
          title: "Background",
          type: "color"
        }),
        Header2("Border"),
        Option({ opt: options_default.theme.bar.menus.menu.media.border.color, title: "Border", type: "color" }),
        Header2("Card/Album Art"),
        Option({ opt: options_default.theme.bar.menus.menu.media.card.color, title: "Color", type: "color" }),
        Option({
          opt: options_default.theme.bar.menus.menu.media.card.tint,
          title: "Tint",
          type: "number",
          increment: 5,
          min: 0,
          max: 100
        }),
        Header2("Buttons"),
        Option({
          opt: options_default.theme.bar.menus.menu.media.buttons.inactive,
          title: "Unavailable",
          subtitle: "Disabled button when media control isn't available.",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.media.buttons.enabled,
          title: "Enabled",
          subtitle: "Ex: Button color when shuffle/loop is enabled.",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.media.buttons.background,
          title: "Background",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.menus.menu.media.buttons.text, title: "Text", type: "color" }),
        Header2("Slider"),
        Option({
          opt: options_default.theme.bar.menus.menu.media.slider.primary,
          title: "Primary Color",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.media.slider.background,
          title: "Background",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.media.slider.backgroundhover,
          title: "Backround (Hover)",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.menus.menu.media.slider.puck, title: "Puck", type: "color" })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/pages/theme/menus/network.ts
var NetworkMenuTheme = () => {
  return Widget.Scrollable({
    vscroll: "automatic",
    hscroll: "automatic",
    class_name: "menu-theme-page network paged-container",
    vexpand: true,
    child: Widget.Box({
      vertical: true,
      children: [
        Header2("Network Menu Theme Settings"),
        Option({ opt: options_default.theme.bar.menus.menu.network.text, title: "Text", type: "color" }),
        Header2("Card"),
        Option({ opt: options_default.theme.bar.menus.menu.network.card.color, title: "Card", type: "color" }),
        Header2("Background"),
        Option({
          opt: options_default.theme.bar.menus.menu.network.background.color,
          title: "Background",
          type: "color"
        }),
        Header2("Border"),
        Option({ opt: options_default.theme.bar.menus.menu.network.border.color, title: "Border", type: "color" }),
        Header2("Label"),
        Option({ opt: options_default.theme.bar.menus.menu.network.label.color, title: "Label", type: "color" }),
        Header2("Status"),
        Option({
          opt: options_default.theme.bar.menus.menu.network.status.color,
          title: "Connection Status",
          type: "color"
        }),
        Header2("List Items"),
        Option({
          opt: options_default.theme.bar.menus.menu.network.listitems.active,
          title: "Active/Hover",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.network.listitems.passive,
          title: "Passive",
          type: "color"
        }),
        Header2("Icons"),
        Option({ opt: options_default.theme.bar.menus.menu.network.icons.active, title: "Active", type: "color" }),
        Option({ opt: options_default.theme.bar.menus.menu.network.icons.passive, title: "Passive", type: "color" }),
        Header2("Icon Buttons"),
        Option({
          opt: options_default.theme.bar.menus.menu.network.iconbuttons.active,
          title: "Active",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.network.iconbuttons.passive,
          title: "Passive",
          type: "color"
        })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/pages/theme/menus/notifications.ts
var NotificationsMenuTheme = () => {
  return Widget.Scrollable({
    vscroll: "automatic",
    hscroll: "automatic",
    class_name: "menu-theme-page notifications paged-container",
    vexpand: true,
    child: Widget.Box({
      vertical: true,
      children: [
        Header2("Notifications Menu Theme Settings"),
        Option({ opt: options_default.theme.bar.menus.menu.notifications.label, title: "Menu Label", type: "color" }),
        Option({ opt: options_default.theme.bar.menus.menu.notifications.card, title: "Card", type: "color" }),
        Option({
          opt: options_default.theme.bar.menus.menu.notifications.background,
          title: "Background",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.notifications.no_notifications_label,
          title: "Empty Notifications Backdrop",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.menus.menu.notifications.border, title: "Border", type: "color" }),
        Option({
          opt: options_default.theme.bar.menus.menu.notifications.switch_divider,
          title: "Switch Divider",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.notifications.clear,
          title: "Clear Notifications Button",
          type: "color"
        }),
        Header2("Switch"),
        Option({
          opt: options_default.theme.bar.menus.menu.notifications.switch.enabled,
          title: "Enabled",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.notifications.switch.disabled,
          title: "Disabled",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.menus.menu.notifications.switch.puck, title: "Puck", type: "color" }),
        Header2("Scrollbar"),
        Option({
          opt: options_default.theme.bar.menus.menu.notifications.scrollbar.color,
          title: "Scrollbar Color",
          type: "color"
        }),
        Header2("Pagination"),
        Option({
          opt: options_default.theme.bar.menus.menu.notifications.pager.background,
          title: "Pager Footer Background",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.notifications.pager.button,
          title: "Pager Button Color",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.notifications.pager.label,
          title: "Pager Label Color",
          type: "color"
        })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/pages/theme/menus/systray.ts
var SystrayMenuTheme = () => {
  return Widget.Scrollable({
    vscroll: "automatic",
    hscroll: "automatic",
    class_name: "menu-theme-page systray paged-container",
    vexpand: true,
    child: Widget.Box({
      vertical: true,
      children: [
        Header2("Dropdown Menu"),
        Option({
          opt: options_default.theme.bar.menus.menu.systray.dropdownmenu.background,
          title: "Background",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.menus.menu.systray.dropdownmenu.text, title: "Text", type: "color" }),
        Option({
          opt: options_default.theme.bar.menus.menu.systray.dropdownmenu.divider,
          title: "Section Divider",
          type: "color"
        })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/pages/theme/menus/volume.ts
var VolumeMenuTheme = () => {
  return Widget.Scrollable({
    vscroll: "automatic",
    hscroll: "automatic",
    class_name: "menu-theme-page volume paged-container",
    vexpand: true,
    child: Widget.Box({
      vertical: true,
      children: [
        Header2("Volume Menu Theme Settings"),
        Option({ opt: options_default.theme.bar.menus.menu.volume.text, title: "Text", type: "color" }),
        Header2("Card"),
        Option({ opt: options_default.theme.bar.menus.menu.volume.card.color, title: "Card", type: "color" }),
        Header2("Background"),
        Option({
          opt: options_default.theme.bar.menus.menu.volume.background.color,
          title: "Background",
          type: "color"
        }),
        Header2("Border"),
        Option({ opt: options_default.theme.bar.menus.menu.volume.border.color, title: "Border", type: "color" }),
        Header2("Label"),
        Option({ opt: options_default.theme.bar.menus.menu.volume.label.color, title: "Label", type: "color" }),
        Header2("List Items"),
        Option({
          opt: options_default.theme.bar.menus.menu.volume.listitems.active,
          title: "Active/Hover",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.menus.menu.volume.listitems.passive, title: "Passive", type: "color" }),
        Header2("Icon Button"),
        Option({
          opt: options_default.theme.bar.menus.menu.volume.iconbutton.active,
          title: "Active/Hover",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.volume.iconbutton.passive,
          title: "Passive",
          type: "color"
        }),
        Header2("Icons"),
        Option({ opt: options_default.theme.bar.menus.menu.volume.icons.active, title: "Active", type: "color" }),
        Option({ opt: options_default.theme.bar.menus.menu.volume.icons.passive, title: "Passive", type: "color" }),
        Header2("Audio Slider"),
        Option({
          opt: options_default.theme.bar.menus.menu.volume.audio_slider.primary,
          title: "Primary",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.volume.audio_slider.background,
          title: "Background",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.volume.audio_slider.backgroundhover,
          title: "Background (Hover)",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.menus.menu.volume.audio_slider.puck, title: "Puck", type: "color" }),
        Header2("Input Slider"),
        Option({
          opt: options_default.theme.bar.menus.menu.volume.input_slider.primary,
          title: "Primary",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.volume.input_slider.background,
          title: "Background",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.volume.input_slider.backgroundhover,
          title: "Background (Hover)",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.menus.menu.volume.input_slider.puck, title: "Puck", type: "color" })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/pages/theme/osd/index.ts
var OsdTheme = () => {
  return Widget.Scrollable({
    vscroll: "automatic",
    hscroll: "automatic",
    class_name: "osd-theme-page paged-container",
    vexpand: true,
    child: Widget.Box({
      vertical: true,
      children: [
        Header2("On Screen Display Settings"),
        Option({
          opt: options_default.theme.osd.opacity,
          title: "OSD Opacity",
          type: "number",
          increment: 5,
          min: 0,
          max: 100
        }),
        Option({ opt: options_default.theme.osd.bar_color, title: "Bar", type: "color" }),
        Option({
          opt: options_default.theme.osd.bar_overflow_color,
          title: "Bar Overflow",
          subtitle: "Overflow color is for when the volume goes over a 100",
          type: "color"
        }),
        Option({ opt: options_default.theme.osd.bar_empty_color, title: "Bar Background", type: "color" }),
        Option({ opt: options_default.theme.osd.bar_container, title: "Bar Container", type: "color" }),
        Option({ opt: options_default.theme.osd.icon, title: "Icon", type: "color" }),
        Option({ opt: options_default.theme.osd.icon_container, title: "Icon Container", type: "color" }),
        Option({ opt: options_default.theme.osd.label, title: "Value Text", type: "color" })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/pages/theme/menus/matugen.ts
var Matugen = () => {
  return Widget.Scrollable({
    vscroll: "automatic",
    hscroll: "automatic",
    class_name: "menu-theme-page paged-container",
    vexpand: true,
    child: Widget.Box({
      vertical: true,
      children: [
        Header2("Matugen Settings"),
        Option({
          opt: options_default.theme.matugen,
          title: "Enable Matugen",
          subtitle: "WARNING: THIS WILL REPLACE YOUR CURRENT COLOR SCHEME!!!",
          type: "boolean",
          dependencies: ["matugen", "swww"]
        }),
        Option({
          opt: options_default.theme.matugen_settings.mode,
          title: "Matugen Theme",
          type: "enum",
          enums: ["light", "dark"]
        }),
        Option({
          opt: options_default.theme.matugen_settings.scheme_type,
          title: "Matugen Scheme",
          type: "enum",
          enums: [
            "content",
            "expressive",
            "fidelity",
            "fruit-salad",
            "monochrome",
            "neutral",
            "rainbow",
            "tonal-spot"
          ]
        }),
        Option({
          opt: options_default.theme.matugen_settings.variation,
          title: "Matugen Variation",
          type: "enum",
          enums: [
            "standard_1",
            "standard_2",
            "standard_3",
            "monochrome_1",
            "monochrome_2",
            "monochrome_3",
            "vivid_1",
            "vivid_2",
            "vivid_3"
          ]
        }),
        Option({
          opt: options_default.theme.matugen_settings.contrast,
          title: "Contrast",
          subtitle: "Range: -1 to 1 (Default: 0)",
          type: "float"
        })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/customModules/theme.ts
var CustomModuleTheme = () => {
  return Widget.Scrollable({
    vscroll: "automatic",
    hscroll: "automatic",
    class_name: "menu-theme-page customModules paged-container",
    child: Widget.Box({
      class_name: "bar-theme-page paged-container",
      vertical: true,
      children: [
        Header2("RAM"),
        Option({ opt: options_default.theme.bar.buttons.modules.ram.text, title: "Text", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.modules.ram.icon, title: "Icon", type: "color" }),
        Option({
          opt: options_default.theme.bar.buttons.modules.ram.background,
          title: "Label Background",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.buttons.modules.ram.icon_background,
          title: "Icon Background",
          subtitle: "Applies a background color to the icon section of the button.\nRequires 'split' button styling.",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.buttons.modules.ram.border, title: "Border", type: "color" }),
        Header2("CPU"),
        Option({ opt: options_default.theme.bar.buttons.modules.cpu.text, title: "Text", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.modules.cpu.icon, title: "Icon", type: "color" }),
        Option({
          opt: options_default.theme.bar.buttons.modules.cpu.background,
          title: "Label Background",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.buttons.modules.cpu.icon_background,
          title: "Icon Background",
          subtitle: "Applies a background color to the icon section of the button.\nRequires 'split' button styling.",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.buttons.modules.cpu.border, title: "Border", type: "color" }),
        Header2("Storage"),
        Option({ opt: options_default.theme.bar.buttons.modules.storage.text, title: "Text", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.modules.storage.icon, title: "Icon", type: "color" }),
        Option({
          opt: options_default.theme.bar.buttons.modules.storage.background,
          title: "Label Background",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.buttons.modules.storage.icon_background,
          title: "Icon Background",
          subtitle: "Applies a background color to the icon section of the button.\nRequires 'split' button styling.",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.buttons.modules.storage.border, title: "Border", type: "color" }),
        Header2("Netstat"),
        Option({ opt: options_default.theme.bar.buttons.modules.netstat.text, title: "Text", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.modules.netstat.icon, title: "Icon", type: "color" }),
        Option({
          opt: options_default.theme.bar.buttons.modules.netstat.background,
          title: "Label Background",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.buttons.modules.netstat.icon_background,
          title: "Icon Background",
          subtitle: "Applies a background color to the icon section of the button.\nRequires 'split' button styling.",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.buttons.modules.netstat.border, title: "Border", type: "color" }),
        Header2("Keyboard Layout"),
        Option({ opt: options_default.theme.bar.buttons.modules.kbLayout.text, title: "Text", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.modules.kbLayout.icon, title: "Icon", type: "color" }),
        Option({
          opt: options_default.theme.bar.buttons.modules.kbLayout.background,
          title: "Label Background",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.buttons.modules.kbLayout.icon_background,
          title: "Icon Background",
          subtitle: "Applies a background color to the icon section of the button.\nRequires 'split' button styling.",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.buttons.modules.kbLayout.border, title: "Border", type: "color" }),
        Header2("Updates"),
        Option({ opt: options_default.theme.bar.buttons.modules.updates.text, title: "Text", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.modules.updates.icon, title: "Icon", type: "color" }),
        Option({
          opt: options_default.theme.bar.buttons.modules.updates.background,
          title: "Label Background",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.buttons.modules.updates.icon_background,
          title: "Icon Background",
          subtitle: "Applies a background color to the icon section of the button.\nRequires 'split' button styling.",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.buttons.modules.updates.border, title: "Border", type: "color" }),
        Header2("Submap"),
        Option({ opt: options_default.theme.bar.buttons.modules.submap.text, title: "Text", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.modules.submap.icon, title: "Icon", type: "color" }),
        Option({
          opt: options_default.theme.bar.buttons.modules.submap.background,
          title: "Label Background",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.buttons.modules.submap.icon_background,
          title: "Icon Background",
          subtitle: "Applies a background color to the icon section of the button.\nRequires 'split' button styling.",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.buttons.modules.submap.border, title: "Border", type: "color" }),
        Header2("Weather"),
        Option({ opt: options_default.theme.bar.buttons.modules.weather.icon, title: "Icon", type: "color" }),
        Option({ opt: options_default.theme.bar.buttons.modules.weather.text, title: "Text", type: "color" }),
        Option({
          opt: options_default.theme.bar.buttons.modules.weather.background,
          title: "Label Background",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.buttons.modules.weather.icon_background,
          title: "Icon Background",
          subtitle: "Applies a background color to the icon section of the button.\nRequires 'split' button styling.",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.buttons.modules.weather.border, title: "Border", type: "color" }),
        Header2("Power"),
        Option({ opt: options_default.theme.bar.buttons.modules.power.icon, title: "Icon", type: "color" }),
        Option({
          opt: options_default.theme.bar.buttons.modules.power.background,
          title: "Label Background",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.buttons.modules.power.icon_background,
          title: "Icon Background",
          subtitle: "Applies a background color to the icon section of the button.\nRequires 'split' button styling.",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.buttons.modules.power.border, title: "Border", type: "color" })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/pages/theme/menus/power.ts
var PowerMenuTheme = () => {
  return Widget.Scrollable({
    vscroll: "automatic",
    hscroll: "automatic",
    class_name: "menu-theme-page power paged-container",
    vexpand: true,
    child: Widget.Box({
      vertical: true,
      children: [
        Header2("Background"),
        Option({
          opt: options_default.theme.bar.menus.menu.power.background.color,
          title: "Background",
          type: "color"
        }),
        Header2("Border"),
        Option({ opt: options_default.theme.bar.menus.menu.power.border.color, title: "Border", type: "color" }),
        Header2("Shutdown Button"),
        Option({
          opt: options_default.theme.bar.menus.menu.power.buttons.shutdown.background,
          title: "Label Background",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.power.buttons.shutdown.icon_background,
          title: "Icon Background",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.power.buttons.shutdown.text,
          title: "Label Text",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.menus.menu.power.buttons.shutdown.icon, title: "Icon", type: "color" }),
        Header2("Reboot Button"),
        Option({
          opt: options_default.theme.bar.menus.menu.power.buttons.restart.background,
          title: "Label Background",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.power.buttons.restart.icon_background,
          title: "Icon Background",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.power.buttons.restart.text,
          title: "Label Text",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.menus.menu.power.buttons.restart.icon, title: "Icon", type: "color" }),
        Header2("Logout Button"),
        Option({
          opt: options_default.theme.bar.menus.menu.power.buttons.logout.background,
          title: "Label Background",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.power.buttons.logout.icon_background,
          title: "Icon Background",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.power.buttons.logout.text,
          title: "Label Text",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.menus.menu.power.buttons.logout.icon, title: "Icon", type: "color" }),
        Header2("Sleep Button"),
        Option({
          opt: options_default.theme.bar.menus.menu.power.buttons.sleep.background,
          title: "Label Background",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.power.buttons.sleep.icon_background,
          title: "Icon Background",
          type: "color"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.power.buttons.sleep.text,
          title: "Label Text",
          type: "color"
        }),
        Option({ opt: options_default.theme.bar.menus.menu.power.buttons.sleep.icon, title: "Icon", type: "color" })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/pages/theme/index.ts
var CurrentPage = Variable("General Settings");
var pagerMap = [
  "General Settings",
  "Matugen Settings",
  "Bar",
  "Notifications",
  "OSD",
  "Battery Menu",
  "Bluetooth Menu",
  "Clock Menu",
  "Dashboard Menu",
  "Media Menu",
  "Network Menu",
  "Notifications Menu",
  "System Tray",
  "Volume Menu",
  "Power Menu",
  "Custom Modules"
];
var ThemesMenu = () => {
  return Widget.Box({
    vertical: true,
    children: CurrentPage.bind("value").as((v) => {
      return [
        Widget.Box({
          class_name: "option-pages-container",
          hpack: "center",
          hexpand: true,
          vertical: true,
          children: [0, 1, 2].map((section) => {
            return Widget.Box({
              children: pagerMap.map((page, index) => {
                if (index >= section * 6 && index < section * 6 + 6) {
                  return Widget.Button({
                    hpack: "center",
                    xalign: 0,
                    class_name: `pager-button ${v === page ? "active" : ""}`,
                    label: page,
                    on_primary_click: () => CurrentPage.value = page
                  });
                }
                return Widget.Box();
              })
            });
          })
        }),
        Widget.Stack({
          vexpand: true,
          class_name: "themes-menu-stack",
          children: {
            "General Settings": MenuTheme(),
            "Matugen Settings": Matugen(),
            Bar: BarTheme(),
            Notifications: NotificationsTheme(),
            OSD: OsdTheme(),
            "Battery Menu": BatteryMenuTheme(),
            "Bluetooth Menu": BluetoothMenuTheme(),
            "Clock Menu": ClockMenuTheme(),
            "Dashboard Menu": DashboardMenuTheme(),
            "Media Menu": MediaMenuTheme(),
            "Network Menu": NetworkMenuTheme(),
            "Notifications Menu": NotificationsMenuTheme(),
            "System Tray": SystrayMenuTheme(),
            "Volume Menu": VolumeMenuTheme(),
            "Power Menu": PowerMenuTheme(),
            "Custom Modules": CustomModuleTheme()
          },
          shown: CurrentPage.bind("value")
        })
      ];
    })
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/pages/config/general/index.ts
var BarGeneral = () => {
  return Widget.Scrollable({
    class_name: "bar-theme-page paged-container",
    vscroll: "automatic",
    child: Widget.Box({
      vertical: true,
      children: [
        Header2("General Settings"),
        Option({ opt: options_default.theme.font.name, title: "Font", type: "font" }),
        Option({ opt: options_default.theme.font.size, title: "Font Size", type: "string" }),
        Option({
          opt: options_default.theme.font.weight,
          title: "Font Weight",
          subtitle: "100, 200, 300, etc.",
          type: "number",
          increment: 100,
          min: 100,
          max: 900
        }),
        Option({
          opt: options_default.dummy,
          title: "Config",
          subtitle: "WARNING: Importing a configuration will replace your current configuration settings.",
          type: "config_import",
          exportData: {
            filePath: OPTIONS,
            themeOnly: false
          }
        }),
        Option({
          opt: options_default.terminal,
          title: "Terminal",
          subtitle: "Tools such as 'btop' will open in this terminal",
          type: "string"
        }),
        Option({
          opt: options_default.tear,
          title: "Tearing Compatible",
          subtitle: "Makes HyprPanel compatible with Hyprland tearing.\n" + "Enabling this will change all overlays (Notifications, OSDs, Bar) to the 'top' layer instead the 'overlay' layer.",
          type: "boolean"
        }),
        Header2("Scaling"),
        Option({
          opt: options_default.scalingPriority,
          title: "Scaling Priority",
          type: "enum",
          enums: ["both", "gdk", "hyprland"]
        }),
        Option({
          opt: options_default.theme.bar.scaling,
          title: "Bar",
          type: "number",
          min: 1,
          max: 100,
          increment: 5
        }),
        Option({
          opt: options_default.theme.notification.scaling,
          title: "Notifications",
          type: "number",
          min: 1,
          max: 100,
          increment: 5
        }),
        Option({
          opt: options_default.theme.osd.scaling,
          title: "OSD",
          type: "number",
          min: 1,
          max: 100,
          increment: 5
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.scaling,
          title: "Dashboard Menu",
          type: "number",
          min: 1,
          max: 100,
          increment: 5
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.confirmation_scaling,
          title: "Confirmation Dialog",
          type: "number",
          min: 1,
          max: 100,
          increment: 5
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.media.scaling,
          title: "Media Menu",
          type: "number",
          min: 1,
          max: 100,
          increment: 5
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.volume.scaling,
          title: "Volume Menu",
          type: "number",
          min: 1,
          max: 100,
          increment: 5
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.network.scaling,
          title: "Network Menu",
          type: "number",
          min: 1,
          max: 100,
          increment: 5
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.bluetooth.scaling,
          title: "Bluetooth Menu",
          type: "number",
          min: 1,
          max: 100,
          increment: 5
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.battery.scaling,
          title: "Battery Menu",
          type: "number",
          min: 1,
          max: 100,
          increment: 5
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.clock.scaling,
          title: "Clock Menu",
          type: "number",
          min: 1,
          max: 100,
          increment: 5
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.notifications.scaling,
          title: "Notifications Menu",
          type: "number",
          min: 1,
          max: 100,
          increment: 5
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.power.scaling,
          title: "Power Menu",
          type: "number",
          min: 1,
          max: 100,
          increment: 5
        })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/pages/config/bar/index.ts
var BarSettings = () => {
  return Widget.Scrollable({
    vscroll: "always",
    hscroll: "automatic",
    class_name: "menu-theme-page paged-container",
    child: Widget.Box({
      vertical: true,
      children: [
        Header2("Layouts"),
        Option({
          opt: options_default.bar.layouts,
          title: "Bar Layouts for Monitors",
          subtitle: "Wiki Link: https://hyprpanel.com/configuration/panel.html#layouts",
          type: "object",
          subtitleLink: "https://hyprpanel.com/configuration/panel.html#layouts"
        }, "bar-layout-input"),
        Option({
          opt: options_default.theme.bar.floating,
          title: "Floating Bar",
          type: "boolean"
        }),
        Option({
          opt: options_default.theme.bar.location,
          title: "Location",
          type: "enum",
          enums: ["top", "bottom"]
        }),
        Option({
          opt: options_default.theme.bar.buttons.enableBorders,
          title: "Enable Button Borders",
          subtitle: "Enables button borders for all buttons in the bar.",
          type: "boolean"
        }),
        Option({
          opt: options_default.theme.bar.buttons.borderSize,
          title: "Button Border Size",
          subtitle: "Button border for the individual modules must be enabled first",
          type: "string"
        }),
        Header2("Spacing"),
        Option({
          opt: options_default.theme.bar.outer_spacing,
          title: "Outer Spacing",
          subtitle: "Spacing on the outer left and right edges of the bar.",
          type: "string"
        }),
        Option({
          opt: options_default.theme.bar.buttons.y_margins,
          title: "Vertical Margins",
          subtitle: "Spacing above/below the buttons in the bar.",
          type: "string"
        }),
        Option({
          opt: options_default.theme.bar.buttons.spacing,
          title: "Button Spacing",
          subtitle: "Spacing between the buttons in the bar.",
          type: "string"
        }),
        Option({
          opt: options_default.theme.bar.buttons.padding_x,
          title: "Button Horizontal Padding",
          type: "string"
        }),
        Option({
          opt: options_default.theme.bar.buttons.padding_y,
          title: "Button Vertical Padding",
          type: "string"
        }),
        Option({
          opt: options_default.theme.bar.buttons.radius,
          title: "Button Radius",
          type: "string"
        }),
        Option({
          opt: options_default.theme.bar.layer,
          title: "Layer",
          type: "enum",
          subtitle: "Layer determines the Z index of your bar.",
          enums: ["top", "bottom", "overlay", "background"]
        }),
        Option({
          opt: options_default.theme.bar.dropdownGap,
          title: "Dropdown Gap",
          subtitle: "The gap between the dropdown and the bar",
          type: "string"
        }),
        Option({
          opt: options_default.theme.bar.margin_top,
          title: "Margin Top",
          subtitle: "Only applies if floating is enabled",
          type: "string"
        }),
        Option({
          opt: options_default.theme.bar.margin_bottom,
          title: "Margin Bottom",
          subtitle: "Only applies if floating is enabled",
          type: "string"
        }),
        Option({
          opt: options_default.theme.bar.margin_sides,
          title: "Margin Sides",
          subtitle: "Only applies if floating is enabled",
          type: "string"
        }),
        Option({
          opt: options_default.theme.bar.border_radius,
          title: "Border Radius",
          subtitle: "Only applies if floating is enabled",
          type: "string"
        }),
        Header2("Actions"),
        Option({
          opt: options_default.bar.scrollSpeed,
          title: "Scrolling Speed",
          subtitle: "The speed at which the commands assigned to the scroll event will trigger",
          type: "number"
        }),
        Header2("Dashboard"),
        Option({
          opt: options_default.bar.launcher.icon,
          title: "Dashboard Menu Icon",
          type: "string"
        }),
        Option({
          opt: options_default.theme.bar.buttons.dashboard.enableBorder,
          title: "Button Border",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.launcher.rightClick,
          title: "Right Click",
          type: "string"
        }),
        Option({
          opt: options_default.bar.launcher.middleClick,
          title: "Middle Click",
          type: "string"
        }),
        Option({
          opt: options_default.bar.launcher.scrollUp,
          title: "Scroll Up",
          type: "string"
        }),
        Option({
          opt: options_default.bar.launcher.scrollDown,
          title: "Scroll Down",
          type: "string"
        }),
        Header2("Workspaces"),
        Option({
          opt: options_default.theme.bar.buttons.workspaces.enableBorder,
          title: "Button Border",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.workspaces.showAllActive,
          title: "Mark Active Workspace On All Monitors",
          subtitle: "Marks the currently active workspace on each monitor.",
          type: "boolean"
        }),
        Option({
          opt: options_default.theme.bar.buttons.workspaces.fontSize,
          title: "Indicator Size",
          subtitle: "Only applicable to numbered workspaces and mapped icons\n" + "Adjust with caution as it may cause the bar to expand",
          type: "string"
        }),
        Option({
          opt: options_default.bar.workspaces.show_icons,
          title: "Show Workspace Icons",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.workspaces.icons.available,
          title: "Workspace Available",
          type: "string"
        }),
        Option({
          opt: options_default.bar.workspaces.icons.active,
          title: "Workspace Active",
          type: "string"
        }),
        Option({
          opt: options_default.bar.workspaces.icons.occupied,
          title: "Workspace Occupied",
          type: "string"
        }),
        Option({
          opt: options_default.bar.workspaces.show_numbered,
          title: "Show Workspace Numbers",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.workspaces.numbered_active_indicator,
          title: "Numbered Workspace Identifier",
          subtitle: "Only applicable if Workspace Numbers are enabled",
          type: "enum",
          enums: ["underline", "highlight", "color"]
        }),
        Option({
          opt: options_default.theme.bar.buttons.workspaces.smartHighlight,
          title: "Smart Highlight",
          subtitle: "Automatically determines the highlight color of the workspace icon.\n" + "Only compatible with mapped icons.",
          type: "boolean"
        }),
        Option({
          opt: options_default.theme.bar.buttons.workspaces.numbered_active_highlight_border,
          title: "Highlight Radius",
          subtitle: "Only applicable if Workspace Numbers are enabled",
          type: "string"
        }),
        Option({
          opt: options_default.theme.bar.buttons.workspaces.numbered_active_highlight_padding,
          title: "Highlight Padding",
          subtitle: "Only applicable if Workspace Numbers are enabled",
          type: "string"
        }),
        Option({
          opt: options_default.bar.workspaces.showWsIcons,
          title: "Map Workspaces to Icons",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.workspaces.workspaceIconMap,
          title: "Workspace Icon Mappings",
          type: "object"
        }),
        Option({
          opt: options_default.bar.workspaces.spacing,
          title: "Spacing",
          subtitle: "Spacing between workspace icons",
          type: "float"
        }),
        Option({
          opt: options_default.bar.workspaces.workspaces,
          title: "Total Workspaces",
          subtitle: "The least amount of workspaces to always show.",
          type: "number"
        }),
        Option({
          opt: options_default.bar.workspaces.monitorSpecific,
          title: "Monitor Specific",
          subtitle: "Only workspaces applicable to the monitor will be displayed.\n" + "Works in conjuction with 'Total Workspaces'.",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.workspaces.hideUnoccupied,
          title: "Hide Unoccupied",
          subtitle: "Only show workspaces that are occupied or active",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.workspaces.workspaceMask,
          title: "Mask Workspace Numbers On Monitors",
          subtitle: "Only applicable if Workspace Numbers and Monitor Specific are enabled.\n" + "Forces each Monitor's Workspace labels to start from 1.",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.workspaces.reverse_scroll,
          title: "Invert Scroll",
          subtitle: "Scrolling up will go to the previous workspace rather than the next.",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.workspaces.scroll_speed,
          title: "Scrolling Speed",
          type: "number"
        }),
        Option({
          opt: options_default.bar.workspaces.ignored,
          title: "Ignored Workspaces",
          subtitle: "A regex that defines workspaces to ignore",
          type: "string"
        }),
        Header2("Window Titles"),
        Option({
          opt: options_default.theme.bar.buttons.windowtitle.enableBorder,
          title: "Button Border",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.windowtitle.custom_title,
          title: "Use Custom Title",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.windowtitle.title_map,
          title: "Window Title Mappings",
          subtitle: "Only applicable if Show Custom Title is enabled\nWiki Link: https://hyprpanel.com/configuration/panel.html#window-title-mappings",
          type: "object",
          subtitleLink: "https://hyprpanel.com/configuration/panel.html#window-title-mappings"
        }),
        Option({
          opt: options_default.bar.windowtitle.class_name,
          title: "Use Class Name",
          subtitle: "Only applicable if Show Custom Title is disabled\nDisplays the window's class name instead of its title.",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.windowtitle.label,
          title: "Show Window Title Label",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.windowtitle.icon,
          title: "Show Icon",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.windowtitle.truncation,
          title: "Truncate Window Title",
          subtitle: "Will truncate the window title to the specified size below.",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.windowtitle.truncation_size,
          title: "Truncation Size",
          type: "number",
          min: 10
        }),
        Option({
          opt: options_default.theme.bar.buttons.windowtitle.spacing,
          title: "Inner Spacing",
          subtitle: "Spacing between the icon and the label inside the buttons.",
          type: "string"
        }),
        Option({
          opt: options_default.bar.windowtitle.leftClick,
          title: "Left Click",
          type: "string"
        }),
        Option({
          opt: options_default.bar.windowtitle.rightClick,
          title: "Right Click",
          type: "string"
        }),
        Option({
          opt: options_default.bar.windowtitle.middleClick,
          title: "Middle Click",
          type: "string"
        }),
        Option({
          opt: options_default.bar.windowtitle.scrollUp,
          title: "Scroll Up",
          type: "string"
        }),
        Option({
          opt: options_default.bar.windowtitle.scrollDown,
          title: "Scroll Down",
          type: "string"
        }),
        Header2("Volume"),
        Option({
          opt: options_default.theme.bar.buttons.volume.enableBorder,
          title: "Button Border",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.volume.label,
          title: "Show Volume Percentage",
          type: "boolean"
        }),
        Option({
          opt: options_default.theme.bar.buttons.volume.spacing,
          title: "Inner Spacing",
          subtitle: "Spacing between the icon and the label inside the buttons.",
          type: "string"
        }),
        Option({
          opt: options_default.bar.volume.rightClick,
          title: "Right Click",
          type: "string"
        }),
        Option({
          opt: options_default.bar.volume.middleClick,
          title: "Middle Click",
          type: "string"
        }),
        Option({
          opt: options_default.bar.volume.scrollUp,
          title: "Scroll Up",
          type: "string"
        }),
        Option({
          opt: options_default.bar.volume.scrollDown,
          title: "Scroll Down",
          type: "string"
        }),
        Header2("Network"),
        Option({
          opt: options_default.theme.bar.buttons.network.enableBorder,
          title: "Button Border",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.network.label,
          title: "Show Network Name",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.network.truncation,
          title: "Truncate Network Name",
          subtitle: "Will truncate the network name to the specified size below.",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.network.truncation_size,
          title: "Truncation Size",
          type: "number"
        }),
        Option({
          opt: options_default.theme.bar.buttons.network.spacing,
          title: "Inner Spacing",
          subtitle: "Spacing between the icon and the label inside the buttons.",
          type: "string"
        }),
        Option({
          opt: options_default.bar.network.rightClick,
          title: "Right Click",
          type: "string"
        }),
        Option({
          opt: options_default.bar.network.middleClick,
          title: "Middle Click",
          type: "string"
        }),
        Option({
          opt: options_default.bar.network.scrollUp,
          title: "Scroll Up",
          type: "string"
        }),
        Option({
          opt: options_default.bar.network.scrollDown,
          title: "Scroll Down",
          type: "string"
        }),
        Header2("Bluetooth"),
        Option({
          opt: options_default.theme.bar.buttons.bluetooth.enableBorder,
          title: "Button Border",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.bluetooth.label,
          title: "Show Bluetooth Label",
          type: "boolean"
        }),
        Option({
          opt: options_default.theme.bar.buttons.bluetooth.spacing,
          title: "Inner Spacing",
          subtitle: "Spacing between the icon and the label inside the buttons.",
          type: "string"
        }),
        Option({
          opt: options_default.bar.bluetooth.rightClick,
          title: "Right Click",
          type: "string"
        }),
        Option({
          opt: options_default.bar.bluetooth.middleClick,
          title: "Middle Click",
          type: "string"
        }),
        Option({
          opt: options_default.bar.bluetooth.scrollUp,
          title: "Scroll Up",
          type: "string"
        }),
        Option({
          opt: options_default.bar.bluetooth.scrollDown,
          title: "Scroll Down",
          type: "string"
        }),
        Header2("Battery"),
        Option({
          opt: options_default.theme.bar.buttons.battery.enableBorder,
          title: "Button Border",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.battery.label,
          title: "Show Battery Percentage",
          type: "boolean"
        }),
        Option({
          opt: options_default.theme.bar.buttons.battery.spacing,
          title: "Inner Spacing",
          subtitle: "Spacing between the icon and the label inside the buttons.",
          type: "string"
        }),
        Option({
          opt: options_default.bar.battery.rightClick,
          title: "Right Click",
          type: "string"
        }),
        Option({
          opt: options_default.bar.battery.middleClick,
          title: "Middle Click",
          type: "string"
        }),
        Option({
          opt: options_default.bar.battery.scrollUp,
          title: "Scroll Up",
          type: "string"
        }),
        Option({
          opt: options_default.bar.battery.scrollDown,
          title: "Scroll Down",
          type: "string"
        }),
        Header2("System Tray"),
        Option({
          opt: options_default.theme.bar.buttons.systray.enableBorder,
          title: "Button Border",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.systray.ignore,
          title: "Ignore List",
          subtitle: "An array of applications to prevent from showing in the system tray.\n" + "Wiki: https://hyprpanel.com/configuration/panel.html#system-tray",
          subtitleLink: "https://hyprpanel.com/configuration/panel.html#system-tray",
          type: "object"
        }),
        Header2("Clock"),
        Option({
          opt: options_default.theme.bar.buttons.clock.enableBorder,
          title: "Button Border",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.clock.format,
          title: "Clock Format",
          type: "string"
        }),
        Option({
          opt: options_default.bar.clock.icon,
          title: "Icon",
          type: "string"
        }),
        Option({
          opt: options_default.bar.clock.showIcon,
          title: "Show Icon",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.clock.showTime,
          title: "Show Time",
          type: "boolean"
        }),
        Option({
          opt: options_default.theme.bar.buttons.clock.spacing,
          title: "Inner Spacing",
          subtitle: "Spacing between the icon and the label inside the buttons.",
          type: "string"
        }),
        Option({
          opt: options_default.bar.clock.rightClick,
          title: "Right Click",
          type: "string"
        }),
        Option({
          opt: options_default.bar.clock.middleClick,
          title: "Middle Click",
          type: "string"
        }),
        Option({
          opt: options_default.bar.clock.scrollUp,
          title: "Scroll Up",
          type: "string"
        }),
        Option({
          opt: options_default.bar.clock.scrollDown,
          title: "Scroll Down",
          type: "string"
        }),
        Header2("Media"),
        Option({
          opt: options_default.theme.bar.buttons.media.enableBorder,
          title: "Button Border",
          type: "boolean"
        }),
        Option({
          opt: options_default.theme.bar.buttons.media.spacing,
          title: "Inner Spacing",
          subtitle: "Spacing between the icon and the label inside the buttons.",
          type: "string"
        }),
        Option({
          opt: options_default.bar.media.show_artist,
          title: "Show Track Artist",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.media.show_label,
          title: "Toggle Media Label",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.media.truncation,
          title: "Truncate Media Label",
          subtitle: "Only applicable if Toggle Media Label is enabled",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.media.truncation_size,
          title: "Truncation Size",
          subtitle: "Only applicable if Toggle Media Label is enabled",
          type: "number",
          min: 10
        }),
        Option({
          opt: options_default.bar.media.show_active_only,
          title: "Auto Hide",
          subtitle: "Button will automatically hide if no media is detected.",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.media.rightClick,
          title: "Right Click",
          type: "string"
        }),
        Option({
          opt: options_default.bar.media.middleClick,
          title: "Middle Click",
          type: "string"
        }),
        Header2("Notifications"),
        Option({
          opt: options_default.theme.bar.buttons.notifications.enableBorder,
          title: "Button Border",
          type: "boolean"
        }),
        Option({
          opt: options_default.bar.notifications.show_total,
          title: "Show Total # of notifications",
          type: "boolean"
        }),
        Option({
          opt: options_default.theme.bar.buttons.notifications.spacing,
          title: "Inner Spacing",
          subtitle: "Spacing between the icon and the label inside the buttons.",
          type: "string"
        }),
        Option({
          opt: options_default.bar.notifications.rightClick,
          title: "Right Click",
          type: "string"
        }),
        Option({
          opt: options_default.bar.notifications.middleClick,
          title: "Middle Click",
          type: "string"
        }),
        Option({
          opt: options_default.bar.notifications.scrollUp,
          title: "Scroll Up",
          type: "string"
        }),
        Option({
          opt: options_default.bar.notifications.scrollDown,
          title: "Scroll Down",
          type: "string"
        })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/pages/config/menus/clock.ts
var ClockMenuSettings = () => {
  return Widget.Scrollable({
    vscroll: "automatic",
    child: Widget.Box({
      class_name: "bar-theme-page paged-container",
      vertical: true,
      children: [
        Header2("Time"),
        Option({ opt: options_default.menus.clock.time.military, title: "Use 24hr time", type: "boolean" }),
        Header2("Weather"),
        Option({ opt: options_default.menus.clock.weather.enabled, title: "Enabled", type: "boolean" }),
        Option({
          opt: options_default.menus.clock.weather.location,
          title: "Location",
          subtitle: "Zip Code, Postal Code, City, etc.",
          type: "string"
        }),
        Option({
          opt: options_default.menus.clock.weather.key,
          title: "Weather API Key",
          subtitle: "May require AGS restart. https://weatherapi.com/",
          type: "string"
        }),
        Option({
          opt: options_default.menus.clock.weather.unit,
          title: "Units",
          type: "enum",
          enums: ["imperial", "metric"]
        }),
        Option({
          opt: options_default.menus.clock.weather.interval,
          title: "Weather Fetching Interval (ms)",
          subtitle: "May require AGS restart.",
          type: "number"
        })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/pages/config/menus/dashboard.ts
var DashboardMenuSettings = () => {
  return Widget.Scrollable({
    class_name: "bar-theme-page paged-container",
    vscroll: "always",
    hscroll: "automatic",
    vexpand: true,
    overlayScrolling: true,
    child: Widget.Box({
      vertical: true,
      children: [
        Header2("Power Menu"),
        Option({ opt: options_default.menus.dashboard.powermenu.avatar.image, title: "Profile Image", type: "img" }),
        Option({
          opt: options_default.menus.dashboard.powermenu.avatar.name,
          title: "Profile Name",
          subtitle: "Use 'system' to automatically set system name",
          type: "string"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.profile.size,
          title: "Profile Image Size",
          type: "string"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.dashboard.profile.radius,
          title: "Profile Image Radius",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.powermenu.confirmation,
          title: "Show Confirmation Dialogue",
          type: "boolean"
        }),
        Option({ opt: options_default.menus.dashboard.powermenu.shutdown, title: "Shutdown Command", type: "string" }),
        Option({ opt: options_default.menus.dashboard.powermenu.reboot, title: "Reboot Command", type: "string" }),
        Option({ opt: options_default.menus.dashboard.powermenu.logout, title: "Logout Command", type: "string" }),
        Option({ opt: options_default.menus.dashboard.powermenu.sleep, title: "Sleep Command", type: "string" }),
        Header2("Resource Usage Metrics"),
        Option({
          opt: options_default.menus.dashboard.stats.enable_gpu,
          title: "Track GPU",
          subtitle: "NOTE: This is currently only available for NVidia GPUs and requires 'python-gpustat'.",
          type: "boolean"
        }),
        Header2("Shortcuts"),
        Option({
          opt: options_default.menus.dashboard.shortcuts.left.shortcut1.icon,
          title: "Left - Shortcut 1 (Icon)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.shortcuts.left.shortcut1.command,
          title: "Left - Shortcut 1 (Command)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.shortcuts.left.shortcut1.tooltip,
          title: "Left - Shortcut 1 (Tooltip)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.shortcuts.left.shortcut2.icon,
          title: "Left - Shortcut 2 (Icon)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.shortcuts.left.shortcut2.command,
          title: "Left - Shortcut 2 (Command)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.shortcuts.left.shortcut2.tooltip,
          title: "Left - Shortcut 2 (Tooltip)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.shortcuts.left.shortcut3.icon,
          title: "Left - Shortcut 3 (Icon)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.shortcuts.left.shortcut3.command,
          title: "Left - Shortcut 3 (Command)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.shortcuts.left.shortcut3.tooltip,
          title: "Left - Shortcut 3 (Tooltip)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.shortcuts.left.shortcut4.icon,
          title: "Left - Shortcut 4 (Icon)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.shortcuts.left.shortcut4.command,
          title: "Left - Shortcut 4 (Command)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.shortcuts.left.shortcut4.tooltip,
          title: "Left - Shortcut 4 (Tooltip)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.shortcuts.right.shortcut1.icon,
          title: "Right - Shortcut 1 (Icon)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.shortcuts.right.shortcut1.command,
          title: "Right - Shortcut 1 (Command)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.shortcuts.right.shortcut1.tooltip,
          title: "Right - Shortcut 1 (Tooltip)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.shortcuts.right.shortcut3.icon,
          title: "Right - Shortcut 3 (Icon)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.shortcuts.right.shortcut3.command,
          title: "Right - Shortcut 3 (Command)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.shortcuts.right.shortcut3.tooltip,
          title: "Right - Shortcut 3 (Tooltip)",
          type: "string"
        }),
        Header2("Directories"),
        Option({
          opt: options_default.menus.dashboard.directories.left.directory1.label,
          title: "Left - Directory 1 (Label)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.directories.left.directory1.command,
          title: "Left - Directory 1 (Command)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.directories.left.directory2.label,
          title: "Left - Directory 2 (Label)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.directories.left.directory2.command,
          title: "Left - Directory 2 (Command)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.directories.left.directory3.label,
          title: "Left - Directory 3 (Label)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.directories.left.directory3.command,
          title: "Left - Directory 3 (Command)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.directories.right.directory1.label,
          title: "Right - Directory 1 (Label)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.directories.right.directory1.command,
          title: "Right - Directory 1 (Command)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.directories.right.directory2.label,
          title: "Right - Directory 2 (Label)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.directories.right.directory2.command,
          title: "Right - Directory 2 (Command)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.directories.right.directory3.label,
          title: "Right - Directory 3 (Label)",
          type: "string"
        }),
        Option({
          opt: options_default.menus.dashboard.directories.right.directory3.command,
          title: "Right - Directory 3 (Command)",
          type: "string"
        })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/pages/config/notifications/index.ts
var NotificationSettings = () => {
  return Widget.Scrollable({
    vscroll: "automatic",
    child: Widget.Box({
      class_name: "bar-theme-page paged-container",
      vertical: true,
      children: [
        Header2("Notification Settings"),
        Option({
          opt: options_default.notifications.ignore,
          title: "Ignored Applications",
          subtitle: "Applications to ignore.\n" + "Wiki: https://hyprpanel.com/configuration/notifications.html#ignored-applications",
          subtitleLink: "https://hyprpanel.com/configuration/notifications.html#ignored-applications",
          type: "object"
        }),
        Option({
          opt: options_default.notifications.position,
          title: "Notification Location",
          type: "enum",
          enums: ["top left", "top", "top right", "right", "bottom right", "bottom", "bottom left", "left"]
        }),
        Option({
          opt: options_default.theme.notification.border_radius,
          title: "Border Radius",
          type: "string"
        }),
        Option({
          opt: options_default.notifications.monitor,
          title: "Monitor",
          subtitle: "The ID of the monitor on which to display the notification",
          type: "number"
        }),
        Option({
          opt: options_default.notifications.active_monitor,
          title: "Follow Cursor",
          subtitle: "The notification will follow the monitor of your cursor",
          type: "boolean"
        }),
        Option({
          opt: options_default.notifications.timeout,
          title: "Notification Timeout",
          subtitle: "How long notification popups will last (in milliseconds).",
          type: "number"
        }),
        Option({
          opt: options_default.notifications.cache_actions,
          title: "Preserve Actions",
          subtitle: "This will persist the action buttons of a notification after rebooting.",
          type: "boolean"
        }),
        Header2("Notification Menu Settings"),
        Option({
          opt: options_default.theme.bar.menus.menu.notifications.height,
          title: "Notification Menu Height",
          type: "string"
        }),
        Option({
          opt: options_default.notifications.displayedTotal,
          title: "Displayed Total",
          subtitle: "How many notifications to show in the menu at once.\n" + "Newer notifications will display towards the top.",
          type: "number",
          min: 1
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.notifications.pager.show,
          title: "Show Pager",
          subtitle: "Shows the pagination footer at the bottom of the menu.",
          type: "boolean"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.notifications.scrollbar.width,
          title: "Scrollbar Width",
          type: "string"
        }),
        Option({
          opt: options_default.theme.bar.menus.menu.notifications.scrollbar.radius,
          title: "Scrollbar Radius",
          type: "string"
        })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/pages/config/osd/index.ts
var OSDSettings = () => {
  return Widget.Scrollable({
    vscroll: "automatic",
    child: Widget.Box({
      class_name: "bar-theme-page paged-container",
      vertical: true,
      children: [
        Header2("On Screen Display"),
        Option({ opt: options_default.theme.osd.enable, title: "Enabled", type: "boolean" }),
        Option({
          opt: options_default.theme.osd.duration,
          title: "Duration",
          type: "number",
          min: 100,
          max: 1e4,
          increment: 500
        }),
        Option({
          opt: options_default.theme.osd.orientation,
          title: "Orientation",
          type: "enum",
          enums: ["horizontal", "vertical"]
        }),
        Option({
          opt: options_default.theme.osd.location,
          title: "Position",
          subtitle: "Position of the OSD on the screen",
          type: "enum",
          enums: ["top left", "top", "top right", "right", "bottom right", "bottom", "bottom left", "left"]
        }),
        Option({
          opt: options_default.theme.osd.monitor,
          title: "Monitor",
          subtitle: "The ID of the monitor on which to display the OSD",
          type: "number"
        }),
        Option({
          opt: options_default.theme.osd.active_monitor,
          title: "Follow Cursor",
          subtitle: "The OSD will follow the monitor of your cursor",
          type: "boolean"
        }),
        Option({
          opt: options_default.theme.osd.radius,
          title: "Radius",
          subtitle: "Radius of the on-screen-display that indicates volume/brightness change",
          type: "string"
        }),
        Option({
          opt: options_default.theme.osd.margins,
          title: "Margins",
          subtitle: "Margins in the following format: top right bottom left",
          type: "string"
        }),
        Option({
          opt: options_default.theme.osd.muted_zero,
          title: "Mute Volume as Zero",
          subtitle: "Display volume as 0 when muting, instead of previous device volume",
          type: "boolean"
        })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/customModules/config.ts
var CustomModuleSettings = () => Widget.Scrollable({
  vscroll: "automatic",
  hscroll: "automatic",
  class_name: "menu-theme-page customModules paged-container",
  child: Widget.Box({
    class_name: "menu-theme-page paged-container",
    vertical: true,
    children: [
      Header2("General"),
      Option({
        opt: options_default.bar.customModules.scrollSpeed,
        title: "Scrolling Speed",
        type: "number"
      }),
      Header2("RAM"),
      Option({
        opt: options_default.theme.bar.buttons.modules.ram.enableBorder,
        title: "Button Border",
        type: "boolean"
      }),
      Option({
        opt: options_default.bar.customModules.ram.label,
        title: "Show Label",
        type: "boolean"
      }),
      Option({
        opt: options_default.theme.bar.buttons.modules.ram.spacing,
        title: "Spacing",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.ram.labelType,
        title: "Label Type",
        type: "enum",
        enums: ["used/total", "used", "free", "percentage"]
      }),
      Option({
        opt: options_default.bar.customModules.ram.round,
        title: "Round",
        type: "boolean"
      }),
      Option({
        opt: options_default.bar.customModules.ram.pollingInterval,
        title: "Polling Interval",
        type: "number",
        min: 100,
        max: 60 * 24 * 1000,
        increment: 1000
      }),
      Option({
        opt: options_default.bar.customModules.ram.leftClick,
        title: "Left Click",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.ram.rightClick,
        title: "Right Click",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.ram.middleClick,
        title: "Middle Click",
        type: "string"
      }),
      Header2("CPU"),
      Option({
        opt: options_default.theme.bar.buttons.modules.cpu.enableBorder,
        title: "Button Border",
        type: "boolean"
      }),
      Option({
        opt: options_default.bar.customModules.cpu.label,
        title: "Show Label",
        type: "boolean"
      }),
      Option({
        opt: options_default.theme.bar.buttons.modules.cpu.spacing,
        title: "Spacing",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.cpu.round,
        title: "Round",
        type: "boolean"
      }),
      Option({
        opt: options_default.bar.customModules.cpu.pollingInterval,
        title: "Polling Interval",
        type: "number",
        min: 100,
        max: 60 * 24 * 1000,
        increment: 1000
      }),
      Option({
        opt: options_default.bar.customModules.cpu.leftClick,
        title: "Left Click",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.cpu.rightClick,
        title: "Right Click",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.cpu.middleClick,
        title: "Middle Click",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.cpu.scrollUp,
        title: "Scroll Up",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.cpu.scrollDown,
        title: "Scroll Down",
        type: "string"
      }),
      Header2("Storage"),
      Option({
        opt: options_default.theme.bar.buttons.modules.storage.enableBorder,
        title: "Button Border",
        type: "boolean"
      }),
      Option({
        opt: options_default.bar.customModules.storage.icon,
        title: "Storage Icon",
        type: "enum",
        enums: ["\uDB80\uDECA", "\uF200", "\uDB85\uDEDF", "\uF0A0", "\uF0C7", "\uEDE9"]
      }),
      Option({
        opt: options_default.bar.customModules.storage.label,
        title: "Show Label",
        type: "boolean"
      }),
      Option({
        opt: options_default.theme.bar.buttons.modules.storage.spacing,
        title: "Spacing",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.storage.labelType,
        title: "Label Type",
        type: "enum",
        enums: ["used/total", "used", "free", "percentage"]
      }),
      Option({
        opt: options_default.bar.customModules.storage.round,
        title: "Round",
        type: "boolean"
      }),
      Option({
        opt: options_default.bar.customModules.storage.pollingInterval,
        title: "Polling Interval",
        type: "number",
        min: 100,
        max: 60 * 24 * 1000,
        increment: 1000
      }),
      Option({
        opt: options_default.bar.customModules.storage.leftClick,
        title: "Left Click",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.storage.rightClick,
        title: "Right Click",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.storage.middleClick,
        title: "Middle Click",
        type: "string"
      }),
      Header2("Netstat"),
      Option({
        opt: options_default.theme.bar.buttons.modules.netstat.enableBorder,
        title: "Button Border",
        type: "boolean"
      }),
      Option({
        opt: options_default.bar.customModules.netstat.networkInterface,
        title: "Network Interface",
        subtitle: "Name of the network interface to poll.\nHINT: Get list of interfaces with 'cat /proc/net/dev'",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.netstat.icon,
        title: "Netstat Icon",
        type: "enum",
        enums: ["\uDB81\uDD9F", "\uDB80\uDDDA", "\uDB81\uDD52", "\uDB81\uDEF3", "\uEF09", "\uDB82\uDCFA", "\uDB81\uDDA9", "\uEF44", "\uDB80\uDE00"]
      }),
      Option({
        opt: options_default.bar.customModules.netstat.label,
        title: "Show Label",
        type: "boolean"
      }),
      Option({
        opt: options_default.bar.customModules.netstat.rateUnit,
        title: "Rate Unit",
        type: "enum",
        enums: ["GiB", "MiB", "KiB", "auto"]
      }),
      Option({
        opt: options_default.theme.bar.buttons.modules.netstat.spacing,
        title: "Spacing",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.netstat.labelType,
        title: "Label Type",
        type: "enum",
        enums: ["full", "in", "out"]
      }),
      Option({
        opt: options_default.bar.customModules.netstat.round,
        title: "Round",
        type: "boolean"
      }),
      Option({
        opt: options_default.bar.customModules.netstat.pollingInterval,
        title: "Polling Interval",
        type: "number",
        min: 100,
        max: 60 * 24 * 1000,
        increment: 1000
      }),
      Option({
        opt: options_default.bar.customModules.netstat.leftClick,
        title: "Left Click",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.netstat.rightClick,
        title: "Right Click",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.netstat.middleClick,
        title: "Middle Click",
        type: "string"
      }),
      Header2("Keyboard Layout"),
      Option({
        opt: options_default.theme.bar.buttons.modules.kbLayout.enableBorder,
        title: "Button Border",
        type: "boolean"
      }),
      Option({
        opt: options_default.bar.customModules.kbLayout.icon,
        title: "kbLayout Icon",
        type: "enum",
        enums: ["\uF11C", "\uDB80\uDF0C", "\uF1AB", "\uDB82\uDF34", "\uDB81\uDDCA"]
      }),
      Option({
        opt: options_default.bar.customModules.kbLayout.label,
        title: "Show Label",
        type: "boolean"
      }),
      Option({
        opt: options_default.bar.customModules.kbLayout.labelType,
        title: "Label Type",
        type: "enum",
        enums: ["layout", "code"]
      }),
      Option({
        opt: options_default.theme.bar.buttons.modules.kbLayout.spacing,
        title: "Spacing",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.kbLayout.leftClick,
        title: "Left Click",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.kbLayout.rightClick,
        title: "Right Click",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.kbLayout.middleClick,
        title: "Middle Click",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.kbLayout.scrollUp,
        title: "Scroll Up",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.kbLayout.scrollDown,
        title: "Scroll Down",
        type: "string"
      }),
      Header2("Updates"),
      Option({
        opt: options_default.theme.bar.buttons.modules.updates.enableBorder,
        title: "Button Border",
        type: "boolean"
      }),
      Option({
        opt: options_default.bar.customModules.updates.updateCommand,
        title: "Check Updates Command",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.updates.icon,
        title: "Updates Icon",
        type: "enum",
        enums: ["\uDB81\uDEB0", "\uDB80\uDDDA", "\uF019", "\uDB85\uDC62", "\uDB85\uDC63", "\uDB80\uDFD6", "\uEB29", "\uDB80\uDFD4", "\uDB80\uDFD7"]
      }),
      Option({
        opt: options_default.bar.customModules.updates.label,
        title: "Show Label",
        type: "boolean"
      }),
      Option({
        opt: options_default.bar.customModules.updates.padZero,
        title: "Pad with 0",
        type: "boolean"
      }),
      Option({
        opt: options_default.theme.bar.buttons.modules.updates.spacing,
        title: "Spacing",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.updates.pollingInterval,
        title: "Polling Interval",
        type: "number",
        subtitle: "WARNING: Be careful of your package manager's rate limit.",
        min: 100,
        max: 60 * 24 * 1000,
        increment: 1000
      }),
      Option({
        opt: options_default.bar.customModules.updates.leftClick,
        title: "Left Click",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.updates.rightClick,
        title: "Right Click",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.updates.middleClick,
        title: "Middle Click",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.updates.scrollUp,
        title: "Scroll Up",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.updates.scrollDown,
        title: "Scroll Down",
        type: "string"
      }),
      Header2("Submap"),
      Option({
        opt: options_default.theme.bar.buttons.modules.submap.enableBorder,
        title: "Button Border",
        type: "boolean"
      }),
      Option({
        opt: options_default.bar.customModules.submap.enabledIcon,
        title: "Enabled Icon",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.submap.disabledIcon,
        title: "Disabled Icon",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.submap.enabledText,
        title: "Enabled Text",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.submap.disabledText,
        title: "Disabled Text",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.submap.label,
        title: "Show Label",
        type: "boolean"
      }),
      Option({
        opt: options_default.theme.bar.buttons.modules.submap.spacing,
        title: "Spacing",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.submap.leftClick,
        title: "Left Click",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.submap.rightClick,
        title: "Right Click",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.submap.middleClick,
        title: "Middle Click",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.submap.scrollUp,
        title: "Scroll Up",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.submap.scrollDown,
        title: "Scroll Down",
        type: "string"
      }),
      Header2("Weather"),
      Option({
        opt: options_default.theme.bar.buttons.modules.weather.enableBorder,
        title: "Button Border",
        type: "boolean"
      }),
      Option({
        opt: options_default.bar.customModules.weather.label,
        title: "Show Label",
        type: "boolean"
      }),
      Option({
        opt: options_default.bar.customModules.weather.unit,
        title: "Units",
        type: "enum",
        enums: ["imperial", "metric"]
      }),
      Option({
        opt: options_default.theme.bar.buttons.modules.weather.spacing,
        title: "Spacing",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.weather.leftClick,
        title: "Left Click",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.weather.rightClick,
        title: "Right Click",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.weather.middleClick,
        title: "Middle Click",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.weather.scrollUp,
        title: "Scroll Up",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.weather.scrollDown,
        title: "Scroll Down",
        type: "string"
      }),
      Header2("Power"),
      Option({
        opt: options_default.theme.bar.buttons.modules.power.enableBorder,
        title: "Button Border",
        type: "boolean"
      }),
      Option({
        opt: options_default.theme.bar.buttons.modules.power.spacing,
        title: "Spacing",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.power.icon,
        title: "Power Button Icon",
        type: "enum",
        enums: ["\uF011", "\uF021", "\uDB80\uDF43", "\uDB83\uDFC5", "\uDB81\uDCB2", "\uDB82\uDD04"]
      }),
      Option({
        opt: options_default.bar.customModules.power.leftClick,
        title: "Left Click",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.power.rightClick,
        title: "Right Click",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.power.middleClick,
        title: "Middle Click",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.power.scrollUp,
        title: "Scroll Up",
        type: "string"
      }),
      Option({
        opt: options_default.bar.customModules.power.scrollDown,
        title: "Scroll Down",
        type: "string"
      })
    ]
  })
});

// /home/antonio/.config/HyprPanel/widget/settings/pages/config/menus/power.ts
var PowerMenuSettings = () => {
  return Widget.Scrollable({
    class_name: "bar-theme-page paged-container",
    vscroll: "always",
    hscroll: "automatic",
    vexpand: true,
    overlayScrolling: true,
    child: Widget.Box({
      vertical: true,
      children: [
        Header2("Power Menu"),
        Option({ opt: options_default.menus.power.showLabel, title: "Show Label", type: "boolean" }),
        Option({ opt: options_default.menus.power.confirmation, title: "Confirmation Dialog", type: "boolean" }),
        Option({ opt: options_default.menus.power.shutdown, title: "Shutdown Command", type: "string" }),
        Option({ opt: options_default.menus.power.reboot, title: "Reboot Command", type: "string" }),
        Option({ opt: options_default.menus.power.logout, title: "Logout Command", type: "string" }),
        Option({ opt: options_default.menus.power.sleep, title: "Sleep Command", type: "string" })
      ]
    })
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/pages/config/index.ts
var CurrentPage2 = Variable("General");
var pagerMap2 = [
  "General",
  "Bar",
  "Notifications",
  "OSD",
  "Power Menu",
  "Clock Menu",
  "Dashboard Menu",
  "Custom Modules"
];
var SettingsMenu = () => {
  return Widget.Box({
    vertical: true,
    children: CurrentPage2.bind("value").as((v) => {
      return [
        Widget.Box({
          class_name: "option-pages-container",
          hpack: "center",
          hexpand: true,
          children: pagerMap2.map((page) => {
            return Widget.Button({
              hpack: "center",
              class_name: `pager-button ${v === page ? "active" : ""}`,
              label: page,
              on_primary_click: () => CurrentPage2.value = page
            });
          })
        }),
        Widget.Stack({
          vexpand: true,
          class_name: "themes-menu-stack",
          children: {
            General: BarGeneral(),
            Bar: BarSettings(),
            Notifications: NotificationSettings(),
            OSD: OSDSettings(),
            "Clock Menu": ClockMenuSettings(),
            "Dashboard Menu": DashboardMenuSettings(),
            "Custom Modules": CustomModuleSettings(),
            "Power Menu": PowerMenuSettings()
          },
          shown: CurrentPage2.bind("value")
        })
      ];
    })
  });
};

// /home/antonio/.config/HyprPanel/widget/settings/side_effects/index.ts
var { show_numbered, show_icons, showWsIcons: showWsIcons2 } = options_default.bar.workspaces;
var { monochrome: monoBar } = options_default.theme.bar.buttons;
var { monochrome: monoMenu } = options_default.theme.bar.menus;
var { matugen: matugen3 } = options_default.theme;
show_numbered.connect("changed", ({ value }) => {
  if (value === true) {
    show_icons.value = false;
    showWsIcons2.value = false;
  }
});
show_icons.connect("changed", ({ value }) => {
  if (value === true) {
    show_numbered.value = false;
    showWsIcons2.value = false;
  }
});
showWsIcons2.connect("changed", ({ value }) => {
  if (value === true) {
    show_numbered.value = false;
    show_icons.value = false;
  }
});
matugen3.connect("changed", ({ value }) => {
  if (value === true) {
    monoBar.value = false;
    monoMenu.value = false;
  }
});

// /home/antonio/.config/HyprPanel/widget/settings/SettingsDialog.ts
var CurrentPage3 = Variable("Configuration");
var pagerMap3 = ["Configuration", "Theming"];
var Header3 = () => Widget.CenterBox({
  class_name: "header",
  start_widget: Widget.Button({
    class_name: "reset",
    on_clicked: options_default.reset,
    hpack: "start",
    vpack: "start",
    child: Widget.Icon(icons_default.ui.refresh),
    tooltip_text: "Reset"
  }),
  center_widget: Widget.Box({}),
  end_widget: Widget.Button({
    class_name: "close",
    hpack: "end",
    vpack: "start",
    child: Widget.Icon(icons_default.ui.close),
    on_clicked: () => App.closeWindow("settings-dialog")
  })
});
var PageContainer = () => {
  return Widget.Box({
    hpack: "fill",
    hexpand: true,
    vertical: true,
    children: CurrentPage3.bind("value").as((v) => {
      return [
        Widget.Box({
          class_name: "option-pages-container",
          hpack: "center",
          hexpand: true,
          children: pagerMap3.map((page) => {
            return Widget.Button({
              xalign: 0,
              hpack: "center",
              class_name: `pager-button ${v === page ? "active" : ""} category`,
              label: page,
              on_primary_click: () => CurrentPage3.value = page
            });
          })
        }),
        Widget.Stack({
          vexpand: false,
          class_name: "themes-menu-stack",
          children: {
            Configuration: SettingsMenu(),
            Theming: ThemesMenu()
          },
          shown: CurrentPage3.bind("value")
        })
      ];
    })
  });
};
var SettingsDialog_default = () => RegularWindow_default({
  name: "settings-dialog",
  class_name: "settings-dialog",
  title: "Settings",
  setup(win) {
    win.on("delete-event", () => {
      win.hide();
      return true;
    });
    win.set_default_size(200, 300);
  },
  child: Widget.Box({
    class_name: "settings-dialog-box",
    vertical: true,
    children: [Header3(), PageContainer()]
  })
});

// /home/antonio/.config/HyprPanel/modules/notifications/image/index.ts
var Image2 = (notif) => {
  if (notifHasImg(notif)) {
    return Widget.Box({
      class_name: "notification-card-image-container",
      hpack: "center",
      vpack: "center",
      vexpand: false,
      child: Widget.Box({
        hpack: "center",
        vexpand: false,
        class_name: "notification-card-image",
        css: `background-image: url("${notif.image}")`
      })
    });
  }
  return Widget.Box();
};

// /home/antonio/.config/HyprPanel/modules/notifications/actions/index.ts
var Action = (notif, notifs4) => {
  if (notif.actions !== undefined && notif.actions.length > 0) {
    return Widget.Box({
      class_name: "notification-card-actions",
      hexpand: true,
      vpack: "end",
      children: notif.actions.map((action) => {
        return Widget.Button({
          hexpand: true,
          class_name: "notification-action-buttons",
          on_primary_click: () => {
            if (action.id.includes("scriptAction:-")) {
              Utils.execAsync(`${action.id.replace("scriptAction:-", "")}`).catch((err) => console.error(err));
              notifs4.CloseNotification(notif.id);
            } else {
              notif.invoke(action.id);
            }
          },
          child: Widget.Box({
            hpack: "center",
            hexpand: true,
            children: [
              Widget.Label({
                class_name: "notification-action-buttons-label",
                hexpand: true,
                label: action.label,
                max_width_chars: 15,
                truncate: "end",
                wrap: true
              })
            ]
          })
        });
      })
    });
  }
  return Widget.Box();
};

// /home/antonio/.config/HyprPanel/modules/notifications/header/index.ts
import GLib9 from "gi://GLib";

// /home/antonio/.config/HyprPanel/modules/notifications/header/icon.ts
var NotificationIcon2 = ({
  app_entry = "",
  app_icon = "",
  app_name = ""
}) => {
  return Widget.Box({
    css: `
            min-width: 2rem;
            min-height: 2rem;
        `,
    child: Widget.Icon({
      class_name: "notification-icon",
      icon: getNotificationIcon(app_name, app_icon, app_entry)
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/notifications/header/index.ts
var { military: military3 } = options_default.menus.clock.time;
var Header4 = (notif) => {
  const time3 = (time4, format2 = "%I:%M %p") => {
    return GLib9.DateTime.new_from_unix_local(time4).format(military3.value ? "%H:%M" : format2) || "--";
  };
  return Widget.Box({
    vertical: false,
    hexpand: true,
    children: [
      Widget.Box({
        class_name: "notification-card-header",
        hpack: "start",
        children: [NotificationIcon2(notif)]
      }),
      Widget.Box({
        class_name: "notification-card-header",
        hexpand: true,
        hpack: "start",
        vpack: "start",
        children: [
          Widget.Label({
            class_name: "notification-card-header-label",
            hpack: "start",
            hexpand: true,
            vexpand: true,
            max_width_chars: !notifHasImg(notif) ? 30 : 19,
            truncate: "end",
            wrap: true,
            label: notif["summary"]
          })
        ]
      }),
      Widget.Box({
        class_name: "notification-card-header menu",
        hpack: "end",
        vpack: "start",
        hexpand: true,
        child: Widget.Label({
          vexpand: true,
          class_name: "notification-time",
          label: time3(notif.time)
        })
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/modules/notifications/body/index.ts
var Body2 = (notif) => {
  return Widget.Box({
    vpack: "start",
    hexpand: true,
    class_name: "notification-card-body",
    children: [
      Widget.Label({
        hexpand: true,
        use_markup: true,
        xalign: 0,
        justification: "left",
        truncate: "end",
        lines: 2,
        max_width_chars: !notifHasImg(notif) ? 35 : 28,
        wrap: true,
        class_name: "notification-card-body-label",
        label: notif["body"]
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/modules/notifications/close/index.ts
var CloseButton2 = (notif, notifs4) => {
  return Widget.Button({
    class_name: "close-notification-button",
    on_primary_click: () => {
      notifs4.CloseNotification(notif.id);
    },
    child: Widget.Label({
      class_name: "txt-icon notif-close",
      label: "\uDB80\uDD5C",
      hpack: "center"
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/notifications/index.ts
var notifs4 = await Service.import("notifications");
var hyprland12 = await Service.import("hyprland");
var { position, timeout, cache_actions, monitor, active_monitor, displayedTotal: displayedTotal4, ignore: ignore4 } = options_default.notifications;
var curMonitor = Variable(monitor.value);
hyprland12.active.connect("changed", () => {
  curMonitor.value = hyprland12.active.monitor.id;
});
var notifications_default2 = () => {
  Utils.merge([timeout.bind("value"), cache_actions.bind("value")], (timeout2, doCaching) => {
    notifs4.popupTimeout = timeout2;
    notifs4.cacheActions = doCaching;
  });
  return Widget.Window({
    name: "notifications-window",
    class_name: "notifications-window",
    monitor: Utils.merge([curMonitor.bind("value"), monitor.bind("value"), active_monitor.bind("value")], (curMon, mon, activeMonitor) => {
      if (activeMonitor === true) {
        return curMon;
      }
      return mon;
    }),
    layer: options_default.tear.bind("value").as((tear) => tear ? "top" : "overlay"),
    anchor: position.bind("value").as((v) => getPosition(v)),
    exclusivity: "normal",
    child: Widget.Box({
      class_name: "notification-card-container",
      vertical: true,
      hexpand: true,
      setup: (self) => {
        Utils.merge([notifs4.bind("popups"), ignore4.bind("value")], (notifications2, ignoredNotifs) => {
          const filteredNotifications = filterNotifications(notifications2, ignoredNotifs);
          return self.children = filteredNotifications.slice(0, displayedTotal4.value).map((notif) => {
            return Widget.Box({
              class_name: "notification-card",
              vpack: "start",
              hexpand: true,
              children: [
                Image2(notif),
                Widget.Box({
                  vpack: "start",
                  vertical: true,
                  hexpand: true,
                  class_name: `notification-card-content ${!notifHasImg(notif) ? "noimg" : ""}`,
                  children: [Header4(notif), Body2(notif), Action(notif, notifs4)]
                }),
                CloseButton2(notif, notifs4)
              ]
            });
          });
        });
      }
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/osd/label/index.ts
var audio8 = await Service.import("audio");
var OSDLabel = () => {
  return Widget.Box({
    class_name: "osd-label-container",
    hexpand: true,
    vexpand: true,
    child: Widget.Label({
      class_name: "osd-label",
      hexpand: true,
      vexpand: true,
      hpack: "center",
      vpack: "center",
      setup: (self) => {
        self.hook(Brightness_default, () => {
          self.class_names = self.class_names.filter((c) => c !== "overflow");
          self.label = `${Math.round(Brightness_default.screen * 100)}`;
        }, "notify::screen");
        self.hook(Brightness_default, () => {
          self.class_names = self.class_names.filter((c) => c !== "overflow");
          self.label = `${Math.round(Brightness_default.kbd * 100)}`;
        }, "notify::kbd");
        self.hook(audio8.microphone, () => {
          self.toggleClassName("overflow", audio8.microphone.volume > 1);
          self.label = `${Math.round(audio8.microphone.volume * 100)}`;
        }, "notify::volume");
        self.hook(audio8.microphone, () => {
          self.toggleClassName("overflow", audio8.microphone.volume > 1 && (!options_default.theme.osd.muted_zero.value || audio8.microphone.is_muted === false));
          const inputVolume = options_default.theme.osd.muted_zero.value && audio8.microphone.is_muted !== false ? 0 : Math.round(audio8.microphone.volume * 100);
          self.label = `${inputVolume}`;
        }, "notify::is-muted");
        self.hook(audio8.speaker, () => {
          self.toggleClassName("overflow", audio8.speaker.volume > 1);
          self.label = `${Math.round(audio8.speaker.volume * 100)}`;
        }, "notify::volume");
        self.hook(audio8.speaker, () => {
          self.toggleClassName("overflow", audio8.speaker.volume > 1 && (!options_default.theme.osd.muted_zero.value || audio8.speaker.is_muted === false));
          const speakerVolume = options_default.theme.osd.muted_zero.value && audio8.speaker.is_muted !== false ? 0 : Math.round(audio8.speaker.volume * 100);
          self.label = `${speakerVolume}`;
        }, "notify::is-muted");
      }
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/osd/bar/index.ts
var audio9 = await Service.import("audio");
var OSDBar = (ort) => {
  return Widget.Box({
    class_name: "osd-bar-container",
    children: [
      Widget.LevelBar({
        class_name: "osd-bar",
        vertical: ort === "vertical",
        inverted: ort === "vertical",
        bar_mode: "continuous",
        setup: (self) => {
          self.hook(Brightness_default, () => {
            self.class_names = self.class_names.filter((c) => c !== "overflow");
            self.value = Brightness_default.screen;
          }, "notify::screen");
          self.hook(Brightness_default, () => {
            self.class_names = self.class_names.filter((c) => c !== "overflow");
            self.value = Brightness_default.kbd;
          }, "notify::kbd");
          self.hook(audio9.microphone, () => {
            self.toggleClassName("overflow", audio9.microphone.volume > 1);
            self.value = audio9.microphone.volume <= 1 ? audio9.microphone.volume : audio9.microphone.volume - 1;
          }, "notify::volume");
          self.hook(audio9.microphone, () => {
            self.toggleClassName("overflow", audio9.microphone.volume > 1 && (!options_default.theme.osd.muted_zero.value || audio9.microphone.is_muted === false));
            self.value = options_default.theme.osd.muted_zero.value && audio9.microphone.is_muted !== false ? 0 : audio9.microphone.volume <= 1 ? audio9.microphone.volume : audio9.microphone.volume - 1;
          }, "notify::is-muted");
          self.hook(audio9.speaker, () => {
            self.toggleClassName("overflow", audio9.speaker.volume > 1);
            self.value = audio9.speaker.volume <= 1 ? audio9.speaker.volume : audio9.speaker.volume - 1;
          }, "notify::volume");
          self.hook(audio9.speaker, () => {
            self.toggleClassName("overflow", audio9.speaker.volume > 1 && (!options_default.theme.osd.muted_zero.value || audio9.speaker.is_muted === false));
            self.value = options_default.theme.osd.muted_zero.value && audio9.speaker.is_muted !== false ? 0 : audio9.speaker.volume <= 1 ? audio9.speaker.volume : audio9.speaker.volume - 1;
          }, "notify::is-muted");
        }
      })
    ]
  });
};

// /home/antonio/.config/HyprPanel/modules/osd/icon/index.ts
var audio10 = await Service.import("audio");
var OSDIcon = () => {
  return Widget.Box({
    class_name: "osd-icon-container",
    hexpand: true,
    child: Widget.Label({
      class_name: "osd-icon txt-icon",
      hexpand: true,
      vexpand: true,
      hpack: "center",
      vpack: "center",
      setup: (self) => {
        self.hook(Brightness_default, () => {
          self.label = "\uDB84\uDF56";
        }, "notify::screen");
        self.hook(Brightness_default, () => {
          self.label = "\uDB82\uDD7B";
        }, "notify::kbd");
        self.hook(audio10.microphone, () => {
          self.label = audio10.microphone.is_muted ? "\uDB80\uDF6D" : "\uDB80\uDF6C";
        }, "notify::volume");
        self.hook(audio10.microphone, () => {
          self.label = audio10.microphone.is_muted ? "\uDB80\uDF6D" : "\uDB80\uDF6C";
        }, "notify::is-muted");
        self.hook(audio10.speaker, () => {
          self.label = audio10.speaker.is_muted ? "\uDB81\uDF5F" : "\uDB81\uDD7E";
        }, "notify::volume");
        self.hook(audio10.speaker, () => {
          self.label = audio10.speaker.is_muted ? "\uDB81\uDF5F" : "\uDB81\uDD7E";
        }, "notify::is-muted");
      }
    })
  });
};

// /home/antonio/.config/HyprPanel/modules/osd/index.ts
import { Revealer } from "resource:///com/github/Aylur/ags/widgets/revealer.js";
import { Window } from "resource:///com/github/Aylur/ags/widgets/window.js";
var hyprland13 = await Service.import("hyprland");
var audio11 = await Service.import("audio");
var { enable, duration, orientation, location: location5, active_monitor: active_monitor2, monitor: monitor2 } = options_default.theme.osd;
var curMonitor2 = Variable(monitor2.value);
hyprland13.active.connect("changed", () => {
  curMonitor2.value = hyprland13.active.monitor.id;
});
var count = 0;
var handleRevealRevealer = (self, property) => {
  if (!enable.value || property !== "reveal_child") {
    return;
  }
  self.reveal_child = true;
  count++;
  Utils.timeout(duration.value, () => {
    count--;
    if (count === 0) {
      self.reveal_child = false;
    }
  });
};
var handleRevealWindow = (self, property) => {
  if (!enable.value || property !== "visible") {
    return;
  }
  self.visible = true;
  count++;
  Utils.timeout(duration.value, () => {
    count--;
    if (count === 0) {
      self.visible = false;
    }
  });
};
var handleReveal = (self, property) => {
  if (self instanceof Revealer) {
    handleRevealRevealer(self, property);
  } else if (self instanceof Window) {
    handleRevealWindow(self, property);
  }
};
var renderOSD = () => {
  return Widget.Revealer({
    transition: "crossfade",
    reveal_child: false,
    setup: (self) => {
      self.hook(Brightness_default, () => {
        handleReveal(self, "reveal_child");
      }, "notify::screen");
      self.hook(Brightness_default, () => {
        handleReveal(self, "reveal_child");
      }, "notify::kbd");
      self.hook(audio11.microphone, () => {
        handleReveal(self, "reveal_child");
      }, "notify::volume");
      self.hook(audio11.microphone, () => {
        handleReveal(self, "reveal_child");
      }, "notify::is-muted");
      self.hook(audio11.speaker, () => {
        handleReveal(self, "reveal_child");
      }, "notify::volume");
      self.hook(audio11.speaker, () => {
        handleReveal(self, "reveal_child");
      }, "notify::is-muted");
    },
    child: Widget.Box({
      class_name: "osd-container",
      vertical: orientation.bind("value").as((ort) => ort === "vertical"),
      children: orientation.bind("value").as((ort) => {
        if (ort === "vertical") {
          return [OSDLabel(), OSDBar(ort), OSDIcon()];
        }
        return [OSDIcon(), OSDBar(ort), OSDLabel()];
      })
    })
  });
};
var osd_default = () => Widget.Window({
  monitor: Utils.merge([curMonitor2.bind("value"), monitor2.bind("value"), active_monitor2.bind("value")], (curMon, mon, activeMonitor) => {
    if (activeMonitor === true) {
      return curMon;
    }
    return mon;
  }),
  name: `indicator`,
  class_name: "indicator",
  layer: options_default.tear.bind("value").as((tear) => tear ? "top" : "overlay"),
  anchor: location5.bind("value").as((v) => getPosition(v)),
  click_through: true,
  child: Widget.Box({
    css: "padding: 1px;",
    expand: true,
    child: renderOSD()
  }),
  setup: (self) => {
    self.hook(enable, () => {
      handleReveal(self, "visible");
    });
    self.hook(Brightness_default, () => {
      handleReveal(self, "visible");
    }, "notify::screen");
    self.hook(Brightness_default, () => {
      handleReveal(self, "visible");
    }, "notify::kbd");
    self.hook(audio11.microphone, () => {
      handleReveal(self, "visible");
    }, "notify::volume");
    self.hook(audio11.microphone, () => {
      handleReveal(self, "visible");
    }, "notify::is-muted");
    self.hook(audio11.speaker, () => {
      handleReveal(self, "visible");
    }, "notify::volume");
    self.hook(audio11.speaker, () => {
      handleReveal(self, "visible");
    }, "notify::is-muted");
  }
});

// /home/antonio/.config/hyprpanel/main.ts
App.config({
  onConfigParsed: () => Utils.execAsync(`python3 ${App.configDir}/services/bluetooth.py`),
  windows: [...main_default, notifications_default2(), SettingsDialog_default(), ...forMonitors(Bar), osd_default()],
  closeWindowDelay: {
    sideright: 350,
    launcher: 350,
    bar0: 350
  }
});
