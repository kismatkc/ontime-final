// loggerConfig.js
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
};

// Filter out TrackPlayer logs
console.log = function (...args) {
  if (!args.some((arg) => String(arg).includes("clearSleepTimer"))) {
    originalConsole.log(...args);
  }
};

console.warn = function (...args) {
  if (!args.some((arg) => String(arg).includes("clearSleepTimer"))) {
    originalConsole.warn(...args);
  }
};

console.error = function (...args) {
  if (!args.some((arg) => String(arg).includes("TrackPlayer"))) {
    originalConsole.error(...args);
  }
};

console.info = function (...args) {
  if (!args.some((arg) => String(arg).includes("TrackPlayer"))) {
    originalConsole.info(...args);
  }
};
