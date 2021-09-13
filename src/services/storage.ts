(function () {
    const API_BASE_URL = "https://hacker-news.firebaseio.com/v0";
    angular.module("HackerNews")
        .factory("StorageService", ["$http", "$log",
            ($http: ng.IHttpService, $log: ng.ILogCall): IStorageService => {

                const _filters: Array<IFilter> = [
                    {title: "All", value: undefined},
                    {title: "JavaScript", value: "\\bjs\\b,(ecma|java).*script,\\bnode(\\.?js)?\\b,\\bnpm\\b"},
                    {title: "Covid", value: "covid,delta,vaccin"},
                    {title: "SQL", value: "sql"},
                    {title: "GraphQL", value: "graphql"},
                    {title: "API", value: "\\bapi\\b"},
                    {title: "Hackers", value: "\\hack,\\bpassw,securi,vulner,\\bbot\\b,botnet,owasp"},
                    {title: "Css", value: "\\bcss\\b,\\bstyle\\b"},
                    {title: "Linux", value: "\\linux\\b,ubuntu,debian,\\bgnu\\b"},
                    {title: "Services", value: "docker,haproxy,cassandra,elasticsearch,rabbitmq,nginx,k8s,kubernetes,postfix"},
                    {title: "FAANG", value: "google,apple,facebook,\\bfb\\b,microsoft,\\bms\\b,netflix,whatsapp,amazon,\\baws\\b"},
                    {title: "Vue", value: "\\vue(\\.?js)?\\b"},
                    {title: "Angular", value: "\\bangular"}
                ];

                _filters.unshift({
                    title: "General",
                    value: _filters.filter((f: IFilter) => f.value).map((f: IFilter) => f.value).join(",")
                });

                const getPrevNews = (storage: ILocalStorage): Array<number> => {
                    const prevNews = storage.get("prevNews");
                    return (!Array.isArray(prevNews) ? [] : prevNews);
                };

                const removeCachedItems = (storage: ILocalStorage, items: Array<string>) => {
                    items.forEach((i: string) => {
                        storage.remove(i);
                    });
                };

                const cleanCache = (storage: ILocalStorage): void => {
                    storage.clean();
                };

                const initFB = (): void => {
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

                const fbShare = (url: string): void => {
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

                const _concatUniq = (ar1: Array<number>, ar2: Array<number>): Array<number> => {
                    return ar1.concat(ar2)
                        .reduce((prev: Array<number>, i: number): Array<number> => {
                            if (i && prev.indexOf(i) === -1) {
                                prev.push(i);
                            }
                            return prev;
                        }, []);
                };

                const getList = (): ng.IHttpPromise<Array<number>> => {
                    return $http.get(`${API_BASE_URL}/topstories.json`);
                };

                const getItem = (id: number): ng.IHttpPromise<INewsItem> => {
                    return $http.get(`${API_BASE_URL}/item/${id}.json`);
                };

                const getStorage = (basketName: string): ILocalStorage => {
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
