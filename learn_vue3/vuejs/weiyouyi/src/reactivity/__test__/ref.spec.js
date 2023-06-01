import {effect} from "../effect.js";
import {ref} from "../ref.js";

describe('测试响应式', () => {
    test('ref基本使用', () => {
        const ret = ref({ num: 0 });
        let val
        effect(() => {
            val = ret.value.num;
        });
        expect(val).toBe(0);
        ret.value.num ++;
        expect(val).toBe(1);
        ret.value.num = 10;
        expect(val).toBe(10);
    });
})
