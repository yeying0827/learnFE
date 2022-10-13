## TypeScript与React实战（Redux）

结合Redux，继续以Todo应用为例。

### 定义Models

数据模型使用简单的接口定义：

```typescript
// src/redux/models/Todo.ts
export interface Todo {
  	id: number,
    name: string,
    done: boolean
}
```



### Action部分

#### 1. 定义`constants`

```typescript
// src/redux/constants/Todo.ts
export enum ActionTodoConstants {
    ADD_TODO = 'todo/add',
    TOGGLE_TODO = 'todo/toggle'
}
```

#### 2. 定义actions

```typescript
// src/redux/actions/Todo.ts
import {ActionTodoConstants} from "../constants/Todo";

let id = 0;

const addTodo = (name: string) => ({
    payload: {
        todo: {
            done: false,
            id: id++,
            name
        }
    },
    type: ActionTodoConstants.ADD_TODO
})

const toggleTodo = (id: number) => ({
    payload: {
        id
    },
    type: ActionTodoConstants.TOGGLE_TODO
})

export type AddTodoAction = ReturnType<typeof addTodo>;

export type ToggleTodoAction = ReturnType<typeof toggleTodo>;

export type TodoAction = AddTodoAction | ToggleTodoAction;
```

由于在reducer中需要用到函数返回的Action类型，所以得获取每个action函数的返回类型，此处可以使用一个技巧，就是利用TypeScript的类型推导来反推出类型。即：

```typescript
export type AddTodoAction = ReturnType<typeof addTodo>;
```

此时将鼠标悬浮在addTodo和AddTodoAction变量上，可以分别看到以下提示：

```
function addTodo(     name: string): {payload: {todo: {name: string, id: number, done: boolean}}, type: ActionTodoConstants}
```

```
export type AddTodoAction
Alias for:
ReturnType<typeof addTodo>
Initial type:
{payload: {todo: {name: string, id: number, done: boolean}}, type: ActionTodoConstants}
```



### Reducer部分

定义reducer，给对应的参数和初始state加上类型：

```typescript
// src/redux/reducers/Todo.ts
import {Todo} from "../models/Todo";
import {TodoAction} from "../acitons/Todo";
import {ActionTodoConstants} from "../constants/Todo";

export interface State {
    todos: Todo[]
}

export const initialState: State = {
    todos: []
}

export function reducer(state: State = initialState, action: TodoAction) {
    switch (action.type) {
        case ActionTodoConstants.ADD_TODO: {
            const todo = action.payload;

            return {
                ...state,
                todos: [...state.todos, todo]
            }
        }
        case ActionTodoConstants.TOGGLE_TODO: {
            const { id } = action.payload;

            return {
                ...state,
                todos: state.todos.map(todo => todo.id === id? { ...todo, done: !todo.done }: todo)
            }
        }
        default:
            return state;
    }
}
```

此时在case ADD_TOGGLE的id变量会出现报错提示：

```
TS2339: Property 'id' does not exist on type '{ todo: { done: boolean; id: number; name: string; }; } | { id: number; }'.
```

因为`TodoAction`是两个函数返回类型的联合类型，但在type为`TOGGLE_TODO`时不应该出现`todo: {...}`，这是因为错误运用了类型推导所致。

我们可以看到`type AddTodoAction`所推导的类型的type，只推导到了`ActionTodoConstants`，而我们定义的类型是具体的`ActionTodoConstants.ADD_TODO`，所以没法推导出对应的payload。此时我们可以利用可辨识联合类型（Discriminated Unions）。

「可辨识联合类型」与普通的「联合类型」最大的不同之处在于其必须有一个「单例类型」；「单例类型」多数是指枚举成员类型和数字/字符串字面量类型。

我们想推导出正确的类型靠的就是这个单一的「字符串字面量类型」，此时可以有以下几种修改：

1. 修改action函数返回的Action类型，使用类型断言使TS可以精确推导类型

   ```typescript
   const addTodo = (name: string) => ({
       payload: {
           todo: {
               done: false,
               id: id++,
               name
           }
       },
       type: ActionTodoConstants.ADD_TODO as ActionTodoConstants.ADD_TODO
   })
   ```

   此时再查看addTodo的提示就可以看到：

   ```
   function addTodo(     name: string): {payload: {todo: {name: string, id: number, done: boolean}}, type: ActionTodoConstants.ADD_TODO}
   
   export type AddTodoAction
   Alias for:
   ReturnType<typeof addTodo>
   Initial type:
   {payload: {todo: {name: string, id: number, done: boolean}}, type: ActionTodoConstants.ADD_TODO}
   ```

   看到TypeScript已经可以精确推导到`ActionTodoConstants.ADD_TODO`，而不是只推导到`ActionTodoConstants`

2. 不使用函数返回类型，手动用interface定义类型

   ```typescript
   export interface AddTodoAction {
       type: ActionTodoConstants.ADD_TODO,
       payload: {
           todo: Todo
       }
   }
   ```

   