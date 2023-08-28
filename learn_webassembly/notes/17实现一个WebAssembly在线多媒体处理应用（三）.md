## 实现一个WebAssembly在线多媒体处理应用（三）

完成整个应用的另外一个核心部分，同时也是整个实践的主角：WASM版本的滤镜

### 编写C/C++函数源码

首先准备由C/C++等高级语言编写的源代码。这部分代码的主要逻辑，与JavaScript版本滤镜函数的实现逻辑基本相同。代码如下：

```c++
// src1/dip.cc
// 引入必要的头文件
#include <emscripten.h>
#include <cmath>
// 宏常量定义，表示卷积核矩阵的高和宽
#define KH 3
#define KW 3
// 声明两个数组，分别用于存放卷积核数据与每一帧对应的像素点数据
char kernel[KH][KW];
unsigned char data[921600];
// 将被导出的函数，放置在 `extern "C"`中防止 Name Mangling
extern "C" {
    // 获取卷积核数组的首地址
    EMSCRIPTEN_KEEPALIVE auto* cppGetKernelPtr() { return kernel; }
    // 获取帧像素数组的首地址
    EMSCRIPTEN_KEEPALIVE auto* cppGetDataPtr() { return data; }
    // 滤镜函数
    EMSCRIPTEN_KEEPALIVE void cppConvFilter(
        int width,
        int height,
        int divisor
    ) {
        const int half = std::floor(KH / 2);
        for (int y = half; y < height - half; y ++) {
            for (int x = half; x < width -half; x ++) {
                int px = (y * width + x) * 4;
                int r = 0, g = 0, b = 0;
                for (int cy = 0; cy < KH; cy ++) {
                    for (int cx = 0; cx < KW; cx ++) {
                        const int cpx = ((y + (cy - half)) * width + (x + (cx - half))) * 4;
                        r += data[cpx + 0] * kernel[cy][cx];
                        g += data[cpx + 1] * kernel[cy][cx];
                        b += data[cpx + 2] * kernel[cy][cx];
                    }
                }
                data[px + 0] = ((r / divisor) > 255) ? 255 : ((r / divisor) < 0) ? 0 : r / divisor;
                data[px + 1] = ((g / divisor) > 255) ? 255 : ((g / divisor) < 0) ? 0 : g / divisor;
                data[px + 2] = ((b / divisor) > 255) ? 255 : ((b / divisor) < 0) ? 0 : b / divisor;
            }
        }
    }
}
```

上述代码中，将定义的所有函数均以”cpp“作为其命名前缀，表明这个函数的实际定义来自于对应的C/C++代码实现。”cppConvFilter“函数为主要的滤镜计算函数。

代码开头，首先以”#include“的方式，包含了需要使用到的C/C++头文件。其中”emscripten.h”头文件便由Emscripten工具链提供，其中包含着众多与wasm编译相关的宏和函数定义；“cmath”头文件，是原始C标准库中的“math.h”头文件在C++中的对应，本例中将使用该头文件中提供的`std::floor`函数，去参与滤镜的计算过程。

接下来，使用“#define”定义两个宏常量“KH”与“KW”，分别表示卷积核的高和宽；并使用这两个常量，来定义用来存放实际卷积核矩阵数据的二维数组“kernel”。

定义用来存放每一帧对应像素数据的一维数组“data”。

> 注意：由于在C/C++中，无法声明全局的动态大小数组，因此需要提前计算出，由Web API “CanvasRenderingContext2D.getImageData”所返回的、存放有每一帧对应像素数据的那个Uint8ClampedArray数组，在C/C++中对应到的unsigned char类型数组的大小。
>
> 由于这两个数组所存储的单个元素其类型完全相同，因此可以直接使用这个得到的Uint8ClampedArray数组的大小，来作为对应C/C++中“data”数组的大小。经过实践，得到的数组大小为“921600”。

`cppGetKernelPtr`和`cppGetDataPtr`函数，主要用来获取先前声明的数组kernel与data的首地址；这样便可以在外部的JavaScript环境中，向定义在C/C++中的这两个数组结构填充实际的运行时数据了。



### 使用Emscripten进行编译

这次不需要生成JavaScript胶水文件以及HTML文件，需要的仅是一个根据C/C++代码生成的wasm二进制模块文件；其他部分，将基于之前已经构建好的JavaScript和HTML代码来进行开发。

仅生成wasm模块文件的方式，通常被称为“standalone模式“。对应的编译命令如下：

```shell
$ emcc dip.cc -s WASM=1 -O3 --no-entry -o dip.wasm
cache:INFO: generating system asset: symbol_lists/518ae4ab830c531b40e151614386d72bd17ff849.json... (this will be cached in "/Users/ying.ye/CodeProjects/emsdk/upstream/emscripten/cache/symbol_lists/518ae4ab830c531b40e151614386d72bd17ff849.json" for subsequent builds)
cache:INFO:  - ok
```

首先，”-o“参数所指定的输出文件格式为”.wasm"，这样就是告诉Emscripten我们希望以“standalone”的方式来编译输入的C/C++源码。

然后，”--no-entry“参数告诉编译器，该wasm模块没有声明”main“函数，因此不需要与CRT（C Runtime Library）相关的功能进行交互。

上述命令执行完毕后，将会生成一个名为”dip.wam“的二进制模块文件。



### 整合上下文资源

