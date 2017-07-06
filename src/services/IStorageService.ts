/**
 * Created by jekson on 06.07.2017.
 */
interface IStorageService {
    filters: Array<IFilter>;
    concatUniq: (ar1: Array<number>, ar2: Array<number>) => Array<number>;
    getPrevNews: (storage: ILocalStorage) => Array<number>;
    removeCachedItems: (storage: ILocalStorage, items: Array<string>) => void;
    getStorage: (basketName: string) => ILocalStorage;
    cleanCache: (storage: ILocalStorage) => void;
    initFB: () => void;
    fbShare: (url: string) => void;
    getList: () => ng.IHttpPromise<Array<number>>;
    getItem: (id: number) => ng.IHttpPromise<INewsItem>;
}