# wolfram 0.1.3, the latest release

This branch is written by the release workflow, never by hand. It holds the
`wolfram` Claude Code plugin from the newest release of
[wolfram-agent-tools](https://github.com/averyd-wolfram/wolfram-agent-tools) —
`plugin/` is exactly that release's `wolfram-plugin-0.1.3.zip` — as a
marketplace named `wolfram-agent-tools`. It moves only after a release's assets are
published and verified, and only forward.

To follow every release in a project, commit this to its `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "wolfram-agent-tools": {
      "source": {
        "source": "github",
        "repo": "averyd-wolfram/wolfram-agent-tools",
        "ref": "release"
      },
      "autoUpdate": true
    }
  },
  "enabledPlugins": {
    "wolfram@wolfram-agent-tools": true
  }
}
```

To stay on one version, use its tag as the `ref` instead, without `autoUpdate`:
`"ref": "wolfram--v0.1.3"`.
