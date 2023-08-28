document.addEventListener('DOMContentLoaded', async () => {
    // let response = await fetch('./dip.wasm');
    // let bytes = await response.arrayBuffer();
    // let { instance, module } = await WebAssembly.instantiate(bytes);
    let { instance } = await WebAssembly.instantiateStreaming(
        fetch("./dip.wasm")
    );
    let {
        cppConvFilter,
        cppGetKernelPtr,
        cppGetDataPtr,
        memory
    } = instance.exports;

    // 获取相关的HTML元素
    let video = document.querySelector('.video');
    let canvas = document.querySelector('.canvas');
    let fpsNum = document.querySelector('.fps-num');

    // 使用getContext方法获取<canvas>标签对应的一个CanvasRenderingContext2D接口（即2D绘图上下文）
    let context = canvas.getContext('2d');

    // 自动播放<video>载入的视频
    let promise = video.play();
    if (promise !== undefined) {
        promise.catch(err => {
            console.error("The video can not autoplay!");
        });
    }

    const KERNELS = [
        [
            [-1, -1, 1],
            [-1, 14, -1],
            [1, -1, -1]
        ],
        [
            [50, -1, 2],
            [-1, 2, -1],
            [2, -1, 50]
        ]
    ];
    /**
     * 矩阵翻转函数
     * @param {*} kernel
     * @returns
     */
    function flipKernel(kernel) {
        const h = kernel.length;
        const half = Math.floor(h / 2);
        // 按中心对称的方式将矩阵中的数字上下、左右进行互换
        for(let i = 0; i < half; i ++) {
            for(let j = 0; j < h; j ++) {
                // "卷积核"矩阵
                let _t = kernel[i][j];
                kernel[i][j] = kernel[h - i - 1][h - j - 1];
                kernel[h - i - 1][h - j - 1] = _t;
            }
        }
        // 处理矩阵行数为奇数的情况
        if (h & 1) {
            // 将中间行左右两侧对称位置的数进行互换
            for (let j = 0; j < half; j ++) {
                let _t = kernel[half][j];
                kernel[half][j] = kernel[half][h - j - 1];
                kernel[half][h - j - 1] = _t;
            }
        }
        return kernel;
    }
    // 得到经过翻转180度后的卷积核矩阵
    const kernel = flipKernel(KERNELS[0]);

    // 获取C/C++中存有卷积核矩阵和帧像素数据的数组 在WASM线性内存段中的偏移位置
    const dataOffset = cppGetDataPtr();
    const kernelOffset = cppGetKernelPtr();
    // 扁平化卷积核的二维数组到一维数组，以方便数据的填充
    const flatKernel = kernel.reduce((acc, cur) => acc.concat(cur), []);
    // 为WASM模块的线性内存段设置两个用于进行数据操作的视图，分别对应卷积核矩阵和帧像素数据
    let Uint8View = new Uint8Array(memory.buffer);
    let Int8View = new Int8Array(memory.buffer);
    // 填充卷积核矩阵数据
    Int8View.set(flatKernel, kernelOffset);

    let clientX, clientY; // 保存canvas的宽高

    const vector = []; // 无滤镜的帧时延数组
    const jsVector = []; // js滤镜的帧时延数组
    const wasmVector = []; // wasm路径的延时数组
    // 定制绘图函数
    function draw() {
        const start = performance.now(); // 开始计时
        // 调用drawImage 函数绘制图像到<canvas>
        context.drawImage(video, 0, 0);
        // 获得<canvas>上当前帧对应画面的像素数组
        pixels = context.getImageData(0, 0, video.videoWidth, video.videoHeight);
        // ...
        // 根据滤镜状态处理像素数组数据
        switch(globalStatus) {
            case "JS":
                pixels.data.set(jsConvFilter(pixels, clientX, clientY, kernel));
                break;
            case "WASM":
                pixels.data.set(filterWASM(pixels, clientX, clientY));
                break;
        }
        // 将处理后的帧画面数据输出到canvas
        context.putImageData(pixels, 0, 0);

        let timeUsed = performance.now() - start; // 得到帧时延
        // 更新页面上展示的帧率
        switch(globalStatus) {
            case "JS":
                jsVector.push(timeUsed);
                fpsNum.innerText = calcFPS(jsVector);
                break;
            case "WASM":
                wasmVector.push(timeUsed);
                fpsNum.innerText = calcFPS(wasmVector);
                break;
            default:
                vector.push(timeUsed);
                fpsNum.innerText = calcFPS(vector);
        }

        // 更新下一帧画面
        requestAnimationFrame(draw);
    }

    // <video>视频资源加载完毕后执行
    video.addEventListener("loadeddata", () => {
        // 根据<video>载入视频大小调整对应的<canvas>尺寸
        canvas.setAttribute('height', video.videoHeight);
        canvas.setAttribute('width', video.videoWidth);

        clientX = canvas.clientWidth;
        clientY = canvas.clientHeight;
        // 绘制函数入口
        draw();
    });

    // 全局状态
    const STATUS = ['STOP', 'JS', 'WASM'];
    // 当前状态
    let globalStatus = 'STOP';
    // 监听用户点击事件
    document.querySelector("button").addEventListener('click', () => {
        globalStatus = STATUS[
            Number(
                document.querySelector("input[name='options']:checked").value
            )
        ];
    });

    /**
     * 计算帧率
     * @param {*} vector
     * @returns
     */
    function calcFPS (vector) {
        // 提取容器中的前20个元素来计算平均值
        const AVERAGE_RECORDS_COUNT = 20;
        if (vector.length > AVERAGE_RECORDS_COUNT) {
            vector.shift(-1); // 维护容器大小
        } else {
            return 'NaN';
        }
        // 计算平均每帧在绘制过程中所消耗的时间
        let averageTime = (vector.reduce((pre, item) => {
            return pre + item;
        }, 0) / Math.abs(AVERAGE_RECORDS_COUNT));
        // 估算出1s内能够绘制的帧数
        return (1000 / averageTime).toFixed(2);
    }

    /**
     * js版滤镜
     * @param {*} data 帧画面的像素数组数据
     * @param {*} width 帧画面的宽
     * @param {*} height 帧画面的高
     * @param {*} kernel 所应用滤镜对应的“卷积核”矩阵数组
     * @returns
     */
    function jsConvFilter(data, width, height, kernel) {
        const divisor = 4; // 分量调节参数；
        const h = kernel.length, w = h; // 保存卷积核数组的宽和高
        const half = Math.floor(h / 2);
        // 根据卷积核的大小来忽略对边缘像素的处理
        for (let y = half; y < height - half; y ++) {
            for (let x = half; x < width - half; x ++) {
                // 每个像素点在像素分量数组中的起始位置
                const px = (y * width + x) * 4;
                let r = 0, g = 0, b = 0;
                // 与卷积核矩阵数组进行运算
                for (let cy = 0; cy < h; cy ++) {
                    for (let cx = 0; cx < w; cx ++) {
                        // 获取卷积核矩阵所覆盖位置的每一个像素的起始偏移位置
                        const cpx = ((y + (cy - half))* width + (x + (cx - half))) * 4;
                        // 对卷积核中心像素点的RGB各分量进行卷积计算（累加）
                        r += data[cpx + 0] * kernel[cy][cx];
                        g += data[cpx + 1] * kernel[cy][cx];
                        b += data[cpx + 2] * kernel[cy][cx];
                    }
                }
                // 处理RGB三个分量的卷积结果
                data[px + 0] = ((r / divisor) > 255) ? 255 : ((r / divisor) < 0) ? 0 : r / divisor;
                data[px + 1] = ((g / divisor) > 255) ? 255 : ((g / divisor) < 0) ? 0 : g / divisor;
                data[px + 2] = ((b / divisor) > 255) ? 255 : ((b / divisor) < 0) ? 0 : b / divisor;
            }
        }
        return data;
    }

    /**
     * 封装的WASM滤镜处理函数
     * @param {*} pixelData
     * @param {*} width
     * @param {*} height
     */
    function filterWASM(pixelData, width, height) {
        const arLen = pixelData.length;
        // 填充当前帧画面的像素数据
        Uint8View.set(pixelData, dataOffset);
        // 调用滤镜处理函数
        cppConvFilter(width, height, 4);
        // 返回经过处理的数据
        return Uint8View.subarray(dataOffset, dataOffset + arLen);
    }
});
