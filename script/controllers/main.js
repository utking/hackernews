(function() {
  angular.module('HackerNews')
  .constant('API_BASE_URL', 'https://hacker-news.firebaseio.com/v0')
  .constant('HOT_ITEM_PERIOD', 1800)//half a minute
  .controller('MainCtrl', ['$scope', '$q', '$filter',
    'StorageService', 'subjectFilter', 'hotNewsFilter',
    'API_BASE_URL', 'HOT_ITEM_PERIOD',
    function($scope, $q, $filter, StorageService, 
      subjectFilter, hotNewsFilter, API_BASE_URL, HOT_ITEM_PERIOD) {
    var storage = StorageService.getStorage('hackernews');
    $scope.news = [];
    $scope.filters = [
      { title: 'All' },
      { title: 'General', value: '\\bjs\\b,(ecma|java).*script,node.?js,\\bcss\\b,\\bstyle\\b' },
      { title: 'JavaScript', value: '\\bjs\\b,(ecma|java).*script,node.?js' },
      { title: 'API', value: '\\bapi\\b' },
      { title: 'Css', value: '\\bcss\\b,\\bstyle\\b' },
      { title: 'Angular', value: '\\bangular' }
    ];
    $scope.curFilter = $scope.filters[1].value;
    $scope.customeFilter = $scope.filters[0];
		$scope.onlyHotNews = storage.get('onlyHotNews');

    $scope.isHotItem = function(item) {
      return (new Date - item.created)/1000 < HOT_ITEM_PERIOD;
    };

    $scope.filterNews = function() {
      return $filter('subject')(
					$filter('hotNews')($scope.news, $scope.onlyHotNews, HOT_ITEM_PERIOD),
					$scope.curFilter
					);
    };

    $scope.filterNewsLength = function() {
      return $scope.filterNews().length;
    };

    var newsUrls = [];
    var deferred = $q.defer();
    $scope.cleanCache = function() {
      StorageService.cleanCache(storage);
    };

    var prevFilter = storage.get('prevFilter');
    $scope.curFilter = prevFilter;

    $scope.$watch('curFilter', function(cur, prev) {
      if (cur !== prev) {
        storage.set('prevFilter', $scope.curFilter);
      }
    });

    $scope.$watch('onlyHotNews', function(cur, prev) {
      if (cur !== prev) {
        storage.set('onlyHotNews', cur);
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

              var item = {
                id: i.id,
                created: (new Date).valueOf(),
                type: i.type,
                title: i.title,
                url: i.url,
                time: i.time
              };

              storage.set(''+i.id, item);
              if (i.url) {
                $scope.news.push(item);
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
      var result = ar1.concat(ar2)
      .reduce(function(prev, i) {
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
