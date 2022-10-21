import * as ts  from 'typescript';
import { transformers } from "./index";

// 要编译的源码
const source = ts.createSourceFile(
    '',
    'import { Button } from "antd"',
    ts.ScriptTarget.ES2020,
    true
);

// 编译
const result = ts.transform(source, transformers);

const transformedSourceFile = result.transformed[0];
const printer = ts.createPrinter();
const resultCode = printer.printFile(transformedSourceFile);

console.log(resultCode);
