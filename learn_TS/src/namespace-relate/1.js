var testDuplicated = 1;
function checkValidStudent(p) {
    return p.age !== undefined && p.age >= 12 && p.age <= 15;
}
var p1 = {
    name: 'lilei',
    age: 18
};
var p2 = {
    name: 'hanmeimei',
    age: 15
};
function checkPerson(p) {
    if (checkValidStudent(p)) {
        console.log("".concat(p.name, " is a Student"));
    }
    else {
        console.log(Object.prototype.valueOf.call(p));
    }
}
checkPerson(p1);
checkPerson(p2);
