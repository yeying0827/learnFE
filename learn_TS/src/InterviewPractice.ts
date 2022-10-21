/**
 * 一道LeetCode面试题
 */
// 假设有一个叫 EffectModule 的类
// class EffectModule {}

// 这个对象上的方法只可能有两种类型签名:
// asyncMethod<T, U>(input: Promise<T>): Promise<Action<U>>; // 异步方法
// syncMethod<T, U>(action: Action<T>): Action<U>; // 同步方法

// 这个对象上还可能有一些任意的非函数属性：
interface Action<T> {
    payload?: T;
    type: string;
}
class EffectModule {
    count = 1;
    message = "hello!";
    delay(input: Promise<number>) {
        return input.then(i => ({
            payload: `hello ${i}!`,
            type: 'delay'
        }));
    }
    setMessage(action: Action<Date>) {
        return {
            payload: action.payload!.getMilliseconds(),
            type: "set-message"
        };
    }
}

/**
 * 现在有一个叫 connect 的函数：
 * 它接受 EffectModule 实例，将它变成另一个对象，
 * 这个对象上只有EffectModule 的同名方法，但是方法的类型签名被改变了
 */
// asyncMethod<T, U>(input: Promise<T>): Promise<Action<U>>  // 异步方法
//   => asyncMethod<T, U>(input: T): Action<U>
// syncMethod<T, U>(action: Action<T>): Action<U>  // 同步方法
//   => syncMethod<T, U>(action: T): Action<U>
// 参数类型的外层剥掉，返回值的Promise外层剥掉

type Connected = {
    delay(input: number): Action<string>
    setMessage(action: Date): Action<number>
}
const effectModule = new EffectModule()

/**
 * 由题目得知，有一个connect函数，接收一个EffectModule类型的参数，返回一个Connected类型的值
 */
// connect的定义
const connect: Connect = (m: EffectModule) => ({
    delay: (input: number) => ({
        type: 'delay',
        payload: `hello 2`
    }),
    setMessage: (input: Date) => ({
        type: "set-message",
        payload: input.getMilliseconds()
    })
});



// 获取对象上的所有方法
type PickFunction<T> = Pick<T, {
    [K in keyof T]: T[K] extends Function ? K : never
}[keyof T]>;
// 定义方法的类型签名
type asyncMethod<T, U> = (input: Promise<T>) => Promise<Action<U>> // 异步方法转换前
type asyncMethodConnect<T, U> = (input: T) => Action<U> // 转换后
type syncMethod<T, U> = (action: Action<T>) => Action<U> // 同步方法转换前
type syncMethodConnect<T, U> = (action: T) => Action<U> // 转换后
// 将方法签名进行转换
type TransFunction<T> = {
    [K in keyof T]: T[K] extends (input: Promise<infer U>) => Promise<Action<infer V>>// asyncMethod<infer U, infer V>
        ? (input: U) => Action<V> //asyncMethodConnect<U, V>
        : T[K] extends syncMethod<infer U, infer V>
            ? syncMethodConnect<U, V>
            : never;
}

// type Connect = (module: EffectModule) => any; 将 any 替换成题目的解答，即定义Connect的返回值类型。
// connect的声明
// 1. 将所有类型为Function的属性取出形成新类型；
// {delay(input: Promise<number>): Promise<{payload: string, type: string}>, setMessage(action: Action<Date>): {payload: number, type: string}}
type PickEffectModuleFunction = PickFunction<EffectModule>;
// 2.将所有方法的类型进行转换
type Connect = (module: EffectModule) => TransFunction<PickFunction<EffectModule>>; // 函数返回值的类型结构与Connected一致


// 1.取出所有方法对应的属性名形成联合类型；
type methodsPick<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]
type EffectModuleMethods = methodsPick<EffectModule>; // "delay" | "setMessage"
// 2.遍历联合类型，与转换后的方法类型一一对应
type EffectModuleMethodsConnect<T> = T extends asyncMethod<infer U, infer V>
    ? asyncMethodConnect<U, V>
    : T extends syncMethod<infer U, infer V>
        ? syncMethodConnect<U, V>
        : never
type Connect1 = (module: EffectModule) => {
    [M in EffectModuleMethods]: EffectModuleMethodsConnect<EffectModule[M]>
}

export const connected: Connected = connect(new EffectModule());
