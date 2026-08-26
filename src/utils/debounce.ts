// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
export function debounce<T extends (...args: never[]) => unknown>(
	func: T,
	wait: number,
	immediate: boolean,
): T {
	let timeout: number | null;
	return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
		const later = () => {
			timeout = null;
			if (!immediate) func.apply(this, args);
		};
		const callNow = immediate && !timeout;
		clearTimeout(timeout as number);
		timeout = setTimeout(later, wait) as never as number;
		if (callNow) func.apply(this, args);
	} as never;
}
