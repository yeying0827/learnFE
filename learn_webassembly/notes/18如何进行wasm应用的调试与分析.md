## 如何进行wasm应用的调试与分析

针对wasm模块的调试方案与相应的工具链，暂时还没有统一的“事实标准”。

以下是，现阶段所能够使用的一些，针对于独立wasm模块或者说wasm应用的调试方案；总的来说，可以划分为Web与out-of-web两种场景。

### 编译时调试

作为开发wasm应用的一个必不可少的流程，“编译”是一个无论如何也要跨过去的“槛”。

所以先来看看如何调试应用在编译期发生的错误。

#### Emscripten

作为构建可运行于Web浏览器上的wasm应用的首选编译工具之一，为我们提供了众多的调试选项，可以在编译过程中输出详细的调试信息以供排错只用。

##### EMCC_DEBUG

在实际使用emcc（Emscripten提供的编译器）编译项目时，可以通过为编译命令添加“EMCC_DEBUG”环境变量的方式，来让emcc以“调试模式”的方式来编译项目。🌰：

```shell
$ EMCC_DEBUG=1 emcc dip.cc \
> -s WASM=1 \
> -O3 \
> --no-entry \
> -o dip.wasm
tools.filelock:DEBUG: Attempting to acquire lock 4361276864 on /var/folders/21/cq5jb0c11s52x42ydch30dlw0000gn/T/emscripten_temp/emscripten.lock
tools.filelock:DEBUG: Lock 4361276864 acquired on /var/folders/21/cq5jb0c11s52x42ydch30dlw0000gn/T/emscripten_temp/emscripten.lock
emcc:WARNING: invocation: /Users/ying.ye/CodeProjects/emsdk/upstream/emscripten/emcc.py dip.cc -s WASM=1 -O3 --no-entry -o dip.wasm (in /Users/ying.ye/CodeProjects/learnFE/learn_webassembly/demos/src1)
profiler:DEBUG: block "parse arguments" took 0.000 seconds
shared:DEBUG: successfully executed /Users/ying.ye/CodeProjects/emsdk/upstream/bin/clang --version
shared:DEBUG: sanity file up-to-date: /Users/ying.ye/CodeProjects/emsdk/upstream/emscripten/cache/sanity.txt
shared:DEBUG: successfully executed /Users/ying.ye/CodeProjects/emsdk/node/16.20.0_64bit/bin/node --version
shared:DEBUG: successfully executed /Users/ying.ye/CodeProjects/emsdk/upstream/bin/clang -print-targets
shared:INFO: (Emscripten: Running sanity checks)
shared:DEBUG: successfully executed /Users/ying.ye/CodeProjects/emsdk/node/16.20.0_64bit/bin/node -e console.log("hello")
...
```

