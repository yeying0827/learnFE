// Set
console.log( 'Set=========' );
class XSet extends Set {
	union(...sets) {
		return XSet.union(this, ...sets);
	}

	intersection(...sets) {
		return XSet.intersection(this, ...sets);
	}

	difference(set) {
		return XSet.difference(this, set);
	}

	symmetricDifference(set) {
		return XSet.symmetricDifference(this, set);
	}

	cartesianProduct(set) {
		return XSet.cartesianProduct(this, set);
	}

	powerSet() {
		return XSet.powerSet(this);
	}

	// 返回两个或多个集合的并集
	static union(a, ...bSets) {
		const unionSet = new XSet(a);
		for (const b of bSets) {
			for (const bValue of b) {
				unionSet.add(bValue);
			}
		}
		return unionSet;
	}

	// 返回两个或多个集合的交集
	static intersection(a, ...bSets) {
		const intersectionSet = new XSet(a);
		for (const aValue of intersectionSet) {
			for (const b of bSets) {
				if(!b.has(aValue)) {
					intersectionSet.delete(aValue);
				}
			}
		} 
		return intersectionSet;
	}

	// 返回两个集合的差集 a-b
	static difference(a, b) {
		const differenceSet = new XSet(a);
		for (const bValue of b) {
			if(a.has(bValue)) {
				differenceSet.delete(bValue);
			}
		}
		return differenceSet;
	}

	// 返回两个集合的对称差集 (a-b)+(b-a) | a和b的并集-a和b的交集
	static symmetricDifference(a, b) {
		return a.union(b).difference(a.intersection(b));
	}

	// 返回两个集合（数组对形式）的笛卡尔积
	// 必须返回数组集合，因为笛卡尔积可能包含相同值的对
	static cartesianProduct(a, b) {
		const cartesianProductSet = new XSet();
		for (const aValue of a) {
			for (const bValue of b) {
				cartesianProductSet.add([aValue, bValue]);
			}
		}
		return cartesianProductSet;
	}

	// 返回一个集合的幂集
	static powerSet(a) {
		const powerSet = new XSet().add(new XSet());
		for (const aValue of a) {
			for (const set of new XSet(powerSet)) {
				powerSet.add(new XSet(set).add(aValue));
			}
		}
		return powerSet;
	}
}
let xSet = new XSet().add(1);
console.log( xSet.powerSet() ); // XSet(2) [Set] { XSet(0) [Set] {}, XSet(1) [Set] { 1 } }
xSet.add(2);
console.log( xSet.powerSet() );
// XSet(4) [Set] {
//   XSet(0) [Set] {},
//   XSet(1) [Set] { 1 },
//   XSet(1) [Set] { 2 },
//   XSet(2) [Set] { 1, 2 }
// }