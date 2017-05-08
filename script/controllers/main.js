(function() {
  var app = angular.module('HackerNews');
  app.controller('MainCtrl', ['$scope', '$q', function($scope, $q) {
    $scope.news = [];
    $scope.curStep = 'Fetching the list...';

    const apiBaseUrl = 'https://hacker-news.firebaseio.com/v0';
    var newsUrls = [];
    var deferred = $q.defer();

    fetch(apiBaseUrl+'/topstories.json')
      .then(function(x) { return x.json(); })
      .then(function(x) {
        x.forEach(function(a, n) {
          newsUrls.push(
            fetch(apiBaseUrl+'/item/'+a+'.json')
            .then(function(i) {
              $scope.curStep = 'Fetching items... ' + n;
              return i.json();
            })
            .catch(function(err) {
              $scope.error = err;
            }));
        });
        $q.all(newsUrls).then(function(results){
          $scope.curStep = 'Filtering items...';

          results.forEach(function(i) {
		        if (i.url && (/js/i.test(i.title) || /script/i.test(i.title))) {
              $scope.news.push({type: i.type, title: i.title, url: i.url});
            }
          });
          $scope.curStep = null;
        });
      });

  }]);
})();
