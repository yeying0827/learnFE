import React, {Component} from 'react';
import {TodoInputProps} from "./TodoInputProps";
import {withTodoInput} from "./withTodoInput";

interface Props {
    handleSubmit: (value: string) => void
}

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
        // type RecomposedProps = DP & PropsExcludingDefaults; // Pick<Readonly<Props>, "handleSubmit">
        type RecomposedProps = DP & P;

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

    public static defaultProps = todoInputDefaultProps; // new TodoInputProps();

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

export default TodoInput;

export const HOCInput = withTodoInput<Props1>(TodoInput);
