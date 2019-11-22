function loggr(methodName, ...args) {
  console[methodName](...args);
}

export { loggr };
