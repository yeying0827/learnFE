## TypeScript学习小结：基础使用

某册子买了两年多了，到最近才开始学习TypeScript，拖延症的严重症状了；不过我还是深信人做一件事是需要一个契机的。
学完之后整体感受是：TypeScript在JavaScript的基础上提供了一套类型系统，用以在编码时提供类型提示，并利用类型推断对代码进行检查以及给出错误提示，以规避一些可能潜在的执行JavaScript代码时会出现的错误；可以提升团队协作效率，节省沟通成本、代码阅读成本等等。
对tsconfig.json进行配置，我们可以自定义关闭和开启的检查项以及TS的编译配置，比如是否对空值进行检查、编译的目标JS版本、源代码支持的ES版本等等。

基础知识分为以下几块：

1. TypeScript的类型系统
2. TypeScript内置的类型
3. TypeScript类型定制
   1. 对象结构的类型：interface和class
      1. 基础使用
      2. 定义可选属性和只读属性
      3. 可索引类型
   2. 函数结构的类型
      1. 基础使用
      2. 可选参数、默认参数、剩余参数
      3. 函数重载：用于更精准的类型提示和推导
      4. 可调用类型
      5. 构造函数的注解
   4. 组合结构的类型
   5. 类型别名：type
4. 利用类型系统来缩小类型范围：类型守卫
   1. JS操作符：in、typeof、instanceof
   2. 字面量类型守卫
   3. TS关键字`is`定制类型守卫
5. TypeScript对类型的操作
   1. 类型变量（相对于值变量）
      1. 泛型
      2. 泛型约束：使用关键字`extends`
   2. 操作符
      1. 使用TS关键字`keyof`查询索引得到索引的一个联合类型
      2. 使用`[]`获取索引对应的类型
      3. 使用TS操作符`in`的映射操作
      4. 使用TS关键字`extends`的条件判断：三目运算
      5. 使用TS操作符`typeof`获取类型（结构）
      6. 使用`[keyof T]`过滤never类型的属性
      7. 使用TS关键字`infer`用于标识待推导和使用的类型（用在函数的参数类型和返回值类型）
      8. `+`和`-`操作符
   3. 工具类型：使用关键字`type`定义，使用泛型和操作符创建的类似函数功能的类型，通过泛型接收输入的类型，经过一系列操作得到并输出新的类型

### 前置准备

#### 1. 学习环境搭建

全局安装TypeScript

```shell
$ yarn global add typescript
yarn global v1.22.10
[1/4] 🔍  Resolving packages...
[2/4] 🚚  Fetching packages...
[3/4] 🔗  Linking dependencies...
[4/4] 🔨  Building fresh packages...
warning Your current version of Yarn is out of date. The latest version is "1.22.19", while you're on "1.22.10".
info To upgrade, run the following command:
$ curl --compressed -o- -L https://yarnpkg.com/install.sh | bash
success Installed "typescript@4.8.3" with binaries:
      - tsc
      - tsserver
✨  Done in 67.21s.
```

创建项目，初始化配置

```shell
## 创建项目目录
$ mkdir ts_learning && cd ts_learning 
## 创建src目录
mkdir src && touch src/index.ts
## 使用npm初始化
npm init
## 使用tsc初始化ts配置
tsc --init // npx typescript --init
```

```shell
$ tsc --init

Created a new tsconfig.json with:                                               
                                                                             TS 
  target: es2016
  module: commonjs
  strict: true
  esModuleInterop: true
  skipLibCheck: true
  forceConsistentCasingInFileNames: true


You can learn more at https://aka.ms/tsconfig
```

执行`tsc --init`后，目录下会新增一个`tsconfig.json`文件，这是TypeScript的配置文件，里面包含了官方初始化的一些配置以及注释：

