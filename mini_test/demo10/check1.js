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
	
	// document.querySelector
	// 标签 .class #id
	const elm = await page.waitForSelector('h3'); // await page.$('h3');
	console.log(elm);
	console.log(elm.innerText);
	const elmText = await page.$eval('h3', h3 => h3.innerText);
	console.log(elmText);

	const canvas = await page.$('canvas');
	const imgDir = './imgs/';
	await canvas.screenshot({path: `${imgDir}canvas.png`});
	
	// 模拟点击
	await canvas.click();
	// 获取classList
	// const popupClassList = await page.$eval('.popup-dialog', popup => popup.classList);
	// console.log(popupClassList);
	// await new Promise(r => setTimeout(r, 2000));
	// const postPopupClassList = await page.$eval('.popup-dialog', popup => popup.classList);
	// console.log(postPopupClassList);



	await browser.close();

	const diff = new BlinkDiff({
		imageAPath: imgDir + 'target.png', // ui
		imageBPath: imgDir + 'canvas.png', // 页面截图
		imageOutputPath: imgDir + 'Diff.png', // 差异对比图
		threshold: 0.02
	});
	diff.run(function (error, result) {
		if (error) {
			throw error;
		} else {
			let rel = Math.round((result.differences / result.dimension) * 100);
			console.log(result.code);
			console.log(diff.hasPassed(result.code));
			console.log(diff.hasPassed(result.code) ? 'Passed' : 'Failed');
      		console.log('Found ' + result.differences + ' differences.');
		}
	});


    // ...
})()
