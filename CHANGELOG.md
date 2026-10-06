# Changelog

## [0.1.2](https://github.com/averyd-wolfram/wolfram-agent-tools/compare/v0.1.1...v0.1.2) (2026-10-06)


### Bug Fixes

* bound a kernel's handshake by the start timeout, not the MCP SDK's 60s default ([#14](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/14)) ([5e78259](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/5e78259c24cf013a7e0980ca6eec0d612844a74a))
* fail a server that will not start at once, and back off for seconds rather than ten minutes ([#18](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/18)) ([5ae701a](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/5ae701a7da37d8ec30331a0fad33c3fb9e43c755))

## [0.1.1](https://github.com/averyd-wolfram/wolfram-agent-tools/compare/v0.1.0...v0.1.1) (2026-10-06)


### Bug Fixes

* report a handshake that runs out of the start deadline as the deadline, whatever the clocks say ([#8](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/8)) ([18f5a72](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/18f5a72e3cdbab64933a926e96aff635bd33a95f))

## 0.1.0 (2026-10-05)


### Features

* wolfram agent tools, an MCP server and Claude Code plugin over a local kernel ([41d9365](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/41d9365f21d2f0c6b0c429993a7766eeed8cb9ae))
