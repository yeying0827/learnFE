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
