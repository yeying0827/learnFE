const targetMap = new WeakMap();
let activeEffect;

/*
* 收集依赖
* */
export function track(target, type, key) {
    console.log(`触发 track -> target: ${target} type: ${type} key: ${key}`);

    let depsMap = targetMap.get(target); // 获取target对象的依赖地图
    if (!depsMap) {
        // 初始化depsMap
        targetMap.set(target, depsMap = new Map());
    }
    let deps = depsMap.get(key); // 获取target对象上key属性的依赖地图
    if (!deps) {
        deps = new Set();
    }
    if (!deps.has(activeEffect) && activeEffect) {
        // 防止重复注册
        deps.add(activeEffect);
    }
    depsMap.set(key, deps);
}

/*
* 执行所有依赖函数
* */
export function trigger(target, type, key) {
    console.log(`触发 trigger -> target: ${target} type: ${type} key: ${key}`);

    const depsMap = targetMap.get(target);
    if (!depsMap) {
        return;
    }
    const deps = depsMap.get(key);
    if (!deps) {
        return;
    }
    deps.forEach((effectFn) => {
        if (effectFn.scheduler) {
            effectFn.scheduler();
        } else {
            effectFn();
        }
    });
}

export function effect(fn, options = {}) {
    const effectFn = () => {
        try {
            activeEffect = effectFn;
            // fn执行时，内部读取响应式数据的时候，就能在对应get函数里读取到activeEffect
            return fn();
        } finally {
            activeEffect = null;
        }
    }
    if (!options.lazy) {
        // 没有配置lazy就直接执行
        effectFn();
    }
    effectFn.scheduler = options.scheduler;

    return effectFn;
}
