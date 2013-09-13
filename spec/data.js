describe('data', function () {
  describe('getData', function () {
    it('string', function () {
      var flag, data, obj = $.Deferred(),
        str = 'lorem ipsum';
      obj.resolve(str);
      ChartAPI.Data.getData(obj, null, function (cloneData) {
        data = cloneData;
        flag = true;
      });
      waitsFor(function () {
        return flag;
      });
      runs(function () {
        expect(data).toEqual(str);
      });
    });

    it('array', function () {
      var flag, data, obj = $.Deferred(),
        str = ['lorem', 'ipsum', {
          foo: 'bar'
        }];
      obj.resolve(str);
      ChartAPI.Data.getData(obj, null, function (cloneData) {
        data = cloneData;
        flag = true;
      });
      waitsFor(function () {
        return flag;
      });
      runs(function () {
        expect(data[0]).toEqual('lorem');
        expect(data[1]).toEqual('ipsum');
        expect(data[2].foo).toEqual('bar');
        data[2].foo = 'baz';
        expect(data[2].foo).toEqual('baz');
        expect(str[2].foo).toEqual('bar');
      });
    });

    it('deep array', function () {
      var flag, data, obj = $.Deferred(),
        str = [
          'lorem', ['ipsum'],
          [{
            foo: 'bar',
            bar: ['baz', {
              baz: 'zzz'
            }]
          }]
        ];
      obj.resolve(str);
      ChartAPI.Data.getData(obj, null, function (cloneData) {
        data = cloneData;
        flag = true;
      });
      waitsFor(function () {
        return flag;
      });
      runs(function () {
        expect(data[0]).toEqual('lorem');
        expect(data[1]).toEqual(['ipsum']);
        expect(data[2][0].foo).toEqual('bar');
        expect(data[2][0].bar[0]).toEqual('baz');
        expect(data[2][0].bar[1].baz).toEqual('zzz');
        data[2][0].bar[1].baz = 'foobar';
        expect(data[2][0].bar[1].baz).toEqual('foobar');
        expect(str[2][0].bar[1].baz).toEqual('zzz');
      });
    });

    it('getData fail 404', function () {
      var flag, data, obj = $.Deferred(),
        error = {
          status: '404'
        };
      var ctx = {};
      var $container = $('<div id="foobar"></div>');

      obj.reject(error);
      ChartAPI.Data.getData(obj, $container, null, ctx);
      waitsFor(function () {
        return ctx.$errormsg
      });
      runs(function () {
        expect(ctx.$errormsg.length).toBeTruthy();
        expect(ctx.$errormsg.text()).toEqual('Data is not found');
      })
    })

    it('getData fail 403', function () {
      var flag, data, obj = $.Deferred(),
        error = {
          status: '403'
        };
      var ctx = {};
      var $container = $('<div id="foobar"></div>');

      obj.reject(error);
      ChartAPI.Data.getData(obj, $container, null, ctx);
      waitsFor(function () {
        return ctx.$errormsg
      });
      runs(function () {
        expect(ctx.$errormsg.length).toBeTruthy();
        expect(ctx.$errormsg.text()).toEqual('Data is forbidden to access');
      })
    });

    it('getData fail 403', function () {
      var flag, data, obj = $.Deferred(),
        error = {
          status: '401'
        };
      var ctx = {};
      var $container = $('<div id="foobar"></div>');

      obj.reject(error);
      ChartAPI.Data.getData(obj, $container, null, ctx);
      waitsFor(function () {
        return ctx.$errormsg
      });
      runs(function () {
        expect(ctx.$errormsg.length).toBeTruthy();
        expect(ctx.$errormsg.text()).toEqual('Some error occured in the data fetching process');
      })
    });
  });

  describe('filterData', function () {

    describe('unit', function () {
      var i, data,
        day = moment('2013-09-16'),
        min = moment("2013-08-15 00:00:00"),
        max = moment("2013-09-05 23:59:59"),
        minMinus = moment(min).subtract('seconds', 1),
        maxPlus = moment(max).add('seconds', 1);

      beforeEach(function () {
        var dayClone = moment(day);
        data = [];
        for (i = 0; i < 60; i++) {
          data.push({
            x: dayClone.subtract('days', 1).format(),
            y: i
          });
        }
      });

      _.each(['daily', 'weekly', 'monthly', 'yearly'], function (unit) {
        it('filter data with desinated range: ' + unit, function () {
          var ret = MT.ChartAPI.Data.filterData(data, max.toDate(), min.toDate(), unit);

          var map = {
            daily: 22,
            weekly: 4,
            monthly: 2,
            yearly: 1
          };

          var yMap = {
            daily: function () {
              var hash = {};
              var dayClone = moment(day);
              for (var j = 0; j <= 60; j++) {
                hash[dayClone.subtract('days', 1).format('YYYYMMDD')] = j;
              }
              return hash;
            }(),
            weekly: {
              20130901: 10 + 11 + 12 + 13 + 14,
              20130825: 15 + 16 + 17 + 18 + 19 + 20 + 21,
              20130818: 22 + 23 + 24 + 25 + 26 + 27 + 28,
              20130811: 29 + 30 + 31
            },
            monthly: {
              201309: 60,
              201308: 126 + 175 + 90
            },
            yearly: {
              2013: 60 + 126 + 175 + 90
            }
          };

          expect(_.size(ret)).toEqual(map[unit]);
          var x;
          _.each(ret, function (value, key) {
            x = moment(value.x);
            switch (unit) {
            case 'daily':
              expect(key).toEqual(x.format('YYYYMMDD'));
              expect(value.y).toEqual(yMap[unit][key]);
              break;
            case 'weekly':
              expect(key).toEqual(moment(x).startOf('week').format('YYYYMMDD'));
              expect(value.y).toEqual(yMap[unit][key]);
              break;
            case 'monthly':
              expect(key).toEqual(moment(x).startOf('month').format('YYYYMM'));
              expect(value.y).toEqual(yMap[unit][key]);
              break;
            case 'yearly':
              expect(key).toEqual(moment(x).startOf('year').format('YYYY'));
              expect(value.y).toEqual(yMap[unit][key]);
              break;
            }
            expect(x.isBefore(maxPlus)).toBe(true);
            expect(x.isAfter(minMinus)).toBe(true);
          });
        });
      });

      it('with noConcat', function () {
        data.push({
          x: max.format(),
          y: 123
        });

        var expected = function () {
          var hash = {};
          var dayClone = moment(day);
          for (var j = 0; j <= 60; j++) {
            hash[dayClone.subtract('days', 1).format('YYYYMMDD')] = j;
          }
          hash[max.format('YYYYMMDD')] = 123;
          return hash;
        }();

        var ret = MT.ChartAPI.Data.filterData(data, max.toDate(), min.toDate(), 'weekly', 1, true);
        expect(_.size(ret)).toEqual(22);
        _.each(ret, function (value, key) {
          expect(value.y).toEqual(expected[key]);
        });
      });
    });

    describe('y formats', function () {
      // allow the following formats for the value y
      // '9,000,000', '9000000', 90000000, 9000.1111
      var data = [],
        min = moment().startOf('day'),
        max = moment().endOf('day');

      it('y is "9,000,000" (with comma)', function () {
        data = [{
          x: moment().format(),
          y: '9,000,000'
        }];
        var ret = MT.ChartAPI.Data.filterData(data, max.toDate(), min.toDate(), 'daily');
        expect(ret[moment().format('YYYYMMDD')].y).toEqual(9000000);
      });

      it('y is "9000000" (type of string)', function () {
        data = [{
          x: moment().format(),
          y: '9000000'
        }];
        var ret = MT.ChartAPI.Data.filterData(data, max.toDate(), min.toDate(), 'daily');
        expect(ret[moment().format('YYYYMMDD')].y).toEqual(9000000);
      });

      it('y is 9000000 (type of number)', function () {
        data = [{
          x: moment().format(),
          y: 9000000
        }];
        var ret = MT.ChartAPI.Data.filterData(data, max.toDate(), min.toDate(), 'daily');
        expect(ret[moment().format('YYYYMMDD')].y).toEqual(9000000);
      });

      it('y is 9000.111 (float)', function () {
        data = [{
          x: moment().format(),
          y: 9000.111
        }];
        var ret = MT.ChartAPI.Data.filterData(data, max.toDate(), min.toDate(), 'daily');
        expect(ret[moment().format('YYYYMMDD')].y).toEqual(9000.111);
      });

      it('y is "900,000.111" (float string)', function () {
        data = [{
          x: moment().format(),
          y: '900,000.111'
        }];
        var ret = MT.ChartAPI.Data.filterData(data, max.toDate(), min.toDate(), 'daily');
        expect(ret[moment().format('YYYYMMDD')].y).toEqual(900000.111);
      });
    });

    describe('yLength', function () {
      var i, data,
        day = moment('2013-09-16'),
        min = moment("2013-08-15 00:00:00"),
        max = moment("2013-09-05 23:59:59"),
        dayClone = moment(day);

      data = [];
      for (i = 0; i < 60; i++) {
        data.push({
          x: dayClone.subtract('days', 1).format(),
          y: i,
          y1: i * 2,
          y2: i * 3,
          y3: i * 4
        });
      }

      it('yLength is 1 (default is 1)', function () {
        var ret = MT.ChartAPI.Data.filterData(data, max.toDate(), min.toDate(), 'daily');
        expect(ret['20130901'].y).toEqual(14);
        expect(ret['20130901'].y1).toBeUndefined();
        expect(ret['20130901'].y2).toBeUndefined();
      });

      it('yLength is 2', function () {
        var ret = MT.ChartAPI.Data.filterData(data, max.toDate(), min.toDate(), 'daily', 2);
        expect(ret['20130901'].y).toEqual(14);
        expect(ret['20130901'].y1).toEqual(14 * 2);
        expect(ret['20130901'].y2).toBeUndefined();
      });

      it('yLength is 3', function () {
        var ret = MT.ChartAPI.Data.filterData(data, max.toDate(), min.toDate(), 'daily', 3);
        expect(ret['20130901'].y).toEqual(14);
        expect(ret['20130901'].y1).toEqual(14 * 2);
        expect(ret['20130901'].y2).toEqual(14 * 3);
      });
    });
  });
});