至此，便可以将这个通过Emscripten编译得到的名为”dip.wasm“的wasm模块文件，整合到JavaScript代码中。

此处，我们使用”WebAssembly.instantiate”的方式来加载这个模块文件。对应代码如下所示：

```javascript
let response = await fetch('./dip.wasm');
let bytes = await response.arrayBuffer();
let { instance, module } = await WebAssembly.instantiate(bytes);
let {
    cppConvFilter,
    cppGetKernelPtr,
    cppGetDataPtr,
    memory
} = instance.exports;
```

通过`fetch`方法返回的Response对象，其上的arrayBuffer()函数，会将请求返回的内容解析为对应的ArrayBuffer形式；这个ArrayBuffer，将作为WebAssembly.instantiate方法的实际调用参数。

在WebAssembly.instantiate方法调用完毕后，会得到对应的WebAssembly.Instance实例对象和WebAssembly.Module模块对象（即上述代码中的instance和module）。

在instance变量中，便可以获得从wasm模块导出的所有方法。

除了从instance.exports对象中导出了定义在wasm模块内的函数以外，上述代码还导出了一个名为memory的对象；这个memory对象代表着模块实例所使用到的线性内存段。线性内存段在JavaScript中的表示形式，就是一个ArrayBuffer对象。

这里memory实际上是一个名为WebAssembly.Memory的包装类对象，而该对象上的“buffer”属性中，便实际存放着对应模块线性内存的ArrayBuffer对象。

以下，我们通过调用相应的方法，来完成wasm滤镜函数与Web应用的整合。

* 首先，将在JavaScript代码中获得的卷积核矩阵，以及每一帧所对应的画面像素数据，填充到之前在C/C++代码中定义的相应数组中。

  调用从模块实例中导出的`cppGetDataPtr`和`cppGetKernelPtr`两个方法，来分别获得这两个数组的首地址，也就是在模块实例线性内存段中的具体偏移位置。

* 然后，使用“Uint8Array”与“Int8Array”这两个TypedArray类型来作为模块线性内存的操作视图，并向其中写入数据。

* 待数据填充完毕后，便可以调用从模块中导出的`cppConvFilter`方法，来为原始的像素数据添加滤镜。

* `cppConvFilter`方法调用完毕后，通过TypedArray的subarray方法，来返回一个包含有已处理完毕像素数据的新的TypedArray，这些数据将会通过名为“CanvasRenderingContext2D.putImageData”的API被绘制在`<canvas>`对象上，以实现画面的更新。

以上部分功能对应的代码如下所示：

```javascript
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

// ...

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
```

> 注意：在JavaScript中使用的卷积核矩阵数组，实际上是以二维数组的形式存在的；为了能够方便地将这部分数据填充到wasm线性内存中，此处将其扁平化为一维数组，并存放到变量flatKernel中。

最后将交互部分逻辑补充完整（draw方法），至此，这个wasm Web应用就完成了。



### 性能对比

选择最为常见的两款浏览器来测量对比，此DIP Web应用在JavaScript滤镜和wasm滤镜这两个选项下的视频播放帧率。

可以看到，同样逻辑的滤镜函数，在对应的JavaScript实现版本和wasm实现版本下有着极大的性能差异。

但也要考虑，应用的实际表现是一个综合性的结果，与浏览器版本、代码实现细节、编译器版本甚至操作系统版本都有着密切的关系。

由于`getImageData`函数在应用实际运行时也会占用一部分时间，因此使得在每一帧画面的刷新和滤镜渲染过程中，整个wasm滤镜处理过程的耗时只能被优化到对应JavaScript版本的一半时间左右；另外，wasm实现下通过Uint8View.set向wasm实例线性内存段中填充像素数据的过程也同样会占用一定的额外耗时，但这部分的比例相对很小。



### 总结

如何使用Emscripten来直接编译输入的C/C++代码到一个完整的、可以直接运行的Web应用；或是基于“standalone”模式来仅仅输出源代码对应的wasm二进制模块文件。

Emscripten在被作为工具链使用时，提供了诸如EMSCRIPTEN_KEEPALIVE等宏函数，以支持编译过程的正常进行；提供了极其强大的宏函数支持以及对Web API的无缝整合。

开发者可以直接将基于OpenGL编写的C/C++应用编译成wasm Web应用，而无需做任何源代码上的修改；Emscripten会通过相应的JavaScript胶水代码来处理好OpenGL与WebGL的调用映射关系，真正做到“无痛迁移”。

如何通过Web API与JavaScript API来加载并实例化一个wasm模块对象。

如何通过TypedArray向wasm模块实例的线性内存段中填充数据（set），以及如何从中读取数据（subarray）。



### 扩展（评论区）

**依赖第三方库的情况怎么处理？**比如`#include <openssl/md5.h>`

可以自己写一个 CMakeLists.txt 来让编译器自动查找头文件的所在位置，比如用 include_directories 指令来指定头文件的查找位置。具体可以参考 CMake 的官方文档，或者找找相关的文章。或者如果使用 Clang 也可以看下 Clang 的 -I 参数。

**多个cc文件怎么编译？**

多个文件也可以直接都列在 emcc 后面，或者通过 CMakeFile 来组织项目的构建依赖关系，然后再使用 Emscripten 的 emconfigure/emmake 来构建项目也是可以的。具体可以参考：https://emscripten.org/docs/compiling/Building-Projects.html