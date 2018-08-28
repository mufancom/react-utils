import {
  IReactComponent,
  inject as _inject,
  observer as _observer,
} from 'mobx-react';
import {Component} from 'react';

export function inject(storeKey: string): PropertyDecorator;
export function inject(target: Component, key: string): void;
export function inject(target: Component | string, key?: string): any {
  if (typeof target === 'string') {
    let storeKey = target;
    return (prototype: Component) => decorate(prototype, storeKey);
  } else if (key) {
    return decorate(target, key);
  } else {
    throw new Error('Invalid usage');
  }

  function decorate(target: any, storeKey: string): PropertyDescriptor {
    pushInjection(target, storeKey);

    return {
      get(this: any): any {
        return this.props[storeKey];
      },
    };
  }
}

export const context = createNamedInjectDecorator('context');

export interface NamedInjectDecorator {
  (key: string): PropertyDecorator;
  (target: Component, key: string): void;
}

function createNamedInjectDecorator(storeKey: string): NamedInjectDecorator {
  return (target: Component | string, key?: string): any => {
    if (typeof target === 'string') {
      let key = target;
      return (prototype: Component) => decorate(prototype, key);
    } else if (key) {
      return decorate(target, key);
    } else {
      throw new Error('Invalid usage');
    }

    function decorate(target: any, syncableKey: string): any {
      pushInjection(target, storeKey);

      return {
        get(this: any): any {
          return this.props[storeKey][syncableKey];
        },
      };
    }
  };
}

function pushInjection(target: any, storeKey: string): void {
  if (target._injections) {
    target._injections.push(storeKey);
  } else {
    Object.defineProperty(target, '_injections', {
      value: [storeKey],
    });
  }
}

export function observer<T extends IReactComponent>(target: T): T {
  target = _observer(target) || target;

  let stores = target.prototype._injections;

  if (stores) {
    target = _inject(...stores)(target) || target;
  }

  return target;
}
