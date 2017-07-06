/**
 * Created by jekson on 06.07.2017.
 */
interface ILocalStorage {
    get: (prop: string, defVal?: any) => any;
    set: (prop: string, val: any) => void;
    remove: (prop: string) => void;
    clean: () => void;
}