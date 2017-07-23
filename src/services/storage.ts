(function () {
    angular.module("HackerNews")
        .factory("StorageService", ["$http", "API_BASE_URL", "$log",
            ($http: ng.IHttpService, API_BASE_URL: string, $log: ng.ILogCall): IStorageService => {

                let _filters: Array<IFilter> = [
                    {title: "All", value: undefined},
                    {title: "JavaScript", value: "\\bjs\\b,(ecma|java).*script,\\bnode(\\.?js)?\\b,\\bnpm\\b"},
                    {title: "SQL", value: "sql"},
                    {title: "GraphQL", value: "graphql"},
                    {title: "API", value: "\\bapi\\b"},
                    {title: "Css", value: "\\bcss\\b,\\bstyle\\b"},
                    {title: "Linux", value: "\\linux\\b"},
                    {title: "Vue", value: "\\vue(\\.?js)?\\b"},
                    {title: "Angular", value: "\\bangular"}
                ];

                _filters.unshift({
                    title: "General",
                    value: _filters.filter((f: IFilter) => f.value).map((f: IFilter) => f.value).join(",")
                });

                let getPrevNews = (storage: ILocalStorage): Array<number> => {
                    let prevNews = storage.get("prevNews");
                    return (!Array.isArray(prevNews) ? [] : prevNews);
                };

                let removeCachedItems = (storage: ILocalStorage, items: Array<string>) => {
                    items.forEach((i: string) => {
                        storage.remove(i);
                    });
                };

                let cleanCache = (storage: ILocalStorage): void => {
                    storage.clean();
                };

                let initFB = (): void => {
                    try {
                        FB.init({
                            appId: "628486370676726",
                            xfbml: true,
                            version: "v2.9"
                        });
                        FB.AppEvents.logPageView();
                    } catch (e) {
                        $log(e);
                    }
                };

                let fbShare = (url: string): void => {
                    try {
                        FB.ui({
                            method: "share",
                            href: url
                        }, () => {
                            $log('Facebook share UI initialized');
                        });
                    } catch (e) {
                        $log(e);
                    }
                };

                let _concatUniq = (ar1: Array<number>, ar2: Array<number>): Array<number> => {
                    return ar1.concat(ar2)
                        .reduce((prev: Array<number>, i: number): Array<number> => {
                            if (i && prev.indexOf(i) === -1) {
                                prev.push(i);
                            }
                            return prev;
                        }, []);
                };

                let getList = (): ng.IHttpPromise<Array<number>> => {
                    return $http.get(`${API_BASE_URL}/topstories.json`);
                };

                let getItem = (id: number): ng.IHttpPromise<INewsItem> => {
                    return $http.get(`${API_BASE_URL}/item/${id}.json`);
                };

                let getStorage = (basketName: string): ILocalStorage => {
                    return new LocalStorage(basketName.trim());
                };

                /**
                 * Public interface
                 */
                return {
                    filters: _filters,
                    concatUniq: _concatUniq,
                    getPrevNews: getPrevNews,
                    removeCachedItems: removeCachedItems,
                    getStorage: getStorage,
                    cleanCache: cleanCache,
                    initFB: initFB,
                    fbShare: fbShare,
                    getList: getList,
                    getItem: getItem
                };
            }]);
}());
