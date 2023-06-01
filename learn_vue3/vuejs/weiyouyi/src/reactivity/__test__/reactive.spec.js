import { effect } from '../effect';
import {reactive, shallowReactive} from '../reactive';

describe('测试响应式', () => {
    test('reactive基本使用', () => {
        const ret = reactive({ num: 0 });
        let val, val2
        effect(() => {
            val = ret.num;
        });
        effect(()=>{
            val2 = ret.num
        });
        expect(val).toBe(0);
        expect(val2).toBe(0);
        ret.num ++;
        expect(val).toBe(1);
        ret.num = 10;
        expect(val).toBe(10);
    });
    test('shallow使用', () => {
        const ret = shallowReactive({ price: { base: 100, extra: 50 } });
        let val
        effect(() => {
            val = ret.price.extra;
        })
        expect(val).toBe(50);
        ret.price.extra ++;
        expect(ret.price.extra).toBe(51);
        expect(val).toBe(50);
    });
    test('复杂结构测试', () => {
        const ret = reactive({ price: { base: 100, extra: 50 } });
        let val
        effect(() => {
            val = ret.price.extra;
        })
        expect(val).toBe(50);
        ret.price.extra ++;
        expect(ret.price.extra).toBe(51);
        expect(val).toBe(51);
    })
})
