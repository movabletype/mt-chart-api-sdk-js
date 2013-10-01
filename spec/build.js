describe('Build', function () {
  it('Build with JSON file', function () {
    var settings;

    runs(function () {
      MT.ChartAPI.Build('/spec/build_settings.json').appendTo($('body'));
    });

    waitsFor(function () {
      return !!$('.mtchart-container').html()
    });

    runs(function () {
      var $con = $('.mtchart-container');
      expect($con.length).toBeTruthy();
      expect($con.find('.graph-container').length).toBeTruthy();
      expect($con.find('.slider-container').length).toBeTruthy();
      expect($con.find('.list-container').length).toBeTruthy();
      $con.remove();
    })
  });

  it('Build with JSON object', function () {
    var settings, flag;

    $.getJSON('/spec/build_settings.json', function (json) {
      settings = json;
      flag = true;
    });

    waitsFor(function () {
      return flag;
    });

    runs(function () {
      MT.ChartAPI.Build(settings).appendTo($('body'));
    });

    waitsFor(function () {
      return !!$('.mtchart-container').length
    });

    runs(function () {
      var $con = $('.mtchart-container');
      expect($con.length).toBeTruthy();
      expect($con.find('.graph-container').length).toBeTruthy();
      expect($con.find('.slider-container').length).toBeTruthy();
      expect($con.find('.list-container').length).toBeTruthy();
      $con.remove();
    });
  });

  it('Build graph only', function () {
    var settings = {
      "graph": {
        "data": "/spec/graph_data.json"
      }
    };

    MT.ChartAPI.Build(settings).appendTo($('body'));

    waitsFor(function () {
      return !!$('.mtchart-container').length
    });

    runs(function () {
      var $con = $('.mtchart-container');
      expect($con.length).toBeTruthy();
      expect($con.find('.graph-container').length).toBeTruthy();
      expect($con.find('.slider-container').length).toBeFalsy();
      expect($con.find('.list-container').length).toBeFalsy();
      $con.remove();
    });
  });

  it('Build list only', function () {
    var settings = {
      "list": {
        "data": "/spec/list_data.json",
        "template": "/spec/list_data.template"
      }
    };

    MT.ChartAPI.Build(settings).appendTo($('body'));

    waitsFor(function () {
      return !!$('.mtchart-container').length
    });

    runs(function () {
      var $con = $('.mtchart-container');
      expect($con.length).toBeTruthy();
      expect($con.find('.graph-container').length).toBeFalsy();
      expect($con.find('.slider-container').length).toBeFalsy();
      expect($con.find('.list-container').length).toBeTruthy();
      $con.remove();
    });
  });

  it('GET_CONTAINER event', function () {
    var settings, $container;

    runs(function () {
      $container = MT.ChartAPI.Build('/spec/build_settings.json').appendTo($('body'));
    });

    waitsFor(function () {
      return !!$('.mtchart-container').html()
    });

    var flag1, flag2, flag3;
    runs(function () {
      $container.trigger('GET_CONTAINER', ['graph',
        function (container) {
          expect(container.hasClass('graph-container')).toBe(true);
          container.trigger('REMOVE');
          flag1 = true;
        }
      ]);
      $container.trigger('GET_CONTAINER', ['slider',
        function (container) {
          expect(container.hasClass('slider-container')).toBe(true);
          flag2 = true;
        }
      ]);
      $container.trigger('GET_CONTAINER', ['list',
        function (container) {
          expect(container.hasClass('list-container')).toBe(true);
          flag3 = true;
        }
      ]);
    });

    waitsFor(function () {
      return flag1 && flag2 && flag3;
    });

    runs(function () {
      $container.remove();
    })
  });
});
