# Changelog

## [0.2.1](https://github.com/averyd-wolfram/wolfram-agent-tools/compare/v0.2.0...v0.2.1) (2026-11-10)


### Bug Fixes

* **deps:** Bump @modelcontextprotocol/sdk from 1.32.1 to 1.32.2 ([#171](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/171)) ([3f0e439](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/3f0e439460f30080c64230dfe7a8c770ed415685))

## [0.2.0](https://github.com/averyd-wolfram/wolfram-agent-tools/compare/v0.1.12...v0.2.0) (2026-11-10)


### Features

* clear-cache --server &lt;name&gt; forgets one server's cached tool lists ([#161](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/161)) ([a098d48](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/a098d48a9662f62c1a369a711490c6c47ea225fd))


### Bug Fixes

* drop the pid from a broker's staging name, so a short address near the limit is still linked into place ([#164](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/164)) ([18549b0](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/18549b0140a82527e90529b325b2a0032cea2326))

## [0.1.12](https://github.com/averyd-wolfram/wolfram-agent-tools/compare/v0.1.11...v0.1.12) (2026-11-09)


### Bug Fixes

* say a kernel swapped out after its server's paclets changed went for that, not for another environment ([#160](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/160)) ([0f1689f](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/0f1689ff4a2666f29ab168b36d3e0dbbcc3fbbfe))
* serve and cache what the installed paclets declare now, not what a kernel loaded before an upgrade ([#158](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/158)) ([12f28e8](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/12f28e8d65d7931b5ce02d6aa904282ef3822bb2))

## [0.1.11](https://github.com/averyd-wolfram/wolfram-agent-tools/compare/v0.1.10...v0.1.11) (2026-11-07)


### Bug Fixes

* relay what a kernel lists and answers as it sent it, for the client to judge ([#155](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/155)) ([92ad977](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/92ad9776ec0efd9c78115699a1a9ee74abca8853))
* say a first start may be fetching AgentTools' databases when it times out, and what to raise ([#157](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/157)) ([e7b1187](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/e7b11875203968fc6bd5fb2d5f226565d9b21752))

## [0.1.10](https://github.com/averyd-wolfram/wolfram-agent-tools/compare/v0.1.9...v0.1.10) (2026-11-06)


### Bug Fixes

* count a request's ceiling from its arrival on a broker too, and never send one its caller was answered for ([#152](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/152)) ([6fde447](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/6fde447cbea91e4747a8354266d581b7dc38badf))
* count a request's ceiling from its arrival on a private kernel, and never send one its caller was answered for ([#151](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/151)) ([8178165](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/81781650ceb85bb2b74edd30db0d37dc0dd04634))
* give the lists read after a kernel starts this server's deadline, rather than the SDK's minute that forgets them ([#149](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/149)) ([ae561a0](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/ae561a0aba7062b62beb901d4a7d9f471dd7e762))
* name a broker request's whole ceiling when it runs out, while still counting it from the arrival ([#154](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/154)) ([5873236](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/587323678f651166993d2e903095adb1cb4a2417))

## [0.1.9](https://github.com/averyd-wolfram/wolfram-agent-tools/compare/v0.1.8...v0.1.9) (2026-11-06)


### Bug Fixes

* back off a failed kernel preparation by what failed, rather than ten minutes for every timeout ([#144](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/144)) ([4e7fdc2](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/4e7fdc22a0d969394e1494d285820cac9287fa01))
* back off any failed kernel start in the broker's pool, rather than only a server name that did not resolve ([#146](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/146)) ([a0b8252](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/a0b82522428bc62215a337fb8b2eaff50875ceb6))
* end the kernel's input after the client's exit, and stop a kernel that still does not go ([#148](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/148)) ([25d6cb7](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/25d6cb7e05ffd538cb18e9818a224a6cf2fba7c8))
* hold a request on its own flavour rather than evict for an unproven start, or refuse what its busy kernel will serve ([#147](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/147)) ([85d901b](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/85d901b304499580c5b842092c331f15f1feca45))


### Refactoring

* decide the pool's tier in one place, so acquire and the waiter drain cannot drift apart ([#142](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/142)) ([6e0145b](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/6e0145bfcf5f8e1bc8eacd839b49b723e928df4a))

## [0.1.8](https://github.com/averyd-wolfram/wolfram-agent-tools/compare/v0.1.7...v0.1.8) (2026-11-05)


### Bug Fixes

* broadcast a new kernel's tools though its prompt list fails, rather than lose them with it ([#126](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/126)) ([b784ae2](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/b784ae24f79c173de86f1cfe83154b7893431ba2))
* **deps:** Bump @hono/node-server from 2.1.1 to 2.1.6 ([#138](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/138)) ([b1fc427](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/b1fc427d1383b3ddca9858e1e2f52fa5937bd996))
* **deps:** Bump body-parser from 2.3.0 to 2.4.0 ([#136](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/136)) ([04e41ce](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/04e41ce72b5c1d54080ee3b38d020447c51e0016))
* **deps:** Bump fast-uri from 3.1.8 to 3.1.9 ([#134](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/134)) ([1b1fea1](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/1b1fea163fb64a551db2e573987fd028be18e2d8))
* **deps:** Bump ip-address from 10.7.3 to 10.7.5 ([#135](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/135)) ([0473752](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/0473752a83abb79a271b62a95fe09cfc6bb4ca1f))
* **deps:** Bump zod from 4.4.3 to 4.6.7 ([#137](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/137)) ([592990c](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/592990c44e668633a59a10944925f1006a122a7a))
* leave the Wolfram Account out of a starting kernel's facts, rather than sign every kernel in and crash where credentials can't be read ([#139](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/139)) ([836d61b](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/836d61b5a0c53668a108dc75551d4257ffee7400))

## [0.1.7](https://github.com/averyd-wolfram/wolfram-agent-tools/compare/v0.1.6...v0.1.7) (2026-10-18)


### Bug Fixes

* give up a leaving broker that stops answering, though a call on it has no ceiling ([#124](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/124)) ([3b052c6](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/3b052c699d7ab04cee3bd8fffb2f7a1af05dccc4))
* let a broker that is leaving answer the calls already on it, though the session chose again ([#110](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/110)) ([224a68c](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/224a68c23ef48b1c6bfbdbf28c46964ffc6692c9))
* let a flavour's idle kernel serve inside the pool's refusal window, and report the window ([#113](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/113)) ([ce0990c](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/ce0990c2fe70377d1a75e338f4cecbe2bea59516))
* refuse a broker address too long for a socket path, rather than bind it truncated ([#108](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/108)) ([daae61f](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/daae61fd2fa11c7e1297201e9335e2c314a0f17a))
* relay a prompt or resource list with a malformed item, rather than lose the whole list ([#121](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/121)) ([30577db](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/30577dbc04fe92d310e3a8bd790d546ec663be3f))
* relay a tool list whose schemas are not objects, rather than lose the whole list ([#116](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/116)) ([29a97b9](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/29a97b969e7016eb17017dafe15f22d573d45a89))
* report the kernels a broker has running, not every slot in its pool ([#120](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/120)) ([459a319](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/459a319033a24355c90a9f01c08ecd0d652a2d1a))

## [0.1.6](https://github.com/averyd-wolfram/wolfram-agent-tools/compare/v0.1.5...v0.1.6) (2026-10-17)


### Bug Fixes

* **deps:** Bump @modelcontextprotocol/sdk from 1.31.0 to 1.32.1 ([#93](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/93)) ([908243d](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/908243d80ab2e0263d50bd03f2ade721df283ebb))
* read a version or a bundle out of a path in linear time, not quadratic ([#99](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/99)) ([2d06191](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/2d06191149497a4d3d16c38702e6ac3b71f4bf3f))

## [0.1.5](https://github.com/averyd-wolfram/wolfram-agent-tools/compare/v0.1.4...v0.1.5) (2026-10-09)


### Bug Fixes

* fail a call in flight when its broker stops, rather than wait out its ceiling ([#77](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/77)) ([26a3251](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/26a3251f6607e8a8c3728edffa950da2e139144f))
* give up a broker only when it stops answering, not when one request runs out ([#79](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/79)) ([81c25e7](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/81c25e73053bb8e8664b873e8098d0c68c8c669e))
* leave when another broker holds the address, and never take a successor's socket on the way out ([#73](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/73)) ([5b8d60b](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/5b8d60b7b81c707db90aad5739fede7a9c3ec225))
* list a kernel's tools without compiling their output schemas, so one that won't compile can't hide the rest ([#68](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/68)) ([136b59f](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/136b59f1d4a8524cda8864c2b4cb8b28a213bdf0))
* say every duration one way, in units that fit it, a budget rounded down and a wait up ([#71](https://github.com/averyd-wolfram/wolfram-agent-tools/issues/71)) ([3a6448f](https://github.com/averyd-wolfram/wolfram-agent-tools/commit/3a6448fea9e9ae9e8891dc04ca028866d6b1c541))

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
