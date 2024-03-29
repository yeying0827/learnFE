import React from "react";

interface IProps {
    /**
     * logo的地址
     */
    logo?: string,
    /*
    * logo的样式类
    * */
    className?: string,
    alt?: string
}

export const Logo: React.FC<IProps> = props => {
    const { className, alt, logo } = props;

    return (
        <img src={logo} className={className} alt={alt} />
    );
}

const toArray = <T extends {}>(element: T) => [element];
