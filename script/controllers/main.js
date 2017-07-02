(function() {
  "use strict";
  angular.module("HackerNews")
  .controller("MainCtrl", ["$scope", "$q", "$filter",
    "StorageService", "subjectFilter", "hotNewsFilter", "HOT_ITEM_PERIOD",
    function($scope, $q, $filter, StorageService,
      subjectFilter, hotNewsFilter, HOT_ITEM_PERIOD) {
      StorageService.initFB();
      var storage = StorageService.getStorage("hackernews");
      $scope.news = [];
      $scope.lastUpdateTime = new Date(storage.get("lastUpdateTime"));
      $scope.filters = StorageService.filters;
      $scope.curFilter = $scope.filters[1].value;
      $scope.customeFilter = $scope.filters[0];
      $scope.onlyHotNews = storage.get("onlyHotNews");
      $scope.fbShare = StorageService.fbShare;
      var concatUniq = StorageService.concatUniq;

      $scope.isHotItem = function(item) {
        return (new Date() - item.created)/1000 < HOT_ITEM_PERIOD;
      };

      $scope.filterNews = function(news, filter, hotNews) {
        return $filter("subject")(
          $filter("hotNews")(news, hotNews, HOT_ITEM_PERIOD), filter
        );
      };

      $scope.filterNewsLength = function(news, filter, hotNews) {
        var items = $scope.filterNews(news, filter, hotNews);
        return (items ? items.length : 0);
      };

      var newsUrls = [];
      var deferred = $q.defer();
      $scope.cleanCache = function() {
        StorageService.cleanCache(storage);
      };

      var prevFilter = storage.get("prevFilter");
      $scope.curFilter = prevFilter;

      $scope.$watch("curFilter", function(cur, prev) {
        if (cur !== prev) {
          storage.set("prevFilter", $scope.curFilter);
        }
      });

      $scope.$watch("onlyHotNews", function(cur, prev) {
        if (cur !== prev) {
          storage.set("onlyHotNews", cur);
        }
      });

      $scope.refreshItems = function(filter) {
        if (filter) {
          $scope.curFilter = filter;
        }
        $scope.news = [];
        newsUrls = [];

        $scope.curStep = "Fetching the list...";
        StorageService.getList()
          .then(function(x) { return x.data; })
          .then(function(x) {
            concatUniq(x, StorageService.getPrevNews(storage))
            .forEach(function(a, n) {
              var prevItem = storage.get(""+a);
              if (!prevItem) {
                newsUrls.push(
                  StorageService.getItem(a)
                  .then(function(i) {
                    $scope.curStep = "Fetching items... " + n;
                    return i.data;
                  })
                  .catch(function(err) {
                    $scope.error = err;
                  }));
              } else {
                if (prevItem.url) {
                  $scope.news.push(prevItem);
                }
              }
            });
            $q.all(newsUrls)
            .then(function(results) {
              $scope.curStep = "Filtering items...";

              results.forEach(function(i) {

                var item = {
                  id: i.id,
                  created: (new Date).valueOf(),
                  type: i.type,
                  title: i.title,
                  url: i.url,
                  time: i.time
                };

                storage.set(""+i.id, item);
                if (i.url) {
                  $scope.news.push(item);
                }

              });
              $scope.curStep = null;
              storage.set("prevNews", $scope.news.map(function(i) {
                return i.id;
              }));
              if (newsUrls.length) {
                $scope.lastUpdateTime = new Date();
                storage.set("lastUpdateTime", $scope.lastUpdateTime);
              }
            });
          })
          .catch(function(err) {
            // Fail-safe: read from cache
            $scope.$apply(function() {
              StorageService.getPrevNews(storage)
              .forEach(function(a, n) {
                var prevItem = storage.get(""+a);
                if (prevItem && prevItem.url) {
                    $scope.news.push(prevItem);
                }
              });
              $scope.curStep = null;
            });
          });
      };

      $scope.refreshItems();

  }]);
}());
