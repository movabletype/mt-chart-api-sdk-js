describe('graph', function () {
  var orig = ChartAPI.Graph;
  ChartAPI.Graph = function (config, range) {
    var ret = orig.call(this, config, range);
    ret.on('GET_OBJECT', $.proxy(function (e, callback) {
      callback(this);
    }, this));
    return ret;
  }
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
        expect(config.id).toMatch(/graph-[0-9]+/)
        expect(config.yLength).toEqual(1);
        expect(config.type).toEqual('morris.bar');
        expect(config.staticPath).toEqual('');
        expect(config.data).toEqual('graph.json');
      });
    });
  });

  describe('get graph data', function () {
    it('getJSON', function () {
      var staticPath = window.__karma__ === undefined ? 'spec/' : 'base/spec/';
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
        expect(data[0]).toBeDefined()
        expect(data[0].x).toBeTruthy();
        expect(moment(data[0].x).format('YYYYMMDD')).toEqual(moment().format('YYYYMMDD'));
        expect(data[0].y).toEqual(1);
      })
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
        expect(data[0]).toBeDefined()
        expect(data[0].x).toBeTruthy();
        expect(moment(data[0].x).format('YYYYMMDD')).toEqual(moment().format('YYYYMMDD'));
        expect(data[0].y).toEqual(1);
      });
    });
  });
});
