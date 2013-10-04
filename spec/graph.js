describe('graph', function () {
  var basePath = !! window.__karma__ ? '/base' : '';
  var ua = navigator.userAgent;
  var isIE8 = /MSIE 8/.test(ua);

  var orig = ChartAPI.Graph;
  ChartAPI.Graph = function (config, range) {
    var ret = orig.call(this, config, range);
    ret.on('GET_OBJECT', $.proxy(function (e, callback) {
      callback(this);
    }, this));
    return ret;
  };
  ChartAPI.Graph = $.extend(ChartAPI.Graph, orig);
  ChartAPI.Graph.prototype = orig.prototype;

  var graph;
  describe('initialize', function () {
    it('default settings', function () {
      var $gc = new ChartAPI.Graph();
      $gc.trigger('GET_OBJECT', function (obj) {
        graph = obj;
      });
      waitsFor(function () {
        return graph;
      }, 'get graph object', 3000);
      runs(function () {
        var config = graph.config;
        expect(config.id).toMatch(/graph-[0-9]+/);
        expect(config.yLength).toEqual(1);
        expect(config.type).toEqual('morris.bar');
        expect(config.staticPath).toEqual('');
        expect(config.data).toEqual('graph.json');
        expect(graph.$graphContainer.attr('id')).toEqual(config.id + '-container');
      });
    });
  });

  describe('events', function () {
    var today = moment();
    var data = [];
    for (var i = 0; i < 180; i++) {
      data.push({
        x: today.subtract('days', 1).format(),
        xLabel: today.format('YYYY-MM-DD'),
        y: i
      });
    }
    var $gc, graph;
    beforeEach(function () {
      $gc = new ChartAPI.Graph({
        data: data
      });
      $gc.trigger('GET_OBJECT', function (obj) {
        graph = obj;
      });
      waitsFor(function () {
        return graph;
      }, 'get graph object', 3000);
    });

    it('UPDATE', function () {
      var newRange;
      runs(function () {
        newRange = ChartAPI.Range.factory({
          length: 20
        });
        spyOn(graph, 'update_');
        var ret = $gc.trigger('UPDATE', [newRange, 'weekly']);
        expect(ret).toEqual($gc);
      });
      waitsFor(function () {
        return graph.update_.callCount;
      });
      runs(function () {
        expect(graph.update_).toHaveBeenCalled();
        var args = graph.update_.mostRecentCall.args;
        expect(args[0]).toEqual(newRange);
        expect(args[1]).toEqual('weekly');
      });
    });

    it('update with autoResize', function () {
      var $gc = new ChartAPI.Graph({
        data: data,
        autoResize: true
      });
      $gc.trigger('GET_OBJECT', function (obj) {
        graph = obj;
      });
      waitsFor(function () {
        return graph;
      }, 'get graph object', 3000);
      runs(function () {
        spyOn(graph, 'updateFunc').andCallThrough();
        graph.setAutoResizeUpdate();
        var ev = $.Event('orientationchange');
        $(window).trigger(ev);
      });
      waitsFor(function () {
        return graph.updateFunc.callCount === 1;
      });
      runs(function () {
        expect(graph.updateFunc.callCount).toEqual(1);
        $(window).trigger('debouncedresize');
      });
      waitsFor(function () {
        return graph.updateFunc.callCount === 2;
      });
      runs(function () {
        expect(graph.updateFunc.callCount).toEqual(2);
      });
    });

    it('REMOVE', function () {
      var $gc, graph;
      runs(function () {
        $gc = new ChartAPI.Graph({
          data: data,
          label: {},
          autoResize: true
        });
        $gc.trigger('APPEND_TO', [$('body')]);

        $gc.trigger('GET_OBJECT', function (obj) {
          graph = obj;
          spyOn(graph.graphObject, 'remove').andCallThrough();
          spyOn(graph.labels, 'remove').andCallThrough();
          spyOn($gc, 'remove').andCallThrough();
        });
        waitsFor(function () {
          return graph && !! $gc.html();
        }, 'get graph object', 3000);
      });
      runs(function () {
        spyOn(graph, 'remove_').andCallThrough();
        $gc.trigger('REMOVE');
      });
      waitsFor(function () {
        return graph.remove_.callCount && !$gc.html();
      });
      runs(function () {
        expect(graph.remove_).toHaveBeenCalled();
        expect(graph.graphObject.remove).toHaveBeenCalled();
        expect(graph.labels.remove).toHaveBeenCalled();
        expect(graph.$graphContainer.html()).toBeFalsy();
        expect($gc.remove).toHaveBeenCalled();
      });
    });

    it('GET_DATA_RANGE', function () {
      var callback = jasmine.createSpy();
      runs(function () {
        spyOn(graph, 'getData').andCallThrough();
        var ret = $gc.trigger('GET_DATA_RANGE', [callback]);
        expect(ret).toEqual($gc);
      });
      waitsFor(function () {
        return callback.callCount;
      });
      runs(function () {
        expect(graph.getData).toHaveBeenCalled();
        var arg = callback.mostRecentCall.args[0];
        var range = ChartAPI.Range.getDataRange(data, true);
        expect(arg.max).toEqual(range.max);
        expect(arg.min).toEqual(range.min);
      });
    });

    it('GET_LABEL', function () {
      var callback = jasmine.createSpy();
      runs(function () {
        spyOn(graph, 'getData').andCallThrough();
        var ret = $gc.trigger('GET_LABEL', [
          [1], callback
        ]);
        expect(ret).toEqual($gc);
      });
      waitsFor(function () {
        return callback.callCount;
      });
      runs(function () {
        expect(graph.getData).toHaveBeenCalled();
        var args = callback.mostRecentCall.args;
        expect(args[0]).toEqual([data[1].x]);
      });
    });

    it('APPEND_TO', function () {
      var $container = $('<div>');
      runs(function () {
        spyOn(graph, 'draw_');
        var ret = $gc.trigger('APPEND_TO', [$container]);
        expect(ret).toEqual($gc);
      });
      waitsFor(function () {
        return graph.draw_.callCount;
      });
      runs(function () {
        expect(graph.draw_).toHaveBeenCalled();
        expect($container.find($gc)).toBeTruthy();
        $gc.trigger('REMOVE');
      });
    });
  });

  describe('get graph data', function () {
    it('getJSON', function () {
      var staticPath = !window.__karma__ ? '/spec/' : '/base/spec/';
      var $gc = new ChartAPI.Graph({
        staticPath: staticPath,
        data: 'graph_data.json'
      });
      var flag, data;
      $gc.trigger('GET_OBJECT', function (obj) {
        graph = obj;
        graph.origData_.always(function (resp) {
          data = resp;
          flag = true;
        });
      });
      waitsFor(function () {
        return flag;
      }, 'get graph object', 3000);
      runs(function () {
        expect(data[0]).toBeDefined();
        expect(data[0].x).toBeTruthy();
        expect(moment(data[0].x).format('YYYYMMDD')).toEqual(moment().format('YYYYMMDD'));
        $gc.trigger('REMOVE');
      });
    });

    it('get JSON Object', function () {
      var $gc = new ChartAPI.Graph({
        data: [{
          x: moment().toISOString(),
          y: 1
        }]
      });

      var flag, data;
      $gc.trigger('GET_OBJECT', function (obj) {
        graph = obj;
        graph.origData_.always(function (resp) {
          data = resp;
          flag = true;
        });
      });
      waitsFor(function () {
        return flag;
      }, 'get graph object', 3000);
      runs(function () {
        expect(data[0]).toBeDefined();
        expect(data[0].x).toBeTruthy();
        expect(moment(data[0].x).format('YYYYMMDD')).toEqual(moment().format('YYYYMMDD'));
        expect(data[0].y).toEqual(1);
        $gc.trigger('REMOVE');
      });
    });
  });

  describe('draw', function () {
    var today = moment();
    var data = [];
    var $gc, graph, filteredData;

    var unitMap = {
      'monthly': 'month',
      'weekly': 'week',
      'daily': 'days',
      'hourly': 'hour',
      'yearly': 'year',
      'quarter': 'month'
    };

    function init(conf, range) {
      for (var i = 0; i < 5; i++) {
        data.push({
          x: today.subtract(unitMap[range.unit], 1).format(),
          y: Math.ceil(Math.random() * 100),
          y1: Math.ceil(Math.random() * 100)
        });
      }
      conf = conf || {};
      conf.data = data;
      conf.staicPath = basePath;

      $gc = new ChartAPI.Graph(conf, range);
      $gc.trigger('GET_OBJECT', function (obj) {
        graph = obj;
        graph.graphData[range.unit].done(function (data) {
          filteredData = data;
          $gc.trigger('APPEND_TO', [$('body')]);
        });
      });
      waitsFor(function () {
        return !!$gc.length && !! $gc.html();
      }, 'get graph object', 3000);
    }

    _.each(['morris.bar', 'morris.line', 'morris.donut', 'morris.area', 'easel.bar', 'easel.motionLine', 'easel.mix', 'css.horizontalBar', 'css.ratioHorizontalBar'], function (type) {
      if (/easel/.test(type) && !isIE8) {
        it(type, function () {
          var range = ChartAPI.Range.factory();
          var conf = {
            type: type
          };
          if (/easel/.test(type)) {
            conf.fallback = {
              test: 'canvas',
              type: 'morris.bar'
            };
          }
          if (type === 'easel.mix') {
            conf.mix = [{
              type: 'bar',
              yLength: 1
            }, {
              type: 'motionLine',
              yLength: 1
            }];
          }
          init(conf, range);
          runs(function () {
            expect(graph.graphObject.$graphEl).toBeDefined();
            expect(graph.graphObject.$graphEl.length).toBeTruthy();
            $gc.trigger('REMOVE');
          });
        });
      }
    });

    _.each(['monthly', 'weekly', 'daily', 'hourly', 'yearly', 'quarter'], function (unit) {
      it(unit, function () {
        var range = ChartAPI.Range.factory({
          unit: unit
        });
        init({}, range);
        runs(function () {
          expect(graph.graphObject.$graphEl).toBeDefined();
          expect(graph.graphObject.$graphEl.length).toBeTruthy();
          $gc.trigger('REMOVE');
        });
      });
    });

    it('fallback test', function () {
      spyOn(ChartAPI.Graph.test, 'canvas').andReturn(false);
      var range = ChartAPI.Range.factory();
      var conf = {
        type: 'easel.bar',
        fallback: {
          test: 'canvas',
          type: 'morris.bar'
        }
      };
      init(conf, range);
      runs(function () {
        expect(graph.graphObject.$graphEl).toBeDefined();
        expect(graph.graphObject.$graphEl.length).toBeTruthy();
        expect(graph.graphObject.config.type).toEqual('morris.bar');
        $gc.trigger('REMOVE');
      });
    });

    it('split chartColors', function () {
      var range = ChartAPI.Range.factory();
      var conf = {
        chartColors: '#ffffff,#000000'
      };
      init(conf, range);
      runs(function () {
        expect(graph.graphObject.$graphEl).toBeDefined();
        expect(graph.graphObject.$graphEl.length).toBeTruthy();
        expect(graph.graphObject.chartColors).toEqual(['#ffffff', '#000000']);
        $gc.trigger('REMOVE');
      });
    });
  });

  describe('draw with label', function () {
    var today = moment();
    var data;
    var $gc, graph, filteredData;

    function init(conf, range) {
      $gc = new ChartAPI.Graph(_.extend({
        data: data,
        staticPath: basePath
      }, conf), (range || {
        unit: 'monthly'
      }));
      $gc.trigger('GET_OBJECT', function (obj) {
        graph = obj;
        graph.graphData[range.unit].done(function (data) {
          filteredData = data;
        });
      });
      waitsFor(function () {
        return filteredData;
      }, 'get graph object', 3000);
    }

    it('use default', function () {
      var range, config;
      range = ChartAPI.Range.factory({
        unit: 'monthly'
      });

      data = [];
      for (var i = 0; i < 20; i++) {
        data.push({
          x: moment(today).subtract('month', i).format(),
          y: 20000 - i * 1000,
          y1: 40000 - (i * 2000)
        });
      }

      init({
        yLength: 2
      }, range);
      runs(function () {
        config = graph.config;
        config.label = {};
        $gc.appendTo('body');
        filteredData = graph.generateGraphData(filteredData);
        graph.draw_(filteredData, range, config);

        var labels = graph.labels;
        expect(labels.totals).toBeDefined();
        var y = labels.totals.y;
        var y1 = labels.totals.y1;

        expect(y).toBeDefined();
        expect(y1).toBeDefined();
        expect(y.$totalContainer.length).toBeTruthy();
        expect(y1.$totalContainer.length).toBeTruthy();
        expect(y.count).toEqual('210,000');
        expect(y.delta).toEqual('1,000');
        expect(y.deltaClass).toEqual('plus');
        expect(y1.count).toEqual('420,000');
        expect(y1.delta).toEqual('2,000');
        expect(y1.deltaClass).toEqual('plus');
        $gc.trigger('REMOVE');
      });
    });

    it('delta is minus', function () {
      today = moment();
      data = [];
      for (var i = 0; i < 20; i++) {
        data.unshift({
          x: moment(today).subtract('month', i).format(),
          y: (i + 1) * 1000,
          y1: (i + 1) * 2000
        });
      }
      var range = ChartAPI.Range.factory({
        unit: 'monthly'
      });
      init({
        data: data,
        yLength: 2
      }, range);
      var config = graph.config;
      config.label = {};
      $gc.appendTo('body');
      filteredData = graph.generateGraphData(filteredData);
      graph.draw_(filteredData, range, config);

      var labels = graph.labels;
      expect(labels.totals).toBeDefined();
      var y = labels.totals.y;
      var y1 = labels.totals.y1;

      expect(y).toBeDefined();
      expect(y1).toBeDefined();
      expect(y.$totalContainer.length).toBeTruthy();
      expect(y1.$totalContainer.length).toBeTruthy();
      expect(y.count).toEqual('210,000');
      expect(y.delta).toEqual('-1,000');
      expect(y.deltaClass).toEqual('minus');
      expect(y1.count).toEqual('420,000');
      expect(y1.delta).toEqual('-2,000');
      expect(y1.deltaClass).toEqual('minus');
      $gc.trigger('REMOVE');
    });

    it('delta is zero (and without comma)', function () {
      today = moment();
      data = [];
      for (var i = 0; i < 20; i++) {
        data.unshift({
          x: moment(today).subtract('month', i).format(),
          y: 1000,
          y1: 2000
        });
      }
      var range = ChartAPI.Range.factory({
        unit: 'monthly'
      });
      init({
        data: data,
        yLength: 2
      }, range);
      var config = graph.config;
      config.label = {
        noComma: true
      };

      $gc.appendTo('body');
      filteredData = graph.generateGraphData(filteredData);
      graph.draw_(filteredData, range, config);

      var labels = graph.labels;
      expect(labels.totals).toBeDefined();
      var y = labels.totals.y;
      var y1 = labels.totals.y1;

      expect(y).toBeDefined();
      expect(y1).toBeDefined();
      expect(y.$totalContainer.length).toBeTruthy();
      expect(y1.$totalContainer.length).toBeTruthy();
      expect(y.count).toEqual('20000');
      expect(y.delta).toEqual('0');
      expect(y.deltaClass).toEqual('zero');
      expect(y1.count).toEqual('40000');
      expect(y1.delta).toEqual('0');
      expect(y1.deltaClass).toEqual('zero');
      $gc.trigger('REMOVE');
    });

    it('delta count should be calculated from the in-use graph data', function () {
      var range, config;
      data = [];
      for (var i = 0; i < 20; i++) {
        data.push({
          x: moment(today).subtract('month', i).format(),
          y: Math.floor(Math.random() * 999),
          y1: Math.floor(Math.random() * 999)
        });
      }

      range = ChartAPI.Range.factory({
        end: moment(today).subtract('month', 9).format(),
        unit: 'monthly'
      });

      init({
        yLength: 2
      }, range);

      runs(function () {
        config = graph.config;
        config.label = {};
        $gc.appendTo('body');
        filteredData = graph.generateGraphData(filteredData);
        graph.draw_(filteredData, range, config);

        var labels = graph.labels;
        expect(labels.totals).toBeDefined();
        var y = labels.totals.y;
        var y1 = labels.totals.y1;

        var expectedTotalY = 0;
        var expectedTotalY1 = 0;
        for (var i = 0; i < 20; i++) {
          expectedTotalY += data[i].y;
          expectedTotalY1 += data[i].y1;
        }
        expectedTotalY = ChartAPI.Data.addCommas(expectedTotalY);
        expectedTotalY1 = ChartAPI.Data.addCommas(expectedTotalY1);

        var expectedDeltaY = (data[9].y - data[10].y).toString();
        var expectedDeltaY1 = (data[9].y1 - data[10].y1).toString();

        expect(y).toBeDefined();
        expect(y1).toBeDefined();
        expect(y.$totalContainer.length).toBeTruthy();
        expect(y1.$totalContainer.length).toBeTruthy();
        expect(y.count).toEqual(expectedTotalY);
        expect(y1.count).toEqual(expectedTotalY1);
        expect(y.delta).toEqual(expectedDeltaY);
        expect(y1.delta).toEqual(expectedDeltaY1);
        $gc.trigger('REMOVE');
      });
    });

    it('getDelta_ returns blank when data has no y data', function () {
      var delta = ChartAPI.Graph.prototype.getDelta_.call(this, [{}], 0);
      expect(delta).toEqual('');
    });
  });

  describe('update graph', function () {
    _.each(['morris.bar', 'morris.line', 'morris.donut', 'morris.area', 'easel.bar', 'easel.motionLine', 'easel.mix', 'css.horizontalBar', 'css.ratioHorizontalBar'], function (type) {
      if (/easel/.test(type) && !isIE8) {
        it('update range', function () {
          var today = moment();
          var data = [];
          for (var i = 0; i < 180; i++) {
            data.push({
              x: moment(today).subtract('days', i).format(),
              y: Math.ceil(Math.random() * 100),
              y1: Math.ceil(Math.random() * 100)
            });
          }
          var $gc, graph, filteredData;

          var start = moment(today).subtract('days', 29);
          var end = moment(today).subtract('days', 20);

          var range = ChartAPI.Range.factory({
            unit: 'daily',
            start: start.format(),
            end: end.format()
          });

          var config = {
            type: type,
            data: data,
            staticPath: basePath,
            label: {}
          };

          if (type === 'easel.mix') {
            config.mix = [{
              type: 'bar',
              yLength: 1
            }, {
              type: 'motionLine',
              yLength: 1
            }];
          }

          if (type === 'css.horizontalBar') {
            config.width = '400px';
          }

          $gc = new ChartAPI.Graph(config, range);
          $gc.trigger('GET_OBJECT', function (obj) {
            graph = obj;
            graph.graphData[range.unit].done(function (data) {
              filteredData = data;
              $gc.trigger('APPEND_TO', [$('body')]);
            });
          });
          waitsFor(function () {
            return graph.graphObject;
          }, 'get graph object', 3000);

          var newStart, newEnd, gObj1, gLabels1;
          runs(function () {
            gObj1 = graph.graphObject;
            gLabels1 = graph.labels;

            spyOn(gObj1, 'remove').andCallThrough();
            spyOn(gLabels1, 'remove').andCallThrough();

            var graphData = gObj1.data;
            expect(graphData[0].x).toEqual(start.format('YYYY-MM-DD'));
            expect(graphData[9].x).toEqual(end.format('YYYY-MM-DD'));

            var y1 = _.find(data, function (d) {
              return d.x === moment(end).format();
            });
            var y0 = _.find(data, function (d) {
              return d.x === moment(end).subtract('days', 1).format();
            });

            var expectedDeltaY = y1.y - y0.y;
            expectedDeltaY = ChartAPI.Data.addCommas(expectedDeltaY);
            expect(graph.labels.totals.y.delta).toEqual(expectedDeltaY);

            spyOn(graph, 'draw_').andCallThrough();
            newStart = moment(today).subtract('days', 49);
            newEnd = moment(today).subtract('days', 30);
            graph.update_([newStart.format(), newEnd.format()]);
          });

          waitsFor(function () {
            return graph.draw_.callCount;
          });

          runs(function () {
            expect(gObj1.remove).toHaveBeenCalled();
            expect(gLabels1.remove).toHaveBeenCalled();

            var gObj2 = graph.graphObject;
            var graphData = gObj2.data;
            expect(gObj2.$graphEl.length).toBeTruthy();
            expect(graphData.length).toEqual(20);
            expect(graphData[0].x).toEqual(newStart.format('YYYY-MM-DD'));
            expect(graphData[19].x).toEqual(newEnd.format('YYYY-MM-DD'));

            var y1 = _.find(data, function (d) {
              return d.x === moment(newEnd).format();
            });
            var y0 = _.find(data, function (d) {
              return d.x === moment(newEnd).subtract('days', 1).format();
            });

            var expectedDeltaY = y1.y - y0.y;
            expectedDeltaY = ChartAPI.Data.addCommas(expectedDeltaY);
            expect(graph.labels.totals.y.delta).toEqual(expectedDeltaY);

            $gc.trigger('REMOVE');
          });
        });
      }
    });
  });

  describe('use general data (no timeline)', function () {
    _.each(['morris.bar', 'morris.line', 'morris.donut', 'morris.area', 'easel.bar', 'easel.motionLine', 'easel.mix', 'css.horizontalBar', 'css.ratioHorizontalBar'], function (type) {
      if (/easel/.test(type) && !isIE8) {
        it(type, function () {
          var today = moment();
          var data = [];
          for (var i = 0; i < 30; i++) {
            data.push({
              x: moment(today).subtract('days', i * 2).format('YYYY-MM-DD'),
              y: Math.ceil(Math.random() * 100),
              y1: Math.ceil(Math.random() * 100)
            });
          }
          var $gc, graph, filteredData;

          var range = ChartAPI.Range.factory({
            dataType: 'general'
          });

          var config = {
            type: type,
            data: data,
            staticPath: basePath,
            label: {}
          };

          if (type === 'easel.mix') {
            config.mix = [{
              type: 'bar',
              yLength: 1
            }, {
              type: 'motionLine',
              yLength: 1
            }];
          }

          if (type === 'css.horizontalBar') {
            config.width = '400px';
          }

          $gc = new ChartAPI.Graph(config, range);
          $gc.trigger('GET_OBJECT', function (obj) {
            graph = obj;
            graph.graphData[range.unit].done(function (data) {
              filteredData = data;
              $gc.trigger('APPEND_TO', [$('body')]);
            });
          });
          waitsFor(function () {
            return graph.graphObject;
          }, 'get graph object', 3000);

          runs(function () {
            expect($gc.length).toBeTruthy();
            $gc.trigger('REMOVE');
          });
        });
      }
    });
  });

  describe('getColors', function () {
    it('reverse', function () {
      var straight = ChartAPI.Graph.getChartColors();
      var reverse = ChartAPI.Graph.getChartColors(null, 'reverse');
      _.each(reverse, function (color, i) {
        expect(color).toEqual(straight[straight.length - i - 1]);
      });
    });

    it('shuffle', function () {
      var straight = ChartAPI.Graph.getChartColors();
      var shuffle = ChartAPI.Graph.getChartColors(null, 'shuffle');
      var expected;
      _.each(shuffle, function (color) {
        for (var i = 0; i < straight.length; i++) {
          if (color === straight[i]) {
            expected = straight.splice(i, 1)[0];
          }
        }
        expect(color).toEqual(expected);
      });
    });

    it('use own chartColor without default Chart Color', function () {
      var colors = ['#ffffff', '#000000'];
      var expected = ChartAPI.Graph.getChartColors(colors);
      _.each(colors, function (color, i) {
        expect(color).toEqual(expected[i]);
      });
    });
  });

  describe('Feature detection (test)', function () {
    it('vml', function () {
      spyOn(ChartAPI.Graph.test, 'svg').andReturn(false);
      var ret = ChartAPI.Graph.test.vml();
      var ua = navigator.userAgent;
      if (/MSIE [89]/.test(ua)) {
        expect(ret).toBe(true);
      } else {
        expect(ret).toBe(false);
      }
    });

    it('svg', function () {
      var ret = ChartAPI.Graph.test.svg();
      var ua = navigator.userAgent;
      if (/MSIE 8/.test(ua)) {
        expect(ret).toBe(false);
      } else {
        expect(ret).toBe(true);
      }
    });

    it('canvas', function () {
      var ret = ChartAPI.Graph.test.canvas();
      var ua = navigator.userAgent;
      if (/MSIE [89]/.test(ua)) {
        expect(ret).toBe(false);
      } else {
        expect(ret).toBe(true);
      }
    });
  });

  describe('Morris', function () {
    var today = moment();
    var data = [];
    for (var i = 0; i < 30; i++) {
      data.push({
        x: moment(today).subtract('days', i).format('YYYY-MM-DD'),
        y: Math.ceil(Math.random() * 100),
        y1: Math.ceil(Math.random() * 100)
      });
    }
    var $gc, filteredData;

    it('use requirejs', function () {
      var $requirejs, $config;

      $('script[src$="morris.min.js"]').remove();
      $('script[src$="raphael-min.js"]').remove();
      delete window.Morris;
      delete window.Raphael;

      expect(window.Morris).toBeUndefined();

      $requirejs = $('<script src="' + basePath + '/test/other_libs/require.js"></script>').appendTo($('head'));
      waitsFor(function () {
        return !!window.requirejs;
      });
      runs(function () {
        $config = $("<script>requirejs.config({baseUrl: '" + basePath + "',paths: { text: 'test/other_libs/text',raphael:'deps/raphael-min',morris:'deps/morris.min' }})</script>").appendTo($('head'));
      });

      var graph;
      runs(function () {
        var config = {
          type: 'morris.line',
          data: data,
          staticPath: basePath,
          pointStrokeColors: '#ccc,#f00'
        };

        var range = {
          unit: 'daily'
        };

        $gc = new ChartAPI.Graph(config, range);
        $gc.trigger('GET_OBJECT', function (obj) {
          graph = obj;
          graph.graphData[range.unit].done(function (data) {
            filteredData = data;
            $gc.trigger('APPEND_TO', [$('body')]);
          });
        });
      });

      waitsFor(function () {
        return graph.graphObject && $gc.html();
      }, 'get graph object', 3000);

      runs(function () {
        expect(window.Raphael).toBeDefined();
        expect(window.Morris).toBeDefined();
        expect($gc.find('.graph-element').html()).toBeTruthy();
        $gc.trigger('REMOVE');
      });

      runs(function () {
        $requirejs.remove();
        $config.remove();
        $('script[src$="text.js"]').remove();
        delete window.require;
        delete window.define;
        delete window.requirejs;
      });
    });

    it('when use VML (only IE8 lower), set smooth option on', function () {
      var $gc, graph;
      var config = {
        type: 'morris.line',
        data: data,
        staticPath: basePath,
        smooth: false
      };

      var range = {
        unit: 'daily'
      };

      spyOn(ChartAPI.Graph.test, 'svg').andReturn(false);
      spyOn(ChartAPI.Graph.test, 'vml').andReturn(true);

      var graphConfig;
      spyOn(window.Morris, 'Line').andCallFake(function (c) {
        graphConfig = c;
      });
      $gc = new ChartAPI.Graph(config, range);

      $gc.trigger('GET_OBJECT', function (obj) {
        graph = obj;
        $gc.trigger('APPEND_TO', [$('body')]);
      });

      waitsFor(function () {
        return graph.graphObject && $gc.html();
      }, 'get graph object', 3000);

      runs(function () {
        expect(window.Morris.Line).toHaveBeenCalled();
        expect(ChartAPI.Graph.test.svg).toHaveBeenCalled();
        expect(graphConfig.smooth).toBe(true);
      });
    });

    it('customize donuts formatter', function () {
      var data = [{
        x: moment().format('YYYY-MM-DD'),
        y: '100,000'
      }];

      var $gc, graph;
      var config = {
        type: 'morris.donut',
        data: data,
        staticPath: basePath,
        donutsFormatter: jasmine.createSpy('donutsFormatter')
      };

      var range = {
        length: 1
      };

      $gc = new ChartAPI.Graph(config, range);

      $gc.trigger('GET_OBJECT', function (obj) {
        graph = obj;
        $gc.trigger('APPEND_TO', [$('body')]);
      });

      waitsFor(function () {
        return graph.graphObject && $gc.html();
      }, 'get graph object', 3000);

      runs(function () {
        expect(config.donutsFormatter).toHaveBeenCalled();
        var args = config.donutsFormatter.mostRecentCall.args;
        expect(args[0]).toEqual('100,000');
        expect(args[1]).toEqual('100%');
        expect(args[2]).toEqual(100000);
        $gc.trigger('REMOVE');
      });
    });

    it('small ymax Numlines', function () {
      var data = [{
        x: moment().format('YYYY-MM-DD'),
        y: 7
      }, {
        x: moment().subtract('day', 1).format('YYYY-MM-DD'),
        y: 3
      }];

      var $gc, graph;
      var config = {
        type: 'morris.bar',
        staticPath: basePath,
        data: data
      };

      var range = {
        unit: 'daily'
      };

      var graphConfig;
      spyOn(window.Morris, 'Bar').andCallFake(function (c) {
        graphConfig = c;
      });
      $gc = new ChartAPI.Graph(config, range);

      $gc.trigger('GET_OBJECT', function (obj) {
        graph = obj;
        $gc.trigger('APPEND_TO', [$('body')]);
      });

      waitsFor(function () {
        return graph.graphObject && $gc.html();
      }, 'get graph object', 3000);

      runs(function () {
        expect(graphConfig.numLines).toEqual(5);
      });
    });

    it('getTotalCount_', function () {
      var $gc, graph;
      var config = {
        type: 'morris.donut',
        staticPath: basePath,
        data: data
      };

      var range = {
        unit: 'daily'
      };

      $gc = new ChartAPI.Graph(config, range);

      $gc.trigger('GET_OBJECT', function (obj) {
        graph = obj;
        $gc.trigger('APPEND_TO', [$('body')]);
      });

      waitsFor(function () {
        return graph && $gc.html();
      });

      runs(function () {
        var tortalCount = graph.graphObject.getTotalCount_([{
          y: '100,000'
        }, {
          y: '10.5'
        }], 0);
        expect(tortalCount).toEqual(100010.5);
        $gc.trigger('REMOVE');
      });
    });

    it('graph element removed when userAgent has no Morris capavilities', function () {
      var $gc, graph;
      var config = {
        type: 'morris.line',
        staticPath: basePath,
        data: data
      };

      spyOn(ChartAPI.Graph.test, 'svg').andReturn(false);
      spyOn(ChartAPI.Graph.test, 'vml').andReturn(false);
      spyOn(ChartAPI.Graph.morris, 'line').andCallThrough();

      $gc = new ChartAPI.Graph(config);

      $gc.trigger('GET_OBJECT', function (obj) {
        graph = obj;
        spyOn(graph, 'remove_').andCallThrough();
        $gc.trigger('APPEND_TO', [$('body')]);
      });

      waitsFor(function () {
        return graph && ChartAPI.Graph.morris.line.callCount;
      }, 'get graph object', 3000);

      runs(function () {
        expect(graph.remove_).toHaveBeenCalled();
      });
    });
  });

  if (!/MSIE 8\.0/.test(navigator.userAgent)) {
    describe('Easel', function () {
      var today = moment();
      var data = [];
      for (var i = 0; i < 30; i++) {
        data.push({
          x: moment(today).subtract('days', i).format('YYYY-MM-DD'),
          y: Math.ceil(Math.random() * 100),
          y1: Math.ceil(Math.random() * 100)
        });
      }
      var $gc, filteredData;

      it('use requirejs', function () {
        var $requirejs, $config;

        $('script[src$="easeljs-0.6.1.min.js"]').remove();
        delete window.createjs;

        $requirejs = $('<script src="' + basePath + '/test/other_libs/require.js"></script>').appendTo($('head'));

        waitsFor(function () {
          return !!window.requirejs;
        });

        runs(function () {
          $config = $("<script>requirejs.config({baseUrl: '" + basePath + "',paths: { text: 'test/other_libs/text', 'easeljs':'deps/easeljs-0.6.1.min' },shim:{'easeljs':{'exports': 'createjs'}}})</script>").appendTo($('head'));
        });

        var graph;
        runs(function () {
          var config = {
            type: 'easel.bar',
            staticPath: basePath,
            data: data
          };

          var range = {
            unit: 'daily'
          };

          $gc = new ChartAPI.Graph(config, range);
          $gc.trigger('GET_OBJECT', function (obj) {
            graph = obj;
            graph.graphData[range.unit].done(function (data) {
              filteredData = data;
              $gc.trigger('APPEND_TO', [$('body')]);
            });
          });
        });

        waitsFor(function () {
          return graph.graphObject && $gc.html();
        }, 'get graph object', 3000);

        runs(function () {
          expect(window.createjs).toBeDefined();
          expect($gc.find('.graph-canvas').length).toBeTruthy();
          $gc.trigger('REMOVE');
        });

        runs(function () {
          $requirejs.remove();
          $config.remove();
          $('script[src$="text.js"]').remove();
          delete window.require;
          delete window.define;
          delete window.requirejs;
          $('<script src="' + basePath + '/deps/easeljs-0.6.1.min.js"></script>').appendTo($('head'));
        });
      });

      it('wait a while when container width couldn\'t get immediately', function () {
        var graph;
        var config = {
          type: 'easel.motionLine',
          data: data,
          staticPath: basePath,
          drawPointer: false
        };

        var range = {
          unit: 'daily'
        };

        $gc = new ChartAPI.Graph(config, range);

        var width = null;
        var realWidth = 350;
        spyOn($gc, 'width').andCallFake(function () {
          if (!width) {
            setTimeout(function () {
              width = realWidth;
            }, 50);
          }
          return width;
        });
        $gc.width(350);

        $gc.trigger('GET_OBJECT', function (obj) {
          graph = obj;
          $gc.trigger('APPEND_TO', [$('body')]);
        });

        waitsFor(function () {
          return graph.graphObject && $gc.html();
        }, 'get graph object', 3000);

        runs(function () {
          expect(graph.graphObject.width).toEqual(realWidth);
          $gc.trigger('REMOVE');
        });
      });

      it('motionLine ticks 30 times', function () {
        var graph;
        var config = {
          type: 'easel.motionLine',
          data: data,
          staticPath: basePath,
          drawPointer: true
        };

        var range = {
          unit: 'daily',
          length: 11
        };

        spyOn(createjs.Ticker, 'removeEventListener').andCallThrough();

        $gc = new ChartAPI.Graph(config, range);
        $gc.trigger('GET_OBJECT', function (obj) {
          graph = obj;
          graph.graphData[range.unit].done(function (data) {
            filteredData = data;
            $gc.trigger('APPEND_TO', [$('body')]);
          });
        });

        waitsFor(function () {
          return graph.graphObject && $gc.html();
        }, 'get graph object', 3000);

        var flag;
        runs(function () {
          setTimeout(function () {
            flag = true;
          }, 1000);
        });

        waitsFor(function () {
          return flag;
        });

        runs(function () {
          expect(createjs.Ticker.removeEventListener).toHaveBeenCalled();
          var args = createjs.Ticker.removeEventListener.mostRecentCall.args;
          expect(args[0]).toEqual('tick');
          expect(args[1]).toEqual(graph.graphObject.tick);
          $gc.trigger('REMOVE');
        });
      });

      it('convertColor', function () {
        var graph;
        var config = {
          type: 'easel.bar',
          staticPath: basePath,
          data: data
        };

        var range = {
          unit: 'daily'
        };

        $gc = new ChartAPI.Graph(config, range);

        $gc.trigger('GET_OBJECT', function (obj) {
          graph = obj;
          $gc.trigger('APPEND_TO', [$('body')]);
        });

        waitsFor(function () {
          return graph.graphObject && $gc.html();
        }, 'get graph object', 3000);

        runs(function () {
          var easel = graph.graphObject;
          expect(easel.convertColor('rgb(1,2,3)')).toEqual('rgb(1,2,3)');
          expect(easel.convertColor('rgba(1,2,3,0.1)')).toEqual('rgba(1,2,3,0.1)');
          expect(easel.convertColor('#990033')).toEqual('rgb(153,0,51)');
          expect(easel.convertColor('#330044', 0.2)).toEqual('rgba(51,0,68,0.2)');
          $gc.trigger('REMOVE');
        });
      });

      it('graph element removed when userAgent has no easeljs capavilities', function () {
        var $gc, graph;
        var config = {
          type: 'easel.bar',
          staticPath: basePath,
          data: data
        };

        spyOn(ChartAPI.Graph.test, 'canvas').andReturn(false);
        spyOn(ChartAPI.Graph.easel, 'bar').andCallThrough();

        $gc = new ChartAPI.Graph(config);

        $gc.trigger('GET_OBJECT', function (obj) {
          graph = obj;
          spyOn(graph, 'remove_').andCallThrough();
          $gc.trigger('APPEND_TO', [$('body')]);
        });

        waitsFor(function () {
          return graph && ChartAPI.Graph.easel.bar.callCount;
        }, 'get graph object', 3000);

        runs(function () {
          expect(graph.remove_).toHaveBeenCalled();
        });
      });
    });
  }

  it('customize label template', function () {

  });

  it('get template JSON data', function () {

  });

  it('use template function in graph label', function () {

  });

});
