import {ActionTodoConstants} from "../constants/Todo";
import {Todo} from "../models/Todo";

let id = 0;

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

const toggleTodo = (id: number) => ({
    payload: {
        id
    },
    type: ActionTodoConstants.TOGGLE_TODO as ActionTodoConstants.TOGGLE_TODO
})


// export type AddTodoAction = ReturnType<typeof addTodo>;
export interface AddTodoAction {
    type: ActionTodoConstants.ADD_TODO,
    payload: {
        todo: Todo
    }
}

export type ToggleTodoAction = ReturnType<typeof toggleTodo>;

export type TodoAction = AddTodoAction | ToggleTodoAction;
