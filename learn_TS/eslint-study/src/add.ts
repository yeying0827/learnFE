export function add(item: number, ...rest: number[]): number {
    return rest.reduce((a: number, b: number) => a + b, item);
}
