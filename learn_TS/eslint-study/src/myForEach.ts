export function myForEach(items: Array<number>, callback: (a: number) => void) {
    for (let i = 0; i < items.length; i ++) {
        callback(items[i])
    }
}
