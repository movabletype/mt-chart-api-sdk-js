describe('range', function () {

  var unitMap = {
    monthly: 'month',
    weekly: 'week',
    daily: 'day',
    hourly: 'hour',
    yearly: 'year',
    quater: 'month'
  }

  describe('default range with unit', function () {
    function defaultCheck(range, opt, length) {
      expect(range.length).toEqual(length || 10);
      expect(range.maxLength).toEqual(90);
      expect(range.min).toEqual(range.start);
      var expEndDate = moment().format('YYYYMMDD');
      expect(moment(range.end).format('YYYYMMDD')).toEqual(expEndDate);
      expect(moment(range.max).format('YYYYMMDD')).toEqual(expEndDate);
      expect(range.dataType).toEqual('timeline');
      expect(range.isTimeline).toBe(true);
      expect(range.unit).toEqual(opt.unit)
    }

    it('default Range (default)', function () {
      var range = ChartAPI.Range.factory();
      expect(range.unit).toEqual('monthly');
      expect(range.start).toEqual(moment().subtract('month', 9).startOf('month').toDate());
      defaultCheck(range, {
        unit: 'monthly'
      });
    });

    _.each(['weekly', 'yearly'], function (unit) {
      it(unit, function () {
        var opt = {
          unit: unit
        };
        var range = ChartAPI.Range.factory(opt);
        expect(range.start).toEqual(moment().subtract(unitMap[unit], 9).startOf(unitMap[unit]).toDate());
        defaultCheck(range, opt);
      });
    })

    it('quarter', function () {
      var opt = {
        unit: 'quarter'
      };
      var range = ChartAPI.Range.factory(opt);
      expect(range.start).toEqual(moment().subtract('month', 9 * 4).startOf('month').toDate());
      defaultCheck(range, opt);
    });

    it('daily', function () {
      var opt = {
        unit: 'daily'
      }
      var range = ChartAPI.Range.factory(opt);
      expect(range.start).toEqual(moment().subtract('day', 8).startOf('day').toDate());
      defaultCheck(range, opt);
    });

    it('hourly', function () {
      var opt = {
        unit: 'hourly'
      }
      var range = ChartAPI.Range.factory(opt);
      expect(range.start).toEqual(moment().subtract('hour', 22).startOf('hour').toDate());
      defaultCheck(range, opt, 24);
    });
  });

  describe('generate with length and start date', function () {
    function defaultCheck(range, length, unit, expEndDate) {
      expect(range.unit).toEqual(unit);
      expect(range.length).toEqual(length || 10);
      expect(range.maxLength).toEqual(90);
      expect(range.end).toEqual(expEndDate);
      expect(range.max).toEqual(expEndDate);
      expect(range.dataType).toEqual('timeline');
      expect(range.isTimeline).toBe(true);
    }

    it('monthly', function () {
      var range = ChartAPI.Range.factory({
        unit: 'monthly',
        start: moment().subtract('month', 20).toDate(),
        length: 5
      });
      expect(range.min).toEqual(moment(range.start).startOf('month').toDate());
      defaultCheck(range, 5, 'monthly', moment().subtract('month', 16).endOf('month').toDate());
    });

    it('weekly', function () {
      var range = ChartAPI.Range.factory({
        unit: 'weekly',
        start: moment().subtract('week', 20).toDate(),
        length: 5
      });
      expect(range.min).toEqual(moment(range.start).startOf('week').toDate());
      defaultCheck(range, 5, 'weekly', moment().subtract('week', 16).endOf('week').toDate());
    });

    it('daily', function () {
      var range = ChartAPI.Range.factory({
        unit: 'daily',
        start: moment().subtract('day', 20).toDate(),
        length: 5
      });
      expect(range.min).toEqual(moment(range.start).startOf('day').toDate());
      defaultCheck(range, 5, 'daily', moment().subtract('day', 17).endOf('day').toDate());
    });

    it('yearly', function () {
      var range = ChartAPI.Range.factory({
        unit: 'yearly',
        start: moment().subtract('year', 20).toDate(),
        length: 5
      });
      expect(range.min).toEqual(moment(range.start).startOf('year').toDate());
      defaultCheck(range, 5, 'yearly', moment().subtract('year', 16).endOf('year').toDate());
    });

    it('quarter', function () {
      var range = ChartAPI.Range.factory({
        unit: 'quarter',
        start: moment().subtract('month', 20 * 4).toDate(),
        length: 5
      });
      expect(range.min).toEqual(moment(range.start).startOf('month').toDate());
      defaultCheck(range, 5, 'quarter', moment().subtract('month', 16 * 4).endOf('month').toDate());
    });

    it('hourly', function () {
      var range = ChartAPI.Range.factory({
        unit: 'hourly',
        start: moment().subtract('hour', 20).toDate(),
        length: 5
      });
      expect(range.min).toEqual(moment(range.start).startOf('hour').toDate());
      defaultCheck(range, 5, 'hourly', moment().subtract('hour', 17).endOf('hour').toDate());
    });

  });

  describe('generate with length and end date', function () {
    function defaultCheck(range, length, unit, expStartDate) {
      expect(range.unit).toEqual(unit);
      expect(range.length).toEqual(length || 10);
      expect(range.maxLength).toEqual(90);
      expect(range.start).toEqual(expStartDate);
      expect(range.min).toEqual(expStartDate);
      expect(range.dataType).toEqual('timeline');
      expect(range.isTimeline).toBe(true);
    }

    it('monthly', function () {
      var range = ChartAPI.Range.factory({
        unit: 'monthly',
        end: moment().subtract('month', 20).toDate(),
        length: 5
      });
      expect(range.max).toEqual(moment(range.end).endOf('month').toDate());
      defaultCheck(range, 5, 'monthly', moment().subtract('month', 24).startOf('month').toDate());
    });

    it('weekly', function () {
      var range = ChartAPI.Range.factory({
        unit: 'weekly',
        end: moment().subtract('week', 20).toDate(),
        length: 5
      });
      expect(range.max).toEqual(moment(range.end).endOf('week').toDate());
      defaultCheck(range, 5, 'weekly', moment().subtract('week', 24).startOf('week').toDate());
    });

    it('daily', function () {
      var range = ChartAPI.Range.factory({
        unit: 'daily',
        end: moment().subtract('day', 20).toDate(),
        length: 5
      });
      expect(range.max).toEqual(moment(range.end).endOf('day').toDate());
      defaultCheck(range, 5, 'daily', moment().subtract('day', 23).startOf('day').toDate());
    });

    it('yearly', function () {
      var range = ChartAPI.Range.factory({
        unit: 'yearly',
        end: moment().subtract('year', 20).toDate(),
        length: 5
      });
      expect(range.max).toEqual(moment(range.end).endOf('year').toDate());
      defaultCheck(range, 5, 'yearly', moment().subtract('year', 24).startOf('year').toDate());
    });

    it('quarter', function () {
      var range = ChartAPI.Range.factory({
        unit: 'quarter',
        end: moment().subtract('month', 20 * 4).toDate(),
        length: 5
      });
      expect(range.max).toEqual(moment(range.end).endOf('month').toDate());
      defaultCheck(range, 5, 'quarter', moment().subtract('month', 24 * 4).startOf('month').toDate());
    });

    it('hourly', function () {
      var range = ChartAPI.Range.factory({
        unit: 'hourly',
        end: moment().subtract('hour', 20).toDate(),
        length: 5
      });
      expect(range.max).toEqual(moment(range.end).endOf('hour').toDate());
      defaultCheck(range, 5, 'hourly', moment().subtract('hour', 23).startOf('hour').toDate());
    });
  });

  describe('generate with start and end date', function () {
    function defaultCheck(range, opt, u) {
      expect(range.start).toEqual(opt.start);
      expect(range.end).toEqual(opt.end);
      expect(range.unit).toEqual(opt.unit);
      expect(range.maxLength).toEqual(90);
      expect(range.max).toEqual(moment(opt.end).endOf(u).toDate());
      expect(range.min).toEqual(moment(opt.start).startOf(u).toDate());
      expect(range.length).toEqual(15);
      expect(range.dataType).toEqual('timeline');
      expect(range.isTimeline).toBe(true);
    }

    _.each(['monthly', 'weekly', 'daily', 'hourly', 'yearly'], function (unit) {
      it(unit, function () {
        var today = moment();
        var opt = {
          unit: unit,
          start: moment(today).subtract(unitMap[unit], 20).toDate(),
          end: moment(today).subtract(unitMap[unit], 6).toDate()
        }
        var range = ChartAPI.Range.factory(opt);
        defaultCheck(range, opt, unitMap[unit]);
      });
    });

    it('quarter', function () {
      var opt = {
        unit: 'quarter',
        start: moment().subtract('month', 20 * 4).toDate(),
        end: moment().subtract('month', 6 * 4).toDate()
      }
      var range = ChartAPI.Range.factory(opt);
      defaultCheck(range, opt, 'month');
    });
  });

  describe('max length', function () {
    function defaultCheck(range, opt) {
      expect(range.end).toEqual(opt.end);
      expect(range.unit).toEqual(opt.unit);
      expect(range.maxLength).toEqual(opt.maxLength);
      expect(range.length).toEqual(opt.maxLength);
      expect(range.dataType).toEqual('timeline');
      expect(range.isTimeline).toBe(true);
    }

    it('max length restricts length', function () {
      var opt = {
        unit: 'monthly',
        length: 20,
        maxLength: 5,
        end: moment().subtract('month', 3).toDate()
      }
      var range = ChartAPI.Range.factory(opt);
      expect(range.start).toEqual(moment().subtract(unitMap[opt.unit], 7).startOf('day').toDate());
      expect(range.max).toEqual(moment(opt.end).endOf(unitMap[opt.unit]).toDate());
      expect(range.min).toEqual(moment().subtract(unitMap[opt.unit], 7).startOf(unitMap[opt.unit]).toDate());
      defaultCheck(range, opt);
    });

    _.each(['monthly', 'weekly', 'daily', 'hourly', 'yearly'], function (unit) {
      it('max length changes start date:' + unit, function () {
        var opt = {
          unit: unit,
          maxLength: 5,
          end: moment().subtract(unitMap[unit], 3).toDate(),
          start: moment().subtract(unitMap[unit], 13).toDate()
        };
        var range = ChartAPI.Range.factory(opt);
        var startUnitMap = {
          monthly: 'day',
          weekly: 'week',
          daily: 'day',
          hourly: 'hour',
          yearly: 'day',
          quater: 'day'
        }
        expect(range.start).toEqual(moment().subtract(unitMap[opt.unit], 7).startOf(startUnitMap[opt.unit]).toDate());
        expect(range.max).toEqual(moment(opt.end).endOf(unitMap[opt.unit]).toDate());
        expect(range.min).toEqual(moment().subtract(unitMap[opt.unit], 7).startOf(unitMap[opt.unit]).toDate());
        defaultCheck(range, opt);
      });
    });

    /* assume window width on phantomJS is 400px */
    if ($(window).width() === 400) {
      it('autoSized option', function () {
        var opt = {
          unit: 'daily',
          length: 30,
          end: moment().subtract('day', 3).toDate(),
          autoSized: true
        }

        var range = ChartAPI.Range.factory(opt);
        expect(range.maxLength).toEqual(9);
        expect(range.length).toEqual(9);
        expect(range.start).toEqual(moment().subtract('day', 10).startOf('day').toDate());
        expect(range.end).toEqual(opt.end);
        expect(range.unit).toEqual(opt.unit);
        expect(range.max).toEqual(moment(opt.end).endOf('day').toDate());
        expect(range.min).toEqual(moment().subtract('day', 10).startOf('day').toDate());
        expect(range.dataType).toEqual('timeline');
        expect(range.isTimeline).toBe(true);
      });
    }
  });

  it('start date should be before end date', function () {
    var today = moment();
    var opt = {
      unit: 'daily',
      start: moment(today).subtract('day', 5).toDate(),
      end: moment(today).subtract('day', 10).toDate()
    }
    var range = ChartAPI.Range.factory(opt);
    expect(range.start).toEqual(opt.end);
    expect(range.end).toEqual(opt.end);
    expect(range.unit).toEqual(opt.unit);
    expect(range.maxLength).toEqual(90);
    expect(range.max).toEqual(moment(opt.end).endOf('day').toDate());
    expect(range.min).toEqual(moment(opt.end).startOf('day').toDate());
    expect(range.length).toEqual(1);
    expect(range.dataType).toEqual('timeline');
    expect(range.isTimeline).toBe(true);
  });

  it('end date should be before current time', function () {
    var today = moment();
    var opt = {
      unit: 'daily',
      start: moment(today).subtract('day', 5).toDate(),
      end: moment(today).add('day', 10).toDate()
    }
    var range = ChartAPI.Range.factory(opt);
    var expEndDate = moment().format('YYYYMMDD');
    expect(range.start).toEqual(opt.start);
    expect(moment(range.end).format('YYYYMMDD')).toEqual(expEndDate);
    expect(range.unit).toEqual(opt.unit);
    expect(range.maxLength).toEqual(90);
    expect(moment(range.max).format('YYYYMMDD')).toEqual(expEndDate);
    expect(range.min).toEqual(moment(opt.start).startOf('day').toDate());
    expect(range.length).toEqual(6);
    expect(range.dataType).toEqual('timeline');
    expect(range.isTimeline).toBe(true);
  });
});
