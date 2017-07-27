(function () {
    type scopeType = {
        news: Array<INewsItem>;
        lastUpdateTime: Date;
        filters: Array<IFilter>;
        curFilter: string | undefined;
        curStep: string | null;
        error: string;
        onlyHotNews: boolean;
        fbShare: (url: string) => void;
        isHotItem: (i: INewsItem) => boolean;
        filterNews: (ar: Array<INewsItem>, f: string, h: boolean) => Array<INewsItem>;
        filterNewsLength: (ar: Array<INewsItem>, f: string, h: boolean) => number;
        $watch: (s: string, f: (v1: string, v2: string) => void) => void;
        $apply: (f: () => void) => void;
        refreshItems: (s?: string) => void;
        cleanCache: () => void;
    };
    angular.module("HackerNews")
        .controller("MainCtrl", ["$scope", "$q", "$filter", "StorageService", "HOT_ITEM_PERIOD",
            ($scope: scopeType, $q: ng.IQService, $filter, StorageService: IStorageService, HOT_ITEM_PERIOD: number) => {
                StorageService.initFB();
                let storage = StorageService.getStorage("hackernews");
                $scope.news = [];
                $scope.lastUpdateTime = new Date(storage.get("lastUpdateTime"));
                $scope.filters = StorageService.filters;
                $scope.curFilter = $scope.filters[1].value;
                $scope.onlyHotNews = storage.get("onlyHotNews");
                $scope.fbShare = StorageService.fbShare;

                let _processDownloaded = (_urls: Array<INewsItem>, s: scopeType, _storage: ILocalStorage) => {
                    $q.all(_urls)
                        .then((results: Array<INewsItem>): void => {
                            s.curStep = "Filtering items...";

                            results.forEach((i: INewsItem) => {

                                let item = <INewsItem>{
                                    id: i.id,
                                    created: (new Date).valueOf(),
                                    type: i.type,
                                    title: i.title,
                                    url: i.url,
                                    time: i.time
                                };

                                _storage.set(`${i.id}`, item);
                                if (i.url) {
                                    s.news.push(item);
                                }

                            });
                            $scope.curStep = null;
                            _storage.set("prevNews", s.news.map((i: INewsItem): number => {
                                return i.id;
                            }));
                            if (_urls.length) {
                                s.lastUpdateTime = new Date();
                                _storage.set("lastUpdateTime", s.lastUpdateTime);
                            }
                        });
                };

                $scope.isHotItem = (item: INewsItem): boolean => {
                    return (new Date().valueOf() - item.created) / 1000 < HOT_ITEM_PERIOD;
                };

                $scope.filterNews = (news: Array<INewsItem>, filter: string, hotNews: boolean): Array<INewsItem> => {
                    return $filter("subject")(
                        $filter("hotNews")(news, hotNews, HOT_ITEM_PERIOD), filter
                    );
                };

                $scope.filterNewsLength = (news, filter, hotNews): number => {
                    let items = $scope.filterNews(news, filter, hotNews);
                    return (items ? items.length : 0);
                };

                $scope.curFilter = storage.get("prevFilter");

                $scope.$watch("curFilter", (cur, prev) => {
                    if (cur !== prev) {
                        storage.set("prevFilter", $scope.curFilter);
                    }
                });

                $scope.$watch("onlyHotNews", (cur: string, prev: string): void => {
                    if (cur !== prev) {
                        storage.set("onlyHotNews", cur);
                    }
                });

                $scope.refreshItems = (filter: string): void => {
                    let newsUrls = [];
                    if (filter) {
                        $scope.curFilter = filter;
                    }
                    $scope.news = [];

                    $scope.curStep = "Fetching the list...";
                    StorageService.getList()
                        .then((x: ng.IHttpPromiseCallbackArg<Array<number>>) => {
                            return x.data;
                        })
                        .then((x: Array<number>) => {
                            StorageService.concatUniq(x, StorageService.getPrevNews(storage))
                                .forEach((a: number, n: number) => {
                                    let prevItem = storage.get(`${a}`);
                                    if (!prevItem) {
                                        newsUrls.push(
                                            StorageService.getItem(a)
                                                .then((i: ng.IHttpPromiseCallbackArg<INewsItem>) => {
                                                    $scope.curStep = `Fetching items... ${n}`;
                                                    return i.data;
                                                })
                                                .catch((err: any) => {
                                                    $scope.error = err.statusText;
                                                }));
                                    } else {
                                        if (prevItem.url) {
                                            $scope.news.push(prevItem);
                                        }
                                    }
                                });
                            _processDownloaded(newsUrls, $scope, storage);
                        })
                        .catch((/*err*/) => {
                            // Fail-safe: read from cache
                            $scope.$apply(() => {
                                StorageService.getPrevNews(storage)
                                    .forEach((a: number): void => {
                                        let prevItem = storage.get(`${a}`);
                                        if (prevItem && prevItem.url) {
                                            $scope.news.push(prevItem);
                                        }
                                    });
                                $scope.curStep = null;
                            });
                        });
                };

                $scope.cleanCache = (): void => {
                    StorageService.cleanCache(storage);
                    $scope.refreshItems();
                };

                $scope.refreshItems();

            }]);
}());
