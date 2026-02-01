import "./three.module-CudnH-mZ.js";
import { B as Box3, M as Matrix4, n as BufferAttribute, V as Vector3, L as Line3, P as Plane, b as Vector2, T as Triangle, a3 as BackSide, D as DoubleSide, ab as REVISION, R as Ray, r as FrontSide, c as MathUtils, m as BufferGeometry } from "./three.core-DwEPwZOL.js";
/**
 * lil-gui
 * https://lil-gui.georgealways.com
 * @version 0.17.0
 * @author George Michael Brower
 * @license MIT
 */
class t {
  constructor(i2, e2, s2, n2, l2 = "div") {
    this.parent = i2, this.object = e2, this.property = s2, this._disabled = false, this._hidden = false, this.initialValue = this.getValue(), this.domElement = document.createElement("div"), this.domElement.classList.add("controller"), this.domElement.classList.add(n2), this.$name = document.createElement("div"), this.$name.classList.add("name"), t.nextNameID = t.nextNameID || 0, this.$name.id = "lil-gui-name-" + ++t.nextNameID, this.$widget = document.createElement(l2), this.$widget.classList.add("widget"), this.$disable = this.$widget, this.domElement.appendChild(this.$name), this.domElement.appendChild(this.$widget), this.parent.children.push(this), this.parent.controllers.push(this), this.parent.$children.appendChild(this.domElement), this._listenCallback = this._listenCallback.bind(this), this.name(s2);
  }
  name(t2) {
    return this._name = t2, this.$name.innerHTML = t2, this;
  }
  onChange(t2) {
    return this._onChange = t2, this;
  }
  _callOnChange() {
    this.parent._callOnChange(this), void 0 !== this._onChange && this._onChange.call(this, this.getValue()), this._changed = true;
  }
  onFinishChange(t2) {
    return this._onFinishChange = t2, this;
  }
  _callOnFinishChange() {
    this._changed && (this.parent._callOnFinishChange(this), void 0 !== this._onFinishChange && this._onFinishChange.call(this, this.getValue())), this._changed = false;
  }
  reset() {
    return this.setValue(this.initialValue), this._callOnFinishChange(), this;
  }
  enable(t2 = true) {
    return this.disable(!t2);
  }
  disable(t2 = true) {
    return t2 === this._disabled || (this._disabled = t2, this.domElement.classList.toggle("disabled", t2), this.$disable.toggleAttribute("disabled", t2)), this;
  }
  show(t2 = true) {
    return this._hidden = !t2, this.domElement.style.display = this._hidden ? "none" : "", this;
  }
  hide() {
    return this.show(false);
  }
  options(t2) {
    const i2 = this.parent.add(this.object, this.property, t2);
    return i2.name(this._name), this.destroy(), i2;
  }
  min(t2) {
    return this;
  }
  max(t2) {
    return this;
  }
  step(t2) {
    return this;
  }
  decimals(t2) {
    return this;
  }
  listen(t2 = true) {
    return this._listening = t2, void 0 !== this._listenCallbackID && (cancelAnimationFrame(this._listenCallbackID), this._listenCallbackID = void 0), this._listening && this._listenCallback(), this;
  }
  _listenCallback() {
    this._listenCallbackID = requestAnimationFrame(this._listenCallback);
    const t2 = this.save();
    t2 !== this._listenPrevValue && this.updateDisplay(), this._listenPrevValue = t2;
  }
  getValue() {
    return this.object[this.property];
  }
  setValue(t2) {
    return this.object[this.property] = t2, this._callOnChange(), this.updateDisplay(), this;
  }
  updateDisplay() {
    return this;
  }
  load(t2) {
    return this.setValue(t2), this._callOnFinishChange(), this;
  }
  save() {
    return this.getValue();
  }
  destroy() {
    this.listen(false), this.parent.children.splice(this.parent.children.indexOf(this), 1), this.parent.controllers.splice(this.parent.controllers.indexOf(this), 1), this.parent.$children.removeChild(this.domElement);
  }
}
class i extends t {
  constructor(t2, i2, e2) {
    super(t2, i2, e2, "boolean", "label"), this.$input = document.createElement("input"), this.$input.setAttribute("type", "checkbox"), this.$input.setAttribute("aria-labelledby", this.$name.id), this.$widget.appendChild(this.$input), this.$input.addEventListener("change", () => {
      this.setValue(this.$input.checked), this._callOnFinishChange();
    }), this.$disable = this.$input, this.updateDisplay();
  }
  updateDisplay() {
    return this.$input.checked = this.getValue(), this;
  }
}
function e(t2) {
  let i2, e2;
  return (i2 = t2.match(/(#|0x)?([a-f0-9]{6})/i)) ? e2 = i2[2] : (i2 = t2.match(/rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/)) ? e2 = parseInt(i2[1]).toString(16).padStart(2, 0) + parseInt(i2[2]).toString(16).padStart(2, 0) + parseInt(i2[3]).toString(16).padStart(2, 0) : (i2 = t2.match(/^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i)) && (e2 = i2[1] + i2[1] + i2[2] + i2[2] + i2[3] + i2[3]), !!e2 && "#" + e2;
}
const s = { isPrimitive: true, match: (t2) => "string" == typeof t2, fromHexString: e, toHexString: e }, n = { isPrimitive: true, match: (t2) => "number" == typeof t2, fromHexString: (t2) => parseInt(t2.substring(1), 16), toHexString: (t2) => "#" + t2.toString(16).padStart(6, 0) }, l = { isPrimitive: false, match: Array.isArray, fromHexString(t2, i2, e2 = 1) {
  const s2 = n.fromHexString(t2);
  i2[0] = (s2 >> 16 & 255) / 255 * e2, i2[1] = (s2 >> 8 & 255) / 255 * e2, i2[2] = (255 & s2) / 255 * e2;
}, toHexString: ([t2, i2, e2], s2 = 1) => n.toHexString(t2 * (s2 = 255 / s2) << 16 ^ i2 * s2 << 8 ^ e2 * s2 << 0) }, r = { isPrimitive: false, match: (t2) => Object(t2) === t2, fromHexString(t2, i2, e2 = 1) {
  const s2 = n.fromHexString(t2);
  i2.r = (s2 >> 16 & 255) / 255 * e2, i2.g = (s2 >> 8 & 255) / 255 * e2, i2.b = (255 & s2) / 255 * e2;
}, toHexString: ({ r: t2, g: i2, b: e2 }, s2 = 1) => n.toHexString(t2 * (s2 = 255 / s2) << 16 ^ i2 * s2 << 8 ^ e2 * s2 << 0) }, o = [s, n, l, r];
class a extends t {
  constructor(t2, i2, s2, n2) {
    var l2;
    super(t2, i2, s2, "color"), this.$input = document.createElement("input"), this.$input.setAttribute("type", "color"), this.$input.setAttribute("tabindex", -1), this.$input.setAttribute("aria-labelledby", this.$name.id), this.$text = document.createElement("input"), this.$text.setAttribute("type", "text"), this.$text.setAttribute("spellcheck", "false"), this.$text.setAttribute("aria-labelledby", this.$name.id), this.$display = document.createElement("div"), this.$display.classList.add("display"), this.$display.appendChild(this.$input), this.$widget.appendChild(this.$display), this.$widget.appendChild(this.$text), this._format = (l2 = this.initialValue, o.find((t3) => t3.match(l2))), this._rgbScale = n2, this._initialValueHexString = this.save(), this._textFocused = false, this.$input.addEventListener("input", () => {
      this._setValueFromHexString(this.$input.value);
    }), this.$input.addEventListener("blur", () => {
      this._callOnFinishChange();
    }), this.$text.addEventListener("input", () => {
      const t3 = e(this.$text.value);
      t3 && this._setValueFromHexString(t3);
    }), this.$text.addEventListener("focus", () => {
      this._textFocused = true, this.$text.select();
    }), this.$text.addEventListener("blur", () => {
      this._textFocused = false, this.updateDisplay(), this._callOnFinishChange();
    }), this.$disable = this.$text, this.updateDisplay();
  }
  reset() {
    return this._setValueFromHexString(this._initialValueHexString), this;
  }
  _setValueFromHexString(t2) {
    if (this._format.isPrimitive) {
      const i2 = this._format.fromHexString(t2);
      this.setValue(i2);
    } else this._format.fromHexString(t2, this.getValue(), this._rgbScale), this._callOnChange(), this.updateDisplay();
  }
  save() {
    return this._format.toHexString(this.getValue(), this._rgbScale);
  }
  load(t2) {
    return this._setValueFromHexString(t2), this._callOnFinishChange(), this;
  }
  updateDisplay() {
    return this.$input.value = this._format.toHexString(this.getValue(), this._rgbScale), this._textFocused || (this.$text.value = this.$input.value.substring(1)), this.$display.style.backgroundColor = this.$input.value, this;
  }
}
class h extends t {
  constructor(t2, i2, e2) {
    super(t2, i2, e2, "function"), this.$button = document.createElement("button"), this.$button.appendChild(this.$name), this.$widget.appendChild(this.$button), this.$button.addEventListener("click", (t3) => {
      t3.preventDefault(), this.getValue().call(this.object);
    }), this.$button.addEventListener("touchstart", () => {
    }, { passive: true }), this.$disable = this.$button;
  }
}
class d extends t {
  constructor(t2, i2, e2, s2, n2, l2) {
    super(t2, i2, e2, "number"), this._initInput(), this.min(s2), this.max(n2);
    const r2 = void 0 !== l2;
    this.step(r2 ? l2 : this._getImplicitStep(), r2), this.updateDisplay();
  }
  decimals(t2) {
    return this._decimals = t2, this.updateDisplay(), this;
  }
  min(t2) {
    return this._min = t2, this._onUpdateMinMax(), this;
  }
  max(t2) {
    return this._max = t2, this._onUpdateMinMax(), this;
  }
  step(t2, i2 = true) {
    return this._step = t2, this._stepExplicit = i2, this;
  }
  updateDisplay() {
    const t2 = this.getValue();
    if (this._hasSlider) {
      let i2 = (t2 - this._min) / (this._max - this._min);
      i2 = Math.max(0, Math.min(i2, 1)), this.$fill.style.width = 100 * i2 + "%";
    }
    return this._inputFocused || (this.$input.value = void 0 === this._decimals ? t2 : t2.toFixed(this._decimals)), this;
  }
  _initInput() {
    this.$input = document.createElement("input"), this.$input.setAttribute("type", "number"), this.$input.setAttribute("step", "any"), this.$input.setAttribute("aria-labelledby", this.$name.id), this.$widget.appendChild(this.$input), this.$disable = this.$input;
    const t2 = (t3) => {
      const i3 = parseFloat(this.$input.value);
      isNaN(i3) || (this._snapClampSetValue(i3 + t3), this.$input.value = this.getValue());
    };
    let i2, e2, s2, n2, l2, r2 = false;
    const o2 = (t3) => {
      if (r2) {
        const s3 = t3.clientX - i2, n3 = t3.clientY - e2;
        Math.abs(n3) > 5 ? (t3.preventDefault(), this.$input.blur(), r2 = false, this._setDraggingStyle(true, "vertical")) : Math.abs(s3) > 5 && a2();
      }
      if (!r2) {
        const i3 = t3.clientY - s2;
        l2 -= i3 * this._step * this._arrowKeyMultiplier(t3), n2 + l2 > this._max ? l2 = this._max - n2 : n2 + l2 < this._min && (l2 = this._min - n2), this._snapClampSetValue(n2 + l2);
      }
      s2 = t3.clientY;
    }, a2 = () => {
      this._setDraggingStyle(false, "vertical"), this._callOnFinishChange(), window.removeEventListener("mousemove", o2), window.removeEventListener("mouseup", a2);
    };
    this.$input.addEventListener("input", () => {
      let t3 = parseFloat(this.$input.value);
      isNaN(t3) || (this._stepExplicit && (t3 = this._snap(t3)), this.setValue(this._clamp(t3)));
    }), this.$input.addEventListener("keydown", (i3) => {
      "Enter" === i3.code && this.$input.blur(), "ArrowUp" === i3.code && (i3.preventDefault(), t2(this._step * this._arrowKeyMultiplier(i3))), "ArrowDown" === i3.code && (i3.preventDefault(), t2(this._step * this._arrowKeyMultiplier(i3) * -1));
    }), this.$input.addEventListener("wheel", (i3) => {
      this._inputFocused && (i3.preventDefault(), t2(this._step * this._normalizeMouseWheel(i3)));
    }, { passive: false }), this.$input.addEventListener("mousedown", (t3) => {
      i2 = t3.clientX, e2 = s2 = t3.clientY, r2 = true, n2 = this.getValue(), l2 = 0, window.addEventListener("mousemove", o2), window.addEventListener("mouseup", a2);
    }), this.$input.addEventListener("focus", () => {
      this._inputFocused = true;
    }), this.$input.addEventListener("blur", () => {
      this._inputFocused = false, this.updateDisplay(), this._callOnFinishChange();
    });
  }
  _initSlider() {
    this._hasSlider = true, this.$slider = document.createElement("div"), this.$slider.classList.add("slider"), this.$fill = document.createElement("div"), this.$fill.classList.add("fill"), this.$slider.appendChild(this.$fill), this.$widget.insertBefore(this.$slider, this.$input), this.domElement.classList.add("hasSlider");
    const t2 = (t3) => {
      const i3 = this.$slider.getBoundingClientRect();
      let e3 = (s3 = t3, n3 = i3.left, l3 = i3.right, r3 = this._min, o3 = this._max, (s3 - n3) / (l3 - n3) * (o3 - r3) + r3);
      var s3, n3, l3, r3, o3;
      this._snapClampSetValue(e3);
    }, i2 = (i3) => {
      t2(i3.clientX);
    }, e2 = () => {
      this._callOnFinishChange(), this._setDraggingStyle(false), window.removeEventListener("mousemove", i2), window.removeEventListener("mouseup", e2);
    };
    let s2, n2, l2 = false;
    const r2 = (i3) => {
      i3.preventDefault(), this._setDraggingStyle(true), t2(i3.touches[0].clientX), l2 = false;
    }, o2 = (i3) => {
      if (l2) {
        const t3 = i3.touches[0].clientX - s2, e3 = i3.touches[0].clientY - n2;
        Math.abs(t3) > Math.abs(e3) ? r2(i3) : (window.removeEventListener("touchmove", o2), window.removeEventListener("touchend", a2));
      } else i3.preventDefault(), t2(i3.touches[0].clientX);
    }, a2 = () => {
      this._callOnFinishChange(), this._setDraggingStyle(false), window.removeEventListener("touchmove", o2), window.removeEventListener("touchend", a2);
    }, h2 = this._callOnFinishChange.bind(this);
    let d2;
    this.$slider.addEventListener("mousedown", (s3) => {
      this._setDraggingStyle(true), t2(s3.clientX), window.addEventListener("mousemove", i2), window.addEventListener("mouseup", e2);
    }), this.$slider.addEventListener("touchstart", (t3) => {
      t3.touches.length > 1 || (this._hasScrollBar ? (s2 = t3.touches[0].clientX, n2 = t3.touches[0].clientY, l2 = true) : r2(t3), window.addEventListener("touchmove", o2, { passive: false }), window.addEventListener("touchend", a2));
    }, { passive: false }), this.$slider.addEventListener("wheel", (t3) => {
      if (Math.abs(t3.deltaX) < Math.abs(t3.deltaY) && this._hasScrollBar) return;
      t3.preventDefault();
      const i3 = this._normalizeMouseWheel(t3) * this._step;
      this._snapClampSetValue(this.getValue() + i3), this.$input.value = this.getValue(), clearTimeout(d2), d2 = setTimeout(h2, 400);
    }, { passive: false });
  }
  _setDraggingStyle(t2, i2 = "horizontal") {
    this.$slider && this.$slider.classList.toggle("active", t2), document.body.classList.toggle("lil-gui-dragging", t2), document.body.classList.toggle("lil-gui-" + i2, t2);
  }
  _getImplicitStep() {
    return this._hasMin && this._hasMax ? (this._max - this._min) / 1e3 : 0.1;
  }
  _onUpdateMinMax() {
    !this._hasSlider && this._hasMin && this._hasMax && (this._stepExplicit || this.step(this._getImplicitStep(), false), this._initSlider(), this.updateDisplay());
  }
  _normalizeMouseWheel(t2) {
    let { deltaX: i2, deltaY: e2 } = t2;
    Math.floor(t2.deltaY) !== t2.deltaY && t2.wheelDelta && (i2 = 0, e2 = -t2.wheelDelta / 120, e2 *= this._stepExplicit ? 1 : 10);
    return i2 + -e2;
  }
  _arrowKeyMultiplier(t2) {
    let i2 = this._stepExplicit ? 1 : 10;
    return t2.shiftKey ? i2 *= 10 : t2.altKey && (i2 /= 10), i2;
  }
  _snap(t2) {
    const i2 = Math.round(t2 / this._step) * this._step;
    return parseFloat(i2.toPrecision(15));
  }
  _clamp(t2) {
    return t2 < this._min && (t2 = this._min), t2 > this._max && (t2 = this._max), t2;
  }
  _snapClampSetValue(t2) {
    this.setValue(this._clamp(this._snap(t2)));
  }
  get _hasScrollBar() {
    const t2 = this.parent.root.$children;
    return t2.scrollHeight > t2.clientHeight;
  }
  get _hasMin() {
    return void 0 !== this._min;
  }
  get _hasMax() {
    return void 0 !== this._max;
  }
}
class c extends t {
  constructor(t2, i2, e2, s2) {
    super(t2, i2, e2, "option"), this.$select = document.createElement("select"), this.$select.setAttribute("aria-labelledby", this.$name.id), this.$display = document.createElement("div"), this.$display.classList.add("display"), this._values = Array.isArray(s2) ? s2 : Object.values(s2), this._names = Array.isArray(s2) ? s2 : Object.keys(s2), this._names.forEach((t3) => {
      const i3 = document.createElement("option");
      i3.innerHTML = t3, this.$select.appendChild(i3);
    }), this.$select.addEventListener("change", () => {
      this.setValue(this._values[this.$select.selectedIndex]), this._callOnFinishChange();
    }), this.$select.addEventListener("focus", () => {
      this.$display.classList.add("focus");
    }), this.$select.addEventListener("blur", () => {
      this.$display.classList.remove("focus");
    }), this.$widget.appendChild(this.$select), this.$widget.appendChild(this.$display), this.$disable = this.$select, this.updateDisplay();
  }
  updateDisplay() {
    const t2 = this.getValue(), i2 = this._values.indexOf(t2);
    return this.$select.selectedIndex = i2, this.$display.innerHTML = -1 === i2 ? t2 : this._names[i2], this;
  }
}
class u extends t {
  constructor(t2, i2, e2) {
    super(t2, i2, e2, "string"), this.$input = document.createElement("input"), this.$input.setAttribute("type", "text"), this.$input.setAttribute("aria-labelledby", this.$name.id), this.$input.addEventListener("input", () => {
      this.setValue(this.$input.value);
    }), this.$input.addEventListener("keydown", (t3) => {
      "Enter" === t3.code && this.$input.blur();
    }), this.$input.addEventListener("blur", () => {
      this._callOnFinishChange();
    }), this.$widget.appendChild(this.$input), this.$disable = this.$input, this.updateDisplay();
  }
  updateDisplay() {
    return this.$input.value = this.getValue(), this;
  }
}
let p = false;
class g {
  constructor({ parent: t2, autoPlace: i2 = void 0 === t2, container: e2, width: s2, title: n2 = "Controls", injectStyles: l2 = true, touchStyles: r2 = true } = {}) {
    if (this.parent = t2, this.root = t2 ? t2.root : this, this.children = [], this.controllers = [], this.folders = [], this._closed = false, this._hidden = false, this.domElement = document.createElement("div"), this.domElement.classList.add("lil-gui"), this.$title = document.createElement("div"), this.$title.classList.add("title"), this.$title.setAttribute("role", "button"), this.$title.setAttribute("aria-expanded", true), this.$title.setAttribute("tabindex", 0), this.$title.addEventListener("click", () => this.openAnimated(this._closed)), this.$title.addEventListener("keydown", (t3) => {
      "Enter" !== t3.code && "Space" !== t3.code || (t3.preventDefault(), this.$title.click());
    }), this.$title.addEventListener("touchstart", () => {
    }, { passive: true }), this.$children = document.createElement("div"), this.$children.classList.add("children"), this.domElement.appendChild(this.$title), this.domElement.appendChild(this.$children), this.title(n2), r2 && this.domElement.classList.add("allow-touch-styles"), this.parent) return this.parent.children.push(this), this.parent.folders.push(this), void this.parent.$children.appendChild(this.domElement);
    this.domElement.classList.add("root"), !p && l2 && (!(function(t3) {
      const i3 = document.createElement("style");
      i3.innerHTML = t3;
      const e3 = document.querySelector("head link[rel=stylesheet], head style");
      e3 ? document.head.insertBefore(i3, e3) : document.head.appendChild(i3);
    })('.lil-gui{--background-color:#1f1f1f;--text-color:#ebebeb;--title-background-color:#111;--title-text-color:#ebebeb;--widget-color:#424242;--hover-color:#4f4f4f;--focus-color:#595959;--number-color:#2cc9ff;--string-color:#a2db3c;--font-size:11px;--input-font-size:11px;--font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;--font-family-mono:Menlo,Monaco,Consolas,"Droid Sans Mono",monospace;--padding:4px;--spacing:4px;--widget-height:20px;--name-width:45%;--slider-knob-width:2px;--slider-input-width:27%;--color-input-width:27%;--slider-input-min-width:45px;--color-input-min-width:45px;--folder-indent:7px;--widget-padding:0 0 0 3px;--widget-border-radius:2px;--checkbox-size:calc(var(--widget-height)*0.75);--scrollbar-width:5px;background-color:var(--background-color);color:var(--text-color);font-family:var(--font-family);font-size:var(--font-size);font-style:normal;font-weight:400;line-height:1;text-align:left;touch-action:manipulation;user-select:none;-webkit-user-select:none}.lil-gui,.lil-gui *{box-sizing:border-box;margin:0;padding:0}.lil-gui.root{display:flex;flex-direction:column;width:var(--width,245px)}.lil-gui.root>.title{background:var(--title-background-color);color:var(--title-text-color)}.lil-gui.root>.children{overflow-x:hidden;overflow-y:auto}.lil-gui.root>.children::-webkit-scrollbar{background:var(--background-color);height:var(--scrollbar-width);width:var(--scrollbar-width)}.lil-gui.root>.children::-webkit-scrollbar-thumb{background:var(--focus-color);border-radius:var(--scrollbar-width)}.lil-gui.force-touch-styles{--widget-height:28px;--padding:6px;--spacing:6px;--font-size:13px;--input-font-size:16px;--folder-indent:10px;--scrollbar-width:7px;--slider-input-min-width:50px;--color-input-min-width:65px}.lil-gui.autoPlace{max-height:100%;position:fixed;right:15px;top:0;z-index:1001}.lil-gui .controller{align-items:center;display:flex;margin:var(--spacing) 0;padding:0 var(--padding)}.lil-gui .controller.disabled{opacity:.5}.lil-gui .controller.disabled,.lil-gui .controller.disabled *{pointer-events:none!important}.lil-gui .controller>.name{flex-shrink:0;line-height:var(--widget-height);min-width:var(--name-width);padding-right:var(--spacing);white-space:pre}.lil-gui .controller .widget{align-items:center;display:flex;min-height:var(--widget-height);position:relative;width:100%}.lil-gui .controller.string input{color:var(--string-color)}.lil-gui .controller.boolean .widget{cursor:pointer}.lil-gui .controller.color .display{border-radius:var(--widget-border-radius);height:var(--widget-height);position:relative;width:100%}.lil-gui .controller.color input[type=color]{cursor:pointer;height:100%;opacity:0;width:100%}.lil-gui .controller.color input[type=text]{flex-shrink:0;font-family:var(--font-family-mono);margin-left:var(--spacing);min-width:var(--color-input-min-width);width:var(--color-input-width)}.lil-gui .controller.option select{max-width:100%;opacity:0;position:absolute;width:100%}.lil-gui .controller.option .display{background:var(--widget-color);border-radius:var(--widget-border-radius);height:var(--widget-height);line-height:var(--widget-height);max-width:100%;overflow:hidden;padding-left:.55em;padding-right:1.75em;pointer-events:none;position:relative;word-break:break-all}.lil-gui .controller.option .display.active{background:var(--focus-color)}.lil-gui .controller.option .display:after{bottom:0;content:"↕";font-family:lil-gui;padding-right:.375em;position:absolute;right:0;top:0}.lil-gui .controller.option .widget,.lil-gui .controller.option select{cursor:pointer}.lil-gui .controller.number input{color:var(--number-color)}.lil-gui .controller.number.hasSlider input{flex-shrink:0;margin-left:var(--spacing);min-width:var(--slider-input-min-width);width:var(--slider-input-width)}.lil-gui .controller.number .slider{background-color:var(--widget-color);border-radius:var(--widget-border-radius);cursor:ew-resize;height:var(--widget-height);overflow:hidden;padding-right:var(--slider-knob-width);touch-action:pan-y;width:100%}.lil-gui .controller.number .slider.active{background-color:var(--focus-color)}.lil-gui .controller.number .slider.active .fill{opacity:.95}.lil-gui .controller.number .fill{border-right:var(--slider-knob-width) solid var(--number-color);box-sizing:content-box;height:100%}.lil-gui-dragging .lil-gui{--hover-color:var(--widget-color)}.lil-gui-dragging *{cursor:ew-resize!important}.lil-gui-dragging.lil-gui-vertical *{cursor:ns-resize!important}.lil-gui .title{--title-height:calc(var(--widget-height) + var(--spacing)*1.25);-webkit-tap-highlight-color:transparent;text-decoration-skip:objects;cursor:pointer;font-weight:600;height:var(--title-height);line-height:calc(var(--title-height) - 4px);outline:none;padding:0 var(--padding)}.lil-gui .title:before{content:"▾";display:inline-block;font-family:lil-gui;padding-right:2px}.lil-gui .title:active{background:var(--title-background-color);opacity:.75}.lil-gui.root>.title:focus{text-decoration:none!important}.lil-gui.closed>.title:before{content:"▸"}.lil-gui.closed>.children{opacity:0;transform:translateY(-7px)}.lil-gui.closed:not(.transition)>.children{display:none}.lil-gui.transition>.children{overflow:hidden;pointer-events:none;transition-duration:.3s;transition-property:height,opacity,transform;transition-timing-function:cubic-bezier(.2,.6,.35,1)}.lil-gui .children:empty:before{content:"Empty";display:block;font-style:italic;height:var(--widget-height);line-height:var(--widget-height);margin:var(--spacing) 0;opacity:.5;padding:0 var(--padding)}.lil-gui.root>.children>.lil-gui>.title{border-width:0;border-bottom:1px solid var(--widget-color);border-left:0 solid var(--widget-color);border-right:0 solid var(--widget-color);border-top:1px solid var(--widget-color);transition:border-color .3s}.lil-gui.root>.children>.lil-gui.closed>.title{border-bottom-color:transparent}.lil-gui+.controller{border-top:1px solid var(--widget-color);margin-top:0;padding-top:var(--spacing)}.lil-gui .lil-gui .lil-gui>.title{border:none}.lil-gui .lil-gui .lil-gui>.children{border:none;border-left:2px solid var(--widget-color);margin-left:var(--folder-indent)}.lil-gui .lil-gui .controller{border:none}.lil-gui input{-webkit-tap-highlight-color:transparent;background:var(--widget-color);border:0;border-radius:var(--widget-border-radius);color:var(--text-color);font-family:var(--font-family);font-size:var(--input-font-size);height:var(--widget-height);outline:none;width:100%}.lil-gui input:disabled{opacity:1}.lil-gui input[type=number],.lil-gui input[type=text]{padding:var(--widget-padding)}.lil-gui input[type=number]:focus,.lil-gui input[type=text]:focus{background:var(--focus-color)}.lil-gui input::-webkit-inner-spin-button,.lil-gui input::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}.lil-gui input[type=number]{-moz-appearance:textfield}.lil-gui input[type=checkbox]{appearance:none;-webkit-appearance:none;border-radius:var(--widget-border-radius);cursor:pointer;height:var(--checkbox-size);text-align:center;width:var(--checkbox-size)}.lil-gui input[type=checkbox]:checked:before{content:"✓";font-family:lil-gui;font-size:var(--checkbox-size);line-height:var(--checkbox-size)}.lil-gui button{-webkit-tap-highlight-color:transparent;background:var(--widget-color);border:1px solid var(--widget-color);border-radius:var(--widget-border-radius);color:var(--text-color);cursor:pointer;font-family:var(--font-family);font-size:var(--font-size);height:var(--widget-height);line-height:calc(var(--widget-height) - 4px);outline:none;text-align:center;text-transform:none;width:100%}.lil-gui button:active{background:var(--focus-color)}@font-face{font-family:lil-gui;src:url("data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAAUsAAsAAAAACJwAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABHU1VCAAABCAAAAH4AAADAImwmYE9TLzIAAAGIAAAAPwAAAGBKqH5SY21hcAAAAcgAAAD0AAACrukyyJBnbHlmAAACvAAAAF8AAACEIZpWH2hlYWQAAAMcAAAAJwAAADZfcj2zaGhlYQAAA0QAAAAYAAAAJAC5AHhobXR4AAADXAAAABAAAABMAZAAAGxvY2EAAANsAAAAFAAAACgCEgIybWF4cAAAA4AAAAAeAAAAIAEfABJuYW1lAAADoAAAASIAAAIK9SUU/XBvc3QAAATEAAAAZgAAAJCTcMc2eJxVjbEOgjAURU+hFRBK1dGRL+ALnAiToyMLEzFpnPz/eAshwSa97517c/MwwJmeB9kwPl+0cf5+uGPZXsqPu4nvZabcSZldZ6kfyWnomFY/eScKqZNWupKJO6kXN3K9uCVoL7iInPr1X5baXs3tjuMqCtzEuagm/AAlzQgPAAB4nGNgYRBlnMDAysDAYM/gBiT5oLQBAwuDJAMDEwMrMwNWEJDmmsJwgCFeXZghBcjlZMgFCzOiKOIFAB71Bb8AeJy1kjFuwkAQRZ+DwRAwBtNQRUGKQ8OdKCAWUhAgKLhIuAsVSpWz5Bbkj3dEgYiUIszqWdpZe+Z7/wB1oCYmIoboiwiLT2WjKl/jscrHfGg/pKdMkyklC5Zs2LEfHYpjcRoPzme9MWWmk3dWbK9ObkWkikOetJ554fWyoEsmdSlt+uR0pCJR34b6t/TVg1SY3sYvdf8vuiKrpyaDXDISiegp17p7579Gp3p++y7HPAiY9pmTibljrr85qSidtlg4+l25GLCaS8e6rRxNBmsnERunKbaOObRz7N72ju5vdAjYpBXHgJylOAVsMseDAPEP8LYoUHicY2BiAAEfhiAGJgZWBgZ7RnFRdnVJELCQlBSRlATJMoLV2DK4glSYs6ubq5vbKrJLSbGrgEmovDuDJVhe3VzcXFwNLCOILB/C4IuQ1xTn5FPilBTj5FPmBAB4WwoqAHicY2BkYGAA4sk1sR/j+W2+MnAzpDBgAyEMQUCSg4EJxAEAwUgFHgB4nGNgZGBgSGFggJMhDIwMqEAYAByHATJ4nGNgAIIUNEwmAABl3AGReJxjYAACIQYlBiMGJ3wQAEcQBEV4nGNgZGBgEGZgY2BiAAEQyQWEDAz/wXwGAAsPATIAAHicXdBNSsNAHAXwl35iA0UQXYnMShfS9GPZA7T7LgIu03SSpkwzYTIt1BN4Ak/gKTyAeCxfw39jZkjymzcvAwmAW/wgwHUEGDb36+jQQ3GXGot79L24jxCP4gHzF/EIr4jEIe7wxhOC3g2TMYy4Q7+Lu/SHuEd/ivt4wJd4wPxbPEKMX3GI5+DJFGaSn4qNzk8mcbKSR6xdXdhSzaOZJGtdapd4vVPbi6rP+cL7TGXOHtXKll4bY1Xl7EGnPtp7Xy2n00zyKLVHfkHBa4IcJ2oD3cgggWvt/V/FbDrUlEUJhTn/0azVWbNTNr0Ens8de1tceK9xZmfB1CPjOmPH4kitmvOubcNpmVTN3oFJyjzCvnmrwhJTzqzVj9jiSX911FjeAAB4nG3HMRKCMBBA0f0giiKi4DU8k0V2GWbIZDOh4PoWWvq6J5V8If9NVNQcaDhyouXMhY4rPTcG7jwYmXhKq8Wz+p762aNaeYXom2n3m2dLTVgsrCgFJ7OTmIkYbwIbC6vIB7WmFfAAAA==") format("woff")}@media (pointer:coarse){.lil-gui.allow-touch-styles{--widget-height:28px;--padding:6px;--spacing:6px;--font-size:13px;--input-font-size:16px;--folder-indent:10px;--scrollbar-width:7px;--slider-input-min-width:50px;--color-input-min-width:65px}}@media (hover:hover){.lil-gui .controller.color .display:hover:before{border:1px solid #fff9;border-radius:var(--widget-border-radius);bottom:0;content:" ";display:block;left:0;position:absolute;right:0;top:0}.lil-gui .controller.option .display.focus{background:var(--focus-color)}.lil-gui .controller.option .widget:hover .display{background:var(--hover-color)}.lil-gui .controller.number .slider:hover{background-color:var(--hover-color)}body:not(.lil-gui-dragging) .lil-gui .title:hover{background:var(--title-background-color);opacity:.85}.lil-gui .title:focus{text-decoration:underline var(--focus-color)}.lil-gui input:hover{background:var(--hover-color)}.lil-gui input:active{background:var(--focus-color)}.lil-gui input[type=checkbox]:focus{box-shadow:inset 0 0 0 1px var(--focus-color)}.lil-gui button:hover{background:var(--hover-color);border-color:var(--hover-color)}.lil-gui button:focus{border-color:var(--focus-color)}}'), p = true), e2 ? e2.appendChild(this.domElement) : i2 && (this.domElement.classList.add("autoPlace"), document.body.appendChild(this.domElement)), s2 && this.domElement.style.setProperty("--width", s2 + "px"), this.domElement.addEventListener("keydown", (t3) => t3.stopPropagation()), this.domElement.addEventListener("keyup", (t3) => t3.stopPropagation());
  }
  add(t2, e2, s2, n2, l2) {
    if (Object(s2) === s2) return new c(this, t2, e2, s2);
    const r2 = t2[e2];
    switch (typeof r2) {
      case "number":
        return new d(this, t2, e2, s2, n2, l2);
      case "boolean":
        return new i(this, t2, e2);
      case "string":
        return new u(this, t2, e2);
      case "function":
        return new h(this, t2, e2);
    }
    console.error("gui.add failed\n	property:", e2, "\n	object:", t2, "\n	value:", r2);
  }
  addColor(t2, i2, e2 = 1) {
    return new a(this, t2, i2, e2);
  }
  addFolder(t2) {
    return new g({ parent: this, title: t2 });
  }
  load(t2, i2 = true) {
    return t2.controllers && this.controllers.forEach((i3) => {
      i3 instanceof h || i3._name in t2.controllers && i3.load(t2.controllers[i3._name]);
    }), i2 && t2.folders && this.folders.forEach((i3) => {
      i3._title in t2.folders && i3.load(t2.folders[i3._title]);
    }), this;
  }
  save(t2 = true) {
    const i2 = { controllers: {}, folders: {} };
    return this.controllers.forEach((t3) => {
      if (!(t3 instanceof h)) {
        if (t3._name in i2.controllers) throw new Error(`Cannot save GUI with duplicate property "${t3._name}"`);
        i2.controllers[t3._name] = t3.save();
      }
    }), t2 && this.folders.forEach((t3) => {
      if (t3._title in i2.folders) throw new Error(`Cannot save GUI with duplicate folder "${t3._title}"`);
      i2.folders[t3._title] = t3.save();
    }), i2;
  }
  open(t2 = true) {
    return this._closed = !t2, this.$title.setAttribute("aria-expanded", !this._closed), this.domElement.classList.toggle("closed", this._closed), this;
  }
  close() {
    return this.open(false);
  }
  show(t2 = true) {
    return this._hidden = !t2, this.domElement.style.display = this._hidden ? "none" : "", this;
  }
  hide() {
    return this.show(false);
  }
  openAnimated(t2 = true) {
    return this._closed = !t2, this.$title.setAttribute("aria-expanded", !this._closed), requestAnimationFrame(() => {
      const i2 = this.$children.clientHeight;
      this.$children.style.height = i2 + "px", this.domElement.classList.add("transition");
      const e2 = (t3) => {
        t3.target === this.$children && (this.$children.style.height = "", this.domElement.classList.remove("transition"), this.$children.removeEventListener("transitionend", e2));
      };
      this.$children.addEventListener("transitionend", e2);
      const s2 = t2 ? this.$children.scrollHeight : 0;
      this.domElement.classList.toggle("closed", !t2), requestAnimationFrame(() => {
        this.$children.style.height = s2 + "px";
      });
    }), this;
  }
  title(t2) {
    return this._title = t2, this.$title.innerHTML = t2, this;
  }
  reset(t2 = true) {
    return (t2 ? this.controllersRecursive() : this.controllers).forEach((t3) => t3.reset()), this;
  }
  onChange(t2) {
    return this._onChange = t2, this;
  }
  _callOnChange(t2) {
    this.parent && this.parent._callOnChange(t2), void 0 !== this._onChange && this._onChange.call(this, { object: t2.object, property: t2.property, value: t2.getValue(), controller: t2 });
  }
  onFinishChange(t2) {
    return this._onFinishChange = t2, this;
  }
  _callOnFinishChange(t2) {
    this.parent && this.parent._callOnFinishChange(t2), void 0 !== this._onFinishChange && this._onFinishChange.call(this, { object: t2.object, property: t2.property, value: t2.getValue(), controller: t2 });
  }
  destroy() {
    this.parent && (this.parent.children.splice(this.parent.children.indexOf(this), 1), this.parent.folders.splice(this.parent.folders.indexOf(this), 1)), this.domElement.parentElement && this.domElement.parentElement.removeChild(this.domElement), Array.from(this.children).forEach((t2) => t2.destroy());
  }
  controllersRecursive() {
    let t2 = Array.from(this.controllers);
    return this.folders.forEach((i2) => {
      t2 = t2.concat(i2.controllersRecursive());
    }), t2;
  }
  foldersRecursive() {
    let t2 = Array.from(this.folders);
    return this.folders.forEach((i2) => {
      t2 = t2.concat(i2.foldersRecursive());
    }), t2;
  }
}
const CENTER = 0;
const AVERAGE = 1;
const SAH = 2;
const CONTAINED = 2;
const PRIMITIVE_INTERSECT_COST = 1.25;
const TRAVERSAL_COST = 1;
const BYTES_PER_NODE = 6 * 4 + 4 + 4;
const UINT32_PER_NODE = BYTES_PER_NODE / 4;
const IS_LEAFNODE_FLAG = 65535;
const FLOAT32_EPSILON = Math.pow(2, -24);
const SKIP_GENERATION = Symbol("SKIP_GENERATION");
const DEFAULT_OPTIONS = {
  strategy: CENTER,
  maxDepth: 40,
  maxLeafSize: 10,
  useSharedArrayBuffer: false,
  setBoundingBox: true,
  onProgress: null,
  indirect: false,
  verbose: true,
  range: null,
  [SKIP_GENERATION]: false
};
function arrayToBox(nodeIndex32, array, target) {
  target.min.x = array[nodeIndex32];
  target.min.y = array[nodeIndex32 + 1];
  target.min.z = array[nodeIndex32 + 2];
  target.max.x = array[nodeIndex32 + 3];
  target.max.y = array[nodeIndex32 + 4];
  target.max.z = array[nodeIndex32 + 5];
  return target;
}
function getLongestEdgeIndex(bounds) {
  let splitDimIdx = -1;
  let splitDist = -Infinity;
  for (let i2 = 0; i2 < 3; i2++) {
    const dist = bounds[i2 + 3] - bounds[i2];
    if (dist > splitDist) {
      splitDist = dist;
      splitDimIdx = i2;
    }
  }
  return splitDimIdx;
}
function copyBounds(source, target) {
  target.set(source);
}
function unionBounds(a2, b, target) {
  let aVal, bVal;
  for (let d2 = 0; d2 < 3; d2++) {
    const d3 = d2 + 3;
    aVal = a2[d2];
    bVal = b[d2];
    target[d2] = aVal < bVal ? aVal : bVal;
    aVal = a2[d3];
    bVal = b[d3];
    target[d3] = aVal > bVal ? aVal : bVal;
  }
}
function expandByPrimitiveBounds(startIndex, primitiveBounds, bounds) {
  for (let d2 = 0; d2 < 3; d2++) {
    const tCenter = primitiveBounds[startIndex + 2 * d2];
    const tHalf = primitiveBounds[startIndex + 2 * d2 + 1];
    const tMin = tCenter - tHalf;
    const tMax = tCenter + tHalf;
    if (tMin < bounds[d2]) {
      bounds[d2] = tMin;
    }
    if (tMax > bounds[d2 + 3]) {
      bounds[d2 + 3] = tMax;
    }
  }
}
function computeSurfaceArea(bounds) {
  const d0 = bounds[3] - bounds[0];
  const d1 = bounds[4] - bounds[1];
  const d2 = bounds[5] - bounds[2];
  return 2 * (d0 * d1 + d1 * d2 + d2 * d0);
}
function IS_LEAF(n16, uint16Array2) {
  return uint16Array2[n16 + 15] === IS_LEAFNODE_FLAG;
}
function OFFSET(n32, uint32Array2) {
  return uint32Array2[n32 + 6];
}
function COUNT(n16, uint16Array2) {
  return uint16Array2[n16 + 14];
}
function LEFT_NODE(n32) {
  return n32 + UINT32_PER_NODE;
}
function RIGHT_NODE(n32, uint32Array2) {
  const relativeOffset = uint32Array2[n32 + 6];
  return n32 + relativeOffset * UINT32_PER_NODE;
}
function SPLIT_AXIS(n32, uint32Array2) {
  return uint32Array2[n32 + 7];
}
function BOUNDING_DATA_INDEX(n32) {
  return n32;
}
function getBounds(primitiveBounds, offset, count, target, centroidTarget) {
  let minx = Infinity;
  let miny = Infinity;
  let minz = Infinity;
  let maxx = -Infinity;
  let maxy = -Infinity;
  let maxz = -Infinity;
  let cminx = Infinity;
  let cminy = Infinity;
  let cminz = Infinity;
  let cmaxx = -Infinity;
  let cmaxy = -Infinity;
  let cmaxz = -Infinity;
  const boundsOffset = primitiveBounds.offset || 0;
  for (let i2 = (offset - boundsOffset) * 6, end = (offset + count - boundsOffset) * 6; i2 < end; i2 += 6) {
    const cx = primitiveBounds[i2 + 0];
    const hx = primitiveBounds[i2 + 1];
    const lx = cx - hx;
    const rx = cx + hx;
    if (lx < minx) minx = lx;
    if (rx > maxx) maxx = rx;
    if (cx < cminx) cminx = cx;
    if (cx > cmaxx) cmaxx = cx;
    const cy = primitiveBounds[i2 + 2];
    const hy = primitiveBounds[i2 + 3];
    const ly = cy - hy;
    const ry = cy + hy;
    if (ly < miny) miny = ly;
    if (ry > maxy) maxy = ry;
    if (cy < cminy) cminy = cy;
    if (cy > cmaxy) cmaxy = cy;
    const cz = primitiveBounds[i2 + 4];
    const hz = primitiveBounds[i2 + 5];
    const lz = cz - hz;
    const rz = cz + hz;
    if (lz < minz) minz = lz;
    if (rz > maxz) maxz = rz;
    if (cz < cminz) cminz = cz;
    if (cz > cmaxz) cmaxz = cz;
  }
  target[0] = minx;
  target[1] = miny;
  target[2] = minz;
  target[3] = maxx;
  target[4] = maxy;
  target[5] = maxz;
  centroidTarget[0] = cminx;
  centroidTarget[1] = cminy;
  centroidTarget[2] = cminz;
  centroidTarget[3] = cmaxx;
  centroidTarget[4] = cmaxy;
  centroidTarget[5] = cmaxz;
}
const BIN_COUNT = 32;
const binsSort = (a2, b) => a2.candidate - b.candidate;
const sahBins = /* @__PURE__ */ new Array(BIN_COUNT).fill().map(() => {
  return {
    count: 0,
    bounds: new Float32Array(6),
    rightCacheBounds: new Float32Array(6),
    leftCacheBounds: new Float32Array(6),
    candidate: 0
  };
});
const leftBounds = /* @__PURE__ */ new Float32Array(6);
function getOptimalSplit(nodeBoundingData, centroidBoundingData, primitiveBounds, offset, count, strategy) {
  let axis = -1;
  let pos = 0;
  if (strategy === CENTER) {
    axis = getLongestEdgeIndex(centroidBoundingData);
    if (axis !== -1) {
      pos = (centroidBoundingData[axis] + centroidBoundingData[axis + 3]) / 2;
    }
  } else if (strategy === AVERAGE) {
    axis = getLongestEdgeIndex(nodeBoundingData);
    if (axis !== -1) {
      pos = getAverage(primitiveBounds, offset, count, axis);
    }
  } else if (strategy === SAH) {
    const rootSurfaceArea = computeSurfaceArea(nodeBoundingData);
    let bestCost = PRIMITIVE_INTERSECT_COST * count;
    const boundsOffset = primitiveBounds.offset || 0;
    const cStart = (offset - boundsOffset) * 6;
    const cEnd = (offset + count - boundsOffset) * 6;
    for (let a2 = 0; a2 < 3; a2++) {
      const axisLeft = centroidBoundingData[a2];
      const axisRight = centroidBoundingData[a2 + 3];
      const axisLength = axisRight - axisLeft;
      const binWidth = axisLength / BIN_COUNT;
      if (count < BIN_COUNT / 4) {
        const truncatedBins = [...sahBins];
        truncatedBins.length = count;
        let b = 0;
        for (let c2 = cStart; c2 < cEnd; c2 += 6, b++) {
          const bin = truncatedBins[b];
          bin.candidate = primitiveBounds[c2 + 2 * a2];
          bin.count = 0;
          const {
            bounds,
            leftCacheBounds,
            rightCacheBounds
          } = bin;
          for (let d2 = 0; d2 < 3; d2++) {
            rightCacheBounds[d2] = Infinity;
            rightCacheBounds[d2 + 3] = -Infinity;
            leftCacheBounds[d2] = Infinity;
            leftCacheBounds[d2 + 3] = -Infinity;
            bounds[d2] = Infinity;
            bounds[d2 + 3] = -Infinity;
          }
          expandByPrimitiveBounds(c2, primitiveBounds, bounds);
        }
        truncatedBins.sort(binsSort);
        let splitCount = count;
        for (let bi = 0; bi < splitCount; bi++) {
          const bin = truncatedBins[bi];
          while (bi + 1 < splitCount && truncatedBins[bi + 1].candidate === bin.candidate) {
            truncatedBins.splice(bi + 1, 1);
            splitCount--;
          }
        }
        for (let c2 = cStart; c2 < cEnd; c2 += 6) {
          const center = primitiveBounds[c2 + 2 * a2];
          for (let bi = 0; bi < splitCount; bi++) {
            const bin = truncatedBins[bi];
            if (center >= bin.candidate) {
              expandByPrimitiveBounds(c2, primitiveBounds, bin.rightCacheBounds);
            } else {
              expandByPrimitiveBounds(c2, primitiveBounds, bin.leftCacheBounds);
              bin.count++;
            }
          }
        }
        for (let bi = 0; bi < splitCount; bi++) {
          const bin = truncatedBins[bi];
          const leftCount = bin.count;
          const rightCount = count - bin.count;
          const leftBounds2 = bin.leftCacheBounds;
          const rightBounds = bin.rightCacheBounds;
          let leftProb = 0;
          if (leftCount !== 0) {
            leftProb = computeSurfaceArea(leftBounds2) / rootSurfaceArea;
          }
          let rightProb = 0;
          if (rightCount !== 0) {
            rightProb = computeSurfaceArea(rightBounds) / rootSurfaceArea;
          }
          const cost = TRAVERSAL_COST + PRIMITIVE_INTERSECT_COST * (leftProb * leftCount + rightProb * rightCount);
          if (cost < bestCost) {
            axis = a2;
            bestCost = cost;
            pos = bin.candidate;
          }
        }
      } else {
        for (let i2 = 0; i2 < BIN_COUNT; i2++) {
          const bin = sahBins[i2];
          bin.count = 0;
          bin.candidate = axisLeft + binWidth + i2 * binWidth;
          const bounds = bin.bounds;
          for (let d2 = 0; d2 < 3; d2++) {
            bounds[d2] = Infinity;
            bounds[d2 + 3] = -Infinity;
          }
        }
        for (let c2 = cStart; c2 < cEnd; c2 += 6) {
          const triCenter = primitiveBounds[c2 + 2 * a2];
          const relativeCenter = triCenter - axisLeft;
          let binIndex = ~~(relativeCenter / binWidth);
          if (binIndex >= BIN_COUNT) binIndex = BIN_COUNT - 1;
          const bin = sahBins[binIndex];
          bin.count++;
          expandByPrimitiveBounds(c2, primitiveBounds, bin.bounds);
        }
        const lastBin = sahBins[BIN_COUNT - 1];
        copyBounds(lastBin.bounds, lastBin.rightCacheBounds);
        for (let i2 = BIN_COUNT - 2; i2 >= 0; i2--) {
          const bin = sahBins[i2];
          const nextBin = sahBins[i2 + 1];
          unionBounds(bin.bounds, nextBin.rightCacheBounds, bin.rightCacheBounds);
        }
        let leftCount = 0;
        for (let i2 = 0; i2 < BIN_COUNT - 1; i2++) {
          const bin = sahBins[i2];
          const binCount = bin.count;
          const bounds = bin.bounds;
          const nextBin = sahBins[i2 + 1];
          const rightBounds = nextBin.rightCacheBounds;
          if (binCount !== 0) {
            if (leftCount === 0) {
              copyBounds(bounds, leftBounds);
            } else {
              unionBounds(bounds, leftBounds, leftBounds);
            }
          }
          leftCount += binCount;
          let leftProb = 0;
          let rightProb = 0;
          if (leftCount !== 0) {
            leftProb = computeSurfaceArea(leftBounds) / rootSurfaceArea;
          }
          const rightCount = count - leftCount;
          if (rightCount !== 0) {
            rightProb = computeSurfaceArea(rightBounds) / rootSurfaceArea;
          }
          const cost = TRAVERSAL_COST + PRIMITIVE_INTERSECT_COST * (leftProb * leftCount + rightProb * rightCount);
          if (cost < bestCost) {
            axis = a2;
            bestCost = cost;
            pos = bin.candidate;
          }
        }
      }
    }
  } else {
    console.warn(`BVH: Invalid build strategy value ${strategy} used.`);
  }
  return { axis, pos };
}
function getAverage(primitiveBounds, offset, count, axis) {
  let avg = 0;
  const boundsOffset = primitiveBounds.offset;
  for (let i2 = offset, end = offset + count; i2 < end; i2++) {
    avg += primitiveBounds[(i2 - boundsOffset) * 6 + axis * 2];
  }
  return avg / count;
}
class BVHNode {
  constructor() {
    this.boundingData = new Float32Array(6);
  }
}
function partition(buffer, stride, primitiveBounds, offset, count, split) {
  let left = offset;
  let right = offset + count - 1;
  const pos = split.pos;
  const axisOffset = split.axis * 2;
  const boundsOffset = primitiveBounds.offset || 0;
  while (true) {
    while (left <= right && primitiveBounds[(left - boundsOffset) * 6 + axisOffset] < pos) {
      left++;
    }
    while (left <= right && primitiveBounds[(right - boundsOffset) * 6 + axisOffset] >= pos) {
      right--;
    }
    if (left < right) {
      for (let i2 = 0; i2 < stride; i2++) {
        let t0 = buffer[left * stride + i2];
        buffer[left * stride + i2] = buffer[right * stride + i2];
        buffer[right * stride + i2] = t0;
      }
      for (let i2 = 0; i2 < 6; i2++) {
        const l2 = left - boundsOffset;
        const r2 = right - boundsOffset;
        const tb = primitiveBounds[l2 * 6 + i2];
        primitiveBounds[l2 * 6 + i2] = primitiveBounds[r2 * 6 + i2];
        primitiveBounds[r2 * 6 + i2] = tb;
      }
      left++;
      right--;
    } else {
      return left;
    }
  }
}
let float32Array, uint32Array, uint16Array, uint8Array;
const MAX_POINTER = Math.pow(2, 32);
function countNodes(node) {
  if ("count" in node) {
    return 1;
  } else {
    return 1 + countNodes(node.left) + countNodes(node.right);
  }
}
function populateBuffer(byteOffset, node, buffer) {
  float32Array = new Float32Array(buffer);
  uint32Array = new Uint32Array(buffer);
  uint16Array = new Uint16Array(buffer);
  uint8Array = new Uint8Array(buffer);
  return _populateBuffer(byteOffset, node);
}
function _populateBuffer(byteOffset, node) {
  const node32Index = byteOffset / 4;
  const node16Index = byteOffset / 2;
  const isLeaf = "count" in node;
  const boundingData = node.boundingData;
  for (let i2 = 0; i2 < 6; i2++) {
    float32Array[node32Index + i2] = boundingData[i2];
  }
  if (isLeaf) {
    if (node.buffer) {
      uint8Array.set(new Uint8Array(node.buffer), byteOffset);
      return byteOffset + node.buffer.byteLength;
    } else {
      uint32Array[node32Index + 6] = node.offset;
      uint16Array[node16Index + 14] = node.count;
      uint16Array[node16Index + 15] = IS_LEAFNODE_FLAG;
      return byteOffset + BYTES_PER_NODE;
    }
  } else {
    const { left, right, splitAxis } = node;
    const leftByteOffset = byteOffset + BYTES_PER_NODE;
    let rightByteOffset = _populateBuffer(leftByteOffset, left);
    const currentNodeIndex = byteOffset / BYTES_PER_NODE;
    const rightNodeIndex = rightByteOffset / BYTES_PER_NODE;
    const relativeRightIndex = rightNodeIndex - currentNodeIndex;
    if (relativeRightIndex > MAX_POINTER) {
      throw new Error("MeshBVH: Cannot store relative child node offset greater than 32 bits.");
    }
    uint32Array[node32Index + 6] = relativeRightIndex;
    uint32Array[node32Index + 7] = splitAxis;
    return _populateBuffer(rightByteOffset, right);
  }
}
function buildTree(bvh, primitiveBounds, offset, count, options) {
  const {
    maxDepth,
    verbose,
    maxLeafSize,
    strategy,
    onProgress
  } = options;
  const partitionBuffer = bvh.primitiveBuffer;
  const partitionStride = bvh.primitiveBufferStride;
  const cacheCentroidBoundingData = new Float32Array(6);
  let reachedMaxDepth = false;
  const root = new BVHNode();
  getBounds(primitiveBounds, offset, count, root.boundingData, cacheCentroidBoundingData);
  splitNode(root, offset, count, cacheCentroidBoundingData);
  return root;
  function triggerProgress(primitivesProcessed) {
    if (onProgress) {
      onProgress(primitivesProcessed / count);
    }
  }
  function splitNode(node, offset2, count2, centroidBoundingData = null, depth = 0) {
    if (!reachedMaxDepth && depth >= maxDepth) {
      reachedMaxDepth = true;
      if (verbose) {
        console.warn(`BVH: Max depth of ${maxDepth} reached when generating BVH. Consider increasing maxDepth.`);
      }
    }
    if (count2 <= maxLeafSize || depth >= maxDepth) {
      triggerProgress(offset2 + count2);
      node.offset = offset2;
      node.count = count2;
      return node;
    }
    const split = getOptimalSplit(node.boundingData, centroidBoundingData, primitiveBounds, offset2, count2, strategy);
    if (split.axis === -1) {
      triggerProgress(offset2 + count2);
      node.offset = offset2;
      node.count = count2;
      return node;
    }
    const splitOffset = partition(partitionBuffer, partitionStride, primitiveBounds, offset2, count2, split);
    if (splitOffset === offset2 || splitOffset === offset2 + count2) {
      triggerProgress(offset2 + count2);
      node.offset = offset2;
      node.count = count2;
    } else {
      node.splitAxis = split.axis;
      const left = new BVHNode();
      const lstart = offset2;
      const lcount = splitOffset - offset2;
      node.left = left;
      getBounds(primitiveBounds, lstart, lcount, left.boundingData, cacheCentroidBoundingData);
      splitNode(left, lstart, lcount, cacheCentroidBoundingData, depth + 1);
      const right = new BVHNode();
      const rstart = splitOffset;
      const rcount = count2 - lcount;
      node.right = right;
      getBounds(primitiveBounds, rstart, rcount, right.boundingData, cacheCentroidBoundingData);
      splitNode(right, rstart, rcount, cacheCentroidBoundingData, depth + 1);
    }
    return node;
  }
}
function buildPackedTree(bvh, options) {
  const BufferConstructor = options.useSharedArrayBuffer ? SharedArrayBuffer : ArrayBuffer;
  const rootRanges = bvh.getRootRanges(options.range);
  const firstRange = rootRanges[0];
  const lastRange = rootRanges[rootRanges.length - 1];
  const fullRange = {
    offset: firstRange.offset,
    count: lastRange.offset + lastRange.count - firstRange.offset
  };
  const primitiveBounds = new Float32Array(6 * fullRange.count);
  primitiveBounds.offset = fullRange.offset;
  bvh.computePrimitiveBounds(fullRange.offset, fullRange.count, primitiveBounds);
  bvh._roots = rootRanges.map((range) => {
    const root = buildTree(bvh, primitiveBounds, range.offset, range.count, options);
    const nodeCount = countNodes(root);
    const buffer = new BufferConstructor(BYTES_PER_NODE * nodeCount);
    populateBuffer(0, root, buffer);
    return buffer;
  });
}
class PrimitivePool {
  constructor(getNewPrimitive) {
    this._getNewPrimitive = getNewPrimitive;
    this._primitives = [];
  }
  getPrimitive() {
    const primitives = this._primitives;
    if (primitives.length === 0) {
      return this._getNewPrimitive();
    } else {
      return primitives.pop();
    }
  }
  releasePrimitive(primitive) {
    this._primitives.push(primitive);
  }
}
class _BufferStack {
  constructor() {
    this.float32Array = null;
    this.uint16Array = null;
    this.uint32Array = null;
    const stack = [];
    let prevBuffer = null;
    this.setBuffer = (buffer) => {
      if (prevBuffer) {
        stack.push(prevBuffer);
      }
      prevBuffer = buffer;
      this.float32Array = new Float32Array(buffer);
      this.uint16Array = new Uint16Array(buffer);
      this.uint32Array = new Uint32Array(buffer);
    };
    this.clearBuffer = () => {
      prevBuffer = null;
      this.float32Array = null;
      this.uint16Array = null;
      this.uint32Array = null;
      if (stack.length !== 0) {
        this.setBuffer(stack.pop());
      }
    };
  }
}
const BufferStack = /* @__PURE__ */ new _BufferStack();
let _box1, _box2;
const boxStack = [];
const boxPool = /* @__PURE__ */ new PrimitivePool(() => new Box3());
function shapecast(bvh, root, intersectsBounds, intersectsRange, boundsTraverseOrder, nodeOffset) {
  _box1 = boxPool.getPrimitive();
  _box2 = boxPool.getPrimitive();
  boxStack.push(_box1, _box2);
  BufferStack.setBuffer(bvh._roots[root]);
  const result = shapecastTraverse(0, bvh.geometry, intersectsBounds, intersectsRange, boundsTraverseOrder, nodeOffset);
  BufferStack.clearBuffer();
  boxPool.releasePrimitive(_box1);
  boxPool.releasePrimitive(_box2);
  boxStack.pop();
  boxStack.pop();
  const length = boxStack.length;
  if (length > 0) {
    _box2 = boxStack[length - 1];
    _box1 = boxStack[length - 2];
  }
  return result;
}
function shapecastTraverse(nodeIndex32, geometry, intersectsBoundsFunc, intersectsRangeFunc, nodeScoreFunc = null, nodeIndexOffset = 0, depth = 0) {
  const { float32Array: float32Array2, uint16Array: uint16Array2, uint32Array: uint32Array2 } = BufferStack;
  let nodeIndex16 = nodeIndex32 * 2;
  const isLeaf = IS_LEAF(nodeIndex16, uint16Array2);
  if (isLeaf) {
    const offset = OFFSET(nodeIndex32, uint32Array2);
    const count = COUNT(nodeIndex16, uint16Array2);
    arrayToBox(BOUNDING_DATA_INDEX(nodeIndex32), float32Array2, _box1);
    return intersectsRangeFunc(offset, count, false, depth, nodeIndexOffset + nodeIndex32 / UINT32_PER_NODE, _box1);
  } else {
    let getLeftOffset = function(nodeIndex322) {
      const { uint16Array: uint16Array3, uint32Array: uint32Array3 } = BufferStack;
      let nodeIndex162 = nodeIndex322 * 2;
      while (!IS_LEAF(nodeIndex162, uint16Array3)) {
        nodeIndex322 = LEFT_NODE(nodeIndex322);
        nodeIndex162 = nodeIndex322 * 2;
      }
      return OFFSET(nodeIndex322, uint32Array3);
    }, getRightEndOffset = function(nodeIndex322) {
      const { uint16Array: uint16Array3, uint32Array: uint32Array3 } = BufferStack;
      let nodeIndex162 = nodeIndex322 * 2;
      while (!IS_LEAF(nodeIndex162, uint16Array3)) {
        nodeIndex322 = RIGHT_NODE(nodeIndex322, uint32Array3);
        nodeIndex162 = nodeIndex322 * 2;
      }
      return OFFSET(nodeIndex322, uint32Array3) + COUNT(nodeIndex162, uint16Array3);
    };
    const left = LEFT_NODE(nodeIndex32);
    const right = RIGHT_NODE(nodeIndex32, uint32Array2);
    let c1 = left;
    let c2 = right;
    let score1, score2;
    let box1, box2;
    if (nodeScoreFunc) {
      box1 = _box1;
      box2 = _box2;
      arrayToBox(BOUNDING_DATA_INDEX(c1), float32Array2, box1);
      arrayToBox(BOUNDING_DATA_INDEX(c2), float32Array2, box2);
      score1 = nodeScoreFunc(box1);
      score2 = nodeScoreFunc(box2);
      if (score2 < score1) {
        c1 = right;
        c2 = left;
        const temp5 = score1;
        score1 = score2;
        score2 = temp5;
        box1 = box2;
      }
    }
    if (!box1) {
      box1 = _box1;
      arrayToBox(BOUNDING_DATA_INDEX(c1), float32Array2, box1);
    }
    const isC1Leaf = IS_LEAF(c1 * 2, uint16Array2);
    const c1Intersection = intersectsBoundsFunc(box1, isC1Leaf, score1, depth + 1, nodeIndexOffset + c1 / UINT32_PER_NODE);
    let c1StopTraversal;
    if (c1Intersection === CONTAINED) {
      const offset = getLeftOffset(c1);
      const end = getRightEndOffset(c1);
      const count = end - offset;
      c1StopTraversal = intersectsRangeFunc(offset, count, true, depth + 1, nodeIndexOffset + c1 / UINT32_PER_NODE, box1);
    } else {
      c1StopTraversal = c1Intersection && shapecastTraverse(
        c1,
        geometry,
        intersectsBoundsFunc,
        intersectsRangeFunc,
        nodeScoreFunc,
        nodeIndexOffset,
        depth + 1
      );
    }
    if (c1StopTraversal) return true;
    box2 = _box2;
    arrayToBox(BOUNDING_DATA_INDEX(c2), float32Array2, box2);
    const isC2Leaf = IS_LEAF(c2 * 2, uint16Array2);
    const c2Intersection = intersectsBoundsFunc(box2, isC2Leaf, score2, depth + 1, nodeIndexOffset + c2 / UINT32_PER_NODE);
    let c2StopTraversal;
    if (c2Intersection === CONTAINED) {
      const offset = getLeftOffset(c2);
      const end = getRightEndOffset(c2);
      const count = end - offset;
      c2StopTraversal = intersectsRangeFunc(offset, count, true, depth + 1, nodeIndexOffset + c2 / UINT32_PER_NODE, box2);
    } else {
      c2StopTraversal = c2Intersection && shapecastTraverse(
        c2,
        geometry,
        intersectsBoundsFunc,
        intersectsRangeFunc,
        nodeScoreFunc,
        nodeIndexOffset,
        depth + 1
      );
    }
    if (c2StopTraversal) return true;
    return false;
  }
}
const _bufferStack1 = /* @__PURE__ */ new BufferStack.constructor();
const _bufferStack2 = /* @__PURE__ */ new BufferStack.constructor();
const _boxPool = /* @__PURE__ */ new PrimitivePool(() => new Box3());
const _leftBox1 = /* @__PURE__ */ new Box3();
const _rightBox1 = /* @__PURE__ */ new Box3();
const _leftBox2 = /* @__PURE__ */ new Box3();
const _rightBox2 = /* @__PURE__ */ new Box3();
let _active = false;
function bvhcast(bvh, otherBvh, matrixToLocal, intersectsRanges) {
  if (_active) {
    throw new Error("MeshBVH: Recursive calls to bvhcast not supported.");
  }
  _active = true;
  const roots = bvh._roots;
  const otherRoots = otherBvh._roots;
  let result;
  let nodeOffset1 = 0;
  let nodeOffset2 = 0;
  const invMat = new Matrix4().copy(matrixToLocal).invert();
  for (let i2 = 0, il = roots.length; i2 < il; i2++) {
    _bufferStack1.setBuffer(roots[i2]);
    nodeOffset2 = 0;
    const localBox = _boxPool.getPrimitive();
    arrayToBox(BOUNDING_DATA_INDEX(0), _bufferStack1.float32Array, localBox);
    localBox.applyMatrix4(invMat);
    for (let j = 0, jl = otherRoots.length; j < jl; j++) {
      _bufferStack2.setBuffer(otherRoots[j]);
      result = _traverse(
        0,
        0,
        matrixToLocal,
        invMat,
        intersectsRanges,
        nodeOffset1,
        nodeOffset2,
        0,
        0,
        localBox
      );
      _bufferStack2.clearBuffer();
      nodeOffset2 += otherRoots[j].byteLength / BYTES_PER_NODE;
      if (result) {
        break;
      }
    }
    _boxPool.releasePrimitive(localBox);
    _bufferStack1.clearBuffer();
    nodeOffset1 += roots[i2].byteLength / BYTES_PER_NODE;
    if (result) {
      break;
    }
  }
  _active = false;
  return result;
}
function _traverse(node1Index32, node2Index32, matrix2to1, matrix1to2, intersectsRangesFunc, node1IndexOffset = 0, node2IndexOffset = 0, depth1 = 0, depth2 = 0, currBox = null, reversed = false) {
  let bufferStack1, bufferStack2;
  if (reversed) {
    bufferStack1 = _bufferStack2;
    bufferStack2 = _bufferStack1;
  } else {
    bufferStack1 = _bufferStack1;
    bufferStack2 = _bufferStack2;
  }
  const float32Array1 = bufferStack1.float32Array, uint32Array1 = bufferStack1.uint32Array, uint16Array1 = bufferStack1.uint16Array, float32Array2 = bufferStack2.float32Array, uint32Array2 = bufferStack2.uint32Array, uint16Array2 = bufferStack2.uint16Array;
  const node1Index16 = node1Index32 * 2;
  const node2Index16 = node2Index32 * 2;
  const isLeaf1 = IS_LEAF(node1Index16, uint16Array1);
  const isLeaf2 = IS_LEAF(node2Index16, uint16Array2);
  let result = false;
  if (isLeaf2 && isLeaf1) {
    if (reversed) {
      result = intersectsRangesFunc(
        OFFSET(node2Index32, uint32Array2),
        COUNT(node2Index32 * 2, uint16Array2),
        OFFSET(node1Index32, uint32Array1),
        COUNT(node1Index32 * 2, uint16Array1),
        depth2,
        node2IndexOffset + node2Index32 / UINT32_PER_NODE,
        depth1,
        node1IndexOffset + node1Index32 / UINT32_PER_NODE
      );
    } else {
      result = intersectsRangesFunc(
        OFFSET(node1Index32, uint32Array1),
        COUNT(node1Index32 * 2, uint16Array1),
        OFFSET(node2Index32, uint32Array2),
        COUNT(node2Index32 * 2, uint16Array2),
        depth1,
        node1IndexOffset + node1Index32 / UINT32_PER_NODE,
        depth2,
        node2IndexOffset + node2Index32 / UINT32_PER_NODE
      );
    }
  } else if (isLeaf2) {
    const newBox = _boxPool.getPrimitive();
    arrayToBox(BOUNDING_DATA_INDEX(node2Index32), float32Array2, newBox);
    newBox.applyMatrix4(matrix2to1);
    const cl1 = LEFT_NODE(node1Index32);
    const cr1 = RIGHT_NODE(node1Index32, uint32Array1);
    arrayToBox(BOUNDING_DATA_INDEX(cl1), float32Array1, _leftBox1);
    arrayToBox(BOUNDING_DATA_INDEX(cr1), float32Array1, _rightBox1);
    const intersectCl1 = newBox.intersectsBox(_leftBox1);
    const intersectCr1 = newBox.intersectsBox(_rightBox1);
    result = intersectCl1 && _traverse(
      node2Index32,
      cl1,
      matrix1to2,
      matrix2to1,
      intersectsRangesFunc,
      node2IndexOffset,
      node1IndexOffset,
      depth2,
      depth1 + 1,
      newBox,
      !reversed
    ) || intersectCr1 && _traverse(
      node2Index32,
      cr1,
      matrix1to2,
      matrix2to1,
      intersectsRangesFunc,
      node2IndexOffset,
      node1IndexOffset,
      depth2,
      depth1 + 1,
      newBox,
      !reversed
    );
    _boxPool.releasePrimitive(newBox);
  } else {
    const cl2 = LEFT_NODE(node2Index32);
    const cr2 = RIGHT_NODE(node2Index32, uint32Array2);
    arrayToBox(BOUNDING_DATA_INDEX(cl2), float32Array2, _leftBox2);
    arrayToBox(BOUNDING_DATA_INDEX(cr2), float32Array2, _rightBox2);
    const leftIntersects = currBox.intersectsBox(_leftBox2);
    const rightIntersects = currBox.intersectsBox(_rightBox2);
    if (leftIntersects && rightIntersects) {
      result = _traverse(
        node1Index32,
        cl2,
        matrix2to1,
        matrix1to2,
        intersectsRangesFunc,
        node1IndexOffset,
        node2IndexOffset,
        depth1,
        depth2 + 1,
        currBox,
        reversed
      ) || _traverse(
        node1Index32,
        cr2,
        matrix2to1,
        matrix1to2,
        intersectsRangesFunc,
        node1IndexOffset,
        node2IndexOffset,
        depth1,
        depth2 + 1,
        currBox,
        reversed
      );
    } else if (leftIntersects) {
      if (isLeaf1) {
        result = _traverse(
          node1Index32,
          cl2,
          matrix2to1,
          matrix1to2,
          intersectsRangesFunc,
          node1IndexOffset,
          node2IndexOffset,
          depth1,
          depth2 + 1,
          currBox,
          reversed
        );
      } else {
        const newBox = _boxPool.getPrimitive();
        newBox.copy(_leftBox2).applyMatrix4(matrix2to1);
        const cl1 = LEFT_NODE(node1Index32);
        const cr1 = RIGHT_NODE(node1Index32, uint32Array1);
        arrayToBox(BOUNDING_DATA_INDEX(cl1), float32Array1, _leftBox1);
        arrayToBox(BOUNDING_DATA_INDEX(cr1), float32Array1, _rightBox1);
        const intersectCl1 = newBox.intersectsBox(_leftBox1);
        const intersectCr1 = newBox.intersectsBox(_rightBox1);
        result = intersectCl1 && _traverse(
          cl2,
          cl1,
          matrix1to2,
          matrix2to1,
          intersectsRangesFunc,
          node2IndexOffset,
          node1IndexOffset,
          depth2,
          depth1 + 1,
          newBox,
          !reversed
        ) || intersectCr1 && _traverse(
          cl2,
          cr1,
          matrix1to2,
          matrix2to1,
          intersectsRangesFunc,
          node2IndexOffset,
          node1IndexOffset,
          depth2,
          depth1 + 1,
          newBox,
          !reversed
        );
        _boxPool.releasePrimitive(newBox);
      }
    } else if (rightIntersects) {
      if (isLeaf1) {
        result = _traverse(
          node1Index32,
          cr2,
          matrix2to1,
          matrix1to2,
          intersectsRangesFunc,
          node1IndexOffset,
          node2IndexOffset,
          depth1,
          depth2 + 1,
          currBox,
          reversed
        );
      } else {
        const newBox = _boxPool.getPrimitive();
        newBox.copy(_rightBox2).applyMatrix4(matrix2to1);
        const cl1 = LEFT_NODE(node1Index32);
        const cr1 = RIGHT_NODE(node1Index32, uint32Array1);
        arrayToBox(BOUNDING_DATA_INDEX(cl1), float32Array1, _leftBox1);
        arrayToBox(BOUNDING_DATA_INDEX(cr1), float32Array1, _rightBox1);
        const intersectCl1 = newBox.intersectsBox(_leftBox1);
        const intersectCr1 = newBox.intersectsBox(_rightBox1);
        result = intersectCl1 && _traverse(
          cr2,
          cl1,
          matrix1to2,
          matrix2to1,
          intersectsRangesFunc,
          node2IndexOffset,
          node1IndexOffset,
          depth2,
          depth1 + 1,
          newBox,
          !reversed
        ) || intersectCr1 && _traverse(
          cr2,
          cr1,
          matrix1to2,
          matrix2to1,
          intersectsRangesFunc,
          node2IndexOffset,
          node1IndexOffset,
          depth2,
          depth1 + 1,
          newBox,
          !reversed
        );
        _boxPool.releasePrimitive(newBox);
      }
    }
  }
  return result;
}
const _tempBox = /* @__PURE__ */ new Box3();
const _tempBuffer = /* @__PURE__ */ new Float32Array(6);
class BVH {
  constructor() {
    this._roots = null;
    this.primitiveBuffer = null;
    this.primitiveBufferStride = null;
  }
  init(options) {
    options = {
      ...DEFAULT_OPTIONS,
      ...options
    };
    buildPackedTree(this, options);
  }
  getRootRanges() {
    throw new Error("BVH: getRootRanges() not implemented");
  }
  // write the i-th primitive bounds in a 6-value min / max format to the buffer
  // starting at the given "writeOffset"
  writePrimitiveBounds() {
    throw new Error("BVH: writePrimitiveBounds() not implemented");
  }
  // writes the union bounds of all primitives in the given range in a min / max format
  // to the buffer
  writePrimitiveRangeBounds(offset, count, targetBuffer, baseIndex) {
    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;
    for (let i2 = offset, end = offset + count; i2 < end; i2++) {
      this.writePrimitiveBounds(i2, _tempBuffer, 0);
      const [lx, ly, lz, rx, ry, rz] = _tempBuffer;
      if (lx < minX) minX = lx;
      if (rx > maxX) maxX = rx;
      if (ly < minY) minY = ly;
      if (ry > maxY) maxY = ry;
      if (lz < minZ) minZ = lz;
      if (rz > maxZ) maxZ = rz;
    }
    targetBuffer[baseIndex + 0] = minX;
    targetBuffer[baseIndex + 1] = minY;
    targetBuffer[baseIndex + 2] = minZ;
    targetBuffer[baseIndex + 3] = maxX;
    targetBuffer[baseIndex + 4] = maxY;
    targetBuffer[baseIndex + 5] = maxZ;
    return targetBuffer;
  }
  computePrimitiveBounds(offset, count, targetBuffer) {
    const boundsOffset = targetBuffer.offset || 0;
    for (let i2 = offset, end = offset + count; i2 < end; i2++) {
      this.writePrimitiveBounds(i2, _tempBuffer, 0);
      const [lx, ly, lz, rx, ry, rz] = _tempBuffer;
      const cx = (lx + rx) / 2;
      const cy = (ly + ry) / 2;
      const cz = (lz + rz) / 2;
      const hx = (rx - lx) / 2;
      const hy = (ry - ly) / 2;
      const hz = (rz - lz) / 2;
      const baseIndex = (i2 - boundsOffset) * 6;
      targetBuffer[baseIndex + 0] = cx;
      targetBuffer[baseIndex + 1] = hx + (Math.abs(cx) + hx) * FLOAT32_EPSILON;
      targetBuffer[baseIndex + 2] = cy;
      targetBuffer[baseIndex + 3] = hy + (Math.abs(cy) + hy) * FLOAT32_EPSILON;
      targetBuffer[baseIndex + 4] = cz;
      targetBuffer[baseIndex + 5] = hz + (Math.abs(cz) + hz) * FLOAT32_EPSILON;
    }
    return targetBuffer;
  }
  shiftPrimitiveOffsets(offset) {
    const indirectBuffer = this._indirectBuffer;
    if (indirectBuffer) {
      for (let i2 = 0, l2 = indirectBuffer.length; i2 < l2; i2++) {
        indirectBuffer[i2] += offset;
      }
    } else {
      const roots = this._roots;
      for (let rootIndex = 0; rootIndex < roots.length; rootIndex++) {
        const root = roots[rootIndex];
        const uint32Array2 = new Uint32Array(root);
        const uint16Array2 = new Uint16Array(root);
        const totalNodes = root.byteLength / BYTES_PER_NODE;
        for (let node = 0; node < totalNodes; node++) {
          const node32Index = UINT32_PER_NODE * node;
          const node16Index = 2 * node32Index;
          if (IS_LEAF(node16Index, uint16Array2)) {
            uint32Array2[node32Index + 6] += offset;
          }
        }
      }
    }
  }
  traverse(callback, rootIndex = 0) {
    const buffer = this._roots[rootIndex];
    const uint32Array2 = new Uint32Array(buffer);
    const uint16Array2 = new Uint16Array(buffer);
    _traverse2(0);
    function _traverse2(node32Index, depth = 0) {
      const node16Index = node32Index * 2;
      const isLeaf = IS_LEAF(node16Index, uint16Array2);
      if (isLeaf) {
        const offset = uint32Array2[node32Index + 6];
        const count = uint16Array2[node16Index + 14];
        callback(depth, isLeaf, new Float32Array(buffer, node32Index * 4, 6), offset, count);
      } else {
        const left = LEFT_NODE(node32Index);
        const right = RIGHT_NODE(node32Index, uint32Array2);
        const splitAxis = SPLIT_AXIS(node32Index, uint32Array2);
        const stopTraversal = callback(depth, isLeaf, new Float32Array(buffer, node32Index * 4, 6), splitAxis);
        if (!stopTraversal) {
          _traverse2(left, depth + 1);
          _traverse2(right, depth + 1);
        }
      }
    }
  }
  refit() {
    const roots = this._roots;
    for (let rootIndex = 0, rootCount = roots.length; rootIndex < rootCount; rootIndex++) {
      const buffer = roots[rootIndex];
      const uint32Array2 = new Uint32Array(buffer);
      const uint16Array2 = new Uint16Array(buffer);
      const float32Array2 = new Float32Array(buffer);
      const totalNodes = buffer.byteLength / BYTES_PER_NODE;
      for (let nodeIndex = totalNodes - 1; nodeIndex >= 0; nodeIndex--) {
        const nodeIndex32 = nodeIndex * UINT32_PER_NODE;
        const nodeIndex16 = nodeIndex32 * 2;
        const isLeaf = IS_LEAF(nodeIndex16, uint16Array2);
        if (isLeaf) {
          const offset = OFFSET(nodeIndex32, uint32Array2);
          const count = COUNT(nodeIndex16, uint16Array2);
          this.writePrimitiveRangeBounds(offset, count, _tempBuffer, 0);
          float32Array2.set(_tempBuffer, nodeIndex32);
        } else {
          const left = LEFT_NODE(nodeIndex32);
          const right = RIGHT_NODE(nodeIndex32, uint32Array2);
          for (let i2 = 0; i2 < 3; i2++) {
            const leftMin = float32Array2[left + i2];
            const leftMax = float32Array2[left + i2 + 3];
            const rightMin = float32Array2[right + i2];
            const rightMax = float32Array2[right + i2 + 3];
            float32Array2[nodeIndex32 + i2] = leftMin < rightMin ? leftMin : rightMin;
            float32Array2[nodeIndex32 + i2 + 3] = leftMax > rightMax ? leftMax : rightMax;
          }
        }
      }
    }
  }
  getBoundingBox(target) {
    target.makeEmpty();
    const roots = this._roots;
    roots.forEach((buffer) => {
      arrayToBox(0, new Float32Array(buffer), _tempBox);
      target.union(_tempBox);
    });
    return target;
  }
  // Base shapecast implementation that can be used by subclasses
  // TODO: see if we can get rid of "iterateFunc" here as well as the primitive so the function
  // API aligns with the "shapecast" implementation
  shapecast(callbacks) {
    let {
      boundsTraverseOrder,
      intersectsBounds,
      intersectsRange,
      intersectsPrimitive,
      scratchPrimitive,
      iterate
    } = callbacks;
    if (intersectsRange && intersectsPrimitive) {
      const originalIntersectsRange = intersectsRange;
      intersectsRange = (offset, count, contained, depth, nodeIndex) => {
        if (!originalIntersectsRange(offset, count, contained, depth, nodeIndex)) {
          return iterate(offset, count, this, intersectsPrimitive, contained, depth, scratchPrimitive);
        }
        return true;
      };
    } else if (!intersectsRange) {
      if (intersectsPrimitive) {
        intersectsRange = (offset, count, contained, depth) => {
          return iterate(offset, count, this, intersectsPrimitive, contained, depth, scratchPrimitive);
        };
      } else {
        intersectsRange = (offset, count, contained) => {
          return contained;
        };
      }
    }
    let result = false;
    let nodeOffset = 0;
    const roots = this._roots;
    for (let i2 = 0, l2 = roots.length; i2 < l2; i2++) {
      const root = roots[i2];
      result = shapecast(this, i2, intersectsBounds, intersectsRange, boundsTraverseOrder, nodeOffset);
      if (result) {
        break;
      }
      nodeOffset += root.byteLength / BYTES_PER_NODE;
    }
    return result;
  }
  bvhcast(otherBvh, matrixToLocal, callbacks) {
    let { intersectsRanges } = callbacks;
    return bvhcast(this, otherBvh, matrixToLocal, intersectsRanges);
  }
}
function isSharedArrayBufferSupported() {
  return typeof SharedArrayBuffer !== "undefined";
}
function getVertexCount(geo) {
  return geo.index ? geo.index.count : geo.attributes.position.count;
}
function getTriCount$1(geo) {
  return getVertexCount(geo) / 3;
}
function getIndexArray(vertexCount, BufferConstructor = ArrayBuffer) {
  if (vertexCount > 65535) {
    return new Uint32Array(new BufferConstructor(4 * vertexCount));
  } else {
    return new Uint16Array(new BufferConstructor(2 * vertexCount));
  }
}
function ensureIndex(geo, options) {
  if (!geo.index) {
    const vertexCount = geo.attributes.position.count;
    const BufferConstructor = options.useSharedArrayBuffer ? SharedArrayBuffer : ArrayBuffer;
    const index = getIndexArray(vertexCount, BufferConstructor);
    geo.setIndex(new BufferAttribute(index, 1));
    for (let i2 = 0; i2 < vertexCount; i2++) {
      index[i2] = i2;
    }
  }
}
function getFullPrimitiveRange(geo, range, stride) {
  const primitiveCount = getVertexCount(geo) / stride;
  const drawRange = range ? range : geo.drawRange;
  const start = drawRange.start / stride;
  const end = (drawRange.start + drawRange.count) / stride;
  const offset = Math.max(0, start);
  const count = Math.min(primitiveCount, end) - offset;
  return {
    offset: Math.floor(offset),
    count: Math.floor(count)
  };
}
function getPrimitiveGroupRanges(geo, stride) {
  return geo.groups.map((group) => ({
    offset: group.start / stride,
    count: group.count / stride
  }));
}
function getRootPrimitiveRanges(geo, range, stride) {
  const drawRange = getFullPrimitiveRange(geo, range, stride);
  const primitiveRanges = getPrimitiveGroupRanges(geo, stride);
  if (!primitiveRanges.length) {
    return [drawRange];
  }
  const ranges = [];
  const drawRangeStart = drawRange.offset;
  const drawRangeEnd = drawRange.offset + drawRange.count;
  const primitiveCount = getVertexCount(geo) / stride;
  const events = [];
  for (const group of primitiveRanges) {
    const { offset, count } = group;
    const groupStart = offset;
    const groupCount = isFinite(count) ? count : primitiveCount - offset;
    const groupEnd = offset + groupCount;
    if (groupStart < drawRangeEnd && groupEnd > drawRangeStart) {
      events.push({ pos: Math.max(drawRangeStart, groupStart), isStart: true });
      events.push({ pos: Math.min(drawRangeEnd, groupEnd), isStart: false });
    }
  }
  events.sort((a2, b) => {
    if (a2.pos !== b.pos) {
      return a2.pos - b.pos;
    } else {
      return a2.type === "end" ? -1 : 1;
    }
  });
  let activeGroups = 0;
  let lastPos = null;
  for (const event of events) {
    const newPos = event.pos;
    if (activeGroups !== 0 && newPos !== lastPos) {
      ranges.push({
        offset: lastPos,
        count: newPos - lastPos
      });
    }
    activeGroups += event.isStart ? 1 : -1;
    lastPos = newPos;
  }
  return ranges;
}
function generateIndirectBuffer(ranges, useSharedArrayBuffer) {
  const lastRange = ranges[ranges.length - 1];
  const useUint32 = lastRange.offset + lastRange.count > 2 ** 16;
  const length = ranges.reduce((acc, val) => acc + val.count, 0);
  const byteCount = useUint32 ? 4 : 2;
  const buffer = useSharedArrayBuffer ? new SharedArrayBuffer(length * byteCount) : new ArrayBuffer(length * byteCount);
  const indirectBuffer = useUint32 ? new Uint32Array(buffer) : new Uint16Array(buffer);
  let index = 0;
  for (let r2 = 0; r2 < ranges.length; r2++) {
    const { offset, count } = ranges[r2];
    for (let i2 = 0; i2 < count; i2++) {
      indirectBuffer[index + i2] = offset + i2;
    }
    index += count;
  }
  return indirectBuffer;
}
class GeometryBVH extends BVH {
  get indirect() {
    return !!this._indirectBuffer;
  }
  get primitiveStride() {
    return null;
  }
  get primitiveBufferStride() {
    return this.indirect ? 1 : this.primitiveStride;
  }
  set primitiveBufferStride(v) {
  }
  get primitiveBuffer() {
    return this.indirect ? this._indirectBuffer : this.geometry.index.array;
  }
  set primitiveBuffer(v) {
  }
  constructor(geometry, options = {}) {
    if (!geometry.isBufferGeometry) {
      throw new Error("BVH: Only BufferGeometries are supported.");
    } else if (geometry.index && geometry.index.isInterleavedBufferAttribute) {
      throw new Error("BVH: InterleavedBufferAttribute is not supported for the index attribute.");
    }
    if (options.useSharedArrayBuffer && !isSharedArrayBufferSupported()) {
      throw new Error("BVH: SharedArrayBuffer is not available.");
    }
    super();
    this.geometry = geometry;
    this.resolvePrimitiveIndex = options.indirect ? (i2) => this._indirectBuffer[i2] : (i2) => i2;
    this.primitiveBuffer = null;
    this.primitiveBufferStride = null;
    this._indirectBuffer = null;
    options = {
      ...DEFAULT_OPTIONS,
      ...options
    };
    if (!options[SKIP_GENERATION]) {
      this.init(options);
    }
  }
  init(options) {
    const { geometry, primitiveStride } = this;
    if (options.indirect) {
      const ranges = getRootPrimitiveRanges(geometry, options.range, primitiveStride);
      const indirectBuffer = generateIndirectBuffer(ranges, options.useSharedArrayBuffer);
      this._indirectBuffer = indirectBuffer;
    } else {
      ensureIndex(geometry, options);
    }
    super.init(options);
    if (!geometry.boundingBox && options.setBoundingBox) {
      geometry.boundingBox = this.getBoundingBox(new Box3());
    }
  }
  // Abstract methods to be implemented by subclasses
  getRootRanges(range) {
    if (this.indirect) {
      return [{ offset: 0, count: this._indirectBuffer.length }];
    } else {
      return getRootPrimitiveRanges(this.geometry, range, this.primitiveStride);
    }
  }
  raycastObject3D() {
    throw new Error("BVH: raycastObject3D() not implemented");
  }
}
class SeparatingAxisBounds {
  constructor() {
    this.min = Infinity;
    this.max = -Infinity;
  }
  setFromPointsField(points, field) {
    let min = Infinity;
    let max = -Infinity;
    for (let i2 = 0, l2 = points.length; i2 < l2; i2++) {
      const p2 = points[i2];
      const val = p2[field];
      min = val < min ? val : min;
      max = val > max ? val : max;
    }
    this.min = min;
    this.max = max;
  }
  setFromPoints(axis, points) {
    let min = Infinity;
    let max = -Infinity;
    for (let i2 = 0, l2 = points.length; i2 < l2; i2++) {
      const p2 = points[i2];
      const val = axis.dot(p2);
      min = val < min ? val : min;
      max = val > max ? val : max;
    }
    this.min = min;
    this.max = max;
  }
  isSeparated(other) {
    return this.min > other.max || other.min > this.max;
  }
}
SeparatingAxisBounds.prototype.setFromBox = /* @__PURE__ */ (function() {
  const p2 = /* @__PURE__ */ new Vector3();
  return function setFromBox(axis, box) {
    const boxMin = box.min;
    const boxMax = box.max;
    let min = Infinity;
    let max = -Infinity;
    for (let x = 0; x <= 1; x++) {
      for (let y = 0; y <= 1; y++) {
        for (let z = 0; z <= 1; z++) {
          p2.x = boxMin.x * x + boxMax.x * (1 - x);
          p2.y = boxMin.y * y + boxMax.y * (1 - y);
          p2.z = boxMin.z * z + boxMax.z * (1 - z);
          const val = axis.dot(p2);
          min = Math.min(val, min);
          max = Math.max(val, max);
        }
      }
    }
    this.min = min;
    this.max = max;
  };
})();
const closestPointLineToLine = /* @__PURE__ */ (function() {
  const dir1 = /* @__PURE__ */ new Vector3();
  const dir2 = /* @__PURE__ */ new Vector3();
  const v02 = /* @__PURE__ */ new Vector3();
  return function closestPointLineToLine2(l1, l2, result) {
    const v0 = l1.start;
    const v10 = dir1;
    const v2 = l2.start;
    const v32 = dir2;
    v02.subVectors(v0, v2);
    dir1.subVectors(l1.end, l1.start);
    dir2.subVectors(l2.end, l2.start);
    const d0232 = v02.dot(v32);
    const d3210 = v32.dot(v10);
    const d3232 = v32.dot(v32);
    const d0210 = v02.dot(v10);
    const d1010 = v10.dot(v10);
    const denom = d1010 * d3232 - d3210 * d3210;
    let d2, d22;
    if (denom !== 0) {
      d2 = (d0232 * d3210 - d0210 * d3232) / denom;
    } else {
      d2 = 0;
    }
    d22 = (d0232 + d2 * d3210) / d3232;
    result.x = d2;
    result.y = d22;
  };
})();
const closestPointsSegmentToSegment = /* @__PURE__ */ (function() {
  const paramResult = /* @__PURE__ */ new Vector2();
  const temp12 = /* @__PURE__ */ new Vector3();
  const temp22 = /* @__PURE__ */ new Vector3();
  return function closestPointsSegmentToSegment2(l1, l2, target1, target2) {
    closestPointLineToLine(l1, l2, paramResult);
    let d2 = paramResult.x;
    let d22 = paramResult.y;
    if (d2 >= 0 && d2 <= 1 && d22 >= 0 && d22 <= 1) {
      l1.at(d2, target1);
      l2.at(d22, target2);
      return;
    } else if (d2 >= 0 && d2 <= 1) {
      if (d22 < 0) {
        l2.at(0, target2);
      } else {
        l2.at(1, target2);
      }
      l1.closestPointToPoint(target2, true, target1);
      return;
    } else if (d22 >= 0 && d22 <= 1) {
      if (d2 < 0) {
        l1.at(0, target1);
      } else {
        l1.at(1, target1);
      }
      l2.closestPointToPoint(target1, true, target2);
      return;
    } else {
      let p2;
      if (d2 < 0) {
        p2 = l1.start;
      } else {
        p2 = l1.end;
      }
      let p22;
      if (d22 < 0) {
        p22 = l2.start;
      } else {
        p22 = l2.end;
      }
      const closestPoint = temp12;
      const closestPoint2 = temp22;
      l1.closestPointToPoint(p22, true, temp12);
      l2.closestPointToPoint(p2, true, temp22);
      if (closestPoint.distanceToSquared(p22) <= closestPoint2.distanceToSquared(p2)) {
        target1.copy(closestPoint);
        target2.copy(p22);
        return;
      } else {
        target1.copy(p2);
        target2.copy(closestPoint2);
        return;
      }
    }
  };
})();
const sphereIntersectTriangle = /* @__PURE__ */ (function() {
  const closestPointTemp = /* @__PURE__ */ new Vector3();
  const projectedPointTemp = /* @__PURE__ */ new Vector3();
  const planeTemp = /* @__PURE__ */ new Plane();
  const lineTemp = /* @__PURE__ */ new Line3();
  return function sphereIntersectTriangle2(sphere, triangle3) {
    const { radius, center } = sphere;
    const { a: a2, b, c: c2 } = triangle3;
    lineTemp.start = a2;
    lineTemp.end = b;
    const closestPoint1 = lineTemp.closestPointToPoint(center, true, closestPointTemp);
    if (closestPoint1.distanceTo(center) <= radius) return true;
    lineTemp.start = a2;
    lineTemp.end = c2;
    const closestPoint2 = lineTemp.closestPointToPoint(center, true, closestPointTemp);
    if (closestPoint2.distanceTo(center) <= radius) return true;
    lineTemp.start = b;
    lineTemp.end = c2;
    const closestPoint3 = lineTemp.closestPointToPoint(center, true, closestPointTemp);
    if (closestPoint3.distanceTo(center) <= radius) return true;
    const plane = triangle3.getPlane(planeTemp);
    const dp = Math.abs(plane.distanceToPoint(center));
    if (dp <= radius) {
      const pp = plane.projectPoint(center, projectedPointTemp);
      const cp = triangle3.containsPoint(pp);
      if (cp) return true;
    }
    return false;
  };
})();
const componentKeys = ["x", "y", "z"];
const ZERO_EPSILON = 1e-15;
const ZERO_EPSILON_SQR = ZERO_EPSILON * ZERO_EPSILON;
function isNearZero(value) {
  return Math.abs(value) < ZERO_EPSILON;
}
class ExtendedTriangle extends Triangle {
  constructor(...args) {
    super(...args);
    this.isExtendedTriangle = true;
    this.satAxes = new Array(4).fill().map(() => new Vector3());
    this.satBounds = new Array(4).fill().map(() => new SeparatingAxisBounds());
    this.points = [this.a, this.b, this.c];
    this.plane = new Plane();
    this.isDegenerateIntoSegment = false;
    this.isDegenerateIntoPoint = false;
    this.degenerateSegment = new Line3();
    this.needsUpdate = true;
  }
  intersectsSphere(sphere) {
    return sphereIntersectTriangle(sphere, this);
  }
  update() {
    const a2 = this.a;
    const b = this.b;
    const c2 = this.c;
    const points = this.points;
    const satAxes = this.satAxes;
    const satBounds = this.satBounds;
    const axis0 = satAxes[0];
    const sab0 = satBounds[0];
    this.getNormal(axis0);
    sab0.setFromPoints(axis0, points);
    const axis1 = satAxes[1];
    const sab1 = satBounds[1];
    axis1.subVectors(a2, b);
    sab1.setFromPoints(axis1, points);
    const axis2 = satAxes[2];
    const sab2 = satBounds[2];
    axis2.subVectors(b, c2);
    sab2.setFromPoints(axis2, points);
    const axis3 = satAxes[3];
    const sab3 = satBounds[3];
    axis3.subVectors(c2, a2);
    sab3.setFromPoints(axis3, points);
    const lengthAB = axis1.length();
    const lengthBC = axis2.length();
    const lengthCA = axis3.length();
    this.isDegenerateIntoPoint = false;
    this.isDegenerateIntoSegment = false;
    if (lengthAB < ZERO_EPSILON) {
      if (lengthBC < ZERO_EPSILON || lengthCA < ZERO_EPSILON) {
        this.isDegenerateIntoPoint = true;
      } else {
        this.isDegenerateIntoSegment = true;
        this.degenerateSegment.start.copy(a2);
        this.degenerateSegment.end.copy(c2);
      }
    } else if (lengthBC < ZERO_EPSILON) {
      if (lengthCA < ZERO_EPSILON) {
        this.isDegenerateIntoPoint = true;
      } else {
        this.isDegenerateIntoSegment = true;
        this.degenerateSegment.start.copy(b);
        this.degenerateSegment.end.copy(a2);
      }
    } else if (lengthCA < ZERO_EPSILON) {
      this.isDegenerateIntoSegment = true;
      this.degenerateSegment.start.copy(c2);
      this.degenerateSegment.end.copy(b);
    }
    this.plane.setFromNormalAndCoplanarPoint(axis0, a2);
    this.needsUpdate = false;
  }
}
ExtendedTriangle.prototype.closestPointToSegment = /* @__PURE__ */ (function() {
  const point1 = /* @__PURE__ */ new Vector3();
  const point2 = /* @__PURE__ */ new Vector3();
  const edge = /* @__PURE__ */ new Line3();
  return function distanceToSegment(segment, target1 = null, target2 = null) {
    const { start, end } = segment;
    const points = this.points;
    let distSq;
    let closestDistanceSq = Infinity;
    for (let i2 = 0; i2 < 3; i2++) {
      const nexti = (i2 + 1) % 3;
      edge.start.copy(points[i2]);
      edge.end.copy(points[nexti]);
      closestPointsSegmentToSegment(edge, segment, point1, point2);
      distSq = point1.distanceToSquared(point2);
      if (distSq < closestDistanceSq) {
        closestDistanceSq = distSq;
        if (target1) target1.copy(point1);
        if (target2) target2.copy(point2);
      }
    }
    this.closestPointToPoint(start, point1);
    distSq = start.distanceToSquared(point1);
    if (distSq < closestDistanceSq) {
      closestDistanceSq = distSq;
      if (target1) target1.copy(point1);
      if (target2) target2.copy(start);
    }
    this.closestPointToPoint(end, point1);
    distSq = end.distanceToSquared(point1);
    if (distSq < closestDistanceSq) {
      closestDistanceSq = distSq;
      if (target1) target1.copy(point1);
      if (target2) target2.copy(end);
    }
    return Math.sqrt(closestDistanceSq);
  };
})();
ExtendedTriangle.prototype.intersectsTriangle = /* @__PURE__ */ (function() {
  const saTri2 = /* @__PURE__ */ new ExtendedTriangle();
  const cachedSatBounds = /* @__PURE__ */ new SeparatingAxisBounds();
  const cachedSatBounds2 = /* @__PURE__ */ new SeparatingAxisBounds();
  const tmpVec = /* @__PURE__ */ new Vector3();
  const dir1 = /* @__PURE__ */ new Vector3();
  const dir2 = /* @__PURE__ */ new Vector3();
  const tempDir = /* @__PURE__ */ new Vector3();
  const edge1 = /* @__PURE__ */ new Line3();
  const edge2 = /* @__PURE__ */ new Line3();
  const tempPoint = /* @__PURE__ */ new Vector3();
  const bounds1 = /* @__PURE__ */ new Vector2();
  const bounds2 = /* @__PURE__ */ new Vector2();
  function coplanarIntersectsTriangle(self, other, target, suppressLog) {
    const planeNormal = tmpVec;
    if (!self.isDegenerateIntoPoint && !self.isDegenerateIntoSegment) {
      planeNormal.copy(self.plane.normal);
    } else {
      planeNormal.copy(other.plane.normal);
    }
    const satBounds1 = self.satBounds;
    const satAxes1 = self.satAxes;
    for (let i2 = 1; i2 < 4; i2++) {
      const sb = satBounds1[i2];
      const sa = satAxes1[i2];
      cachedSatBounds.setFromPoints(sa, other.points);
      if (sb.isSeparated(cachedSatBounds)) return false;
      tempDir.copy(planeNormal).cross(sa);
      cachedSatBounds.setFromPoints(tempDir, self.points);
      cachedSatBounds2.setFromPoints(tempDir, other.points);
      if (cachedSatBounds.isSeparated(cachedSatBounds2)) return false;
    }
    const satBounds2 = other.satBounds;
    const satAxes2 = other.satAxes;
    for (let i2 = 1; i2 < 4; i2++) {
      const sb = satBounds2[i2];
      const sa = satAxes2[i2];
      cachedSatBounds.setFromPoints(sa, self.points);
      if (sb.isSeparated(cachedSatBounds)) return false;
      tempDir.crossVectors(planeNormal, sa);
      cachedSatBounds.setFromPoints(tempDir, self.points);
      cachedSatBounds2.setFromPoints(tempDir, other.points);
      if (cachedSatBounds.isSeparated(cachedSatBounds2)) return false;
    }
    if (target) {
      if (!suppressLog) {
        console.warn("ExtendedTriangle.intersectsTriangle: Triangles are coplanar which does not support an output edge. Setting edge to 0, 0, 0.");
      }
      target.start.set(0, 0, 0);
      target.end.set(0, 0, 0);
    }
    return true;
  }
  function findSingleBounds(a2, b, c2, aProj, bProj, cProj, aDist, bDist, cDist, bounds, edge) {
    let t2 = aDist / (aDist - bDist);
    bounds.x = aProj + (bProj - aProj) * t2;
    edge.start.subVectors(b, a2).multiplyScalar(t2).add(a2);
    t2 = aDist / (aDist - cDist);
    bounds.y = aProj + (cProj - aProj) * t2;
    edge.end.subVectors(c2, a2).multiplyScalar(t2).add(a2);
  }
  function findIntersectionLineBounds(self, aProj, bProj, cProj, abDist, acDist, aDist, bDist, cDist, bounds, edge) {
    if (abDist > 0) {
      findSingleBounds(self.c, self.a, self.b, cProj, aProj, bProj, cDist, aDist, bDist, bounds, edge);
    } else if (acDist > 0) {
      findSingleBounds(self.b, self.a, self.c, bProj, aProj, cProj, bDist, aDist, cDist, bounds, edge);
    } else if (bDist * cDist > 0 || aDist != 0) {
      findSingleBounds(self.a, self.b, self.c, aProj, bProj, cProj, aDist, bDist, cDist, bounds, edge);
    } else if (bDist != 0) {
      findSingleBounds(self.b, self.a, self.c, bProj, aProj, cProj, bDist, aDist, cDist, bounds, edge);
    } else if (cDist != 0) {
      findSingleBounds(self.c, self.a, self.b, cProj, aProj, bProj, cDist, aDist, bDist, bounds, edge);
    } else {
      return true;
    }
    return false;
  }
  function intersectTriangleSegment(triangle3, degenerateTriangle, target, suppressLog) {
    const segment = degenerateTriangle.degenerateSegment;
    const startDist = triangle3.plane.distanceToPoint(segment.start);
    const endDist = triangle3.plane.distanceToPoint(segment.end);
    if (isNearZero(startDist)) {
      if (isNearZero(endDist)) {
        return coplanarIntersectsTriangle(triangle3, degenerateTriangle, target, suppressLog);
      } else {
        if (target) {
          target.start.copy(segment.start);
          target.end.copy(segment.start);
        }
        return triangle3.containsPoint(segment.start);
      }
    } else if (isNearZero(endDist)) {
      if (target) {
        target.start.copy(segment.end);
        target.end.copy(segment.end);
      }
      return triangle3.containsPoint(segment.end);
    } else {
      if (triangle3.plane.intersectLine(segment, tmpVec) != null) {
        if (target) {
          target.start.copy(tmpVec);
          target.end.copy(tmpVec);
        }
        return triangle3.containsPoint(tmpVec);
      } else {
        return false;
      }
    }
  }
  function intersectTrianglePoint(triangle3, degenerateTriangle, target) {
    const point = degenerateTriangle.a;
    if (isNearZero(triangle3.plane.distanceToPoint(point)) && triangle3.containsPoint(point)) {
      if (target) {
        target.start.copy(point);
        target.end.copy(point);
      }
      return true;
    } else {
      return false;
    }
  }
  function intersectSegmentPoint(segmentTri, pointTri, target) {
    const segment = segmentTri.degenerateSegment;
    const point = pointTri.a;
    segment.closestPointToPoint(point, true, tmpVec);
    if (point.distanceToSquared(tmpVec) < ZERO_EPSILON_SQR) {
      if (target) {
        target.start.copy(point);
        target.end.copy(point);
      }
      return true;
    } else {
      return false;
    }
  }
  function handleDegenerateCases(self, other, target, suppressLog) {
    if (self.isDegenerateIntoSegment) {
      if (other.isDegenerateIntoSegment) {
        const segment1 = self.degenerateSegment;
        const segment2 = other.degenerateSegment;
        const delta1 = dir1;
        const delta2 = dir2;
        segment1.delta(delta1);
        segment2.delta(delta2);
        const startDelta = tmpVec.subVectors(segment2.start, segment1.start);
        const denom = delta1.x * delta2.y - delta1.y * delta2.x;
        if (isNearZero(denom)) {
          return false;
        }
        const t2 = (startDelta.x * delta2.y - startDelta.y * delta2.x) / denom;
        const u2 = -(delta1.x * startDelta.y - delta1.y * startDelta.x) / denom;
        if (t2 < 0 || t2 > 1 || u2 < 0 || u2 > 1) {
          return false;
        }
        const z1 = segment1.start.z + delta1.z * t2;
        const z2 = segment2.start.z + delta2.z * u2;
        if (isNearZero(z1 - z2)) {
          if (target) {
            target.start.copy(segment1.start).addScaledVector(delta1, t2);
            target.end.copy(segment1.start).addScaledVector(delta1, t2);
          }
          return true;
        } else {
          return false;
        }
      } else if (other.isDegenerateIntoPoint) {
        return intersectSegmentPoint(self, other, target);
      } else {
        return intersectTriangleSegment(other, self, target, suppressLog);
      }
    } else if (self.isDegenerateIntoPoint) {
      if (other.isDegenerateIntoPoint) {
        if (other.a.distanceToSquared(self.a) < ZERO_EPSILON_SQR) {
          if (target) {
            target.start.copy(self.a);
            target.end.copy(self.a);
          }
          return true;
        } else {
          return false;
        }
      } else if (other.isDegenerateIntoSegment) {
        return intersectSegmentPoint(other, self, target);
      } else {
        return intersectTrianglePoint(other, self, target);
      }
    } else {
      if (other.isDegenerateIntoPoint) {
        return intersectTrianglePoint(self, other, target);
      } else if (other.isDegenerateIntoSegment) {
        return intersectTriangleSegment(self, other, target, suppressLog);
      }
    }
  }
  return function intersectsTriangle(other, target = null, suppressLog = false) {
    if (this.needsUpdate) {
      this.update();
    }
    if (!other.isExtendedTriangle) {
      saTri2.copy(other);
      saTri2.update();
      other = saTri2;
    } else if (other.needsUpdate) {
      other.update();
    }
    const res = handleDegenerateCases(this, other, target, suppressLog);
    if (res !== void 0) {
      return res;
    }
    const plane1 = this.plane;
    const plane2 = other.plane;
    let a1Dist = plane2.distanceToPoint(this.a);
    let b1Dist = plane2.distanceToPoint(this.b);
    let c1Dist = plane2.distanceToPoint(this.c);
    if (isNearZero(a1Dist))
      a1Dist = 0;
    if (isNearZero(b1Dist))
      b1Dist = 0;
    if (isNearZero(c1Dist))
      c1Dist = 0;
    const a1b1Dist = a1Dist * b1Dist;
    const a1c1Dist = a1Dist * c1Dist;
    if (a1b1Dist > 0 && a1c1Dist > 0) {
      return false;
    }
    let a2Dist = plane1.distanceToPoint(other.a);
    let b2Dist = plane1.distanceToPoint(other.b);
    let c2Dist = plane1.distanceToPoint(other.c);
    if (isNearZero(a2Dist))
      a2Dist = 0;
    if (isNearZero(b2Dist))
      b2Dist = 0;
    if (isNearZero(c2Dist))
      c2Dist = 0;
    const a2b2Dist = a2Dist * b2Dist;
    const a2c2Dist = a2Dist * c2Dist;
    if (a2b2Dist > 0 && a2c2Dist > 0) {
      return false;
    }
    dir1.copy(plane1.normal);
    dir2.copy(plane2.normal);
    const intersectionLine = dir1.cross(dir2);
    let componentIndex = 0;
    let maxComponent = Math.abs(intersectionLine.x);
    const comp1 = Math.abs(intersectionLine.y);
    if (comp1 > maxComponent) {
      maxComponent = comp1;
      componentIndex = 1;
    }
    const comp2 = Math.abs(intersectionLine.z);
    if (comp2 > maxComponent) {
      componentIndex = 2;
    }
    const key = componentKeys[componentIndex];
    const a1Proj = this.a[key];
    const b1Proj = this.b[key];
    const c1Proj = this.c[key];
    const a2Proj = other.a[key];
    const b2Proj = other.b[key];
    const c2Proj = other.c[key];
    if (findIntersectionLineBounds(this, a1Proj, b1Proj, c1Proj, a1b1Dist, a1c1Dist, a1Dist, b1Dist, c1Dist, bounds1, edge1)) {
      return coplanarIntersectsTriangle(this, other, target, suppressLog);
    }
    if (findIntersectionLineBounds(other, a2Proj, b2Proj, c2Proj, a2b2Dist, a2c2Dist, a2Dist, b2Dist, c2Dist, bounds2, edge2)) {
      return coplanarIntersectsTriangle(this, other, target, suppressLog);
    }
    if (bounds1.y < bounds1.x) {
      const tmp = bounds1.y;
      bounds1.y = bounds1.x;
      bounds1.x = tmp;
      tempPoint.copy(edge1.start);
      edge1.start.copy(edge1.end);
      edge1.end.copy(tempPoint);
    }
    if (bounds2.y < bounds2.x) {
      const tmp = bounds2.y;
      bounds2.y = bounds2.x;
      bounds2.x = tmp;
      tempPoint.copy(edge2.start);
      edge2.start.copy(edge2.end);
      edge2.end.copy(tempPoint);
    }
    if (bounds1.y < bounds2.x || bounds2.y < bounds1.x) {
      return false;
    }
    if (target) {
      if (bounds2.x > bounds1.x) {
        target.start.copy(edge2.start);
      } else {
        target.start.copy(edge1.start);
      }
      if (bounds2.y < bounds1.y) {
        target.end.copy(edge2.end);
      } else {
        target.end.copy(edge1.end);
      }
    }
    return true;
  };
})();
ExtendedTriangle.prototype.distanceToPoint = /* @__PURE__ */ (function() {
  const target = /* @__PURE__ */ new Vector3();
  return function distanceToPoint(point) {
    this.closestPointToPoint(point, target);
    return point.distanceTo(target);
  };
})();
ExtendedTriangle.prototype.distanceToTriangle = /* @__PURE__ */ (function() {
  const point = /* @__PURE__ */ new Vector3();
  const point2 = /* @__PURE__ */ new Vector3();
  const cornerFields = ["a", "b", "c"];
  const line1 = /* @__PURE__ */ new Line3();
  const line2 = /* @__PURE__ */ new Line3();
  return function distanceToTriangle(other, target1 = null, target2 = null) {
    const lineTarget = target1 || target2 ? line1 : null;
    if (this.intersectsTriangle(other, lineTarget)) {
      if (target1 || target2) {
        if (target1) lineTarget.getCenter(target1);
        if (target2) lineTarget.getCenter(target2);
      }
      return 0;
    }
    let closestDistanceSq = Infinity;
    for (let i2 = 0; i2 < 3; i2++) {
      let dist;
      const field = cornerFields[i2];
      const otherVec = other[field];
      this.closestPointToPoint(otherVec, point);
      dist = otherVec.distanceToSquared(point);
      if (dist < closestDistanceSq) {
        closestDistanceSq = dist;
        if (target1) target1.copy(point);
        if (target2) target2.copy(otherVec);
      }
      const thisVec = this[field];
      other.closestPointToPoint(thisVec, point);
      dist = thisVec.distanceToSquared(point);
      if (dist < closestDistanceSq) {
        closestDistanceSq = dist;
        if (target1) target1.copy(thisVec);
        if (target2) target2.copy(point);
      }
    }
    for (let i2 = 0; i2 < 3; i2++) {
      const f11 = cornerFields[i2];
      const f12 = cornerFields[(i2 + 1) % 3];
      line1.set(this[f11], this[f12]);
      for (let i22 = 0; i22 < 3; i22++) {
        const f21 = cornerFields[i22];
        const f22 = cornerFields[(i22 + 1) % 3];
        line2.set(other[f21], other[f22]);
        closestPointsSegmentToSegment(line1, line2, point, point2);
        const dist = point.distanceToSquared(point2);
        if (dist < closestDistanceSq) {
          closestDistanceSq = dist;
          if (target1) target1.copy(point);
          if (target2) target2.copy(point2);
        }
      }
    }
    return Math.sqrt(closestDistanceSq);
  };
})();
class OrientedBox {
  constructor(min, max, matrix) {
    this.isOrientedBox = true;
    this.min = new Vector3();
    this.max = new Vector3();
    this.matrix = new Matrix4();
    this.invMatrix = new Matrix4();
    this.points = new Array(8).fill().map(() => new Vector3());
    this.satAxes = new Array(3).fill().map(() => new Vector3());
    this.satBounds = new Array(3).fill().map(() => new SeparatingAxisBounds());
    this.alignedSatBounds = new Array(3).fill().map(() => new SeparatingAxisBounds());
    this.needsUpdate = false;
    if (min) this.min.copy(min);
    if (max) this.max.copy(max);
    if (matrix) this.matrix.copy(matrix);
  }
  set(min, max, matrix) {
    this.min.copy(min);
    this.max.copy(max);
    this.matrix.copy(matrix);
    this.needsUpdate = true;
  }
  copy(other) {
    this.min.copy(other.min);
    this.max.copy(other.max);
    this.matrix.copy(other.matrix);
    this.needsUpdate = true;
  }
}
OrientedBox.prototype.update = /* @__PURE__ */ (function() {
  return function update() {
    const matrix = this.matrix;
    const min = this.min;
    const max = this.max;
    const points = this.points;
    for (let x = 0; x <= 1; x++) {
      for (let y = 0; y <= 1; y++) {
        for (let z = 0; z <= 1; z++) {
          const i2 = (1 << 0) * x | (1 << 1) * y | (1 << 2) * z;
          const v = points[i2];
          v.x = x ? max.x : min.x;
          v.y = y ? max.y : min.y;
          v.z = z ? max.z : min.z;
          v.applyMatrix4(matrix);
        }
      }
    }
    const satBounds = this.satBounds;
    const satAxes = this.satAxes;
    const minVec = points[0];
    for (let i2 = 0; i2 < 3; i2++) {
      const axis = satAxes[i2];
      const sb = satBounds[i2];
      const index = 1 << i2;
      const pi = points[index];
      axis.subVectors(minVec, pi);
      sb.setFromPoints(axis, points);
    }
    const alignedSatBounds = this.alignedSatBounds;
    alignedSatBounds[0].setFromPointsField(points, "x");
    alignedSatBounds[1].setFromPointsField(points, "y");
    alignedSatBounds[2].setFromPointsField(points, "z");
    this.invMatrix.copy(this.matrix).invert();
    this.needsUpdate = false;
  };
})();
OrientedBox.prototype.intersectsBox = /* @__PURE__ */ (function() {
  const aabbBounds = /* @__PURE__ */ new SeparatingAxisBounds();
  return function intersectsBox(box) {
    if (this.needsUpdate) {
      this.update();
    }
    const min = box.min;
    const max = box.max;
    const satBounds = this.satBounds;
    const satAxes = this.satAxes;
    const alignedSatBounds = this.alignedSatBounds;
    aabbBounds.min = min.x;
    aabbBounds.max = max.x;
    if (alignedSatBounds[0].isSeparated(aabbBounds)) return false;
    aabbBounds.min = min.y;
    aabbBounds.max = max.y;
    if (alignedSatBounds[1].isSeparated(aabbBounds)) return false;
    aabbBounds.min = min.z;
    aabbBounds.max = max.z;
    if (alignedSatBounds[2].isSeparated(aabbBounds)) return false;
    for (let i2 = 0; i2 < 3; i2++) {
      const axis = satAxes[i2];
      const sb = satBounds[i2];
      aabbBounds.setFromBox(axis, box);
      if (sb.isSeparated(aabbBounds)) return false;
    }
    return true;
  };
})();
OrientedBox.prototype.intersectsTriangle = /* @__PURE__ */ (function() {
  const saTri = /* @__PURE__ */ new ExtendedTriangle();
  const pointsArr = /* @__PURE__ */ new Array(3);
  const cachedSatBounds = /* @__PURE__ */ new SeparatingAxisBounds();
  const cachedSatBounds2 = /* @__PURE__ */ new SeparatingAxisBounds();
  const cachedAxis = /* @__PURE__ */ new Vector3();
  return function intersectsTriangle(triangle3) {
    if (this.needsUpdate) {
      this.update();
    }
    if (!triangle3.isExtendedTriangle) {
      saTri.copy(triangle3);
      saTri.update();
      triangle3 = saTri;
    } else if (triangle3.needsUpdate) {
      triangle3.update();
    }
    const satBounds = this.satBounds;
    const satAxes = this.satAxes;
    pointsArr[0] = triangle3.a;
    pointsArr[1] = triangle3.b;
    pointsArr[2] = triangle3.c;
    for (let i2 = 0; i2 < 3; i2++) {
      const sb = satBounds[i2];
      const sa = satAxes[i2];
      cachedSatBounds.setFromPoints(sa, pointsArr);
      if (sb.isSeparated(cachedSatBounds)) return false;
    }
    const triSatBounds = triangle3.satBounds;
    const triSatAxes = triangle3.satAxes;
    const points = this.points;
    for (let i2 = 0; i2 < 3; i2++) {
      const sb = triSatBounds[i2];
      const sa = triSatAxes[i2];
      cachedSatBounds.setFromPoints(sa, points);
      if (sb.isSeparated(cachedSatBounds)) return false;
    }
    for (let i2 = 0; i2 < 3; i2++) {
      const sa1 = satAxes[i2];
      for (let i22 = 0; i22 < 4; i22++) {
        const sa2 = triSatAxes[i22];
        cachedAxis.crossVectors(sa1, sa2);
        cachedSatBounds.setFromPoints(cachedAxis, pointsArr);
        cachedSatBounds2.setFromPoints(cachedAxis, points);
        if (cachedSatBounds.isSeparated(cachedSatBounds2)) return false;
      }
    }
    return true;
  };
})();
OrientedBox.prototype.closestPointToPoint = /* @__PURE__ */ (function() {
  return function closestPointToPoint2(point, target1) {
    if (this.needsUpdate) {
      this.update();
    }
    target1.copy(point).applyMatrix4(this.invMatrix).clamp(this.min, this.max).applyMatrix4(this.matrix);
    return target1;
  };
})();
OrientedBox.prototype.distanceToPoint = (function() {
  const target = new Vector3();
  return function distanceToPoint(point) {
    this.closestPointToPoint(point, target);
    return point.distanceTo(target);
  };
})();
OrientedBox.prototype.distanceToBox = /* @__PURE__ */ (function() {
  const xyzFields = ["x", "y", "z"];
  const segments1 = /* @__PURE__ */ new Array(12).fill().map(() => new Line3());
  const segments2 = /* @__PURE__ */ new Array(12).fill().map(() => new Line3());
  const point1 = /* @__PURE__ */ new Vector3();
  const point2 = /* @__PURE__ */ new Vector3();
  return function distanceToBox(box, threshold = 0, target1 = null, target2 = null) {
    if (this.needsUpdate) {
      this.update();
    }
    if (this.intersectsBox(box)) {
      if (target1 || target2) {
        box.getCenter(point2);
        this.closestPointToPoint(point2, point1);
        box.closestPointToPoint(point1, point2);
        if (target1) target1.copy(point1);
        if (target2) target2.copy(point2);
      }
      return 0;
    }
    const threshold2 = threshold * threshold;
    const min = box.min;
    const max = box.max;
    const points = this.points;
    let closestDistanceSq = Infinity;
    for (let i2 = 0; i2 < 8; i2++) {
      const p2 = points[i2];
      point2.copy(p2).clamp(min, max);
      const dist = p2.distanceToSquared(point2);
      if (dist < closestDistanceSq) {
        closestDistanceSq = dist;
        if (target1) target1.copy(p2);
        if (target2) target2.copy(point2);
        if (dist < threshold2) return Math.sqrt(dist);
      }
    }
    let count = 0;
    for (let i2 = 0; i2 < 3; i2++) {
      for (let i1 = 0; i1 <= 1; i1++) {
        for (let i22 = 0; i22 <= 1; i22++) {
          const nextIndex = (i2 + 1) % 3;
          const nextIndex2 = (i2 + 2) % 3;
          const index = i1 << nextIndex | i22 << nextIndex2;
          const index2 = 1 << i2 | i1 << nextIndex | i22 << nextIndex2;
          const p1 = points[index];
          const p2 = points[index2];
          const line1 = segments1[count];
          line1.set(p1, p2);
          const f1 = xyzFields[i2];
          const f2 = xyzFields[nextIndex];
          const f3 = xyzFields[nextIndex2];
          const line2 = segments2[count];
          const start = line2.start;
          const end = line2.end;
          start[f1] = min[f1];
          start[f2] = i1 ? min[f2] : max[f2];
          start[f3] = i22 ? min[f3] : max[f2];
          end[f1] = max[f1];
          end[f2] = i1 ? min[f2] : max[f2];
          end[f3] = i22 ? min[f3] : max[f2];
          count++;
        }
      }
    }
    for (let x = 0; x <= 1; x++) {
      for (let y = 0; y <= 1; y++) {
        for (let z = 0; z <= 1; z++) {
          point2.x = x ? max.x : min.x;
          point2.y = y ? max.y : min.y;
          point2.z = z ? max.z : min.z;
          this.closestPointToPoint(point2, point1);
          const dist = point2.distanceToSquared(point1);
          if (dist < closestDistanceSq) {
            closestDistanceSq = dist;
            if (target1) target1.copy(point1);
            if (target2) target2.copy(point2);
            if (dist < threshold2) return Math.sqrt(dist);
          }
        }
      }
    }
    for (let i2 = 0; i2 < 12; i2++) {
      const l1 = segments1[i2];
      for (let i22 = 0; i22 < 12; i22++) {
        const l2 = segments2[i22];
        closestPointsSegmentToSegment(l1, l2, point1, point2);
        const dist = point1.distanceToSquared(point2);
        if (dist < closestDistanceSq) {
          closestDistanceSq = dist;
          if (target1) target1.copy(point1);
          if (target2) target2.copy(point2);
          if (dist < threshold2) return Math.sqrt(dist);
        }
      }
    }
    return Math.sqrt(closestDistanceSq);
  };
})();
class ExtendedTrianglePoolBase extends PrimitivePool {
  constructor() {
    super(() => new ExtendedTriangle());
  }
}
const ExtendedTrianglePool = /* @__PURE__ */ new ExtendedTrianglePoolBase();
const temp = /* @__PURE__ */ new Vector3();
const temp1$2 = /* @__PURE__ */ new Vector3();
function closestPointToPoint(bvh, point, target = {}, minThreshold = 0, maxThreshold = Infinity) {
  const minThresholdSq = minThreshold * minThreshold;
  const maxThresholdSq = maxThreshold * maxThreshold;
  let closestDistanceSq = Infinity;
  let closestDistanceTriIndex = null;
  bvh.shapecast(
    {
      boundsTraverseOrder: (box) => {
        temp.copy(point).clamp(box.min, box.max);
        return temp.distanceToSquared(point);
      },
      intersectsBounds: (box, isLeaf, score) => {
        return score < closestDistanceSq && score < maxThresholdSq;
      },
      intersectsTriangle: (tri, triIndex) => {
        tri.closestPointToPoint(point, temp);
        const distSq = point.distanceToSquared(temp);
        if (distSq < closestDistanceSq) {
          temp1$2.copy(temp);
          closestDistanceSq = distSq;
          closestDistanceTriIndex = triIndex;
        }
        if (distSq < minThresholdSq) {
          return true;
        } else {
          return false;
        }
      }
    }
  );
  if (closestDistanceSq === Infinity) return null;
  const closestDistance = Math.sqrt(closestDistanceSq);
  if (!target.point) target.point = temp1$2.clone();
  else target.point.copy(temp1$2);
  target.distance = closestDistance, target.faceIndex = closestDistanceTriIndex;
  return target;
}
const IS_GT_REVISION_169 = parseInt(REVISION) >= 169;
const IS_LT_REVISION_161 = parseInt(REVISION) <= 161;
const _vA = /* @__PURE__ */ new Vector3();
const _vB = /* @__PURE__ */ new Vector3();
const _vC = /* @__PURE__ */ new Vector3();
const _uvA = /* @__PURE__ */ new Vector2();
const _uvB = /* @__PURE__ */ new Vector2();
const _uvC = /* @__PURE__ */ new Vector2();
const _normalA = /* @__PURE__ */ new Vector3();
const _normalB = /* @__PURE__ */ new Vector3();
const _normalC = /* @__PURE__ */ new Vector3();
const _intersectionPoint = /* @__PURE__ */ new Vector3();
function checkIntersection(ray, pA, pB, pC, point, side, near, far) {
  let intersect;
  if (side === BackSide) {
    intersect = ray.intersectTriangle(pC, pB, pA, true, point);
  } else {
    intersect = ray.intersectTriangle(pA, pB, pC, side !== DoubleSide, point);
  }
  if (intersect === null) return null;
  const distance = ray.origin.distanceTo(point);
  if (distance < near || distance > far) return null;
  return {
    distance,
    point: point.clone()
  };
}
function checkBufferGeometryIntersection(ray, position, normal, uv, uv1, a2, b, c2, side, near, far) {
  _vA.fromBufferAttribute(position, a2);
  _vB.fromBufferAttribute(position, b);
  _vC.fromBufferAttribute(position, c2);
  const intersection = checkIntersection(ray, _vA, _vB, _vC, _intersectionPoint, side, near, far);
  if (intersection) {
    if (uv) {
      _uvA.fromBufferAttribute(uv, a2);
      _uvB.fromBufferAttribute(uv, b);
      _uvC.fromBufferAttribute(uv, c2);
      intersection.uv = new Vector2();
      const res = Triangle.getInterpolation(_intersectionPoint, _vA, _vB, _vC, _uvA, _uvB, _uvC, intersection.uv);
      if (!IS_GT_REVISION_169) {
        intersection.uv = res;
      }
    }
    if (uv1) {
      _uvA.fromBufferAttribute(uv1, a2);
      _uvB.fromBufferAttribute(uv1, b);
      _uvC.fromBufferAttribute(uv1, c2);
      intersection.uv1 = new Vector2();
      const res = Triangle.getInterpolation(_intersectionPoint, _vA, _vB, _vC, _uvA, _uvB, _uvC, intersection.uv1);
      if (!IS_GT_REVISION_169) {
        intersection.uv1 = res;
      }
      if (IS_LT_REVISION_161) {
        intersection.uv2 = intersection.uv1;
      }
    }
    if (normal) {
      _normalA.fromBufferAttribute(normal, a2);
      _normalB.fromBufferAttribute(normal, b);
      _normalC.fromBufferAttribute(normal, c2);
      intersection.normal = new Vector3();
      const res = Triangle.getInterpolation(_intersectionPoint, _vA, _vB, _vC, _normalA, _normalB, _normalC, intersection.normal);
      if (intersection.normal.dot(ray.direction) > 0) {
        intersection.normal.multiplyScalar(-1);
      }
      if (!IS_GT_REVISION_169) {
        intersection.normal = res;
      }
    }
    const face = {
      a: a2,
      b,
      c: c2,
      normal: new Vector3(),
      materialIndex: 0
    };
    Triangle.getNormal(_vA, _vB, _vC, face.normal);
    intersection.face = face;
    intersection.faceIndex = a2;
    if (IS_GT_REVISION_169) {
      const barycoord = new Vector3();
      Triangle.getBarycoord(_intersectionPoint, _vA, _vB, _vC, barycoord);
      intersection.barycoord = barycoord;
    }
  }
  return intersection;
}
function getSide(materialOrSide) {
  return materialOrSide && materialOrSide.isMaterial ? materialOrSide.side : materialOrSide;
}
function intersectTri(geometry, materialOrSide, ray, tri, intersections, near, far) {
  const triOffset = tri * 3;
  let a2 = triOffset + 0;
  let b = triOffset + 1;
  let c2 = triOffset + 2;
  const { index, groups } = geometry;
  if (geometry.index) {
    a2 = index.getX(a2);
    b = index.getX(b);
    c2 = index.getX(c2);
  }
  const { position, normal, uv, uv1 } = geometry.attributes;
  if (Array.isArray(materialOrSide)) {
    const firstIndex = tri * 3;
    for (let i2 = 0, l2 = groups.length; i2 < l2; i2++) {
      const { start, count, materialIndex } = groups[i2];
      if (firstIndex >= start && firstIndex < start + count) {
        const side = getSide(materialOrSide[materialIndex]);
        const intersection = checkBufferGeometryIntersection(ray, position, normal, uv, uv1, a2, b, c2, side, near, far);
        if (intersection) {
          intersection.faceIndex = tri;
          intersection.face.materialIndex = materialIndex;
          if (intersections) {
            intersections.push(intersection);
          } else {
            return intersection;
          }
        }
      }
    }
  } else {
    const side = getSide(materialOrSide);
    const intersection = checkBufferGeometryIntersection(ray, position, normal, uv, uv1, a2, b, c2, side, near, far);
    if (intersection) {
      intersection.faceIndex = tri;
      intersection.face.materialIndex = 0;
      if (intersections) {
        intersections.push(intersection);
      } else {
        return intersection;
      }
    }
  }
  return null;
}
function setTriangle(tri, i2, index, pos) {
  const ta = tri.a;
  const tb = tri.b;
  const tc = tri.c;
  let i0 = i2;
  let i1 = i2 + 1;
  let i22 = i2 + 2;
  if (index) {
    i0 = index.getX(i0);
    i1 = index.getX(i1);
    i22 = index.getX(i22);
  }
  ta.x = pos.getX(i0);
  ta.y = pos.getY(i0);
  ta.z = pos.getZ(i0);
  tb.x = pos.getX(i1);
  tb.y = pos.getY(i1);
  tb.z = pos.getZ(i1);
  tc.x = pos.getX(i22);
  tc.y = pos.getY(i22);
  tc.z = pos.getZ(i22);
}
function intersectTris(bvh, materialOrSide, ray, offset, count, intersections, near, far) {
  const { geometry, _indirectBuffer } = bvh;
  for (let i2 = offset, end = offset + count; i2 < end; i2++) {
    intersectTri(geometry, materialOrSide, ray, i2, intersections, near, far);
  }
}
function intersectClosestTri(bvh, materialOrSide, ray, offset, count, near, far) {
  const { geometry, _indirectBuffer } = bvh;
  let dist = Infinity;
  let res = null;
  for (let i2 = offset, end = offset + count; i2 < end; i2++) {
    let intersection;
    intersection = intersectTri(geometry, materialOrSide, ray, i2, null, near, far);
    if (intersection && intersection.distance < dist) {
      res = intersection;
      dist = intersection.distance;
    }
  }
  return res;
}
function iterateOverTriangles(offset, count, bvh, intersectsTriangleFunc, contained, depth, triangle3) {
  const { geometry } = bvh;
  const { index } = geometry;
  const pos = geometry.attributes.position;
  for (let i2 = offset, l2 = count + offset; i2 < l2; i2++) {
    let tri;
    tri = i2;
    setTriangle(triangle3, tri * 3, index, pos);
    triangle3.needsUpdate = true;
    if (intersectsTriangleFunc(triangle3, tri, contained, depth)) {
      return true;
    }
  }
  return false;
}
function refit(bvh, nodeIndices = null) {
  if (nodeIndices && Array.isArray(nodeIndices)) {
    nodeIndices = new Set(nodeIndices);
  }
  const geometry = bvh.geometry;
  const indexArr = geometry.index ? geometry.index.array : null;
  const posAttr = geometry.attributes.position;
  let buffer, uint32Array2, uint16Array2, float32Array2;
  let byteOffset = 0;
  const roots = bvh._roots;
  for (let i2 = 0, l2 = roots.length; i2 < l2; i2++) {
    buffer = roots[i2];
    uint32Array2 = new Uint32Array(buffer);
    uint16Array2 = new Uint16Array(buffer);
    float32Array2 = new Float32Array(buffer);
    _traverse2(0, byteOffset);
    byteOffset += buffer.byteLength;
  }
  function _traverse2(nodeIndex32, byteOffset2, force = false) {
    const nodeIndex16 = nodeIndex32 * 2;
    if (IS_LEAF(nodeIndex16, uint16Array2)) {
      const offset = OFFSET(nodeIndex32, uint32Array2);
      const count = COUNT(nodeIndex16, uint16Array2);
      let minx = Infinity;
      let miny = Infinity;
      let minz = Infinity;
      let maxx = -Infinity;
      let maxy = -Infinity;
      let maxz = -Infinity;
      for (let i2 = 3 * offset, l2 = 3 * (offset + count); i2 < l2; i2++) {
        let index = indexArr[i2];
        const x = posAttr.getX(index);
        const y = posAttr.getY(index);
        const z = posAttr.getZ(index);
        if (x < minx) minx = x;
        if (x > maxx) maxx = x;
        if (y < miny) miny = y;
        if (y > maxy) maxy = y;
        if (z < minz) minz = z;
        if (z > maxz) maxz = z;
      }
      if (float32Array2[nodeIndex32 + 0] !== minx || float32Array2[nodeIndex32 + 1] !== miny || float32Array2[nodeIndex32 + 2] !== minz || float32Array2[nodeIndex32 + 3] !== maxx || float32Array2[nodeIndex32 + 4] !== maxy || float32Array2[nodeIndex32 + 5] !== maxz) {
        float32Array2[nodeIndex32 + 0] = minx;
        float32Array2[nodeIndex32 + 1] = miny;
        float32Array2[nodeIndex32 + 2] = minz;
        float32Array2[nodeIndex32 + 3] = maxx;
        float32Array2[nodeIndex32 + 4] = maxy;
        float32Array2[nodeIndex32 + 5] = maxz;
        return true;
      } else {
        return false;
      }
    } else {
      const left = LEFT_NODE(nodeIndex32);
      const right = RIGHT_NODE(nodeIndex32, uint32Array2);
      let forceChildren = force;
      let includesLeft = false;
      let includesRight = false;
      if (nodeIndices) {
        if (!forceChildren) {
          const leftNodeId = left / UINT32_PER_NODE + byteOffset2 / BYTES_PER_NODE;
          const rightNodeId = right / UINT32_PER_NODE + byteOffset2 / BYTES_PER_NODE;
          includesLeft = nodeIndices.has(leftNodeId);
          includesRight = nodeIndices.has(rightNodeId);
          forceChildren = !includesLeft && !includesRight;
        }
      } else {
        includesLeft = true;
        includesRight = true;
      }
      const traverseLeft = forceChildren || includesLeft;
      const traverseRight = forceChildren || includesRight;
      let leftChange = false;
      if (traverseLeft) {
        leftChange = _traverse2(left, byteOffset2, forceChildren);
      }
      let rightChange = false;
      if (traverseRight) {
        rightChange = _traverse2(right, byteOffset2, forceChildren);
      }
      const didChange = leftChange || rightChange;
      if (didChange) {
        for (let i2 = 0; i2 < 3; i2++) {
          const left_i = left + i2;
          const right_i = right + i2;
          const minLeftValue = float32Array2[left_i];
          const maxLeftValue = float32Array2[left_i + 3];
          const minRightValue = float32Array2[right_i];
          const maxRightValue = float32Array2[right_i + 3];
          float32Array2[nodeIndex32 + i2] = minLeftValue < minRightValue ? minLeftValue : minRightValue;
          float32Array2[nodeIndex32 + i2 + 3] = maxLeftValue > maxRightValue ? maxLeftValue : maxRightValue;
        }
      }
      return didChange;
    }
  }
}
function intersectRay(nodeIndex32, array, ray, near, far) {
  let tmin, tmax, tymin, tymax, tzmin, tzmax;
  const invdirx = 1 / ray.direction.x, invdiry = 1 / ray.direction.y, invdirz = 1 / ray.direction.z;
  const ox = ray.origin.x;
  const oy = ray.origin.y;
  const oz = ray.origin.z;
  let minx = array[nodeIndex32];
  let maxx = array[nodeIndex32 + 3];
  let miny = array[nodeIndex32 + 1];
  let maxy = array[nodeIndex32 + 3 + 1];
  let minz = array[nodeIndex32 + 2];
  let maxz = array[nodeIndex32 + 3 + 2];
  if (invdirx >= 0) {
    tmin = (minx - ox) * invdirx;
    tmax = (maxx - ox) * invdirx;
  } else {
    tmin = (maxx - ox) * invdirx;
    tmax = (minx - ox) * invdirx;
  }
  if (invdiry >= 0) {
    tymin = (miny - oy) * invdiry;
    tymax = (maxy - oy) * invdiry;
  } else {
    tymin = (maxy - oy) * invdiry;
    tymax = (miny - oy) * invdiry;
  }
  if (tmin > tymax || tymin > tmax) return false;
  if (tymin > tmin || isNaN(tmin)) tmin = tymin;
  if (tymax < tmax || isNaN(tmax)) tmax = tymax;
  if (invdirz >= 0) {
    tzmin = (minz - oz) * invdirz;
    tzmax = (maxz - oz) * invdirz;
  } else {
    tzmin = (maxz - oz) * invdirz;
    tzmax = (minz - oz) * invdirz;
  }
  if (tmin > tzmax || tzmin > tmax) return false;
  if (tzmin > tmin || tmin !== tmin) tmin = tzmin;
  if (tzmax < tmax || tmax !== tmax) tmax = tzmax;
  return tmin <= far && tmax >= near;
}
function intersectTris_indirect(bvh, materialOrSide, ray, offset, count, intersections, near, far) {
  const { geometry, _indirectBuffer } = bvh;
  for (let i2 = offset, end = offset + count; i2 < end; i2++) {
    let vi = _indirectBuffer ? _indirectBuffer[i2] : i2;
    intersectTri(geometry, materialOrSide, ray, vi, intersections, near, far);
  }
}
function intersectClosestTri_indirect(bvh, materialOrSide, ray, offset, count, near, far) {
  const { geometry, _indirectBuffer } = bvh;
  let dist = Infinity;
  let res = null;
  for (let i2 = offset, end = offset + count; i2 < end; i2++) {
    let intersection;
    intersection = intersectTri(geometry, materialOrSide, ray, _indirectBuffer ? _indirectBuffer[i2] : i2, null, near, far);
    if (intersection && intersection.distance < dist) {
      res = intersection;
      dist = intersection.distance;
    }
  }
  return res;
}
function iterateOverTriangles_indirect(offset, count, bvh, intersectsTriangleFunc, contained, depth, triangle3) {
  const { geometry } = bvh;
  const { index } = geometry;
  const pos = geometry.attributes.position;
  for (let i2 = offset, l2 = count + offset; i2 < l2; i2++) {
    let tri;
    tri = bvh.resolveTriangleIndex(i2);
    setTriangle(triangle3, tri * 3, index, pos);
    triangle3.needsUpdate = true;
    if (intersectsTriangleFunc(triangle3, tri, contained, depth)) {
      return true;
    }
  }
  return false;
}
function raycast(bvh, root, materialOrSide, ray, intersects, near, far) {
  BufferStack.setBuffer(bvh._roots[root]);
  _raycast$1(0, bvh, materialOrSide, ray, intersects, near, far);
  BufferStack.clearBuffer();
}
function _raycast$1(nodeIndex32, bvh, materialOrSide, ray, intersects, near, far) {
  const { float32Array: float32Array2, uint16Array: uint16Array2, uint32Array: uint32Array2 } = BufferStack;
  const nodeIndex16 = nodeIndex32 * 2;
  const isLeaf = IS_LEAF(nodeIndex16, uint16Array2);
  if (isLeaf) {
    const offset = OFFSET(nodeIndex32, uint32Array2);
    const count = COUNT(nodeIndex16, uint16Array2);
    intersectTris(bvh, materialOrSide, ray, offset, count, intersects, near, far);
  } else {
    const leftIndex = LEFT_NODE(nodeIndex32);
    if (intersectRay(leftIndex, float32Array2, ray, near, far)) {
      _raycast$1(leftIndex, bvh, materialOrSide, ray, intersects, near, far);
    }
    const rightIndex = RIGHT_NODE(nodeIndex32, uint32Array2);
    if (intersectRay(rightIndex, float32Array2, ray, near, far)) {
      _raycast$1(rightIndex, bvh, materialOrSide, ray, intersects, near, far);
    }
  }
}
const _xyzFields$1 = ["x", "y", "z"];
function raycastFirst(bvh, root, materialOrSide, ray, near, far) {
  BufferStack.setBuffer(bvh._roots[root]);
  const result = _raycastFirst$1(0, bvh, materialOrSide, ray, near, far);
  BufferStack.clearBuffer();
  return result;
}
function _raycastFirst$1(nodeIndex32, bvh, materialOrSide, ray, near, far) {
  const { float32Array: float32Array2, uint16Array: uint16Array2, uint32Array: uint32Array2 } = BufferStack;
  let nodeIndex16 = nodeIndex32 * 2;
  const isLeaf = IS_LEAF(nodeIndex16, uint16Array2);
  if (isLeaf) {
    const offset = OFFSET(nodeIndex32, uint32Array2);
    const count = COUNT(nodeIndex16, uint16Array2);
    return intersectClosestTri(bvh, materialOrSide, ray, offset, count, near, far);
  } else {
    const splitAxis = SPLIT_AXIS(nodeIndex32, uint32Array2);
    const xyzAxis = _xyzFields$1[splitAxis];
    const rayDir = ray.direction[xyzAxis];
    const leftToRight = rayDir >= 0;
    let c1, c2;
    if (leftToRight) {
      c1 = LEFT_NODE(nodeIndex32);
      c2 = RIGHT_NODE(nodeIndex32, uint32Array2);
    } else {
      c1 = RIGHT_NODE(nodeIndex32, uint32Array2);
      c2 = LEFT_NODE(nodeIndex32);
    }
    const c1Intersection = intersectRay(c1, float32Array2, ray, near, far);
    const c1Result = c1Intersection ? _raycastFirst$1(c1, bvh, materialOrSide, ray, near, far) : null;
    if (c1Result) {
      const point = c1Result.point[xyzAxis];
      const isOutside = leftToRight ? point <= float32Array2[c2 + splitAxis] : (
        // min bounding data
        point >= float32Array2[c2 + splitAxis + 3]
      );
      if (isOutside) {
        return c1Result;
      }
    }
    const c2Intersection = intersectRay(c2, float32Array2, ray, near, far);
    const c2Result = c2Intersection ? _raycastFirst$1(c2, bvh, materialOrSide, ray, near, far) : null;
    if (c1Result && c2Result) {
      return c1Result.distance <= c2Result.distance ? c1Result : c2Result;
    } else {
      return c1Result || c2Result || null;
    }
  }
}
const boundingBox$1 = /* @__PURE__ */ new Box3();
const triangle$1 = /* @__PURE__ */ new ExtendedTriangle();
const triangle2$1 = /* @__PURE__ */ new ExtendedTriangle();
const invertedMat$1 = /* @__PURE__ */ new Matrix4();
const obb$3 = /* @__PURE__ */ new OrientedBox();
const obb2$3 = /* @__PURE__ */ new OrientedBox();
function intersectsGeometry(bvh, root, otherGeometry, geometryToBvh) {
  BufferStack.setBuffer(bvh._roots[root]);
  const result = _intersectsGeometry$1(0, bvh, otherGeometry, geometryToBvh);
  BufferStack.clearBuffer();
  return result;
}
function _intersectsGeometry$1(nodeIndex32, bvh, otherGeometry, geometryToBvh, cachedObb = null) {
  const { float32Array: float32Array2, uint16Array: uint16Array2, uint32Array: uint32Array2 } = BufferStack;
  let nodeIndex16 = nodeIndex32 * 2;
  if (cachedObb === null) {
    if (!otherGeometry.boundingBox) {
      otherGeometry.computeBoundingBox();
    }
    obb$3.set(otherGeometry.boundingBox.min, otherGeometry.boundingBox.max, geometryToBvh);
    cachedObb = obb$3;
  }
  const isLeaf = IS_LEAF(nodeIndex16, uint16Array2);
  if (isLeaf) {
    const thisGeometry = bvh.geometry;
    const thisIndex = thisGeometry.index;
    const thisPos = thisGeometry.attributes.position;
    const otherIndex = otherGeometry.index;
    const otherPos = otherGeometry.attributes.position;
    const offset = OFFSET(nodeIndex32, uint32Array2);
    const count = COUNT(nodeIndex16, uint16Array2);
    invertedMat$1.copy(geometryToBvh).invert();
    if (otherGeometry.boundsTree) {
      arrayToBox(BOUNDING_DATA_INDEX(nodeIndex32), float32Array2, obb2$3);
      obb2$3.matrix.copy(invertedMat$1);
      obb2$3.needsUpdate = true;
      const res = otherGeometry.boundsTree.shapecast({
        intersectsBounds: (box) => obb2$3.intersectsBox(box),
        intersectsTriangle: (tri) => {
          tri.a.applyMatrix4(geometryToBvh);
          tri.b.applyMatrix4(geometryToBvh);
          tri.c.applyMatrix4(geometryToBvh);
          tri.needsUpdate = true;
          for (let i2 = offset * 3, l2 = (count + offset) * 3; i2 < l2; i2 += 3) {
            setTriangle(triangle2$1, i2, thisIndex, thisPos);
            triangle2$1.needsUpdate = true;
            if (tri.intersectsTriangle(triangle2$1)) {
              return true;
            }
          }
          return false;
        }
      });
      return res;
    } else {
      const otherTriangleCount = getTriCount$1(otherGeometry);
      for (let i2 = offset * 3, l2 = (count + offset) * 3; i2 < l2; i2 += 3) {
        setTriangle(triangle$1, i2, thisIndex, thisPos);
        triangle$1.a.applyMatrix4(invertedMat$1);
        triangle$1.b.applyMatrix4(invertedMat$1);
        triangle$1.c.applyMatrix4(invertedMat$1);
        triangle$1.needsUpdate = true;
        for (let i22 = 0, l22 = otherTriangleCount * 3; i22 < l22; i22 += 3) {
          setTriangle(triangle2$1, i22, otherIndex, otherPos);
          triangle2$1.needsUpdate = true;
          if (triangle$1.intersectsTriangle(triangle2$1)) {
            return true;
          }
        }
      }
    }
  } else {
    const left = LEFT_NODE(nodeIndex32);
    const right = RIGHT_NODE(nodeIndex32, uint32Array2);
    arrayToBox(BOUNDING_DATA_INDEX(left), float32Array2, boundingBox$1);
    const leftIntersection = cachedObb.intersectsBox(boundingBox$1) && _intersectsGeometry$1(left, bvh, otherGeometry, geometryToBvh, cachedObb);
    if (leftIntersection) return true;
    arrayToBox(BOUNDING_DATA_INDEX(right), float32Array2, boundingBox$1);
    const rightIntersection = cachedObb.intersectsBox(boundingBox$1) && _intersectsGeometry$1(right, bvh, otherGeometry, geometryToBvh, cachedObb);
    if (rightIntersection) return true;
    return false;
  }
}
const tempMatrix$1 = /* @__PURE__ */ new Matrix4();
const obb$2 = /* @__PURE__ */ new OrientedBox();
const obb2$2 = /* @__PURE__ */ new OrientedBox();
const temp1$1 = /* @__PURE__ */ new Vector3();
const temp2$1 = /* @__PURE__ */ new Vector3();
const temp3$1 = /* @__PURE__ */ new Vector3();
const temp4$1 = /* @__PURE__ */ new Vector3();
function closestPointToGeometry(bvh, otherGeometry, geometryToBvh, target1 = {}, target2 = {}, minThreshold = 0, maxThreshold = Infinity) {
  if (!otherGeometry.boundingBox) {
    otherGeometry.computeBoundingBox();
  }
  obb$2.set(otherGeometry.boundingBox.min, otherGeometry.boundingBox.max, geometryToBvh);
  obb$2.needsUpdate = true;
  const geometry = bvh.geometry;
  const pos = geometry.attributes.position;
  const index = geometry.index;
  const otherPos = otherGeometry.attributes.position;
  const otherIndex = otherGeometry.index;
  const triangle3 = ExtendedTrianglePool.getPrimitive();
  const triangle22 = ExtendedTrianglePool.getPrimitive();
  let tempTarget1 = temp1$1;
  let tempTargetDest1 = temp2$1;
  let tempTarget2 = null;
  let tempTargetDest2 = null;
  if (target2) {
    tempTarget2 = temp3$1;
    tempTargetDest2 = temp4$1;
  }
  let closestDistance = Infinity;
  let closestDistanceTriIndex = null;
  let closestDistanceOtherTriIndex = null;
  tempMatrix$1.copy(geometryToBvh).invert();
  obb2$2.matrix.copy(tempMatrix$1);
  bvh.shapecast(
    {
      boundsTraverseOrder: (box) => {
        return obb$2.distanceToBox(box);
      },
      intersectsBounds: (box, isLeaf, score) => {
        if (score < closestDistance && score < maxThreshold) {
          if (isLeaf) {
            obb2$2.min.copy(box.min);
            obb2$2.max.copy(box.max);
            obb2$2.needsUpdate = true;
          }
          return true;
        }
        return false;
      },
      intersectsRange: (offset, count) => {
        if (otherGeometry.boundsTree) {
          const otherBvh = otherGeometry.boundsTree;
          return otherBvh.shapecast({
            boundsTraverseOrder: (box) => {
              return obb2$2.distanceToBox(box);
            },
            intersectsBounds: (box, isLeaf, score) => {
              return score < closestDistance && score < maxThreshold;
            },
            intersectsRange: (otherOffset, otherCount) => {
              for (let i2 = otherOffset, l2 = otherOffset + otherCount; i2 < l2; i2++) {
                setTriangle(triangle22, 3 * i2, otherIndex, otherPos);
                triangle22.a.applyMatrix4(geometryToBvh);
                triangle22.b.applyMatrix4(geometryToBvh);
                triangle22.c.applyMatrix4(geometryToBvh);
                triangle22.needsUpdate = true;
                for (let i3 = offset, l3 = offset + count; i3 < l3; i3++) {
                  setTriangle(triangle3, 3 * i3, index, pos);
                  triangle3.needsUpdate = true;
                  const dist = triangle3.distanceToTriangle(triangle22, tempTarget1, tempTarget2);
                  if (dist < closestDistance) {
                    tempTargetDest1.copy(tempTarget1);
                    if (tempTargetDest2) {
                      tempTargetDest2.copy(tempTarget2);
                    }
                    closestDistance = dist;
                    closestDistanceTriIndex = i3;
                    closestDistanceOtherTriIndex = i2;
                  }
                  if (dist < minThreshold) {
                    return true;
                  }
                }
              }
            }
          });
        } else {
          const triCount = getTriCount$1(otherGeometry);
          for (let i2 = 0, l2 = triCount; i2 < l2; i2++) {
            setTriangle(triangle22, 3 * i2, otherIndex, otherPos);
            triangle22.a.applyMatrix4(geometryToBvh);
            triangle22.b.applyMatrix4(geometryToBvh);
            triangle22.c.applyMatrix4(geometryToBvh);
            triangle22.needsUpdate = true;
            for (let i3 = offset, l3 = offset + count; i3 < l3; i3++) {
              setTriangle(triangle3, 3 * i3, index, pos);
              triangle3.needsUpdate = true;
              const dist = triangle3.distanceToTriangle(triangle22, tempTarget1, tempTarget2);
              if (dist < closestDistance) {
                tempTargetDest1.copy(tempTarget1);
                if (tempTargetDest2) {
                  tempTargetDest2.copy(tempTarget2);
                }
                closestDistance = dist;
                closestDistanceTriIndex = i3;
                closestDistanceOtherTriIndex = i2;
              }
              if (dist < minThreshold) {
                return true;
              }
            }
          }
        }
      }
    }
  );
  ExtendedTrianglePool.releasePrimitive(triangle3);
  ExtendedTrianglePool.releasePrimitive(triangle22);
  if (closestDistance === Infinity) {
    return null;
  }
  if (!target1.point) {
    target1.point = tempTargetDest1.clone();
  } else {
    target1.point.copy(tempTargetDest1);
  }
  target1.distance = closestDistance, target1.faceIndex = closestDistanceTriIndex;
  if (target2) {
    if (!target2.point) target2.point = tempTargetDest2.clone();
    else target2.point.copy(tempTargetDest2);
    target2.point.applyMatrix4(tempMatrix$1);
    tempTargetDest1.applyMatrix4(tempMatrix$1);
    target2.distance = tempTargetDest1.sub(target2.point).length();
    target2.faceIndex = closestDistanceOtherTriIndex;
  }
  return target1;
}
function refit_indirect(bvh, nodeIndices = null) {
  if (nodeIndices && Array.isArray(nodeIndices)) {
    nodeIndices = new Set(nodeIndices);
  }
  const geometry = bvh.geometry;
  const indexArr = geometry.index ? geometry.index.array : null;
  const posAttr = geometry.attributes.position;
  let buffer, uint32Array2, uint16Array2, float32Array2;
  let byteOffset = 0;
  const roots = bvh._roots;
  for (let i2 = 0, l2 = roots.length; i2 < l2; i2++) {
    buffer = roots[i2];
    uint32Array2 = new Uint32Array(buffer);
    uint16Array2 = new Uint16Array(buffer);
    float32Array2 = new Float32Array(buffer);
    _traverse2(0, byteOffset);
    byteOffset += buffer.byteLength;
  }
  function _traverse2(nodeIndex32, byteOffset2, force = false) {
    const nodeIndex16 = nodeIndex32 * 2;
    if (IS_LEAF(nodeIndex16, uint16Array2)) {
      const offset = OFFSET(nodeIndex32, uint32Array2);
      const count = COUNT(nodeIndex16, uint16Array2);
      let minx = Infinity;
      let miny = Infinity;
      let minz = Infinity;
      let maxx = -Infinity;
      let maxy = -Infinity;
      let maxz = -Infinity;
      for (let i2 = offset, l2 = offset + count; i2 < l2; i2++) {
        const t2 = 3 * bvh.resolveTriangleIndex(i2);
        for (let j = 0; j < 3; j++) {
          let index = t2 + j;
          index = indexArr ? indexArr[index] : index;
          const x = posAttr.getX(index);
          const y = posAttr.getY(index);
          const z = posAttr.getZ(index);
          if (x < minx) minx = x;
          if (x > maxx) maxx = x;
          if (y < miny) miny = y;
          if (y > maxy) maxy = y;
          if (z < minz) minz = z;
          if (z > maxz) maxz = z;
        }
      }
      if (float32Array2[nodeIndex32 + 0] !== minx || float32Array2[nodeIndex32 + 1] !== miny || float32Array2[nodeIndex32 + 2] !== minz || float32Array2[nodeIndex32 + 3] !== maxx || float32Array2[nodeIndex32 + 4] !== maxy || float32Array2[nodeIndex32 + 5] !== maxz) {
        float32Array2[nodeIndex32 + 0] = minx;
        float32Array2[nodeIndex32 + 1] = miny;
        float32Array2[nodeIndex32 + 2] = minz;
        float32Array2[nodeIndex32 + 3] = maxx;
        float32Array2[nodeIndex32 + 4] = maxy;
        float32Array2[nodeIndex32 + 5] = maxz;
        return true;
      } else {
        return false;
      }
    } else {
      const left = LEFT_NODE(nodeIndex32);
      const right = RIGHT_NODE(nodeIndex32, uint32Array2);
      let forceChildren = force;
      let includesLeft = false;
      let includesRight = false;
      if (nodeIndices) {
        if (!forceChildren) {
          const leftNodeId = left / UINT32_PER_NODE + byteOffset2 / BYTES_PER_NODE;
          const rightNodeId = right / UINT32_PER_NODE + byteOffset2 / BYTES_PER_NODE;
          includesLeft = nodeIndices.has(leftNodeId);
          includesRight = nodeIndices.has(rightNodeId);
          forceChildren = !includesLeft && !includesRight;
        }
      } else {
        includesLeft = true;
        includesRight = true;
      }
      const traverseLeft = forceChildren || includesLeft;
      const traverseRight = forceChildren || includesRight;
      let leftChange = false;
      if (traverseLeft) {
        leftChange = _traverse2(left, byteOffset2, forceChildren);
      }
      let rightChange = false;
      if (traverseRight) {
        rightChange = _traverse2(right, byteOffset2, forceChildren);
      }
      const didChange = leftChange || rightChange;
      if (didChange) {
        for (let i2 = 0; i2 < 3; i2++) {
          const left_i = left + i2;
          const right_i = right + i2;
          const minLeftValue = float32Array2[left_i];
          const maxLeftValue = float32Array2[left_i + 3];
          const minRightValue = float32Array2[right_i];
          const maxRightValue = float32Array2[right_i + 3];
          float32Array2[nodeIndex32 + i2] = minLeftValue < minRightValue ? minLeftValue : minRightValue;
          float32Array2[nodeIndex32 + i2 + 3] = maxLeftValue > maxRightValue ? maxLeftValue : maxRightValue;
        }
      }
      return didChange;
    }
  }
}
function raycast_indirect(bvh, root, materialOrSide, ray, intersects, near, far) {
  BufferStack.setBuffer(bvh._roots[root]);
  _raycast(0, bvh, materialOrSide, ray, intersects, near, far);
  BufferStack.clearBuffer();
}
function _raycast(nodeIndex32, bvh, materialOrSide, ray, intersects, near, far) {
  const { float32Array: float32Array2, uint16Array: uint16Array2, uint32Array: uint32Array2 } = BufferStack;
  const nodeIndex16 = nodeIndex32 * 2;
  const isLeaf = IS_LEAF(nodeIndex16, uint16Array2);
  if (isLeaf) {
    const offset = OFFSET(nodeIndex32, uint32Array2);
    const count = COUNT(nodeIndex16, uint16Array2);
    intersectTris_indirect(bvh, materialOrSide, ray, offset, count, intersects, near, far);
  } else {
    const leftIndex = LEFT_NODE(nodeIndex32);
    if (intersectRay(leftIndex, float32Array2, ray, near, far)) {
      _raycast(leftIndex, bvh, materialOrSide, ray, intersects, near, far);
    }
    const rightIndex = RIGHT_NODE(nodeIndex32, uint32Array2);
    if (intersectRay(rightIndex, float32Array2, ray, near, far)) {
      _raycast(rightIndex, bvh, materialOrSide, ray, intersects, near, far);
    }
  }
}
const _xyzFields = ["x", "y", "z"];
function raycastFirst_indirect(bvh, root, materialOrSide, ray, near, far) {
  BufferStack.setBuffer(bvh._roots[root]);
  const result = _raycastFirst(0, bvh, materialOrSide, ray, near, far);
  BufferStack.clearBuffer();
  return result;
}
function _raycastFirst(nodeIndex32, bvh, materialOrSide, ray, near, far) {
  const { float32Array: float32Array2, uint16Array: uint16Array2, uint32Array: uint32Array2 } = BufferStack;
  let nodeIndex16 = nodeIndex32 * 2;
  const isLeaf = IS_LEAF(nodeIndex16, uint16Array2);
  if (isLeaf) {
    const offset = OFFSET(nodeIndex32, uint32Array2);
    const count = COUNT(nodeIndex16, uint16Array2);
    return intersectClosestTri_indirect(bvh, materialOrSide, ray, offset, count, near, far);
  } else {
    const splitAxis = SPLIT_AXIS(nodeIndex32, uint32Array2);
    const xyzAxis = _xyzFields[splitAxis];
    const rayDir = ray.direction[xyzAxis];
    const leftToRight = rayDir >= 0;
    let c1, c2;
    if (leftToRight) {
      c1 = LEFT_NODE(nodeIndex32);
      c2 = RIGHT_NODE(nodeIndex32, uint32Array2);
    } else {
      c1 = RIGHT_NODE(nodeIndex32, uint32Array2);
      c2 = LEFT_NODE(nodeIndex32);
    }
    const c1Intersection = intersectRay(c1, float32Array2, ray, near, far);
    const c1Result = c1Intersection ? _raycastFirst(c1, bvh, materialOrSide, ray, near, far) : null;
    if (c1Result) {
      const point = c1Result.point[xyzAxis];
      const isOutside = leftToRight ? point <= float32Array2[c2 + splitAxis] : (
        // min bounding data
        point >= float32Array2[c2 + splitAxis + 3]
      );
      if (isOutside) {
        return c1Result;
      }
    }
    const c2Intersection = intersectRay(c2, float32Array2, ray, near, far);
    const c2Result = c2Intersection ? _raycastFirst(c2, bvh, materialOrSide, ray, near, far) : null;
    if (c1Result && c2Result) {
      return c1Result.distance <= c2Result.distance ? c1Result : c2Result;
    } else {
      return c1Result || c2Result || null;
    }
  }
}
const boundingBox = /* @__PURE__ */ new Box3();
const triangle = /* @__PURE__ */ new ExtendedTriangle();
const triangle2 = /* @__PURE__ */ new ExtendedTriangle();
const invertedMat = /* @__PURE__ */ new Matrix4();
const obb$1 = /* @__PURE__ */ new OrientedBox();
const obb2$1 = /* @__PURE__ */ new OrientedBox();
function intersectsGeometry_indirect(bvh, root, otherGeometry, geometryToBvh) {
  BufferStack.setBuffer(bvh._roots[root]);
  const result = _intersectsGeometry(0, bvh, otherGeometry, geometryToBvh);
  BufferStack.clearBuffer();
  return result;
}
function _intersectsGeometry(nodeIndex32, bvh, otherGeometry, geometryToBvh, cachedObb = null) {
  const { float32Array: float32Array2, uint16Array: uint16Array2, uint32Array: uint32Array2 } = BufferStack;
  let nodeIndex16 = nodeIndex32 * 2;
  if (cachedObb === null) {
    if (!otherGeometry.boundingBox) {
      otherGeometry.computeBoundingBox();
    }
    obb$1.set(otherGeometry.boundingBox.min, otherGeometry.boundingBox.max, geometryToBvh);
    cachedObb = obb$1;
  }
  const isLeaf = IS_LEAF(nodeIndex16, uint16Array2);
  if (isLeaf) {
    const thisGeometry = bvh.geometry;
    const thisIndex = thisGeometry.index;
    const thisPos = thisGeometry.attributes.position;
    const otherIndex = otherGeometry.index;
    const otherPos = otherGeometry.attributes.position;
    const offset = OFFSET(nodeIndex32, uint32Array2);
    const count = COUNT(nodeIndex16, uint16Array2);
    invertedMat.copy(geometryToBvh).invert();
    if (otherGeometry.boundsTree) {
      arrayToBox(BOUNDING_DATA_INDEX(nodeIndex32), float32Array2, obb2$1);
      obb2$1.matrix.copy(invertedMat);
      obb2$1.needsUpdate = true;
      const res = otherGeometry.boundsTree.shapecast({
        intersectsBounds: (box) => obb2$1.intersectsBox(box),
        intersectsTriangle: (tri) => {
          tri.a.applyMatrix4(geometryToBvh);
          tri.b.applyMatrix4(geometryToBvh);
          tri.c.applyMatrix4(geometryToBvh);
          tri.needsUpdate = true;
          for (let i2 = offset, l2 = count + offset; i2 < l2; i2++) {
            setTriangle(triangle2, 3 * bvh.resolveTriangleIndex(i2), thisIndex, thisPos);
            triangle2.needsUpdate = true;
            if (tri.intersectsTriangle(triangle2)) {
              return true;
            }
          }
          return false;
        }
      });
      return res;
    } else {
      const otherTriangleCount = getTriCount$1(otherGeometry);
      for (let i2 = offset, l2 = count + offset; i2 < l2; i2++) {
        const ti = bvh.resolveTriangleIndex(i2);
        setTriangle(triangle, 3 * ti, thisIndex, thisPos);
        triangle.a.applyMatrix4(invertedMat);
        triangle.b.applyMatrix4(invertedMat);
        triangle.c.applyMatrix4(invertedMat);
        triangle.needsUpdate = true;
        for (let i22 = 0, l22 = otherTriangleCount * 3; i22 < l22; i22 += 3) {
          setTriangle(triangle2, i22, otherIndex, otherPos);
          triangle2.needsUpdate = true;
          if (triangle.intersectsTriangle(triangle2)) {
            return true;
          }
        }
      }
    }
  } else {
    const left = LEFT_NODE(nodeIndex32);
    const right = RIGHT_NODE(nodeIndex32, uint32Array2);
    arrayToBox(BOUNDING_DATA_INDEX(left), float32Array2, boundingBox);
    const leftIntersection = cachedObb.intersectsBox(boundingBox) && _intersectsGeometry(left, bvh, otherGeometry, geometryToBvh, cachedObb);
    if (leftIntersection) return true;
    arrayToBox(BOUNDING_DATA_INDEX(right), float32Array2, boundingBox);
    const rightIntersection = cachedObb.intersectsBox(boundingBox) && _intersectsGeometry(right, bvh, otherGeometry, geometryToBvh, cachedObb);
    if (rightIntersection) return true;
    return false;
  }
}
const tempMatrix = /* @__PURE__ */ new Matrix4();
const obb = /* @__PURE__ */ new OrientedBox();
const obb2 = /* @__PURE__ */ new OrientedBox();
const temp1 = /* @__PURE__ */ new Vector3();
const temp2 = /* @__PURE__ */ new Vector3();
const temp3 = /* @__PURE__ */ new Vector3();
const temp4 = /* @__PURE__ */ new Vector3();
function closestPointToGeometry_indirect(bvh, otherGeometry, geometryToBvh, target1 = {}, target2 = {}, minThreshold = 0, maxThreshold = Infinity) {
  if (!otherGeometry.boundingBox) {
    otherGeometry.computeBoundingBox();
  }
  obb.set(otherGeometry.boundingBox.min, otherGeometry.boundingBox.max, geometryToBvh);
  obb.needsUpdate = true;
  const geometry = bvh.geometry;
  const pos = geometry.attributes.position;
  const index = geometry.index;
  const otherPos = otherGeometry.attributes.position;
  const otherIndex = otherGeometry.index;
  const triangle3 = ExtendedTrianglePool.getPrimitive();
  const triangle22 = ExtendedTrianglePool.getPrimitive();
  let tempTarget1 = temp1;
  let tempTargetDest1 = temp2;
  let tempTarget2 = null;
  let tempTargetDest2 = null;
  if (target2) {
    tempTarget2 = temp3;
    tempTargetDest2 = temp4;
  }
  let closestDistance = Infinity;
  let closestDistanceTriIndex = null;
  let closestDistanceOtherTriIndex = null;
  tempMatrix.copy(geometryToBvh).invert();
  obb2.matrix.copy(tempMatrix);
  bvh.shapecast(
    {
      boundsTraverseOrder: (box) => {
        return obb.distanceToBox(box);
      },
      intersectsBounds: (box, isLeaf, score) => {
        if (score < closestDistance && score < maxThreshold) {
          if (isLeaf) {
            obb2.min.copy(box.min);
            obb2.max.copy(box.max);
            obb2.needsUpdate = true;
          }
          return true;
        }
        return false;
      },
      intersectsRange: (offset, count) => {
        if (otherGeometry.boundsTree) {
          const otherBvh = otherGeometry.boundsTree;
          return otherBvh.shapecast({
            boundsTraverseOrder: (box) => {
              return obb2.distanceToBox(box);
            },
            intersectsBounds: (box, isLeaf, score) => {
              return score < closestDistance && score < maxThreshold;
            },
            intersectsRange: (otherOffset, otherCount) => {
              for (let i2 = otherOffset, l2 = otherOffset + otherCount; i2 < l2; i2++) {
                const ti2 = otherBvh.resolveTriangleIndex(i2);
                setTriangle(triangle22, 3 * ti2, otherIndex, otherPos);
                triangle22.a.applyMatrix4(geometryToBvh);
                triangle22.b.applyMatrix4(geometryToBvh);
                triangle22.c.applyMatrix4(geometryToBvh);
                triangle22.needsUpdate = true;
                for (let i3 = offset, l3 = offset + count; i3 < l3; i3++) {
                  const ti = bvh.resolveTriangleIndex(i3);
                  setTriangle(triangle3, 3 * ti, index, pos);
                  triangle3.needsUpdate = true;
                  const dist = triangle3.distanceToTriangle(triangle22, tempTarget1, tempTarget2);
                  if (dist < closestDistance) {
                    tempTargetDest1.copy(tempTarget1);
                    if (tempTargetDest2) {
                      tempTargetDest2.copy(tempTarget2);
                    }
                    closestDistance = dist;
                    closestDistanceTriIndex = i3;
                    closestDistanceOtherTriIndex = i2;
                  }
                  if (dist < minThreshold) {
                    return true;
                  }
                }
              }
            }
          });
        } else {
          const triCount = getTriCount$1(otherGeometry);
          for (let i2 = 0, l2 = triCount; i2 < l2; i2++) {
            setTriangle(triangle22, 3 * i2, otherIndex, otherPos);
            triangle22.a.applyMatrix4(geometryToBvh);
            triangle22.b.applyMatrix4(geometryToBvh);
            triangle22.c.applyMatrix4(geometryToBvh);
            triangle22.needsUpdate = true;
            for (let i3 = offset, l3 = offset + count; i3 < l3; i3++) {
              const ti = bvh.resolveTriangleIndex(i3);
              setTriangle(triangle3, 3 * ti, index, pos);
              triangle3.needsUpdate = true;
              const dist = triangle3.distanceToTriangle(triangle22, tempTarget1, tempTarget2);
              if (dist < closestDistance) {
                tempTargetDest1.copy(tempTarget1);
                if (tempTargetDest2) {
                  tempTargetDest2.copy(tempTarget2);
                }
                closestDistance = dist;
                closestDistanceTriIndex = i3;
                closestDistanceOtherTriIndex = i2;
              }
              if (dist < minThreshold) {
                return true;
              }
            }
          }
        }
      }
    }
  );
  ExtendedTrianglePool.releasePrimitive(triangle3);
  ExtendedTrianglePool.releasePrimitive(triangle22);
  if (closestDistance === Infinity) {
    return null;
  }
  if (!target1.point) {
    target1.point = tempTargetDest1.clone();
  } else {
    target1.point.copy(tempTargetDest1);
  }
  target1.distance = closestDistance, target1.faceIndex = closestDistanceTriIndex;
  if (target2) {
    if (!target2.point) target2.point = tempTargetDest2.clone();
    else target2.point.copy(tempTargetDest2);
    target2.point.applyMatrix4(tempMatrix);
    tempTargetDest1.applyMatrix4(tempMatrix);
    target2.distance = tempTargetDest1.sub(target2.point).length();
    target2.faceIndex = closestDistanceOtherTriIndex;
  }
  return target1;
}
function convertRaycastIntersect(hit, object, raycaster) {
  if (hit === null) {
    return null;
  }
  hit.point.applyMatrix4(object.matrixWorld);
  hit.distance = hit.point.distanceTo(raycaster.ray.origin);
  hit.object = object;
  return hit;
}
const _obb = /* @__PURE__ */ new OrientedBox();
const _ray = /* @__PURE__ */ new Ray();
const _direction = /* @__PURE__ */ new Vector3();
const _inverseMatrix = /* @__PURE__ */ new Matrix4();
const _worldScale = /* @__PURE__ */ new Vector3();
const _getters = ["getX", "getY", "getZ"];
class MeshBVH extends GeometryBVH {
  static serialize(bvh, options = {}) {
    options = {
      cloneBuffers: true,
      ...options
    };
    const geometry = bvh.geometry;
    const rootData = bvh._roots;
    const indirectBuffer = bvh._indirectBuffer;
    const indexAttribute = geometry.getIndex();
    const result = {
      version: 1,
      roots: null,
      index: null,
      indirectBuffer: null
    };
    if (options.cloneBuffers) {
      result.roots = rootData.map((root) => root.slice());
      result.index = indexAttribute ? indexAttribute.array.slice() : null;
      result.indirectBuffer = indirectBuffer ? indirectBuffer.slice() : null;
    } else {
      result.roots = rootData;
      result.index = indexAttribute ? indexAttribute.array : null;
      result.indirectBuffer = indirectBuffer;
    }
    return result;
  }
  static deserialize(data, geometry, options = {}) {
    options = {
      setIndex: true,
      indirect: Boolean(data.indirectBuffer),
      ...options
    };
    const { index, roots, indirectBuffer } = data;
    if (!data.version) {
      console.warn(
        "MeshBVH.deserialize: Serialization format has been changed and will be fixed up. It is recommended to regenerate any stored serialized data."
      );
      fixupVersion0(roots);
    }
    const bvh = new MeshBVH(geometry, { ...options, [SKIP_GENERATION]: true });
    bvh._roots = roots;
    bvh._indirectBuffer = indirectBuffer || null;
    if (options.setIndex) {
      const indexAttribute = geometry.getIndex();
      if (indexAttribute === null) {
        const newIndex = new BufferAttribute(data.index, 1, false);
        geometry.setIndex(newIndex);
      } else if (indexAttribute.array !== index) {
        indexAttribute.array.set(index);
        indexAttribute.needsUpdate = true;
      }
    }
    return bvh;
    function fixupVersion0(roots2) {
      for (let rootIndex = 0; rootIndex < roots2.length; rootIndex++) {
        const root = roots2[rootIndex];
        const uint32Array2 = new Uint32Array(root);
        const uint16Array2 = new Uint16Array(root);
        for (let node = 0, l2 = root.byteLength / BYTES_PER_NODE; node < l2; node++) {
          const node32Index = UINT32_PER_NODE * node;
          const node16Index = 2 * node32Index;
          if (!IS_LEAF(node16Index, uint16Array2)) {
            uint32Array2[node32Index + 6] = uint32Array2[node32Index + 6] / UINT32_PER_NODE - node;
          }
        }
      }
    }
  }
  get primitiveStride() {
    return 3;
  }
  get resolveTriangleIndex() {
    return this.resolvePrimitiveIndex;
  }
  constructor(geometry, options = {}) {
    if (options.maxLeafTris) {
      console.warn('MeshBVH: "maxLeafTris" option has been deprecated. Use maxLeafSize, instead.');
      options = {
        ...options,
        maxLeafSize: options.maxLeafTris
      };
    }
    super(geometry, options);
  }
  // implement abstract methods from BVH base class
  shiftTriangleOffsets(offset) {
    return super.shiftPrimitiveOffsets(offset);
  }
  // write primitive bounds to the buffer - used only for validateBounds at the moment
  writePrimitiveBounds(i2, targetBuffer, baseIndex) {
    const geometry = this.geometry;
    const indirectBuffer = this._indirectBuffer;
    const posAttr = geometry.attributes.position;
    const index = geometry.index ? geometry.index.array : null;
    const tri = indirectBuffer ? indirectBuffer[i2] : i2;
    const tri3 = tri * 3;
    let ai = tri3 + 0;
    let bi = tri3 + 1;
    let ci = tri3 + 2;
    if (index) {
      ai = index[ai];
      bi = index[bi];
      ci = index[ci];
    }
    for (let el = 0; el < 3; el++) {
      const a2 = posAttr[_getters[el]](ai);
      const b = posAttr[_getters[el]](bi);
      const c2 = posAttr[_getters[el]](ci);
      let min = a2;
      if (b < min) min = b;
      if (c2 < min) min = c2;
      let max = a2;
      if (b > max) max = b;
      if (c2 > max) max = c2;
      targetBuffer[baseIndex + el] = min;
      targetBuffer[baseIndex + el + 3] = max;
    }
    return targetBuffer;
  }
  // precomputes the bounding box for each triangle; required for quickly calculating tree splits.
  // result is an array of size count * 6 where triangle i maps to a
  // [x_center, x_delta, y_center, y_delta, z_center, z_delta] tuple starting at index (i - offset) * 6,
  // representing the center and half-extent in each dimension of triangle i
  computePrimitiveBounds(offset, count, targetBuffer) {
    const geometry = this.geometry;
    const indirectBuffer = this._indirectBuffer;
    const posAttr = geometry.attributes.position;
    const index = geometry.index ? geometry.index.array : null;
    const normalized = posAttr.normalized;
    if (offset < 0 || count + offset - targetBuffer.offset > targetBuffer.length / 6) {
      throw new Error("MeshBVH: compute triangle bounds range is invalid.");
    }
    const posArr = posAttr.array;
    const bufferOffset = posAttr.offset || 0;
    let stride = 3;
    if (posAttr.isInterleavedBufferAttribute) {
      stride = posAttr.data.stride;
    }
    const getters = ["getX", "getY", "getZ"];
    const writeOffset = targetBuffer.offset;
    for (let i2 = offset, l2 = offset + count; i2 < l2; i2++) {
      const tri = indirectBuffer ? indirectBuffer[i2] : i2;
      const tri3 = tri * 3;
      const boundsIndexOffset = (i2 - writeOffset) * 6;
      let ai = tri3 + 0;
      let bi = tri3 + 1;
      let ci = tri3 + 2;
      if (index) {
        ai = index[ai];
        bi = index[bi];
        ci = index[ci];
      }
      if (!normalized) {
        ai = ai * stride + bufferOffset;
        bi = bi * stride + bufferOffset;
        ci = ci * stride + bufferOffset;
      }
      for (let el = 0; el < 3; el++) {
        let a2, b, c2;
        if (normalized) {
          a2 = posAttr[getters[el]](ai);
          b = posAttr[getters[el]](bi);
          c2 = posAttr[getters[el]](ci);
        } else {
          a2 = posArr[ai + el];
          b = posArr[bi + el];
          c2 = posArr[ci + el];
        }
        let min = a2;
        if (b < min) min = b;
        if (c2 < min) min = c2;
        let max = a2;
        if (b > max) max = b;
        if (c2 > max) max = c2;
        const halfExtents = (max - min) / 2;
        const el2 = el * 2;
        targetBuffer[boundsIndexOffset + el2 + 0] = min + halfExtents;
        targetBuffer[boundsIndexOffset + el2 + 1] = halfExtents + (Math.abs(min) + halfExtents) * FLOAT32_EPSILON;
      }
    }
    return targetBuffer;
  }
  raycastObject3D(object, raycaster, intersects = []) {
    const { material } = object;
    if (material === void 0) {
      return;
    }
    _inverseMatrix.copy(object.matrixWorld).invert();
    _ray.copy(raycaster.ray).applyMatrix4(_inverseMatrix);
    _worldScale.setFromMatrixScale(object.matrixWorld);
    _direction.copy(_ray.direction).multiply(_worldScale);
    const scaleFactor = _direction.length();
    const near = raycaster.near / scaleFactor;
    const far = raycaster.far / scaleFactor;
    if (raycaster.firstHitOnly === true) {
      let hit = this.raycastFirst(_ray, material, near, far);
      hit = convertRaycastIntersect(hit, object, raycaster);
      if (hit) {
        intersects.push(hit);
      }
    } else {
      const hits = this.raycast(_ray, material, near, far);
      for (let i2 = 0, l2 = hits.length; i2 < l2; i2++) {
        const hit = convertRaycastIntersect(hits[i2], object, raycaster);
        if (hit) {
          intersects.push(hit);
        }
      }
    }
    return intersects;
  }
  refit(nodeIndices = null) {
    const refitFunc = this.indirect ? refit_indirect : refit;
    return refitFunc(this, nodeIndices);
  }
  /* Core Cast Functions */
  raycast(ray, materialOrSide = FrontSide, near = 0, far = Infinity) {
    const roots = this._roots;
    const intersects = [];
    const raycastFunc = this.indirect ? raycast_indirect : raycast;
    for (let i2 = 0, l2 = roots.length; i2 < l2; i2++) {
      raycastFunc(this, i2, materialOrSide, ray, intersects, near, far);
    }
    return intersects;
  }
  raycastFirst(ray, materialOrSide = FrontSide, near = 0, far = Infinity) {
    const roots = this._roots;
    let closestResult = null;
    const raycastFirstFunc = this.indirect ? raycastFirst_indirect : raycastFirst;
    for (let i2 = 0, l2 = roots.length; i2 < l2; i2++) {
      const result = raycastFirstFunc(this, i2, materialOrSide, ray, near, far);
      if (result != null && (closestResult == null || result.distance < closestResult.distance)) {
        closestResult = result;
      }
    }
    return closestResult;
  }
  intersectsGeometry(otherGeometry, geomToMesh) {
    let result = false;
    const roots = this._roots;
    const intersectsGeometryFunc = this.indirect ? intersectsGeometry_indirect : intersectsGeometry;
    for (let i2 = 0, l2 = roots.length; i2 < l2; i2++) {
      result = intersectsGeometryFunc(this, i2, otherGeometry, geomToMesh);
      if (result) {
        break;
      }
    }
    return result;
  }
  shapecast(callbacks) {
    const triangle3 = ExtendedTrianglePool.getPrimitive();
    const result = super.shapecast(
      {
        ...callbacks,
        intersectsPrimitive: callbacks.intersectsTriangle,
        scratchPrimitive: triangle3,
        // TODO: is the performance significant enough for the added complexity here?
        // can we just use one function?
        iterate: this.indirect ? iterateOverTriangles_indirect : iterateOverTriangles
      }
    );
    ExtendedTrianglePool.releasePrimitive(triangle3);
    return result;
  }
  bvhcast(otherBvh, matrixToLocal, callbacks) {
    let {
      intersectsRanges,
      intersectsTriangles
    } = callbacks;
    const triangle1 = ExtendedTrianglePool.getPrimitive();
    const indexAttr1 = this.geometry.index;
    const positionAttr1 = this.geometry.attributes.position;
    const assignTriangle1 = this.indirect ? (i1) => {
      const ti = this.resolveTriangleIndex(i1);
      setTriangle(triangle1, ti * 3, indexAttr1, positionAttr1);
    } : (i1) => {
      setTriangle(triangle1, i1 * 3, indexAttr1, positionAttr1);
    };
    const triangle22 = ExtendedTrianglePool.getPrimitive();
    const indexAttr2 = otherBvh.geometry.index;
    const positionAttr2 = otherBvh.geometry.attributes.position;
    const assignTriangle2 = otherBvh.indirect ? (i2) => {
      const ti2 = otherBvh.resolveTriangleIndex(i2);
      setTriangle(triangle22, ti2 * 3, indexAttr2, positionAttr2);
    } : (i2) => {
      setTriangle(triangle22, i2 * 3, indexAttr2, positionAttr2);
    };
    if (intersectsTriangles) {
      if (!(otherBvh instanceof MeshBVH)) {
        throw new Error('MeshBVH: "intersectsTriangles" callback can only be used with another MeshBVH.');
      }
      const iterateOverDoubleTriangles = (offset1, count1, offset2, count2, depth1, nodeIndex1, depth2, nodeIndex2) => {
        for (let i2 = offset2, l2 = offset2 + count2; i2 < l2; i2++) {
          assignTriangle2(i2);
          triangle22.a.applyMatrix4(matrixToLocal);
          triangle22.b.applyMatrix4(matrixToLocal);
          triangle22.c.applyMatrix4(matrixToLocal);
          triangle22.needsUpdate = true;
          for (let i1 = offset1, l1 = offset1 + count1; i1 < l1; i1++) {
            assignTriangle1(i1);
            triangle1.needsUpdate = true;
            if (intersectsTriangles(triangle1, triangle22, i1, i2, depth1, nodeIndex1, depth2, nodeIndex2)) {
              return true;
            }
          }
        }
        return false;
      };
      if (intersectsRanges) {
        const originalIntersectsRanges = intersectsRanges;
        intersectsRanges = function(offset1, count1, offset2, count2, depth1, nodeIndex1, depth2, nodeIndex2) {
          if (!originalIntersectsRanges(offset1, count1, offset2, count2, depth1, nodeIndex1, depth2, nodeIndex2)) {
            return iterateOverDoubleTriangles(offset1, count1, offset2, count2, depth1, nodeIndex1, depth2, nodeIndex2);
          }
          return true;
        };
      } else {
        intersectsRanges = iterateOverDoubleTriangles;
      }
    }
    return super.bvhcast(otherBvh, matrixToLocal, { intersectsRanges });
  }
  /* Derived Cast Functions */
  intersectsBox(box, boxToMesh) {
    _obb.set(box.min, box.max, boxToMesh);
    _obb.needsUpdate = true;
    return this.shapecast(
      {
        intersectsBounds: (box2) => _obb.intersectsBox(box2),
        intersectsTriangle: (tri) => _obb.intersectsTriangle(tri)
      }
    );
  }
  intersectsSphere(sphere) {
    return this.shapecast(
      {
        intersectsBounds: (box) => sphere.intersectsBox(box),
        intersectsTriangle: (tri) => tri.intersectsSphere(sphere)
      }
    );
  }
  closestPointToGeometry(otherGeometry, geometryToBvh, target1 = {}, target2 = {}, minThreshold = 0, maxThreshold = Infinity) {
    const closestPointToGeometryFunc = this.indirect ? closestPointToGeometry_indirect : closestPointToGeometry;
    return closestPointToGeometryFunc(
      this,
      otherGeometry,
      geometryToBvh,
      target1,
      target2,
      minThreshold,
      maxThreshold
    );
  }
  closestPointToPoint(point, target = {}, minThreshold = 0, maxThreshold = Infinity) {
    return closestPointToPoint(
      this,
      point,
      target,
      minThreshold,
      maxThreshold
    );
  }
}
const EPSILON$1 = 1e-16;
const UP_VECTOR$2 = /* @__PURE__ */ new Vector3(0, 1, 0);
const _dir$2 = new Vector3();
function isYProjectedLineDegenerate(line) {
  line.delta(_dir$2).normalize();
  return Math.abs(_dir$2.dot(UP_VECTOR$2)) >= 1 - EPSILON$1;
}
function isLineTriangleEdge(tri, line) {
  const { start, end } = line;
  const triPoints = tri.points;
  let startMatches = false;
  let endMatches = false;
  for (let i2 = 0; i2 < 3; i2++) {
    const tp = triPoints[i2];
    if (!startMatches && start.distanceToSquared(tp) <= EPSILON$1) {
      startMatches = true;
    }
    if (!endMatches && end.distanceToSquared(tp) <= EPSILON$1) {
      endMatches = true;
    }
    if (startMatches && endMatches) {
      return true;
    }
  }
  return startMatches && endMatches;
}
const EPSILON = 1e-16;
const UP_VECTOR$1 = /* @__PURE__ */ new Vector3(0, 1, 0);
const _plane = /* @__PURE__ */ new Plane();
const _planeHit = /* @__PURE__ */ new Vector3();
const _lineDirection = /* @__PURE__ */ new Vector3();
function trimToBeneathTriPlane(tri, line, lineTarget) {
  if (tri.needsUpdate) {
    tri.update();
  }
  _plane.copy(tri.plane);
  if (_plane.normal.dot(UP_VECTOR$1) < 0) {
    _plane.normal.multiplyScalar(-1);
    _plane.constant *= -1;
  }
  const startDist = _plane.distanceToPoint(line.start);
  const endDist = _plane.distanceToPoint(line.end);
  const isStartOnPlane = Math.abs(startDist) < EPSILON;
  const isStartBelow = startDist < 0;
  const isEndBelow = endDist < 0;
  line.delta(_lineDirection).normalize();
  if (Math.abs(_plane.normal.dot(_lineDirection)) < EPSILON) {
    if (isStartOnPlane || !isStartBelow) {
      return false;
    } else {
      lineTarget.copy(line);
      return true;
    }
  }
  if (isStartBelow && isEndBelow) {
    lineTarget.copy(line);
    return true;
  } else if (!isStartBelow && !isEndBelow) {
    return false;
  } else {
    const t2 = MathUtils.mapLinear(0, startDist, endDist, 0, 1);
    line.at(t2, _planeHit);
    if (isStartBelow) {
      lineTarget.start.copy(line.start);
      lineTarget.end.copy(_planeHit);
      return true;
    } else if (isEndBelow) {
      lineTarget.end.copy(line.end);
      lineTarget.start.copy(_planeHit);
      return true;
    }
  }
  return false;
}
const AREA_EPSILON = 1e-16;
const DIST_EPSILON$1 = 1e-16;
const _orthoPlane = /* @__PURE__ */ new Plane();
const _point = /* @__PURE__ */ new Vector3();
const _vec$1 = /* @__PURE__ */ new Vector3();
const _tri$2 = /* @__PURE__ */ new ExtendedTriangle();
const _line$1 = /* @__PURE__ */ new Line3();
const _triLine = /* @__PURE__ */ new Line3();
const _dir$1 = /* @__PURE__ */ new Vector3();
const _ortho = /* @__PURE__ */ new Vector3();
const _triDir = /* @__PURE__ */ new Vector3();
function getProjectedLineOverlap(line, triangle3, lineTarget = new Line3()) {
  _tri$2.copy(triangle3);
  _tri$2.a.y = 0;
  _tri$2.b.y = 0;
  _tri$2.c.y = 0;
  _tri$2.update();
  _line$1.copy(line);
  _line$1.start.y = 0;
  _line$1.end.y = 0;
  if (_tri$2.getArea() <= AREA_EPSILON) {
    return null;
  }
  const lineDistance = _line$1.distance();
  _line$1.delta(_dir$1).divideScalar(lineDistance);
  _ortho.copy(_dir$1).cross(_tri$2.plane.normal).normalize();
  _orthoPlane.setFromNormalAndCoplanarPoint(_ortho, _line$1.start);
  let intersectCount = 0;
  const { points } = _tri$2;
  for (let i2 = 0; i2 < 3; i2++) {
    const p1 = points[i2];
    const p2 = points[(i2 + 1) % 3];
    const distToStart = _orthoPlane.distanceToPoint(p1);
    const distToEnd = _orthoPlane.distanceToPoint(p2);
    const startIntersects = Math.abs(distToStart) < DIST_EPSILON$1;
    const endIntersects = Math.abs(distToEnd) < DIST_EPSILON$1;
    let edgeIntersects = false;
    if (!startIntersects && !endIntersects && distToStart * distToEnd < 0) {
      const t2 = distToStart / (distToStart - distToEnd);
      _point.lerpVectors(p1, p2, t2);
      edgeIntersects = true;
    }
    if (edgeIntersects && !endIntersects || startIntersects) {
      if (startIntersects && !edgeIntersects) {
        _point.copy(p1);
      }
      if (intersectCount === 0) {
        _triLine.start.copy(_point);
      } else {
        _triLine.end.copy(_point);
      }
      intersectCount++;
      if (intersectCount === 2) {
        break;
      }
    }
  }
  if (intersectCount === 2) {
    _triLine.delta(_triDir).normalize();
    if (_dir$1.dot(_triDir) < 0) {
      const tmp = _triLine.start;
      _triLine.start = _triLine.end;
      _triLine.end = tmp;
    }
    const s1 = 0;
    const e1 = _vec$1.subVectors(_line$1.end, _line$1.start).dot(_dir$1);
    const s2 = _vec$1.subVectors(_triLine.start, _line$1.start).dot(_dir$1);
    const e2 = _vec$1.subVectors(_triLine.end, _line$1.start).dot(_dir$1);
    const separated1 = e1 <= s2;
    const separated2 = e2 <= s1;
    if (separated1 || separated2) {
      return null;
    }
    line.at(
      Math.max(s1, s2) / lineDistance,
      lineTarget.start
    );
    line.at(
      Math.min(e1, e2) / lineDistance,
      lineTarget.end
    );
    return lineTarget;
  }
  return null;
}
const DIST_EPSILON = 1e-16;
const _dir = /* @__PURE__ */ new Vector3();
const _v0 = /* @__PURE__ */ new Vector3();
const _v1 = /* @__PURE__ */ new Vector3();
function appendOverlapRange(line, overlapLine, overlapsTarget) {
  const result = getOverlapRange(line, overlapLine);
  if (result) {
    insertOverlap(result, overlapsTarget);
    return true;
  }
  return false;
}
function getOverlapRange(line, overlapLine) {
  line.delta(_dir);
  _v0.subVectors(overlapLine.start, line.start);
  _v1.subVectors(overlapLine.end, line.start);
  const length = _dir.length();
  let d0 = _v0.length() / length;
  let d1 = _v1.length() / length;
  d0 = Math.min(Math.max(d0, 0), 1);
  d1 = Math.min(Math.max(d1, 0), 1);
  if (Math.abs(d0 - d1) <= DIST_EPSILON) {
    return null;
  }
  return [d0, d1];
}
function insertOverlap(result, overlapsTarget) {
  let [start, end] = result;
  let left = 0;
  let right = overlapsTarget.length;
  while (left < right) {
    const mid = left + right >>> 1;
    if (overlapsTarget[mid][0] <= start) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  let insertPoint = Math.max(0, left - 1);
  let deleteCount = 0;
  for (let i2 = insertPoint, l2 = overlapsTarget.length; i2 < l2; i2++) {
    const [otherStart, otherEnd] = overlapsTarget[i2];
    if (start <= otherEnd && end >= otherStart) {
      start = Math.min(otherStart, start);
      end = Math.max(otherEnd, end);
      deleteCount++;
    } else if (start >= otherStart) {
      insertPoint = i2 + 1;
    } else {
      break;
    }
  }
  overlapsTarget.splice(insertPoint, deleteCount, [start, end]);
}
const UP_VECTOR = new Vector3(0, 1, 0);
const DIST_THRESHOLD = 1e-10;
const _beneathLine = /* @__PURE__ */ new Line3();
const _overlapLine = /* @__PURE__ */ new Line3();
const _tri$1 = /* @__PURE__ */ new ExtendedTriangle();
_tri$1.update = () => {
  _tri$1.plane.setFromCoplanarPoints(..._tri$1.points);
};
function bvhcastEdges(edgesBvh, bvh, mesh, hiddenOverlapMap) {
  const { geometry, matrixWorld, material } = mesh;
  const side = material.side;
  const inverted = matrixWorld.determinant() < 0;
  const edges = edgesBvh.lines;
  edgesBvh.bvhcast(bvh, matrixWorld, {
    intersectsRanges: (edgeOffset, edgeCount, meshOffset, meshCount) => {
      for (let i2 = meshOffset, l2 = meshCount + meshOffset; i2 < l2; i2++) {
        let i0 = 3 * i2 + 0;
        let i1 = 3 * i2 + 1;
        let i22 = 3 * i2 + 2;
        if (geometry.index) {
          i0 = geometry.index.getX(i0);
          i1 = geometry.index.getX(i1);
          i22 = geometry.index.getX(i22);
        }
        const { a: a2, b, c: c2 } = _tri$1;
        a2.fromBufferAttribute(geometry.attributes.position, i0).applyMatrix4(matrixWorld);
        b.fromBufferAttribute(geometry.attributes.position, i1).applyMatrix4(matrixWorld);
        c2.fromBufferAttribute(geometry.attributes.position, i22).applyMatrix4(matrixWorld);
        _tri$1.needsUpdate = true;
        _tri$1.update();
        if (side !== DoubleSide) {
          const faceUp = _tri$1.plane.normal.dot(UP_VECTOR) !== inverted;
          if (faceUp === (side === BackSide)) {
            continue;
          }
        }
        const highestTriangleY = Math.max(a2.y, b.y, c2.y);
        const lowestTriangleY = Math.min(a2.y, b.y, c2.y);
        for (let e2 = edgeOffset, le = edgeCount + edgeOffset; e2 < le; e2++) {
          const _line2 = edges[e2];
          const lowestLineY = Math.min(_line2.start.y, _line2.end.y);
          const highestLineY = Math.max(_line2.start.y, _line2.end.y);
          if (highestTriangleY <= lowestLineY) {
            continue;
          }
          if (isLineTriangleEdge(_tri$1, _line2)) {
            continue;
          }
          if (highestLineY < lowestTriangleY) {
            _beneathLine.copy(_line2);
          } else if (!trimToBeneathTriPlane(_tri$1, _line2, _beneathLine)) {
            continue;
          }
          if (_beneathLine.distance() < DIST_THRESHOLD) {
            continue;
          }
          if (getProjectedLineOverlap(_beneathLine, _tri$1, _overlapLine)) {
            appendOverlapRange(_line2, _overlapLine, hiddenOverlapMap[e2]);
          }
        }
      }
    }
  });
}
function getTriCount(geometry) {
  const { index } = geometry;
  const posAttr = geometry.attributes.position;
  return index ? index.count / 3 : posAttr.count / 3;
}
const _tri = new Triangle();
function getSizeSortedTriList(geometry) {
  const index = geometry.index;
  const posAttr = geometry.attributes.position;
  const triCount = getTriCount(geometry);
  return new Array(triCount).fill().map((v, i2) => {
    let i0 = i2 * 3 + 0;
    let i1 = i2 * 3 + 1;
    let i22 = i2 * 3 + 2;
    if (index) {
      i0 = index.getX(i0);
      i1 = index.getX(i1);
      i22 = index.getX(i22);
    }
    _tri.a.fromBufferAttribute(posAttr, i0);
    _tri.b.fromBufferAttribute(posAttr, i1);
    _tri.c.fromBufferAttribute(posAttr, i22);
    _tri.a.y = 0;
    _tri.b.y = 0;
    _tri.c.y = 0;
    return {
      area: _tri.getArea(),
      index: i2
    };
  }).sort((a2, b) => {
    return b.area - a2.area;
  }).map((o2) => {
    return o2.index;
  });
}
const _line = new Line3();
const _target = new Line3();
const _vec = new Vector3();
const EPS = 1e-16;
class PlanarIntersectionGenerator {
  constructor() {
    this.plane = new Plane(new Vector3(0, 1, 0), 0);
  }
  generate(bvh) {
    const { plane } = this;
    if (bvh instanceof BufferGeometry) {
      bvh = new MeshBVH(bvh, { maxLeafSize: 1 });
    }
    const edgesArray = [];
    bvh.shapecast({
      intersectsBounds: (box) => {
        return plane.intersectsBox(box);
      },
      intersectsTriangle: (tri) => {
        const { points } = tri;
        let foundPoints = 0;
        for (let i2 = 0; i2 < 3; i2++) {
          const ni = (i2 + 1) % 3;
          _line.start.copy(points[i2]);
          _line.end.copy(points[ni]);
          if (plane.intersectLine(_line, _vec)) {
            if (foundPoints === 1) {
              if (_vec.distanceTo(_target.start) > EPS) {
                _target.end.copy(_vec);
                foundPoints++;
                break;
              }
            } else {
              _target.start.copy(_vec);
              foundPoints++;
            }
          }
        }
        if (foundPoints === 2) {
          edgesArray.push(..._target.start, ..._target.end);
        }
      }
    });
    const edgeGeom = new BufferGeometry();
    const edgeBuffer = new BufferAttribute(new Float32Array(edgesArray), 3, true);
    edgeGeom.setAttribute("position", edgeBuffer);
    return edgeGeom;
  }
}
export {
  BVH as B,
  MeshBVH as M,
  PlanarIntersectionGenerator as P,
  SAH as S,
  isYProjectedLineDegenerate as a,
  bvhcastEdges as b,
  getTriCount as c,
  getSizeSortedTriList as d,
  g,
  isLineTriangleEdge as i
};
//# sourceMappingURL=PlanarIntersectionGenerator-CnY01ZFG.js.map
