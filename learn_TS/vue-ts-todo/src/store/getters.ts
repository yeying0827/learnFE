import {State} from "@/store/state";
import {ITodoItem} from "@/store/state";

export const getters = {
    getCurrentTodoList(state: State): ITodoItem[] {
        return state.todoList;
    }
};
