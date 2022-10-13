## TypeScript与React实战（组件下）

class一处编写能两处复用的方式虽然非常实用，但不得不用一些Hack手段来避免后续的报错，那有没有更优雅、更严谨的解决方案呢？

### 利用高级类型解决默认属性报错

1. 首先需要先声明`defaultProps`的值：

   ```typescript
   const todoInputDefaultProps = {
       inputSetting: {
           placeholder: '请输入Todo1',
           maxlength: 20
       }
   }
   ```

2. 接着定义组件的`props`类型：

   ```typescript
   type Props1 = {
       handleSubmit: (value: string) => void,
       children: React.ReactNode
   } & Partial<typeof todoInputDefaultProps>;
   ```

   `Partial`的作用就是将类型的全部属性变成可选的，`Partial<typeof todoInputDefaultProps>`相当于：

   ```
   {
   	inputSetting?: {
   		placeholder: '请输入Todo1',
       maxlength: 20
   	} | undefined
   }
   ```

3. 此时我们试着使用Props1：

   ```jsx
   class TodoInput extends Component<Props1, State> {
       constructor(props: Props1) {
           super(props);
           this.state = {
               itemText: ''
           }
       }
   
       public static defaultProps = todoInputDefaultProps;
   
       // ...
   
       render() {
           const {inputSetting} = getProps(this.props); // this.props;
   
           return (
               <form onSubmit={e => this.handleSubmit(e)}>
                   {/*在组件上使用*/}
                   <input
                       maxLength={inputSetting.maxlength}
                       placeholder={inputSetting.placeholder}
                       onChange={e => this.updateValue(e)}
                       type="text"
                       ref={this.inputRef}
                       value={this.state.itemText}
                       className={"edit"}
                   />
                   <button type={"submit"}>添加todo</button>
               </form>
           );
       }
   }
   ```

   依旧会看到报错：

   ```
   TS2532: Object is possibly 'undefined'.
   const inputSetting: {placeholder: string, maxlength: number} | undefined
   ```

   这个时候我们就需要一个函数，将`defaultProps`中已经声明值的属性从「可选类型」转化为「非可选类型」。

4. 定义这个函数：

   ```typescript
   const createPropsGetter = <DP extends object>(defaultProps: DP) => {
       return <P extends Partial<DP>>(props: P) => {
           // 基于类型P创建一个类型别名，忽略掉在类型DP中存在的属性
           type PropsExcludingDefaults = Omit<P, keyof DP>; 
           // 使用上述类型别名和类型DP创建交叉类型
           type RecomposedProps = DP & PropsExcludingDefaults; // Pick<Readonly<Props>, "handleSubmit">
   
           return (props as any) as RecomposedProps;
       }
   }
   ```

   说明：

   * 该函数接收一个`defaultProps`对象，`<DP extends object>`这是泛型约束，代表泛型`DP`是个对象，返回一个匿名函数。

   * 返回的匿名函数，有一个泛型`P`，`P`也存在约束`<P extends Partial<DP>>`，代表这个泛型必须包含可选的`DP`类型的属性。（这个P就是传给组件的Props的类型）。

   * 类型别名`PropsExcludingDefaults`的作用，是基于类型P创建一个类型别名，忽略掉在类型DP中存在的属性，即剔除掉`defaultProps`的部分。

     ```typescript
     type Omit<P, keyof DP> /*相当于*/ Pick<P, Exclude<keyof P, keyof DP>>
     ```

   * 类型别名`RecomposedProps`的作用，是将默认属性的类型`DP`与剔除了默认属性的`Props`类型结合在一起。

   整个函数只做了一件事，即把可选的`defaultProps`的类型剔除后，加入必选的`defaultProps`的类型，从而形成一个新的`Props`类型，这个`Props`类型中的`defaultProps`相关属性就变成了必选的（不会是undefined）。