```json
{
  "compilerOptions": {
    /* Visit https://aka.ms/tsconfig to read more about this file */

    /* Projects */
    // "incremental": true,                              /* Save .tsbuildinfo files to allow for incremental compilation of projects. */
    // "composite": true,                                /* Enable constraints that allow a TypeScript project to be used with project references. */
    // "tsBuildInfoFile": "./.tsbuildinfo",              /* Specify the path to .tsbuildinfo incremental compilation file. */
    // "disableSourceOfProjectReferenceRedirect": true,  /* Disable preferring source files instead of declaration files when referencing composite projects. */
    // "disableSolutionSearching": true,                 /* Opt a project out of multi-project reference checking when editing. */
    // "disableReferencedProjectLoad": true,             /* Reduce the number of projects loaded automatically by TypeScript. */

    /* Language and Environment */
    "target": "es2016",                                  /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */
    // "lib": [],                                        /* Specify a set of bundled library declaration files that describe the target runtime environment. */
    // "jsx": "preserve",                                /* Specify what JSX code is generated. */
    // "experimentalDecorators": true,                   /* Enable experimental support for TC39 stage 2 draft decorators. */
    // "emitDecoratorMetadata": true,                    /* Emit design-type metadata for decorated declarations in source files. */
    // "jsxFactory": "",                                 /* Specify the JSX factory function used when targeting React JSX emit, e.g. 'React.createElement' or 'h'. */
    // "jsxFragmentFactory": "",                         /* Specify the JSX Fragment reference used for fragments when targeting React JSX emit e.g. 'React.Fragment' or 'Fragment'. */
    // "jsxImportSource": "",                            /* Specify module specifier used to import the JSX factory functions when using 'jsx: react-jsx*'. */
    // "reactNamespace": "",                             /* Specify the object invoked for 'createElement'. This only applies when targeting 'react' JSX emit. */
    // "noLib": true,                                    /* Disable including any library files, including the default lib.d.ts. */
    // "useDefineForClassFields": true,                  /* Emit ECMAScript-standard-compliant class fields. */
    // "moduleDetection": "auto",                        /* Control what method is used to detect module-format JS files. */

    /* Modules */
    "module": "commonjs",                                /* Specify what module code is generated. */
    // "rootDir": "./",                                  /* Specify the root folder within your source files. */
    // "moduleResolution": "node",                       /* Specify how TypeScript looks up a file from a given module specifier. */
    // "baseUrl": "./",                                  /* Specify the base directory to resolve non-relative module names. */
    // "paths": {},                                      /* Specify a set of entries that re-map imports to additional lookup locations. */
    // "rootDirs": [],                                   /* Allow multiple folders to be treated as one when resolving modules. */
    // "typeRoots": [],                                  /* Specify multiple folders that act like './node_modules/@types'. */
    // "types": [],                                      /* Specify type package names to be included without being referenced in a source file. */
    // "allowUmdGlobalAccess": true,                     /* Allow accessing UMD globals from modules. */
    // "moduleSuffixes": [],                             /* List of file name suffixes to search when resolving a module. */
    // "resolveJsonModule": true,                        /* Enable importing .json files. */
    // "noResolve": true,                                /* Disallow 'import's, 'require's or '<reference>'s from expanding the number of files TypeScript should add to a project. */

    /* JavaScript Support */
    // "allowJs": true,                                  /* Allow JavaScript files to be a part of your program. Use the 'checkJS' option to get errors from these files. */
    // "checkJs": true,                                  /* Enable error reporting in type-checked JavaScript files. */
    // "maxNodeModuleJsDepth": 1,                        /* Specify the maximum folder depth used for checking JavaScript files from 'node_modules'. Only applicable with 'allowJs'. */

    /* Emit */
    // "declaration": true,                              /* Generate .d.ts files from TypeScript and JavaScript files in your project. */
    // "declarationMap": true,                           /* Create sourcemaps for d.ts files. */
    // "emitDeclarationOnly": true,                      /* Only output d.ts files and not JavaScript files. */
    // "sourceMap": true,                                /* Create source map files for emitted JavaScript files. */
    // "outFile": "./",                                  /* Specify a file that bundles all outputs into one JavaScript file. If 'declaration' is true, also designates a file that bundles all .d.ts output. */
    // "outDir": "./",                                   /* Specify an output folder for all emitted files. */
    // "removeComments": true,                           /* Disable emitting comments. */
    // "noEmit": true,                                   /* Disable emitting files from a compilation. */
    // "importHelpers": true,                            /* Allow importing helper functions from tslib once per project, instead of including them per-file. */
    // "importsNotUsedAsValues": "remove",               /* Specify emit/checking behavior for imports that are only used for types. */
    // "downlevelIteration": true,                       /* Emit more compliant, but verbose and less performant JavaScript for iteration. */
    // "sourceRoot": "",                                 /* Specify the root path for debuggers to find the reference source code. */
    // "mapRoot": "",                                    /* Specify the location where debugger should locate map files instead of generated locations. */
    // "inlineSourceMap": true,                          /* Include sourcemap files inside the emitted JavaScript. */
    // "inlineSources": true,                            /* Include source code in the sourcemaps inside the emitted JavaScript. */
    // "emitBOM": true,                                  /* Emit a UTF-8 Byte Order Mark (BOM) in the beginning of output files. */
    // "newLine": "crlf",                                /* Set the newline character for emitting files. */
    // "stripInternal": true,                            /* Disable emitting declarations that have '@internal' in their JSDoc comments. */
    // "noEmitHelpers": true,                            /* Disable generating custom helper functions like '__extends' in compiled output. */
    // "noEmitOnError": true,                            /* Disable emitting files if any type checking errors are reported. */
    // "preserveConstEnums": true,                       /* Disable erasing 'const enum' declarations in generated code. */
    // "declarationDir": "./",                           /* Specify the output directory for generated declaration files. */
    // "preserveValueImports": true,                     /* Preserve unused imported values in the JavaScript output that would otherwise be removed. */

    /* Interop Constraints */
    // "isolatedModules": true,                          /* Ensure that each file can be safely transpiled without relying on other imports. */
    // "allowSyntheticDefaultImports": true,             /* Allow 'import x from y' when a module doesn't have a default export. */
    "esModuleInterop": true,                             /* Emit additional JavaScript to ease support for importing CommonJS modules. This enables 'allowSyntheticDefaultImports' for type compatibility. */
    // "preserveSymlinks": true,                         /* Disable resolving symlinks to their realpath. This correlates to the same flag in node. */
    "forceConsistentCasingInFileNames": true,            /* Ensure that casing is correct in imports. */

    /* Type Checking */
    "strict": true,                                      /* Enable all strict type-checking options. */
    // "noImplicitAny": true,                            /* Enable error reporting for expressions and declarations with an implied 'any' type. */
    // "strictNullChecks": true,                         /* When type checking, take into account 'null' and 'undefined'. */
    // "strictFunctionTypes": true,                      /* When assigning functions, check to ensure parameters and the return values are subtype-compatible. */
    // "strictBindCallApply": true,                      /* Check that the arguments for 'bind', 'call', and 'apply' methods match the original function. */
    // "strictPropertyInitialization": true,             /* Check for class properties that are declared but not set in the constructor. */
    // "noImplicitThis": true,                           /* Enable error reporting when 'this' is given the type 'any'. */
    // "useUnknownInCatchVariables": true,               /* Default catch clause variables as 'unknown' instead of 'any'. */
    // "alwaysStrict": true,                             /* Ensure 'use strict' is always emitted. */
    // "noUnusedLocals": true,                           /* Enable error reporting when local variables aren't read. */
    // "noUnusedParameters": true,                       /* Raise an error when a function parameter isn't read. */
    // "exactOptionalPropertyTypes": true,               /* Interpret optional property types as written, rather than adding 'undefined'. */
    // "noImplicitReturns": true,                        /* Enable error reporting for codepaths that do not explicitly return in a function. */
    // "noFallthroughCasesInSwitch": true,               /* Enable error reporting for fallthrough cases in switch statements. */
    // "noUncheckedIndexedAccess": true,                 /* Add 'undefined' to a type when accessed using an index. */
    // "noImplicitOverride": true,                       /* Ensure overriding members in derived classes are marked with an override modifier. */
    // "noPropertyAccessFromIndexSignature": true,       /* Enforces using indexed accessors for keys declared using an indexed type. */
    // "allowUnusedLabels": true,                        /* Disable error reporting for unused labels. */
    // "allowUnreachableCode": true,                     /* Disable error reporting for unreachable code. */

    /* Completeness */
    // "skipDefaultLibCheck": true,                      /* Skip type checking .d.ts files that are included with TypeScript. */
    "skipLibCheck": true                                 /* Skip type checking all .d.ts files. */
  }
}
```

做一些自定义的配置：

```json
{
  "compilerOptions": {
    /* Visit https://aka.ms/tsconfig to read more about this file */

    /* Projects */

    /* Language and Environment */
    "target": "es2016",                                  /* 指定 ECMAScript 目标版本。 */
    "lib": ["es6", "dom"],                               /* 指定一组打包的库声明文件，描述目标运行时环境。 */
    "experimentalDecorators": true,                      /* 启用对TC39第2阶段草案装饰器的实验性支持。 */

    /* Modules */
    "module": "commonjs",                                /* 指定生成哪类模块代码。 */
    "rootDir": "./src",                                  /* 指定源文件的根目录。 */
    "moduleResolution": "node",                          /* 指定TypeScript如何从一个给定的模块标识符中查找一个文件（解析策略）。 */
    "typeRoots": ["node_modules/@types"],                /* 指定多个文件夹，这些文件夹的作用类似于 './node_modules/@types'. */

    /* JavaScript Support */

    /* Emit */
    "declaration": true,                                 /* 从项目中的TypeScript和JavaScript文件生成.d.ts文件. */
    "sourceMap": true,                                   /* 为生成的JavaScript文件创建source map文件. */
    "outDir": "./dist",                                  /* 为所有生成的文件指定一个输出文件夹. */
    "removeComments": true,                              /* 生成的文件中删除注释. */

    /* Interop Constraints */
    "allowSyntheticDefaultImports": true,                /* 当一个模块没有默认导出时，允许使用 "import x from y"。 */
    "esModuleInterop": true,                             /* Emit additional JavaScript to ease support for importing CommonJS modules. This enables 'allowSyntheticDefaultImports' for type compatibility. */
    "forceConsistentCasingInFileNames": true,            /* Ensure that casing is correct in imports. */

    /* Type Checking */
    "strict": true,                                      /* 启用所有严格的类型检查选项。 */
    "noImplicitAny": true,                               /* 对具有隐含 "any"类型的表达式和声明启用错误报告。 */
     "alwaysStrict": true,                               /* 确保 "use strict "总是被加到生成的代码中。 */
    "noImplicitReturns": true,                           /* 启用对函数中没有明确返回的代码路径的错误报告。 */

    /* Completeness */
    "skipLibCheck": true                                 /* Skip type checking all .d.ts files. */
  },
  "include": [                                           // 需要编译的ts文件一个*表示文件匹配**表示忽略文件的深度问题
    "./src/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts"
  ]
}
```

然后在`package.json`中加入script命令：

```json
{
  "name": "learn_ts",
  "version": "1.0.0",
  "description": "",
  "main": "src/index.ts",
  "scripts": {
    "build": "tsc", // 编译
    "build:w": "tsc -w", // 监听文件，有变动就编译
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC"
}
```

