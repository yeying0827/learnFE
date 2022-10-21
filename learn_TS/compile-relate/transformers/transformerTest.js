"use strict";
exports.__esModule = true;
var ts = require("typescript");
var index_1 = require("./index");
// 要编译的源码
var source = ts.createSourceFile('', 'import { Button } from "antd"', ts.ScriptTarget.ES2020, true);
// 编译
var result = ts.transform(source, index_1.transformers);
var transformedSourceFile = result.transformed[0];
var printer = ts.createPrinter();
var resultCode = printer.printFile(transformedSourceFile);
console.log(resultCode);
