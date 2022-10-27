## TypeScript工程化：环境搭建

搭建一个在生产环境可用的TypeScript环境，以了解TypeScript的工具生态

### 生产环境要素

一个正式的TypeScript开发环境至少需要哪些要素？

* 文本编辑器/IDE：编写代码是任何开发环境的要素之一，本文以VS Code为例讲解如何配置文本编辑器
* 单元测试：长期代码是必须要经过单元测试的，本文以Jest作为单测工具
* 代码检查：以ESLint作为代码检查工具

版本管理工具、持续集成工具、代码美化工具等等，与TypeScript相关性不大。



### 配置文本编辑器

#### 安装插件TS Importer

[TS Importer](https://marketplace.visualstudio.com/items?itemName=pmneo.tsimporter)可以帮助开发者自动引入模块，节省手动引入模块的时间，最大程度规避了犯错的可能。

还可以定制引入的格式，比如是否使用分号、是否引入双引号等等

#### 安装插件Move TS

[Move TS](https://marketplace.visualstudio.com/items?itemName=stringham.move-ts)可以帮助开发者自动计算移动文件后的模块引入路径，是提升效率的利器。

#### 安装插件TypeScript Toolbox

TypeScript的一个工具箱，主要有两个作用：自动引入模块和生成`getter/setter/constructors`。



### 测试项目预备

ts-project

* `npm init -y`
* 安装typescript包
* 添加`tsconfig.json`文件



### 为TypeScript添加测试

Jest是一款由Facebook开源的大而全的测试框架，特点是开箱即用，功能强大，目前三大框架全部采用Jest测试，它有如下优点：

* 强大的TypeScript支持
* 内置的断言库
* 快照测试
* 内置的覆盖率报告
* 内置的异步支持

使用：

1. 下载npm模块

   ```shell
   yarn add jest @types/jest ts-jest -D
   ```

   jest：Jest单元测试框架

   @types/jest：Jest是由JavaScript编写的（已宣布之后用TypeScript开发），@types/jest是为jest添加类型声明的npm包

   ts-jest：本身是一个TypeScript预处理器，帮助我们可以用TypeScript编写jest相关测试代码

2. 在项目的根目录创建文件`jest.config.js`

   ```javascript
   module.exports = {
     "roots": [
       "<rootDir>/src"
     ],
     "transform": {
       "^.+\\.tsx?$": "ts-jest"
     }
   }
   ```

   roots：指定测试的根目录，通常情况下建议设置为`src/`

   tranform：这里使用`ts-jest`来测试`tsx/ts`文件

3. 修改`package.json`文件

   ```json
   {
     "scripts": {
       "test": "jest",
       "test:c": "jest --coverage",
       "test:w": "jest --watchAll --coverage"
     }
   }
   ```

   jest：运行测试，会寻找在`src/`目录下所有符合要求的文件进行测试

   jest --watchAll：以监控模式监控所有符合要求的文件

4. 测试：写一段简单的代码进行测试：

   ```typescript
   // src/foo.ts
   export const sum = (a: number) => (b: number) => a + b;
   ```

   新建一个`__test__`目录存放测试文件，编写`foo.test.ts`文件

   ```typescript
   // src/__test__/foo.test.ts
   import { sum } from '../foo';
   
   test('basic', () => {
     expect(sum(1)(2)).toBe(3);
   });
   ```

   运行test

   ```shell
   yarn test
   
   $ yarn test
   yarn run v1.22.10
   $ jest
    PASS  src/__test__/foo.test.ts
     ✓ basic (1 ms)
   
   Test Suites: 1 passed, 1 total
   Tests:       1 passed, 1 total
   Snapshots:   0 total
   Time:        2.323 s
   Ran all test suites.
   ✨  Done in 3.34s.
   ```



### 代码检查

TSLint以前是TypeScript主要的代码检测工具，但由于一些性能问题TypeScript官方支持了ESLint。

ESLint现在已经是TypeScript的Linter。

使用：

1. 下载相关模块

   ```shell
   $ yarn add eslint eslint-plugin-react @typescript-eslint/parser @typescript-eslint/eslint-plugin -D
   ```

   eslint：代码检查工具

   [eslint-plugin-react](https://github.com/yannickcr/eslint-plugin-react#list-of-supported-rules)：使得eslint支持react框架

   @typescript-eslint/parser：让eslint可以解析TypeScript

   [@typescript-eslint/eslint-plugin](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#supported-rules)：使得eslint支持TypeScript相关规则

2. 在项目的根目录下创建`.eslintrc.js`

   ```javascript
   module.exports = {
       parser: "@typescript-eslint/parser",
       settings: {
           react: {
               version: 'detect'
           }
       },
       parserOptions: {
           project: './tsconfig.json'
       },
       plugins: ['@typescript-eslint'],
       extends: [
           'plugin:react/recommended',
           'plugin:@typescript-eslint/recommended'
       ],
       rules: {
           '@typescript-eslint/explicit-function-return-type': 'off'
       }
   };
   ```

3. 修改`package.json`文件：

   ```json
   {
     "scripts": {
       "lint": "eslint \"src/**\"",
       "lint:f": "eslint \"src/**\" --fix"
     },
   }
   ```

   yarn lint：检测`src/`下的代码

   yarn lint:f：检测`src/`下的代码并自动修复



### 代码调试

VS Code调试代码

* 点击调试按钮

* 选择node环境

* 配置调试环境

  ```json
  {
    "name": "node",
    "type": "node",
    "request": "lauch",
    "program": "${workspaceRoot}/dist/foo.js", // 这个路径必须是需要调试的文件`src/foo.ts`编译后的路径，即`dist/foo.js`
    "args": [],
    "cwd": "${workspaceRoot}",
    "protocol": "inspector"
  }
  ```

* 进行调试



### 小结

[完整代码](https://github.com/xiaomuzhu/ts-start)

如果想编写一个成熟的TypeScript库，可以使用以下两个starter之一：

* [typescript-library-starter](https://github.com/alexjoverm/typescript-library-starter)
* [typescript-starter](https://github.com/bitjson/typescript-starter)

