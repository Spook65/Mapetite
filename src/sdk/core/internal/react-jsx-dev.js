const REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
const REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
const REACT_SOURCE_KEY = Symbol.for("react.source");

function jsxProdMod(type, config, maybeKey, isStaticChildren, source) {
	let key = null;
	if (void 0 !== maybeKey) {
		key = `${maybeKey}`;
	}
	if (void 0 !== config.key) {
		key = `${config.key}`;
	}

	let props = maybeKey;
	if ("key" in config) {
		props = {};
		for (const propName in config) {
			if ("key" !== propName) {
				props[propName] = config[propName];
			}
		}
	} else {
		props = config;
	}

	const ref = props.ref;
	const result = {
		$$typeof: REACT_ELEMENT_TYPE,
		type: type,
		key: key,
		ref: void 0 !== ref ? ref : null,
		props: props,
	};
	if (source) {
		Object.defineProperty(props, REACT_SOURCE_KEY, {
			value: () => source,
			configurable: true,
			enumerable: true,
		});
	}
	return result;
}

export const Fragment = REACT_FRAGMENT_TYPE;
export const jsx = jsxProdMod;
export const jsxDEV = jsxProdMod;
export const jsxs = jsxProdMod;
