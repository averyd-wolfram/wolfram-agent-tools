/**
 * Newline-delimited lines out of a stream, none longer than a cap.
 *
 * The one splitter behind a kernel's stdout (`transport.ts`) and the broker's
 * socket (`FrameReader`). Each had its own, and the fixes to one did not
 * reach the other (#186, #200).
 */
export class CappedLines {
  #buffer = "";
  /**
   * A line being dropped for its length: how long it has run so far, and how it
   * began. Nothing of it is kept, so the cap holds while it runs on.
   */
  #dropping: { length: number; head: string } | null = null;

  /**
   * @param cap the longest line kept, in characters. It bounds what a peer that
   * never sends a newline can make this process hold.
   * @param onDropped told of each line dropped for its length, with its first
   * characters, which say what kind of line it was and are no log's to keep.
   * Told as it ends or the stream does, `ended`, with its whole length however
   * the stream was split. A line that runs past the cap before its newline is
   * told of then too, with the length so far, since it may never end.
   */
  constructor(
    private readonly cap: number,
    private readonly onLine: (line: string) => void,
    private readonly onDropped: (length: number, head: string, ended: boolean) => void,
  ) {}

  push(chunk: string): void {
    let rest = chunk;
    if (this.#dropping) {
      const end = rest.indexOf("\n");
      if (end === -1) {
        this.#dropping.length += rest.length;
        return;
      }
      this.#dropped(end);
      rest = rest.slice(end + 1);
    }
    this.#buffer += rest;
    let index: number;
    while ((index = this.#buffer.indexOf("\n")) !== -1) {
      const line = this.#buffer.slice(0, index);
      this.#buffer = this.#buffer.slice(index + 1);
      // Ended or not, a line over the cap is dropped: let through when its
      // newline came in the chunk that crossed the cap, and dropped when it
      // came in the next, it was read or not by how the stream was split.
      if (index > this.cap) this.onDropped(index, line.slice(0, HEAD), true);
      else this.onLine(line);
    }
    // After the lines ahead of it are taken: dropping the whole buffer took one
    // that arrived in the same chunk with it. The rest is dropped as it arrives,
    // since its tail read at that newline would pass for a line of its own.
    if (this.#buffer.length > this.cap) {
      const dropping = { length: this.#buffer.length, head: this.#buffer.slice(0, HEAD) };
      this.#dropping = dropping;
      this.#buffer = "";
      this.onDropped(dropping.length, dropping.head, false);
    }
  }

  /** What is held with no newline after it, taken as the stream ends: its last line. */
  take(): string {
    if (this.#dropping) this.#dropped(0);
    const tail = this.#buffer;
    this.#buffer = "";
    return tail;
  }

  #dropped(more: number): void {
    const { length, head } = this.#dropping ?? { length: 0, head: "" };
    this.#dropping = null;
    this.onDropped(length + more, head, true);
  }
}

/** How much of a dropped line its report sees: enough for a JSON-RPC reply's id. */
const HEAD = 128;
