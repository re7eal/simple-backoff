"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Backoff = exports.Backoff = function () {
  function Backoff(opts) {
    _classCallCheck(this, Backoff);

    opts = opts || {};

    var min = parseInt(opts.min, 10),
        max = parseInt(opts.max, 10),
        jitter = parseFloat(opts.jitter);

    this.min = !isNaN(min) ? min : 10;
    this.max = !isNaN(max) ? max : 10 * 1000;
    this.jitter = !isNaN(jitter) && jitter > 0 && jitter <= 1 ? jitter : 0;

    this.reset();
  }

  _createClass(Backoff, [{
    key: "next",
    value: function next() {
      if (this.jitter) {
        var spread = this._spread() * this.jitter;
        this.cur += Math.random() * spread - spread / 2;
      }

      this.cur = Math.max(0, Math.min(this.max, Math.floor(this.cur)));

      var cur = this.cur;

      this._step();
      return cur;
    }
  }, {
    key: "reset",
    value: function reset() {
      this._reset();
    }
  }]);

  return Backoff;
}();

var LinearBackoff = exports.LinearBackoff = function (_Backoff) {
  _inherits(LinearBackoff, _Backoff);

  function LinearBackoff(opts) {
    _classCallCheck(this, LinearBackoff);

    var _this = _possibleConstructorReturn(this, (LinearBackoff.__proto__ || Object.getPrototypeOf(LinearBackoff)).call(this, opts));

    opts = opts || {};
    Backoff.call(_this, opts);
    var step = parseInt(opts.step, 10);
    _this.step = !isNaN(step) && step > 0 ? step : 50;
    return _this;
  }

  _createClass(LinearBackoff, [{
    key: "_spread",
    value: function _spread() {
      return this.step;
    }
  }, {
    key: "_step",
    value: function _step() {
      this.cur = this.cur + this.step;
    }
  }, {
    key: "_reset",
    value: function _reset() {
      this.cur = this.min;
    }
  }]);

  return LinearBackoff;
}(Backoff);

var FibonacciBackoff = exports.FibonacciBackoff = function (_Backoff2) {
  _inherits(FibonacciBackoff, _Backoff2);

  function FibonacciBackoff(opts) {
    _classCallCheck(this, FibonacciBackoff);

    var _this2 = _possibleConstructorReturn(this, (FibonacciBackoff.__proto__ || Object.getPrototypeOf(FibonacciBackoff)).call(this, opts));

    opts = opts || {};
    Backoff.call(_this2, opts);
    _this2.last = 0;
    return _this2;
  }

  _createClass(FibonacciBackoff, [{
    key: "_spread",
    value: function _spread() {
      return this.cur === this.last ? this.cur : this.cur - this.last;
    }
  }, {
    key: "_step",
    value: function _step() {
      var next = this.last + this.cur;
      if (next === 0) {
        next = 1;
      }
      this.last = this.cur;
      this.cur = next;
    }
  }, {
    key: "_reset",
    value: function _reset() {
      this.cur = this.min;
      this.last = 0;
    }
  }]);

  return FibonacciBackoff;
}(Backoff);

var ExponentialBackoff = exports.ExponentialBackoff = function (_Backoff3) {
  _inherits(ExponentialBackoff, _Backoff3);

  function ExponentialBackoff(opts) {
    _classCallCheck(this, ExponentialBackoff);

    var _this3 = _possibleConstructorReturn(this, (ExponentialBackoff.__proto__ || Object.getPrototypeOf(ExponentialBackoff)).call(this, opts));

    opts = opts || {};
    Backoff.call(_this3, opts);
    var factor = parseFloat(opts.factor);
    _this3.factor = !isNaN(factor) && factor > 1 ? factor : 2;
    return _this3;
  }

  _createClass(ExponentialBackoff, [{
    key: "_spread",
    value: function _spread() {
      return this.cur - this.cur / this.factor;
    }
  }, {
    key: "_step",
    value: function _step() {
      if (this.cur === 0) {
        this.cur = 1;
      } else {
        this.cur *= this.factor;
      }
    }
  }, {
    key: "_reset",
    value: function _reset() {
      this.cur = this.min;
    }
  }]);

  return ExponentialBackoff;
}(Backoff);