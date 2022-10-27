## TypeScript工程化：代码检测

TypeScript主要用于检查类型和语法错误，而代码检测工具主要用于检查代码风格，其作用是统一团队的代码风格，便于项目维护、降低沟通或者阅读成本。

代码检测工具更关注代码风格，比如：

1. 缩进应该是四个空格还是两个空格？
2. 是否应该禁用var？
3. 接口名是否应该以`I`开头？
4. 是否应该强制使用`===`而不是`==`？

### 代码检测工具选择

TypeScript的代码检测工具有TSLint和ESLint。

但由于一些性能问题，TypeScript官方支持了ESLint，TSLint作者宣布放弃TSLint。

虽然一些现存的TypeScript项目是以TSLint为主，但如果面向未来的话，ESLint显然是首选。

TSLint的作者加入ESLint为其提供ESLint + TypeScript的优化，实际上ESLint的短板在逐渐被补齐，加上ESLint一向固有的优势，ESLint单从强大程度依然是压过TSLint的。

#### ESLint兼容性问题

由于TSLint直接寄生于TypeScript之下，他们的parser是相同的，产生的AST也是相同的。因此TSLint的bug更少，对TypeScript支持更友好；而ESLint的御用parser是基于ESTree标准的，其产生的AST与TypeScript并不相同。

