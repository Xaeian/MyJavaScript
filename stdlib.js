//----------------------------------------------------------------------------- Stdlib
function isNotSet(subject) {
  return typeof subject === "undefined" || subject === null;
}
function isSet(subject) {
  return !(typeof subject === "undefined" || subject === null);
}
function IsNumber(value)
{
  if(value.match(/^\-?[0-9]*\.?[0-9]+$/)) {
    if(!value.match(/^\-?0[0-9]+\.?[0-9]+$/)) return true;
    return false;
  }
  return false;
}
function randString(count) {
  var symbols = "0123456789abcdefghijklmnopqrstuvwxyz";
  var string = "";
  for (var i = 0; i < count; i++) string += symbols[parseInt(Math.random() * symbols.length)];
  return string;
}
function randNumber(count) {
  var symbols = "0123456789";
  var number = "";
  for (var i = 0; i < count; i++) number += symbols[parseInt(Math.random() * symbols.length)];
  return number;
}
Array.prototype.drop = function (drop) {
  this.forEach((element, index) => {
    if (element == drop) {
      this.splice(index, 1);
    }
  });
}
Array.prototype.dropByItem = function (item, value) {
  this.forEach((element, index) => {
    if (element[item] == value) {
      this.splice(index, 1);
    }
  });
}
String.prototype.ctrim = function (chars) {
  let re = new RegExp("^[" + chars + "]+|[" + chars + "]+$", "g");
  return this.replace(re, "");
}
String.prototype.lctrim = function (chars) {
  let re = new RegExp("^[" + chars + "]+");
  return this.replace(re, "");
}
String.prototype.rctrim = function (chars) {
  let re = new RegExp("[" + chars + "]+$");
  return this.replace(re, "");
}
String.prototype.removeSuffix = function (suffix) {
  return this.replace(new RegExp(suffix + "$"), "");
};
String.prototype.removePrefix = function (prefix) {
  return this.replace(new RegExp("^" + prefix), "");
};
function type(value) {
  if(typeof value === "string" || value instanceof String) return "string";
}
String.prototype.replacePL = function () {
  return this.replace(/ą/g, "a")
    .replace(/Ą/g, "A")
    .replace(/ć/g, "c")
    .replace(/Ć/g, "C")
    .replace(/ę/g, "e")
    .replace(/Ę/g, "E")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .replace(/ń/g, "n")
    .replace(/Ń/g, "N")
    .replace(/ó/g, "o")
    .replace(/Ó/g, "O")
    .replace(/ś/g, "s")
    .replace(/Ś/g, "S")
    .replace(/ż/g, "z")
    .replace(/Ż/g, "Z")
    .replace(/ź/g, "z")
    .replace(/Ź/g, "Z");
};
String.prototype.colorModyfi = function (multiplier, addition) {
  let color = this.replace("#", "");
  let ary = [];
  if (color.length == 3) {
    ary[0] = color.substring(0, 1);
    ary[1] = color.substring(1, 2);
    ary[2] = color.substring(2, 3);
    ary[0] = ary[0] + ary[0];
    ary[1] = ary[1] + ary[1];
    ary[2] = ary[2] + ary[2];
  } else if (color.length == 6) {
    ary[0] = color.substring(0, 2);
    ary[1] = color.substring(2, 4);
    ary[2] = color.substring(4, 6);
  } else return "#FFF";
  for (let i = 0; i < 3; i++) {
    ary[i] = parseInt(ary[i], 16);
    ary[i] = (ary[i] * (100 + multiplier)) / 100 + addition;
    if (ary[i] > 255) ary[i] = 255;
    else if (ary[i] < 0) ary[i] = 0;
    ary[i] = Math.round(ary[i]).toString(16);
    if (ary[i].length < 2) ary[i] = "0" + ary[i];
  }
  return "#" + ary[0] + ary[1] + ary[2];
};
String.prototype.colorDark = function (multiplier = 25, addition = multiplier) {
  return this.colorModyfi(-multiplier, -addition);
};
String.prototype.colorLight = function (multiplier = 25, addition = multiplier) {
  return this.colorModyfi(multiplier, addition);
};
String.prototype.toStamp = function () {
  if(IsNumber(this)) return 1000 * parseFloat(this);
  else return new Date(this).getTime();
};
Number.prototype.toDatetime = function () {
  if (!this) return null;
  var d = new Date(this);
  return (
    d.getFullYear() +
    "-" +
    ("0" + (d.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + d.getDate()).slice(-2) +
    " " +
    ("0" + d.getHours()).slice(-2) +
    ":" +
    ("0" + d.getMinutes()).slice(-2) +
    ":" +
    ("0" + d.getSeconds()).slice(-2)
  );
};
String.prototype.htmlentities = function (entQuotes = true) {
  let str = this.replace(/[\u00A0-\u9999<>\&]/g, function (i) {
    return "&#" + i.charCodeAt(0) + ";";
  });
  str = str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  if (entQuotes) str = str.replace("'", "&#039;").replace('"', "&quot;");
  return str;
};

//----------------------------------------------------------------------------- CSV
const CSV = {
  defaultProps: {
    sep: ",",
    offset: 0,
    length: null, // row limit
    head: null // only for stringify
  },
  _getStartEnd: function (offset, length, limit) {
    let start = offset;
    let end = (length) ? offset + length : limit; 
    if(end > limit) end = limit;
    return [start, end]
  },
  /**
   * @param {string} string csv content
   * @param {object} props csv properties
   * @returns 
   */
  parse: function (string, props = {}) {
    if(!string || string.toLowerCase() == "null") return null;
    props = { ...this.defaultProps, ...props };
    string = string.trim().replace(/[\r\n]+/g, "\n");
    let rows = string.split("\n");
    const regx = new RegExp("\\" + props.sep + "$");
    rows.forEach((value, i) => { rows[i] = value.replace(regx, ""); });
    let [start, end] = this._getStartEnd(props.offset, props.length, rows.length);
    let row, array = [];
    for (let i = start; i < end; i++) {
      array[i - start] = [];
      row = rows[i].split(props.sep);
      row.forEach((value, j) => {
        if(value == "") value = null;
        array[i - start][j] = value;
      });
    }
    return array;
  },
  /**
   * @param {array} string data 2D array
   * @param {object} props csv properties
   * @returns 
   */
  stringify: function (array, props = {}) {
    props = { ...this.defaultProps, ...props };
    let [start, end] = this._getStartEnd(props.offset, props.length, array.length);
    let string = "";

    if(props.head) {
      props.head.forEach((value) => {
        string += value + props.sep;
      });
      string = string.removeSuffix(props.sep);
      string += "\n";
    }
    for (let i = start; i < end; i++) {
      array[i].forEach((value) => {
        string += value + props.sep;
      });
      string = string.removeSuffix(props.sep);
      string += "\n";
    }
    return string;
  },
};

//----------------------------------------------------------------------------- Time
class Time extends Date {
  constructor(time) {
    if(IsNumber(time)) {
      super(time * 1000);
    }
    else if(this.isInterval(time)) {
      super();
      this.setInterval(time);
    }
    else if(this.isIntervals(time)) {
      super();
      this.setIntervals(time);
    }
    else super(time);
  }
  getString() {
    return this.getFullYear() + "-" +
    ("0" + (d.getMonth() + 1)).slice(-2) + "-" +
    ("0" + d.getDate()).slice(-2) + " " +
    ("0" + d.getHours()).slice(-2) + ":" +
    ("0" + d.getMinutes()).slice(-2) + ":" +
    ("0" + d.getSeconds()).slice(-2);
  }
  static isInterval(interval) {
    if(interval.trim().match(/^(\-|\+)?[0-9]*\.?[0-9]+(y|mo|w|d|h|m|s|ms|µs|us)$/)) return true;
    return false;
  }
  static isIntervals(interval) {
    if(interval.trim().match(/^((\-|\+)?[0-9]*\.?[0-9]+(y|mo|w|d|h|m|s|ms|µs|us) ?)*$/)) return true;
    return false;
  }
  setInterval(interval) {
    let value = interval.match(/\-?[0-9]*\.?[0-9]+/);
    if(isSet(value[0])) value = value[0];
    else value = 0;
    interval = interval.toLowerCase();
    let factor = interval.replace(/[^a-z]/);
    switch(factor) {
      case "y": this.setFullYear(this.getFullYear() + value); break;
      case "mo": this.setMonth(this.getMonth() + value); break;
      case "w": this.setDate(this.getDate() + (7 * value)); break;
      case "d": this.setDate(this.getDate() + value); break;
      case "h": this.setHours(this.getHours() + value); break;
      case "m": this.setMinutes(this.getMinutes() + value); break;
      case "s": this.setSeconds(this.getSeconds() + value); break;
      case "ms": this.setMilliseconds(this.getMilliseconds() + value); break;
      case "us": case "µs": this.setMilliseconds(this.getMilliseconds() + value / 1000); break;
    }
    return
  }
  setIntervals(intervals)
  {
    intervals = intervals.trim().split(/[\s]+/);
    intervals.forEach((interval) => {
      this.setInterval(interval);
    });
  }
}

//--------------------------------------------------------------------------------------------------------------------- Valid
String.prototype.Valid = function (mode) {
  switch (mode.toLowerCase()) {
    case "password":
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(\W|_)).{5,}$/.test(this);
    case "email":
      return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        this
      );
  }
};
