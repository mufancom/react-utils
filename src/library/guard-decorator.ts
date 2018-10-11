import {KeyOfValueWithType} from 'tslang';

export function guard(): <TObject extends object>(
  target: TObject,
  key: KeyOfValueWithType<TObject, (...args: any[]) => void | Promise<void>>,
) => any;
export function guard<T>(
  defaultValue: T,
): <TObject extends object>(
  target: TObject,
  key: KeyOfValueWithType<TObject, (...args: any[]) => T | Promise<T>>,
) => any;
export function guard(defaultValue?: any): any {
  return (target: object, key: string): PropertyDescriptor => {
    let descriptor = Object.getOwnPropertyDescriptor(target, key);
    let fn = descriptor && descriptor.value;

    if (fn) {
      return {
        value: wrap(fn),
      };
    } else {
      return {
        get() {
          return fn;
        },
        set(value) {
          fn = wrap(value);
        },
      };
    }
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
