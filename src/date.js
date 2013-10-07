ChartAPI.Date = {};

/**
 * return the week start day
 * @param {!Date}
 * @return Date
 */
ChartAPI.Date.getWeekStartday = function (d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay());
};

/**
 * return Date string array with padding zero which is for ISO 8601 string
 * @param {!Date}
 * @param {!string} unit type (yearly|quarter|monthly|weekly|daily|hourly)
 * @return {Array.<string>}
 */
ChartAPI.Date.zeroPadArray = function (d, unit) {
  var array;
  ({
    'yearly': function () {
      array = [d.getFullYear()];
    },
    'monthly': function () {
      array = [d.getFullYear(), d.getMonth() + 1];
    },
    'quarter': function () {
      array = [d.getFullYear(), d.getMonth() + 1];
    },
    'weekly': function () {
      array = [d.getFullYear(), d.getMonth() + 1, d.getDate() - d.getDay()];
    },
    'daily': function () {
      array = [d.getFullYear(), d.getMonth() + 1, d.getDate()];
    },
    'hourly': function () {
      array = [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours()];
    }
  })[unit]();
  return jQuery.map(array, function (v) {
    v = v.toString();
    return v.length === 1 ? '0' + v : v;
  });
};

/**
 * return uniformalized Date string to use kinds of Date ID
 * @param {!Date}
 * @param {!string} unit type (yearly|quarter|monthly|weekly|daily|hourly)
 * @return {string}
 */
ChartAPI.Date.createId = function (d, u) {
  return ChartAPI.Date.zeroPadArray(d, u).join('');
};

/**
 * return uniformalized Date string to use kinds of Date label
 * @param {!Date}
 * @param {!string} unit type (yearly|quarter|monthly|weekly|daily|hourly)
 * @return {string}
 */
ChartAPI.Date.createXLabel = function (d, u) {
  var hour, str, array = ChartAPI.Date.zeroPadArray(d, u);
  if (u === 'hourly') {
    hour = array.pop();
    str = array.join('-') + ' ' + hour + ':00';
  } else {
    str = array.join('-');
  }
  return str;
};

/**
 * parse argument and return back Date object
 * reformeded date string and try again when Date.parser returns NaN or Invalid
 * @param {Date|number|string|null}
 * @return {Date|null}
 */
ChartAPI.Date.parse = function (d) {
  var date;
  if (!d || d instanceof Date) {
    date = d || null;
  } else if (typeof d === 'number') {
    date = new Date(d);
  } else {
    date = new Date(Date.parse(d.toString()));
  }
  if (date && /NaN|Invalid Date/.test(date.toString())) {
    var arr, today = new Date();
    arr = d.toString().split(/[T\s]/);
    date = arr[0].split(/\D/);

    var year, month, day;
    year = parseInt(date[0], 10) || today.getFullYear();
    year = year < 100 ? year + 1900 : year;
    month = date[1] ? parseInt(date[1], 10) - 1 : 0;
    day = parseInt(date[2], 10) || 1;

    var time, timezone, timezoneOffset;

    if (arr[1]) {
      var arr2 = arr[1].split(/[\+\-Z]/);
      time = arr2[0] ? arr2[0].split(/[:\.]/) : [0, 0, 0, 0];
      if (/Z$/.test(d)) {
        timezoneOffset = 0;
      } else {
        timezone = arr2[1] ? arr2[1].split(/\D/) : [0, 0];
        var sym = /\+/.test(arr[1]) ? -1 : 1;
        timezoneOffset = sym * ((parseInt(timezone[0], 10) || 0) * 60 + (parseInt(timezone[1], 10) || 0));
      }
    } else {
      time = [0, 0, 0];
      /* if the string is like ISO8601 date-only, use UTC (follows ES5 convention) */
      timezoneOffset = /\d{4}-\d{2}-\d{2}/.test(arr[0]) ? 0 : today.getTimezoneOffset();
    }

    var hour, minute, second, millisecond;
    hour = parseInt(time[0], 10) || 0;
    minute = parseInt(time[1], 10) || 0;

    second = parseInt(time[2], 10) || 0;
    millisecond = parseInt(time[3], 10) || 0;

    date = new Date(year, month, day, hour, minute, second, millisecond);

    if (timezoneOffset !== today.getTimezoneOffset()) {
      var utc = date.valueOf() - today.getTimezoneOffset() * 1000 * 60;
      date = new Date(utc + timezoneOffset * 1000 * 60);
    }
  }
  return date;
};

/**
 * @param  {Date|String} date Date class to get end date of month
 * @return {Date}      last date of month
 */
ChartAPI.Date.getEndOfMonth = function (date) {
  date = date instanceof Date ? date : (ChartAPI.Date.parse(date) || date);
  if (date instanceof Date) {
    var month = date.getMonth();
    date = new Date((new Date(date.getFullYear(), month + 1, 1, 0, 0, 0)) - 1);
  }
  return date;
};

/**
 * @param {!Date}
 * @param {!number} number of data
 * @param {!string} unit type (yearly|quarter|monthly|weekly|daily|hourly)
 * @param {boolean} calculates as start date when true
 * @return {Date}
 */
ChartAPI.Date.calcDate = function (date, l, u, sym) {
  var y, m, d, h;
  y = date.getFullYear();
  m = date.getMonth();
  d = date.getDate();
  h = 0;
  l = l - 1;
  sym = sym ? -1 : 1;

  var adjustEndDate = function () {
    if (d > 27) {
      var endOfMonth = ChartAPI.Date.getEndOfMonth((new Date(y, m, 27, h)));
      if (endOfMonth.getDate) {
        endOfMonth = endOfMonth.getDate();
        d = d > endOfMonth ? endOfMonth : d;
      }
    }
  };

  ({
    'yearly': function () {
      y = y + (sym * l);
      adjustEndDate();
    },
    'monthly': function () {
      m = m + (sym * l);
      adjustEndDate();
    },
    'quarter': function () {
      m = m + (sym * l * 3);
      adjustEndDate();
    },
    'weekly': function () {
      d = d + (sym * l * 7) - date.getDay();
    },
    'daily': function () {
      d = d + (sym * l);
    },
    'hourly': function () {
      h = date.getHours() + (sym * l);
    }
  })[u]();
  return new Date(y, m, d, h);
};
