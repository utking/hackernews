(function() {
  angular.module('HackerNews')
  .constant('API_BASE_URL', 'https://hacker-news.firebaseio.com/v0')
  .controller('MainCtrl', ['$scope', '$q', 
    'StorageService', 'subjectFilter', 'API_BASE_URL',
    function($scope, $q, StorageService, subjectFilter, API_BASE_URL) {
    $scope.news = [];
    $scope.curStep = 'Fetching the list...';
    $scope.filters = [
      { title: 'All' },
      { title: 'General', value: 'js,script,node,css,style' },
      { title: 'JavaScript', value: 'js,script,node' },
      { title: 'Css', value: 'css,style' },
      { title: 'Angular', value: 'angular' }
    ];
    $scope.curFilter = $scope.filters[1].value;

    var newsUrls = [];
    var deferred = $q.defer();
    var storage = StorageService.getStorage('hackernews');

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
            $scope.news.push(prevItem);
          }
        });
        $q.all(newsUrls).then(function(results){
          $scope.curStep = 'Filtering items...';

          results.forEach(function(i) {
            storage.set(''+i.id, {nonJs: true, type: i.type, title: i.title, url: i.url});
            $scope.news.push({type: i.type, title: i.title, url: i.url});
          });
          $scope.curStep = null;
        });
      });

  }]);
})();
