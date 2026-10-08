# Changelog

## [0.1.5](https://github.com/averyd-wolfram/wolfram-agent-tools/compare/v0.1.4...v0.1.5) (2026-10-08)


### Bug Fixes

* list a kernel's tools without compiling their output schemas, so one that won't compile can't hide the rest ([#68](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/68)) ([136b59f](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/136b59f1d4a8524cda8864c2b4cb8b28a213bdf0))

## [0.1.4](https://github.com/averyd-wolfram/wolfram-agent-tools/compare/v0.1.3...v0.1.4) (2026-10-08)


### Bug Fixes

* give every kernel request this server's deadline, so a prompt longer than a minute is answered ([#63](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/63)) ([edb0346](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/edb03461f465989eea579a5d90b1db7360780fbc))
* hold a time at each timer it reaches, so one from an option or the socket can't fire at once ([#67](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/67)) ([b63099b](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/b63099bf934159ad6cbf49ac4ed876d9784fff08))
* ignore a numeric setting written with a unit, and say so, rather than misread it ([#66](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/66)) ([26cdfa8](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/26cdfa8a90d66c7e21e1b2d57769854bb5cbb79f))
* relay a kernel's error on every request with its prefix once, as tools/call does ([#65](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/65)) ([6231705](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/62317052435c38e92e02ef94c93bb3c2756779f6))

## [0.1.3](https://github.com/averyd-wolfram/wolfram-agent-tools/compare/v0.1.2...v0.1.3) (2026-10-06)


### Bug Fixes

* **deps:** Bump @modelcontextprotocol/sdk from 1.30.0 to 1.31.0 ([#53](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/53)) ([f47eaa7](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/f47eaa7b5f1660575aa6b5ffea5f0d5d25635fac))

## [0.1.2](https://github.com/averyd-wolfram/wolfram-agent-tools/compare/v0.1.1...v0.1.2) (2026-10-06)


### Bug Fixes

* bound a kernel's handshake by the start timeout, not the MCP SDK's 60s default ([#14](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/14)) ([5e78259](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/5e78259c24cf013a7e0980ca6eec0d612844a74a))
* fail a server that will not start at once, and back off for seconds rather than ten minutes ([#18](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/18)) ([5ae701a](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/5ae701a7da37d8ec30331a0fad33c3fb9e43c755))
* give the SDK a call timeout that cannot fire first, so a call longer than a minute is answered ([#37](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/37)) ([5673e95](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/5673e9518cde0d6c2b74029fb819ce53496b9e44))
* hand on a start deadline's remainder from one read of the clock, so a spent one starts nothing ([#21](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/21)) ([485a0ea](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/485a0eac439b933c59d2fbee8d96e8f7ff764bdc))
* hold each time setting to 24 days, so one too long for a timer no longer fires at once ([#28](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/28)) ([6c4b04d](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/6c4b04d951ae31408ce3eebfb0f0eca9bb3f6aeb))
* say a start's budgets truthfully, in sentences, and that a refused start never began ([#30](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/30)) ([dcb2d6f](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/dcb2d6fe3f1be5a9041379d8633995c0a1bad4af))
* update five advised production dependencies, among them fast-uri, which the bundle inlines ([#27](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/27)) ([d17034e](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/d17034e2b1697a5c55b2b88bf07ea9b01c283a92))

## [0.1.1](https://github.com/averyd-wolfram/wolfram-agent-tools/compare/v0.1.0...v0.1.1) (2026-10-06)


### Bug Fixes

* report a handshake that runs out of the start deadline as the deadline, whatever the clocks say ([#8](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/8)) ([18f5a72](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/18f5a72e3cdbab64933a926e96aff635bd33a95f))

## 0.1.0 (2026-10-05)


### Features

* wolfram agent tools, an MCP server and Claude Code plugin over a local kernel ([41d9365](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/41d9365f21d2f0c6b0c429993a7766eeed8cb9ae))
