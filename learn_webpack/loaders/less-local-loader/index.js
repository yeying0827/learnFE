const less = require('less');
const sass = require('node-sass');

function loader (content, map, meta) {
    const callback = this.async();

    const path = this.resourcePath;
    if (/\.less/.test(path)) {
        // less 的编译调用是异步的
        less.render(content, { sourceMap: {} }, (error, output) => {
            if (error) callback(error); // 抛出异常
            // console.log(output.css);

            // 正常返回
            callback(null, output.css, output.map, meta);
        })
    } else if (/\.scss/.test(path)) {
        var result = sass.renderSync({
            data: content
        });
        callback(null, result.css, null, meta);
    } else {
        callback(null, content, null, meta);
    }
}

loader.pitch = function (remainingRequest, precedingRequest, data) {
    // if (/\.css/.test(remainingRequest) && !/\.scss/.test(remainingRequest)) {
    //     return (
    //         'module.exports = require(' +
    //         JSON.stringify('-!' + remainingRequest) +
    //         ');'
    //     );
    // }
}

module.exports = loader;