当我们编写代码后，就可以通过`yarn build`命令进行编译，得到编译后的JavaScript代码。

```shell
yarn build
```

#### 2. 感性认识

假设我们使用JavaScript定义一个变量a：

```javascript
const a = 1;
```

如果改为使用TypeScript来编写，可以有以下两种方式：

```typescript
// 1.和JavaScript一样定义
const a = 1;

// 2.定义变量时显式地指定类型，变量中存储的是什么类型的值
const a: number = 1;
```

乍一看，似乎TS使用显式的方式指定类型的写法繁琐了一些，但是当我们用到复杂的类型，比如引用类型，好处就十分明显，首先在声明和赋值变量时，会提示我们类型内部是什么结构、内部的数据是什么类型，规避一些低级错误，在赋值有问题时会给出更准确的错误提示，这在开发大型项目和多人协作时十分有用；其次在使用变量时，也可以给出更多更精准的提示，比如一个对象可以包含哪些属性，属性的类型，避免一些错误的操作。



### 1. TypeScript的类型系统

TypeScript的类型，与其他语言的类型不同，指的是符合某种结构的数据分类，检查的是各种约束条件。

假设我定义了一个接口A和一个类B，结构如下：

```typescript
interface A {
  name: string,
  age: number
}

class B {
  name: string
  age: number
  
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}
```

此时再定义几个变量：

```typescript
const a: A = {
	name: 'lilei',
	age: 18
};
const b: A = new B('hanmeimei', 18);
const c: B = new B('lily', 18);
```

可以看到：

将变量a的类型指定为接口A，我们在定义时，TS会提示它的内部需要定义哪些属性；假如它的结构不符合接口A的定义，就会给出错误提示。

将变量b的类型指定为接口A，b的值指向一个B的实例化对象，因为实例化对象的结构和接口A是一致的，所以也可以通过编译。



### 2. TypeScript内置的类型

#### 原始类型

* 布尔类型：boolean

  ```typescript
  const isLoading: boolean = false;
  ```

* 数字类型：number

  TypeScript中的二进制、十进制、十六进制等数字都可以用`number`类型表示。

  ```typescript
  const decLiteral: number = 6; // 十进制
  const hexLiteral: number = 0xf00d; // 十六进制
  const binaryLiteral: number = 0b1010; // 二进制
  const octalLiteral: number = 0o744; // 八进制
  ```

* 字符串类型：string

  ```typescript
  const book: string = 'Hello, TypeScript';
  ```

* 空值：void

  表示没有任何类型。

  当一个函数没有返回值时，通常会见到其返回值类型是void：

  ```typescript
  function warnUser() {
    alert("This is a warning message.");
  } // ts推导出的类型：function warnUser(): void
  ```

  实际上只有`null`和`undefined`可以赋值给`void`(与strictNullChecks设置有关)：

  ```typescript
  const aVoid: void = undefined;
  ```

* null和undefined

  在TypeScript中，undefined和null两者各自有自己的类型分别是undefined和null，和void相似，它们本身的类型用处不是很大：

  ```typescript
  let x: undefined = undefined;
  let y: null = null;
  
  // strictNullChecks: true
  const u2v: void = undefined; // ok
  const n2v: void = null; // TS2322: Type 'null' is not assignable to type 'void'.
  let n2u: undefined = null; // TS2322: Type 'null' is not assignable to type 'undefined'.
  let u2n: null = undefined; // TS2322: Type 'undefined' is not assignable to type 'null'.
  let n2num: number = null; // TS2322: Type 'null' is not assignable to type 'number'.
  let u2num: number = undefined; // TS2322: Type 'undefined' is not assignable to type 'number'.
  
  // strictNullChecks: false
  const u2v: void = undefined; // ok
  const n2v: void = null; // ok
  let n2u: undefined = null; // ok
  let u2n: null = undefined; // ok
  let n2num: number = null; // ok
  let u2num: number = undefined; // ok
  ```

  默认情况下，null和undefined是所有类型的子类型，就是说你可以把null和undefined赋值给number类型的变量。

  但在正式项目中一般都开启`strictNullChecks`检测，即null和undefined只能赋值给any和各自的类型（undefined还能赋值给void），可以规避非常多的问题。

* symbol

  **注：使用`symbol`时，必须添加`es6`的编译辅助库：**

  ```json
  // tsconfig.json
  {
    "lib": ["es6", ...]
  }
  ```

  Symbol是在ES2015之后成为新的原始类型，它通过`Symbol`函数创建：

  ```typescript
  const sym1 = Symbol('key1');
  const sym2 = Symbol('key2'); // 编译出的.d.ts => declare const sym2: unique symbol;
  ```

  Symbol的值是唯一不变的。

  ```typescript
  Symbol('key1') === Symbol('key1') // false
  ```

* 大整数类型：bigint

  `BigInt`类型在TypeScript3.2版本被内置，使用`BigInt`可以安全地存储和操作大整数，即使这个数已经超出了JavaScript中`Number`所能表示的安全整数范围。

  **注：使用`BigInt`时，必须添加`ESNext`的编译辅助库**：

  ```json
  // tsconfig.json
  {
    "lib": ["ESNext", ...]
  }
  ```

  在JavaScript中采用双精度浮点数，这导致精度有限，比如`Number.MAX_SAFE_INTEGER`表示可以安全递增的最大可能整数，即`2*53-1`。

  ```javascript
  const max = Number.MAX_SAFE_INTEGER;
  
  const max1 = max + 1;
  const max2 = max + 2;
  
  max1 === max2; // true
  ```

  出现上述结果的原因就是超过了精度范围。BigInt就可以解决此类问题：

  ```typescript
  // 此处是JavaScript代码，不是TypeScript
  const max = BigInt(Number.MAX_SAFE_INTEGER);
  
  const max1 = max + 1n;
  const max2 = max + 2n; // TS2737: BigInt literals are not available when targeting lower than ES2020. 需要将tsconfig.json中的target改为ES2020才支持此种写法
  
  max1 === max2; // false
  ```

  注：我们需要用`BigInt(number)`把Number转化为BigInt，同时如果类型是`BigInt`的字面量，数字后面需要加`n`。

  在TypeScript中，`number`类型虽然和`BigInt`都用于表示数字，但实际上两者类型是不同的：

  ```typescript
  declare let foo: number;
  declare let bar: bigint;
  
  foo = bar; // TS2322: Type 'bigint' is not assignable to type 'number'.
  bar = foo; // TS2322: Type 'number' is not assignable to type 'bigint'.
  ```


#### 顶级类型

也称为通用类型，所有类型都是它的子类型

* any
* unknown

**any**

为那些在编程阶段还不清楚类型的变量指定一个类型，这些值可能来自于动态的内容，比如来自用户输入或第三方代码库。

这些情况下，我们不希望类型检查器对这些值进行检查而是直接让它们通过编译阶段的检查。此时可以使用any类型来标记这些变量：

```typescript
let notSure: any = 4;
notSure = 'maybe a string instead';
```

注意：`any`类型是多人协作项目的大忌，很可能把TypeScript变成AnyScript，除非不得已，不应首先考虑使用此类型。

**unknown**

`unknown`是TypeScript3.0引入的新类型，是`any`类型对应的安全类型。

他们的共同点是，可以被赋值任何类型的值。

```typescript
// any
let notSure: any = 4;
notSure = 'maybe a string instead';
notSure = Symbol('anytype');
notSure = {};
notSure = [];
notSure = true;
// unknown
let notKnown: unknown = 4;
notKnown = 'maybe a string instead';
notKnown = Symbol('anytype');
notKnown = {};
notKnown = [];
notKnown = true;
```

