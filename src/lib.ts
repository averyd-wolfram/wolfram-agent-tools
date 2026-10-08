/**
 * Programmatic entry point, for embedding this proxy in another Node process
 * instead of launching it as a subprocess.
 *
 *   import {
 *     createWolframServer, deferredBackend, loadConfig, silentLogger,
 *   } from "wolfram-mcp-server";
 *
 *   const config = loadConfig(silentLogger);
 *   const { server } = createWolframServer(config, silentLogger, (install) =>
 *     deferredBackend(config, install, silentLogger),
 *   );
 *   await server.connect(myTransport);
 *
 * The third argument is how the server gets a kernel. `deferredBackend` is
 * exactly what the CLI uses — a shared broker when one can be reached, a
 * private kernel otherwise, deferred until the first request that needs one,
 * under one preparation deadline and backing off from a failed one
 * (`prepare.ts`). Build your own from `DeferredBackend` and `createBackend`
 * only to change that policy, and pass the factory's `deadline` through.
 */
export { createWolframServer, evaluationCeilingMs, type WolframServer } from "./proxy.js";
export {
  loadConfig,
  resolveServerName,
  knownCapabilitiesFor,
  DEFAULT_MIN_VERSION,
  DEFAULT_SERVER_NAME,
  MAX_TIME_MS,
  MCP_SERVERS,
  type Config,
  type UpstreamCapabilities,
} from "./config.js";
export { kernelFlavour, FLAVOUR_VARS, FLAVOUR_VARS_ENV, type KernelFlavour } from "./flavour.js";
export {
  locateKernel,
  listKernels,
  exampleKernelPath,
  resolveKernelBinary,
  compareVersions,
  type KernelInstall,
  type LocateOptions,
} from "./locate.js";
export {
  KernelSession,
  KERNEL_ARGS,
  PACLET_KERNEL_ARGS,
  ServerNotResolved,
  isServerNotResolved,
  type KernelSessionOptions,
} from "./kernel.js";
export {
  createBackend,
  brokerLaunch,
  deferredBackend,
  DeferredBackend,
  LocalBackend,
  type DirectOps,
  type KernelBackend,
  type KernelReadyHandler,
} from "./backend.js";
export {
  KernelPool,
  deriveBudget,
  HARD_KERNEL_CAP,
  UNLIMITED_BUDGET,
  type KernelPoolOptions,
  type LicenceInfo,
} from "./pool.js";
export {
  clearFacts,
  installationEnv,
  parseFacts,
  readFacts,
  recordFacts,
  baseDirectoryEnv,
  type KernelFacts,
} from "./inspect.js";
export { versionMatches } from "./locate.js";
export { lspDecision, type LspDecision } from "./lsp.js";
export {
  Backoff,
  Deadline,
  PreparationStopped,
  PreparationTimeout,
  PREPARATION_BACKOFF_MS,
  type BackoffState,
} from "./prepare.js";
export {
  preferredKernel,
  readConfiguration,
  configurationFiles,
  type PreferredKernel,
  type WolframScriptConfig,
} from "./wolframscript.js";
export { BrokerBackend, brokerCeilingMs, type BrokerClientOptions } from "./broker-client.js";
export { startBroker, type BrokerOptions } from "./broker-server.js";
export { brokerAddress, socketFault, BROKER_PROTOCOL } from "./broker-protocol.js";
export { FilteringStdioTransport, type FilteringStdioTransportOptions } from "./transport.js";
export {
  cacheKey,
  capabilityFile,
  capabilityDir,
  cacheDir,
  clearCache,
  readCache,
  writeCache,
  cacheMatches,
  type CacheEntry,
} from "./cache.js";
export { createLogger, silentLogger, errorText, type Logger } from "./log.js";
export { budgetText, waitText } from "./duration.js";
export { PKG } from "./version.js";
// Re-exported so tests and embedders can subscribe without depending on the SDK
// layout directly.
export {
  PromptListChangedNotificationSchema,
  ToolListChangedNotificationSchema,
} from "@modelcontextprotocol/sdk/types.js";
