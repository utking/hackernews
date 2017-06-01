(function(module) {
  angular.module('HackerNews')
  .factory('StorageService', [function() {

    var _filters = [
      { title: 'All' },
      { title: 'General', value: '\\bjs\\b,(ecma|java).*script,\\bnode(\\.?js)?\\b,\\bcss\\b,\\bstyle\\b,\\blinux\\b,\\bnpm\\b,sql' },
      { title: 'JavaScript', value: '\\bjs\\b,(ecma|java).*script,\\bnode(\\.?js)?\\b,\\bnpm\\b' },
      { title: 'SQL', value: 'sql' },
      { title: 'API', value: '\\bapi\\b' },
      { title: 'Css', value: '\\bcss\\b,\\bstyle\\b' },
      { title: 'Linux', value: '\\linux\\b' },
      { title: 'Angular', value: '\\bangular' }
    ];

    /**
     * LocalStorage class allowing to store any types including
     * arrays and objects. Uses localStorage when it's possible
     * or internal storage if not
     * @param value
     * @returns {LocalStorage}
     * @constructor
     */
    var LocalStorage = function(value) {

        if (false === this instanceof LocalStorage) {
            return new LocalStorage(value);
        }

        if (!value || !value.charAt) {
            throw new Error('You should specify the basket name');
        } else {
            this.basket = value;
        }
        try {
            // try to use the built-in localStorage
            this.localStorage = window.localStorage;
        } catch (e) {
            // or use an object-based replacement
            var _store = {};

            var _getItem = function (prop, defVal) {
                if (_store[prop]) {
                    return _store[prop];
                }
                return defVal !== undefined ? defVal : null;
            };

            var _setItem = function (prop, val) {
                _store[prop] = val;
            };

            var _removeItem = function (prop) {
                _store[prop] = undefined;
            };

            var _clean = function () {
                _store = {};
            };

            this.localStorage = {
                getItem: _getItem,
                setItem: _setItem,
                removeItem: _removeItem,
                clean: _clean
            };
        }
        return this;
    };

    /**
     * Save the 'val' into the storage as a variable
     * with the 'prop' name
     * @param prop
     * @param val
     */
    LocalStorage.prototype.set = function (prop, val) {
        if (!this.basket) {
            throw new Error('You should specify the basket name first');
        }
        if (!prop || !prop.charAt) {
            throw new Error('You should specify the property name');
        }
        this.localStorage.setItem(this.basket+'.'+prop, JSON.stringify(val));
        return this;
    };

    /**
     * Get a value of the variable 'prop'. Return
     * defVal if there is no such 'prop' in the storage
     * @param prop
     * @param defVal
     * @returns {*}
     */
    LocalStorage.prototype.get = function (prop, defVal) {
        if (!this.basket) {
            throw new Error('You should specify the basket name first');
        }
        if (!prop || !prop.charAt) {
            throw new Error('You should specify the property name');
        }

        var val = this.localStorage.getItem(this.basket+'.'+prop);
        if (val === null) {
            return defVal;
        }
        try {
          return JSON.parse(val);
        } catch (e) {
          return defVal;
        }
    };

    /**
     * Remove the item with the 'prop' name
     * @param prop
     */
    LocalStorage.prototype.remove = function (prop) {
        if (!this.basket) {
            throw new Error('You should specify the basket name first');
        }
        if (!prop || !prop.charAt) {
            throw new Error('You should specify the property name');
        }
        this.localStorage.removeItem(this.basket+'.'+prop);
        return this;
    };

    /**
     * Clean all the variables whose names start with the basket name
     */
    LocalStorage.prototype.clean = function () {
        var r = new RegExp('^'+this.basket+'\\.');
        try {
            // determine what storate to use
            for (var i in window.localStorage) {
                if (r.test(i)) {
                    this.localStorage.removeItem(i);
                }
            }
        } catch (e) {
            this.localStorage.clean();
        }
        return this;
    };

    var getPrevNews = function(storage) {
      if (!storage || !storage.get) {
        return [];
      }
      var prevNews = storage.get('prevNews');
      if (!Array.isArray(prevNews)) {
        prevNews = [];
      }
      return prevNews;
    };

    var removeCachedItems = function(storage, items) {
      if (Array.isArray(items)) {
        items.forEach(function(i) {
          storate.remove(''+i);
        });
      }
    };

    var cleanCache = function(storage) {
      storage.clean();
    };

    var initFB = function() {
      try {
        FB.init({
          appId: '628486370676726',
          xfbml: true,
          version: 'v2.9'
        });
        FB.AppEvents.logPageView();
      } catch(e) {}
    };

    var fbShare = function(url) {
      try {
        FB.ui({
          method: 'share',
          href: url,
        }, function(response) {});
      } catch(e) {}
    };

    var _concatUniq = function (ar1, ar2) {
      return ar1.concat(ar2)
        .reduce(function(prev, i) {
          if (i && prev.indexOf(i) === -1) {
            prev.push(i);
          }
          return prev;
        }, []);
    };

    /**
     * Public interface
     */
    return {
      filters: _filters,
      concatUniq: _concatUniq,
      getStorage: function (basketName) {
        return new LocalStorage(basketName);
      },
      getPrevNews: getPrevNews,
      removeCachedItems: removeCachedItems,
      cleanCache: cleanCache,
      initFB: initFB,
      fbShare: fbShare
    };
  }]);
})(this);

