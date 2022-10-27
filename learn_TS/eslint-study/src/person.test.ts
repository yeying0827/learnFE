import {Person} from "./person";

test('test person', () => {
    const person = new Person('hanmeimei', 12);

    expect(person).toBeInstanceOf(Person);
    expect(person).not.toEqual({
        name: 'cxk'
    });
})
