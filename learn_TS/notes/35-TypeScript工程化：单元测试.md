## TypeScript工程化：单元测试

单元测试是现代软件工程中必备的环节之一

需要单元测试来保证我们的逻辑的健壮性

### 单元测试工具的选择

在JS/TS的世界里有太多的单元测试框架可供选择了。

#### Mocha

它最大的优点是灵活，只提供给开发者一个基础测试结构。

其他功能性的功能如assertions、spies、mocks，以及和它们一样的其他功能需要引用添加其他库/插件来完成。

需要额外地引入众多辅助库和插件，无形中增加了学习成本和配置成本。

Mocha的另一大亮点是对异步的强大支持，Mocha一开始是为Node.js而生的单元测试框架，对浏览器的支持并不如其对服务器做的那么好。

如果需要一个高度定制的测试框架，Mocha是非常好的选择。

#### Jasmine

另一个比较老牌的测试框架Jasmine主打的是开箱即用，内置了一些断言库和mocks工具，并提供了全局变量非常方便我们的测试。

#### Jest

Jest是一个真正意义上开箱即用的测试框架，集成了几乎单元测试中需要的所有功能，比如断言、测试覆盖率统计、快照等一系列功能。

比较友好地支持各种环境，目前前端三大框架都采用了Jest作为测试工具，它有如下优点：

