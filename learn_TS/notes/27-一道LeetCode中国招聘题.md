## 一道LeetCode中国招聘题

题目见`src/InterviewPractice.md`

[题目地址](https://github.com/LeetCode-OpenSource/hire/blob/master/typescript_zh.md)

要求就是完成`type Connect`的声明，将返回类型由宽泛的any改为更精准的类型结构。



这是一个类Redux数据流解决方案的TypeScript版本。但本题的重点不在于数据流框架如何设计，而是如何设计类型。让框架的使用者可以非常友好地获得类型提示与完整的类型定义。



输入类型EffectModule，输出的返回类型是Connected，Connected中的函数类型可以由EffectModule中的函数类型转换来得到，即由EffectModule进过一系列操作得到Connect定义中的返回值类型（即Connected）。最终考察的是定义一个工具类型。



1. 首先我们可以观察到，Connect返回值的类型是一个对象

2. 返回值中的属性名包含EffectModule中所有函数类型的属性名，

   ```typescript
   // 可以先设计一个工具类型把EffectModule中的方法名都取出来
   type methodsPick<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]
   
   // 或者把EffectModule中类型为函数的部分筛选出来（自己写的）
   type PickFunction<T> = Pick<T, {
       [K in keyof T]: T[K] extends Function ? K : never
   }[keyof T]>;
   ```

   使用`in`关键字进行遍历，配合条件类型进行筛选，通过`[keyof T]`将never类型过滤掉，留下函数类型

3. 对函数类型进行转换，此时也需要`in`关键字来遍历，配合条件类型进行转换

   `asyncMethod<T, U>(input: Promise<T>): Promise<Action<U>>`转换为

   `asyncMethod<T, U>(input: T): Action<U>`

   ```typescript
   // 此时可以先把转换前后的函数类型定义出来
   type asyncMethod<T, U> = (input: Promise<T>) => Promise<Action<U>> // 异步方法转换前
   type asyncMethodConnect<T, U> = (input: T) => Action<U> // 转换后
   type syncMethod<T, U> = (action: Action<T>) => Action<U> // 同步方法转换前
   type syncMethodConnect<T, U> = (action: T) => Action<U> // 转换后
   ```

   然后就可以定义工具类型进行转换了：

   ```typescript
   // 配合methodsPick使用
   type EffectModuleMethods = methodsPick<EffectModule>; // "delay" | "setMessage"
   type EffectModuleMethodsConnect<T> = T extends asyncMethod<infer U, infer V>
       ? asyncMethodConnect<U, V>
       : T extends syncMethod<infer U, infer V>
           ? syncMethodConnect<U, V>
           : never
   
   // 配合PickFunction使用（自己写的）
   type TransFunction<T> = {
       [K in keyof T]: T[K] extends (input: Promise<infer U>) => Promise<Action<infer V>>// asyncMethod<infer U, infer V>
           ? (input: U) => Action<V> //asyncMethodConnect<U, V>
           : T[K] extends syncMethod<infer U, infer V>
               ? syncMethodConnect<U, V>
               : never;
   }
   ```

   几个条件判断的说明：

   1. 接收`EffectModule`的方法的类型，如果可分配给`asyncMethod<infer U, infer V>`，就把它转换为`asyncMethodConnect<U, V>`
   2. 否则继续判断，是否可分配给`syncMethod<infer U, infer V>`，如果可以，就把它转换为`syncMethodConnect<U, V>`
   3. 否则返回never

4. 到此工具类型定义完毕，最后应用到Connect的定义中

   ```typescript
   // 应用EffectModuleMethodsConnect和methodsPick
   type Connect = (module: EffectModule) => {
       [M in EffectModuleMethods]: EffectModuleMethodsConnect<EffectModule[M]>
   }
   
   // 应用TransFunction和PickFunction（自己写的）
   type Connect = (module: EffectModule) => TransFunction<PickFunction<EffectModule>>;
   ```

   说明：

   `M`是方法对应的属性名，EffectModule[M]是方法类型，`EffectModuleMethodsConnect<EffectModule[M]>`就是将方法类型转化为题目中规定的目标类型。

5. 至此Connect的定义就完成了。应用了`in`关键字遍历映射、条件类型和infer关键字的使用

6. 题目的目的就是：定义一个工具类型，输入EffectModule后会输出Connected，并将工具类型应用到Connect的定义中





