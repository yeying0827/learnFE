## 类Class

在ES6之后，JavaScript拥有了class关键字，但class有一些特性还没有加入，比如修饰符和抽象类等。

### 抽象类

抽象类是作为其他派生类的基类使用的，不会直接被实例化，不同于接口，抽象类可以包含成员的实现细节。

`abstract`关键字被用于定义**抽象类**和在抽象类内部定义**抽象方法**。如：

```typescript
abstract class Animal {
    abstract makeNoise(): void;

    move(): void {
        console.log('roaming the earch...');
    }
}
```

对抽象类执行实例化操作会报错：

```typescript
let animal = new Animal(); // TS2511: Cannot create an instance of an abstract class.
```

我们不能直接实例化抽象类，需要创建子类继承基类，此时可以实例化子类：

```typescript
class Cat extends Animal {
    makeNoise() {
        console.log('miao~');
    }
}

const cat = new Cat();
cat.move(); // roaming the earch...
cat.makeNoise(); // miao~
```



### 访问限定符

TypeScript中有三类访问限定符，分别是public、private、protected。

* public

  在TypeScript的类中，成员都默认为public，被此限定符修饰的成员可以被外部访问。

  ```typescript
  class Vehicle {
      public startRun(): void {
          console.log('starting ...');
      }
  }
  
  const car = new Vehicle();
  car.startRun(); // starting ...
  
  ```

* private

  被此限定符修饰的成员只可以在类的内部被访问。

  ```typescript
  class Vehicle {
      private startRun(): void {
          console.log('starting ...');
      }
  }
  
  const car = new Vehicle();
  car.startRun(); // TS2341: Property 'startRun' is private and only accessible within class 'Vehicle'.
  ```

* protected

  被此限定符修饰的成员只可以在类的内部以及该类的子类中被访问。

  ```typescript
  class Vehicle {
      protected startRun(): void {
          console.log('starting ...');
      }
  }
  
  class Car extends Vehicle {
      init() {
          this.startRun();
      }
  }
  
  const vehicle = new Vehicle();
  const car = new Car();
  vehicle.startRun(); // TS2445: Property 'startRun' is protected and only accessible within class 'Vehicle' and its subclasses.
  car.startRun(); // TS2445: Property 'startRun' is protected and only accessible within class 'Vehicle' and its subclasses.
  car.init(); // starting ...
  ```



### class可以用作接口

类也可以当作接口使用。

这在React工程中很常用。

比如定义一个组件：

```typescript
export default class Carousel extends React.Component<Props, State> {}
```

由于组件需要传入`props`的类型`Props`，同时又需要设置默认`props`即`defaultProps`。

此时class用作接口的优势就体现出来了。

可以声明一个类，这个类包含组件`props`所需的类型和初始值：

```typescript
export default class Props {
  public children: Array<React.ReactElement<any>> | React.ReactElement<any> | never[] = []
  public speed: number = 500
  public height: number = 160
  public animation: string = 'easeInOutQuad'
  public isAuto: boolean = true
  public autoPlayInterval: number = 4500
  // public afterChange: () => {} // 这种写法会报错。TS2564: Property 'afterChange' has no initializer and is not definitely assigned in the constructor.
  public afterChange: () => void = () => {}
  public afterChange: Function = () => {}
  // public selectedColor: string // 这个也会报错，可能是版本问题(ts 4.8.3)。TS2564: Property 'selectedColor' has no initializer and is not definitely assigned in the constructor.
  public selectedColor: string = ''
  public showDots: boolean = true
}
```

当我们需要传入`props`类型的时候，直接将`Props`作为接口传入，此时`Props`的作用就是接口，而当需要设置`defaultProps`初始值的时候，只需要对`Props`执行实例化操作：

```typescript
class Carousel extends React.Component<Props, State> {
  public static defaultProps = new Props();
}
```

这里`Props`的实例就是`defaultProps`的值。

我们用一个class起到了接口和设置初始值两个作用，方便统一管理，减少了代码量。

