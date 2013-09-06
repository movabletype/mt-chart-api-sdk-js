describe('data', function () {


  describe('filterData', function () {

    describe('unit', function () {
      var i, data,
        day = moment('2013-09-16'),
        min = moment("2013-08-15 00:00:00"),
        max = moment("2013-09-05 23:59:59"),
        minMinus = moment(min).subtract('seconds', 1),
        maxPlus = moment(max).add('seconds', 1);

      beforeEach(function () {
        dayClone = moment(day);
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
              var dayClone = moment(day)
              for (var j = 0; j <= 60; j++) {
                hash[dayClone.subtract('days', 1).format('YYYYMMDD')] = j;
              };
              return hash;
            }(),
            weekly: {
              20130901: 9 + 10 + 11 + 12 + 13,
              20130825: 14 + 15 + 16 + 17 + 18 + 19 + 20,
              20130818: 21 + 22 + 23 + 24 + 25 + 26 + 27,
              20130811: 28 + 29 + 30 + 31 + 32 + 33 + 34
            },
            monthly: {
              201309: 55,
              201308: 504
            },
            yearly: {
              2013: 55 + 504
            }
          }
          console.log(yMap[unit])

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
              break;
            case 'monthly':
              expect(key).toEqual(moment(x).startOf('month').format('YYYYMM'));
              break;
            case 'yearly':
              expect(key).toEqual(moment(x).startOf('year').format('YYYY'));
              break;
            }
            expect(x.isBefore(maxPlus)).toBe(true);
            expect(x.isAfter(minMinus)).toBe(true);
          })
        });
      });
    })
  })
})
