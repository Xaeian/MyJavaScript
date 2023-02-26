//----------------------------------------------------------------------------- JSX
/** @jsx JSX.CreateElement */
/** @jsxFrag JSX.CreateFragment */
const JSX = {
  CreateElement: (tag, props, ...children) => {
    if(typeof tag === "function") {
      if(props) return tag(props, ...children);
      return tag({}, ...children);
    }
    const element = document.createElement(tag);
    Object.entries(props || {}).forEach(([name, value]) => {
      if(name.startsWith("on") && name.toLowerCase() in window) element.addEventListener(name.toLowerCase().substr(2), value);
      else element.setAttribute(name, value.toString());
    });
    children.forEach((child) => {
      JSX.AppendChild(element, child);
    });
    return element;
  },
  AppendChild: (parent, child) => {
    if(Array.isArray(child)) child.forEach((nestedChild) => JSX.AppendChild(parent, nestedChild));
    else if(child) parent.appendChild(child.nodeType ? child : document.createTextNode(child));
  },
  CreateFragment: (props, ...children) => {
    return children;
  },
};

//----------------------------------------------------------------------------- AJAX

var AJAX = {
  printRequest: false,
  printResponse: false,
  printError: true,
  Echo: function (response = true) {
    this.printRequest = true;
    this.printResponse = response;
    this.printError = true;
  },
  /**
   * @param {string} url
   * @param {string} method 
   * @param {null|FormData|object} props form or json object
   * @returns {?string} response of request
   */
  Conn: async function (url, method = "GET", props = null) {
    method = method.toUpperCase();
    let init = { method: method, credentials: "include" };
    if(props) {
      let form = FormData.prototype.isPrototypeOf(props) ? true : false;
      init.headers = { "Content-Type": (form ? "multipart/form-data" : "text/plain") };
      init.mode = "cors";
      init.body = form ? props : JSON.stringify(props);
      if(this.printRequest) console.debug(method, url, props);
    } else {
      if(this.printRequest) console.debug(method, url);
    }
    try {
      const res = await fetch(url, init);
      let data = await res.text();
      if(this.printResponse) console.debug(method, url, data);
      return data;
    } catch (e) {
      if(this.printError) console.debug(e);
      return null;
    }
  },
  /**
   * @param {string} url
   * @param {string} method 
   * @param {null|FormData|object} props form or json object
   * @returns {?object} response of request
   */
  Json: async function (url, method = "GET", props = null) {
    const res = await this.Conn(url, method, props);
    try {
      return await JSON.parse(res);
    } catch (e) {
      if(this.printError) console.debug(method, url, res);
      return null;
    }
  },
  /**
   * @param {string} url
   * @param {string} method 
   * @param {null|FormData|object} props form or json object
   * @param {object} csvProps properties to csv parse
   * @returns {?object} response of request
   */
  Csv: async function (url, method = "GET", props = null, csvProps = {}) {
    const res = await this.Conn(url, method, props);
    let data = await CSV.parse(res, {...csvProps});
    if(this.printResponse) console.debug(method, url, data);
    return data;
  },
  /**
   * @param {object} props
   * @returns {string} url properties
   */
  PropsURL: function (props) {
    let search = "?";
    for (const [key, value] of Object.entries(props)) {
      search += encodeURIComponent(key) + "=" + encodeURIComponent(JSON.stringify(value)) + "&";
    }
    search = search.rctrim("&");
    return search;
  }
};
//----------------------------------------------------------------------------- Element
Element.prototype.setStyles = function (styles) {
  Object.assign(this.style, styles);
};
Element.prototype.dropStyles = function () {
  this.removeAttribute("style");
};
Object.prototype.StyleString = function () {
  let style = "";
  for (const [key, value] of Object.entries(this)) {
    style += key + ":" + value + ";";
  }
  return style;
};
function ClassString(...classList) {
  let css = "";
  classList.forEach((value) => {
    css += value ? value + " ": "";
  });
  return css.rctrim(" ");
};
Element.prototype.Clear = function () {
  while (this.firstChild) {
    this.removeChild(this.lastChild);
  }
};
Element.prototype.Swap = function (content) {
  let clone = this.cloneNode(false);
  clone.appendChildren(content);
  this.Clear();
  this.parentNode.replaceChild(clone, this);
  return clone;
};
Element.prototype.appendChildren = function (children) {
  if(Array.isArray(children)) {
    children.forEach((child) => {
      if(child) this.appendChildren(child);
    });
  }
  else if(children) this.appendChild(children);  
}
Object.prototype.isElement = function () {
  try {
    return this instanceof HTMLElement;
  } catch (e) {
    return typeof obj === "object" && obj.nodeType === 1 && typeof obj.style === "object" && typeof obj.ownerDocument === "object";
  }
};
function dropByClass($name)
{
  let elements = document.getElementsByClassName($name);
  for (let element of elements) {
    element.parentNode.removeChild(element);
  }
}
function dropById($name)
{
  let element = document.getElementById($name);
  if(element) element.parentNode.removeChild(element);
}