两者的主要区别是，`unknown`类型会更加严格：在对`unknown`类型的值执行大多数操作之前，必须进行某种形式的检查，而对`any`类型的值执行操作前，不必做任何检查。

```typescript
// any
let anyValue: any;
anyValue.foo.bar;
anyValue();
new anyValue();
anyValue[0][1];
// unknown
let unknownValue: unknown;
// unknownValue.foo.bar; // TS2571: Object is of type 'unknown'.
// unknownValue(); // TS2571: Object is of type 'unknown'.
// new unknownValue(); // TS2571: Object is of type 'unknown'.
// unknownValue[0][1]; // TS2571: Object is of type 'unknown'.
```

可以看到，`unknown`类型被确定是某个类型之前，它不能被进行任何操作比如实例化、getter、函数调用等等，而`any`是可以的。这也是`unknown`比`any`更安全的原因。

`any`由于过于灵活，导致与JavaScript没有太多区别，很容易产生低级错误，很多场景下可以选择`unknown`作为更好的替代品。

什么情况下可以对`unknown`执行操作呢？那就是缩小其类型范围之后，比如：

```typescript
function getValue(value: unknown): string {
    if (value instanceof Date) { // 把value的类型范围缩小至Date实例，所以可以调用Date的实例方法
        return value.toISOString();
    }

    return String(value);
}
```

#### [底部类型](https://en.wikipedia.org/wiki/Bottom_type)

* never

`never`类型表示的是那些永不存在的值的类型，是任何类型的子类型，可以赋值给任何类型（？）；但是，没有类型可以赋值给never类型（除了never类型本身之外）。

```typescript
const never1: never = testNever();
const num2: number = never1;

function testNever(): never {
	throw 'error';
}

let neverValue: never = 1; // TS2322: Type 'number' is not assignable to type 'never'.
let anyValue: any = 1;
neverValue = anyValue; // TS2322: Type 'any' is not assignable to type 'never'.

let neverArray: never[] = [];
```

never类型常见的两种使用场景：

```typescript
// 1.抛出异常的函数永远不会有返回值
function error(message: string): never {
    throw new Error(message);
}
let n3: number = error('123'); // ok
// 2.空数组，而且永远是空的
const empty: never[] = [];
// empty.push(1); // TS2345: Argument of type 'number' is not assignable to parameter of type 'never'.
```

#### 数组、元组等

**数组**

数组有两种定义方式：

```typescript
// 1. 使用泛型
const list: Array<number> = [1, 2, 3];
// 2. 在类型后面加上`[]`
const table: number[] = [1, 2, 3];
// list.push('123'); // TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
```

**元组**

元组与数组类似，表示一个已知长度和元素类型的数组，各元素的类型不必相同。

元组数据如果与声明的元素类型不一致、或者长度不一致，就会报错，必须严格跟事先声明的类型和顺序保持一致。

```typescript
let tt: [string, number];
// tt = ['hello', 10, false]; // TS2322: Type '[string, number, boolean]' is not assignable to type '[string, number]'. Source has 3 element(s) but target allows only 2.
// tt = [10, 'hello']; // TS2322: Type 'number' is not assignable to type 'string'. Type 'string' is not assignable to type 'number'.
// tt = ['hello']; // TS2322: Type '[string]' is not assignable to type '[string, number]'. Source has 1 element(s) but target requires 2.
```

可以把元组看成严格版的数组，如`[string, number]`可以看成是：

```typescript
interface Tuple extends Array<string | number> {
  0: string;
  1: number;
  length: 2;
}
```

元组继承于数组，但比数组拥有更严格的类型检查。

此外，还存在一个元组越界问题，如TypeScript允许向元组中使用push方法插入新元素，但访问越界的元素时会报错：

```typescript
tt = ['hello', 10];
tt.push(2);
console.log(tt);
// console.log(tt[2]); // TS2493: Tuple type '[string, number]' of length '2' has no element at index '2'.
```

#### 非原始类型 oject

* object

object表示非原始类型，也就是除number、string、boolean、symbol、null和undefined之外的类型。

```typescript
enum Direction {
    Center = 1
}
let oo: object;

oo = Direction;
oo = [1];
oo = tt;
oo = {};
```

可以看到，普通对象、枚举、数组、元组都是`object`类型。

#### 枚举类型

假设变量的类型只会是某几个常量之一，此时就可以使用枚举类型。枚举成员的值可以是数字或字符串。

```typescript
enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT
}
// 以上定义相当于
enum Direction {
  UP = 0,
  DOWN = 1,
  LEFT = 2,
  RIGHT = 3
}
```

因为枚举成员对应的值默认是数字类型，而且默认从0开始依次累加。

```javascript
// 编译后的JavaScript
var Directions;
(function (Directions) {
    Directions[Directions["Up"] = 0] = "Up";
    Directions[Directions["Down"] = 1] = "Down";
    Directions[Directions["Left"] = 2] = "Left";
    Directions[Directions["Right"] = 3] = "Right";
})(Directions || (Directions = {}));
```

当我们把某个成员赋值数字后，后面也会根据前一个成员的值进行累加。

```typescript
enum Directions {
    Up = 10,
    Down = 10,
    Left,
    Right
}

console.log(Directions.Up, Directions.Down, Directions.Left, Directions.Right); // 10 10 11 12
```

枚举类型成员的值也可以是字符串类型。

```typescript
enum Directionss {
    Up = 'UP',
    Down = 'DOWN',
    Left = 'LEFT',
    Right = 'RIGHT'
}

console.log(Directionss.Up, Directionss['Right']); // UP RIGHT

// 非数字类型的枚举成员，必须给成员赋初始值
enum Directionss {
    Up = 'UP',
    Down = 'DOWN',
    Left = 'LEFT',
    Right // TS1061: Enum member must have initializer.
}
```

根据上面编译后的JavaScript的代码，可以看出，我们可以通过枚举值获取枚举成员的名字，即反向映射。

```typescript
enum Directions {
    Up = 10,
    Down = 10,
    Left,
    Right
}

console.log(Directions[10]); // Down
```

可以看出枚举类型本质上是一个JavaScript对象，而由于其特殊的构造，导致其拥有正反双向同时映射的特性。

并且我们即使分开声明枚举类型，也会自动合并到一个对象上，比如：

```typescript
enum Directions {
    Up = 10,
    Down = 10,
    Left,
    Right
}
enum Directions {
    Center
}
// 编译后的JavaScript代码
var Directions;
(function (Directions) {
    Directions[Directions["Up"] = 10] = "Up";
    Directions[Directions["Down"] = 10] = "Down";
    Directions[Directions["Left"] = 11] = "Left";
    Directions[Directions["Right"] = 12] = "Right";
})(Directions || (Directions = {}));
(function (Directions) {
    Directions[Directions["Center"] = 0] = "Center";
})(Directions || (Directions = {}));
```

可见TypeScript中重复定义枚举的代码并不冲突。



### 3. TypeScript类型定制

#### 定义对象结构的类型：interface和class

当我们想要定义一个更具体的对象结构的类型时，可以使用interface或class关键字，两者看上去有点相似，但使用上也有不同。

* class是JavaScript的关键字，是function的一种语法糖，可以通过new操作来创建实例，可以用instanceof操作来判断类型；而interface通常被看作为你的代码或第三方代码定义的一种契约，可以用于与后端数据对接的规范。
* interface中的函数只有声明，没有具体实现；class中可以有函数具体实现的代码。

**基础使用**

