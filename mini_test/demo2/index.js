document.addEventListener('DOMContentLoaded', async () => {
    // let response = await fetch('./index.wasm');
    // let bytes = await response.arrayBuffer();
    // let {instance} = await WebAssembly.instantiate(bytes);
    let {instance} = await WebAssembly.instantiateStreaming(
        fetch('./index.wasm')
    );
    let {
        increase
    } = instance.exports;
    const span = document.querySelector('span');
    const button = document.querySelector('#increaseButton');
    let count = 0;
    button.addEventListener('click', ()=> {
        count = increase(count);
        span.innerText = count;
    });
});