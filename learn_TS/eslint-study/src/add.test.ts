import {add} from "./add";

test('two plus two is four', () => {
    expect(add(2, 2)).toBe(4);
})

test('two plus two is not six', () => {
    expect(add(2, 2)).not.toBe(6);
})
