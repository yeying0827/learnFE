import $ from 'jquery';

$(function () {
    $.ajax()
})

declare function jq(selector: string): any;
declare namespace jq {
    function ajax(url: string, settings?: any): void;
}

jq('#foo');
jq.ajax('url', {});

function foo(a: number, b: string): string {
    return a + b;
}
let a = foo.apply(undefined, [10]);
