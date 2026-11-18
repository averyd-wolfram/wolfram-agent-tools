/**
 * Newline-delimited lines out of a stream, none longer than a cap.
 *
 * The one splitter behind a kernel's stdout (`transport.ts`) and the broker's
 * socket (`FrameReader`). Each had its own, and the fixes to one did not
 * reach the other (#186, #200).
 */
export class CappedLines {
  /**
   * The line so far, as the chunks it came in. Each chunk is searched for a
   * newline once and joined only when a line ends: appended to one string and
   * searched from its start, a line near the cap cost seconds of the event loop
   * every other connection shares.
   */
  #pieces: string[] = [];
  #held = 0;
  /**
   * A line being dropped for its length: how long it has run, how it began and
   * how it has ended so far. Nothing else of it is kept, so the cap holds while
   * it runs on.
   */
  #dropping: { length: number; head: string; tail: string } | null = null;

  /**
   * @param cap the longest line kept, in characters. It bounds what a peer that
   * never sends a newline can make this process hold.
   * @param onDropped told of each line dropped for its length, with its first
   * and last characters, which say what kind of line it was and are no log's to
   * keep. Told as it ends or the stream does, `ended`, with its whole length
   * however the stream was split. A line that runs past the cap before its
   * newline is told of then too, with the length so far, since it may never end.
   */
  constructor(
    private readonly cap: number,
    private readonly onLine: (line: string) => void,
    private readonly onDropped: (
      length: number,
      ends: { head: string; tail: string },
      ended: boolean,
    ) => void,
  ) {}

  push(chunk: string): void {
    let from = 0;
    for (let end; (end = chunk.indexOf("\n", from)) !== -1; from = end + 1) {
      this.#end(chunk.slice(from, end));
    }
    if (from < chunk.length) this.#hold(chunk.slice(from));
  }

  /** What is held with no newline after it, taken as the stream ends: its last line. */
  take(): string {
    if (this.#dropping) {
      this.#end("");
      return "";
    }
    const tail = this.#pieces.join("");
    this.#pieces = [];
    this.#held = 0;
    return tail;
  }

  /** Part of a line whose newline has not come. */
  #hold(piece: string): void {
    const dropping = this.#dropping;
    if (dropping) {
      dropping.length += piece.length;
      dropping.tail = (dropping.tail + piece).slice(-ENDS);
      return;
    }
    this.#pieces.push(piece);
    this.#held += piece.length;
    // After the lines ahead of it are taken: dropping the whole buffer took one
    // that arrived in the same chunk with it. The rest is dropped as it arrives,
    // since its tail read at that newline would pass for a line of its own.
    if (this.#held <= this.cap) return;
    const line = { length: this.#held, ...this.#ends() };
    this.#dropping = line;
    this.onDropped(line.length, line, false);
  }

  /** The last part of a line, its newline come. */
  #end(piece: string): void {
    const dropping = this.#dropping;
    if (dropping) {
      this.#dropping = null;
      const tail = (dropping.tail + piece).slice(-ENDS);
      this.onDropped(dropping.length + piece.length, { head: dropping.head, tail }, true);
      return;
    }
    const length = this.#held + piece.length;
    // Ended or not, a line over the cap is dropped: let through when its
    // newline came in the chunk that crossed the cap, and dropped when it came
    // in the next, it was read or not by how the stream was split.
    if (length > this.cap) {
      this.#pieces.push(piece);
      this.onDropped(length, this.#ends(), true);
      return;
    }
    const line = this.#pieces.length > 0 ? this.#pieces.join("") + piece : piece;
    this.#pieces = [];
    this.#held = 0;
    this.onLine(line);
  }

  /**
   * The first and last characters of the line held, and the line let go:
   * taken from the pieces, so neither keeps the whole of a long line alive.
   */
  #ends(): { head: string; tail: string } {
    let head = "";
    for (const piece of this.#pieces) {
      head += piece.slice(0, ENDS - head.length);
      if (head.length >= ENDS) break;
    }
    let tail = "";
    for (let i = this.#pieces.length - 1; i >= 0 && tail.length < ENDS; i--) {
      tail = (this.#pieces[i] ?? "").slice(-(ENDS - tail.length)) + tail;
    }
    this.#pieces = [];
    this.#held = 0;
    return { head, tail };
  }
}

/** How much of each end of a dropped line its report sees: enough for a reply's id. */
const ENDS = 128;
