(function() {
  angular.module('HackerNews')
  .constant('API_BASE_URL', 'https://hacker-news.firebaseio.com/v0')
  .controller('MainCtrl', ['$scope', '$q', '$filter',
    'StorageService', 'subjectFilter', 'API_BASE_URL',
    function($scope, $q, $filter, StorageService, subjectFilter, API_BASE_URL) {
    $scope.news = [];
    $scope.filters = [
      { title: 'All' },
      { title: 'General', value: '\bjs\b,(ecma|java).*script,node.?js,css,style' },
      { title: 'JavaScript', value: '\bjs\b,(ecma|java).*script,node.?js' },
      { title: 'API', value: '\bapi\b' },
      { title: 'Css', value: 'css,style' },
      { title: 'Angular', value: 'angular' }
    ];
    $scope.curFilter = $scope.filters[1].value;
    $scope.customeFilter = $scope.filters[0];

    $scope.filterNews = function() {
      return $filter('subject')($scope.news, $scope.curFilter).length;
    };

    var newsUrls = [];
    var deferred = $q.defer();
    var storage = StorageService.getStorage('hackernews');

    $scope.refreshItems = function(filter) {
      if (filter)
        $scope.curFilter = filter;
      $scope.news = [];
      newsUrls = [];
      $scope.curStep = 'Fetching the list...';
      fetch(API_BASE_URL+'/topstories.json')
        .then(function(x) { return x.json(); })
        .then(function(x) {
          x.forEach(function(a, n) {
            var prevItem = storage.get(''+a);
            if (prevItem === null || prevItem === undefined) {
              newsUrls.push(
                fetch(API_BASE_URL+'/item/'+a+'.json')
                .then(function(i) {
                  $scope.curStep = 'Fetching items... ' + n;
                  return i.json();
                })
                .catch(function(err) {
                  $scope.error = err;
                }));
            } else {
              if (prevItem.url)
                $scope.news.push(prevItem);
            }
          });
          $q.all(newsUrls).then(function(results){
            $scope.curStep = 'Filtering items...';

            results.forEach(function(i) {
              storage.set(''+i.id, {type: i.type, title: i.title, url: i.url, time: i.time});
              if (i.url) {
                $scope.news.push({type: i.type, title: i.title, url: i.url, time: i.time});
              }
            });
            $scope.curStep = null;
          });
        });
    };

    $scope.refreshItems();

  }]);
})();
