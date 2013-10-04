describe('slider', function () {
  var basePath = !! window.__karma__ ? '/base' : '';

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

    for (var i = 0; i < 60; i++) {
      data.push({
        x: today.subtract('month', 1).format(),
        xLabel: today.format('YYYY-MM-DD'),
        y: Math.ceil(Math.random() * 100),
        y1: Math.ceil(Math.random() * 100)
      });
    }

    var $gc;
    beforeEach(function () {
      $gc = new ChartAPI.Graph({
        data: data,
        staticPath: basePath
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
    });

    describe('amount position', function () {
      var $sc, slider;

      function init(config) {
        $sc = new ChartAPI.Slider(config, {}, $gc, [$gc], [$gc]);
        $sc.trigger('GET_OBJECT', function (obj) {
          slider = obj;
          $sc.trigger('BUILD_SLIDER').trigger('APPEND_TO', [$('body')]);
        });
        waitsFor(function () {
          return $sc.length;
        }, 'get slider object', 3000);
      }

      afterEach(function () {
        $gc.remove();
        slider.$slider.slider('destroy');
        $sc.remove();
      });

      it('set slider amount position top', function () {
        var config = {
          'appendSliderAmountBottom': false
        };
        init(config);

        runs(function () {
          expect(slider.id).toMatch(/slider-[0-9]+/);
          expect(slider.$sliderContainer.attr('id')).toEqual(slider.id + '-container');
          expect($sc.children().first().hasClass('amount')).toBe(true);
        });
      });

      it('set slider amount position top', function () {
        var config = {
          'appendSliderAmountBottom': true
        };
        init(config);

        runs(function () {
          expect(slider.id).toMatch(/slider-[0-9]+/);
          expect(slider.$sliderContainer.attr('id')).toEqual(slider.id + '-container');
          expect($sc.children().last().hasClass('amount')).toBe(true);
        });
      });
    });
  });


  describe('events', function () {
    var data = [];
    var today = moment();

    for (var i = 0; i < 60; i++) {
      data.push({
        x: today.subtract('month', 1).format(),
        xLabel: today.format('YYYY-MM-DD'),
        y: Math.ceil(Math.random() * 100),
        y1: Math.ceil(Math.random() * 100)
      });
    }

    var $gc;
    beforeEach(function () {
      $gc = new ChartAPI.Graph({
        data: data,
        staticPath: basePath
      });
      $gc.trigger('APPEND_TO', [$('body')]);
      waitsFor(function () {
        return $gc.length;
      });
    });

    afterEach(function () {
      $gc.trigger('REMOVE');
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
        return !$sc.html();
      });
      runs(function () {
        expect($sc.html()).toBeFalsy();
        $sc.remove();
      });
    });

    it('SET_DATA_RANGE', function () {
      var $gc2 = new ChartAPI.Graph({
        data: data,
        staticPath: basePath
      });
      $gc2.trigger('APPEND_TO', [$('body')]);
      waitsFor(function () {
        return $gc.length;
      });
      var $sc, slider;
      runs(function () {
        $sc = new ChartAPI.Slider({}, {}, $gc, [$gc], [$gc]);
        $sc.trigger('GET_OBJECT', function (obj) {
          slider = obj;
          $sc.trigger('BUILD_SLIDER').trigger('APPEND_TO', [$('body')]);
        });
        waitsFor(function () {
          return $sc.length;
        }, 'get slider object', 3000);
      });
      runs(function () {
        expect(slider.$dataRangeTarget).toEqual($gc);
        $sc.trigger('SET_DATA_RANGE', [$gc2]);
        expect(slider.$dataRangeTarget).toEqual($gc2);
        $gc2.trigger('REMOVE');
        $sc.trigger('ERASE');
        $sc.remove();
      });
    });

    it('ADD_EVENT_LIST/REMOVE_EVENT_LIST', function () {
      var config = {
        staticPath: basePath,
        data: '/spec/list_data.json',
        template: '/spec/list_data.template'
      };
      var $lc = new ChartAPI.List(config);
      $lc.trigger('APPEND_TO', [$('body')]);

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
        var amountTarget = slider.eventTargetList.amount.get();
        var updateTarget = slider.eventTargetList.update.get();
        expect(amountTarget).toEqual([$gc]);
        expect(updateTarget).toEqual([$gc]);
        $sc.trigger('ADD_EVENT_LIST', ['amount', $lc]);
        amountTarget = slider.eventTargetList.amount.get();
        updateTarget = slider.eventTargetList.update.get();
        expect(amountTarget).toEqual([$gc, $lc]);
        expect(updateTarget).toEqual([$gc]);
        $sc.trigger('REMOVE_EVENT_LIST', ['amount', [$lc]]);
        amountTarget = slider.eventTargetList.amount.get();
        updateTarget = slider.eventTargetList.update.get();
        expect(amountTarget).toEqual([$gc]);
        expect(updateTarget).toEqual([$gc]);
        $sc.trigger('ADD_EVENT_LIST', ['update', [$lc]]);
        amountTarget = slider.eventTargetList.amount.get();
        updateTarget = slider.eventTargetList.update.get();
        expect(amountTarget).toEqual([$gc]);
        expect(updateTarget).toEqual([$gc, $lc]);
        $sc.trigger('REMOVE_EVENT_LIST', ['update', $lc]);
        amountTarget = slider.eventTargetList.amount.get();
        updateTarget = slider.eventTargetList.update.get();
        expect(amountTarget).toEqual([$gc]);
        expect(updateTarget).toEqual([$gc]);
        $lc.remove();
        $sc.trigger('ERASE');
        $sc.remove();
      });
    });

    it('REDRAW', function () {
      var $sc = new ChartAPI.Slider({}, {}, $gc, [$gc], [$gc]);
      var slider;
      $sc.trigger('GET_OBJECT', function (obj) {
        slider = obj;
        $sc.trigger('BUILD_SLIDER');
      });
      var sliderOld = slider.$slider;
      $sc.trigger('REDRAW');
      expect(slider.$slider).not.toEqual(sliderOld);
      $sc.trigger('ERASE');
      $sc.remove();
    });

    it('UPDATE', function () {
      var $sc = new ChartAPI.Slider({}, {}, $gc, [$gc], [$gc]);
      var slider;
      $sc.trigger('GET_OBJECT', function (obj) {
        slider = obj;
        $sc.trigger('BUILD_SLIDER').trigger('APPEND_TO', [$('body')]);
      });
      var s = data[5].x;
      var e = data[1].x;
      spyOn(slider, 'updateSliderAmount').andCallThrough();
      $sc.trigger('UPDATE', [
        [s, e]
      ]);
      expect(slider.updateSliderAmount).toHaveBeenCalled();
      expect(slider.$amount.text()).toEqual(data[5].xLabel.replace(/-[0-9]+$/, '') + ' - ' + data[1].xLabel.replace(/-[0-9]+$/, ''));
      $sc.trigger('ERASE');
      $sc.remove();
    });
  });

  describe('slide', function () {
    var data = [];
    var today = moment();

    for (var i = 0; i < 60; i++) {
      data.push({
        x: today.subtract('month', 1).format(),
        xLabel: today.format('YYYY-MM-DD'),
        y: Math.ceil(Math.random() * 100),
        y1: Math.ceil(Math.random() * 100)
      });
    }

    var $gc;
    var $sc, slider;

    beforeEach(function () {
      $gc = new ChartAPI.Graph({
        data: data,
        staticPath: basePath
      });
      $gc.trigger('APPEND_TO', [$('body')]);
      waitsFor(function () {
        return $gc.length;
      });
      runs(function () {
        $sc = new ChartAPI.Slider({}, {
          maxLength: 10
        }, $gc, [$gc], [$gc]);
        $sc.trigger('GET_OBJECT', function (obj) {
          slider = obj;
          $sc.trigger('BUILD_SLIDER').trigger('APPEND_TO', [$('body')]);
          spyOn(slider, 'updateSliderAmount').andCallThrough();
        });
      });
    });

    afterEach(function () {
      $gc.trigger('REMOVE');
      $sc.trigger('ERASE');
      $sc.remove();
    });

    it('Slider slide', function () {
      $sc.find('.ui-slider-handle').first().simulate("drag", {
        dx: 0.075 * $(window).width(),
        dy: 10
      });

      waitsFor(function () {
        return slider.updateSliderAmount.callCount;
      });

      runs(function () {
        expect(slider.updateSliderAmount).toHaveBeenCalled();
        expect(slider.$amount.text()).toEqual(data[4].xLabel.replace(/-[0-9]+$/, '') + ' - ' + data[0].xLabel.replace(/-[0-9]+$/, ''));
      });
    });

    it('slide handler over maxLength', function () {
      $sc.find('.ui-slider-handle').first().simulate("drag", {
        dx: -(0.150 * $(window).width()),
        dy: 10
      });

      waitsFor(function () {
        return slider.updateSliderAmount.callCount;
      });

      var count;
      runs(function () {
        expect(slider.updateSliderAmount).toHaveBeenCalled();
        expect(slider.$amount.text()).toEqual(data[18].xLabel.replace(/-[0-9]+$/, '') + ' - ' + data[9].xLabel.replace(/-[0-9]+$/, ''));
        count = slider.updateSliderAmount.callCount;
        $sc.find('.ui-slider-handle').last().simulate("drag", {
          dx: (0.075 * $(window).width()),
          dy: 10
        });
      });

      waitsFor(function () {
        return slider.updateSliderAmount.callCount > count;
      });

      runs(function () {
        expect(slider.$amount.text()).toEqual(data[13].xLabel.replace(/-[0-9]+$/, '') + ' - ' + data[4].xLabel.replace(/-[0-9]+$/, ''));
      });
    });
  });

  describe('slide with general data', function () {
    var data = [];
    var today = moment();

    for (var i = 0; i < 60; i++) {
      data.push({
        x: today.subtract('month', 1).format(),
        xLabel: today.format('YYYY-MM-DD'),
        y: Math.ceil(Math.random() * 100),
        y1: Math.ceil(Math.random() * 100)
      });
    }

    var $gc;
    var $sc, slider;

    beforeEach(function () {
      $gc = new ChartAPI.Graph({
        data: data,
        staticPath: basePath,
        dataLabel: 'xLabel'
      }, {
        maxLength: 10,
        dataType: 'general'
      });
      $gc.trigger('APPEND_TO', [$('body')]);
      waitsFor(function () {
        return $gc.length;
      });
      runs(function () {
        $sc = new ChartAPI.Slider({}, {
          maxLength: 10,
          dataType: 'general'
        }, $gc, [$gc], [$gc]);
        $sc.trigger('GET_OBJECT', function (obj) {
          slider = obj;
          $sc.trigger('BUILD_SLIDER').trigger('APPEND_TO', [$('body')]);
          spyOn(slider, 'updateSliderAmount').andCallThrough();
        });
      });
    });

    afterEach(function () {
      $gc.trigger('REMOVE');
      $sc.trigger('ERASE');
      $sc.remove();
    });

    it('Slider slide', function () {
      $sc.find('.ui-slider-handle').last().simulate("drag", {
        dx: 0.075 * $(window).width(),
        dy: 10
      });

      waitsFor(function () {
        return slider.updateSliderAmount.callCount;
      });

      runs(function () {
        expect(slider.updateSliderAmount).toHaveBeenCalled();
        expect(slider.$amount.text()).toEqual(data[4].xLabel + ' - ' + data[14].xLabel);
      });
    });

    it('slide handler over maxLength', function () {
      $sc.find('.ui-slider-handle').last().simulate("drag", {
        dx: (1 * $(window).width()),
        dy: 10
      });

      waitsFor(function () {
        return slider.updateSliderAmount.callCount;
      });

      var count;
      runs(function () {
        expect(slider.updateSliderAmount).toHaveBeenCalled();
        expect(slider.$amount.text()).toEqual(data[49].xLabel + ' - ' + data[59].xLabel);
        count = slider.updateSliderAmount.callCount;
        $sc.find('.ui-slider-handle').first().simulate("drag", {
          dx: -(1 * $(window).width()),
          dy: 10
        });
      });

      waitsFor(function () {
        return slider.updateSliderAmount.callCount > count;
      });

      runs(function () {
        expect(slider.$amount.text()).toEqual(data[0].xLabel + ' - ' + data[10].xLabel);
      });
    });
  });
});
