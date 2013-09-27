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
    it('default settings', function () {
      var config = {
        data: 'list_data.json',
        staticPath: '/test/spec_helpers/',
        template: 'list_data.template'
      };
      var $lc = new ChartAPI.List(config, {
        dataType: 'general'
      });
      $lc.trigger('GET_OBJECT', function (obj) {
        list = obj;
        $lc.trigger('APPEND_TO', [$('body')])
      });
      waitsFor(function () {
        return list;
      }, 'get List object', 3000);
      runs(function () {
        console.log(list.range)
        expect(list.id).toMatch(/list-[0-9]+/);
        expect(list.config.staticPath).toEqual(config.staticPath);
        expect(list.$listContainer.attr('id')).toEqual(list.id + '-container');
      });
    });
  });
});
