describe('graph', function () {
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
    for (i = 0; i < 180; i++) {
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
          spyOn(graph.graphObject, 'remove');
          spyOn(graph.labels, 'remove');
          spyOn($gc, 'remove');
        });
        waitsFor(function () {
          return graph;
        }, 'get graph object', 3000);
      });
      runs(function () {
        spyOn(graph, 'remove_').andCallThrough();
        var ret = $gc.trigger('REMOVE');
      });
      waitsFor(function () {
        return graph.remove_.callCount;
      });
      runs(function () {
        expect(graph.remove_).toHaveBeenCalled();
        expect(graph.graphObject.remove).toHaveBeenCalled();
        expect(graph.labels.remove).toHaveBeenCalled();
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
      });
    });
  });

  describe('get graph data', function () {
    it('getJSON', function () {
      var staticPath = !window.__karma__ ? 'spec/' : 'base/spec/';
      var $gc = new ChartAPI.Graph({
        staticPath: staticPath,
        data: 'graph_data.json'
      });
      var flag, data, graphData;
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
      });
    });
  });

  describe('draw', function () {
    var today = moment();
    var data = [];
    for (i = 0; i < 180; i++) {
      data.push({
        x: today.subtract('days', 1).format(),
        y: Math.ceil(Math.random() * 100),
        y1: Math.ceil(Math.random() * 100)
      });
    }
    var $gc, graph, filteredData;

    beforeEach(function () {
      $gc = new ChartAPI.Graph({
        data: data
      });
      $gc.trigger('GET_OBJECT', function (obj) {
        graph = obj;
        graph.graphData.monthly.done(function (data) {
          filteredData = data;
        });
      });
      waitsFor(function () {
        return filteredData;
      }, 'get graph object', 3000);
    });

    _.each(['morris.bar', 'morris.line', 'morris.donut', 'morris.area', 'easel.bar', 'easel.motionLine', 'easel.mix', 'css.horizontalBar', 'css.ratioHorizontalBar'], function (type) {
      it(type, function () {
        var range = ChartAPI.Range.factory();
        var config = graph.config;
        config.type = type;
        if (type === 'easel.mix') {
          config.mix = [{
            type: 'bar',
            yLength: 1
          }, {
            type: 'motionLine',
            yLength: 1
          }];
        }
        $gc.appendTo('body');
        filteredData = graph.generateGraphData(filteredData);
        graph.draw_(filteredData, range, config);
        expect(graph.graphObject.$graphEl).toBeDefined();
        expect(graph.graphObject.$graphEl.length).toBeTruthy();
        $gc.remove();
      });
    });
  });

  describe('draw with label', function () {
    var today = moment();
    var data;
    var $gc, graph, filteredData;

    function init(conf, range) {
      $gc = new ChartAPI.Graph(_.extend({
        data: data
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
      for (i = 0; i < 20; i++) {
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
        $gc.remove();
      });
    });

    it('delta is minus', function () {
      today = moment();
      data = [];
      for (i = 0; i < 20; i++) {
        data.unshift({
          x: moment(today).subtract('month', i).format(),
          y: (i + 1) * 1000,
          y1: (i + 1) * 2000
        });
      }
      range = ChartAPI.Range.factory({
        unit: 'monthly'
      });
      init({
        data: data,
        yLength: 2
      }, range);
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
      expect(y.delta).toEqual('-1,000');
      expect(y.deltaClass).toEqual('minus');
      expect(y1.count).toEqual('420,000');
      expect(y1.delta).toEqual('-2,000');
      expect(y1.deltaClass).toEqual('minus');
      $gc.remove();
    });

    it('delta is zero (and without comma)', function () {
      today = moment();
      data = [];
      for (i = 0; i < 20; i++) {
        data.unshift({
          x: moment(today).subtract('month', i).format(),
          y: 1000,
          y1: 2000
        });
      }
      range = ChartAPI.Range.factory({
        unit: 'monthly'
      });
      init({
        data: data,
        yLength: 2
      }, range);
      config = graph.config;
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
      $gc.remove();
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
        end: moment(today).subtract('month', 9),
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
        $gc.remove();
      });
    });
  });

  describe('update graph', function () {
    _.each(['morris.bar', 'morris.line', 'morris.donut', 'morris.area', 'easel.bar', 'easel.motionLine', 'easel.mix', 'css.horizontalBar', 'css.ratioHorizontalBar'], function (type) {
      it('update range', function () {
        var today = moment();
        var data = [];
        for (i = 0; i < 180; i++) {
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
          label: {}
        }

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
          config.width = '400px'
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
            return d.x === moment(end).format()
          });
          var y0 = _.find(data, function (d) {
            return d.x === moment(end).subtract('days', 1).format();
          })

          expectedDeltaY = y1.y - y0.y;
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
            return d.x === moment(newEnd).format()
          });
          var y0 = _.find(data, function (d) {
            return d.x === moment(newEnd).subtract('days', 1).format();
          })

          expectedDeltaY = y1.y - y0.y;
          expectedDeltaY = ChartAPI.Data.addCommas(expectedDeltaY);
          expect(graph.labels.totals.y.delta).toEqual(expectedDeltaY);

          $gc.remove();
        });
      });
    });
  });

  it('use general data (no timeline)', function () {

  });

  it('only one data (delta returns blank)', function () {

  });

  describe('getColors', function () {
    it('reverse', function () {

    });
    it('shuffle', function () {

    });

    it('use own chartColor without default Chart Color', function () {

    })
  });

  describe('Feature detection (test)', function () {
    it('vml', function () {

    });

  });

  it('customize label template', function () {

  });

  it('get template JSON data', function () {

  });

  it('use template function in graph label', function () {

  })

});
