#!/usr/bin/env node
import { createRequire as __createRequire } from "node:module";
const require = __createRequire(import.meta.url);
{
  const __n = process.versions.node.split('.').map(Number);
  if (__n[0] < 22 || (__n[0] === 22 && __n[1] < 13)) {
    process.stderr.write(`\n  wolfram-mcp-server needs Node 22.13 or newer; this is ${process.versions.node}.\n` +
      `  Install a current Node (https://nodejs.org) and restart your MCP client.\n\n`);
    process.exit(1);
  }
}
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/zod/v4/core/core.js
// @__NO_SIDE_EFFECTS__
function $constructor(name, initializer3, params) {
  function init(inst, def) {
    if (!inst._zod) {
      Object.defineProperty(inst, "_zod", {
        value: {
          def,
          constr: _,
          traits: /* @__PURE__ */ new Set()
        },
        enumerable: false
      });
    }
    if (inst._zod.traits.has(name)) {
      return;
    }
    inst._zod.traits.add(name);
    initializer3(inst, def);
    const proto = _.prototype;
    const keys = Object.keys(proto);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (!(k in inst)) {
        inst[k] = proto[k].bind(inst);
      }
    }
  }
  const Parent = params?.Parent ?? Object;
  class Definition extends Parent {
  }
  Object.defineProperty(Definition, "name", { value: name });
  function _(def) {
    var _a3;
    const inst = params?.Parent ? new Definition() : this;
    init(inst, def);
    (_a3 = inst._zod).deferred ?? (_a3.deferred = []);
    for (const fn of inst._zod.deferred) {
      fn();
    }
    return inst;
  }
  Object.defineProperty(_, "init", { value: init });
  Object.defineProperty(_, Symbol.hasInstance, {
    value: (inst) => {
      if (params?.Parent && inst instanceof params.Parent)
        return true;
      return inst?._zod?.traits?.has(name);
    }
  });
  Object.defineProperty(_, "name", { value: name });
  return _;
}
function config(newConfig) {
  if (newConfig)
    Object.assign(globalConfig, newConfig);
  return globalConfig;
}
var _a, $ZodAsyncError, $ZodEncodeError, globalConfig;
var init_core = __esm({
  "node_modules/zod/v4/core/core.js"() {
    $ZodAsyncError = class extends Error {
      constructor() {
        super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
      }
    };
    $ZodEncodeError = class extends Error {
      constructor(name) {
        super(`Encountered unidirectional transform during encode: ${name}`);
        this.name = "ZodEncodeError";
      }
    };
    (_a = globalThis).__zod_globalConfig ?? (_a.__zod_globalConfig = {});
    globalConfig = globalThis.__zod_globalConfig;
  }
});

// node_modules/zod/v4/core/util.js
var util_exports = {};
__export(util_exports, {
  BIGINT_FORMAT_RANGES: () => BIGINT_FORMAT_RANGES,
  Class: () => Class,
  NUMBER_FORMAT_RANGES: () => NUMBER_FORMAT_RANGES,
  aborted: () => aborted,
  allowsEval: () => allowsEval,
  assert: () => assert,
  assertEqual: () => assertEqual,
  assertIs: () => assertIs,
  assertNever: () => assertNever,
  assertNotEqual: () => assertNotEqual,
  assignProp: () => assignProp,
  base64ToUint8Array: () => base64ToUint8Array,
  base64urlToUint8Array: () => base64urlToUint8Array,
  cached: () => cached,
  captureStackTrace: () => captureStackTrace,
  cleanEnum: () => cleanEnum,
  cleanRegex: () => cleanRegex,
  clone: () => clone,
  cloneDef: () => cloneDef,
  createTransparentProxy: () => createTransparentProxy,
  defineLazy: () => defineLazy,
  esc: () => esc,
  escapeRegex: () => escapeRegex,
  explicitlyAborted: () => explicitlyAborted,
  extend: () => extend,
  finalizeIssue: () => finalizeIssue,
  floatSafeRemainder: () => floatSafeRemainder,
  getElementAtPath: () => getElementAtPath,
  getEnumValues: () => getEnumValues,
  getLengthableOrigin: () => getLengthableOrigin,
  getParsedType: () => getParsedType,
  getSizableOrigin: () => getSizableOrigin,
  hexToUint8Array: () => hexToUint8Array,
  isObject: () => isObject,
  isPlainObject: () => isPlainObject,
  issue: () => issue,
  joinValues: () => joinValues,
  jsonStringifyReplacer: () => jsonStringifyReplacer,
  merge: () => merge,
  mergeDefs: () => mergeDefs,
  normalizeParams: () => normalizeParams,
  nullish: () => nullish,
  numKeys: () => numKeys,
  objectClone: () => objectClone,
  omit: () => omit,
  optionalKeys: () => optionalKeys,
  parsedType: () => parsedType,
  partial: () => partial,
  pick: () => pick,
  prefixIssues: () => prefixIssues,
  primitiveTypes: () => primitiveTypes,
  promiseAllObject: () => promiseAllObject,
  propertyKeyTypes: () => propertyKeyTypes,
  randomString: () => randomString,
  required: () => required,
  safeExtend: () => safeExtend,
  shallowClone: () => shallowClone,
  slugify: () => slugify,
  stringifyPrimitive: () => stringifyPrimitive,
  uint8ArrayToBase64: () => uint8ArrayToBase64,
  uint8ArrayToBase64url: () => uint8ArrayToBase64url,
  uint8ArrayToHex: () => uint8ArrayToHex,
  unwrapMessage: () => unwrapMessage
});
function assertEqual(val) {
  return val;
}
function assertNotEqual(val) {
  return val;
}
function assertIs(_arg) {
}
function assertNever(_x) {
  throw new Error("Unexpected value in exhaustive check");
}
function assert(_) {
}
function getEnumValues(entries) {
  const numericValues = Object.values(entries).filter((v) => typeof v === "number");
  const values = Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
  return values;
}
function joinValues(array2, separator = "|") {
  return array2.map((val) => stringifyPrimitive(val)).join(separator);
}
function jsonStringifyReplacer(_, value) {
  if (typeof value === "bigint")
    return value.toString();
  return value;
}
function cached(getter) {
  const set = false;
  return {
    get value() {
      if (!set) {
        const value = getter();
        Object.defineProperty(this, "value", { value });
        return value;
      }
      throw new Error("cached value already set");
    }
  };
}
function nullish(input) {
  return input === null || input === void 0;
}
function cleanRegex(source) {
  const start = source.startsWith("^") ? 1 : 0;
  const end = source.endsWith("$") ? source.length - 1 : source.length;
  return source.slice(start, end);
}
function floatSafeRemainder(val, step) {
  const ratio = val / step;
  const roundedRatio = Math.round(ratio);
  const tolerance = Number.EPSILON * Math.max(Math.abs(ratio), 1);
  if (Math.abs(ratio - roundedRatio) < tolerance)
    return 0;
  return ratio - roundedRatio;
}
function defineLazy(object3, key, getter) {
  let value = void 0;
  Object.defineProperty(object3, key, {
    get() {
      if (value === EVALUATING) {
        return void 0;
      }
      if (value === void 0) {
        value = EVALUATING;
        value = getter();
      }
      return value;
    },
    set(v) {
      Object.defineProperty(object3, key, {
        value: v
        // configurable: true,
      });
    },
    configurable: true
  });
}
function objectClone(obj) {
  return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
}
function assignProp(target, prop, value) {
  Object.defineProperty(target, prop, {
    value,
    writable: true,
    enumerable: true,
    configurable: true
  });
}
function mergeDefs(...defs) {
  const mergedDescriptors = {};
  for (const def of defs) {
    const descriptors = Object.getOwnPropertyDescriptors(def);
    Object.assign(mergedDescriptors, descriptors);
  }
  return Object.defineProperties({}, mergedDescriptors);
}
function cloneDef(schema) {
  return mergeDefs(schema._zod.def);
}
function getElementAtPath(obj, path) {
  if (!path)
    return obj;
  return path.reduce((acc, key) => acc?.[key], obj);
}
function promiseAllObject(promisesObj) {
  const keys = Object.keys(promisesObj);
  const promises = keys.map((key) => promisesObj[key]);
  return Promise.all(promises).then((results) => {
    const resolvedObj = {};
    for (let i = 0; i < keys.length; i++) {
      resolvedObj[keys[i]] = results[i];
    }
    return resolvedObj;
  });
}
function randomString(length = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let str = "";
  for (let i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}
function esc(str) {
  return JSON.stringify(str);
}
function slugify(input) {
  return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
function isObject(data) {
  return typeof data === "object" && data !== null && !Array.isArray(data);
}
function isPlainObject(o) {
  if (isObject(o) === false)
    return false;
  const ctor = o.constructor;
  if (ctor === void 0)
    return true;
  if (typeof ctor !== "function")
    return true;
  const prot = ctor.prototype;
  if (isObject(prot) === false)
    return false;
  if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) {
    return false;
  }
  return true;
}
function shallowClone(o) {
  if (isPlainObject(o))
    return { ...o };
  if (Array.isArray(o))
    return [...o];
  if (o instanceof Map)
    return new Map(o);
  if (o instanceof Set)
    return new Set(o);
  return o;
}
function numKeys(data) {
  let keyCount = 0;
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      keyCount++;
    }
  }
  return keyCount;
}
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clone(inst, def, params) {
  const cl = new inst._zod.constr(def ?? inst._zod.def);
  if (!def || params?.parent)
    cl._zod.parent = inst;
  return cl;
}
function normalizeParams(_params) {
  const params = _params;
  if (!params)
    return {};
  if (typeof params === "string")
    return { error: () => params };
  if (params?.message !== void 0) {
    if (params?.error !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    params.error = params.message;
  }
  delete params.message;
  if (typeof params.error === "string")
    return { ...params, error: () => params.error };
  return params;
}
function createTransparentProxy(getter) {
  let target;
  return new Proxy({}, {
    get(_, prop, receiver) {
      target ?? (target = getter());
      return Reflect.get(target, prop, receiver);
    },
    set(_, prop, value, receiver) {
      target ?? (target = getter());
      return Reflect.set(target, prop, value, receiver);
    },
    has(_, prop) {
      target ?? (target = getter());
      return Reflect.has(target, prop);
    },
    deleteProperty(_, prop) {
      target ?? (target = getter());
      return Reflect.deleteProperty(target, prop);
    },
    ownKeys(_) {
      target ?? (target = getter());
      return Reflect.ownKeys(target);
    },
    getOwnPropertyDescriptor(_, prop) {
      target ?? (target = getter());
      return Reflect.getOwnPropertyDescriptor(target, prop);
    },
    defineProperty(_, prop, descriptor) {
      target ?? (target = getter());
      return Reflect.defineProperty(target, prop, descriptor);
    }
  });
}
function stringifyPrimitive(value) {
  if (typeof value === "bigint")
    return value.toString() + "n";
  if (typeof value === "string")
    return `"${value}"`;
  return `${value}`;
}
function optionalKeys(shape) {
  return Object.keys(shape).filter((k) => {
    return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
  });
}
function pick(schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const newShape = {};
      for (const key in mask) {
        if (!(key in currDef.shape)) {
          throw new Error(`Unrecognized key: "${key}"`);
        }
        if (!mask[key])
          continue;
        newShape[key] = currDef.shape[key];
      }
      assignProp(this, "shape", newShape);
      return newShape;
    },
    checks: []
  });
  return clone(schema, def);
}
function omit(schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const newShape = { ...schema._zod.def.shape };
      for (const key in mask) {
        if (!(key in currDef.shape)) {
          throw new Error(`Unrecognized key: "${key}"`);
        }
        if (!mask[key])
          continue;
        delete newShape[key];
      }
      assignProp(this, "shape", newShape);
      return newShape;
    },
    checks: []
  });
  return clone(schema, def);
}
function extend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to extend: expected a plain object");
  }
  const checks = schema._zod.def.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    const existingShape = schema._zod.def.shape;
    for (const key in shape) {
      if (Object.getOwnPropertyDescriptor(existingShape, key) !== void 0) {
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
      }
    }
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const _shape = { ...schema._zod.def.shape, ...shape };
      assignProp(this, "shape", _shape);
      return _shape;
    }
  });
  return clone(schema, def);
}
function safeExtend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to safeExtend: expected a plain object");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const _shape = { ...schema._zod.def.shape, ...shape };
      assignProp(this, "shape", _shape);
      return _shape;
    }
  });
  return clone(schema, def);
}
function merge(a, b) {
  if (a._zod.def.checks?.length) {
    throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
  }
  const def = mergeDefs(a._zod.def, {
    get shape() {
      const _shape = { ...a._zod.def.shape, ...b._zod.def.shape };
      assignProp(this, "shape", _shape);
      return _shape;
    },
    get catchall() {
      return b._zod.def.catchall;
    },
    checks: b._zod.def.checks ?? []
  });
  return clone(a, def);
}
function partial(Class2, schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const oldShape = schema._zod.def.shape;
      const shape = { ...oldShape };
      if (mask) {
        for (const key in mask) {
          if (!(key in oldShape)) {
            throw new Error(`Unrecognized key: "${key}"`);
          }
          if (!mask[key])
            continue;
          shape[key] = Class2 ? new Class2({
            type: "optional",
            innerType: oldShape[key]
          }) : oldShape[key];
        }
      } else {
        for (const key in oldShape) {
          shape[key] = Class2 ? new Class2({
            type: "optional",
            innerType: oldShape[key]
          }) : oldShape[key];
        }
      }
      assignProp(this, "shape", shape);
      return shape;
    },
    checks: []
  });
  return clone(schema, def);
}
function required(Class2, schema, mask) {
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const oldShape = schema._zod.def.shape;
      const shape = { ...oldShape };
      if (mask) {
        for (const key in mask) {
          if (!(key in shape)) {
            throw new Error(`Unrecognized key: "${key}"`);
          }
          if (!mask[key])
            continue;
          shape[key] = new Class2({
            type: "nonoptional",
            innerType: oldShape[key]
          });
        }
      } else {
        for (const key in oldShape) {
          shape[key] = new Class2({
            type: "nonoptional",
            innerType: oldShape[key]
          });
        }
      }
      assignProp(this, "shape", shape);
      return shape;
    }
  });
  return clone(schema, def);
}
function aborted(x, startIndex = 0) {
  if (x.aborted === true)
    return true;
  for (let i = startIndex; i < x.issues.length; i++) {
    if (x.issues[i]?.continue !== true) {
      return true;
    }
  }
  return false;
}
function explicitlyAborted(x, startIndex = 0) {
  if (x.aborted === true)
    return true;
  for (let i = startIndex; i < x.issues.length; i++) {
    if (x.issues[i]?.continue === false) {
      return true;
    }
  }
  return false;
}
function prefixIssues(path, issues) {
  return issues.map((iss) => {
    var _a3;
    (_a3 = iss).path ?? (_a3.path = []);
    iss.path.unshift(path);
    return iss;
  });
}
function unwrapMessage(message) {
  return typeof message === "string" ? message : message?.message;
}
function finalizeIssue(iss, ctx, config2) {
  const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config2.customError?.(iss)) ?? unwrapMessage(config2.localeError?.(iss)) ?? "Invalid input";
  const { inst: _inst, continue: _continue, input: _input, ...rest } = iss;
  rest.path ?? (rest.path = []);
  rest.message = message;
  if (ctx?.reportInput) {
    rest.input = _input;
  }
  return rest;
}
function getSizableOrigin(input) {
  if (input instanceof Set)
    return "set";
  if (input instanceof Map)
    return "map";
  if (input instanceof File)
    return "file";
  return "unknown";
}
function getLengthableOrigin(input) {
  if (Array.isArray(input))
    return "array";
  if (typeof input === "string")
    return "string";
  return "unknown";
}
function parsedType(data) {
  const t = typeof data;
  switch (t) {
    case "number": {
      return Number.isNaN(data) ? "nan" : "number";
    }
    case "object": {
      if (data === null) {
        return "null";
      }
      if (Array.isArray(data)) {
        return "array";
      }
      const obj = data;
      if (obj && Object.getPrototypeOf(obj) !== Object.prototype && "constructor" in obj && obj.constructor) {
        return obj.constructor.name;
      }
    }
  }
  return t;
}
function issue(...args) {
  const [iss, input, inst] = args;
  if (typeof iss === "string") {
    return {
      message: iss,
      code: "custom",
      input,
      inst
    };
  }
  return { ...iss };
}
function cleanEnum(obj) {
  return Object.entries(obj).filter(([k, _]) => {
    return Number.isNaN(Number.parseInt(k, 10));
  }).map((el) => el[1]);
}
function base64ToUint8Array(base642) {
  const binaryString = atob(base642);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
function uint8ArrayToBase64(bytes) {
  let binaryString = "";
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  return btoa(binaryString);
}
function base64urlToUint8Array(base64url2) {
  const base642 = base64url2.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - base642.length % 4) % 4);
  return base64ToUint8Array(base642 + padding);
}
function uint8ArrayToBase64url(bytes) {
  return uint8ArrayToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function hexToUint8Array(hex) {
  const cleanHex = hex.replace(/^0x/, "");
  if (cleanHex.length % 2 !== 0) {
    throw new Error("Invalid hex string length");
  }
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(cleanHex.slice(i, i + 2), 16);
  }
  return bytes;
}
function uint8ArrayToHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
var EVALUATING, captureStackTrace, allowsEval, getParsedType, propertyKeyTypes, primitiveTypes, NUMBER_FORMAT_RANGES, BIGINT_FORMAT_RANGES, Class;
var init_util = __esm({
  "node_modules/zod/v4/core/util.js"() {
    init_core();
    EVALUATING = /* @__PURE__ */ Symbol("evaluating");
    captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {
    };
    allowsEval = /* @__PURE__ */ cached(() => {
      if (globalConfig.jitless) {
        return false;
      }
      if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) {
        return false;
      }
      try {
        const F = Function;
        new F("");
        return true;
      } catch (_) {
        return false;
      }
    });
    getParsedType = (data) => {
      const t = typeof data;
      switch (t) {
        case "undefined":
          return "undefined";
        case "string":
          return "string";
        case "number":
          return Number.isNaN(data) ? "nan" : "number";
        case "boolean":
          return "boolean";
        case "function":
          return "function";
        case "bigint":
          return "bigint";
        case "symbol":
          return "symbol";
        case "object":
          if (Array.isArray(data)) {
            return "array";
          }
          if (data === null) {
            return "null";
          }
          if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
            return "promise";
          }
          if (typeof Map !== "undefined" && data instanceof Map) {
            return "map";
          }
          if (typeof Set !== "undefined" && data instanceof Set) {
            return "set";
          }
          if (typeof Date !== "undefined" && data instanceof Date) {
            return "date";
          }
          if (typeof File !== "undefined" && data instanceof File) {
            return "file";
          }
          return "object";
        default:
          throw new Error(`Unknown data type: ${t}`);
      }
    };
    propertyKeyTypes = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
    primitiveTypes = /* @__PURE__ */ new Set([
      "string",
      "number",
      "bigint",
      "boolean",
      "symbol",
      "undefined"
    ]);
    NUMBER_FORMAT_RANGES = {
      safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
      int32: [-2147483648, 2147483647],
      uint32: [0, 4294967295],
      float32: [-34028234663852886e22, 34028234663852886e22],
      float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
    };
    BIGINT_FORMAT_RANGES = {
      int64: [/* @__PURE__ */ BigInt("-9223372036854775808"), /* @__PURE__ */ BigInt("9223372036854775807")],
      uint64: [/* @__PURE__ */ BigInt(0), /* @__PURE__ */ BigInt("18446744073709551615")]
    };
    Class = class {
      constructor(..._args) {
      }
    };
  }
});

// node_modules/zod/v4/core/errors.js
function flattenError(error2, mapper = (issue2) => issue2.message) {
  const fieldErrors = {};
  const formErrors = [];
  for (const sub of error2.issues) {
    if (sub.path.length > 0) {
      fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
      fieldErrors[sub.path[0]].push(mapper(sub));
    } else {
      formErrors.push(mapper(sub));
    }
  }
  return { formErrors, fieldErrors };
}
function formatError(error2, mapper = (issue2) => issue2.message) {
  const fieldErrors = { _errors: [] };
  const processError = (error3, path = []) => {
    for (const issue2 of error3.issues) {
      if (issue2.code === "invalid_union" && issue2.errors.length) {
        issue2.errors.map((issues) => processError({ issues }, [...path, ...issue2.path]));
      } else if (issue2.code === "invalid_key") {
        processError({ issues: issue2.issues }, [...path, ...issue2.path]);
      } else if (issue2.code === "invalid_element") {
        processError({ issues: issue2.issues }, [...path, ...issue2.path]);
      } else {
        const fullpath = [...path, ...issue2.path];
        if (fullpath.length === 0) {
          fieldErrors._errors.push(mapper(issue2));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < fullpath.length) {
            const el = fullpath[i];
            const terminal = i === fullpath.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue2));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    }
  };
  processError(error2);
  return fieldErrors;
}
var initializer, $ZodError, $ZodRealError;
var init_errors = __esm({
  "node_modules/zod/v4/core/errors.js"() {
    init_core();
    init_util();
    initializer = (inst, def) => {
      inst.name = "$ZodError";
      Object.defineProperty(inst, "_zod", {
        value: inst._zod,
        enumerable: false
      });
      Object.defineProperty(inst, "issues", {
        value: def,
        enumerable: false
      });
      inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
      Object.defineProperty(inst, "toString", {
        value: () => inst.message,
        enumerable: false
      });
    };
    $ZodError = $constructor("$ZodError", initializer);
    $ZodRealError = $constructor("$ZodError", initializer, { Parent: Error });
  }
});

// node_modules/zod/v4/core/parse.js
var _parse, _parseAsync, _safeParse, safeParse, _safeParseAsync, safeParseAsync, _encode, _decode, _encodeAsync, _decodeAsync, _safeEncode, _safeDecode, _safeEncodeAsync, _safeDecodeAsync;
var init_parse = __esm({
  "node_modules/zod/v4/core/parse.js"() {
    init_core();
    init_errors();
    init_util();
    _parse = (_Err) => (schema, value, _ctx, _params) => {
      const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
      const result = schema._zod.run({ value, issues: [] }, ctx);
      if (result instanceof Promise) {
        throw new $ZodAsyncError();
      }
      if (result.issues.length) {
        const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
        captureStackTrace(e, _params?.callee);
        throw e;
      }
      return result.value;
    };
    _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
      const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
      let result = schema._zod.run({ value, issues: [] }, ctx);
      if (result instanceof Promise)
        result = await result;
      if (result.issues.length) {
        const e = new (params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
        captureStackTrace(e, params?.callee);
        throw e;
      }
      return result.value;
    };
    _safeParse = (_Err) => (schema, value, _ctx) => {
      const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
      const result = schema._zod.run({ value, issues: [] }, ctx);
      if (result instanceof Promise) {
        throw new $ZodAsyncError();
      }
      return result.issues.length ? {
        success: false,
        error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
      } : { success: true, data: result.value };
    };
    safeParse = /* @__PURE__ */ _safeParse($ZodRealError);
    _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
      const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
      let result = schema._zod.run({ value, issues: [] }, ctx);
      if (result instanceof Promise)
        result = await result;
      return result.issues.length ? {
        success: false,
        error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
      } : { success: true, data: result.value };
    };
    safeParseAsync = /* @__PURE__ */ _safeParseAsync($ZodRealError);
    _encode = (_Err) => (schema, value, _ctx) => {
      const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
      return _parse(_Err)(schema, value, ctx);
    };
    _decode = (_Err) => (schema, value, _ctx) => {
      return _parse(_Err)(schema, value, _ctx);
    };
    _encodeAsync = (_Err) => async (schema, value, _ctx) => {
      const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
      return _parseAsync(_Err)(schema, value, ctx);
    };
    _decodeAsync = (_Err) => async (schema, value, _ctx) => {
      return _parseAsync(_Err)(schema, value, _ctx);
    };
    _safeEncode = (_Err) => (schema, value, _ctx) => {
      const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
      return _safeParse(_Err)(schema, value, ctx);
    };
    _safeDecode = (_Err) => (schema, value, _ctx) => {
      return _safeParse(_Err)(schema, value, _ctx);
    };
    _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
      const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
      return _safeParseAsync(_Err)(schema, value, ctx);
    };
    _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
      return _safeParseAsync(_Err)(schema, value, _ctx);
    };
  }
});

// node_modules/zod/v4/core/regexes.js
function emoji() {
  return new RegExp(_emoji, "u");
}
function timeSource(args) {
  const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
  const regex = typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
  return regex;
}
function time(args) {
  return new RegExp(`^${timeSource(args)}$`);
}
function datetime(args) {
  const time3 = timeSource({ precision: args.precision });
  const opts = ["Z"];
  if (args.local)
    opts.push("");
  if (args.offset)
    opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
  const timeRegex = `${time3}(?:${opts.join("|")})`;
  return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
}
var cuid, cuid2, ulid, xid, ksuid, nanoid, duration, guid, uuid, email, _emoji, ipv4, ipv6, cidrv4, cidrv6, base64, base64url, httpProtocol, e164, dateSource, date, string, integer, number, boolean, _null, lowercase, uppercase;
var init_regexes = __esm({
  "node_modules/zod/v4/core/regexes.js"() {
    cuid = /^[cC][0-9a-z]{6,}$/;
    cuid2 = /^[0-9a-z]+$/;
    ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
    xid = /^[0-9a-vA-V]{20}$/;
    ksuid = /^[A-Za-z0-9]{27}$/;
    nanoid = /^[a-zA-Z0-9_-]{21}$/;
    duration = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
    guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
    uuid = (version2) => {
      if (!version2)
        return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
      return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version2}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
    };
    email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
    _emoji = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
    ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
    ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
    cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
    cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
    base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
    base64url = /^[A-Za-z0-9_-]*$/;
    httpProtocol = /^https?$/;
    e164 = /^\+[1-9]\d{6,14}$/;
    dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
    date = /* @__PURE__ */ new RegExp(`^${dateSource}$`);
    string = (params) => {
      const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
      return new RegExp(`^${regex}$`);
    };
    integer = /^-?\d+$/;
    number = /^-?\d+(?:\.\d+)?$/;
    boolean = /^(?:true|false)$/i;
    _null = /^null$/i;
    lowercase = /^[^A-Z]*$/;
    uppercase = /^[^a-z]*$/;
  }
});

// node_modules/zod/v4/core/checks.js
var $ZodCheck, numericOriginMap, $ZodCheckLessThan, $ZodCheckGreaterThan, $ZodCheckMultipleOf, $ZodCheckNumberFormat, $ZodCheckMaxLength, $ZodCheckMinLength, $ZodCheckLengthEquals, $ZodCheckStringFormat, $ZodCheckRegex, $ZodCheckLowerCase, $ZodCheckUpperCase, $ZodCheckIncludes, $ZodCheckStartsWith, $ZodCheckEndsWith, $ZodCheckOverwrite;
var init_checks = __esm({
  "node_modules/zod/v4/core/checks.js"() {
    init_core();
    init_regexes();
    init_util();
    $ZodCheck = /* @__PURE__ */ $constructor("$ZodCheck", (inst, def) => {
      var _a3;
      inst._zod ?? (inst._zod = {});
      inst._zod.def = def;
      (_a3 = inst._zod).onattach ?? (_a3.onattach = []);
    });
    numericOriginMap = {
      number: "number",
      bigint: "bigint",
      object: "date"
    };
    $ZodCheckLessThan = /* @__PURE__ */ $constructor("$ZodCheckLessThan", (inst, def) => {
      $ZodCheck.init(inst, def);
      const origin = numericOriginMap[typeof def.value];
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
        if (def.value < curr) {
          if (def.inclusive)
            bag.maximum = def.value;
          else
            bag.exclusiveMaximum = def.value;
        }
      });
      inst._zod.check = (payload) => {
        if (def.inclusive ? payload.value <= def.value : payload.value < def.value) {
          return;
        }
        payload.issues.push({
          origin,
          code: "too_big",
          maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
          input: payload.value,
          inclusive: def.inclusive,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodCheckGreaterThan = /* @__PURE__ */ $constructor("$ZodCheckGreaterThan", (inst, def) => {
      $ZodCheck.init(inst, def);
      const origin = numericOriginMap[typeof def.value];
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
        if (def.value > curr) {
          if (def.inclusive)
            bag.minimum = def.value;
          else
            bag.exclusiveMinimum = def.value;
        }
      });
      inst._zod.check = (payload) => {
        if (def.inclusive ? payload.value >= def.value : payload.value > def.value) {
          return;
        }
        payload.issues.push({
          origin,
          code: "too_small",
          minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
          input: payload.value,
          inclusive: def.inclusive,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodCheckMultipleOf = /* @__PURE__ */ $constructor("$ZodCheckMultipleOf", (inst, def) => {
      $ZodCheck.init(inst, def);
      inst._zod.onattach.push((inst2) => {
        var _a3;
        (_a3 = inst2._zod.bag).multipleOf ?? (_a3.multipleOf = def.value);
      });
      inst._zod.check = (payload) => {
        if (typeof payload.value !== typeof def.value)
          throw new Error("Cannot mix number and bigint in multiple_of check.");
        const isMultiple = typeof payload.value === "bigint" ? payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0;
        if (isMultiple)
          return;
        payload.issues.push({
          origin: typeof payload.value,
          code: "not_multiple_of",
          divisor: def.value,
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodCheckNumberFormat = /* @__PURE__ */ $constructor("$ZodCheckNumberFormat", (inst, def) => {
      $ZodCheck.init(inst, def);
      def.format = def.format || "float64";
      const isInt = def.format?.includes("int");
      const origin = isInt ? "int" : "number";
      const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        bag.format = def.format;
        bag.minimum = minimum;
        bag.maximum = maximum;
        if (isInt)
          bag.pattern = integer;
      });
      inst._zod.check = (payload) => {
        const input = payload.value;
        if (isInt) {
          if (!Number.isInteger(input)) {
            payload.issues.push({
              expected: origin,
              format: def.format,
              code: "invalid_type",
              continue: false,
              input,
              inst
            });
            return;
          }
          if (!Number.isSafeInteger(input)) {
            if (input > 0) {
              payload.issues.push({
                input,
                code: "too_big",
                maximum: Number.MAX_SAFE_INTEGER,
                note: "Integers must be within the safe integer range.",
                inst,
                origin,
                inclusive: true,
                continue: !def.abort
              });
            } else {
              payload.issues.push({
                input,
                code: "too_small",
                minimum: Number.MIN_SAFE_INTEGER,
                note: "Integers must be within the safe integer range.",
                inst,
                origin,
                inclusive: true,
                continue: !def.abort
              });
            }
            return;
          }
        }
        if (input < minimum) {
          payload.issues.push({
            origin: "number",
            input,
            code: "too_small",
            minimum,
            inclusive: true,
            inst,
            continue: !def.abort
          });
        }
        if (input > maximum) {
          payload.issues.push({
            origin: "number",
            input,
            code: "too_big",
            maximum,
            inclusive: true,
            inst,
            continue: !def.abort
          });
        }
      };
    });
    $ZodCheckMaxLength = /* @__PURE__ */ $constructor("$ZodCheckMaxLength", (inst, def) => {
      var _a3;
      $ZodCheck.init(inst, def);
      (_a3 = inst._zod.def).when ?? (_a3.when = (payload) => {
        const val = payload.value;
        return !nullish(val) && val.length !== void 0;
      });
      inst._zod.onattach.push((inst2) => {
        const curr = inst2._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
        if (def.maximum < curr)
          inst2._zod.bag.maximum = def.maximum;
      });
      inst._zod.check = (payload) => {
        const input = payload.value;
        const length = input.length;
        if (length <= def.maximum)
          return;
        const origin = getLengthableOrigin(input);
        payload.issues.push({
          origin,
          code: "too_big",
          maximum: def.maximum,
          inclusive: true,
          input,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodCheckMinLength = /* @__PURE__ */ $constructor("$ZodCheckMinLength", (inst, def) => {
      var _a3;
      $ZodCheck.init(inst, def);
      (_a3 = inst._zod.def).when ?? (_a3.when = (payload) => {
        const val = payload.value;
        return !nullish(val) && val.length !== void 0;
      });
      inst._zod.onattach.push((inst2) => {
        const curr = inst2._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
        if (def.minimum > curr)
          inst2._zod.bag.minimum = def.minimum;
      });
      inst._zod.check = (payload) => {
        const input = payload.value;
        const length = input.length;
        if (length >= def.minimum)
          return;
        const origin = getLengthableOrigin(input);
        payload.issues.push({
          origin,
          code: "too_small",
          minimum: def.minimum,
          inclusive: true,
          input,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodCheckLengthEquals = /* @__PURE__ */ $constructor("$ZodCheckLengthEquals", (inst, def) => {
      var _a3;
      $ZodCheck.init(inst, def);
      (_a3 = inst._zod.def).when ?? (_a3.when = (payload) => {
        const val = payload.value;
        return !nullish(val) && val.length !== void 0;
      });
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        bag.minimum = def.length;
        bag.maximum = def.length;
        bag.length = def.length;
      });
      inst._zod.check = (payload) => {
        const input = payload.value;
        const length = input.length;
        if (length === def.length)
          return;
        const origin = getLengthableOrigin(input);
        const tooBig = length > def.length;
        payload.issues.push({
          origin,
          ...tooBig ? { code: "too_big", maximum: def.length } : { code: "too_small", minimum: def.length },
          inclusive: true,
          exact: true,
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodCheckStringFormat = /* @__PURE__ */ $constructor("$ZodCheckStringFormat", (inst, def) => {
      var _a3, _b;
      $ZodCheck.init(inst, def);
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        bag.format = def.format;
        if (def.pattern) {
          bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
          bag.patterns.add(def.pattern);
        }
      });
      if (def.pattern)
        (_a3 = inst._zod).check ?? (_a3.check = (payload) => {
          def.pattern.lastIndex = 0;
          if (def.pattern.test(payload.value))
            return;
          payload.issues.push({
            origin: "string",
            code: "invalid_format",
            format: def.format,
            input: payload.value,
            ...def.pattern ? { pattern: def.pattern.toString() } : {},
            inst,
            continue: !def.abort
          });
        });
      else
        (_b = inst._zod).check ?? (_b.check = () => {
        });
    });
    $ZodCheckRegex = /* @__PURE__ */ $constructor("$ZodCheckRegex", (inst, def) => {
      $ZodCheckStringFormat.init(inst, def);
      inst._zod.check = (payload) => {
        def.pattern.lastIndex = 0;
        if (def.pattern.test(payload.value))
          return;
        payload.issues.push({
          origin: "string",
          code: "invalid_format",
          format: "regex",
          input: payload.value,
          pattern: def.pattern.toString(),
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodCheckLowerCase = /* @__PURE__ */ $constructor("$ZodCheckLowerCase", (inst, def) => {
      def.pattern ?? (def.pattern = lowercase);
      $ZodCheckStringFormat.init(inst, def);
    });
    $ZodCheckUpperCase = /* @__PURE__ */ $constructor("$ZodCheckUpperCase", (inst, def) => {
      def.pattern ?? (def.pattern = uppercase);
      $ZodCheckStringFormat.init(inst, def);
    });
    $ZodCheckIncludes = /* @__PURE__ */ $constructor("$ZodCheckIncludes", (inst, def) => {
      $ZodCheck.init(inst, def);
      const escapedRegex = escapeRegex(def.includes);
      const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
      def.pattern = pattern;
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
        bag.patterns.add(pattern);
      });
      inst._zod.check = (payload) => {
        if (payload.value.includes(def.includes, def.position))
          return;
        payload.issues.push({
          origin: "string",
          code: "invalid_format",
          format: "includes",
          includes: def.includes,
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodCheckStartsWith = /* @__PURE__ */ $constructor("$ZodCheckStartsWith", (inst, def) => {
      $ZodCheck.init(inst, def);
      const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
      def.pattern ?? (def.pattern = pattern);
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
        bag.patterns.add(pattern);
      });
      inst._zod.check = (payload) => {
        if (payload.value.startsWith(def.prefix))
          return;
        payload.issues.push({
          origin: "string",
          code: "invalid_format",
          format: "starts_with",
          prefix: def.prefix,
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodCheckEndsWith = /* @__PURE__ */ $constructor("$ZodCheckEndsWith", (inst, def) => {
      $ZodCheck.init(inst, def);
      const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
      def.pattern ?? (def.pattern = pattern);
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
        bag.patterns.add(pattern);
      });
      inst._zod.check = (payload) => {
        if (payload.value.endsWith(def.suffix))
          return;
        payload.issues.push({
          origin: "string",
          code: "invalid_format",
          format: "ends_with",
          suffix: def.suffix,
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodCheckOverwrite = /* @__PURE__ */ $constructor("$ZodCheckOverwrite", (inst, def) => {
      $ZodCheck.init(inst, def);
      inst._zod.check = (payload) => {
        payload.value = def.tx(payload.value);
      };
    });
  }
});

// node_modules/zod/v4/core/doc.js
var Doc;
var init_doc = __esm({
  "node_modules/zod/v4/core/doc.js"() {
    Doc = class {
      constructor(args = []) {
        this.content = [];
        this.indent = 0;
        if (this)
          this.args = args;
      }
      indented(fn) {
        this.indent += 1;
        fn(this);
        this.indent -= 1;
      }
      write(arg) {
        if (typeof arg === "function") {
          arg(this, { execution: "sync" });
          arg(this, { execution: "async" });
          return;
        }
        const content = arg;
        const lines = content.split("\n").filter((x) => x);
        const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
        const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
        for (const line of dedented) {
          this.content.push(line);
        }
      }
      compile() {
        const F = Function;
        const args = this?.args;
        const content = this?.content ?? [``];
        const lines = [...content.map((x) => `  ${x}`)];
        return new F(...args, lines.join("\n"));
      }
    };
  }
});

// node_modules/zod/v4/core/versions.js
var version;
var init_versions = __esm({
  "node_modules/zod/v4/core/versions.js"() {
    version = {
      major: 4,
      minor: 4,
      patch: 3
    };
  }
});

// node_modules/zod/v4/core/schemas.js
function isValidBase64(data) {
  if (data === "")
    return true;
  if (/\s/.test(data))
    return false;
  if (data.length % 4 !== 0)
    return false;
  try {
    atob(data);
    return true;
  } catch {
    return false;
  }
}
function isValidBase64URL(data) {
  if (!base64url.test(data))
    return false;
  const base642 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
  const padded = base642.padEnd(Math.ceil(base642.length / 4) * 4, "=");
  return isValidBase64(padded);
}
function isValidJWT(token, algorithm = null) {
  try {
    const tokensParts = token.split(".");
    if (tokensParts.length !== 3)
      return false;
    const [header] = tokensParts;
    if (!header)
      return false;
    const parsedHeader = JSON.parse(atob(header));
    if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT")
      return false;
    if (!parsedHeader.alg)
      return false;
    if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm))
      return false;
    return true;
  } catch {
    return false;
  }
}
function handleArrayResult(result, final, index) {
  if (result.issues.length) {
    final.issues.push(...prefixIssues(index, result.issues));
  }
  final.value[index] = result.value;
}
function handlePropertyResult(result, final, key, input, isOptionalIn, isOptionalOut) {
  const isPresent = key in input;
  if (result.issues.length) {
    if (isOptionalIn && isOptionalOut && !isPresent) {
      return;
    }
    final.issues.push(...prefixIssues(key, result.issues));
  }
  if (!isPresent && !isOptionalIn) {
    if (!result.issues.length) {
      final.issues.push({
        code: "invalid_type",
        expected: "nonoptional",
        input: void 0,
        path: [key]
      });
    }
    return;
  }
  if (result.value === void 0) {
    if (isPresent) {
      final.value[key] = void 0;
    }
  } else {
    final.value[key] = result.value;
  }
}
function normalizeDef(def) {
  const keys = Object.keys(def.shape);
  for (const k of keys) {
    if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) {
      throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
    }
  }
  const okeys = optionalKeys(def.shape);
  return {
    ...def,
    keys,
    keySet: new Set(keys),
    numKeys: keys.length,
    optionalKeys: new Set(okeys)
  };
}
function handleCatchall(proms, input, payload, ctx, def, inst) {
  const unrecognized = [];
  const keySet = def.keySet;
  const _catchall = def.catchall._zod;
  const t = _catchall.def.type;
  const isOptionalIn = _catchall.optin === "optional";
  const isOptionalOut = _catchall.optout === "optional";
  for (const key in input) {
    if (key === "__proto__")
      continue;
    if (keySet.has(key))
      continue;
    if (t === "never") {
      unrecognized.push(key);
      continue;
    }
    const r = _catchall.run({ value: input[key], issues: [] }, ctx);
    if (r instanceof Promise) {
      proms.push(r.then((r2) => handlePropertyResult(r2, payload, key, input, isOptionalIn, isOptionalOut)));
    } else {
      handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
    }
  }
  if (unrecognized.length) {
    payload.issues.push({
      code: "unrecognized_keys",
      keys: unrecognized,
      input,
      inst
    });
  }
  if (!proms.length)
    return payload;
  return Promise.all(proms).then(() => {
    return payload;
  });
}
function handleUnionResults(results, final, inst, ctx) {
  for (const result of results) {
    if (result.issues.length === 0) {
      final.value = result.value;
      return final;
    }
  }
  const nonaborted = results.filter((r) => !aborted(r));
  if (nonaborted.length === 1) {
    final.value = nonaborted[0].value;
    return nonaborted[0];
  }
  final.issues.push({
    code: "invalid_union",
    input: final.value,
    inst,
    errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  });
  return final;
}
function mergeValues(a, b) {
  if (a === b) {
    return { valid: true, data: a };
  }
  if (a instanceof Date && b instanceof Date && +a === +b) {
    return { valid: true, data: a };
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const bKeys = Object.keys(b);
    const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
        };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return { valid: false, mergeErrorPath: [] };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
        };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  }
  return { valid: false, mergeErrorPath: [] };
}
function handleIntersectionResults(result, left, right) {
  const unrecKeys = /* @__PURE__ */ new Map();
  let unrecIssue;
  for (const iss of left.issues) {
    if (iss.code === "unrecognized_keys") {
      unrecIssue ?? (unrecIssue = iss);
      for (const k of iss.keys) {
        if (!unrecKeys.has(k))
          unrecKeys.set(k, {});
        unrecKeys.get(k).l = true;
      }
    } else {
      result.issues.push(iss);
    }
  }
  for (const iss of right.issues) {
    if (iss.code === "unrecognized_keys") {
      for (const k of iss.keys) {
        if (!unrecKeys.has(k))
          unrecKeys.set(k, {});
        unrecKeys.get(k).r = true;
      }
    } else {
      result.issues.push(iss);
    }
  }
  const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
  if (bothKeys.length && unrecIssue) {
    result.issues.push({ ...unrecIssue, keys: bothKeys });
  }
  if (aborted(result))
    return result;
  const merged = mergeValues(left.value, right.value);
  if (!merged.valid) {
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
  }
  result.value = merged.data;
  return result;
}
function handleOptionalResult(result, input) {
  if (input === void 0 && (result.issues.length || result.fallback)) {
    return { issues: [], value: void 0 };
  }
  return result;
}
function handleDefaultResult(payload, def) {
  if (payload.value === void 0) {
    payload.value = def.defaultValue;
  }
  return payload;
}
function handleNonOptionalResult(payload, inst) {
  if (!payload.issues.length && payload.value === void 0) {
    payload.issues.push({
      code: "invalid_type",
      expected: "nonoptional",
      input: payload.value,
      inst
    });
  }
  return payload;
}
function handlePipeResult(left, next, ctx) {
  if (left.issues.length) {
    left.aborted = true;
    return left;
  }
  return next._zod.run({ value: left.value, issues: left.issues, fallback: left.fallback }, ctx);
}
function handleReadonlyResult(payload) {
  payload.value = Object.freeze(payload.value);
  return payload;
}
function handleRefineResult(result, payload, input, inst) {
  if (!result) {
    const _iss = {
      code: "custom",
      input,
      inst,
      // incorporates params.error into issue reporting
      path: [...inst._zod.def.path ?? []],
      // incorporates params.error into issue reporting
      continue: !inst._zod.def.abort
      // params: inst._zod.def.params,
    };
    if (inst._zod.def.params)
      _iss.params = inst._zod.def.params;
    payload.issues.push(issue(_iss));
  }
}
var $ZodType, $ZodString, $ZodStringFormat, $ZodGUID, $ZodUUID, $ZodEmail, $ZodURL, $ZodEmoji, $ZodNanoID, $ZodCUID, $ZodCUID2, $ZodULID, $ZodXID, $ZodKSUID, $ZodISODateTime, $ZodISODate, $ZodISOTime, $ZodISODuration, $ZodIPv4, $ZodIPv6, $ZodCIDRv4, $ZodCIDRv6, $ZodBase64, $ZodBase64URL, $ZodE164, $ZodJWT, $ZodNumber, $ZodNumberFormat, $ZodBoolean, $ZodNull, $ZodUnknown, $ZodNever, $ZodArray, $ZodObject, $ZodObjectJIT, $ZodUnion, $ZodDiscriminatedUnion, $ZodIntersection, $ZodRecord, $ZodEnum, $ZodLiteral, $ZodTransform, $ZodOptional, $ZodExactOptional, $ZodNullable, $ZodDefault, $ZodPrefault, $ZodNonOptional, $ZodCatch, $ZodPipe, $ZodPreprocess, $ZodReadonly, $ZodCustom;
var init_schemas = __esm({
  "node_modules/zod/v4/core/schemas.js"() {
    init_checks();
    init_core();
    init_doc();
    init_parse();
    init_regexes();
    init_util();
    init_versions();
    init_util();
    $ZodType = /* @__PURE__ */ $constructor("$ZodType", (inst, def) => {
      var _a3;
      inst ?? (inst = {});
      inst._zod.def = def;
      inst._zod.bag = inst._zod.bag || {};
      inst._zod.version = version;
      const checks = [...inst._zod.def.checks ?? []];
      if (inst._zod.traits.has("$ZodCheck")) {
        checks.unshift(inst);
      }
      for (const ch of checks) {
        for (const fn of ch._zod.onattach) {
          fn(inst);
        }
      }
      if (checks.length === 0) {
        (_a3 = inst._zod).deferred ?? (_a3.deferred = []);
        inst._zod.deferred?.push(() => {
          inst._zod.run = inst._zod.parse;
        });
      } else {
        const runChecks = (payload, checks2, ctx) => {
          let isAborted = aborted(payload);
          let asyncResult;
          for (const ch of checks2) {
            if (ch._zod.def.when) {
              if (explicitlyAborted(payload))
                continue;
              const shouldRun = ch._zod.def.when(payload);
              if (!shouldRun)
                continue;
            } else if (isAborted) {
              continue;
            }
            const currLen = payload.issues.length;
            const _ = ch._zod.check(payload);
            if (_ instanceof Promise && ctx?.async === false) {
              throw new $ZodAsyncError();
            }
            if (asyncResult || _ instanceof Promise) {
              asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
                await _;
                const nextLen = payload.issues.length;
                if (nextLen === currLen)
                  return;
                if (!isAborted)
                  isAborted = aborted(payload, currLen);
              });
            } else {
              const nextLen = payload.issues.length;
              if (nextLen === currLen)
                continue;
              if (!isAborted)
                isAborted = aborted(payload, currLen);
            }
          }
          if (asyncResult) {
            return asyncResult.then(() => {
              return payload;
            });
          }
          return payload;
        };
        const handleCanaryResult = (canary, payload, ctx) => {
          if (aborted(canary)) {
            canary.aborted = true;
            return canary;
          }
          const checkResult = runChecks(payload, checks, ctx);
          if (checkResult instanceof Promise) {
            if (ctx.async === false)
              throw new $ZodAsyncError();
            return checkResult.then((checkResult2) => inst._zod.parse(checkResult2, ctx));
          }
          return inst._zod.parse(checkResult, ctx);
        };
        inst._zod.run = (payload, ctx) => {
          if (ctx.skipChecks) {
            return inst._zod.parse(payload, ctx);
          }
          if (ctx.direction === "backward") {
            const canary = inst._zod.parse({ value: payload.value, issues: [] }, { ...ctx, skipChecks: true });
            if (canary instanceof Promise) {
              return canary.then((canary2) => {
                return handleCanaryResult(canary2, payload, ctx);
              });
            }
            return handleCanaryResult(canary, payload, ctx);
          }
          const result = inst._zod.parse(payload, ctx);
          if (result instanceof Promise) {
            if (ctx.async === false)
              throw new $ZodAsyncError();
            return result.then((result2) => runChecks(result2, checks, ctx));
          }
          return runChecks(result, checks, ctx);
        };
      }
      defineLazy(inst, "~standard", () => ({
        validate: (value) => {
          try {
            const r = safeParse(inst, value);
            return r.success ? { value: r.data } : { issues: r.error?.issues };
          } catch (_) {
            return safeParseAsync(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
          }
        },
        vendor: "zod",
        version: 1
      }));
    });
    $ZodString = /* @__PURE__ */ $constructor("$ZodString", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string(inst._zod.bag);
      inst._zod.parse = (payload, _) => {
        if (def.coerce)
          try {
            payload.value = String(payload.value);
          } catch (_2) {
          }
        if (typeof payload.value === "string")
          return payload;
        payload.issues.push({
          expected: "string",
          code: "invalid_type",
          input: payload.value,
          inst
        });
        return payload;
      };
    });
    $ZodStringFormat = /* @__PURE__ */ $constructor("$ZodStringFormat", (inst, def) => {
      $ZodCheckStringFormat.init(inst, def);
      $ZodString.init(inst, def);
    });
    $ZodGUID = /* @__PURE__ */ $constructor("$ZodGUID", (inst, def) => {
      def.pattern ?? (def.pattern = guid);
      $ZodStringFormat.init(inst, def);
    });
    $ZodUUID = /* @__PURE__ */ $constructor("$ZodUUID", (inst, def) => {
      if (def.version) {
        const versionMap = {
          v1: 1,
          v2: 2,
          v3: 3,
          v4: 4,
          v5: 5,
          v6: 6,
          v7: 7,
          v8: 8
        };
        const v = versionMap[def.version];
        if (v === void 0)
          throw new Error(`Invalid UUID version: "${def.version}"`);
        def.pattern ?? (def.pattern = uuid(v));
      } else
        def.pattern ?? (def.pattern = uuid());
      $ZodStringFormat.init(inst, def);
    });
    $ZodEmail = /* @__PURE__ */ $constructor("$ZodEmail", (inst, def) => {
      def.pattern ?? (def.pattern = email);
      $ZodStringFormat.init(inst, def);
    });
    $ZodURL = /* @__PURE__ */ $constructor("$ZodURL", (inst, def) => {
      $ZodStringFormat.init(inst, def);
      inst._zod.check = (payload) => {
        try {
          const trimmed = payload.value.trim();
          if (!def.normalize && def.protocol?.source === httpProtocol.source) {
            if (!/^https?:\/\//i.test(trimmed)) {
              payload.issues.push({
                code: "invalid_format",
                format: "url",
                note: "Invalid URL format",
                input: payload.value,
                inst,
                continue: !def.abort
              });
              return;
            }
          }
          const url = new URL(trimmed);
          if (def.hostname) {
            def.hostname.lastIndex = 0;
            if (!def.hostname.test(url.hostname)) {
              payload.issues.push({
                code: "invalid_format",
                format: "url",
                note: "Invalid hostname",
                pattern: def.hostname.source,
                input: payload.value,
                inst,
                continue: !def.abort
              });
            }
          }
          if (def.protocol) {
            def.protocol.lastIndex = 0;
            if (!def.protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol)) {
              payload.issues.push({
                code: "invalid_format",
                format: "url",
                note: "Invalid protocol",
                pattern: def.protocol.source,
                input: payload.value,
                inst,
                continue: !def.abort
              });
            }
          }
          if (def.normalize) {
            payload.value = url.href;
          } else {
            payload.value = trimmed;
          }
          return;
        } catch (_) {
          payload.issues.push({
            code: "invalid_format",
            format: "url",
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      };
    });
    $ZodEmoji = /* @__PURE__ */ $constructor("$ZodEmoji", (inst, def) => {
      def.pattern ?? (def.pattern = emoji());
      $ZodStringFormat.init(inst, def);
    });
    $ZodNanoID = /* @__PURE__ */ $constructor("$ZodNanoID", (inst, def) => {
      def.pattern ?? (def.pattern = nanoid);
      $ZodStringFormat.init(inst, def);
    });
    $ZodCUID = /* @__PURE__ */ $constructor("$ZodCUID", (inst, def) => {
      def.pattern ?? (def.pattern = cuid);
      $ZodStringFormat.init(inst, def);
    });
    $ZodCUID2 = /* @__PURE__ */ $constructor("$ZodCUID2", (inst, def) => {
      def.pattern ?? (def.pattern = cuid2);
      $ZodStringFormat.init(inst, def);
    });
    $ZodULID = /* @__PURE__ */ $constructor("$ZodULID", (inst, def) => {
      def.pattern ?? (def.pattern = ulid);
      $ZodStringFormat.init(inst, def);
    });
    $ZodXID = /* @__PURE__ */ $constructor("$ZodXID", (inst, def) => {
      def.pattern ?? (def.pattern = xid);
      $ZodStringFormat.init(inst, def);
    });
    $ZodKSUID = /* @__PURE__ */ $constructor("$ZodKSUID", (inst, def) => {
      def.pattern ?? (def.pattern = ksuid);
      $ZodStringFormat.init(inst, def);
    });
    $ZodISODateTime = /* @__PURE__ */ $constructor("$ZodISODateTime", (inst, def) => {
      def.pattern ?? (def.pattern = datetime(def));
      $ZodStringFormat.init(inst, def);
    });
    $ZodISODate = /* @__PURE__ */ $constructor("$ZodISODate", (inst, def) => {
      def.pattern ?? (def.pattern = date);
      $ZodStringFormat.init(inst, def);
    });
    $ZodISOTime = /* @__PURE__ */ $constructor("$ZodISOTime", (inst, def) => {
      def.pattern ?? (def.pattern = time(def));
      $ZodStringFormat.init(inst, def);
    });
    $ZodISODuration = /* @__PURE__ */ $constructor("$ZodISODuration", (inst, def) => {
      def.pattern ?? (def.pattern = duration);
      $ZodStringFormat.init(inst, def);
    });
    $ZodIPv4 = /* @__PURE__ */ $constructor("$ZodIPv4", (inst, def) => {
      def.pattern ?? (def.pattern = ipv4);
      $ZodStringFormat.init(inst, def);
      inst._zod.bag.format = `ipv4`;
    });
    $ZodIPv6 = /* @__PURE__ */ $constructor("$ZodIPv6", (inst, def) => {
      def.pattern ?? (def.pattern = ipv6);
      $ZodStringFormat.init(inst, def);
      inst._zod.bag.format = `ipv6`;
      inst._zod.check = (payload) => {
        try {
          new URL(`http://[${payload.value}]`);
        } catch {
          payload.issues.push({
            code: "invalid_format",
            format: "ipv6",
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      };
    });
    $ZodCIDRv4 = /* @__PURE__ */ $constructor("$ZodCIDRv4", (inst, def) => {
      def.pattern ?? (def.pattern = cidrv4);
      $ZodStringFormat.init(inst, def);
    });
    $ZodCIDRv6 = /* @__PURE__ */ $constructor("$ZodCIDRv6", (inst, def) => {
      def.pattern ?? (def.pattern = cidrv6);
      $ZodStringFormat.init(inst, def);
      inst._zod.check = (payload) => {
        const parts = payload.value.split("/");
        try {
          if (parts.length !== 2)
            throw new Error();
          const [address, prefix] = parts;
          if (!prefix)
            throw new Error();
          const prefixNum = Number(prefix);
          if (`${prefixNum}` !== prefix)
            throw new Error();
          if (prefixNum < 0 || prefixNum > 128)
            throw new Error();
          new URL(`http://[${address}]`);
        } catch {
          payload.issues.push({
            code: "invalid_format",
            format: "cidrv6",
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      };
    });
    $ZodBase64 = /* @__PURE__ */ $constructor("$ZodBase64", (inst, def) => {
      def.pattern ?? (def.pattern = base64);
      $ZodStringFormat.init(inst, def);
      inst._zod.bag.contentEncoding = "base64";
      inst._zod.check = (payload) => {
        if (isValidBase64(payload.value))
          return;
        payload.issues.push({
          code: "invalid_format",
          format: "base64",
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodBase64URL = /* @__PURE__ */ $constructor("$ZodBase64URL", (inst, def) => {
      def.pattern ?? (def.pattern = base64url);
      $ZodStringFormat.init(inst, def);
      inst._zod.bag.contentEncoding = "base64url";
      inst._zod.check = (payload) => {
        if (isValidBase64URL(payload.value))
          return;
        payload.issues.push({
          code: "invalid_format",
          format: "base64url",
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodE164 = /* @__PURE__ */ $constructor("$ZodE164", (inst, def) => {
      def.pattern ?? (def.pattern = e164);
      $ZodStringFormat.init(inst, def);
    });
    $ZodJWT = /* @__PURE__ */ $constructor("$ZodJWT", (inst, def) => {
      $ZodStringFormat.init(inst, def);
      inst._zod.check = (payload) => {
        if (isValidJWT(payload.value, def.alg))
          return;
        payload.issues.push({
          code: "invalid_format",
          format: "jwt",
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    $ZodNumber = /* @__PURE__ */ $constructor("$ZodNumber", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.pattern = inst._zod.bag.pattern ?? number;
      inst._zod.parse = (payload, _ctx) => {
        if (def.coerce)
          try {
            payload.value = Number(payload.value);
          } catch (_) {
          }
        const input = payload.value;
        if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) {
          return payload;
        }
        const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : void 0 : void 0;
        payload.issues.push({
          expected: "number",
          code: "invalid_type",
          input,
          inst,
          ...received ? { received } : {}
        });
        return payload;
      };
    });
    $ZodNumberFormat = /* @__PURE__ */ $constructor("$ZodNumberFormat", (inst, def) => {
      $ZodCheckNumberFormat.init(inst, def);
      $ZodNumber.init(inst, def);
    });
    $ZodBoolean = /* @__PURE__ */ $constructor("$ZodBoolean", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.pattern = boolean;
      inst._zod.parse = (payload, _ctx) => {
        if (def.coerce)
          try {
            payload.value = Boolean(payload.value);
          } catch (_) {
          }
        const input = payload.value;
        if (typeof input === "boolean")
          return payload;
        payload.issues.push({
          expected: "boolean",
          code: "invalid_type",
          input,
          inst
        });
        return payload;
      };
    });
    $ZodNull = /* @__PURE__ */ $constructor("$ZodNull", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.pattern = _null;
      inst._zod.values = /* @__PURE__ */ new Set([null]);
      inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (input === null)
          return payload;
        payload.issues.push({
          expected: "null",
          code: "invalid_type",
          input,
          inst
        });
        return payload;
      };
    });
    $ZodUnknown = /* @__PURE__ */ $constructor("$ZodUnknown", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload) => payload;
    });
    $ZodNever = /* @__PURE__ */ $constructor("$ZodNever", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, _ctx) => {
        payload.issues.push({
          expected: "never",
          code: "invalid_type",
          input: payload.value,
          inst
        });
        return payload;
      };
    });
    $ZodArray = /* @__PURE__ */ $constructor("$ZodArray", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!Array.isArray(input)) {
          payload.issues.push({
            expected: "array",
            code: "invalid_type",
            input,
            inst
          });
          return payload;
        }
        payload.value = Array(input.length);
        const proms = [];
        for (let i = 0; i < input.length; i++) {
          const item = input[i];
          const result = def.element._zod.run({
            value: item,
            issues: []
          }, ctx);
          if (result instanceof Promise) {
            proms.push(result.then((result2) => handleArrayResult(result2, payload, i)));
          } else {
            handleArrayResult(result, payload, i);
          }
        }
        if (proms.length) {
          return Promise.all(proms).then(() => payload);
        }
        return payload;
      };
    });
    $ZodObject = /* @__PURE__ */ $constructor("$ZodObject", (inst, def) => {
      $ZodType.init(inst, def);
      const desc = Object.getOwnPropertyDescriptor(def, "shape");
      if (!desc?.get) {
        const sh = def.shape;
        Object.defineProperty(def, "shape", {
          get: () => {
            const newSh = { ...sh };
            Object.defineProperty(def, "shape", {
              value: newSh
            });
            return newSh;
          }
        });
      }
      const _normalized = cached(() => normalizeDef(def));
      defineLazy(inst._zod, "propValues", () => {
        const shape = def.shape;
        const propValues = {};
        for (const key in shape) {
          const field = shape[key]._zod;
          if (field.values) {
            propValues[key] ?? (propValues[key] = /* @__PURE__ */ new Set());
            for (const v of field.values)
              propValues[key].add(v);
          }
        }
        return propValues;
      });
      const isObject2 = isObject;
      const catchall = def.catchall;
      let value;
      inst._zod.parse = (payload, ctx) => {
        value ?? (value = _normalized.value);
        const input = payload.value;
        if (!isObject2(input)) {
          payload.issues.push({
            expected: "object",
            code: "invalid_type",
            input,
            inst
          });
          return payload;
        }
        payload.value = {};
        const proms = [];
        const shape = value.shape;
        for (const key of value.keys) {
          const el = shape[key];
          const isOptionalIn = el._zod.optin === "optional";
          const isOptionalOut = el._zod.optout === "optional";
          const r = el._zod.run({ value: input[key], issues: [] }, ctx);
          if (r instanceof Promise) {
            proms.push(r.then((r2) => handlePropertyResult(r2, payload, key, input, isOptionalIn, isOptionalOut)));
          } else {
            handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
          }
        }
        if (!catchall) {
          return proms.length ? Promise.all(proms).then(() => payload) : payload;
        }
        return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
      };
    });
    $ZodObjectJIT = /* @__PURE__ */ $constructor("$ZodObjectJIT", (inst, def) => {
      $ZodObject.init(inst, def);
      const superParse = inst._zod.parse;
      const _normalized = cached(() => normalizeDef(def));
      const generateFastpass = (shape) => {
        const doc = new Doc(["shape", "payload", "ctx"]);
        const normalized = _normalized.value;
        const parseStr = (key) => {
          const k = esc(key);
          return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
        };
        doc.write(`const input = payload.value;`);
        const ids = /* @__PURE__ */ Object.create(null);
        let counter = 0;
        for (const key of normalized.keys) {
          ids[key] = `key_${counter++}`;
        }
        doc.write(`const newResult = {};`);
        for (const key of normalized.keys) {
          const id = ids[key];
          const k = esc(key);
          const schema = shape[key];
          const isOptionalIn = schema?._zod?.optin === "optional";
          const isOptionalOut = schema?._zod?.optout === "optional";
          doc.write(`const ${id} = ${parseStr(key)};`);
          if (isOptionalIn && isOptionalOut) {
            doc.write(`
        if (${id}.issues.length) {
          if (${k} in input) {
            payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${k}, ...iss.path] : [${k}]
            })));
          }
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
          } else if (!isOptionalIn) {
            doc.write(`
        const ${id}_present = ${k} in input;
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
        }

        if (${id}_present) {
          if (${id}.value === undefined) {
            newResult[${k}] = undefined;
          } else {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
          } else {
            doc.write(`
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
          }
        }
        doc.write(`payload.value = newResult;`);
        doc.write(`return payload;`);
        const fn = doc.compile();
        return (payload, ctx) => fn(shape, payload, ctx);
      };
      let fastpass;
      const isObject2 = isObject;
      const jit = !globalConfig.jitless;
      const allowsEval2 = allowsEval;
      const fastEnabled = jit && allowsEval2.value;
      const catchall = def.catchall;
      let value;
      inst._zod.parse = (payload, ctx) => {
        value ?? (value = _normalized.value);
        const input = payload.value;
        if (!isObject2(input)) {
          payload.issues.push({
            expected: "object",
            code: "invalid_type",
            input,
            inst
          });
          return payload;
        }
        if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
          if (!fastpass)
            fastpass = generateFastpass(def.shape);
          payload = fastpass(payload, ctx);
          if (!catchall)
            return payload;
          return handleCatchall([], input, payload, ctx, value, inst);
        }
        return superParse(payload, ctx);
      };
    });
    $ZodUnion = /* @__PURE__ */ $constructor("$ZodUnion", (inst, def) => {
      $ZodType.init(inst, def);
      defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0);
      defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
      defineLazy(inst._zod, "values", () => {
        if (def.options.every((o) => o._zod.values)) {
          return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
        }
        return void 0;
      });
      defineLazy(inst._zod, "pattern", () => {
        if (def.options.every((o) => o._zod.pattern)) {
          const patterns = def.options.map((o) => o._zod.pattern);
          return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
        }
        return void 0;
      });
      const first = def.options.length === 1 ? def.options[0]._zod.run : null;
      inst._zod.parse = (payload, ctx) => {
        if (first) {
          return first(payload, ctx);
        }
        let async = false;
        const results = [];
        for (const option of def.options) {
          const result = option._zod.run({
            value: payload.value,
            issues: []
          }, ctx);
          if (result instanceof Promise) {
            results.push(result);
            async = true;
          } else {
            if (result.issues.length === 0)
              return result;
            results.push(result);
          }
        }
        if (!async)
          return handleUnionResults(results, payload, inst, ctx);
        return Promise.all(results).then((results2) => {
          return handleUnionResults(results2, payload, inst, ctx);
        });
      };
    });
    $ZodDiscriminatedUnion = /* @__PURE__ */ $constructor("$ZodDiscriminatedUnion", (inst, def) => {
      def.inclusive = false;
      $ZodUnion.init(inst, def);
      const _super = inst._zod.parse;
      defineLazy(inst._zod, "propValues", () => {
        const propValues = {};
        for (const option of def.options) {
          const pv = option._zod.propValues;
          if (!pv || Object.keys(pv).length === 0)
            throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(option)}"`);
          for (const [k, v] of Object.entries(pv)) {
            if (!propValues[k])
              propValues[k] = /* @__PURE__ */ new Set();
            for (const val of v) {
              propValues[k].add(val);
            }
          }
        }
        return propValues;
      });
      const disc = cached(() => {
        const opts = def.options;
        const map = /* @__PURE__ */ new Map();
        for (const o of opts) {
          const values = o._zod.propValues?.[def.discriminator];
          if (!values || values.size === 0)
            throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(o)}"`);
          for (const v of values) {
            if (map.has(v)) {
              throw new Error(`Duplicate discriminator value "${String(v)}"`);
            }
            map.set(v, o);
          }
        }
        return map;
      });
      inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!isObject(input)) {
          payload.issues.push({
            code: "invalid_type",
            expected: "object",
            input,
            inst
          });
          return payload;
        }
        const opt = disc.value.get(input?.[def.discriminator]);
        if (opt) {
          return opt._zod.run(payload, ctx);
        }
        if (def.unionFallback || ctx.direction === "backward") {
          return _super(payload, ctx);
        }
        payload.issues.push({
          code: "invalid_union",
          errors: [],
          note: "No matching discriminator",
          discriminator: def.discriminator,
          options: Array.from(disc.value.keys()),
          input,
          path: [def.discriminator],
          inst
        });
        return payload;
      };
    });
    $ZodIntersection = /* @__PURE__ */ $constructor("$ZodIntersection", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        const left = def.left._zod.run({ value: input, issues: [] }, ctx);
        const right = def.right._zod.run({ value: input, issues: [] }, ctx);
        const async = left instanceof Promise || right instanceof Promise;
        if (async) {
          return Promise.all([left, right]).then(([left2, right2]) => {
            return handleIntersectionResults(payload, left2, right2);
          });
        }
        return handleIntersectionResults(payload, left, right);
      };
    });
    $ZodRecord = /* @__PURE__ */ $constructor("$ZodRecord", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!isPlainObject(input)) {
          payload.issues.push({
            expected: "record",
            code: "invalid_type",
            input,
            inst
          });
          return payload;
        }
        const proms = [];
        const values = def.keyType._zod.values;
        if (values) {
          payload.value = {};
          const recordKeys = /* @__PURE__ */ new Set();
          for (const key of values) {
            if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
              recordKeys.add(typeof key === "number" ? key.toString() : key);
              const keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
              if (keyResult instanceof Promise) {
                throw new Error("Async schemas not supported in object keys currently");
              }
              if (keyResult.issues.length) {
                payload.issues.push({
                  code: "invalid_key",
                  origin: "record",
                  issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
                  input: key,
                  path: [key],
                  inst
                });
                continue;
              }
              const outKey = keyResult.value;
              const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
              if (result instanceof Promise) {
                proms.push(result.then((result2) => {
                  if (result2.issues.length) {
                    payload.issues.push(...prefixIssues(key, result2.issues));
                  }
                  payload.value[outKey] = result2.value;
                }));
              } else {
                if (result.issues.length) {
                  payload.issues.push(...prefixIssues(key, result.issues));
                }
                payload.value[outKey] = result.value;
              }
            }
          }
          let unrecognized;
          for (const key in input) {
            if (!recordKeys.has(key)) {
              unrecognized = unrecognized ?? [];
              unrecognized.push(key);
            }
          }
          if (unrecognized && unrecognized.length > 0) {
            payload.issues.push({
              code: "unrecognized_keys",
              input,
              inst,
              keys: unrecognized
            });
          }
        } else {
          payload.value = {};
          for (const key of Reflect.ownKeys(input)) {
            if (key === "__proto__")
              continue;
            if (!Object.prototype.propertyIsEnumerable.call(input, key))
              continue;
            let keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
            if (keyResult instanceof Promise) {
              throw new Error("Async schemas not supported in object keys currently");
            }
            const checkNumericKey = typeof key === "string" && number.test(key) && keyResult.issues.length;
            if (checkNumericKey) {
              const retryResult = def.keyType._zod.run({ value: Number(key), issues: [] }, ctx);
              if (retryResult instanceof Promise) {
                throw new Error("Async schemas not supported in object keys currently");
              }
              if (retryResult.issues.length === 0) {
                keyResult = retryResult;
              }
            }
            if (keyResult.issues.length) {
              if (def.mode === "loose") {
                payload.value[key] = input[key];
              } else {
                payload.issues.push({
                  code: "invalid_key",
                  origin: "record",
                  issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
                  input: key,
                  path: [key],
                  inst
                });
              }
              continue;
            }
            const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
            if (result instanceof Promise) {
              proms.push(result.then((result2) => {
                if (result2.issues.length) {
                  payload.issues.push(...prefixIssues(key, result2.issues));
                }
                payload.value[keyResult.value] = result2.value;
              }));
            } else {
              if (result.issues.length) {
                payload.issues.push(...prefixIssues(key, result.issues));
              }
              payload.value[keyResult.value] = result.value;
            }
          }
        }
        if (proms.length) {
          return Promise.all(proms).then(() => payload);
        }
        return payload;
      };
    });
    $ZodEnum = /* @__PURE__ */ $constructor("$ZodEnum", (inst, def) => {
      $ZodType.init(inst, def);
      const values = getEnumValues(def.entries);
      const valuesSet = new Set(values);
      inst._zod.values = valuesSet;
      inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o) => typeof o === "string" ? escapeRegex(o) : o.toString()).join("|")})$`);
      inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (valuesSet.has(input)) {
          return payload;
        }
        payload.issues.push({
          code: "invalid_value",
          values,
          input,
          inst
        });
        return payload;
      };
    });
    $ZodLiteral = /* @__PURE__ */ $constructor("$ZodLiteral", (inst, def) => {
      $ZodType.init(inst, def);
      if (def.values.length === 0) {
        throw new Error("Cannot create literal schema with no valid values");
      }
      const values = new Set(def.values);
      inst._zod.values = values;
      inst._zod.pattern = new RegExp(`^(${def.values.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|")})$`);
      inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (values.has(input)) {
          return payload;
        }
        payload.issues.push({
          code: "invalid_value",
          values: def.values,
          input,
          inst
        });
        return payload;
      };
    });
    $ZodTransform = /* @__PURE__ */ $constructor("$ZodTransform", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.optin = "optional";
      inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
          throw new $ZodEncodeError(inst.constructor.name);
        }
        const _out = def.transform(payload.value, payload);
        if (ctx.async) {
          const output = _out instanceof Promise ? _out : Promise.resolve(_out);
          return output.then((output2) => {
            payload.value = output2;
            payload.fallback = true;
            return payload;
          });
        }
        if (_out instanceof Promise) {
          throw new $ZodAsyncError();
        }
        payload.value = _out;
        payload.fallback = true;
        return payload;
      };
    });
    $ZodOptional = /* @__PURE__ */ $constructor("$ZodOptional", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.optin = "optional";
      inst._zod.optout = "optional";
      defineLazy(inst._zod, "values", () => {
        return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, void 0]) : void 0;
      });
      defineLazy(inst._zod, "pattern", () => {
        const pattern = def.innerType._zod.pattern;
        return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
      });
      inst._zod.parse = (payload, ctx) => {
        if (def.innerType._zod.optin === "optional") {
          const input = payload.value;
          const result = def.innerType._zod.run(payload, ctx);
          if (result instanceof Promise)
            return result.then((r) => handleOptionalResult(r, input));
          return handleOptionalResult(result, input);
        }
        if (payload.value === void 0) {
          return payload;
        }
        return def.innerType._zod.run(payload, ctx);
      };
    });
    $ZodExactOptional = /* @__PURE__ */ $constructor("$ZodExactOptional", (inst, def) => {
      $ZodOptional.init(inst, def);
      defineLazy(inst._zod, "values", () => def.innerType._zod.values);
      defineLazy(inst._zod, "pattern", () => def.innerType._zod.pattern);
      inst._zod.parse = (payload, ctx) => {
        return def.innerType._zod.run(payload, ctx);
      };
    });
    $ZodNullable = /* @__PURE__ */ $constructor("$ZodNullable", (inst, def) => {
      $ZodType.init(inst, def);
      defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
      defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
      defineLazy(inst._zod, "pattern", () => {
        const pattern = def.innerType._zod.pattern;
        return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
      });
      defineLazy(inst._zod, "values", () => {
        return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, null]) : void 0;
      });
      inst._zod.parse = (payload, ctx) => {
        if (payload.value === null)
          return payload;
        return def.innerType._zod.run(payload, ctx);
      };
    });
    $ZodDefault = /* @__PURE__ */ $constructor("$ZodDefault", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.optin = "optional";
      defineLazy(inst._zod, "values", () => def.innerType._zod.values);
      inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
          return def.innerType._zod.run(payload, ctx);
        }
        if (payload.value === void 0) {
          payload.value = def.defaultValue;
          return payload;
        }
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
          return result.then((result2) => handleDefaultResult(result2, def));
        }
        return handleDefaultResult(result, def);
      };
    });
    $ZodPrefault = /* @__PURE__ */ $constructor("$ZodPrefault", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.optin = "optional";
      defineLazy(inst._zod, "values", () => def.innerType._zod.values);
      inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
          return def.innerType._zod.run(payload, ctx);
        }
        if (payload.value === void 0) {
          payload.value = def.defaultValue;
        }
        return def.innerType._zod.run(payload, ctx);
      };
    });
    $ZodNonOptional = /* @__PURE__ */ $constructor("$ZodNonOptional", (inst, def) => {
      $ZodType.init(inst, def);
      defineLazy(inst._zod, "values", () => {
        const v = def.innerType._zod.values;
        return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
      });
      inst._zod.parse = (payload, ctx) => {
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
          return result.then((result2) => handleNonOptionalResult(result2, inst));
        }
        return handleNonOptionalResult(result, inst);
      };
    });
    $ZodCatch = /* @__PURE__ */ $constructor("$ZodCatch", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.optin = "optional";
      defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
      defineLazy(inst._zod, "values", () => def.innerType._zod.values);
      inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
          return def.innerType._zod.run(payload, ctx);
        }
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
          return result.then((result2) => {
            payload.value = result2.value;
            if (result2.issues.length) {
              payload.value = def.catchValue({
                ...payload,
                error: {
                  issues: result2.issues.map((iss) => finalizeIssue(iss, ctx, config()))
                },
                input: payload.value
              });
              payload.issues = [];
              payload.fallback = true;
            }
            return payload;
          });
        }
        payload.value = result.value;
        if (result.issues.length) {
          payload.value = def.catchValue({
            ...payload,
            error: {
              issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config()))
            },
            input: payload.value
          });
          payload.issues = [];
          payload.fallback = true;
        }
        return payload;
      };
    });
    $ZodPipe = /* @__PURE__ */ $constructor("$ZodPipe", (inst, def) => {
      $ZodType.init(inst, def);
      defineLazy(inst._zod, "values", () => def.in._zod.values);
      defineLazy(inst._zod, "optin", () => def.in._zod.optin);
      defineLazy(inst._zod, "optout", () => def.out._zod.optout);
      defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
      inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
          const right = def.out._zod.run(payload, ctx);
          if (right instanceof Promise) {
            return right.then((right2) => handlePipeResult(right2, def.in, ctx));
          }
          return handlePipeResult(right, def.in, ctx);
        }
        const left = def.in._zod.run(payload, ctx);
        if (left instanceof Promise) {
          return left.then((left2) => handlePipeResult(left2, def.out, ctx));
        }
        return handlePipeResult(left, def.out, ctx);
      };
    });
    $ZodPreprocess = /* @__PURE__ */ $constructor("$ZodPreprocess", (inst, def) => {
      $ZodPipe.init(inst, def);
    });
    $ZodReadonly = /* @__PURE__ */ $constructor("$ZodReadonly", (inst, def) => {
      $ZodType.init(inst, def);
      defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
      defineLazy(inst._zod, "values", () => def.innerType._zod.values);
      defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
      defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
      inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
          return def.innerType._zod.run(payload, ctx);
        }
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
          return result.then(handleReadonlyResult);
        }
        return handleReadonlyResult(result);
      };
    });
    $ZodCustom = /* @__PURE__ */ $constructor("$ZodCustom", (inst, def) => {
      $ZodCheck.init(inst, def);
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, _) => {
        return payload;
      };
      inst._zod.check = (payload) => {
        const input = payload.value;
        const r = def.fn(input);
        if (r instanceof Promise) {
          return r.then((r2) => handleRefineResult(r2, payload, input, inst));
        }
        handleRefineResult(r, payload, input, inst);
        return;
      };
    });
  }
});

// node_modules/zod/v4/locales/en.js
function en_default() {
  return {
    localeError: error()
  };
}
var error;
var init_en = __esm({
  "node_modules/zod/v4/locales/en.js"() {
    init_util();
    error = () => {
      const Sizable = {
        string: { unit: "characters", verb: "to have" },
        file: { unit: "bytes", verb: "to have" },
        array: { unit: "items", verb: "to have" },
        set: { unit: "items", verb: "to have" },
        map: { unit: "entries", verb: "to have" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "input",
        email: "email address",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO datetime",
        date: "ISO date",
        time: "ISO time",
        duration: "ISO duration",
        ipv4: "IPv4 address",
        ipv6: "IPv6 address",
        mac: "MAC address",
        cidrv4: "IPv4 range",
        cidrv6: "IPv6 range",
        base64: "base64-encoded string",
        base64url: "base64url-encoded string",
        json_string: "JSON string",
        e164: "E.164 number",
        jwt: "JWT",
        template_literal: "input"
      };
      const TypeDictionary = {
        // Compatibility: "nan" -> "NaN" for display
        nan: "NaN"
        // All other type names omitted - they fall back to raw values via ?? operator
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            return `Invalid input: expected ${expected}, received ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Invalid input: expected ${stringifyPrimitive(issue2.values[0])}`;
            return `Invalid option: expected one of ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `Too big: expected ${issue2.origin ?? "value"} to have ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elements"}`;
            return `Too big: expected ${issue2.origin ?? "value"} to be ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `Too small: expected ${issue2.origin} to have ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `Too small: expected ${issue2.origin} to be ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with") {
              return `Invalid string: must start with "${_issue.prefix}"`;
            }
            if (_issue.format === "ends_with")
              return `Invalid string: must end with "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `Invalid string: must include "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `Invalid string: must match pattern ${_issue.pattern}`;
            return `Invalid ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `Invalid number: must be a multiple of ${issue2.divisor}`;
          case "unrecognized_keys":
            return `Unrecognized key${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `Invalid key in ${issue2.origin}`;
          case "invalid_union":
            if (issue2.options && Array.isArray(issue2.options) && issue2.options.length > 0) {
              const opts = issue2.options.map((o) => `'${o}'`).join(" | ");
              return `Invalid discriminator value. Expected ${opts}`;
            }
            return "Invalid input";
          case "invalid_element":
            return `Invalid value in ${issue2.origin}`;
          default:
            return `Invalid input`;
        }
      };
    };
  }
});

// node_modules/zod/v4/locales/index.js
var init_locales = __esm({
  "node_modules/zod/v4/locales/index.js"() {
  }
});

// node_modules/zod/v4/core/registries.js
function registry() {
  return new $ZodRegistry();
}
var _a2, $ZodRegistry, globalRegistry;
var init_registries = __esm({
  "node_modules/zod/v4/core/registries.js"() {
    $ZodRegistry = class {
      constructor() {
        this._map = /* @__PURE__ */ new WeakMap();
        this._idmap = /* @__PURE__ */ new Map();
      }
      add(schema, ..._meta) {
        const meta2 = _meta[0];
        this._map.set(schema, meta2);
        if (meta2 && typeof meta2 === "object" && "id" in meta2) {
          this._idmap.set(meta2.id, schema);
        }
        return this;
      }
      clear() {
        this._map = /* @__PURE__ */ new WeakMap();
        this._idmap = /* @__PURE__ */ new Map();
        return this;
      }
      remove(schema) {
        const meta2 = this._map.get(schema);
        if (meta2 && typeof meta2 === "object" && "id" in meta2) {
          this._idmap.delete(meta2.id);
        }
        this._map.delete(schema);
        return this;
      }
      get(schema) {
        const p = schema._zod.parent;
        if (p) {
          const pm = { ...this.get(p) ?? {} };
          delete pm.id;
          const f = { ...pm, ...this._map.get(schema) };
          return Object.keys(f).length ? f : void 0;
        }
        return this._map.get(schema);
      }
      has(schema) {
        return this._map.has(schema);
      }
    };
    (_a2 = globalThis).__zod_globalRegistry ?? (_a2.__zod_globalRegistry = registry());
    globalRegistry = globalThis.__zod_globalRegistry;
  }
});

// node_modules/zod/v4/core/api.js
// @__NO_SIDE_EFFECTS__
function _string(Class2, params) {
  return new Class2({
    type: "string",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _email(Class2, params) {
  return new Class2({
    type: "string",
    format: "email",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _guid(Class2, params) {
  return new Class2({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uuid(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uuidv4(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v4",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uuidv6(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v6",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uuidv7(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v7",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _url(Class2, params) {
  return new Class2({
    type: "string",
    format: "url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _emoji2(Class2, params) {
  return new Class2({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _nanoid(Class2, params) {
  return new Class2({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _cuid(Class2, params) {
  return new Class2({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _cuid2(Class2, params) {
  return new Class2({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _ulid(Class2, params) {
  return new Class2({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _xid(Class2, params) {
  return new Class2({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _ksuid(Class2, params) {
  return new Class2({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _ipv4(Class2, params) {
  return new Class2({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _ipv6(Class2, params) {
  return new Class2({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _cidrv4(Class2, params) {
  return new Class2({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _cidrv6(Class2, params) {
  return new Class2({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _base64(Class2, params) {
  return new Class2({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _base64url(Class2, params) {
  return new Class2({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _e164(Class2, params) {
  return new Class2({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _jwt(Class2, params) {
  return new Class2({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _isoDateTime(Class2, params) {
  return new Class2({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: false,
    local: false,
    precision: null,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _isoDate(Class2, params) {
  return new Class2({
    type: "string",
    format: "date",
    check: "string_format",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _isoTime(Class2, params) {
  return new Class2({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _isoDuration(Class2, params) {
  return new Class2({
    type: "string",
    format: "duration",
    check: "string_format",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _number(Class2, params) {
  return new Class2({
    type: "number",
    checks: [],
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _int(Class2, params) {
  return new Class2({
    type: "number",
    check: "number_format",
    abort: false,
    format: "safeint",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _boolean(Class2, params) {
  return new Class2({
    type: "boolean",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _null2(Class2, params) {
  return new Class2({
    type: "null",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _unknown(Class2) {
  return new Class2({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function _never(Class2, params) {
  return new Class2({
    type: "never",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _lt(value, params) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(params),
    value,
    inclusive: false
  });
}
// @__NO_SIDE_EFFECTS__
function _lte(value, params) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(params),
    value,
    inclusive: true
  });
}
// @__NO_SIDE_EFFECTS__
function _gt(value, params) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(params),
    value,
    inclusive: false
  });
}
// @__NO_SIDE_EFFECTS__
function _gte(value, params) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(params),
    value,
    inclusive: true
  });
}
// @__NO_SIDE_EFFECTS__
function _multipleOf(value, params) {
  return new $ZodCheckMultipleOf({
    check: "multiple_of",
    ...normalizeParams(params),
    value
  });
}
// @__NO_SIDE_EFFECTS__
function _maxLength(maximum, params) {
  const ch = new $ZodCheckMaxLength({
    check: "max_length",
    ...normalizeParams(params),
    maximum
  });
  return ch;
}
// @__NO_SIDE_EFFECTS__
function _minLength(minimum, params) {
  return new $ZodCheckMinLength({
    check: "min_length",
    ...normalizeParams(params),
    minimum
  });
}
// @__NO_SIDE_EFFECTS__
function _length(length, params) {
  return new $ZodCheckLengthEquals({
    check: "length_equals",
    ...normalizeParams(params),
    length
  });
}
// @__NO_SIDE_EFFECTS__
function _regex(pattern, params) {
  return new $ZodCheckRegex({
    check: "string_format",
    format: "regex",
    ...normalizeParams(params),
    pattern
  });
}
// @__NO_SIDE_EFFECTS__
function _lowercase(params) {
  return new $ZodCheckLowerCase({
    check: "string_format",
    format: "lowercase",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uppercase(params) {
  return new $ZodCheckUpperCase({
    check: "string_format",
    format: "uppercase",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _includes(includes, params) {
  return new $ZodCheckIncludes({
    check: "string_format",
    format: "includes",
    ...normalizeParams(params),
    includes
  });
}
// @__NO_SIDE_EFFECTS__
function _startsWith(prefix, params) {
  return new $ZodCheckStartsWith({
    check: "string_format",
    format: "starts_with",
    ...normalizeParams(params),
    prefix
  });
}
// @__NO_SIDE_EFFECTS__
function _endsWith(suffix, params) {
  return new $ZodCheckEndsWith({
    check: "string_format",
    format: "ends_with",
    ...normalizeParams(params),
    suffix
  });
}
// @__NO_SIDE_EFFECTS__
function _overwrite(tx) {
  return new $ZodCheckOverwrite({
    check: "overwrite",
    tx
  });
}
// @__NO_SIDE_EFFECTS__
function _normalize(form) {
  return /* @__PURE__ */ _overwrite((input) => input.normalize(form));
}
// @__NO_SIDE_EFFECTS__
function _trim() {
  return /* @__PURE__ */ _overwrite((input) => input.trim());
}
// @__NO_SIDE_EFFECTS__
function _toLowerCase() {
  return /* @__PURE__ */ _overwrite((input) => input.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function _toUpperCase() {
  return /* @__PURE__ */ _overwrite((input) => input.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function _slugify() {
  return /* @__PURE__ */ _overwrite((input) => slugify(input));
}
// @__NO_SIDE_EFFECTS__
function _array(Class2, element, params) {
  return new Class2({
    type: "array",
    element,
    // get element() {
    //   return element;
    // },
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _custom(Class2, fn, _params) {
  const norm = normalizeParams(_params);
  norm.abort ?? (norm.abort = true);
  const schema = new Class2({
    type: "custom",
    check: "custom",
    fn,
    ...norm
  });
  return schema;
}
// @__NO_SIDE_EFFECTS__
function _refine(Class2, fn, _params) {
  const schema = new Class2({
    type: "custom",
    check: "custom",
    fn,
    ...normalizeParams(_params)
  });
  return schema;
}
// @__NO_SIDE_EFFECTS__
function _superRefine(fn, params) {
  const ch = /* @__PURE__ */ _check((payload) => {
    payload.addIssue = (issue2) => {
      if (typeof issue2 === "string") {
        payload.issues.push(issue(issue2, payload.value, ch._zod.def));
      } else {
        const _issue = issue2;
        if (_issue.fatal)
          _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        _issue.input ?? (_issue.input = payload.value);
        _issue.inst ?? (_issue.inst = ch);
        _issue.continue ?? (_issue.continue = !ch._zod.def.abort);
        payload.issues.push(issue(_issue));
      }
    };
    return fn(payload.value, payload);
  }, params);
  return ch;
}
// @__NO_SIDE_EFFECTS__
function _check(fn, params) {
  const ch = new $ZodCheck({
    check: "custom",
    ...normalizeParams(params)
  });
  ch._zod.check = fn;
  return ch;
}
var init_api = __esm({
  "node_modules/zod/v4/core/api.js"() {
    init_checks();
    init_util();
  }
});

// node_modules/zod/v4/core/to-json-schema.js
function initializeContext(params) {
  let target = params?.target ?? "draft-2020-12";
  if (target === "draft-4")
    target = "draft-04";
  if (target === "draft-7")
    target = "draft-07";
  return {
    processors: params.processors ?? {},
    metadataRegistry: params?.metadata ?? globalRegistry,
    target,
    unrepresentable: params?.unrepresentable ?? "throw",
    override: params?.override ?? (() => {
    }),
    io: params?.io ?? "output",
    counter: 0,
    seen: /* @__PURE__ */ new Map(),
    cycles: params?.cycles ?? "ref",
    reused: params?.reused ?? "inline",
    external: params?.external ?? void 0
  };
}
function process2(schema, ctx, _params = { path: [], schemaPath: [] }) {
  var _a3;
  const def = schema._zod.def;
  const seen = ctx.seen.get(schema);
  if (seen) {
    seen.count++;
    const isCycle = _params.schemaPath.includes(schema);
    if (isCycle) {
      seen.cycle = _params.path;
    }
    return seen.schema;
  }
  const result = { schema: {}, count: 1, cycle: void 0, path: _params.path };
  ctx.seen.set(schema, result);
  const overrideSchema = schema._zod.toJSONSchema?.();
  if (overrideSchema) {
    result.schema = overrideSchema;
  } else {
    const params = {
      ..._params,
      schemaPath: [..._params.schemaPath, schema],
      path: _params.path
    };
    if (schema._zod.processJSONSchema) {
      schema._zod.processJSONSchema(ctx, result.schema, params);
    } else {
      const _json = result.schema;
      const processor = ctx.processors[def.type];
      if (!processor) {
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
      }
      processor(schema, ctx, _json, params);
    }
    const parent = schema._zod.parent;
    if (parent) {
      if (!result.ref)
        result.ref = parent;
      process2(parent, ctx, params);
      ctx.seen.get(parent).isParent = true;
    }
  }
  const meta2 = ctx.metadataRegistry.get(schema);
  if (meta2)
    Object.assign(result.schema, meta2);
  if (ctx.io === "input" && isTransforming(schema)) {
    delete result.schema.examples;
    delete result.schema.default;
  }
  if (ctx.io === "input" && "_prefault" in result.schema)
    (_a3 = result.schema).default ?? (_a3.default = result.schema._prefault);
  delete result.schema._prefault;
  const _result = ctx.seen.get(schema);
  return _result.schema;
}
function extractDefs(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const idToSchema = /* @__PURE__ */ new Map();
  for (const entry of ctx.seen.entries()) {
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      const existing = idToSchema.get(id);
      if (existing && existing !== entry[0]) {
        throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      }
      idToSchema.set(id, entry[0]);
    }
  }
  const makeURI = (entry) => {
    const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
    if (ctx.external) {
      const externalId = ctx.external.registry.get(entry[0])?.id;
      const uriGenerator = ctx.external.uri ?? ((id2) => id2);
      if (externalId) {
        return { ref: uriGenerator(externalId) };
      }
      const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
      entry[1].defId = id;
      return { defId: id, ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}` };
    }
    if (entry[1] === root) {
      return { ref: "#" };
    }
    const uriPrefix = `#`;
    const defUriPrefix = `${uriPrefix}/${defsSegment}/`;
    const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
    return { defId, ref: defUriPrefix + defId };
  };
  const extractToDef = (entry) => {
    if (entry[1].schema.$ref) {
      return;
    }
    const seen = entry[1];
    const { ref, defId } = makeURI(entry);
    seen.def = { ...seen.schema };
    if (defId)
      seen.defId = defId;
    const schema2 = seen.schema;
    for (const key in schema2) {
      delete schema2[key];
    }
    schema2.$ref = ref;
  };
  if (ctx.cycles === "throw") {
    for (const entry of ctx.seen.entries()) {
      const seen = entry[1];
      if (seen.cycle) {
        throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
      }
    }
  }
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (schema === entry[0]) {
      extractToDef(entry);
      continue;
    }
    if (ctx.external) {
      const ext = ctx.external.registry.get(entry[0])?.id;
      if (schema !== entry[0] && ext) {
        extractToDef(entry);
        continue;
      }
    }
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      extractToDef(entry);
      continue;
    }
    if (seen.cycle) {
      extractToDef(entry);
      continue;
    }
    if (seen.count > 1) {
      if (ctx.reused === "ref") {
        extractToDef(entry);
        continue;
      }
    }
  }
}
function finalize(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const flattenRef = (zodSchema) => {
    const seen = ctx.seen.get(zodSchema);
    if (seen.ref === null)
      return;
    const schema2 = seen.def ?? seen.schema;
    const _cached = { ...schema2 };
    const ref = seen.ref;
    seen.ref = null;
    if (ref) {
      flattenRef(ref);
      const refSeen = ctx.seen.get(ref);
      const refSchema = refSeen.schema;
      if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
        schema2.allOf = schema2.allOf ?? [];
        schema2.allOf.push(refSchema);
      } else {
        Object.assign(schema2, refSchema);
      }
      Object.assign(schema2, _cached);
      const isParentRef = zodSchema._zod.parent === ref;
      if (isParentRef) {
        for (const key in schema2) {
          if (key === "$ref" || key === "allOf")
            continue;
          if (!(key in _cached)) {
            delete schema2[key];
          }
        }
      }
      if (refSchema.$ref && refSeen.def) {
        for (const key in schema2) {
          if (key === "$ref" || key === "allOf")
            continue;
          if (key in refSeen.def && JSON.stringify(schema2[key]) === JSON.stringify(refSeen.def[key])) {
            delete schema2[key];
          }
        }
      }
    }
    const parent = zodSchema._zod.parent;
    if (parent && parent !== ref) {
      flattenRef(parent);
      const parentSeen = ctx.seen.get(parent);
      if (parentSeen?.schema.$ref) {
        schema2.$ref = parentSeen.schema.$ref;
        if (parentSeen.def) {
          for (const key in schema2) {
            if (key === "$ref" || key === "allOf")
              continue;
            if (key in parentSeen.def && JSON.stringify(schema2[key]) === JSON.stringify(parentSeen.def[key])) {
              delete schema2[key];
            }
          }
        }
      }
    }
    ctx.override({
      zodSchema,
      jsonSchema: schema2,
      path: seen.path ?? []
    });
  };
  for (const entry of [...ctx.seen.entries()].reverse()) {
    flattenRef(entry[0]);
  }
  const result = {};
  if (ctx.target === "draft-2020-12") {
    result.$schema = "https://json-schema.org/draft/2020-12/schema";
  } else if (ctx.target === "draft-07") {
    result.$schema = "http://json-schema.org/draft-07/schema#";
  } else if (ctx.target === "draft-04") {
    result.$schema = "http://json-schema.org/draft-04/schema#";
  } else if (ctx.target === "openapi-3.0") {
  } else {
  }
  if (ctx.external?.uri) {
    const id = ctx.external.registry.get(schema)?.id;
    if (!id)
      throw new Error("Schema is missing an `id` property");
    result.$id = ctx.external.uri(id);
  }
  Object.assign(result, root.def ?? root.schema);
  const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
  if (rootMetaId !== void 0 && result.id === rootMetaId)
    delete result.id;
  const defs = ctx.external?.defs ?? {};
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (seen.def && seen.defId) {
      if (seen.def.id === seen.defId)
        delete seen.def.id;
      defs[seen.defId] = seen.def;
    }
  }
  if (ctx.external) {
  } else {
    if (Object.keys(defs).length > 0) {
      if (ctx.target === "draft-2020-12") {
        result.$defs = defs;
      } else {
        result.definitions = defs;
      }
    }
  }
  try {
    const finalized = JSON.parse(JSON.stringify(result));
    Object.defineProperty(finalized, "~standard", {
      value: {
        ...schema["~standard"],
        jsonSchema: {
          input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
          output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
        }
      },
      enumerable: false,
      writable: false
    });
    return finalized;
  } catch (_err) {
    throw new Error("Error converting schema to JSON.");
  }
}
function isTransforming(_schema, _ctx) {
  const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
  if (ctx.seen.has(_schema))
    return false;
  ctx.seen.add(_schema);
  const def = _schema._zod.def;
  if (def.type === "transform")
    return true;
  if (def.type === "array")
    return isTransforming(def.element, ctx);
  if (def.type === "set")
    return isTransforming(def.valueType, ctx);
  if (def.type === "lazy")
    return isTransforming(def.getter(), ctx);
  if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault") {
    return isTransforming(def.innerType, ctx);
  }
  if (def.type === "intersection") {
    return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
  }
  if (def.type === "record" || def.type === "map") {
    return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
  }
  if (def.type === "pipe") {
    if (_schema._zod.traits.has("$ZodCodec"))
      return true;
    return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
  }
  if (def.type === "object") {
    for (const key in def.shape) {
      if (isTransforming(def.shape[key], ctx))
        return true;
    }
    return false;
  }
  if (def.type === "union") {
    for (const option of def.options) {
      if (isTransforming(option, ctx))
        return true;
    }
    return false;
  }
  if (def.type === "tuple") {
    for (const item of def.items) {
      if (isTransforming(item, ctx))
        return true;
    }
    if (def.rest && isTransforming(def.rest, ctx))
      return true;
    return false;
  }
  return false;
}
var createToJSONSchemaMethod, createStandardJSONSchemaMethod;
var init_to_json_schema = __esm({
  "node_modules/zod/v4/core/to-json-schema.js"() {
    init_registries();
    createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
      const ctx = initializeContext({ ...params, processors });
      process2(schema, ctx);
      extractDefs(ctx, schema);
      return finalize(ctx, schema);
    };
    createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
      const { libraryOptions, target } = params ?? {};
      const ctx = initializeContext({ ...libraryOptions ?? {}, target, io, processors });
      process2(schema, ctx);
      extractDefs(ctx, schema);
      return finalize(ctx, schema);
    };
  }
});

// node_modules/zod/v4/core/json-schema-processors.js
var formatMap, stringProcessor, numberProcessor, booleanProcessor, nullProcessor, neverProcessor, unknownProcessor, enumProcessor, literalProcessor, customProcessor, transformProcessor, arrayProcessor, objectProcessor, unionProcessor, intersectionProcessor, recordProcessor, nullableProcessor, nonoptionalProcessor, defaultProcessor, prefaultProcessor, catchProcessor, pipeProcessor, readonlyProcessor, optionalProcessor;
var init_json_schema_processors = __esm({
  "node_modules/zod/v4/core/json-schema-processors.js"() {
    init_to_json_schema();
    init_util();
    formatMap = {
      guid: "uuid",
      url: "uri",
      datetime: "date-time",
      json_string: "json-string",
      regex: ""
      // do not set
    };
    stringProcessor = (schema, ctx, _json, _params) => {
      const json = _json;
      json.type = "string";
      const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
      if (typeof minimum === "number")
        json.minLength = minimum;
      if (typeof maximum === "number")
        json.maxLength = maximum;
      if (format) {
        json.format = formatMap[format] ?? format;
        if (json.format === "")
          delete json.format;
        if (format === "time") {
          delete json.format;
        }
      }
      if (contentEncoding)
        json.contentEncoding = contentEncoding;
      if (patterns && patterns.size > 0) {
        const regexes = [...patterns];
        if (regexes.length === 1)
          json.pattern = regexes[0].source;
        else if (regexes.length > 1) {
          json.allOf = [
            ...regexes.map((regex) => ({
              ...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
              pattern: regex.source
            }))
          ];
        }
      }
    };
    numberProcessor = (schema, ctx, _json, _params) => {
      const json = _json;
      const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
      if (typeof format === "string" && format.includes("int"))
        json.type = "integer";
      else
        json.type = "number";
      const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
      const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
      const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
      if (exMin) {
        if (legacy) {
          json.minimum = exclusiveMinimum;
          json.exclusiveMinimum = true;
        } else {
          json.exclusiveMinimum = exclusiveMinimum;
        }
      } else if (typeof minimum === "number") {
        json.minimum = minimum;
      }
      if (exMax) {
        if (legacy) {
          json.maximum = exclusiveMaximum;
          json.exclusiveMaximum = true;
        } else {
          json.exclusiveMaximum = exclusiveMaximum;
        }
      } else if (typeof maximum === "number") {
        json.maximum = maximum;
      }
      if (typeof multipleOf === "number")
        json.multipleOf = multipleOf;
    };
    booleanProcessor = (_schema, _ctx, json, _params) => {
      json.type = "boolean";
    };
    nullProcessor = (_schema, ctx, json, _params) => {
      if (ctx.target === "openapi-3.0") {
        json.type = "string";
        json.nullable = true;
        json.enum = [null];
      } else {
        json.type = "null";
      }
    };
    neverProcessor = (_schema, _ctx, json, _params) => {
      json.not = {};
    };
    unknownProcessor = (_schema, _ctx, _json, _params) => {
    };
    enumProcessor = (schema, _ctx, json, _params) => {
      const def = schema._zod.def;
      const values = getEnumValues(def.entries);
      if (values.every((v) => typeof v === "number"))
        json.type = "number";
      if (values.every((v) => typeof v === "string"))
        json.type = "string";
      json.enum = values;
    };
    literalProcessor = (schema, ctx, json, _params) => {
      const def = schema._zod.def;
      const vals = [];
      for (const val of def.values) {
        if (val === void 0) {
          if (ctx.unrepresentable === "throw") {
            throw new Error("Literal `undefined` cannot be represented in JSON Schema");
          } else {
          }
        } else if (typeof val === "bigint") {
          if (ctx.unrepresentable === "throw") {
            throw new Error("BigInt literals cannot be represented in JSON Schema");
          } else {
            vals.push(Number(val));
          }
        } else {
          vals.push(val);
        }
      }
      if (vals.length === 0) {
      } else if (vals.length === 1) {
        const val = vals[0];
        json.type = val === null ? "null" : typeof val;
        if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
          json.enum = [val];
        } else {
          json.const = val;
        }
      } else {
        if (vals.every((v) => typeof v === "number"))
          json.type = "number";
        if (vals.every((v) => typeof v === "string"))
          json.type = "string";
        if (vals.every((v) => typeof v === "boolean"))
          json.type = "boolean";
        if (vals.every((v) => v === null))
          json.type = "null";
        json.enum = vals;
      }
    };
    customProcessor = (_schema, ctx, _json, _params) => {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Custom types cannot be represented in JSON Schema");
      }
    };
    transformProcessor = (_schema, ctx, _json, _params) => {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Transforms cannot be represented in JSON Schema");
      }
    };
    arrayProcessor = (schema, ctx, _json, params) => {
      const json = _json;
      const def = schema._zod.def;
      const { minimum, maximum } = schema._zod.bag;
      if (typeof minimum === "number")
        json.minItems = minimum;
      if (typeof maximum === "number")
        json.maxItems = maximum;
      json.type = "array";
      json.items = process2(def.element, ctx, {
        ...params,
        path: [...params.path, "items"]
      });
    };
    objectProcessor = (schema, ctx, _json, params) => {
      const json = _json;
      const def = schema._zod.def;
      json.type = "object";
      json.properties = {};
      const shape = def.shape;
      for (const key in shape) {
        json.properties[key] = process2(shape[key], ctx, {
          ...params,
          path: [...params.path, "properties", key]
        });
      }
      const allKeys = new Set(Object.keys(shape));
      const requiredKeys = new Set([...allKeys].filter((key) => {
        const v = def.shape[key]._zod;
        if (ctx.io === "input") {
          return v.optin === void 0;
        } else {
          return v.optout === void 0;
        }
      }));
      if (requiredKeys.size > 0) {
        json.required = Array.from(requiredKeys);
      }
      if (def.catchall?._zod.def.type === "never") {
        json.additionalProperties = false;
      } else if (!def.catchall) {
        if (ctx.io === "output")
          json.additionalProperties = false;
      } else if (def.catchall) {
        json.additionalProperties = process2(def.catchall, ctx, {
          ...params,
          path: [...params.path, "additionalProperties"]
        });
      }
    };
    unionProcessor = (schema, ctx, json, params) => {
      const def = schema._zod.def;
      const isExclusive = def.inclusive === false;
      const options = def.options.map((x, i) => process2(x, ctx, {
        ...params,
        path: [...params.path, isExclusive ? "oneOf" : "anyOf", i]
      }));
      if (isExclusive) {
        json.oneOf = options;
      } else {
        json.anyOf = options;
      }
    };
    intersectionProcessor = (schema, ctx, json, params) => {
      const def = schema._zod.def;
      const a = process2(def.left, ctx, {
        ...params,
        path: [...params.path, "allOf", 0]
      });
      const b = process2(def.right, ctx, {
        ...params,
        path: [...params.path, "allOf", 1]
      });
      const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
      const allOf = [
        ...isSimpleIntersection(a) ? a.allOf : [a],
        ...isSimpleIntersection(b) ? b.allOf : [b]
      ];
      json.allOf = allOf;
    };
    recordProcessor = (schema, ctx, _json, params) => {
      const json = _json;
      const def = schema._zod.def;
      json.type = "object";
      const keyType = def.keyType;
      const keyBag = keyType._zod.bag;
      const patterns = keyBag?.patterns;
      if (def.mode === "loose" && patterns && patterns.size > 0) {
        const valueSchema = process2(def.valueType, ctx, {
          ...params,
          path: [...params.path, "patternProperties", "*"]
        });
        json.patternProperties = {};
        for (const pattern of patterns) {
          json.patternProperties[pattern.source] = valueSchema;
        }
      } else {
        if (ctx.target === "draft-07" || ctx.target === "draft-2020-12") {
          json.propertyNames = process2(def.keyType, ctx, {
            ...params,
            path: [...params.path, "propertyNames"]
          });
        }
        json.additionalProperties = process2(def.valueType, ctx, {
          ...params,
          path: [...params.path, "additionalProperties"]
        });
      }
      const keyValues = keyType._zod.values;
      if (keyValues) {
        const validKeyValues = [...keyValues].filter((v) => typeof v === "string" || typeof v === "number");
        if (validKeyValues.length > 0) {
          json.required = validKeyValues;
        }
      }
    };
    nullableProcessor = (schema, ctx, json, params) => {
      const def = schema._zod.def;
      const inner = process2(def.innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      if (ctx.target === "openapi-3.0") {
        seen.ref = def.innerType;
        json.nullable = true;
      } else {
        json.anyOf = [inner, { type: "null" }];
      }
    };
    nonoptionalProcessor = (schema, ctx, _json, params) => {
      const def = schema._zod.def;
      process2(def.innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      seen.ref = def.innerType;
    };
    defaultProcessor = (schema, ctx, json, params) => {
      const def = schema._zod.def;
      process2(def.innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      seen.ref = def.innerType;
      json.default = JSON.parse(JSON.stringify(def.defaultValue));
    };
    prefaultProcessor = (schema, ctx, json, params) => {
      const def = schema._zod.def;
      process2(def.innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      seen.ref = def.innerType;
      if (ctx.io === "input")
        json._prefault = JSON.parse(JSON.stringify(def.defaultValue));
    };
    catchProcessor = (schema, ctx, json, params) => {
      const def = schema._zod.def;
      process2(def.innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      seen.ref = def.innerType;
      let catchValue;
      try {
        catchValue = def.catchValue(void 0);
      } catch {
        throw new Error("Dynamic catch values are not supported in JSON Schema");
      }
      json.default = catchValue;
    };
    pipeProcessor = (schema, ctx, _json, params) => {
      const def = schema._zod.def;
      const inIsTransform = def.in._zod.traits.has("$ZodTransform");
      const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
      process2(innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      seen.ref = innerType;
    };
    readonlyProcessor = (schema, ctx, json, params) => {
      const def = schema._zod.def;
      process2(def.innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      seen.ref = def.innerType;
      json.readOnly = true;
    };
    optionalProcessor = (schema, ctx, _json, params) => {
      const def = schema._zod.def;
      process2(def.innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      seen.ref = def.innerType;
    };
  }
});

// node_modules/zod/v4/core/json-schema.js
var init_json_schema = __esm({
  "node_modules/zod/v4/core/json-schema.js"() {
  }
});

// node_modules/zod/v4/core/index.js
var init_core2 = __esm({
  "node_modules/zod/v4/core/index.js"() {
    init_core();
    init_parse();
    init_errors();
    init_schemas();
    init_checks();
    init_versions();
    init_util();
    init_regexes();
    init_locales();
    init_registries();
    init_doc();
    init_api();
    init_to_json_schema();
    init_json_schema();
  }
});

// node_modules/zod/v4/classic/checks.js
var init_checks2 = __esm({
  "node_modules/zod/v4/classic/checks.js"() {
    init_core2();
  }
});

// node_modules/zod/v4/classic/iso.js
var iso_exports = {};
__export(iso_exports, {
  ZodISODate: () => ZodISODate,
  ZodISODateTime: () => ZodISODateTime,
  ZodISODuration: () => ZodISODuration,
  ZodISOTime: () => ZodISOTime,
  date: () => date2,
  datetime: () => datetime2,
  duration: () => duration2,
  time: () => time2
});
function datetime2(params) {
  return _isoDateTime(ZodISODateTime, params);
}
function date2(params) {
  return _isoDate(ZodISODate, params);
}
function time2(params) {
  return _isoTime(ZodISOTime, params);
}
function duration2(params) {
  return _isoDuration(ZodISODuration, params);
}
var ZodISODateTime, ZodISODate, ZodISOTime, ZodISODuration;
var init_iso = __esm({
  "node_modules/zod/v4/classic/iso.js"() {
    init_core2();
    init_schemas2();
    ZodISODateTime = /* @__PURE__ */ $constructor("ZodISODateTime", (inst, def) => {
      $ZodISODateTime.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodISODate = /* @__PURE__ */ $constructor("ZodISODate", (inst, def) => {
      $ZodISODate.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodISOTime = /* @__PURE__ */ $constructor("ZodISOTime", (inst, def) => {
      $ZodISOTime.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodISODuration = /* @__PURE__ */ $constructor("ZodISODuration", (inst, def) => {
      $ZodISODuration.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
  }
});

// node_modules/zod/v4/classic/errors.js
var initializer2, ZodRealError;
var init_errors2 = __esm({
  "node_modules/zod/v4/classic/errors.js"() {
    init_core2();
    init_core2();
    init_util();
    initializer2 = (inst, issues) => {
      $ZodError.init(inst, issues);
      inst.name = "ZodError";
      Object.defineProperties(inst, {
        format: {
          value: (mapper) => formatError(inst, mapper)
          // enumerable: false,
        },
        flatten: {
          value: (mapper) => flattenError(inst, mapper)
          // enumerable: false,
        },
        addIssue: {
          value: (issue2) => {
            inst.issues.push(issue2);
            inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
          }
          // enumerable: false,
        },
        addIssues: {
          value: (issues2) => {
            inst.issues.push(...issues2);
            inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
          }
          // enumerable: false,
        },
        isEmpty: {
          get() {
            return inst.issues.length === 0;
          }
          // enumerable: false,
        }
      });
    };
    ZodRealError = /* @__PURE__ */ $constructor("ZodError", initializer2, {
      Parent: Error
    });
  }
});

// node_modules/zod/v4/classic/parse.js
var parse2, parseAsync2, safeParse2, safeParseAsync2, encode, decode, encodeAsync, decodeAsync, safeEncode, safeDecode, safeEncodeAsync, safeDecodeAsync;
var init_parse2 = __esm({
  "node_modules/zod/v4/classic/parse.js"() {
    init_core2();
    init_errors2();
    parse2 = /* @__PURE__ */ _parse(ZodRealError);
    parseAsync2 = /* @__PURE__ */ _parseAsync(ZodRealError);
    safeParse2 = /* @__PURE__ */ _safeParse(ZodRealError);
    safeParseAsync2 = /* @__PURE__ */ _safeParseAsync(ZodRealError);
    encode = /* @__PURE__ */ _encode(ZodRealError);
    decode = /* @__PURE__ */ _decode(ZodRealError);
    encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
    decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
    safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
    safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
    safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
    safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);
  }
});

// node_modules/zod/v4/classic/schemas.js
function _installLazyMethods(inst, group, methods) {
  const proto = Object.getPrototypeOf(inst);
  let installed = _installedGroups.get(proto);
  if (!installed) {
    installed = /* @__PURE__ */ new Set();
    _installedGroups.set(proto, installed);
  }
  if (installed.has(group))
    return;
  installed.add(group);
  for (const key in methods) {
    const fn = methods[key];
    Object.defineProperty(proto, key, {
      configurable: true,
      enumerable: false,
      get() {
        const bound = fn.bind(this);
        Object.defineProperty(this, key, {
          configurable: true,
          writable: true,
          enumerable: true,
          value: bound
        });
        return bound;
      },
      set(v) {
        Object.defineProperty(this, key, {
          configurable: true,
          writable: true,
          enumerable: true,
          value: v
        });
      }
    });
  }
}
function string2(params) {
  return _string(ZodString, params);
}
function number2(params) {
  return _number(ZodNumber, params);
}
function int(params) {
  return _int(ZodNumberFormat, params);
}
function boolean2(params) {
  return _boolean(ZodBoolean, params);
}
function _null3(params) {
  return _null2(ZodNull, params);
}
function unknown() {
  return _unknown(ZodUnknown);
}
function never(params) {
  return _never(ZodNever, params);
}
function array(element, params) {
  return _array(ZodArray, element, params);
}
function object(shape, params) {
  const def = {
    type: "object",
    shape: shape ?? {},
    ...util_exports.normalizeParams(params)
  };
  return new ZodObject(def);
}
function looseObject(shape, params) {
  return new ZodObject({
    type: "object",
    shape,
    catchall: unknown(),
    ...util_exports.normalizeParams(params)
  });
}
function union(options, params) {
  return new ZodUnion({
    type: "union",
    options,
    ...util_exports.normalizeParams(params)
  });
}
function discriminatedUnion(discriminator, options, params) {
  return new ZodDiscriminatedUnion({
    type: "union",
    options,
    discriminator,
    ...util_exports.normalizeParams(params)
  });
}
function intersection(left, right) {
  return new ZodIntersection({
    type: "intersection",
    left,
    right
  });
}
function record(keyType, valueType, params) {
  if (!valueType || !valueType._zod) {
    return new ZodRecord({
      type: "record",
      keyType: string2(),
      valueType: keyType,
      ...util_exports.normalizeParams(valueType)
    });
  }
  return new ZodRecord({
    type: "record",
    keyType,
    valueType,
    ...util_exports.normalizeParams(params)
  });
}
function _enum(values, params) {
  const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
  return new ZodEnum({
    type: "enum",
    entries,
    ...util_exports.normalizeParams(params)
  });
}
function literal(value, params) {
  return new ZodLiteral({
    type: "literal",
    values: Array.isArray(value) ? value : [value],
    ...util_exports.normalizeParams(params)
  });
}
function transform(fn) {
  return new ZodTransform({
    type: "transform",
    transform: fn
  });
}
function optional(innerType) {
  return new ZodOptional({
    type: "optional",
    innerType
  });
}
function exactOptional(innerType) {
  return new ZodExactOptional({
    type: "optional",
    innerType
  });
}
function nullable(innerType) {
  return new ZodNullable({
    type: "nullable",
    innerType
  });
}
function _default(innerType, defaultValue) {
  return new ZodDefault({
    type: "default",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : util_exports.shallowClone(defaultValue);
    }
  });
}
function prefault(innerType, defaultValue) {
  return new ZodPrefault({
    type: "prefault",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : util_exports.shallowClone(defaultValue);
    }
  });
}
function nonoptional(innerType, params) {
  return new ZodNonOptional({
    type: "nonoptional",
    innerType,
    ...util_exports.normalizeParams(params)
  });
}
function _catch(innerType, catchValue) {
  return new ZodCatch({
    type: "catch",
    innerType,
    catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
  });
}
function pipe(in_, out) {
  return new ZodPipe({
    type: "pipe",
    in: in_,
    out
    // ...util.normalizeParams(params),
  });
}
function readonly(innerType) {
  return new ZodReadonly({
    type: "readonly",
    innerType
  });
}
function custom(fn, _params) {
  return _custom(ZodCustom, fn ?? (() => true), _params);
}
function refine(fn, _params = {}) {
  return _refine(ZodCustom, fn, _params);
}
function superRefine(fn, params) {
  return _superRefine(fn, params);
}
function preprocess(fn, schema) {
  return new ZodPreprocess({
    type: "pipe",
    in: transform(fn),
    out: schema
  });
}
var _installedGroups, ZodType, _ZodString, ZodString, ZodStringFormat, ZodEmail, ZodGUID, ZodUUID, ZodURL, ZodEmoji, ZodNanoID, ZodCUID, ZodCUID2, ZodULID, ZodXID, ZodKSUID, ZodIPv4, ZodIPv6, ZodCIDRv4, ZodCIDRv6, ZodBase64, ZodBase64URL, ZodE164, ZodJWT, ZodNumber, ZodNumberFormat, ZodBoolean, ZodNull, ZodUnknown, ZodNever, ZodArray, ZodObject, ZodUnion, ZodDiscriminatedUnion, ZodIntersection, ZodRecord, ZodEnum, ZodLiteral, ZodTransform, ZodOptional, ZodExactOptional, ZodNullable, ZodDefault, ZodPrefault, ZodNonOptional, ZodCatch, ZodPipe, ZodPreprocess, ZodReadonly, ZodCustom;
var init_schemas2 = __esm({
  "node_modules/zod/v4/classic/schemas.js"() {
    init_core2();
    init_core2();
    init_json_schema_processors();
    init_to_json_schema();
    init_checks2();
    init_iso();
    init_parse2();
    _installedGroups = /* @__PURE__ */ new WeakMap();
    ZodType = /* @__PURE__ */ $constructor("ZodType", (inst, def) => {
      $ZodType.init(inst, def);
      Object.assign(inst["~standard"], {
        jsonSchema: {
          input: createStandardJSONSchemaMethod(inst, "input"),
          output: createStandardJSONSchemaMethod(inst, "output")
        }
      });
      inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
      inst.def = def;
      inst.type = def.type;
      Object.defineProperty(inst, "_def", { value: def });
      inst.parse = (data, params) => parse2(inst, data, params, { callee: inst.parse });
      inst.safeParse = (data, params) => safeParse2(inst, data, params);
      inst.parseAsync = async (data, params) => parseAsync2(inst, data, params, { callee: inst.parseAsync });
      inst.safeParseAsync = async (data, params) => safeParseAsync2(inst, data, params);
      inst.spa = inst.safeParseAsync;
      inst.encode = (data, params) => encode(inst, data, params);
      inst.decode = (data, params) => decode(inst, data, params);
      inst.encodeAsync = async (data, params) => encodeAsync(inst, data, params);
      inst.decodeAsync = async (data, params) => decodeAsync(inst, data, params);
      inst.safeEncode = (data, params) => safeEncode(inst, data, params);
      inst.safeDecode = (data, params) => safeDecode(inst, data, params);
      inst.safeEncodeAsync = async (data, params) => safeEncodeAsync(inst, data, params);
      inst.safeDecodeAsync = async (data, params) => safeDecodeAsync(inst, data, params);
      _installLazyMethods(inst, "ZodType", {
        check(...chks) {
          const def2 = this.def;
          return this.clone(util_exports.mergeDefs(def2, {
            checks: [
              ...def2.checks ?? [],
              ...chks.map((ch) => typeof ch === "function" ? { _zod: { check: ch, def: { check: "custom" }, onattach: [] } } : ch)
            ]
          }), { parent: true });
        },
        with(...chks) {
          return this.check(...chks);
        },
        clone(def2, params) {
          return clone(this, def2, params);
        },
        brand() {
          return this;
        },
        register(reg, meta2) {
          reg.add(this, meta2);
          return this;
        },
        refine(check, params) {
          return this.check(refine(check, params));
        },
        superRefine(refinement, params) {
          return this.check(superRefine(refinement, params));
        },
        overwrite(fn) {
          return this.check(_overwrite(fn));
        },
        optional() {
          return optional(this);
        },
        exactOptional() {
          return exactOptional(this);
        },
        nullable() {
          return nullable(this);
        },
        nullish() {
          return optional(nullable(this));
        },
        nonoptional(params) {
          return nonoptional(this, params);
        },
        array() {
          return array(this);
        },
        or(arg) {
          return union([this, arg]);
        },
        and(arg) {
          return intersection(this, arg);
        },
        transform(tx) {
          return pipe(this, transform(tx));
        },
        default(d) {
          return _default(this, d);
        },
        prefault(d) {
          return prefault(this, d);
        },
        catch(params) {
          return _catch(this, params);
        },
        pipe(target) {
          return pipe(this, target);
        },
        readonly() {
          return readonly(this);
        },
        describe(description) {
          const cl = this.clone();
          globalRegistry.add(cl, { description });
          return cl;
        },
        meta(...args) {
          if (args.length === 0)
            return globalRegistry.get(this);
          const cl = this.clone();
          globalRegistry.add(cl, args[0]);
          return cl;
        },
        isOptional() {
          return this.safeParse(void 0).success;
        },
        isNullable() {
          return this.safeParse(null).success;
        },
        apply(fn) {
          return fn(this);
        }
      });
      Object.defineProperty(inst, "description", {
        get() {
          return globalRegistry.get(inst)?.description;
        },
        configurable: true
      });
      return inst;
    });
    _ZodString = /* @__PURE__ */ $constructor("_ZodString", (inst, def) => {
      $ZodString.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
      const bag = inst._zod.bag;
      inst.format = bag.format ?? null;
      inst.minLength = bag.minimum ?? null;
      inst.maxLength = bag.maximum ?? null;
      _installLazyMethods(inst, "_ZodString", {
        regex(...args) {
          return this.check(_regex(...args));
        },
        includes(...args) {
          return this.check(_includes(...args));
        },
        startsWith(...args) {
          return this.check(_startsWith(...args));
        },
        endsWith(...args) {
          return this.check(_endsWith(...args));
        },
        min(...args) {
          return this.check(_minLength(...args));
        },
        max(...args) {
          return this.check(_maxLength(...args));
        },
        length(...args) {
          return this.check(_length(...args));
        },
        nonempty(...args) {
          return this.check(_minLength(1, ...args));
        },
        lowercase(params) {
          return this.check(_lowercase(params));
        },
        uppercase(params) {
          return this.check(_uppercase(params));
        },
        trim() {
          return this.check(_trim());
        },
        normalize(...args) {
          return this.check(_normalize(...args));
        },
        toLowerCase() {
          return this.check(_toLowerCase());
        },
        toUpperCase() {
          return this.check(_toUpperCase());
        },
        slugify() {
          return this.check(_slugify());
        }
      });
    });
    ZodString = /* @__PURE__ */ $constructor("ZodString", (inst, def) => {
      $ZodString.init(inst, def);
      _ZodString.init(inst, def);
      inst.email = (params) => inst.check(_email(ZodEmail, params));
      inst.url = (params) => inst.check(_url(ZodURL, params));
      inst.jwt = (params) => inst.check(_jwt(ZodJWT, params));
      inst.emoji = (params) => inst.check(_emoji2(ZodEmoji, params));
      inst.guid = (params) => inst.check(_guid(ZodGUID, params));
      inst.uuid = (params) => inst.check(_uuid(ZodUUID, params));
      inst.uuidv4 = (params) => inst.check(_uuidv4(ZodUUID, params));
      inst.uuidv6 = (params) => inst.check(_uuidv6(ZodUUID, params));
      inst.uuidv7 = (params) => inst.check(_uuidv7(ZodUUID, params));
      inst.nanoid = (params) => inst.check(_nanoid(ZodNanoID, params));
      inst.guid = (params) => inst.check(_guid(ZodGUID, params));
      inst.cuid = (params) => inst.check(_cuid(ZodCUID, params));
      inst.cuid2 = (params) => inst.check(_cuid2(ZodCUID2, params));
      inst.ulid = (params) => inst.check(_ulid(ZodULID, params));
      inst.base64 = (params) => inst.check(_base64(ZodBase64, params));
      inst.base64url = (params) => inst.check(_base64url(ZodBase64URL, params));
      inst.xid = (params) => inst.check(_xid(ZodXID, params));
      inst.ksuid = (params) => inst.check(_ksuid(ZodKSUID, params));
      inst.ipv4 = (params) => inst.check(_ipv4(ZodIPv4, params));
      inst.ipv6 = (params) => inst.check(_ipv6(ZodIPv6, params));
      inst.cidrv4 = (params) => inst.check(_cidrv4(ZodCIDRv4, params));
      inst.cidrv6 = (params) => inst.check(_cidrv6(ZodCIDRv6, params));
      inst.e164 = (params) => inst.check(_e164(ZodE164, params));
      inst.datetime = (params) => inst.check(datetime2(params));
      inst.date = (params) => inst.check(date2(params));
      inst.time = (params) => inst.check(time2(params));
      inst.duration = (params) => inst.check(duration2(params));
    });
    ZodStringFormat = /* @__PURE__ */ $constructor("ZodStringFormat", (inst, def) => {
      $ZodStringFormat.init(inst, def);
      _ZodString.init(inst, def);
    });
    ZodEmail = /* @__PURE__ */ $constructor("ZodEmail", (inst, def) => {
      $ZodEmail.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodGUID = /* @__PURE__ */ $constructor("ZodGUID", (inst, def) => {
      $ZodGUID.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodUUID = /* @__PURE__ */ $constructor("ZodUUID", (inst, def) => {
      $ZodUUID.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodURL = /* @__PURE__ */ $constructor("ZodURL", (inst, def) => {
      $ZodURL.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodEmoji = /* @__PURE__ */ $constructor("ZodEmoji", (inst, def) => {
      $ZodEmoji.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodNanoID = /* @__PURE__ */ $constructor("ZodNanoID", (inst, def) => {
      $ZodNanoID.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodCUID = /* @__PURE__ */ $constructor("ZodCUID", (inst, def) => {
      $ZodCUID.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodCUID2 = /* @__PURE__ */ $constructor("ZodCUID2", (inst, def) => {
      $ZodCUID2.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodULID = /* @__PURE__ */ $constructor("ZodULID", (inst, def) => {
      $ZodULID.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodXID = /* @__PURE__ */ $constructor("ZodXID", (inst, def) => {
      $ZodXID.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodKSUID = /* @__PURE__ */ $constructor("ZodKSUID", (inst, def) => {
      $ZodKSUID.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodIPv4 = /* @__PURE__ */ $constructor("ZodIPv4", (inst, def) => {
      $ZodIPv4.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodIPv6 = /* @__PURE__ */ $constructor("ZodIPv6", (inst, def) => {
      $ZodIPv6.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodCIDRv4 = /* @__PURE__ */ $constructor("ZodCIDRv4", (inst, def) => {
      $ZodCIDRv4.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodCIDRv6 = /* @__PURE__ */ $constructor("ZodCIDRv6", (inst, def) => {
      $ZodCIDRv6.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodBase64 = /* @__PURE__ */ $constructor("ZodBase64", (inst, def) => {
      $ZodBase64.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodBase64URL = /* @__PURE__ */ $constructor("ZodBase64URL", (inst, def) => {
      $ZodBase64URL.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodE164 = /* @__PURE__ */ $constructor("ZodE164", (inst, def) => {
      $ZodE164.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodJWT = /* @__PURE__ */ $constructor("ZodJWT", (inst, def) => {
      $ZodJWT.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    ZodNumber = /* @__PURE__ */ $constructor("ZodNumber", (inst, def) => {
      $ZodNumber.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
      _installLazyMethods(inst, "ZodNumber", {
        gt(value, params) {
          return this.check(_gt(value, params));
        },
        gte(value, params) {
          return this.check(_gte(value, params));
        },
        min(value, params) {
          return this.check(_gte(value, params));
        },
        lt(value, params) {
          return this.check(_lt(value, params));
        },
        lte(value, params) {
          return this.check(_lte(value, params));
        },
        max(value, params) {
          return this.check(_lte(value, params));
        },
        int(params) {
          return this.check(int(params));
        },
        safe(params) {
          return this.check(int(params));
        },
        positive(params) {
          return this.check(_gt(0, params));
        },
        nonnegative(params) {
          return this.check(_gte(0, params));
        },
        negative(params) {
          return this.check(_lt(0, params));
        },
        nonpositive(params) {
          return this.check(_lte(0, params));
        },
        multipleOf(value, params) {
          return this.check(_multipleOf(value, params));
        },
        step(value, params) {
          return this.check(_multipleOf(value, params));
        },
        finite() {
          return this;
        }
      });
      const bag = inst._zod.bag;
      inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
      inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
      inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? 0.5);
      inst.isFinite = true;
      inst.format = bag.format ?? null;
    });
    ZodNumberFormat = /* @__PURE__ */ $constructor("ZodNumberFormat", (inst, def) => {
      $ZodNumberFormat.init(inst, def);
      ZodNumber.init(inst, def);
    });
    ZodBoolean = /* @__PURE__ */ $constructor("ZodBoolean", (inst, def) => {
      $ZodBoolean.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json, params) => booleanProcessor(inst, ctx, json, params);
    });
    ZodNull = /* @__PURE__ */ $constructor("ZodNull", (inst, def) => {
      $ZodNull.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json, params) => nullProcessor(inst, ctx, json, params);
    });
    ZodUnknown = /* @__PURE__ */ $constructor("ZodUnknown", (inst, def) => {
      $ZodUnknown.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json, params) => unknownProcessor(inst, ctx, json, params);
    });
    ZodNever = /* @__PURE__ */ $constructor("ZodNever", (inst, def) => {
      $ZodNever.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
    });
    ZodArray = /* @__PURE__ */ $constructor("ZodArray", (inst, def) => {
      $ZodArray.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
      inst.element = def.element;
      _installLazyMethods(inst, "ZodArray", {
        min(n, params) {
          return this.check(_minLength(n, params));
        },
        nonempty(params) {
          return this.check(_minLength(1, params));
        },
        max(n, params) {
          return this.check(_maxLength(n, params));
        },
        length(n, params) {
          return this.check(_length(n, params));
        },
        unwrap() {
          return this.element;
        }
      });
    });
    ZodObject = /* @__PURE__ */ $constructor("ZodObject", (inst, def) => {
      $ZodObjectJIT.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
      util_exports.defineLazy(inst, "shape", () => {
        return def.shape;
      });
      _installLazyMethods(inst, "ZodObject", {
        keyof() {
          return _enum(Object.keys(this._zod.def.shape));
        },
        catchall(catchall) {
          return this.clone({ ...this._zod.def, catchall });
        },
        passthrough() {
          return this.clone({ ...this._zod.def, catchall: unknown() });
        },
        loose() {
          return this.clone({ ...this._zod.def, catchall: unknown() });
        },
        strict() {
          return this.clone({ ...this._zod.def, catchall: never() });
        },
        strip() {
          return this.clone({ ...this._zod.def, catchall: void 0 });
        },
        extend(incoming) {
          return util_exports.extend(this, incoming);
        },
        safeExtend(incoming) {
          return util_exports.safeExtend(this, incoming);
        },
        merge(other) {
          return util_exports.merge(this, other);
        },
        pick(mask) {
          return util_exports.pick(this, mask);
        },
        omit(mask) {
          return util_exports.omit(this, mask);
        },
        partial(...args) {
          return util_exports.partial(ZodOptional, this, args[0]);
        },
        required(...args) {
          return util_exports.required(ZodNonOptional, this, args[0]);
        }
      });
    });
    ZodUnion = /* @__PURE__ */ $constructor("ZodUnion", (inst, def) => {
      $ZodUnion.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
      inst.options = def.options;
    });
    ZodDiscriminatedUnion = /* @__PURE__ */ $constructor("ZodDiscriminatedUnion", (inst, def) => {
      ZodUnion.init(inst, def);
      $ZodDiscriminatedUnion.init(inst, def);
    });
    ZodIntersection = /* @__PURE__ */ $constructor("ZodIntersection", (inst, def) => {
      $ZodIntersection.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
    });
    ZodRecord = /* @__PURE__ */ $constructor("ZodRecord", (inst, def) => {
      $ZodRecord.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json, params) => recordProcessor(inst, ctx, json, params);
      inst.keyType = def.keyType;
      inst.valueType = def.valueType;
    });
    ZodEnum = /* @__PURE__ */ $constructor("ZodEnum", (inst, def) => {
      $ZodEnum.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
      inst.enum = def.entries;
      inst.options = Object.values(def.entries);
      const keys = new Set(Object.keys(def.entries));
      inst.extract = (values, params) => {
        const newEntries = {};
        for (const value of values) {
          if (keys.has(value)) {
            newEntries[value] = def.entries[value];
          } else
            throw new Error(`Key ${value} not found in enum`);
        }
        return new ZodEnum({
          ...def,
          checks: [],
          ...util_exports.normalizeParams(params),
          entries: newEntries
        });
      };
      inst.exclude = (values, params) => {
        const newEntries = { ...def.entries };
        for (const value of values) {
          if (keys.has(value)) {
            delete newEntries[value];
          } else
            throw new Error(`Key ${value} not found in enum`);
        }
        return new ZodEnum({
          ...def,
          checks: [],
          ...util_exports.normalizeParams(params),
          entries: newEntries
        });
      };
    });
    ZodLiteral = /* @__PURE__ */ $constructor("ZodLiteral", (inst, def) => {
      $ZodLiteral.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json, params) => literalProcessor(inst, ctx, json, params);
      inst.values = new Set(def.values);
      Object.defineProperty(inst, "value", {
        get() {
          if (def.values.length > 1) {
            throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
          }
          return def.values[0];
        }
      });
    });
    ZodTransform = /* @__PURE__ */ $constructor("ZodTransform", (inst, def) => {
      $ZodTransform.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
      inst._zod.parse = (payload, _ctx) => {
        if (_ctx.direction === "backward") {
          throw new $ZodEncodeError(inst.constructor.name);
        }
        payload.addIssue = (issue2) => {
          if (typeof issue2 === "string") {
            payload.issues.push(util_exports.issue(issue2, payload.value, def));
          } else {
            const _issue = issue2;
            if (_issue.fatal)
              _issue.continue = false;
            _issue.code ?? (_issue.code = "custom");
            _issue.input ?? (_issue.input = payload.value);
            _issue.inst ?? (_issue.inst = inst);
            payload.issues.push(util_exports.issue(_issue));
          }
        };
        const output = def.transform(payload.value, payload);
        if (output instanceof Promise) {
          return output.then((output2) => {
            payload.value = output2;
            payload.fallback = true;
            return payload;
          });
        }
        payload.value = output;
        payload.fallback = true;
        return payload;
      };
    });
    ZodOptional = /* @__PURE__ */ $constructor("ZodOptional", (inst, def) => {
      $ZodOptional.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
      inst.unwrap = () => inst._zod.def.innerType;
    });
    ZodExactOptional = /* @__PURE__ */ $constructor("ZodExactOptional", (inst, def) => {
      $ZodExactOptional.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
      inst.unwrap = () => inst._zod.def.innerType;
    });
    ZodNullable = /* @__PURE__ */ $constructor("ZodNullable", (inst, def) => {
      $ZodNullable.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
      inst.unwrap = () => inst._zod.def.innerType;
    });
    ZodDefault = /* @__PURE__ */ $constructor("ZodDefault", (inst, def) => {
      $ZodDefault.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
      inst.unwrap = () => inst._zod.def.innerType;
      inst.removeDefault = inst.unwrap;
    });
    ZodPrefault = /* @__PURE__ */ $constructor("ZodPrefault", (inst, def) => {
      $ZodPrefault.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
      inst.unwrap = () => inst._zod.def.innerType;
    });
    ZodNonOptional = /* @__PURE__ */ $constructor("ZodNonOptional", (inst, def) => {
      $ZodNonOptional.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
      inst.unwrap = () => inst._zod.def.innerType;
    });
    ZodCatch = /* @__PURE__ */ $constructor("ZodCatch", (inst, def) => {
      $ZodCatch.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
      inst.unwrap = () => inst._zod.def.innerType;
      inst.removeCatch = inst.unwrap;
    });
    ZodPipe = /* @__PURE__ */ $constructor("ZodPipe", (inst, def) => {
      $ZodPipe.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
      inst.in = def.in;
      inst.out = def.out;
    });
    ZodPreprocess = /* @__PURE__ */ $constructor("ZodPreprocess", (inst, def) => {
      ZodPipe.init(inst, def);
      $ZodPreprocess.init(inst, def);
    });
    ZodReadonly = /* @__PURE__ */ $constructor("ZodReadonly", (inst, def) => {
      $ZodReadonly.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
      inst.unwrap = () => inst._zod.def.innerType;
    });
    ZodCustom = /* @__PURE__ */ $constructor("ZodCustom", (inst, def) => {
      $ZodCustom.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
    });
  }
});

// node_modules/zod/v4/classic/compat.js
var ZodFirstPartyTypeKind;
var init_compat = __esm({
  "node_modules/zod/v4/classic/compat.js"() {
    /* @__PURE__ */ (function(ZodFirstPartyTypeKind2) {
    })(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
  }
});

// node_modules/zod/v4/classic/coerce.js
var init_coerce = __esm({
  "node_modules/zod/v4/classic/coerce.js"() {
  }
});

// node_modules/zod/v4/classic/external.js
var init_external = __esm({
  "node_modules/zod/v4/classic/external.js"() {
    init_core2();
    init_schemas2();
    init_checks2();
    init_errors2();
    init_parse2();
    init_compat();
    init_core2();
    init_en();
    init_locales();
    init_iso();
    init_coerce();
    config(en_default());
  }
});

// node_modules/zod/v4/classic/index.js
var init_classic = __esm({
  "node_modules/zod/v4/classic/index.js"() {
    init_external();
  }
});

// node_modules/zod/v4/index.js
var init_v4 = __esm({
  "node_modules/zod/v4/index.js"() {
    init_classic();
  }
});

// node_modules/@modelcontextprotocol/sdk/dist/esm/types.js
var LATEST_PROTOCOL_VERSION, SUPPORTED_PROTOCOL_VERSIONS, RELATED_TASK_META_KEY, JSONRPC_VERSION, AssertObjectSchema, ProgressTokenSchema, CursorSchema, TaskCreationParamsSchema, TaskMetadataSchema, RelatedTaskMetadataSchema, RequestMetaSchema, BaseRequestParamsSchema, TaskAugmentedRequestParamsSchema, isTaskAugmentedRequestParams, RequestSchema, NotificationsParamsSchema, NotificationSchema, ResultSchema, RequestIdSchema, JSONRPCRequestSchema, isJSONRPCRequest, JSONRPCNotificationSchema, isJSONRPCNotification, JSONRPCResultResponseSchema, isJSONRPCResultResponse, ErrorCode, JSONRPCErrorResponseSchema, isJSONRPCErrorResponse, JSONRPCMessageSchema, JSONRPCResponseSchema, EmptyResultSchema, CancelledNotificationParamsSchema, CancelledNotificationSchema, IconSchema, IconsSchema, BaseMetadataSchema, ImplementationSchema, FormElicitationCapabilitySchema, ElicitationCapabilitySchema, ClientTasksCapabilitySchema, ServerTasksCapabilitySchema, ClientCapabilitiesSchema, InitializeRequestParamsSchema, InitializeRequestSchema, ServerCapabilitiesSchema, InitializeResultSchema, InitializedNotificationSchema, PingRequestSchema, ProgressSchema, ProgressNotificationParamsSchema, ProgressNotificationSchema, PaginatedRequestParamsSchema, PaginatedRequestSchema, PaginatedResultSchema, TaskStatusSchema, TaskSchema, CreateTaskResultSchema, TaskStatusNotificationParamsSchema, TaskStatusNotificationSchema, GetTaskRequestSchema, GetTaskResultSchema, GetTaskPayloadRequestSchema, GetTaskPayloadResultSchema, ListTasksRequestSchema, ListTasksResultSchema, CancelTaskRequestSchema, CancelTaskResultSchema, ResourceContentsSchema, TextResourceContentsSchema, Base64Schema, BlobResourceContentsSchema, RoleSchema, AnnotationsSchema, ResourceSchema, ResourceTemplateSchema, ListResourcesRequestSchema, ListResourcesResultSchema, ListResourceTemplatesRequestSchema, ListResourceTemplatesResultSchema, ResourceRequestParamsSchema, ReadResourceRequestParamsSchema, ReadResourceRequestSchema, ReadResourceResultSchema, ResourceListChangedNotificationSchema, SubscribeRequestParamsSchema, SubscribeRequestSchema, UnsubscribeRequestParamsSchema, UnsubscribeRequestSchema, ResourceUpdatedNotificationParamsSchema, ResourceUpdatedNotificationSchema, PromptArgumentSchema, PromptSchema, ListPromptsRequestSchema, ListPromptsResultSchema, GetPromptRequestParamsSchema, GetPromptRequestSchema, TextContentSchema, ImageContentSchema, AudioContentSchema, ToolUseContentSchema, EmbeddedResourceSchema, ResourceLinkSchema, ContentBlockSchema, PromptMessageSchema, GetPromptResultSchema, PromptListChangedNotificationSchema, ToolAnnotationsSchema, ToolExecutionSchema, ToolSchema, ListToolsRequestSchema, ListToolsResultSchema, CallToolResultSchema, CompatibilityCallToolResultSchema, CallToolRequestParamsSchema, CallToolRequestSchema, ToolListChangedNotificationSchema, ListChangedOptionsBaseSchema, LoggingLevelSchema, SetLevelRequestParamsSchema, SetLevelRequestSchema, LoggingMessageNotificationParamsSchema, LoggingMessageNotificationSchema, ModelHintSchema, ModelPreferencesSchema, ToolChoiceSchema, ToolResultContentSchema, SamplingContentSchema, SamplingMessageContentBlockSchema, SamplingMessageSchema, CreateMessageRequestParamsSchema, CreateMessageRequestSchema, CreateMessageResultSchema, CreateMessageResultWithToolsSchema, BooleanSchemaSchema, StringSchemaSchema, NumberSchemaSchema, UntitledSingleSelectEnumSchemaSchema, TitledSingleSelectEnumSchemaSchema, LegacyTitledEnumSchemaSchema, SingleSelectEnumSchemaSchema, UntitledMultiSelectEnumSchemaSchema, TitledMultiSelectEnumSchemaSchema, MultiSelectEnumSchemaSchema, EnumSchemaSchema, PrimitiveSchemaDefinitionSchema, ElicitRequestFormParamsSchema, ElicitRequestURLParamsSchema, ElicitRequestParamsSchema, ElicitRequestSchema, ElicitationCompleteNotificationParamsSchema, ElicitationCompleteNotificationSchema, ElicitResultSchema, ResourceTemplateReferenceSchema, PromptReferenceSchema, CompleteRequestParamsSchema, CompleteRequestSchema, CompleteResultSchema, RootSchema, ListRootsRequestSchema, ListRootsResultSchema, RootsListChangedNotificationSchema, ClientRequestSchema, ClientNotificationSchema, ClientResultSchema, ServerRequestSchema, ServerNotificationSchema, ServerResultSchema, McpError, UrlElicitationRequiredError;
var init_types = __esm({
  "node_modules/@modelcontextprotocol/sdk/dist/esm/types.js"() {
    init_v4();
    LATEST_PROTOCOL_VERSION = "2025-11-25";
    SUPPORTED_PROTOCOL_VERSIONS = [LATEST_PROTOCOL_VERSION, "2025-06-18", "2025-03-26", "2024-11-05", "2024-10-07"];
    RELATED_TASK_META_KEY = "io.modelcontextprotocol/related-task";
    JSONRPC_VERSION = "2.0";
    AssertObjectSchema = custom((v) => v !== null && (typeof v === "object" || typeof v === "function"));
    ProgressTokenSchema = union([string2(), number2().int()]);
    CursorSchema = string2();
    TaskCreationParamsSchema = looseObject({
      /**
       * Requested duration in milliseconds to retain task from creation.
       */
      ttl: number2().optional(),
      /**
       * Time in milliseconds to wait between task status requests.
       */
      pollInterval: number2().optional()
    });
    TaskMetadataSchema = object({
      ttl: number2().optional()
    });
    RelatedTaskMetadataSchema = object({
      taskId: string2()
    });
    RequestMetaSchema = looseObject({
      /**
       * If specified, the caller is requesting out-of-band progress notifications for this request (as represented by notifications/progress). The value of this parameter is an opaque token that will be attached to any subsequent notifications. The receiver is not obligated to provide these notifications.
       */
      progressToken: ProgressTokenSchema.optional(),
      /**
       * If specified, this request is related to the provided task.
       */
      [RELATED_TASK_META_KEY]: RelatedTaskMetadataSchema.optional()
    });
    BaseRequestParamsSchema = object({
      /**
       * See [General fields: `_meta`](/specification/draft/basic/index#meta) for notes on `_meta` usage.
       */
      _meta: RequestMetaSchema.optional()
    });
    TaskAugmentedRequestParamsSchema = BaseRequestParamsSchema.extend({
      /**
       * If specified, the caller is requesting task-augmented execution for this request.
       * The request will return a CreateTaskResult immediately, and the actual result can be
       * retrieved later via tasks/result.
       *
       * Task augmentation is subject to capability negotiation - receivers MUST declare support
       * for task augmentation of specific request types in their capabilities.
       */
      task: TaskMetadataSchema.optional()
    });
    isTaskAugmentedRequestParams = (value) => TaskAugmentedRequestParamsSchema.safeParse(value).success;
    RequestSchema = object({
      method: string2(),
      params: BaseRequestParamsSchema.loose().optional()
    });
    NotificationsParamsSchema = object({
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: RequestMetaSchema.optional()
    });
    NotificationSchema = object({
      method: string2(),
      params: NotificationsParamsSchema.loose().optional()
    });
    ResultSchema = looseObject({
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: RequestMetaSchema.optional()
    });
    RequestIdSchema = union([string2(), number2().int()]);
    JSONRPCRequestSchema = object({
      jsonrpc: literal(JSONRPC_VERSION),
      id: RequestIdSchema,
      ...RequestSchema.shape
    }).strict();
    isJSONRPCRequest = (value) => JSONRPCRequestSchema.safeParse(value).success;
    JSONRPCNotificationSchema = object({
      jsonrpc: literal(JSONRPC_VERSION),
      ...NotificationSchema.shape
    }).strict();
    isJSONRPCNotification = (value) => JSONRPCNotificationSchema.safeParse(value).success;
    JSONRPCResultResponseSchema = object({
      jsonrpc: literal(JSONRPC_VERSION),
      id: RequestIdSchema,
      result: ResultSchema
    }).strict();
    isJSONRPCResultResponse = (value) => JSONRPCResultResponseSchema.safeParse(value).success;
    (function(ErrorCode2) {
      ErrorCode2[ErrorCode2["ConnectionClosed"] = -32e3] = "ConnectionClosed";
      ErrorCode2[ErrorCode2["RequestTimeout"] = -32001] = "RequestTimeout";
      ErrorCode2[ErrorCode2["ParseError"] = -32700] = "ParseError";
      ErrorCode2[ErrorCode2["InvalidRequest"] = -32600] = "InvalidRequest";
      ErrorCode2[ErrorCode2["MethodNotFound"] = -32601] = "MethodNotFound";
      ErrorCode2[ErrorCode2["InvalidParams"] = -32602] = "InvalidParams";
      ErrorCode2[ErrorCode2["InternalError"] = -32603] = "InternalError";
      ErrorCode2[ErrorCode2["UrlElicitationRequired"] = -32042] = "UrlElicitationRequired";
    })(ErrorCode || (ErrorCode = {}));
    JSONRPCErrorResponseSchema = object({
      jsonrpc: literal(JSONRPC_VERSION),
      id: RequestIdSchema.optional(),
      error: object({
        /**
         * The error type that occurred.
         */
        code: number2().int(),
        /**
         * A short description of the error. The message SHOULD be limited to a concise single sentence.
         */
        message: string2(),
        /**
         * Additional information about the error. The value of this member is defined by the sender (e.g. detailed error information, nested errors etc.).
         */
        data: unknown().optional()
      })
    }).strict();
    isJSONRPCErrorResponse = (value) => JSONRPCErrorResponseSchema.safeParse(value).success;
    JSONRPCMessageSchema = union([
      JSONRPCRequestSchema,
      JSONRPCNotificationSchema,
      JSONRPCResultResponseSchema,
      JSONRPCErrorResponseSchema
    ]);
    JSONRPCResponseSchema = union([JSONRPCResultResponseSchema, JSONRPCErrorResponseSchema]);
    EmptyResultSchema = ResultSchema.strict();
    CancelledNotificationParamsSchema = NotificationsParamsSchema.extend({
      /**
       * The ID of the request to cancel.
       *
       * This MUST correspond to the ID of a request previously issued in the same direction.
       */
      requestId: RequestIdSchema.optional(),
      /**
       * An optional string describing the reason for the cancellation. This MAY be logged or presented to the user.
       */
      reason: string2().optional()
    });
    CancelledNotificationSchema = NotificationSchema.extend({
      method: literal("notifications/cancelled"),
      params: CancelledNotificationParamsSchema
    });
    IconSchema = object({
      /**
       * URL or data URI for the icon.
       */
      src: string2(),
      /**
       * Optional MIME type for the icon.
       */
      mimeType: string2().optional(),
      /**
       * Optional array of strings that specify sizes at which the icon can be used.
       * Each string should be in WxH format (e.g., `"48x48"`, `"96x96"`) or `"any"` for scalable formats like SVG.
       *
       * If not provided, the client should assume that the icon can be used at any size.
       */
      sizes: array(string2()).optional(),
      /**
       * Optional specifier for the theme this icon is designed for. `light` indicates
       * the icon is designed to be used with a light background, and `dark` indicates
       * the icon is designed to be used with a dark background.
       *
       * If not provided, the client should assume the icon can be used with any theme.
       */
      theme: _enum(["light", "dark"]).optional()
    });
    IconsSchema = object({
      /**
       * Optional set of sized icons that the client can display in a user interface.
       *
       * Clients that support rendering icons MUST support at least the following MIME types:
       * - `image/png` - PNG images (safe, universal compatibility)
       * - `image/jpeg` (and `image/jpg`) - JPEG images (safe, universal compatibility)
       *
       * Clients that support rendering icons SHOULD also support:
       * - `image/svg+xml` - SVG images (scalable but requires security precautions)
       * - `image/webp` - WebP images (modern, efficient format)
       */
      icons: array(IconSchema).optional()
    });
    BaseMetadataSchema = object({
      /** Intended for programmatic or logical use, but used as a display name in past specs or fallback */
      name: string2(),
      /**
       * Intended for UI and end-user contexts — optimized to be human-readable and easily understood,
       * even by those unfamiliar with domain-specific terminology.
       *
       * If not provided, the name should be used for display (except for Tool,
       * where `annotations.title` should be given precedence over using `name`,
       * if present).
       */
      title: string2().optional()
    });
    ImplementationSchema = BaseMetadataSchema.extend({
      ...BaseMetadataSchema.shape,
      ...IconsSchema.shape,
      version: string2(),
      /**
       * An optional URL of the website for this implementation.
       */
      websiteUrl: string2().optional(),
      /**
       * An optional human-readable description of what this implementation does.
       *
       * This can be used by clients or servers to provide context about their purpose
       * and capabilities. For example, a server might describe the types of resources
       * or tools it provides, while a client might describe its intended use case.
       */
      description: string2().optional()
    });
    FormElicitationCapabilitySchema = intersection(object({
      applyDefaults: boolean2().optional()
    }), record(string2(), unknown()));
    ElicitationCapabilitySchema = preprocess((value) => {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        if (Object.keys(value).length === 0) {
          return { form: {} };
        }
      }
      return value;
    }, intersection(object({
      form: FormElicitationCapabilitySchema.optional(),
      url: AssertObjectSchema.optional()
    }), record(string2(), unknown()).optional()));
    ClientTasksCapabilitySchema = looseObject({
      /**
       * Present if the client supports listing tasks.
       */
      list: AssertObjectSchema.optional(),
      /**
       * Present if the client supports cancelling tasks.
       */
      cancel: AssertObjectSchema.optional(),
      /**
       * Capabilities for task creation on specific request types.
       */
      requests: looseObject({
        /**
         * Task support for sampling requests.
         */
        sampling: looseObject({
          createMessage: AssertObjectSchema.optional()
        }).optional(),
        /**
         * Task support for elicitation requests.
         */
        elicitation: looseObject({
          create: AssertObjectSchema.optional()
        }).optional()
      }).optional()
    });
    ServerTasksCapabilitySchema = looseObject({
      /**
       * Present if the server supports listing tasks.
       */
      list: AssertObjectSchema.optional(),
      /**
       * Present if the server supports cancelling tasks.
       */
      cancel: AssertObjectSchema.optional(),
      /**
       * Capabilities for task creation on specific request types.
       */
      requests: looseObject({
        /**
         * Task support for tool requests.
         */
        tools: looseObject({
          call: AssertObjectSchema.optional()
        }).optional()
      }).optional()
    });
    ClientCapabilitiesSchema = object({
      /**
       * Experimental, non-standard capabilities that the client supports.
       */
      experimental: record(string2(), AssertObjectSchema).optional(),
      /**
       * Present if the client supports sampling from an LLM.
       */
      sampling: object({
        /**
         * Present if the client supports context inclusion via includeContext parameter.
         * If not declared, servers SHOULD only use `includeContext: "none"` (or omit it).
         */
        context: AssertObjectSchema.optional(),
        /**
         * Present if the client supports tool use via tools and toolChoice parameters.
         */
        tools: AssertObjectSchema.optional()
      }).optional(),
      /**
       * Present if the client supports eliciting user input.
       */
      elicitation: ElicitationCapabilitySchema.optional(),
      /**
       * Present if the client supports listing roots.
       */
      roots: object({
        /**
         * Whether the client supports issuing notifications for changes to the roots list.
         */
        listChanged: boolean2().optional()
      }).optional(),
      /**
       * Present if the client supports task creation.
       */
      tasks: ClientTasksCapabilitySchema.optional(),
      /**
       * Extensions that the client supports. Keys are extension identifiers (vendor-prefix/extension-name).
       */
      extensions: record(string2(), AssertObjectSchema).optional()
    });
    InitializeRequestParamsSchema = BaseRequestParamsSchema.extend({
      /**
       * The latest version of the Model Context Protocol that the client supports. The client MAY decide to support older versions as well.
       */
      protocolVersion: string2(),
      capabilities: ClientCapabilitiesSchema,
      clientInfo: ImplementationSchema
    });
    InitializeRequestSchema = RequestSchema.extend({
      method: literal("initialize"),
      params: InitializeRequestParamsSchema
    });
    ServerCapabilitiesSchema = object({
      /**
       * Experimental, non-standard capabilities that the server supports.
       */
      experimental: record(string2(), AssertObjectSchema).optional(),
      /**
       * Present if the server supports sending log messages to the client.
       */
      logging: AssertObjectSchema.optional(),
      /**
       * Present if the server supports sending completions to the client.
       */
      completions: AssertObjectSchema.optional(),
      /**
       * Present if the server offers any prompt templates.
       */
      prompts: object({
        /**
         * Whether this server supports issuing notifications for changes to the prompt list.
         */
        listChanged: boolean2().optional()
      }).optional(),
      /**
       * Present if the server offers any resources to read.
       */
      resources: object({
        /**
         * Whether this server supports clients subscribing to resource updates.
         */
        subscribe: boolean2().optional(),
        /**
         * Whether this server supports issuing notifications for changes to the resource list.
         */
        listChanged: boolean2().optional()
      }).optional(),
      /**
       * Present if the server offers any tools to call.
       */
      tools: object({
        /**
         * Whether this server supports issuing notifications for changes to the tool list.
         */
        listChanged: boolean2().optional()
      }).optional(),
      /**
       * Present if the server supports task creation.
       */
      tasks: ServerTasksCapabilitySchema.optional(),
      /**
       * Extensions that the server supports. Keys are extension identifiers (vendor-prefix/extension-name).
       */
      extensions: record(string2(), AssertObjectSchema).optional()
    });
    InitializeResultSchema = ResultSchema.extend({
      /**
       * The version of the Model Context Protocol that the server wants to use. This may not match the version that the client requested. If the client cannot support this version, it MUST disconnect.
       */
      protocolVersion: string2(),
      capabilities: ServerCapabilitiesSchema,
      serverInfo: ImplementationSchema,
      /**
       * Instructions describing how to use the server and its features.
       *
       * This can be used by clients to improve the LLM's understanding of available tools, resources, etc. It can be thought of like a "hint" to the model. For example, this information MAY be added to the system prompt.
       */
      instructions: string2().optional()
    });
    InitializedNotificationSchema = NotificationSchema.extend({
      method: literal("notifications/initialized"),
      params: NotificationsParamsSchema.optional()
    });
    PingRequestSchema = RequestSchema.extend({
      method: literal("ping"),
      params: BaseRequestParamsSchema.optional()
    });
    ProgressSchema = object({
      /**
       * The progress thus far. This should increase every time progress is made, even if the total is unknown.
       */
      progress: number2(),
      /**
       * Total number of items to process (or total progress required), if known.
       */
      total: optional(number2()),
      /**
       * An optional message describing the current progress.
       */
      message: optional(string2())
    });
    ProgressNotificationParamsSchema = object({
      ...NotificationsParamsSchema.shape,
      ...ProgressSchema.shape,
      /**
       * The progress token which was given in the initial request, used to associate this notification with the request that is proceeding.
       */
      progressToken: ProgressTokenSchema
    });
    ProgressNotificationSchema = NotificationSchema.extend({
      method: literal("notifications/progress"),
      params: ProgressNotificationParamsSchema
    });
    PaginatedRequestParamsSchema = BaseRequestParamsSchema.extend({
      /**
       * An opaque token representing the current pagination position.
       * If provided, the server should return results starting after this cursor.
       */
      cursor: CursorSchema.optional()
    });
    PaginatedRequestSchema = RequestSchema.extend({
      params: PaginatedRequestParamsSchema.optional()
    });
    PaginatedResultSchema = ResultSchema.extend({
      /**
       * An opaque token representing the pagination position after the last returned result.
       * If present, there may be more results available.
       */
      nextCursor: CursorSchema.optional()
    });
    TaskStatusSchema = _enum(["working", "input_required", "completed", "failed", "cancelled"]);
    TaskSchema = object({
      taskId: string2(),
      status: TaskStatusSchema,
      /**
       * Time in milliseconds to keep task results available after completion.
       * If null, the task has unlimited lifetime until manually cleaned up.
       */
      ttl: union([number2(), _null3()]),
      /**
       * ISO 8601 timestamp when the task was created.
       */
      createdAt: string2(),
      /**
       * ISO 8601 timestamp when the task was last updated.
       */
      lastUpdatedAt: string2(),
      pollInterval: optional(number2()),
      /**
       * Optional diagnostic message for failed tasks or other status information.
       */
      statusMessage: optional(string2())
    });
    CreateTaskResultSchema = ResultSchema.extend({
      task: TaskSchema
    });
    TaskStatusNotificationParamsSchema = NotificationsParamsSchema.merge(TaskSchema);
    TaskStatusNotificationSchema = NotificationSchema.extend({
      method: literal("notifications/tasks/status"),
      params: TaskStatusNotificationParamsSchema
    });
    GetTaskRequestSchema = RequestSchema.extend({
      method: literal("tasks/get"),
      params: BaseRequestParamsSchema.extend({
        taskId: string2()
      })
    });
    GetTaskResultSchema = ResultSchema.merge(TaskSchema);
    GetTaskPayloadRequestSchema = RequestSchema.extend({
      method: literal("tasks/result"),
      params: BaseRequestParamsSchema.extend({
        taskId: string2()
      })
    });
    GetTaskPayloadResultSchema = ResultSchema.loose();
    ListTasksRequestSchema = PaginatedRequestSchema.extend({
      method: literal("tasks/list")
    });
    ListTasksResultSchema = PaginatedResultSchema.extend({
      tasks: array(TaskSchema)
    });
    CancelTaskRequestSchema = RequestSchema.extend({
      method: literal("tasks/cancel"),
      params: BaseRequestParamsSchema.extend({
        taskId: string2()
      })
    });
    CancelTaskResultSchema = ResultSchema.merge(TaskSchema);
    ResourceContentsSchema = object({
      /**
       * The URI of this resource.
       */
      uri: string2(),
      /**
       * The MIME type of this resource, if known.
       */
      mimeType: optional(string2()),
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: record(string2(), unknown()).optional()
    });
    TextResourceContentsSchema = ResourceContentsSchema.extend({
      /**
       * The text of the item. This must only be set if the item can actually be represented as text (not binary data).
       */
      text: string2()
    });
    Base64Schema = string2().refine((val) => {
      try {
        atob(val);
        return true;
      } catch {
        return false;
      }
    }, { message: "Invalid Base64 string" });
    BlobResourceContentsSchema = ResourceContentsSchema.extend({
      /**
       * A base64-encoded string representing the binary data of the item.
       */
      blob: Base64Schema
    });
    RoleSchema = _enum(["user", "assistant"]);
    AnnotationsSchema = object({
      /**
       * Intended audience(s) for the resource.
       */
      audience: array(RoleSchema).optional(),
      /**
       * Importance hint for the resource, from 0 (least) to 1 (most).
       */
      priority: number2().min(0).max(1).optional(),
      /**
       * ISO 8601 timestamp for the most recent modification.
       */
      lastModified: iso_exports.datetime({ offset: true }).optional()
    });
    ResourceSchema = object({
      ...BaseMetadataSchema.shape,
      ...IconsSchema.shape,
      /**
       * The URI of this resource.
       */
      uri: string2(),
      /**
       * A description of what this resource represents.
       *
       * This can be used by clients to improve the LLM's understanding of available resources. It can be thought of like a "hint" to the model.
       */
      description: optional(string2()),
      /**
       * The MIME type of this resource, if known.
       */
      mimeType: optional(string2()),
      /**
       * The size of the raw resource content, in bytes (i.e., before base64 encoding or any tokenization), if known.
       *
       * This can be used by Hosts to display file sizes and estimate context window usage.
       */
      size: optional(number2()),
      /**
       * Optional annotations for the client.
       */
      annotations: AnnotationsSchema.optional(),
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: optional(looseObject({}))
    });
    ResourceTemplateSchema = object({
      ...BaseMetadataSchema.shape,
      ...IconsSchema.shape,
      /**
       * A URI template (according to RFC 6570) that can be used to construct resource URIs.
       */
      uriTemplate: string2(),
      /**
       * A description of what this template is for.
       *
       * This can be used by clients to improve the LLM's understanding of available resources. It can be thought of like a "hint" to the model.
       */
      description: optional(string2()),
      /**
       * The MIME type for all resources that match this template. This should only be included if all resources matching this template have the same type.
       */
      mimeType: optional(string2()),
      /**
       * Optional annotations for the client.
       */
      annotations: AnnotationsSchema.optional(),
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: optional(looseObject({}))
    });
    ListResourcesRequestSchema = PaginatedRequestSchema.extend({
      method: literal("resources/list")
    });
    ListResourcesResultSchema = PaginatedResultSchema.extend({
      resources: array(ResourceSchema)
    });
    ListResourceTemplatesRequestSchema = PaginatedRequestSchema.extend({
      method: literal("resources/templates/list")
    });
    ListResourceTemplatesResultSchema = PaginatedResultSchema.extend({
      resourceTemplates: array(ResourceTemplateSchema)
    });
    ResourceRequestParamsSchema = BaseRequestParamsSchema.extend({
      /**
       * The URI of the resource to read. The URI can use any protocol; it is up to the server how to interpret it.
       *
       * @format uri
       */
      uri: string2()
    });
    ReadResourceRequestParamsSchema = ResourceRequestParamsSchema;
    ReadResourceRequestSchema = RequestSchema.extend({
      method: literal("resources/read"),
      params: ReadResourceRequestParamsSchema
    });
    ReadResourceResultSchema = ResultSchema.extend({
      contents: array(union([TextResourceContentsSchema, BlobResourceContentsSchema]))
    });
    ResourceListChangedNotificationSchema = NotificationSchema.extend({
      method: literal("notifications/resources/list_changed"),
      params: NotificationsParamsSchema.optional()
    });
    SubscribeRequestParamsSchema = ResourceRequestParamsSchema;
    SubscribeRequestSchema = RequestSchema.extend({
      method: literal("resources/subscribe"),
      params: SubscribeRequestParamsSchema
    });
    UnsubscribeRequestParamsSchema = ResourceRequestParamsSchema;
    UnsubscribeRequestSchema = RequestSchema.extend({
      method: literal("resources/unsubscribe"),
      params: UnsubscribeRequestParamsSchema
    });
    ResourceUpdatedNotificationParamsSchema = NotificationsParamsSchema.extend({
      /**
       * The URI of the resource that has been updated. This might be a sub-resource of the one that the client actually subscribed to.
       */
      uri: string2()
    });
    ResourceUpdatedNotificationSchema = NotificationSchema.extend({
      method: literal("notifications/resources/updated"),
      params: ResourceUpdatedNotificationParamsSchema
    });
    PromptArgumentSchema = object({
      /**
       * The name of the argument.
       */
      name: string2(),
      /**
       * A human-readable description of the argument.
       */
      description: optional(string2()),
      /**
       * Whether this argument must be provided.
       */
      required: optional(boolean2())
    });
    PromptSchema = object({
      ...BaseMetadataSchema.shape,
      ...IconsSchema.shape,
      /**
       * An optional description of what this prompt provides
       */
      description: optional(string2()),
      /**
       * A list of arguments to use for templating the prompt.
       */
      arguments: optional(array(PromptArgumentSchema)),
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: optional(looseObject({}))
    });
    ListPromptsRequestSchema = PaginatedRequestSchema.extend({
      method: literal("prompts/list")
    });
    ListPromptsResultSchema = PaginatedResultSchema.extend({
      prompts: array(PromptSchema)
    });
    GetPromptRequestParamsSchema = BaseRequestParamsSchema.extend({
      /**
       * The name of the prompt or prompt template.
       */
      name: string2(),
      /**
       * Arguments to use for templating the prompt.
       */
      arguments: record(string2(), string2()).optional()
    });
    GetPromptRequestSchema = RequestSchema.extend({
      method: literal("prompts/get"),
      params: GetPromptRequestParamsSchema
    });
    TextContentSchema = object({
      type: literal("text"),
      /**
       * The text content of the message.
       */
      text: string2(),
      /**
       * Optional annotations for the client.
       */
      annotations: AnnotationsSchema.optional(),
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: record(string2(), unknown()).optional()
    });
    ImageContentSchema = object({
      type: literal("image"),
      /**
       * The base64-encoded image data.
       */
      data: Base64Schema,
      /**
       * The MIME type of the image. Different providers may support different image types.
       */
      mimeType: string2(),
      /**
       * Optional annotations for the client.
       */
      annotations: AnnotationsSchema.optional(),
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: record(string2(), unknown()).optional()
    });
    AudioContentSchema = object({
      type: literal("audio"),
      /**
       * The base64-encoded audio data.
       */
      data: Base64Schema,
      /**
       * The MIME type of the audio. Different providers may support different audio types.
       */
      mimeType: string2(),
      /**
       * Optional annotations for the client.
       */
      annotations: AnnotationsSchema.optional(),
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: record(string2(), unknown()).optional()
    });
    ToolUseContentSchema = object({
      type: literal("tool_use"),
      /**
       * The name of the tool to invoke.
       * Must match a tool name from the request's tools array.
       */
      name: string2(),
      /**
       * Unique identifier for this tool call.
       * Used to correlate with ToolResultContent in subsequent messages.
       */
      id: string2(),
      /**
       * Arguments to pass to the tool.
       * Must conform to the tool's inputSchema.
       */
      input: record(string2(), unknown()),
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: record(string2(), unknown()).optional()
    });
    EmbeddedResourceSchema = object({
      type: literal("resource"),
      resource: union([TextResourceContentsSchema, BlobResourceContentsSchema]),
      /**
       * Optional annotations for the client.
       */
      annotations: AnnotationsSchema.optional(),
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: record(string2(), unknown()).optional()
    });
    ResourceLinkSchema = ResourceSchema.extend({
      type: literal("resource_link")
    });
    ContentBlockSchema = union([
      TextContentSchema,
      ImageContentSchema,
      AudioContentSchema,
      ResourceLinkSchema,
      EmbeddedResourceSchema
    ]);
    PromptMessageSchema = object({
      role: RoleSchema,
      content: ContentBlockSchema
    });
    GetPromptResultSchema = ResultSchema.extend({
      /**
       * An optional description for the prompt.
       */
      description: string2().optional(),
      messages: array(PromptMessageSchema)
    });
    PromptListChangedNotificationSchema = NotificationSchema.extend({
      method: literal("notifications/prompts/list_changed"),
      params: NotificationsParamsSchema.optional()
    });
    ToolAnnotationsSchema = object({
      /**
       * A human-readable title for the tool.
       */
      title: string2().optional(),
      /**
       * If true, the tool does not modify its environment.
       *
       * Default: false
       */
      readOnlyHint: boolean2().optional(),
      /**
       * If true, the tool may perform destructive updates to its environment.
       * If false, the tool performs only additive updates.
       *
       * (This property is meaningful only when `readOnlyHint == false`)
       *
       * Default: true
       */
      destructiveHint: boolean2().optional(),
      /**
       * If true, calling the tool repeatedly with the same arguments
       * will have no additional effect on the its environment.
       *
       * (This property is meaningful only when `readOnlyHint == false`)
       *
       * Default: false
       */
      idempotentHint: boolean2().optional(),
      /**
       * If true, this tool may interact with an "open world" of external
       * entities. If false, the tool's domain of interaction is closed.
       * For example, the world of a web search tool is open, whereas that
       * of a memory tool is not.
       *
       * Default: true
       */
      openWorldHint: boolean2().optional()
    });
    ToolExecutionSchema = object({
      /**
       * Indicates the tool's preference for task-augmented execution.
       * - "required": Clients MUST invoke the tool as a task
       * - "optional": Clients MAY invoke the tool as a task or normal request
       * - "forbidden": Clients MUST NOT attempt to invoke the tool as a task
       *
       * If not present, defaults to "forbidden".
       */
      taskSupport: _enum(["required", "optional", "forbidden"]).optional()
    });
    ToolSchema = object({
      ...BaseMetadataSchema.shape,
      ...IconsSchema.shape,
      /**
       * A human-readable description of the tool.
       */
      description: string2().optional(),
      /**
       * A JSON Schema 2020-12 object defining the expected parameters for the tool.
       * Must have type: 'object' at the root level per MCP spec.
       */
      inputSchema: object({
        type: literal("object"),
        properties: record(string2(), AssertObjectSchema).optional(),
        required: array(string2()).optional()
      }).catchall(unknown()),
      /**
       * An optional JSON Schema 2020-12 object defining the structure of the tool's output
       * returned in the structuredContent field of a CallToolResult.
       * Must have type: 'object' at the root level per MCP spec.
       */
      outputSchema: object({
        type: literal("object"),
        properties: record(string2(), AssertObjectSchema).optional(),
        required: array(string2()).optional()
      }).catchall(unknown()).optional(),
      /**
       * Optional additional tool information.
       */
      annotations: ToolAnnotationsSchema.optional(),
      /**
       * Execution-related properties for this tool.
       */
      execution: ToolExecutionSchema.optional(),
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: record(string2(), unknown()).optional()
    });
    ListToolsRequestSchema = PaginatedRequestSchema.extend({
      method: literal("tools/list")
    });
    ListToolsResultSchema = PaginatedResultSchema.extend({
      tools: array(ToolSchema)
    });
    CallToolResultSchema = ResultSchema.extend({
      /**
       * A list of content objects that represent the result of the tool call.
       *
       * If the Tool does not define an outputSchema, this field MUST be present in the result.
       * For backwards compatibility, this field is always present, but it may be empty.
       */
      content: array(ContentBlockSchema).default([]),
      /**
       * An object containing structured tool output.
       *
       * If the Tool defines an outputSchema, this field MUST be present in the result, and contain a JSON object that matches the schema.
       */
      structuredContent: record(string2(), unknown()).optional(),
      /**
       * Whether the tool call ended in an error.
       *
       * If not set, this is assumed to be false (the call was successful).
       *
       * Any errors that originate from the tool SHOULD be reported inside the result
       * object, with `isError` set to true, _not_ as an MCP protocol-level error
       * response. Otherwise, the LLM would not be able to see that an error occurred
       * and self-correct.
       *
       * However, any errors in _finding_ the tool, an error indicating that the
       * server does not support tool calls, or any other exceptional conditions,
       * should be reported as an MCP error response.
       */
      isError: boolean2().optional()
    });
    CompatibilityCallToolResultSchema = CallToolResultSchema.or(ResultSchema.extend({
      toolResult: unknown()
    }));
    CallToolRequestParamsSchema = TaskAugmentedRequestParamsSchema.extend({
      /**
       * The name of the tool to call.
       */
      name: string2(),
      /**
       * Arguments to pass to the tool.
       */
      arguments: record(string2(), unknown()).optional()
    });
    CallToolRequestSchema = RequestSchema.extend({
      method: literal("tools/call"),
      params: CallToolRequestParamsSchema
    });
    ToolListChangedNotificationSchema = NotificationSchema.extend({
      method: literal("notifications/tools/list_changed"),
      params: NotificationsParamsSchema.optional()
    });
    ListChangedOptionsBaseSchema = object({
      /**
       * If true, the list will be refreshed automatically when a list changed notification is received.
       * The callback will be called with the updated list.
       *
       * If false, the callback will be called with null items, allowing manual refresh.
       *
       * @default true
       */
      autoRefresh: boolean2().default(true),
      /**
       * Debounce time in milliseconds for list changed notification processing.
       *
       * Multiple notifications received within this timeframe will only trigger one refresh.
       * Set to 0 to disable debouncing.
       *
       * @default 300
       */
      debounceMs: number2().int().nonnegative().default(300)
    });
    LoggingLevelSchema = _enum(["debug", "info", "notice", "warning", "error", "critical", "alert", "emergency"]);
    SetLevelRequestParamsSchema = BaseRequestParamsSchema.extend({
      /**
       * The level of logging that the client wants to receive from the server. The server should send all logs at this level and higher (i.e., more severe) to the client as notifications/logging/message.
       */
      level: LoggingLevelSchema
    });
    SetLevelRequestSchema = RequestSchema.extend({
      method: literal("logging/setLevel"),
      params: SetLevelRequestParamsSchema
    });
    LoggingMessageNotificationParamsSchema = NotificationsParamsSchema.extend({
      /**
       * The severity of this log message.
       */
      level: LoggingLevelSchema,
      /**
       * An optional name of the logger issuing this message.
       */
      logger: string2().optional(),
      /**
       * The data to be logged, such as a string message or an object. Any JSON serializable type is allowed here.
       */
      data: unknown()
    });
    LoggingMessageNotificationSchema = NotificationSchema.extend({
      method: literal("notifications/message"),
      params: LoggingMessageNotificationParamsSchema
    });
    ModelHintSchema = object({
      /**
       * A hint for a model name.
       */
      name: string2().optional()
    });
    ModelPreferencesSchema = object({
      /**
       * Optional hints to use for model selection.
       */
      hints: array(ModelHintSchema).optional(),
      /**
       * How much to prioritize cost when selecting a model.
       */
      costPriority: number2().min(0).max(1).optional(),
      /**
       * How much to prioritize sampling speed (latency) when selecting a model.
       */
      speedPriority: number2().min(0).max(1).optional(),
      /**
       * How much to prioritize intelligence and capabilities when selecting a model.
       */
      intelligencePriority: number2().min(0).max(1).optional()
    });
    ToolChoiceSchema = object({
      /**
       * Controls when tools are used:
       * - "auto": Model decides whether to use tools (default)
       * - "required": Model MUST use at least one tool before completing
       * - "none": Model MUST NOT use any tools
       */
      mode: _enum(["auto", "required", "none"]).optional()
    });
    ToolResultContentSchema = object({
      type: literal("tool_result"),
      toolUseId: string2().describe("The unique identifier for the corresponding tool call."),
      content: array(ContentBlockSchema).default([]),
      structuredContent: object({}).loose().optional(),
      isError: boolean2().optional(),
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: record(string2(), unknown()).optional()
    });
    SamplingContentSchema = discriminatedUnion("type", [TextContentSchema, ImageContentSchema, AudioContentSchema]);
    SamplingMessageContentBlockSchema = discriminatedUnion("type", [
      TextContentSchema,
      ImageContentSchema,
      AudioContentSchema,
      ToolUseContentSchema,
      ToolResultContentSchema
    ]);
    SamplingMessageSchema = object({
      role: RoleSchema,
      content: union([SamplingMessageContentBlockSchema, array(SamplingMessageContentBlockSchema)]),
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: record(string2(), unknown()).optional()
    });
    CreateMessageRequestParamsSchema = TaskAugmentedRequestParamsSchema.extend({
      messages: array(SamplingMessageSchema),
      /**
       * The server's preferences for which model to select. The client MAY modify or omit this request.
       */
      modelPreferences: ModelPreferencesSchema.optional(),
      /**
       * An optional system prompt the server wants to use for sampling. The client MAY modify or omit this prompt.
       */
      systemPrompt: string2().optional(),
      /**
       * A request to include context from one or more MCP servers (including the caller), to be attached to the prompt.
       * The client MAY ignore this request.
       *
       * Default is "none". Values "thisServer" and "allServers" are soft-deprecated. Servers SHOULD only use these values if the client
       * declares ClientCapabilities.sampling.context. These values may be removed in future spec releases.
       */
      includeContext: _enum(["none", "thisServer", "allServers"]).optional(),
      temperature: number2().optional(),
      /**
       * The requested maximum number of tokens to sample (to prevent runaway completions).
       *
       * The client MAY choose to sample fewer tokens than the requested maximum.
       */
      maxTokens: number2().int(),
      stopSequences: array(string2()).optional(),
      /**
       * Optional metadata to pass through to the LLM provider. The format of this metadata is provider-specific.
       */
      metadata: AssertObjectSchema.optional(),
      /**
       * Tools that the model may use during generation.
       * The client MUST return an error if this field is provided but ClientCapabilities.sampling.tools is not declared.
       */
      tools: array(ToolSchema).optional(),
      /**
       * Controls how the model uses tools.
       * The client MUST return an error if this field is provided but ClientCapabilities.sampling.tools is not declared.
       * Default is `{ mode: "auto" }`.
       */
      toolChoice: ToolChoiceSchema.optional()
    });
    CreateMessageRequestSchema = RequestSchema.extend({
      method: literal("sampling/createMessage"),
      params: CreateMessageRequestParamsSchema
    });
    CreateMessageResultSchema = ResultSchema.extend({
      /**
       * The name of the model that generated the message.
       */
      model: string2(),
      /**
       * The reason why sampling stopped, if known.
       *
       * Standard values:
       * - "endTurn": Natural end of the assistant's turn
       * - "stopSequence": A stop sequence was encountered
       * - "maxTokens": Maximum token limit was reached
       *
       * This field is an open string to allow for provider-specific stop reasons.
       */
      stopReason: optional(_enum(["endTurn", "stopSequence", "maxTokens"]).or(string2())),
      role: RoleSchema,
      /**
       * Response content. Single content block (text, image, or audio).
       */
      content: SamplingContentSchema
    });
    CreateMessageResultWithToolsSchema = ResultSchema.extend({
      /**
       * The name of the model that generated the message.
       */
      model: string2(),
      /**
       * The reason why sampling stopped, if known.
       *
       * Standard values:
       * - "endTurn": Natural end of the assistant's turn
       * - "stopSequence": A stop sequence was encountered
       * - "maxTokens": Maximum token limit was reached
       * - "toolUse": The model wants to use one or more tools
       *
       * This field is an open string to allow for provider-specific stop reasons.
       */
      stopReason: optional(_enum(["endTurn", "stopSequence", "maxTokens", "toolUse"]).or(string2())),
      role: RoleSchema,
      /**
       * Response content. May be a single block or array. May include ToolUseContent if stopReason is "toolUse".
       */
      content: union([SamplingMessageContentBlockSchema, array(SamplingMessageContentBlockSchema)])
    });
    BooleanSchemaSchema = object({
      type: literal("boolean"),
      title: string2().optional(),
      description: string2().optional(),
      default: boolean2().optional()
    });
    StringSchemaSchema = object({
      type: literal("string"),
      title: string2().optional(),
      description: string2().optional(),
      minLength: number2().optional(),
      maxLength: number2().optional(),
      format: _enum(["email", "uri", "date", "date-time"]).optional(),
      default: string2().optional()
    });
    NumberSchemaSchema = object({
      type: _enum(["number", "integer"]),
      title: string2().optional(),
      description: string2().optional(),
      minimum: number2().optional(),
      maximum: number2().optional(),
      default: number2().optional()
    });
    UntitledSingleSelectEnumSchemaSchema = object({
      type: literal("string"),
      title: string2().optional(),
      description: string2().optional(),
      enum: array(string2()),
      default: string2().optional()
    });
    TitledSingleSelectEnumSchemaSchema = object({
      type: literal("string"),
      title: string2().optional(),
      description: string2().optional(),
      oneOf: array(object({
        const: string2(),
        title: string2()
      })),
      default: string2().optional()
    });
    LegacyTitledEnumSchemaSchema = object({
      type: literal("string"),
      title: string2().optional(),
      description: string2().optional(),
      enum: array(string2()),
      enumNames: array(string2()).optional(),
      default: string2().optional()
    });
    SingleSelectEnumSchemaSchema = union([UntitledSingleSelectEnumSchemaSchema, TitledSingleSelectEnumSchemaSchema]);
    UntitledMultiSelectEnumSchemaSchema = object({
      type: literal("array"),
      title: string2().optional(),
      description: string2().optional(),
      minItems: number2().optional(),
      maxItems: number2().optional(),
      items: object({
        type: literal("string"),
        enum: array(string2())
      }),
      default: array(string2()).optional()
    });
    TitledMultiSelectEnumSchemaSchema = object({
      type: literal("array"),
      title: string2().optional(),
      description: string2().optional(),
      minItems: number2().optional(),
      maxItems: number2().optional(),
      items: object({
        anyOf: array(object({
          const: string2(),
          title: string2()
        }))
      }),
      default: array(string2()).optional()
    });
    MultiSelectEnumSchemaSchema = union([UntitledMultiSelectEnumSchemaSchema, TitledMultiSelectEnumSchemaSchema]);
    EnumSchemaSchema = union([LegacyTitledEnumSchemaSchema, SingleSelectEnumSchemaSchema, MultiSelectEnumSchemaSchema]);
    PrimitiveSchemaDefinitionSchema = union([EnumSchemaSchema, BooleanSchemaSchema, StringSchemaSchema, NumberSchemaSchema]);
    ElicitRequestFormParamsSchema = TaskAugmentedRequestParamsSchema.extend({
      /**
       * The elicitation mode.
       *
       * Optional for backward compatibility. Clients MUST treat missing mode as "form".
       */
      mode: literal("form").optional(),
      /**
       * The message to present to the user describing what information is being requested.
       */
      message: string2(),
      /**
       * A restricted subset of JSON Schema.
       * Only top-level properties are allowed, without nesting.
       */
      requestedSchema: object({
        type: literal("object"),
        properties: record(string2(), PrimitiveSchemaDefinitionSchema),
        required: array(string2()).optional()
      })
    });
    ElicitRequestURLParamsSchema = TaskAugmentedRequestParamsSchema.extend({
      /**
       * The elicitation mode.
       */
      mode: literal("url"),
      /**
       * The message to present to the user explaining why the interaction is needed.
       */
      message: string2(),
      /**
       * The ID of the elicitation, which must be unique within the context of the server.
       * The client MUST treat this ID as an opaque value.
       */
      elicitationId: string2(),
      /**
       * The URL that the user should navigate to.
       */
      url: string2().url()
    });
    ElicitRequestParamsSchema = union([ElicitRequestFormParamsSchema, ElicitRequestURLParamsSchema]);
    ElicitRequestSchema = RequestSchema.extend({
      method: literal("elicitation/create"),
      params: ElicitRequestParamsSchema
    });
    ElicitationCompleteNotificationParamsSchema = NotificationsParamsSchema.extend({
      /**
       * The ID of the elicitation that completed.
       */
      elicitationId: string2()
    });
    ElicitationCompleteNotificationSchema = NotificationSchema.extend({
      method: literal("notifications/elicitation/complete"),
      params: ElicitationCompleteNotificationParamsSchema
    });
    ElicitResultSchema = ResultSchema.extend({
      /**
       * The user action in response to the elicitation.
       * - "accept": User submitted the form/confirmed the action
       * - "decline": User explicitly decline the action
       * - "cancel": User dismissed without making an explicit choice
       */
      action: _enum(["accept", "decline", "cancel"]),
      /**
       * The submitted form data, only present when action is "accept".
       * Contains values matching the requested schema.
       * Per MCP spec, content is "typically omitted" for decline/cancel actions.
       * We normalize null to undefined for leniency while maintaining type compatibility.
       */
      content: preprocess((val) => val === null ? void 0 : val, record(string2(), union([string2(), number2(), boolean2(), array(string2())])).optional())
    });
    ResourceTemplateReferenceSchema = object({
      type: literal("ref/resource"),
      /**
       * The URI or URI template of the resource.
       */
      uri: string2()
    });
    PromptReferenceSchema = object({
      type: literal("ref/prompt"),
      /**
       * The name of the prompt or prompt template
       */
      name: string2()
    });
    CompleteRequestParamsSchema = BaseRequestParamsSchema.extend({
      ref: union([PromptReferenceSchema, ResourceTemplateReferenceSchema]),
      /**
       * The argument's information
       */
      argument: object({
        /**
         * The name of the argument
         */
        name: string2(),
        /**
         * The value of the argument to use for completion matching.
         */
        value: string2()
      }),
      context: object({
        /**
         * Previously-resolved variables in a URI template or prompt.
         */
        arguments: record(string2(), string2()).optional()
      }).optional()
    });
    CompleteRequestSchema = RequestSchema.extend({
      method: literal("completion/complete"),
      params: CompleteRequestParamsSchema
    });
    CompleteResultSchema = ResultSchema.extend({
      completion: looseObject({
        /**
         * An array of completion values. Must not exceed 100 items.
         */
        values: array(string2()).max(100),
        /**
         * The total number of completion options available. This can exceed the number of values actually sent in the response.
         */
        total: optional(number2().int()),
        /**
         * Indicates whether there are additional completion options beyond those provided in the current response, even if the exact total is unknown.
         */
        hasMore: optional(boolean2())
      })
    });
    RootSchema = object({
      /**
       * The URI identifying the root. This *must* start with file:// for now.
       */
      uri: string2().startsWith("file://"),
      /**
       * An optional name for the root.
       */
      name: string2().optional(),
      /**
       * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
       * for notes on _meta usage.
       */
      _meta: record(string2(), unknown()).optional()
    });
    ListRootsRequestSchema = RequestSchema.extend({
      method: literal("roots/list"),
      params: BaseRequestParamsSchema.optional()
    });
    ListRootsResultSchema = ResultSchema.extend({
      roots: array(RootSchema)
    });
    RootsListChangedNotificationSchema = NotificationSchema.extend({
      method: literal("notifications/roots/list_changed"),
      params: NotificationsParamsSchema.optional()
    });
    ClientRequestSchema = union([
      PingRequestSchema,
      InitializeRequestSchema,
      CompleteRequestSchema,
      SetLevelRequestSchema,
      GetPromptRequestSchema,
      ListPromptsRequestSchema,
      ListResourcesRequestSchema,
      ListResourceTemplatesRequestSchema,
      ReadResourceRequestSchema,
      SubscribeRequestSchema,
      UnsubscribeRequestSchema,
      CallToolRequestSchema,
      ListToolsRequestSchema,
      GetTaskRequestSchema,
      GetTaskPayloadRequestSchema,
      ListTasksRequestSchema,
      CancelTaskRequestSchema
    ]);
    ClientNotificationSchema = union([
      CancelledNotificationSchema,
      ProgressNotificationSchema,
      InitializedNotificationSchema,
      RootsListChangedNotificationSchema,
      TaskStatusNotificationSchema
    ]);
    ClientResultSchema = union([
      EmptyResultSchema,
      CreateMessageResultSchema,
      CreateMessageResultWithToolsSchema,
      ElicitResultSchema,
      ListRootsResultSchema,
      GetTaskResultSchema,
      ListTasksResultSchema,
      CreateTaskResultSchema
    ]);
    ServerRequestSchema = union([
      PingRequestSchema,
      CreateMessageRequestSchema,
      ElicitRequestSchema,
      ListRootsRequestSchema,
      GetTaskRequestSchema,
      GetTaskPayloadRequestSchema,
      ListTasksRequestSchema,
      CancelTaskRequestSchema
    ]);
    ServerNotificationSchema = union([
      CancelledNotificationSchema,
      ProgressNotificationSchema,
      LoggingMessageNotificationSchema,
      ResourceUpdatedNotificationSchema,
      ResourceListChangedNotificationSchema,
      ToolListChangedNotificationSchema,
      PromptListChangedNotificationSchema,
      TaskStatusNotificationSchema,
      ElicitationCompleteNotificationSchema
    ]);
    ServerResultSchema = union([
      EmptyResultSchema,
      InitializeResultSchema,
      CompleteResultSchema,
      GetPromptResultSchema,
      ListPromptsResultSchema,
      ListResourcesResultSchema,
      ListResourceTemplatesResultSchema,
      ReadResourceResultSchema,
      CallToolResultSchema,
      ListToolsResultSchema,
      GetTaskResultSchema,
      ListTasksResultSchema,
      CreateTaskResultSchema
    ]);
    McpError = class _McpError extends Error {
      constructor(code2, message, data) {
        super(`MCP error ${code2}: ${message}`);
        this.code = code2;
        this.data = data;
        this.name = "McpError";
      }
      /**
       * Factory method to create the appropriate error type based on the error code and data
       */
      static fromError(code2, message, data) {
        if (code2 === ErrorCode.UrlElicitationRequired && data) {
          const errorData = data;
          if (errorData.elicitations) {
            return new UrlElicitationRequiredError(errorData.elicitations, message);
          }
        }
        return new _McpError(code2, message, data);
      }
    };
    UrlElicitationRequiredError = class extends McpError {
      constructor(elicitations, message = `URL elicitation${elicitations.length > 1 ? "s" : ""} required`) {
        super(ErrorCode.UrlElicitationRequired, message, {
          elicitations
        });
      }
      get elicitations() {
        return this.data?.elicitations ?? [];
      }
    };
  }
});

// dist/version.js
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
var here, PKG;
var init_version = __esm({
  "dist/version.js"() {
    "use strict";
    here = dirname(fileURLToPath(import.meta.url));
    PKG = true ? JSON.parse('{"name":"wolfram-mcp-server","version":"0.1.3","description":"MCP server that drives a locally installed Wolfram kernel, with lazy start and idle shutdown."}') : JSON.parse(readFileSync(join(here, "..", "package.json"), "utf8"));
  }
});

// dist/cache.js
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync, unlinkSync } from "node:fs";
import { dirname as dirname2, join as join2 } from "node:path";
import os from "node:os";
function cacheDir() {
  if (process.platform === "win32") {
    const base2 = process.env["LOCALAPPDATA"] ?? join2(os.homedir(), "AppData", "Local");
    return join2(base2, "wolfram-mcp-server");
  }
  const base = process.env["XDG_CACHE_HOME"] ?? join2(os.homedir(), ".cache");
  return join2(base, "wolfram-mcp-server");
}
function cacheKey(kernelPath, kernelVersion, serverName, flavour) {
  return { kernelPath, kernelVersion, serverName, serverVersion: PKG.version, flavour };
}
function capabilityDir() {
  return join2(cacheDir(), "capabilities");
}
function capabilityFile(key) {
  const digest = createHash("sha256").update([
    key.kernelPath,
    key.kernelVersion ?? "",
    key.serverName,
    key.serverVersion,
    key.flavour
  ].join("\0")).digest("hex").slice(0, 16);
  return join2(capabilityDir(), `${digest}.json`);
}
function readCache(key) {
  try {
    const entry = JSON.parse(readFileSync(capabilityFile(key), "utf8"));
    if (entry.format !== CACHE_FORMAT)
      return null;
    if (Date.now() - (entry.cachedAt ?? 0) > CACHE_TTL_MS)
      return null;
    if (!Array.isArray(entry.tools))
      return null;
    if (!cacheMatches(entry, key))
      return null;
    return entry;
  } catch {
    return null;
  }
}
function writeCache(entry) {
  const file = capabilityFile(entry);
  const temp = `${file}.${process.pid}.tmp`;
  try {
    mkdirSync(dirname2(file), { recursive: true });
    const payload = { ...entry, format: CACHE_FORMAT, cachedAt: Date.now() };
    writeFileSync(temp, `${JSON.stringify(payload, null, 2)}
`);
    renameSync(temp, file);
  } catch {
    try {
      unlinkSync(temp);
    } catch {
    }
  }
}
function clearCache() {
  const dir = capabilityDir();
  rmSync(dir, { recursive: true, force: true });
  try {
    unlinkSync(join2(cacheDir(), "capabilities.json"));
  } catch {
  }
  return dir;
}
function cacheMatches(entry, key) {
  return entry !== null && entry.kernelPath === key.kernelPath && entry.kernelVersion === key.kernelVersion && entry.serverName === key.serverName && entry.serverVersion === key.serverVersion && entry.flavour === key.flavour;
}
var CACHE_FORMAT, CACHE_TTL_MS;
var init_cache = __esm({
  "dist/cache.js"() {
    "use strict";
    init_version();
    CACHE_FORMAT = 2;
    CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1e3;
  }
});

// dist/flavour.js
import { createHash as createHash2 } from "node:crypto";
function settingValue(raw) {
  const value = raw?.trim();
  return value && !/^\$\{.*\}$/.test(value) ? value : void 0;
}
function kernelFlavour(source = process.env) {
  const declared = (source[FLAVOUR_VARS_ENV] ?? "").split(",").map((name) => name.trim()).filter(Boolean);
  const names = [.../* @__PURE__ */ new Set([...FLAVOUR_VARS, ...declared])].sort();
  const env = {};
  for (const name of names) {
    const value = settingValue(source[name]);
    if (value !== void 0)
      env[name] = value;
  }
  const digest = createHash2("sha256").update(Object.keys(env).sort().map((name) => `${name}=${env[name]}`).join("\0")).digest("hex").slice(0, 16);
  return { names, env, digest };
}
function applyFlavour(base, flavour) {
  const env = { ...base };
  for (const name of flavour.names)
    delete env[name];
  return { ...env, ...flavour.env };
}
var FLAVOUR_VARS, FLAVOUR_VARS_ENV;
var init_flavour = __esm({
  "dist/flavour.js"() {
    "use strict";
    FLAVOUR_VARS = [
      "MCP_SERVER_NAME",
      "MCP_TOOL_OPTIONS",
      "MCP_APPS_ENABLED",
      "MCP_APPS_NOTEBOOK_METHOD",
      "LLMKIT_ENABLED",
      "WOLFRAM_CLOUDBASE",
      "WOLFRAM_BASE",
      "WOLFRAM_USERBASE",
      "WOLFRAM_LOCALBASE",
      "WOLFRAMINIT"
    ];
    FLAVOUR_VARS_ENV = "WOLFRAM_MCP_KERNEL_ENV";
  }
});

// dist/broker-protocol.js
var broker_protocol_exports = {};
__export(broker_protocol_exports, {
  BROKER_PROTOCOL: () => BROKER_PROTOCOL,
  FrameReader: () => FrameReader,
  SOCKET_MODE: () => SOCKET_MODE,
  brokerAddress: () => brokerAddress,
  brokerDirectory: () => brokerDirectory,
  encodeFrame: () => encodeFrame,
  isEvent: () => isEvent,
  socketFault: () => socketFault
});
import { createHash as createHash3 } from "node:crypto";
import { mkdirSync as mkdirSync2, readdirSync, readFileSync as readFileSync2, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname as dirname3, join as join3 } from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";
function isEvent(frame) {
  return typeof frame.event === "string";
}
function codeIdentity() {
  if (buildIdentity !== void 0)
    return buildIdentity;
  const hash = createHash3("sha256");
  try {
    const here2 = fileURLToPath2(import.meta.url);
    const files = true ? [here2] : readdirSync(dirname3(here2)).filter((name) => name.endsWith(".js")).sort().map((name) => join3(dirname3(here2), name));
    for (const file of files)
      hash.update(readFileSync2(file));
  } catch {
  }
  buildIdentity = hash.digest("hex").slice(0, 16);
  return buildIdentity;
}
function entitlementOptions() {
  const value = settingValue(process.env["WOLFRAMINIT"]);
  return value === void 0 ? [] : [value];
}
function brokerAddress(kernelPath) {
  const uid = typeof process.getuid === "function" ? process.getuid() : 0;
  const digest = createHash3("sha256").update([
    String(BROKER_PROTOCOL),
    PKG.version,
    kernelPath,
    String(uid),
    codeIdentity(),
    // An entitlement's broker is its own, since a pool learns its licence
    // from its kernels and an entitlement brings its own kernel limit: two
    // behind one broker throttled each other or overran the smaller. Only
    // when set, so every other session keeps the socket it had.
    ...entitlementOptions()
  ].join("\0")).digest("hex").slice(0, 12);
  if (process.platform === "win32") {
    return String.raw`\\.\pipe\wolfram-mcp-${digest}`;
  }
  const base = brokerDirectory();
  const descriptive = join3(base, `wolfram-mcp-${uid}-${digest}.sock`);
  if (Buffer.byteLength(descriptive) <= MAX_SOCKET_PATH)
    return descriptive;
  return join3(base, `wm-${digest}.sock`);
}
function ensurePrivateDirectory(dir) {
  try {
    mkdirSync2(dir, { recursive: true, mode: 448 });
  } catch {
  }
}
function brokerDirectory() {
  const chosen = process.env["WOLFRAM_MCP_RUNTIME_DIR"]?.trim();
  if (chosen) {
    ensurePrivateDirectory(chosen);
    return chosen;
  }
  const runtime = process.env["XDG_RUNTIME_DIR"];
  if (runtime)
    return runtime;
  const temporary = tmpdir();
  if (directoryFault(temporary) === null)
    return temporary;
  const own = join3(cacheDir(), "run");
  ensurePrivateDirectory(own);
  return own;
}
function socketFault(address) {
  if (process.platform === "win32")
    return null;
  return directoryFault(dirname3(address));
}
function directoryFault(dir) {
  if (process.platform === "win32")
    return null;
  let info;
  try {
    info = statSync(dir);
  } catch (err) {
    return `${dir} cannot be read (${err.code ?? "unknown error"})`;
  }
  if (!info.isDirectory())
    return `${dir} is not a directory`;
  const uid = typeof process.getuid === "function" ? process.getuid() : null;
  if (uid !== null && info.uid !== uid) {
    return `${dir} belongs to uid ${info.uid}, not ${uid}`;
  }
  if (info.mode & 18) {
    const group = (info.mode & 16) !== 0;
    const others = (info.mode & 2) !== 0;
    const who = group && others ? "group and others" : group ? "its group" : "others";
    return `${dir} is writable by ${who} (mode ${(info.mode & 511).toString(8)})`;
  }
  return null;
}
function encodeFrame(frame) {
  return `${JSON.stringify(frame)}
`;
}
var BROKER_PROTOCOL, MAX_SOCKET_PATH, buildIdentity, SOCKET_MODE, MAX_UNTERMINATED_BYTES, FrameReader;
var init_broker_protocol = __esm({
  "dist/broker-protocol.js"() {
    "use strict";
    init_cache();
    init_flavour();
    init_version();
    BROKER_PROTOCOL = 5;
    MAX_SOCKET_PATH = 100;
    SOCKET_MODE = 384;
    MAX_UNTERMINATED_BYTES = 4 * 1024 * 1024;
    FrameReader = class {
      onFrame;
      #buffer = "";
      constructor(onFrame) {
        this.onFrame = onFrame;
      }
      push(chunk) {
        this.#buffer += chunk;
        if (this.#buffer.length > MAX_UNTERMINATED_BYTES) {
          this.#buffer = "";
          return;
        }
        let index;
        while ((index = this.#buffer.indexOf("\n")) !== -1) {
          const line = this.#buffer.slice(0, index).trim();
          this.#buffer = this.#buffer.slice(index + 1);
          if (!line)
            continue;
          try {
            this.onFrame(JSON.parse(line));
          } catch {
          }
        }
      }
    };
  }
});

// dist/config.js
function readEnv(...names) {
  return readEnvEntry(...names)?.[1];
}
function readEnvEntry(...names) {
  for (const name of names) {
    const raw = process.env[name];
    if (raw === void 0)
      continue;
    const value = raw.trim();
    if (!value)
      continue;
    if (/^\$\{.*\}$/.test(value))
      continue;
    return [name, value];
  }
  return void 0;
}
function readNumber(fallback, ...names) {
  const raw = readEnv(...names);
  if (raw === void 0)
    return fallback;
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}
function readTime(fallback, unit, log, ...names) {
  const entry = readEnvEntry(...names);
  if (entry === void 0)
    return fallback * unit.ms;
  const [name, raw] = entry;
  const parsed = /^inf(inity)?$/i.test(raw) ? Infinity : Number.parseFloat(raw);
  if (Number.isNaN(parsed) || parsed < 0)
    return fallback * unit.ms;
  const ms = parsed * unit.ms;
  if (ms <= MAX_TIME_MS)
    return ms;
  log(`${name}=${raw} is longer than the ${MAX_TIME_MS / 864e5} days a time setting is held to; using ${MAX_TIME_MS / unit.ms} ${unit.name}`);
  return MAX_TIME_MS;
}
function readBoolean(fallback, ...names) {
  const raw = readEnv(...names)?.toLowerCase();
  if (raw === void 0)
    return fallback;
  if (["0", "false", "no", "off"].includes(raw))
    return false;
  if (["1", "true", "yes", "on"].includes(raw))
    return true;
  return fallback;
}
function resolveServerName(requested, log) {
  if (requested === void 0)
    return DEFAULT_SERVER_NAME;
  const names = Object.keys(MCP_SERVERS);
  const exact = names.find((name) => name === requested);
  if (exact)
    return exact;
  const insensitive = names.find((name) => name.toLowerCase() === requested.toLowerCase());
  if (insensitive) {
    log(`serverName "${requested}" matched "${insensitive}"`);
    return insensitive;
  }
  log(`serverName "${requested}" is not built in (${names.join(", ")}); passing it to the kernel as given`);
  return requested;
}
function loadConfig(log) {
  const serverName = resolveServerName(readEnv("MCP_SERVER_NAME", "WOLFRAM_MCP_SERVER_NAME", "WOLFRAM_MCP_DEFAULT_SERVER"), log);
  return {
    kernelPath: readEnv("WOLFRAM_MCP_KERNEL", "WOLFRAM_KERNEL_PATH"),
    serverName,
    version: readEnv("WOLFRAM_MCP_VERSION"),
    minVersion: readEnv("WOLFRAM_MCP_MIN_VERSION", "WOLFRAM_MIN_VERSION") ?? DEFAULT_MIN_VERSION,
    idleMs: readTime(10, MINUTES, log, "WOLFRAM_MCP_IDLE_MINUTES", "WOLFRAM_IDLE_MINUTES"),
    startTimeoutMs: readTime(DEFAULT_START_TIMEOUT_MS / 1e3, SECONDS, log, "WOLFRAM_MCP_START_TIMEOUT_SECONDS", "WOLFRAM_START_TIMEOUT_SECONDS"),
    callTimeoutMs: readTime(300, SECONDS, log, "WOLFRAM_MCP_CALL_TIMEOUT_SECONDS", "WOLFRAM_CALL_TIMEOUT_SECONDS"),
    cacheEnabled: readBoolean(true, "WOLFRAM_MCP_CACHE"),
    share: readBoolean(true, "WOLFRAM_MCP_SHARE"),
    maxKernels: (() => {
      const raw = readEnv("WOLFRAM_MCP_MAX_KERNELS");
      if (raw === void 0)
        return void 0;
      const parsed = Number.parseInt(raw, 10);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : void 0;
    })(),
    reserveSeats: Math.max(0, Math.round(readNumber(1, "WOLFRAM_MCP_RESERVE_SEATS"))),
    licenseLimit: (() => {
      const raw = readEnv("WOLFRAM_MCP_LICENSE_LIMIT");
      if (raw === void 0)
        return void 0;
      if (/^(unlimited|infinity|inf)$/i.test(raw))
        return "unlimited";
      const parsed = Number.parseInt(raw, 10);
      if (Number.isFinite(parsed) && parsed > 0)
        return parsed;
      log(`ignoring WOLFRAM_MCP_LICENSE_LIMIT="${raw}": expected a positive integer or "unlimited"`);
      return void 0;
    })(),
    inspect: readBoolean(true, "WOLFRAM_MCP_INSPECT"),
    // Over the resolved name, because that is the one a kernel is started with.
    flavour: kernelFlavour({ ...process.env, MCP_SERVER_NAME: serverName })
  };
}
var MCP_SERVERS, DEFAULT_SERVER_NAME, DEFAULT_MIN_VERSION, DEFAULT_START_TIMEOUT_MS, MAX_TIME_MS, SECONDS, MINUTES;
var init_config = __esm({
  "dist/config.js"() {
    "use strict";
    init_flavour();
    MCP_SERVERS = {
      Wolfram: { prompts: true, resources: false },
      WolframLanguage: { prompts: true, resources: false },
      WolframAlpha: { prompts: true, resources: false },
      WolframPacletDevelopment: { prompts: true, resources: false }
    };
    DEFAULT_SERVER_NAME = "Wolfram";
    DEFAULT_MIN_VERSION = "14.3";
    DEFAULT_START_TIMEOUT_MS = 12e4;
    MAX_TIME_MS = 24 * 864e5;
    SECONDS = { ms: 1e3, name: "seconds" };
    MINUTES = { ms: 6e4, name: "minutes" };
  }
});

// dist/log.js
function createLogger(prefix, options = {}) {
  const stamp = options.timestamps ?? false;
  return (message) => {
    try {
      const at = stamp ? `${(/* @__PURE__ */ new Date()).toISOString()} ` : "";
      process.stderr.write(`${at}[${prefix}] ${message}
`);
    } catch {
    }
  };
}
function budgetText(ms) {
  if (ms < 1e3)
    return `${Math.floor(ms)}ms`;
  if (ms < 1e4)
    return `${Math.floor(ms / 100) / 10}s`;
  return `${Math.floor(ms / 1e3)}s`;
}
function errorText(err) {
  if (err instanceof Error)
    return err.message;
  if (typeof err === "string")
    return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}
function bareMcpText(code2, message) {
  const prefix = `MCP error ${code2}: `;
  return message.startsWith(prefix) ? message.slice(prefix.length) : message;
}
var init_log = __esm({
  "dist/log.js"() {
    "use strict";
  }
});

// dist/broker-client.js
var broker_client_exports = {};
__export(broker_client_exports, {
  BrokerBackend: () => BrokerBackend,
  brokerCeilingMs: () => brokerCeilingMs
});
import { spawn } from "node:child_process";
import { closeSync, openSync } from "node:fs";
import { connect } from "node:net";
function brokerCeilingMs(op, timeoutMs, startTimeoutMs) {
  if (timeoutMs === 0)
    return 0;
  if (timeoutMs !== void 0)
    return timeoutMs + REQUEST_GRACE_MS;
  const start = FROM_KERNEL[op] ? startTimeoutMs : 0;
  return start + DEFAULT_OP_TIMEOUT_MS + REQUEST_GRACE_MS;
}
function brokerError(response) {
  const message = response.error ?? "the Wolfram broker reported an error";
  if (response.code === void 0)
    return new Error(message);
  return new McpError(response.code, bareMcpText(response.code, message));
}
function tryConnect(address) {
  return new Promise((resolve) => {
    const socket = connect(address);
    const fail = () => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(null);
    };
    socket.once("connect", () => {
      socket.removeAllListeners("error");
      resolve(socket);
    });
    socket.once("error", fail);
  });
}
var CONNECT_DEADLINE_MS, CONNECT_RETRY_MS, REQUEST_GRACE_MS, DEFAULT_OP_TIMEOUT_MS, FROM_KERNEL, PING_DEADLINE_MS, delay, BrokerBackend;
var init_broker_client = __esm({
  "dist/broker-client.js"() {
    "use strict";
    init_types();
    init_broker_protocol();
    init_config();
    init_log();
    CONNECT_DEADLINE_MS = 5e3;
    CONNECT_RETRY_MS = 100;
    REQUEST_GRACE_MS = 2e3;
    DEFAULT_OP_TIMEOUT_MS = 6e4;
    FROM_KERNEL = {
      capabilities: true,
      listTools: true,
      listPrompts: true,
      getPrompt: true,
      listResources: true,
      readResource: true,
      callTool: true,
      cancel: false,
      status: false,
      hello: false,
      ping: false,
      ready: false
    };
    PING_DEADLINE_MS = REQUEST_GRACE_MS;
    delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    BrokerBackend = class _BrokerBackend {
      kind = "broker";
      /**
       * The pid this process spawned as a broker, or null when it only attached.
       *
       * A pid rather than a "did we spawn one" flag, because spawning is not
       * winning: the child can find the address already bound by another session's
       * broker and stand down, and the retry loop in open() then attaches to the
       * winner. A flag set on the spawn path called the winner ours; the pid
       * comparison in spawnedHere() cannot. Not on the wire; a local fact about how
       * this connection came to be.
       */
      #spawnedPid = null;
      #options;
      #socket;
      #nextId = 1;
      #pending = /* @__PURE__ */ new Map();
      #progress = /* @__PURE__ */ new Map();
      /**
       * Outstanding pings, kept apart from #pending because their contracts differ:
       * #pending treats `ok: false` as a failure, and a ping treats it as an answer.
       */
      #liveness = /* @__PURE__ */ new Map();
      #onKernelReady;
      #closed = false;
      constructor(options, socket) {
        this.#options = options;
        this.#socket = socket;
        this.#attach(socket);
      }
      /**
       * Is the broker answering on this socket the process this backend spawned?
       *
       * Only `doctor` asks, and only to keep one line honest: the pool settings —
       * idle, budget, reserve — belong to whichever session started the broker, so
       * a run that merely attached cannot report its own as though they were in
       * force. The caller supplies the pid the broker reports for itself, so the
       * answer is the two processes agreeing rather than a note taken at connect
       * time about which path the connection came off.
       */
      spawnedHere(brokerPid) {
        return this.#spawnedPid !== null && this.#spawnedPid === brokerPid;
      }
      /**
       * Attach to a broker only if one is already listening — never start one — for
       * a caller that asks about sharing rather than shares: `wolfram_status`, which
       * must start nothing. Same safety check and same verified attach as `open`,
       * and the same logger, which is where a caller learns why the answer is null.
       */
      static async attachIfRunning(options) {
        const fault = socketFault(options.address);
        if (fault) {
          options.log(`not sharing kernels: ${fault}`);
          return null;
        }
        const existing = await tryConnect(options.address);
        return existing ? _BrokerBackend.#verified(options, existing, null) : null;
      }
      /**
       * Connect to a broker, starting one if necessary.
       *
       * @returns a backend, or null when sharing could not be arranged.
       */
      static async open(options) {
        const { address, log } = options;
        const fault = socketFault(address);
        if (fault) {
          log(`not sharing kernels: ${fault}. Using a private kernel instead; sharing resumes when WOLFRAM_MCP_RUNTIME_DIR (or XDG_RUNTIME_DIR) names a directory only you can write to`);
          return null;
        }
        const existing = await tryConnect(address);
        if (existing)
          return _BrokerBackend.#verified(options, existing, null);
        log("no broker listening; starting one");
        let spawnFailed = null;
        let spawnedPid = null;
        let logTarget = "ignore";
        const logPath = options.spawnEnv["WOLFRAM_MCP_LOG"] ?? process.env["WOLFRAM_MCP_LOG"];
        if (logPath) {
          try {
            logTarget = openSync(logPath, "a");
          } catch (err) {
            log(`cannot write broker logs to ${logPath}: ${errorText(err)}`);
          }
        }
        try {
          const child = spawn(options.spawnCommand, options.spawnArgs, {
            detached: true,
            stdio: ["ignore", logTarget, logTarget],
            env: options.spawnEnv,
            windowsHide: true
          });
          child.on("error", (err) => {
            spawnFailed = errorText(err);
            log(`the broker could not be started: ${spawnFailed}`);
          });
          child.unref();
          spawnedPid = child.pid ?? null;
        } catch (err) {
          log(`could not spawn a broker: ${errorText(err)}`);
          return null;
        } finally {
          if (typeof logTarget === "number") {
            try {
              closeSync(logTarget);
            } catch {
            }
          }
        }
        const deadline = Date.now() + CONNECT_DEADLINE_MS;
        while (Date.now() < deadline) {
          await delay(CONNECT_RETRY_MS);
          if (spawnFailed !== null) {
            log("the broker never started; using a private kernel instead");
            return null;
          }
          const socket = await tryConnect(address);
          if (socket)
            return _BrokerBackend.#verified(options, socket, spawnedPid);
        }
        log("a broker did not come up in time; using a private kernel instead");
        return null;
      }
      /**
       * Build a backend on a connected socket, but only once the process behind it
       * has answered.
       *
       * Accepting a connection is the OS's work, not the broker's: a SIGSTOPped
       * process, or one blocked in a synchronous call, still has its listen backlog
       * answered for it. So a socket proves that a broker bound this path once, not
       * that one is running now — and "the socket accepted me" is exactly what
       * `attached to the broker` used to mean. A wedged broker was discovered only
       * by the first real call, which the caller paid for at the full timeout.
       */
      static async #verified(options, socket, spawnedPid) {
        const backend = new _BrokerBackend(options, socket);
        backend.#spawnedPid = spawnedPid;
        if (await backend.#answers()) {
          const refused = await backend.#declare();
          if (refused === null) {
            options.log(`attached to the broker at ${options.address} for environment ${options.flavour.digest}`);
            return backend;
          }
          options.log(`the broker will not serve this session's kernel environment (${options.flavour.digest}): ${refused}; using a private kernel instead`);
          await backend.stop();
          return null;
        }
        options.log(`the broker at ${options.address} accepted a connection but did not answer; using a private kernel instead`);
        await backend.stop();
        return null;
      }
      /**
       * Ask the broker whether it is running, and take any answer as yes.
       *
       * The `ok` flag is ignored on purpose. A broker started before this op existed
       * answers `unknown broker op: ping`, and that refusal is still proof the
       * process is running and reading its socket, which is the entire question.
       * Reading it as a failure would send every session to a private kernel, and
       * cost the seat that buys, for as long as an older broker keeps serving — a
       * minute past the last detach at the very least, and in practice a whole
       * working session, since a broker serves the code it started with.
       */
      #answers() {
        if (this.#closed || !this.#socket.writable)
          return Promise.resolve(false);
        const id = this.#nextId++;
        return new Promise((resolve) => {
          const timer = setTimeout(() => {
            this.#liveness.delete(id);
            resolve(false);
          }, PING_DEADLINE_MS);
          this.#liveness.set(id, (alive) => {
            clearTimeout(timer);
            resolve(alive);
          });
          this.#socket.write(encodeFrame({ id, op: "ping" }), (err) => {
            if (err) {
              this.#liveness.delete(id);
              clearTimeout(timer);
              resolve(false);
            }
          });
        });
      }
      /**
       * Tell the broker what this session's kernels must be started with.
       *
       * The values travel, not just their digest, because the broker is what starts
       * the kernel and its own environment belongs to whichever session spawned it.
       *
       * A broker that predates this refuses the op, and a refusal is not a failure
       * of the broker — it is the absence of the one thing needed to share safely,
       * so it is treated exactly like a rejection.
       */
      async #declare() {
        const { flavour } = this.#options;
        try {
          const result = await this.#request("hello", { digest: flavour.digest, env: flavour.env, names: flavour.names }, PING_DEADLINE_MS);
          return result?.flavours === true ? null : "it did not accept the declaration";
        } catch (err) {
          return errorText(err);
        }
      }
      #attach(socket) {
        socket.setEncoding("utf8");
        const reader = new FrameReader((raw) => this.#onFrame(raw));
        socket.on("data", (chunk) => reader.push(chunk));
        socket.on("close", () => this.#failAll(new Error("the Wolfram broker closed the connection")));
        socket.on("error", (err) => this.#failAll(err));
      }
      #onFrame(frame) {
        if (isEvent(frame)) {
          if (frame.event === "shuttingDown") {
            this.#options.log("the broker is shutting down; will choose again");
            this.#closed = true;
            return;
          }
          if (frame.event === "progress") {
            this.#progress.get(frame.target)?.(frame.progress);
            return;
          }
          if (frame.event === "kernelReady") {
            const { capabilities, tools, prompts } = frame;
            void this.#onKernelReady?.({
              capabilities: async () => capabilities,
              listTools: async (cursor) => cursor ? this.listTools(cursor) : { tools },
              listPrompts: async (cursor) => cursor ? this.listPrompts(cursor) : { prompts: prompts ?? [] }
            });
          }
          return;
        }
        const response = frame;
        const alive = this.#liveness.get(response.id);
        if (alive) {
          this.#liveness.delete(response.id);
          alive(true);
          return;
        }
        const waiter = this.#pending.get(response.id);
        if (!waiter)
          return;
        this.#pending.delete(response.id);
        if (response.ok)
          waiter.resolve(response.result);
        else
          waiter.reject(brokerError(response));
      }
      #failAll(err) {
        if (this.#closed)
          return;
        this.#closed = true;
        for (const [, waiter] of this.#pending)
          waiter.reject(err);
        this.#pending.clear();
        for (const [, alive] of this.#liveness)
          alive(false);
        this.#liveness.clear();
      }
      /** False once the socket is gone or the broker stopped answering. */
      usable() {
        return !this.#closed && this.#socket.writable;
      }
      #request(op, params, timeoutMs, signal, onprogress) {
        if (this.#closed || !this.#socket.writable) {
          return Promise.reject(new Error("the Wolfram broker is not connected"));
        }
        const id = this.#nextId++;
        const frame = {
          id,
          op,
          ...params === void 0 ? {} : { params },
          ...timeoutMs === void 0 ? {} : { timeoutMs }
        };
        const ceiling = brokerCeilingMs(op, timeoutMs, this.#options.startTimeoutMs ?? DEFAULT_START_TIMEOUT_MS);
        return new Promise((resolve, reject) => {
          const timer = ceiling === 0 ? void 0 : setTimeout(() => {
            this.#pending.delete(id);
            this.#closed = true;
            reject(new Error(`the Wolfram broker did not answer ${op} within ${ceiling}ms`));
          }, ceiling);
          timer?.unref?.();
          const settle = {
            resolve: (v) => {
              clearTimeout(timer);
              this.#progress.delete(id);
              resolve(v);
            },
            reject: (e) => {
              clearTimeout(timer);
              this.#progress.delete(id);
              reject(e);
            }
          };
          if (signal) {
            if (signal.aborted) {
              settle.reject(new Error("the call was cancelled before it was sent"));
              return;
            }
            signal.addEventListener("abort", () => {
              if (this.#socket.writable) {
                this.#socket.write(encodeFrame({ id: this.#nextId++, op: "cancel", target: id }));
              }
              this.#pending.delete(id);
              settle.reject(new Error("the call was cancelled"));
            }, { once: true });
          }
          if (onprogress)
            this.#progress.set(id, onprogress);
          this.#pending.set(id, settle);
          this.#socket.write(encodeFrame(frame), (err) => {
            if (err) {
              this.#pending.delete(id);
              settle.reject(err);
            }
          });
        });
      }
      onKernelReady(handler) {
        this.#onKernelReady = handler;
      }
      capabilities() {
        return this.#request("capabilities");
      }
      listTools(cursor) {
        return this.#request("listTools", cursor ? { cursor } : void 0);
      }
      listPrompts(cursor) {
        return this.#request("listPrompts", cursor ? { cursor } : void 0);
      }
      getPrompt(params) {
        return this.#request("getPrompt", params);
      }
      listResources(params) {
        return this.#request("listResources", params);
      }
      readResource(params) {
        return this.#request("readResource", params);
      }
      callTool(params, options) {
        return this.#request("callTool", params, options.timeoutMs, options.signal, options.onprogress);
      }
      /**
       * Wait for the broker's own preparation — reading what its kernels need from
       * cache — within what the deadline has left. That work is the broker's,
       * shared with every session attached to it, so the deadline passing stops
       * only this session's wait; the broker finishes, and
       * serves whoever asks next.
       *
       * Deliberately not a pool request. This was `capabilities`, which queues for
       * a slot like any work, so a session arriving while every slot held a long
       * evaluation timed out here and was backed off for ten minutes from a
       * perfectly healthy broker. Waiting for a
       * slot is ordinary queueing, bounded by the call's own ceiling; a kernel the
       * broker starts for it is bounded by the broker's start timeout.
       */
      async awaitReady(deadline) {
        const stage = "waiting for the shared broker to prepare";
        const remainder = deadline.handOn(stage);
        try {
          await deadline.within(stage, this.#request("ready", void 0, remainder));
        } catch (err) {
          if (/unknown broker op/.test(errorText(err)))
            return;
          throw err;
        }
      }
      /**
       * Pool and licence state, for `doctor` and `wolfram_status`. The broker
       * answers from memory, so a caller that must not hang — the status tool is
       * what you ask when things are stuck — passes a ceiling of its own.
       */
      status(timeoutMs) {
        return this.#request("status", void 0, timeoutMs);
      }
      async stop() {
        this.#closed = true;
        this.#socket.end();
        this.#socket.destroy();
      }
    };
  }
});

// node_modules/zod/v4/mini/parse.js
var init_parse3 = __esm({
  "node_modules/zod/v4/mini/parse.js"() {
    init_core2();
  }
});

// node_modules/zod/v4/mini/schemas.js
var init_schemas3 = __esm({
  "node_modules/zod/v4/mini/schemas.js"() {
  }
});

// node_modules/zod/v4/mini/checks.js
var init_checks3 = __esm({
  "node_modules/zod/v4/mini/checks.js"() {
  }
});

// node_modules/zod/v4/mini/iso.js
var init_iso2 = __esm({
  "node_modules/zod/v4/mini/iso.js"() {
  }
});

// node_modules/zod/v4/mini/coerce.js
var init_coerce2 = __esm({
  "node_modules/zod/v4/mini/coerce.js"() {
  }
});

// node_modules/zod/v4/mini/external.js
var init_external2 = __esm({
  "node_modules/zod/v4/mini/external.js"() {
    init_core2();
    init_parse3();
    init_schemas3();
    init_checks3();
    init_locales();
    init_iso2();
    init_coerce2();
  }
});

// node_modules/zod/v4-mini/index.js
var init_v4_mini = __esm({
  "node_modules/zod/v4-mini/index.js"() {
    init_external2();
  }
});

// node_modules/@modelcontextprotocol/sdk/dist/esm/server/zod-compat.js
function isZ4Schema(s) {
  const schema = s;
  return !!schema._zod;
}
function safeParse3(schema, data) {
  if (isZ4Schema(schema)) {
    const result2 = safeParse(schema, data);
    return result2;
  }
  const v3Schema = schema;
  const result = v3Schema.safeParse(data);
  return result;
}
function getObjectShape(schema) {
  if (!schema)
    return void 0;
  let rawShape;
  if (isZ4Schema(schema)) {
    const v4Schema = schema;
    rawShape = v4Schema._zod?.def?.shape;
  } else {
    const v3Schema = schema;
    rawShape = v3Schema.shape;
  }
  if (!rawShape)
    return void 0;
  if (typeof rawShape === "function") {
    try {
      return rawShape();
    } catch {
      return void 0;
    }
  }
  return rawShape;
}
function getLiteralValue(schema) {
  if (isZ4Schema(schema)) {
    const v4Schema = schema;
    const def2 = v4Schema._zod?.def;
    if (def2) {
      if (def2.value !== void 0)
        return def2.value;
      if (Array.isArray(def2.values) && def2.values.length > 0) {
        return def2.values[0];
      }
    }
  }
  const v3Schema = schema;
  const def = v3Schema._def;
  if (def) {
    if (def.value !== void 0)
      return def.value;
    if (Array.isArray(def.values) && def.values.length > 0) {
      return def.values[0];
    }
  }
  const directValue = schema.value;
  if (directValue !== void 0)
    return directValue;
  return void 0;
}
var init_zod_compat = __esm({
  "node_modules/@modelcontextprotocol/sdk/dist/esm/server/zod-compat.js"() {
    init_v4_mini();
  }
});

// node_modules/@modelcontextprotocol/sdk/dist/esm/experimental/tasks/interfaces.js
function isTerminal(status) {
  return status === "completed" || status === "failed" || status === "cancelled";
}
var init_interfaces = __esm({
  "node_modules/@modelcontextprotocol/sdk/dist/esm/experimental/tasks/interfaces.js"() {
  }
});

// node_modules/zod-to-json-schema/dist/esm/Options.js
var init_Options = __esm({
  "node_modules/zod-to-json-schema/dist/esm/Options.js"() {
  }
});

// node_modules/zod-to-json-schema/dist/esm/Refs.js
var init_Refs = __esm({
  "node_modules/zod-to-json-schema/dist/esm/Refs.js"() {
    init_Options();
  }
});

// node_modules/zod-to-json-schema/dist/esm/errorMessages.js
var init_errorMessages = __esm({
  "node_modules/zod-to-json-schema/dist/esm/errorMessages.js"() {
  }
});

// node_modules/zod-to-json-schema/dist/esm/getRelativePath.js
var init_getRelativePath = __esm({
  "node_modules/zod-to-json-schema/dist/esm/getRelativePath.js"() {
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/any.js
var init_any = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/any.js"() {
    init_getRelativePath();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/array.js
var init_array = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/array.js"() {
    init_errorMessages();
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/bigint.js
var init_bigint = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/bigint.js"() {
    init_errorMessages();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/boolean.js
var init_boolean = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/boolean.js"() {
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/branded.js
var init_branded = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/branded.js"() {
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/catch.js
var init_catch = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/catch.js"() {
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/date.js
var init_date = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/date.js"() {
    init_errorMessages();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/default.js
var init_default = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/default.js"() {
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/effects.js
var init_effects = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/effects.js"() {
    init_parseDef();
    init_any();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/enum.js
var init_enum = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/enum.js"() {
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/intersection.js
var init_intersection = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/intersection.js"() {
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/literal.js
var init_literal = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/literal.js"() {
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/string.js
var ALPHA_NUMERIC;
var init_string = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/string.js"() {
    init_errorMessages();
    ALPHA_NUMERIC = new Set("ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789");
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/record.js
var init_record = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/record.js"() {
    init_parseDef();
    init_string();
    init_branded();
    init_any();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/map.js
var init_map = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/map.js"() {
    init_parseDef();
    init_record();
    init_any();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/nativeEnum.js
var init_nativeEnum = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/nativeEnum.js"() {
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/never.js
var init_never = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/never.js"() {
    init_any();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/null.js
var init_null = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/null.js"() {
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/union.js
var init_union = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/union.js"() {
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/nullable.js
var init_nullable = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/nullable.js"() {
    init_parseDef();
    init_union();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/number.js
var init_number = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/number.js"() {
    init_errorMessages();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/object.js
var init_object = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/object.js"() {
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/optional.js
var init_optional = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/optional.js"() {
    init_parseDef();
    init_any();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/pipeline.js
var init_pipeline = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/pipeline.js"() {
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/promise.js
var init_promise = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/promise.js"() {
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/set.js
var init_set = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/set.js"() {
    init_errorMessages();
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/tuple.js
var init_tuple = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/tuple.js"() {
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/undefined.js
var init_undefined = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/undefined.js"() {
    init_any();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/unknown.js
var init_unknown = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/unknown.js"() {
    init_any();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/readonly.js
var init_readonly = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/readonly.js"() {
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/selectParser.js
var init_selectParser = __esm({
  "node_modules/zod-to-json-schema/dist/esm/selectParser.js"() {
    init_any();
    init_array();
    init_bigint();
    init_boolean();
    init_branded();
    init_catch();
    init_date();
    init_default();
    init_effects();
    init_enum();
    init_intersection();
    init_literal();
    init_map();
    init_nativeEnum();
    init_never();
    init_null();
    init_nullable();
    init_number();
    init_object();
    init_optional();
    init_pipeline();
    init_promise();
    init_record();
    init_set();
    init_string();
    init_tuple();
    init_undefined();
    init_union();
    init_unknown();
    init_readonly();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parseDef.js
var init_parseDef = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parseDef.js"() {
    init_Options();
    init_selectParser();
    init_getRelativePath();
    init_any();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parseTypes.js
var init_parseTypes = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parseTypes.js"() {
  }
});

// node_modules/zod-to-json-schema/dist/esm/zodToJsonSchema.js
var init_zodToJsonSchema = __esm({
  "node_modules/zod-to-json-schema/dist/esm/zodToJsonSchema.js"() {
    init_parseDef();
    init_Refs();
    init_any();
  }
});

// node_modules/zod-to-json-schema/dist/esm/index.js
var init_esm = __esm({
  "node_modules/zod-to-json-schema/dist/esm/index.js"() {
    init_Options();
    init_Refs();
    init_errorMessages();
    init_getRelativePath();
    init_parseDef();
    init_parseTypes();
    init_any();
    init_array();
    init_bigint();
    init_boolean();
    init_branded();
    init_catch();
    init_date();
    init_default();
    init_effects();
    init_enum();
    init_intersection();
    init_literal();
    init_map();
    init_nativeEnum();
    init_never();
    init_null();
    init_nullable();
    init_number();
    init_object();
    init_optional();
    init_pipeline();
    init_promise();
    init_readonly();
    init_record();
    init_set();
    init_string();
    init_tuple();
    init_undefined();
    init_union();
    init_unknown();
    init_selectParser();
    init_zodToJsonSchema();
    init_zodToJsonSchema();
  }
});

// node_modules/@modelcontextprotocol/sdk/dist/esm/server/zod-json-schema-compat.js
function getMethodLiteral(schema) {
  const shape = getObjectShape(schema);
  const methodSchema = shape?.method;
  if (!methodSchema) {
    throw new Error("Schema is missing a method literal");
  }
  const value = getLiteralValue(methodSchema);
  if (typeof value !== "string") {
    throw new Error("Schema method literal must be a string");
  }
  return value;
}
function parseWithCompat(schema, data) {
  const result = safeParse3(schema, data);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}
var init_zod_json_schema_compat = __esm({
  "node_modules/@modelcontextprotocol/sdk/dist/esm/server/zod-json-schema-compat.js"() {
    init_zod_compat();
    init_esm();
  }
});

// node_modules/@modelcontextprotocol/sdk/dist/esm/shared/protocol.js
function isPlainObject2(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function mergeCapabilities(base, additional) {
  const result = { ...base };
  for (const key in additional) {
    const k = key;
    const addValue = additional[k];
    if (addValue === void 0)
      continue;
    const baseValue = result[k];
    if (isPlainObject2(baseValue) && isPlainObject2(addValue)) {
      result[k] = { ...baseValue, ...addValue };
    } else {
      result[k] = addValue;
    }
  }
  return result;
}
var DEFAULT_REQUEST_TIMEOUT_MSEC, Protocol;
var init_protocol = __esm({
  "node_modules/@modelcontextprotocol/sdk/dist/esm/shared/protocol.js"() {
    init_zod_compat();
    init_types();
    init_interfaces();
    init_zod_json_schema_compat();
    DEFAULT_REQUEST_TIMEOUT_MSEC = 6e4;
    Protocol = class {
      constructor(_options) {
        this._options = _options;
        this._requestMessageId = 0;
        this._requestHandlers = /* @__PURE__ */ new Map();
        this._requestHandlerAbortControllers = /* @__PURE__ */ new Map();
        this._notificationHandlers = /* @__PURE__ */ new Map();
        this._responseHandlers = /* @__PURE__ */ new Map();
        this._progressHandlers = /* @__PURE__ */ new Map();
        this._timeoutInfo = /* @__PURE__ */ new Map();
        this._pendingDebouncedNotifications = /* @__PURE__ */ new Set();
        this._taskProgressTokens = /* @__PURE__ */ new Map();
        this._requestResolvers = /* @__PURE__ */ new Map();
        this.setNotificationHandler(CancelledNotificationSchema, (notification) => {
          this._oncancel(notification);
        });
        this.setNotificationHandler(ProgressNotificationSchema, (notification) => {
          this._onprogress(notification);
        });
        this.setRequestHandler(
          PingRequestSchema,
          // Automatic pong by default.
          (_request) => ({})
        );
        this._taskStore = _options?.taskStore;
        this._taskMessageQueue = _options?.taskMessageQueue;
        if (this._taskStore) {
          this.setRequestHandler(GetTaskRequestSchema, async (request, extra) => {
            const task = await this._taskStore.getTask(request.params.taskId, extra.sessionId);
            if (!task) {
              throw new McpError(ErrorCode.InvalidParams, "Failed to retrieve task: Task not found");
            }
            return {
              ...task
            };
          });
          this.setRequestHandler(GetTaskPayloadRequestSchema, async (request, extra) => {
            const handleTaskResult = async () => {
              const taskId = request.params.taskId;
              if (this._taskMessageQueue) {
                let queuedMessage;
                while (queuedMessage = await this._taskMessageQueue.dequeue(taskId, extra.sessionId)) {
                  if (queuedMessage.type === "response" || queuedMessage.type === "error") {
                    const message = queuedMessage.message;
                    const requestId = message.id;
                    const resolver = this._requestResolvers.get(requestId);
                    if (resolver) {
                      this._requestResolvers.delete(requestId);
                      if (queuedMessage.type === "response") {
                        resolver(message);
                      } else {
                        const errorMessage = message;
                        const error2 = new McpError(errorMessage.error.code, errorMessage.error.message, errorMessage.error.data);
                        resolver(error2);
                      }
                    } else {
                      const messageType = queuedMessage.type === "response" ? "Response" : "Error";
                      this._onerror(new Error(`${messageType} handler missing for request ${requestId}`));
                    }
                    continue;
                  }
                  await this._transport?.send(queuedMessage.message, { relatedRequestId: extra.requestId });
                }
              }
              const task = await this._taskStore.getTask(taskId, extra.sessionId);
              if (!task) {
                throw new McpError(ErrorCode.InvalidParams, `Task not found: ${taskId}`);
              }
              if (!isTerminal(task.status)) {
                await this._waitForTaskUpdate(taskId, extra.signal);
                return await handleTaskResult();
              }
              if (isTerminal(task.status)) {
                const result = await this._taskStore.getTaskResult(taskId, extra.sessionId);
                this._clearTaskQueue(taskId);
                return {
                  ...result,
                  _meta: {
                    ...result._meta,
                    [RELATED_TASK_META_KEY]: {
                      taskId
                    }
                  }
                };
              }
              return await handleTaskResult();
            };
            return await handleTaskResult();
          });
          this.setRequestHandler(ListTasksRequestSchema, async (request, extra) => {
            try {
              const { tasks, nextCursor } = await this._taskStore.listTasks(request.params?.cursor, extra.sessionId);
              return {
                tasks,
                nextCursor,
                _meta: {}
              };
            } catch (error2) {
              throw new McpError(ErrorCode.InvalidParams, `Failed to list tasks: ${error2 instanceof Error ? error2.message : String(error2)}`);
            }
          });
          this.setRequestHandler(CancelTaskRequestSchema, async (request, extra) => {
            try {
              const task = await this._taskStore.getTask(request.params.taskId, extra.sessionId);
              if (!task) {
                throw new McpError(ErrorCode.InvalidParams, `Task not found: ${request.params.taskId}`);
              }
              if (isTerminal(task.status)) {
                throw new McpError(ErrorCode.InvalidParams, `Cannot cancel task in terminal status: ${task.status}`);
              }
              await this._taskStore.updateTaskStatus(request.params.taskId, "cancelled", "Client cancelled task execution.", extra.sessionId);
              this._clearTaskQueue(request.params.taskId);
              const cancelledTask = await this._taskStore.getTask(request.params.taskId, extra.sessionId);
              if (!cancelledTask) {
                throw new McpError(ErrorCode.InvalidParams, `Task not found after cancellation: ${request.params.taskId}`);
              }
              return {
                _meta: {},
                ...cancelledTask
              };
            } catch (error2) {
              if (error2 instanceof McpError) {
                throw error2;
              }
              throw new McpError(ErrorCode.InvalidRequest, `Failed to cancel task: ${error2 instanceof Error ? error2.message : String(error2)}`);
            }
          });
        }
      }
      async _oncancel(notification) {
        if (!notification.params.requestId) {
          return;
        }
        const controller = this._requestHandlerAbortControllers.get(notification.params.requestId);
        controller?.abort(notification.params.reason);
      }
      _setupTimeout(messageId, timeout, maxTotalTimeout, onTimeout, resetTimeoutOnProgress = false) {
        this._timeoutInfo.set(messageId, {
          timeoutId: setTimeout(onTimeout, timeout),
          startTime: Date.now(),
          timeout,
          maxTotalTimeout,
          resetTimeoutOnProgress,
          onTimeout
        });
      }
      _resetTimeout(messageId) {
        const info = this._timeoutInfo.get(messageId);
        if (!info)
          return false;
        const totalElapsed = Date.now() - info.startTime;
        if (info.maxTotalTimeout && totalElapsed >= info.maxTotalTimeout) {
          this._timeoutInfo.delete(messageId);
          throw McpError.fromError(ErrorCode.RequestTimeout, "Maximum total timeout exceeded", {
            maxTotalTimeout: info.maxTotalTimeout,
            totalElapsed
          });
        }
        clearTimeout(info.timeoutId);
        info.timeoutId = setTimeout(info.onTimeout, info.timeout);
        return true;
      }
      _cleanupTimeout(messageId) {
        const info = this._timeoutInfo.get(messageId);
        if (info) {
          clearTimeout(info.timeoutId);
          this._timeoutInfo.delete(messageId);
        }
      }
      /**
       * Attaches to the given transport, starts it, and starts listening for messages.
       *
       * The Protocol object assumes ownership of the Transport, replacing any callbacks that have already been set, and expects that it is the only user of the Transport instance going forward.
       */
      async connect(transport) {
        if (this._transport) {
          throw new Error("Already connected to a transport. Call close() before connecting to a new transport, or use a separate Protocol instance per connection.");
        }
        this._transport = transport;
        const _onclose = this.transport?.onclose;
        this._transport.onclose = () => {
          _onclose?.();
          this._onclose();
        };
        const _onerror = this.transport?.onerror;
        this._transport.onerror = (error2) => {
          _onerror?.(error2);
          this._onerror(error2);
        };
        const _onmessage = this._transport?.onmessage;
        this._transport.onmessage = (message, extra) => {
          _onmessage?.(message, extra);
          if (isJSONRPCResultResponse(message) || isJSONRPCErrorResponse(message)) {
            this._onresponse(message);
          } else if (isJSONRPCRequest(message)) {
            this._onrequest(message, extra);
          } else if (isJSONRPCNotification(message)) {
            this._onnotification(message);
          } else {
            this._onerror(new Error(`Unknown message type: ${JSON.stringify(message)}`));
          }
        };
        await this._transport.start();
      }
      _onclose() {
        const responseHandlers = this._responseHandlers;
        this._responseHandlers = /* @__PURE__ */ new Map();
        this._progressHandlers.clear();
        this._taskProgressTokens.clear();
        this._pendingDebouncedNotifications.clear();
        for (const info of this._timeoutInfo.values()) {
          clearTimeout(info.timeoutId);
        }
        this._timeoutInfo.clear();
        for (const controller of this._requestHandlerAbortControllers.values()) {
          controller.abort();
        }
        this._requestHandlerAbortControllers.clear();
        const error2 = McpError.fromError(ErrorCode.ConnectionClosed, "Connection closed");
        this._transport = void 0;
        this.onclose?.();
        for (const handler of responseHandlers.values()) {
          handler(error2);
        }
      }
      _onerror(error2) {
        this.onerror?.(error2);
      }
      _onnotification(notification) {
        const handler = this._notificationHandlers.get(notification.method) ?? this.fallbackNotificationHandler;
        if (handler === void 0) {
          return;
        }
        Promise.resolve().then(() => handler(notification)).catch((error2) => this._onerror(new Error(`Uncaught error in notification handler: ${error2}`)));
      }
      _onrequest(request, extra) {
        const handler = this._requestHandlers.get(request.method) ?? this.fallbackRequestHandler;
        const capturedTransport = this._transport;
        const relatedTaskId = request.params?._meta?.[RELATED_TASK_META_KEY]?.taskId;
        if (handler === void 0) {
          const errorResponse = {
            jsonrpc: "2.0",
            id: request.id,
            error: {
              code: ErrorCode.MethodNotFound,
              message: "Method not found"
            }
          };
          if (relatedTaskId && this._taskMessageQueue) {
            this._enqueueTaskMessage(relatedTaskId, {
              type: "error",
              message: errorResponse,
              timestamp: Date.now()
            }, capturedTransport?.sessionId).catch((error2) => this._onerror(new Error(`Failed to enqueue error response: ${error2}`)));
          } else {
            capturedTransport?.send(errorResponse).catch((error2) => this._onerror(new Error(`Failed to send an error response: ${error2}`)));
          }
          return;
        }
        const abortController = new AbortController();
        this._requestHandlerAbortControllers.set(request.id, abortController);
        const taskCreationParams = isTaskAugmentedRequestParams(request.params) ? request.params.task : void 0;
        const taskStore = this._taskStore ? this.requestTaskStore(request, capturedTransport?.sessionId) : void 0;
        const fullExtra = {
          signal: abortController.signal,
          sessionId: capturedTransport?.sessionId,
          _meta: request.params?._meta,
          sendNotification: async (notification) => {
            if (abortController.signal.aborted)
              return;
            const notificationOptions = { relatedRequestId: request.id };
            if (relatedTaskId) {
              notificationOptions.relatedTask = { taskId: relatedTaskId };
            }
            await this.notification(notification, notificationOptions);
          },
          sendRequest: async (r, resultSchema, options) => {
            if (abortController.signal.aborted) {
              throw new McpError(ErrorCode.ConnectionClosed, "Request was cancelled");
            }
            const requestOptions = { ...options, relatedRequestId: request.id };
            if (relatedTaskId && !requestOptions.relatedTask) {
              requestOptions.relatedTask = { taskId: relatedTaskId };
            }
            const effectiveTaskId = requestOptions.relatedTask?.taskId ?? relatedTaskId;
            if (effectiveTaskId && taskStore) {
              await taskStore.updateTaskStatus(effectiveTaskId, "input_required");
            }
            return await this.request(r, resultSchema, requestOptions);
          },
          authInfo: extra?.authInfo,
          requestId: request.id,
          requestInfo: extra?.requestInfo,
          taskId: relatedTaskId,
          taskStore,
          taskRequestedTtl: taskCreationParams?.ttl,
          closeSSEStream: extra?.closeSSEStream,
          closeStandaloneSSEStream: extra?.closeStandaloneSSEStream
        };
        Promise.resolve().then(() => {
          if (taskCreationParams) {
            this.assertTaskHandlerCapability(request.method);
          }
        }).then(() => handler(request, fullExtra)).then(async (result) => {
          if (abortController.signal.aborted) {
            return;
          }
          const response = {
            result,
            jsonrpc: "2.0",
            id: request.id
          };
          if (relatedTaskId && this._taskMessageQueue) {
            await this._enqueueTaskMessage(relatedTaskId, {
              type: "response",
              message: response,
              timestamp: Date.now()
            }, capturedTransport?.sessionId);
          } else {
            await capturedTransport?.send(response);
          }
        }, async (error2) => {
          if (abortController.signal.aborted) {
            return;
          }
          const errorResponse = {
            jsonrpc: "2.0",
            id: request.id,
            error: {
              code: Number.isSafeInteger(error2["code"]) ? error2["code"] : ErrorCode.InternalError,
              message: error2.message ?? "Internal error",
              ...error2["data"] !== void 0 && { data: error2["data"] }
            }
          };
          if (relatedTaskId && this._taskMessageQueue) {
            await this._enqueueTaskMessage(relatedTaskId, {
              type: "error",
              message: errorResponse,
              timestamp: Date.now()
            }, capturedTransport?.sessionId);
          } else {
            await capturedTransport?.send(errorResponse);
          }
        }).catch((error2) => this._onerror(new Error(`Failed to send response: ${error2}`))).finally(() => {
          if (this._requestHandlerAbortControllers.get(request.id) === abortController) {
            this._requestHandlerAbortControllers.delete(request.id);
          }
        });
      }
      _onprogress(notification) {
        const { progressToken, ...params } = notification.params;
        const messageId = Number(progressToken);
        const handler = this._progressHandlers.get(messageId);
        if (!handler) {
          this._onerror(new Error(`Received a progress notification for an unknown token: ${JSON.stringify(notification)}`));
          return;
        }
        const responseHandler = this._responseHandlers.get(messageId);
        const timeoutInfo = this._timeoutInfo.get(messageId);
        if (timeoutInfo && responseHandler && timeoutInfo.resetTimeoutOnProgress) {
          try {
            this._resetTimeout(messageId);
          } catch (error2) {
            this._responseHandlers.delete(messageId);
            this._progressHandlers.delete(messageId);
            this._cleanupTimeout(messageId);
            responseHandler(error2);
            return;
          }
        }
        handler(params);
      }
      _onresponse(response) {
        const messageId = Number(response.id);
        const resolver = this._requestResolvers.get(messageId);
        if (resolver) {
          this._requestResolvers.delete(messageId);
          if (isJSONRPCResultResponse(response)) {
            resolver(response);
          } else {
            const error2 = new McpError(response.error.code, response.error.message, response.error.data);
            resolver(error2);
          }
          return;
        }
        const handler = this._responseHandlers.get(messageId);
        if (handler === void 0) {
          this._onerror(new Error(`Received a response for an unknown message ID: ${JSON.stringify(response)}`));
          return;
        }
        this._responseHandlers.delete(messageId);
        this._cleanupTimeout(messageId);
        let isTaskResponse = false;
        if (isJSONRPCResultResponse(response) && response.result && typeof response.result === "object") {
          const result = response.result;
          if (result.task && typeof result.task === "object") {
            const task = result.task;
            if (typeof task.taskId === "string") {
              isTaskResponse = true;
              this._taskProgressTokens.set(task.taskId, messageId);
            }
          }
        }
        if (!isTaskResponse) {
          this._progressHandlers.delete(messageId);
        }
        if (isJSONRPCResultResponse(response)) {
          handler(response);
        } else {
          const error2 = McpError.fromError(response.error.code, response.error.message, response.error.data);
          handler(error2);
        }
      }
      get transport() {
        return this._transport;
      }
      /**
       * Closes the connection.
       */
      async close() {
        await this._transport?.close();
      }
      /**
       * Sends a request and returns an AsyncGenerator that yields response messages.
       * The generator is guaranteed to end with either a 'result' or 'error' message.
       *
       * @example
       * ```typescript
       * const stream = protocol.requestStream(request, resultSchema, options);
       * for await (const message of stream) {
       *   switch (message.type) {
       *     case 'taskCreated':
       *       console.log('Task created:', message.task.taskId);
       *       break;
       *     case 'taskStatus':
       *       console.log('Task status:', message.task.status);
       *       break;
       *     case 'result':
       *       console.log('Final result:', message.result);
       *       break;
       *     case 'error':
       *       console.error('Error:', message.error);
       *       break;
       *   }
       * }
       * ```
       *
       * @experimental Use `client.experimental.tasks.requestStream()` to access this method.
       */
      async *requestStream(request, resultSchema, options) {
        const { task } = options ?? {};
        if (!task) {
          try {
            const result = await this.request(request, resultSchema, options);
            yield { type: "result", result };
          } catch (error2) {
            yield {
              type: "error",
              error: error2 instanceof McpError ? error2 : new McpError(ErrorCode.InternalError, String(error2))
            };
          }
          return;
        }
        let taskId;
        try {
          const createResult = await this.request(request, CreateTaskResultSchema, options);
          if (createResult.task) {
            taskId = createResult.task.taskId;
            yield { type: "taskCreated", task: createResult.task };
          } else {
            throw new McpError(ErrorCode.InternalError, "Task creation did not return a task");
          }
          while (true) {
            const task2 = await this.getTask({ taskId }, options);
            yield { type: "taskStatus", task: task2 };
            if (isTerminal(task2.status)) {
              if (task2.status === "completed") {
                const result = await this.getTaskResult({ taskId }, resultSchema, options);
                yield { type: "result", result };
              } else if (task2.status === "failed") {
                yield {
                  type: "error",
                  error: new McpError(ErrorCode.InternalError, `Task ${taskId} failed`)
                };
              } else if (task2.status === "cancelled") {
                yield {
                  type: "error",
                  error: new McpError(ErrorCode.InternalError, `Task ${taskId} was cancelled`)
                };
              }
              return;
            }
            if (task2.status === "input_required") {
              const result = await this.getTaskResult({ taskId }, resultSchema, options);
              yield { type: "result", result };
              return;
            }
            const pollInterval = task2.pollInterval ?? this._options?.defaultTaskPollInterval ?? 1e3;
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
            options?.signal?.throwIfAborted();
          }
        } catch (error2) {
          yield {
            type: "error",
            error: error2 instanceof McpError ? error2 : new McpError(ErrorCode.InternalError, String(error2))
          };
        }
      }
      /**
       * Sends a request and waits for a response.
       *
       * Do not use this method to emit notifications! Use notification() instead.
       */
      request(request, resultSchema, options) {
        const { relatedRequestId, resumptionToken, onresumptiontoken, task, relatedTask } = options ?? {};
        return new Promise((resolve, reject) => {
          const earlyReject = (error2) => {
            reject(error2);
          };
          if (!this._transport) {
            earlyReject(new Error("Not connected"));
            return;
          }
          if (this._options?.enforceStrictCapabilities === true) {
            try {
              this.assertCapabilityForMethod(request.method);
              if (task) {
                this.assertTaskCapability(request.method);
              }
            } catch (e) {
              earlyReject(e);
              return;
            }
          }
          options?.signal?.throwIfAborted();
          const messageId = this._requestMessageId++;
          const jsonrpcRequest = {
            ...request,
            jsonrpc: "2.0",
            id: messageId
          };
          if (options?.onprogress) {
            this._progressHandlers.set(messageId, options.onprogress);
            jsonrpcRequest.params = {
              ...request.params,
              _meta: {
                ...request.params?._meta || {},
                progressToken: messageId
              }
            };
          }
          if (task) {
            jsonrpcRequest.params = {
              ...jsonrpcRequest.params,
              task
            };
          }
          if (relatedTask) {
            jsonrpcRequest.params = {
              ...jsonrpcRequest.params,
              _meta: {
                ...jsonrpcRequest.params?._meta || {},
                [RELATED_TASK_META_KEY]: relatedTask
              }
            };
          }
          const cancel = (reason) => {
            this._responseHandlers.delete(messageId);
            this._progressHandlers.delete(messageId);
            this._cleanupTimeout(messageId);
            this._transport?.send({
              jsonrpc: "2.0",
              method: "notifications/cancelled",
              params: {
                requestId: messageId,
                reason: String(reason)
              }
            }, { relatedRequestId, resumptionToken, onresumptiontoken }).catch((error3) => this._onerror(new Error(`Failed to send cancellation: ${error3}`)));
            const error2 = reason instanceof McpError ? reason : new McpError(ErrorCode.RequestTimeout, String(reason));
            reject(error2);
          };
          this._responseHandlers.set(messageId, (response) => {
            if (options?.signal?.aborted) {
              return;
            }
            if (response instanceof Error) {
              return reject(response);
            }
            try {
              const parseResult = safeParse3(resultSchema, response.result);
              if (!parseResult.success) {
                reject(parseResult.error);
              } else {
                resolve(parseResult.data);
              }
            } catch (error2) {
              reject(error2);
            }
          });
          options?.signal?.addEventListener("abort", () => {
            cancel(options?.signal?.reason);
          });
          const timeout = options?.timeout ?? DEFAULT_REQUEST_TIMEOUT_MSEC;
          const timeoutHandler = () => cancel(McpError.fromError(ErrorCode.RequestTimeout, "Request timed out", { timeout }));
          this._setupTimeout(messageId, timeout, options?.maxTotalTimeout, timeoutHandler, options?.resetTimeoutOnProgress ?? false);
          const relatedTaskId = relatedTask?.taskId;
          if (relatedTaskId) {
            const responseResolver = (response) => {
              const handler = this._responseHandlers.get(messageId);
              if (handler) {
                handler(response);
              } else {
                this._onerror(new Error(`Response handler missing for side-channeled request ${messageId}`));
              }
            };
            this._requestResolvers.set(messageId, responseResolver);
            this._enqueueTaskMessage(relatedTaskId, {
              type: "request",
              message: jsonrpcRequest,
              timestamp: Date.now()
            }).catch((error2) => {
              this._cleanupTimeout(messageId);
              reject(error2);
            });
          } else {
            this._transport.send(jsonrpcRequest, { relatedRequestId, resumptionToken, onresumptiontoken }).catch((error2) => {
              this._cleanupTimeout(messageId);
              reject(error2);
            });
          }
        });
      }
      /**
       * Gets the current status of a task.
       *
       * @experimental Use `client.experimental.tasks.getTask()` to access this method.
       */
      async getTask(params, options) {
        return this.request({ method: "tasks/get", params }, GetTaskResultSchema, options);
      }
      /**
       * Retrieves the result of a completed task.
       *
       * @experimental Use `client.experimental.tasks.getTaskResult()` to access this method.
       */
      async getTaskResult(params, resultSchema, options) {
        return this.request({ method: "tasks/result", params }, resultSchema, options);
      }
      /**
       * Lists tasks, optionally starting from a pagination cursor.
       *
       * @experimental Use `client.experimental.tasks.listTasks()` to access this method.
       */
      async listTasks(params, options) {
        return this.request({ method: "tasks/list", params }, ListTasksResultSchema, options);
      }
      /**
       * Cancels a specific task.
       *
       * @experimental Use `client.experimental.tasks.cancelTask()` to access this method.
       */
      async cancelTask(params, options) {
        return this.request({ method: "tasks/cancel", params }, CancelTaskResultSchema, options);
      }
      /**
       * Emits a notification, which is a one-way message that does not expect a response.
       */
      async notification(notification, options) {
        if (!this._transport) {
          throw new Error("Not connected");
        }
        this.assertNotificationCapability(notification.method);
        const relatedTaskId = options?.relatedTask?.taskId;
        if (relatedTaskId) {
          const jsonrpcNotification2 = {
            ...notification,
            jsonrpc: "2.0",
            params: {
              ...notification.params,
              _meta: {
                ...notification.params?._meta || {},
                [RELATED_TASK_META_KEY]: options.relatedTask
              }
            }
          };
          await this._enqueueTaskMessage(relatedTaskId, {
            type: "notification",
            message: jsonrpcNotification2,
            timestamp: Date.now()
          });
          return;
        }
        const debouncedMethods = this._options?.debouncedNotificationMethods ?? [];
        const canDebounce = debouncedMethods.includes(notification.method) && !notification.params && !options?.relatedRequestId && !options?.relatedTask;
        if (canDebounce) {
          if (this._pendingDebouncedNotifications.has(notification.method)) {
            return;
          }
          this._pendingDebouncedNotifications.add(notification.method);
          Promise.resolve().then(() => {
            this._pendingDebouncedNotifications.delete(notification.method);
            if (!this._transport) {
              return;
            }
            let jsonrpcNotification2 = {
              ...notification,
              jsonrpc: "2.0"
            };
            if (options?.relatedTask) {
              jsonrpcNotification2 = {
                ...jsonrpcNotification2,
                params: {
                  ...jsonrpcNotification2.params,
                  _meta: {
                    ...jsonrpcNotification2.params?._meta || {},
                    [RELATED_TASK_META_KEY]: options.relatedTask
                  }
                }
              };
            }
            this._transport?.send(jsonrpcNotification2, options).catch((error2) => this._onerror(error2));
          });
          return;
        }
        let jsonrpcNotification = {
          ...notification,
          jsonrpc: "2.0"
        };
        if (options?.relatedTask) {
          jsonrpcNotification = {
            ...jsonrpcNotification,
            params: {
              ...jsonrpcNotification.params,
              _meta: {
                ...jsonrpcNotification.params?._meta || {},
                [RELATED_TASK_META_KEY]: options.relatedTask
              }
            }
          };
        }
        await this._transport.send(jsonrpcNotification, options);
      }
      /**
       * Registers a handler to invoke when this protocol object receives a request with the given method.
       *
       * Note that this will replace any previous request handler for the same method.
       */
      setRequestHandler(requestSchema, handler) {
        const method = getMethodLiteral(requestSchema);
        this.assertRequestHandlerCapability(method);
        this._requestHandlers.set(method, (request, extra) => {
          const parsed = parseWithCompat(requestSchema, request);
          return Promise.resolve(handler(parsed, extra));
        });
      }
      /**
       * Removes the request handler for the given method.
       */
      removeRequestHandler(method) {
        this._requestHandlers.delete(method);
      }
      /**
       * Asserts that a request handler has not already been set for the given method, in preparation for a new one being automatically installed.
       */
      assertCanSetRequestHandler(method) {
        if (this._requestHandlers.has(method)) {
          throw new Error(`A request handler for ${method} already exists, which would be overridden`);
        }
      }
      /**
       * Registers a handler to invoke when this protocol object receives a notification with the given method.
       *
       * Note that this will replace any previous notification handler for the same method.
       */
      setNotificationHandler(notificationSchema, handler) {
        const method = getMethodLiteral(notificationSchema);
        this._notificationHandlers.set(method, (notification) => {
          const parsed = parseWithCompat(notificationSchema, notification);
          return Promise.resolve(handler(parsed));
        });
      }
      /**
       * Removes the notification handler for the given method.
       */
      removeNotificationHandler(method) {
        this._notificationHandlers.delete(method);
      }
      /**
       * Cleans up the progress handler associated with a task.
       * This should be called when a task reaches a terminal status.
       */
      _cleanupTaskProgressHandler(taskId) {
        const progressToken = this._taskProgressTokens.get(taskId);
        if (progressToken !== void 0) {
          this._progressHandlers.delete(progressToken);
          this._taskProgressTokens.delete(taskId);
        }
      }
      /**
       * Enqueues a task-related message for side-channel delivery via tasks/result.
       * @param taskId The task ID to associate the message with
       * @param message The message to enqueue
       * @param sessionId Optional session ID for binding the operation to a specific session
       * @throws Error if taskStore is not configured or if enqueue fails (e.g., queue overflow)
       *
       * Note: If enqueue fails, it's the TaskMessageQueue implementation's responsibility to handle
       * the error appropriately (e.g., by failing the task, logging, etc.). The Protocol layer
       * simply propagates the error.
       */
      async _enqueueTaskMessage(taskId, message, sessionId) {
        if (!this._taskStore || !this._taskMessageQueue) {
          throw new Error("Cannot enqueue task message: taskStore and taskMessageQueue are not configured");
        }
        const maxQueueSize = this._options?.maxTaskQueueSize;
        await this._taskMessageQueue.enqueue(taskId, message, sessionId, maxQueueSize);
      }
      /**
       * Clears the message queue for a task and rejects any pending request resolvers.
       * @param taskId The task ID whose queue should be cleared
       * @param sessionId Optional session ID for binding the operation to a specific session
       */
      async _clearTaskQueue(taskId, sessionId) {
        if (this._taskMessageQueue) {
          const messages = await this._taskMessageQueue.dequeueAll(taskId, sessionId);
          for (const message of messages) {
            if (message.type === "request" && isJSONRPCRequest(message.message)) {
              const requestId = message.message.id;
              const resolver = this._requestResolvers.get(requestId);
              if (resolver) {
                resolver(new McpError(ErrorCode.InternalError, "Task cancelled or completed"));
                this._requestResolvers.delete(requestId);
              } else {
                this._onerror(new Error(`Resolver missing for request ${requestId} during task ${taskId} cleanup`));
              }
            }
          }
        }
      }
      /**
       * Waits for a task update (new messages or status change) with abort signal support.
       * Uses polling to check for updates at the task's configured poll interval.
       * @param taskId The task ID to wait for
       * @param signal Abort signal to cancel the wait
       * @returns Promise that resolves when an update occurs or rejects if aborted
       */
      async _waitForTaskUpdate(taskId, signal) {
        let interval = this._options?.defaultTaskPollInterval ?? 1e3;
        try {
          const task = await this._taskStore?.getTask(taskId);
          if (task?.pollInterval) {
            interval = task.pollInterval;
          }
        } catch {
        }
        return new Promise((resolve, reject) => {
          if (signal.aborted) {
            reject(new McpError(ErrorCode.InvalidRequest, "Request cancelled"));
            return;
          }
          const timeoutId = setTimeout(resolve, interval);
          signal.addEventListener("abort", () => {
            clearTimeout(timeoutId);
            reject(new McpError(ErrorCode.InvalidRequest, "Request cancelled"));
          }, { once: true });
        });
      }
      requestTaskStore(request, sessionId) {
        const taskStore = this._taskStore;
        if (!taskStore) {
          throw new Error("No task store configured");
        }
        return {
          createTask: async (taskParams) => {
            if (!request) {
              throw new Error("No request provided");
            }
            return await taskStore.createTask(taskParams, request.id, {
              method: request.method,
              params: request.params
            }, sessionId);
          },
          getTask: async (taskId) => {
            const task = await taskStore.getTask(taskId, sessionId);
            if (!task) {
              throw new McpError(ErrorCode.InvalidParams, "Failed to retrieve task: Task not found");
            }
            return task;
          },
          storeTaskResult: async (taskId, status, result) => {
            await taskStore.storeTaskResult(taskId, status, result, sessionId);
            const task = await taskStore.getTask(taskId, sessionId);
            if (task) {
              const notification = TaskStatusNotificationSchema.parse({
                method: "notifications/tasks/status",
                params: task
              });
              await this.notification(notification);
              if (isTerminal(task.status)) {
                this._cleanupTaskProgressHandler(taskId);
              }
            }
          },
          getTaskResult: (taskId) => {
            return taskStore.getTaskResult(taskId, sessionId);
          },
          updateTaskStatus: async (taskId, status, statusMessage) => {
            const task = await taskStore.getTask(taskId, sessionId);
            if (!task) {
              throw new McpError(ErrorCode.InvalidParams, `Task "${taskId}" not found - it may have been cleaned up`);
            }
            if (isTerminal(task.status)) {
              throw new McpError(ErrorCode.InvalidParams, `Cannot update task "${taskId}" from terminal status "${task.status}" to "${status}". Terminal states (completed, failed, cancelled) cannot transition to other states.`);
            }
            await taskStore.updateTaskStatus(taskId, status, statusMessage, sessionId);
            const updatedTask = await taskStore.getTask(taskId, sessionId);
            if (updatedTask) {
              const notification = TaskStatusNotificationSchema.parse({
                method: "notifications/tasks/status",
                params: updatedTask
              });
              await this.notification(notification);
              if (isTerminal(updatedTask.status)) {
                this._cleanupTaskProgressHandler(taskId);
              }
            }
          },
          listTasks: (cursor) => {
            return taskStore.listTasks(cursor, sessionId);
          }
        };
      }
    };
  }
});

// node_modules/ajv/dist/compile/codegen/code.js
var require_code = __commonJS({
  "node_modules/ajv/dist/compile/codegen/code.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.regexpCode = exports.getEsmExportName = exports.getProperty = exports.safeStringify = exports.stringify = exports.strConcat = exports.addCodeArg = exports.str = exports._ = exports.nil = exports._Code = exports.Name = exports.IDENTIFIER = exports._CodeOrName = void 0;
    var _CodeOrName = class {
    };
    exports._CodeOrName = _CodeOrName;
    exports.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    var Name = class extends _CodeOrName {
      constructor(s) {
        super();
        if (!exports.IDENTIFIER.test(s))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = s;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return false;
      }
      get names() {
        return { [this.str]: 1 };
      }
    };
    exports.Name = Name;
    var _Code = class extends _CodeOrName {
      constructor(code2) {
        super();
        this._items = typeof code2 === "string" ? [code2] : code2;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return false;
        const item = this._items[0];
        return item === "" || item === '""';
      }
      get str() {
        var _a3;
        return (_a3 = this._str) !== null && _a3 !== void 0 ? _a3 : this._str = this._items.reduce((s, c) => `${s}${c}`, "");
      }
      get names() {
        var _a3;
        return (_a3 = this._names) !== null && _a3 !== void 0 ? _a3 : this._names = this._items.reduce((names, c) => {
          if (c instanceof Name)
            names[c.str] = (names[c.str] || 0) + 1;
          return names;
        }, {});
      }
    };
    exports._Code = _Code;
    exports.nil = new _Code("");
    function _(strs, ...args) {
      const code2 = [strs[0]];
      let i = 0;
      while (i < args.length) {
        addCodeArg(code2, args[i]);
        code2.push(strs[++i]);
      }
      return new _Code(code2);
    }
    exports._ = _;
    var plus = new _Code("+");
    function str(strs, ...args) {
      const expr = [safeStringify(strs[0])];
      let i = 0;
      while (i < args.length) {
        expr.push(plus);
        addCodeArg(expr, args[i]);
        expr.push(plus, safeStringify(strs[++i]));
      }
      optimize(expr);
      return new _Code(expr);
    }
    exports.str = str;
    function addCodeArg(code2, arg) {
      if (arg instanceof _Code)
        code2.push(...arg._items);
      else if (arg instanceof Name)
        code2.push(arg);
      else
        code2.push(interpolate(arg));
    }
    exports.addCodeArg = addCodeArg;
    function optimize(expr) {
      let i = 1;
      while (i < expr.length - 1) {
        if (expr[i] === plus) {
          const res = mergeExprItems(expr[i - 1], expr[i + 1]);
          if (res !== void 0) {
            expr.splice(i - 1, 3, res);
            continue;
          }
          expr[i++] = "+";
        }
        i++;
      }
    }
    function mergeExprItems(a, b) {
      if (b === '""')
        return a;
      if (a === '""')
        return b;
      if (typeof a == "string") {
        if (b instanceof Name || a[a.length - 1] !== '"')
          return;
        if (typeof b != "string")
          return `${a.slice(0, -1)}${b}"`;
        if (b[0] === '"')
          return a.slice(0, -1) + b.slice(1);
        return;
      }
      if (typeof b == "string" && b[0] === '"' && !(a instanceof Name))
        return `"${a}${b.slice(1)}`;
      return;
    }
    function strConcat(c1, c2) {
      return c2.emptyStr() ? c1 : c1.emptyStr() ? c2 : str`${c1}${c2}`;
    }
    exports.strConcat = strConcat;
    function interpolate(x) {
      return typeof x == "number" || typeof x == "boolean" || x === null ? x : safeStringify(Array.isArray(x) ? x.join(",") : x);
    }
    function stringify(x) {
      return new _Code(safeStringify(x));
    }
    exports.stringify = stringify;
    function safeStringify(x) {
      return JSON.stringify(x).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    exports.safeStringify = safeStringify;
    function getProperty(key) {
      return typeof key == "string" && exports.IDENTIFIER.test(key) ? new _Code(`.${key}`) : _`[${key}]`;
    }
    exports.getProperty = getProperty;
    function getEsmExportName(key) {
      if (typeof key == "string" && exports.IDENTIFIER.test(key)) {
        return new _Code(`${key}`);
      }
      throw new Error(`CodeGen: invalid export name: ${key}, use explicit $id name mapping`);
    }
    exports.getEsmExportName = getEsmExportName;
    function regexpCode(rx) {
      return new _Code(rx.toString());
    }
    exports.regexpCode = regexpCode;
  }
});

// node_modules/ajv/dist/compile/codegen/scope.js
var require_scope = __commonJS({
  "node_modules/ajv/dist/compile/codegen/scope.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ValueScope = exports.ValueScopeName = exports.Scope = exports.varKinds = exports.UsedValueState = void 0;
    var code_1 = require_code();
    var ValueError = class extends Error {
      constructor(name) {
        super(`CodeGen: "code" for ${name} not defined`);
        this.value = name.value;
      }
    };
    var UsedValueState;
    (function(UsedValueState2) {
      UsedValueState2[UsedValueState2["Started"] = 0] = "Started";
      UsedValueState2[UsedValueState2["Completed"] = 1] = "Completed";
    })(UsedValueState || (exports.UsedValueState = UsedValueState = {}));
    exports.varKinds = {
      const: new code_1.Name("const"),
      let: new code_1.Name("let"),
      var: new code_1.Name("var")
    };
    var Scope = class {
      constructor({ prefixes, parent } = {}) {
        this._names = {};
        this._prefixes = prefixes;
        this._parent = parent;
      }
      toName(nameOrPrefix) {
        return nameOrPrefix instanceof code_1.Name ? nameOrPrefix : this.name(nameOrPrefix);
      }
      name(prefix) {
        return new code_1.Name(this._newName(prefix));
      }
      _newName(prefix) {
        const ng = this._names[prefix] || this._nameGroup(prefix);
        return `${prefix}${ng.index++}`;
      }
      _nameGroup(prefix) {
        var _a3, _b;
        if (((_b = (_a3 = this._parent) === null || _a3 === void 0 ? void 0 : _a3._prefixes) === null || _b === void 0 ? void 0 : _b.has(prefix)) || this._prefixes && !this._prefixes.has(prefix)) {
          throw new Error(`CodeGen: prefix "${prefix}" is not allowed in this scope`);
        }
        return this._names[prefix] = { prefix, index: 0 };
      }
    };
    exports.Scope = Scope;
    var ValueScopeName = class extends code_1.Name {
      constructor(prefix, nameStr) {
        super(nameStr);
        this.prefix = prefix;
      }
      setValue(value, { property, itemIndex }) {
        this.value = value;
        this.scopePath = (0, code_1._)`.${new code_1.Name(property)}[${itemIndex}]`;
      }
    };
    exports.ValueScopeName = ValueScopeName;
    var line = (0, code_1._)`\n`;
    var ValueScope = class extends Scope {
      constructor(opts) {
        super(opts);
        this._values = {};
        this._scope = opts.scope;
        this.opts = { ...opts, _n: opts.lines ? line : code_1.nil };
      }
      get() {
        return this._scope;
      }
      name(prefix) {
        return new ValueScopeName(prefix, this._newName(prefix));
      }
      value(nameOrPrefix, value) {
        var _a3;
        if (value.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const name = this.toName(nameOrPrefix);
        const { prefix } = name;
        const valueKey = (_a3 = value.key) !== null && _a3 !== void 0 ? _a3 : value.ref;
        let vs = this._values[prefix];
        if (vs) {
          const _name = vs.get(valueKey);
          if (_name)
            return _name;
        } else {
          vs = this._values[prefix] = /* @__PURE__ */ new Map();
        }
        vs.set(valueKey, name);
        const s = this._scope[prefix] || (this._scope[prefix] = []);
        const itemIndex = s.length;
        s[itemIndex] = value.ref;
        name.setValue(value, { property: prefix, itemIndex });
        return name;
      }
      getValue(prefix, keyOrRef) {
        const vs = this._values[prefix];
        if (!vs)
          return;
        return vs.get(keyOrRef);
      }
      scopeRefs(scopeName, values = this._values) {
        return this._reduceValues(values, (name) => {
          if (name.scopePath === void 0)
            throw new Error(`CodeGen: name "${name}" has no value`);
          return (0, code_1._)`${scopeName}${name.scopePath}`;
        });
      }
      scopeCode(values = this._values, usedValues, getCode) {
        return this._reduceValues(values, (name) => {
          if (name.value === void 0)
            throw new Error(`CodeGen: name "${name}" has no value`);
          return name.value.code;
        }, usedValues, getCode);
      }
      _reduceValues(values, valueCode, usedValues = {}, getCode) {
        let code2 = code_1.nil;
        for (const prefix in values) {
          const vs = values[prefix];
          if (!vs)
            continue;
          const nameSet = usedValues[prefix] = usedValues[prefix] || /* @__PURE__ */ new Map();
          vs.forEach((name) => {
            if (nameSet.has(name))
              return;
            nameSet.set(name, UsedValueState.Started);
            let c = valueCode(name);
            if (c) {
              const def = this.opts.es5 ? exports.varKinds.var : exports.varKinds.const;
              code2 = (0, code_1._)`${code2}${def} ${name} = ${c};${this.opts._n}`;
            } else if (c = getCode === null || getCode === void 0 ? void 0 : getCode(name)) {
              code2 = (0, code_1._)`${code2}${c}${this.opts._n}`;
            } else {
              throw new ValueError(name);
            }
            nameSet.set(name, UsedValueState.Completed);
          });
        }
        return code2;
      }
    };
    exports.ValueScope = ValueScope;
  }
});

// node_modules/ajv/dist/compile/codegen/index.js
var require_codegen = __commonJS({
  "node_modules/ajv/dist/compile/codegen/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.or = exports.and = exports.not = exports.CodeGen = exports.operators = exports.varKinds = exports.ValueScopeName = exports.ValueScope = exports.Scope = exports.Name = exports.regexpCode = exports.stringify = exports.getProperty = exports.nil = exports.strConcat = exports.str = exports._ = void 0;
    var code_1 = require_code();
    var scope_1 = require_scope();
    var code_2 = require_code();
    Object.defineProperty(exports, "_", { enumerable: true, get: function() {
      return code_2._;
    } });
    Object.defineProperty(exports, "str", { enumerable: true, get: function() {
      return code_2.str;
    } });
    Object.defineProperty(exports, "strConcat", { enumerable: true, get: function() {
      return code_2.strConcat;
    } });
    Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
      return code_2.nil;
    } });
    Object.defineProperty(exports, "getProperty", { enumerable: true, get: function() {
      return code_2.getProperty;
    } });
    Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
      return code_2.stringify;
    } });
    Object.defineProperty(exports, "regexpCode", { enumerable: true, get: function() {
      return code_2.regexpCode;
    } });
    Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
      return code_2.Name;
    } });
    var scope_2 = require_scope();
    Object.defineProperty(exports, "Scope", { enumerable: true, get: function() {
      return scope_2.Scope;
    } });
    Object.defineProperty(exports, "ValueScope", { enumerable: true, get: function() {
      return scope_2.ValueScope;
    } });
    Object.defineProperty(exports, "ValueScopeName", { enumerable: true, get: function() {
      return scope_2.ValueScopeName;
    } });
    Object.defineProperty(exports, "varKinds", { enumerable: true, get: function() {
      return scope_2.varKinds;
    } });
    exports.operators = {
      GT: new code_1._Code(">"),
      GTE: new code_1._Code(">="),
      LT: new code_1._Code("<"),
      LTE: new code_1._Code("<="),
      EQ: new code_1._Code("==="),
      NEQ: new code_1._Code("!=="),
      NOT: new code_1._Code("!"),
      OR: new code_1._Code("||"),
      AND: new code_1._Code("&&"),
      ADD: new code_1._Code("+")
    };
    var Node = class {
      optimizeNodes() {
        return this;
      }
      optimizeNames(_names, _constants) {
        return this;
      }
    };
    var Def = class extends Node {
      constructor(varKind, name, rhs) {
        super();
        this.varKind = varKind;
        this.name = name;
        this.rhs = rhs;
      }
      render({ es5, _n }) {
        const varKind = es5 ? scope_1.varKinds.var : this.varKind;
        const rhs = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${varKind} ${this.name}${rhs};` + _n;
      }
      optimizeNames(names, constants2) {
        if (!names[this.name.str])
          return;
        if (this.rhs)
          this.rhs = optimizeExpr(this.rhs, names, constants2);
        return this;
      }
      get names() {
        return this.rhs instanceof code_1._CodeOrName ? this.rhs.names : {};
      }
    };
    var Assign = class extends Node {
      constructor(lhs, rhs, sideEffects) {
        super();
        this.lhs = lhs;
        this.rhs = rhs;
        this.sideEffects = sideEffects;
      }
      render({ _n }) {
        return `${this.lhs} = ${this.rhs};` + _n;
      }
      optimizeNames(names, constants2) {
        if (this.lhs instanceof code_1.Name && !names[this.lhs.str] && !this.sideEffects)
          return;
        this.rhs = optimizeExpr(this.rhs, names, constants2);
        return this;
      }
      get names() {
        const names = this.lhs instanceof code_1.Name ? {} : { ...this.lhs.names };
        return addExprNames(names, this.rhs);
      }
    };
    var AssignOp = class extends Assign {
      constructor(lhs, op, rhs, sideEffects) {
        super(lhs, rhs, sideEffects);
        this.op = op;
      }
      render({ _n }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + _n;
      }
    };
    var Label = class extends Node {
      constructor(label) {
        super();
        this.label = label;
        this.names = {};
      }
      render({ _n }) {
        return `${this.label}:` + _n;
      }
    };
    var Break = class extends Node {
      constructor(label) {
        super();
        this.label = label;
        this.names = {};
      }
      render({ _n }) {
        const label = this.label ? ` ${this.label}` : "";
        return `break${label};` + _n;
      }
    };
    var Throw = class extends Node {
      constructor(error2) {
        super();
        this.error = error2;
      }
      render({ _n }) {
        return `throw ${this.error};` + _n;
      }
      get names() {
        return this.error.names;
      }
    };
    var AnyCode = class extends Node {
      constructor(code2) {
        super();
        this.code = code2;
      }
      render({ _n }) {
        return `${this.code};` + _n;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(names, constants2) {
        this.code = optimizeExpr(this.code, names, constants2);
        return this;
      }
      get names() {
        return this.code instanceof code_1._CodeOrName ? this.code.names : {};
      }
    };
    var ParentNode = class extends Node {
      constructor(nodes = []) {
        super();
        this.nodes = nodes;
      }
      render(opts) {
        return this.nodes.reduce((code2, n) => code2 + n.render(opts), "");
      }
      optimizeNodes() {
        const { nodes } = this;
        let i = nodes.length;
        while (i--) {
          const n = nodes[i].optimizeNodes();
          if (Array.isArray(n))
            nodes.splice(i, 1, ...n);
          else if (n)
            nodes[i] = n;
          else
            nodes.splice(i, 1);
        }
        return nodes.length > 0 ? this : void 0;
      }
      optimizeNames(names, constants2) {
        const { nodes } = this;
        let i = nodes.length;
        while (i--) {
          const n = nodes[i];
          if (n.optimizeNames(names, constants2))
            continue;
          subtractNames(names, n.names);
          nodes.splice(i, 1);
        }
        return nodes.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((names, n) => addNames(names, n.names), {});
      }
    };
    var BlockNode = class extends ParentNode {
      render(opts) {
        return "{" + opts._n + super.render(opts) + "}" + opts._n;
      }
    };
    var Root = class extends ParentNode {
    };
    var Else = class extends BlockNode {
    };
    Else.kind = "else";
    var If = class _If extends BlockNode {
      constructor(condition, nodes) {
        super(nodes);
        this.condition = condition;
      }
      render(opts) {
        let code2 = `if(${this.condition})` + super.render(opts);
        if (this.else)
          code2 += "else " + this.else.render(opts);
        return code2;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const cond = this.condition;
        if (cond === true)
          return this.nodes;
        let e = this.else;
        if (e) {
          const ns = e.optimizeNodes();
          e = this.else = Array.isArray(ns) ? new Else(ns) : ns;
        }
        if (e) {
          if (cond === false)
            return e instanceof _If ? e : e.nodes;
          if (this.nodes.length)
            return this;
          return new _If(not(cond), e instanceof _If ? [e] : e.nodes);
        }
        if (cond === false || !this.nodes.length)
          return void 0;
        return this;
      }
      optimizeNames(names, constants2) {
        var _a3;
        this.else = (_a3 = this.else) === null || _a3 === void 0 ? void 0 : _a3.optimizeNames(names, constants2);
        if (!(super.optimizeNames(names, constants2) || this.else))
          return;
        this.condition = optimizeExpr(this.condition, names, constants2);
        return this;
      }
      get names() {
        const names = super.names;
        addExprNames(names, this.condition);
        if (this.else)
          addNames(names, this.else.names);
        return names;
      }
    };
    If.kind = "if";
    var For = class extends BlockNode {
    };
    For.kind = "for";
    var ForLoop = class extends For {
      constructor(iteration) {
        super();
        this.iteration = iteration;
      }
      render(opts) {
        return `for(${this.iteration})` + super.render(opts);
      }
      optimizeNames(names, constants2) {
        if (!super.optimizeNames(names, constants2))
          return;
        this.iteration = optimizeExpr(this.iteration, names, constants2);
        return this;
      }
      get names() {
        return addNames(super.names, this.iteration.names);
      }
    };
    var ForRange = class extends For {
      constructor(varKind, name, from, to) {
        super();
        this.varKind = varKind;
        this.name = name;
        this.from = from;
        this.to = to;
      }
      render(opts) {
        const varKind = opts.es5 ? scope_1.varKinds.var : this.varKind;
        const { name, from, to } = this;
        return `for(${varKind} ${name}=${from}; ${name}<${to}; ${name}++)` + super.render(opts);
      }
      get names() {
        const names = addExprNames(super.names, this.from);
        return addExprNames(names, this.to);
      }
    };
    var ForIter = class extends For {
      constructor(loop, varKind, name, iterable) {
        super();
        this.loop = loop;
        this.varKind = varKind;
        this.name = name;
        this.iterable = iterable;
      }
      render(opts) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(opts);
      }
      optimizeNames(names, constants2) {
        if (!super.optimizeNames(names, constants2))
          return;
        this.iterable = optimizeExpr(this.iterable, names, constants2);
        return this;
      }
      get names() {
        return addNames(super.names, this.iterable.names);
      }
    };
    var Func = class extends BlockNode {
      constructor(name, args, async) {
        super();
        this.name = name;
        this.args = args;
        this.async = async;
      }
      render(opts) {
        const _async = this.async ? "async " : "";
        return `${_async}function ${this.name}(${this.args})` + super.render(opts);
      }
    };
    Func.kind = "func";
    var Return = class extends ParentNode {
      render(opts) {
        return "return " + super.render(opts);
      }
    };
    Return.kind = "return";
    var Try = class extends BlockNode {
      render(opts) {
        let code2 = "try" + super.render(opts);
        if (this.catch)
          code2 += this.catch.render(opts);
        if (this.finally)
          code2 += this.finally.render(opts);
        return code2;
      }
      optimizeNodes() {
        var _a3, _b;
        super.optimizeNodes();
        (_a3 = this.catch) === null || _a3 === void 0 ? void 0 : _a3.optimizeNodes();
        (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNodes();
        return this;
      }
      optimizeNames(names, constants2) {
        var _a3, _b;
        super.optimizeNames(names, constants2);
        (_a3 = this.catch) === null || _a3 === void 0 ? void 0 : _a3.optimizeNames(names, constants2);
        (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNames(names, constants2);
        return this;
      }
      get names() {
        const names = super.names;
        if (this.catch)
          addNames(names, this.catch.names);
        if (this.finally)
          addNames(names, this.finally.names);
        return names;
      }
    };
    var Catch = class extends BlockNode {
      constructor(error2) {
        super();
        this.error = error2;
      }
      render(opts) {
        return `catch(${this.error})` + super.render(opts);
      }
    };
    Catch.kind = "catch";
    var Finally = class extends BlockNode {
      render(opts) {
        return "finally" + super.render(opts);
      }
    };
    Finally.kind = "finally";
    var CodeGen = class {
      constructor(extScope, opts = {}) {
        this._values = {};
        this._blockStarts = [];
        this._constants = {};
        this.opts = { ...opts, _n: opts.lines ? "\n" : "" };
        this._extScope = extScope;
        this._scope = new scope_1.Scope({ parent: extScope });
        this._nodes = [new Root()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(prefix) {
        return this._scope.name(prefix);
      }
      // reserves unique name in the external scope
      scopeName(prefix) {
        return this._extScope.name(prefix);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(prefixOrName, value) {
        const name = this._extScope.value(prefixOrName, value);
        const vs = this._values[name.prefix] || (this._values[name.prefix] = /* @__PURE__ */ new Set());
        vs.add(name);
        return name;
      }
      getScopeValue(prefix, keyOrRef) {
        return this._extScope.getValue(prefix, keyOrRef);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(scopeName) {
        return this._extScope.scopeRefs(scopeName, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(varKind, nameOrPrefix, rhs, constant) {
        const name = this._scope.toName(nameOrPrefix);
        if (rhs !== void 0 && constant)
          this._constants[name.str] = rhs;
        this._leafNode(new Def(varKind, name, rhs));
        return name;
      }
      // `const` declaration (`var` in es5 mode)
      const(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.const, nameOrPrefix, rhs, _constant);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.let, nameOrPrefix, rhs, _constant);
      }
      // `var` declaration with optional assignment
      var(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.var, nameOrPrefix, rhs, _constant);
      }
      // assignment code
      assign(lhs, rhs, sideEffects) {
        return this._leafNode(new Assign(lhs, rhs, sideEffects));
      }
      // `+=` code
      add(lhs, rhs) {
        return this._leafNode(new AssignOp(lhs, exports.operators.ADD, rhs));
      }
      // appends passed SafeExpr to code or executes Block
      code(c) {
        if (typeof c == "function")
          c();
        else if (c !== code_1.nil)
          this._leafNode(new AnyCode(c));
        return this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...keyValues) {
        const code2 = ["{"];
        for (const [key, value] of keyValues) {
          if (code2.length > 1)
            code2.push(",");
          code2.push(key);
          if (key !== value || this.opts.es5) {
            code2.push(":");
            (0, code_1.addCodeArg)(code2, value);
          }
        }
        code2.push("}");
        return new code_1._Code(code2);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(condition, thenBody, elseBody) {
        this._blockNode(new If(condition));
        if (thenBody && elseBody) {
          this.code(thenBody).else().code(elseBody).endIf();
        } else if (thenBody) {
          this.code(thenBody).endIf();
        } else if (elseBody) {
          throw new Error('CodeGen: "else" body without "then" body');
        }
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(condition) {
        return this._elseNode(new If(condition));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new Else());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(If, Else);
      }
      _for(node, forBody) {
        this._blockNode(node);
        if (forBody)
          this.code(forBody).endFor();
        return this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(iteration, forBody) {
        return this._for(new ForLoop(iteration), forBody);
      }
      // `for` statement for a range of values
      forRange(nameOrPrefix, from, to, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.let) {
        const name = this._scope.toName(nameOrPrefix);
        return this._for(new ForRange(varKind, name, from, to), () => forBody(name));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(nameOrPrefix, iterable, forBody, varKind = scope_1.varKinds.const) {
        const name = this._scope.toName(nameOrPrefix);
        if (this.opts.es5) {
          const arr = iterable instanceof code_1.Name ? iterable : this.var("_arr", iterable);
          return this.forRange("_i", 0, (0, code_1._)`${arr}.length`, (i) => {
            this.var(name, (0, code_1._)`${arr}[${i}]`);
            forBody(name);
          });
        }
        return this._for(new ForIter("of", varKind, name, iterable), () => forBody(name));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(nameOrPrefix, obj, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.const) {
        if (this.opts.ownProperties) {
          return this.forOf(nameOrPrefix, (0, code_1._)`Object.keys(${obj})`, forBody);
        }
        const name = this._scope.toName(nameOrPrefix);
        return this._for(new ForIter("in", varKind, name, obj), () => forBody(name));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(For);
      }
      // `label` statement
      label(label) {
        return this._leafNode(new Label(label));
      }
      // `break` statement
      break(label) {
        return this._leafNode(new Break(label));
      }
      // `return` statement
      return(value) {
        const node = new Return();
        this._blockNode(node);
        this.code(value);
        if (node.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(Return);
      }
      // `try` statement
      try(tryBody, catchCode, finallyCode) {
        if (!catchCode && !finallyCode)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const node = new Try();
        this._blockNode(node);
        this.code(tryBody);
        if (catchCode) {
          const error2 = this.name("e");
          this._currNode = node.catch = new Catch(error2);
          catchCode(error2);
        }
        if (finallyCode) {
          this._currNode = node.finally = new Finally();
          this.code(finallyCode);
        }
        return this._endBlockNode(Catch, Finally);
      }
      // `throw` statement
      throw(error2) {
        return this._leafNode(new Throw(error2));
      }
      // start self-balancing block
      block(body, nodeCount) {
        this._blockStarts.push(this._nodes.length);
        if (body)
          this.code(body).endBlock(nodeCount);
        return this;
      }
      // end the current self-balancing block
      endBlock(nodeCount) {
        const len = this._blockStarts.pop();
        if (len === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const toClose = this._nodes.length - len;
        if (toClose < 0 || nodeCount !== void 0 && toClose !== nodeCount) {
          throw new Error(`CodeGen: wrong number of nodes: ${toClose} vs ${nodeCount} expected`);
        }
        this._nodes.length = len;
        return this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(name, args = code_1.nil, async, funcBody) {
        this._blockNode(new Func(name, args, async));
        if (funcBody)
          this.code(funcBody).endFunc();
        return this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(Func);
      }
      optimize(n = 1) {
        while (n-- > 0) {
          this._root.optimizeNodes();
          this._root.optimizeNames(this._root.names, this._constants);
        }
      }
      _leafNode(node) {
        this._currNode.nodes.push(node);
        return this;
      }
      _blockNode(node) {
        this._currNode.nodes.push(node);
        this._nodes.push(node);
      }
      _endBlockNode(N1, N2) {
        const n = this._currNode;
        if (n instanceof N1 || N2 && n instanceof N2) {
          this._nodes.pop();
          return this;
        }
        throw new Error(`CodeGen: not in block "${N2 ? `${N1.kind}/${N2.kind}` : N1.kind}"`);
      }
      _elseNode(node) {
        const n = this._currNode;
        if (!(n instanceof If)) {
          throw new Error('CodeGen: "else" without "if"');
        }
        this._currNode = n.else = node;
        return this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const ns = this._nodes;
        return ns[ns.length - 1];
      }
      set _currNode(node) {
        const ns = this._nodes;
        ns[ns.length - 1] = node;
      }
    };
    exports.CodeGen = CodeGen;
    function addNames(names, from) {
      for (const n in from)
        names[n] = (names[n] || 0) + (from[n] || 0);
      return names;
    }
    function addExprNames(names, from) {
      return from instanceof code_1._CodeOrName ? addNames(names, from.names) : names;
    }
    function optimizeExpr(expr, names, constants2) {
      if (expr instanceof code_1.Name)
        return replaceName(expr);
      if (!canOptimize(expr))
        return expr;
      return new code_1._Code(expr._items.reduce((items, c) => {
        if (c instanceof code_1.Name)
          c = replaceName(c);
        if (c instanceof code_1._Code)
          items.push(...c._items);
        else
          items.push(c);
        return items;
      }, []));
      function replaceName(n) {
        const c = constants2[n.str];
        if (c === void 0 || names[n.str] !== 1)
          return n;
        delete names[n.str];
        return c;
      }
      function canOptimize(e) {
        return e instanceof code_1._Code && e._items.some((c) => c instanceof code_1.Name && names[c.str] === 1 && constants2[c.str] !== void 0);
      }
    }
    function subtractNames(names, from) {
      for (const n in from)
        names[n] = (names[n] || 0) - (from[n] || 0);
    }
    function not(x) {
      return typeof x == "boolean" || typeof x == "number" || x === null ? !x : (0, code_1._)`!${par(x)}`;
    }
    exports.not = not;
    var andCode = mappend(exports.operators.AND);
    function and(...args) {
      return args.reduce(andCode);
    }
    exports.and = and;
    var orCode = mappend(exports.operators.OR);
    function or(...args) {
      return args.reduce(orCode);
    }
    exports.or = or;
    function mappend(op) {
      return (x, y) => x === code_1.nil ? y : y === code_1.nil ? x : (0, code_1._)`${par(x)} ${op} ${par(y)}`;
    }
    function par(x) {
      return x instanceof code_1.Name ? x : (0, code_1._)`(${x})`;
    }
  }
});

// node_modules/ajv/dist/compile/util.js
var require_util = __commonJS({
  "node_modules/ajv/dist/compile/util.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkStrictMode = exports.getErrorPath = exports.Type = exports.useFunc = exports.setEvaluated = exports.evaluatedPropsToName = exports.mergeEvaluated = exports.eachItem = exports.unescapeJsonPointer = exports.escapeJsonPointer = exports.escapeFragment = exports.unescapeFragment = exports.schemaRefOrVal = exports.schemaHasRulesButRef = exports.schemaHasRules = exports.checkUnknownRules = exports.alwaysValidSchema = exports.toHash = void 0;
    var codegen_1 = require_codegen();
    var code_1 = require_code();
    function toHash(arr) {
      const hash = {};
      for (const item of arr)
        hash[item] = true;
      return hash;
    }
    exports.toHash = toHash;
    function alwaysValidSchema(it, schema) {
      if (typeof schema == "boolean")
        return schema;
      if (Object.keys(schema).length === 0)
        return true;
      checkUnknownRules(it, schema);
      return !schemaHasRules(schema, it.self.RULES.all);
    }
    exports.alwaysValidSchema = alwaysValidSchema;
    function checkUnknownRules(it, schema = it.schema) {
      const { opts, self } = it;
      if (!opts.strictSchema)
        return;
      if (typeof schema === "boolean")
        return;
      const rules = self.RULES.keywords;
      for (const key in schema) {
        if (!rules[key])
          checkStrictMode(it, `unknown keyword: "${key}"`);
      }
    }
    exports.checkUnknownRules = checkUnknownRules;
    function schemaHasRules(schema, rules) {
      if (typeof schema == "boolean")
        return !schema;
      for (const key in schema)
        if (rules[key])
          return true;
      return false;
    }
    exports.schemaHasRules = schemaHasRules;
    function schemaHasRulesButRef(schema, RULES) {
      if (typeof schema == "boolean")
        return !schema;
      for (const key in schema)
        if (key !== "$ref" && RULES.all[key])
          return true;
      return false;
    }
    exports.schemaHasRulesButRef = schemaHasRulesButRef;
    function schemaRefOrVal({ topSchemaRef, schemaPath }, schema, keyword, $data) {
      if (!$data) {
        if (typeof schema == "number" || typeof schema == "boolean")
          return schema;
        if (typeof schema == "string")
          return (0, codegen_1._)`${schema}`;
      }
      return (0, codegen_1._)`${topSchemaRef}${schemaPath}${(0, codegen_1.getProperty)(keyword)}`;
    }
    exports.schemaRefOrVal = schemaRefOrVal;
    function unescapeFragment(str) {
      return unescapeJsonPointer(decodeURIComponent(str));
    }
    exports.unescapeFragment = unescapeFragment;
    function escapeFragment(str) {
      return encodeURIComponent(escapeJsonPointer(str));
    }
    exports.escapeFragment = escapeFragment;
    function escapeJsonPointer(str) {
      if (typeof str == "number")
        return `${str}`;
      return str.replace(/~/g, "~0").replace(/\//g, "~1");
    }
    exports.escapeJsonPointer = escapeJsonPointer;
    function unescapeJsonPointer(str) {
      return str.replace(/~1/g, "/").replace(/~0/g, "~");
    }
    exports.unescapeJsonPointer = unescapeJsonPointer;
    function eachItem(xs, f) {
      if (Array.isArray(xs)) {
        for (const x of xs)
          f(x);
      } else {
        f(xs);
      }
    }
    exports.eachItem = eachItem;
    function makeMergeEvaluated({ mergeNames, mergeToName, mergeValues: mergeValues2, resultToName }) {
      return (gen, from, to, toName) => {
        const res = to === void 0 ? from : to instanceof codegen_1.Name ? (from instanceof codegen_1.Name ? mergeNames(gen, from, to) : mergeToName(gen, from, to), to) : from instanceof codegen_1.Name ? (mergeToName(gen, to, from), from) : mergeValues2(from, to);
        return toName === codegen_1.Name && !(res instanceof codegen_1.Name) ? resultToName(gen, res) : res;
      };
    }
    exports.mergeEvaluated = {
      props: makeMergeEvaluated({
        mergeNames: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true && ${from} !== undefined`, () => {
          gen.if((0, codegen_1._)`${from} === true`, () => gen.assign(to, true), () => gen.assign(to, (0, codegen_1._)`${to} || {}`).code((0, codegen_1._)`Object.assign(${to}, ${from})`));
        }),
        mergeToName: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true`, () => {
          if (from === true) {
            gen.assign(to, true);
          } else {
            gen.assign(to, (0, codegen_1._)`${to} || {}`);
            setEvaluated(gen, to, from);
          }
        }),
        mergeValues: (from, to) => from === true ? true : { ...from, ...to },
        resultToName: evaluatedPropsToName
      }),
      items: makeMergeEvaluated({
        mergeNames: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true && ${from} !== undefined`, () => gen.assign(to, (0, codegen_1._)`${from} === true ? true : ${to} > ${from} ? ${to} : ${from}`)),
        mergeToName: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true`, () => gen.assign(to, from === true ? true : (0, codegen_1._)`${to} > ${from} ? ${to} : ${from}`)),
        mergeValues: (from, to) => from === true ? true : Math.max(from, to),
        resultToName: (gen, items) => gen.var("items", items)
      })
    };
    function evaluatedPropsToName(gen, ps) {
      if (ps === true)
        return gen.var("props", true);
      const props = gen.var("props", (0, codegen_1._)`{}`);
      if (ps !== void 0)
        setEvaluated(gen, props, ps);
      return props;
    }
    exports.evaluatedPropsToName = evaluatedPropsToName;
    function setEvaluated(gen, props, ps) {
      Object.keys(ps).forEach((p) => gen.assign((0, codegen_1._)`${props}${(0, codegen_1.getProperty)(p)}`, true));
    }
    exports.setEvaluated = setEvaluated;
    var snippets = {};
    function useFunc(gen, f) {
      return gen.scopeValue("func", {
        ref: f,
        code: snippets[f.code] || (snippets[f.code] = new code_1._Code(f.code))
      });
    }
    exports.useFunc = useFunc;
    var Type;
    (function(Type2) {
      Type2[Type2["Num"] = 0] = "Num";
      Type2[Type2["Str"] = 1] = "Str";
    })(Type || (exports.Type = Type = {}));
    function getErrorPath(dataProp, dataPropType, jsPropertySyntax) {
      if (dataProp instanceof codegen_1.Name) {
        const isNumber = dataPropType === Type.Num;
        return jsPropertySyntax ? isNumber ? (0, codegen_1._)`"[" + ${dataProp} + "]"` : (0, codegen_1._)`"['" + ${dataProp} + "']"` : isNumber ? (0, codegen_1._)`"/" + ${dataProp}` : (0, codegen_1._)`"/" + ${dataProp}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
      }
      return jsPropertySyntax ? (0, codegen_1.getProperty)(dataProp).toString() : "/" + escapeJsonPointer(dataProp);
    }
    exports.getErrorPath = getErrorPath;
    function checkStrictMode(it, msg, mode = it.opts.strictSchema) {
      if (!mode)
        return;
      msg = `strict mode: ${msg}`;
      if (mode === true)
        throw new Error(msg);
      it.self.logger.warn(msg);
    }
    exports.checkStrictMode = checkStrictMode;
  }
});

// node_modules/ajv/dist/compile/names.js
var require_names = __commonJS({
  "node_modules/ajv/dist/compile/names.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var names = {
      // validation function arguments
      data: new codegen_1.Name("data"),
      // data passed to validation function
      // args passed from referencing schema
      valCxt: new codegen_1.Name("valCxt"),
      // validation/data context - should not be used directly, it is destructured to the names below
      instancePath: new codegen_1.Name("instancePath"),
      parentData: new codegen_1.Name("parentData"),
      parentDataProperty: new codegen_1.Name("parentDataProperty"),
      rootData: new codegen_1.Name("rootData"),
      // root data - same as the data passed to the first/top validation function
      dynamicAnchors: new codegen_1.Name("dynamicAnchors"),
      // used to support recursiveRef and dynamicRef
      // function scoped variables
      vErrors: new codegen_1.Name("vErrors"),
      // null or array of validation errors
      errors: new codegen_1.Name("errors"),
      // counter of validation errors
      this: new codegen_1.Name("this"),
      // "globals"
      self: new codegen_1.Name("self"),
      scope: new codegen_1.Name("scope"),
      // JTD serialize/parse name for JSON string and position
      json: new codegen_1.Name("json"),
      jsonPos: new codegen_1.Name("jsonPos"),
      jsonLen: new codegen_1.Name("jsonLen"),
      jsonPart: new codegen_1.Name("jsonPart")
    };
    exports.default = names;
  }
});

// node_modules/ajv/dist/compile/errors.js
var require_errors = __commonJS({
  "node_modules/ajv/dist/compile/errors.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extendErrors = exports.resetErrorsCount = exports.reportExtraError = exports.reportError = exports.keyword$DataError = exports.keywordError = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var names_1 = require_names();
    exports.keywordError = {
      message: ({ keyword }) => (0, codegen_1.str)`must pass "${keyword}" keyword validation`
    };
    exports.keyword$DataError = {
      message: ({ keyword, schemaType }) => schemaType ? (0, codegen_1.str)`"${keyword}" keyword must be ${schemaType} ($data)` : (0, codegen_1.str)`"${keyword}" keyword is invalid ($data)`
    };
    function reportError(cxt, error2 = exports.keywordError, errorPaths, overrideAllErrors) {
      const { it } = cxt;
      const { gen, compositeRule, allErrors } = it;
      const errObj = errorObjectCode(cxt, error2, errorPaths);
      if (overrideAllErrors !== null && overrideAllErrors !== void 0 ? overrideAllErrors : compositeRule || allErrors) {
        addError(gen, errObj);
      } else {
        returnErrors(it, (0, codegen_1._)`[${errObj}]`);
      }
    }
    exports.reportError = reportError;
    function reportExtraError(cxt, error2 = exports.keywordError, errorPaths) {
      const { it } = cxt;
      const { gen, compositeRule, allErrors } = it;
      const errObj = errorObjectCode(cxt, error2, errorPaths);
      addError(gen, errObj);
      if (!(compositeRule || allErrors)) {
        returnErrors(it, names_1.default.vErrors);
      }
    }
    exports.reportExtraError = reportExtraError;
    function resetErrorsCount(gen, errsCount) {
      gen.assign(names_1.default.errors, errsCount);
      gen.if((0, codegen_1._)`${names_1.default.vErrors} !== null`, () => gen.if(errsCount, () => gen.assign((0, codegen_1._)`${names_1.default.vErrors}.length`, errsCount), () => gen.assign(names_1.default.vErrors, null)));
    }
    exports.resetErrorsCount = resetErrorsCount;
    function extendErrors({ gen, keyword, schemaValue, data, errsCount, it }) {
      if (errsCount === void 0)
        throw new Error("ajv implementation error");
      const err = gen.name("err");
      gen.forRange("i", errsCount, names_1.default.errors, (i) => {
        gen.const(err, (0, codegen_1._)`${names_1.default.vErrors}[${i}]`);
        gen.if((0, codegen_1._)`${err}.instancePath === undefined`, () => gen.assign((0, codegen_1._)`${err}.instancePath`, (0, codegen_1.strConcat)(names_1.default.instancePath, it.errorPath)));
        gen.assign((0, codegen_1._)`${err}.schemaPath`, (0, codegen_1.str)`${it.errSchemaPath}/${keyword}`);
        if (it.opts.verbose) {
          gen.assign((0, codegen_1._)`${err}.schema`, schemaValue);
          gen.assign((0, codegen_1._)`${err}.data`, data);
        }
      });
    }
    exports.extendErrors = extendErrors;
    function addError(gen, errObj) {
      const err = gen.const("err", errObj);
      gen.if((0, codegen_1._)`${names_1.default.vErrors} === null`, () => gen.assign(names_1.default.vErrors, (0, codegen_1._)`[${err}]`), (0, codegen_1._)`${names_1.default.vErrors}.push(${err})`);
      gen.code((0, codegen_1._)`${names_1.default.errors}++`);
    }
    function returnErrors(it, errs) {
      const { gen, validateName, schemaEnv } = it;
      if (schemaEnv.$async) {
        gen.throw((0, codegen_1._)`new ${it.ValidationError}(${errs})`);
      } else {
        gen.assign((0, codegen_1._)`${validateName}.errors`, errs);
        gen.return(false);
      }
    }
    var E = {
      keyword: new codegen_1.Name("keyword"),
      schemaPath: new codegen_1.Name("schemaPath"),
      // also used in JTD errors
      params: new codegen_1.Name("params"),
      propertyName: new codegen_1.Name("propertyName"),
      message: new codegen_1.Name("message"),
      schema: new codegen_1.Name("schema"),
      parentSchema: new codegen_1.Name("parentSchema")
    };
    function errorObjectCode(cxt, error2, errorPaths) {
      const { createErrors } = cxt.it;
      if (createErrors === false)
        return (0, codegen_1._)`{}`;
      return errorObject(cxt, error2, errorPaths);
    }
    function errorObject(cxt, error2, errorPaths = {}) {
      const { gen, it } = cxt;
      const keyValues = [
        errorInstancePath(it, errorPaths),
        errorSchemaPath(cxt, errorPaths)
      ];
      extraErrorProps(cxt, error2, keyValues);
      return gen.object(...keyValues);
    }
    function errorInstancePath({ errorPath }, { instancePath }) {
      const instPath = instancePath ? (0, codegen_1.str)`${errorPath}${(0, util_1.getErrorPath)(instancePath, util_1.Type.Str)}` : errorPath;
      return [names_1.default.instancePath, (0, codegen_1.strConcat)(names_1.default.instancePath, instPath)];
    }
    function errorSchemaPath({ keyword, it: { errSchemaPath } }, { schemaPath, parentSchema }) {
      let schPath = parentSchema ? errSchemaPath : (0, codegen_1.str)`${errSchemaPath}/${keyword}`;
      if (schemaPath) {
        schPath = (0, codegen_1.str)`${schPath}${(0, util_1.getErrorPath)(schemaPath, util_1.Type.Str)}`;
      }
      return [E.schemaPath, schPath];
    }
    function extraErrorProps(cxt, { params, message }, keyValues) {
      const { keyword, data, schemaValue, it } = cxt;
      const { opts, propertyName, topSchemaRef, schemaPath } = it;
      keyValues.push([E.keyword, keyword], [E.params, typeof params == "function" ? params(cxt) : params || (0, codegen_1._)`{}`]);
      if (opts.messages) {
        keyValues.push([E.message, typeof message == "function" ? message(cxt) : message]);
      }
      if (opts.verbose) {
        keyValues.push([E.schema, schemaValue], [E.parentSchema, (0, codegen_1._)`${topSchemaRef}${schemaPath}`], [names_1.default.data, data]);
      }
      if (propertyName)
        keyValues.push([E.propertyName, propertyName]);
    }
  }
});

// node_modules/ajv/dist/compile/validate/boolSchema.js
var require_boolSchema = __commonJS({
  "node_modules/ajv/dist/compile/validate/boolSchema.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.boolOrEmptySchema = exports.topBoolOrEmptySchema = void 0;
    var errors_1 = require_errors();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var boolError = {
      message: "boolean schema is false"
    };
    function topBoolOrEmptySchema(it) {
      const { gen, schema, validateName } = it;
      if (schema === false) {
        falseSchemaError(it, false);
      } else if (typeof schema == "object" && schema.$async === true) {
        gen.return(names_1.default.data);
      } else {
        gen.assign((0, codegen_1._)`${validateName}.errors`, null);
        gen.return(true);
      }
    }
    exports.topBoolOrEmptySchema = topBoolOrEmptySchema;
    function boolOrEmptySchema(it, valid) {
      const { gen, schema } = it;
      if (schema === false) {
        gen.var(valid, false);
        falseSchemaError(it);
      } else {
        gen.var(valid, true);
      }
    }
    exports.boolOrEmptySchema = boolOrEmptySchema;
    function falseSchemaError(it, overrideAllErrors) {
      const { gen, data } = it;
      const cxt = {
        gen,
        keyword: "false schema",
        data,
        schema: false,
        schemaCode: false,
        schemaValue: false,
        params: {},
        it
      };
      (0, errors_1.reportError)(cxt, boolError, void 0, overrideAllErrors);
    }
  }
});

// node_modules/ajv/dist/compile/rules.js
var require_rules = __commonJS({
  "node_modules/ajv/dist/compile/rules.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getRules = exports.isJSONType = void 0;
    var _jsonTypes = ["string", "number", "integer", "boolean", "null", "object", "array"];
    var jsonTypes = new Set(_jsonTypes);
    function isJSONType(x) {
      return typeof x == "string" && jsonTypes.has(x);
    }
    exports.isJSONType = isJSONType;
    function getRules() {
      const groups = {
        number: { type: "number", rules: [] },
        string: { type: "string", rules: [] },
        array: { type: "array", rules: [] },
        object: { type: "object", rules: [] }
      };
      return {
        types: { ...groups, integer: true, boolean: true, null: true },
        rules: [{ rules: [] }, groups.number, groups.string, groups.array, groups.object],
        post: { rules: [] },
        all: {},
        keywords: {}
      };
    }
    exports.getRules = getRules;
  }
});

// node_modules/ajv/dist/compile/validate/applicability.js
var require_applicability = __commonJS({
  "node_modules/ajv/dist/compile/validate/applicability.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.shouldUseRule = exports.shouldUseGroup = exports.schemaHasRulesForType = void 0;
    function schemaHasRulesForType({ schema, self }, type) {
      const group = self.RULES.types[type];
      return group && group !== true && shouldUseGroup(schema, group);
    }
    exports.schemaHasRulesForType = schemaHasRulesForType;
    function shouldUseGroup(schema, group) {
      return group.rules.some((rule) => shouldUseRule(schema, rule));
    }
    exports.shouldUseGroup = shouldUseGroup;
    function shouldUseRule(schema, rule) {
      var _a3;
      return schema[rule.keyword] !== void 0 || ((_a3 = rule.definition.implements) === null || _a3 === void 0 ? void 0 : _a3.some((kwd) => schema[kwd] !== void 0));
    }
    exports.shouldUseRule = shouldUseRule;
  }
});

// node_modules/ajv/dist/compile/validate/dataType.js
var require_dataType = __commonJS({
  "node_modules/ajv/dist/compile/validate/dataType.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reportTypeError = exports.checkDataTypes = exports.checkDataType = exports.coerceAndCheckDataType = exports.getJSONTypes = exports.getSchemaTypes = exports.DataType = void 0;
    var rules_1 = require_rules();
    var applicability_1 = require_applicability();
    var errors_1 = require_errors();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var DataType;
    (function(DataType2) {
      DataType2[DataType2["Correct"] = 0] = "Correct";
      DataType2[DataType2["Wrong"] = 1] = "Wrong";
    })(DataType || (exports.DataType = DataType = {}));
    function getSchemaTypes(schema) {
      const types = getJSONTypes(schema.type);
      const hasNull = types.includes("null");
      if (hasNull) {
        if (schema.nullable === false)
          throw new Error("type: null contradicts nullable: false");
      } else {
        if (!types.length && schema.nullable !== void 0) {
          throw new Error('"nullable" cannot be used without "type"');
        }
        if (schema.nullable === true)
          types.push("null");
      }
      return types;
    }
    exports.getSchemaTypes = getSchemaTypes;
    function getJSONTypes(ts) {
      const types = Array.isArray(ts) ? ts : ts ? [ts] : [];
      if (types.every(rules_1.isJSONType))
        return types;
      throw new Error("type must be JSONType or JSONType[]: " + types.join(","));
    }
    exports.getJSONTypes = getJSONTypes;
    function coerceAndCheckDataType(it, types) {
      const { gen, data, opts } = it;
      const coerceTo = coerceToTypes(types, opts.coerceTypes);
      const checkTypes = types.length > 0 && !(coerceTo.length === 0 && types.length === 1 && (0, applicability_1.schemaHasRulesForType)(it, types[0]));
      if (checkTypes) {
        const wrongType = checkDataTypes(types, data, opts.strictNumbers, DataType.Wrong);
        gen.if(wrongType, () => {
          if (coerceTo.length)
            coerceData(it, types, coerceTo);
          else
            reportTypeError(it);
        });
      }
      return checkTypes;
    }
    exports.coerceAndCheckDataType = coerceAndCheckDataType;
    var COERCIBLE = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
    function coerceToTypes(types, coerceTypes) {
      return coerceTypes ? types.filter((t) => COERCIBLE.has(t) || coerceTypes === "array" && t === "array") : [];
    }
    function coerceData(it, types, coerceTo) {
      const { gen, data, opts } = it;
      const dataType = gen.let("dataType", (0, codegen_1._)`typeof ${data}`);
      const coerced = gen.let("coerced", (0, codegen_1._)`undefined`);
      if (opts.coerceTypes === "array") {
        gen.if((0, codegen_1._)`${dataType} == 'object' && Array.isArray(${data}) && ${data}.length == 1`, () => gen.assign(data, (0, codegen_1._)`${data}[0]`).assign(dataType, (0, codegen_1._)`typeof ${data}`).if(checkDataTypes(types, data, opts.strictNumbers), () => gen.assign(coerced, data)));
      }
      gen.if((0, codegen_1._)`${coerced} !== undefined`);
      for (const t of coerceTo) {
        if (COERCIBLE.has(t) || t === "array" && opts.coerceTypes === "array") {
          coerceSpecificType(t);
        }
      }
      gen.else();
      reportTypeError(it);
      gen.endIf();
      gen.if((0, codegen_1._)`${coerced} !== undefined`, () => {
        gen.assign(data, coerced);
        assignParentData(it, coerced);
      });
      function coerceSpecificType(t) {
        switch (t) {
          case "string":
            gen.elseIf((0, codegen_1._)`${dataType} == "number" || ${dataType} == "boolean"`).assign(coerced, (0, codegen_1._)`"" + ${data}`).elseIf((0, codegen_1._)`${data} === null`).assign(coerced, (0, codegen_1._)`""`);
            return;
          case "number":
            gen.elseIf((0, codegen_1._)`${dataType} == "boolean" || ${data} === null
              || (${dataType} == "string" && ${data} && ${data} == +${data})`).assign(coerced, (0, codegen_1._)`+${data}`);
            return;
          case "integer":
            gen.elseIf((0, codegen_1._)`${dataType} === "boolean" || ${data} === null
              || (${dataType} === "string" && ${data} && ${data} == +${data} && !(${data} % 1))`).assign(coerced, (0, codegen_1._)`+${data}`);
            return;
          case "boolean":
            gen.elseIf((0, codegen_1._)`${data} === "false" || ${data} === 0 || ${data} === null`).assign(coerced, false).elseIf((0, codegen_1._)`${data} === "true" || ${data} === 1`).assign(coerced, true);
            return;
          case "null":
            gen.elseIf((0, codegen_1._)`${data} === "" || ${data} === 0 || ${data} === false`);
            gen.assign(coerced, null);
            return;
          case "array":
            gen.elseIf((0, codegen_1._)`${dataType} === "string" || ${dataType} === "number"
              || ${dataType} === "boolean" || ${data} === null`).assign(coerced, (0, codegen_1._)`[${data}]`);
        }
      }
    }
    function assignParentData({ gen, parentData, parentDataProperty }, expr) {
      gen.if((0, codegen_1._)`${parentData} !== undefined`, () => gen.assign((0, codegen_1._)`${parentData}[${parentDataProperty}]`, expr));
    }
    function checkDataType(dataType, data, strictNums, correct = DataType.Correct) {
      const EQ = correct === DataType.Correct ? codegen_1.operators.EQ : codegen_1.operators.NEQ;
      let cond;
      switch (dataType) {
        case "null":
          return (0, codegen_1._)`${data} ${EQ} null`;
        case "array":
          cond = (0, codegen_1._)`Array.isArray(${data})`;
          break;
        case "object":
          cond = (0, codegen_1._)`${data} && typeof ${data} == "object" && !Array.isArray(${data})`;
          break;
        case "integer":
          cond = numCond((0, codegen_1._)`!(${data} % 1) && !isNaN(${data})`);
          break;
        case "number":
          cond = numCond();
          break;
        default:
          return (0, codegen_1._)`typeof ${data} ${EQ} ${dataType}`;
      }
      return correct === DataType.Correct ? cond : (0, codegen_1.not)(cond);
      function numCond(_cond = codegen_1.nil) {
        return (0, codegen_1.and)((0, codegen_1._)`typeof ${data} == "number"`, _cond, strictNums ? (0, codegen_1._)`isFinite(${data})` : codegen_1.nil);
      }
    }
    exports.checkDataType = checkDataType;
    function checkDataTypes(dataTypes, data, strictNums, correct) {
      if (dataTypes.length === 1) {
        return checkDataType(dataTypes[0], data, strictNums, correct);
      }
      let cond;
      const types = (0, util_1.toHash)(dataTypes);
      if (types.array && types.object) {
        const notObj = (0, codegen_1._)`typeof ${data} != "object"`;
        cond = types.null ? notObj : (0, codegen_1._)`!${data} || ${notObj}`;
        delete types.null;
        delete types.array;
        delete types.object;
      } else {
        cond = codegen_1.nil;
      }
      if (types.number)
        delete types.integer;
      for (const t in types)
        cond = (0, codegen_1.and)(cond, checkDataType(t, data, strictNums, correct));
      return cond;
    }
    exports.checkDataTypes = checkDataTypes;
    var typeError = {
      message: ({ schema }) => `must be ${schema}`,
      params: ({ schema, schemaValue }) => typeof schema == "string" ? (0, codegen_1._)`{type: ${schema}}` : (0, codegen_1._)`{type: ${schemaValue}}`
    };
    function reportTypeError(it) {
      const cxt = getTypeErrorContext(it);
      (0, errors_1.reportError)(cxt, typeError);
    }
    exports.reportTypeError = reportTypeError;
    function getTypeErrorContext(it) {
      const { gen, data, schema } = it;
      const schemaCode = (0, util_1.schemaRefOrVal)(it, schema, "type");
      return {
        gen,
        keyword: "type",
        data,
        schema: schema.type,
        schemaCode,
        schemaValue: schemaCode,
        parentSchema: schema,
        params: {},
        it
      };
    }
  }
});

// node_modules/ajv/dist/compile/validate/defaults.js
var require_defaults = __commonJS({
  "node_modules/ajv/dist/compile/validate/defaults.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assignDefaults = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    function assignDefaults(it, ty) {
      const { properties, items } = it.schema;
      if (ty === "object" && properties) {
        for (const key in properties) {
          assignDefault(it, key, properties[key].default);
        }
      } else if (ty === "array" && Array.isArray(items)) {
        items.forEach((sch, i) => assignDefault(it, i, sch.default));
      }
    }
    exports.assignDefaults = assignDefaults;
    function assignDefault(it, prop, defaultValue) {
      const { gen, compositeRule, data, opts } = it;
      if (defaultValue === void 0)
        return;
      const childData = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(prop)}`;
      if (compositeRule) {
        (0, util_1.checkStrictMode)(it, `default is ignored for: ${childData}`);
        return;
      }
      let condition = (0, codegen_1._)`${childData} === undefined`;
      if (opts.useDefaults === "empty") {
        condition = (0, codegen_1._)`${condition} || ${childData} === null || ${childData} === ""`;
      }
      gen.if(condition, (0, codegen_1._)`${childData} = ${(0, codegen_1.stringify)(defaultValue)}`);
    }
  }
});

// node_modules/ajv/dist/vocabularies/code.js
var require_code2 = __commonJS({
  "node_modules/ajv/dist/vocabularies/code.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateUnion = exports.validateArray = exports.usePattern = exports.callValidateCode = exports.schemaProperties = exports.allSchemaProperties = exports.noPropertyInData = exports.propertyInData = exports.isOwnProperty = exports.hasPropFunc = exports.reportMissingProp = exports.checkMissingProp = exports.checkReportMissingProp = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var names_1 = require_names();
    var util_2 = require_util();
    function checkReportMissingProp(cxt, prop) {
      const { gen, data, it } = cxt;
      gen.if(noPropertyInData(gen, data, prop, it.opts.ownProperties), () => {
        cxt.setParams({ missingProperty: (0, codegen_1._)`${prop}` }, true);
        cxt.error();
      });
    }
    exports.checkReportMissingProp = checkReportMissingProp;
    function checkMissingProp({ gen, data, it: { opts } }, properties, missing) {
      return (0, codegen_1.or)(...properties.map((prop) => (0, codegen_1.and)(noPropertyInData(gen, data, prop, opts.ownProperties), (0, codegen_1._)`${missing} = ${prop}`)));
    }
    exports.checkMissingProp = checkMissingProp;
    function reportMissingProp(cxt, missing) {
      cxt.setParams({ missingProperty: missing }, true);
      cxt.error();
    }
    exports.reportMissingProp = reportMissingProp;
    function hasPropFunc(gen) {
      return gen.scopeValue("func", {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        ref: Object.prototype.hasOwnProperty,
        code: (0, codegen_1._)`Object.prototype.hasOwnProperty`
      });
    }
    exports.hasPropFunc = hasPropFunc;
    function isOwnProperty(gen, data, property) {
      return (0, codegen_1._)`${hasPropFunc(gen)}.call(${data}, ${property})`;
    }
    exports.isOwnProperty = isOwnProperty;
    function propertyInData(gen, data, property, ownProperties) {
      const cond = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(property)} !== undefined`;
      return ownProperties ? (0, codegen_1._)`${cond} && ${isOwnProperty(gen, data, property)}` : cond;
    }
    exports.propertyInData = propertyInData;
    function noPropertyInData(gen, data, property, ownProperties) {
      const cond = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(property)} === undefined`;
      return ownProperties ? (0, codegen_1.or)(cond, (0, codegen_1.not)(isOwnProperty(gen, data, property))) : cond;
    }
    exports.noPropertyInData = noPropertyInData;
    function allSchemaProperties(schemaMap) {
      return schemaMap ? Object.keys(schemaMap).filter((p) => p !== "__proto__") : [];
    }
    exports.allSchemaProperties = allSchemaProperties;
    function schemaProperties(it, schemaMap) {
      return allSchemaProperties(schemaMap).filter((p) => !(0, util_1.alwaysValidSchema)(it, schemaMap[p]));
    }
    exports.schemaProperties = schemaProperties;
    function callValidateCode({ schemaCode, data, it: { gen, topSchemaRef, schemaPath, errorPath }, it }, func, context, passSchema) {
      const dataAndSchema = passSchema ? (0, codegen_1._)`${schemaCode}, ${data}, ${topSchemaRef}${schemaPath}` : data;
      const valCxt = [
        [names_1.default.instancePath, (0, codegen_1.strConcat)(names_1.default.instancePath, errorPath)],
        [names_1.default.parentData, it.parentData],
        [names_1.default.parentDataProperty, it.parentDataProperty],
        [names_1.default.rootData, names_1.default.rootData]
      ];
      if (it.opts.dynamicRef)
        valCxt.push([names_1.default.dynamicAnchors, names_1.default.dynamicAnchors]);
      const args = (0, codegen_1._)`${dataAndSchema}, ${gen.object(...valCxt)}`;
      return context !== codegen_1.nil ? (0, codegen_1._)`${func}.call(${context}, ${args})` : (0, codegen_1._)`${func}(${args})`;
    }
    exports.callValidateCode = callValidateCode;
    var newRegExp = (0, codegen_1._)`new RegExp`;
    function usePattern({ gen, it: { opts } }, pattern) {
      const u = opts.unicodeRegExp ? "u" : "";
      const { regExp } = opts.code;
      const rx = regExp(pattern, u);
      return gen.scopeValue("pattern", {
        key: rx.toString(),
        ref: rx,
        code: (0, codegen_1._)`${regExp.code === "new RegExp" ? newRegExp : (0, util_2.useFunc)(gen, regExp)}(${pattern}, ${u})`
      });
    }
    exports.usePattern = usePattern;
    function validateArray(cxt) {
      const { gen, data, keyword, it } = cxt;
      const valid = gen.name("valid");
      if (it.allErrors) {
        const validArr = gen.let("valid", true);
        validateItems(() => gen.assign(validArr, false));
        return validArr;
      }
      gen.var(valid, true);
      validateItems(() => gen.break());
      return valid;
      function validateItems(notValid) {
        const len = gen.const("len", (0, codegen_1._)`${data}.length`);
        gen.forRange("i", 0, len, (i) => {
          cxt.subschema({
            keyword,
            dataProp: i,
            dataPropType: util_1.Type.Num
          }, valid);
          gen.if((0, codegen_1.not)(valid), notValid);
        });
      }
    }
    exports.validateArray = validateArray;
    function validateUnion(cxt) {
      const { gen, schema, keyword, it } = cxt;
      if (!Array.isArray(schema))
        throw new Error("ajv implementation error");
      const alwaysValid = schema.some((sch) => (0, util_1.alwaysValidSchema)(it, sch));
      if (alwaysValid && !it.opts.unevaluated)
        return;
      const valid = gen.let("valid", false);
      const schValid = gen.name("_valid");
      gen.block(() => schema.forEach((_sch, i) => {
        const schCxt = cxt.subschema({
          keyword,
          schemaProp: i,
          compositeRule: true
        }, schValid);
        gen.assign(valid, (0, codegen_1._)`${valid} || ${schValid}`);
        const merged = cxt.mergeValidEvaluated(schCxt, schValid);
        if (!merged)
          gen.if((0, codegen_1.not)(valid));
      }));
      cxt.result(valid, () => cxt.reset(), () => cxt.error(true));
    }
    exports.validateUnion = validateUnion;
  }
});

// node_modules/ajv/dist/compile/validate/keyword.js
var require_keyword = __commonJS({
  "node_modules/ajv/dist/compile/validate/keyword.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateKeywordUsage = exports.validSchemaType = exports.funcKeywordCode = exports.macroKeywordCode = void 0;
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var code_1 = require_code2();
    var errors_1 = require_errors();
    function macroKeywordCode(cxt, def) {
      const { gen, keyword, schema, parentSchema, it } = cxt;
      const macroSchema = def.macro.call(it.self, schema, parentSchema, it);
      const schemaRef = useKeyword(gen, keyword, macroSchema);
      if (it.opts.validateSchema !== false)
        it.self.validateSchema(macroSchema, true);
      const valid = gen.name("valid");
      cxt.subschema({
        schema: macroSchema,
        schemaPath: codegen_1.nil,
        errSchemaPath: `${it.errSchemaPath}/${keyword}`,
        topSchemaRef: schemaRef,
        compositeRule: true
      }, valid);
      cxt.pass(valid, () => cxt.error(true));
    }
    exports.macroKeywordCode = macroKeywordCode;
    function funcKeywordCode(cxt, def) {
      var _a3;
      const { gen, keyword, schema, parentSchema, $data, it } = cxt;
      checkAsyncKeyword(it, def);
      const validate = !$data && def.compile ? def.compile.call(it.self, schema, parentSchema, it) : def.validate;
      const validateRef = useKeyword(gen, keyword, validate);
      const valid = gen.let("valid");
      cxt.block$data(valid, validateKeyword);
      cxt.ok((_a3 = def.valid) !== null && _a3 !== void 0 ? _a3 : valid);
      function validateKeyword() {
        if (def.errors === false) {
          assignValid();
          if (def.modifying)
            modifyData(cxt);
          reportErrs(() => cxt.error());
        } else {
          const ruleErrs = def.async ? validateAsync() : validateSync();
          if (def.modifying)
            modifyData(cxt);
          reportErrs(() => addErrs(cxt, ruleErrs));
        }
      }
      function validateAsync() {
        const ruleErrs = gen.let("ruleErrs", null);
        gen.try(() => assignValid((0, codegen_1._)`await `), (e) => gen.assign(valid, false).if((0, codegen_1._)`${e} instanceof ${it.ValidationError}`, () => gen.assign(ruleErrs, (0, codegen_1._)`${e}.errors`), () => gen.throw(e)));
        return ruleErrs;
      }
      function validateSync() {
        const validateErrs = (0, codegen_1._)`${validateRef}.errors`;
        gen.assign(validateErrs, null);
        assignValid(codegen_1.nil);
        return validateErrs;
      }
      function assignValid(_await = def.async ? (0, codegen_1._)`await ` : codegen_1.nil) {
        const passCxt = it.opts.passContext ? names_1.default.this : names_1.default.self;
        const passSchema = !("compile" in def && !$data || def.schema === false);
        gen.assign(valid, (0, codegen_1._)`${_await}${(0, code_1.callValidateCode)(cxt, validateRef, passCxt, passSchema)}`, def.modifying);
      }
      function reportErrs(errors) {
        var _a4;
        gen.if((0, codegen_1.not)((_a4 = def.valid) !== null && _a4 !== void 0 ? _a4 : valid), errors);
      }
    }
    exports.funcKeywordCode = funcKeywordCode;
    function modifyData(cxt) {
      const { gen, data, it } = cxt;
      gen.if(it.parentData, () => gen.assign(data, (0, codegen_1._)`${it.parentData}[${it.parentDataProperty}]`));
    }
    function addErrs(cxt, errs) {
      const { gen } = cxt;
      gen.if((0, codegen_1._)`Array.isArray(${errs})`, () => {
        gen.assign(names_1.default.vErrors, (0, codegen_1._)`${names_1.default.vErrors} === null ? ${errs} : ${names_1.default.vErrors}.concat(${errs})`).assign(names_1.default.errors, (0, codegen_1._)`${names_1.default.vErrors}.length`);
        (0, errors_1.extendErrors)(cxt);
      }, () => cxt.error());
    }
    function checkAsyncKeyword({ schemaEnv }, def) {
      if (def.async && !schemaEnv.$async)
        throw new Error("async keyword in sync schema");
    }
    function useKeyword(gen, keyword, result) {
      if (result === void 0)
        throw new Error(`keyword "${keyword}" failed to compile`);
      return gen.scopeValue("keyword", typeof result == "function" ? { ref: result } : { ref: result, code: (0, codegen_1.stringify)(result) });
    }
    function validSchemaType(schema, schemaType, allowUndefined = false) {
      return !schemaType.length || schemaType.some((st) => st === "array" ? Array.isArray(schema) : st === "object" ? schema && typeof schema == "object" && !Array.isArray(schema) : typeof schema == st || allowUndefined && typeof schema == "undefined");
    }
    exports.validSchemaType = validSchemaType;
    function validateKeywordUsage({ schema, opts, self, errSchemaPath }, def, keyword) {
      if (Array.isArray(def.keyword) ? !def.keyword.includes(keyword) : def.keyword !== keyword) {
        throw new Error("ajv implementation error");
      }
      const deps = def.dependencies;
      if (deps === null || deps === void 0 ? void 0 : deps.some((kwd) => !Object.prototype.hasOwnProperty.call(schema, kwd))) {
        throw new Error(`parent schema must have dependencies of ${keyword}: ${deps.join(",")}`);
      }
      if (def.validateSchema) {
        const valid = def.validateSchema(schema[keyword]);
        if (!valid) {
          const msg = `keyword "${keyword}" value is invalid at path "${errSchemaPath}": ` + self.errorsText(def.validateSchema.errors);
          if (opts.validateSchema === "log")
            self.logger.error(msg);
          else
            throw new Error(msg);
        }
      }
    }
    exports.validateKeywordUsage = validateKeywordUsage;
  }
});

// node_modules/ajv/dist/compile/validate/subschema.js
var require_subschema = __commonJS({
  "node_modules/ajv/dist/compile/validate/subschema.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extendSubschemaMode = exports.extendSubschemaData = exports.getSubschema = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    function getSubschema(it, { keyword, schemaProp, schema, schemaPath, errSchemaPath, topSchemaRef }) {
      if (keyword !== void 0 && schema !== void 0) {
        throw new Error('both "keyword" and "schema" passed, only one allowed');
      }
      if (keyword !== void 0) {
        const sch = it.schema[keyword];
        return schemaProp === void 0 ? {
          schema: sch,
          schemaPath: (0, codegen_1._)`${it.schemaPath}${(0, codegen_1.getProperty)(keyword)}`,
          errSchemaPath: `${it.errSchemaPath}/${keyword}`
        } : {
          schema: sch[schemaProp],
          schemaPath: (0, codegen_1._)`${it.schemaPath}${(0, codegen_1.getProperty)(keyword)}${(0, codegen_1.getProperty)(schemaProp)}`,
          errSchemaPath: `${it.errSchemaPath}/${keyword}/${(0, util_1.escapeFragment)(schemaProp)}`
        };
      }
      if (schema !== void 0) {
        if (schemaPath === void 0 || errSchemaPath === void 0 || topSchemaRef === void 0) {
          throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
        }
        return {
          schema,
          schemaPath,
          topSchemaRef,
          errSchemaPath
        };
      }
      throw new Error('either "keyword" or "schema" must be passed');
    }
    exports.getSubschema = getSubschema;
    function extendSubschemaData(subschema, it, { dataProp, dataPropType: dpType, data, dataTypes, propertyName }) {
      if (data !== void 0 && dataProp !== void 0) {
        throw new Error('both "data" and "dataProp" passed, only one allowed');
      }
      const { gen } = it;
      if (dataProp !== void 0) {
        const { errorPath, dataPathArr, opts } = it;
        const nextData = gen.let("data", (0, codegen_1._)`${it.data}${(0, codegen_1.getProperty)(dataProp)}`, true);
        dataContextProps(nextData);
        subschema.errorPath = (0, codegen_1.str)`${errorPath}${(0, util_1.getErrorPath)(dataProp, dpType, opts.jsPropertySyntax)}`;
        subschema.parentDataProperty = (0, codegen_1._)`${dataProp}`;
        subschema.dataPathArr = [...dataPathArr, subschema.parentDataProperty];
      }
      if (data !== void 0) {
        const nextData = data instanceof codegen_1.Name ? data : gen.let("data", data, true);
        dataContextProps(nextData);
        if (propertyName !== void 0)
          subschema.propertyName = propertyName;
      }
      if (dataTypes)
        subschema.dataTypes = dataTypes;
      function dataContextProps(_nextData) {
        subschema.data = _nextData;
        subschema.dataLevel = it.dataLevel + 1;
        subschema.dataTypes = [];
        it.definedProperties = /* @__PURE__ */ new Set();
        subschema.parentData = it.data;
        subschema.dataNames = [...it.dataNames, _nextData];
      }
    }
    exports.extendSubschemaData = extendSubschemaData;
    function extendSubschemaMode(subschema, { jtdDiscriminator, jtdMetadata, compositeRule, createErrors, allErrors }) {
      if (compositeRule !== void 0)
        subschema.compositeRule = compositeRule;
      if (createErrors !== void 0)
        subschema.createErrors = createErrors;
      if (allErrors !== void 0)
        subschema.allErrors = allErrors;
      subschema.jtdDiscriminator = jtdDiscriminator;
      subschema.jtdMetadata = jtdMetadata;
    }
    exports.extendSubschemaMode = extendSubschemaMode;
  }
});

// node_modules/fast-deep-equal/index.js
var require_fast_deep_equal = __commonJS({
  "node_modules/fast-deep-equal/index.js"(exports, module) {
    "use strict";
    module.exports = function equal(a, b) {
      if (a === b) return true;
      if (a && b && typeof a == "object" && typeof b == "object") {
        if (a.constructor !== b.constructor) return false;
        var length, i, keys;
        if (Array.isArray(a)) {
          length = a.length;
          if (length != b.length) return false;
          for (i = length; i-- !== 0; )
            if (!equal(a[i], b[i])) return false;
          return true;
        }
        if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
        if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
        if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
        keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length) return false;
        for (i = length; i-- !== 0; )
          if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
        for (i = length; i-- !== 0; ) {
          var key = keys[i];
          if (!equal(a[key], b[key])) return false;
        }
        return true;
      }
      return a !== a && b !== b;
    };
  }
});

// node_modules/json-schema-traverse/index.js
var require_json_schema_traverse = __commonJS({
  "node_modules/json-schema-traverse/index.js"(exports, module) {
    "use strict";
    var traverse = module.exports = function(schema, opts, cb) {
      if (typeof opts == "function") {
        cb = opts;
        opts = {};
      }
      cb = opts.cb || cb;
      var pre = typeof cb == "function" ? cb : cb.pre || function() {
      };
      var post = cb.post || function() {
      };
      _traverse(opts, pre, post, schema, "", schema);
    };
    traverse.keywords = {
      additionalItems: true,
      items: true,
      contains: true,
      additionalProperties: true,
      propertyNames: true,
      not: true,
      if: true,
      then: true,
      else: true
    };
    traverse.arrayKeywords = {
      items: true,
      allOf: true,
      anyOf: true,
      oneOf: true
    };
    traverse.propsKeywords = {
      $defs: true,
      definitions: true,
      properties: true,
      patternProperties: true,
      dependencies: true
    };
    traverse.skipKeywords = {
      default: true,
      enum: true,
      const: true,
      required: true,
      maximum: true,
      minimum: true,
      exclusiveMaximum: true,
      exclusiveMinimum: true,
      multipleOf: true,
      maxLength: true,
      minLength: true,
      pattern: true,
      format: true,
      maxItems: true,
      minItems: true,
      uniqueItems: true,
      maxProperties: true,
      minProperties: true
    };
    function _traverse(opts, pre, post, schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
      if (schema && typeof schema == "object" && !Array.isArray(schema)) {
        pre(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
        for (var key in schema) {
          var sch = schema[key];
          if (Array.isArray(sch)) {
            if (key in traverse.arrayKeywords) {
              for (var i = 0; i < sch.length; i++)
                _traverse(opts, pre, post, sch[i], jsonPtr + "/" + key + "/" + i, rootSchema, jsonPtr, key, schema, i);
            }
          } else if (key in traverse.propsKeywords) {
            if (sch && typeof sch == "object") {
              for (var prop in sch)
                _traverse(opts, pre, post, sch[prop], jsonPtr + "/" + key + "/" + escapeJsonPtr(prop), rootSchema, jsonPtr, key, schema, prop);
            }
          } else if (key in traverse.keywords || opts.allKeys && !(key in traverse.skipKeywords)) {
            _traverse(opts, pre, post, sch, jsonPtr + "/" + key, rootSchema, jsonPtr, key, schema);
          }
        }
        post(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
      }
    }
    function escapeJsonPtr(str) {
      return str.replace(/~/g, "~0").replace(/\//g, "~1");
    }
  }
});

// node_modules/ajv/dist/compile/resolve.js
var require_resolve = __commonJS({
  "node_modules/ajv/dist/compile/resolve.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSchemaRefs = exports.resolveUrl = exports.normalizeId = exports._getFullPath = exports.getFullPath = exports.inlineRef = void 0;
    var util_1 = require_util();
    var equal = require_fast_deep_equal();
    var traverse = require_json_schema_traverse();
    var SIMPLE_INLINED = /* @__PURE__ */ new Set([
      "type",
      "format",
      "pattern",
      "maxLength",
      "minLength",
      "maxProperties",
      "minProperties",
      "maxItems",
      "minItems",
      "maximum",
      "minimum",
      "uniqueItems",
      "multipleOf",
      "required",
      "enum",
      "const"
    ]);
    function inlineRef(schema, limit = true) {
      if (typeof schema == "boolean")
        return true;
      if (limit === true)
        return !hasRef(schema);
      if (!limit)
        return false;
      return countKeys(schema) <= limit;
    }
    exports.inlineRef = inlineRef;
    var REF_KEYWORDS = /* @__PURE__ */ new Set([
      "$ref",
      "$recursiveRef",
      "$recursiveAnchor",
      "$dynamicRef",
      "$dynamicAnchor"
    ]);
    function hasRef(schema) {
      for (const key in schema) {
        if (REF_KEYWORDS.has(key))
          return true;
        const sch = schema[key];
        if (Array.isArray(sch) && sch.some(hasRef))
          return true;
        if (typeof sch == "object" && hasRef(sch))
          return true;
      }
      return false;
    }
    function countKeys(schema) {
      let count = 0;
      for (const key in schema) {
        if (key === "$ref")
          return Infinity;
        count++;
        if (SIMPLE_INLINED.has(key))
          continue;
        if (typeof schema[key] == "object") {
          (0, util_1.eachItem)(schema[key], (sch) => count += countKeys(sch));
        }
        if (count === Infinity)
          return Infinity;
      }
      return count;
    }
    function getFullPath(resolver, id = "", normalize) {
      if (normalize !== false)
        id = normalizeId(id);
      const p = resolver.parse(id);
      return _getFullPath(resolver, p);
    }
    exports.getFullPath = getFullPath;
    function _getFullPath(resolver, p) {
      const serialized = resolver.serialize(p);
      return serialized.split("#")[0] + "#";
    }
    exports._getFullPath = _getFullPath;
    var TRAILING_SLASH_HASH = /#\/?$/;
    function normalizeId(id) {
      return id ? id.replace(TRAILING_SLASH_HASH, "") : "";
    }
    exports.normalizeId = normalizeId;
    function resolveUrl(resolver, baseId, id) {
      id = normalizeId(id);
      return resolver.resolve(baseId, id);
    }
    exports.resolveUrl = resolveUrl;
    var ANCHOR = /^[a-z_][-a-z0-9._]*$/i;
    function getSchemaRefs(schema, baseId) {
      if (typeof schema == "boolean")
        return {};
      const { schemaId, uriResolver } = this.opts;
      const schId = normalizeId(schema[schemaId] || baseId);
      const baseIds = { "": schId };
      const pathPrefix = getFullPath(uriResolver, schId, false);
      const localRefs = {};
      const schemaRefs = /* @__PURE__ */ new Set();
      traverse(schema, { allKeys: true }, (sch, jsonPtr, _, parentJsonPtr) => {
        if (parentJsonPtr === void 0)
          return;
        const fullPath = pathPrefix + jsonPtr;
        let innerBaseId = baseIds[parentJsonPtr];
        if (typeof sch[schemaId] == "string")
          innerBaseId = addRef.call(this, sch[schemaId]);
        addAnchor.call(this, sch.$anchor);
        addAnchor.call(this, sch.$dynamicAnchor);
        baseIds[jsonPtr] = innerBaseId;
        function addRef(ref) {
          const _resolve = this.opts.uriResolver.resolve;
          ref = normalizeId(innerBaseId ? _resolve(innerBaseId, ref) : ref);
          if (schemaRefs.has(ref))
            throw ambiguos(ref);
          schemaRefs.add(ref);
          let schOrRef = this.refs[ref];
          if (typeof schOrRef == "string")
            schOrRef = this.refs[schOrRef];
          if (typeof schOrRef == "object") {
            checkAmbiguosRef(sch, schOrRef.schema, ref);
          } else if (ref !== normalizeId(fullPath)) {
            if (ref[0] === "#") {
              checkAmbiguosRef(sch, localRefs[ref], ref);
              localRefs[ref] = sch;
            } else {
              this.refs[ref] = fullPath;
            }
          }
          return ref;
        }
        function addAnchor(anchor) {
          if (typeof anchor == "string") {
            if (!ANCHOR.test(anchor))
              throw new Error(`invalid anchor "${anchor}"`);
            addRef.call(this, `#${anchor}`);
          }
        }
      });
      return localRefs;
      function checkAmbiguosRef(sch1, sch2, ref) {
        if (sch2 !== void 0 && !equal(sch1, sch2))
          throw ambiguos(ref);
      }
      function ambiguos(ref) {
        return new Error(`reference "${ref}" resolves to more than one schema`);
      }
    }
    exports.getSchemaRefs = getSchemaRefs;
  }
});

// node_modules/ajv/dist/compile/validate/index.js
var require_validate = __commonJS({
  "node_modules/ajv/dist/compile/validate/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getData = exports.KeywordCxt = exports.validateFunctionCode = void 0;
    var boolSchema_1 = require_boolSchema();
    var dataType_1 = require_dataType();
    var applicability_1 = require_applicability();
    var dataType_2 = require_dataType();
    var defaults_1 = require_defaults();
    var keyword_1 = require_keyword();
    var subschema_1 = require_subschema();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var resolve_1 = require_resolve();
    var util_1 = require_util();
    var errors_1 = require_errors();
    function validateFunctionCode(it) {
      if (isSchemaObj(it)) {
        checkKeywords(it);
        if (schemaCxtHasRules(it)) {
          topSchemaObjCode(it);
          return;
        }
      }
      validateFunction(it, () => (0, boolSchema_1.topBoolOrEmptySchema)(it));
    }
    exports.validateFunctionCode = validateFunctionCode;
    function validateFunction({ gen, validateName, schema, schemaEnv, opts }, body) {
      if (opts.code.es5) {
        gen.func(validateName, (0, codegen_1._)`${names_1.default.data}, ${names_1.default.valCxt}`, schemaEnv.$async, () => {
          gen.code((0, codegen_1._)`"use strict"; ${funcSourceUrl(schema, opts)}`);
          destructureValCxtES5(gen, opts);
          gen.code(body);
        });
      } else {
        gen.func(validateName, (0, codegen_1._)`${names_1.default.data}, ${destructureValCxt(opts)}`, schemaEnv.$async, () => gen.code(funcSourceUrl(schema, opts)).code(body));
      }
    }
    function destructureValCxt(opts) {
      return (0, codegen_1._)`{${names_1.default.instancePath}="", ${names_1.default.parentData}, ${names_1.default.parentDataProperty}, ${names_1.default.rootData}=${names_1.default.data}${opts.dynamicRef ? (0, codegen_1._)`, ${names_1.default.dynamicAnchors}={}` : codegen_1.nil}}={}`;
    }
    function destructureValCxtES5(gen, opts) {
      gen.if(names_1.default.valCxt, () => {
        gen.var(names_1.default.instancePath, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.instancePath}`);
        gen.var(names_1.default.parentData, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.parentData}`);
        gen.var(names_1.default.parentDataProperty, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.parentDataProperty}`);
        gen.var(names_1.default.rootData, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.rootData}`);
        if (opts.dynamicRef)
          gen.var(names_1.default.dynamicAnchors, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.dynamicAnchors}`);
      }, () => {
        gen.var(names_1.default.instancePath, (0, codegen_1._)`""`);
        gen.var(names_1.default.parentData, (0, codegen_1._)`undefined`);
        gen.var(names_1.default.parentDataProperty, (0, codegen_1._)`undefined`);
        gen.var(names_1.default.rootData, names_1.default.data);
        if (opts.dynamicRef)
          gen.var(names_1.default.dynamicAnchors, (0, codegen_1._)`{}`);
      });
    }
    function topSchemaObjCode(it) {
      const { schema, opts, gen } = it;
      validateFunction(it, () => {
        if (opts.$comment && schema.$comment)
          commentKeyword(it);
        checkNoDefault(it);
        gen.let(names_1.default.vErrors, null);
        gen.let(names_1.default.errors, 0);
        if (opts.unevaluated)
          resetEvaluated(it);
        typeAndKeywords(it);
        returnResults(it);
      });
      return;
    }
    function resetEvaluated(it) {
      const { gen, validateName } = it;
      it.evaluated = gen.const("evaluated", (0, codegen_1._)`${validateName}.evaluated`);
      gen.if((0, codegen_1._)`${it.evaluated}.dynamicProps`, () => gen.assign((0, codegen_1._)`${it.evaluated}.props`, (0, codegen_1._)`undefined`));
      gen.if((0, codegen_1._)`${it.evaluated}.dynamicItems`, () => gen.assign((0, codegen_1._)`${it.evaluated}.items`, (0, codegen_1._)`undefined`));
    }
    function funcSourceUrl(schema, opts) {
      const schId = typeof schema == "object" && schema[opts.schemaId];
      return schId && (opts.code.source || opts.code.process) ? (0, codegen_1._)`/*# sourceURL=${schId} */` : codegen_1.nil;
    }
    function subschemaCode(it, valid) {
      if (isSchemaObj(it)) {
        checkKeywords(it);
        if (schemaCxtHasRules(it)) {
          subSchemaObjCode(it, valid);
          return;
        }
      }
      (0, boolSchema_1.boolOrEmptySchema)(it, valid);
    }
    function schemaCxtHasRules({ schema, self }) {
      if (typeof schema == "boolean")
        return !schema;
      for (const key in schema)
        if (self.RULES.all[key])
          return true;
      return false;
    }
    function isSchemaObj(it) {
      return typeof it.schema != "boolean";
    }
    function subSchemaObjCode(it, valid) {
      const { schema, gen, opts } = it;
      if (opts.$comment && schema.$comment)
        commentKeyword(it);
      updateContext(it);
      checkAsyncSchema(it);
      const errsCount = gen.const("_errs", names_1.default.errors);
      typeAndKeywords(it, errsCount);
      gen.var(valid, (0, codegen_1._)`${errsCount} === ${names_1.default.errors}`);
    }
    function checkKeywords(it) {
      (0, util_1.checkUnknownRules)(it);
      checkRefsAndKeywords(it);
    }
    function typeAndKeywords(it, errsCount) {
      if (it.opts.jtd)
        return schemaKeywords(it, [], false, errsCount);
      const types = (0, dataType_1.getSchemaTypes)(it.schema);
      const checkedTypes = (0, dataType_1.coerceAndCheckDataType)(it, types);
      schemaKeywords(it, types, !checkedTypes, errsCount);
    }
    function checkRefsAndKeywords(it) {
      const { schema, errSchemaPath, opts, self } = it;
      if (schema.$ref && opts.ignoreKeywordsWithRef && (0, util_1.schemaHasRulesButRef)(schema, self.RULES)) {
        self.logger.warn(`$ref: keywords ignored in schema at path "${errSchemaPath}"`);
      }
    }
    function checkNoDefault(it) {
      const { schema, opts } = it;
      if (schema.default !== void 0 && opts.useDefaults && opts.strictSchema) {
        (0, util_1.checkStrictMode)(it, "default is ignored in the schema root");
      }
    }
    function updateContext(it) {
      const schId = it.schema[it.opts.schemaId];
      if (schId)
        it.baseId = (0, resolve_1.resolveUrl)(it.opts.uriResolver, it.baseId, schId);
    }
    function checkAsyncSchema(it) {
      if (it.schema.$async && !it.schemaEnv.$async)
        throw new Error("async schema in sync schema");
    }
    function commentKeyword({ gen, schemaEnv, schema, errSchemaPath, opts }) {
      const msg = schema.$comment;
      if (opts.$comment === true) {
        gen.code((0, codegen_1._)`${names_1.default.self}.logger.log(${msg})`);
      } else if (typeof opts.$comment == "function") {
        const schemaPath = (0, codegen_1.str)`${errSchemaPath}/$comment`;
        const rootName = gen.scopeValue("root", { ref: schemaEnv.root });
        gen.code((0, codegen_1._)`${names_1.default.self}.opts.$comment(${msg}, ${schemaPath}, ${rootName}.schema)`);
      }
    }
    function returnResults(it) {
      const { gen, schemaEnv, validateName, ValidationError, opts } = it;
      if (schemaEnv.$async) {
        gen.if((0, codegen_1._)`${names_1.default.errors} === 0`, () => gen.return(names_1.default.data), () => gen.throw((0, codegen_1._)`new ${ValidationError}(${names_1.default.vErrors})`));
      } else {
        gen.assign((0, codegen_1._)`${validateName}.errors`, names_1.default.vErrors);
        if (opts.unevaluated)
          assignEvaluated(it);
        gen.return((0, codegen_1._)`${names_1.default.errors} === 0`);
      }
    }
    function assignEvaluated({ gen, evaluated, props, items }) {
      if (props instanceof codegen_1.Name)
        gen.assign((0, codegen_1._)`${evaluated}.props`, props);
      if (items instanceof codegen_1.Name)
        gen.assign((0, codegen_1._)`${evaluated}.items`, items);
    }
    function schemaKeywords(it, types, typeErrors, errsCount) {
      const { gen, schema, data, allErrors, opts, self } = it;
      const { RULES } = self;
      if (schema.$ref && (opts.ignoreKeywordsWithRef || !(0, util_1.schemaHasRulesButRef)(schema, RULES))) {
        gen.block(() => keywordCode(it, "$ref", RULES.all.$ref.definition));
        return;
      }
      if (!opts.jtd)
        checkStrictTypes(it, types);
      gen.block(() => {
        for (const group of RULES.rules)
          groupKeywords(group);
        groupKeywords(RULES.post);
      });
      function groupKeywords(group) {
        if (!(0, applicability_1.shouldUseGroup)(schema, group))
          return;
        if (group.type) {
          gen.if((0, dataType_2.checkDataType)(group.type, data, opts.strictNumbers));
          iterateKeywords(it, group);
          if (types.length === 1 && types[0] === group.type && typeErrors) {
            gen.else();
            (0, dataType_2.reportTypeError)(it);
          }
          gen.endIf();
        } else {
          iterateKeywords(it, group);
        }
        if (!allErrors)
          gen.if((0, codegen_1._)`${names_1.default.errors} === ${errsCount || 0}`);
      }
    }
    function iterateKeywords(it, group) {
      const { gen, schema, opts: { useDefaults } } = it;
      if (useDefaults)
        (0, defaults_1.assignDefaults)(it, group.type);
      gen.block(() => {
        for (const rule of group.rules) {
          if ((0, applicability_1.shouldUseRule)(schema, rule)) {
            keywordCode(it, rule.keyword, rule.definition, group.type);
          }
        }
      });
    }
    function checkStrictTypes(it, types) {
      if (it.schemaEnv.meta || !it.opts.strictTypes)
        return;
      checkContextTypes(it, types);
      if (!it.opts.allowUnionTypes)
        checkMultipleTypes(it, types);
      checkKeywordTypes(it, it.dataTypes);
    }
    function checkContextTypes(it, types) {
      if (!types.length)
        return;
      if (!it.dataTypes.length) {
        it.dataTypes = types;
        return;
      }
      types.forEach((t) => {
        if (!includesType(it.dataTypes, t)) {
          strictTypesError(it, `type "${t}" not allowed by context "${it.dataTypes.join(",")}"`);
        }
      });
      narrowSchemaTypes(it, types);
    }
    function checkMultipleTypes(it, ts) {
      if (ts.length > 1 && !(ts.length === 2 && ts.includes("null"))) {
        strictTypesError(it, "use allowUnionTypes to allow union type keyword");
      }
    }
    function checkKeywordTypes(it, ts) {
      const rules = it.self.RULES.all;
      for (const keyword in rules) {
        const rule = rules[keyword];
        if (typeof rule == "object" && (0, applicability_1.shouldUseRule)(it.schema, rule)) {
          const { type } = rule.definition;
          if (type.length && !type.some((t) => hasApplicableType(ts, t))) {
            strictTypesError(it, `missing type "${type.join(",")}" for keyword "${keyword}"`);
          }
        }
      }
    }
    function hasApplicableType(schTs, kwdT) {
      return schTs.includes(kwdT) || kwdT === "number" && schTs.includes("integer");
    }
    function includesType(ts, t) {
      return ts.includes(t) || t === "integer" && ts.includes("number");
    }
    function narrowSchemaTypes(it, withTypes) {
      const ts = [];
      for (const t of it.dataTypes) {
        if (includesType(withTypes, t))
          ts.push(t);
        else if (withTypes.includes("integer") && t === "number")
          ts.push("integer");
      }
      it.dataTypes = ts;
    }
    function strictTypesError(it, msg) {
      const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
      msg += ` at "${schemaPath}" (strictTypes)`;
      (0, util_1.checkStrictMode)(it, msg, it.opts.strictTypes);
    }
    var KeywordCxt = class {
      constructor(it, def, keyword) {
        (0, keyword_1.validateKeywordUsage)(it, def, keyword);
        this.gen = it.gen;
        this.allErrors = it.allErrors;
        this.keyword = keyword;
        this.data = it.data;
        this.schema = it.schema[keyword];
        this.$data = def.$data && it.opts.$data && this.schema && this.schema.$data;
        this.schemaValue = (0, util_1.schemaRefOrVal)(it, this.schema, keyword, this.$data);
        this.schemaType = def.schemaType;
        this.parentSchema = it.schema;
        this.params = {};
        this.it = it;
        this.def = def;
        if (this.$data) {
          this.schemaCode = it.gen.const("vSchema", getData(this.$data, it));
        } else {
          this.schemaCode = this.schemaValue;
          if (!(0, keyword_1.validSchemaType)(this.schema, def.schemaType, def.allowUndefined)) {
            throw new Error(`${keyword} value must be ${JSON.stringify(def.schemaType)}`);
          }
        }
        if ("code" in def ? def.trackErrors : def.errors !== false) {
          this.errsCount = it.gen.const("_errs", names_1.default.errors);
        }
      }
      result(condition, successAction, failAction) {
        this.failResult((0, codegen_1.not)(condition), successAction, failAction);
      }
      failResult(condition, successAction, failAction) {
        this.gen.if(condition);
        if (failAction)
          failAction();
        else
          this.error();
        if (successAction) {
          this.gen.else();
          successAction();
          if (this.allErrors)
            this.gen.endIf();
        } else {
          if (this.allErrors)
            this.gen.endIf();
          else
            this.gen.else();
        }
      }
      pass(condition, failAction) {
        this.failResult((0, codegen_1.not)(condition), void 0, failAction);
      }
      fail(condition) {
        if (condition === void 0) {
          this.error();
          if (!this.allErrors)
            this.gen.if(false);
          return;
        }
        this.gen.if(condition);
        this.error();
        if (this.allErrors)
          this.gen.endIf();
        else
          this.gen.else();
      }
      fail$data(condition) {
        if (!this.$data)
          return this.fail(condition);
        const { schemaCode } = this;
        this.fail((0, codegen_1._)`${schemaCode} !== undefined && (${(0, codegen_1.or)(this.invalid$data(), condition)})`);
      }
      error(append, errorParams, errorPaths) {
        if (errorParams) {
          this.setParams(errorParams);
          this._error(append, errorPaths);
          this.setParams({});
          return;
        }
        this._error(append, errorPaths);
      }
      _error(append, errorPaths) {
        ;
        (append ? errors_1.reportExtraError : errors_1.reportError)(this, this.def.error, errorPaths);
      }
      $dataError() {
        (0, errors_1.reportError)(this, this.def.$dataError || errors_1.keyword$DataError);
      }
      reset() {
        if (this.errsCount === void 0)
          throw new Error('add "trackErrors" to keyword definition');
        (0, errors_1.resetErrorsCount)(this.gen, this.errsCount);
      }
      ok(cond) {
        if (!this.allErrors)
          this.gen.if(cond);
      }
      setParams(obj, assign) {
        if (assign)
          Object.assign(this.params, obj);
        else
          this.params = obj;
      }
      block$data(valid, codeBlock, $dataValid = codegen_1.nil) {
        this.gen.block(() => {
          this.check$data(valid, $dataValid);
          codeBlock();
        });
      }
      check$data(valid = codegen_1.nil, $dataValid = codegen_1.nil) {
        if (!this.$data)
          return;
        const { gen, schemaCode, schemaType, def } = this;
        gen.if((0, codegen_1.or)((0, codegen_1._)`${schemaCode} === undefined`, $dataValid));
        if (valid !== codegen_1.nil)
          gen.assign(valid, true);
        if (schemaType.length || def.validateSchema) {
          gen.elseIf(this.invalid$data());
          this.$dataError();
          if (valid !== codegen_1.nil)
            gen.assign(valid, false);
        }
        gen.else();
      }
      invalid$data() {
        const { gen, schemaCode, schemaType, def, it } = this;
        return (0, codegen_1.or)(wrong$DataType(), invalid$DataSchema());
        function wrong$DataType() {
          if (schemaType.length) {
            if (!(schemaCode instanceof codegen_1.Name))
              throw new Error("ajv implementation error");
            const st = Array.isArray(schemaType) ? schemaType : [schemaType];
            return (0, codegen_1._)`${(0, dataType_2.checkDataTypes)(st, schemaCode, it.opts.strictNumbers, dataType_2.DataType.Wrong)}`;
          }
          return codegen_1.nil;
        }
        function invalid$DataSchema() {
          if (def.validateSchema) {
            const validateSchemaRef = gen.scopeValue("validate$data", { ref: def.validateSchema });
            return (0, codegen_1._)`!${validateSchemaRef}(${schemaCode})`;
          }
          return codegen_1.nil;
        }
      }
      subschema(appl, valid) {
        const subschema = (0, subschema_1.getSubschema)(this.it, appl);
        (0, subschema_1.extendSubschemaData)(subschema, this.it, appl);
        (0, subschema_1.extendSubschemaMode)(subschema, appl);
        const nextContext = { ...this.it, ...subschema, items: void 0, props: void 0 };
        subschemaCode(nextContext, valid);
        return nextContext;
      }
      mergeEvaluated(schemaCxt, toName) {
        const { it, gen } = this;
        if (!it.opts.unevaluated)
          return;
        if (it.props !== true && schemaCxt.props !== void 0) {
          it.props = util_1.mergeEvaluated.props(gen, schemaCxt.props, it.props, toName);
        }
        if (it.items !== true && schemaCxt.items !== void 0) {
          it.items = util_1.mergeEvaluated.items(gen, schemaCxt.items, it.items, toName);
        }
      }
      mergeValidEvaluated(schemaCxt, valid) {
        const { it, gen } = this;
        if (it.opts.unevaluated && (it.props !== true || it.items !== true)) {
          gen.if(valid, () => this.mergeEvaluated(schemaCxt, codegen_1.Name));
          return true;
        }
      }
    };
    exports.KeywordCxt = KeywordCxt;
    function keywordCode(it, keyword, def, ruleType) {
      const cxt = new KeywordCxt(it, def, keyword);
      if ("code" in def) {
        def.code(cxt, ruleType);
      } else if (cxt.$data && def.validate) {
        (0, keyword_1.funcKeywordCode)(cxt, def);
      } else if ("macro" in def) {
        (0, keyword_1.macroKeywordCode)(cxt, def);
      } else if (def.compile || def.validate) {
        (0, keyword_1.funcKeywordCode)(cxt, def);
      }
    }
    var JSON_POINTER = /^\/(?:[^~]|~0|~1)*$/;
    var RELATIVE_JSON_POINTER = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
    function getData($data, { dataLevel, dataNames, dataPathArr }) {
      let jsonPointer;
      let data;
      if ($data === "")
        return names_1.default.rootData;
      if ($data[0] === "/") {
        if (!JSON_POINTER.test($data))
          throw new Error(`Invalid JSON-pointer: ${$data}`);
        jsonPointer = $data;
        data = names_1.default.rootData;
      } else {
        const matches = RELATIVE_JSON_POINTER.exec($data);
        if (!matches)
          throw new Error(`Invalid JSON-pointer: ${$data}`);
        const up = +matches[1];
        jsonPointer = matches[2];
        if (jsonPointer === "#") {
          if (up >= dataLevel)
            throw new Error(errorMsg("property/index", up));
          return dataPathArr[dataLevel - up];
        }
        if (up > dataLevel)
          throw new Error(errorMsg("data", up));
        data = dataNames[dataLevel - up];
        if (!jsonPointer)
          return data;
      }
      let expr = data;
      const segments = jsonPointer.split("/");
      for (const segment of segments) {
        if (segment) {
          data = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)((0, util_1.unescapeJsonPointer)(segment))}`;
          expr = (0, codegen_1._)`${expr} && ${data}`;
        }
      }
      return expr;
      function errorMsg(pointerType, up) {
        return `Cannot access ${pointerType} ${up} levels up, current level is ${dataLevel}`;
      }
    }
    exports.getData = getData;
  }
});

// node_modules/ajv/dist/runtime/validation_error.js
var require_validation_error = __commonJS({
  "node_modules/ajv/dist/runtime/validation_error.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ValidationError = class extends Error {
      constructor(errors) {
        super("validation failed");
        this.errors = errors;
        this.ajv = this.validation = true;
      }
    };
    exports.default = ValidationError;
  }
});

// node_modules/ajv/dist/compile/ref_error.js
var require_ref_error = __commonJS({
  "node_modules/ajv/dist/compile/ref_error.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var resolve_1 = require_resolve();
    var MissingRefError = class extends Error {
      constructor(resolver, baseId, ref, msg) {
        super(msg || `can't resolve reference ${ref} from id ${baseId}`);
        this.missingRef = (0, resolve_1.resolveUrl)(resolver, baseId, ref);
        this.missingSchema = (0, resolve_1.normalizeId)((0, resolve_1.getFullPath)(resolver, this.missingRef));
      }
    };
    exports.default = MissingRefError;
  }
});

// node_modules/ajv/dist/compile/index.js
var require_compile = __commonJS({
  "node_modules/ajv/dist/compile/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resolveSchema = exports.getCompilingSchema = exports.resolveRef = exports.compileSchema = exports.SchemaEnv = void 0;
    var codegen_1 = require_codegen();
    var validation_error_1 = require_validation_error();
    var names_1 = require_names();
    var resolve_1 = require_resolve();
    var util_1 = require_util();
    var validate_1 = require_validate();
    var SchemaEnv = class {
      constructor(env) {
        var _a3;
        this.refs = {};
        this.dynamicAnchors = {};
        let schema;
        if (typeof env.schema == "object")
          schema = env.schema;
        this.schema = env.schema;
        this.schemaId = env.schemaId;
        this.root = env.root || this;
        this.baseId = (_a3 = env.baseId) !== null && _a3 !== void 0 ? _a3 : (0, resolve_1.normalizeId)(schema === null || schema === void 0 ? void 0 : schema[env.schemaId || "$id"]);
        this.schemaPath = env.schemaPath;
        this.localRefs = env.localRefs;
        this.meta = env.meta;
        this.$async = schema === null || schema === void 0 ? void 0 : schema.$async;
        this.refs = {};
      }
    };
    exports.SchemaEnv = SchemaEnv;
    function compileSchema(sch) {
      const _sch = getCompilingSchema.call(this, sch);
      if (_sch)
        return _sch;
      const rootId = (0, resolve_1.getFullPath)(this.opts.uriResolver, sch.root.baseId);
      const { es5, lines } = this.opts.code;
      const { ownProperties } = this.opts;
      const gen = new codegen_1.CodeGen(this.scope, { es5, lines, ownProperties });
      let _ValidationError;
      if (sch.$async) {
        _ValidationError = gen.scopeValue("Error", {
          ref: validation_error_1.default,
          code: (0, codegen_1._)`require("ajv/dist/runtime/validation_error").default`
        });
      }
      const validateName = gen.scopeName("validate");
      sch.validateName = validateName;
      const schemaCxt = {
        gen,
        allErrors: this.opts.allErrors,
        data: names_1.default.data,
        parentData: names_1.default.parentData,
        parentDataProperty: names_1.default.parentDataProperty,
        dataNames: [names_1.default.data],
        dataPathArr: [codegen_1.nil],
        // TODO can its length be used as dataLevel if nil is removed?
        dataLevel: 0,
        dataTypes: [],
        definedProperties: /* @__PURE__ */ new Set(),
        topSchemaRef: gen.scopeValue("schema", this.opts.code.source === true ? { ref: sch.schema, code: (0, codegen_1.stringify)(sch.schema) } : { ref: sch.schema }),
        validateName,
        ValidationError: _ValidationError,
        schema: sch.schema,
        schemaEnv: sch,
        rootId,
        baseId: sch.baseId || rootId,
        schemaPath: codegen_1.nil,
        errSchemaPath: sch.schemaPath || (this.opts.jtd ? "" : "#"),
        errorPath: (0, codegen_1._)`""`,
        opts: this.opts,
        self: this
      };
      let sourceCode;
      try {
        this._compilations.add(sch);
        (0, validate_1.validateFunctionCode)(schemaCxt);
        gen.optimize(this.opts.code.optimize);
        const validateCode = gen.toString();
        sourceCode = `${gen.scopeRefs(names_1.default.scope)}return ${validateCode}`;
        if (this.opts.code.process)
          sourceCode = this.opts.code.process(sourceCode, sch);
        const makeValidate = new Function(`${names_1.default.self}`, `${names_1.default.scope}`, sourceCode);
        const validate = makeValidate(this, this.scope.get());
        this.scope.value(validateName, { ref: validate });
        validate.errors = null;
        validate.schema = sch.schema;
        validate.schemaEnv = sch;
        if (sch.$async)
          validate.$async = true;
        if (this.opts.code.source === true) {
          validate.source = { validateName, validateCode, scopeValues: gen._values };
        }
        if (this.opts.unevaluated) {
          const { props, items } = schemaCxt;
          validate.evaluated = {
            props: props instanceof codegen_1.Name ? void 0 : props,
            items: items instanceof codegen_1.Name ? void 0 : items,
            dynamicProps: props instanceof codegen_1.Name,
            dynamicItems: items instanceof codegen_1.Name
          };
          if (validate.source)
            validate.source.evaluated = (0, codegen_1.stringify)(validate.evaluated);
        }
        sch.validate = validate;
        return sch;
      } catch (e) {
        delete sch.validate;
        delete sch.validateName;
        if (sourceCode)
          this.logger.error("Error compiling schema, function code:", sourceCode);
        throw e;
      } finally {
        this._compilations.delete(sch);
      }
    }
    exports.compileSchema = compileSchema;
    function resolveRef(root, baseId, ref) {
      var _a3;
      ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, ref);
      const schOrFunc = root.refs[ref];
      if (schOrFunc)
        return schOrFunc;
      let _sch = resolve.call(this, root, ref);
      if (_sch === void 0) {
        const schema = (_a3 = root.localRefs) === null || _a3 === void 0 ? void 0 : _a3[ref];
        const { schemaId } = this.opts;
        if (schema)
          _sch = new SchemaEnv({ schema, schemaId, root, baseId });
      }
      if (_sch === void 0)
        return;
      return root.refs[ref] = inlineOrCompile.call(this, _sch);
    }
    exports.resolveRef = resolveRef;
    function inlineOrCompile(sch) {
      if ((0, resolve_1.inlineRef)(sch.schema, this.opts.inlineRefs))
        return sch.schema;
      return sch.validate ? sch : compileSchema.call(this, sch);
    }
    function getCompilingSchema(schEnv) {
      for (const sch of this._compilations) {
        if (sameSchemaEnv(sch, schEnv))
          return sch;
      }
    }
    exports.getCompilingSchema = getCompilingSchema;
    function sameSchemaEnv(s1, s2) {
      return s1.schema === s2.schema && s1.root === s2.root && s1.baseId === s2.baseId;
    }
    function resolve(root, ref) {
      let sch;
      while (typeof (sch = this.refs[ref]) == "string")
        ref = sch;
      return sch || this.schemas[ref] || resolveSchema.call(this, root, ref);
    }
    function resolveSchema(root, ref) {
      const p = this.opts.uriResolver.parse(ref);
      const refPath = (0, resolve_1._getFullPath)(this.opts.uriResolver, p);
      let baseId = (0, resolve_1.getFullPath)(this.opts.uriResolver, root.baseId, void 0);
      if (Object.keys(root.schema).length > 0 && refPath === baseId) {
        return getJsonPointer.call(this, p, root);
      }
      const id = (0, resolve_1.normalizeId)(refPath);
      const schOrRef = this.refs[id] || this.schemas[id];
      if (typeof schOrRef == "string") {
        const sch = resolveSchema.call(this, root, schOrRef);
        if (typeof (sch === null || sch === void 0 ? void 0 : sch.schema) !== "object")
          return;
        return getJsonPointer.call(this, p, sch);
      }
      if (typeof (schOrRef === null || schOrRef === void 0 ? void 0 : schOrRef.schema) !== "object")
        return;
      if (!schOrRef.validate)
        compileSchema.call(this, schOrRef);
      if (id === (0, resolve_1.normalizeId)(ref)) {
        const { schema } = schOrRef;
        const { schemaId } = this.opts;
        const schId = schema[schemaId];
        if (schId)
          baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
        return new SchemaEnv({ schema, schemaId, root, baseId });
      }
      return getJsonPointer.call(this, p, schOrRef);
    }
    exports.resolveSchema = resolveSchema;
    var PREVENT_SCOPE_CHANGE = /* @__PURE__ */ new Set([
      "properties",
      "patternProperties",
      "enum",
      "dependencies",
      "definitions"
    ]);
    function getJsonPointer(parsedRef, { baseId, schema, root }) {
      var _a3;
      if (((_a3 = parsedRef.fragment) === null || _a3 === void 0 ? void 0 : _a3[0]) !== "/")
        return;
      for (const part of parsedRef.fragment.slice(1).split("/")) {
        if (typeof schema === "boolean")
          return;
        const partSchema = schema[(0, util_1.unescapeFragment)(part)];
        if (partSchema === void 0)
          return;
        schema = partSchema;
        const schId = typeof schema === "object" && schema[this.opts.schemaId];
        if (!PREVENT_SCOPE_CHANGE.has(part) && schId) {
          baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
        }
      }
      let env;
      if (typeof schema != "boolean" && schema.$ref && !(0, util_1.schemaHasRulesButRef)(schema, this.RULES)) {
        const $ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schema.$ref);
        env = resolveSchema.call(this, root, $ref);
      }
      const { schemaId } = this.opts;
      env = env || new SchemaEnv({ schema, schemaId, root, baseId });
      if (env.schema !== env.root.schema)
        return env;
      return void 0;
    }
  }
});

// node_modules/ajv/dist/refs/data.json
var require_data = __commonJS({
  "node_modules/ajv/dist/refs/data.json"(exports, module) {
    module.exports = {
      $id: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#",
      description: "Meta-schema for $data reference (JSON AnySchema extension proposal)",
      type: "object",
      required: ["$data"],
      properties: {
        $data: {
          type: "string",
          anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }]
        }
      },
      additionalProperties: false
    };
  }
});

// node_modules/fast-uri/lib/utils.js
var require_utils = __commonJS({
  "node_modules/fast-uri/lib/utils.js"(exports, module) {
    "use strict";
    var isUUID = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu);
    var isIPv4 = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
    var isPort = RegExp.prototype.test.bind(/^\d*$/u);
    var isHexPair = RegExp.prototype.test.bind(/^[\da-f]{2}$/iu);
    var isUnreserved = RegExp.prototype.test.bind(/^[\da-z\-._~]$/iu);
    var isPathCharacter = RegExp.prototype.test.bind(/^[A-Za-z0-9\-._~!$&'()*+,;=:@/]$/u);
    var isQueryFragmentCharacter = RegExp.prototype.test.bind(/^[A-Za-z0-9\-._~!$&'()*+,;=:@/?]$/u);
    var isUserinfoCharacter = RegExp.prototype.test.bind(/^[A-Za-z0-9\-._~!$&'()*+,;=:]$/u);
    var BYTE_HEX = new Array(256);
    {
      const HEX_DIGITS = "0123456789ABCDEF";
      for (let i = 0; i < 256; i++) {
        BYTE_HEX[i] = "%" + HEX_DIGITS[i >> 4] + HEX_DIGITS[i & 15];
      }
    }
    function percentEncodeNonAscii(cp) {
      if (cp < 2048) {
        return BYTE_HEX[192 | cp >> 6] + BYTE_HEX[128 | cp & 63];
      }
      if (cp < 65536) {
        return BYTE_HEX[224 | cp >> 12] + BYTE_HEX[128 | cp >> 6 & 63] + BYTE_HEX[128 | cp & 63];
      }
      return BYTE_HEX[240 | cp >> 18] + BYTE_HEX[128 | cp >> 12 & 63] + BYTE_HEX[128 | cp >> 6 & 63] + BYTE_HEX[128 | cp & 63];
    }
    function stringArrayToHexStripped(input) {
      let acc = "";
      let code2 = 0;
      let i = 0;
      for (i = 0; i < input.length; i++) {
        code2 = input[i].charCodeAt(0);
        if (code2 === 48) {
          continue;
        }
        if (!(code2 >= 48 && code2 <= 57 || code2 >= 65 && code2 <= 70 || code2 >= 97 && code2 <= 102)) {
          return "";
        }
        acc += input[i];
        break;
      }
      for (i += 1; i < input.length; i++) {
        code2 = input[i].charCodeAt(0);
        if (!(code2 >= 48 && code2 <= 57 || code2 >= 65 && code2 <= 70 || code2 >= 97 && code2 <= 102)) {
          return "";
        }
        acc += input[i];
      }
      return acc;
    }
    var isHextet = RegExp.prototype.test.bind(/^[\dA-Fa-f]{1,4}$/);
    var isIPvFuture = RegExp.prototype.test.bind(/^[vV][\dA-Fa-f]+\.[A-Za-z\d\-._~!$&'()*+,;=:]+$/);
    var isZoneCharacter = RegExp.prototype.test.bind(/^[A-Za-z\d\-._~]$/);
    var nonSimpleDomain = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
    function isZoneIdentifier(zone) {
      if (zone.length === 0) return false;
      for (let i = 0; i < zone.length; i++) {
        if (isZoneCharacter(zone[i])) continue;
        if (zone[i] === "%" && i + 2 < zone.length && isHexPair(zone.slice(i + 1, i + 3))) {
          i += 2;
          continue;
        }
        return false;
      }
      return true;
    }
    function compressIPv6ZeroRun(hextets) {
      let bestStart = -1;
      let bestLength = 0;
      let runStart = -1;
      let runLength = 0;
      for (let i = 0; i < hextets.length; i++) {
        if (hextets[i] === "0") {
          if (runStart === -1) runStart = i;
          runLength++;
          if (runLength > bestLength) {
            bestLength = runLength;
            bestStart = runStart;
          }
        } else {
          runStart = -1;
          runLength = 0;
        }
      }
      if (bestLength < 2) return hextets.join(":");
      const head = hextets.slice(0, bestStart).join(":");
      const tail = hextets.slice(bestStart + bestLength).join(":");
      return head + "::" + tail;
    }
    function normalizeIPv6Address(input) {
      const compression = input.indexOf("::");
      if (compression !== -1 && input.indexOf("::", compression + 1) !== -1) return void 0;
      const left = compression === -1 ? input.split(":") : input.slice(0, compression).split(":");
      const right = compression === -1 ? [] : input.slice(compression + 2).split(":");
      if (compression !== -1) {
        if (left.length === 1 && left[0] === "") left.length = 0;
        if (right.length === 1 && right[0] === "") right.length = 0;
      }
      const parts = left.concat(right);
      let hextetCount = 0;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part === "") return void 0;
        if (part.indexOf(".") !== -1) {
          if (i !== parts.length - 1 || compression !== -1 && right.length === 0 || !isIPv4(part)) return void 0;
          hextetCount += 2;
          continue;
        }
        if (!isHextet(part)) return void 0;
        parts[i] = parseInt(part, 16).toString(16);
        hextetCount++;
      }
      if (compression === -1) {
        if (hextetCount !== 8) return void 0;
        return compressIPv6ZeroRun(parts);
      }
      if (hextetCount >= 8) return void 0;
      const expanded = parts.slice(0, left.length);
      for (let i = hextetCount; i < 8; i++) expanded.push("0");
      for (let i = left.length; i < parts.length; i++) expanded.push(parts[i]);
      return compressIPv6ZeroRun(expanded);
    }
    function normalizeIPv6(host) {
      const bracketed = host[0] === "[" && host[host.length - 1] === "]";
      const hasBracket = host[0] === "[" || host[host.length - 1] === "]";
      if (hasBracket && !bracketed) return { host, isIPV6: false, error: true };
      let input = bracketed ? host.slice(1, -1) : host;
      if (bracketed && isIPvFuture(input)) {
        input = input.toLowerCase();
        return { host: `[${input}]`, escapedHost: input, isIPV6: false, isIPVFuture: true };
      }
      if (findToken(input, ":") < 2) {
        return { host, isIPV6: false, error: bracketed };
      }
      let zoneIdentifier = "";
      const zoneSeparator = input.indexOf("%");
      if (zoneSeparator !== -1) {
        const separatorLength = input.slice(zoneSeparator, zoneSeparator + 3).toLowerCase() === "%25" ? 3 : 1;
        zoneIdentifier = input.slice(zoneSeparator + separatorLength);
        if (!isZoneIdentifier(zoneIdentifier)) return { host, isIPV6: false, error: true };
        input = input.slice(0, zoneSeparator);
      }
      const address = normalizeIPv6Address(input);
      if (address === void 0) return { host, isIPV6: false, error: true };
      return {
        host: address + (zoneIdentifier ? "%" + zoneIdentifier : ""),
        escapedHost: address + (zoneIdentifier ? "%25" + zoneIdentifier : ""),
        isIPV6: true
      };
    }
    function findToken(str, token) {
      let ind = 0;
      for (let i = 0; i < str.length; i++) {
        if (str[i] === token) ind++;
      }
      return ind;
    }
    function removeDotSegments(path) {
      let input = path;
      const output = [];
      let nextSlash = -1;
      let len = 0;
      while (len = input.length) {
        if (len === 1) {
          if (input === ".") {
            break;
          } else if (input === "/") {
            output.push("/");
            break;
          } else {
            output.push(input);
            break;
          }
        } else if (len === 2) {
          if (input[0] === ".") {
            if (input[1] === ".") {
              break;
            } else if (input[1] === "/") {
              input = input.slice(2);
              continue;
            }
          } else if (input[0] === "/") {
            if (input[1] === "." || input[1] === "/") {
              output.push("/");
              break;
            }
          }
        } else if (len === 3) {
          if (input === "/..") {
            if (output.length !== 0) {
              output.pop();
            }
            output.push("/");
            break;
          }
        }
        if (input[0] === ".") {
          if (input[1] === ".") {
            if (input[2] === "/") {
              input = input.slice(3);
              continue;
            }
          } else if (input[1] === "/") {
            input = input.slice(2);
            continue;
          }
        } else if (input[0] === "/") {
          if (input[1] === ".") {
            if (input[2] === "/") {
              input = input.slice(2);
              continue;
            } else if (input[2] === ".") {
              if (input[3] === "/") {
                input = input.slice(3);
                if (output.length !== 0) {
                  output.pop();
                }
                continue;
              }
            }
          }
        }
        if ((nextSlash = input.indexOf("/", 1)) === -1) {
          output.push(input);
          break;
        } else {
          output.push(input.slice(0, nextSlash));
          input = input.slice(nextSlash);
        }
      }
      return output.join("");
    }
    var HOST_DELIMS = { "@": "%40", "/": "%2F", "?": "%3F", "#": "%23", ":": "%3A" };
    var HOST_DELIM_RE = /[@/?#:]/g;
    var HOST_DELIM_NO_COLON_RE = /[@/?#]/g;
    function reescapeHostDelimiters(host, isIP) {
      const re = isIP ? HOST_DELIM_NO_COLON_RE : HOST_DELIM_RE;
      re.lastIndex = 0;
      return host.replace(re, (ch) => HOST_DELIMS[ch]);
    }
    function normalizePercentEncoding(input, decodeUnreserved = false) {
      if (input.indexOf("%") === -1) {
        return input;
      }
      let output = "";
      for (let i = 0; i < input.length; i++) {
        if (input[i] === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            const normalizedHex = hex.toUpperCase();
            const decoded = String.fromCharCode(parseInt(normalizedHex, 16));
            if (decodeUnreserved && isUnreserved(decoded)) {
              output += decoded;
            } else {
              output += "%" + normalizedHex;
            }
            i += 2;
            continue;
          }
        }
        output += input[i];
      }
      return output;
    }
    function normalizePathEncoding(input) {
      let output = "";
      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (ch === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            const normalizedHex = hex.toUpperCase();
            const decoded = String.fromCharCode(parseInt(normalizedHex, 16));
            if (decoded !== "." && isUnreserved(decoded)) {
              output += decoded;
            } else {
              output += "%" + normalizedHex;
            }
            i += 2;
            continue;
          }
        }
        if (isPathCharacter(ch)) {
          output += ch;
        } else {
          const code2 = input.charCodeAt(i);
          if (code2 < 128) {
            output += isEscapeSafe(code2) ? ch : BYTE_HEX[code2];
          } else if (code2 < 55296 || code2 > 57343) {
            output += percentEncodeNonAscii(code2);
          } else if (code2 <= 56319 && i + 1 < input.length) {
            const low = input.charCodeAt(i + 1);
            if (low >= 56320 && low <= 57343) {
              output += percentEncodeNonAscii(65536 + (code2 - 55296 << 10) + (low - 56320));
              i++;
            } else {
              output += percentEncodeNonAscii(65533);
            }
          } else {
            output += percentEncodeNonAscii(65533);
          }
        }
      }
      return output;
    }
    function serializePathEncoding(input, pathNoScheme = false) {
      let output = "";
      let firstSegment = pathNoScheme && input[0] !== "/";
      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (ch === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            output += "%" + hex.toUpperCase();
            i += 2;
            continue;
          }
        }
        if (ch === "/") {
          firstSegment = false;
        }
        if (isPathCharacter(ch) && (ch !== ":" || !firstSegment)) {
          output += ch;
        } else {
          const code2 = input.charCodeAt(i);
          if (code2 < 128) {
            output += BYTE_HEX[code2];
          } else if (code2 < 55296 || code2 > 57343) {
            output += percentEncodeNonAscii(code2);
          } else if (code2 <= 56319 && i + 1 < input.length) {
            const low = input.charCodeAt(i + 1);
            if (low >= 56320 && low <= 57343) {
              output += percentEncodeNonAscii(65536 + (code2 - 55296 << 10) + (low - 56320));
              i++;
            } else {
              output += percentEncodeNonAscii(65533);
            }
          } else {
            output += percentEncodeNonAscii(65533);
          }
        }
      }
      return output;
    }
    function encodeComponent(input, isAllowed) {
      let output = "";
      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (ch === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            output += "%" + hex.toUpperCase();
            i += 2;
            continue;
          }
        }
        if (isAllowed(ch)) {
          output += ch;
        } else {
          const code2 = input.charCodeAt(i);
          if (code2 < 128) {
            output += BYTE_HEX[code2];
          } else if (code2 < 55296 || code2 > 57343) {
            output += percentEncodeNonAscii(code2);
          } else if (code2 <= 56319 && i + 1 < input.length) {
            const low = input.charCodeAt(i + 1);
            if (low >= 56320 && low <= 57343) {
              output += percentEncodeNonAscii(65536 + (code2 - 55296 << 10) + (low - 56320));
              i++;
            } else {
              output += percentEncodeNonAscii(65533);
            }
          } else {
            output += percentEncodeNonAscii(65533);
          }
        }
      }
      return output;
    }
    function encodeUserinfo(input) {
      return encodeComponent(input, isUserinfoCharacter);
    }
    function encodeQuery(input) {
      return encodeComponent(input, isQueryFragmentCharacter);
    }
    function encodeFragment(input) {
      return encodeComponent(input, isQueryFragmentCharacter);
    }
    function isEscapeSafe(cp) {
      return cp >= 48 && cp <= 57 || cp >= 65 && cp <= 90 || cp >= 97 && cp <= 122 || cp === 42 || cp === 43 || cp === 45 || cp === 46 || cp === 47 || cp === 64 || cp === 95;
    }
    function normalizeQueryFragmentEncoding(input) {
      let output = "";
      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (ch === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            const normalizedHex = hex.toUpperCase();
            const decoded = String.fromCharCode(parseInt(normalizedHex, 16));
            if (isUnreserved(decoded)) {
              output += decoded;
            } else {
              output += "%" + normalizedHex;
            }
            i += 2;
            continue;
          }
        }
        if (isQueryFragmentCharacter(ch)) {
          output += ch;
        } else {
          const code2 = input.charCodeAt(i);
          if (code2 < 128) {
            output += isEscapeSafe(code2) ? ch : BYTE_HEX[code2];
          } else if (code2 < 55296 || code2 > 57343) {
            output += percentEncodeNonAscii(code2);
          } else if (code2 <= 56319 && i + 1 < input.length) {
            const low = input.charCodeAt(i + 1);
            if (low >= 56320 && low <= 57343) {
              output += percentEncodeNonAscii(65536 + (code2 - 55296 << 10) + (low - 56320));
              i++;
            } else {
              output += percentEncodeNonAscii(65533);
            }
          } else {
            output += percentEncodeNonAscii(65533);
          }
        }
      }
      return output;
    }
    function escapePreservingEscapes(input) {
      let output = "";
      for (let i = 0; i < input.length; i++) {
        if (input[i] === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            output += "%" + hex.toUpperCase();
            i += 2;
            continue;
          }
        }
        output += escape(input[i]);
      }
      return output;
    }
    function recomposeAuthority(component) {
      const uriTokens = [];
      if (component.userinfo !== void 0) {
        uriTokens.push(encodeUserinfo(component.userinfo));
        uriTokens.push("@");
      }
      if (component.host !== void 0) {
        let host = component.host;
        if (!isIPv4(host)) {
          let ipV6res = normalizeIPv6(host);
          if (ipV6res.isIPV6 !== true && ipV6res.isIPVFuture !== true) {
            host = normalizePercentEncoding(host, true);
            ipV6res = normalizeIPv6(host);
          }
          if (ipV6res.isIPV6 === true || ipV6res.isIPVFuture === true) {
            host = `[${ipV6res.escapedHost}]`;
          } else {
            host = reescapeHostDelimiters(host, false);
          }
        }
        uriTokens.push(host);
      }
      if (typeof component.port === "number" || typeof component.port === "string") {
        const port = String(component.port);
        if (!isPort(port)) {
          throw new TypeError("URI port is malformed.");
        }
        uriTokens.push(":");
        uriTokens.push(port);
      }
      return uriTokens.length ? uriTokens.join("") : void 0;
    }
    module.exports = {
      nonSimpleDomain,
      recomposeAuthority,
      reescapeHostDelimiters,
      normalizePercentEncoding,
      normalizePathEncoding,
      serializePathEncoding,
      normalizeQueryFragmentEncoding,
      encodeUserinfo,
      encodeQuery,
      encodeFragment,
      escapePreservingEscapes,
      removeDotSegments,
      isIPv4,
      isUUID,
      normalizeIPv6,
      stringArrayToHexStripped
    };
  }
});

// node_modules/fast-uri/lib/schemes.js
var require_schemes = __commonJS({
  "node_modules/fast-uri/lib/schemes.js"(exports, module) {
    "use strict";
    var { isUUID } = require_utils();
    var URN_REG = /^([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-./:;=@]|%[\da-f]{2})+)$/iu;
    var supportedSchemeNames = (
      /** @type {const} */
      [
        "http",
        "https",
        "ws",
        "wss",
        "urn",
        "urn:uuid"
      ]
    );
    function isValidSchemeName(name) {
      return supportedSchemeNames.indexOf(
        /** @type {*} */
        name
      ) !== -1;
    }
    function wsIsSecure(wsComponent) {
      if (wsComponent.secure === true) {
        return true;
      } else if (wsComponent.secure === false) {
        return false;
      } else if (wsComponent.scheme) {
        return wsComponent.scheme.length === 3 && (wsComponent.scheme[0] === "w" || wsComponent.scheme[0] === "W") && (wsComponent.scheme[1] === "s" || wsComponent.scheme[1] === "S") && (wsComponent.scheme[2] === "s" || wsComponent.scheme[2] === "S");
      } else {
        return false;
      }
    }
    function httpParse(component) {
      if (!component.host) {
        component.error = component.error || "HTTP URIs must have a host.";
      }
      return component;
    }
    function httpSerialize(component) {
      const secure = String(component.scheme).toLowerCase() === "https";
      if (component.port === (secure ? 443 : 80) || component.port === "") {
        component.port = void 0;
      }
      if (!component.path) {
        component.path = "/";
      }
      return component;
    }
    function wsParse(wsComponent) {
      wsComponent.secure = wsIsSecure(wsComponent);
      wsComponent.resourceName = (wsComponent.path || "/") + (wsComponent.query ? "?" + wsComponent.query : "");
      wsComponent.path = void 0;
      wsComponent.query = void 0;
      return wsComponent;
    }
    function wsSerialize(wsComponent) {
      if (wsComponent.port === (wsIsSecure(wsComponent) ? 443 : 80) || wsComponent.port === "") {
        wsComponent.port = void 0;
      }
      if (typeof wsComponent.secure === "boolean") {
        wsComponent.scheme = wsComponent.secure ? "wss" : "ws";
        wsComponent.secure = void 0;
      }
      if (wsComponent.resourceName) {
        const queryIndex = wsComponent.resourceName.indexOf("?");
        const path = queryIndex === -1 ? wsComponent.resourceName : wsComponent.resourceName.slice(0, queryIndex);
        wsComponent.path = path && path !== "/" ? path : void 0;
        wsComponent.query = queryIndex === -1 ? void 0 : wsComponent.resourceName.slice(queryIndex + 1);
        wsComponent.resourceName = void 0;
      }
      wsComponent.fragment = void 0;
      return wsComponent;
    }
    function urnParse(urnComponent, options) {
      if (!urnComponent.path) {
        urnComponent.error = "URN can not be parsed";
        return urnComponent;
      }
      const matches = urnComponent.path.match(URN_REG);
      if (matches && matches[0] === urnComponent.path) {
        const scheme = options.scheme || urnComponent.scheme || "urn";
        urnComponent.nid = matches[1].toLowerCase();
        urnComponent.nss = matches[2];
        const urnScheme = `${scheme}:${options.nid || urnComponent.nid}`;
        const schemeHandler = getSchemeHandler(urnScheme);
        urnComponent.path = void 0;
        if (schemeHandler) {
          urnComponent = schemeHandler.parse(urnComponent, options);
        }
      } else {
        urnComponent.error = urnComponent.error || "URN can not be parsed.";
      }
      return urnComponent;
    }
    function urnSerialize(urnComponent, options) {
      if (urnComponent.nid === void 0) {
        throw new Error("URN without nid cannot be serialized");
      }
      const scheme = options.scheme || urnComponent.scheme || "urn";
      const nid = urnComponent.nid.toLowerCase();
      const urnScheme = `${scheme}:${options.nid || nid}`;
      const schemeHandler = getSchemeHandler(urnScheme);
      if (schemeHandler) {
        urnComponent = schemeHandler.serialize(urnComponent, options);
      }
      const uriComponent = urnComponent;
      const nss = urnComponent.nss;
      uriComponent.path = `${nid || options.nid}:${nss}`;
      options.skipEscape = true;
      return uriComponent;
    }
    function urnuuidParse(urnComponent, options) {
      const uuidComponent = urnComponent;
      uuidComponent.uuid = uuidComponent.nss;
      uuidComponent.nss = void 0;
      if (!options.tolerant && (!uuidComponent.uuid || !isUUID(uuidComponent.uuid))) {
        uuidComponent.error = uuidComponent.error || "UUID is not valid.";
      }
      return uuidComponent;
    }
    function urnuuidSerialize(uuidComponent) {
      const urnComponent = uuidComponent;
      urnComponent.nss = (uuidComponent.uuid || "").toLowerCase();
      return urnComponent;
    }
    var http = (
      /** @type {SchemeHandler} */
      {
        scheme: "http",
        domainHost: true,
        parse: httpParse,
        serialize: httpSerialize
      }
    );
    var https = (
      /** @type {SchemeHandler} */
      {
        scheme: "https",
        domainHost: http.domainHost,
        parse: httpParse,
        serialize: httpSerialize
      }
    );
    var ws = (
      /** @type {SchemeHandler} */
      {
        scheme: "ws",
        domainHost: true,
        parse: wsParse,
        serialize: wsSerialize
      }
    );
    var wss = (
      /** @type {SchemeHandler} */
      {
        scheme: "wss",
        domainHost: ws.domainHost,
        parse: ws.parse,
        serialize: ws.serialize
      }
    );
    var urn = (
      /** @type {SchemeHandler} */
      {
        scheme: "urn",
        parse: urnParse,
        serialize: urnSerialize,
        skipNormalize: true
      }
    );
    var urnuuid = (
      /** @type {SchemeHandler} */
      {
        scheme: "urn:uuid",
        parse: urnuuidParse,
        serialize: urnuuidSerialize,
        skipNormalize: true
      }
    );
    var SCHEMES = (
      /** @type {Record<SchemeName, SchemeHandler>} */
      {
        http,
        https,
        ws,
        wss,
        urn,
        "urn:uuid": urnuuid
      }
    );
    Object.setPrototypeOf(SCHEMES, null);
    function getSchemeHandler(scheme) {
      return scheme && (SCHEMES[
        /** @type {SchemeName} */
        scheme
      ] || SCHEMES[
        /** @type {SchemeName} */
        scheme.toLowerCase()
      ]) || void 0;
    }
    module.exports = {
      wsIsSecure,
      SCHEMES,
      isValidSchemeName,
      getSchemeHandler
    };
  }
});

// node_modules/fast-uri/index.js
var require_fast_uri = __commonJS({
  "node_modules/fast-uri/index.js"(exports, module) {
    "use strict";
    var { normalizeIPv6, removeDotSegments, recomposeAuthority, normalizePercentEncoding, normalizePathEncoding, serializePathEncoding, normalizeQueryFragmentEncoding, encodeQuery, encodeFragment, reescapeHostDelimiters, isIPv4, nonSimpleDomain } = require_utils();
    var { SCHEMES, getSchemeHandler } = require_schemes();
    var VALID_SCHEME = /^[A-Za-z][A-Za-z0-9+.-]*$/u;
    var MALFORMED_SCHEME_ERROR = "URI scheme is malformed.";
    function decodeValidScheme(scheme) {
      const decodedScheme = unescape(String(scheme));
      if (!VALID_SCHEME.test(decodedScheme)) {
        throw new TypeError(MALFORMED_SCHEME_ERROR);
      }
      return decodedScheme;
    }
    function normalize(uri, options) {
      if (typeof uri === "string") {
        uri = /** @type {T} */
        normalizeString(uri, options);
      } else if (typeof uri === "object") {
        uri = /** @type {T} */
        parse4(serialize(uri, options), options);
      }
      return uri;
    }
    function resolve(baseURI, relativeURI, options) {
      const schemelessOptions = options ? Object.assign({ scheme: "null" }, options) : { scheme: "null" };
      const {
        parsed: baseParsed,
        malformedAuthorityOrPort: baseMalformed,
        malformedPercentEncoding: baseMalformedPercentEncoding,
        malformedSchemeSpecific: baseMalformedSchemeSpecific,
        malformedHost: baseMalformedHost,
        malformedScheme: baseMalformedScheme
      } = parseWithStatus(baseURI, schemelessOptions);
      const {
        parsed: relativeParsed,
        malformedAuthorityOrPort: relativeMalformed,
        malformedPercentEncoding: relativeMalformedPercentEncoding,
        malformedSchemeSpecific: relativeMalformedSchemeSpecific,
        malformedHost: relativeMalformedHost,
        malformedScheme: relativeMalformedScheme
      } = parseWithStatus(relativeURI, schemelessOptions);
      if (baseMalformed || relativeMalformed || baseMalformedPercentEncoding || relativeMalformedPercentEncoding || baseMalformedSchemeSpecific || relativeMalformedSchemeSpecific || baseMalformedHost || relativeMalformedHost || baseMalformedScheme || relativeMalformedScheme) {
        throw new Error(baseParsed.error || relativeParsed.error || "URI is malformed.");
      }
      const resolved = resolveComponent(baseParsed, relativeParsed, schemelessOptions, true);
      const resolvedSchemeHandler = getSchemeHandler(options && options.scheme || resolved.scheme);
      const resolvedHost = resolved.host;
      const resolvedHostIsIP = resolvedHost !== void 0 && resolvedHost !== "" && (isIPv4(resolvedHost) || normalizeIPv6(resolvedHost).isIPV6);
      canonicalizeHost(resolved, options || {}, resolvedSchemeHandler, resolvedHostIsIP);
      const encodedASCIIHost = resolvedHost && resolvedHost.indexOf("%") !== -1 && !new RegExp("\\P{ASCII}", "u").test(resolvedHost);
      if (resolved.error && !encodedASCIIHost) {
        throw new Error(resolved.error);
      }
      schemelessOptions.skipEscape = true;
      return serialize(resolved, schemelessOptions);
    }
    function resolveComponent(base, relative, options, skipNormalization) {
      const target = {};
      if (!skipNormalization) {
        base = parse4(serialize(base, options), options);
        relative = parse4(serialize(relative, options), options);
      }
      options = options || {};
      if (!options.tolerant && relative.scheme) {
        target.scheme = relative.scheme;
        target.userinfo = relative.userinfo;
        target.host = relative.host;
        target.port = relative.port;
        target.path = removeDotSegments(relative.path || "");
        target.query = relative.query;
      } else {
        if (relative.userinfo !== void 0 || relative.host !== void 0 || relative.port !== void 0) {
          target.userinfo = relative.userinfo;
          target.host = relative.host;
          target.port = relative.port;
          target.path = removeDotSegments(relative.path || "");
          target.query = relative.query;
        } else {
          if (!relative.path) {
            target.path = base.path;
            if (relative.query !== void 0) {
              target.query = relative.query;
            } else {
              target.query = base.query;
            }
          } else {
            if (relative.path[0] === "/") {
              target.path = removeDotSegments(relative.path);
            } else {
              if ((base.userinfo !== void 0 || base.host !== void 0 || base.port !== void 0) && !base.path) {
                target.path = "/" + relative.path;
              } else if (!base.path) {
                target.path = relative.path;
              } else {
                target.path = base.path.slice(0, base.path.lastIndexOf("/") + 1) + relative.path;
              }
              target.path = removeDotSegments(target.path);
            }
            target.query = relative.query;
          }
          target.userinfo = base.userinfo;
          target.host = base.host;
          target.port = base.port;
        }
        target.scheme = base.scheme;
      }
      target.fragment = relative.fragment;
      return target;
    }
    function equal(uriA, uriB, options) {
      const normalizedA = normalizeComparableURI(uriA, options);
      const normalizedB = normalizeComparableURI(uriB, options);
      return normalizedA !== void 0 && normalizedB !== void 0 && normalizedA === normalizedB;
    }
    function serialize(cmpts, opts) {
      const component = {
        host: cmpts.host,
        scheme: cmpts.scheme,
        userinfo: cmpts.userinfo,
        port: cmpts.port,
        path: cmpts.path,
        query: cmpts.query,
        nid: cmpts.nid,
        nss: cmpts.nss,
        uuid: cmpts.uuid,
        fragment: cmpts.fragment,
        reference: cmpts.reference,
        resourceName: cmpts.resourceName,
        secure: cmpts.secure,
        error: ""
      };
      const options = Object.assign({}, opts);
      const uriTokens = [];
      if (component.scheme) {
        component.scheme = decodeValidScheme(component.scheme);
      }
      const schemeHandler = getSchemeHandler(options.scheme || component.scheme);
      if (schemeHandler && schemeHandler.serialize) schemeHandler.serialize(component, options);
      const hasAuthority = component.userinfo !== void 0 || component.host !== void 0 || component.port !== void 0;
      const pathNoScheme = !options.skipEscape && component.scheme === void 0 && !hasAuthority;
      if (component.path !== void 0) {
        if (!options.skipEscape) {
          component.path = serializePathEncoding(component.path, pathNoScheme);
        } else {
          component.path = normalizePercentEncoding(component.path);
        }
      }
      if (options.reference !== "suffix" && component.scheme) {
        component.scheme = decodeValidScheme(component.scheme);
        uriTokens.push(component.scheme, ":");
      }
      const authority = recomposeAuthority(component);
      if (authority !== void 0) {
        if (options.reference !== "suffix") {
          uriTokens.push("//");
        }
        uriTokens.push(authority);
        if (component.path && component.path[0] !== "/") {
          uriTokens.push("/");
        }
      }
      if (component.path !== void 0) {
        let s = component.path;
        if (!options.absolutePath && (!schemeHandler || !schemeHandler.absolutePath)) {
          s = removeDotSegments(s);
        }
        if (pathNoScheme) {
          s = serializePathEncoding(s, true);
        }
        if (authority === void 0 && s[0] === "/" && s[1] === "/") {
          s = "/%2F" + s.slice(2);
        }
        uriTokens.push(s);
      }
      if (component.query !== void 0) {
        uriTokens.push("?", encodeQuery(component.query));
      }
      if (component.fragment !== void 0) {
        uriTokens.push("#", encodeFragment(component.fragment));
      }
      return uriTokens.join("");
    }
    var URI_PARSE = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
    var AUTHORITY_PREFIX = /^(?:[^#/:?]+:)?\/\/([^/?#]*)/;
    var AUTHORITY_INTRODUCER_REGION = /^(?:[^#/:?]+:)?([/\\\t\n\r]*)/;
    function getParseError(parsed, matches) {
      if (matches[2] !== void 0 && parsed.path && parsed.path[0] !== "/") {
        return 'URI path must start with "/" when authority is present.';
      }
      if (typeof parsed.port === "number" && (parsed.port < 0 || parsed.port > 65535)) {
        return "URI port is malformed.";
      }
      return void 0;
    }
    function hasMalformedPercentEncoding(component) {
      if (component === void 0) return false;
      let percent = component.indexOf("%");
      while (percent !== -1) {
        if (percent + 2 >= component.length || !/^[\da-f]{2}$/iu.test(component.slice(percent + 1, percent + 3))) {
          return true;
        }
        percent = component.indexOf("%", percent + 3);
      }
      return false;
    }
    function isIPLiteral(host) {
      return host[0] === "[" && host[host.length - 1] === "]";
    }
    function hasMalformedComponentPercentEncoding(matches) {
      const host = matches[4];
      return hasMalformedPercentEncoding(matches[3]) || host !== void 0 && !isIPLiteral(host) && hasMalformedPercentEncoding(host) || hasMalformedPercentEncoding(matches[6]) || hasMalformedPercentEncoding(matches[7]) || hasMalformedPercentEncoding(matches[8]);
    }
    function canonicalizeHost(parsed, options, schemeHandler, isIP) {
      if (!options.unicodeSupport && (!schemeHandler || !schemeHandler.unicodeSupport) && parsed.host && !isIPLiteral(parsed.host) && (options.domainHost || schemeHandler && schemeHandler.domainHost) && isIP === false && nonSimpleDomain(parsed.host)) {
        try {
          parsed.host = new URL("http://" + parsed.host).hostname;
        } catch (e) {
          parsed.error = parsed.error || "Host's domain name can not be converted to ASCII: " + e;
          return true;
        }
      }
      return false;
    }
    function parseWithStatus(uri, opts) {
      const options = Object.assign({}, opts);
      const parsed = {
        scheme: void 0,
        userinfo: void 0,
        host: "",
        port: void 0,
        path: "",
        query: void 0,
        fragment: void 0
      };
      let malformedAuthorityOrPort = false;
      let malformedPercentEncoding = false;
      let malformedSchemeSpecific = false;
      let malformedHost = false;
      let malformedIPLiteral = false;
      let malformedScheme = false;
      let isIP = false;
      if (options.reference === "suffix") {
        if (options.scheme) {
          uri = options.scheme + ":" + uri;
        } else {
          uri = "//" + uri;
        }
      }
      const authorityMatch = uri.match(AUTHORITY_PREFIX);
      if (authorityMatch !== null && authorityMatch[1].indexOf("\\") !== -1) {
        parsed.error = "URI authority must not contain a literal backslash.";
        malformedAuthorityOrPort = true;
      }
      const introducerMatch = uri.match(AUTHORITY_INTRODUCER_REGION);
      if (introducerMatch !== null) {
        const region = introducerMatch[1];
        const normalizedRegion = region.replace(/[\t\n\r]/g, "");
        if (normalizedRegion.length >= 2) {
          if (normalizedRegion.slice(0, 2) !== "//") {
            parsed.error = parsed.error || "URI authority must not contain a literal backslash.";
            malformedAuthorityOrPort = true;
          } else if (region.length !== normalizedRegion.length) {
            parsed.error = parsed.error || "URI authority introducer must not contain whitespace.";
            malformedAuthorityOrPort = true;
          }
        }
      }
      const matches = uri.match(URI_PARSE);
      if (matches) {
        parsed.scheme = matches[1];
        parsed.userinfo = matches[3];
        parsed.host = matches[4];
        parsed.port = parseInt(matches[5], 10);
        parsed.path = matches[6] || "";
        parsed.query = matches[7];
        parsed.fragment = matches[8];
        if (parsed.scheme !== void 0) {
          const decodedScheme = unescape(parsed.scheme);
          if (VALID_SCHEME.test(decodedScheme)) {
            parsed.scheme = decodedScheme.toLowerCase();
          } else {
            parsed.error = parsed.error || MALFORMED_SCHEME_ERROR;
            malformedScheme = true;
          }
        }
        malformedPercentEncoding = hasMalformedComponentPercentEncoding(matches);
        if (malformedPercentEncoding) {
          parsed.error = parsed.error || "URI contains malformed percent-encoding.";
        }
        if (isNaN(parsed.port)) {
          parsed.port = matches[5];
        }
        const parseError = getParseError(parsed, matches);
        if (parseError !== void 0) {
          parsed.error = parsed.error || parseError;
          malformedAuthorityOrPort = true;
        }
        if (parsed.host) {
          const ipv4result = isIPv4(parsed.host);
          if (ipv4result === false) {
            const bracketedIPLiteral = isIPLiteral(parsed.host);
            const hasIPLiteralBracket = parsed.host.indexOf("[") !== -1 || parsed.host.indexOf("]") !== -1;
            const ipv6result = normalizeIPv6(parsed.host);
            isIP = ipv6result.isIPV6 || ipv6result.isIPVFuture === true;
            malformedIPLiteral = hasIPLiteralBracket && (!bracketedIPLiteral || ipv6result.error === true);
            parsed.host = isIP ? ipv6result.host : ipv6result.host.toLowerCase();
            if (malformedIPLiteral) {
              parsed.error = parsed.error || "URI host is malformed.";
              malformedAuthorityOrPort = true;
            }
          } else {
            isIP = true;
          }
        }
        if (parsed.scheme === void 0 && parsed.userinfo === void 0 && parsed.host === void 0 && parsed.port === void 0 && parsed.query === void 0 && !parsed.path) {
          parsed.reference = "same-document";
        } else if (parsed.scheme === void 0) {
          parsed.reference = "relative";
        } else if (parsed.fragment === void 0) {
          parsed.reference = "absolute";
        } else {
          parsed.reference = "uri";
        }
        if (options.reference && options.reference !== "suffix" && options.reference !== parsed.reference) {
          parsed.error = parsed.error || "URI is not a " + options.reference + " reference.";
        }
        const schemeHandler = getSchemeHandler(options.scheme || parsed.scheme);
        if (!malformedIPLiteral) {
          malformedHost = canonicalizeHost(parsed, options, schemeHandler, isIP);
        }
        if (uri.indexOf("%") !== -1 && parsed.host !== void 0 && !malformedIPLiteral) {
          let host = isIP ? parsed.host : normalizePercentEncoding(parsed.host, true);
          if (!isIP) {
            host = normalizePercentEncoding(host.toLowerCase());
          }
          parsed.host = reescapeHostDelimiters(host, isIP);
        }
        if (!schemeHandler || schemeHandler && !schemeHandler.skipNormalize) {
          if (parsed.path) {
            parsed.path = normalizePathEncoding(parsed.path);
          }
          if (parsed.query) {
            parsed.query = normalizeQueryFragmentEncoding(parsed.query);
          }
          if (parsed.fragment) {
            parsed.fragment = normalizeQueryFragmentEncoding(parsed.fragment);
          }
        }
        if (schemeHandler && schemeHandler.parse) {
          schemeHandler.parse(parsed, options);
          if (schemeHandler === SCHEMES.urn && parsed.nid === void 0) {
            malformedSchemeSpecific = true;
          }
        }
      } else {
        parsed.error = parsed.error || "URI can not be parsed.";
      }
      return { parsed, malformedAuthorityOrPort, malformedPercentEncoding, malformedSchemeSpecific, malformedHost, malformedScheme };
    }
    function parse4(uri, opts) {
      return parseWithStatus(uri, opts).parsed;
    }
    function normalizeString(uri, opts) {
      return normalizeStringWithStatus(uri, opts).normalized;
    }
    function normalizeStringWithStatus(uri, opts) {
      const { parsed, malformedAuthorityOrPort, malformedPercentEncoding, malformedSchemeSpecific, malformedHost, malformedScheme } = parseWithStatus(uri, opts);
      return {
        normalized: malformedAuthorityOrPort || malformedPercentEncoding || malformedSchemeSpecific || malformedHost || malformedScheme ? uri : serialize(parsed, opts),
        malformedAuthorityOrPort,
        malformedPercentEncoding,
        malformedSchemeSpecific,
        malformedHost,
        malformedScheme
      };
    }
    function normalizeComparableURI(uri, opts) {
      if (typeof uri !== "string" && typeof uri !== "object") {
        return void 0;
      }
      let value;
      try {
        value = typeof uri === "string" ? uri : serialize(uri, opts);
      } catch {
        return void 0;
      }
      const { normalized, malformedAuthorityOrPort, malformedPercentEncoding, malformedSchemeSpecific, malformedHost, malformedScheme } = normalizeStringWithStatus(value, opts);
      return malformedAuthorityOrPort || malformedPercentEncoding || malformedSchemeSpecific || malformedHost || malformedScheme ? void 0 : normalized;
    }
    var fastUri = {
      SCHEMES,
      normalize,
      resolve,
      resolveComponent,
      equal,
      serialize,
      parse: parse4
    };
    module.exports = fastUri;
    module.exports.default = fastUri;
    module.exports.fastUri = fastUri;
  }
});

// node_modules/ajv/dist/runtime/uri.js
var require_uri = __commonJS({
  "node_modules/ajv/dist/runtime/uri.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var uri = require_fast_uri();
    uri.code = 'require("ajv/dist/runtime/uri").default';
    exports.default = uri;
  }
});

// node_modules/ajv/dist/core.js
var require_core = __commonJS({
  "node_modules/ajv/dist/core.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = void 0;
    var validate_1 = require_validate();
    Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: function() {
      return validate_1.KeywordCxt;
    } });
    var codegen_1 = require_codegen();
    Object.defineProperty(exports, "_", { enumerable: true, get: function() {
      return codegen_1._;
    } });
    Object.defineProperty(exports, "str", { enumerable: true, get: function() {
      return codegen_1.str;
    } });
    Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
      return codegen_1.stringify;
    } });
    Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
      return codegen_1.nil;
    } });
    Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
      return codegen_1.Name;
    } });
    Object.defineProperty(exports, "CodeGen", { enumerable: true, get: function() {
      return codegen_1.CodeGen;
    } });
    var validation_error_1 = require_validation_error();
    var ref_error_1 = require_ref_error();
    var rules_1 = require_rules();
    var compile_1 = require_compile();
    var codegen_2 = require_codegen();
    var resolve_1 = require_resolve();
    var dataType_1 = require_dataType();
    var util_1 = require_util();
    var $dataRefSchema = require_data();
    var uri_1 = require_uri();
    var defaultRegExp = (str, flags) => new RegExp(str, flags);
    defaultRegExp.code = "new RegExp";
    var META_IGNORE_OPTIONS = ["removeAdditional", "useDefaults", "coerceTypes"];
    var EXT_SCOPE_NAMES = /* @__PURE__ */ new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error"
    ]);
    var removedOptions = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    };
    var deprecatedOptions = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    };
    var MAX_EXPRESSION = 200;
    function requiredOptions(o) {
      var _a3, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
      const s = o.strict;
      const _optz = (_a3 = o.code) === null || _a3 === void 0 ? void 0 : _a3.optimize;
      const optimize = _optz === true || _optz === void 0 ? 1 : _optz || 0;
      const regExp = (_c = (_b = o.code) === null || _b === void 0 ? void 0 : _b.regExp) !== null && _c !== void 0 ? _c : defaultRegExp;
      const uriResolver = (_d = o.uriResolver) !== null && _d !== void 0 ? _d : uri_1.default;
      return {
        strictSchema: (_f = (_e = o.strictSchema) !== null && _e !== void 0 ? _e : s) !== null && _f !== void 0 ? _f : true,
        strictNumbers: (_h = (_g = o.strictNumbers) !== null && _g !== void 0 ? _g : s) !== null && _h !== void 0 ? _h : true,
        strictTypes: (_k = (_j = o.strictTypes) !== null && _j !== void 0 ? _j : s) !== null && _k !== void 0 ? _k : "log",
        strictTuples: (_m = (_l = o.strictTuples) !== null && _l !== void 0 ? _l : s) !== null && _m !== void 0 ? _m : "log",
        strictRequired: (_p = (_o = o.strictRequired) !== null && _o !== void 0 ? _o : s) !== null && _p !== void 0 ? _p : false,
        code: o.code ? { ...o.code, optimize, regExp } : { optimize, regExp },
        loopRequired: (_q = o.loopRequired) !== null && _q !== void 0 ? _q : MAX_EXPRESSION,
        loopEnum: (_r = o.loopEnum) !== null && _r !== void 0 ? _r : MAX_EXPRESSION,
        meta: (_s = o.meta) !== null && _s !== void 0 ? _s : true,
        messages: (_t = o.messages) !== null && _t !== void 0 ? _t : true,
        inlineRefs: (_u = o.inlineRefs) !== null && _u !== void 0 ? _u : true,
        schemaId: (_v = o.schemaId) !== null && _v !== void 0 ? _v : "$id",
        addUsedSchema: (_w = o.addUsedSchema) !== null && _w !== void 0 ? _w : true,
        validateSchema: (_x = o.validateSchema) !== null && _x !== void 0 ? _x : true,
        validateFormats: (_y = o.validateFormats) !== null && _y !== void 0 ? _y : true,
        unicodeRegExp: (_z = o.unicodeRegExp) !== null && _z !== void 0 ? _z : true,
        int32range: (_0 = o.int32range) !== null && _0 !== void 0 ? _0 : true,
        uriResolver
      };
    }
    var Ajv2 = class {
      constructor(opts = {}) {
        this.schemas = {};
        this.refs = {};
        this.formats = /* @__PURE__ */ Object.create(null);
        this._compilations = /* @__PURE__ */ new Set();
        this._loading = {};
        this._cache = /* @__PURE__ */ new Map();
        opts = this.opts = { ...opts, ...requiredOptions(opts) };
        const { es5, lines } = this.opts.code;
        this.scope = new codegen_2.ValueScope({ scope: {}, prefixes: EXT_SCOPE_NAMES, es5, lines });
        this.logger = getLogger(opts.logger);
        const formatOpt = opts.validateFormats;
        opts.validateFormats = false;
        this.RULES = (0, rules_1.getRules)();
        checkOptions.call(this, removedOptions, opts, "NOT SUPPORTED");
        checkOptions.call(this, deprecatedOptions, opts, "DEPRECATED", "warn");
        this._metaOpts = getMetaSchemaOptions.call(this);
        if (opts.formats)
          addInitialFormats.call(this);
        this._addVocabularies();
        this._addDefaultMetaSchema();
        if (opts.keywords)
          addInitialKeywords.call(this, opts.keywords);
        if (typeof opts.meta == "object")
          this.addMetaSchema(opts.meta);
        addInitialSchemas.call(this);
        opts.validateFormats = formatOpt;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data, meta: meta2, schemaId } = this.opts;
        let _dataRefSchema = $dataRefSchema;
        if (schemaId === "id") {
          _dataRefSchema = { ...$dataRefSchema };
          _dataRefSchema.id = _dataRefSchema.$id;
          delete _dataRefSchema.$id;
        }
        if (meta2 && $data)
          this.addMetaSchema(_dataRefSchema, _dataRefSchema[schemaId], false);
      }
      defaultMeta() {
        const { meta: meta2, schemaId } = this.opts;
        return this.opts.defaultMeta = typeof meta2 == "object" ? meta2[schemaId] || meta2 : void 0;
      }
      validate(schemaKeyRef, data) {
        let v;
        if (typeof schemaKeyRef == "string") {
          v = this.getSchema(schemaKeyRef);
          if (!v)
            throw new Error(`no schema with key or ref "${schemaKeyRef}"`);
        } else {
          v = this.compile(schemaKeyRef);
        }
        const valid = v(data);
        if (!("$async" in v))
          this.errors = v.errors;
        return valid;
      }
      compile(schema, _meta) {
        const sch = this._addSchema(schema, _meta);
        return sch.validate || this._compileSchemaEnv(sch);
      }
      compileAsync(schema, meta2) {
        if (typeof this.opts.loadSchema != "function") {
          throw new Error("options.loadSchema should be a function");
        }
        const { loadSchema } = this.opts;
        return runCompileAsync.call(this, schema, meta2);
        async function runCompileAsync(_schema, _meta) {
          await loadMetaSchema.call(this, _schema.$schema);
          const sch = this._addSchema(_schema, _meta);
          return sch.validate || _compileAsync.call(this, sch);
        }
        async function loadMetaSchema($ref) {
          if ($ref && !this.getSchema($ref)) {
            await runCompileAsync.call(this, { $ref }, true);
          }
        }
        async function _compileAsync(sch) {
          try {
            return this._compileSchemaEnv(sch);
          } catch (e) {
            if (!(e instanceof ref_error_1.default))
              throw e;
            checkLoaded.call(this, e);
            await loadMissingSchema.call(this, e.missingSchema);
            return _compileAsync.call(this, sch);
          }
        }
        function checkLoaded({ missingSchema: ref, missingRef }) {
          if (this.refs[ref]) {
            throw new Error(`AnySchema ${ref} is loaded but ${missingRef} cannot be resolved`);
          }
        }
        async function loadMissingSchema(ref) {
          const _schema = await _loadSchema.call(this, ref);
          if (!this.refs[ref])
            await loadMetaSchema.call(this, _schema.$schema);
          if (!this.refs[ref])
            this.addSchema(_schema, ref, meta2);
        }
        async function _loadSchema(ref) {
          const p = this._loading[ref];
          if (p)
            return p;
          try {
            return await (this._loading[ref] = loadSchema(ref));
          } finally {
            delete this._loading[ref];
          }
        }
      }
      // Adds schema to the instance
      addSchema(schema, key, _meta, _validateSchema = this.opts.validateSchema) {
        if (Array.isArray(schema)) {
          for (const sch of schema)
            this.addSchema(sch, void 0, _meta, _validateSchema);
          return this;
        }
        let id;
        if (typeof schema === "object") {
          const { schemaId } = this.opts;
          id = schema[schemaId];
          if (id !== void 0 && typeof id != "string") {
            throw new Error(`schema ${schemaId} must be string`);
          }
        }
        key = (0, resolve_1.normalizeId)(key || id);
        this._checkUnique(key);
        this.schemas[key] = this._addSchema(schema, _meta, key, _validateSchema, true);
        return this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(schema, key, _validateSchema = this.opts.validateSchema) {
        this.addSchema(schema, key, true, _validateSchema);
        return this;
      }
      //  Validate schema against its meta-schema
      validateSchema(schema, throwOrLogError) {
        if (typeof schema == "boolean")
          return true;
        let $schema;
        $schema = schema.$schema;
        if ($schema !== void 0 && typeof $schema != "string") {
          throw new Error("$schema must be a string");
        }
        $schema = $schema || this.opts.defaultMeta || this.defaultMeta();
        if (!$schema) {
          this.logger.warn("meta-schema not available");
          this.errors = null;
          return true;
        }
        const valid = this.validate($schema, schema);
        if (!valid && throwOrLogError) {
          const message = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(message);
          else
            throw new Error(message);
        }
        return valid;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(keyRef) {
        let sch;
        while (typeof (sch = getSchEnv.call(this, keyRef)) == "string")
          keyRef = sch;
        if (sch === void 0) {
          const { schemaId } = this.opts;
          const root = new compile_1.SchemaEnv({ schema: {}, schemaId });
          sch = compile_1.resolveSchema.call(this, root, keyRef);
          if (!sch)
            return;
          this.refs[keyRef] = sch;
        }
        return sch.validate || this._compileSchemaEnv(sch);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(schemaKeyRef) {
        if (schemaKeyRef instanceof RegExp) {
          this._removeAllSchemas(this.schemas, schemaKeyRef);
          this._removeAllSchemas(this.refs, schemaKeyRef);
          return this;
        }
        switch (typeof schemaKeyRef) {
          case "undefined":
            this._removeAllSchemas(this.schemas);
            this._removeAllSchemas(this.refs);
            this._cache.clear();
            return this;
          case "string": {
            const sch = getSchEnv.call(this, schemaKeyRef);
            if (typeof sch == "object")
              this._cache.delete(sch.schema);
            delete this.schemas[schemaKeyRef];
            delete this.refs[schemaKeyRef];
            return this;
          }
          case "object": {
            const cacheKey2 = schemaKeyRef;
            this._cache.delete(cacheKey2);
            let id = schemaKeyRef[this.opts.schemaId];
            if (id) {
              id = (0, resolve_1.normalizeId)(id);
              delete this.schemas[id];
              delete this.refs[id];
            }
            return this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(definitions) {
        for (const def of definitions)
          this.addKeyword(def);
        return this;
      }
      addKeyword(kwdOrDef, def) {
        let keyword;
        if (typeof kwdOrDef == "string") {
          keyword = kwdOrDef;
          if (typeof def == "object") {
            this.logger.warn("these parameters are deprecated, see docs for addKeyword");
            def.keyword = keyword;
          }
        } else if (typeof kwdOrDef == "object" && def === void 0) {
          def = kwdOrDef;
          keyword = def.keyword;
          if (Array.isArray(keyword) && !keyword.length) {
            throw new Error("addKeywords: keyword must be string or non-empty array");
          }
        } else {
          throw new Error("invalid addKeywords parameters");
        }
        checkKeyword.call(this, keyword, def);
        if (!def) {
          (0, util_1.eachItem)(keyword, (kwd) => addRule.call(this, kwd));
          return this;
        }
        keywordMetaschema.call(this, def);
        const definition = {
          ...def,
          type: (0, dataType_1.getJSONTypes)(def.type),
          schemaType: (0, dataType_1.getJSONTypes)(def.schemaType)
        };
        (0, util_1.eachItem)(keyword, definition.type.length === 0 ? (k) => addRule.call(this, k, definition) : (k) => definition.type.forEach((t) => addRule.call(this, k, definition, t)));
        return this;
      }
      getKeyword(keyword) {
        const rule = this.RULES.all[keyword];
        return typeof rule == "object" ? rule.definition : !!rule;
      }
      // Remove keyword
      removeKeyword(keyword) {
        const { RULES } = this;
        delete RULES.keywords[keyword];
        delete RULES.all[keyword];
        for (const group of RULES.rules) {
          const i = group.rules.findIndex((rule) => rule.keyword === keyword);
          if (i >= 0)
            group.rules.splice(i, 1);
        }
        return this;
      }
      // Add format
      addFormat(name, format) {
        if (typeof format == "string")
          format = new RegExp(format);
        this.formats[name] = format;
        return this;
      }
      errorsText(errors = this.errors, { separator = ", ", dataVar = "data" } = {}) {
        if (!errors || errors.length === 0)
          return "No errors";
        return errors.map((e) => `${dataVar}${e.instancePath} ${e.message}`).reduce((text, msg) => text + separator + msg);
      }
      $dataMetaSchema(metaSchema, keywordsJsonPointers) {
        const rules = this.RULES.all;
        metaSchema = JSON.parse(JSON.stringify(metaSchema));
        for (const jsonPointer of keywordsJsonPointers) {
          const segments = jsonPointer.split("/").slice(1);
          let keywords = metaSchema;
          for (const seg of segments)
            keywords = keywords[seg];
          for (const key in rules) {
            const rule = rules[key];
            if (typeof rule != "object")
              continue;
            const { $data } = rule.definition;
            const schema = keywords[key];
            if ($data && schema)
              keywords[key] = schemaOrData(schema);
          }
        }
        return metaSchema;
      }
      _removeAllSchemas(schemas, regex) {
        for (const keyRef in schemas) {
          const sch = schemas[keyRef];
          if (!regex || regex.test(keyRef)) {
            if (typeof sch == "string") {
              delete schemas[keyRef];
            } else if (sch && !sch.meta) {
              this._cache.delete(sch.schema);
              delete schemas[keyRef];
            }
          }
        }
      }
      _addSchema(schema, meta2, baseId, validateSchema = this.opts.validateSchema, addSchema = this.opts.addUsedSchema) {
        let id;
        const { schemaId } = this.opts;
        if (typeof schema == "object") {
          id = schema[schemaId];
        } else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          else if (typeof schema != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let sch = this._cache.get(schema);
        if (sch !== void 0)
          return sch;
        baseId = (0, resolve_1.normalizeId)(id || baseId);
        const localRefs = resolve_1.getSchemaRefs.call(this, schema, baseId);
        sch = new compile_1.SchemaEnv({ schema, schemaId, meta: meta2, baseId, localRefs });
        this._cache.set(sch.schema, sch);
        if (addSchema && !baseId.startsWith("#")) {
          if (baseId)
            this._checkUnique(baseId);
          this.refs[baseId] = sch;
        }
        if (validateSchema)
          this.validateSchema(schema, true);
        return sch;
      }
      _checkUnique(id) {
        if (this.schemas[id] || this.refs[id]) {
          throw new Error(`schema with key or id "${id}" already exists`);
        }
      }
      _compileSchemaEnv(sch) {
        if (sch.meta)
          this._compileMetaSchema(sch);
        else
          compile_1.compileSchema.call(this, sch);
        if (!sch.validate)
          throw new Error("ajv implementation error");
        return sch.validate;
      }
      _compileMetaSchema(sch) {
        const currentOpts = this.opts;
        this.opts = this._metaOpts;
        try {
          compile_1.compileSchema.call(this, sch);
        } finally {
          this.opts = currentOpts;
        }
      }
    };
    Ajv2.ValidationError = validation_error_1.default;
    Ajv2.MissingRefError = ref_error_1.default;
    exports.default = Ajv2;
    function checkOptions(checkOpts, options, msg, log = "error") {
      for (const key in checkOpts) {
        const opt = key;
        if (opt in options)
          this.logger[log](`${msg}: option ${key}. ${checkOpts[opt]}`);
      }
    }
    function getSchEnv(keyRef) {
      keyRef = (0, resolve_1.normalizeId)(keyRef);
      return this.schemas[keyRef] || this.refs[keyRef];
    }
    function addInitialSchemas() {
      const optsSchemas = this.opts.schemas;
      if (!optsSchemas)
        return;
      if (Array.isArray(optsSchemas))
        this.addSchema(optsSchemas);
      else
        for (const key in optsSchemas)
          this.addSchema(optsSchemas[key], key);
    }
    function addInitialFormats() {
      for (const name in this.opts.formats) {
        const format = this.opts.formats[name];
        if (format)
          this.addFormat(name, format);
      }
    }
    function addInitialKeywords(defs) {
      if (Array.isArray(defs)) {
        this.addVocabulary(defs);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const keyword in defs) {
        const def = defs[keyword];
        if (!def.keyword)
          def.keyword = keyword;
        this.addKeyword(def);
      }
    }
    function getMetaSchemaOptions() {
      const metaOpts = { ...this.opts };
      for (const opt of META_IGNORE_OPTIONS)
        delete metaOpts[opt];
      return metaOpts;
    }
    var noLogs = { log() {
    }, warn() {
    }, error() {
    } };
    function getLogger(logger) {
      if (logger === false)
        return noLogs;
      if (logger === void 0)
        return console;
      if (logger.log && logger.warn && logger.error)
        return logger;
      throw new Error("logger must implement log, warn and error methods");
    }
    var KEYWORD_NAME = /^[a-z_$][a-z0-9_$:-]*$/i;
    function checkKeyword(keyword, def) {
      const { RULES } = this;
      (0, util_1.eachItem)(keyword, (kwd) => {
        if (RULES.keywords[kwd])
          throw new Error(`Keyword ${kwd} is already defined`);
        if (!KEYWORD_NAME.test(kwd))
          throw new Error(`Keyword ${kwd} has invalid name`);
      });
      if (!def)
        return;
      if (def.$data && !("code" in def || "validate" in def)) {
        throw new Error('$data keyword must have "code" or "validate" function');
      }
    }
    function addRule(keyword, definition, dataType) {
      var _a3;
      const post = definition === null || definition === void 0 ? void 0 : definition.post;
      if (dataType && post)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES } = this;
      let ruleGroup = post ? RULES.post : RULES.rules.find(({ type: t }) => t === dataType);
      if (!ruleGroup) {
        ruleGroup = { type: dataType, rules: [] };
        RULES.rules.push(ruleGroup);
      }
      RULES.keywords[keyword] = true;
      if (!definition)
        return;
      const rule = {
        keyword,
        definition: {
          ...definition,
          type: (0, dataType_1.getJSONTypes)(definition.type),
          schemaType: (0, dataType_1.getJSONTypes)(definition.schemaType)
        }
      };
      if (definition.before)
        addBeforeRule.call(this, ruleGroup, rule, definition.before);
      else
        ruleGroup.rules.push(rule);
      RULES.all[keyword] = rule;
      (_a3 = definition.implements) === null || _a3 === void 0 ? void 0 : _a3.forEach((kwd) => this.addKeyword(kwd));
    }
    function addBeforeRule(ruleGroup, rule, before) {
      const i = ruleGroup.rules.findIndex((_rule) => _rule.keyword === before);
      if (i >= 0) {
        ruleGroup.rules.splice(i, 0, rule);
      } else {
        ruleGroup.rules.push(rule);
        this.logger.warn(`rule ${before} is not defined`);
      }
    }
    function keywordMetaschema(def) {
      let { metaSchema } = def;
      if (metaSchema === void 0)
        return;
      if (def.$data && this.opts.$data)
        metaSchema = schemaOrData(metaSchema);
      def.validateSchema = this.compile(metaSchema, true);
    }
    var $dataRef = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function schemaOrData(schema) {
      return { anyOf: [schema, $dataRef] };
    }
  }
});

// node_modules/ajv/dist/vocabularies/core/id.js
var require_id = __commonJS({
  "node_modules/ajv/dist/vocabularies/core/id.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var def = {
      keyword: "id",
      code() {
        throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/core/ref.js
var require_ref = __commonJS({
  "node_modules/ajv/dist/vocabularies/core/ref.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.callRef = exports.getValidate = void 0;
    var ref_error_1 = require_ref_error();
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var compile_1 = require_compile();
    var util_1 = require_util();
    var def = {
      keyword: "$ref",
      schemaType: "string",
      code(cxt) {
        const { gen, schema: $ref, it } = cxt;
        const { baseId, schemaEnv: env, validateName, opts, self } = it;
        const { root } = env;
        if (($ref === "#" || $ref === "#/") && baseId === root.baseId)
          return callRootRef();
        const schOrEnv = compile_1.resolveRef.call(self, root, baseId, $ref);
        if (schOrEnv === void 0)
          throw new ref_error_1.default(it.opts.uriResolver, baseId, $ref);
        if (schOrEnv instanceof compile_1.SchemaEnv)
          return callValidate(schOrEnv);
        return inlineRefSchema(schOrEnv);
        function callRootRef() {
          if (env === root)
            return callRef(cxt, validateName, env, env.$async);
          const rootName = gen.scopeValue("root", { ref: root });
          return callRef(cxt, (0, codegen_1._)`${rootName}.validate`, root, root.$async);
        }
        function callValidate(sch) {
          const v = getValidate(cxt, sch);
          callRef(cxt, v, sch, sch.$async);
        }
        function inlineRefSchema(sch) {
          const schName = gen.scopeValue("schema", opts.code.source === true ? { ref: sch, code: (0, codegen_1.stringify)(sch) } : { ref: sch });
          const valid = gen.name("valid");
          const schCxt = cxt.subschema({
            schema: sch,
            dataTypes: [],
            schemaPath: codegen_1.nil,
            topSchemaRef: schName,
            errSchemaPath: $ref
          }, valid);
          cxt.mergeEvaluated(schCxt);
          cxt.ok(valid);
        }
      }
    };
    function getValidate(cxt, sch) {
      const { gen } = cxt;
      return sch.validate ? gen.scopeValue("validate", { ref: sch.validate }) : (0, codegen_1._)`${gen.scopeValue("wrapper", { ref: sch })}.validate`;
    }
    exports.getValidate = getValidate;
    function callRef(cxt, v, sch, $async) {
      const { gen, it } = cxt;
      const { allErrors, schemaEnv: env, opts } = it;
      const passCxt = opts.passContext ? names_1.default.this : codegen_1.nil;
      if ($async)
        callAsyncRef();
      else
        callSyncRef();
      function callAsyncRef() {
        if (!env.$async)
          throw new Error("async schema referenced by sync schema");
        const valid = gen.let("valid");
        gen.try(() => {
          gen.code((0, codegen_1._)`await ${(0, code_1.callValidateCode)(cxt, v, passCxt)}`);
          addEvaluatedFrom(v);
          if (!allErrors)
            gen.assign(valid, true);
        }, (e) => {
          gen.if((0, codegen_1._)`!(${e} instanceof ${it.ValidationError})`, () => gen.throw(e));
          addErrorsFrom(e);
          if (!allErrors)
            gen.assign(valid, false);
        });
        cxt.ok(valid);
      }
      function callSyncRef() {
        cxt.result((0, code_1.callValidateCode)(cxt, v, passCxt), () => addEvaluatedFrom(v), () => addErrorsFrom(v));
      }
      function addErrorsFrom(source) {
        const errs = (0, codegen_1._)`${source}.errors`;
        gen.assign(names_1.default.vErrors, (0, codegen_1._)`${names_1.default.vErrors} === null ? ${errs} : ${names_1.default.vErrors}.concat(${errs})`);
        gen.assign(names_1.default.errors, (0, codegen_1._)`${names_1.default.vErrors}.length`);
      }
      function addEvaluatedFrom(source) {
        var _a3;
        if (!it.opts.unevaluated)
          return;
        const schEvaluated = (_a3 = sch === null || sch === void 0 ? void 0 : sch.validate) === null || _a3 === void 0 ? void 0 : _a3.evaluated;
        if (it.props !== true) {
          if (schEvaluated && !schEvaluated.dynamicProps) {
            if (schEvaluated.props !== void 0) {
              it.props = util_1.mergeEvaluated.props(gen, schEvaluated.props, it.props);
            }
          } else {
            const props = gen.var("props", (0, codegen_1._)`${source}.evaluated.props`);
            it.props = util_1.mergeEvaluated.props(gen, props, it.props, codegen_1.Name);
          }
        }
        if (it.items !== true) {
          if (schEvaluated && !schEvaluated.dynamicItems) {
            if (schEvaluated.items !== void 0) {
              it.items = util_1.mergeEvaluated.items(gen, schEvaluated.items, it.items);
            }
          } else {
            const items = gen.var("items", (0, codegen_1._)`${source}.evaluated.items`);
            it.items = util_1.mergeEvaluated.items(gen, items, it.items, codegen_1.Name);
          }
        }
      }
    }
    exports.callRef = callRef;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/core/index.js
var require_core2 = __commonJS({
  "node_modules/ajv/dist/vocabularies/core/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var id_1 = require_id();
    var ref_1 = require_ref();
    var core = [
      "$schema",
      "$id",
      "$defs",
      "$vocabulary",
      { keyword: "$comment" },
      "definitions",
      id_1.default,
      ref_1.default
    ];
    exports.default = core;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitNumber.js
var require_limitNumber = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitNumber.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var ops = codegen_1.operators;
    var KWDs = {
      maximum: { okStr: "<=", ok: ops.LTE, fail: ops.GT },
      minimum: { okStr: ">=", ok: ops.GTE, fail: ops.LT },
      exclusiveMaximum: { okStr: "<", ok: ops.LT, fail: ops.GTE },
      exclusiveMinimum: { okStr: ">", ok: ops.GT, fail: ops.LTE }
    };
    var error2 = {
      message: ({ keyword, schemaCode }) => (0, codegen_1.str)`must be ${KWDs[keyword].okStr} ${schemaCode}`,
      params: ({ keyword, schemaCode }) => (0, codegen_1._)`{comparison: ${KWDs[keyword].okStr}, limit: ${schemaCode}}`
    };
    var def = {
      keyword: Object.keys(KWDs),
      type: "number",
      schemaType: "number",
      $data: true,
      error: error2,
      code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        cxt.fail$data((0, codegen_1._)`${data} ${KWDs[keyword].fail} ${schemaCode} || isNaN(${data})`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/multipleOf.js
var require_multipleOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/multipleOf.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error2 = {
      message: ({ schemaCode }) => (0, codegen_1.str)`must be multiple of ${schemaCode}`,
      params: ({ schemaCode }) => (0, codegen_1._)`{multipleOf: ${schemaCode}}`
    };
    var def = {
      keyword: "multipleOf",
      type: "number",
      schemaType: "number",
      $data: true,
      error: error2,
      code(cxt) {
        const { gen, data, schemaCode, it } = cxt;
        const prec = it.opts.multipleOfPrecision;
        const res = gen.let("res");
        const invalid = prec ? (0, codegen_1._)`Math.abs(Math.round(${res}) - ${res}) > 1e-${prec}` : (0, codegen_1._)`${res} !== parseInt(${res})`;
        cxt.fail$data((0, codegen_1._)`(${schemaCode} === 0 || (${res} = ${data}/${schemaCode}, ${invalid}))`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/runtime/ucs2length.js
var require_ucs2length = __commonJS({
  "node_modules/ajv/dist/runtime/ucs2length.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function ucs2length(str) {
      const len = str.length;
      let length = 0;
      let pos = 0;
      let value;
      while (pos < len) {
        length++;
        value = str.charCodeAt(pos++);
        if (value >= 55296 && value <= 56319 && pos < len) {
          value = str.charCodeAt(pos);
          if ((value & 64512) === 56320)
            pos++;
        }
      }
      return length;
    }
    exports.default = ucs2length;
    ucs2length.code = 'require("ajv/dist/runtime/ucs2length").default';
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitLength.js
var require_limitLength = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitLength.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var ucs2length_1 = require_ucs2length();
    var error2 = {
      message({ keyword, schemaCode }) {
        const comp = keyword === "maxLength" ? "more" : "fewer";
        return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} characters`;
      },
      params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`
    };
    var def = {
      keyword: ["maxLength", "minLength"],
      type: "string",
      schemaType: "number",
      $data: true,
      error: error2,
      code(cxt) {
        const { keyword, data, schemaCode, it } = cxt;
        const op = keyword === "maxLength" ? codegen_1.operators.GT : codegen_1.operators.LT;
        const len = it.opts.unicode === false ? (0, codegen_1._)`${data}.length` : (0, codegen_1._)`${(0, util_1.useFunc)(cxt.gen, ucs2length_1.default)}(${data})`;
        cxt.fail$data((0, codegen_1._)`${len} ${op} ${schemaCode}`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/pattern.js
var require_pattern = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/pattern.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var util_1 = require_util();
    var codegen_1 = require_codegen();
    var error2 = {
      message: ({ schemaCode }) => (0, codegen_1.str)`must match pattern "${schemaCode}"`,
      params: ({ schemaCode }) => (0, codegen_1._)`{pattern: ${schemaCode}}`
    };
    var def = {
      keyword: "pattern",
      type: "string",
      schemaType: "string",
      $data: true,
      error: error2,
      code(cxt) {
        const { gen, data, $data, schema, schemaCode, it } = cxt;
        const u = it.opts.unicodeRegExp ? "u" : "";
        if ($data) {
          const { regExp } = it.opts.code;
          const regExpCode = regExp.code === "new RegExp" ? (0, codegen_1._)`new RegExp` : (0, util_1.useFunc)(gen, regExp);
          const valid = gen.let("valid");
          gen.try(() => gen.assign(valid, (0, codegen_1._)`${regExpCode}(${schemaCode}, ${u}).test(${data})`), () => gen.assign(valid, false));
          cxt.fail$data((0, codegen_1._)`!${valid}`);
        } else {
          const regExp = (0, code_1.usePattern)(cxt, schema);
          cxt.fail$data((0, codegen_1._)`!${regExp}.test(${data})`);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitProperties.js
var require_limitProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitProperties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error2 = {
      message({ keyword, schemaCode }) {
        const comp = keyword === "maxProperties" ? "more" : "fewer";
        return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} properties`;
      },
      params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`
    };
    var def = {
      keyword: ["maxProperties", "minProperties"],
      type: "object",
      schemaType: "number",
      $data: true,
      error: error2,
      code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        const op = keyword === "maxProperties" ? codegen_1.operators.GT : codegen_1.operators.LT;
        cxt.fail$data((0, codegen_1._)`Object.keys(${data}).length ${op} ${schemaCode}`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/required.js
var require_required = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/required.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error2 = {
      message: ({ params: { missingProperty } }) => (0, codegen_1.str)`must have required property '${missingProperty}'`,
      params: ({ params: { missingProperty } }) => (0, codegen_1._)`{missingProperty: ${missingProperty}}`
    };
    var def = {
      keyword: "required",
      type: "object",
      schemaType: "array",
      $data: true,
      error: error2,
      code(cxt) {
        const { gen, schema, schemaCode, data, $data, it } = cxt;
        const { opts } = it;
        if (!$data && schema.length === 0)
          return;
        const useLoop = schema.length >= opts.loopRequired;
        if (it.allErrors)
          allErrorsMode();
        else
          exitOnErrorMode();
        if (opts.strictRequired) {
          const props = cxt.parentSchema.properties;
          const { definedProperties } = cxt.it;
          for (const requiredKey of schema) {
            if ((props === null || props === void 0 ? void 0 : props[requiredKey]) === void 0 && !definedProperties.has(requiredKey)) {
              const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
              const msg = `required property "${requiredKey}" is not defined at "${schemaPath}" (strictRequired)`;
              (0, util_1.checkStrictMode)(it, msg, it.opts.strictRequired);
            }
          }
        }
        function allErrorsMode() {
          if (useLoop || $data) {
            cxt.block$data(codegen_1.nil, loopAllRequired);
          } else {
            for (const prop of schema) {
              (0, code_1.checkReportMissingProp)(cxt, prop);
            }
          }
        }
        function exitOnErrorMode() {
          const missing = gen.let("missing");
          if (useLoop || $data) {
            const valid = gen.let("valid", true);
            cxt.block$data(valid, () => loopUntilMissing(missing, valid));
            cxt.ok(valid);
          } else {
            gen.if((0, code_1.checkMissingProp)(cxt, schema, missing));
            (0, code_1.reportMissingProp)(cxt, missing);
            gen.else();
          }
        }
        function loopAllRequired() {
          gen.forOf("prop", schemaCode, (prop) => {
            cxt.setParams({ missingProperty: prop });
            gen.if((0, code_1.noPropertyInData)(gen, data, prop, opts.ownProperties), () => cxt.error());
          });
        }
        function loopUntilMissing(missing, valid) {
          cxt.setParams({ missingProperty: missing });
          gen.forOf(missing, schemaCode, () => {
            gen.assign(valid, (0, code_1.propertyInData)(gen, data, missing, opts.ownProperties));
            gen.if((0, codegen_1.not)(valid), () => {
              cxt.error();
              gen.break();
            });
          }, codegen_1.nil);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitItems.js
var require_limitItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error2 = {
      message({ keyword, schemaCode }) {
        const comp = keyword === "maxItems" ? "more" : "fewer";
        return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} items`;
      },
      params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`
    };
    var def = {
      keyword: ["maxItems", "minItems"],
      type: "array",
      schemaType: "number",
      $data: true,
      error: error2,
      code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        const op = keyword === "maxItems" ? codegen_1.operators.GT : codegen_1.operators.LT;
        cxt.fail$data((0, codegen_1._)`${data}.length ${op} ${schemaCode}`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/runtime/equal.js
var require_equal = __commonJS({
  "node_modules/ajv/dist/runtime/equal.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var equal = require_fast_deep_equal();
    equal.code = 'require("ajv/dist/runtime/equal").default';
    exports.default = equal;
  }
});

// node_modules/ajv/dist/vocabularies/validation/uniqueItems.js
var require_uniqueItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/uniqueItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dataType_1 = require_dataType();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var equal_1 = require_equal();
    var error2 = {
      message: ({ params: { i, j } }) => (0, codegen_1.str)`must NOT have duplicate items (items ## ${j} and ${i} are identical)`,
      params: ({ params: { i, j } }) => (0, codegen_1._)`{i: ${i}, j: ${j}}`
    };
    var def = {
      keyword: "uniqueItems",
      type: "array",
      schemaType: "boolean",
      $data: true,
      error: error2,
      code(cxt) {
        const { gen, data, $data, schema, parentSchema, schemaCode, it } = cxt;
        if (!$data && !schema)
          return;
        const valid = gen.let("valid");
        const itemTypes = parentSchema.items ? (0, dataType_1.getSchemaTypes)(parentSchema.items) : [];
        cxt.block$data(valid, validateUniqueItems, (0, codegen_1._)`${schemaCode} === false`);
        cxt.ok(valid);
        function validateUniqueItems() {
          const i = gen.let("i", (0, codegen_1._)`${data}.length`);
          const j = gen.let("j");
          cxt.setParams({ i, j });
          gen.assign(valid, true);
          gen.if((0, codegen_1._)`${i} > 1`, () => (canOptimize() ? loopN : loopN2)(i, j));
        }
        function canOptimize() {
          return itemTypes.length > 0 && !itemTypes.some((t) => t === "object" || t === "array");
        }
        function loopN(i, j) {
          const item = gen.name("item");
          const wrongType = (0, dataType_1.checkDataTypes)(itemTypes, item, it.opts.strictNumbers, dataType_1.DataType.Wrong);
          const indices = gen.const("indices", (0, codegen_1._)`{}`);
          gen.for((0, codegen_1._)`;${i}--;`, () => {
            gen.let(item, (0, codegen_1._)`${data}[${i}]`);
            gen.if(wrongType, (0, codegen_1._)`continue`);
            if (itemTypes.length > 1)
              gen.if((0, codegen_1._)`typeof ${item} == "string"`, (0, codegen_1._)`${item} += "_"`);
            gen.if((0, codegen_1._)`typeof ${indices}[${item}] == "number"`, () => {
              gen.assign(j, (0, codegen_1._)`${indices}[${item}]`);
              cxt.error();
              gen.assign(valid, false).break();
            }).code((0, codegen_1._)`${indices}[${item}] = ${i}`);
          });
        }
        function loopN2(i, j) {
          const eql = (0, util_1.useFunc)(gen, equal_1.default);
          const outer = gen.name("outer");
          gen.label(outer).for((0, codegen_1._)`;${i}--;`, () => gen.for((0, codegen_1._)`${j} = ${i}; ${j}--;`, () => gen.if((0, codegen_1._)`${eql}(${data}[${i}], ${data}[${j}])`, () => {
            cxt.error();
            gen.assign(valid, false).break(outer);
          })));
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/const.js
var require_const = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/const.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var equal_1 = require_equal();
    var error2 = {
      message: "must be equal to constant",
      params: ({ schemaCode }) => (0, codegen_1._)`{allowedValue: ${schemaCode}}`
    };
    var def = {
      keyword: "const",
      $data: true,
      error: error2,
      code(cxt) {
        const { gen, data, $data, schemaCode, schema } = cxt;
        if ($data || schema && typeof schema == "object") {
          cxt.fail$data((0, codegen_1._)`!${(0, util_1.useFunc)(gen, equal_1.default)}(${data}, ${schemaCode})`);
        } else {
          cxt.fail((0, codegen_1._)`${schema} !== ${data}`);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/enum.js
var require_enum = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/enum.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var equal_1 = require_equal();
    var error2 = {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode }) => (0, codegen_1._)`{allowedValues: ${schemaCode}}`
    };
    var def = {
      keyword: "enum",
      schemaType: "array",
      $data: true,
      error: error2,
      code(cxt) {
        const { gen, data, $data, schema, schemaCode, it } = cxt;
        if (!$data && schema.length === 0)
          throw new Error("enum must have non-empty array");
        const useLoop = schema.length >= it.opts.loopEnum;
        let eql;
        const getEql = () => eql !== null && eql !== void 0 ? eql : eql = (0, util_1.useFunc)(gen, equal_1.default);
        let valid;
        if (useLoop || $data) {
          valid = gen.let("valid");
          cxt.block$data(valid, loopEnum);
        } else {
          if (!Array.isArray(schema))
            throw new Error("ajv implementation error");
          const vSchema = gen.const("vSchema", schemaCode);
          valid = (0, codegen_1.or)(...schema.map((_x, i) => equalCode(vSchema, i)));
        }
        cxt.pass(valid);
        function loopEnum() {
          gen.assign(valid, false);
          gen.forOf("v", schemaCode, (v) => gen.if((0, codegen_1._)`${getEql()}(${data}, ${v})`, () => gen.assign(valid, true).break()));
        }
        function equalCode(vSchema, i) {
          const sch = schema[i];
          return typeof sch === "object" && sch !== null ? (0, codegen_1._)`${getEql()}(${data}, ${vSchema}[${i}])` : (0, codegen_1._)`${data} === ${sch}`;
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/index.js
var require_validation = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var limitNumber_1 = require_limitNumber();
    var multipleOf_1 = require_multipleOf();
    var limitLength_1 = require_limitLength();
    var pattern_1 = require_pattern();
    var limitProperties_1 = require_limitProperties();
    var required_1 = require_required();
    var limitItems_1 = require_limitItems();
    var uniqueItems_1 = require_uniqueItems();
    var const_1 = require_const();
    var enum_1 = require_enum();
    var validation = [
      // number
      limitNumber_1.default,
      multipleOf_1.default,
      // string
      limitLength_1.default,
      pattern_1.default,
      // object
      limitProperties_1.default,
      required_1.default,
      // array
      limitItems_1.default,
      uniqueItems_1.default,
      // any
      { keyword: "type", schemaType: ["string", "array"] },
      { keyword: "nullable", schemaType: "boolean" },
      const_1.default,
      enum_1.default
    ];
    exports.default = validation;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/additionalItems.js
var require_additionalItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/additionalItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateAdditionalItems = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error2 = {
      message: ({ params: { len } }) => (0, codegen_1.str)`must NOT have more than ${len} items`,
      params: ({ params: { len } }) => (0, codegen_1._)`{limit: ${len}}`
    };
    var def = {
      keyword: "additionalItems",
      type: "array",
      schemaType: ["boolean", "object"],
      before: "uniqueItems",
      error: error2,
      code(cxt) {
        const { parentSchema, it } = cxt;
        const { items } = parentSchema;
        if (!Array.isArray(items)) {
          (0, util_1.checkStrictMode)(it, '"additionalItems" is ignored when "items" is not an array of schemas');
          return;
        }
        validateAdditionalItems(cxt, items);
      }
    };
    function validateAdditionalItems(cxt, items) {
      const { gen, schema, data, keyword, it } = cxt;
      it.items = true;
      const len = gen.const("len", (0, codegen_1._)`${data}.length`);
      if (schema === false) {
        cxt.setParams({ len: items.length });
        cxt.pass((0, codegen_1._)`${len} <= ${items.length}`);
      } else if (typeof schema == "object" && !(0, util_1.alwaysValidSchema)(it, schema)) {
        const valid = gen.var("valid", (0, codegen_1._)`${len} <= ${items.length}`);
        gen.if((0, codegen_1.not)(valid), () => validateItems(valid));
        cxt.ok(valid);
      }
      function validateItems(valid) {
        gen.forRange("i", items.length, len, (i) => {
          cxt.subschema({ keyword, dataProp: i, dataPropType: util_1.Type.Num }, valid);
          if (!it.allErrors)
            gen.if((0, codegen_1.not)(valid), () => gen.break());
        });
      }
    }
    exports.validateAdditionalItems = validateAdditionalItems;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/items.js
var require_items = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/items.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateTuple = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var code_1 = require_code2();
    var def = {
      keyword: "items",
      type: "array",
      schemaType: ["object", "array", "boolean"],
      before: "uniqueItems",
      code(cxt) {
        const { schema, it } = cxt;
        if (Array.isArray(schema))
          return validateTuple(cxt, "additionalItems", schema);
        it.items = true;
        if ((0, util_1.alwaysValidSchema)(it, schema))
          return;
        cxt.ok((0, code_1.validateArray)(cxt));
      }
    };
    function validateTuple(cxt, extraItems, schArr = cxt.schema) {
      const { gen, parentSchema, data, keyword, it } = cxt;
      checkStrictTuple(parentSchema);
      if (it.opts.unevaluated && schArr.length && it.items !== true) {
        it.items = util_1.mergeEvaluated.items(gen, schArr.length, it.items);
      }
      const valid = gen.name("valid");
      const len = gen.const("len", (0, codegen_1._)`${data}.length`);
      schArr.forEach((sch, i) => {
        if ((0, util_1.alwaysValidSchema)(it, sch))
          return;
        gen.if((0, codegen_1._)`${len} > ${i}`, () => cxt.subschema({
          keyword,
          schemaProp: i,
          dataProp: i
        }, valid));
        cxt.ok(valid);
      });
      function checkStrictTuple(sch) {
        const { opts, errSchemaPath } = it;
        const l = schArr.length;
        const fullTuple = l === sch.minItems && (l === sch.maxItems || sch[extraItems] === false);
        if (opts.strictTuples && !fullTuple) {
          const msg = `"${keyword}" is ${l}-tuple, but minItems or maxItems/${extraItems} are not specified or different at path "${errSchemaPath}"`;
          (0, util_1.checkStrictMode)(it, msg, opts.strictTuples);
        }
      }
    }
    exports.validateTuple = validateTuple;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/prefixItems.js
var require_prefixItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/prefixItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var items_1 = require_items();
    var def = {
      keyword: "prefixItems",
      type: "array",
      schemaType: ["array"],
      before: "uniqueItems",
      code: (cxt) => (0, items_1.validateTuple)(cxt, "items")
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/items2020.js
var require_items2020 = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/items2020.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var code_1 = require_code2();
    var additionalItems_1 = require_additionalItems();
    var error2 = {
      message: ({ params: { len } }) => (0, codegen_1.str)`must NOT have more than ${len} items`,
      params: ({ params: { len } }) => (0, codegen_1._)`{limit: ${len}}`
    };
    var def = {
      keyword: "items",
      type: "array",
      schemaType: ["object", "boolean"],
      before: "uniqueItems",
      error: error2,
      code(cxt) {
        const { schema, parentSchema, it } = cxt;
        const { prefixItems } = parentSchema;
        it.items = true;
        if ((0, util_1.alwaysValidSchema)(it, schema))
          return;
        if (prefixItems)
          (0, additionalItems_1.validateAdditionalItems)(cxt, prefixItems);
        else
          cxt.ok((0, code_1.validateArray)(cxt));
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/contains.js
var require_contains = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/contains.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error2 = {
      message: ({ params: { min, max } }) => max === void 0 ? (0, codegen_1.str)`must contain at least ${min} valid item(s)` : (0, codegen_1.str)`must contain at least ${min} and no more than ${max} valid item(s)`,
      params: ({ params: { min, max } }) => max === void 0 ? (0, codegen_1._)`{minContains: ${min}}` : (0, codegen_1._)`{minContains: ${min}, maxContains: ${max}}`
    };
    var def = {
      keyword: "contains",
      type: "array",
      schemaType: ["object", "boolean"],
      before: "uniqueItems",
      trackErrors: true,
      error: error2,
      code(cxt) {
        const { gen, schema, parentSchema, data, it } = cxt;
        let min;
        let max;
        const { minContains, maxContains } = parentSchema;
        if (it.opts.next) {
          min = minContains === void 0 ? 1 : minContains;
          max = maxContains;
        } else {
          min = 1;
        }
        const len = gen.const("len", (0, codegen_1._)`${data}.length`);
        cxt.setParams({ min, max });
        if (max === void 0 && min === 0) {
          (0, util_1.checkStrictMode)(it, `"minContains" == 0 without "maxContains": "contains" keyword ignored`);
          return;
        }
        if (max !== void 0 && min > max) {
          (0, util_1.checkStrictMode)(it, `"minContains" > "maxContains" is always invalid`);
          cxt.fail();
          return;
        }
        if ((0, util_1.alwaysValidSchema)(it, schema)) {
          let cond = (0, codegen_1._)`${len} >= ${min}`;
          if (max !== void 0)
            cond = (0, codegen_1._)`${cond} && ${len} <= ${max}`;
          cxt.pass(cond);
          return;
        }
        it.items = true;
        const valid = gen.name("valid");
        if (max === void 0 && min === 1) {
          validateItems(valid, () => gen.if(valid, () => gen.break()));
        } else if (min === 0) {
          gen.let(valid, true);
          if (max !== void 0)
            gen.if((0, codegen_1._)`${data}.length > 0`, validateItemsWithCount);
        } else {
          gen.let(valid, false);
          validateItemsWithCount();
        }
        cxt.result(valid, () => cxt.reset());
        function validateItemsWithCount() {
          const schValid = gen.name("_valid");
          const count = gen.let("count", 0);
          validateItems(schValid, () => gen.if(schValid, () => checkLimits(count)));
        }
        function validateItems(_valid, block) {
          gen.forRange("i", 0, len, (i) => {
            cxt.subschema({
              keyword: "contains",
              dataProp: i,
              dataPropType: util_1.Type.Num,
              compositeRule: true
            }, _valid);
            block();
          });
        }
        function checkLimits(count) {
          gen.code((0, codegen_1._)`${count}++`);
          if (max === void 0) {
            gen.if((0, codegen_1._)`${count} >= ${min}`, () => gen.assign(valid, true).break());
          } else {
            gen.if((0, codegen_1._)`${count} > ${max}`, () => gen.assign(valid, false).break());
            if (min === 1)
              gen.assign(valid, true);
            else
              gen.if((0, codegen_1._)`${count} >= ${min}`, () => gen.assign(valid, true));
          }
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/dependencies.js
var require_dependencies = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/dependencies.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateSchemaDeps = exports.validatePropertyDeps = exports.error = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var code_1 = require_code2();
    exports.error = {
      message: ({ params: { property, depsCount, deps } }) => {
        const property_ies = depsCount === 1 ? "property" : "properties";
        return (0, codegen_1.str)`must have ${property_ies} ${deps} when property ${property} is present`;
      },
      params: ({ params: { property, depsCount, deps, missingProperty } }) => (0, codegen_1._)`{property: ${property},
    missingProperty: ${missingProperty},
    depsCount: ${depsCount},
    deps: ${deps}}`
      // TODO change to reference
    };
    var def = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: exports.error,
      code(cxt) {
        const [propDeps, schDeps] = splitDependencies(cxt);
        validatePropertyDeps(cxt, propDeps);
        validateSchemaDeps(cxt, schDeps);
      }
    };
    function splitDependencies({ schema }) {
      const propertyDeps = {};
      const schemaDeps = {};
      for (const key in schema) {
        if (key === "__proto__")
          continue;
        const deps = Array.isArray(schema[key]) ? propertyDeps : schemaDeps;
        deps[key] = schema[key];
      }
      return [propertyDeps, schemaDeps];
    }
    function validatePropertyDeps(cxt, propertyDeps = cxt.schema) {
      const { gen, data, it } = cxt;
      if (Object.keys(propertyDeps).length === 0)
        return;
      const missing = gen.let("missing");
      for (const prop in propertyDeps) {
        const deps = propertyDeps[prop];
        if (deps.length === 0)
          continue;
        const hasProperty = (0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties);
        cxt.setParams({
          property: prop,
          depsCount: deps.length,
          deps: deps.join(", ")
        });
        if (it.allErrors) {
          gen.if(hasProperty, () => {
            for (const depProp of deps) {
              (0, code_1.checkReportMissingProp)(cxt, depProp);
            }
          });
        } else {
          gen.if((0, codegen_1._)`${hasProperty} && (${(0, code_1.checkMissingProp)(cxt, deps, missing)})`);
          (0, code_1.reportMissingProp)(cxt, missing);
          gen.else();
        }
      }
    }
    exports.validatePropertyDeps = validatePropertyDeps;
    function validateSchemaDeps(cxt, schemaDeps = cxt.schema) {
      const { gen, data, keyword, it } = cxt;
      const valid = gen.name("valid");
      for (const prop in schemaDeps) {
        if ((0, util_1.alwaysValidSchema)(it, schemaDeps[prop]))
          continue;
        gen.if(
          (0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties),
          () => {
            const schCxt = cxt.subschema({ keyword, schemaProp: prop }, valid);
            cxt.mergeValidEvaluated(schCxt, valid);
          },
          () => gen.var(valid, true)
          // TODO var
        );
        cxt.ok(valid);
      }
    }
    exports.validateSchemaDeps = validateSchemaDeps;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/propertyNames.js
var require_propertyNames = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/propertyNames.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error2 = {
      message: "property name must be valid",
      params: ({ params }) => (0, codegen_1._)`{propertyName: ${params.propertyName}}`
    };
    var def = {
      keyword: "propertyNames",
      type: "object",
      schemaType: ["object", "boolean"],
      error: error2,
      code(cxt) {
        const { gen, schema, data, it } = cxt;
        if ((0, util_1.alwaysValidSchema)(it, schema))
          return;
        const valid = gen.name("valid");
        gen.forIn("key", data, (key) => {
          cxt.setParams({ propertyName: key });
          cxt.subschema({
            keyword: "propertyNames",
            data: key,
            dataTypes: ["string"],
            propertyName: key,
            compositeRule: true
          }, valid);
          gen.if((0, codegen_1.not)(valid), () => {
            cxt.error(true);
            if (!it.allErrors)
              gen.break();
          });
        });
        cxt.ok(valid);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/additionalProperties.js
var require_additionalProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/additionalProperties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var util_1 = require_util();
    var error2 = {
      message: "must NOT have additional properties",
      params: ({ params }) => (0, codegen_1._)`{additionalProperty: ${params.additionalProperty}}`
    };
    var def = {
      keyword: "additionalProperties",
      type: ["object"],
      schemaType: ["boolean", "object"],
      allowUndefined: true,
      trackErrors: true,
      error: error2,
      code(cxt) {
        const { gen, schema, parentSchema, data, errsCount, it } = cxt;
        if (!errsCount)
          throw new Error("ajv implementation error");
        const { allErrors, opts } = it;
        it.props = true;
        if (opts.removeAdditional !== "all" && (0, util_1.alwaysValidSchema)(it, schema))
          return;
        const props = (0, code_1.allSchemaProperties)(parentSchema.properties);
        const patProps = (0, code_1.allSchemaProperties)(parentSchema.patternProperties);
        checkAdditionalProperties();
        cxt.ok((0, codegen_1._)`${errsCount} === ${names_1.default.errors}`);
        function checkAdditionalProperties() {
          gen.forIn("key", data, (key) => {
            if (!props.length && !patProps.length)
              additionalPropertyCode(key);
            else
              gen.if(isAdditional(key), () => additionalPropertyCode(key));
          });
        }
        function isAdditional(key) {
          let definedProp;
          if (props.length > 8) {
            const propsSchema = (0, util_1.schemaRefOrVal)(it, parentSchema.properties, "properties");
            definedProp = (0, code_1.isOwnProperty)(gen, propsSchema, key);
          } else if (props.length) {
            definedProp = (0, codegen_1.or)(...props.map((p) => (0, codegen_1._)`${key} === ${p}`));
          } else {
            definedProp = codegen_1.nil;
          }
          if (patProps.length) {
            definedProp = (0, codegen_1.or)(definedProp, ...patProps.map((p) => (0, codegen_1._)`${(0, code_1.usePattern)(cxt, p)}.test(${key})`));
          }
          return (0, codegen_1.not)(definedProp);
        }
        function deleteAdditional(key) {
          gen.code((0, codegen_1._)`delete ${data}[${key}]`);
        }
        function additionalPropertyCode(key) {
          if (opts.removeAdditional === "all" || opts.removeAdditional && schema === false) {
            deleteAdditional(key);
            return;
          }
          if (schema === false) {
            cxt.setParams({ additionalProperty: key });
            cxt.error();
            if (!allErrors)
              gen.break();
            return;
          }
          if (typeof schema == "object" && !(0, util_1.alwaysValidSchema)(it, schema)) {
            const valid = gen.name("valid");
            if (opts.removeAdditional === "failing") {
              applyAdditionalSchema(key, valid, false);
              gen.if((0, codegen_1.not)(valid), () => {
                cxt.reset();
                deleteAdditional(key);
              });
            } else {
              applyAdditionalSchema(key, valid);
              if (!allErrors)
                gen.if((0, codegen_1.not)(valid), () => gen.break());
            }
          }
        }
        function applyAdditionalSchema(key, valid, errors) {
          const subschema = {
            keyword: "additionalProperties",
            dataProp: key,
            dataPropType: util_1.Type.Str
          };
          if (errors === false) {
            Object.assign(subschema, {
              compositeRule: true,
              createErrors: false,
              allErrors: false
            });
          }
          cxt.subschema(subschema, valid);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/properties.js
var require_properties = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/properties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var validate_1 = require_validate();
    var code_1 = require_code2();
    var util_1 = require_util();
    var additionalProperties_1 = require_additionalProperties();
    var def = {
      keyword: "properties",
      type: "object",
      schemaType: "object",
      code(cxt) {
        const { gen, schema, parentSchema, data, it } = cxt;
        if (it.opts.removeAdditional === "all" && parentSchema.additionalProperties === void 0) {
          additionalProperties_1.default.code(new validate_1.KeywordCxt(it, additionalProperties_1.default, "additionalProperties"));
        }
        const allProps = (0, code_1.allSchemaProperties)(schema);
        for (const prop of allProps) {
          it.definedProperties.add(prop);
        }
        if (it.opts.unevaluated && allProps.length && it.props !== true) {
          it.props = util_1.mergeEvaluated.props(gen, (0, util_1.toHash)(allProps), it.props);
        }
        const properties = allProps.filter((p) => !(0, util_1.alwaysValidSchema)(it, schema[p]));
        if (properties.length === 0)
          return;
        const valid = gen.name("valid");
        for (const prop of properties) {
          if (hasDefault(prop)) {
            applyPropertySchema(prop);
          } else {
            gen.if((0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties));
            applyPropertySchema(prop);
            if (!it.allErrors)
              gen.else().var(valid, true);
            gen.endIf();
          }
          cxt.it.definedProperties.add(prop);
          cxt.ok(valid);
        }
        function hasDefault(prop) {
          return it.opts.useDefaults && !it.compositeRule && schema[prop].default !== void 0;
        }
        function applyPropertySchema(prop) {
          cxt.subschema({
            keyword: "properties",
            schemaProp: prop,
            dataProp: prop
          }, valid);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/patternProperties.js
var require_patternProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/patternProperties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var util_2 = require_util();
    var def = {
      keyword: "patternProperties",
      type: "object",
      schemaType: "object",
      code(cxt) {
        const { gen, schema, data, parentSchema, it } = cxt;
        const { opts } = it;
        const patterns = (0, code_1.allSchemaProperties)(schema);
        const alwaysValidPatterns = patterns.filter((p) => (0, util_1.alwaysValidSchema)(it, schema[p]));
        if (patterns.length === 0 || alwaysValidPatterns.length === patterns.length && (!it.opts.unevaluated || it.props === true)) {
          return;
        }
        const checkProperties = opts.strictSchema && !opts.allowMatchingProperties && parentSchema.properties;
        const valid = gen.name("valid");
        if (it.props !== true && !(it.props instanceof codegen_1.Name)) {
          it.props = (0, util_2.evaluatedPropsToName)(gen, it.props);
        }
        const { props } = it;
        validatePatternProperties();
        function validatePatternProperties() {
          for (const pat of patterns) {
            if (checkProperties)
              checkMatchingProperties(pat);
            if (it.allErrors) {
              validateProperties(pat);
            } else {
              gen.var(valid, true);
              validateProperties(pat);
              gen.if(valid);
            }
          }
        }
        function checkMatchingProperties(pat) {
          for (const prop in checkProperties) {
            if (new RegExp(pat).test(prop)) {
              (0, util_1.checkStrictMode)(it, `property ${prop} matches pattern ${pat} (use allowMatchingProperties)`);
            }
          }
        }
        function validateProperties(pat) {
          gen.forIn("key", data, (key) => {
            gen.if((0, codegen_1._)`${(0, code_1.usePattern)(cxt, pat)}.test(${key})`, () => {
              const alwaysValid = alwaysValidPatterns.includes(pat);
              if (!alwaysValid) {
                cxt.subschema({
                  keyword: "patternProperties",
                  schemaProp: pat,
                  dataProp: key,
                  dataPropType: util_2.Type.Str
                }, valid);
              }
              if (it.opts.unevaluated && props !== true) {
                gen.assign((0, codegen_1._)`${props}[${key}]`, true);
              } else if (!alwaysValid && !it.allErrors) {
                gen.if((0, codegen_1.not)(valid), () => gen.break());
              }
            });
          });
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/not.js
var require_not = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/not.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: "not",
      schemaType: ["object", "boolean"],
      trackErrors: true,
      code(cxt) {
        const { gen, schema, it } = cxt;
        if ((0, util_1.alwaysValidSchema)(it, schema)) {
          cxt.fail();
          return;
        }
        const valid = gen.name("valid");
        cxt.subschema({
          keyword: "not",
          compositeRule: true,
          createErrors: false,
          allErrors: false
        }, valid);
        cxt.failResult(valid, () => cxt.reset(), () => cxt.error());
      },
      error: { message: "must NOT be valid" }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/anyOf.js
var require_anyOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/anyOf.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var def = {
      keyword: "anyOf",
      schemaType: "array",
      trackErrors: true,
      code: code_1.validateUnion,
      error: { message: "must match a schema in anyOf" }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/oneOf.js
var require_oneOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/oneOf.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error2 = {
      message: "must match exactly one schema in oneOf",
      params: ({ params }) => (0, codegen_1._)`{passingSchemas: ${params.passing}}`
    };
    var def = {
      keyword: "oneOf",
      schemaType: "array",
      trackErrors: true,
      error: error2,
      code(cxt) {
        const { gen, schema, parentSchema, it } = cxt;
        if (!Array.isArray(schema))
          throw new Error("ajv implementation error");
        if (it.opts.discriminator && parentSchema.discriminator)
          return;
        const schArr = schema;
        const valid = gen.let("valid", false);
        const passing = gen.let("passing", null);
        const schValid = gen.name("_valid");
        cxt.setParams({ passing });
        gen.block(validateOneOf);
        cxt.result(valid, () => cxt.reset(), () => cxt.error(true));
        function validateOneOf() {
          schArr.forEach((sch, i) => {
            let schCxt;
            if ((0, util_1.alwaysValidSchema)(it, sch)) {
              gen.var(schValid, true);
            } else {
              schCxt = cxt.subschema({
                keyword: "oneOf",
                schemaProp: i,
                compositeRule: true
              }, schValid);
            }
            if (i > 0) {
              gen.if((0, codegen_1._)`${schValid} && ${valid}`).assign(valid, false).assign(passing, (0, codegen_1._)`[${passing}, ${i}]`).else();
            }
            gen.if(schValid, () => {
              gen.assign(valid, true);
              gen.assign(passing, i);
              if (schCxt)
                cxt.mergeEvaluated(schCxt, codegen_1.Name);
            });
          });
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/allOf.js
var require_allOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/allOf.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: "allOf",
      schemaType: "array",
      code(cxt) {
        const { gen, schema, it } = cxt;
        if (!Array.isArray(schema))
          throw new Error("ajv implementation error");
        const valid = gen.name("valid");
        schema.forEach((sch, i) => {
          if ((0, util_1.alwaysValidSchema)(it, sch))
            return;
          const schCxt = cxt.subschema({ keyword: "allOf", schemaProp: i }, valid);
          cxt.ok(valid);
          cxt.mergeEvaluated(schCxt);
        });
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/if.js
var require_if = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/if.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error2 = {
      message: ({ params }) => (0, codegen_1.str)`must match "${params.ifClause}" schema`,
      params: ({ params }) => (0, codegen_1._)`{failingKeyword: ${params.ifClause}}`
    };
    var def = {
      keyword: "if",
      schemaType: ["object", "boolean"],
      trackErrors: true,
      error: error2,
      code(cxt) {
        const { gen, parentSchema, it } = cxt;
        if (parentSchema.then === void 0 && parentSchema.else === void 0) {
          (0, util_1.checkStrictMode)(it, '"if" without "then" and "else" is ignored');
        }
        const hasThen = hasSchema(it, "then");
        const hasElse = hasSchema(it, "else");
        if (!hasThen && !hasElse)
          return;
        const valid = gen.let("valid", true);
        const schValid = gen.name("_valid");
        validateIf();
        cxt.reset();
        if (hasThen && hasElse) {
          const ifClause = gen.let("ifClause");
          cxt.setParams({ ifClause });
          gen.if(schValid, validateClause("then", ifClause), validateClause("else", ifClause));
        } else if (hasThen) {
          gen.if(schValid, validateClause("then"));
        } else {
          gen.if((0, codegen_1.not)(schValid), validateClause("else"));
        }
        cxt.pass(valid, () => cxt.error(true));
        function validateIf() {
          const schCxt = cxt.subschema({
            keyword: "if",
            compositeRule: true,
            createErrors: false,
            allErrors: false
          }, schValid);
          cxt.mergeEvaluated(schCxt);
        }
        function validateClause(keyword, ifClause) {
          return () => {
            const schCxt = cxt.subschema({ keyword }, schValid);
            gen.assign(valid, schValid);
            cxt.mergeValidEvaluated(schCxt, valid);
            if (ifClause)
              gen.assign(ifClause, (0, codegen_1._)`${keyword}`);
            else
              cxt.setParams({ ifClause: keyword });
          };
        }
      }
    };
    function hasSchema(it, keyword) {
      const schema = it.schema[keyword];
      return schema !== void 0 && !(0, util_1.alwaysValidSchema)(it, schema);
    }
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/thenElse.js
var require_thenElse = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/thenElse.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: ["then", "else"],
      schemaType: ["object", "boolean"],
      code({ keyword, parentSchema, it }) {
        if (parentSchema.if === void 0)
          (0, util_1.checkStrictMode)(it, `"${keyword}" without "if" is ignored`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/index.js
var require_applicator = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var additionalItems_1 = require_additionalItems();
    var prefixItems_1 = require_prefixItems();
    var items_1 = require_items();
    var items2020_1 = require_items2020();
    var contains_1 = require_contains();
    var dependencies_1 = require_dependencies();
    var propertyNames_1 = require_propertyNames();
    var additionalProperties_1 = require_additionalProperties();
    var properties_1 = require_properties();
    var patternProperties_1 = require_patternProperties();
    var not_1 = require_not();
    var anyOf_1 = require_anyOf();
    var oneOf_1 = require_oneOf();
    var allOf_1 = require_allOf();
    var if_1 = require_if();
    var thenElse_1 = require_thenElse();
    function getApplicator(draft2020 = false) {
      const applicator = [
        // any
        not_1.default,
        anyOf_1.default,
        oneOf_1.default,
        allOf_1.default,
        if_1.default,
        thenElse_1.default,
        // object
        propertyNames_1.default,
        additionalProperties_1.default,
        dependencies_1.default,
        properties_1.default,
        patternProperties_1.default
      ];
      if (draft2020)
        applicator.push(prefixItems_1.default, items2020_1.default);
      else
        applicator.push(additionalItems_1.default, items_1.default);
      applicator.push(contains_1.default);
      return applicator;
    }
    exports.default = getApplicator;
  }
});

// node_modules/ajv/dist/vocabularies/format/format.js
var require_format = __commonJS({
  "node_modules/ajv/dist/vocabularies/format/format.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error2 = {
      message: ({ schemaCode }) => (0, codegen_1.str)`must match format "${schemaCode}"`,
      params: ({ schemaCode }) => (0, codegen_1._)`{format: ${schemaCode}}`
    };
    var def = {
      keyword: "format",
      type: ["number", "string"],
      schemaType: "string",
      $data: true,
      error: error2,
      code(cxt, ruleType) {
        const { gen, data, $data, schema, schemaCode, it } = cxt;
        const { opts, errSchemaPath, schemaEnv, self } = it;
        if (!opts.validateFormats)
          return;
        if ($data)
          validate$DataFormat();
        else
          validateFormat();
        function validate$DataFormat() {
          const fmts = gen.scopeValue("formats", {
            ref: self.formats,
            code: opts.code.formats
          });
          const fDef = gen.const("fDef", (0, codegen_1._)`${fmts}[${schemaCode}]`);
          const fType = gen.let("fType");
          const format = gen.let("format");
          gen.if((0, codegen_1._)`typeof ${fDef} == "object" && !(${fDef} instanceof RegExp)`, () => gen.assign(fType, (0, codegen_1._)`${fDef}.type || "string"`).assign(format, (0, codegen_1._)`${fDef}.validate`), () => gen.assign(fType, (0, codegen_1._)`"string"`).assign(format, fDef));
          cxt.fail$data((0, codegen_1.or)(unknownFmt(), invalidFmt()));
          function unknownFmt() {
            if (opts.strictSchema === false)
              return codegen_1.nil;
            return (0, codegen_1._)`${schemaCode} && !${format}`;
          }
          function invalidFmt() {
            const callFormat = schemaEnv.$async ? (0, codegen_1._)`(${fDef}.async ? await ${format}(${data}) : ${format}(${data}))` : (0, codegen_1._)`${format}(${data})`;
            const validData = (0, codegen_1._)`(typeof ${format} == "function" ? ${callFormat} : ${format}.test(${data}))`;
            return (0, codegen_1._)`${format} && ${format} !== true && ${fType} === ${ruleType} && !${validData}`;
          }
        }
        function validateFormat() {
          const formatDef = self.formats[schema];
          if (!formatDef) {
            unknownFormat();
            return;
          }
          if (formatDef === true)
            return;
          const [fmtType, format, fmtRef] = getFormat(formatDef);
          if (fmtType === ruleType)
            cxt.pass(validCondition());
          function unknownFormat() {
            if (opts.strictSchema === false) {
              self.logger.warn(unknownMsg());
              return;
            }
            throw new Error(unknownMsg());
            function unknownMsg() {
              return `unknown format "${schema}" ignored in schema at path "${errSchemaPath}"`;
            }
          }
          function getFormat(fmtDef) {
            const code2 = fmtDef instanceof RegExp ? (0, codegen_1.regexpCode)(fmtDef) : opts.code.formats ? (0, codegen_1._)`${opts.code.formats}${(0, codegen_1.getProperty)(schema)}` : void 0;
            const fmt = gen.scopeValue("formats", { key: schema, ref: fmtDef, code: code2 });
            if (typeof fmtDef == "object" && !(fmtDef instanceof RegExp)) {
              return [fmtDef.type || "string", fmtDef.validate, (0, codegen_1._)`${fmt}.validate`];
            }
            return ["string", fmtDef, fmt];
          }
          function validCondition() {
            if (typeof formatDef == "object" && !(formatDef instanceof RegExp) && formatDef.async) {
              if (!schemaEnv.$async)
                throw new Error("async format in sync schema");
              return (0, codegen_1._)`await ${fmtRef}(${data})`;
            }
            return typeof format == "function" ? (0, codegen_1._)`${fmtRef}(${data})` : (0, codegen_1._)`${fmtRef}.test(${data})`;
          }
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/format/index.js
var require_format2 = __commonJS({
  "node_modules/ajv/dist/vocabularies/format/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var format_1 = require_format();
    var format = [format_1.default];
    exports.default = format;
  }
});

// node_modules/ajv/dist/vocabularies/metadata.js
var require_metadata = __commonJS({
  "node_modules/ajv/dist/vocabularies/metadata.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.contentVocabulary = exports.metadataVocabulary = void 0;
    exports.metadataVocabulary = [
      "title",
      "description",
      "default",
      "deprecated",
      "readOnly",
      "writeOnly",
      "examples"
    ];
    exports.contentVocabulary = [
      "contentMediaType",
      "contentEncoding",
      "contentSchema"
    ];
  }
});

// node_modules/ajv/dist/vocabularies/draft7.js
var require_draft7 = __commonJS({
  "node_modules/ajv/dist/vocabularies/draft7.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var core_1 = require_core2();
    var validation_1 = require_validation();
    var applicator_1 = require_applicator();
    var format_1 = require_format2();
    var metadata_1 = require_metadata();
    var draft7Vocabularies = [
      core_1.default,
      validation_1.default,
      (0, applicator_1.default)(),
      format_1.default,
      metadata_1.metadataVocabulary,
      metadata_1.contentVocabulary
    ];
    exports.default = draft7Vocabularies;
  }
});

// node_modules/ajv/dist/vocabularies/discriminator/types.js
var require_types = __commonJS({
  "node_modules/ajv/dist/vocabularies/discriminator/types.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiscrError = void 0;
    var DiscrError;
    (function(DiscrError2) {
      DiscrError2["Tag"] = "tag";
      DiscrError2["Mapping"] = "mapping";
    })(DiscrError || (exports.DiscrError = DiscrError = {}));
  }
});

// node_modules/ajv/dist/vocabularies/discriminator/index.js
var require_discriminator = __commonJS({
  "node_modules/ajv/dist/vocabularies/discriminator/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var types_1 = require_types();
    var compile_1 = require_compile();
    var ref_error_1 = require_ref_error();
    var util_1 = require_util();
    var error2 = {
      message: ({ params: { discrError, tagName } }) => discrError === types_1.DiscrError.Tag ? `tag "${tagName}" must be string` : `value of tag "${tagName}" must be in oneOf`,
      params: ({ params: { discrError, tag, tagName } }) => (0, codegen_1._)`{error: ${discrError}, tag: ${tagName}, tagValue: ${tag}}`
    };
    var def = {
      keyword: "discriminator",
      type: "object",
      schemaType: "object",
      error: error2,
      code(cxt) {
        const { gen, data, schema, parentSchema, it } = cxt;
        const { oneOf } = parentSchema;
        if (!it.opts.discriminator) {
          throw new Error("discriminator: requires discriminator option");
        }
        const tagName = schema.propertyName;
        if (typeof tagName != "string")
          throw new Error("discriminator: requires propertyName");
        if (schema.mapping)
          throw new Error("discriminator: mapping is not supported");
        if (!oneOf)
          throw new Error("discriminator: requires oneOf keyword");
        const valid = gen.let("valid", false);
        const tag = gen.const("tag", (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(tagName)}`);
        gen.if((0, codegen_1._)`typeof ${tag} == "string"`, () => validateMapping(), () => cxt.error(false, { discrError: types_1.DiscrError.Tag, tag, tagName }));
        cxt.ok(valid);
        function validateMapping() {
          const mapping = getMapping();
          gen.if(false);
          for (const tagValue in mapping) {
            gen.elseIf((0, codegen_1._)`${tag} === ${tagValue}`);
            gen.assign(valid, applyTagSchema(mapping[tagValue]));
          }
          gen.else();
          cxt.error(false, { discrError: types_1.DiscrError.Mapping, tag, tagName });
          gen.endIf();
        }
        function applyTagSchema(schemaProp) {
          const _valid = gen.name("valid");
          const schCxt = cxt.subschema({ keyword: "oneOf", schemaProp }, _valid);
          cxt.mergeEvaluated(schCxt, codegen_1.Name);
          return _valid;
        }
        function getMapping() {
          var _a3;
          const oneOfMapping = {};
          const topRequired = hasRequired(parentSchema);
          let tagRequired = true;
          for (let i = 0; i < oneOf.length; i++) {
            let sch = oneOf[i];
            if ((sch === null || sch === void 0 ? void 0 : sch.$ref) && !(0, util_1.schemaHasRulesButRef)(sch, it.self.RULES)) {
              const ref = sch.$ref;
              sch = compile_1.resolveRef.call(it.self, it.schemaEnv.root, it.baseId, ref);
              if (sch instanceof compile_1.SchemaEnv)
                sch = sch.schema;
              if (sch === void 0)
                throw new ref_error_1.default(it.opts.uriResolver, it.baseId, ref);
            }
            const propSch = (_a3 = sch === null || sch === void 0 ? void 0 : sch.properties) === null || _a3 === void 0 ? void 0 : _a3[tagName];
            if (typeof propSch != "object") {
              throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${tagName}"`);
            }
            tagRequired = tagRequired && (topRequired || hasRequired(sch));
            addMappings(propSch, i);
          }
          if (!tagRequired)
            throw new Error(`discriminator: "${tagName}" must be required`);
          return oneOfMapping;
          function hasRequired({ required: required2 }) {
            return Array.isArray(required2) && required2.includes(tagName);
          }
          function addMappings(sch, i) {
            if (sch.const) {
              addMapping(sch.const, i);
            } else if (sch.enum) {
              for (const tagValue of sch.enum) {
                addMapping(tagValue, i);
              }
            } else {
              throw new Error(`discriminator: "properties/${tagName}" must have "const" or "enum"`);
            }
          }
          function addMapping(tagValue, i) {
            if (typeof tagValue != "string" || tagValue in oneOfMapping) {
              throw new Error(`discriminator: "${tagName}" values must be unique strings`);
            }
            oneOfMapping[tagValue] = i;
          }
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/refs/json-schema-draft-07.json
var require_json_schema_draft_07 = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-draft-07.json"(exports, module) {
    module.exports = {
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "http://json-schema.org/draft-07/schema#",
      title: "Core schema meta-schema",
      definitions: {
        schemaArray: {
          type: "array",
          minItems: 1,
          items: { $ref: "#" }
        },
        nonNegativeInteger: {
          type: "integer",
          minimum: 0
        },
        nonNegativeIntegerDefault0: {
          allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }]
        },
        simpleTypes: {
          enum: ["array", "boolean", "integer", "null", "number", "object", "string"]
        },
        stringArray: {
          type: "array",
          items: { type: "string" },
          uniqueItems: true,
          default: []
        }
      },
      type: ["object", "boolean"],
      properties: {
        $id: {
          type: "string",
          format: "uri-reference"
        },
        $schema: {
          type: "string",
          format: "uri"
        },
        $ref: {
          type: "string",
          format: "uri-reference"
        },
        $comment: {
          type: "string"
        },
        title: {
          type: "string"
        },
        description: {
          type: "string"
        },
        default: true,
        readOnly: {
          type: "boolean",
          default: false
        },
        examples: {
          type: "array",
          items: true
        },
        multipleOf: {
          type: "number",
          exclusiveMinimum: 0
        },
        maximum: {
          type: "number"
        },
        exclusiveMaximum: {
          type: "number"
        },
        minimum: {
          type: "number"
        },
        exclusiveMinimum: {
          type: "number"
        },
        maxLength: { $ref: "#/definitions/nonNegativeInteger" },
        minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
        pattern: {
          type: "string",
          format: "regex"
        },
        additionalItems: { $ref: "#" },
        items: {
          anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }],
          default: true
        },
        maxItems: { $ref: "#/definitions/nonNegativeInteger" },
        minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
        uniqueItems: {
          type: "boolean",
          default: false
        },
        contains: { $ref: "#" },
        maxProperties: { $ref: "#/definitions/nonNegativeInteger" },
        minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
        required: { $ref: "#/definitions/stringArray" },
        additionalProperties: { $ref: "#" },
        definitions: {
          type: "object",
          additionalProperties: { $ref: "#" },
          default: {}
        },
        properties: {
          type: "object",
          additionalProperties: { $ref: "#" },
          default: {}
        },
        patternProperties: {
          type: "object",
          additionalProperties: { $ref: "#" },
          propertyNames: { format: "regex" },
          default: {}
        },
        dependencies: {
          type: "object",
          additionalProperties: {
            anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }]
          }
        },
        propertyNames: { $ref: "#" },
        const: true,
        enum: {
          type: "array",
          items: true,
          minItems: 1,
          uniqueItems: true
        },
        type: {
          anyOf: [
            { $ref: "#/definitions/simpleTypes" },
            {
              type: "array",
              items: { $ref: "#/definitions/simpleTypes" },
              minItems: 1,
              uniqueItems: true
            }
          ]
        },
        format: { type: "string" },
        contentMediaType: { type: "string" },
        contentEncoding: { type: "string" },
        if: { $ref: "#" },
        then: { $ref: "#" },
        else: { $ref: "#" },
        allOf: { $ref: "#/definitions/schemaArray" },
        anyOf: { $ref: "#/definitions/schemaArray" },
        oneOf: { $ref: "#/definitions/schemaArray" },
        not: { $ref: "#" }
      },
      default: true
    };
  }
});

// node_modules/ajv/dist/ajv.js
var require_ajv = __commonJS({
  "node_modules/ajv/dist/ajv.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MissingRefError = exports.ValidationError = exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = exports.Ajv = void 0;
    var core_1 = require_core();
    var draft7_1 = require_draft7();
    var discriminator_1 = require_discriminator();
    var draft7MetaSchema = require_json_schema_draft_07();
    var META_SUPPORT_DATA = ["/properties"];
    var META_SCHEMA_ID = "http://json-schema.org/draft-07/schema";
    var Ajv2 = class extends core_1.default {
      _addVocabularies() {
        super._addVocabularies();
        draft7_1.default.forEach((v) => this.addVocabulary(v));
        if (this.opts.discriminator)
          this.addKeyword(discriminator_1.default);
      }
      _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        if (!this.opts.meta)
          return;
        const metaSchema = this.opts.$data ? this.$dataMetaSchema(draft7MetaSchema, META_SUPPORT_DATA) : draft7MetaSchema;
        this.addMetaSchema(metaSchema, META_SCHEMA_ID, false);
        this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : void 0);
      }
    };
    exports.Ajv = Ajv2;
    module.exports = exports = Ajv2;
    module.exports.Ajv = Ajv2;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Ajv2;
    var validate_1 = require_validate();
    Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: function() {
      return validate_1.KeywordCxt;
    } });
    var codegen_1 = require_codegen();
    Object.defineProperty(exports, "_", { enumerable: true, get: function() {
      return codegen_1._;
    } });
    Object.defineProperty(exports, "str", { enumerable: true, get: function() {
      return codegen_1.str;
    } });
    Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
      return codegen_1.stringify;
    } });
    Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
      return codegen_1.nil;
    } });
    Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
      return codegen_1.Name;
    } });
    Object.defineProperty(exports, "CodeGen", { enumerable: true, get: function() {
      return codegen_1.CodeGen;
    } });
    var validation_error_1 = require_validation_error();
    Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function() {
      return validation_error_1.default;
    } });
    var ref_error_1 = require_ref_error();
    Object.defineProperty(exports, "MissingRefError", { enumerable: true, get: function() {
      return ref_error_1.default;
    } });
  }
});

// node_modules/ajv-formats/dist/formats.js
var require_formats = __commonJS({
  "node_modules/ajv-formats/dist/formats.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.formatNames = exports.fastFormats = exports.fullFormats = void 0;
    function fmtDef(validate, compare) {
      return { validate, compare };
    }
    exports.fullFormats = {
      // date: http://tools.ietf.org/html/rfc3339#section-5.6
      date: fmtDef(date3, compareDate),
      // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
      time: fmtDef(getTime(true), compareTime),
      "date-time": fmtDef(getDateTime(true), compareDateTime),
      "iso-time": fmtDef(getTime(), compareIsoTime),
      "iso-date-time": fmtDef(getDateTime(), compareIsoDateTime),
      // duration: https://tools.ietf.org/html/rfc3339#appendix-A
      duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
      uri,
      "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
      // uri-template: https://tools.ietf.org/html/rfc6570
      "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
      // For the source: https://gist.github.com/dperini/729294
      // For test cases: https://mathiasbynens.be/demo/url-regex
      url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
      email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
      hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
      // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
      ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
      ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
      regex,
      // uuid: http://tools.ietf.org/html/rfc4122
      uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
      // JSON-pointer: https://tools.ietf.org/html/rfc6901
      // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
      "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
      "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
      // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
      "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
      // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
      // byte: https://github.com/miguelmota/is-base64
      byte,
      // signed 32 bit integer
      int32: { type: "number", validate: validateInt32 },
      // signed 64 bit integer
      int64: { type: "number", validate: validateInt64 },
      // C-type float
      float: { type: "number", validate: validateNumber },
      // C-type double
      double: { type: "number", validate: validateNumber },
      // hint to the UI to hide input strings
      password: true,
      // unchecked string payload
      binary: true
    };
    exports.fastFormats = {
      ...exports.fullFormats,
      date: fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, compareDate),
      time: fmtDef(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, compareTime),
      "date-time": fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, compareDateTime),
      "iso-time": fmtDef(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, compareIsoTime),
      "iso-date-time": fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, compareIsoDateTime),
      // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
      uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
      "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
      // email (sources from jsen validator):
      // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
      // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
      email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
    };
    exports.formatNames = Object.keys(exports.fullFormats);
    function isLeapYear(year) {
      return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    }
    var DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
    var DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function date3(str) {
      const matches = DATE.exec(str);
      if (!matches)
        return false;
      const year = +matches[1];
      const month = +matches[2];
      const day = +matches[3];
      return month >= 1 && month <= 12 && day >= 1 && day <= (month === 2 && isLeapYear(year) ? 29 : DAYS[month]);
    }
    function compareDate(d1, d2) {
      if (!(d1 && d2))
        return void 0;
      if (d1 > d2)
        return 1;
      if (d1 < d2)
        return -1;
      return 0;
    }
    var TIME = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
    function getTime(strictTimeZone) {
      return function time3(str) {
        const matches = TIME.exec(str);
        if (!matches)
          return false;
        const hr = +matches[1];
        const min = +matches[2];
        const sec = +matches[3];
        const tz = matches[4];
        const tzSign = matches[5] === "-" ? -1 : 1;
        const tzH = +(matches[6] || 0);
        const tzM = +(matches[7] || 0);
        if (tzH > 23 || tzM > 59 || strictTimeZone && !tz)
          return false;
        if (hr <= 23 && min <= 59 && sec < 60)
          return true;
        const utcMin = min - tzM * tzSign;
        const utcHr = hr - tzH * tzSign - (utcMin < 0 ? 1 : 0);
        return (utcHr === 23 || utcHr === -1) && (utcMin === 59 || utcMin === -1) && sec < 61;
      };
    }
    function compareTime(s1, s2) {
      if (!(s1 && s2))
        return void 0;
      const t1 = (/* @__PURE__ */ new Date("2020-01-01T" + s1)).valueOf();
      const t2 = (/* @__PURE__ */ new Date("2020-01-01T" + s2)).valueOf();
      if (!(t1 && t2))
        return void 0;
      return t1 - t2;
    }
    function compareIsoTime(t1, t2) {
      if (!(t1 && t2))
        return void 0;
      const a1 = TIME.exec(t1);
      const a2 = TIME.exec(t2);
      if (!(a1 && a2))
        return void 0;
      t1 = a1[1] + a1[2] + a1[3];
      t2 = a2[1] + a2[2] + a2[3];
      if (t1 > t2)
        return 1;
      if (t1 < t2)
        return -1;
      return 0;
    }
    var DATE_TIME_SEPARATOR = /t|\s/i;
    function getDateTime(strictTimeZone) {
      const time3 = getTime(strictTimeZone);
      return function date_time(str) {
        const dateTime = str.split(DATE_TIME_SEPARATOR);
        return dateTime.length === 2 && date3(dateTime[0]) && time3(dateTime[1]);
      };
    }
    function compareDateTime(dt1, dt2) {
      if (!(dt1 && dt2))
        return void 0;
      const d1 = new Date(dt1).valueOf();
      const d2 = new Date(dt2).valueOf();
      if (!(d1 && d2))
        return void 0;
      return d1 - d2;
    }
    function compareIsoDateTime(dt1, dt2) {
      if (!(dt1 && dt2))
        return void 0;
      const [d1, t1] = dt1.split(DATE_TIME_SEPARATOR);
      const [d2, t2] = dt2.split(DATE_TIME_SEPARATOR);
      const res = compareDate(d1, d2);
      if (res === void 0)
        return void 0;
      return res || compareTime(t1, t2);
    }
    var NOT_URI_FRAGMENT = /\/|:/;
    var URI = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    function uri(str) {
      return NOT_URI_FRAGMENT.test(str) && URI.test(str);
    }
    var BYTE = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
    function byte(str) {
      BYTE.lastIndex = 0;
      return BYTE.test(str);
    }
    var MIN_INT32 = -(2 ** 31);
    var MAX_INT32 = 2 ** 31 - 1;
    function validateInt32(value) {
      return Number.isInteger(value) && value <= MAX_INT32 && value >= MIN_INT32;
    }
    function validateInt64(value) {
      return Number.isInteger(value);
    }
    function validateNumber() {
      return true;
    }
    var Z_ANCHOR = /[^\\]\\Z/;
    function regex(str) {
      if (Z_ANCHOR.test(str))
        return false;
      try {
        new RegExp(str);
        return true;
      } catch (e) {
        return false;
      }
    }
  }
});

// node_modules/ajv-formats/dist/limit.js
var require_limit = __commonJS({
  "node_modules/ajv-formats/dist/limit.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.formatLimitDefinition = void 0;
    var ajv_1 = require_ajv();
    var codegen_1 = require_codegen();
    var ops = codegen_1.operators;
    var KWDs = {
      formatMaximum: { okStr: "<=", ok: ops.LTE, fail: ops.GT },
      formatMinimum: { okStr: ">=", ok: ops.GTE, fail: ops.LT },
      formatExclusiveMaximum: { okStr: "<", ok: ops.LT, fail: ops.GTE },
      formatExclusiveMinimum: { okStr: ">", ok: ops.GT, fail: ops.LTE }
    };
    var error2 = {
      message: ({ keyword, schemaCode }) => (0, codegen_1.str)`should be ${KWDs[keyword].okStr} ${schemaCode}`,
      params: ({ keyword, schemaCode }) => (0, codegen_1._)`{comparison: ${KWDs[keyword].okStr}, limit: ${schemaCode}}`
    };
    exports.formatLimitDefinition = {
      keyword: Object.keys(KWDs),
      type: "string",
      schemaType: "string",
      $data: true,
      error: error2,
      code(cxt) {
        const { gen, data, schemaCode, keyword, it } = cxt;
        const { opts, self } = it;
        if (!opts.validateFormats)
          return;
        const fCxt = new ajv_1.KeywordCxt(it, self.RULES.all.format.definition, "format");
        if (fCxt.$data)
          validate$DataFormat();
        else
          validateFormat();
        function validate$DataFormat() {
          const fmts = gen.scopeValue("formats", {
            ref: self.formats,
            code: opts.code.formats
          });
          const fmt = gen.const("fmt", (0, codegen_1._)`${fmts}[${fCxt.schemaCode}]`);
          cxt.fail$data((0, codegen_1.or)((0, codegen_1._)`typeof ${fmt} != "object"`, (0, codegen_1._)`${fmt} instanceof RegExp`, (0, codegen_1._)`typeof ${fmt}.compare != "function"`, compareCode(fmt)));
        }
        function validateFormat() {
          const format = fCxt.schema;
          const fmtDef = self.formats[format];
          if (!fmtDef || fmtDef === true)
            return;
          if (typeof fmtDef != "object" || fmtDef instanceof RegExp || typeof fmtDef.compare != "function") {
            throw new Error(`"${keyword}": format "${format}" does not define "compare" function`);
          }
          const fmt = gen.scopeValue("formats", {
            key: format,
            ref: fmtDef,
            code: opts.code.formats ? (0, codegen_1._)`${opts.code.formats}${(0, codegen_1.getProperty)(format)}` : void 0
          });
          cxt.fail$data(compareCode(fmt));
        }
        function compareCode(fmt) {
          return (0, codegen_1._)`${fmt}.compare(${data}, ${schemaCode}) ${KWDs[keyword].fail} 0`;
        }
      },
      dependencies: ["format"]
    };
    var formatLimitPlugin = (ajv) => {
      ajv.addKeyword(exports.formatLimitDefinition);
      return ajv;
    };
    exports.default = formatLimitPlugin;
  }
});

// node_modules/ajv-formats/dist/index.js
var require_dist = __commonJS({
  "node_modules/ajv-formats/dist/index.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var formats_1 = require_formats();
    var limit_1 = require_limit();
    var codegen_1 = require_codegen();
    var fullName = new codegen_1.Name("fullFormats");
    var fastName = new codegen_1.Name("fastFormats");
    var formatsPlugin = (ajv, opts = { keywords: true }) => {
      if (Array.isArray(opts)) {
        addFormats(ajv, opts, formats_1.fullFormats, fullName);
        return ajv;
      }
      const [formats, exportName] = opts.mode === "fast" ? [formats_1.fastFormats, fastName] : [formats_1.fullFormats, fullName];
      const list = opts.formats || formats_1.formatNames;
      addFormats(ajv, list, formats, exportName);
      if (opts.keywords)
        (0, limit_1.default)(ajv);
      return ajv;
    };
    formatsPlugin.get = (name, mode = "full") => {
      const formats = mode === "fast" ? formats_1.fastFormats : formats_1.fullFormats;
      const f = formats[name];
      if (!f)
        throw new Error(`Unknown format "${name}"`);
      return f;
    };
    function addFormats(ajv, list, fs, exportName) {
      var _a3;
      var _b;
      (_a3 = (_b = ajv.opts.code).formats) !== null && _a3 !== void 0 ? _a3 : _b.formats = (0, codegen_1._)`require("ajv-formats/dist/formats").${exportName}`;
      for (const f of list)
        ajv.addFormat(f, fs[f]);
    }
    module.exports = exports = formatsPlugin;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = formatsPlugin;
  }
});

// node_modules/@modelcontextprotocol/sdk/dist/esm/validation/ajv-provider.js
function createDefaultAjvInstance() {
  const ajv = new import_ajv.default({
    strict: false,
    validateFormats: true,
    validateSchema: false,
    allErrors: true
  });
  const addFormats = import_ajv_formats.default;
  addFormats(ajv);
  return ajv;
}
var import_ajv, import_ajv_formats, AjvJsonSchemaValidator;
var init_ajv_provider = __esm({
  "node_modules/@modelcontextprotocol/sdk/dist/esm/validation/ajv-provider.js"() {
    import_ajv = __toESM(require_ajv(), 1);
    import_ajv_formats = __toESM(require_dist(), 1);
    AjvJsonSchemaValidator = class {
      /**
       * Create an AJV validator
       *
       * @param ajv - Optional pre-configured AJV instance. If not provided, a default instance will be created.
       *
       * @example
       * ```typescript
       * // Use default configuration (recommended for most cases)
       * import { AjvJsonSchemaValidator } from '@modelcontextprotocol/sdk/validation/ajv';
       * const validator = new AjvJsonSchemaValidator();
       *
       * // Or provide custom AJV instance for advanced configuration
       * import { Ajv } from 'ajv';
       * import addFormats from 'ajv-formats';
       *
       * const ajv = new Ajv({ validateFormats: true });
       * addFormats(ajv);
       * const validator = new AjvJsonSchemaValidator(ajv);
       * ```
       */
      constructor(ajv) {
        this._ajv = ajv ?? createDefaultAjvInstance();
      }
      /**
       * Create a validator for the given JSON Schema
       *
       * The validator is compiled once and can be reused multiple times.
       * If the schema has an $id, it will be cached by AJV automatically.
       *
       * @param schema - Standard JSON Schema object
       * @returns A validator function that validates input data
       */
      getValidator(schema) {
        const ajvValidator = "$id" in schema && typeof schema.$id === "string" ? this._ajv.getSchema(schema.$id) ?? this._ajv.compile(schema) : this._ajv.compile(schema);
        return (input) => {
          const valid = ajvValidator(input);
          if (valid) {
            return {
              valid: true,
              data: input,
              errorMessage: void 0
            };
          } else {
            return {
              valid: false,
              data: void 0,
              errorMessage: this._ajv.errorsText(ajvValidator.errors)
            };
          }
        };
      }
    };
  }
});

// node_modules/@modelcontextprotocol/sdk/dist/esm/experimental/tasks/client.js
var ExperimentalClientTasks;
var init_client = __esm({
  "node_modules/@modelcontextprotocol/sdk/dist/esm/experimental/tasks/client.js"() {
    init_types();
    ExperimentalClientTasks = class {
      constructor(_client) {
        this._client = _client;
      }
      /**
       * Calls a tool and returns an AsyncGenerator that yields response messages.
       * The generator is guaranteed to end with either a 'result' or 'error' message.
       *
       * This method provides streaming access to tool execution, allowing you to
       * observe intermediate task status updates for long-running tool calls.
       * Automatically validates structured output if the tool has an outputSchema.
       *
       * @example
       * ```typescript
       * const stream = client.experimental.tasks.callToolStream({ name: 'myTool', arguments: {} });
       * for await (const message of stream) {
       *   switch (message.type) {
       *     case 'taskCreated':
       *       console.log('Tool execution started:', message.task.taskId);
       *       break;
       *     case 'taskStatus':
       *       console.log('Tool status:', message.task.status);
       *       break;
       *     case 'result':
       *       console.log('Tool result:', message.result);
       *       break;
       *     case 'error':
       *       console.error('Tool error:', message.error);
       *       break;
       *   }
       * }
       * ```
       *
       * @param params - Tool call parameters (name and arguments)
       * @param resultSchema - Zod schema for validating the result (defaults to CallToolResultSchema)
       * @param options - Optional request options (timeout, signal, task creation params, etc.)
       * @returns AsyncGenerator that yields ResponseMessage objects
       *
       * @experimental
       */
      async *callToolStream(params, resultSchema = CallToolResultSchema, options) {
        const clientInternal = this._client;
        const optionsWithTask = {
          ...options,
          // We check if the tool is known to be a task during auto-configuration, but assume
          // the caller knows what they're doing if they pass this explicitly
          task: options?.task ?? (clientInternal.isToolTask(params.name) ? {} : void 0)
        };
        const stream = clientInternal.requestStream({ method: "tools/call", params }, resultSchema, optionsWithTask);
        const validator = clientInternal.getToolOutputValidator(params.name);
        for await (const message of stream) {
          if (message.type === "result" && validator) {
            const result = message.result;
            if (!result.structuredContent && !result.isError) {
              yield {
                type: "error",
                error: new McpError(ErrorCode.InvalidRequest, `Tool ${params.name} has an output schema but did not return structured content`)
              };
              return;
            }
            if (result.structuredContent) {
              try {
                const validationResult = validator(result.structuredContent);
                if (!validationResult.valid) {
                  yield {
                    type: "error",
                    error: new McpError(ErrorCode.InvalidParams, `Structured content does not match the tool's output schema: ${validationResult.errorMessage}`)
                  };
                  return;
                }
              } catch (error2) {
                if (error2 instanceof McpError) {
                  yield { type: "error", error: error2 };
                  return;
                }
                yield {
                  type: "error",
                  error: new McpError(ErrorCode.InvalidParams, `Failed to validate structured content: ${error2 instanceof Error ? error2.message : String(error2)}`)
                };
                return;
              }
            }
          }
          yield message;
        }
      }
      /**
       * Gets the current status of a task.
       *
       * @param taskId - The task identifier
       * @param options - Optional request options
       * @returns The task status
       *
       * @experimental
       */
      async getTask(taskId, options) {
        return this._client.getTask({ taskId }, options);
      }
      /**
       * Retrieves the result of a completed task.
       *
       * @param taskId - The task identifier
       * @param resultSchema - Zod schema for validating the result
       * @param options - Optional request options
       * @returns The task result
       *
       * @experimental
       */
      async getTaskResult(taskId, resultSchema, options) {
        return this._client.getTaskResult({ taskId }, resultSchema, options);
      }
      /**
       * Lists tasks with optional pagination.
       *
       * @param cursor - Optional pagination cursor
       * @param options - Optional request options
       * @returns List of tasks with optional next cursor
       *
       * @experimental
       */
      async listTasks(cursor, options) {
        return this._client.listTasks(cursor ? { cursor } : void 0, options);
      }
      /**
       * Cancels a running task.
       *
       * @param taskId - The task identifier
       * @param options - Optional request options
       *
       * @experimental
       */
      async cancelTask(taskId, options) {
        return this._client.cancelTask({ taskId }, options);
      }
      /**
       * Sends a request and returns an AsyncGenerator that yields response messages.
       * The generator is guaranteed to end with either a 'result' or 'error' message.
       *
       * This method provides streaming access to request processing, allowing you to
       * observe intermediate task status updates for task-augmented requests.
       *
       * @param request - The request to send
       * @param resultSchema - Zod schema for validating the result
       * @param options - Optional request options (timeout, signal, task creation params, etc.)
       * @returns AsyncGenerator that yields ResponseMessage objects
       *
       * @experimental
       */
      requestStream(request, resultSchema, options) {
        return this._client.requestStream(request, resultSchema, options);
      }
    };
  }
});

// node_modules/@modelcontextprotocol/sdk/dist/esm/experimental/tasks/helpers.js
function assertToolsCallTaskCapability(requests, method, entityName) {
  if (!requests) {
    throw new Error(`${entityName} does not support task creation (required for ${method})`);
  }
  switch (method) {
    case "tools/call":
      if (!requests.tools?.call) {
        throw new Error(`${entityName} does not support task creation for tools/call (required for ${method})`);
      }
      break;
    default:
      break;
  }
}
function assertClientRequestTaskCapability(requests, method, entityName) {
  if (!requests) {
    throw new Error(`${entityName} does not support task creation (required for ${method})`);
  }
  switch (method) {
    case "sampling/createMessage":
      if (!requests.sampling?.createMessage) {
        throw new Error(`${entityName} does not support task creation for sampling/createMessage (required for ${method})`);
      }
      break;
    case "elicitation/create":
      if (!requests.elicitation?.create) {
        throw new Error(`${entityName} does not support task creation for elicitation/create (required for ${method})`);
      }
      break;
    default:
      break;
  }
}
var init_helpers = __esm({
  "node_modules/@modelcontextprotocol/sdk/dist/esm/experimental/tasks/helpers.js"() {
  }
});

// node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js
function applyElicitationDefaults(schema, data) {
  if (!schema || data === null || typeof data !== "object")
    return;
  if (schema.type === "object" && schema.properties && typeof schema.properties === "object") {
    const obj = data;
    const props = schema.properties;
    for (const key of Object.keys(props)) {
      const propSchema = props[key];
      if (obj[key] === void 0 && Object.prototype.hasOwnProperty.call(propSchema, "default")) {
        obj[key] = propSchema.default;
      }
      if (obj[key] !== void 0) {
        applyElicitationDefaults(propSchema, obj[key]);
      }
    }
  }
  if (Array.isArray(schema.anyOf)) {
    for (const sub of schema.anyOf) {
      if (typeof sub !== "boolean") {
        applyElicitationDefaults(sub, data);
      }
    }
  }
  if (Array.isArray(schema.oneOf)) {
    for (const sub of schema.oneOf) {
      if (typeof sub !== "boolean") {
        applyElicitationDefaults(sub, data);
      }
    }
  }
}
function getSupportedElicitationModes(capabilities) {
  if (!capabilities) {
    return { supportsFormMode: false, supportsUrlMode: false };
  }
  const hasFormCapability = capabilities.form !== void 0;
  const hasUrlCapability = capabilities.url !== void 0;
  const supportsFormMode = hasFormCapability || !hasFormCapability && !hasUrlCapability;
  const supportsUrlMode = hasUrlCapability;
  return { supportsFormMode, supportsUrlMode };
}
var Client;
var init_client2 = __esm({
  "node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js"() {
    init_protocol();
    init_types();
    init_ajv_provider();
    init_zod_compat();
    init_client();
    init_helpers();
    Client = class extends Protocol {
      /**
       * Initializes this client with the given name and version information.
       */
      constructor(_clientInfo, options) {
        super(options);
        this._clientInfo = _clientInfo;
        this._cachedToolOutputValidators = /* @__PURE__ */ new Map();
        this._cachedKnownTaskTools = /* @__PURE__ */ new Set();
        this._cachedRequiredTaskTools = /* @__PURE__ */ new Set();
        this._listChangedDebounceTimers = /* @__PURE__ */ new Map();
        this._capabilities = options?.capabilities ?? {};
        this._jsonSchemaValidator = options?.jsonSchemaValidator ?? new AjvJsonSchemaValidator();
        if (options?.listChanged) {
          this._pendingListChangedConfig = options.listChanged;
        }
      }
      /**
       * Set up handlers for list changed notifications based on config and server capabilities.
       * This should only be called after initialization when server capabilities are known.
       * Handlers are silently skipped if the server doesn't advertise the corresponding listChanged capability.
       * @internal
       */
      _setupListChangedHandlers(config2) {
        if (config2.tools && this._serverCapabilities?.tools?.listChanged) {
          this._setupListChangedHandler("tools", ToolListChangedNotificationSchema, config2.tools, async () => {
            const result = await this.listTools();
            return result.tools;
          });
        }
        if (config2.prompts && this._serverCapabilities?.prompts?.listChanged) {
          this._setupListChangedHandler("prompts", PromptListChangedNotificationSchema, config2.prompts, async () => {
            const result = await this.listPrompts();
            return result.prompts;
          });
        }
        if (config2.resources && this._serverCapabilities?.resources?.listChanged) {
          this._setupListChangedHandler("resources", ResourceListChangedNotificationSchema, config2.resources, async () => {
            const result = await this.listResources();
            return result.resources;
          });
        }
      }
      /**
       * Access experimental features.
       *
       * WARNING: These APIs are experimental and may change without notice.
       *
       * @experimental
       */
      get experimental() {
        if (!this._experimental) {
          this._experimental = {
            tasks: new ExperimentalClientTasks(this)
          };
        }
        return this._experimental;
      }
      /**
       * Registers new capabilities. This can only be called before connecting to a transport.
       *
       * The new capabilities will be merged with any existing capabilities previously given (e.g., at initialization).
       */
      registerCapabilities(capabilities) {
        if (this.transport) {
          throw new Error("Cannot register capabilities after connecting to transport");
        }
        this._capabilities = mergeCapabilities(this._capabilities, capabilities);
      }
      /**
       * Override request handler registration to enforce client-side validation for elicitation.
       */
      setRequestHandler(requestSchema, handler) {
        const shape = getObjectShape(requestSchema);
        const methodSchema = shape?.method;
        if (!methodSchema) {
          throw new Error("Schema is missing a method literal");
        }
        const methodValue = getLiteralValue(methodSchema);
        if (typeof methodValue !== "string") {
          throw new Error("Schema method literal must be a string");
        }
        const method = methodValue;
        if (method === "elicitation/create") {
          const wrappedHandler = async (request, extra) => {
            const validatedRequest = safeParse3(ElicitRequestSchema, request);
            if (!validatedRequest.success) {
              const errorMessage = validatedRequest.error instanceof Error ? validatedRequest.error.message : String(validatedRequest.error);
              throw new McpError(ErrorCode.InvalidParams, `Invalid elicitation request: ${errorMessage}`);
            }
            const { params } = validatedRequest.data;
            params.mode = params.mode ?? "form";
            const { supportsFormMode, supportsUrlMode } = getSupportedElicitationModes(this._capabilities.elicitation);
            if (params.mode === "form" && !supportsFormMode) {
              throw new McpError(ErrorCode.InvalidParams, "Client does not support form-mode elicitation requests");
            }
            if (params.mode === "url" && !supportsUrlMode) {
              throw new McpError(ErrorCode.InvalidParams, "Client does not support URL-mode elicitation requests");
            }
            const result = await Promise.resolve(handler(request, extra));
            if (params.task) {
              const taskValidationResult = safeParse3(CreateTaskResultSchema, result);
              if (!taskValidationResult.success) {
                const errorMessage = taskValidationResult.error instanceof Error ? taskValidationResult.error.message : String(taskValidationResult.error);
                throw new McpError(ErrorCode.InvalidParams, `Invalid task creation result: ${errorMessage}`);
              }
              return taskValidationResult.data;
            }
            const validationResult = safeParse3(ElicitResultSchema, result);
            if (!validationResult.success) {
              const errorMessage = validationResult.error instanceof Error ? validationResult.error.message : String(validationResult.error);
              throw new McpError(ErrorCode.InvalidParams, `Invalid elicitation result: ${errorMessage}`);
            }
            const validatedResult = validationResult.data;
            const requestedSchema = params.mode === "form" ? params.requestedSchema : void 0;
            if (params.mode === "form" && validatedResult.action === "accept" && validatedResult.content && requestedSchema) {
              if (this._capabilities.elicitation?.form?.applyDefaults) {
                try {
                  applyElicitationDefaults(requestedSchema, validatedResult.content);
                } catch {
                }
              }
            }
            return validatedResult;
          };
          return super.setRequestHandler(requestSchema, wrappedHandler);
        }
        if (method === "sampling/createMessage") {
          const wrappedHandler = async (request, extra) => {
            const validatedRequest = safeParse3(CreateMessageRequestSchema, request);
            if (!validatedRequest.success) {
              const errorMessage = validatedRequest.error instanceof Error ? validatedRequest.error.message : String(validatedRequest.error);
              throw new McpError(ErrorCode.InvalidParams, `Invalid sampling request: ${errorMessage}`);
            }
            const { params } = validatedRequest.data;
            const result = await Promise.resolve(handler(request, extra));
            if (params.task) {
              const taskValidationResult = safeParse3(CreateTaskResultSchema, result);
              if (!taskValidationResult.success) {
                const errorMessage = taskValidationResult.error instanceof Error ? taskValidationResult.error.message : String(taskValidationResult.error);
                throw new McpError(ErrorCode.InvalidParams, `Invalid task creation result: ${errorMessage}`);
              }
              return taskValidationResult.data;
            }
            const hasTools = params.tools || params.toolChoice;
            const resultSchema = hasTools ? CreateMessageResultWithToolsSchema : CreateMessageResultSchema;
            const validationResult = safeParse3(resultSchema, result);
            if (!validationResult.success) {
              const errorMessage = validationResult.error instanceof Error ? validationResult.error.message : String(validationResult.error);
              throw new McpError(ErrorCode.InvalidParams, `Invalid sampling result: ${errorMessage}`);
            }
            return validationResult.data;
          };
          return super.setRequestHandler(requestSchema, wrappedHandler);
        }
        return super.setRequestHandler(requestSchema, handler);
      }
      assertCapability(capability, method) {
        if (!this._serverCapabilities?.[capability]) {
          throw new Error(`Server does not support ${capability} (required for ${method})`);
        }
      }
      async connect(transport, options) {
        await super.connect(transport);
        if (transport.sessionId !== void 0) {
          return;
        }
        try {
          const result = await this.request({
            method: "initialize",
            params: {
              protocolVersion: LATEST_PROTOCOL_VERSION,
              capabilities: this._capabilities,
              clientInfo: this._clientInfo
            }
          }, InitializeResultSchema, options);
          if (result === void 0) {
            throw new Error(`Server sent invalid initialize result: ${result}`);
          }
          if (!SUPPORTED_PROTOCOL_VERSIONS.includes(result.protocolVersion)) {
            throw new Error(`Server's protocol version is not supported: ${result.protocolVersion}`);
          }
          this._serverCapabilities = result.capabilities;
          this._serverVersion = result.serverInfo;
          if (transport.setProtocolVersion) {
            transport.setProtocolVersion(result.protocolVersion);
          }
          this._instructions = result.instructions;
          await this.notification({
            method: "notifications/initialized"
          });
          if (this._pendingListChangedConfig) {
            this._setupListChangedHandlers(this._pendingListChangedConfig);
            this._pendingListChangedConfig = void 0;
          }
        } catch (error2) {
          void this.close();
          throw error2;
        }
      }
      /**
       * After initialization has completed, this will be populated with the server's reported capabilities.
       */
      getServerCapabilities() {
        return this._serverCapabilities;
      }
      /**
       * After initialization has completed, this will be populated with information about the server's name and version.
       */
      getServerVersion() {
        return this._serverVersion;
      }
      /**
       * After initialization has completed, this may be populated with information about the server's instructions.
       */
      getInstructions() {
        return this._instructions;
      }
      assertCapabilityForMethod(method) {
        switch (method) {
          case "logging/setLevel":
            if (!this._serverCapabilities?.logging) {
              throw new Error(`Server does not support logging (required for ${method})`);
            }
            break;
          case "prompts/get":
          case "prompts/list":
            if (!this._serverCapabilities?.prompts) {
              throw new Error(`Server does not support prompts (required for ${method})`);
            }
            break;
          case "resources/list":
          case "resources/templates/list":
          case "resources/read":
          case "resources/subscribe":
          case "resources/unsubscribe":
            if (!this._serverCapabilities?.resources) {
              throw new Error(`Server does not support resources (required for ${method})`);
            }
            if (method === "resources/subscribe" && !this._serverCapabilities.resources.subscribe) {
              throw new Error(`Server does not support resource subscriptions (required for ${method})`);
            }
            break;
          case "tools/call":
          case "tools/list":
            if (!this._serverCapabilities?.tools) {
              throw new Error(`Server does not support tools (required for ${method})`);
            }
            break;
          case "completion/complete":
            if (!this._serverCapabilities?.completions) {
              throw new Error(`Server does not support completions (required for ${method})`);
            }
            break;
          case "initialize":
            break;
          case "ping":
            break;
        }
      }
      assertNotificationCapability(method) {
        switch (method) {
          case "notifications/roots/list_changed":
            if (!this._capabilities.roots?.listChanged) {
              throw new Error(`Client does not support roots list changed notifications (required for ${method})`);
            }
            break;
          case "notifications/initialized":
            break;
          case "notifications/cancelled":
            break;
          case "notifications/progress":
            break;
        }
      }
      assertRequestHandlerCapability(method) {
        if (!this._capabilities) {
          return;
        }
        switch (method) {
          case "sampling/createMessage":
            if (!this._capabilities.sampling) {
              throw new Error(`Client does not support sampling capability (required for ${method})`);
            }
            break;
          case "elicitation/create":
            if (!this._capabilities.elicitation) {
              throw new Error(`Client does not support elicitation capability (required for ${method})`);
            }
            break;
          case "roots/list":
            if (!this._capabilities.roots) {
              throw new Error(`Client does not support roots capability (required for ${method})`);
            }
            break;
          case "tasks/get":
          case "tasks/list":
          case "tasks/result":
          case "tasks/cancel":
            if (!this._capabilities.tasks) {
              throw new Error(`Client does not support tasks capability (required for ${method})`);
            }
            break;
          case "ping":
            break;
        }
      }
      assertTaskCapability(method) {
        assertToolsCallTaskCapability(this._serverCapabilities?.tasks?.requests, method, "Server");
      }
      assertTaskHandlerCapability(method) {
        if (!this._capabilities) {
          return;
        }
        assertClientRequestTaskCapability(this._capabilities.tasks?.requests, method, "Client");
      }
      async ping(options) {
        return this.request({ method: "ping" }, EmptyResultSchema, options);
      }
      async complete(params, options) {
        return this.request({ method: "completion/complete", params }, CompleteResultSchema, options);
      }
      async setLoggingLevel(level, options) {
        return this.request({ method: "logging/setLevel", params: { level } }, EmptyResultSchema, options);
      }
      async getPrompt(params, options) {
        return this.request({ method: "prompts/get", params }, GetPromptResultSchema, options);
      }
      async listPrompts(params, options) {
        return this.request({ method: "prompts/list", params }, ListPromptsResultSchema, options);
      }
      async listResources(params, options) {
        return this.request({ method: "resources/list", params }, ListResourcesResultSchema, options);
      }
      async listResourceTemplates(params, options) {
        return this.request({ method: "resources/templates/list", params }, ListResourceTemplatesResultSchema, options);
      }
      async readResource(params, options) {
        return this.request({ method: "resources/read", params }, ReadResourceResultSchema, options);
      }
      async subscribeResource(params, options) {
        return this.request({ method: "resources/subscribe", params }, EmptyResultSchema, options);
      }
      async unsubscribeResource(params, options) {
        return this.request({ method: "resources/unsubscribe", params }, EmptyResultSchema, options);
      }
      /**
       * Calls a tool and waits for the result. Automatically validates structured output if the tool has an outputSchema.
       *
       * For task-based execution with streaming behavior, use client.experimental.tasks.callToolStream() instead.
       */
      async callTool(params, resultSchema = CallToolResultSchema, options) {
        if (this.isToolTaskRequired(params.name)) {
          throw new McpError(ErrorCode.InvalidRequest, `Tool "${params.name}" requires task-based execution. Use client.experimental.tasks.callToolStream() instead.`);
        }
        const result = await this.request({ method: "tools/call", params }, resultSchema, options);
        const validator = this.getToolOutputValidator(params.name);
        if (validator) {
          if (!result.structuredContent && !result.isError) {
            throw new McpError(ErrorCode.InvalidRequest, `Tool ${params.name} has an output schema but did not return structured content`);
          }
          if (result.structuredContent) {
            try {
              const validationResult = validator(result.structuredContent);
              if (!validationResult.valid) {
                throw new McpError(ErrorCode.InvalidParams, `Structured content does not match the tool's output schema: ${validationResult.errorMessage}`);
              }
            } catch (error2) {
              if (error2 instanceof McpError) {
                throw error2;
              }
              throw new McpError(ErrorCode.InvalidParams, `Failed to validate structured content: ${error2 instanceof Error ? error2.message : String(error2)}`);
            }
          }
        }
        return result;
      }
      isToolTask(toolName) {
        if (!this._serverCapabilities?.tasks?.requests?.tools?.call) {
          return false;
        }
        return this._cachedKnownTaskTools.has(toolName);
      }
      /**
       * Check if a tool requires task-based execution.
       * Unlike isToolTask which includes 'optional' tools, this only checks for 'required'.
       */
      isToolTaskRequired(toolName) {
        return this._cachedRequiredTaskTools.has(toolName);
      }
      /**
       * Cache validators for tool output schemas.
       * Called after listTools() to pre-compile validators for better performance.
       */
      cacheToolMetadata(tools) {
        this._cachedToolOutputValidators.clear();
        this._cachedKnownTaskTools.clear();
        this._cachedRequiredTaskTools.clear();
        for (const tool of tools) {
          if (tool.outputSchema) {
            const toolValidator = this._jsonSchemaValidator.getValidator(tool.outputSchema);
            this._cachedToolOutputValidators.set(tool.name, toolValidator);
          }
          const taskSupport = tool.execution?.taskSupport;
          if (taskSupport === "required" || taskSupport === "optional") {
            this._cachedKnownTaskTools.add(tool.name);
          }
          if (taskSupport === "required") {
            this._cachedRequiredTaskTools.add(tool.name);
          }
        }
      }
      /**
       * Get cached validator for a tool
       */
      getToolOutputValidator(toolName) {
        return this._cachedToolOutputValidators.get(toolName);
      }
      async listTools(params, options) {
        const result = await this.request({ method: "tools/list", params }, ListToolsResultSchema, options);
        this.cacheToolMetadata(result.tools);
        return result;
      }
      /**
       * Set up a single list changed handler.
       * @internal
       */
      _setupListChangedHandler(listType, notificationSchema, options, fetcher) {
        const parseResult = ListChangedOptionsBaseSchema.safeParse(options);
        if (!parseResult.success) {
          throw new Error(`Invalid ${listType} listChanged options: ${parseResult.error.message}`);
        }
        if (typeof options.onChanged !== "function") {
          throw new Error(`Invalid ${listType} listChanged options: onChanged must be a function`);
        }
        const { autoRefresh, debounceMs } = parseResult.data;
        const { onChanged } = options;
        const refresh = async () => {
          if (!autoRefresh) {
            onChanged(null, null);
            return;
          }
          try {
            const items = await fetcher();
            onChanged(null, items);
          } catch (e) {
            const error2 = e instanceof Error ? e : new Error(String(e));
            onChanged(error2, null);
          }
        };
        const handler = () => {
          if (debounceMs) {
            const existingTimer = this._listChangedDebounceTimers.get(listType);
            if (existingTimer) {
              clearTimeout(existingTimer);
            }
            const timer = setTimeout(refresh, debounceMs);
            this._listChangedDebounceTimers.set(listType, timer);
          } else {
            refresh();
          }
        };
        this.setNotificationHandler(notificationSchema, handler);
      }
      async sendRootsListChanged() {
        return this.notification({ method: "notifications/roots/list_changed" });
      }
    };
  }
});

// dist/inspect.js
var inspect_exports = {};
__export(inspect_exports, {
  FACTS_EXPRESSION: () => FACTS_EXPRESSION,
  baseDirectoryEnv: () => baseDirectoryEnv,
  clearFacts: () => clearFacts,
  installationEnv: () => installationEnv,
  isFactsLine: () => isFactsLine,
  parseFacts: () => parseFacts,
  readFacts: () => readFacts,
  recordFacts: () => recordFacts
});
import { createHash as createHash4 } from "node:crypto";
import { mkdirSync as mkdirSync3, readFileSync as readFileSync3, renameSync as renameSync2, rmSync as rmSync2, statSync as statSync2, unlinkSync as unlinkSync2, writeFileSync as writeFileSync2 } from "node:fs";
import { dirname as dirname4, join as join4 } from "node:path";
function factsFile(bin) {
  const digest = createHash4("sha256").update(bin).digest("hex").slice(0, 16);
  return join4(cacheDir(), "installations", `${digest}.json`);
}
function binaryIdentity(bin) {
  try {
    const stat = statSync2(bin);
    return { mtimeMs: Math.round(stat.mtimeMs), size: stat.size };
  } catch {
    return null;
  }
}
function normaliseVersion(version2) {
  if (typeof version2 !== "string")
    return null;
  const repaired = version2.replace(/\.\./g, ".0.");
  return /^\d+(\.\d+)*$/.test(repaired) ? repaired : null;
}
function readFacts(bin) {
  const identity = binaryIdentity(bin);
  if (!identity)
    return null;
  try {
    const entry = JSON.parse(readFileSync3(factsFile(bin), "utf8"));
    if (entry.format !== CACHE_FORMAT2)
      return null;
    if (entry.binary !== bin)
      return null;
    if (entry.binaryMtimeMs !== identity.mtimeMs)
      return null;
    if (entry.binarySize !== identity.size)
      return null;
    const version2 = normaliseVersion(entry.version);
    if (version2 === null)
      return null;
    return { ...entry, version: version2 };
  } catch {
    return null;
  }
}
function writeFacts(bin, facts) {
  const identity = binaryIdentity(bin);
  if (!identity)
    return;
  const file = factsFile(bin);
  const temp = `${file}.${process.pid}.tmp`;
  try {
    mkdirSync3(dirname4(file), { recursive: true });
    const entry = {
      ...facts,
      format: CACHE_FORMAT2,
      binary: bin,
      binaryMtimeMs: identity.mtimeMs,
      binarySize: identity.size,
      probedAt: Date.now()
    };
    writeFileSync2(temp, `${JSON.stringify(entry, null, 2)}
`);
    renameSync2(temp, file);
  } catch {
    try {
      unlinkSync2(temp);
    } catch {
    }
  }
}
function isFactsLine(line) {
  return line.includes(OPEN);
}
function parseFacts(stdout) {
  const start = stdout.indexOf(OPEN);
  const end = stdout.indexOf(CLOSE, start + OPEN.length);
  if (start === -1 || end === -1)
    return null;
  try {
    const raw = JSON.parse(stdout.slice(start + OPEN.length, end));
    const limit = raw["maxLicenseProcesses"];
    const parsed = typeof limit === "string" ? Number.parseInt(limit, 10) : Number.NaN;
    const text = (value) => typeof value === "string" ? value : "";
    return {
      version: text(raw["version"]),
      systemID: text(raw["systemID"]),
      base: text(raw["base"]),
      userBase: text(raw["userBase"]),
      localBase: text(raw["localBase"]),
      maxLicenseProcesses: limit === "unlimited" ? "unlimited" : Number.isFinite(parsed) && parsed > 0 ? parsed : "unknown",
      licenseType: typeof raw["licenseType"] === "string" ? raw["licenseType"] : null,
      networkLicense: raw["networkLicense"] === true,
      agentTools: typeof raw["agentTools"] === "string" ? raw["agentTools"] : null,
      // An unsigned-in kernel answers with the symbol None, which arrives here
      // as the string "None" rather than as an absent field.
      wolframID: typeof raw["wolframID"] === "string" && raw["wolframID"] !== "" && raw["wolframID"] !== "None" ? raw["wolframID"] : null,
      cloudConnected: raw["cloudConnected"] === true
    };
  } catch {
    return null;
  }
}
function recordFacts(bin, facts, chosen, log) {
  if (chosen.length > 0) {
    log(`reported facts for its own configuration (${chosen.join(", ")}); not the installation's`);
    return;
  }
  log(`reported ${facts.version}, licence ${facts.maxLicenseProcesses}${facts.licenseType ? ` (${facts.licenseType})` : ""}, AgentTools ${facts.agentTools ?? "absent"}, account ${facts.wolframID ?? "not signed in"}`);
  writeFacts(bin, facts);
}
function installationEnv(bin, allowInspect) {
  if (!allowInspect)
    return {};
  return baseDirectoryEnv(readFacts(bin));
}
function clearFacts() {
  const dir = join4(cacheDir(), "installations");
  try {
    rmSync2(dir, { recursive: true, force: true });
  } catch {
  }
  return dir;
}
function baseDirectoryEnv(facts) {
  if (!facts)
    return {};
  const env = {};
  if (facts.base)
    env["WOLFRAM_BASE"] = facts.base;
  if (facts.userBase)
    env["WOLFRAM_USERBASE"] = facts.userBase;
  if (facts.localBase)
    env["WOLFRAM_LOCALBASE"] = facts.localBase;
  return env;
}
var CACHE_FORMAT2, OPEN, CLOSE, FACTS_EXPRESSION;
var init_inspect = __esm({
  "dist/inspect.js"() {
    "use strict";
    init_cache();
    CACHE_FORMAT2 = 2;
    OPEN = "<<WMCPFACTS>>";
    CLOSE = "<<END>>";
    FACTS_EXPRESSION = `WriteString["stdout","${OPEN}",ExportString[<|
  "version"->TextString[$VersionNumber]<>"."<>ToString[$ReleaseNumber],
  "systemID"->$SystemID,
  "base"->$BaseDirectory,
  "userBase"->$UserBaseDirectory,
  "localBase"->ExpandFileName[LocalObject[$LocalBase]],
  "maxLicenseProcesses"->If[$MaxLicenseProcesses===Infinity,"unlimited",ToString[$MaxLicenseProcesses]],
  "licenseType"->$LicenseType,
  "networkLicense"->TrueQ[$NetworkLicense],
  "agentTools"->Replace[PacletObject["Wolfram/AgentTools"]["Version"],Except[_String]->None],
  "wolframID"->ToString[$WolframID],
  "cloudConnected"->TrueQ[$CloudConnected]
|>,"JSON","Compact"->True],"${CLOSE}\\n"]`;
  }
});

// dist/transport.js
import { spawn as spawn2 } from "node:child_process";
var MAX_UNTERMINATED_BYTES2, RECENT_LINE_LIMIT, KILL_ESCALATION_MS, REAP_TIMEOUT_MS, FilteringStdioTransport;
var init_transport = __esm({
  "dist/transport.js"() {
    "use strict";
    MAX_UNTERMINATED_BYTES2 = 4 * 1024 * 1024;
    RECENT_LINE_LIMIT = 15;
    KILL_ESCALATION_MS = 5e3;
    REAP_TIMEOUT_MS = 8e3;
    FilteringStdioTransport = class {
      onmessage;
      onerror;
      onclose;
      #options;
      #child = null;
      /**
       * Settles once Node has said whether the spawn happened. A close() that
       * lands before then used to return at `!this.#spawned` and drop the handle,
       * so a kernel forked a moment earlier was never signalled and ran on with
       * its licence seat — reached by stopping a server the instant its kernel
       * appeared.
       */
      #spawnGate = null;
      #buffer = "";
      #closing = false;
      #spawned = false;
      #fatalReported = false;
      #recent = [];
      constructor(options) {
        this.#options = options;
      }
      get pid() {
        return this.#child?.pid;
      }
      /** The last non-protocol lines the kernel produced, oldest first. */
      recentOutput() {
        return [...this.#recent];
      }
      async start() {
        if (this.#child)
          throw new Error("FilteringStdioTransport is already started");
        const child = spawn2(this.#options.command, this.#options.args ?? [], {
          stdio: ["pipe", "pipe", "pipe"],
          env: this.#options.env,
          cwd: this.#options.cwd,
          shell: false,
          windowsHide: true,
          // A new process group on POSIX — we keep the handle and never unref, so
          // the kernel's lifetime still tracks ours — so close() can signal the
          // whole group. The kernel spawns children of its own: the notebook
          // front-end MathLink launches for WriteNotebook. Killing only the kernel
          // pid orphaned that front-end to init, where its SharedMemory link
          // busy-polls a now-dead peer at 100% CPU forever. Windows has no
          // equivalent here and keeps the single-process kill.
          detached: process.platform !== "win32"
        });
        this.#child = child;
        this.#spawnGate = new Promise((resolve, reject) => {
          const settle = (fn) => {
            child.removeListener("spawn", onSpawn);
            child.removeListener("error", onError);
            fn();
          };
          const onSpawn = () => settle(resolve);
          const onError = (err) => settle(() => {
            this.#child = null;
            reject(new Error(`could not start ${this.#options.command}: ${err.message}`));
          });
          child.once("spawn", onSpawn);
          child.once("error", onError);
        });
        await this.#spawnGate;
        this.#spawned = true;
        child.on("error", (err) => this.#fail(err));
        child.on("exit", (code2, signal) => {
          this.#flush();
          if (!this.#closing) {
            this.#fail(new Error(`the Wolfram kernel exited unexpectedly (code=${code2} signal=${signal})`));
          }
          this.onclose?.();
        });
        child.stdin?.on("error", (err) => this.#record(`stdin: ${err.message}`));
        child.stdout?.setEncoding("utf8");
        child.stdout?.on("data", (chunk) => this.#ingest(chunk));
        child.stderr?.setEncoding("utf8");
        child.stderr?.on("data", (chunk) => {
          for (const line of chunk.split(/\r?\n/)) {
            const text = line.trim();
            if (text)
              this.#record(text);
          }
        });
      }
      async send(message, _options) {
        const stdin = this.#child?.stdin;
        if (!stdin?.writable)
          throw new Error("the Wolfram kernel is not running");
        await new Promise((resolve, reject) => {
          stdin.write(`${JSON.stringify(message)}
`, (err) => err ? reject(err) : resolve());
        });
      }
      /**
       * Shut the child down.
       *
       * Must never hang. A caller reaches here on the failure path, and blocking
       * forever would swallow the error that sent it here and wedge the session, so
       * both the exit wait and the kill escalation are bounded.
       */
      async close() {
        this.#closing = true;
        const child = this.#child;
        this.#child = null;
        this.#flush();
        if (!child)
          return;
        if (!this.#spawned) {
          const started = await (this.#spawnGate ?? Promise.reject(new Error("never spawned"))).then(() => true, () => false);
          if (!started)
            return;
        }
        if (child.exitCode !== null || child.signalCode !== null)
          return;
        const exited = this.#waitForExit(child, REAP_TIMEOUT_MS);
        try {
          child.stdin?.end();
        } catch {
        }
        this.#signal(child, "SIGTERM");
        const escalation = setTimeout(() => this.#signal(child, "SIGKILL"), KILL_ESCALATION_MS);
        escalation.unref?.();
        try {
          await exited;
        } finally {
          clearTimeout(escalation);
        }
      }
      /**
       * Signal the child — and on POSIX its whole process group — so the kernel's
       * own descendants die with it. The kernel is spawned as a group leader
       * (`detached`), so `-pid` addresses the group; if the group is already gone,
       * or this is a platform without one, fall back to the plain per-process kill.
       */
      #signal(child, sig) {
        const pid = child.pid;
        if (pid !== void 0 && process.platform !== "win32") {
          try {
            process.kill(-pid, sig);
            return;
          } catch {
          }
        }
        try {
          child.kill(sig);
        } catch {
        }
      }
      #waitForExit(child, timeoutMs) {
        return new Promise((resolve) => {
          let settled = false;
          const finish = () => {
            if (settled)
              return;
            settled = true;
            clearTimeout(timer);
            child.removeListener("exit", finish);
            resolve();
          };
          const timer = setTimeout(finish, timeoutMs);
          timer.unref?.();
          child.once("exit", finish);
        });
      }
      #fail(error2) {
        if (this.#fatalReported)
          return;
        this.#fatalReported = true;
        this.onerror?.(error2);
        this.#options.onFatal?.(error2);
      }
      #record(line) {
        this.#recent.push(line);
        if (this.#recent.length > RECENT_LINE_LIMIT)
          this.#recent.shift();
        this.#options.onOutput?.(line);
      }
      /**
       * Record whatever is in the buffer without a newline after it, then clear it.
       *
       * A kernel that dies mid-line loses that line otherwise, and the lines that
       * matter most are exactly the ones a dying kernel writes: `close()` used to
       * blank the buffer, and `kernel.ts` then read `recentOutput()` — after the
       * close — for the words to put in the error. So a licence refusal or an
       * activation prompt that arrived without a trailing newline was reported as
       * nothing at all.
       */
      #flush() {
        const tail = this.#buffer;
        this.#buffer = "";
        if (tail.trim())
          this.#emit(tail);
      }
      #ingest(chunk) {
        this.#buffer += chunk;
        let index;
        while ((index = this.#buffer.indexOf("\n")) !== -1) {
          const line = this.#buffer.slice(0, index);
          this.#buffer = this.#buffer.slice(index + 1);
          this.#emit(line);
        }
        if (this.#buffer.length > MAX_UNTERMINATED_BYTES2) {
          this.#record(`dropped ${this.#buffer.length} bytes of unterminated kernel output`);
          this.#buffer = "";
        }
      }
      #emit(raw) {
        const line = raw.replace(/\r$/, "").trim();
        if (!line)
          return;
        if (line[0] !== "{" && line[0] !== "[") {
          this.#record(line);
          return;
        }
        let parsed;
        try {
          parsed = JSON.parse(line);
        } catch {
          this.#record(line);
          return;
        }
        const messages = Array.isArray(parsed) ? parsed : [parsed];
        for (const message of messages) {
          try {
            this.onmessage?.(message);
          } catch (err) {
            this.onerror?.(err instanceof Error ? err : new Error(String(err)));
          }
        }
      }
    };
  }
});

// dist/kernel.js
function isRequestTimeout(err) {
  return err instanceof McpError && err.code === REQUEST_TIMEOUT;
}
function isServerNotResolved(err) {
  for (let e = err; e instanceof Error; e = e.cause) {
    if (e instanceof ServerNotResolved)
      return true;
  }
  return false;
}
function chosenShaping(flavour) {
  return SHAPING_VARS.filter((name) => Boolean((flavour ? flavour.env[name] : process.env[name])?.trim()));
}
function withKernelOutput(err, output) {
  const message = errorText(err);
  const recent = output.filter((line) => !isFactsLine(line));
  if (recent.length === 0)
    return new Error(message, { cause: err });
  const tail = recent.map((line) => `  ${line}`).join("\n");
  const hint = recent.some((line) => NOT_ACTIVATED.test(line)) ? "\n\nThis kernel is not activated. Activate it, by opening Wolfram once and signing in or with `wolframscript -activate` in a terminal, then try again." : "";
  return new Error(`${message}

Last output from the kernel:
${tail}${hint}`, { cause: err });
}
var PACLET_KERNEL_ARGS, LOAD_AGENTTOOLS, KERNEL_ARGS, DeadlineExceeded, HandshakeTimeout, CALL_REQUEST_TIMEOUT_MS, REQUEST_TIMEOUT, SERVER_NOT_FOUND, ServerNotResolved, HANDSHAKE_SDK_GRACE_MS, NOT_ACTIVATED, SHAPING_VARS, KernelSession;
var init_kernel = __esm({
  "dist/kernel.js"() {
    "use strict";
    init_client2();
    init_types();
    init_transport();
    init_flavour();
    init_inspect();
    init_log();
    PACLET_KERNEL_ARGS = [
      "-run",
      'PacletSymbol["Wolfram/AgentTools","Wolfram`AgentTools`StartMCPServer"][]',
      "-noinit",
      "-noprompt"
    ];
    LOAD_AGENTTOOLS = 'PacletSymbol["Wolfram/AgentTools","Wolfram`AgentTools`StartMCPServer"]';
    KERNEL_ARGS = [
      "-run",
      `${LOAD_AGENTTOOLS};${FACTS_EXPRESSION};${PACLET_KERNEL_ARGS[1]}`,
      ...PACLET_KERNEL_ARGS.slice(2)
    ];
    DeadlineExceeded = class extends Error {
      constructor(deadlineMs) {
        super(`no answer from the Wolfram kernel within ${budgetText(deadlineMs)}`);
        this.name = "DeadlineExceeded";
      }
    };
    HandshakeTimeout = class extends Error {
      timeoutMs;
      constructor(timeoutMs) {
        super(`The Wolfram kernel did not complete MCP initialization within ${budgetText(timeoutMs)}. Common causes: the Wolfram/AgentTools paclet is missing or is being downloaded, the selected kernel predates AgentTools support, or an unactivated Wolfram Engine is waiting for credentials on stdin, which cannot be answered here.`);
        this.name = "HandshakeTimeout";
        this.timeoutMs = timeoutMs;
      }
    };
    CALL_REQUEST_TIMEOUT_MS = 2 ** 31 - 1;
    REQUEST_TIMEOUT = ErrorCode.RequestTimeout;
    SERVER_NOT_FOUND = /StartMCPServer::InvalidArguments|MCPServerNotFound|No MCPServerObject found for name/;
    ServerNotResolved = class extends Error {
      constructor(message) {
        super(message);
        this.name = "ServerNotResolved";
      }
    };
    HANDSHAKE_SDK_GRACE_MS = 1e3;
    NOT_ACTIVATED = /No valid password found/;
    SHAPING_VARS = [
      "WOLFRAM_BASE",
      "WOLFRAM_USERBASE",
      "WOLFRAM_LOCALBASE",
      "WOLFRAM_CLOUDBASE",
      "WOLFRAMINIT"
    ];
    KernelSession = class {
      #options;
      #client = null;
      #transport = null;
      #starting = null;
      /**
       * A kernel mid-handshake, and how to end that handshake. `#transport` is set
       * only once the handshake succeeds, so `stop()` used to find nothing to close
       * while a kernel was starting — and the kernel kept its licence seat until
       * the handshake finished or timed out.
       */
      #handshaking = null;
      #queue = Promise.resolve();
      /** Verdict in flight for the last failure, if any. */
      #deciding = null;
      /** Work left running that nobody is waiting for. */
      #abandoned = null;
      #idleTimer = null;
      constructor(options) {
        this.#options = options;
      }
      get running() {
        return this.#client !== null;
      }
      async #spawn(startTimeoutMs = this.#options.startTimeoutMs) {
        const { bin, log, clientInfo, flavour } = this.#options;
        const serverName = flavour?.env["MCP_SERVER_NAME"] ?? this.#options.serverName;
        let reportFatal;
        const fatal = new Promise((_, reject) => {
          reportFatal = reject;
        });
        void fatal.catch(() => {
        });
        const transport = new FilteringStdioTransport({
          command: bin,
          args: [...KERNEL_ARGS],
          // Layered, and the order is load-bearing. The probe's values are the
          // floor; this process's environment beats them, because an explicit
          // WOLFRAM_USERBASE is a deliberate choice and not something to overwrite
          // with a probe result. The flavour then beats *that*, and removes the
          // names it leaves unset — because in a broker this process's environment
          // belongs to whichever session spawned it, and letting it show through is
          // how one project's MCP_TOOL_OPTIONS came to run another project's calls.
          env: {
            ...this.#options.extraEnv,
            ...flavour ? applyFlavour(process.env, flavour) : process.env,
            // Only when the flavour has not already said. `MCP_SERVER_NAME` is part
            // of a flavour, and in a broker the flavour belongs to the calling
            // session — which is what lets one broker serve several server names
            // under one licence budget. This option is the private path's answer,
            // where there is nobody else to ask.
            ...flavour?.env["MCP_SERVER_NAME"] ? {} : { MCP_SERVER_NAME: serverName }
          },
          onOutput: (line) => {
            if (isFactsLine(line)) {
              const facts = parseFacts(line);
              if (facts)
                this.#options.onFacts?.(facts, chosenShaping(flavour));
              else
                log("kernel reported facts that could not be read");
              return;
            }
            log(`kernel: ${line}`);
            if (SERVER_NOT_FOUND.test(line)) {
              reportFatal(new ServerNotResolved(`the Wolfram kernel could not start the MCP server MCP_SERVER_NAME="${serverName}": ` + line.trim()));
            }
          },
          onFatal: (error2) => reportFatal(error2)
        });
        const client = new Client(clientInfo, { capabilities: {} });
        this.#handshaking = { transport, abort: (error2) => reportFatal(error2) };
        client.onerror = (err) => log(`upstream error: ${errorText(err)}`);
        client.onclose = () => {
          if (this.#client === client) {
            log("upstream closed");
            this.#client = null;
            this.#transport = null;
          }
        };
        log(`starting kernel: ${bin} (serverName=${serverName})`);
        const startedAt = Date.now();
        let timer;
        const timeout = new Promise((_, reject) => {
          timer = setTimeout(() => reject(new HandshakeTimeout(startTimeoutMs)), startTimeoutMs);
          timer.unref?.();
        });
        void timeout.catch(() => {
        });
        try {
          await Promise.race([
            client.connect(transport, { timeout: startTimeoutMs + HANDSHAKE_SDK_GRACE_MS }),
            fatal,
            timeout
          ]);
        } catch (err) {
          await transport.close().catch(() => {
          });
          throw withKernelOutput(err, transport.recentOutput());
        } finally {
          clearTimeout(timer);
          this.#handshaking = null;
        }
        log(`kernel ready in ${((Date.now() - startedAt) / 1e3).toFixed(1)}s`);
        this.#client = client;
        this.#transport = transport;
        const refresh = (why) => {
          if (!this.#options.onReady)
            return;
          log(`upstream says its ${why} changed; re-reading`);
          void this.#options.onReady(client).catch((err) => {
            log(`refresh after an upstream change failed, continuing: ${errorText(err)}`);
          });
        };
        client.setNotificationHandler(ToolListChangedNotificationSchema, () => refresh("tool list"));
        client.setNotificationHandler(PromptListChangedNotificationSchema, () => refresh("prompt list"));
        if (this.#options.onReady) {
          try {
            await this.#options.onReady(client);
          } catch (err) {
            log(`post-start refresh failed, continuing: ${errorText(err)}`);
          }
        }
        return client;
      }
      /**
       * Start the kernel if it is not already up, collapsing concurrent starts.
       *
       * `startTimeoutMs` bounds this start's handshake in place of the configured
       * one: a preparation passes what its deadline has left, so a slow inspection
       * before the handshake shortens the handshake rather than adding to it.
       */
      async ensure(startTimeoutMs) {
        if (this.#client)
          return this.#client;
        this.#starting ??= this.#spawn(startTimeoutMs).finally(() => {
          this.#starting = null;
        });
        return this.#starting;
      }
      /**
       * Run `fn` with the kernel guaranteed up, serialized against other work.
       *
       * `deadlineMs` is how long the *caller* will wait, and deliberately not a
       * timeout on the request: see `#fate`.
       */
      async run(fn, options = {}) {
        const task = this.#queue.then(async () => {
          this.#clearIdle();
          await this.#reclaim();
          const client = await this.ensure();
          const work = fn(client);
          try {
            return await this.#awaitWithin(work, options.deadlineMs);
          } catch (err) {
            this.#deciding = this.#fate(work, err, options);
            throw err;
          } finally {
            this.#scheduleIdle();
          }
        });
        this.#queue = task.then(() => void 0, () => this.#deciding ?? void 0);
        return task;
      }
      /**
       * Wait for `work`, but not past the caller's deadline.
       *
       * The deadline is not passed to the SDK as a request timeout on purpose. The
       * SDK's timeout cancels the request and forgets it, so the kernel's eventual
       * reply is dropped as an unknown id — and that reply is the only evidence
       * this server can ever get that the kernel is alive. Keeping the request
       * outstanding is what makes `#fate` able to tell "still working" from "hung".
       */
      async #awaitWithin(work, deadlineMs) {
        if (deadlineMs === void 0 || deadlineMs <= 0)
          return work;
        let timer;
        const expiry = new Promise((_, reject) => {
          timer = setTimeout(() => reject(new DeadlineExceeded(deadlineMs)), deadlineMs);
          timer.unref?.();
        });
        void expiry.catch(() => {
        });
        try {
          return await Promise.race([work, expiry]);
        } finally {
          clearTimeout(timer);
        }
      }
      /**
       * What a failure means for the kernel, and what to do about it.
       *
       * The old answer was a `ping` health check, on the theory that a failure
       * leaves the kernel's state unknown. Measured against a real kernel, that
       * theory does not hold: AgentTools' loop is `While[True, processRequest[]]`
       * with `tools/call` dispatching `evaluateTool` inline, so a ping sent 500ms
       * into a 20s evaluation was not answered until 22.8s. A busy kernel and a
       * hung one are equally deaf, and killing on a deaf probe destroyed the
       * legitimate long call along with every evaluator `session` on that kernel.
       *
       * But the failure *shapes* are individually decidable without asking anything:
       *
       *  - **The caller cancelled.** Stopping the kernel is the only thing that
       *    honours it. `notifications/cancelled` cannot: the serial loop will not
       *    read it until the evaluation it would cancel has already finished.
       *  - **The transport is gone.** Nothing to decide; it is already dead.
       *  - **We stopped waiting** (our deadline, or the SDK's own on an op that
       *    carries no deadline). The kernel may be working or hung, and there is no
       *    way to tell — so it is left alone, and the reply it may yet send is
       *    taken as proof of life. Nobody is waiting for that reply, so the value
       *    is discarded; only the fact of it matters.
       *  - **Anything else.** The kernel answered, which means it is alive and now
       *    idle: an unknown tool name, a malformed argument, a failed evaluation.
       *    Keep it. This is the case that used to cost a kernel and its sessions
       *    because a model guessed a tool name wrong.
       */
      async #fate(work, err, options) {
        const { log } = this.#options;
        try {
          if (options.signal?.aborted) {
            log("the caller cancelled; stopping the kernel, which is the only way to honour it");
            await this.stop().catch(() => {
            });
            return false;
          }
          if (!this.running)
            return false;
          if (err instanceof DeadlineExceeded || isRequestTimeout(err)) {
            this.#abandon(work, errorText(err));
            return true;
          }
          log(`the kernel answered (${errorText(err)}), so it is alive and idle; keeping it`);
          return true;
        } finally {
          this.#deciding = null;
        }
      }
      /**
       * Leave work running that nobody is waiting for.
       *
       * Kept rather than killed because the kernel is very likely still computing,
       * and the definitions, line numbers and history behind the evaluator's
       * `session` argument live in it. If the reply arrives the kernel is proven
       * alive and idle and carries on serving; if a later caller needs the kernel
       * first, `#reclaim` takes it back then — on demand, so no timer has to guess
       * how long a legitimate evaluation may run.
       *
       * The seat cannot be leaked this way: the broker exits 60s after its last
       * proxy detaches whatever its kernels are doing, and a private kernel dies
       * with the process it belongs to.
       */
      #abandon(work, reason) {
        const { log } = this.#options;
        const abandoned = { settled: false };
        this.#abandoned = abandoned;
        log(`stopped waiting for the kernel (${reason}); leaving it to finish, sessions intact`);
        abandoned.done = work.then(() => {
          abandoned.settled = true;
          if (this.#abandoned === abandoned)
            log("the abandoned call finished; the kernel is idle again");
        }, (err) => {
          abandoned.settled = true;
          if (this.#abandoned === abandoned) {
            log(`the abandoned call ended in ${errorText(err)}; the kernel is idle again`);
          }
        });
      }
      /** Take the kernel back from abandoned work, because something needs it now. */
      async #reclaim() {
        const abandoned = this.#abandoned;
        if (!abandoned)
          return;
        this.#abandoned = null;
        if (abandoned.settled)
          return;
        this.#options.log("a new request needs the kernel and the abandoned call has not finished; stopping it");
        await this.stop().catch(() => {
        });
      }
      /**
       * False once this kernel should not be handed out again.
       *
       * The pool calls this instead of retiring on sight. `true` means the kernel is
       * usable — including the abandoned case, where it is usable only after
       * `#reclaim`, which the next turn does for itself.
       */
      async usable() {
        return await this.#deciding ?? this.running;
      }
      /** True while a call nobody is waiting for is still outstanding. */
      get abandoned() {
        return this.#abandoned !== null && !this.#abandoned.settled;
      }
      #clearIdle() {
        if (this.#idleTimer) {
          clearTimeout(this.#idleTimer);
          this.#idleTimer = null;
        }
      }
      #scheduleIdle() {
        this.#clearIdle();
        const { idleMs, log } = this.#options;
        if (idleMs <= 0)
          return;
        this.#idleTimer = setTimeout(() => {
          log(`idle for ${budgetText(idleMs)}, shutting the kernel down`);
          void this.stop();
        }, idleMs);
        this.#idleTimer.unref?.();
      }
      async stop() {
        this.#clearIdle();
        const handshaking = this.#handshaking;
        this.#handshaking = null;
        if (handshaking) {
          handshaking.abort(new Error("the kernel was stopped during its handshake"));
          await handshaking.transport.close().catch(() => {
          });
        }
        const client = this.#client;
        const transport = this.#transport;
        this.#client = null;
        this.#transport = null;
        try {
          await client?.close();
        } catch {
        }
        try {
          await transport?.close();
        } catch {
        }
      }
    };
  }
});

// dist/wolframscript.js
import { existsSync, readFileSync as readFileSync4, statSync as statSync3 } from "node:fs";
import { join as join5 } from "node:path";
import os2 from "node:os";
function configurationFiles() {
  const candidates = [];
  const override = process.env["WOLFRAMSCRIPT_CONFIGURATIONPATH"]?.trim();
  if (override) {
    candidates.push(override);
    candidates.push(join5(override, CONF_NAME));
  }
  const home = os2.homedir();
  if (process.platform === "darwin") {
    candidates.push(join5(home, "Library", "Application Support", "Wolfram", "WolframScript", CONF_NAME));
  } else if (process.platform === "win32") {
    const appData = process.env["APPDATA"] ?? join5(home, "AppData", "Roaming");
    candidates.push(join5(appData, "Wolfram", "WolframScript", CONF_NAME));
  }
  const xdg = process.env["XDG_CONFIG_HOME"] ?? join5(home, ".config");
  candidates.push(join5(xdg, "Wolfram", "WolframScript", CONF_NAME));
  return candidates;
}
function parse3(text) {
  const values = /* @__PURE__ */ new Map();
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("//") || line.startsWith("#"))
      continue;
    const at = line.indexOf("=");
    if (at <= 0)
      continue;
    const key = line.slice(0, at).trim();
    const value = line.slice(at + 1).trim();
    if (key && value)
      values.set(key, value);
  }
  return values;
}
function readConfiguration() {
  for (const file of configurationFiles()) {
    try {
      if (!existsSync(file) || !statSync3(file).isFile())
        continue;
      return { file, values: parse3(readFileSync4(file, "utf8")) };
    } catch {
    }
  }
  return null;
}
function preferredKernel() {
  const fromEnv = process.env["WOLFRAMSCRIPT_KERNELPATH"]?.trim();
  if (fromEnv)
    return { path: fromEnv, source: "WOLFRAMSCRIPT_KERNELPATH" };
  const config2 = readConfiguration();
  const fromFile = config2?.values.get("WOLFRAMSCRIPT_KERNELPATH");
  if (config2 && fromFile)
    return { path: fromFile, source: config2.file };
  return null;
}
var CONF_NAME;
var init_wolframscript = __esm({
  "dist/wolframscript.js"() {
    "use strict";
    CONF_NAME = "WolframScript.conf";
  }
});

// dist/locate.js
var locate_exports = {};
__export(locate_exports, {
  compareVersions: () => compareVersions,
  exampleKernelPath: () => exampleKernelPath,
  listKernels: () => listKernels,
  locateKernel: () => locateKernel,
  resolveKernelBinary: () => resolveKernelBinary,
  versionMatches: () => versionMatches,
  writeDiscoveryHint: () => writeDiscoveryHint
});
import { accessSync, constants, existsSync as existsSync2, mkdirSync as mkdirSync4, readFileSync as readFileSync5, readdirSync as readdirSync2, realpathSync, renameSync as renameSync3, statSync as statSync4, writeFileSync as writeFileSync3 } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname as dirname5, join as join6 } from "node:path";
import os3 from "node:os";
function compareVersions(a, b) {
  const left = String(a ?? "0").split(".");
  const right = String(b ?? "0").split(".");
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const delta = (Number.parseInt(left[i] ?? "", 10) || 0) - (Number.parseInt(right[i] ?? "", 10) || 0);
    if (delta !== 0)
      return delta;
  }
  return 0;
}
function canonicalKernelName(bin) {
  const alias = /(^|[\\/])(WolframKernel|MathKernel)(\.exe)?$/.exec(bin);
  if (!alias)
    return bin;
  const preferred = bin.replace(/(WolframKernel|MathKernel)(\.exe)?$/, (_m, _n, exe) => `wolfram${exe ?? ""}`);
  return isExecutableFile(preferred) ? preferred : bin;
}
function realKernelPath(bin) {
  try {
    return realpathSync(bin);
  } catch {
    return bin;
  }
}
function isExecutableFile(path) {
  try {
    if (!statSync4(path).isFile())
      return false;
  } catch {
    return false;
  }
  if (process.platform === "win32")
    return true;
  try {
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}
function resolveKernelBinary(path) {
  const target = path.trim();
  if (!target || !existsSync2(target))
    return null;
  let isDirectory;
  try {
    isDirectory = statSync4(target).isDirectory();
  } catch {
    return null;
  }
  if (!isDirectory) {
    return isExecutableFile(target) ? canonicalKernelName(realKernelPath(target)) : null;
  }
  for (const probe of KERNEL_PROBES) {
    const candidate = join6(target, ...probe);
    if (isExecutableFile(candidate))
      return canonicalKernelName(realKernelPath(candidate));
  }
  return null;
}
function plistVersion(appPath) {
  const plist = join6(appPath, "Contents", "Info.plist");
  if (!existsSync2(plist))
    return null;
  try {
    let xml = readFileSync5(plist, "utf8");
    if (!xml.trimStart().startsWith("<?xml")) {
      xml = execFileSync("plutil", ["-convert", "xml1", "-o", "-", plist], {
        encoding: "utf8",
        timeout: 5e3
      });
    }
    const match = xml.match(/<key>CFBundleShortVersionString<\/key>\s*<string>([^<]+)<\/string>/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}
function versionFromString(text) {
  return text.match(/(\d+(?:\.\d+)+)/)?.[1] ?? null;
}
function safeReaddir(dir) {
  try {
    return readdirSync2(dir);
  } catch {
    return [];
  }
}
function scanDarwinBundles(namedOnly) {
  const found = [];
  for (const root of ["/Applications", join6(os3.homedir(), "Applications")]) {
    for (const entry of safeReaddir(root)) {
      if (!entry.endsWith(".app"))
        continue;
      if (namedOnly && !/^(Wolfram|Mathematica)/i.test(entry))
        continue;
      const app = join6(root, entry);
      const bin = resolveKernelBinary(app);
      if (!bin)
        continue;
      found.push({
        bin,
        // The bundle name is only a fallback. An experimental build can be
        // called anything, so the Info.plist version is what counts.
        version: plistVersion(app) ?? versionFromString(entry) ?? "0",
        source: app
      });
    }
  }
  return found;
}
function scanDarwin() {
  const named = scanDarwinBundles(true);
  return named.length > 0 ? named : scanDarwinBundles(false);
}
function scanWin32() {
  const found = [];
  try {
    const out = execFileSync("reg", ["query", "HKLM\\SOFTWARE\\Wolfram Research\\Installations", "/s"], { encoding: "utf8", timeout: 8e3, windowsHide: true });
    for (const match of out.matchAll(/ExecutablePath\s+REG_SZ\s+(.+)/g)) {
      const raw = match[1]?.trim();
      if (!raw)
        continue;
      const bin = resolveKernelBinary(raw);
      if (bin)
        found.push({ bin, version: versionFromString(bin) ?? "0", source: "registry" });
    }
  } catch {
  }
  const bases = [process.env["ProgramFiles"], process.env["ProgramFiles(x86)"]].filter((base) => Boolean(base));
  for (const base of bases) {
    for (const product of ["Wolfram", "Mathematica", "Wolfram Desktop", "Wolfram Engine"]) {
      const dir = join6(base, "Wolfram Research", product);
      for (const version2 of safeReaddir(dir)) {
        const bin = resolveKernelBinary(join6(dir, version2));
        if (bin)
          found.push({ bin, version: versionFromString(version2) ?? version2, source: dir });
      }
    }
  }
  return found;
}
function scanLinux() {
  const found = [];
  for (const root of ["/usr/local/Wolfram", "/opt/Wolfram", "/usr/local/Wolfram Research"]) {
    for (const product of ["Wolfram", "Mathematica", "WolframEngine", "Desktop"]) {
      const dir = join6(root, product);
      for (const version2 of safeReaddir(dir)) {
        const bin = resolveKernelBinary(join6(dir, version2));
        if (bin)
          found.push({ bin, version: versionFromString(version2) ?? version2, source: dir });
      }
    }
  }
  return found;
}
function platformScan() {
  switch (process.platform) {
    case "darwin":
      return scanDarwin();
    case "win32":
      return scanWin32();
    default:
      return scanLinux();
  }
}
function fromInstallDirEnv() {
  for (const [name, dir] of [
    ["WOLFRAM_INSTALLATION_DIRECTORY", process.env["WOLFRAM_INSTALLATION_DIRECTORY"]],
    ["WOLFRAM_HOME", process.env["WOLFRAM_HOME"]]
  ]) {
    if (!dir)
      continue;
    const bin = resolveKernelBinary(dir);
    return {
      asked: `${name}=${dir}`,
      install: bin ? { bin, version: versionForBinary(bin), source: dir } : null
    };
  }
  return null;
}
function fromPathLookup(minVersion, log) {
  const which = process.platform === "win32" ? "where" : "which";
  for (const name of ["wolfram", "WolframKernel"]) {
    let found;
    try {
      found = execFileSync(which, [name], { encoding: "utf8", timeout: 5e3, windowsHide: true }).split(/\r?\n/)[0]?.trim();
    } catch {
      continue;
    }
    if (!found)
      continue;
    const bin = resolveKernelBinary(found);
    if (!bin)
      continue;
    const version2 = versionForBinary(bin);
    if (compareVersions(version2, minVersion) < 0) {
      log(`${name} on PATH is ${version2 ?? "an unknown version"}, below the ${minVersion} minimum required by Wolfram/AgentTools`);
      continue;
    }
    log(`located kernel on PATH: ${bin} (${version2 ?? "unknown version"})`);
    return { bin, version: version2, source: `PATH (${name})` };
  }
  return null;
}
function fromWolframScript(minVersion, log) {
  const which = process.platform === "win32" ? "where" : "which";
  let script;
  try {
    script = execFileSync(which, ["wolframscript"], {
      encoding: "utf8",
      timeout: 5e3,
      windowsHide: true
    }).split(/\r?\n/)[0]?.trim();
  } catch {
    return null;
  }
  if (!script || !existsSync2(script))
    return null;
  try {
    const out = execFileSync(
      script,
      ["-code", 'StringRiffle[{$InstallationDirectory, $Version}, "|"]'],
      // This is the one discovery step that starts a kernel, and it runs inside
      // `initialize` where a client is waiting. With no local kernel to use,
      // wolframscript falls back to the Wolfram Cloud, so the old 90s ceiling
      // was a network round trip that most clients would kill the server over
      // long before it returned.
      { encoding: "utf8", timeout: 1e4, windowsHide: true }
    ).trim();
    const [dir = "", versionText = ""] = out.split("|");
    const bin = resolveKernelBinary(dir);
    if (!bin) {
      log(`wolframscript reported "${dir}", which holds no kernel executable`);
      return null;
    }
    const version2 = versionFromString(versionText);
    if (compareVersions(version2, minVersion) < 0) {
      log(`wolframscript points at ${version2 ?? "an unknown version"}, below the ${minVersion} minimum required by Wolfram/AgentTools`);
      return null;
    }
    log(`located kernel via wolframscript: ${dir} (${version2 ?? "unknown version"})`);
    return { bin, version: version2, source: `wolframscript (${script})`, startedKernel: true };
  } catch (err) {
    log(`wolframscript could not report its installation directory: ${String(err)}`);
  }
  return null;
}
function hintFile() {
  return join6(cacheDir(), "installations", "discovery-hint.json");
}
function binaryIdentity2(bin) {
  try {
    const stat = statSync4(bin);
    return { mtimeMs: Math.round(stat.mtimeMs), size: stat.size };
  } catch {
    return null;
  }
}
function writeDiscoveryHint(install) {
  const identity = binaryIdentity2(install.bin);
  if (!identity)
    return false;
  const file = hintFile();
  const temp = `${file}.${process.pid}.tmp`;
  const hint = { bin: install.bin, version: install.version, ...identity };
  try {
    mkdirSync4(dirname5(file), { recursive: true });
    writeFileSync3(temp, `${JSON.stringify(hint, null, 2)}
`);
    renameSync3(temp, file);
    return true;
  } catch {
    return false;
  }
}
function fromDiscoveryHint(minVersion, log) {
  let hint;
  try {
    hint = JSON.parse(readFileSync5(hintFile(), "utf8"));
  } catch {
    return null;
  }
  if (typeof hint.bin !== "string")
    return null;
  const identity = binaryIdentity2(hint.bin);
  if (!identity || identity.mtimeMs !== hint.mtimeMs || identity.size !== hint.size) {
    log(`the installation doctor recorded has changed or gone (${hint.bin}); run doctor again`);
    return null;
  }
  const version2 = typeof hint.version === "string" ? hint.version : null;
  if (compareVersions(version2, minVersion) < 0) {
    log(`the installation doctor recorded is ${version2 ?? "an unknown version"}, below the ${minVersion} minimum`);
    return null;
  }
  log(`using the installation doctor recorded: ${hint.bin}`);
  return { bin: hint.bin, version: version2, source: "discovery hint (recorded by doctor)" };
}
function versionMatches(version2, wanted) {
  if (version2 === null)
    return false;
  const want = wanted.split(".").filter(Boolean);
  const have = version2.split(".");
  if (want.length > have.length)
    return false;
  return want.every((part, i) => (Number.parseInt(part, 10) || 0) === (Number.parseInt(have[i] ?? "", 10) || 0));
}
function exampleKernelPath(platform = process.platform) {
  if (platform === "darwin")
    return "/Applications/Wolfram.app";
  if (platform === "win32")
    return "C:\\Program Files\\Wolfram Research\\Wolfram\\15.0\\wolfram.exe";
  return "/usr/local/Wolfram/Wolfram/15.0/Executables/wolfram";
}
function listKernels(minVersion = "0") {
  const seen = /* @__PURE__ */ new Set();
  return platformScan().filter((candidate) => compareVersions(candidate.version, minVersion) >= 0).filter((candidate) => {
    if (seen.has(candidate.bin))
      return false;
    seen.add(candidate.bin);
    return true;
  }).sort((a, b) => compareVersions(b.version, a.version));
}
function versionForBinary(bin) {
  const known = platformScan().find((c) => c.bin === bin);
  if (known?.version)
    return known.version;
  if (process.platform === "darwin") {
    const app = bin.replace(/\/Contents\/(MacOS|Resources)\/.*$/, "");
    if (app !== bin)
      return plistVersion(app);
  }
  return versionFromString(bin);
}
function locateKernel({ override, version: version2, minVersion = DEFAULT_MIN_VERSION, log = () => {
}, allowWolframScript = true } = {}) {
  if (override) {
    const bin = resolveKernelBinary(override);
    if (!bin) {
      log(`configured kernel path is not a usable Wolfram executable: ${override}`);
      return null;
    }
    if (bin !== override)
      log(`resolved configured path ${override} to ${bin}`);
    return { bin, version: versionForBinary(bin), source: "configured" };
  }
  if (version2) {
    const matched = listKernels("0").filter((c) => versionMatches(c.version, version2));
    if (matched[0]) {
      log(`pinned to version ${version2}: ${matched[0].bin}`);
      return matched[0];
    }
    const seen = listKernels("0").map((c) => c.version ?? "unknown").join(", ");
    log(`no installation matches WOLFRAM_MCP_VERSION=${version2}. Versions found: ${seen || "none"}`);
    return null;
  }
  const fromEnv = fromInstallDirEnv();
  if (fromEnv) {
    if (!fromEnv.install) {
      log(`${fromEnv.asked} holds no usable Wolfram executable`);
      return null;
    }
    if (compareVersions(fromEnv.install.version, minVersion) < 0) {
      log(`${fromEnv.asked} is ${fromEnv.install.version ?? "an unknown version"}, below the ${minVersion} minimum required by Wolfram/AgentTools`);
      return null;
    }
    log(`using the installation named by ${fromEnv.asked}`);
    return fromEnv.install;
  }
  const preferred = preferredKernel();
  if (preferred) {
    const bin = resolveKernelBinary(preferred.path);
    if (bin) {
      const version3 = versionForBinary(bin);
      if (compareVersions(version3, minVersion) >= 0) {
        log(`using the kernel wolframscript prefers, via ${preferred.source}`);
        return { bin, version: version3, source: `wolframscript preference (${preferred.source})` };
      }
      log(`wolframscript prefers ${version3 ?? "an unknown version"} via ${preferred.source}, below the ${minVersion} minimum; continuing to scan`);
    } else {
      log(`wolframscript prefers ${preferred.path}, which holds no kernel executable`);
    }
  }
  const scanned = listKernels(minVersion);
  if (scanned[0])
    return scanned[0];
  const onPath = fromPathLookup(minVersion, log);
  if (onPath)
    return onPath;
  const hinted = fromDiscoveryHint(minVersion, log);
  if (hinted)
    return hinted;
  if (!allowWolframScript)
    return null;
  return fromWolframScript(minVersion, log);
}
var KERNEL_PROBES;
var init_locate = __esm({
  "dist/locate.js"() {
    "use strict";
    init_config();
    init_wolframscript();
    init_cache();
    KERNEL_PROBES = [
      ["Contents", "MacOS", "wolfram"],
      ["Contents", "MacOS", "WolframKernel"],
      ["Contents", "Resources", "Wolfram Player.app", "Contents", "MacOS", "WolframKernel"],
      ["MacOS", "wolfram"],
      ["MacOS", "WolframKernel"],
      ["Executables", "wolfram"],
      ["Executables", "WolframKernel"],
      ["wolfram.exe"],
      ["WolframKernel.exe"],
      ["wolfram"],
      ["WolframKernel"]
    ];
  }
});

// dist/doctor.js
var doctor_exports = {};
__export(doctor_exports, {
  doctorCommand: () => doctorCommand,
  runDoctor: () => runDoctor,
  sessionStatus: () => sessionStatus
});
import { dirname as dirname6, join as join7 } from "node:path";
import { fileURLToPath as fileURLToPath3 } from "node:url";
function doctorCommand(env = process.env, entry = process.argv[1]) {
  if (env["CLAUDE_PLUGIN_ROOT"]?.trim())
    return "/wolfram:doctor";
  if (true) {
    return entry ? `node "${entry}" doctor` : "this file's doctor subcommand";
  }
  return `npm run doctor, in ${join7(dirname6(fileURLToPath3(import.meta.url)), "..")}`;
}
function sessionStatus(now = Date.now()) {
  const config2 = loadConfig(() => {
  });
  const install = locateKernel({
    override: config2.kernelPath,
    version: config2.version,
    minVersion: config2.minVersion,
    allowWolframScript: false
  });
  if (!install) {
    return `Wolfram plugin: no Wolfram installation was found without starting a kernel. The Wolfram tools answer only wolfram_status until one is; ${doctorCommand()} looks further and says what is missing.`;
  }
  const age = (at) => {
    const minutes = Math.round((now - at) / 6e4);
    if (minutes < 60)
      return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    return hours < 48 ? `${hours} h ago` : `${Math.round(hours / 24)} days ago`;
  };
  const lines = [
    `Wolfram plugin: kernel ${install.version ?? "of unknown version"} at ${install.bin}, server ${config2.serverName}.`
  ];
  const facts = config2.inspect ? readFacts(install.bin) : null;
  if (facts) {
    lines.push(`Cached from a kernel ${age(facts.probedAt)}, not checked this session: AgentTools ${facts.agentTools ?? "absent"}; ${facts.wolframID ? `signed in as ${facts.wolframID}` : "not signed in"}; licence ${typeof facts.maxLicenseProcesses === "number" ? `${facts.maxLicenseProcesses} seat${facts.maxLicenseProcesses === 1 ? "" : "s"}` : facts.maxLicenseProcesses === "unlimited" ? "unlimited" : "seat count unknown"}.`);
  } else {
    lines.push("No facts cached yet: they are read on the first kernel start.");
  }
  const cached2 = config2.cacheEnabled ? readCache(cacheKey(install.bin, install.version, config2.serverName, config2.flavour.digest)) : null;
  lines.push(cached2 ? `Tool list cached ${age(cached2.cachedAt)}; no kernel starts until a tool is called.` : `No tool list cached: the first tool listing starts one kernel to learn it.`);
  return lines.join("\n");
}
async function runDoctor() {
  const out = (line = "") => process.stdout.write(`${line}
`);
  const log = (message) => out(`    ${message}`);
  const config2 = loadConfig((message) => out(`  ! ${message}`));
  out();
  out(`${PKG.name} ${PKG.version}`);
  out(`node ${process.version} on ${process.platform}/${process.arch}`);
  out();
  out("Configuration");
  out(`  serverName            ${config2.serverName}   (valid: ${Object.keys(MCP_SERVERS).join(", ")})`);
  out(`  minimum version    ${config2.minVersion}`);
  out(`  idle shutdown      ${config2.idleMs > 0 ? `${config2.idleMs / 6e4} min` : "disabled"}`);
  out(`  start timeout      ${config2.startTimeoutMs / 1e3}s`);
  out(`  call timeout       ${config2.callTimeoutMs / 1e3}s`);
  out(`  tools/list cache   ${config2.cacheEnabled ? "enabled" : "disabled"}`);
  const set = CONFIG_VARS.filter((name) => process.env[name]);
  out(`  environment        ${set.length ? set.join(", ") : "(nothing set, using defaults)"}`);
  out();
  out("Installations found");
  const all = listKernels();
  if (all.length === 0) {
    out("  (none)");
  } else {
    for (const candidate of all) {
      const usable = candidate.version === null || compareVersions(candidate.version, config2.minVersion) >= 0;
      out(`  ${usable ? " " : "-"} ${candidate.version ?? "unknown"}  ${candidate.bin}`);
    }
    out(`  ("-" marks installs below the ${config2.minVersion} minimum)`);
  }
  out();
  const install = locateKernel({
    override: config2.kernelPath,
    version: config2.version,
    minVersion: config2.minVersion,
    log: (message) => out(`  ! ${message}`)
  });
  out("Selected kernel");
  if (!install) {
    out("  none");
    out();
    if (all.length === 0) {
      out("No Wolfram installation was found. The free Wolfram Engine is at");
      out("  https://www.wolfram.com/engine/");
      out(`It needs ${config2.minVersion} or newer. If one is installed somewhere unusual, point`);
    } else {
      out(`Wolfram/AgentTools requires a kernel of at least ${config2.minVersion}. To use one that`);
      out("is installed somewhere unusual, point");
    }
    out("WOLFRAM_MCP_KERNEL at the installation or kernel executable, e.g.");
    out(`  WOLFRAM_MCP_KERNEL=${exampleKernelPath()}`);
    out();
    return 1;
  }
  out(`  binary   ${install.bin}`);
  out(`  version  ${install.version ?? "unknown (not read without starting a kernel)"}`);
  out(`  via      ${install.source}`);
  if (install.startedKernel) {
    out(writeDiscoveryHint(install) ? "  recorded, so sessions find this kernel without asking wolframscript" : "  ! could not record it; sessions will not find this kernel on their own");
  }
  out();
  out("Capability cache");
  const key = cacheKey(install.bin, install.version ?? null, config2.serverName, config2.flavour.digest);
  out(`  file     ${capabilityFile(key)}`);
  const flavourVars = Object.keys(config2.flavour.env);
  out(`  flavour  ${config2.flavour.digest} (${flavourVars.length ? flavourVars.join(", ") : "defaults only"})`);
  const cached2 = readCache(key);
  if (!cached2) {
    out("  state    absent or expired");
  } else {
    out(`  state    ${cached2.tools.length} tools, ${cached2.prompts.length} prompts`);
    out(`  for      ${cached2.serverName} @ ${cached2.kernelPath}`);
    out(`  written  ${new Date(cached2.cachedAt).toISOString()}`);
  }
  out();
  out("Kernel sharing");
  if (!config2.share) {
    out("  disabled (WOLFRAM_MCP_SHARE=0); each session uses its own kernel");
  } else {
    const { brokerLaunch: brokerLaunch2 } = await Promise.resolve().then(() => (init_backend(), backend_exports));
    const { BrokerBackend: BrokerBackend2 } = await Promise.resolve().then(() => (init_broker_client(), broker_client_exports));
    const routine = /^(attached to the broker|no broker listening; starting one)/;
    const launch = brokerLaunch2(config2, install, (message) => out(routine.test(message) ? `    ${message}` : `  ! ${message}`));
    out(`  socket   ${launch.address}`);
    const broker = await BrokerBackend2.open(launch);
    if (!broker) {
      out("  could not attach to a broker; sessions will use private kernels");
    } else {
      try {
        const status = await broker.status();
        const permitted = status.licence === null ? "not yet read" : String(status.licence.maxProcesses);
        out(`  broker   pid ${status.pid}, ${status.connections} session(s) attached`);
        out(`  kernels  ${status.kernels} running, ${status.busy} busy, budget ${status.budget}`);
        out(`  licence  $MaxLicenseProcesses = ${permitted}` + (status.licence?.type ? ` (${status.licence.type})` : ""));
        out(broker.spawnedHere(status.pid) ? `  reserve  ${config2.reserveSeats} seat(s) left free for interactive use (this run started the broker, so its settings are these)` : `  reserve  this run would use ${config2.reserveSeats}; the running broker was started by another session and keeps its own`);
      } catch (err) {
        out(`  broker did not answer: ${errorText(err)}`);
      } finally {
        await broker.stop();
      }
    }
  }
  out();
  out("Starting the kernel");
  let reported = null;
  const session = new KernelSession({
    bin: install.bin,
    serverName: config2.serverName,
    idleMs: 0,
    startTimeoutMs: config2.startTimeoutMs,
    clientInfo: { name: `${PKG.name}-doctor`, version: PKG.version },
    log,
    // The same environment the server would give a kernel. Without it `doctor`
    // can succeed where the server fails, or fail where it succeeds — which is
    // the one thing a diagnostic must never do.
    extraEnv: installationEnv(install.bin, config2.inspect),
    // WOLFRAM_MCP_INSPECT=0 means the report is not used at all, here included,
    // or doctor would show facts the server it diagnoses ignores.
    onFacts: (facts2, chosen) => {
      if (!config2.inspect)
        return;
      reported = facts2;
      recordFacts(install.bin, facts2, chosen, log);
    }
  });
  let code2;
  try {
    const startedAt = Date.now();
    const result = await session.run(async (client) => {
      const caps = client.getServerCapabilities() ?? {};
      const tools = await client.listTools();
      return { caps, tools: tools.tools ?? [], info: client.getServerVersion() };
    });
    const elapsed = ((Date.now() - startedAt) / 1e3).toFixed(1);
    out();
    out(`  ok, ${elapsed}s`);
    out(`  upstream      ${result.info?.name ?? "?"} ${result.info?.version ?? ""}`.trimEnd());
    out(`  capabilities  ${Object.keys(result.caps).join(", ") || "(none)"}`);
    out(`  tools         ${result.tools.map((tool) => tool.name).join(", ") || "(none)"}`);
    out();
    code2 = 0;
  } catch (err) {
    out();
    out("  failed:");
    for (const line of errorText(err).split("\n"))
      out(`  ${line}`);
    out();
    code2 = 1;
  } finally {
    await session.stop();
  }
  out("Installation facts");
  const cachedFacts = reported === null && config2.inspect ? readFacts(install.bin) : null;
  const facts = reported ?? cachedFacts;
  if (!facts) {
    out(config2.inspect ? "  not reported: the kernel did not get far enough to say" : "  not used (WOLFRAM_MCP_INSPECT=0)");
  } else {
    if (cachedFacts)
      out("  ! not reported by this kernel; cached from an earlier one");
    out(`  AgentTools       ${facts.agentTools ?? "absent \u2014 every tool call will fail"}`);
    out(`  Wolfram Account  ${facts.wolframID ?? "not signed in \u2014 cloud-backed tools will fail on their own"}`);
    out(`  cloud connected  ${facts.cloudConnected ? "yes" : "no"}`);
    out(`  licence          ${facts.maxLicenseProcesses} seat(s)${facts.licenseType ? ` (${facts.licenseType})` : ""}`);
  }
  out();
  return code2;
}
var CONFIG_VARS;
var init_doctor = __esm({
  "dist/doctor.js"() {
    "use strict";
    init_client2();
    init_cache();
    init_config();
    init_inspect();
    init_kernel();
    init_locate();
    init_log();
    init_version();
    CONFIG_VARS = [
      // Discovery
      "WOLFRAM_MCP_KERNEL",
      "WOLFRAM_KERNEL_PATH",
      "WOLFRAM_MCP_VERSION",
      "WOLFRAM_MCP_MIN_VERSION",
      "WOLFRAM_MIN_VERSION",
      "WOLFRAM_INSTALLATION_DIRECTORY",
      "WOLFRAM_HOME",
      // Which server, and how long to wait
      "WOLFRAM_MCP_SERVER_NAME",
      "MCP_SERVER_NAME",
      "WOLFRAM_MCP_DEFAULT_SERVER",
      "WOLFRAM_MCP_IDLE_MINUTES",
      "WOLFRAM_IDLE_MINUTES",
      "WOLFRAM_MCP_START_TIMEOUT_SECONDS",
      "WOLFRAM_START_TIMEOUT_SECONDS",
      "WOLFRAM_MCP_CALL_TIMEOUT_SECONDS",
      "WOLFRAM_CALL_TIMEOUT_SECONDS",
      // Caching, sharing and the licence
      "WOLFRAM_MCP_CACHE",
      "WOLFRAM_MCP_SHARE",
      "WOLFRAM_MCP_RUNTIME_DIR",
      // The kernel's own startup options, where an entitlement arrives. Listed by
      // name only, like every variable here: its value holds the entitlement ID.
      "WOLFRAMINIT",
      "WOLFRAM_MCP_MAX_KERNELS",
      "WOLFRAM_MCP_RESERVE_SEATS",
      "WOLFRAM_MCP_LICENSE_LIMIT",
      "WOLFRAM_MCP_INSPECT",
      "WOLFRAM_MCP_KERNEL_ENV",
      "WOLFRAM_MCP_LOG",
      // Read by the lsp subcommand the Claude Code plugin runs, not by this
      // server. Reported because "code intelligence is off and nothing
      // says why" is otherwise untraceable to a variable someone set and forgot.
      "WOLFRAM_MCP_LSP",
      // Not read by this server at all: AgentTools reads it from the kernel's
      // environment and it decides each tool's effective options, including the
      // evaluator's TimeConstraint. Reported because a user debugging a timeout has
      // otherwise no way to see that it is in effect.
      "MCP_TOOL_OPTIONS",
      // Also not ours: AgentTools reads these from the kernel's environment, which
      // inherits this one. Reported because "the tools behave strangely" is
      // otherwise untraceable to a variable someone set and forgot.
      "WOLFRAM_CLOUDBASE",
      "LLMKIT_ENABLED",
      "MCP_APPS_ENABLED",
      "MCP_APPS_NOTEBOOK_METHOD"
    ];
  }
});

// dist/prepare.js
import { statSync as statSync5 } from "node:fs";
function candidateIdentity(bin) {
  try {
    const stat = statSync5(bin);
    return { bin, mtimeMs: Math.round(stat.mtimeMs), size: stat.size };
  } catch {
    return null;
  }
}
function sameCandidate(a, b) {
  return a !== null && b !== null && a.bin === b.bin && a.mtimeMs === b.mtimeMs && a.size === b.size;
}
function formatWait(ms) {
  const total = Math.ceil(ms / 1e3);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return minutes > 0 ? `${minutes}m ${String(seconds).padStart(2, "0")}s` : `${seconds}s`;
}
var PREPARATION_BACKOFF_MS, NOT_RESOLVED_BACKOFF_MS, MIN_START_MS, NOT_RESOLVED_ADVICE, PreparationTimeout, PreparationStopped, Deadline, Backoff;
var init_prepare = __esm({
  "dist/prepare.js"() {
    "use strict";
    init_log();
    PREPARATION_BACKOFF_MS = 10 * 6e4;
    NOT_RESOLVED_BACKOFF_MS = 15e3;
    MIN_START_MS = 1e3;
    NOT_RESOLVED_ADVICE = "meanwhile, check the server MCP_SERVER_NAME names: create it, install the paclet that provides it, or repair its definition";
    PreparationTimeout = class extends Error {
      stage;
      /**
       * `cause` is the work's own failure when one landed as time ran out, kept so
       * a caller can still tell what it was: a server name that did not resolve
       * starts no back-off even when the deadline wrapped it. `began` is false for
       * a stage refused for lack of time, which ran out before it, not while it
       * ran (#10).
       */
      constructor(stage, totalMs, detail, cause, { began = true } = {}) {
        super(`a Wolfram kernel was not ready within ${budgetText(totalMs)} (WOLFRAM_MCP_START_TIMEOUT_SECONDS): time ran out ${began ? "while" : "before"} ${stage}` + // Verbatim: the detail is often another error's own words, which are
        // never rewritten, so a sentence's capital is its own.
        (detail ? `. ${detail}` : ""), cause === void 0 ? void 0 : { cause });
        this.name = "PreparationTimeout";
        this.stage = stage;
      }
    };
    PreparationStopped = class extends Error {
      constructor() {
        super("the Wolfram server was stopped while a kernel was being prepared");
        this.name = "PreparationStopped";
      }
    };
    Deadline = class {
      totalMs;
      signal;
      #at;
      #clock;
      constructor(totalMs, clock = Date.now, signal = new AbortController().signal) {
        this.totalMs = totalMs;
        this.signal = signal;
        this.#clock = clock;
        this.#at = clock() + totalMs;
      }
      get stopped() {
        return this.signal.aborted;
      }
      remaining() {
        return Math.max(0, this.#at - this.#clock());
      }
      /**
       * `work`, unless the deadline passes first — then a `PreparationTimeout`
       * naming `stage`.
       *
       * The work is not stopped here, because what stopping means depends on who
       * owns it: a probe this process started is killed by its own timeout, a
       * kernel by its transport, while a broker's preparation belongs to every
       * session attached to it and is left to finish for them. `onLate` receives
       * whatever the work produces after the deadline, so an owner can release it.
       *
       * A failure that lands once the deadline has passed is reported as the
       * timeout too, carrying the work's own words: the handshake's own timer is
       * set to the remaining time, and whichever of the two fires first, the
       * caller should learn the stage. `graceMs` lets work that bounds itself fail
       * first, so its richer error — a kernel's last words — is the one wrapped.
       *
       * "Once the deadline has passed" is read off this deadline's clock, and the
       * work's timer runs on Node's loop clock, which lags it: the work can fail on
       * its own expiry with a millisecond still showing here. `ranOut` names that
       * failure — the work timing out on the remainder it was given — so it is
       * reported as the timeout whatever the two clocks say.
       */
      async within(stage, work, onLate, graceMs = 0, ranOut) {
        let expired = false;
        let timer;
        let onAbort;
        const timeout = new Promise((_, reject) => {
          timer = setTimeout(() => {
            expired = true;
            reject(new PreparationTimeout(stage, this.totalMs));
          }, this.remaining() + graceMs);
          timer.unref?.();
          onAbort = () => {
            expired = true;
            reject(new PreparationStopped());
          };
          if (this.signal.aborted)
            onAbort();
          else
            this.signal.addEventListener("abort", onAbort, { once: true });
        });
        void work.then((late) => {
          if (expired)
            onLate?.(late);
        }, () => {
        });
        try {
          return await Promise.race([work, timeout]);
        } catch (err) {
          if (this.signal.aborted)
            throw new PreparationStopped();
          if (err instanceof PreparationTimeout)
            throw err;
          if (this.remaining() > 0 && !ranOut?.(err))
            throw err;
          throw new PreparationTimeout(stage, this.totalMs, errorText(err), err);
        } finally {
          clearTimeout(timer);
          if (onAbort)
            this.signal.removeEventListener("abort", onAbort);
        }
      }
      /**
       * What is left, for work that bounds itself to it, or the timeout for
       * `stage` if less than `minimumMs` is. One read of the clock, where a check
       * then `remaining()` was two: a deadline that ran out between them handed on
       * 0, which spawned a kernel with a 0ms handshake (a seat for a start that
       * could only fail) or sent the broker a ceiling of 0, which means none (#11).
       * `minimumMs` is what the work needs to have any chance — a kernel cannot
       * start in a few milliseconds either — capped at half the deadline, so a
       * short one still gets an attempt; and never less than something.
       */
      handOn(stage, minimumMs = 1) {
        if (this.signal.aborted)
          throw new PreparationStopped();
        const left = this.remaining();
        const floor = Math.max(1, Math.min(minimumMs, this.totalMs / 2));
        if (left < floor) {
          throw new PreparationTimeout(stage, this.totalMs, `${Math.floor(left)}ms were left, too little for this to begin`, void 0, { began: false });
        }
        return left;
      }
      /**
       * Throws the timeout for `stage` if the deadline has already passed, kept for
       * callers of the library. Its message says time ran out *before* the stage,
       * which it refuses without beginning (#10); it said "while" until 0.1.2.
       *
       * @deprecated Use `handOn`, which returns the remainder from the same read:
       * this followed by `remaining()` is two reads of the clock, and a deadline
       * that runs out between them hands on 0 (#11).
       */
      check(stage) {
        if (this.signal.aborted)
          throw new PreparationStopped();
        if (this.remaining() <= 0) {
          throw new PreparationTimeout(stage, this.totalMs, void 0, void 0, { began: false });
        }
      }
    };
    Backoff = class {
      #windowMs;
      #clock;
      #failure = null;
      constructor(windowMs = PREPARATION_BACKOFF_MS, clock = Date.now) {
        this.#windowMs = windowMs;
        this.#clock = clock;
      }
      /**
       * `windowMs`, when a failure warrants a shorter wait than the usual window,
       * and `advice` for what fixes it, when that is not the installation.
       */
      record(identity, err, windowMs = this.#windowMs, advice) {
        this.#failure = {
          identity,
          at: this.#clock(),
          reason: errorText(err),
          windowMs: Math.min(windowMs, this.#windowMs),
          advice
        };
      }
      clear() {
        this.#failure = null;
      }
      /**
       * The back-off in force for `identity`, or null when a preparation may run.
       * A changed binary ends it at once: an upgrade or a repair is exactly what
       * the user would do about the failure, and making them wait it out would
       * punish the fix.
       */
      current(identity) {
        const failure = this.#failure;
        if (!failure)
          return null;
        const until = failure.at + failure.windowMs;
        const now = this.#clock();
        if (now >= until || !sameCandidate(failure.identity, identity)) {
          this.#failure = null;
          return null;
        }
        return {
          failedAt: failure.at,
          until,
          remainingMs: until - now,
          reason: failure.reason,
          advice: failure.advice
        };
      }
    };
  }
});

// dist/backend.js
var backend_exports = {};
__export(backend_exports, {
  DeferredBackend: () => DeferredBackend,
  LocalBackend: () => LocalBackend,
  brokerLaunch: () => brokerLaunch,
  createBackend: () => createBackend,
  deferredBackend: () => deferredBackend
});
async function drainPages(page) {
  const all = [];
  let cursor;
  for (let guard = 0; guard < 50; guard++) {
    const result = await page(cursor);
    all.push(...result.items);
    cursor = result.nextCursor;
    if (!cursor)
      break;
  }
  return all;
}
function deferredBackend(config2, install, log, overrides = {}) {
  return new DeferredBackend((deadline) => createBackend(config2, install, log, deadline), log, {
    ...overrides,
    startTimeoutMs: config2.startTimeoutMs,
    bin: install.bin
  });
}
function brokerLaunch(config2, install, log) {
  const address = brokerAddress(install.bin);
  return {
    address,
    // Shared with doctor so the two cannot disagree about which broker, or which
    // kind of kernel, this configuration wants.
    flavour: config2.flavour,
    spawnCommand: process.execPath,
    spawnArgs: [process.argv[1] ?? "", "broker", "--address", address, "--kernel", install.bin],
    spawnEnv: { ...process.env, WOLFRAM_MCP_SHARE: "0", MCP_SERVER_NAME: config2.serverName },
    log,
    startTimeoutMs: config2.startTimeoutMs
  };
}
async function createBackend(config2, install, log, deadline = new Deadline(config2.startTimeoutMs)) {
  const local = async () => {
    const extraEnv = installationEnv(install.bin, config2.inspect);
    return new LocalBackend({
      bin: install.bin,
      serverName: config2.serverName,
      idleMs: config2.idleMs,
      startTimeoutMs: config2.startTimeoutMs,
      clientInfo: { name: PKG.name, version: PKG.version },
      log,
      extraEnv,
      onFacts: (facts, chosen) => {
        if (config2.inspect)
          recordFacts(install.bin, facts, chosen, log);
      }
    });
  };
  if (!config2.share) {
    log("kernel sharing disabled; using a private kernel");
    return local();
  }
  const broker = await deadline.within("attaching to the shared broker", BrokerBackend.open(brokerLaunch(config2, install, log)), (late) => void late?.stop());
  if (!broker)
    return local();
  try {
    await broker.awaitReady(deadline);
    return broker;
  } catch (err) {
    await broker.stop().catch(() => {
    });
    if (err instanceof PreparationTimeout || err instanceof PreparationStopped)
      throw err;
    log(`the broker failed while preparing (${errorText(err)}); using a private kernel`);
    return local();
  }
}
var LocalBackend, DeferredBackend;
var init_backend = __esm({
  "dist/backend.js"() {
    "use strict";
    init_broker_client();
    init_broker_protocol();
    init_config();
    init_doctor();
    init_inspect();
    init_prepare();
    init_kernel();
    init_log();
    init_version();
    LocalBackend = class {
      kind = "local";
      #session;
      #onReady;
      constructor(options) {
        this.#session = new KernelSession({
          ...options,
          onReady: async (client) => {
            await this.#onReady?.({
              capabilities: async () => client.getServerCapabilities() ?? {},
              listTools: (cursor) => client.listTools(cursor ? { cursor } : void 0),
              listPrompts: (cursor) => client.listPrompts(cursor ? { cursor } : void 0)
            });
          }
        });
      }
      onKernelReady(handler) {
        this.#onReady = handler;
      }
      /**
       * Start the kernel within what the deadline has left. Its own handshake
       * timer gets that remainder, so on expiry it tears the kernel down through
       * the transport as any failed start does: this kernel is ours to stop.
       *
       * Must be the first call on this backend, as `DeferredBackend` guarantees:
       * it builds a fresh one per preparation and lets nothing reach it until this
       * returns. A start already under way would be joined, and it runs on the
       * configured timeout, so its expiry would be reported as the deadline's.
       */
      async prepare(deadline) {
        const remainder = deadline.handOn("starting the kernel", MIN_START_MS);
        await deadline.within("starting the kernel", this.#session.ensure(remainder), void 0, 1e3, (err) => err instanceof Error && err.cause instanceof HandshakeTimeout);
      }
      async capabilities() {
        return this.#session.run(async (client) => client.getServerCapabilities() ?? {});
      }
      /**
       * The whole list, drained inside one hold on the kernel.
       *
       * The cursor argument is kept for the interface's sake and deliberately
       * ignored: a cursor is paging state belonging to one kernel, and on the shared
       * path the pool hands out whichever kernel is free, so relaying one could ask
       * page 2 of a kernel that never issued page 1. Both backends therefore answer
       * complete lists and neither ever returns a `nextCursor`.
       */
      async listTools() {
        const tools = await this.#session.run((c) => drainPages(async (cursor) => {
          const page = await c.listTools(cursor ? { cursor } : void 0);
          return { items: page.tools ?? [], nextCursor: page.nextCursor };
        }));
        return { tools };
      }
      async listPrompts() {
        const prompts = await this.#session.run((c) => drainPages(async (cursor) => {
          const page = await c.listPrompts(cursor ? { cursor } : void 0);
          return { items: page.prompts ?? [], nextCursor: page.nextCursor };
        }));
        return { prompts };
      }
      async getPrompt(params) {
        return this.#session.run((c) => c.getPrompt(params));
      }
      async listResources(params) {
        return this.#session.run((c) => c.listResources(params));
      }
      async readResource(params) {
        return this.#session.run((c) => c.readResource(params));
      }
      async callTool(params, options) {
        return this.#session.run((c) => c.callTool(params, void 0, {
          timeout: CALL_REQUEST_TIMEOUT_MS,
          ...options.signal ? { signal: options.signal } : {},
          ...options.onprogress ? { onprogress: options.onprogress, resetTimeoutOnProgress: true } : {}
        }), { deadlineMs: options.timeoutMs, signal: options.signal });
      }
      async stop() {
        await this.#session.stop();
      }
    };
    DeferredBackend = class {
      kind = "deferred";
      #factory;
      #log;
      #startTimeoutMs;
      #bin;
      #clock;
      #backoff;
      #resolved = null;
      #resolving = null;
      /**
       * The backend a preparation has made and not yet handed over. `stop()` has
       * to reach it: during a private handshake the kernel is already running and
       * `#resolved` is still null, so stopping only the resolved backend left that
       * kernel to finish starting and keep its seat after the server had stopped.
       */
      #preparing = null;
      /** Ends the preparation in flight, from inside whichever stage it is in. */
      #abort = null;
      #stopped = false;
      #onReady;
      constructor(factory, log, options = {}) {
        this.#factory = factory;
        this.#log = log;
        this.#startTimeoutMs = options.startTimeoutMs ?? DEFAULT_START_TIMEOUT_MS;
        this.#bin = options.bin;
        this.#clock = options.clock ?? Date.now;
        this.#backoff = new Backoff(options.backoffMs ?? PREPARATION_BACKOFF_MS, this.#clock);
      }
      /** The backend actually in use, once one has been chosen. */
      get resolved() {
        return this.#resolved;
      }
      #identity() {
        return this.#bin === void 0 ? null : candidateIdentity(this.#bin);
      }
      backoff() {
        return this.#backoff.current(this.#identity());
      }
      async #get() {
        if (this.#resolved && this.#resolved.usable?.() === false) {
          this.#log?.("the chosen backend is gone; deciding again");
          const dead = this.#resolved;
          this.#resolved = null;
          void dead.stop().catch(() => {
          });
        }
        if (this.#resolved)
          return this.#resolved;
        if (this.#stopped)
          throw new PreparationStopped();
        const waiting = this.backoff();
        if (waiting) {
          throw new Error(`the last attempt to prepare a Wolfram kernel failed ${formatWait(this.#clock() - waiting.failedAt)} ago, so this one was not made. It is retried in ${formatWait(waiting.remainingMs)}` + (waiting.advice ? `; ${waiting.advice}.` : `, or as soon as the installation changes. For a full report, run ${doctorCommand()}.`) + // Last, and set apart: a reason can run to several lines of kernel
          // output and end in a sentence of its own, so spliced into this one
          // it read "try again.. For a full report", burying the pointer.
          `

The failure was: ${waiting.reason}`);
        }
        this.#resolving ??= this.#prepare().then((backend) => {
          this.#resolved = backend;
          this.#resolving = null;
          return backend;
        }, (err) => {
          this.#resolving = null;
          if (err instanceof PreparationStopped)
            throw err;
          const unresolved = isServerNotResolved(err);
          this.#backoff.record(
            this.#identity(),
            err,
            unresolved ? NOT_RESOLVED_BACKOFF_MS : void 0,
            // Not the installation: the doctor and an install change point
            // the user at the wrong thing.
            unresolved ? NOT_RESOLVED_ADVICE : void 0
          );
          this.#log?.(`preparation failed; not retrying for ${formatWait(this.#backoffWindow())}: ${errorText(err)}`);
          throw err;
        });
        return this.#resolving;
      }
      #backoffWindow() {
        return this.#backoff.current(this.#identity())?.remainingMs ?? 0;
      }
      /**
       * One preparation under one deadline: the factory (inspection, broker
       * attach), then the chosen backend's own `prepare` (the broker's
       * preparation, or the kernel handshake). The ready handler is attached
       * first, because a kernel started here refreshes the cache through it.
       */
      async #prepare() {
        this.#abort = new AbortController();
        const deadline = new Deadline(this.#startTimeoutMs, this.#clock, this.#abort.signal);
        const backend = await this.#factory(deadline);
        this.#preparing = backend;
        try {
          if (this.#stopped)
            throw new PreparationStopped();
          if (this.#onReady)
            backend.onKernelReady(this.#onReady);
          await backend.prepare?.(deadline);
          if (this.#stopped)
            throw new PreparationStopped();
        } catch (err) {
          await backend.stop().catch(() => {
          });
          throw err;
        } finally {
          this.#preparing = null;
        }
        return backend;
      }
      onKernelReady(handler) {
        this.#onReady = handler;
        this.#resolved?.onKernelReady(handler);
      }
      async capabilities() {
        return (await this.#get()).capabilities();
      }
      async listTools(cursor) {
        return (await this.#get()).listTools(cursor);
      }
      async listPrompts(cursor) {
        return (await this.#get()).listPrompts(cursor);
      }
      async getPrompt(params) {
        return (await this.#get()).getPrompt(params);
      }
      async listResources(params) {
        return (await this.#get()).listResources(params);
      }
      async readResource(params) {
        return (await this.#get()).readResource(params);
      }
      async callTool(params, options) {
        return (await this.#get()).callTool(params, options);
      }
      async stop() {
        this.#stopped = true;
        this.#abort?.abort();
        await Promise.all([this.#preparing?.stop(), this.#resolved?.stop()]);
        const resolving = this.#resolving;
        if (resolving) {
          let timer;
          await Promise.race([
            resolving.catch(() => {
            }),
            new Promise((resolve) => {
              timer = setTimeout(resolve, 5e3);
              timer.unref?.();
            })
          ]);
          clearTimeout(timer);
        }
      }
    };
  }
});

// dist/lsp.js
var lsp_exports = {};
__export(lsp_exports, {
  discoverLspKernel: () => discoverLspKernel,
  lspDecision: () => lspDecision,
  lspOptionFile: () => lspOptionFile,
  recordLspOption: () => recordLspOption,
  runLsp: () => runLsp
});
import { spawn as spawn3 } from "node:child_process";
import { existsSync as existsSync3, mkdirSync as mkdirSync5, readFileSync as readFileSync6, rmSync as rmSync3, writeFileSync as writeFileSync4 } from "node:fs";
import { dirname as dirname7, join as join8 } from "node:path";
function discoverLspKernel(log) {
  const config2 = loadConfig(log);
  return locateKernel({
    override: config2.kernelPath,
    version: config2.version,
    minVersion: config2.minVersion,
    log,
    allowWolframScript: false
  });
}
function lspOptionFile(env = process.env) {
  const data = env["CLAUDE_PLUGIN_DATA"]?.trim();
  return data ? join8(data, "lsp-option") : null;
}
function recordLspOption(env = process.env) {
  const file = lspOptionFile(env);
  if (!file)
    return;
  try {
    const value = env["CLAUDE_PLUGIN_OPTION_LSP"]?.trim();
    if (value) {
      mkdirSync5(dirname7(file), { recursive: true });
      writeFileSync4(file, `${value}
`);
    } else {
      rmSync3(file, { force: true });
    }
  } catch {
  }
}
function lspDecision(env = process.env) {
  const file = lspOptionFile(env);
  let option;
  try {
    option = file && existsSync3(file) ? readFileSync6(file, "utf8") : void 0;
  } catch {
    option = void 0;
  }
  const sources = [
    ["WOLFRAM_MCP_LSP", env["WOLFRAM_MCP_LSP"]],
    ["the plugin's lsp option", option]
  ];
  for (const [name, setting] of sources) {
    const raw = setting?.trim();
    if (!raw || /^\$\{.*\}$/.test(raw))
      continue;
    const value = raw.toLowerCase();
    if (ON.includes(value))
      return { enabled: true, because: `${name}=${raw}` };
    if (OFF.includes(value))
      return { enabled: false, because: `${name}=${raw}` };
    return {
      enabled: false,
      because: `${name}=${raw} is neither on nor off (${[...ON, ...OFF].join(", ")}); treating it as off`
    };
  }
  return { enabled: true, because: "on by default; the plugin's lsp option turns it off" };
}
function frameReader(onFrame) {
  let pending = [];
  let size = 0;
  let wanted = 0;
  return (chunk) => {
    pending.push(chunk);
    size += chunk.length;
    if (size < wanted)
      return;
    let buf = pending.length === 1 ? chunk : Buffer.concat(pending, size);
    wanted = 0;
    for (; ; ) {
      const headerEnd = buf.indexOf("\r\n\r\n");
      if (headerEnd === -1)
        break;
      const length = Number(/Content-Length: (\d+)/i.exec(buf.subarray(0, headerEnd).toString())?.[1]);
      if (!Number.isFinite(length))
        break;
      if (buf.length < headerEnd + 4 + length) {
        wanted = headerEnd + 4 + length;
        break;
      }
      const frame = buf.subarray(0, headerEnd + 4 + length);
      buf = buf.subarray(headerEnd + 4 + length);
      onFrame(frame, frame.subarray(headerEnd + 4).toString());
    }
    pending = buf.length > 0 ? [buf] : [];
    size = buf.length;
  };
}
function guardUnadvertised(child) {
  let capabilities = null;
  let initializeId;
  const toClient = (frame) => process.stdout.write(frame);
  const reply = (id, method) => {
    const body = JSON.stringify({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `${method} is not supported by Wolfram's LSPServer` }
    });
    toClient(`Content-Length: ${Buffer.byteLength(body)}\r
\r
${body}`);
  };
  const served = (method) => {
    if (method === "initialize" || method === "shutdown")
      return true;
    if (capabilities === null)
      return true;
    const needed = REQUEST_CAPABILITY[method];
    if (!needed)
      return false;
    let at = capabilities;
    for (const key of needed) {
      if (typeof at !== "object" || at === null)
        return false;
      at = at[key];
    }
    return Boolean(at);
  };
  process.stdin.on("data", frameReader((frame, body) => {
    let msg = {};
    try {
      msg = JSON.parse(body);
    } catch {
    }
    if (msg.method === "initialize")
      initializeId = msg.id;
    if (msg.id !== void 0 && msg.method && !served(msg.method)) {
      reply(msg.id, msg.method);
      return;
    }
    child.stdin?.write(frame);
  }));
  process.stdin.on("end", () => child.stdin?.end());
  child.stdout?.on("data", frameReader((frame, body) => {
    if (capabilities === null && initializeId !== void 0) {
      try {
        const msg = JSON.parse(body);
        if (msg.id === initializeId)
          capabilities = msg.result?.capabilities ?? {};
      } catch {
      }
    }
    toClient(frame);
  }));
}
function runLsp() {
  const log = (message) => {
    process.stderr.write(`[wolfram-lsp] ${message}
`);
  };
  const decision = lspDecision();
  if (!decision.enabled) {
    serveNothing(decision.because);
    return null;
  }
  log(`code intelligence on (${decision.because}); this kernel takes a licence seat`);
  const install = discoverLspKernel(log);
  if (!install) {
    process.stderr.write(`[wolfram-lsp] no usable Wolfram installation was found; code intelligence is off. WOLFRAM_MCP_KERNEL names one explicitly, and ${doctorCommand()} says what is wrong
`);
    return 1;
  }
  process.stderr.write(`[wolfram-lsp] starting LSPServer on ${install.bin} (${install.version ?? "unknown version"})
`);
  const child = spawn3(
    install.bin,
    [
      "-noinit",
      "-noprompt",
      "-nopaclet",
      "-nostartuppaclets",
      "-noicon",
      "-run",
      'Needs["LSPServer`"];LSPServer`StartServer[]'
    ],
    // Piped rather than inherited, so the guard below can answer what the
    // kernel cannot. stderr still goes straight to the client's log.
    { stdio: ["pipe", "pipe", "inherit"] }
  );
  guardUnadvertised(child);
  child.on("error", (err) => {
    process.stderr.write(`[wolfram-lsp] the kernel could not be started: ${err.message}
`);
    process.exit(1);
  });
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => child.kill(signal));
  }
  child.stdin?.on("error", () => {
  });
  child.on("close", (code2, signal) => {
    process.stdout.write("", () => process.exit(signal ? 1 : code2 ?? 0));
  });
  return null;
}
function serveNothing(because) {
  process.stderr.write(`[wolfram-lsp] ${because}: serving no capabilities, starting no kernel
`);
  let down = false;
  const send = (msg) => {
    const body = JSON.stringify(msg);
    process.stdout.write(`Content-Length: ${Buffer.byteLength(body)}\r
\r
${body}`);
  };
  process.stdin.on("data", frameReader((_frame, body) => {
    let msg;
    try {
      msg = JSON.parse(body);
    } catch {
      return;
    }
    if (msg.method === "initialize") {
      send({ jsonrpc: "2.0", id: msg.id, result: { capabilities: {} } });
    } else if (msg.method === "shutdown") {
      down = true;
      send({ jsonrpc: "2.0", id: msg.id, result: null });
    } else if (msg.method === "exit") {
      process.exit(down ? 0 : 1);
    } else if (msg.id !== void 0) {
      send({
        jsonrpc: "2.0",
        id: msg.id,
        error: { code: -32601, message: `not serving: ${msg.method ?? "?"}` }
      });
    }
  }));
  process.stdin.on("end", () => process.exit(0));
}
var ON, OFF, REQUEST_CAPABILITY;
var init_lsp = __esm({
  "dist/lsp.js"() {
    "use strict";
    init_config();
    init_doctor();
    init_locate();
    ON = ["1", "true", "on", "yes"];
    OFF = ["0", "false", "off", "no"];
    REQUEST_CAPABILITY = {
      "textDocument/hover": ["hoverProvider"],
      "textDocument/completion": ["completionProvider"],
      "completionItem/resolve": ["completionProvider", "resolveProvider"],
      "textDocument/signatureHelp": ["signatureHelpProvider"],
      "textDocument/declaration": ["declarationProvider"],
      "textDocument/definition": ["definitionProvider"],
      "textDocument/typeDefinition": ["typeDefinitionProvider"],
      "textDocument/implementation": ["implementationProvider"],
      "textDocument/references": ["referencesProvider"],
      "textDocument/documentHighlight": ["documentHighlightProvider"],
      "textDocument/documentSymbol": ["documentSymbolProvider"],
      "textDocument/codeAction": ["codeActionProvider"],
      "codeAction/resolve": ["codeActionProvider", "resolveProvider"],
      "textDocument/codeLens": ["codeLensProvider"],
      "codeLens/resolve": ["codeLensProvider", "resolveProvider"],
      "textDocument/documentLink": ["documentLinkProvider"],
      "documentLink/resolve": ["documentLinkProvider", "resolveProvider"],
      "textDocument/documentColor": ["colorProvider"],
      "textDocument/colorPresentation": ["colorProvider"],
      "textDocument/formatting": ["documentFormattingProvider"],
      "textDocument/rangeFormatting": ["documentRangeFormattingProvider"],
      "textDocument/onTypeFormatting": ["documentOnTypeFormattingProvider"],
      "textDocument/rename": ["renameProvider"],
      "textDocument/prepareRename": ["renameProvider", "prepareProvider"],
      "textDocument/foldingRange": ["foldingRangeProvider"],
      "textDocument/selectionRange": ["selectionRangeProvider"],
      "textDocument/prepareCallHierarchy": ["callHierarchyProvider"],
      "callHierarchy/incomingCalls": ["callHierarchyProvider"],
      "callHierarchy/outgoingCalls": ["callHierarchyProvider"],
      "textDocument/prepareTypeHierarchy": ["typeHierarchyProvider"],
      "typeHierarchy/supertypes": ["typeHierarchyProvider"],
      "typeHierarchy/subtypes": ["typeHierarchyProvider"],
      "textDocument/semanticTokens/full": ["semanticTokensProvider"],
      "textDocument/semanticTokens/full/delta": ["semanticTokensProvider", "full", "delta"],
      "textDocument/semanticTokens/range": ["semanticTokensProvider", "range"],
      "textDocument/linkedEditingRange": ["linkedEditingRangeProvider"],
      "textDocument/moniker": ["monikerProvider"],
      "textDocument/inlayHint": ["inlayHintProvider"],
      "inlayHint/resolve": ["inlayHintProvider", "resolveProvider"],
      "textDocument/inlineValue": ["inlineValueProvider"],
      "textDocument/diagnostic": ["diagnosticProvider"],
      "workspace/diagnostic": ["diagnosticProvider", "workspaceDiagnostics"],
      "workspace/symbol": ["workspaceSymbolProvider"],
      "workspaceSymbol/resolve": ["workspaceSymbolProvider", "resolveProvider"],
      "workspace/executeCommand": ["executeCommandProvider"]
    };
  }
});

// dist/pool.js
function deriveBudget(licence, reserveSeats, explicitMax, current) {
  if (explicitMax !== void 0)
    return clampBudget(explicitMax);
  if (licence.maxProcesses === "unknown")
    return current;
  if (licence.maxProcesses === "unlimited")
    return clampBudget(UNLIMITED_BUDGET);
  return clampBudget(licence.maxProcesses - reserveSeats);
}
function clampBudget(value) {
  return Math.max(1, Math.min(Math.floor(value), HARD_KERNEL_CAP));
}
var LICENCE_SHAPING, HARD_KERNEL_CAP, UNLIMITED_BUDGET, KernelPool;
var init_pool = __esm({
  "dist/pool.js"() {
    "use strict";
    init_kernel();
    init_inspect();
    init_log();
    init_prepare();
    LICENCE_SHAPING = /* @__PURE__ */ new Set(["WOLFRAM_BASE", "WOLFRAM_USERBASE"]);
    HARD_KERNEL_CAP = 8;
    UNLIMITED_BUDGET = 4;
    KernelPool = class {
      #options;
      #slots = [];
      #waiters = [];
      #budget;
      #licence;
      #extraEnv;
      /**
       * The last time each flavour's server name did not resolve, and the kernel's
       * words for it. A session's preparation only attaches to the broker, so this
       * failure never reached a back-off: each request grew a kernel to fail, in
       * parallel for simultaneous ones, and at the budget `#swapOut` retired other
       * sessions' idle kernels to make room for a start that could not succeed
       * (issue #19). Keyed on the flavour, so sharing it changes no answer: a
       * session of the same flavour would get the same one from a kernel. A burst
       * that arrives before the first failure is recorded is not covered: #19.
       */
      #unresolved = /* @__PURE__ */ new Map();
      constructor(options) {
        this.#options = options;
        this.#licence = options.licence;
        this.#extraEnv = options.extraEnv;
        this.#budget = deriveBudget(options.licence, options.reserveSeats, options.maxKernels, 1);
        options.log(`pool budget ${this.#budget} kernel(s) (licence ${options.licence.maxProcesses}, reserving ${options.reserveSeats})`);
        const seats = options.licence.maxProcesses;
        if (typeof seats === "number" && seats - options.reserveSeats < 1) {
          options.log(`the licence permits ${seats} kernel(s) and ${options.reserveSeats} were to be reserved, so the reserve cannot be honoured: this pool will use the seat`);
        }
      }
      get budget() {
        return this.#budget;
      }
      get size() {
        return this.#slots.length;
      }
      get busy() {
        return this.#slots.filter((s) => s.busy).length;
      }
      get licence() {
        return this.#licence;
      }
      /**
       * Take what a kernel reported. The budget is re-derived from the licence
       * unless configuration fixed it, and a raise serves anyone queued at once —
       * the cold start ran at one kernel only because nothing was known yet. A
       * lowered budget stops nothing running; the pool just does not grow past it.
       * Later kernels get the reported directories; the first one inherited the
       * environment those were computed in, so it found the same ones itself.
       *
       * Directories only from a kernel whose environment chose nothing that shapes
       * it (`SHAPING_VARS`): they are then the installation's. Its licence counts
       * unless it chose a base or user base, the two places a licence can be read
       * from. `WOLFRAMINIT` is shared by every kernel in a broker — it is part of
       * the broker's address — and so is this pool's licence; a cloud or local
       * base changes the account and the data, never the seat count, and refusing
       * those left a pool whose every session set `WOLFRAM_CLOUDBASE` at one
       * kernel for good.
       */
      #learn(facts, chosen) {
        this.#options.onFacts?.(facts, chosen);
        if (!this.#options.learnFromKernels)
          return;
        if (chosen.length === 0)
          this.#extraEnv = { ...this.#extraEnv, ...baseDirectoryEnv(facts) };
        if (chosen.some((name) => LICENCE_SHAPING.has(name)))
          return;
        if (this.#options.licenceConfigured)
          return;
        this.#licence = { maxProcesses: facts.maxLicenseProcesses, type: facts.licenseType };
        const next = deriveBudget(this.#licence, this.#options.reserveSeats, this.#options.maxKernels, this.#budget);
        if (next === this.#budget)
          return;
        this.#options.log(`pool budget ${this.#budget} \u2192 ${next} kernel(s), from the licence a kernel reported (${facts.maxLicenseProcesses}, reserving ${this.#options.reserveSeats})`);
        this.#budget = next;
        this.#drainWaiters();
      }
      async #grow(flavour) {
        const index = this.#slots.length + 1;
        const { log } = this.#options;
        const session = new KernelSession({
          bin: this.#options.bin,
          serverName: this.#options.serverName,
          idleMs: this.#options.idleMs,
          startTimeoutMs: this.#options.startTimeoutMs,
          clientInfo: this.#options.clientInfo,
          extraEnv: this.#extraEnv,
          flavour,
          log: (message) => log(`kernel ${index}: ${message}`),
          onFacts: (facts, chosen) => this.#learn(facts, chosen),
          onReady: async (client) => {
            await this.#options.onKernelReady?.(client, flavour.digest);
          }
        });
        const slot = { session, busy: true, flavour };
        this.#slots.push(slot);
        log(`pool grew to ${this.#slots.length} kernel(s) for environment ${flavour.digest}, budget ${this.#budget}`);
        return slot;
      }
      /**
       * Free a seat by dropping an idle kernel of some other flavour.
       *
       * The budget counts seats, not kinds, so a session whose flavour has no kernel
       * cannot simply grow one once the budget is spent — something has to go. An
       * idle kernel of another flavour is the cheapest thing to lose: no computation
       * is running on it, and the evaluator persists its sessions, so what is lost is
       * a warm start rather than work.
       *
       * Preferring this over reusing an *abandoned* kernel of our own flavour is
       * deliberate. An abandoned kernel is very likely still computing something
       * nobody is waiting for, and taking it stops that; a genuinely idle one is not
       * doing anything at all.
       */
      #swapOut(flavour) {
        const victim = this.#slots.find((s) => !s.busy && !s.session.abandoned && s.flavour.digest !== flavour.digest) ?? this.#slots.find((s) => !s.busy && s.flavour.digest !== flavour.digest);
        if (!victim)
          return false;
        this.#options.log(`budget reached and no kernel for environment ${flavour.digest}; retiring an idle kernel for ${victim.flavour.digest} to make room`);
        this.#retire(victim, "a session with a different environment needed the seat");
        return true;
      }
      /**
       * An idle kernel, preferring one with nothing outstanding.
       *
       * A kernel holding an abandoned call is idle only in the sense that nobody is
       * waiting for its answer: it is very likely still computing, and using it
       * means stopping it first. So it is the last choice, taken when the budget is
       * spent and the alternative is no kernel at all — which is what replaces a
       * timer guessing how long a legitimate evaluation may run. The question is
       * never "has this run too long" but "does anyone need the seat".
       */
      #idle(flavour) {
        const mine = (s) => s.flavour.digest === flavour.digest;
        return this.#slots.find((s) => !s.busy && !s.session.abandoned && mine(s)) ?? this.#slots.find((s) => !s.busy && mine(s));
      }
      /**
       * Take an idle kernel of this flavour, grow one, make room for one, or wait.
       *
       * Five tiers, and the order is what keeps sharing wide while never serving a
       * session from a kernel that is not its own kind.
       */
      async #acquire(flavour) {
        const mine = (s) => s.flavour.digest === flavour.digest;
        const free = this.#slots.find((s) => !s.busy && !s.session.abandoned && mine(s));
        if (free) {
          free.busy = true;
          return free;
        }
        if (this.#slots.length < this.#budget)
          return this.#grow(flavour);
        if (this.#swapOut(flavour))
          return this.#grow(flavour);
        const spent = this.#idle(flavour);
        if (spent) {
          this.#options.log(`budget reached; reusing a kernel that holds an abandoned call, which stops it \u2014 no other kernel can serve this request`);
          spent.busy = true;
          return spent;
        }
        this.#options.log(`all ${this.#slots.length} kernel(s) busy and budget reached; queueing (${this.#waiters.length + 1} waiting)`);
        return new Promise((resolve, reject) => this.#waiters.push({ flavour, resolve, reject }));
      }
      #release(slot) {
        slot.busy = false;
        this.#drainWaiters();
      }
      /**
       * Hold a kernel out of circulation until it has been vouched for.
       *
       * A bare `finally` used to hand it straight back as healthy, which is wrong
       * for the failure that matters most: a kernel that timed out is still working
       * on the abandoned evaluation and is not reading its stdin, so the next
       * borrower queued behind work it could not see and inherited the same
       * timeout. Measured before this existed: two requests, one wedged kernel,
       * both failing, and never a second kernel started. `notifications/cancelled`
       * cannot help — a kernel that is not reading stdin never receives it.
       *
       * Retiring on sight was the wrong correction, though: *any* rejection killed
       * the kernel, so a model guessing a tool name wrong — an `-32602` the kernel
       * answers instantly and is perfectly healthy after — destroyed every evaluator
       * `session` on it. Measured: one `NoSuchTool` call took the kernel count from
       * 1 to 2, where the same run without it stayed at 1.
       *
       * So the slot stays `busy` — nobody may take it — while the session asks the
       * kernel whether it is still there, and only a kernel that cannot answer is
       * retired. The rejection has already been handed to the caller by then; a
       * waiter meanwhile sees no free slot and grows a fresh kernel rather than
       * waiting out the probe, which is what keeps the wedged case fast.
       */
      #quarantine(slot, reason) {
        void slot.session.usable().then(
          (usable) => {
            if (!usable) {
              this.#retire(slot, reason);
              return;
            }
            if (slot.session.abandoned) {
              this.#options.log(`a call was abandoned on this kernel; it will be reused only if no other kernel can serve, rather than killing work that may finish`);
            } else {
              this.#options.log(`the kernel answered for itself after ${reason}; returning it to the pool`);
            }
            this.#release(slot);
          },
          // usable() does not reject, but a pool that leaks a permanently busy slot
          // on a broken promise is worse than one that retires a good kernel.
          () => this.#retire(slot, reason)
        );
      }
      /**
       * Drop a kernel that could not answer for itself, or whose seat is needed.
       *
       * `#draining` guards the waiter drain because `#swapOut` retires from inside
       * `#drainWaiters`: without it the drain re-enters itself, and the head waiter
       * it is part-way through serving is handed a slot twice.
       */
      #retire(slot, reason) {
        const at = this.#slots.indexOf(slot);
        if (at !== -1)
          this.#slots.splice(at, 1);
        this.#options.log(`retiring kernel after ${reason}; pool now ${this.#slots.length} kernel(s)`);
        void slot.session.stop().catch(() => {
        });
        if (!this.#draining)
          this.#drainWaiters();
      }
      #draining = false;
      #drainWaiters() {
        if (this.#draining)
          return;
        this.#draining = true;
        try {
          this.#drain();
        } finally {
          this.#draining = false;
        }
      }
      #drain() {
        while (this.#waiters.length > 0) {
          const head = this.#waiters[0];
          if (!head)
            return;
          const { flavour } = head;
          const refusal = this.#refusal(flavour);
          if (refusal) {
            this.#waiters.shift();
            head.reject(refusal);
            continue;
          }
          const mine = (s) => s.flavour.digest === flavour.digest;
          const take = (slot) => {
            this.#waiters.shift();
            slot.busy = true;
            head.resolve(slot);
          };
          const fresh = this.#slots.find((s) => !s.busy && !s.session.abandoned && mine(s));
          if (fresh) {
            take(fresh);
            continue;
          }
          if (this.#slots.length < this.#budget) {
            this.#waiters.shift();
            void this.#grow(flavour).then(head.resolve);
            continue;
          }
          if (this.#swapOut(flavour)) {
            this.#waiters.shift();
            void this.#grow(flavour).then(head.resolve);
            continue;
          }
          const spent = this.#idle(flavour);
          if (spent) {
            this.#options.log(`budget reached; a waiter is reusing a kernel that holds an abandoned call, which stops it`);
            take(spent);
            continue;
          }
          return;
        }
      }
      /**
       * Run `fn` on a kernel of this flavour, holding it for the duration.
       *
       * The flavour is the caller's, never the pool's: the pool runs inside a broker
       * whose own environment is whichever session spawned it, and that is precisely
       * what must not decide anything.
       */
      async run(flavour, fn, options = {}) {
        const refusal = this.#refusal(flavour);
        if (refusal)
          throw refusal;
        const slot = await this.#acquire(flavour);
        try {
          const result = await slot.session.run(fn, options);
          this.#release(slot);
          return result;
        } catch (err) {
          if (isServerNotResolved(err))
            this.#recordUnresolved(flavour.digest, err);
          this.#quarantine(slot, errorText(err));
          throw err;
        }
      }
      #now() {
        return (this.#options.clock ?? Date.now)();
      }
      #recordUnresolved(digest, err) {
        const now = this.#now();
        for (const [key, known] of this.#unresolved) {
          if (now - known.at >= NOT_RESOLVED_BACKOFF_MS)
            this.#unresolved.delete(key);
        }
        this.#unresolved.set(digest, { at: now, reason: errorText(err) });
      }
      /** The refusal for a request while its flavour's server recently would not start. */
      #refusal(flavour) {
        const known = this.#unresolved.get(flavour.digest);
        if (!known)
          return null;
        const age = this.#now() - known.at;
        if (age >= NOT_RESOLVED_BACKOFF_MS) {
          this.#unresolved.delete(flavour.digest);
          return null;
        }
        return new ServerNotResolved(`a kernel for this server could not start it ${formatWait(age)} ago, so none was started for this request; it is tried again in ${formatWait(NOT_RESOLVED_BACKOFF_MS - age)}; ${NOT_RESOLVED_ADVICE}.

The failure was: ${known.reason}`);
      }
      async stop() {
        await Promise.all(this.#slots.map((s) => s.session.stop().catch(() => {
        })));
        this.#slots.length = 0;
      }
    };
  }
});

// dist/broker-server.js
var broker_server_exports = {};
__export(broker_server_exports, {
  startBroker: () => startBroker
});
import { createServer } from "node:net";
import { statSync as statSync6, unlinkSync as unlinkSync3 } from "node:fs";
import { connect as connect2 } from "node:net";
async function drain(page) {
  const all = [];
  let cursor;
  for (let i = 0; i < MAX_PAGES2; i++) {
    const result = await page(cursor);
    all.push(...result.items);
    cursor = result.nextCursor;
    if (!cursor)
      break;
  }
  return all;
}
function readFlavour(params) {
  if (typeof params !== "object" || params === null)
    return null;
  const { digest, env, names } = params;
  if (typeof digest !== "string" || !digest)
    return null;
  if (typeof env !== "object" || env === null)
    return null;
  if (!Array.isArray(names) || names.some((name) => typeof name !== "string"))
    return null;
  const values = {};
  for (const [name, value] of Object.entries(env)) {
    if (typeof value !== "string")
      return null;
    values[name] = value;
  }
  return { digest, env: values, names };
}
async function socketIsLive(address) {
  if (process.platform === "win32")
    return false;
  return new Promise((resolve) => {
    const probe = connect2(address);
    const done = (result) => {
      probe.destroy();
      resolve(result);
    };
    probe.once("connect", () => done(true));
    probe.once("error", () => done(false));
    setTimeout(() => done(false), 1e3).unref?.();
  });
}
function socketIdentity(address) {
  try {
    const info = statSync6(address);
    return `${info.dev}:${info.ino}`;
  } catch {
    return null;
  }
}
function removeStaleSocket(address, expected, log) {
  if (process.platform === "win32")
    return;
  if (expected === null)
    return;
  if (socketIdentity(address) !== expected) {
    log("the socket was replaced while it was being checked; leaving it alone");
    return;
  }
  try {
    unlinkSync3(address);
    log("removed a stale socket");
  } catch {
  }
}
function resolveLicence(options) {
  if (options.licenceOverride !== void 0) {
    options.log(`licence limit from configuration: ${options.licenceOverride}`);
    return { maxProcesses: options.licenceOverride, type: null };
  }
  if (!options.allowInspect) {
    options.log("installation inspection disabled; keeping a single kernel");
    return { maxProcesses: "unknown", type: null };
  }
  if (settingValue(process.env["WOLFRAMINIT"]) !== void 0)
    return { maxProcesses: "unknown", type: null };
  const facts = readFacts(options.bin);
  if (!facts)
    return { maxProcesses: "unknown", type: null };
  return { maxProcesses: facts.maxLicenseProcesses, type: facts.licenseType };
}
async function startBroker(options) {
  const { address, log } = options;
  const connections = /* @__PURE__ */ new Map();
  let emptyTimer = null;
  let stopping = false;
  let boundIdentity = null;
  const preparing = (async () => {
    const licence = resolveLicence(options);
    const extraEnv = installationEnv(options.bin, options.allowInspect);
    return new KernelPool({
      bin: options.bin,
      serverName: options.serverName,
      idleMs: options.idleMs,
      startTimeoutMs: options.startTimeoutMs,
      clientInfo: options.clientInfo,
      log,
      maxKernels: options.maxKernels,
      reserveSeats: options.reserveSeats,
      licence,
      extraEnv,
      learnFromKernels: options.allowInspect,
      licenceConfigured: options.licenceOverride !== void 0,
      onFacts: (facts, chosen) => {
        if (options.allowInspect)
          recordFacts(options.bin, facts, chosen, log);
      },
      onKernelReady: (client, flavour) => announceKernel(client, flavour)
    });
  })();
  preparing.catch(() => {
  });
  async function announceKernel(client, flavour) {
    const audience = [...connections.values()].filter((s) => s.flavour?.digest === flavour);
    if (audience.length === 0)
      return;
    try {
      const capabilities = client.getServerCapabilities() ?? {};
      const tools = await drain(async (cursor) => {
        const page = await client.listTools(cursor ? { cursor } : void 0);
        return { items: page.tools ?? [], nextCursor: page.nextCursor };
      });
      const prompts = capabilities.prompts ? await drain(async (cursor) => {
        const page = await client.listPrompts(cursor ? { cursor } : void 0);
        return { items: page.prompts ?? [], nextCursor: page.nextCursor };
      }) : null;
      broadcast({ event: "kernelReady", capabilities, tools, prompts }, flavour);
    } catch (err) {
      log(`could not read the new kernel's lists: ${errorText(err)}`);
    }
  }
  function broadcast(event, flavour) {
    const frame = encodeFrame(event);
    for (const [socket, state] of connections) {
      if (flavour !== void 0 && state.flavour?.digest !== flavour)
        continue;
      if (socket.writable)
        socket.write(frame);
    }
  }
  async function handle(request, state, inFlight, emit) {
    const reply = (result) => ({ id: request.id, ok: true, result });
    const declared = state.flavour;
    if (!declared) {
      return {
        id: request.id,
        ok: false,
        error: "this session has not declared the environment its kernels need"
      };
    }
    const flavour = {
      ...declared,
      names: [.../* @__PURE__ */ new Set([...declared.names, ...declaredNames])]
    };
    try {
      const pool = await preparing;
      switch (request.op) {
        case "capabilities":
          return reply(await pool.run(flavour, async (c) => c.getServerCapabilities() ?? {}));
        // Drained inside the one slot, and answered as a complete list. A cursor
        // is paging state belonging to one kernel, and the pool hands out
        // whichever is free — so relaying a cursor could ask page 2 of a kernel
        // that never issued page 1. Nothing outside this process ever sees one.
        case "listTools":
          return reply({
            tools: await pool.run(flavour, (c) => drain(async (cursor) => {
              const page = await c.listTools(cursor ? { cursor } : void 0);
              return { items: page.tools ?? [], nextCursor: page.nextCursor };
            }))
          });
        case "listPrompts":
          return reply({
            prompts: await pool.run(flavour, (c) => drain(async (cursor) => {
              const page = await c.listPrompts(cursor ? { cursor } : void 0);
              return { items: page.prompts ?? [], nextCursor: page.nextCursor };
            }))
          });
        case "getPrompt":
          return reply(await pool.run(flavour, (c) => c.getPrompt(request.params)));
        case "listResources":
          return reply(await pool.run(flavour, (c) => c.listResources(request.params)));
        case "readResource":
          return reply(await pool.run(flavour, (c) => c.readResource(request.params)));
        case "callTool": {
          const controller = new AbortController();
          inFlight.set(request.id, controller);
          try {
            return reply(await pool.run(
              flavour,
              (c) => c.callTool(request.params, void 0, {
                // One that cannot fire first: unset, the SDK's 60 s
                // default cut every longer call (#34).
                timeout: CALL_REQUEST_TIMEOUT_MS,
                signal: controller.signal,
                onprogress: (progress) => emit({ event: "progress", target: request.id, progress }),
                // Measured: AgentTools never sends progress, so this only
                // ever fires for a kernel that is not the real one. Kept
                // because it costs nothing and the paclet may gain it.
                resetTimeoutOnProgress: true
              }),
              // The deadline belongs to the session, not to the SDK request:
              // see LocalBackend.callTool.
              { deadlineMs: request.timeoutMs ?? 3e5, signal: controller.signal }
            ));
          } finally {
            inFlight.delete(request.id);
          }
        }
        case "status":
          return reply({
            kernels: pool.size,
            busy: pool.busy,
            budget: pool.budget,
            licence: pool.licence,
            connections: connections.size,
            pid: process.pid
          });
        default:
          return { id: request.id, ok: false, error: `unknown broker op: ${String(request.op)}` };
      }
    } catch (err) {
      return {
        id: request.id,
        ok: false,
        error: errorText(err),
        ...err instanceof McpError ? { code: err.code } : {}
      };
    }
  }
  const onConnection = (socket) => {
    connections.set(socket, { flavour: null });
    if (emptyTimer) {
      clearTimeout(emptyTimer);
      emptyTimer = null;
    }
    log(`proxy connected (${connections.size} now attached)`);
    socket.setEncoding("utf8");
    const inFlight = /* @__PURE__ */ new Map();
    const state = connections.get(socket) ?? { flavour: null };
    const reader = new FrameReader((frame) => {
      const request = frame;
      if (typeof request?.id !== "number")
        return;
      if (request.op === "cancel") {
        const target = typeof request.target === "number" ? request.target : null;
        if (target !== null) {
          inFlight.get(target)?.abort(new Error("cancelled by the caller"));
        }
        return;
      }
      if (request.op === "hello") {
        const declared = readFlavour(request.params);
        if (declared) {
          for (const name of declared.names)
            declaredNames.add(name);
          state.flavour = declared;
          log(`a proxy declared environment ${declared.digest}`);
        }
        if (socket.writable) {
          socket.write(encodeFrame(declared ? { id: request.id, ok: true, result: { flavours: true, flavour: declared.digest } } : {
            id: request.id,
            ok: false,
            error: "hello needs the environment this session's kernels must be started with"
          }));
        }
        return;
      }
      if (request.op === "ready") {
        preparing.then(() => {
          if (socket.writable)
            socket.write(encodeFrame({ id: request.id, ok: true }));
        }, (err) => {
          if (socket.writable) {
            socket.write(encodeFrame({ id: request.id, ok: false, error: errorText(err) }));
          }
        });
        return;
      }
      if (request.op === "ping") {
        if (socket.writable)
          socket.write(encodeFrame({ id: request.id, ok: true }));
        return;
      }
      const emit = (frame2) => {
        if (socket.writable)
          socket.write(encodeFrame(frame2));
      };
      void handle(request, state, inFlight, emit).then((response) => {
        if (socket.writable)
          socket.write(encodeFrame(response));
      });
    });
    socket.on("data", (chunk) => reader.push(chunk));
    socket.on("error", () => socket.destroy());
    socket.on("close", () => {
      for (const controller of inFlight.values()) {
        controller.abort(new Error("the proxy disconnected"));
      }
      inFlight.clear();
      connections.delete(socket);
      log(`proxy disconnected (${connections.size} still attached)`);
      if (connections.size === 0)
        scheduleExit();
    });
  };
  function scheduleExit() {
    if (emptyTimer || stopping)
      return;
    emptyTimer = setTimeout(() => {
      if (connections.size > 0)
        return;
      log("no proxies attached, shutting down");
      void stop().then(() => process.exit(0));
    }, EMPTY_GRACE_MS);
    emptyTimer.unref?.();
  }
  async function stop() {
    if (stopping)
      return;
    stopping = true;
    const pool = await preparing.catch(() => null);
    broadcast({ event: "shuttingDown" });
    for (const socket of connections.keys())
      socket.destroy();
    await new Promise((resolve) => {
      if (server)
        server.close(() => resolve());
      else
        resolve();
    });
    await pool?.stop();
    if (process.platform !== "win32") {
      try {
        const here2 = statSync6(address);
        if (boundIdentity !== null && `${here2.dev}:${here2.ino}` !== boundIdentity) {
          log("a newer broker owns the socket; leaving it alone");
        } else {
          unlinkSync3(address);
        }
      } catch {
      }
    }
  }
  async function claimSocket() {
    for (let attempt = 1; attempt <= BIND_ATTEMPTS; attempt++) {
      const judged = socketIdentity(address);
      if (await socketIsLive(address)) {
        log("another broker is already listening; standing down");
        return null;
      }
      removeStaleSocket(address, judged, log);
      const candidate = createServer(onConnection);
      const previousMask = process.umask(511 & ~SOCKET_MODE);
      const bound = await new Promise((resolve) => {
        candidate.once("error", (err) => {
          log(`bind attempt ${attempt} failed: ${err.code ?? "?"} ${err.message}`);
          resolve(false);
        });
        candidate.listen(address, () => resolve(true));
      }).finally(() => {
        process.umask(previousMask);
      });
      if (bound)
        return candidate;
      candidate.close();
      if (attempt < BIND_ATTEMPTS)
        await jitter();
    }
    log(`gave up trying to bind ${address} after ${BIND_ATTEMPTS} attempts`);
    return null;
  }
  const fault = socketFault(address);
  if (fault) {
    log(`refusing to listen: ${fault}. Sessions will use private kernels until WOLFRAM_MCP_RUNTIME_DIR (or XDG_RUNTIME_DIR) names a directory only you can write to`);
    return null;
  }
  const server = await claimSocket();
  const listened = server !== null;
  if (!listened)
    return null;
  try {
    const bound = statSync6(address);
    boundIdentity = `${bound.dev}:${bound.ino}`;
  } catch {
    boundIdentity = null;
  }
  log(`broker listening on ${address} (pid ${process.pid})`);
  scheduleExit();
  process.on("SIGINT", () => void stop().then(() => process.exit(0)));
  process.on("SIGTERM", () => void stop().then(() => process.exit(0)));
  return { server, stop };
}
var EMPTY_GRACE_MS, MAX_PAGES2, declaredNames, BIND_ATTEMPTS, jitter;
var init_broker_server = __esm({
  "dist/broker-server.js"() {
    "use strict";
    init_types();
    init_pool();
    init_inspect();
    init_broker_protocol();
    init_flavour();
    init_kernel();
    init_log();
    EMPTY_GRACE_MS = 6e4;
    MAX_PAGES2 = 50;
    declaredNames = /* @__PURE__ */ new Set();
    BIND_ATTEMPTS = 4;
    jitter = () => new Promise((r) => setTimeout(r, 40 + Math.random() * 120));
  }
});

// node_modules/@modelcontextprotocol/sdk/dist/esm/server/stdio.js
import process3 from "node:process";

// node_modules/@modelcontextprotocol/sdk/dist/esm/shared/stdio.js
init_types();
var STDIO_DEFAULT_MAX_BUFFER_SIZE = 10 * 1024 * 1024;
var ReadBuffer = class {
  constructor(options) {
    this._maxBufferSize = options?.maxBufferSize ?? STDIO_DEFAULT_MAX_BUFFER_SIZE;
  }
  append(chunk) {
    const newSize = (this._buffer?.length ?? 0) + chunk.length;
    if (newSize > this._maxBufferSize) {
      this.clear();
      throw new Error(`ReadBuffer exceeded maximum size of ${this._maxBufferSize} bytes`);
    }
    this._buffer = this._buffer ? Buffer.concat([this._buffer, chunk]) : chunk;
  }
  readMessage() {
    if (!this._buffer) {
      return null;
    }
    const index = this._buffer.indexOf("\n");
    if (index === -1) {
      return null;
    }
    const line = this._buffer.toString("utf8", 0, index).replace(/\r$/, "");
    this._buffer = this._buffer.subarray(index + 1);
    return deserializeMessage(line);
  }
  clear() {
    this._buffer = void 0;
  }
};
function deserializeMessage(line) {
  return JSONRPCMessageSchema.parse(JSON.parse(line));
}
function serializeMessage(message) {
  return JSON.stringify(message) + "\n";
}

// node_modules/@modelcontextprotocol/sdk/dist/esm/server/stdio.js
var StdioServerTransport = class {
  constructor(_stdin = process3.stdin, _stdout = process3.stdout, options) {
    this._stdin = _stdin;
    this._stdout = _stdout;
    this._started = false;
    this._ondata = (chunk) => {
      try {
        this._readBuffer.append(chunk);
        this.processReadBuffer();
      } catch (error2) {
        this.onerror?.(error2);
        this.close().catch(() => {
        });
      }
    };
    this._onerror = (error2) => {
      this.onerror?.(error2);
    };
    this._readBuffer = new ReadBuffer({ maxBufferSize: options?.maxBufferSize });
  }
  /**
   * Starts listening for messages on stdin.
   */
  async start() {
    if (this._started) {
      throw new Error("StdioServerTransport already started! If using Server class, note that connect() calls start() automatically.");
    }
    this._started = true;
    this._stdin.on("data", this._ondata);
    this._stdin.on("error", this._onerror);
  }
  processReadBuffer() {
    while (true) {
      try {
        const message = this._readBuffer.readMessage();
        if (message === null) {
          break;
        }
        this.onmessage?.(message);
      } catch (error2) {
        this.onerror?.(error2);
      }
    }
  }
  async close() {
    this._stdin.off("data", this._ondata);
    this._stdin.off("error", this._onerror);
    const remainingDataListeners = this._stdin.listenerCount("data");
    if (remainingDataListeners === 0) {
      this._stdin.pause();
    }
    this._readBuffer.clear();
    this.onclose?.();
  }
  send(message) {
    return new Promise((resolve) => {
      const json = serializeMessage(message);
      if (this._stdout.write(json)) {
        resolve();
      } else {
        this._stdout.once("drain", resolve);
      }
    });
  }
};

// dist/index.js
init_backend();
init_cache();
init_config();
init_log();

// node_modules/@modelcontextprotocol/sdk/dist/esm/server/index.js
init_protocol();
init_types();
init_ajv_provider();
init_zod_compat();

// node_modules/@modelcontextprotocol/sdk/dist/esm/experimental/tasks/server.js
init_types();
var ExperimentalServerTasks = class {
  constructor(_server) {
    this._server = _server;
  }
  /**
   * Sends a request and returns an AsyncGenerator that yields response messages.
   * The generator is guaranteed to end with either a 'result' or 'error' message.
   *
   * This method provides streaming access to request processing, allowing you to
   * observe intermediate task status updates for task-augmented requests.
   *
   * @param request - The request to send
   * @param resultSchema - Zod schema for validating the result
   * @param options - Optional request options (timeout, signal, task creation params, etc.)
   * @returns AsyncGenerator that yields ResponseMessage objects
   *
   * @experimental
   */
  requestStream(request, resultSchema, options) {
    return this._server.requestStream(request, resultSchema, options);
  }
  /**
   * Sends a sampling request and returns an AsyncGenerator that yields response messages.
   * The generator is guaranteed to end with either a 'result' or 'error' message.
   *
   * For task-augmented requests, yields 'taskCreated' and 'taskStatus' messages
   * before the final result.
   *
   * @example
   * ```typescript
   * const stream = server.experimental.tasks.createMessageStream({
   *     messages: [{ role: 'user', content: { type: 'text', text: 'Hello' } }],
   *     maxTokens: 100
   * }, {
   *     onprogress: (progress) => {
   *         // Handle streaming tokens via progress notifications
   *         console.log('Progress:', progress.message);
   *     }
   * });
   *
   * for await (const message of stream) {
   *     switch (message.type) {
   *         case 'taskCreated':
   *             console.log('Task created:', message.task.taskId);
   *             break;
   *         case 'taskStatus':
   *             console.log('Task status:', message.task.status);
   *             break;
   *         case 'result':
   *             console.log('Final result:', message.result);
   *             break;
   *         case 'error':
   *             console.error('Error:', message.error);
   *             break;
   *     }
   * }
   * ```
   *
   * @param params - The sampling request parameters
   * @param options - Optional request options (timeout, signal, task creation params, onprogress, etc.)
   * @returns AsyncGenerator that yields ResponseMessage objects
   *
   * @experimental
   */
  createMessageStream(params, options) {
    const clientCapabilities = this._server.getClientCapabilities();
    if ((params.tools || params.toolChoice) && !clientCapabilities?.sampling?.tools) {
      throw new Error("Client does not support sampling tools capability.");
    }
    if (params.messages.length > 0) {
      const lastMessage = params.messages[params.messages.length - 1];
      const lastContent = Array.isArray(lastMessage.content) ? lastMessage.content : [lastMessage.content];
      const hasToolResults = lastContent.some((c) => c.type === "tool_result");
      const previousMessage = params.messages.length > 1 ? params.messages[params.messages.length - 2] : void 0;
      const previousContent = previousMessage ? Array.isArray(previousMessage.content) ? previousMessage.content : [previousMessage.content] : [];
      const hasPreviousToolUse = previousContent.some((c) => c.type === "tool_use");
      if (hasToolResults) {
        if (lastContent.some((c) => c.type !== "tool_result")) {
          throw new Error("The last message must contain only tool_result content if any is present");
        }
        if (!hasPreviousToolUse) {
          throw new Error("tool_result blocks are not matching any tool_use from the previous message");
        }
      }
      if (hasPreviousToolUse) {
        const toolUseIds = new Set(previousContent.filter((c) => c.type === "tool_use").map((c) => c.id));
        const toolResultIds = new Set(lastContent.filter((c) => c.type === "tool_result").map((c) => c.toolUseId));
        if (toolUseIds.size !== toolResultIds.size || ![...toolUseIds].every((id) => toolResultIds.has(id))) {
          throw new Error("ids of tool_result blocks and tool_use blocks from previous message do not match");
        }
      }
    }
    return this.requestStream({
      method: "sampling/createMessage",
      params
    }, CreateMessageResultSchema, options);
  }
  /**
   * Sends an elicitation request and returns an AsyncGenerator that yields response messages.
   * The generator is guaranteed to end with either a 'result' or 'error' message.
   *
   * For task-augmented requests (especially URL-based elicitation), yields 'taskCreated'
   * and 'taskStatus' messages before the final result.
   *
   * @example
   * ```typescript
   * const stream = server.experimental.tasks.elicitInputStream({
   *     mode: 'url',
   *     message: 'Please authenticate',
   *     elicitationId: 'auth-123',
   *     url: 'https://example.com/auth'
   * }, {
   *     task: { ttl: 300000 } // Task-augmented for long-running auth flow
   * });
   *
   * for await (const message of stream) {
   *     switch (message.type) {
   *         case 'taskCreated':
   *             console.log('Task created:', message.task.taskId);
   *             break;
   *         case 'taskStatus':
   *             console.log('Task status:', message.task.status);
   *             break;
   *         case 'result':
   *             console.log('User action:', message.result.action);
   *             break;
   *         case 'error':
   *             console.error('Error:', message.error);
   *             break;
   *     }
   * }
   * ```
   *
   * @param params - The elicitation request parameters
   * @param options - Optional request options (timeout, signal, task creation params, etc.)
   * @returns AsyncGenerator that yields ResponseMessage objects
   *
   * @experimental
   */
  elicitInputStream(params, options) {
    const clientCapabilities = this._server.getClientCapabilities();
    const mode = params.mode ?? "form";
    switch (mode) {
      case "url": {
        if (!clientCapabilities?.elicitation?.url) {
          throw new Error("Client does not support url elicitation.");
        }
        break;
      }
      case "form": {
        if (!clientCapabilities?.elicitation?.form) {
          throw new Error("Client does not support form elicitation.");
        }
        break;
      }
    }
    const normalizedParams = mode === "form" && params.mode === void 0 ? { ...params, mode: "form" } : params;
    return this.requestStream({
      method: "elicitation/create",
      params: normalizedParams
    }, ElicitResultSchema, options);
  }
  /**
   * Gets the current status of a task.
   *
   * @param taskId - The task identifier
   * @param options - Optional request options
   * @returns The task status
   *
   * @experimental
   */
  async getTask(taskId, options) {
    return this._server.getTask({ taskId }, options);
  }
  /**
   * Retrieves the result of a completed task.
   *
   * @param taskId - The task identifier
   * @param resultSchema - Zod schema for validating the result
   * @param options - Optional request options
   * @returns The task result
   *
   * @experimental
   */
  async getTaskResult(taskId, resultSchema, options) {
    return this._server.getTaskResult({ taskId }, resultSchema, options);
  }
  /**
   * Lists tasks with optional pagination.
   *
   * @param cursor - Optional pagination cursor
   * @param options - Optional request options
   * @returns List of tasks with optional next cursor
   *
   * @experimental
   */
  async listTasks(cursor, options) {
    return this._server.listTasks(cursor ? { cursor } : void 0, options);
  }
  /**
   * Cancels a running task.
   *
   * @param taskId - The task identifier
   * @param options - Optional request options
   *
   * @experimental
   */
  async cancelTask(taskId, options) {
    return this._server.cancelTask({ taskId }, options);
  }
};

// node_modules/@modelcontextprotocol/sdk/dist/esm/server/index.js
init_helpers();
var Server = class extends Protocol {
  /**
   * Initializes this server with the given name and version information.
   */
  constructor(_serverInfo, options) {
    super(options);
    this._serverInfo = _serverInfo;
    this._loggingLevels = /* @__PURE__ */ new Map();
    this.LOG_LEVEL_SEVERITY = new Map(LoggingLevelSchema.options.map((level, index) => [level, index]));
    this.isMessageIgnored = (level, sessionId) => {
      const currentLevel = this._loggingLevels.get(sessionId);
      return currentLevel ? this.LOG_LEVEL_SEVERITY.get(level) < this.LOG_LEVEL_SEVERITY.get(currentLevel) : false;
    };
    this._capabilities = options?.capabilities ?? {};
    this._instructions = options?.instructions;
    this._jsonSchemaValidator = options?.jsonSchemaValidator ?? new AjvJsonSchemaValidator();
    this.setRequestHandler(InitializeRequestSchema, (request) => this._oninitialize(request));
    this.setNotificationHandler(InitializedNotificationSchema, () => this.oninitialized?.());
    if (this._capabilities.logging) {
      this.setRequestHandler(SetLevelRequestSchema, async (request, extra) => {
        const transportSessionId = extra.sessionId || extra.requestInfo?.headers["mcp-session-id"] || void 0;
        const { level } = request.params;
        const parseResult = LoggingLevelSchema.safeParse(level);
        if (parseResult.success) {
          this._loggingLevels.set(transportSessionId, parseResult.data);
        }
        return {};
      });
    }
  }
  /**
   * Access experimental features.
   *
   * WARNING: These APIs are experimental and may change without notice.
   *
   * @experimental
   */
  get experimental() {
    if (!this._experimental) {
      this._experimental = {
        tasks: new ExperimentalServerTasks(this)
      };
    }
    return this._experimental;
  }
  /**
   * Registers new capabilities. This can only be called before connecting to a transport.
   *
   * The new capabilities will be merged with any existing capabilities previously given (e.g., at initialization).
   */
  registerCapabilities(capabilities) {
    if (this.transport) {
      throw new Error("Cannot register capabilities after connecting to transport");
    }
    this._capabilities = mergeCapabilities(this._capabilities, capabilities);
  }
  /**
   * Override request handler registration to enforce server-side validation for tools/call.
   */
  setRequestHandler(requestSchema, handler) {
    const shape = getObjectShape(requestSchema);
    const methodSchema = shape?.method;
    if (!methodSchema) {
      throw new Error("Schema is missing a method literal");
    }
    const methodValue = getLiteralValue(methodSchema);
    if (typeof methodValue !== "string") {
      throw new Error("Schema method literal must be a string");
    }
    const method = methodValue;
    if (method === "tools/call") {
      const wrappedHandler = async (request, extra) => {
        const validatedRequest = safeParse3(CallToolRequestSchema, request);
        if (!validatedRequest.success) {
          const errorMessage = validatedRequest.error instanceof Error ? validatedRequest.error.message : String(validatedRequest.error);
          throw new McpError(ErrorCode.InvalidParams, `Invalid tools/call request: ${errorMessage}`);
        }
        const { params } = validatedRequest.data;
        const result = await Promise.resolve(handler(request, extra));
        if (params.task) {
          const taskValidationResult = safeParse3(CreateTaskResultSchema, result);
          if (!taskValidationResult.success) {
            const errorMessage = taskValidationResult.error instanceof Error ? taskValidationResult.error.message : String(taskValidationResult.error);
            throw new McpError(ErrorCode.InvalidParams, `Invalid task creation result: ${errorMessage}`);
          }
          return taskValidationResult.data;
        }
        const validationResult = safeParse3(CallToolResultSchema, result);
        if (!validationResult.success) {
          const errorMessage = validationResult.error instanceof Error ? validationResult.error.message : String(validationResult.error);
          throw new McpError(ErrorCode.InvalidParams, `Invalid tools/call result: ${errorMessage}`);
        }
        return validationResult.data;
      };
      return super.setRequestHandler(requestSchema, wrappedHandler);
    }
    return super.setRequestHandler(requestSchema, handler);
  }
  assertCapabilityForMethod(method) {
    switch (method) {
      case "sampling/createMessage":
        if (!this._clientCapabilities?.sampling) {
          throw new Error(`Client does not support sampling (required for ${method})`);
        }
        break;
      case "elicitation/create":
        if (!this._clientCapabilities?.elicitation) {
          throw new Error(`Client does not support elicitation (required for ${method})`);
        }
        break;
      case "roots/list":
        if (!this._clientCapabilities?.roots) {
          throw new Error(`Client does not support listing roots (required for ${method})`);
        }
        break;
      case "ping":
        break;
    }
  }
  assertNotificationCapability(method) {
    switch (method) {
      case "notifications/message":
        if (!this._capabilities.logging) {
          throw new Error(`Server does not support logging (required for ${method})`);
        }
        break;
      case "notifications/resources/updated":
      case "notifications/resources/list_changed":
        if (!this._capabilities.resources) {
          throw new Error(`Server does not support notifying about resources (required for ${method})`);
        }
        break;
      case "notifications/tools/list_changed":
        if (!this._capabilities.tools) {
          throw new Error(`Server does not support notifying of tool list changes (required for ${method})`);
        }
        break;
      case "notifications/prompts/list_changed":
        if (!this._capabilities.prompts) {
          throw new Error(`Server does not support notifying of prompt list changes (required for ${method})`);
        }
        break;
      case "notifications/elicitation/complete":
        if (!this._clientCapabilities?.elicitation?.url) {
          throw new Error(`Client does not support URL elicitation (required for ${method})`);
        }
        break;
      case "notifications/cancelled":
        break;
      case "notifications/progress":
        break;
    }
  }
  assertRequestHandlerCapability(method) {
    if (!this._capabilities) {
      return;
    }
    switch (method) {
      case "completion/complete":
        if (!this._capabilities.completions) {
          throw new Error(`Server does not support completions (required for ${method})`);
        }
        break;
      case "logging/setLevel":
        if (!this._capabilities.logging) {
          throw new Error(`Server does not support logging (required for ${method})`);
        }
        break;
      case "prompts/get":
      case "prompts/list":
        if (!this._capabilities.prompts) {
          throw new Error(`Server does not support prompts (required for ${method})`);
        }
        break;
      case "resources/list":
      case "resources/templates/list":
      case "resources/read":
        if (!this._capabilities.resources) {
          throw new Error(`Server does not support resources (required for ${method})`);
        }
        break;
      case "tools/call":
      case "tools/list":
        if (!this._capabilities.tools) {
          throw new Error(`Server does not support tools (required for ${method})`);
        }
        break;
      case "tasks/get":
      case "tasks/list":
      case "tasks/result":
      case "tasks/cancel":
        if (!this._capabilities.tasks) {
          throw new Error(`Server does not support tasks capability (required for ${method})`);
        }
        break;
      case "ping":
      case "initialize":
        break;
    }
  }
  assertTaskCapability(method) {
    assertClientRequestTaskCapability(this._clientCapabilities?.tasks?.requests, method, "Client");
  }
  assertTaskHandlerCapability(method) {
    if (!this._capabilities) {
      return;
    }
    assertToolsCallTaskCapability(this._capabilities.tasks?.requests, method, "Server");
  }
  async _oninitialize(request) {
    const requestedVersion = request.params.protocolVersion;
    this._clientCapabilities = request.params.capabilities;
    this._clientVersion = request.params.clientInfo;
    const protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(requestedVersion) ? requestedVersion : LATEST_PROTOCOL_VERSION;
    return {
      protocolVersion,
      capabilities: this.getCapabilities(),
      serverInfo: this._serverInfo,
      ...this._instructions && { instructions: this._instructions }
    };
  }
  /**
   * After initialization has completed, this will be populated with the client's reported capabilities.
   */
  getClientCapabilities() {
    return this._clientCapabilities;
  }
  /**
   * After initialization has completed, this will be populated with information about the client's name and version.
   */
  getClientVersion() {
    return this._clientVersion;
  }
  getCapabilities() {
    return this._capabilities;
  }
  async ping() {
    return this.request({ method: "ping" }, EmptyResultSchema);
  }
  // Implementation
  async createMessage(params, options) {
    if (params.tools || params.toolChoice) {
      if (!this._clientCapabilities?.sampling?.tools) {
        throw new Error("Client does not support sampling tools capability.");
      }
    }
    if (params.messages.length > 0) {
      const lastMessage = params.messages[params.messages.length - 1];
      const lastContent = Array.isArray(lastMessage.content) ? lastMessage.content : [lastMessage.content];
      const hasToolResults = lastContent.some((c) => c.type === "tool_result");
      const previousMessage = params.messages.length > 1 ? params.messages[params.messages.length - 2] : void 0;
      const previousContent = previousMessage ? Array.isArray(previousMessage.content) ? previousMessage.content : [previousMessage.content] : [];
      const hasPreviousToolUse = previousContent.some((c) => c.type === "tool_use");
      if (hasToolResults) {
        if (lastContent.some((c) => c.type !== "tool_result")) {
          throw new Error("The last message must contain only tool_result content if any is present");
        }
        if (!hasPreviousToolUse) {
          throw new Error("tool_result blocks are not matching any tool_use from the previous message");
        }
      }
      if (hasPreviousToolUse) {
        const toolUseIds = new Set(previousContent.filter((c) => c.type === "tool_use").map((c) => c.id));
        const toolResultIds = new Set(lastContent.filter((c) => c.type === "tool_result").map((c) => c.toolUseId));
        if (toolUseIds.size !== toolResultIds.size || ![...toolUseIds].every((id) => toolResultIds.has(id))) {
          throw new Error("ids of tool_result blocks and tool_use blocks from previous message do not match");
        }
      }
    }
    if (params.tools) {
      return this.request({ method: "sampling/createMessage", params }, CreateMessageResultWithToolsSchema, options);
    }
    return this.request({ method: "sampling/createMessage", params }, CreateMessageResultSchema, options);
  }
  /**
   * Creates an elicitation request for the given parameters.
   * For backwards compatibility, `mode` may be omitted for form requests and will default to `'form'`.
   * @param params The parameters for the elicitation request.
   * @param options Optional request options.
   * @returns The result of the elicitation request.
   */
  async elicitInput(params, options) {
    const mode = params.mode ?? "form";
    switch (mode) {
      case "url": {
        if (!this._clientCapabilities?.elicitation?.url) {
          throw new Error("Client does not support url elicitation.");
        }
        const urlParams = params;
        return this.request({ method: "elicitation/create", params: urlParams }, ElicitResultSchema, options);
      }
      case "form": {
        if (!this._clientCapabilities?.elicitation?.form) {
          throw new Error("Client does not support form elicitation.");
        }
        const formParams = params.mode === "form" ? params : { ...params, mode: "form" };
        const result = await this.request({ method: "elicitation/create", params: formParams }, ElicitResultSchema, options);
        if (result.action === "accept" && result.content && formParams.requestedSchema) {
          try {
            const validator = this._jsonSchemaValidator.getValidator(formParams.requestedSchema);
            const validationResult = validator(result.content);
            if (!validationResult.valid) {
              throw new McpError(ErrorCode.InvalidParams, `Elicitation response content does not match requested schema: ${validationResult.errorMessage}`);
            }
          } catch (error2) {
            if (error2 instanceof McpError) {
              throw error2;
            }
            throw new McpError(ErrorCode.InternalError, `Error validating elicitation response: ${error2 instanceof Error ? error2.message : String(error2)}`);
          }
        }
        return result;
      }
    }
  }
  /**
   * Creates a reusable callback that, when invoked, will send a `notifications/elicitation/complete`
   * notification for the specified elicitation ID.
   *
   * @param elicitationId The ID of the elicitation to mark as complete.
   * @param options Optional notification options. Useful when the completion notification should be related to a prior request.
   * @returns A function that emits the completion notification when awaited.
   */
  createElicitationCompletionNotifier(elicitationId, options) {
    if (!this._clientCapabilities?.elicitation?.url) {
      throw new Error("Client does not support URL elicitation (required for notifications/elicitation/complete)");
    }
    return () => this.notification({
      method: "notifications/elicitation/complete",
      params: {
        elicitationId
      }
    }, options);
  }
  async listRoots(params, options) {
    return this.request({ method: "roots/list", params }, ListRootsResultSchema, options);
  }
  /**
   * Sends a logging message to the client, if connected.
   * Note: You only need to send the parameters object, not the entire JSON RPC message
   * @see LoggingMessageNotification
   * @param params
   * @param sessionId optional for stateless and backward compatibility
   */
  async sendLoggingMessage(params, sessionId) {
    if (this._capabilities.logging) {
      if (!this.isMessageIgnored(params.level, sessionId)) {
        return this.notification({ method: "notifications/message", params });
      }
    }
  }
  async sendResourceUpdated(params) {
    return this.notification({
      method: "notifications/resources/updated",
      params
    });
  }
  async sendResourceListChanged() {
    return this.notification({
      method: "notifications/resources/list_changed"
    });
  }
  async sendToolListChanged() {
    return this.notification({ method: "notifications/tools/list_changed" });
  }
  async sendPromptListChanged() {
    return this.notification({ method: "notifications/prompts/list_changed" });
  }
};

// dist/proxy.js
init_types();
init_cache();
init_config();
init_doctor();
init_prepare();
init_inspect();
init_locate();
init_log();
init_version();
var MAX_PAGES = 50;
var PROTOCOL_ERRORS = /* @__PURE__ */ new Set([
  ErrorCode.ParseError,
  ErrorCode.InvalidRequest,
  ErrorCode.MethodNotFound,
  ErrorCode.InvalidParams
]);
async function drainTools(ops) {
  const tools = [];
  let cursor;
  for (let page = 0; page < MAX_PAGES; page++) {
    const result = await ops.listTools(cursor);
    tools.push(...result.tools ?? []);
    cursor = result.nextCursor;
    if (!cursor)
      break;
  }
  return tools;
}
async function drainPrompts(ops) {
  const prompts = [];
  let cursor;
  for (let page = 0; page < MAX_PAGES; page++) {
    const result = await ops.listPrompts(cursor);
    prompts.push(...result.prompts ?? []);
    cursor = result.nextCursor;
    if (!cursor)
      break;
  }
  return prompts;
}
var KERNEL_TIME_CONSTRAINT_S = 60;
var TIME_CONSTRAINT_HEADROOM_MS = 3e4;
function evaluationCeilingMs(configuredMs, args) {
  const requested = Number(args?.["timeConstraint"]);
  const ceiling = Number.isNaN(requested) || requested <= 0 ? configuredMs : Math.max(configuredMs, requested * 1e3 + TIME_CONSTRAINT_HEADROOM_MS);
  return Math.min(MAX_TIME_MS, ceiling);
}
function relayable(err) {
  const relayed = new Error(bareMcpText(err.code, err.message));
  return Object.assign(relayed, {
    code: err.code,
    ...err.data === void 0 ? {} : { data: err.data }
  });
}
var STATUS_TOOL = {
  name: "wolfram_status",
  title: "Wolfram Status",
  description: "Report what this server can see: the selected kernel, the Wolfram/AgentTools paclet, the Wolfram Account, the licence, and where its logs go. Starts no kernel, so it answers even when kernels cannot start.",
  inputSchema: { type: "object", properties: {} },
  annotations: { readOnlyHint: true }
};
function describeToolList(config2, cache, age) {
  if (!cache)
    return "not cached; the next list starts a kernel";
  if (!config2.cacheEnabled)
    return `${cache.tools.length} tools, in memory (WOLFRAM_MCP_CACHE=0)`;
  return `${cache.tools.length} tools, cached ${age}`;
}
async function describeSharing(config2, install, backend) {
  const inUse = backend.kind === "deferred" ? backend.resolved ?? null : backend;
  if (inUse?.kind === "local") {
    return "on \u2014 but this session runs a private kernel; the server log says why sharing was declined";
  }
  const ceilingMs = 1e3;
  const report = async (broker) => {
    try {
      const status = await broker.status(ceilingMs);
      const others = Math.max(0, status.connections - 1);
      return `on \u2014 broker pid ${status.pid}, ${others} other session(s) attached, ${status.kernels} kernel(s) running, ${status.busy} busy, budget ${status.budget}`;
    } catch (err) {
      return `on \u2014 the broker did not answer: ${errorText(err)}`;
    }
  };
  if (inUse?.kind === "broker")
    return report(inUse);
  const { brokerLaunch: brokerLaunch2 } = await Promise.resolve().then(() => (init_backend(), backend_exports));
  const { BrokerBackend: Client2 } = await Promise.resolve().then(() => (init_broker_client(), broker_client_exports));
  let declined = null;
  const attaching = Client2.attachIfRunning(brokerLaunch2(config2, install, (message) => declined = message)).catch(() => null);
  let timer;
  const expired = /* @__PURE__ */ Symbol("expired");
  const outcome = await Promise.race([
    attaching,
    new Promise((resolve) => {
      timer = setTimeout(() => resolve(expired), ceilingMs);
      timer.unref?.();
    })
  ]);
  clearTimeout(timer);
  if (outcome === expired) {
    void attaching.then((late) => late?.stop());
    return `on \u2014 a broker is listening but did not answer within ${ceilingMs / 1e3}s`;
  }
  if (!outcome) {
    return declined === null ? "on \u2014 no broker running yet; the first tool call starts one" : `on \u2014 ${String(declined)}`;
  }
  try {
    return await report(outcome);
  } finally {
    await outcome.stop();
  }
}
function describeStatus(config2, install, cache, backoff = null, sharing = null) {
  if (!install)
    return describeMissingKernel(config2);
  const facts = config2.inspect ? readFacts(install.bin) : null;
  const age = cache ? `${Math.round((Date.now() - cache.cachedAt) / 6e4)} min ago` : null;
  const lines = [
    `${PKG.name} ${PKG.version}`,
    "",
    `kernel      ${install.bin}`,
    `            ${install.version ?? "version unknown"}, via ${install.source}`
  ];
  if (!config2.inspect) {
    lines.push("facts       not used (WOLFRAM_MCP_INSPECT=0)");
  } else if (!facts) {
    lines.push("facts       unknown yet: every kernel reports them as it starts");
  } else {
    lines.push(`facts       cached from a kernel ${Math.round((Date.now() - facts.probedAt) / 6e4)} min ago, refreshed by every kernel start`, `AgentTools  ${facts.agentTools ?? "absent \u2014 every tool call will fail to load it"}`, `account     ${facts.wolframID ?? "not signed in \u2014 cloud-backed tools will fail on their own"}`, `licence     ${facts.maxLicenseProcesses} seat(s)${facts.licenseType ? ` (${facts.licenseType})` : ""}`);
  }
  if (backoff) {
    lines.push(`preparing   the last attempt failed; retried in ${formatWait(backoff.remainingMs)}` + // The same pointer the failed call gave: for a server that would not
    // start, the server, not the installation.
    (backoff.advice ? `; ${backoff.advice}` : `, or as soon as the installation changes`), `            ${backoff.reason}`);
  }
  lines.push(`sharing     ${config2.share ? sharing ?? "on \u2014 kernels are shared with other sessions" : "off \u2014 this session has its own kernel"}`, `tool list   ${describeToolList(config2, cache, age)}`, `logs        ${process.env["WOLFRAM_MCP_LOG"] ?? "stderr, captured by your MCP client"}`, `timeouts    start ${config2.startTimeoutMs / 1e3}s, call ${config2.callTimeoutMs / 1e3}s, idle ${config2.idleMs / 6e4} min`, `evaluation  the evaluator stops itself at ${KERNEL_TIME_CONSTRAINT_S}s unless MCP_TOOL_OPTIONS or a timeConstraint argument says otherwise`, `            past the call timeout this server stops waiting but leaves the kernel running, so a long call keeps its session`);
  return lines.join("\n");
}
function describeMissingKernel(config2) {
  const hint = exampleKernelPath();
  const unfiltered = listKernels();
  const seen = unfiltered.length ? unfiltered.map((k) => `${k.bin} (${k.version ?? "unknown"})`).join("\n  ") : "none";
  return [
    `No usable Wolfram installation was found.`,
    ``,
    `platform:         ${process.platform}`,
    `minimum version:  ${config2.minVersion}`,
    `configured path:  ${config2.kernelPath ?? "(unset, auto-detecting)"}`,
    ``,
    `Installs seen without the version filter:`,
    `  ${seen}`,
    ``,
    `Set WOLFRAM_MCP_KERNEL to the installation or kernel executable, for example:`,
    `  WOLFRAM_MCP_KERNEL=${hint}`,
    ``,
    `Wolfram/AgentTools requires kernel ${config2.minVersion} or newer.`,
    // Never `npx wolfram-mcp-server doctor`: this package is not published.
    // doctor is also the one thing that asks wolframscript, which a session
    // never does — so an installation only it knows about is found there.
    `For a full report, and to find an installation only wolframscript knows`,
    `about, run ${doctorCommand()}.`
  ].join("\n");
}
function createWolframServer(config2, log, makeBackend) {
  const install = locateKernel({
    override: config2.kernelPath,
    version: config2.version,
    minVersion: config2.minVersion,
    log,
    allowWolframScript: false
  });
  const key = cacheKey(install?.bin ?? "", install?.version ?? null, config2.serverName, config2.flavour.digest);
  const usableCache = install && config2.cacheEnabled ? readCache(key) : null;
  const upstream = usableCache?.upstream ?? {
    prompts: false,
    resources: false
  };
  const capabilities = { tools: { listChanged: true } };
  if (install && upstream.prompts)
    capabilities.prompts = { listChanged: true };
  if (install && upstream.resources)
    capabilities.resources = {};
  const server = new Server({ name: PKG.name, version: PKG.version }, { capabilities });
  if (!install) {
    log("no usable Wolfram installation found; serving diagnostics only");
    server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [STATUS_TOOL] }));
    server.setRequestHandler(CallToolRequestSchema, async () => ({
      isError: true,
      // Re-scanned on every call, so installing Wolfram and asking again works.
      content: [{ type: "text", text: describeMissingKernel(config2) }]
    }));
    return { server, install: null, stop: async () => {
    } };
  }
  log(`kernel: ${install.bin} (version=${install.version ?? "unknown"}, via ${install.source})`);
  if (config2.callTimeoutMs < KERNEL_TIME_CONSTRAINT_S * 1e3) {
    log(`call timeout is ${config2.callTimeoutMs / 1e3}s, below the evaluator's default ${KERNEL_TIME_CONSTRAINT_S}s time constraint: this server will stop waiting first, so a slow evaluation is reported here rather than ending in the kernel's own "time constraint exceeded", which says more. The kernel is left running either way`);
  }
  log(`profile=${config2.serverName} idle=${config2.idleMs / 6e4}min cache=${usableCache ? "hit" : "miss"}`);
  const backend = makeBackend(install);
  let toolCache = usableCache?.tools ?? null;
  let promptCache = usableCache?.prompts ?? null;
  let toolCachedAt = usableCache?.cachedAt ?? null;
  async function reload(ops) {
    const caps = await ops.capabilities();
    let tools;
    try {
      tools = await drainTools(ops);
    } catch (err) {
      log(`upstream tools/list failed, keeping the cached list: ${errorText(err)}`);
      return;
    }
    if (tools.length === 0) {
      log("upstream reported no tools; not caching an empty list");
      return;
    }
    let prompts = promptCache ?? [];
    if (caps.prompts) {
      try {
        prompts = await drainPrompts(ops);
      } catch (err) {
        log(`upstream prompts/list failed, keeping the cached list: ${errorText(err)}`);
      }
    }
    const toolsChanged = JSON.stringify(tools) !== JSON.stringify(toolCache);
    const promptsChanged = JSON.stringify(prompts) !== JSON.stringify(promptCache);
    toolCache = tools;
    promptCache = prompts;
    toolCachedAt = Date.now();
    if (config2.cacheEnabled) {
      const observed = {
        prompts: Boolean(caps.prompts),
        resources: Boolean(caps.resources)
      };
      writeCache({ ...key, upstream: observed, tools, prompts });
    }
    if (toolsChanged) {
      log(`upstream tool list changed (${tools.length} tools)`);
      void server.sendToolListChanged().catch(() => {
      });
    }
    if (promptsChanged && capabilities.prompts) {
      log(`upstream prompt list changed (${prompts.length} prompts)`);
      void server.sendPromptListChanged().catch(() => {
      });
    }
  }
  backend.onKernelReady((ops) => reload(ops));
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    if (toolCache) {
      log(`tools/list served from cache (${toolCache.length} tools), kernel not started`);
      return { tools: [...toolCache, STATUS_TOOL] };
    }
    const live = await backend.listTools();
    return { tools: [...live.tools ?? [], STATUS_TOOL] };
  });
  server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
    const { name, arguments: args } = request.params;
    if (name === STATUS_TOOL.name) {
      const served = toolCache && toolCachedAt !== null ? { tools: toolCache, cachedAt: toolCachedAt } : null;
      return {
        content: [
          {
            type: "text",
            text: describeStatus(config2, install, served, backend.backoff?.() ?? null, config2.share && install ? await describeSharing(config2, install, backend) : null)
          }
        ]
      };
    }
    try {
      const progressToken = request.params._meta?.progressToken;
      const timeoutMs = evaluationCeilingMs(config2.callTimeoutMs, args);
      let relayed = Promise.resolve();
      const result = await backend.callTool({ name, arguments: args ?? {} }, {
        timeoutMs,
        signal: extra.signal,
        ...progressToken === void 0 ? {} : {
          onprogress: (progress) => {
            relayed = relayed.then(() => extra.sendNotification({
              method: "notifications/progress",
              params: { ...progress, progressToken }
            })).catch(() => {
            });
          }
        }
      });
      await relayed;
      return result;
    } catch (err) {
      if (err instanceof McpError && PROTOCOL_ERRORS.has(err.code)) {
        log(`tools/call ${name} rejected upstream: ${err.message}`);
        throw relayable(err);
      }
      log(`tools/call ${name} failed: ${errorText(err)}`);
      return {
        isError: true,
        content: [{ type: "text", text: `Wolfram kernel error: ${errorText(err)}` }]
      };
    }
  });
  if (capabilities.prompts) {
    server.setRequestHandler(ListPromptsRequestSchema, async () => {
      if (promptCache)
        return { prompts: promptCache };
      return backend.listPrompts();
    });
    server.setRequestHandler(GetPromptRequestSchema, async (request) => backend.getPrompt(request.params));
  }
  if (capabilities.resources) {
    server.setRequestHandler(ListResourcesRequestSchema, async (request) => backend.listResources(request.params));
    server.setRequestHandler(ReadResourceRequestSchema, async (request) => backend.readResource(request.params));
  }
  return {
    server,
    install,
    stop: () => backend.stop()
  };
}

// dist/index.js
init_version();
var HELP = `
${PKG.name} ${PKG.version}
${PKG.description ?? ""}

Usage
  wolfram-mcp-server              speak MCP over stdio (default)
  wolfram-mcp-server doctor       report what this machine looks like
  wolfram-mcp-server broker       run the shared kernel broker in the foreground
                                  (normally started automatically, detached)
  wolfram-mcp-server lsp          speak LSP over stdio: Wolfram's LSPServer on
                                  the discovered kernel, taking a licence seat;
                                  on by default, and WOLFRAM_MCP_LSP=0 answers
                                  the handshake with no capabilities instead,
                                  starting no kernel
  wolfram-mcp-server session-status
                                  what the caches say about this machine, for a
                                  session-start hook; starts no kernel
  wolfram-mcp-server clear-cache  forget the cached tool list and kernel facts
  wolfram-mcp-server --version
  wolfram-mcp-server --help

Client configuration
  Not published to a registry, so name the clone. Absolute path, because an MCP
  client does not guarantee the working directory it launches a server from:

  {
    "mcpServers": {
      "wolfram": {
        "command": "node",
        "args": ["/absolute/path/to/wolfram-agent-tools/dist/index.js"]
      }
    }
  }

  Run 'npm install' in the clone first \u2014 that builds dist/ via prepare.

Environment
  MCP_SERVER_NAME                    which AgentTools server to expose. Built in:
                                     Wolfram | WolframLanguage | WolframAlpha |
                                     WolframPacletDevelopment  (default: Wolfram)
                                     Or name your own server, or a paclet's
                                     Publisher/Server; the name is passed to the
                                     kernel as given.
                                     Alias: WOLFRAM_MCP_SERVER_NAME
  WOLFRAM_MCP_DEFAULT_SERVER         the server to use when neither name above is
                                     set; how a packager picks a default without
                                     overriding a user's explicit choice
  WOLFRAM_MCP_KERNEL                 installation or kernel executable to use
                                     (default: auto-detect the newest install)
                                     Alias: WOLFRAM_KERNEL_PATH
  WOLFRAM_MCP_VERSION                pin auto-detection to this version, as a
                                     dotted prefix: 14.3 selects 14.3.0,
                                     15 selects the newest 15.x
  WOLFRAM_MCP_MIN_VERSION            ignore older installs when auto-detecting
                                     (default: 14.3, the AgentTools minimum)
  WOLFRAM_MCP_IDLE_MINUTES           shut the kernel down after this long idle,
                                     0 to keep it resident  (default: 10)
  WOLFRAM_MCP_START_TIMEOUT_SECONDS  one deadline for everything before a kernel
                                     takes its first request: inspection, the
                                     broker's preparation, the handshake. A
                                     failed preparation is not retried for 10
                                     minutes, or until the binary changes
                                     (default: 120)
  WOLFRAM_MCP_CALL_TIMEOUT_SECONDS   give up on a single evaluation
                                     (default: 300)
  WOLFRAM_MCP_CACHE                  0 to always ask a kernel for the tool list
                                     (default: 1)
  WOLFRAM_MCP_SHARE                  0 to keep a private kernel instead of
                                     sharing one with other sessions
                                     (default: 1)
  WOLFRAM_MCP_RUNTIME_DIR            directory for the shared broker's socket; it
                                     must be yours and writable by no one else
                                     (default: XDG_RUNTIME_DIR, else a private
                                     directory under the cache)
  WOLFRAM_MCP_MAX_KERNELS            cap on pooled kernels. Default is derived
                                     from the licence: $MaxLicenseProcesses
                                     minus the reserve
  WOLFRAM_MCP_LICENSE_LIMIT          what the licence permits, if you would
                                     rather say than have us look: a positive
                                     integer, or "unlimited"
  WOLFRAM_MCP_INSPECT                0 to ignore what kernels report about the
                                     installation and stay at a single kernel
                                     (default: 1)
  WOLFRAM_MCP_RESERVE_SEATS          licence seats to leave free for interactive
                                     use, so agents cannot lock you out of
                                     Mathematica  (default: 1)
  WOLFRAM_MCP_LOG                    file for the broker to write its log to. It
                                     is started detached with its output
                                     discarded, so without this it is the one
                                     component nobody can watch
  WOLFRAM_MCP_LSP                    0 to keep the LSP kernel off, which takes a
                                     licence seat once a Wolfram Language file
                                     is open; 1 to run it, whatever the
                                     plugin's lsp option says (default: on)
  WOLFRAM_MCP_KERNEL_ENV             extra variable names, comma-separated, that
                                     your own MCP server reads. Sessions that
                                     disagree about one stop sharing a kernel;
                                     the variables AgentTools itself reads are
                                     already accounted for

Wolfram's own installation directories (WOLFRAM_BASE, WOLFRAM_USERBASE,
WOLFRAM_LOCALBASE) are honoured when set, and otherwise filled in from what
an earlier kernel reported, matching the configuration Wolfram's own
InstallMCPServer writes.

Requires a licensed Wolfram installation (Mathematica, Wolfram Desktop, or
Wolfram Engine) of at least version 14.3, which supplies the Wolfram/AgentTools
paclet this server drives. Not affiliated with Wolfram Research.
`.trimStart();
async function serve() {
  const log = createLogger("wolfram-mcp");
  const config2 = loadConfig(log);
  const { server, stop } = createWolframServer(config2, log, (install) => deferredBackend(config2, install, log));
  let stopping = false;
  const shutdown = async (reason) => {
    if (stopping)
      return;
    stopping = true;
    log(`shutting down (${reason})`);
    await stop().catch(() => {
    });
    await server.close().catch(() => {
    });
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.stdin.on("close", () => void shutdown("stdin closed"));
  process.stdout.on("error", () => {
  });
  process.stderr.on("error", () => {
  });
  process.on("unhandledRejection", (err) => log(`unhandled rejection: ${errorText(err)}`));
  process.on("uncaughtException", (err) => {
    try {
      log(`fatal: ${errorText(err)}`);
    } catch {
    }
    process.exit(1);
  });
  await server.connect(new StdioServerTransport());
  log("ready (kernel not yet started)");
}
async function main(argv) {
  const command = argv[0];
  switch (command) {
    case void 0:
      await serve();
      return null;
    case "doctor": {
      const { runDoctor: runDoctor2 } = await Promise.resolve().then(() => (init_doctor(), doctor_exports));
      return runDoctor2();
    }
    case "session-status": {
      const { sessionStatus: sessionStatus2 } = await Promise.resolve().then(() => (init_doctor(), doctor_exports));
      const { recordLspOption: recordLspOption2 } = await Promise.resolve().then(() => (init_lsp(), lsp_exports));
      recordLspOption2();
      process.stdout.write(`${sessionStatus2()}
`);
      return 0;
    }
    case "lsp": {
      const { runLsp: runLsp2 } = await Promise.resolve().then(() => (init_lsp(), lsp_exports));
      return runLsp2();
    }
    case "broker": {
      const log = createLogger("wolfram-broker", { timestamps: true });
      const config2 = loadConfig(log);
      const flag = (name) => {
        const at = argv.indexOf(name);
        return at === -1 ? void 0 : argv[at + 1];
      };
      const { locateKernel: locateKernel2 } = await Promise.resolve().then(() => (init_locate(), locate_exports));
      const kernel = flag("--kernel");
      const install = kernel ? { bin: kernel, version: null, source: "broker argument" } : locateKernel2({
        override: config2.kernelPath,
        version: config2.version,
        minVersion: config2.minVersion,
        log
      });
      if (!install) {
        log("no usable Wolfram installation; nothing to broker");
        return 1;
      }
      const { brokerAddress: addressFor } = await Promise.resolve().then(() => (init_broker_protocol(), broker_protocol_exports));
      const { startBroker: startBroker2 } = await Promise.resolve().then(() => (init_broker_server(), broker_server_exports));
      const running = await startBroker2({
        address: flag("--address") ?? addressFor(install.bin),
        bin: install.bin,
        serverName: config2.serverName,
        idleMs: config2.idleMs,
        startTimeoutMs: config2.startTimeoutMs,
        maxKernels: config2.maxKernels,
        reserveSeats: config2.reserveSeats,
        licenceOverride: config2.licenseLimit,
        allowInspect: config2.inspect,
        clientInfo: { name: `${PKG.name}-broker`, version: PKG.version },
        log
      });
      return running ? null : 0;
    }
    case "clear-cache": {
      const { clearFacts: clearFacts2 } = await Promise.resolve().then(() => (init_inspect(), inspect_exports));
      const capabilities = clearCache();
      const facts = clearFacts2();
      process.stdout.write(`removed ${capabilities}
`);
      process.stdout.write(`removed ${facts}
`);
      return 0;
    }
    case "--help":
    case "-h":
    case "help":
      process.stdout.write(HELP);
      return 0;
    case "--version":
    case "-v":
      process.stdout.write(`${PKG.version}
`);
      return 0;
    default:
      process.stderr.write(`unknown command: ${command}

${HELP}`);
      return 2;
  }
}
var code = await main(process.argv.slice(2));
if (code !== null)
  process.exit(code);
