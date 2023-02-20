export const focus = {
    install(app) {
        app.directive('focus', {
            mounted(el) {
                el.focus();
            }
        })
    }
}

export const lazyPlugin = {
    install(app, options) {
        app.directives('lazy', {
            mounted(el, binding, vnode) {
            },
            updated(el, binding) {},
            unmount(el) {}
        })
    }
}
