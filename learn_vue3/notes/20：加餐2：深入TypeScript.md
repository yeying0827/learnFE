## 加餐2：深入TypeScript

### TypeScript入门

* 基础

在JavaScript的基础上，对变量的数据类型加以限制。

在TypeScript中，当你把变量的类型标记为any后，这个变量的使用就和JavaScript没啥区别了，错误只会在浏览器里运行的时候才会提示。

通过interface接口可以定义对象的类型限制。

函数的定义、参数和返回值本质上也是变量的概念，都可以进行类型的定义。

也可以使用变量的方式去定义函数，更建议使用type或interface关键字去定义函数的类型。

如果你的函数本来就支持多个类型的参数，那么需要使用函数重载的方式，定义多个函数的输入值和返回值类型，更精确地限制函数的类型。

* 宿主环境

对于宿主环境里的类型，TypeScript全部都给我们提供了，我们可以直接在代码中书写，比如：Window是window的类型等等。[TypeScript内置类型源码](https://github.com/Microsoft/TypeScript/tree/main/src/lib)

* 第三方

很多第三方框架，比如Vue、Element3等，都提供了完美的类型可以直接使用



[练习环境：play ground](https://www.typescriptlang.org/play?#code/FAehAJC+9Q66MA3lHnrQMhGGO5QgB6F+E9gnU0AByhZBKA)

### 泛型

TypeScript可以进行类型编程，这极大提高了TypeScript在复杂场景下的应用场景。

泛型T，你可以理解这个T的意思就是给函数参数定义了一个类型变量，会在后面使用。

有了泛型后，就可以实现类似高阶函数的类型函数。

keyof可以帮助我们拆解已有类型；使用extends可以实现类型系统中的条件判断

extends相当于TypeScript世界中的条件语句，in关键字可以理解为TypeScript世界中的遍历。

关键字infer：在extends语句中，支持infer关键字，可以推断一个类型变量，高效的对类型进行模式匹配。但是，这个类型变量只能在true的分支中使用。



### 实战练习

[handbook](https://www.typescriptlang.org/docs/handbook/utility-types.html)

* 把所有的属性都变成可选项

* 一个很重要的场景：后端返回的数据类型

  需要根据开发文档去定义好每个请求的类型

  可以极大地提高我们开发的体验和效率

[type challenges](https://github.com/type-challenges/type-challenges)



### 总结

* TypeScript的基本类型、类型组合、type和interface关键字
* 浏览器的相关变量和API类型TypeScript都已经内置
* 第三方框架的类型可以直接导入使用
* TypeScript进阶中最重要的概念：泛型
* 通过keyof、in、extends、infer等关键字组合出复杂的类型函数，可以更加精确地组合现有类型。
* 定义前后端的接口类型，通过类型系统提高联调和开发的体验

由于JSX的本质就是JavaScript，所以TypeScript的诞生也给了JSX更好的类型推导，这是JSX相比于template的另外一个优势。