```typescript
// interface
interface User {
    name: string
    age: number
    gender: boolean
    say: (words: string) => string
}

// class
class Vehicle {
    public startRun(): void {
        console.log('starting ...');
    }
}

const car = new Vehicle();
car.startRun(); // starting ...
```

**定义可选属性和只读属性**

1. 假设对象的某个属性可以不定义，即存在可选的属性，可以通过`?`来定义这个属性：

```typescript
interface User {
    name: string
    age?: number
    gender: boolean
    say: (words: string) => string
}
```

上述代码表示声明类型为User的数据，可以不定义age属性，比如：

```typescript
const u1: User = {
  name: 'lilei',
  gender: true,
  say: (words: string) => {
    return `message: ${words}`;
  }
}
```

2. 假设对象的某个属性不可写，即存在只读属性，可以通过`readonly`来定义这个属性：

```typescript
interface User {
    name: string
    age?: number
    readonly gender: boolean
    say: (words: string) => string
}

u1.name = 'hanmeimei'; // ok
u1.gender = false; // TS2540: Cannot assign to 'gender' because it is a read-only property.
```

上述代码中定义`gender`为只读属性，给对象的非只读属性name重新赋值没有问题，但是给`gender`重新赋值就会报错，提示只读属性不能赋值。

**可索引类型**

假设存在一个对象，所有属性对应的值都是一样的类型，比如是string，就可以用可索引类型表示。

可索引类型具有一个索引签名，它描述了对象索引的类型，还有相应的索引返回值类型。比如：

```typescript
interface Email {
  [name: string]: string
}
```

上述代码表明Email类型的变量，拥有0个或多个string类型的索引并且属性值也是string类型。使用：

```typescript
const email1: Email = {};
const email2: Email = { netease: 'mmmm@163.com' };
const email3: Email = { netease: 'mmmm@163.com', qq: '12345@qq.com' };
```

在实际应用中，可以用于与接口返回数据的约定，比如除了确定存在的属性，也存在一些不确定的数据。比如：

```typescript
interface Item {
  name: string
  id: number
  status: number
  [key: string]: any
}
```

上述代码约定了返回的数据对象中一定有`name`、`id`和`status`属性，也有一些不确定的数据。

#### 函数结构的类型

在JavaScript中函数的类型就是指`Function`；而在TS中，函数还定义了更具体的结构的类型。

函数的类型具体包含了参数个数、各个参数的类型以及返回值类型。

**基础使用**

```typescript
// 1. 作为对象类型的属性
interface User {
    name: string
    age: number
    gender: boolean
    say: (words: string) => string 
}

// 2. 单独定义
interface Say { // 使用interface定义
    (words: string): string
}
// 3. 或者定义别名（相当于定义了一个简写）
type Say = (words: string) => string
// 再使用
interface User {
    name: string
    age: number
    gender: boolean
    say: Say
}
```

**可选参数、默认参数、剩余参数**

1. 定义可选参数与定义可选属性一样，都是使用`?`

   ```typescript
   const add: Add = (a:number, b?: number) => a + (b || 0);
   ```

   参数`b`有`number`和`undefined`两种可能。

2. 定义默认参数的方式与JavaScript一样

   ```typescript
   const add: Add = (a:number, b:number = 0) => a + b;
   ```

3. 定义剩余参数的方式与JavaScript一样

   ```typescript
   // 剩余参数`rest`是一个由number组成的数组，在本函数中用reduce进行了累加求和。
   const add2 = (a: number, ...rest: number[]) => rest.reduce((a, b) => a+ b, a);
   ```

**函数重载：**用于更精准的类型提示和推导

假设定义了一个函数`assigned`，表面上看可以接收1~4个参数，但实际接收3个参数是有问题的。

```typescript
function assigned(a: number, b?: number, c?: number, d?: any) {
    if (b === undefined && c === undefined && d === undefined) {
        b = c = d = a;
    } else if (c === undefined && d === undefined) {
        c = a;
        d = b;
    }
    return {
        top: a,
        right: b,
        bottom: c,
        left: d
    };
}

assigned(1, 2, 3);
```

但此时TS并不会给出错误提示，在编写代码中调用assigned函数时也不会给出准确的提示，需要传几个参数，这就增加了类型的不安全。

此时函数重载就派上了用场。函数重载就是指用同样的函数名**声明**分别对应不同的情况。比如：

```typescript
interface Position {
    top: number,
    right?: number,
    bottom?: number,
    left?: number
}

function assigned(all: number): Position;
function assigned(topAndBottom: number, leftAndRight: number): Position;
function assigned(top: number, right: number, bottom: number, left: number): Position;

function assigned(a: number, b?: number, c?: number, d?: any) {
    if (b === undefined && c === undefined && d === undefined) {
        b = c = d = a;
    } else if (c === undefined && d === undefined) {
        c = a;
        d = b;
    }
    return {
        top: a,
        right: b,
        bottom: c,
        left: d
    };
}

assigned(1);
assigned(1, 2);
assigned(1, 2, 3); // TS2575: No overload expects 3 arguments, but overloads do exist that expect either 2 or 4 arguments.
assigned(1, 2, 3, 4);
```

上述代码中分别声明了参数为1、2、4的情况。可以看到，只有传入3个参数的情况下报错了。

可以理解成重载是定义了函数的几种不同的形态，如果不满足上面重载定义的其中一种形态，就会报错！另外函数重载的入参类型和返回值类型需要和函数实现保持一致，否则也会报错！

**可调用类型**

可调用类型就是前面所说的单独定义一个函数类型

```typescript
interface Say { // 使用interface定义
    (words: string): string
}
```

此时表明`Say`是一个可调用类型，声明一个变量类型为`Say`时，说明这个变量是可以执行调用操作的。如下：

```typescript
declare const say: Say;
say('1');
```

**构造函数的注解**

假设我们要对上面的变量`say`进行实例化操作，会报错，因为没有对应的构造函数签名。

```typescript
new say('1'); // TS7009: 'new' expression, whose target lacks a construct signature, implicitly has an 'any' type.
```

此时可以加上new来表示此接口可以实例化。比如：

```typescript
interface Say { // 使用interface定义
    (words: string): string
    new (): string
}
```

这样就可以执行构造调用了。

```typescript
new say();
```

#### 组合结构的类型

在实际项目中，可能会出现复杂类型的使用，我们可以在现有类型的基础上，创造出更复杂的类型来满足实际场景。

* `&`形成交叉类型

  使用`&`可以形成交叉类型，&在逻辑中就是且的意思，表示两侧的条件必须同时满足。

  比如将两个对象结构的类型交叉，就是将两个类型中相同的属性合并为一个，再与剩余的属性一起形成新的类型，这样就是两侧的定义的结构都满足了。比如：

  ```typescript
  interface I1 {
    name: string
    age: number
  }
  interface I2 {
    name: string
    status: number
  }
  type T1 = I1 & I2; 
  
  const t1: T1 = {
  	name: 'lilei',
  	age: 12,
  	status: 1
  }; // t1必须同时满足I1和I2的约束
  
  // 如果I2的定义中也定义了age字段，类型为string
  interface I2 {
    name: string
    age: string
    status: number
  }
  // 那么I1&I2交叉的结果中，age字段就会变成never，因为age为number & string，一个数据不可能既是string类型又是number类型，就变成了不存在的never类型数据
  // I1 & I2 得到的结果
  {
    name: string
    age: number & string -> never
    status: number
  }
  ```

