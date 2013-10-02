describe('List', function () {
  var orig = ChartAPI.List;
  ChartAPI.List = function (config, range) {
    var ret = orig.call(this, config, range);
    ret.on('GET_OBJECT', $.proxy(function (e, callback) {
      callback(this);
    }, this));
    return ret;
  };
  ChartAPI.List = $.extend(ChartAPI.List, orig);
  ChartAPI.List.prototype = orig.prototype;

  describe('initialize', function () {
    var list;

    it('default settings', function () {
      var config = {
        data: '/spec/list_data.json',
        template: '/spec/list_data.template'
      };
      var $lc = new ChartAPI.List(config, {
        dataType: 'general'
      });
      $lc.trigger('GET_OBJECT', function (obj) {
        list = obj;
        $lc.trigger('APPEND_TO', [$('body')]);
      });
      waitsFor(function () {
        return list && $lc.html();
      }, 'get List object', 3000);
      runs(function () {
        expect(list.id).toMatch(/list-[0-9]+/);
        expect(list.config.staticPath).toEqual(config.staticPath);
        expect(list.$listContainer.attr('id')).toEqual(list.id + '-container');
        var link = $lc.find('li a').first();
        expect(link.text()).toEqual('Entry0');
        $lc.remove();
      });
    });

    it('construct with json object', function () {
      var data = [],
        today = moment();
      for (var i = 0; i < 30; i++) {
        var d = moment(today).subtract('day', i);
        data.push({
          x: d.format('YYYY-MM-DD'),
          date: d.lang('ja').format('LL'),
          title: 'Entry' + i,
          href: 'http://memolog.org/post/' + i
        });
      }

      var config = {
        data: data,
        template: '/spec/list_data.template'
      };
      var $lc = new ChartAPI.List(config, {
        dataType: 'general'
      });
      $lc.trigger('GET_OBJECT', function (obj) {
        list = obj;
        $lc.trigger('APPEND_TO', [$('body')]);
      });
      waitsFor(function () {
        return list && $lc.html();
      }, 'get List object', 3000);
      runs(function () {
        expect(list.id).toMatch(/list-[0-9]+/);
        expect(list.config.staticPath).toEqual(config.staticPath);
        expect(list.$listContainer.attr('id')).toEqual(list.id + '-container');
        var link = $lc.find('li a').first();
        expect(link.text()).toEqual('Entry0');
        $lc.remove();
      });
    });
  });

  describe('RequireJS', function () {
    var $requirejs, $config, list;
    beforeEach(function () {
      $requirejs = $('<script src="/test/other_libs/require.js"></script>').appendTo($('head'));
      waitsFor(function () {
        return !!window.requirejs;
      });
      runs(function () {
        $config = $("<script>requirejs.config({baseUrl: '.',paths: { text: 'test/other_libs/text' }})</script>").appendTo($('head'));
      });
    });

    it('get template with requirejs', function () {
      var config = {
        data: '/spec/list_data.json',
        template: '/spec/list_data.template'
      };
      var $lc = new ChartAPI.List(config, {
        dataType: 'general'
      });
      $lc.trigger('GET_OBJECT', function (obj) {
        list = obj;
        $lc.trigger('APPEND_TO', [$('body')]);
      });
      waitsFor(function () {
        return list && $lc.html();
      }, 'get List object', 3000);
      runs(function () {
        expect(list.id).toMatch(/list-[0-9]+/);
        expect(list.config.staticPath).toEqual(config.staticPath);
        expect(list.$listContainer.attr('id')).toEqual(list.id + '-container');
        var link = $lc.find('li a').first();
        expect(link.text()).toEqual('Entry0');
        $lc.remove();
      });
    });

    afterEach(function () {
      $requirejs.remove();
      $config.remove();
      $('script[src$="text.js"]').remove();
      delete window.require;
      delete window.define;
      delete window.requirejs;
    });
  });

  describe('event', function () {
    var list, $lc;

    var data = [],
      today = moment();
    for (var i = 0; i < 60; i++) {
      var d = moment(today).subtract('day', i);
      data.push({
        x: d.format('YYYY-MM-DD'),
        date: d.lang('ja').format('LL'),
        title: 'Entry' + i,
        href: 'http://memolog.org/post/' + i
      });
    }

    function init(config, range) {
      config = config || {};
      config.data = data;
      config.template = '/spec/list_data.template';

      range = range || {};
      range.dataType = 'general';

      $lc = new ChartAPI.List(config, range);
      $lc.trigger('GET_OBJECT', function (obj) {
        list = obj;
        $lc.trigger('APPEND_TO', [$('body')]);
      });

      waitsFor(function () {
        return list && $lc.html();
      }, 'get List object', 3000);
    }

    it('UPDATE', function () {
      init();
      var link;
      runs(function () {
        link = $lc.find('li a').first();
        expect(link.text()).toEqual('Entry0');
        spyOn(list, 'update_').andCallThrough();

        $lc.trigger('UPDATE', [
          [10, 20]
        ]);
      });

      waitsFor(function () {
        return !!list.update_.callCount;
      });

      runs(function () {
        link = $lc.find('li a').first();
        expect(link.text()).toEqual('Entry10');
      });
    });

    it('GET_DATA_RANGE', function () {
      init();
      var flag,
        $container = $lc.trigger('GET_DATA_RANGE', [
          function (data) {
            expect(data).toBeDefined();
            expect(data.min).toEqual(0);
            expect(data.max).toEqual(59);
            flag = true;
          }
        ]);
      waitsFor(function () {
        return flag;
      });
      runs(function () {
        expect($container).toEqual($lc);
      });
    });

    it('GET_LABEL', function () {
      init();
      var flag,
        $container = $lc.trigger('GET_LABEL', [
          [9],
          function (data) {
            expect(data).toBeDefined();
            expect(data[0]).toEqual(moment().subtract('days', 9).format('YYYY-MM-DD'));
            flag = true;
          }
        ]);
      waitsFor(function () {
        return flag;
      });
      runs(function () {
        expect($container).toEqual($lc);
      });
    });

    it('GET_LABEL with xLabel', function () {
      init({
        dataLabel: 'title'
      });
      var flag,
        $container = $lc.trigger('GET_LABEL', [
          [9, 13],
          function (data) {
            expect(data).toBeDefined();
            expect(data.length).toEqual(2);
            expect(data[0]).toEqual('Entry9');
            expect(data[1]).toEqual('Entry13');
            flag = true;
          }
        ]);
      waitsFor(function () {
        return flag;
      });
      runs(function () {
        expect($container).toEqual($lc);
      });
    });
  });

  it('when config.data is null/undefined, getData only just calls callback', function () {
    var list;
    var config = {
      template: '/spec/list_data.template'
    };
    var $lc = new ChartAPI.List(config, {
      dataType: 'general'
    });
    $lc.trigger('GET_OBJECT', function (obj) {
      list = obj;
      $lc.trigger('APPEND_TO', [$('body')]);
    });
    waitsFor(function () {
      return list && $lc.html();
    }, 'get List object', 3000);

    var spy;
    runs(function () {
      spyOn(ChartAPI.Data, 'getData');
      spy = jasmine.createSpy('spy');
      list.getData(function () {
        spy();
      });
    });
    waitsFor(function () {
      return spy.callCount;
    });
    runs(function () {
      expect(spy).toHaveBeenCalled();
      expect(ChartAPI.Data.getData).not.toHaveBeenCalled();
    });
  });

  afterEach(function () {
    $lc.remove();
  });
});