//----------------------------------------------------------------------------- Other
String.prototype.cssPercentPx = function () {
  let percent = 0,
    px = 0;
  let split = this.split(" ");
 
  split.forEach((value) => {
    if(value.indexOf("%") != -1) percent = Number(value.replace(",", ".").replace(/[^0-9\.]+/g, "")) / 100;
    else if(value.indexOf("px") != -1) px = Number(value.replace(",", ".").replace(/[^0-9\.]+/g, ""));
  });
  return { percent: percent, px: px };
};
window.location.get = () => {
  let search = window.location.search.replace(/^\?/gi, "");
  let ary = search.split("&");
  let obj = {};
  for (const i in ary) {
    let x = ary[i].split("=");
    obj[x[0]] = x[1];
  }
  return obj;
};
String.prototype.toFile = function (name) {
  let link = document.createElement("a");
  link.setAttribute("target", " _blank");
  if(Blob !== undefined) {
    let blob = new Blob([this], { type: "text/plain" });
    link.setAttribute("href", URL.createObjectURL(blob));
  } else link.setAttribute("href", "data:text/plain" + "," + encodeURIComponent(text));
  link.setAttribute("download", name);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
String.prototype.getWidth = function (font_type = "sans-serif", font_weight = "400", font_size = "12px") {
  let div = document.createElement("div");
  div.style.fontFamily = font_type;
  div.style.fontWeight = font_weight;
  div.style.fontSize = font_size;
  div.style.backgroundColor = "red";
  div.style.float = "left";
  div.innerHTML = this;
  document.body.appendChild(div);
  let width = div.clientWidth;
  document.body.removeChild(div);
  return width;
};
function getUniqueID(count, prefix = "_") {
  let id = prefix + randString(count);
  while (document.getElementById(id)) id = prefix + randString(count);
  return id;
}
function getUniqueName(count, prefix = "_") {
  let name = prefix + randString(count);
  while (document.getElementsByName(name).length > 0) name = prefix + randString(count);
  return name;
}

//----------------------------------------------------------------------------- Cookie

Storage.prototype.setObject = function (key, object) {
  this.setItem(key, JSON.stringify(object));
};
Storage.prototype.getObject = function (key) {
  return JSON.parse(this.getItem(key));
};
const Cookie = {
  sec: 1440,
  prefix: "@expires-",
  secure: true,
  sameSite: "None",
  setValue: (key, value, sec = Cookie.sec) => {
    let expires = new Date();
    expires.setTime(expires.getTime() + 1000 * sec);
    document.cookie = key + "=" + value + ";expires=" + expires.toUTCString() + ";SameSite=" + Cookie.sameSite + ";" + (Cookie.secure ? "Secure;" : "");
  },
  getValue: (key) => {
    let key_value = document.cookie.match("(^|;) ?" + key + "=([^;]*)(;|$)");
    return key_value ? key_value[2] : null;
  },
  dropValue: (key) => {
    Cookie.setValue(key, "", 0);
  },
  setObject: (key, object, sec = Cookie.sec) => {
    localStorage.setObject(key, object);
    localStorage.setItem(Cookie.prefix + key, new Date().getTime() / 1000 + sec);
  },
  getObject: (key) => {
    let object = localStorage.getObject(key);
    if(!object) return null;
    let expires = localStorage.getItem(Cookie.prefix + key);
    if(expires) {
      let sec = new Date().getTime() / 1000 - expires;
      if(sec < 0) return object;
      localStorage.removeItem(Cookie.prefix + key);
    }
    localStorage.removeItem(key);
    return null;
  },
  removeObject: (key) => {
    localStorage.removeItem(key);
    localStorage.removeItem(Cookie.prefix + key);
  },
  clear: () => {
    localStorage.clear();
  },
};
// Cookie.setValue('value', 1);
// console.log(Cookie.getValue("value"))
// localStorage.setObject('object', { 'id': 2, 'name': 'Xaeian' });
// console.log(localStorage.getObject('object'));

//----------------------------------------------------------------------------- Correct
String.prototype.CorrectOnkey = function (mode, precision = 3, mathMode = "+") {
  let minus = "";
  switch (mode.toLowerCase()) {
    case "uint":
      str = this.replace(/\D+/g, "");
      str = str.replace(/^0+/g, "0");
      if(/^0+[1-9]+/.exec(str)) str = str.replace(/^0+/g, "");
      return str;
    case "uint":
      str = this.replace(/[^\d\-]/g, "");
      if(/^\-+/.exec(str)) {
        str = str.replace(/\-/g, "");
        minus = "-";
      }
      return minus + str.correct.uint();
    case "int":
      str = this.replace(/[^\d\-]/g, "");
      if(/^\-+/.exec(str)) {
        str = str.replace(/\-/g, "");
        minus = "-";
      }
      return minus + str.correct.uint();
    case "ufloat":
      str = this.replace(",", ".");
      str = this.replace(/[^\d\.]/g, "");
      str = this.replace(/\.+/g, ".");
      var x = str.split(".", 2);
      x[0] = x[0].correct.uint();
      if(typeof x[1] == "undefined") str = x[0].toString();
      else {
        x[1] = x[1].substr(0, precision);
        str = x[0].toString() + "." + x[1];
      }
      return str;
    case "float":
      str = this.replace(",", ".");
      str = str.replace(/[^\d\.\-]/g, "");
      if(/^\-+/.exec(str)) {
        str = str.replace(/\-/g, "");
        minus = "-";
      }
      return minus + str.correct.ufloat();
    case "date":
      str = this.replace(/[\ \.\/\\]+/g, "-");
      str = str.replace(/[^\d\-]/g, "");

      var x = str.split("-", 3);
      x[0] = x[0].substr(0, 4);
      str = x[0];
      if(typeof x[1] != "undefined") {
        x[1] = x[1].substr(0, 2);
        str += "-" + x[1];
      }
      if(typeof x[2] != "undefined") {
        if(x[0].length > 2) x[2] = x[2].substr(0, 2);
        else x[2] = x[2].substr(0, 4);
        str += "-" + x[2];
      }
      return str;
    case "math":
      str = this.replace(",", ".");
      str = str.replace(/[^0-9\.\+\-\*\/\%]+/g, "");
      if(mathMode == "-") {
        if(/^\-+/.exec(str)) {
          str = str.replace(/^\-/g, "");
          minus = "-";
        }
      } else str = str.replace(/^\-/g, "");
      let regex;
      var y = str.match(/[\+\-\*\/]/);
      if(y != null) {
        y = y[0];
        regex = new RegExp("\\.\\" + y, "");
        str = str.replace(regex, y);
        var x = str.split(y, 2);
      } else {
        var x = [];
        x[0] = str;
      }
      if(mode == "-") x[0] = x[0].correct.ufloat();
      else x[0] = x[0].correct.float();
      str = minus + x[0];
      if(typeof x[1] != "undefined") {
        regex = /\%+$/;
        var pc = "";
        if(regex.exec(x[1])) {
          x[1] = x[1].replace(/\%/g, "");
          pc = "%";
        }
        x[1] = vKEY_uFloat(x[1], precision);
        str += y + x[1] + pc;
      }
      return str;
  }
};
String.prototype.CorrectOnfocus = function (mode, offset = 0) {
  switch (mode.toLowerCase()) {
    case "date":
      if(str == "") {
        var today = new Date();
        if(offset) today.setDate(today.getDate() + offset);
        var D = today.getDate();
        var M = today.getMonth() + 1;
        var Y = today.getFullYear();
        if(D < 10) D = "0" + D;
        if(M < 10) M = "0" + M;
        str = Y + "-" + M + "-" + D;
      }
      return str;
    case "uint":
    case "int":
    case "ufloat":
    case "float":
    case "math":
      str = this;
      if(!parseFloat(this)) str = "";
      return str;
  }
};