* 性能——首先Jest基于并行测试多文件，所以在大项目中的运行速度相当快（可以访问[这里](https://hackernoon.com/testing-react-components-with-jest-and-enzyme-41d592c174f)、[这里](https://blog.kentcdodds.com/migrating-to-jest-881f75366e7e?gi=9add03f62b72)、[这里](https://medium.com/@gethylgeorge/testing-a-react-redux-app-using-jest-and-enzyme-b349324803a9)和[这里](https://medium.com/aya-experience/testing-an-angularjs-app-with-jest-3029a613251)了解更多）

* UI——清晰且操作简单

* Ready-To-Go——有断言、spies、mocks，和Sinon能做的事差不多。和其他库的结合使用也很方便。

* Globals——和Jasmine一样，默认[创建全局环境](https://facebook.github.io/jest/docs/en/api.html)。这一特性会降低代码灵活性和健壮性，不过大部分情况下你都会庆幸Jest有这么一个功能：

  ```javascript
  // "describe" 已经在全局作用域中
  // 不需要再这样 "require" 模块了
  // import { describe } from 'jest'
  // import { describe } from 'jasmine'
  
  describe('calculator', function() {
    ...
  })
  ```

  非常方便测试者调用。

* 快照测试——Jest快照功能由FB开发和维护，它还可以平移到别的框架上作为插件使用。

* 更强大的模块级mocking功能——Jest允许开发者用非常简单的方法mock很重的库，达到提高测试效率的目的。比如可以模拟一个promise的resolve，而不是真的进行网络请求

* 代码覆盖检查——内置了一个基于Istanbul的代码覆盖工具，功能强大且性能高

* 支持性——Jest在2016年末和2017年初发布了大版本，各方面都有了很大提升，大部分主流IDE和工具都已支持

* 开发——Jest仅仅更新被修改的文件，所以在监控模式（watch mode）下运行速度非常快

Jest正是基于Jasmine开发而来，比Jasmine更加大而全，更加开箱即用。

#### 选择

两条路，一条是灵活配置但学习成本陡峭的Mocha，另一条是大而全开箱即用却没那么灵活的Jest。

多数没有特殊要求的情况下Jest会更适合，测试框架只是一个工具，选择一个几乎不需要配置、开箱即用的框架可以大大提高生产效率。



### Jest配置

#### 安装Jest

全局安装：

```shell
npm i jest -g
```

在项目中安装：

```shell
npm i -D jest @types/jest
#
$ yarn add jest @types/jest -D
```

#### 初始化Jest

在项目的根目录下初始化jest：

```shell
$ ./node_modules/.bin/jest --init  

The following questions will help Jest to create a suitable configuration for your project

✔ Would you like to use Jest when running "test" script in "package.json"? … yes
✔ Would you like to use Typescript for the configuration file? … yes
✔ Choose the test environment that will be used for testing › node
✔ Do you want Jest to add coverage reports? … yes
✔ Which provider should be used to instrument code for coverage? › v8
✔ Automatically clear mock calls, instances, contexts and results before every test? … yes

✏️  Modified /Users/ying.ye/CodeProjects/learnFE/learn_TS/eslint-study/package.json

📝  Configuration file created at /Users/ying.ye/CodeProjects/learnFE/learn_TS/eslint-study/jest.config.ts
```

`Choose the test environment that will be used for testing` 需要选择测试执行环境，有浏览器和node两个选项，选择简单的node环境

`Do you want Jest to add coverage reports?` 是否需要测试覆盖率报告，通常情况下这个报告很重要，是我们整体测试情况的一个报告

`Automatically clear mock calls, instances, contexts and results before every test?` 是否在测试结束后帮我们自动清除一些模拟的实例等等，选择yes，避免这些东西影响我们的下次测试

#### 配置项

此时根目录下生成了一个叫`jest.config.js`的配置文件，可以看到里面有非常多的配置项。

比如`clearMocks: true,`用于清除模拟残留的配置，`coverageDirectory: "coverage",`就是测试覆盖率报告的配置，`testEnvironment: 'jest-environment-node',`是之前选择的测试环境

以上只是基础配置，如果想要在TypeScript项目中使用，还需要进一步的配置，需要在配置中加入以下选项：

```json
{
  moduleFileExtensions: [
      'ts',
      'tsx',
      'js',
      'jsx',
      'json',
      'node'
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[tj]s?(x)"
  ],
}
```

* moduleFileExtensions: 模块文件扩展名。当引入一个模块并没有指定扩展名时，它会依次尝试去添加这些扩展名去拟引入模块文件
* transform：一种转换器配置。由于Jest默认的转换器不支持TypeScript，因此需要ts-jest工具把`.ts`和`.tsx`文件内容转换成js。现在基本上都是用ts去编写测试代码，所以要配置转换器
* testMatch：设置识别哪些文件是测试文件（glob形式）

以上就是需要配置的选项，需要安装`ts-jest`依赖。官网的[配置Jest](https://doc.ebichu.cc/jest/docs/zh-Hans/configuration.html)



### Jest的使用

更多资料参考[Jest官网](https://doc.ebichu.cc/jest/docs/zh-Hans/getting-started.html#content)

#### 匹配器的使用

新建一个目录`src/`并在此目录下新建一个文件`add.ts`，编写内容如下：

```typescript
// src/add.ts
export function add(item: number, ...rest: number[]): number {
    return rest.reduce((a: number, b: number) => a + b, item);
}
```

实现一个非常简单的累加函数，然后开始进行测试。

先创建一个文件`add.test.ts`，使用一个最简单的匹配器：

```typescript
// src/add.test.ts
import {add} from "./add";

test('two plus two is four', () => {
    expect(add(2, 2)).toBe(4);
})
```

在此段代码中，`expect(add(2, 2))`返回一个”期待“的对象，`.toBe(4)`则是匹配器，我们期望这个函数运行的结果是`4`，如果匹配失败，Jest运行时，它会跟踪所有失败的匹配器，以便它可以为你打印出很好的错误消息。

如果想测试相反的匹配，可以如下：

```typescript
test('two plus two is not six', () => {
    expect(add(2, 2)).not.toBe(6);
})
```

此时运行一下`yarn test`，结果如下：

```
$ yarn test
yarn run v1.22.10
$ jest
 PASS  src/add.test.ts
  ✓ two plus two is four (2 ms)
  ✓ two plus two is not six

----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |     100 |      100 |     100 |     100 |                   
 add.ts   |     100 |      100 |     100 |     100 |                   
----------|---------|----------|---------|---------|-------------------
Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        1.53 s
Ran all test suites.
✨  Done in 4.04s.
```

新建的项目忘记添加tsconfig.json文件，导致一直报错`Cannot find name 'test'. Do you need to install type definitions for a test runner?`，找到[一篇文章](https://blog.csdn.net/weixin_41894089/article/details/127013405)说需要配置tsconfig.json文件，才发现这个文件都没创建😅

编写代码的过程中TypeScript的提示会显示非常多的匹配器，这也是TypeScript的优势之一，如此繁多的API，优秀的代码提示会帮助我们快速使用，而不必一个个查阅官方的文档。

匹配完简单的数字，可以尝试匹配对象了。

新建一个文件`src/person.ts`，内容如下：

```typescript
// src/person.ts
export class Person {
    public name: string;
    public age: number;
    constructor(name: string, age: number) {
        this.age = age;
        this.name = name;
    }

    public say(message: string) {
        return message;
    }
}
```

同样新建一个测试文件`person.test.ts`：

```typescript
// src/person.test.ts
import {Person} from "./person";

test('test person', () => {
    const person = new Person('hanmeimei', 12);

    expect(person).toBeInstanceOf(Person);
    expect(person).not.toEqual({
        name: 'cxk'
    });
})
```

`toBeInstanceOf`用于匹配实例`person`是否是由`Person`构造的，`toEqual`是比较两个对象是否相同。

测试结果：

```
$ yarn test
yarn run v1.22.10
$ jest
 PASS  src/add.test.ts
 PASS  src/person.test.ts
-----------|---------|----------|---------|---------|-------------------
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------|---------|----------|---------|---------|-------------------
All files  |   86.66 |      100 |   66.66 |   86.66 |                   
 add.ts    |     100 |      100 |     100 |     100 |                   
 person.ts |   83.33 |      100 |      50 |   83.33 | 10-11             
-----------|---------|----------|---------|---------|-------------------

Test Suites: 2 passed, 2 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        3.024 s
Ran all test suites.
✨  Done in 5.65s.
```

#### 异步测试

新建一个文件`src/getTopics.ts`，代码如下：声明一个函数，用于获取cnode论坛的首页主题帖

```typescript
// src/getTopics.ts
import axios from 'axios';

const url = 'https://cnodejs.org/api/v1/topics';

export async function getTopics() {
    const res = await axios.get(url);
    return res;
}
```

再新建一个测试文件`src/getTopics.test.ts`，若要编写async测试，只要在函数前面使用async关键字传递到test：

```typescript
// src/getTopics.test.ts
import {getTopics} from "./getTopics";

test('should', async () => {
    const { data } = await getTopics();

    expect(data).not.toBeUndefined();
    expect(data.success).toBeTruthy();
})
```

异步测试在node服务端的测试场景中非常常用。

测试结果：

```
$ yarn test     
yarn run v1.22.10
$ jest

 RUNS  src/getTopics.test.ts
 PASS  src/person.test.ts

 RUNS  src/getTopics.test.ts

 RUNS  src/getTopics.test.ts
 PASS  src/add.test.ts

 RUNS  src/getTopics.test.ts
 PASS  src/getTopics.test.ts
--------------|---------|----------|---------|---------|-------------------
File          | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------|---------|----------|---------|---------|-------------------
All files     |    91.3 |      100 |      75 |    91.3 |                   
 add.ts       |     100 |      100 |     100 |     100 |                   
 getTopics.ts |     100 |      100 |     100 |     100 |                   
 person.ts    |   83.33 |      100 |      50 |   83.33 | 10-11             
--------------|---------|----------|---------|---------|-------------------

Test Suites: 3 passed, 3 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        3.527 s
Ran all test suites.
✨  Done in 6.13s.
```

#### 模拟函数

再新建一个文件`src/myForEach.ts`，创建一个遍历函数

```typescript
// src/myForEach.ts
export function myForEach(items: Array<number>, callback: (a: number) => void) {
    for (let i = 0; i < items.length; i ++) {
        callback(items[i])
    }
}
```

为了测试此函数，可以使用一个模拟函数，然后检查模拟函数的状态来确保回调函数如期调用。

在`src/myForEach.test.ts`中，可以用`jest.fn()`模拟函数，来测试调用情况：

```typescript
// src/myForEach.test.ts
import {myForEach} from "./myForEach";

test('should call twice', () => {
    const mockCallback = jest.fn();
    myForEach([0, 1], mockCallback);
  
    // console.log(mockCallback.mock);

    // 此模拟函数被调用了两次
    expect(mockCallback.mock.calls.length).toBe(2);

    // 第一次调用函数时的第一个参数是0
    expect(mockCallback.mock.calls[0][0]).toBe(0);

    // 第二次调用函数时的第一个参数是1
    expect(mockCallback.mock.calls[1][0]).toBe(1);
})
```

上述测试的模拟函数`mockCallback`有一个`mock`属性，它保存了此函数被调用的一系列信息，可以把它打印出来：`console.log(mockCallback.mock);`

```json
{
  calls: [ [ 0 ], [ 1 ] ],
  contexts: [ undefined, undefined ],
  instances: [ undefined, undefined ],
  invocationCallOrder: [ 1, 2 ],
  results: [
    { type: 'return', value: undefined },
    { type: 'return', value: undefined }
  ],
  lastCall: [ 1 ]
}
```



### 小结

通过Jest的安装、配置、使用学习了在TypeScript下进行简单的单元测试，严格的代码检测、静态类型检查配合上充分的单元测试，这是保证项目健壮性、可维护性的根本。

参考：[展望2018年JavaScript Testing](https://zhuanlan.zhihu.com/p/32702421)