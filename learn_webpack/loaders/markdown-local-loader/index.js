const marked = require('marked');
const loaderUtils = require('loader-utils');
// 引入校验方法
const validateOptions = require('schema-utils');

// 声明配置项的字段类型
const schema = {
    type: 'object',
    properties: {
        test: {
            type: 'string'
        }
    }
}

module.exports = function (markdown) {
    // 使用 loaderUtils 来获取loader的配置项
    // this 是构建运行时的一些上下文信息
    const options = loaderUtils.getOptions(this);
    console.log(options);

    // 执行校验，可以在构建过程中发现配置项错误
    validateOptions(schema, options, { name: 'Example Mardown Loader' });

    this.cacheable();

    // 把配置项直接传递给marked
    marked.setOptions(options);

    // 使用`marked.marked`处理 markdown 字符串，然后以JS Module的方式导出，返回最终的JS代码
    return `export default\`${marked.marked(markdown)}\`;`;
}
