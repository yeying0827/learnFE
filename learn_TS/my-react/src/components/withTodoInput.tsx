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
    // 基于类型P创建一个类型别名，忽略掉在类型InjectedProps中存在的属性
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
