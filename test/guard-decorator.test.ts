import {guard} from '../bld/library';

console.error = jest.fn();

const error = new Error();

const spy = jest.fn<any>();

class Test {
  @guard(456)
  okay(): number {
    return 123;
  }

  @guard()
  foo1(x: number): void {
    spy.call(this, x);
    throw error;
  }

  @guard()
  bar1 = (x: number, y: number): void => {
    spy(x, y);
    throw error;
  };

  @guard(-1)
  foo2(x: number): number {
    spy.call(this, x);
    throw error;
  }

  @guard(-2)
  bar2 = (x: number, y: number): number => {
    spy(x, y);
    throw error;
  };

  @guard()
  async yo1(x: number): Promise<void> {
    spy.call(this, x);
    throw error;
  }

  @guard()
  ha1 = async (x: number, y: number): Promise<void> => {
    spy(x, y);
    throw error;
  };

  @guard(-3)
  async yo2(x: number): Promise<number> {
    spy.call(this, x);
    throw error;
  }

  @guard(-4)
  ha2 = async (x: number, y: number): Promise<number> => {
    spy(x, y);
    throw error;
  };
}

let instance = new Test();

test('should guard pass through', () => {
  expect(instance.okay()).toBe(123);
});

test('should guard synchronous method', () => {
  // tslint:disable-next-line:no-void-expression
  expect(instance.foo1(123)).toBeUndefined();
  expect(spy).toHaveBeenCalledWith(123);
  expect(spy.mock.instances[0]).toEqual(instance);
  expect(console.error).toHaveBeenCalledWith(error);
});

test('should guard synchronous function property', () => {
  // tslint:disable-next-line:no-void-expression
  expect(instance.bar1(123, 456)).toBeUndefined();
  expect(spy).toHaveBeenCalledWith(123, 456);
  expect(console.error).toHaveBeenCalledWith(error);
});

test('should guard synchronous method with default value', () => {
  // tslint:disable-next-line:no-void-expression
  expect(instance.foo2(123)).toBe(-1);
  expect(spy).toHaveBeenCalledWith(123);
  expect(spy.mock.instances[0]).toEqual(instance);
  expect(console.error).toHaveBeenCalledWith(error);
});

test('should guard synchronous function property with default value', () => {
  // tslint:disable-next-line:no-void-expression
  expect(instance.bar2(123, 456)).toBe(-2);
  expect(spy).toHaveBeenCalledWith(123, 456);
  expect(console.error).toHaveBeenCalledWith(error);
});

test('should guard asynchronous method', async () => {
  let ret = instance.yo1(123);

  expect(ret instanceof Promise);
  // tslint:disable-next-line:no-void-expression
  expect(await ret).toBeUndefined();

  expect(spy).toHaveBeenCalledWith(123);
  expect(spy.mock.instances[0]).toEqual(instance);
  expect(console.error).toHaveBeenCalledWith(error);
});

test('should guard asynchronous function property', async () => {
  let ret = instance.ha1(123, 456);

  expect(ret instanceof Promise);
  // tslint:disable-next-line:no-void-expression
  expect(await ret).toBeUndefined();

  expect(spy).toHaveBeenCalledWith(123, 456);
  expect(console.error).toHaveBeenCalledWith(error);
});

test('should guard asynchronous method', async () => {
  let ret = instance.yo2(123);

  expect(ret instanceof Promise);
  // tslint:disable-next-line:no-void-expression
  expect(await ret).toBe(-3);

  expect(spy).toHaveBeenCalledWith(123);
  expect(spy.mock.instances[0]).toEqual(instance);
  expect(console.error).toHaveBeenCalledWith(error);
});

test('should guard asynchronous function property', async () => {
  let ret = instance.ha2(123, 456);

  expect(ret instanceof Promise);
  // tslint:disable-next-line:no-void-expression
  expect(await ret).toBe(-4);

  expect(spy).toHaveBeenCalledWith(123, 456);
  expect(console.error).toHaveBeenCalledWith(error);
});
