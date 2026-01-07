// Minimal structured logger for backend services.
// Exists to provide consistent, parseable logs in production environments.
// Does NOT ship logs to external providers; wiring to Logflare/Datadog/etc. stays outside this module.
const format = (level, message, meta) => {
  const ts = new Date().toISOString();
  const base = { ts, level, message };
  const payload = meta ? { ...base, ...meta } : base;
  return JSON.stringify(payload);
};

export const logger = {
  info(message, meta) {
    console.log(format("info", message, meta));
  },
  warn(message, meta) {
    console.warn(format("warn", message, meta));
  },
  error(message, meta) {
    console.error(format("error", message, meta));
  },
};

export default logger;



