describe('date', function () {
  describe('manual parse', function () {
    var today;
    beforeEach(function () {
      spyOn(Date, 'parse').andReturn(Date.parse());
      today = moment().startOf('second');
    })

    it('parse manually', function () {
      var date = ChartAPI.Date.parse(today.format());
      expect(date.valueOf()).toEqual(today.valueOf());
    });

    it('parse utc timezone with Z', function () {
      var d = today.format('YYYY/MM/DDTHH:mm:ss');
      var str = d + 'Z';
      var date = ChartAPI.Date.parse(str);
      expect(date.valueOf()).toEqual(today.valueOf() - today.toDate().getTimezoneOffset() * 1000 * 60);
    });

    it('parse string like YYYY/MM/DD', function () {
      var str = today.format('YYYY/MM/DD');
      var date = ChartAPI.Date.parse(str);
      expect(date.valueOf()).toEqual(today.startOf('day').valueOf());
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
  });
});
