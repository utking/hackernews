(function () {
    angular.module("HackerNews")
        .filter("hotNews", [(): (array: Array<INewsItem>, onlyHot: boolean, interval: number) => Array<INewsItem> => {
            return (array: Array<INewsItem>, onlyHot: boolean, interval: number): Array<INewsItem> => {
                if (interval < 1000) {
                    interval = 1000;
                }
                if (!onlyHot) {
                    return array;
                }
                return array.filter((i: INewsItem): boolean => {
                    return (new Date().valueOf() - i.created) / 1000 < interval;
                });
            };
        }]);
}());
