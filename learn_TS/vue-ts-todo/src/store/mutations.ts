import {MutationTree} from "vuex";
import {ITodoItem, State} from "@/store/state";
import {_} from "@/utils";

export const mutations: MutationTree<State> = {
    // 创建todo
    createTodoItem(state: State, item: ITodoItem) {
        state.todoList.push(item);
    },
    // 选择图标背景色
    selectColor(state: State, payload: { id: string, color: string }) {
        const list = state.todoList;
        const todo = _.find(list, payload.id);

        if (todo) {
            todo.color = payload.color;
        }
    },
    // 选择图标
    selectIcon(state: State, payload: { id: string, icon: string }) {
        const list = state.todoList;
        const todo = _.find(list, payload.id);

        if (todo) {
            todo.iconName = payload.icon;
        }
    },
    // 编辑任务名称
    changeName(state: State, payload: { id: string, value: string }) {
        const list = state.todoList;
        const todo = _.find(list, payload.id);

        if (todo) {
            todo.name = payload.value;
        }
    },
    // 删除任务
    deleteTodoItem(state: State, id: string) {
        const list: ITodoItem[] = state.todoList;
        state.todoList = list.filter(item => item.id !== id);
    },
    // 标记任务完成
    doneTodoItem(state: State, id: string) {
        const list: ITodoItem[] = state.todoList;
        const todo = _.find(list, id);

        if (todo) {
            todo.isDone = true;
        }
    }
}
