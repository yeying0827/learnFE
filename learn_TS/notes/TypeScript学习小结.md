## TypeScript学习小结：基础使用

某册子买了两年多了，到最近才开始学习TypeScript，拖延症的严重症状了；不过我还是深信人做一件事是需要一个契机的，也就是玄学中所说的缘分。
学完之后整体感受是：TypeScript在JavaScript的基础上提供了一套类型系统，用以在编码时提供类型提示，并利用类型推断对代码进行检查以及给出错误提示，以规避一些可能潜在的执行JavaScript代码时会出现的错误；可以提升团队协作效率，节省沟通成本、代码阅读成本等等。
对tsconfig.json进行配置，我们可以自定义关闭和开启的检查项以及TS的编译配置，比如是否对空值进行检查、编译的目标JS版本、源代码支持的ES版本等等。
基础知识分为以下几块：

1. TypeScript的类型系统
2. TypeScript内置的类型
3. TypeScript类型定制
   1. 对象结构的类型：interface和class
      1. 基础使用
      2. `?`用于定义可选属性，`readonly`用于定义只读属性
   2. 函数结构的类型：单独定义和作为对象类型的属性
      1. 基础使用
      2. 函数签名：用于更精准的类型推导
      3. 可调用类型
   3. 构造函数的类型
   4. 组合结构的类型
   5. 类型别名：type
4. 利用类型系统来缩小类型范围：类型守卫
   1. JS操作符：in、typeof、instanceof
   2. 字面量类型守卫（可用于可辨识联合类型）
   3. TS关键字`is`定制类型守卫
5. TypeScript对类型的操作
   1. 类型变量（相对于值变量）
      1. 泛型
      2. 泛型约束：使用关键字`extends`
   2. 操作符
      1. 使用TS关键字`in`的映射操作
      2. 使用TS关键字`extends`的条件判断：三目运算
      3. 使用TS关键字`typeof`获取类型（结构）
      4. 使用`[keyof T]`过滤never类型的属性
      5. 使用TS关键字`infer`用于标识待推导和使用的类型（用在函数的参数类型和返回值类型）
      6. `+`和`-`操作符
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

TypeScript的类型，与其他语言的类型不同，指的是符合某种结构的数据分类。

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
}
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

### 3. TypeScript类型定制

#### 对象结构的类型：interface和class

* 基础使用
* `?`用于定义可选属性，`readonly`用于定义只读属性

#### 函数结构的类型：单独定义和作为对象类型的属性

* 基础使用
* 函数签名：用于更精准的类型推导
* 可调用类型

#### 构造函数的类型

#### 组合结构的类型

* `&`形成交叉类型
* `|`形成联合类型

#### 类型别名：type



### 4. 利用类型系统来缩小类型范围：类型守卫

#### JS操作符：in、typeof、instanceof

#### 字面量类型守卫（可用于可辨识联合类型）

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



### 5. TypeScript对类型的操作

#### 类型变量（相对于值变量）

* 泛型
* 泛型约束：使用关键字`extends`

#### 操作符

* 使用TS关键字`in`的映射操作
* 使用TS关键字`extends`的条件判断：三目运算
* 使用TS关键字`typeof`获取类型（结构）
* 使用`[keyof T]`过滤never类型的属性
* 使用TS关键字`infer`用于标识待推导和使用的类型（用在函数的参数类型和返回值类型）
* `+`和`-`操作符

#### 工具类型：结合泛型和操作符

使用关键字`type`定义，使用泛型和操作符创建的类似函数功能的类型，通过泛型接收输入的类型，经过一系列操作得到并输出新的类型