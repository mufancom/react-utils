export function guard(): (target: object, key: string) => any;
export function guard<T>(defaultValue: T): (target: object, key: string) => any;
export function guard(defaultValue?: any): any {
  return (
    _target: object,
    _key: string,
    descriptor: PropertyDescriptor | undefined,
  ): PropertyDescriptor => {
    let fn = descriptor && descriptor.value;

    if (fn) {
      return {
        value: wrap(fn),
      };
    }

    let cache = new WeakMap<object, Function>();

    return {
      get() {
        return cache.get(this);
      },
      set(value) {
        cache.set(this, wrap(value));
      },
    };
  };

  function wrap(fn: Function): Function {
    return function(this: any, ...args: any[]): any {
      try {
        let ret = fn.apply(this, args);

        if (ret instanceof Promise) {
          return ret.catch(error => {
            console.error(error);
            return defaultValue;
          });
        } else {
          return ret;
        }
      } catch (error) {
        console.error(error);
        return defaultValue;
      }
    };
  }
}
