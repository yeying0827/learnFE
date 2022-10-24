// export const a = 1;
// export type Person = {
//     name: string
// };

const a = 1;
type Person = {
    name: string
}

export { a as b, Person };

export default () => 'function'

namespace Letter {
    let a = 1;
    let b = 2;
    let c = 3;
    let z = 26;
}

// namespace Letter {
//     export let a = 1;
//     export let b = 2;
//     export let c = 3;
//     export let z = 26;
// }

module Drinks1 {
    export class Cola {}
}
module Drinks1 {
    export class Sprite {}
}
namespace Drinks2 {
    export class Cola {}
}
namespace Drinks2 {
    export class Sprite {}
}
export class Cola {}
