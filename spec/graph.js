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
      runs(function () {
        spyOn(graph, 'remove_');
        var ret = $gc.trigger('REMOVE');
      });
      waitsFor(function () {
        return graph.remove_.callCount;
      });
      runs(function () {
        expect(graph.remove_).toHaveBeenCalled();
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
          y: 20 - i,
          y1: 40 - (i * 2)
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
        expect(y.count).toEqual('210');
        expect(y.delta).toEqual('1');
        expect(y1.count).toEqual('420');
        expect(y1.delta).toEqual('2');
        $gc.remove();
      });
    });

    it('delta is minus', function () {
      today = moment();
      data = [];
      for (i = 0; i < 20; i++) {
        data.unshift({
          x: moment(today).subtract('month', i).format(),
          y: i + 1,
          y1: (i + 1) * 2
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
      expect(y.count).toEqual('210');
      expect(y.delta).toEqual('-1');
      expect(y1.count).toEqual('420');
      expect(y1.delta).toEqual('-2');
      $gc.remove();
    });
  });
});
