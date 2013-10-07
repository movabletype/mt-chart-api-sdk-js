describe('date', function () {
  describe('manual parse', function () {
    var today;
    beforeEach(function () {
      spyOn(Date, 'parse').andReturn(Date.parse());
      today = moment().startOf('second');
    });

    it('parse manually', function () {
      var date = ChartAPI.Date.parse(today.format());
      expect(date.valueOf()).toEqual(today.toDate().valueOf());
    });

    it('parse utc timezone with Z', function () {
      var d = today.format('YYYY/MM/DDTHH:mm:ss');
      var str = d + 'Z';
      var date = ChartAPI.Date.parse(str);
      expect(date.valueOf()).toEqual(today.toDate().valueOf() - today.toDate().getTimezoneOffset() * 1000 * 60);
    });

    it('parse string like YYYY/MM/DD', function () {
      var str = today.format('YYYY/MM/DD');
      var date = ChartAPI.Date.parse(str);
      expect(date.valueOf()).toEqual(today.startOf('day').toDate().valueOf());
    });

    it('parse string like 99/7/7 (use local timezone)', function () {
      var str = '99/7/7';
      var date = ChartAPI.Date.parse(str);
      expect(date.valueOf()).toEqual(931273200000);
    });

    it('parse string like 2013-07-07 (use UTC)', function () {
      var str = '2013-07-07';
      var date = ChartAPI.Date.parse(str);
      expect(date.valueOf()).toEqual(1373155200000);
    });

    it('parse string like 2013/07', function () {
      var str = '2013/07';
      var date = ChartAPI.Date.parse(str);
      expect(date.valueOf()).toEqual((new Date(2013, 6, 1)).valueOf());
    });

    it('parse string like 2013', function () {
      var str = '2013';
      var date = ChartAPI.Date.parse(str);
      expect(date.valueOf()).toEqual((new Date(2013, 0, 1)).valueOf());
    });

    it('parse zero string', function () {
      var str = '0';
      var date = ChartAPI.Date.parse(str);
      expect(date.valueOf()).toEqual((new Date(2013, 0, 1)).valueOf());
    });

    it('parse minus timezone', function () {
      var d = today.format('YYYY-MM-DDTHH:mm:ss');
      var str = d + '-04:30';
      var date = ChartAPI.Date.parse(str);
      expect(date.valueOf()).toEqual(today.toDate().valueOf() - today.toDate().getTimezoneOffset() * 1000 * 60 + 270 * 1000 * 60);
    });

    it('parse with millisecond', function () {
      var day = moment();
      var str = day.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      var date = ChartAPI.Date.parse(str);
      expect(date.valueOf()).toEqual(day.toDate().valueOf());
    });
  });

  describe('calculate end of month', function () {
    it('calculate end of month', function () {
      var date = new Date(2013, 8, 30);
      var calcDate = ChartAPI.Date.calcDate(date, 6, 'monthly');
      expect(calcDate.valueOf()).toEqual((new Date(2014, 1, 28)).valueOf());

      calcDate = ChartAPI.Date.calcDate(date, 8, 'monthly', true);
      expect(calcDate.valueOf()).toEqual((new Date(2013, 1, 28)).valueOf());
    });

    it('calculate end of month (year)', function () {
      var date = new Date(2012, 1, 29);
      var calcDate = ChartAPI.Date.calcDate(date, 2, 'yearly');
      expect(calcDate.valueOf()).toEqual((new Date(2013, 1, 28)).valueOf());

      calcDate = ChartAPI.Date.calcDate(date, 2, 'yearly', true);
      expect(calcDate.valueOf()).toEqual((new Date(2011, 1, 28)).valueOf());
    });

    it('calculate end of month (quarter)', function () {
      var date = new Date(2012, 6, 31);
      var calcDate = ChartAPI.Date.calcDate(date, 4, 'quarter');
      expect(calcDate.valueOf()).toEqual((new Date(2013, 3, 30)).valueOf());

      calcDate = ChartAPI.Date.calcDate(date, 2, 'quarter', true);
      expect(calcDate.valueOf()).toEqual((new Date(2012, 3, 30)).valueOf());
    });
  });
});
