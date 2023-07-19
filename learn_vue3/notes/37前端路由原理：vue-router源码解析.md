## 前端路由原理：vue-router源码剖析

之前实现的迷你router，通过监听路由的变化，把路由数据包裹成响应式对象后，一旦路由发生变化，我们就去定义好的路由数据中查询当前路由对应的组件，在router-view中渲染即可。

### vue-router入口分析

vue-router提供了createRouter方法来创建路由配置，我们传入每个路由地址对应的组件后，使用app.use在Vue中加载vue-router插件，并且给Vue注册了两个内置组件，router-view负责渲染当前路由匹配的组件，router-link负责页面的跳转。

#### createRouter

先来看createRouter的实现。完整的代码可以在[Github](https://github.com/vuejs/router/blob/main/packages/router/src/router.ts#L353)上看到。这个函数比较长，我们可以先借助TypeScript查看createRouter的参数。

在下面的代码中，参数RouterOptions是规范我们配置路由的对象，主要包含history、routes等数据。

* routes就是我们需要配置的路由对象，类型是RouteRecordRaw组成的数组，RouteRecordRaw类型是三个类型的合并。
* 返回值的类型Router就是包含了addRoute、push、beforeEnter、install等方法的一个对象，并且维护了currentRoute和options两个属性。

```typescript
// router/packages/router/src/router.ts
// createRouter接收的参数的类型
export interface RouterOptions extends PathParserOptions {
  /**
   * ...
   */
  history: RouterHistory
  /**
   * Initial list of routes that should be added to the router.
   */
  routes: Readonly<RouteRecordRaw[]>
  /**
   * ...
   */
  scrollBehavior?: RouterScrollBehavior
  /**
   * ...
   */
  parseQuery?: typeof originalParseQuery
  /**
   * Custom implementation to stringify a query object. Should not prepend a leading `?`.
   * {@link RouterOptions.parseQuery | parseQuery} counterpart to handle query parsing.
   */
  stringifyQuery?: typeof originalStringifyQuery
  /**
   * Default class applied to active {@link RouterLink}. If none is provided,
   * `router-link-active` will be applied.
   */
  linkActiveClass?: string
  /**
   * Default class applied to exact active {@link RouterLink}. If none is provided,
   * `router-link-exact-active` will be applied.
   */
  linkExactActiveClass?: string
  /**
   * Default class applied to non-active {@link RouterLink}. If none is provided,
   * `router-link-inactive` will be applied.
   */
  // linkInactiveClass?: string
}

// router/packages/router/src/types/index.ts
// 每个路由配置的类型
export type RouteRecordRaw =
  | RouteRecordSingleView
  | RouteRecordSingleViewWithChildren
  | RouteRecordMultipleViews
  | RouteRecordMultipleViewsWithChildren
  | RouteRecordRedirect

// router/packages/router/src/router.ts
// Router接口的全部方法和属性
export interface Router {
  /**
   * @internal
   */
  // readonly history: RouterHistory
  readonly currentRoute: Ref<RouteLocationNormalizedLoaded>
  readonly options: RouterOptions
  listening: boolean
  
  addRoute(parentName: RouteRecordName, route: RouteRecordRaw): () => void
  addRoute(route: RouteRecordRaw): () => void
  removeRoute(name: RouteRecordName): void
  hasRoute(name: RouteRecordName): boolean
  
  getRoutes(): RouteRecord[]
  resolve(
    to: RouteLocationRaw,
    currentLocation?: RouteLocationNormalizedLoaded
  ): RouteLocation & { href: string }
  push(to: RouteLocationRaw): Promise<NavigationFailure | void | undefined>
  replace(to: RouteLocationRaw): Promise<NavigationFailure | void | undefined>
  back(): ReturnType<Router['go']>
  forward(): ReturnType<Router['go']>
  go(delta: number): void
  beforeEach(guard: NavigationGuardWithThis<undefined>): () => void
  beforeResolve(guard: NavigationGuardWithThis<undefined>): () => void
  afterEach(guard: NavigationHookAfter): () => void
  onError(handler: _ErrorHandler): () => void
  isReady(): Promise<void>

  /**
   * Called automatically by `app.use(router)`. Should not be called manually by
   * the user. This will trigger the initial navigation when on client side.
   *
   * @internal
   * @param app - Application that uses the router
   */
  install(app: App): void
}
```

每个类型方法还有详细的注释，这极大降低了阅读源码的门槛，可以帮助我们在看到函数的类型时就知道函数大概的功能。我们知道Vue中app.use实际上执行的就是router对象内部的install方法，我们先进入到install方法看下是如何安装的。



### 路由安装

#### intall

在下面的代码中，我们可以看到，在createRouter的最后，创建了包含addRoute、push等方法的对象，并且**install方法**内部注册了RouterLink和RouterView两个组件，所以我们可以在任何组件内部直接使用`<router-view>`和`<router-link>`组件；然后注册全局变量`$router`和`$route`，其中`$router`就是我们通过createRouter返回的路由对象，包含addRoute、push等方法，`$route`使用defineProperty的形式返回currentRoute的值，可以做到和currentRoute的值同步。

然后使用computed把路由变成响应式对象（现已更新23.7.16），存储在reactiveRoute对象中，再通过app.provide给全局注册了route和其被reactive包裹后的reactiveRoute对象。之前介绍provide函数的时候有提到，provide提供的数据并没有做响应式的封装，如果需要响应式数据需要自己使用ref或者reactive封装为响应式对象，最后注册unmount方法实现vue-router的卸载。

```typescript
// https://github.com/vuejs/router/blob/main/packages/router/src/router.ts#L353
// router/packages/router/src/router.ts
export function createRouter(options: RouterOptions): Router {
  // 1.初始化路由matcher，可以把它看成“路由管理器”，我们可以通过它来动态添加路由、删除路由等操作
  const matcher = createRouterMatcher(options.routes, options)
  
  // 2.获取路由核心 API（hash 或者 History）
  let routerHistory = options.history
  
  // 3.利用useCallbacks()初始化路由前置守卫/解析守卫/后置守卫
  const beforeGuards = useCallbacks<NavigationGuardWithThis<undefined>>()
  const beforeResolveGuards = useCallbacks<NavigationGuardWithThis<undefined>>()
  const afterGuards = useCallbacks<NavigationHookAfter>()
  // ...

  let started: boolean | undefined
  const installedApps = new Set<App>()

  const router: Router = { // 最后返回的对象
    currentRoute,
    listening: true,

    addRoute,
    removeRoute,
    hasRoute,
    getRoutes,
    resolve,
    options,

    push,
    replace,
    go,
    back: () => go(-1),
    forward: () => go(1),

    beforeEach: beforeGuards.add,
    beforeResolve: beforeResolveGuards.add,
    afterEach: afterGuards.add,

    onError: errorHandlers.add,
    isReady,

    install(app: App) {
      const router = this
      // 注册两个组件
      app.component('RouterLink', RouterLink)
      app.component('RouterView', RouterView)

      // 注册全局变量
      app.config.globalProperties.$router = router // 即createRouter方法的返回
      Object.defineProperty(app.config.globalProperties, '$route', { // 返回currentRoute的值
        enumerable: true,
        get: () => unref(currentRoute),
      })

      // this initial navigation is only necessary on client, on server it doesn't
      // make sense because it will create an extra unnecessary navigation and could
      // lead to problems
      if (
        isBrowser &&
        // used for the initial navigation client side to avoid pushing
        // multiple times when the router is used in multiple apps
        !started &&
        currentRoute.value === START_LOCATION_NORMALIZED
      ) {
        // see above
        started = true
        push(routerHistory.location).catch(err => {
          if (__DEV__) warn('Unexpected error when starting the router:', err)
        })
      }

      const reactiveRoute = {} as RouteLocationNormalizedLoaded
      for (const key in START_LOCATION_NORMALIZED) {
         // defineProperty的形式返回currentRoute的值， 原来是computed的形式
        Object.defineProperty(reactiveRoute, key, {
          get: () => currentRoute.value[key as keyof RouteLocationNormalized],
          enumerable: true,
        })
      }

      app.provide(routerKey, router)
      app.provide(routeLocationKey, shallowReactive(reactiveRoute)) // shallowReactive处理后的currentRoute
      app.provide(routerViewLocationKey, currentRoute) // 原本的currentRoute

      const unmountApp = app.unmount
      installedApps.add(app)
      app.unmount = function () { // unmount 卸载
        installedApps.delete(app)
        // the router is not attached to an app anymore
        if (installedApps.size < 1) {
          // invalidate the current navigation
          pendingLocation = START_LOCATION_NORMALIZED
          removeHistoryListener && removeHistoryListener()
          removeHistoryListener = null
          currentRoute.value = START_LOCATION_NORMALIZED
          started = false
          ready = false
        }
        unmountApp()
      }

      // TODO: this probably needs to be updated so it can be used by vue-termui
      if ((__DEV__ || __FEATURE_PROD_DEVTOOLS__) && isBrowser) {
        addDevtools(app, router, matcher)
      }
    },
  }

  // TODO: type this as NavigationGuardReturn or similar instead of any
  function runGuardQueue(guards: Lazy<any>[]): Promise<any> {
    return guards.reduce(
      (promise, guard) => promise.then(() => runWithContext(guard)),
      Promise.resolve()
    )
  }

  return router
}
```

#### router-view

路由对象创建和安装之后，下一步需要了解的就是router-link和router-view两个组件的实现方式。

在下面的代码中可以看到，RouterView的setup函数返回了一个函数，这个函数就是RouterView组件的render函数。

大部分我们使用的方式就是一个`<router-view />`组件，没有slot的情况下返回的就是component变量。component使用h函数返回ViewComponent的虚拟DOM，而ViewComponent是根据`matchedRoute.components[props.name]`计算而来的。

matchedRoute依赖的`matchedRouteRef`的计算逻辑在setup函数定义的前几行，数据来源injectedRoute就是之前注入的currentRoute对象。

```typescript
// router/packages/router/src/RouterView.ts
export const RouterViewImpl = /*#__PURE__*/ defineComponent({
  name: 'RouterView',
  // #674 we manually inherit them
  inheritAttrs: false,
  props: {
    name: {
      type: String as PropType<string>,
      default: 'default',
    },
    route: Object as PropType<RouteLocationNormalizedLoaded>,
  },

  // Better compat for @vue/compat users
  // https://github.com/vuejs/router/issues/1315
  compatConfig: { MODE: 3 },

  // router-view组件源码
  setup(props, { attrs, slots }) {
    __DEV__ && warnDeprecatedUsage()

    const injectedRoute = inject(routerViewLocationKey)! // 全局的currentRoute对象注入
    const routeToDisplay = computed<RouteLocationNormalizedLoaded>( // 待展示的路由
      () => props.route || injectedRoute.value
    )
    const injectedDepth = inject(viewDepthKey, 0) // 视图层级初始化
    // The depth changes based on empty components option, which allows passthrough routes e.g. routes with children
    // that are used to reuse the `path` property
    const depth = computed<number>(() => {
      let initialDepth = unref(injectedDepth)
      const { matched } = routeToDisplay.value
      let matchedRoute: RouteLocationMatched | undefined
      while (
        (matchedRoute = matched[initialDepth]) &&
        !matchedRoute.components
      ) {
        initialDepth++
      }
      return initialDepth
    })
    const matchedRouteRef = computed<RouteLocationMatched | undefined>( // 根据层级匹配路由
      () => routeToDisplay.value.matched[depth.value]
    )

    // 嵌套层级
    provide(
      viewDepthKey,
      computed(() => depth.value + 1)
    )
    // 匹配的router对象
    provide(matchedRouteKey, matchedRouteRef)
    // 路径
    provide(routerViewLocationKey, routeToDisplay)

    const viewRef = ref<ComponentPublicInstance>()

    // watch at the same time the component instance, the route record we are
    // rendering, and the name
    watch(
      () => [viewRef.value, matchedRouteRef.value, props.name] as const,
      ([instance, to, name], [oldInstance, from, oldName]) => {
        // copy reused instances
        if (to) {
          // this will update the instance for new instances as well as reused
          // instances when navigating to a new route
          to.instances[name] = instance
          // the component instance is reused for a different route or name, so
          // we copy any saved update or leave guards. With async setup, the
          // mounting component will mount before the matchedRoute changes,
          // making instance === oldInstance, so we check if guards have been
          // added before. This works because we remove guards when
          // unmounting/deactivating components
          if (from && from !== to && instance && instance === oldInstance) {
            if (!to.leaveGuards.size) {
              to.leaveGuards = from.leaveGuards
            }
            if (!to.updateGuards.size) {
              to.updateGuards = from.updateGuards
            }
          }
        }

        // trigger beforeRouteEnter next callbacks
        if (
          instance &&
          to &&
          // if there is no instance but to and from are the same this might be
          // the first visit
          (!from || !isSameRouteRecord(to, from) || !oldInstance)
        ) {
          ;(to.enterCallbacks[name] || []).forEach(callback =>
            callback(instance)
          )
        }
      },
      { flush: 'post' }
    )

    return () => { // setup的返回，一个render函数
      const route = routeToDisplay.value // 路由URL
      // we need the value at the time we render because when we unmount, we
      // navigated to a different location so the value is different
      const currentName = props.name
      const matchedRoute = matchedRouteRef.value // 匹配搭配的路由
      const ViewComponent =
        matchedRoute && matchedRoute.components![currentName] // 根据路由匹配到的组件

      if (!ViewComponent) {
        return normalizeSlot(slots.default, { Component: ViewComponent, route })
      }

      // 匹配到的路由的一些配置
      // props from route configuration
      const routePropsOption = matchedRoute.props[currentName]
      const routeProps = routePropsOption
        ? routePropsOption === true
          ? route.params
          : typeof routePropsOption === 'function'
          ? routePropsOption(route)
          : routePropsOption
        : null

      const onVnodeUnmounted: VNodeProps['onVnodeUnmounted'] = vnode => {
        // remove the instance reference to prevent leak
        if (vnode.component!.isUnmounted) {
          matchedRoute.instances[currentName] = null
        }
      }

      // 创建需要渲染组件的虚拟DOM
      const component = h(
        ViewComponent,
        assign({}, routeProps, attrs, {
          onVnodeUnmounted,
          ref: viewRef,
        })
      )

      if (
        (__DEV__ || __FEATURE_PROD_DEVTOOLS__) &&
        isBrowser &&
        component.ref
      ) {
        // TODO: can display if it's an alias, its props
        const info: RouterViewDevtoolsContext = {
          depth: depth.value,
          name: matchedRoute.name,
          path: matchedRoute.path,
          meta: matchedRoute.meta,
        }

        const internalInstances = isArray(component.ref)
          ? component.ref.map(r => r.i)
          : [component.ref.i]

        internalInstances.forEach(instance => {
          // @ts-expect-error
          instance.__vrv_devtools = info
        })
      }

      // 返回被渲染的组件的vnode
      return (
        // pass the vnode to the slot as a prop.
        // h and <component :is="..."> both accept vnodes
        normalizeSlot(slots.default, { Component: component, route }) ||
        component
      )
    }
  },
})
```



### 路由更新

以上代码可以看出，RouterView渲染的组件是由当前匹配的路由变量matchedRoute决定的。

#### createRouterMatcher

回到createRouter函数中，可以看到matcher对象是由`createRouterMatcher`创建，createRouterMatcher函数接收routes配置的路由数组，并且返回创建的RouterMatcher对象，内部遍历routes数组，通过addRoute挨个处理路由配置。

```typescript
// router/packages/router/src/matcher/index.ts

/**
 * Creates a Router Matcher.
 *
 * @internal
 * @param routes - array of initial routes
 * @param globalOptions - global route options
 */
export function createRouterMatcher(
  routes: Readonly<RouteRecordRaw[]>,
  globalOptions: PathParserOptions
): RouterMatcher {
  // normalized ordered array of matchers
  const matchers: RouteRecordMatcher[] = []
  const matcherMap = new Map<RouteRecordName, RouteRecordMatcher>()
  globalOptions = mergeOptions(
    { strict: false, end: true, sensitive: false } as PathParserOptions,
    globalOptions
  )

  function getRecordMatcher(name: RouteRecordName) {
    return matcherMap.get(name)
  }

  function addRoute(
    record: RouteRecordRaw,
    parent?: RouteRecordMatcher,
    originalRecord?: RouteRecordMatcher
  ) {
    // ...
  }

  function removeRoute(matcherRef: RouteRecordName | RouteRecordMatcher) {
    // ...
  }

  function getRoutes() {
    return matchers
  }

  function insertMatcher(matcher: RouteRecordMatcher) {
    // ...
  }

  function resolve(
    location: Readonly<MatcherLocationRaw>,
    currentLocation: Readonly<MatcherLocation>
  ): MatcherLocation {
    // ...
  }

  // 遍历 routes 数组，通过 addRoute 挨个处理路由配置
  // add initial routes
  routes.forEach(route => addRoute(route))

  return { addRoute, resolve, removeRoute, getRoutes, getRecordMatcher }
}
```

##### addRoute

下面的代码中我们可以看到，`addRoute`函数内部通过`createRouteRecordMatcher`创建扩展之后的matcher对象，包括了record、parent、children等树形结构，可以很好地描述路由之间嵌套的父子关系。这样整个路由对象就已经创建完毕。

```typescript
// router/packages/router/src/matcher/index.ts
// 定义在createRouterMatcher内部
  function addRoute(
    record: RouteRecordRaw,
    parent?: RouteRecordMatcher,
    originalRecord?: RouteRecordMatcher
  ) {
    // used later on to remove by name
    const isRootAdd = !originalRecord
    const mainNormalizedRecord = normalizeRouteRecord(record)
    if (__DEV__) {
      checkChildMissingNameWithEmptyPath(mainNormalizedRecord, parent)
    }
    // we might be the child of an alias
    mainNormalizedRecord.aliasOf = originalRecord && originalRecord.record
    const options: PathParserOptions = mergeOptions(globalOptions, record)
    // generate an array of records to correctly handle aliases
    const normalizedRecords: (typeof mainNormalizedRecord)[] = [
      mainNormalizedRecord,
    ]
    if ('alias' in record) {
      const aliases =
        typeof record.alias === 'string' ? [record.alias] : record.alias!
      for (const alias of aliases) {
        normalizedRecords.push(
          assign({}, mainNormalizedRecord, {
            // this allows us to hold a copy of the `components` option
            // so that async components cache is hold on the original record
            components: originalRecord
              ? originalRecord.record.components
              : mainNormalizedRecord.components,
            path: alias,
            // we might be the child of an alias
            aliasOf: originalRecord
              ? originalRecord.record
              : mainNormalizedRecord,
            // the aliases are always of the same kind as the original since they
            // are defined on the same record
          }) as typeof mainNormalizedRecord
        )
      }
    }

    let matcher: RouteRecordMatcher
    let originalMatcher: RouteRecordMatcher | undefined

    for (const normalizedRecord of normalizedRecords) {
      const { path } = normalizedRecord
      // Build up the path for nested routes if the child isn't an absolute
      // route. Only add the / delimiter if the child path isn't empty and if the
      // parent path doesn't have a trailing slash
      if (parent && path[0] !== '/') {
        const parentPath = parent.record.path
        const connectingSlash =
          parentPath[parentPath.length - 1] === '/' ? '' : '/'
        normalizedRecord.path =
          parent.record.path + (path && connectingSlash + path)
      }

      if (__DEV__ && normalizedRecord.path === '*') {
        throw new Error(
          'Catch all routes ("*") must now be defined using a param with a custom regexp.\n' +
            'See more at https://next.router.vuejs.org/guide/migration/#removed-star-or-catch-all-routes.'
        )
      }

      // 通过 createRouteRecordMatcher 创建扩展之后的 matcher 对象
      // create the object beforehand, so it can be passed to children
      matcher = createRouteRecordMatcher(normalizedRecord, parent, options)

      if (__DEV__ && parent && path[0] === '/')
        checkMissingParamsInAbsolutePath(matcher, parent)

      // if we are an alias we must tell the original record that we exist,
      // so we can be removed
      if (originalRecord) {
        originalRecord.alias.push(matcher)
        if (__DEV__) {
          checkSameParams(originalRecord, matcher)
        }
      } else {
        // otherwise, the first record is the original and others are aliases
        originalMatcher = originalMatcher || matcher
        if (originalMatcher !== matcher) originalMatcher.alias.push(matcher)

        // remove the route if named and only for the top record (avoid in nested calls)
        // this works because the original record is the first one
        if (isRootAdd && record.name && !isAliasRecord(matcher))
          removeRoute(record.name)
      }

      if (mainNormalizedRecord.children) {
        const children = mainNormalizedRecord.children
        for (let i = 0; i < children.length; i++) {
          addRoute(
            children[i],
            matcher,
            originalRecord && originalRecord.children[i]
          )
        }
      }

      // if there was no original record, then the first one was not an alias and all
      // other aliases (if any) need to reference this record when adding children
      originalRecord = originalRecord || matcher

      // TODO: add normalized records for more flexibility
      // if (parent && isAliasRecord(originalRecord)) {
      //   parent.children.push(originalRecord)
      // }

      // Avoid adding a record that doesn't display anything. This allows passing through records without a component to
      // not be reached and pass through the catch all route
      if (
        (matcher.record.components &&
          Object.keys(matcher.record.components).length) ||
        matcher.record.name ||
        matcher.record.redirect
      ) {
        insertMatcher(matcher)
      }
    }

    return originalMatcher
      ? () => {
          // since other matchers are aliases, they should be removed by the original matcher
          removeRoute(originalMatcher!)
        }
      : noop
  }
```

##### createRouteRecordMatcher

```typescript
// https://github.com/vuejs/router/blob/main/packages/router/src/matcher/pathMatcher.ts#L19
// router/packages/router/src/matcher/pathMatcher.ts
export function createRouteRecordMatcher(
  record: Readonly<RouteRecord>,
  parent: RouteRecordMatcher | undefined,
  options?: PathParserOptions
): RouteRecordMatcher {
  const parser = tokensToParser(tokenizePath(record.path), options)

  // warn against params with the same name
  if (__DEV__) {
    // ...
  }

  // 返回的对象
  const matcher: RouteRecordMatcher = assign(parser, {
    record,
    parent,
    // these needs to be populated by the parent
    children: [],
    alias: [],
  })

  if (parent) {
    // both are aliases or both are not aliases
    // we don't want to mix them because the order is used when
    // passing originalRecord in Matcher.addRoute
    if (!matcher.record.aliasOf === !parent.record.aliasOf)
      parent.children.push(matcher)
  }

  return matcher
}
```

那如何在路由切换的时候寻找到正确的路由对象呢？

#### router-link

在vue-router中，路由更新可以通过router-link渲染的链接实现，也可以使用router对象的push等方法实现。

以下代码中，router-link组件内部也是渲染一个a标签，并且注册了a标签的onClick函数，内部也是通过router.replace或者router.push来实现。

```typescript
// router/packages/router/src/RouterLink.ts
export const RouterLinkImpl = /*#__PURE__*/ defineComponent({
  name: 'RouterLink',
  compatConfig: { MODE: 3 },
  props: {
    to: {
      type: [String, Object] as PropType<RouteLocationRaw>,
      required: true,
    },
    replace: Boolean,
    activeClass: String,
    // inactiveClass: String,
    exactActiveClass: String,
    custom: Boolean,
    ariaCurrentValue: {
      type: String as PropType<RouterLinkProps['ariaCurrentValue']>,
      default: 'page',
    },
  },

  useLink,

  // router-link源码
  setup(props, { slots }) {
    const link = reactive(useLink(props))
    const { options } = inject(routerKey)!

    const elClass = computed(() => ({
      // ...
    }))

    return () => {
      const children = slots.default && slots.default(link)
      return props.custom
        ? children
        : h(
            'a', // 渲染a标签
            {
              'aria-current': link.isExactActive
                ? props.ariaCurrentValue
                : null,
              href: link.href,
              // this would override user added attrs but Vue will still add
              // the listener, so we end up triggering both
              onClick: link.navigate, // 注册a标签的onClick事件
              class: elClass.value,
            },
            children
          )
    }
  },
})

// 跳转，定义在useLink函数内部
  function navigate(
    e: MouseEvent = {} as MouseEvent
  ): Promise<void | NavigationFailure> {
    if (guardEvent(e)) {
      return router[unref(props.replace) ? 'replace' : 'push'](
        unref(props.to)
        // avoid uncaught errors are they are logged anyway
      ).catch(noop)
    }
    return Promise.resolve()
  }
```

#### createRouter>push

回到createRouter函数中，可以看到push函数直接调用了pushWithRedirect函数来实现，内部通过resolve(to)生成targetLocation变量。   这个变量会赋值给toLocation，然后执行navigate(toLocation)函数。navigate函数内部会执行一系列的导航守卫函数，最后执行finalizeNavigation函数完成导航。

```typescript
// router/packages/router/src/router.ts
// createRouter内部定义的函数
  function push(to: RouteLocationRaw) {
    return pushWithRedirect(to)
  }

  function replace(to: RouteLocationRaw) {
    return push(assign(locationAsObject(to), { replace: true }))
  }

  function pushWithRedirect(
    to: RouteLocationRaw | RouteLocation,
    redirectedFrom?: RouteLocation
  ): Promise<NavigationFailure | void | undefined> {
    // 通过resolve(to)生成targetLocation变量
    const targetLocation: RouteLocation = (pendingLocation = resolve(to)) 
    const from = currentRoute.value
    const data: HistoryState | undefined = (to as RouteLocationOptions).state
    const force: boolean | undefined = (to as RouteLocationOptions).force
    // to could be a string where `replace` is a function
    const replace = (to as RouteLocationOptions).replace === true

    const shouldRedirect = handleRedirectRecord(targetLocation)

    if (shouldRedirect)
      // ...

    // targetLocation赋值给toLocation
    // if it was a redirect we already called `pushWithRedirect` above
    const toLocation = targetLocation as RouteLocationNormalized

    toLocation.redirectedFrom = redirectedFrom
    let failure: NavigationFailure | void | undefined

    if (!force && isSameRouteLocation(stringifyQuery, from, targetLocation)) {
      failure = createRouterError<NavigationFailure>(
        ErrorTypes.NAVIGATION_DUPLICATED,
        { to: toLocation, from }
      )
      // trigger scroll to allow scrolling to the same anchor
      handleScroll(
        from,
        from,
        // this is a push, the only way for it to be triggered from a
        // history.listen is with a redirect, which makes it become a push
        true,
        // This cannot be the first navigation because the initial location
        // cannot be manually navigated to
        false
      )
    }

    return (failure ? Promise.resolve(failure) : navigate(toLocation, from))
      .catch((error: NavigationFailure | NavigationRedirectError) =>
        isNavigationFailure(error)
          ? // navigation redirects still mark the router as ready
            isNavigationFailure(error, ErrorTypes.NAVIGATION_GUARD_REDIRECT)
            ? error
            : markAsReady(error) // also returns the error
          : // reject any unknown error
            triggerError(error, toLocation, from)
      )
      .then((failure: NavigationFailure | NavigationRedirectError | void) => {
        if (failure) {
          // ...
        } else {
          // 执行finalizeNavigation完成导航
          // if we fail we don't finalize the navigation
          failure = finalizeNavigation(
            toLocation as RouteLocationNormalizedLoaded,
            from,
            true,
            replace,
            data
          )
        }
        triggerAfterEach(
          toLocation as RouteLocationNormalizedLoaded,
          from,
          failure
        )
        return failure
      })
  }
```

#### createRouter>finalizeNavigation

在以下代码中可以看到，finalizeNavigation函数内部通过`routerHistory.push`或者`replace`实现路由跳转，并且更新`currentRoute.value`。

currentRoute就是我们在install方法中注册的全局变量`$route`，每次页面跳转`currentRoute`都会更新为`toLocation`，在任意组件中都可以通过`$route`变量来获取当前路由的数据，最后在handleScroll设置滚动行为。

```typescript
// router/packages/router/src/router.ts
// createRouter内部定义的函数
  function finalizeNavigation(
    toLocation: RouteLocationNormalizedLoaded,
    from: RouteLocationNormalizedLoaded,
    isPush: boolean,
    replace?: boolean,
    data?: HistoryState
  ): NavigationFailure | void {
    // a more recent navigation took place
    const error = checkCanceledNavigation(toLocation, from)
    if (error) return error

    // only consider as push if it's not the first navigation
    const isFirstNavigation = from === START_LOCATION_NORMALIZED
    const state: Partial<HistoryState> | null = !isBrowser ? {} : history.state

    // change URL only if the user did a push/replace and if it's not the initial navigation because
    // it's just reflecting the url
    if (isPush) {
      // on the initial navigation, we want to reuse the scroll position from
      // history state if it exists
      if (replace || isFirstNavigation)
        routerHistory.replace(
          toLocation.fullPath,
          assign(
            {
              scroll: isFirstNavigation && state && state.scroll,
            },
            data
          )
        )
      else routerHistory.push(toLocation.fullPath, data)
    }

    // accept current navigation
    currentRoute.value = toLocation
    handleScroll(toLocation, from, isPush, isFirstNavigation) // 设置滚动行为

    markAsReady()
  }

  function markAsReady<E = any>(err?: E): E | void {
    if (!ready) {
      // still not ready if an error happened
      ready = !err
      setupListeners()
      readyHandlers
        .list()
        .forEach(([resolve, reject]) => (err ? reject(err) : resolve()))
      readyHandlers.reset()
    }
    return err
  }
```

#### routerHistory

上面代码中的**`routerHistory`**在createRouter中通过option.history获取，就是我们创建vue-router应用时通过createWebHistory或者createWebHashHistory创建的对象。

createWebHistory返回的是HTML5的history模式的路由对象，createWebHashHistory是hash模式的路由对象。

下面的代码中我们可以看到，createWebHashHistory和createWebHistory的实现，内部都是通过`useHistoryListeners`实现路由的监听，通过`useHistoryStateNavigation`实现路由的切换。

useHistoryStateNavigation会返回push或者replace方法来更新路由，这两个函数可以在[Github](https://github.com/vuejs/router/blob/main/packages/router/src/history/html5.ts)上自行学习。

```typescript
// Breadcrumbsrouter/packages/router/src/history/hash.ts
export function createWebHashHistory(base?: string): RouterHistory {
  // Make sure this implementation is fine in terms of encoding, specially for IE11
  // for `file://`, directly use the pathname and ignore the base
  // location.pathname contains an initial `/` even at the root: `https://example.com`
  base = location.host ? base || location.pathname + location.search : ''
  // allow the user to provide a `#` in the middle: `/base/#/app`
  if (!base.includes('#')) base += '#'

  if (__DEV__ && !base.endsWith('#/') && !base.endsWith('#')) {
    warn(
      `A hash base must end with a "#":\n"${base}" should be "${base.replace(
        /#.*$/,
        '#'
      )}".`
    )
  }
  return createWebHistory(base)
}

// router/packages/router/src/history/html5.ts
export function createWebHistory(base?: string): RouterHistory {
  base = normalizeBase(base)

  const historyNavigation = useHistoryStateNavigation(base)
  const historyListeners = useHistoryListeners(
    base,
    historyNavigation.state,
    historyNavigation.location,
    historyNavigation.replace
  )
  function go(delta: number, triggerListeners = true) {
    if (!triggerListeners) historyListeners.pauseListeners()
    history.go(delta)
  }

  const routerHistory: RouterHistory = assign(
    {
      // it's overridden right after
      location: '',
      base,
      go,
      createHref: createHref.bind(null, base),
    },

    historyNavigation,
    historyListeners
  )

  Object.defineProperty(routerHistory, 'location', {
    enumerable: true,
    get: () => historyNavigation.location.value,
  })

  Object.defineProperty(routerHistory, 'state', {
    enumerable: true,
    get: () => historyNavigation.state.value,
  })

  return routerHistory
}

// https://github.com/vuejs/router/blob/main/packages/router/src/history/html5.ts#L58
function useHistoryListeners(
  base: string,
  historyState: ValueContainer<StateEntry>,
  currentLocation: ValueContainer<HistoryLocation>,
  replace: RouterHistory['replace']
) {
  let listeners: NavigationCallback[] = []
  let teardowns: Array<() => void> = []
  // TODO: should it be a stack? a Dict. Check if the popstate listener
  // can trigger twice
  let pauseState: HistoryLocation | null = null

  const popStateHandler: PopStateListener = ({
    state,
  }: {
    state: StateEntry | null
  }) => {
    const to = createCurrentLocation(base, location)
    const from: HistoryLocation = currentLocation.value
    const fromState: StateEntry = historyState.value
    let delta = 0

    if (state) {
      currentLocation.value = to
      historyState.value = state

      // ignore the popstate and reset the pauseState
      if (pauseState && pauseState === from) {
        pauseState = null
        return
      }
      delta = fromState ? state.position - fromState.position : 0
    } else {
      replace(to)
    }

    // console.log({ deltaFromCurrent })
    // Here we could also revert the navigation by calling history.go(-delta)
    // this listener will have to be adapted to not trigger again and to wait for the url
    // to be updated before triggering the listeners. Some kind of validation function would also
    // need to be passed to the listeners so the navigation can be accepted
    // call all listeners
    listeners.forEach(listener => {
      listener(currentLocation.value, from, {
        delta,
        type: NavigationType.pop,
        direction: delta
          ? delta > 0
            ? NavigationDirection.forward
            : NavigationDirection.back
          : NavigationDirection.unknown,
      })
    })
  }

  function pauseListeners() {
    pauseState = currentLocation.value
  }

  function listen(callback: NavigationCallback) {
    // set up the listener and prepare teardown callbacks
    listeners.push(callback)

    const teardown = () => {
      const index = listeners.indexOf(callback)
      if (index > -1) listeners.splice(index, 1)
    }

    teardowns.push(teardown)
    return teardown
  }

  function beforeUnloadListener() {
    const { history } = window
    if (!history.state) return
    history.replaceState(
      assign({}, history.state, { scroll: computeScrollPosition() }),
      ''
    )
  }

  function destroy() {
    for (const teardown of teardowns) teardown()
    teardowns = []
    window.removeEventListener('popstate', popStateHandler)
    window.removeEventListener('beforeunload', beforeUnloadListener)
  }

  // set up the listeners and prepare teardown callbacks
  window.addEventListener('popstate', popStateHandler)
  // TODO: could we use 'pagehide' or 'visibilitychange' instead?
  // https://developer.chrome.com/blog/page-lifecycle-api/
  window.addEventListener('beforeunload', beforeUnloadListener, {
    passive: true,
  })

  return {
    pauseListeners,
    listen,
    destroy,
  }
}
```

#### useHistoryListeners

实现路由的变化监听

```typescript
function useHistoryListeners(
  base: string,
  historyState: ValueContainer<StateEntry>,
  currentLocation: ValueContainer<HistoryLocation>,
  replace: RouterHistory['replace']
) {
  let listeners: NavigationCallback[] = []
  let teardowns: Array<() => void> = []
  // TODO: should it be a stack? a Dict. Check if the popstate listener
  // can trigger twice
  let pauseState: HistoryLocation | null = null

  // 事件处理函数
  const popStateHandler: PopStateListener = ({
    state,
  }: {
    state: StateEntry | null
  }) => {
    const to = createCurrentLocation(base, location)
    const from: HistoryLocation = currentLocation.value
    const fromState: StateEntry = historyState.value
    let delta = 0

    if (state) {
      currentLocation.value = to
      historyState.value = state

      // ignore the popstate and reset the pauseState
      if (pauseState && pauseState === from) {
        pauseState = null
        return
      }
      delta = fromState ? state.position - fromState.position : 0
    } else {
      replace(to)
    }

    // console.log({ deltaFromCurrent })
    // Here we could also revert the navigation by calling history.go(-delta)
    // this listener will have to be adapted to not trigger again and to wait for the url
    // to be updated before triggering the listeners. Some kind of validation function would also
    // need to be passed to the listeners so the navigation can be accepted
    // call all listeners
    listeners.forEach(listener => {
      listener(currentLocation.value, from, {
        delta,
        type: NavigationType.pop,
        direction: delta
          ? delta > 0
            ? NavigationDirection.forward
            : NavigationDirection.back
          : NavigationDirection.unknown,
      })
    })
  }

  function pauseListeners() {
    pauseState = currentLocation.value
  }

  function listen(callback: NavigationCallback) {
    // set up the listener and prepare teardown callbacks
    listeners.push(callback)

    const teardown = () => {
      const index = listeners.indexOf(callback)
      if (index > -1) listeners.splice(index, 1)
    }

    teardowns.push(teardown)
    return teardown
  }

  function beforeUnloadListener() {
    const { history } = window
    if (!history.state) return
    history.replaceState(
      assign({}, history.state, { scroll: computeScrollPosition() }),
      ''
    )
  }

  function destroy() {
    for (const teardown of teardowns) teardown()
    teardowns = []
    window.removeEventListener('popstate', popStateHandler)
    window.removeEventListener('beforeunload', beforeUnloadListener)
  }

  // set up the listeners and prepare teardown callbacks
  window.addEventListener('popstate', popStateHandler)
  // TODO: could we use 'pagehide' or 'visibilitychange' instead?
  // https://developer.chrome.com/blog/page-lifecycle-api/
  window.addEventListener('beforeunload', beforeUnloadListener, {
    passive: true,
  })

  return {
    pauseListeners,
    listen,
    destroy,
  }
}
```



### 总结

这一讲中进入到vue-router源码中分析了vue-router内部的执行逻辑，在掌握了前端路由实现的原理后，再来看实际的vue-router源码难度会下降不少。

首先分析createRouter这个入口函数，createRouter函数返回了router对象，router对象提供了addRoute、push等方法，并且在install方法中实现了路由，注册了组件router-link和router-view。

然后通过createRouterMatcher创建路由匹配对象，在路由变化的时候维护currentRoute，让你可以在每个组件内部通过`$router`和`$route`获取路由匹配的数据，并且动态渲染当前路由匹配的组件到router-view组件内部，实现了前端的路由系统。

阅读源码的目的之一，就是要学习和模仿优秀框架内部的设计思路，然后去优化自己项目中的代码，学会模仿也是一个优秀程序员的优秀品质。



### 思考

navigate函数负责执行路由守卫的功能，它的内部是如何实现的？

beforeRouteLeave => beforeEach => beforeRouteUpdate => beforeEnter => beforeRouteEnter

```typescript
function navigate(
    to: RouteLocationNormalized,
    from: RouteLocationNormalizedLoaded
  ): Promise<any> {
    let guards: Lazy<any>[]

    // 提取本次路由跳转的信息，获取需要退出的路由、更新的路由和进入的路由
    const [leavingRecords, updatingRecords, enteringRecords] =
      extractChangingRecords(to, from)

    // 获取退出的路由其对应组件的`beforeRouteLeave`钩子
    // all components here have been resolved once because we are leaving
    guards = extractComponentsGuards(
      leavingRecords.reverse(),
      'beforeRouteLeave',
      to,
      from
    )

    // 处理退出的路由的leaveGuards
    // leavingRecords is already reversed
    for (const record of leavingRecords) {
      record.leaveGuards.forEach(guard => {
        guards.push(guardToPromiseFn(guard, to, from))
      })
    }

    const canceledNavigationCheck = checkCanceledNavigationAndReject.bind(
      null,
      to,
      from
    )

    guards.push(canceledNavigationCheck)

    // run the queue of per route beforeRouteLeave guards
    return (
      // 1.调用离开组件的`beforeRouteLeave`钩子
      runGuardQueue(guards)
        .then(() => {
          // 获取全局的的`beforeEach`钩子
          // check global guards beforeEach
          guards = []
          for (const guard of beforeGuards.list()) {
            guards.push(guardToPromiseFn(guard, to, from))
          }
          guards.push(canceledNavigationCheck)

          // 2.调用全局的`beforeEach`钩子
          return runGuardQueue(guards)
        })
        .then(() => {
          // 获取更新的路由其对应组件的`beforeRouteUpdate`钩子
          // check in components beforeRouteUpdate
          guards = extractComponentsGuards(
            updatingRecords,
            'beforeRouteUpdate',
            to,
            from
          )

          for (const record of updatingRecords) {
            record.updateGuards.forEach(guard => {
              guards.push(guardToPromiseFn(guard, to, from))
            })
          }
          guards.push(canceledNavigationCheck)

          // 3.调用复用组件的`beforeRouteUpdate`钩子
          // run the queue of per route beforeEnter guards
          return runGuardQueue(guards)
        })
        .then(() => {
          // 获取进入的路由自身的`beforeEnter`钩子
          // check the route beforeEnter
          guards = []
          for (const record of enteringRecords) {
            // do not trigger beforeEnter on reused views
            if (record.beforeEnter) {
              if (isArray(record.beforeEnter)) {
                for (const beforeEnter of record.beforeEnter)
                  guards.push(guardToPromiseFn(beforeEnter, to, from))
              } else {
                guards.push(guardToPromiseFn(record.beforeEnter, to, from))
              }
            }
          }
          guards.push(canceledNavigationCheck)

          // 4.调用新匹配路由的`beforeEnter`钩子
          // run the queue of per route beforeEnter guards
          return runGuardQueue(guards)
        })
        .then(() => {
          // NOTE: at this point to.matched is normalized and does not contain any () => Promise<Component>

          // clear existing enterCallbacks, these are added by extractComponentsGuards
          to.matched.forEach(record => (record.enterCallbacks = {}))

          // 获取进入的路由其对应组件的`beforeRouteEnter`钩子
          // check in-component beforeRouteEnter
          guards = extractComponentsGuards(
            enteringRecords,
            'beforeRouteEnter',
            to,
            from
          )
          guards.push(canceledNavigationCheck)

          // 5.调用新组件的`beforeRouteEnter`钩子
          // run the queue of per route beforeEnter guards
          return runGuardQueue(guards)
        })
        .then(() => {
          // 获取全局的的`beforeResolve`钩子
          // check global guards beforeResolve
          guards = []
          for (const guard of beforeResolveGuards.list()) {
            guards.push(guardToPromiseFn(guard, to, from))
          }
          guards.push(canceledNavigationCheck)

          // 6.调用全局的`beforeResolve`守卫
          return runGuardQueue(guards)
        })
        // catch any navigation canceled
        .catch(err =>
          isNavigationFailure(err, ErrorTypes.NAVIGATION_CANCELLED)
            ? err
            : Promise.reject(err)
        )
    )
  }
```

