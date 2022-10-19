type Car = 'Audi' | 'BMW' | 'MercedesBenz';
type CarList = Record<Car, { age: number }>;

const cars: CarList = {
    Audi: { age: 119 },
    BMW: { age: 113 },
    MercedesBenz: { age: 133 }
};

const cars1: CarList = {
    Audi1: { age: 119 },
    BMW: { age: 113 },
    MercedesBenz: { age: 133 }
};

const cars2: CarList = {
    BMW: { age: 113 },
    MercedesBenz: { age: 133 }
};

const car3: CarList = {
    Audi: { age: 119 },
    BMW: { age: 113 },
    MercedesBenz: { age: 133 },
    Ferrari: { age: 111 }
};
