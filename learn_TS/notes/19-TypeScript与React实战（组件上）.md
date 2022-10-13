## TypeScript与React实战（组件上）

目前绝大多数前端项目是依赖框架的，我们需要了解一下React与TypeScript应该如何结合运用。



### 快速启动TypeScript版React

使用TypeScript编写React代码，除了需要`typescript`这个库之外，还至少需要额外的两个库：

```shell
yarn add -D @types/{react,react-dom}
```

`@types`开头的这种库是什么呢？

由于非常多的JavaScript库并没有提供自己关于TypeScript的声明文件，导致TypeScript使用者无法享受这种库带来的类型，因此社区中出现了一个项目[DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped)，它定义了目前市面上绝大多数的JavaScript库的声明，当人们下载JavaScript库相关的`@types`声明时，就可以享受此库相关的类型定义了。

为了方便，这里选择直接用TypeScript官方提供的React启动模板：

```shell
npx create-react-app my-react --template typescript
```

```shell
$ npx create-react-app my-react --template typescript
npx: 67 安装成功，用时 4.844 秒

Creating a new React app in /Users/ying.ye/CodeProjects/learnFE/learn_TS/my-react.

Installing packages. This might take a couple of minutes.
Installing react, react-dom, and react-scripts with cra-template-typescript...


> core-js@3.25.5 postinstall /Users/ying.ye/CodeProjects/learnFE/learn_TS/my-react/node_modules/core-js
> node -e "try{require('./postinstall')}catch(e){}"


> core-js-pure@3.25.5 postinstall /Users/ying.ye/CodeProjects/learnFE/learn_TS/my-react/node_modules/core-js-pure
> node -e "try{require('./postinstall')}catch(e){}"

+ react-scripts@5.0.1
+ cra-template-typescript@1.2.0
+ react@18.2.0
+ react-dom@18.2.0
added 1405 packages from 628 contributors in 591.202s

209 packages are looking for funding
  run `npm fund` for details


Installing template dependencies using npm...
npm WARN @apideck/better-ajv-errors@0.3.6 requires a peer of ajv@>=8 but none is installed. You must install peer dependencies yourself.

+ @types/react-dom@18.0.6
+ @testing-library/react@13.4.0
+ web-vitals@2.1.4
+ @types/react@18.0.21
+ @testing-library/jest-dom@5.16.5
+ @testing-library/user-event@13.5.0
+ @types/jest@27.5.2
+ @types/node@16.11.64
+ typescript@4.8.4
added 36 packages from 72 contributors and updated 1 package in 63.824s

209 packages are looking for funding
  run `npm fund` for details


We detected TypeScript in your project (src/App.test.tsx) and created a tsconfig.json file for you.

Your tsconfig.json has been populated with default values.

Removing template package using npm...

npm WARN @apideck/better-ajv-errors@0.3.6 requires a peer of ajv@>=8 but none is installed. You must install peer dependencies yourself.

removed 1 package and audited 1443 packages in 8.345s

209 packages are looking for funding
  run `npm fund` for details

found 1 high severity vulnerability
  run `npm audit fix` to fix them, or `npm audit` for details

Success! Created my-react at /Users/ying.ye/CodeProjects/learnFE/learn_TS/my-react
Inside that directory, you can run several commands:

  npm start
    Starts the development server.

  npm run build
    Bundles the app into static files for production.

  npm test
    Starts the test runner.

  npm run eject
    Removes this tool and copies build dependencies, configuration files
    and scripts into the app directory. If you do this, you can’t go back!

We suggest that you begin by typing:

  cd my-react
  npm start

Happy hacking!
```



### 无状态组件

无状态组件是一种非常常见的React组件，主要用于展示UI，初始的模板中就有一个logo图，我们可以把它封装成一个`Logo`组件。

使用JavaScript通常是像下面这样封装：

```jsx
import React from "react";

export const Logo = props => { // TS7006: Parameter 'props' implicitly has an 'any' type.
    const { logo, className, alt } = props;

    return (
        <img src={logo} className={className} alt={alt} />
    );
}
```

但在TypeScript中这样写会报错：

```
TS7006: Parameter 'props' implicitly has an 'any' type.
```

原因在于我们没有定义`props`的类型，此时可以用`interface`定义一下props的类型：

```jsx
import React from "react";

interface IProps {
    logo?: string,
    className?: string,
    alt?: string
}

export const Logo = (props: IProps) => {
    const { logo, className, alt } = props;

    return (
        <img src={logo} className={className} alt={alt} />
    );
}
```

假设后续要用到`children`的时候，又要去定义`children`类型，就像下面这样：