注：此命令行形式仅适用于Linux/MacOS，对于Windows会有所区别；可以参考[官方文档](https://emscripten.org/docs/index.html)查看相关细节。

命令行中设置的环境变量“EMCC_DEBUG”支持三个值：0、1、2。

“0”表示关闭调试模式，即默认不加该环境变量时的情况；

“1”表示输出编译时的调试性信息，同时生成包含有编译器各个阶段运行信息的中间文件；可用于对整个emcc编译流程的各个步骤进行调试。

在编译时输出的调试性信息中，包含有emcc在实际编译源代码时其各个编译阶段所实际调用的命令行信息（命令 + 参数）。比如在编译阶段调用的clang++、链接阶段调用的wasm-ld、优化阶段调用的node等等。

通过这些输出的详细命令行参数，就能够知道emcc在对源代码的实际编译过程中，使用了哪些编译器参数，以及哪些缺少或错误添加的参数会影响源代码的编译流程。能够在一定程度上辅助开发者找到项目编译失败的“根源”。

```shell
$ ls -al /var/folders/21/cq5jb0c11s52x42ydch30dlw0000gn/T/emscripten_temp      
total 2160
drwxr-xr-x   16 ying.ye  staff     512  8 25 16:02 .
drwx------@ 210 ying.ye  staff    6720  8 25 16:28 ..
-rw-r--r--    1 ying.ye  staff  922952  8 25 16:02 dip_0.o
-rw-r--r--    1 ying.ye  staff    1481  8 25 16:02 emcc-0-base.wasm
-rw-r--r--    1 ying.ye  staff    1192  8 25 16:02 emcc-1-wasm-emscripten-finalize.wasm
-rw-r--r--    1 ying.ye  staff    1192  8 25 16:02 emcc-2-post_finalize.wasm
-rw-r--r--    1 ying.ye  staff     965  8 25 16:02 emcc-3-wasm-opt.wasm
-rw-r--r--    1 ying.ye  staff     965  8 25 16:02 emcc-4-byn.wasm
-rwxr-xr-x    1 ying.ye  staff       0  8 25 16:02 emscripten.lock
-rw-------    1 ying.ye  staff   15031  8 25 16:01 tmp2d4593j6.json
-rw-------    1 ying.ye  staff   15661  8 25 16:01 tmpj93l3rt_.json
-rw-------    1 ying.ye  staff   15031  8 25 16:01 tmpp4wxzfuz.json
-rw-------    1 ying.ye  staff   30069  8 25 16:02 tmpu31ayxvwlibemscripten_js_symbols.so
-rw-------    1 ying.ye  staff   14693  8 25 16:02 tmpuniv3f1r.json
-rw-------    1 ying.ye  staff   43000  8 25 16:01 tmpyfydmmxmlibemscripten_js_symbols.so
-rw-------    1 ying.ye  staff   15175  8 25 16:02 tmpz69kx8ck.json
```

设置为“2”时，emcc会生成更多的包含有中间调试性信息的文件，在这些文件中将包含有与JavaScript优化器相关的编译时信息。

##### -s [DEBUGGER_FLAG=VALUE]

针对特定场景的编译器调试选项。可以让emcc在编译过程中检查某些特定问题。

这些选项都需要以`emcc -s [DEBUGGER_FLAG=VALUE]`的方式，来将其应用到编译命令行中。

比如“ASSERTIONS”选项。该选项可用于启用emcc对常见内存分配错误的运行时断言检查。其值可被设置为“0”、“1“或”2“。”0“表示禁用该选项，”1“和”2“随着数字的逐渐增大，表示所启用相关测试集的增多。

```shell
$ emcc dip.cc \
-s ASSERTIONS=1 -s WASM=1 \
-O3 \
--no-entry \
-o dip.wasm
```

关于这些可以在emcc中使用的调试器选项信息，可以参考[Github](https://github.com/emscripten-core/emscripten/blob/main/src/settings.js)。



### 运行时调试

“运行时调试”意味着我们已经成功地编译了wasm应用，但是却在实际运行时发生了错误。

#### Emscripten

为了能够调试运行在Web浏览器中的wasm应用，需要在使用Emscripten编译应用时，为编译命令指定特殊的“调试参数”，以保留与调试相关的信息；这个参数就是“-g”。

“-g”参数控制了emcc的编译调试等级；整个等级体系被分为0-4五个级别；“-g4”级别会保留最多的调试性信息。

**在“-g4”这个级别下，emcc还会生成可用于在Web浏览器中进行“源码级”调试的特殊DWARF信息**；通过这些特殊格式的信息，可以直接在Web浏览器中对wasm模块编译之前的源代码进行诸如“设置断点”、“单步跟踪”等调试手段。

🌰：使用该参数重新编译DIP Web应用中的C/C++源代码

```shell
$ emcc dip.cc \
> -g4 \
> -s WASM=1 \
> -O3 \
> --no-entry \
> -o dip.wasm
emcc: warning: please replace -g4 with -gsource-map [-Wdeprecated]
cache:INFO: generating system asset: symbol_lists/6342c0efea6eedca52927a4eedca2bbba073b6e2.json... (this will be cached in "/Users/ying.ye/CodeProjects/emsdk/upstream/emscripten/cache/symbol_lists/6342c0efea6eedca52927a4eedca2bbba073b6e2.json" for subsequent builds)
cache:INFO:  - ok
emcc: warning: running limited binaryen optimizations because DWARF info requested (or indirectly required) [-Wlimited-postlink-optimizations]

## 提示替换-g4为-gsource-map
$ emcc dip.cc \
-gsource-map \
-s WASM=1 \
-O3 \
--no-entry \
-o dip.wasm
cache:INFO: generating system asset: symbol_lists/c1490f63b9a4cd30ee63c1cc585a0a69af4def10.json... (this will be cached in "/Users/ying.ye/CodeProjects/emsdk/upstream/emscripten/cache/symbol_lists/c1490f63b9a4cd30ee63c1cc585a0a69af4def10.json" for subsequent builds)
cache:INFO:  - ok
emcc: warning: running limited binaryen optimizations because DWARF info requested (or indirectly required) [-Wlimited-postlink-optimizations]
```

此时重新加载DIP Web应用，打开“开发者面板”，可以通过“操作”C/C++源代码的方式，来为应用所使用的wasm模块设置断点。

通过这种方式，开发者可以方便地在wasm Web应用的实际运行过程中，来调试那些发生在wasm模块内部（C/C++）的“源码级”错误。

但目前这项调试功能还不是十分完善。仅能够设置断点、进行单步跟踪调试、或是查看当前的调用栈信息；比如“查看源代码中的变量值和类型信息”、“跟踪观察变量或表达式的值变化”等更加实用的功能，暂时还无法使用。

对于使用Rust语言编写的wasm模块来说，可以通过类似地为rustc添加“-g”参数的方式，来让编译器将DWARF调试信息加入到生成的wasm模块中；对于直接使用cargo编译的wasm项目来说，调试信息将会自动被默认加入到生成的模块中。

#### wasmtime

为了能够在Web浏览器之外的环境中执行wasm模块中的字节码，需要诸如wasmtime、lucet等各类wasm运行时的支持。

对于原生可执行程序来说，它们的实际执行过程会交由操作系统来统一负责；而对于wasm模块来说，无论是运行在Web平台，还是应用于out-of-web领域中的wasm字节码，它们都需要通过wasm运行时（引擎）来提供字节码的实际执行能力。这就造成了两者在调试过程和方法上的区别。

为了尽量使两者的调试方式保持一致，wasmtime（一个wasm运行时）提供了这样一种能力：**让开发者可以使用诸如LLDB与GDB等专用于原生可执行程序的调试工具**，来直接调试wasm的二进制模块文件；但，为了确保这个特性具有最大的可用性，需要使用最新版的LLDB、GDB以及wasmtime。

在此基础之上，便可通过如下命令行，来在LLDB中调试wasm字节码（假设要调试的wasm模块文件名为“app.wasm”）

```shell
lldb -- wasmtime -g app.wasm
```

现实情况是，如果想要使用这种针对wasm字节码的out-of-web调试方式，开发者需要重新编译整个LLDB或GDB调试工具链，并确保本机的wasmtime已经被更新到最近的版本。其中，前者要花费不少的精力，后者还没有发布正式的版本。因此这种调试方式所能够支持的调试功能仍有着一定的限制。更多信息可以参考此[链接](https://hacks.mozilla.org/2019/09/debugging-webassembly-outside-of-the-browser/)内容



### 其他调试工具

对于其他的wasm相关调试工具，这里主要推荐使用[WABT](https://github.com/WebAssembly/wabt)。内置了众多可以直接对wasm字节码或者WAT可读文本代码进行转换和分析的工具。

还有一些可以针对wasm字节码进行“反编译”的工具；比如wasm-decompiler工具，可以将wasm字节码反向转换为“类C语法格式”的可读代码，其可读性相较于WAT又更近了一步。



### 总结

主要有关wasm应用调试的一些现阶段可用的方案。

对于“编译”阶段，主要介绍了在通过Emscripten构建wasm应用时，可以在编译命令行中使用的一些调试参数。

对于“运行”阶段，可以为编译命令添加“-g”参数。

在out-of-web环境中，wasmtime所提供的支持，使开发者可以直接在诸如LLDB、GDB等传统调试器中调试wasm字节码对应的编译前源代码。

总体来说，现阶段的wasm应用调试，无论在Web平台，还是out-of-web环境中，都没有一个成熟、稳定、可靠的“一站式”调试解决方案。

wasm CG旗下的[WebAssembly Debugging Subgroup](https://github.com/WebAssembly/debugging)正在努力解决这个问题



### 更新（2020-12-11）

Chrome团队推出一款新的Chrome扩展，可以帮助开发者增强浏览器上的wasm应用调试体验。可以做到诸如：查看原始C/C++源代码中变量的值、对C/C++源代码进行单步跟踪、直接跟踪观察某个变量值的变化等等。