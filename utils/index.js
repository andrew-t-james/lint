function loggr(type, ...args) {
  console[type](...args);
}

export { loggr };