* `|`形成联合类型

  使用`|`可以形成联合类型，|在逻辑中就是或的意思，表示两侧的条件只要满足其一。

  比如将两个类型进行联合操作，形成新的类型，就表示两侧的结构满足其中之一即可。比如：

  ```typescript
  type T2 = number | string;
  const t21: T2 = 1; // ok
  const t22: T2 = '1'; // ok
  const t23: T2 = true;  // TS2322: Type 'boolean' is not assignable to type 'T2'.
  ```

  内置类型中的枚举类型可以看作是声明了一个联合类型。

  ```typescript
  enum Direction {
  	UP,
  	DOWN,
  	LEFT,
  	RIGHT
  }
  //
  type T3 = Direction.UP | Direction.DOWN | Direction.LEFT | Direction.RIGHT;
  
  let enu1: Direction = Direction.UP;
  let enu2: T3 = Direction.UP;
  ```

#### 类型别名：type

使用类型别名相当于给类型指定了一个简写。比如：

```typescript
type AddFunction = (a: number, b: number) => number;
const add: AddFunction = (a: number, b: number) => a + b;
// 👆🏻的写法相当于
const add: (a: number, b: number) => number = (a: number, b: number) => a + b;
```

也就是说关键字`type`并没有声明一个新的类型，只是给类型设置了一个简写，使代码更简洁可读性更高。

`type`和`interface`在使用有一些相似之处，比如都可以用于对象结构类型的定义，也都可以被implement：

```typescript
type TUser = {
	name: string
	age: number
}
interface IUser {
	name: string
	age: number
}
const tUser: TUser = {
	name: 'a',
	age: 12
};
const iUser: IUser = {
	name: 'b',
	age: 13
};
// 类型别名可以被implements
class AA implements TUser {
	name = 'aa'
	age = 12
}
// interface也可以被implements
class BB implements IUser {
	name = 'bb'
	age = 13
}
```

但还有很多不同的用法：

1. interface只用于定义对象结构的类型，interface声明时可以使用extends关键字来继承其他interface、type和class。比如：

   ```typescript
   // interface声明extends类型别名
   interface IUser2 extends TUser {
   	// ...
   }
   // interface声明extends其他interface
   interface IUser3 extends IUser {
   	// ...
   }
   // interface声明extends class
   interface IUser4 extends AA {
   	// ...
   }
   // interface声明合并接口
   interface IUser5 extends IUser2, IUser3 {
   	// ...
   }
   ```

2. type的声明中不能用extends关键字，但type除了声明对象结构的类型，还可以对类型进行组合操作，比如交叉操作、联合操作，等等，还有后面会提到的与泛型还有其他类型操作符，形成复杂的类型。相当于发挥类似工具函数的作用，使用范围更广。

   ```typescript
   type Action = {
     type: 'create'
     payload: {
       name: string
       age: number
     }
   } | {
     type: 'delete',
     payload: {
       id: number
     }
   }
   type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"
   ```



### 4. 利用类型系统来缩小类型范围：类型守卫

假设某个变量可能是多种类型之一，如果要对它进行某种类型的特定操作，就需要缩小类型范围，来保证类型的安全性，比如某个函数的参数，可能是number类型或string类型，如果要调用string类型的方法，就必须在参数为string的情况下才可以进行操作，达到减少报错的目的，减少编码中可能存在的潜在错误。

可以通过以下几种方式来缩小类型范围：

#### JS操作符：in、typeof、instanceof

instanceof类型保护是通过构造函数来细化类型的一种方式：

```typescript
function getSomething(arg: Date | Date[]) {
	// 细化类型为Date
	if(arg instanceof Date) {
		// arg.pop(); // TS2339: Property 'pop' does not exist on type 'Date'.
		console.log(arg.getDate());
	}
	// 细化类型为Array
	if(arg instanceof Array) {
		// arg.getDate(); // TS2339: Property 'getDate' does not exist on type 'Date[]'.
		console.log(arg.pop());
	}
}

getSomething(new Date()); // 2
getSomething([new Date()]); // 2022-11-02T03:37:45.874Z
```

typeof也是差不多的方式，通过判断数据的JavaScript基本类型来缩小范围：

```typescript
function getMessage(arg: number | string) {
	if (typeof arg === "number") {
		// arg.toUpperCase(); // TS2339: Property 'toUpperCase' does not exist on type 'number'.
		console.log(arg + 1);
	}
	if (typeof arg === "string") {
		console.log(arg.toUpperCase());
	}
}
getMessage(33); // 34
getMessage('excellent'); // EXCELLENT
```

类似的，`x in y`表示x属性在y中存在。

```typescript
function getSomething2(arg: Date | Date[]) {
	if ('getDate' in arg) {
		// arg.pop(); // TS2339: Property 'pop' does not exist on type 'Date'.
		arg.getDate();
	}
	if ('length' in arg) {
		// arg.getDate(); // TS2339: Property 'getDate' does not exist on type 'Date[]'.
		arg.pop();
	}
}
```

#### 字面量类型守卫

假设我们定义一个变量v1：

```typescript
const v1 = "v1"; // const v1: "v1"
let v2 = "v2"; // let v2: string
```

此时我们没有指定类型，但TS会推导出v1的类型是`"v1"`，虽然看上去有点奇怪，但这就是TS类型系统中的字面量类型。比如`{}`、`[]`、`""`、`123`都是字面量，所以字面量都是单例类型，使用const声明一个原始类型就会得到一个字面量类型。比如对象类型就不能得到字面量类型：

```typescript
const v3 = {
	name: '1',
	address: {
		city: 'hz',
		country: 'China'
	}
}; // const v3: {name: string, address: {city: string, country: string}}
```

这在联合类型中非常实用，比如两个对象结构的类型形成一个联合类型，假如通过`in`操作符来判断其中某个属性从而区分两个类型，存在类型风险，比如后期这个属性变动不存在了，此时就可以添加一个属性，指定为字面量类型，从而可以分辨两个类型，就形成了可辨识联合类型。比如：

```typescript
type Error1 = {
    kind: 'networkError', // 字面量类型
    networkStatus: string
}
type Error2 = {
    kind: 'serverError', // 字面量类型
    serverStatus: string
}

function doHandle(error: Error1 | Error2) {
    if (error.kind === 'networkError') {
        // console.log(error.serverStatus); // TS2339: Property 'serverStatus' does not exist on type 'Error1'.
        console.log(error.networkStatus);
    }
    if (error.kind === 'serverError') {
        // console.log(error.networkStatus); // TS2339: Property 'networkStatus' does not exist on type 'Error2'.
        console.log(error.serverStatus);
    }
}

doHandle({ kind: 'serverError', serverStatus: 'server error...' });
```

可以看出TypeScript根据字面量的比较操作进行了类型推断

#### TS关键字`is`定制类型守卫

假设我们要判断一个数据的类型，除了符合特性的结构以外，还需要满足一些额外的条件，就可以使用关键字`is`来定制我们的类型守卫，比如Student和Person的结构一样，但是Student的范围更小一些，比如说年龄范围在12至15岁之间，就可以编写如下代码来进行区分：

```typescript
interface Person9 {
    name: string,
    age?: number,
}

interface Student9 extends Person9 {}

function checkValidStudent(p: Person9): p is Student9 {
    return p.age !== undefined && p.age >= 12 && p.age <= 15;
}

const p1: Person9 = {
    name: 'lilei',
    age: 18
}

const p2: Person9 = {
    name: 'hanmeimei',
    age: 15
}

function checkPerson(p: Person9) {
    if (checkValidStudent(p)) {
        console.log(`${p.name} is a Student`);
    } else {
        console.log(Object.prototype.valueOf.call(p));
    }
}

checkPerson(p1);
checkPerson(p2);
```