所以ESLint需要做额外的兼容工作来兼容TypeScript，ESLint做的一直不够好，但目前TypeScript官方支持了ESLint，与ESLint共同发布了[typescript-eslint](https://github.com/typescript-eslint/typescript-eslint)来解决兼容性问题。

甚至TypeScript本身就作为测试平台，在兼容性方面ESLint的进步是实质性的，毕竟`typescript-eslint`这个parser的主要贡献者就是TypeScript团队本身。

#### ESLint的优势

* 可配置性更高：ESLint的配置规则远多于TSLint，ESLint的可配置规则超过250个
* 更活跃的生态：基本上开发者能想到的插件，在ESLint中都能找到，而基于这些插件也很容易进行魔改或者拓展

例子：在ESLint中有一项配置为[max-params](https://eslint.org/docs/rules/max-params)，它能检测一个函数的参数数量，我们可以设定参数数量的上限，限制一个函数引入过量的参数引起不必要的复杂度。

```javascript
function foo (bar, baz, qux, qxx) { // four parameters, may be too many
    doSomething();
}
```

这个功能在TSLint中是无法实现的。



### ESLint的使用

#### ESLint的安装

* 全局安装

  如果想使ESLint适用于所有的项目，建议全局安装ESLint：

  ```shell
  npm install -g eslint
  ```

  初始化配置文件：

  ```shell
  eslint --init
  ```

* 局部安装

  ```shell
  npm install eslint --save-dev
  ```

  初始化配置文件：

  ```shell
  ./node_modules/.bin/eslint --init
  ```

#### 初始化ESLint

创建一个简单的项目，通过实践来学习ESLint的使用。

* 创建一个目录`eslint-study`，然后快速初始化项目：

  ```shell
  mkdir eslint-study && cd eslint-study && npm init -y
  ```

* 因为是一个TypeScript项目，所以要下载TypeScript：

  ```shell
  npm i -D typescript
  ## 我使用局部安装ESlint
  $ yarn add eslint typescript -D
  ```

* 初始化ESLint：

  ```shell
  eslint --init
  # 
  $ ./node_modules/.bin/eslint --init
  You can also run this command directly using 'npm init @eslint/config'.
  ```

* 交互式问答环节

  ```shell
  ✔ How would you like to use ESLint? · To check syntax, find problems, and enforce code style
  ✔ What type of modules does your project use? · JavaScript modules (import/export)
  ✔ Which framework does your project use? · None of these
  ✔ Does your project use TypeScript? · Yes
  ✔ Where does your code run? · browser, node
  ✔ How would you like to define a style for your project? · Use a popular style guide
  ✔ Which style guide do you want to follow? · xo-typescript（没有Airbnb😅）
  ✔ What format do you want your config file to be in? · JavaScript
  Checking peerDependencies of eslint-config-xo-typescript@latest
  Checking peerDependencies of eslint-config-xo@latest
  The config that you've selected requires the following dependencies:
  
  eslint-config-xo@latest eslint@>=8.0.0 eslint-config-xo-typescript@latest @typescript-eslint/eslint-plugin@>=5.31.0 @typescript-eslint/parser@>=5.31.0 typescript@>=4.4
  ✔ Would you like to install them now? · Yes
  ✔ Which package manager do you want to use? · yarn
  ```

  在初始化过程中选择相应的配置来初始化ESLint，在`How would you like to define a style for your project?`中选择社区内已经配置好的流行的ESLint规则，通常情况下建议不管是个人还是团队，最好在现有的流行规则下进行使用或者二次拓展，因为ESLint的规则有数百个之多，将其中的组合合理化地推广是一个很考验时间验证的事情，而社区内流行的规则显然是受到过时间检验的。

  一共给了两个流行方案供选择，分别是Standard、xo-typescript。

  从严格程度对比应该是xo-typescript > Standard



### ESLint的配置项

初始化完毕之后，可以看到根目录下出现了一个`.eslint.js`文件：

```javascript
module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true,
	},
	extends: 'xo',
	overrides: [
		{
			extends: [
				'xo-typescript',
			],
			files: [
				'*.ts',
				'*.tsx',
			],
		},
	],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	rules: {
	},
};
```

可以从`./node_modules/@eslint/eslintrc/conf/config-schema.js`中的`baseConfigProperties`看到要求的config的配置格式。

这个配置文件不仅仅可以是`.js`的，也可以是以下形式：

* .eslintrc.js（输出一个配置对象）
* .eslintrc.yaml
* .eslintrc.yml
* .eslintrc.json（ESLint的JSON文件允许JavaScript风格的注释）
* .eslintrc（可以是JSON也可以是YAML）
* package.json（在package.json里创建一个eslintConfig属性，定义配置）

以上各种形式以`.eslintrc.js`优先级最高，并依次往下排

以下逐一分析这些配置项的作用。

#### env

用于指定环境。每个环境都有自己预定义的全局变量，可以同时指定多个环境，不矛盾。

```json
{
  env: {
    browser: true,
    es2021: true,
    node: true,
    commonjs: true,
    mocha: true,
    jquery: true
  }
}
```

具体可以看`./node_modules/@eslint/eslintrc/conf/environments.js`

`./node_modules/globals/globals.json`

比如在浏览器环境就需要设置`browser: true`，在node环境就需要设置`node: true`等等。

#### extends

可以是一个字符串或字符串数组，数组中每个配置项继承它前面的配置。

比如初始化项目中`extends`就继承了xo-typescript的配置规则。

```json
{
  extends: 'xo'
}
```

在继承了其他配置规则后我们依然可以对继承的规则进行修改、覆盖和拓展：

* 启用额外的规则
* 改变继承的规则级别而不改变它的选项，比如
  * 基础配置：`"eqeqeq": ["error", "allow-null"]`
  * 派生的配置：`"eqeqeq": "warn"`
  * 最后生成的配置：`"eqeqeq": ["warn", "allow-null"]`
* 覆盖基础配置中的规则的选项，比如
  * 基础配置：`"quotes": ["error", "single", "avoid-escape"]`
  * 派生的配置：`"quotes": ["error", "single"]`
  * 最后生成的配置：`"quotes": ["error", "single"]`

#### globals

脚本在执行期间访问的额外的全局变量。

通常情况下ESLint会对非源文件的全局变量进行警告，比如我们可以访问浏览器环境下的`window`全局变量，这是没问题的，但是自己创造一个全局变量，此时ESLint会向你发出警告。

假如实际开发中的确有一些全局变量，那么如何在ESLint中把它合法化？这就需要globals这个配置项：

```json
{
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  }
}
```

比如我们需要一个全局变量`Atomics`，在globals配置项声明后还需要设置一个值，这个值代表了此全局变量是可以被修改的还是只读的，如果可写，则值为`writable`，否则为`readonly`。

#### parser

ESLint默认使用ESTree作为其解析器，我们可以在配置文件中指定一个不同的解析器。

由于这个项目是TypeScript的，所以就用上了TypeScript团队与ESLint联合发布的`typescript-eslint`解析器，它非常好地兼容了TypeScript和eslint的解析特性。

可以看到`.eslint.js`中没有设置parser，但实际上已经指定了，这部分已经内容在`xo-script`的配置文件中：

```javascript
// ./node_modules/eslint-config-xo-typescript/index.js
module.exports = {
  parser: require.resolve('@typescript-eslint/parser'),
  // ...
}
```

除此之外，还有其他的解析器可供我们选择：

* Esprima
* Babel-ESLint：一个对Babel解析器的包装，使其能够与ESLint兼容

#### parserOptions

parser解析代码时的配置参数。虽然已经指定了解析器，但解析器要想适用当前的环境也需要一定的配置。

```json
{
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	}
}
```

比如我们可以指定ECMAScript版本，默认是5，我们这里是用了最新的latest。

比如可以指定资源类型，使用script还是ECMAScript模块，这里指定了module，也就是ECMAScript模块。

如果还想使用额外的语言特性，还可以再添加一个`ecmafeatures`对象，如下：

```json
{
  parserOptions: {
    ecmafeatures: {
      // 允许在全局作用域下使用return语句
      globalReturn: false,
      // 启用全局strict模式
      impliedStrict: false,
      // 启用jsx
      jsx: false,
      // 启用对实验性的objectRestSpreadProperties的支持
      experimentalObjectRestSpread: false
    }
  }
}
```

#### plugins

ESLint支持使用第三方插件。在使用插件之前，必须使用npm安装它。

在配置文件里配置插件时，可以使用`plugins`关键字来存放插件名字的数组。插件名称可以省略`eslint-plugins-`前缀。

可以看到`.eslint.js`中没有设置plugins，但实际上已经指定了，这部分已经内容在`xo-script`的配置文件中：

```javascript
// ./node_modules/eslint-config-xo-typescript/index.js
module.exports = {
  plugins: [
		'@typescript-eslint'
	],
  // ...
}
```

plugins和extends两者的区别是：extends提供的是eslint现有规则的一系列预设，而plugins提供了除预设之外的自定义规则。当在eslint的规则里找不到合适的时候，就可以借用插件来实现了。

一些项目由于特殊性，会对ESLint进行特殊定制，借助的就是plugins进行自定义规则。

#### rules

此处是ESLint具体规则的配置。通常情况下我们使用社区比较流行的配置集，但这些流行的配置集不一定适合当前的团队或者当前的项目。

有一些配置集比较松散比如`Standard`，有一些配置集比较严苛比如`Airbnb`，此时就需要进行二次拓展或者关闭一些不必要的选项，就用到`rules`选项进行覆盖或者修改。

一些特殊需求也可以直接在这里配置。

具体的规则配置非常多，可以到[官方rules](https://eslint.org/docs/rules/)查阅。



### 小结

配置项的理解是本节的重点之一。

* env：预定义那些环境需要用到的全局变量，可用的参数：es6、browser、node等
* extends：指定扩展的配置，配置支持递归扩展，支持规则的覆盖和聚合
* plugins：配置那些我们想要Linting规则的插件
* parser：ESLint默认使用EStree作为解析器，也可以用其他解析器，在此配置
* parserOptions：解析器的配置项
* rules：自定义规则，可以覆盖掉extends的配置
* globals：脚本在执行期间访问的额外的全局变量