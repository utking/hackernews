/**
 * Created by jekson on 06.07.2017.
 */
class LocalStorage implements ILocalStorage {
    private localStorage;
    // or use an object-based replacement
    private _store = {};

    constructor(private _basket: string) {
        this.init();
    }

    private init() {
        try {
            // try to use the built-in localStorage
            this.localStorage = window.localStorage;
        } catch (e) {

            const _getItem = (prop: string, defVal: any): any => {
                if (this._store[prop]) {
                    return this._store[prop];
                }
                return defVal !== undefined ? defVal : null;
            };

            const _setItem = (prop: string, val: any): void => {
                this._store[prop] = val;
            };

            const _removeItem = (prop: string): void => {
                this._store[prop] = undefined;
            };

            const _clean = (): void => {
                this._store = {};
            };

            this.localStorage = {
                getItem: _getItem,
                setItem: _setItem,
                removeItem: _removeItem,
                clean: _clean
            };
        }
    }

    set(prop: string, val: any): void {
        if (!this._basket) {
            throw new Error("You should specify the basket name first");
        }
        if (!prop) {
            throw new Error("You should specify the property name");
        }
        this.localStorage.setItem(`${this._basket}.${prop}`, JSON.stringify(val));
    }

    get(prop: string, defVal?: any): any {
        if (!this._basket) {
            throw new Error("You should specify the basket name first");
        }
        if (!prop) {
            throw new Error("You should specify the property name");
        }

        const val = this.localStorage.getItem(`${this._basket}.${prop}`, null);
        if (val === null) {
            return defVal;
        }
        try {
            return JSON.parse(val);
        } catch (e) {
            return defVal;
        }
    }

    remove(prop: string): void {
        if (!this._basket) {
            throw new Error("You should specify the basket name first");
        }
        if (!prop || !prop.charAt) {
            throw new Error("You should specify the property name");
        }
        this.localStorage.removeItem(this._basket + "." + prop);
    }

    clean(): void {
        const r = new RegExp("^" + this._basket + "\\.");
        try {
            // determine what storage to use
            for (const i in window.localStorage) {
                if (r.test(i)) {
                    this.localStorage.removeItem(i);
                }
            }
        } catch (e) {
            this.localStorage.clean();
        }
    }
}
