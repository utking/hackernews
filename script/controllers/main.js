(function() {
  angular.module('HackerNews')
  .constant('API_BASE_URL', 'https://hacker-news.firebaseio.com/v0')
  .controller('MainCtrl', ['$scope', '$q', '$filter',
    'StorageService', 'subjectFilter', 'API_BASE_URL',
    function($scope, $q, $filter, StorageService, subjectFilter, API_BASE_URL) {
    $scope.news = [];
    $scope.filters = [
      { title: 'All' },
      { title: 'General', value: '\\bjs\\b,(ecma|java).*script,node.?js,\\bcss\\b,\\bstyle\\b' },
      { title: 'JavaScript', value: '\\bjs\\b,(ecma|java).*script,node.?js' },
      { title: 'API', value: '\\bapi\\b' },
      { title: 'Css', value: 'css,style' },
      { title: 'Angular', value: '\\bangular\\b' }
    ];
    $scope.curFilter = $scope.filters[1].value;
    $scope.customeFilter = $scope.filters[0];

    $scope.filterNews = function() {
      return $filter('subject')($scope.news, $scope.curFilter).length;
    };

    var newsUrls = [];
    var deferred = $q.defer();
    var storage = StorageService.getStorage('hackernews');

    var prevFilter = storage.get('prevFilter');
    $scope.curFilter = prevFilter;

    $scope.$watch('curFilter', function(cur, prev) {
      if (cur !== prev) {
        storage.set('prevFilter', $scope.curFilter);
      }
    });

    $scope.refreshItems = function(filter) {
      if (filter)
        $scope.curFilter = filter;
      $scope.news = [];
      newsUrls = [];

      $scope.curStep = 'Fetching the list...';
      fetch(API_BASE_URL+'/topstories.json')
        .then(function(x) { return x.json(); })
        .then(function(x) {
          concatUniq(x, StorageService.getPrevNews(storage))
          .forEach(function(a, n) {
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
            storage.set('prevNews', $scope.news.map(function(i) {
              return i.id;
            }));
          });
        });
    };

    $scope.refreshItems();

    function concatUniq(ar1, ar2) {
      var result = ar1.concat(ar2).reduce(function(prev, i) {
        //if (!prev) prev = [];
        if (i && prev.indexOf(i) === -1) {
          prev.push(i);
        }
        return prev;
      }, []);
      return result;
    }

  }]);
})();
