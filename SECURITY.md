# Security

What this server exposes, what protects it, and what does not. It covers macOS and Linux;
the Windows gaps are in [`docs/plan.md`](docs/plan.md) §9 and are not covered here.

## What an attacker would get

`WolframLanguageEvaluator` runs whatever Wolfram Language it is handed, as you, with your
permissions and no sandbox. Wolfram Language is general purpose: it reads and writes files,
starts processes, and makes network requests. Anyone who can reach this server can do all of
that as you, and can read every variable in the environment your MCP client was launched with
— tokens and credentials from a shell profile included.

That is not a flaw to be fixed. It is what the tool is for, and it is why the ways in are worth
being precise about.

## The two ways in

**Your MCP client, over stdio.** A subprocess of your client, talking on its stdin and stdout.
Whoever controls the client controls this. There is no boundary here and there cannot be one.

**The broker socket.** A unix domain socket that other sessions connect to in order to share a
kernel, so that N sessions cost one licence seat rather than N. Its frames carry no
authentication: anything that connects and speaks the protocol can ask for an evaluation. The
boundary is therefore the operating system's, and it is made of two things.

### The socket is created 0600

Only its owner can connect. This is done with a `umask` around `bind` rather than a `chmod`
afterwards, for two reasons: between bind and chmod the socket would be connectable by anyone,
and an over-long address is truncated by `bind`, so the path a chmod would name is not always
the path that exists.

This is what stands in for the peer-uid check that would otherwise belong here. Node exposes no
peer credentials on a unix socket — no `getpeereid`, no `SO_PEERCRED` — so that check cannot be
written in this codebase, and having the kernel refuse the connection outright is stronger than
a check performed after accepting it.

### The directory must be private

0600 stops another user connecting. It cannot stop one arriving first. The socket's path is
derived from public facts — a hash of the protocol version, the package version, the kernel
binary and your uid — so anyone who can write to the directory can bind that exact path before
the broker does, and every session that connects afterwards hands its evaluations to whatever
answered. The sticky bit does not help: it prevents deleting somebody else's file, not creating
one that does not exist yet.

So the directory holding the socket must exist, be yours, and not be writable by group or
other. `tmpdir()` on macOS satisfies this — it is a per-user `/var/folders/…/T` at mode 0700 —
and so does the `XDG_RUNTIME_DIR` systemd sets on Linux, a `/run/user/<uid>` of the same shape.
Setting `XDG_RUNTIME_DIR` to somewhere world-writable such as `/tmp` does not, and sharing is
declined with the reason logged; each session then uses its own kernel, at the cost of a licence
seat. Group- and world-*readable* are fine: reading a directory does not let anyone connect to a
0600 socket.

A refusal can arrive on a machine where you never set `XDG_RUNTIME_DIR`: on macOS with
`TMPDIR` unset — a plain `ssh` session is the common case — and on Linux without systemd's pam
session, a container being the common case, `tmpdir()` falls back to `/tmp`, which fails this
check by design (measured: refused as belonging to root, before its mode is even considered).
The log line names what is wrong and the remedy: point `XDG_RUNTIME_DIR` at a directory that
exists, is yours, and is not writable by anyone else, and sharing resumes.

## What is deliberately not protected

**Anything running as you.** A same-uid process can connect to the socket and evaluate whatever
it likes. This is the same boundary as your shell: a process running as you can already read
your files and start `wolfram` itself. Defending against it would mean authenticating peers that
have every credential you do.

**The kernel's environment.** The kernel inherits this server's environment, which is the one
your client launched it with. See "What this lets a model do" in [`README.md`](README.md).

**The path above the directory.** The check examines the directory holding the socket — not
every component above it — it follows symlinks, and there is a moment between the check and the
connect or bind that trusts it. A world-writable, non-sticky parent, or a symlink component an
attacker can repoint, defeats all of it. Reaching any of these means `XDG_RUNTIME_DIR` pointing
through territory somebody else controls: the check exists to catch the common misconfiguration,
not to make a hostile path safe.

**An address past the OS limit.** `bind` silently truncates an over-long socket path, so the
socket lands at the truncated name while the directory check examined the untruncated one — in
that case the directory guarantee is void, though the socket itself is still 0600. It takes a
runtime directory whose own path nearly fills the limit to get there, and refusing on length was
tried and reverted ([`docs/plan.md`](docs/plan.md) §5.2): `connect` truncates identically, so
sharing still works, and the refusal traded a working degraded case for none.

**Anything on Windows.** The named-pipe namespace has no uid in it, and the collision that
follows is recorded in `docs/plan.md` §9. Treat the sharing boundary there as unimplemented.

## If that is more than you want

Set `WOLFRAM_MCP_SHARE=0` and no socket is created at all — each session gets a private kernel,
at one licence seat each. Or run your client as a user with less access, keep secrets out of the
environment you launch it from, or point `MCP_SERVER_NAME` at a server of your own with a
narrower set of tools. [`docs/environment.md`](docs/environment.md) has all three.

## Reporting

Report a vulnerability privately, through GitHub's private vulnerability reporting — the
repository's Security tab → *Report a vulnerability*, which opens an advisory only maintainers
can see — rather than in a public issue: anything that reaches the broker socket can run
code as its owner, so a way past the boundary above is worth keeping quiet until it is fixed.
