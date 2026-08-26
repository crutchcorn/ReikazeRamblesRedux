import "@testing-library/jest-dom/vitest";

const localStorageEntries = new Map<string, string>();

const localStorageMock: Storage = {
	get length() {
		return localStorageEntries.size;
	},
	clear() {
		localStorageEntries.clear();
	},
	getItem(key) {
		return localStorageEntries.get(key) ?? null;
	},
	key(index) {
		return [...localStorageEntries.keys()][index] ?? null;
	},
	removeItem(key) {
		localStorageEntries.delete(key);
	},
	setItem(key, value) {
		localStorageEntries.set(key, value);
	},
};

Object.defineProperty(globalThis, "localStorage", {
	configurable: true,
	value: localStorageMock,
});

if (!globalThis.CSS) {
	Object.defineProperty(globalThis, "CSS", {
		configurable: true,
		value: {},
	});
}

if (!globalThis.CSS.supports) {
	Object.defineProperty(globalThis.CSS, "supports", {
		configurable: true,
		value: () => false,
	});
}