5. 以下是完整代码：

   此时使用`inputSetting.maxlength`就不会报错提示可能为

   ```jsx
   import React, {Component} from 'react';
   
   interface State {
       itemText: string
   }
   
   const todoInputDefaultProps = {
       inputSetting: {
           placeholder: '请输入Todo1',
           maxlength: 20
       }
   }
   
   type Props1 = {
       handleSubmit: (value: string) => void,
       children: React.ReactNode
   } & Partial<typeof todoInputDefaultProps>;
   
   const createPropsGetter = <DP extends object>(defaultProps: DP) => {
       return <P extends Partial<DP>>(props: P) => {
           // 基于类型P创建一个类型别名，忽略掉在类型DP中存在的属性
           type PropsExcludingDefaults = Omit<P, keyof DP>;
           // 使用上述类型别名和类型DP创建交叉类型
           type RecomposedProps = DP & PropsExcludingDefaults; // Pick<Readonly<Props>, "handleSubmit">
   
           return (props as any) as RecomposedProps;
       }
   }
   
   const getProps = createPropsGetter(todoInputDefaultProps);
   
   class TodoInput extends Component<Props1, State> {
       constructor(props: Props1) {
           super(props);
           this.state = {
               itemText: ''
           }
       }
   
       public static defaultProps = todoInputDefaultProps;
   
       private updateValue(e: React.ChangeEvent<HTMLInputElement>) {
           this.setState({
               itemText: e.target.value
           })
       }
   
       private handleSubmit(e: React.FormEvent<HTMLFormElement>) {
           e.preventDefault();
           if (!this.state.itemText.trim()) return;
   
           this.props.handleSubmit(this.state.itemText);
           this.setState({
               itemText: ''
           })
       }
   
       // 创建一个ref
       private inputRef = React.createRef<HTMLInputElement>();
   
       render() {
           const {inputSetting} = getProps(this.props);
   
           return (
               <form onSubmit={e => this.handleSubmit(e)}>
                   {/*在组件上使用*/}
                   <input
                       maxLength={inputSetting.maxlength}
                       placeholder={inputSetting.placeholder}
                       onChange={e => this.updateValue(e)}
                       type="text"
                       ref={this.inputRef}
                       value={this.state.itemText}
                       className={"edit"}
                   />
                   <button type={"submit"}>添加todo</button>
               </form>
           );
       }
   }
   ```

   

### 高阶组件

关于在TypeScript中如何使用HOC

继续使用`TodoInput`组件作为例子：

用一个HOC来包装`TodoInput`，作用就是用高阶组件向`TodoInput`注入`props`。

注：需要安装依赖`hoist-non-react-statics`

```shell
yarn add hoist-non-react-statics
# 需要安装相关库的声明，否则会提示找不到声明文件
yarn add @types/hoist-non-react-statics -D
```

高阶函数如下：

```jsx
// src/components/withTodoInput.tsx
import React, {Component} from "react";
import hoistNonReactStatics from 'hoist-non-react-statics';

const hocProps = {
    inputSetting: {
        maxlength: 30,
        placeholder: '请输入待办事项'
    }
};

type InjectedProps = Partial<typeof hocProps>;

export const withTodoInput = <P extends InjectedProps> (
    UnwrappedComponent: React.ComponentType<P>
) => {
    type Props = Omit<P, keyof InjectedProps>;

    class WithToggleable extends Component<Props> {

        public static readonly UnwrappedComponent = UnwrappedComponent;

        public render() {
            return (
                <UnwrappedComponent
                    inputSetting={hocProps.inputSetting}
                    {...this.props as P}
                />
            )
        }
    }

    return hoistNonReactStatics(WithToggleable, UnwrappedComponent);
}
```

说明：

* P表示传递到HOC组件的props
  * `React.ComponentType<P>`是`React.FunctionComponent<P> | React.ComponentClasst<P>`的类型别名，表示传递到HOC的组件可以是类组件或者函数组件

使用：

```jsx
// src/components/TodoInput.tsx
// ...
import {withTodoInput} from "./withTodoInput";
// ...
export default TodoInput;
export const HOCInput = withTodoInput<Props1>(TodoInput);



// src/App.tsx
// ...
import TodoInput, {HOCInput} from "./components/TodoInput";
// ...
return (
	<div className="App">
    <TodoInput handleSubmit={handleAdd}>

    </TodoInput>
    <HOCInput handleSubmit={handleAdd}>

    </HOCInput>
  </div>
)
```

