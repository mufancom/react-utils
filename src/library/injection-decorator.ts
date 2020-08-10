import hoistStatics from 'hoist-non-react-statics';
import {inject as _inject, observer as _observer} from 'mobx-react';
import {
  Component,
  ComponentType,
  Consumer,
  Context,
  createElement,
  forwardRef,
  useContext,
} from 'react';

const hasOwnProperty = Object.prototype.hasOwnProperty;

export type ConsumeDecorator = (target: Component, key: string) => any;

export type ConsumeGetter<T, TProperty> = (object: T) => TProperty;

export function consume<T, TProperty = T>(
  context: Context<T> | Consumer<T>,
  getter?: ConsumeGetter<T, TProperty>,
): ConsumeDecorator {
  let Consumer = isReactContext(context) ? context.Consumer : context;

  return (target, key) => {
    pushConsumer(target, key, Consumer);

    return {
      get(this: any): any {
        let value = this.props._consumerProps[key];
        return getter ? getter(value) : value;
      },
    };
  };
}

function pushConsumer(target: any, key: string, Consumer: Consumer<any>): void {
  if (hasOwnProperty.call(target, '_consumers')) {
    target._consumers.set(key, Consumer);
  } else {
    let consumers: [string, Consumer<any>][];

    if (target._consumers) {
      consumers = [...target._consumers, [key, Consumer]];
    } else {
      consumers = [[key, Consumer]];
    }

    Object.defineProperty(target, '_consumers', {
      value: new Map<string, Consumer<any>>(consumers),
    });
  }
}

export function observer<T extends ComponentType<any>>(target: T): T {
  target = _observer(target) || target;

  if (typeof target.prototype !== 'object') {
    return target;
  }

  let consumers = target.prototype._consumers as
    | Map<string, Consumer<any>>
    | undefined;

  if (consumers) {
    let original = target;

    target = forwardRef((props, ref) => {
      let consumerProps: any = {};

      for (let [key, Consumer] of consumers!) {
        consumerProps[key] = useContext((Consumer as any)._context || Consumer);
      }

      return createElement(original, {
        ...props,
        _consumerProps: consumerProps,
        ref,
      });
    }) as any;

    hoistStatics(target, original);
  }

  return target;
}

function isReactContext<T>(
  object: Context<T> | Consumer<T>,
): object is Context<T> {
  return (
    '$$typeof' in object &&
    object.$$typeof === Symbol.for('react.context') &&
    !('_context' in object)
  );
}
