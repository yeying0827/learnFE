// =================start 渐变

let gradientCanvas = document.getElementById('gradientCanvas');
if(gradientCanvas.getContext) {
    let context = gradientCanvas.getContext("2d");

    // 线性渐变
    // let linearGradient = context.createLinearGradient(30, 30, 70, 70);
    let linearGradient = createRectLinearGradient(context, 30, 30, 50, 50);
    linearGradient.addColorStop(0, "white"); // 起点颜色
    linearGradient.addColorStop(1, "black"); // 终点颜色

    let radialGradient = context.createRadialGradient(55, 55, 10, 55, 55, 30);
    radialGradient.addColorStop(0, "white");
    radialGradient.addColorStop(1, "black");

    context.fillStyle = "#ff0000";
    context.fillRect(10, 10,50, 50);
    // 设置全局透明度
    context.globalAlpha = 0.2;
    context.globalCompositeOperation = "destination-out";
    context.fillStyle = radialGradient;
    context.fillRect(30, 30,50, 50);
    context.strokeStyle = linearGradient;
    context.lineWidth = "10";
    // context.strokeRect(30, 30, 50, 50);
    // context.fillRect(50, 50, 50, 50);
    // 重置全局透明度
    // context.globalAlpha = 1;

    // 图案pattern
    let img = document.images[0],
        pattern = context.createPattern(img, "repeat");
    context.translate(200, 200);
    context.fillStyle = pattern;
    context.fillRect(0, 0, 200, 200);

    // 图像数据
    let imageData, data, i, len, average, red, green, blue, alpha;
    imageData = context.getImageData(10, 10, 50, 50);
    data = imageData.data;
    for(i = 0, len = data.length; i < len; i += 4) {
        red = data[i];
        green = data[i+1];
        blue = data[i+2];
        alpha = data[i+3];

        average = Math.floor((red + green + blue) / 3);

        data[i] = average;
        data[i+1] = average;
        data[i+2] = average;
    }
    imageData.data = data;
    context.putImageData(imageData, 10, 10);
}

function createRectLinearGradient(context, x, y, width, height) {
    return context.createLinearGradient(x, y, x+width, y+height);
}