上述代码运行的结果是：

```
{ name: 'lilei', age: 18 }
hanmeimei is a Student
```

在`if`的条件里，p提示的类型是Person9，在`if`判断内部，p提示的类型就变成Student9了。

在else判断里，p提示的类型是never，不懂为啥？也许是因为Person9和Student9的结构一样

又比如除了函数类型必须得通过typeof验证，从而保证类型的安全：

```typescript
function isFunction(arg: any): arg is Function {
  return typeof arg === "function";
}
```

虽然函数编译后显示返回值是布尔类型，但在TS的类型系统中给出的是不同的提示，直接定义返回类型是布尔类型boolean，就达不到判断类型的目的。



### 5. TypeScript对类型的操作

#### 类型变量（相对于值变量）

* 泛型

  泛型就相当于对类型的一种指代，类似于变量是对值的一种指代；所以泛型就是类型变量。

  当我们在编码时还不确定某些数据的类型，但是需要使用类型，或者根据不同类型做不同的处理，就可以用到泛型，通常泛型使用T、V、U等大写字母，通过`<>`来声明。比如：

  ```typescript
  // 应用于函数
  function print<T>(a: T) {
      console.log(a);
  }
  // 假设已经明确传入的参数是数组，只是不知道元素的类型未知，则可以这样定义
  function getArrayLength<T>(arg: Array<T>): Array<T> {
      console.log(arg.length);
  
      return arg;
  }
  // 应用于类
  class Stack<T> {
      private arr: T[] = [];
      public push(n: T) {
          this.arr.push(n);
      }
      public pop() {
          this.arr.pop();
      }
  }
  // 应用于接口
  interface Tree<T> {
      name: string,
      node: T,
      child: Tree<T>
  }
  interface ReturnItemFn<T> {
      (para: T): T
  }
  // 应用于类型别名
  type T5<T> = {
      name: string,
      node: T,
      child: T5<T>
  }
  ```

  在使用时可以显示的指定泛型的类型，TS也可以通过数据实际值的类型进行推导。

  ```typescript
  print(1); // print推导出function print<number>(     a: number): void
  print<string>('1');
  const returnItem: ReturnItemFn<number> = para => para; // 实现一个接口需要明确传入泛型的类型
  ```

* 泛型约束：使用关键字`extends`

  虽然编码时不确定操作的数据类型，但通常实际操作的数据会在一定的范围内，此时我们就可以通过`extends`关键字来限制所指代的类型。比如给上面的print的泛型添加约束：

  ```typescript
  function print<T extends boolean | number>(a: T) {
    console.log(a);
  }
  // 此时就会报错
  print<string>('1'); // TS2344: Type 'string' does not satisfy the constraint 'number | boolean'.
  ```

  T限制为 string和number形成的联合类型，即a的值的类型必须满足这个约束。

  乍一看似乎没什么用处，为什么不直接定义一个类型CC，然后将a指定为CC类型呢？比如：

  ```typescript
  type CC = boolean | number
  function printf(a: CC) {
    console.log(a);
  }
  ```

  在这样简单的代码中，确实显示不出用途。

  假如有一个需求，要设计一个函数，接收两个参数，一个参数为对象，另一个参数为对象上的属性，通过这两个参数返回这个属性的值。假如使用以下代码：

  ```typescript
  function getObjProperty(obj: object, key: string) {
      return obj[key];
  }
  ```

  会得到TypeScript的错误提示：

  ```
  TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.   No index signature with a parameter of type 'string' was found on type '{}'.
  元素隐含有一个'any'类型，因为'string'类型的表达式不能被用于索引'{}'类型。   在类型'{}'上没有找到带有'string'类型参数的索引签名。
  ```

  因为obj默认情况下是`{}`，`key`是无法在上面取到任何值的。但我们接收的对象是各种各样的，我们需要一个泛型来表示传入的对象类型，比如`T extends object`：

  ```typescript
  function getObjProperty<T extends object>(obj: T, key: string) {
      return obj[key];
  }
  ```

  但此时仍不能解决问题，因为第二个参数`key`是不是存在于`obj`上是无法确定的，因此我们需要对`key`也进行约束，把它约束为只存在于`obj`属性的类型。这里可以借助获取索引的类型进行实现`<U extends keyof T>`，用索引类型查询操作符`keyof T`把传入的对象的属性取出生成一个联合类型，这样泛型U就被约束在这个联合类型中，这样一来函数就被完整定义了：

  ```typescript
  function getObjProperty<T extends object, U extends keyof T>(obj: T, key: U) {
      return obj[key];
  }
  ```

  假设传入以下对象：

  ```typescript
  const person = {
      id: 1,
      name: 'lily'
  }
  ```

  当我们向getObjProperty传入第一个参数为person时，第二个参数`key`的类型就被推导约束为一个联合类型`"name" | "id"`，只可能是这两者之一，因此能获得良好的类型提示：

  ```
  function getObjProperty<{
      id: number;
      name: string;
  }, "id" | "name">(     
  	obj: {id: number, name: string},     
  	key: "id" | "name"): string | number
  ```

#### 操作符

* 使用TS关键字`keyof`查询索引得到索引的一个联合类型

  ```typescript
  class Logo {
      public src: string = 'https://www.google.com.hk/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png'
      public alt: string = 'google'
      public width: number = 500
  }
  
  type propNames = keyof Logo;
  ```

  TS的推导：

  ```
  type propNames
  Alias for:
  keyof Logo
  Initial type:
  "src" | "alt" | "width"
  ```

* 使用`[]`获取索引对应的类型

  ```typescript
  type propsType = Logo[propNames];
  ```

  TS的推导：

  ```
  type propsType
  Alias for:
  Logo[propNames]
  Initial type:
  string | number
  ```

  如上`propNames`是一个联合类型，`[]`操作也是将联合类型中的每个类型去取一遍，再得到一个联合类型。

* 使用TS操作符`in`的映射操作

  假设此时有一个User接口，现在有一个需求是把User接口中的成员全部变成可选的，要怎么做呢？

  ```typescript
  interface User {
      username: string,
      id: number,
      token: string,
      avatar: string,
      role: string
  }
  ```

  一个个`:`前加上`?`会不会太繁琐，有没有更便捷的方法？

  此时映射操作就派上用场了，语法是`[K in Keys]`：

  * K：属性名变量，依次绑定到每个属性上，对应每个属性名

  * Keys：字符串字面量构成的联合类型，表示一组属性名。

    此处可以使用`keyof`操作符，假设传入的类型是泛型`T`，得到`keyof T`，即传入类型`T`的属性名的联合类型，也就是Keys。

  将`keyof T`的属性名称一一映射出来就是`[K in keyof T]`。

  要把所有的属性成员变为可选类型，那么需要用`T[K]`取出相应的属性的类型，然后重新生成一个可选的新类型`{ [K in keyof T]?: T[K] }`。

  使用类型别名表示：

  ```typescript
  type partial<T> = {
      [K in keyof T]?: T[K]
  }
  
  // 测试
  type partialUser = partial<User>;
  ```

  可以看到所有属性都变成了可选类型：

  ```typescript
  type partialUser
  Alias for:
  partial<User>
  Initial type:
  {username?: string, id?: number, token?: string, avatar?: string, role?: string}
  ```

  使用`in`操作符就相当于数组的map操作，对一组联合类型进行遍历的映射操作，得到的结果形成新的类型。

