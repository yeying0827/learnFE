const { writeFile, copyFileSync } = require('fs');
const path = require('path');
const {Compilation} = require("webpack");

class FileListPlugin {
    constructor(options) {
        // 读取plugin实例化时传入的配置
        this.opts = { ...options };
    }

    apply(compiler) {
        // 在compiler的emit hook中注册一个方法，当webpack执行到该阶段时会调用这个方法
        compiler.hooks.emit.tap('FileListPlugin', (compilation) => {
            // 给生成的Markdown文件创建一个简单的标题
            var filelist = 'In this build:\n\n';

            // 遍历所有编译后的资源，每一个文件添加一行说明
            for(var filename in compilation.assets) {
                filelist += ('- ' + filename + '\n');
            }

            // 将列表作为一个新的文件资源插入到webpack构建结果中
            compilation.emitAsset(/* function (file, source, assetInfo = {}) */
                'filelist.md',
                {
                    source: function () {
                        return filelist;
                    }
                },
                {
                    size: filelist.length
                }
            );

            // copyFileSync(
            //     compilation.assets['filelist.md'].path,
            //     path.resolve(this.opts.path, this.opts.filename + '.md')
            // );

            // writeFile(
            //     path.resolve(this.opts.path, this.opts.filename + '.md'),
            //     filelist,
            //     (err) => {
            //         if (err) throw err;
            //         console.log('The file has been saved!');
            //     }
            // );

            // compilation.assets['filelist.md'] = {
            //     source: function () {
            //         return filelist;
            //     },
            //     size: function () {
            //         return filelist.length;
            //     }
            // }
        });

        compiler.hooks.compilation.tap('FileListPlugin', (compilation) => {
            compilation.hooks.processAssets.tap(
                {
                    name: 'FileListPlugin',
                    stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS, // see below for more stages
                },
                (assets) => {
                    console.log('List of assets and their sizes:');
                    Object.entries(assets).forEach(([pathname, source]) => {
                        console.log(`— ${pathname}: ${source.size()} bytes`);
                    });
                }
            );
        });

        compiler.hooks.assetEmitted.tap(
            'FileListPlugin',
            (file, content) => {
                // 在构建结果输出之后执行，可以获取输出内容的相关信息
                if (file === 'filelist.md') {
                    // 复制备份
                    copyFileSync(
                        path.resolve(__dirname, '../dist', file),
                        path.resolve(this.opts.path, this.opts.filename + '.md')
                    );
                }
            }
        );
    }
}

module.exports = FileListPlugin;
