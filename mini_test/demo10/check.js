const puppeteer = require('puppeteer'),
    BlinkDiff = require('blink-diff');

(async () => {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
  
    // Set screen size
    await page.setViewport({width: 1920, height: 1080});
  
    // Navigate the page to a URL
    await page.goto('http://0.0.0.0:8080');

    // const elm = await page.waitForSelector('h3');
    const elm = await page.$('h3');
    console.log(elm);
    // CdpElementHandle {
	//   handle: CdpJSHandle {},
	//   [Symbol(_isElementHandle)]: true
	// }
    console.log(elm.innerText); // undefined

	const elmText = await page.$eval('h3', h3 => h3.innerText);
	console.log(elmText); // "土"与其他五行的关系

	const canvas = await page.$('canvas');
	await canvas.click();
	// const popupClassList = await page.$eval('.popup-dialog', popup => popup.classList);
	// console.log(popupClassList);
	// await page.waitForTimeout(2000);
	// const postPopupClassList = await page.$eval('.popup-dialog', popup => popup.classList);
	// console.log(postPopupClassList);

	const imgDir = './imgs/';
	await canvas.screenshot({ path: `${imgDir}canvas.png` });


    // 关闭puppeteer
    browser.close();

    const diff = new BlinkDiff({
		imageAPath: imgDir + 'target.png', // 设计图
		imageBPath: imgDir + 'canvas.png',// ⻚⾯截图
		threshold: 0.02, // 1% threshold
		imageOutputPath: imgDir + 'Diff.png'// Diff路径
  	});
  	diff.run(function (error, result) {
        if (error) {
            throw error;
        } else {
            let rel = Math.round((result.differences /
                result.dimension) * 100);
            console.log(result.code);
            console.log(diff.hasPassed(result.code));
            console.log(diff.hasPassed(result.code) ? 'Passed' : 'Failed');
            console.log('总像素:' + result.dimension);
            console.log('发现:' + result.differences + ' 差异，差异占⽐'
                + rel + "%");
        }
    });

    // ...
})()
