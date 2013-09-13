ChartAPI.Data = {};

/**
 * return back cloned data to callback.
 * @param {!jQuery} jQuery ajax/deffered object
 * @param {=jQuery} jQuery objecto of container element to attach ajax response status message which is required when this keyword has context(not null).
 * @param {Function} callback function
 * @param {=Object} current context
 * @return {object}
 */
ChartAPI.Data.getData = function (obj, $container, callback, ctx) {
  var cloneData, status, def, errorClassName;

  /**
   * simple clone method which is supported only primitives, array and object
   */

  function clone(data) {
    var result, $ = jQuery;
    if ($.isArray(data)) {
      result = [];
      $.each(data, function (i, d) {
        result.push(clone(d));
      });
    } else if ($.isPlainObject(data)) {
      result = {};
      $.each(data, function (k, v) {
        result[k] = clone(v);
      });
    } else {
      result = data;
    }
    return result;
  }

  if (obj) {
    obj.done(function (data) {
      if (!cloneData && data) {
        cloneData = clone(data);
      }
      callback(cloneData);
    });

    if (ctx && $container) {
      obj.fail(function (e) {
        status = {
          '404': 'Data is not found',
          '403': 'Data is forbidden to access'
        };
        def = 'Some error occured in the data fetching process';
        errorClassName = e.status ? 'error-' + e.status : 'error-unknown';
        ctx.$errormsg = jQuery('<div class="error ' + errorClassName + '">' + (status[e.status] || def) + '</div>')
          .appendTo($container);
      })
        .always(function () {
          if (ctx.$progress) {
            ctx.$progress.remove();
          }
        })
        .progress(function () {
          if (!ctx.$progress) {
            ctx.$progress = jQuery('<div class="progress">fetching data...</div>')
              .appendTo($container);
          }
        });
    }
  }
};
/**
 * @param {!object} JSON data to filter
 * @param {!Date|number} maximum threshold value for filtering
 * @param {!Date|number} minimum threshold value for filtering
 * @param {!string} graph unit type (yearly|quater|monthly|weekly|daily|hourly)
 * @param {=number} the number of set of Y data
 * @param {boolean} true if you do not want to unify data into a weekly data.
 * @return {object} filtered JSON data
 */
ChartAPI.Data.filterData = function (data, max, min, u, yLength, noConcat) {
  var str, hash = {};
  yLength = yLength || 1;

  jQuery.each(data, function (i, v) {
    var td, key;
    td = ChartAPI.Date.parse(v.x);
    if (td && td >= min && td <= max) {
      key = noConcat ? ChartAPI.Date.createId(td, 'daily') : function () {
        if (u === 'weekly') {
          td = ChartAPI.Date.getWeekStartday(td);
        }
        return ChartAPI.Date.createId(td, u);
      }();

      hash[key] = hash[key] && !noConcat ? hash[key] : {
        x: v.x
      };
      for (i = 0; i < yLength; i++) {
        str = i ? 'y' + i : 'y';
        hash[key][str] = (hash[key][str] || 0) + ChartAPI.Data.parseFloat(v[str], 10);
      }
    }
  });

  return hash;
};

/**
 * allow parse string with comma
 * @param {string|Number}
 * @return {number}
 */
ChartAPI.Data.parseFloat = function (str) {
  str = (str + '').replace(/,/g, '');
  return parseFloat(str, 10);
};

ChartAPI.Data.addCommas = function (str) {
  str = str.toString();
  while (str != (str = str.replace(/^(-?\d+)(\d{3})/, '$1,$2')));
  return str;
}
