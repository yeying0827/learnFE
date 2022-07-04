const {Compilation} = require("webpack");
const fs = require('fs');
const path = require("path");

class FlowPlugin {
    apply(compiler) {
        compiler.hooks.entryOption.tap('FlowPlugin', (context, entry) => {
            // entry配置被webpack处理好之后c触发
            console.log(`entryOption: ${entry}`);
        });

        compiler.hooks.beforeRun.tap('FlowPlugin', (compiler) => {
            // compiler执行之前触发
            // 可以从参数compiler读取到执行前的整个编译器状态
            console.log(`beforeRun: ${compiler.options.plugins}`);
        });

        compiler.hooks.emit.tapAsync('FlowPlugin', (compilation, callback) => {
            // Explore each chunk (build output):
            compilation.chunks.forEach((chunk) => {
                // Explore each module within the chunk (build inputs):
                chunk.getModules().forEach((module) => {
                    // console.log('filepath=======', module.buildInfo.fileDependencies);
                    // Explore each source file path that was included into the module:
                    module.buildInfo &&
                    module.buildInfo.fileDependencies &&
                    module.buildInfo.fileDependencies.forEach((filepath) => {
                        // We've learned a lot about this source structure now...
                        console.log(filepath);
                    })
                });

                // Explore each asset filename generated by the chunk:
                chunk.files.forEach((filename) => {
                    // Get the asset source for each file generated by the chunk:
                    var source = compilation.assets[filename].source();
                    // console.log(filename);
                });
            });

            // console.log('moduleGraph', '\n', compilation.moduleGraph);

            callback();
        });

        compiler.hooks.compilation.tap('FlowPlugin', (compilation) => {
            // 构建需要的compilation对象创建之后，可以从参数compilation读取到该次构建的基础状态
            // 通常compilation的hooks绑定也在该阶段处理
            console.log(`compilation: ${compilation}`);

            compilation.hooks.buildModule.tap('FlowPlugin', (module) => {
                // 一个模块开始构建之前，可以用于修改模块信息
                // 模块代码内容的转换依旧应该loader来处理，plugin着眼于其他信息的调整或获取
                // console.log(`buildModule: ${module}`);
            });

            compilation.hooks.finishModules.tap('FlowPlugin', modules => {
                // 所有模块都被成功构建时执行，可以获取所有模块的相关信息
                // console.log(`finishModules: ${modules}`); // 一个Set
            });

            compilation.hooks.chunkAsset.tap('FlowPlugin', (chunk, filename) => {
                // chunk 对应的一个输出资源添加到compilation时执行，可以获取chunk对应输出内容信息
                // Module 也有 ModuleAsset，但实际使用chunk会更多
                // console.log(chunk, '\n', filename);
            });
        });


        compiler.hooks.thisCompilation.tap('FlowPlugin', (compilation) => {
            compilation.hooks.processAssets.tap(
                {
                    name: 'FlowPlugin',
                    stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE //PROCESS_ASSETS_STAGE_ADDITIONS
                },
                (assets, callback) => {
                    Object.entries(assets).forEach(([pathname, source]) => {
                        console.log(`— ${pathname}: ${source.size()} bytes`);
                    });
                }
            );
        });

        compiler.hooks.make.tap('FlowPlugin', (compilation) => {
            // compilation完成编译后执行，可以从参数查看compilation完成一次编译后的状态
            console.log(`make: ${compilation}`);
        });

        compiler.hooks.shouldEmit.tap('FlowPlugin', (compilation) => {
            // 在输出构建结果前执行，可以通过该hook返回true/false来控制是否输出对应的构建结果
            return true;
            // return false;
        });

        // compiler.hooks.assetEmitted.tap('FlowPlugin', (file, content) => {
        //     // 在构建结果输出之后执行，可以获取输出内容的相关信息
        //     console.log(`assetsEmitted: ${content}`);
        // });
        compiler.hooks.assetEmitted.tap(
            'FlowPlugin',
            (file, content) => {
                // 在构建结果输出之后执行，可以获取输出内容的相关信息
                // console.log(content);
            }
        );

        compiler.hooks.done.tap('FlowPlugin', (stats) => {
            // 完成一次构建后执行，可以输出构建执行结果信息
            // console.log(`done: ${stats}`);
        });

        compiler.hooks.done.tapAsync('FlowPlugin', (stats, callback) => {
            // 使用callback来返回结果
            fs.writeFile(
                path.resolve(__dirname, '../backup', 'stats.txt'),
                stats.toString(),
                (err) => callback(err)
            );
        });

        compiler.hooks.failed.tap('FlowPlugin', (error) => {
            // 构建失败时执行，用于获取异常进行处理
            console.log(`failed: ${error}`);
        });
    }
}

module.exports = FlowPlugin;
