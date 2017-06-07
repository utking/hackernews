(function () {
  angular.module("HackerNews")
  .filter("hotNews",[function () {
    return function(array, onlyHot, interval) {
			if (!interval || parseInt(interval, 10) < 1000) {
				interval = 1000;
			}
      if (!onlyHot) {
        return array;
			}
      return array.filter(function(i) {
        return (new Date - i.created)/1000 < interval;
      });
    };
  }]);
}());
