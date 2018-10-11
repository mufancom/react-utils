import {PromiseType} from 'tslang';

export function guard<TFunction extends (...args: any[]) => Promise<void>>(
  fn: TFunction,
): (...args: Parameters<TFunction>) => Promise<void>;
export function guard<TFunction extends (...args: any[]) => Promise<any>>(
  fn: TFunction,
  defaultValue: PromiseType<ReturnType<TFunction>>,
): (...args: Parameters<TFunction>) => ReturnType<TFunction>;
// Using `void | undefined` instead of `void` as a hack for `(() =>
// Promise<...>) extends (() => void)` is true.
export function guard<TFunction extends (...args: any[]) => void | undefined>(
  fn: TFunction,
): (...args: Parameters<TFunction>) => void;
export function guard<TFunction extends (...args: any[]) => any>(
  fn: TFunction,
  defaultValue: ReturnType<TFunction>,
): (...args: Parameters<TFunction>) => ReturnType<TFunction>;
export function guard(
  fn: Function,
  defaultValue?: any,
): (...args: any[]) => any {
  return (...args: any[]): any => {
    try {
      let ret = fn(...args);

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
