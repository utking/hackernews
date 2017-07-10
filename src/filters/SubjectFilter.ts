(function () {
    angular.module("HackerNews")
        .filter("subject", [(): (array: Array<INewsItem>, subjArrayStr: string) => Array<INewsItem> => {
            return (array: Array<INewsItem>, subjArrayStr: string): Array<INewsItem> => {
                let reArr: RegExp[] = [];
                if (!subjArrayStr) {
                    return array;
                }
                subjArrayStr.split(",").forEach((i: string) => {
                    reArr.push(new RegExp(i, "i"));
                });
                return array.filter((i: INewsItem) => {
                    let result = false;
                    reArr.forEach((r: RegExp) => {
                        if (r.test(i.title)) {
                            result = true;
                        }
                    });
                    return result;
                });
            }
        }]);
}());
