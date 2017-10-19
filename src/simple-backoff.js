export class Backoff {
  constructor(opts) {
    opts = opts || {};

    var min = parseInt(opts.min, 10),
      max = parseInt(opts.max, 10),
      jitter = parseFloat(opts.jitter);

    this.min = !isNaN(min) ? min : 10;
    this.max = !isNaN(max) ? max : 10 * 1000;
    this.jitter = !isNaN(jitter) && jitter > 0 && jitter <= 1 ? jitter : 0;

    this.reset();
  }

  next() {
    if (this.jitter) {
      var spread = this._spread() * this.jitter;
      this.cur += Math.random() * spread - spread / 2;
    }

    this.cur = Math.max(0, Math.min(this.max, Math.floor(this.cur)));

    var cur = this.cur;

    this._step();
    return cur;
  }

  reset() {
    this._reset();
  }
}

export class LinearBackoff extends Backoff {
  constructor(opts) {
    super(opts);
    opts = opts || {};
    Backoff.call(this, opts);
    var step = parseInt(opts.step, 10);
    this.step = !isNaN(step) && step > 0 ? step : 50;
  }

  _spread() {
    return this.step;
  }

  _step() {
    this.cur = this.cur + this.step;
  }

  _reset() {
    this.cur = this.min;
  }
}

export class FibonacciBackoff extends Backoff {
  constructor(opts) {
    super(opts);
    opts = opts || {};
    Backoff.call(this, opts);
    this.last = 0;
  }

  _spread() {
    return this.cur === this.last ? this.cur : this.cur - this.last;
  }

  _step() {
    var next = this.last + this.cur;
    if (next === 0) {
      next = 1;
    }
    this.last = this.cur;
    this.cur = next;
  }

  _reset() {
    this.cur = this.min;
    this.last = 0;
  }
}

export class ExponentialBackoff extends Backoff {
  constructor(opts) {
    super(opts);
    opts = opts || {};
    Backoff.call(this, opts);
    var factor = parseFloat(opts.factor);
    this.factor = !isNaN(factor) && factor > 1 ? factor : 2;
  }

  _spread() {
    return this.cur - this.cur / this.factor;
  }

  _step() {
    if (this.cur === 0) {
      this.cur = 1;
    } else {
      this.cur *= this.factor;
    }
  }

  _reset() {
    this.cur = this.min;
  }
}
