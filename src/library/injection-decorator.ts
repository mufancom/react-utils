import hoistStatics from 'hoist-non-react-statics';
import {inject as _inject, observer as _observer} from 'mobx-react';
import {
  Component,
  ComponentType,
  Consumer,
  ReactElement,
  createElement,
  forwardRef,
} from 'react';

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

export function createNamedInjectDecorator(
  storeKey: string,
): NamedInjectDecorator {
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

export type ConsumeDecorator = (target: Component, key: string) => void;

export function consume<T>(Consumer: Consumer<T>): ConsumeDecorator {
  return (target: Component, key: string): any => {
    pushConsumer(target, key, Consumer);

    return {
      get(this: any): any {
        return this.props[key];
      },
    };
  };
}

function pushConsumer(target: any, key: string, Consumer: Consumer<any>): void {
  if (target._consumers) {
    target._consumers.set(key, Consumer);
  } else {
    Object.defineProperty(target, '_consumers', {
      value: new Map<string, Consumer<any>>([[key, Consumer]]),
    });
  }
}

export function observer<T extends ComponentType<any>>(target: T): T {
  target = _observer(target) || target;

  let injections = target.prototype._injections as string[] | undefined;

  if (injections) {
    target = _inject(...injections)(target) || target;
  }

  let consumers = target.prototype._consumers as
    | Map<string, Consumer<any>>
    | undefined;

  if (consumers) {
    let original = target;

    target = forwardRef((props, ref) => {
      let consumerProps: any = {};
      let consumerEntries = Array.from(consumers!);

      return createConsumerWrapperOrTarget();

      function createConsumerWrapperOrTarget(): ReactElement<any> {
        let consumerEntry = consumerEntries.shift();

        if (consumerEntry) {
          let [key, Consumer] = consumerEntry;

          return createElement(Consumer, undefined, (value: any) => {
            consumerProps[key] = value;

            return createConsumerWrapperOrTarget();
          });
        } else {
          return createElement(original, {...consumerProps, ...props, ref});
        }
      }
    }) as T;

    hoistStatics(target, original);
  }

  return target;
}
