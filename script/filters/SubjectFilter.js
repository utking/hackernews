(function () {
  "use strict";
  angular.module("HackerNews")
  .filter("subject",[function () {
    return function(array, subjArrayStr) {
      if (!subjArrayStr)
        return array;
      var reArr = [];
      subjArrayStr.split(",").forEach(function(i) {
        reArr.push(new RegExp(i,"i"));
      });
      return array.filter(function(i) {
        var result = false;
        reArr.forEach(function(r) {
          if (r.test(i.title)) {
            result = true;
          }
        });
        return result;
      });
    }
  }]);
}());
