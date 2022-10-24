const testDuplicated = 1;

interface Person9 {
    name: string,
    age: number,
}

interface Student9 extends Person9 {}

function checkValidStudent(p: Person9): p is Student9 {
    return p.age !== undefined && p.age >= 12 && p.age <= 15;
}

const p1 = {
    name: 'lilei',
    age: 18
}

const p2: Person9 = {
    name: 'hanmeimei',
    age: 15
}

function checkPerson(p: Person9) {
    if (checkValidStudent(p)) {
        console.log(`${p.name} is a Student`);
    } else {
        console.log(Object.prototype.valueOf.call(p));
    }
}

checkPerson(p1);
checkPerson(p2);