```typescript
import React, {ReactNode} from "react";

interface IProps {
    logo?: string,
    className?: string,
    alt?: string,
    children?: ReactNode
}
```

但其实有一种更规范更简单的办法，`type SFC<P>`中已经定义了`children`类型，我们只需像下面这样使用：

```jsx
import React from "react";

interface IProps {
    logo?: string,
    className?: string,
    alt?: string
}

export const Logo: React.FC<IProps> = props => {
    const { logo, className, alt } = props;

    return (
        <img src={logo} className={className} alt={alt} />
    );
}
```

```
评论补充：
1. SFC类型已经修改成FC了。

2. 在类型定义文件中两个定义是一样的：
type SFC = FunctionComponent;
type FC = FunctionComponent;

type FC<P = {}> = FunctionComponent<P>;
测试：使用SFC报错 TS2694: Namespace 'React' has no exported member 'SFC'.

children具体怎么使用？？
```

[React.FC与React.Component](https://codeleading.com/article/48595762650/)

```
React.FC是函数式组件 是在TypeScript使用的一个泛型，FC就是FunctionComponent的缩写
```

继续替换`App.tsx`中的`logo`组件，可以看到相关的props都会有代码提示：

```jsx
import React from 'react';
import logo from './logo.svg';
import { Logo } from './components/Logo';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/*<img src={logo} className={className} alt={alt} /> 替换为logo组件*/}
        <Logo className={"App-logo"} logo={logo} alt={"logo"}/>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
```

如果这个组件是业务中的通用组件的话，还可以加上注释：

```typescript
interface IProps {
    /*
    * logo的地址
    * */
    logo?: string,
    /*
    * logo的样式类
    * */
    className?: string,
    alt?: string
}
```

这样其他同事调用此组件的时候，除了代码提示外还会有注释的说明：

```
IProps.logo?: string | undefined
logo的地址
  learn_TS/.../src/components/Logo.tsx
  
IProps.className?: string | undefined
logo的样式类
  learn_TS/.../src/components/Logo.tsx
```



### 有状态组件

例子：Todo应用

1. 首先编写一个`todoInput`组件：

   如果按照JavaScript的写法，一开始就会碰到一堆报错，比如：

   ```jsx
   import React from 'react';
   
   function TodoInput(props) { // TS7006: Parameter 'props' implicitly has an 'any' type.
       return (
           <div></div>
       );
   }
   
   export default TodoInput;
   ```

   ```jsx
   import React, {Component} from 'react';
   
   class TodoInput extends Component {
       constructor(props) { // TS7006: Parameter 'props' implicitly has an 'any' type.
           super(props);
           this.state = {
               itemText: ''
           }
       }
   
       render() {
           return (
               <div>
   
               </div>
           );
       }
   }
   
   export default TodoInput;
   ```

   有状态组件除了props、还需要state，对于class写法的组件要泛型的支持，即`Component<P, S>`，因此需要传入state和props的类型，这样就可以正常使用props和state了。

   ```jsx
   import React, {Component} from 'react';
   
   interface Props {
       handleSubmit: (value: string) => void
   }
   
   interface State {
       itemText: string
   }
   
   class TodoInput extends Component<Props, State> {
       constructor(props: Props) {
           super(props);
           this.state = {
               itemText: ''
           }
       }
   
       render() {
           return (
               <div>
   
               </div>
           );
       }
   }
   
   export default TodoInput;
   ```

   那需要给`Props`和`State`加上`Readonly`吗？因为我们的数据都是不可变的，这样会不会更严谨？

   答案是不用，因为React的声明文件已经自动帮我们包装过上述类型了，已经标记为`readonly`。

   ```jsx
   class Component<P, S> {
           // ...
     
           readonly props: Readonly<P>;
           state: Readonly<S>;
           
           // ...
       }
   ```
   
1. 接下来添加组件方法。大多数情况下这个方法是本组件的私有方法，此时需要加入访问控制符`private`。

   ```jsx
   import React, {Component} from 'react';
   
   interface Props {
       handleSubmit: (value: string) => void
   }
   
   interface State {
       itemText: string
   }
   
   class TodoInput extends Component<Props, State> {
       // ...
   
       private updateValue(value: string) {
           this.setState({
               itemText: value
           })
       }
     
       // ...
   }
   
   export default TodoInput;
   ```
   
1. 接下来会碰到一个不太好处理的类型，假设我们要获取某个组件的`ref`，应该如何操作？

   比如在组件更新完毕之后，使得`input`组件重新获得焦点。

   * 首先需要用`React.createRef`创建一个ref
   * 然后在对应的组件上使用即可
   
   ```jsx
   class TodoInput extends Component<Props, State> {
       constructor(props: Props) {
           super(props);
           this.state = {
               itemText: ''
           }
       }
   
       private updateValue(value: string) {
           this.setState({
               itemText: value
           })
       }
   
       // 创建一个ref
       private inputRef = React.createRef<HTMLInputElement>();
   
       render() {
           return (
               <div>
                   {/*在组件上使用*/}
                   <input
                       type="text"
                       ref={this.inputRef}
                       value={this.state.itemText}
                       className={"edit"}
                   />
               </div>
           );
       }
   }
   ```
   
   需要注意的是，在`createRef`这里需要一个泛型，这个泛型就是需要使用`ref`的组件的类型，因为这个是input元素，所以类型是`HTMLInputElement`；假如是`div`元素的话，就是`HTMLDivElement`了。
   
   

### 受控组件

上述的`TodoInput`就是一个受控组件，当我们改变`input`的`value`时，需要调用`this.setState`来不断更新状态，此时就会用到「事件」类型。

由于React内部的事件其实都是合成事件，也就是说都是经过React处理过的，所以并不是原生事件，因此通常情况下我们这个时候需要定义React中的事件类型。

对于`input`组件的`onChange`事件回调方法，一般这样声明：

```typescript
private updateValue(e: React.ChangeEvent<HTMLInputElement>) {
  this.setState({
    itemText: e.target.value
  })
}
```

当提交表单的时候，需要这样定义事件类型：

```typescript
private handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  if (!this.state.itemText.trim()) return;

  this.props.handleSubmit(this.state.itemText);
  this.setState({
    itemText: ''
  })
}
```

当我们在组件中输入事件对应的名称时，会有相关的定义提示，我们只要参考提示选择类型就可以了。



### 默认属性

React中有时会运用很多默认属性，尤其在编写通用组件的时候。

前面有介绍一个关于默认属性的小技巧，就是利用class来同时声明类型和创建初始值。

假设我们需要通过props来给`input`组件传递属性，而且需要初始值，这个时候就可以通过class来进行代码简化：

```jsx
// src/components/TodoInputProps.tsx
import React from "react";

interface InputSetting {
    placeholder?: string,
    maxlength?: number
}

export class TodoInputProps {
    public handleSubmit!: (value: string) => void;
    public inputSetting?: InputSetting = {
        placeholder: '请输入todo',
        maxlength: 20
    }
}
```

再回到`TodoInput`组件中，我们直接用class作为类型传入组件，同时实例化类，作为默认属性：

```typescript
import React, {Component} from 'react';
import {TodoInputProps} from "./TodoInputProps";

// ...

class TodoInput extends Component<TodoInputProps, State> {

    public static defaultProps = new TodoInputProps();
  
    // ...
}
```

用class作为props类型以及生产默认属性有以下好处：

* 代码量少：一次编写，既可以作为类型也可以实例化作为值使用
* 避免错误：分开编写一旦有一方出现书写错误不易察觉

然而虽然我们已经声明了默认属性，但在直接使用的时候，依然显示`inputSetting`可能未定义。

```jsx
class TodoInput extends Component<TodoInputProps, State> {
    // ...

    render() {
        const {inputSetting} = this.props;

        return (
            <form onSubmit={e => this.handleSubmit(e)}>
                {/*在组件上使用*/}
                <input
                    maxLength={inputSetting.maxlength} /*TS2532: Object is possibly 'undefined'.  const inputSetting: InputSetting | undefined*/
                    placeholder={inputSetting.placeholder}
                    onChange={e => this.updateValue(e)}
                    type="text"
                    ref={this.inputRef}
                    value={this.state.itemText}
                    className={"edit"}
                />
                <button></button>
            </form>
        );
    }
}
```

此时最快速的解决办法就是在变量后面加上叹号`!`，它的作用就是告诉编译器这里不是undefined，从而避免报错。

```jsx
class TodoInput extends Component<TodoInputProps, State> {
    // ...

    render() {
        const {inputSetting} = this.props;

        return (
            <form onSubmit={e => this.handleSubmit(e)}>
                {/*在组件上使用*/}
                <input
                    maxLength={inputSetting!.maxlength}
                    placeholder={inputSetting!.placeholder}
                    onChange={e => this.updateValue(e)}
                    type="text"
                    ref={this.inputRef}
                    value={this.state.itemText}
                    className={"edit"}
                />
                <button></button>
            </form>
        );
    }
}
```

当然也可以选择使用三目运算符。

虽然这样可以解决报错问题，但是我们明明已经声明了值，就不应该再做条件判断了，应该有一种方法让编译器自己推导出这里的类型不是undefined，这就需要一些高级类型。
