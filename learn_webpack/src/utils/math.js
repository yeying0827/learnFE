export function square(x) {
    return x * x;
}

export function cube(x) {
    return x* x * x;
}

document.querySelector('.container').style.color = `#${square(3)}00`;
