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
