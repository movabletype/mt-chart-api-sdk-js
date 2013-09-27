describe('slider', function () {
  var orig = ChartAPI.Slider;
  ChartAPI.Slider = function (config, range, $dataRangeTarget, updateTarget, amountTarget) {
    var ret = orig.call(this, config, range, $dataRangeTarget, updateTarget, amountTarget);
    ret.on('GET_OBJECT', $.proxy(function (e, callback) {
      callback(this);
    }, this));
    return ret;
  };
  ChartAPI.Slider = $.extend(ChartAPI.Slider, orig);
  ChartAPI.Slider.prototype = orig.prototype;

  describe('initialize', function () {
    var data = [];
    var today = moment();

    for (i = 0; i < 60; i++) {
      data.push({
        x: today.subtract('month', 1).format(),
        y: Math.ceil(Math.random() * 100),
        y1: Math.ceil(Math.random() * 100)
      });
    }

    var $gc;
    beforeEach(function () {
      $gc = new ChartAPI.Graph({
        data: data
      });
      $gc.trigger('APPEND_TO', [$('body')]);
      waitsFor(function () {
        return $gc.length;
      });
    });

    it('default settings', function () {
      var $sc = new ChartAPI.Slider({}, {}, $gc, [$gc], [$gc]);
      var slider;
      $sc.trigger('GET_OBJECT', function (obj) {
        slider = obj;
        $sc.trigger('BUILD_SLIDER').trigger('APPEND_TO', [$('body')]);
      });
      waitsFor(function () {
        return $sc.length;
      }, 'get slider object', 3000);
      runs(function () {
        expect(slider.id).toMatch(/slider-[0-9]+/);
        expect(slider.$sliderContainer.attr('id')).toEqual(slider.id + '-container');
        $gc.remove();
        slider.$slider.slider('destroy');
        $sc.remove();
      });
    });

    it('no jQuery UI', function () {
      spyOn($, 'ui').andReturn(undefined);
      expect(ChartAPI.Slider).toThrow();
      $gc.remove();
    })
  });


  describe('events', function () {
    var data = [];
    var today = moment();

    for (i = 0; i < 60; i++) {
      data.push({
        x: today.subtract('month', 1).format(),
        y: Math.ceil(Math.random() * 100),
        y1: Math.ceil(Math.random() * 100)
      });
    }

    var $gc;
    beforeEach(function () {
      $gc = new ChartAPI.Graph({
        data: data
      });
      $gc.trigger('APPEND_TO', [$('body')]);
      waitsFor(function () {
        return $gc.length;
      });
    });

    it('ERASE', function () {
      var $sc = new ChartAPI.Slider({}, {}, $gc, [$gc], [$gc]);
      var slider;
      $sc.trigger('GET_OBJECT', function (obj) {
        slider = obj;
        $sc.trigger('BUILD_SLIDER').trigger('APPEND_TO', [$('body')]);
      });
      waitsFor(function () {
        return $sc.length;
      }, 'get slider object', 3000);
      runs(function () {
        expect(slider.id).toMatch(/slider-[0-9]+/);
        expect(slider.$sliderContainer.attr('id')).toEqual(slider.id + '-container');
        $sc.trigger('ERASE');
      });
      waitsFor(function () {
        return !$sc.html()
      });
      runs(function () {
        expect($sc.html()).toBeFalsy();
        $gc.remove();
      })
    });
  });
});
