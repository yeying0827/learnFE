import {myForEach} from "./myForEach";

test('should call twice', () => {
    const mockCallback = jest.fn();
    myForEach([0, 1], mockCallback);
    console.log(mockCallback.mock);

    // 此模拟函数被调用了两次
    expect(mockCallback.mock.calls.length).toBe(2);

    // 第一次调用函数时的第一个参数是0
    expect(mockCallback.mock.calls[0][0]).toBe(0);

    // 第二次调用函数时的第一个参数是1
    expect(mockCallback.mock.calls[1][0]).toBe(1);
})
