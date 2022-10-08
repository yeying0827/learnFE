/*
* 可辨识联合类型
* */
const r1: 2333= 2333;
const r2: 0b10 = 2;
const r3: 0o114 = 0b1001100;
const r4: 0x514 = 0x514;
const r5: 0x1919n = 6425n;
const r6: 'union' = 'union';
const r7: false = false;
const r8: false = r7;

// const g: 'github' = 'gayhub'; // TS2322: Type '"gayhub"' is not assignable to type '"github"'.

type Wuxing = 'Gold' | 'Wood' | 'Water' | 'Fire' | 'Earth';

function ifMatch(num: number, wuxing: Wuxing) {}

ifMatch(5, 'Water');

type Foo = {
    baz: [number, 'xiaoming'],
    toString(): string,
    readonly [Symbol.iterator]: 'github',
    0x1: 'foo',
    'bar': 12n
};

interface Info {
    username: string
}

interface UserAction {
    id?: number,
    action: 'create' | 'delete',
    info: Info
}

const userAction: UserAction = {
    id: 5,
    action: 'create',
    info: {
        username: 'jack'
    }
};

type NewUserAction  = {
    action: 'create',
    info: Info
} | {
    action: 'delete',
    id: number,
    info: Info
};

const UserReducer = (userAction: NewUserAction) => {
    //TS2339: Property 'id' does not exist on type 'NewUserAction'.
    //    Property 'id' does not exist on type '{ action: "create"; info: Info; }'.
    // console.log(userAction.id);
    // ...
    switch (userAction.action) {
        case "delete":
            console.log(userAction.id);
            break;
        default:
            break;
    }
}
