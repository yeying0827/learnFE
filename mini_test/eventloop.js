(async function main() {
  console.log(1);

  setTimeout(() => {
    console.log(2);
  }, 0); // 宏任务1

  setTimeout(() => {
    console.log(3);
  }, 100); // 宏任务2

  let p1 = new Promise((resolve, reject) => {
    console.log(4);

    resolve(5);
    console.log(6);
  });

  p1.then((res) => {
    console.log(res);
  }); // 微任务1

  let result = await Promise.resolve(7);
  console.log(result);

  console.log(8); // 微任务2
})()
// 1
// 4
// 6
// 5
// 7
// 8
// 2
// 3