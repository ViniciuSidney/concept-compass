class FakeStyle {
  constructor() {
    this.values = new Map();
  }
  setProperty(name, value) {
    this.values.set(name, String(value));
  }
  getPropertyValue(name) {
    return this.values.get(name) ?? '';
  }
}
class FakeClassList {
  constructor(element) {
    this.element = element;
  }
  read() {
    return new Set(this.element.className.split(/\s+/).filter(Boolean));
  }
  write(values) {
    this.element.className = [...values].join(' ');
  }
  add(...tokens) {
    const values = this.read();
    tokens.forEach((token) => values.add(token));
    this.write(values);
  }
  remove(...tokens) {
    const values = this.read();
    tokens.forEach((token) => values.delete(token));
    this.write(values);
  }
  contains(token) {
    return this.read().has(token);
  }
  toggle(token, force) {
    const values = this.read();
    const add = force ?? !values.has(token);
    if (add) values.add(token);
    else values.delete(token);
    this.write(values);
    return add;
  }
}
export class FakeElement {
  constructor(documentObject, tagName) {
    this.ownerDocument = documentObject;
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map();
    this.dataset = {};
    this.children = [];
    this.listeners = new Map();
    this.style = new FakeStyle();
    this.className = '';
    this.classList = new FakeClassList(this);
    this.hidden = false;
    this.inert = false;
    this.disabled = false;
    this.tabIndex = 0;
    this.value = '';
    this.type = '';
    this.id = '';
    this.href = '';
    this.isConnected = false;
    this._text = '';
  }
  get textContent() {
    return (
      this._text +
      this.children.map((child) => (typeof child === 'string' ? child : child.textContent)).join('')
    );
  }
  set textContent(value) {
    this._text = String(value ?? '');
    this.children = [];
  }
  append(...items) {
    for (const item of items.flat()) {
      if (item === null || item === undefined) continue;
      this.children.push(item);
      if (typeof item !== 'string') item.isConnected = this.isConnected;
    }
  }
  replaceChildren(...items) {
    this.children = [];
    this._text = '';
    this.append(...items);
  }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name === 'id') this.id = String(value);
  }
  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }
  removeAttribute(name) {
    this.attributes.delete(name);
  }
  addEventListener(type, listener) {
    const list = this.listeners.get(type) ?? [];
    list.push(listener);
    this.listeners.set(type, list);
  }
  removeEventListener(type, listener) {
    this.listeners.set(
      type,
      (this.listeners.get(type) ?? []).filter((item) => item !== listener),
    );
  }
  dispatch(type, overrides = {}) {
    const event = {
      type,
      target: this,
      currentTarget: this,
      key: null,
      shiftKey: false,
      preventDefault() {},
      stopPropagation() {},
      ...overrides,
    };
    for (const listener of this.listeners.get(type) ?? []) listener(event);
    return event;
  }
  contains(target) {
    if (target === this) return true;
    return this.children.some((child) => typeof child !== 'string' && child.contains?.(target));
  }
  closest(selector) {
    if (selector === 'a' && this.tagName === 'A') return this;
    return null;
  }
  focus() {
    this.ownerDocument.activeElement = this;
  }
  click() {
    if (!this.disabled) this.dispatch('click');
  }
  remove() {
    this.isConnected = false;
  }
}
export function createFakeDocument({ prefersDark = false } = {}) {
  const documentObject = {
    activeElement: null,
    listeners: new Map(),
    createElement(tag) {
      return new FakeElement(this, tag);
    },
    createElementNS(_ns, tag) {
      return new FakeElement(this, tag);
    },
    querySelector(selector) {
      if (selector === 'meta[name="theme-color"]') return this.themeColorMeta;
      if (selector.startsWith('#')) return findById(this.body, selector.slice(1));
      return null;
    },
    addEventListener(type, listener) {
      const list = this.listeners.get(type) ?? [];
      list.push(listener);
      this.listeners.set(type, list);
    },
    removeEventListener(type, listener) {
      this.listeners.set(
        type,
        (this.listeners.get(type) ?? []).filter((item) => item !== listener),
      );
    },
    dispatch(type, event = {}) {
      const nextEvent = {
        type,
        key: null,
        shiftKey: false,
        preventDefault() {},
        stopPropagation() {},
        ...event,
      };
      for (const listener of this.listeners.get(type) ?? []) listener(nextEvent);
      return nextEvent;
    },
  };
  const mediaListeners = new Set();
  const mediaQuery = {
    matches: prefersDark,
    addEventListener(type, listener) {
      if (type === 'change') mediaListeners.add(listener);
    },
    removeEventListener(type, listener) {
      if (type === 'change') mediaListeners.delete(listener);
    },
    setMatches(matches) {
      this.matches = matches;
      for (const listener of mediaListeners) listener({ matches });
    },
  };
  const windowListeners = new Map();
  const windowObject = {
    innerWidth: 1024,
    matchMedia() {
      return mediaQuery;
    },
    requestAnimationFrame(callback) {
      callback();
    },
    addEventListener(type, listener) {
      const list = windowListeners.get(type) ?? [];
      list.push(listener);
      windowListeners.set(type, list);
    },
    removeEventListener(type, listener) {
      windowListeners.set(
        type,
        (windowListeners.get(type) ?? []).filter((item) => item !== listener),
      );
    },
    dispatch(type, event = {}) {
      for (const listener of windowListeners.get(type) ?? []) listener(event);
    },
  };
  documentObject.documentElement = new FakeElement(documentObject, 'html');
  documentObject.body = new FakeElement(documentObject, 'body');
  documentObject.body.isConnected = true;
  documentObject.themeColorMeta = new FakeElement(documentObject, 'meta');
  documentObject.defaultView = windowObject;
  return { documentObject, windowObject, mediaQuery };
}

function findById(element, id) {
  if (!element || typeof element === 'string') return null;
  if (element.id === id) return element;
  for (const child of element.children ?? []) {
    const match = findById(child, id);
    if (match) return match;
  }
  return null;
}
