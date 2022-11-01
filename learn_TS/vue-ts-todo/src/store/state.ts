export enum Mode {
    edit, // 处于编辑状态
    finish // 处于编辑完成状态
}

export interface ITodoItem {
    id: string // todo任务的id
    name: string // todo任务的名称
    isDone: boolean // 任务是否完成
    iconName: string // 任务的图标
    color: string // 任务图标底色
    mode: Mode // 编辑状态
}

export interface State {
    todoList: Array<ITodoItem>
}

export const state: State = {
    todoList: []
}