* 使用TS关键字`extends`的条件判断：三目运算

  在TS的类型中来可以通过`extends`操作符来实现三目运算，通常在泛型中使用。比如：

  ```typescript
  T extends U ? X : Y
  ```

  可以这样理解：若`T`能够赋值给`U`，那么类型是`X`，否则是`Y`。

  假设我们声明一个函数`f`，它的参数接收一个布尔类型，当布尔类型为`true`时返回`string`类型，否则返回`number`类型，代码如下：

  ```typescript
  declare function f1<T extends boolean>(arg: T): T extends true ? string : number;
  
  f1(Math.random() < 0.5); // function f1<boolean>(arg: boolean): string | number
  f1(true); // function f1<true>(arg: true): string
  f1(false); // function f1<false>(arg: false): number
  ```

  可以看到当参数的类型不同，会推导出不同的返回值类型。

  当类型系统给出充足的条件，就能根据条件推断出类型结果。

  当`extends`后面跟的是一个联合类型，得到的结果也是一个联合类型，相当于联合类型中的每个类型进行了一次判断，最后组合再一起。比如：

  ```typescript
  type Diff<T, U> = T extends U ? never : T;
  type R = Diff<"a"| "b" | "c" | "d", "a" | "c" | "f">; // "b" | "d"
  ```

  遍历联合类型`"a"| "b" | "c" | "d"`中每个类型做一次判断，是否能赋值给`"a" | "c" | "f"`，最后得到`"b"|"d"`，因为根据条件，能赋值的类型在三目运算后得到的为`never`。

  条件判断和映射操作还能组合做更复杂的操作。

* 使用`[keyof T]`取出对象属性的类型，形成联合类型

  可用于过滤never类型的属性。

  假设有一个interface `Part`，需要将interface中函数类型的属性名称取出来：

  ```typescript
  interface Part {
    id: number,
    name: string,
    subparts: Part[],
    updatePart(newName: string): void
  }
  ```

  此时我们可以把interface看作是对象字面量；遍历整个对象，找出value是函数类型的部分取出key即可；TypeScript的类型编程也是类似操作，遍历interface，找出类型为`Function`的部分取出key即可：

  ```typescript
  type FunctionPropertyNames<T> = { [K in keyof T] : T[K] extends Function ? K : never }[keyof T]
  
  type R = FunctionPropertyNames<Part>;
  ```

  执行步骤：

  1. 把`Part`代入泛型`T`，`[K in keyof T]`相当于遍历整个interface，此时`K`相当于key，`T[K]`相当于value

  2. 验证value的类型，如果是`Function`那么将key作为value，否则为`never`，这样就得到一个新的interface：

     ```
     {
       id: never,
       name: never,
       subparts: never,
       updatePart(newName: string): "updatePart"
     }
     ```

  3. 最后再用`[keyof T]`，依次取出新interface的value，由于`id`、`name`和`subparts`的value为`never`就不会返回任何类型了，所以只会返回`"update"`。

* 使用TS操作符`typeof`获取类型（结构）

  比如：

  ```typescript
  const a1: number = 1;
  type C = typeof a1; // number
  const c: C = '1'; // TS2322: Type 'string' is not assignable to type 'number'.
  ```

  `typeof a1`得到的就是变量`a1`的类型number。

  假设定义了一个函数和一个对象：

  ```typescript
  function addFunction(a: number, b: number) {
  	return a + b;
  }
  type addType = typeof addFunction;
  
  const student = {
    name: 'xiaoming',
    age: 12,
    grade: 1
  }
  type Student = typeof student;
  ```

  `addType`得到的类型就是`(a: number, b: number) => number`；`Student`得到的类型就是`{grade: number, name: string, age: number}`。

* 使用TS关键字`infer`用于标识待推导和使用的类型（用在函数的参数类型和返回值类型）

  通常配合`extends`三目运算的条件判断来推断类型。

  假如我们想知道一个函数的返回值类型，可以使用infer关键字：

  ```typescript
  type getReturnType<T> = T extends (...args: any[]) => infer P ? P : never;
  
  type addReturnType = getReturnType<typeof addFunction>; // number
  ```

  上述代码中定义了一个接收泛型的类型别名`getReturnType`，当它接收的泛型满足约束条件，即符合函数结构`(...args: any[]) => infer P`时，就得到类型P，否则就得到类型never。`infer`标识了这个待推导类型。

  接着使用`typeof addFunction`得到`addFunction`函数的类型，将它传递给getReturnType，最后得到返回值的类型`number`。

  获取函数参数的类型也是一样的。例子：

  ```typescript
  type getParamType<T> = T extends (x: infer V) => any ? V : never;
  type addParamType = getParamType<typeof addFunction>; // never
  ```

  addFunction的类型不符合约束条件，即`(a: number, b: number) => number`不能赋值给`(x: infer V) => any`，所以得到的参数类型是never。

  当满足条件时，就得到参数类型。

  ```typescript
  type getParamType<T> = T extends (...x: infer V) => any ? V : never;
  type addParamType = getParamType<typeof addFunction>; // [number, number] 元组类型
                                                            
  type getParamType<T> = T extends (x: infer V, y: infer U) => any ? V : never;
  type addParamType = getParamType<typeof addFunction>; // number
  ```

  函数类型是否满足约束条件，我们需要通过参数类型和返回类型同时判断，比如上述代码中，对比参数`(x: infer V)`，能否传递给addFunction执行，显然不行，addFunction需要接收两个参数；再对比返回类型，addFunction的返回类型number是`any`的子类型，所以返回值类型是满足的。综合下来，就是不满足约束条件了。

  总之就是调用满足类型`(x: infer V)=>any`的函数的地方，是否能替换成addFunction来执行，如果不能，就是不满足。

* `+`和`-`操作符

  `+` `-`这两个关键字用于映射操作中给属性添加修饰符，比如`-?`就是将可选属性变为必选，`-readonly`就代表将只读属性变为非只读。

  TS有一个内置的工具类型`Required<T>`，作用就是将传入的类型属性变为必选项，我们也可以自己实现这个功能：

  ```typescript
  type RawRequired<T> = { [P in keyof T]-?: T[P] };
  
  type Writable<T> = { -readonly [P in keyof T]: T[P] }
  
  // 使用如下
  interface Animal {
  	type: string,
  	name?: string,
  	readonly gender: number
  }
  
  type requiredAnimal = RawRequired<Animal>; // {type: string, name: string, gender: number}
  type writableAnimal = Writable<Animal>; // {type: string, name?: string, gender: number}
  
  const cat1: Animal = { // name为可选属性，没有初始化也没关系
  	type: 'cat',
  	gender: 1
  };
  // gender是只读属性，赋值会报错
  cat1.gender = 0; // TS2540: Cannot assign to 'gender' because it is a read-only property.
  
  const cat2: requiredAnimal = { // name变成了必选属性，初始化没有设置会报错
  	type: 'cat',
  	gender: 1
  }; // TS2741: Property 'name' is missing in type '{ type: string; gender: number; }' but required in type 'RawRequired<Animal>'.
  
  const cat3: writableAnimal = { // gender去除了只读限制，可以再次赋值
  	type: 'cat',
  	gender: 1
  };
  cat3.gender = 0;
  ```

#### 工具类型：结合泛型和操作符

通常使用关键字`type`定义，使用泛型和操作符创建的类似函数功能的类型，可以通过泛型接收输入的类型，经过一系列操作得到并输出新的类型。

在前面的示例代码中，就应用了很多工具类型。比如：

```typescript
type RawRequired<T> = { [P in keyof T]-?: T[P] };
```

可以通过泛型T接收指定的类型，经过操作后，得到新的类型：

```typescript
type requiredAnimal = RawRequired<Animal>;
```

`requiredAnimal`就是得到的新类型`{type: string, name: string, gender: number}`。