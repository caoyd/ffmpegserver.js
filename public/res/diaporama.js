/**
 * diaporama 1.5.2
 * Gaëtan Renaudeau <renaudeau.gaetan@gmail.com> – https://github.com/gre/diaporama
 */
! function (t) {
  if ("object" == typeof exports && "undefined" != typeof module) module.exports = t();
  else if ("function" == typeof define && define.amd) define([], t);
  else {
    var e;
    e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, e.Diaporama = t()
  }
}(function () {
  var t;
  return function e(t, r, n) {
    function i(a, o) {
      if (!r[a]) {
        if (!t[a]) {
          var u = "function" == typeof require && require;
          if (!o && u) return u(a, !0);
          if (s) return s(a, !0);
          var h = new Error("Cannot find module '" + a + "'");
          throw h.code = "MODULE_NOT_FOUND", h
        }
        var f = r[a] = {
          exports: {}
        };
        t[a][0].call(f.exports, function (e) {
          var r = t[a][1][e];
          return i(r ? r : e)
        }, f, f.exports, e, t, r, n)
      }
      return r[a].exports
    }
    for (var s = "function" == typeof require && require, a = 0; a < n.length; a++) i(n[a]);
    return i
  }({
    1: [function (t, e, r) {
      e.exports = t("./lib/Diaporama")
    }, {
      "./lib/Diaporama": 3
    }],
    2: [function (t, e, r) {
      e.exports = {
        TRANSITION: 0,
        KENBURNS: [1, 2, 3],
        CANVAS2D: [4, 5, 6],
        sort: function (t, e) {
          return t - e
        }
      }
    }, {}],
    3: [function (t, e, r) {
      function n(t, e) {
        return p.sort(t[1].channel, e[1].channel)
      }

      function i(t) {
        if (u || (u = new y), t) {
          if ("webgl" === t || "canvas" === t) return u.supported() ? "webgl" : null
        } else t = u.supported() ? "webgl" : "dom";
        return t
      }

      function s(t, e, r) {
        switch (r) {
          case "webgl":
            return new g(t, e);
          case "dom":
            return new _(t, e)
        }
        return null
      }

      function a(t, e, r, n, i) {
        var s = T(r / n) + r * i / (e - t);
        return t + (e - t) * Math.max(0, Math.min(s, 1))
      }

      function o(t, e, r) {
        if (!(this instanceof o)) return new o(t, e, r);
        if (!t || !t.nodeType) throw new Error("Diaporama: a DOM container is required.");
        if (e && !r && e.data && (r = e, e = null), r || (r = {}), this._runningSegments = [], this._renderingMode = i(r.renderingMode), !this._renderingMode) throw new Error("No rendering is suitable for renderingMode=" + r.renderingMode);
        this._rendering = s(t, r.backgroundColor || this._backgroundColor, this._renderingMode), delete r.renderingMode, delete r.backgroundColor, this._handleResize = this._handleResize.bind(this), this._handleRender = this._handleRender.bind(this), this._container = t;
        for (var n in r) this[n] = r[n];
        e && (this.data = e), (null === this._width || null === this._height) && this.fitToContainer();
        var a = this;
        this.once("canplay", function () {
          a.renderNow()
        }), this.once("canplaythrough", function () {
          a._autoplay ? a._start() : a._requestRender()
        }), this._requestResize()
      }
      var u, h = t("raf"),
        f = t("events").EventEmitter,
        l = t("object-assign"),
        c = t("bezier-easing"),
        p = t("./Channels"),
        d = t("./findTransitionByName"),
        g = t("./DiaporamaRenderingCanvas"),
        _ = t("./DiaporamaRenderingDOM"),
        m = t("./TimeInterval"),
        v = t("./DiaporamaFormatError"),
        y = t("./WebGLDetector"),
        b = 0,
        w = 1,
        E = 2,
        T = c(.4, 0, .8, 1);
      o.prototype = l({}, f.prototype, {
        destroy: function () {
          this._destroyed || (this._destroyed = !0, this.emit("destroy"), this.removeAllListeners(), this._stopCurrentDiaporamaLoading && (this._stopCurrentDiaporamaLoading(), this._stopCurrentDiaporamaLoading = null), this._stop(), this._rendering.destroy())
        },
        play: function () {
          this.paused = !1
        },
        pause: function () {
          this.paused = !0
        },
        next: function (t) {
          var e = this._slideIndexForTime(this._slidingTarget ? this._slidingTarget.to : this._currentTime);
          if (-1 !== e) {
            if (e++, e >= this._slideTimes.length) {
              if (!this._loop) return;
              e = 0
            }
            this._slideToTime(this._slideTimes[e], t)
          }
        },
        prev: function (t) {
          var e = this._slideIndexForTime(this._slidingTarget ? this._slidingTarget.to : this._currentTime);
          if (-1 !== e) {
            if (e--, 0 > e) {
              if (!this._loop) return;
              e = this._slideTimes.length - 1
            }
            this._slideToTime(this._slideTimes[e], t)
          }
        },
        jump: function (t, e) {
          if ("number" != typeof t) throw new Error("Diaporama#jump requires the slide index number.");
          if (!(0 > t || t >= this._slideTimes.length)) {
            var r = this._slideIndexForTime(this._currentTime);
            r !== t && this._slideToTime(this._slideTimes[t], e)
          }
        },
        fitToContainer: function () {
          var t = this._container,
            e = t.getBoundingClientRect();
          this._width = e.width, this._height = e.height, this._requestResize()
        },
        _playbackRate: 1,
        _loop: !1,
        _autoplay: !1,
        _paused: !0,
        _width: null,
        _height: null,
        _resolution: window.devicePixelRatio || 1,
        _currentTime: 0,
        _duration: 0,
        _backgroundColor: [0, 0, 0],
        _curLoop: null,
        _startLoopId: 0,
        _needResize: null,
        _needRender: null,
        _slidingTarget: null,
        _loadImages: function () {
          function t() {
            c || (c = 1, u.emit("canplay"), u._requestRender())
          }

          function e() {
            p || (p = 1, u.emit("canplaythrough"), u._requestRender())
          }

          function r() {
            u.emit("load"), u._requestRender()
          }

          function n() {
            var t = u._segments,
              e = u._rendering,
              r = t.length;
            for (_ = 0; r > _; ++_) {
              var n = t[_];
              if (n[0].timeInside(0) && !n[1].ready(e)) return !1
            }
            return !0
          }

          function i() {
            if (l.length === f.length) t(), e(), r(), o();
            else if (!c && n() && t(), c && !p) {
              var i = Date.now() - d,
                s = u.duration;
              .8 * l.length / f.length > i / s && e()
            }
          }

          function s(t) {
            -1 !== f.indexOf(t) && (u.emit("progress", l.length / f.length), l.push(t), i())
          }

          function a(t, e) {
            u.emit("error", new Error("Failure to load " + t), e), o()
          }

          function o() {
            h.removeListener("load", s), h.removeListener("error", a), clearInterval(g)
          }
          this._stopCurrentDiaporamaLoading && (this._stopCurrentDiaporamaLoading(), this._stopCurrentDiaporamaLoading = null);
          var u = this,
            h = this._rendering.images,
            f = [],
            l = [];
          this._data.timeline.forEach(function (t) {
            var e = t.image;
            e && (h.has(e) || f.push(e))
          });
          var c, p;
          if (0 === f.length) return void setTimeout(function () {
            t(), e(), r()
          }, 0);
          var d = Date.now();
          setTimeout(i, 0);
          var g = setInterval(i, 200);
          h.on("load", s), h.on("error", a);
          for (var _ = 0; _ < f.length; ++_) h.load(f[_]);
          this._stopCurrentDiaporamaLoading = o
        },
        _loadTransitions: function () {
          var t = this._rendering.transitions;
          if (t) {
            var e = this._data.transitions || this.GlslTransitions || {};
            this._data.timeline.forEach(function (r) {
              var n = r.transitionNext && r.transitionNext.name;
              if (n && !t.has(n)) {
                var i = d(n, e);
                i && t.set(n, i)
              }
            })
          }
        },
        _requestResize: function () {
          null === this._needResize && (this._needResize = h(this._handleResize))
        },
        _handleResize: function () {
          null !== this._needResize && (this._needResize = null, this._resize())
        },
        _resize: function () {
          if (!this._destroyed) {
            var t = this._width,
              e = this._height,
              r = this._resolution;
            this._rendering.resize(t, e, r);
            for (var n = 0; n < this._runningSegments.length; ++n) this._runningSegments[n][1].resize(t, e, r);
            this.emit("resize", t, e), this._requestRender()
          }
        },
        _computeTimelineSegments: function () {
          for (var t; t = this._runningSegments.pop();) {
            var e = t[1].leave();
            e && this.emit.apply(this, e)
          }
          for (var r, i = this.loop, s = this._data, a = s.timeline.length, o = 0, u = 0, h = [], f = [], c = [], d = 0; a > d; d++) {
            h.push(o);
            var g = s.timeline[d],
              _ = g.duration || 0,
              y = g.transitionNext,
              b = y && y.duration || 0,
              w = d === a - 1 ? 2 : d % 2;
            if (g.image) {
              if (0 === d) {
                var E = l({}, g);
                E.kenburns = l({}, E.kenburns), E.kenburns.to = E.kenburns.from, r = new this._rendering.SegmentKenBurns(p.KENBURNS[w], E)
              }
              t = new this._rendering.SegmentKenBurns(p.KENBURNS[w], g)
            } else {
              if (!g.canvas2d) throw new v("timeline item can't be understood as a segment.", g);
              0 === d && (r = new this._rendering.SegmentCanvas2d(p.CANVAS2D[w], g)), t = new this._rendering.SegmentCanvas2d(p.CANVAS2D[w], g)
            }
            f.push([new m(o - u, i || d !== a - 1 ? o + _ + b : o + _), t]), u = b, o += _, b && (c.push({
              interval: new m(o, o + b),
              index: d
            }), o += b)
          }
          for (var T = o - u, A = [], R = 0; R < c.length; ++R) {
            var x = c[R],
              I = x.index,
              S = I + 1 < s.timeline.length ? I + 1 : 0,
              N = f[I][1],
              L = f[S][1],
              B = s.timeline[I].transitionNext;
            (0 !== S || i) && A.push([x.interval, new this._rendering.SegmentTransition(p.TRANSITION, B, N, L)])
          }
          if (i && f.length) {
            var F = f[0][0].clone();
            F.add(T), f.push([F, r])
          }
          f = A.concat(f), f.sort(n), this._slideTimes = h, this._segments = f, this._duration = T, this._lastTransitionDuration = u
        },
        _slideIndexForTime: function (t) {
          var e = this._slideTimes;
          if (!e) return -1;
          t = this._normalizeTime(t);
          for (var r = e.length, n = 0; r > n; ++n)
            if (t < e[n]) return n - 1;
          return r - 1
        },
        _slideToTime: function (t, e) {
          var r = this._currentTime;
          if (t !== r) {
            if (this._loop) {
              var n = this.duration,
                i = Math.abs(t - r),
                s = Math.abs(t + n - r),
                a = Math.abs(t - n - r);
              (i > s || i > a) && (a > s ? t += n : t -= n)
            }
            if (this.paused || !e) this._currentTime = t, this._requestRender();
            else {
              var o = this._playbackRate;
              this._slidingTarget = {
                from: r,
                to: t,
                startTime: null,
                duration: e,
                initialPlaybackRate: t > r == o > 0 ? o : 0
              }
            }
          }
        },
        renderNow: function () {
          this._needRender = !0, this._handleRender()
        },
        _requestRender: function () {
          null === this._curLoop && null === this._needRender && (this._needRender = h(this._handleRender))
        },
        _handleRender: function () {
          null !== this._needRender && (this._needRender = null, this._render())
        },
        _normalizeTime: function (t) {
          var e = this.duration;
          return this._loop ? e ? (t + e) % e : 0 : Math.max(0, Math.min(t, e))
        },
        _render: function () {
          if (!this._destroyed) {
            var t = this._rendering;
            this._handleResize();
            var e = this._segments;
            if (0 === e.length) return t.render(0, []), this.emit("render", 0, b), b;
            var r, i, s = this._normalizeTime(this._currentTime),
              a = this._runningSegments,
              o = !1,
              u = [],
              h = [],
              f = e.length;
            for (r = 0; f > r; ++r) {
              i = e[r];
              var l = a.indexOf(i),
                c = -1 !== l;
              if (i[0].timeInside(s)) {
                if (!c) {
                  if (!i[1].ready(t)) {
                    o = !0;
                    continue
                  }
                  a.push(i), u.push(i[1])
                }
              } else c && (a.splice(l, 1), h.push(i[1]))
            }
            for (a.sort(n), r = h.length - 1; r >= 0; r--) {
              i = h[r];
              var p = i.leave();
              p && this.emit.apply(this, p)
            }
            for (r = u.length - 1; r >= 0; r--) {
              i = u[r];
              var d = i.enter(t);
              d && this.emit.apply(this, d)
            }(0 === s || a.length > 0) && this._rendering.render(s, a);
            var g = a.length > 0 ? o ? w : E : b;
            return this.emit("render", s, g), g
          }
        },
        _start: function () {
          var t, e = this,
            r = ++this._startLoopId;
          this._curLoop = h(function n(i) {
            if (e._startLoopId === r) {
              h(n), t || (t = i, e.emit("play"));
              var s = i - t;
              t = i;
              var o = e._render();
              if (o === b) e.loop ? e.currentTime = 0 : e._stop(!0);
              else if (o === E) {
                var u = e._slidingTarget;
                if (null !== u) {
                  null === u.startTime && (u.startTime = i);
                  var f = i - u.startTime,
                    l = a(u.from, u.to, f, u.duration, u.initialPlaybackRate);
                  Math.abs(u.to - l) < 10 || f >= u.duration ? (e._currentTime = u.to, e._slidingTarget = null) : e._currentTime = l
                } else e._currentTime = e._normalizeTime(e._currentTime + s * e._playbackRate)
              }
            }
          })
        },
        _stop: function (t) {
          this._startLoopId++, this._slidingTarget && (this.currentTime = this._slidingTarget.endAt, this._slidingTarget = null), null !== this._curLoop && (h.cancel(this._curLoop), this._curLoop = null, this.emit("pause"), t && this.emit("ended"))
        }
      }), Object.defineProperties(o.prototype, {
        loop: {
          set: function (t) {
            var e = !!t;
            this._loop !== e && (this._loop = e, this._data && (this._computeTimelineSegments(this._data), this._requestRender()))
          },
          get: function () {
            return this._loop
          }
        },
        autoplay: {
          set: function (t) {
            this._autoplay = t
          },
          get: function () {
            return this._autoplay
          }
        },
        data: {
          set: function (t) {
            var e = this._data;
            e !== t && (this._data = t, this._computeTimelineSegments(e), this._loadTransitions(), this._loadImages(), this._requestRender())
          },
          get: function () {
            return this._data
          }
        },
        resolution: {
          set: function (t) {
            t !== this._resolution && (this._resolution = t, this._requestResize())
          },
          get: function () {
            return this._resolution
          }
        },
        width: {
          set: function (t) {
            t !== this._width && (this._width = t, this._requestResize())
          },
          get: function () {
            return this._width
          }
        },
        height: {
          set: function (t) {
            t !== this._height && (this._height = t, this._requestResize())
          },
          get: function () {
            return this._height
          }
        },
        currentTime: {
          set: function (t) {
            t !== this._currentTime && (this._currentTime = this._normalizeTime(t), this._requestRender())
          },
          get: function () {
            return this._currentTime
          }
        },
        playbackRate: {
          set: function (t) {
            this._playbackRate = t
          },
          get: function () {
            return this._playbackRate
          }
        },
        paused: {
          set: function (t) {
            var e = null === this._curLoop;
            t !== e && (t ? this._stop() : this._start())
          },
          get: function () {
            return null === this._curLoop
          }
        },
        duration: {
          get: function () {
            var t = this._duration || 0;
            return this._loop ? t + (this._lastTransitionDuration || 0) : t
          },
          set: function () {
            throw new Error("Diaporama: duration is a read-only value.")
          }
        },
        renderingMode: {
          get: function () {
            return this._renderingMode
          },
          set: function () {
            throw new Error("Diaporama: setting renderingMode afterwards is not supported.")
          }
        },
        backgroundColor: {
          get: function () {
            return this._backgroundColor
          },
          set: function () {
            throw new Error("Diaporama: setting backgroundColor afterwards is not supported.")
          }
        }
      }), o.RENDER_NO_SEGMENTS = b, o.RENDER_NOT_READY = w, o.RENDER_READY = E, e.exports = o
    }, {
      "./Channels": 2,
      "./DiaporamaFormatError": 4,
      "./DiaporamaRenderingCanvas": 9,
      "./DiaporamaRenderingDOM": 12,
      "./TimeInterval": 17,
      "./WebGLDetector": 18,
      "./findTransitionByName": 19,
      "bezier-easing": 22,
      events: 27,
      "object-assign": 55,
      raf: 56
    }],
    4: [function (t, e, r) {
      function n(t, e) {
        this.message = t, this.stack = (new Error).stack
      }
      n.prototype = new Error, n.prototype.name = "DiaporamaFormatError", e.exports = n
    }, {}],
    5: [function (t, e, r) {
      function n(t, e) {
        this.gl = t, this.shader = i(t, o, u), this.buffer = t.createBuffer(), t.bindBuffer(t.ARRAY_BUFFER, this.buffer), t.bufferData(t.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), t.STATIC_DRAW);
        var r = e.concat([1]);
        this.background = a(t, s(new Float32Array(r.concat(r).concat(r).concat(r)), [2, 2, 4]))
      }
      var i = t("gl-shader"),
        s = t("ndarray"),
        a = t("gl-texture2d"),
        o = ["attribute vec2 position;", "varying vec2 uv;", "void main() {", "gl_Position = vec4(position,0.0,1.0);", "uv = 0.5 * (position+1.0);", "}"].join(""),
        u = ["precision mediump float;", "uniform sampler2D buffer;", "varying vec2 uv;", "void main() {", "gl_FragColor = texture2D(buffer, uv);", "}"].join("");
      n.prototype = {
        dispose: function () {
          this.gl.deleteBuffer(this.buffer), this.background.dispose(), this.shader.dispose()
        },
        renderTexture: function (t) {
          var e = this.gl,
            r = this.shader;
          r.bind(), e.bindBuffer(e.ARRAY_BUFFER, this.buffer), r.attributes.position.pointer(), r.uniforms.buffer = t.bind(), e.drawArrays(e.TRIANGLES, 0, 6)
        },
        renderFBO: function (t) {
          this.renderTexture(t.color[0])
        },
        renderEmpty: function () {
          this.renderTexture(this.background)
        }
      }, e.exports = n
    }, {
      "gl-shader": 30,
      "gl-texture2d": 47,
      ndarray: 53
    }],
    6: [function (t, e, r) {
      function n(t, e, r, n) {
        a.call(this, t, e), this.segmentFrom = r, this.segmentTo = n
      }
      var i = t("object-assign"),
        s = t("bezier-easing"),
        a = t("../SegmentTimeline");
      n.prototype = i({}, a.prototype, {
        toString: function () {
          return "SegmentTransition(" + this.channel + "," + this.segmentFrom.channel + "~>" + this.segmentTo.channel + ")"
        },
        ready: function (t) {
          return this.segmentFrom.ready(t) && this.segmentTo.ready(t) && (!this.data.name || t.transitions.has(this.data.name))
        },
        enter: function (t) {
          var e = this.data,
            r = t.transitions.getOrFade(e.name),
            n = t.getChannelContext(this.channel);
          return this.gl = n, this.from = t.getChannel(this.segmentFrom.channel), this.to = t.getChannel(this.segmentTo.channel), this.uniforms = i({}, r.uniforms, e.uniforms || {}), this.duration = e.duration || 1e3, this.easing = s.apply(null, e.easing || [0, 0, 1, 1]), this.t = r.t, ["transition", this.data, this.segmentFrom.data, this.segmentTo.data]
        },
        resize: function () {
          this.t.render(this.easing(this._p || 0), this.from, this.to, this.uniforms)
        },
        leave: function () {
          return ["transitionEnd", this.data, this.segmentFrom.data, this.segmentTo.data]
        },
        render: function (t) {
          this._p = t, this.t.render(this.easing(t), this.from, this.to, this.uniforms)
        }
      }), e.exports = n
    }, {
      "../SegmentTimeline": 15,
      "bezier-easing": 22,
      "object-assign": 55
    }],
    7: [function (t, e, r) {
      function n(t, e) {
        a.call(this, t, e)
      }
      var i = t("object-assign"),
        s = t("gl-texture2d"),
        a = t("../SegmentKenBurns");
      n.prototype = i({}, a.prototype, {
        enter: function (t) {
          this.getSize = t.getSize.bind(t);
          var e = a.prototype.enter.apply(this, arguments);
          return this.texture = s(t.gl, this.image), this.texture.minFilter = this.texture.magFilter = t.gl.LINEAR, e
        },
        leave: function () {
          return this.texture.dispose(), a.prototype.leave.apply(this, arguments)
        },
        draw: function (t, e) {
          this.kenburns.render(this.texture, e)
        }
      }), e.exports = n
    }, {
      "../SegmentKenBurns": 14,
      "gl-texture2d": 47,
      "object-assign": 55
    }],
    8: [function (t, e, r) {
      function n(t) {
        this.gl = t, this.ts = {}, this.set("fade", s)
      }
      var i = t("glsl-transition"),
        s = t("glsl-transition-fade");
      n.prototype = {
        destroy: function () {
          for (var t in this.ts) this.ts[t].t.dispose();
          this.ts = null
        },
        has: function (t) {
          return t in this.ts
        },
        set: function (t, e) {
          var r = i(this.gl, e.glsl);
          this.ts[t] = {
            t: r,
            uniforms: e.uniforms || {}
          }
        },
        get: function (t) {
          return this.ts[t]
        },
        getOrFade: function (t) {
          return t && this.ts[t] || this.ts.fade
        }
      }, e.exports = n
    }, {
      "glsl-transition": 49,
      "glsl-transition-fade": 48
    }],
    9: [function (t, e, r) {
      function n(t, e) {
        console.log('create canvas 1')
        this._container = t, this.bg = e.concat([1]), this._canvas = null, this._canvases = {}, this._textures = {}, this._ctxs = {}, this._fbos = {}, this._currentChannel = null;
        var r = this.shape = [1, 1],
          n = document.createElement("canvas"),
          u = n.getContext("webgl");
        u.pixelStorei(u.UNPACK_FLIP_Y_WEBGL, !1), this.gl = u, this._post = new o(u, e);
        var h = s(u, r);
        this._attachContext(p.TRANSITION, u, h), p.KENBURNS.forEach(function (t) {
          var e = s(u, r),
            n = new i(u);
          this._attachContext(t, n, e)
        }, this), p.CANVAS2D.forEach(function (t) {
          console.log('create canvas 2')
          var e = document.createElement("canvas"),
            r = e.getContext("2d");
          this._canvases[t] = e;
          var n = a(u, e);
          n.minFilter = n.magFilter = u.LINEAR, this._textures[t] = n, this._attachContext(t, r)
        }, this), this._container.appendChild(this._canvas = n), this.images = new c, this.transitions = new l(this.getChannelContext(p.TRANSITION))
      }
      var i = t("kenburns-webgl"),
        s = t("gl-fbo"),
        a = t("gl-texture2d"),
        o = t("./Post"),
        u = t("./SegmentGlslTransition"),
        h = t("./SegmentKenBurnsWebGL"),
        f = t("../SegmentCanvas2d"),
        l = t("./StoreTransitions"),
        c = t("../StoreImages"),
        p = t("../Channels");
      n.prototype = {
        SegmentTransition: u,
        SegmentKenBurns: h,
        SegmentCanvas2d: f,
        destroy: function () {
          this.images.destroy(), this.transitions.destroy();
          for (var t in this._ctxs) {
            var e = this._ctxs[t];
            e.destroy ? e.destroy() : e.dispose && e.dispose()
          }
          for (var r in this._fbos) this._fbos[r].dispose();
          for (var n in this._textures) this._textures[n].dispose();
          this._post.dispose(), this._fbos = null, this._canvas = null, this._canvases = null, this._ctxs = null, this._post = null, this._currentChannel = null
        },
        getSize: function () {
          var t = this.shape;
          return {
            width: t[0],
            height: t[1]
          }
        },
        resize: function (t, e, r) {
          var n = t * r,
            i = e * r,
            s = this.shape = [n, i],
            a = this._canvas,
            o = this._container;
          a.style.width = t + "px", a.style.height = e + "px", a.width = n, a.height = i, o.style.width = t + "px", o.style.height = e + "px";
          for (var u in this._canvases) {
            var h = this._canvases[u];
            h.width = n, h.height = i
          }
          for (var f in this._fbos) this._fbos[f].shape = s;
          for (var l in this._textures) this._textures[l].shape = s
        },
        getChannel: function (t) {
          var e = this._fbos[t];
          if (e) return e.color[0];
          var r = this._canvases[t],
            n = this._textures[t],
            i = this.gl;
          return i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, !0), n.setPixels(r), i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, !1), n
        },
        getChannelContext: function (t) {
          return this._ctxs[t]
        },
        switchChannel: function (t) {
          this._currentChannel = t
        },
        _attachContext: function (t, e, r) {
          this._ctxs[t] = e, r && (this._fbos[t] = r)
        },
        preparePostRender: function () {
          var t = this.gl,
            e = this.bg,
            r = this.shape;
          t.bindFramebuffer(t.FRAMEBUFFER, null), t.viewport(0, 0, r[0], r[1]), t.clearColor.apply(t, e), t.clear(t.COLOR_BUFFER_BIT)
        },
        render: function (t, e) {
          if (e.length > 0) {
            for (var r, n = e.length - 1; n >= 0; n--) {
              var i = e[n],
                s = i[1],
                a = i[0];
              r = s.channel;
              var o = this._fbos[s.channel];
              o && o.bind(), s.render(a.interpolate(t))
            }
            this.preparePostRender(), this._post.renderTexture(this.getChannel(r))
          } else this.preparePostRender(), this._post.renderEmpty()
        }
      }, e.exports = n
    }, {
      "../Channels": 2,
      "../SegmentCanvas2d": 13,
      "../StoreImages": 16,
      "./Post": 5,
      "./SegmentGlslTransition": 6,
      "./SegmentKenBurnsWebGL": 7,
      "./StoreTransitions": 8,
      "gl-fbo": 29,
      "gl-texture2d": 47,
      "kenburns-webgl": 52
    }],
    10: [function (t, e, r) {
      function n(t, e, r, n) {
        a.call(this, t, e), this.segmentFrom = r, this.segmentTo = n
      }
      var i = t("object-assign"),
        s = t("bezier-easing"),
        a = t("../SegmentTimeline");
      n.prototype = i({}, a.prototype, {
        toString: function () {
          return "SegmentTransition(" + this.channel + "," + this.segmentFrom.channel + "~>" + this.segmentTo.channel + ")"
        },
        ready: function (t) {
          return this.segmentFrom.ready(t) && this.segmentTo.ready(t)
        },
        enter: function (t) {
          var e = this.data,
            r = t.getChannel(this.segmentFrom.channel),
            n = t.getChannel(this.segmentTo.channel),
            i = t.getChannel(this.channel);
          return r.style.position = "absolute", r.style.top = 0, r.style.left = 0, n.style.position = "absolute", n.style.top = 0, n.style.left = 0, i.appendChild(n), i.appendChild(r), this.container = i, this.from = r, this.to = n, this.duration = e.duration || 1e3, this.easing = s.apply(null, e.easing || [0, 0, 1, 1]), ["transition", e, this.segmentFrom.data, this.segmentTo.data]
        },
        resize: function () {},
        leave: function () {
          return this.container.removeChild(this.from), this.container.removeChild(this.to), this.from.style.opacity = 1, this.to.style.opacity = 1, ["transitionEnd", this.data, this.segmentFrom.data, this.segmentTo.data]
        },
        render: function (t) {
          var e = this.easing(t);
          this.from.style.opacity = 1 - e
        }
      }), e.exports = n
    }, {
      "../SegmentTimeline": 15,
      "bezier-easing": 22,
      "object-assign": 55
    }],
    11: [function (t, e, r) {
      function n(t, e) {
        s.call(this, t, e)
      }
      var i = t("object-assign"),
        s = t("../SegmentKenBurns");
      n.prototype = i({}, s.prototype, {
        enter: function (t) {
          return this.div = t.getChannel(this.channel), this.getSize = t.getSize.bind(t), s.prototype.enter.apply(this, arguments)
        },
        draw: function (t, e) {
          this.kenburns.draw(t, e)
        }
      }), e.exports = n
    }, {
      "../SegmentKenBurns": 14,
      "object-assign": 55
    }],
    12: [function (t, e, r) {
      function n(t, e) {
        this._container = t;
        var r = this._container.style.position;
        r && "static" !== r || (this._container.style.position = "relative"), this._container.style.backgroundColor = "rgb(" + e.map(function (t) {
          return ~~(255 * t)
        }) + ")", this._nodes = {}, this._ctxs = {}, this.createDOM(), this.images = new a
      }
      var i = t("kenburns-dom"),
        s = t("../Channels"),
        a = t("../StoreImages"),
        o = t("./SegmentDomTransition"),
        u = t("./SegmentKenBurnsDOM"),
        h = t("../SegmentCanvas2d");
      n.prototype = {
        SegmentTransition: o,
        SegmentKenBurns: u,
        SegmentCanvas2d: h,
        destroy: function () {
          this._setChild(null), this.images.destroy();
          for (var t in this._ctxs) this._ctxs[t].destroy && this._ctxs[t].destroy();
          this._nodes = null, this._ctxs = null
        },
        resize: function (t, e, r) {
          this._w = t, this._h = e;
          var n = t * r,
            i = e * r;
          for (var s in this._nodes) {
            var a = this._nodes[s];
            a.style.width = t + "px", a.style.height = e + "px", "CANVAS" === a.nodeName && (a.width = n, a.height = i)
          }
          this._container.style.width = t + "px", this._container.style.height = e + "px"
        },
        getSize: function () {
          return {
            width: this._w,
            height: this._h
          }
        },
        getChannel: function (t) {
          return this._nodes[t]
        },
        getChannelContext: function (t) {
          return this._ctxs[t]
        },
        switchChannel: function (t) {
          t !== this._c && (this._c = t, this._setChild(this._nodes[t]))
        },
        render: function (t, e) {
          if (e.length > 0) {
            for (var r = e.length - 1; r >= 0; r--) {
              var n = e[r],
                i = n[1],
                s = n[0];
              i.render(s.interpolate(t))
            }
            this.switchChannel(e[0][1].channel)
          } else this.switchChannel(null)
        },
        createDOM: function () {
          console.log('createDOM')
          var t = document.createElement("div");
          this._attachChannel(s.TRANSITION, t, t), s.KENBURNS.forEach(function (t) {
            var e = document.createElement("div"),
              r = new i(e);
            r.getViewport = this.getSize.bind(this), this._attachChannel(t, e, r)
          }, this), s.CANVAS2D.forEach(function (t) {
            console.log('create canvas 3')
            var e = document.createElement("canvas"),
              r = e.getContext("2d");
            this._attachChannel(t, e, r)
          }, this)
        },
        _attachChannel: function (t, e, r) {
          this._nodes[t] = e, this._ctxs[t] = r
        },
        _setChild: function (t) {
          var e = this._container,
            r = e.children[0];
          r && e.removeChild(r), t && e.appendChild(t)
        }
      }, e.exports = n
    }, {
      "../Channels": 2,
      "../SegmentCanvas2d": 13,
      "../StoreImages": 16,
      "./SegmentDomTransition": 10,
      "./SegmentKenBurnsDOM": 11,
      "kenburns-dom": 50
    }],
    13: [function (t, e, r) {
      function n(t, e) {
        s.call(this, t, e), this._needRender = !1
      }
      var i = t("object-assign"),
        s = t("./SegmentTimeline"),
        a = t("rect-crop");
      n.prototype = i({}, s.prototype, {
        toString: function () {
          return "SegmentCanvas2d(" + this.channel + ")"
        },
        ready: function () {
          return !0
        },
        enter: function (t) {
          return this.ctx = t.getChannelContext(this.channel), this._render(), ["slide", this.data]
        },
        resize: function () {
          this._needRender = !0
        },
        leave: function () {
          return ["slideEnd", this.data]
        },
        render: function () {
          this._needRender && this._render()
        },
        _render: function () {
          this._needRender = !1;
          var t = this.ctx,
            e = t.canvas,
            r = e.width,
            n = e.height,
            i = this.data.canvas2d,
            s = i.size || [1e3, 1e3],
            o = s[0],
            u = s[1],
            h = i.background || "black",
            f = i.draws || [];
          t.save(), t.fillStyle = h, t.fillRect(0, 0, r, n);
          var l = a.largest({
            width: o,
            height: u
          }, e);
          t.translate(Math.round(l[0]), Math.round(l[1])), t.scale(l[2] / o, l[3] / u);
          for (var c = 0; c < f.length; ++c) {
            var p = f[c];
            if (p instanceof Array) {
              var d = p.slice(1);
              t[p[0]].apply(t, d)
            } else
              for (var g in p) t[g] = p[g]
          }
          t.restore()
        }
      }), e.exports = n
    }, {
      "./SegmentTimeline": 15,
      "object-assign": 55,
      "rect-crop": 59
    }],
    14: [function (t, e, r) {
      function n(t, e) {
        h.call(this, t, e), this.clamped = !0
      }
      var i = t("object-assign"),
        s = t("rect-clamp"),
        a = t("rect-crop"),
        o = t("rect-mix"),
        u = t("bezier-easing"),
        h = t("./SegmentTimeline");
      n.prototype = i({}, h.prototype, {
        toString: function () {
          return "SegmentKenBurns(" + this.channel + ")"
        },
        ready: function (t) {
          return t.images.has(this.data.image)
        },
        enter: function (t) {
          var e = this.data,
            r = t.images.get(e.image),
            n = t.getChannelContext(this.channel);
          this.kenburns = n, this.image = r;
          var i = a.largest,
            s = a.largest;
          return e.kenburns && (e.kenburns.from && (i = a.apply(null, e.kenburns.from)), e.kenburns.to && (s = a.apply(null, e.kenburns.to))), this.from = i, this.to = s, this.easing = u.apply(null, e.kenburns && e.kenburns.easing || [0, 0, 1, 1]), this.viewport = [0, 0, r.width, r.height], this.computeBounds(), n.runStart && n.runStart(r), ["slide", e]
        },
        resize: function () {
          this.computeBounds()
        },
        leave: function () {
          var t = this.kenburns;
          return t.runEnd && t.runEnd(), ["slideEnd", this.data]
        },
        render: function (t) {
          var e = this.image,
            r = o(this.fromCropBound, this.toCropBound, this.easing(t));
          this.clamped && (r = s(r, this.viewport)), this.draw(e, r)
        },
        cropBound: function (t) {
          var e = this.image,
            r = t(this.getSize(), e);
          return this.clamped && (r = s(r, this.viewport)), r
        },
        computeBounds: function () {
          this.fromCropBound = this.cropBound(this.from), this.toCropBound = this.cropBound(this.to)
        }
      }), e.exports = n
    }, {
      "./SegmentTimeline": 15,
      "bezier-easing": 22,
      "object-assign": 55,
      "rect-clamp": 58,
      "rect-crop": 59,
      "rect-mix": 60
    }],
    15: [function (t, e, r) {
      function n(t, e) {
        this.channel = t, this.data = e
      }
      var i = t("./noop");
      n.prototype = {
        toString: function () {
          return "SegmentTimeline(" + this.channel + ")"
        },
        ready: function () {
          return !0
        },
        enter: i,
        leave: i,
        render: i,
        resize: i
      }, e.exports = n
    }, {
      "./noop": 21
    }],
    16: [function (t, e, r) {
      function n(t) {
        this.imgs = {}, this._loading = [], this._threshold = t || 3, this._queue = []
      }
      var i = t("object-assign"),
        s = t("events").EventEmitter;
      n.prototype = i({}, s.prototype, {
        destroy: function () {
          this.removeAllListeners(), this.imgs = {}, this._loading = [], this._queue = []
        },
        has: function (t) {
          return t in this.imgs
        },
        get: function (t) {
          return this.imgs[t]
        },
        load: function (t) {
          this._loading.length >= this._threshold ? this._queue.push(t) : this._loadImage(t)
        },
        _loadImage: function (t) {
          console.log('_loadImage 1')
          if (-1 === this._loading.indexOf(t)) {
            var e = this,
              r = new Image;
            r.crossOrigin = !0, this._take(t), r.onload = function () {
              e._release(t) && (e.imgs[t] = r, e.emit("load", t, r))
            }, r.onabort = r.onerror = function (r) {
              e._release(t) && (e.imgs[t] = null, e.emit("error", t, r))
            }, r.src = t
          }
        },
        _take: function (t) {
          this._loading.push(t)
        },
        _release: function (t) {
          var e = this._loading.indexOf(t);
          if (-1 === e) return !1;
          if (this._loading.splice(e, 1), this._queue.length > 0) {
            var r = this._queue.shift();
            this._loadImage(r)
          }
          return !0
        }
      }), e.exports = n
    }, {
      events: 27,
      "object-assign": 55
    }],
    17: [function (t, e, r) {
      function n(t, e) {
        this.startT = t, this.endT = e
      }
      var i = t("./mix");
      n.prototype = {
        toString: function () {
          return "TimeInterval(" + this.startT + "," + this.endT + ")"
        },
        clone: function () {
          return new n(this.startT, this.endT)
        },
        add: function (t) {
          this.startT += t, this.endT += t
        },
        timeInside: function (t) {
          return this.startT <= t && t < this.endT
        },
        interpolate: function (t) {
          return i(this.startT, this.endT, t)
        }
      }, e.exports = n
    }, {
      "./mix": 20
    }],
    18: [function (t, e, r) {
      function n() {
        console.log('create canvas 4')
        this.canvas = document.createElement("canvas"), this.canvas.addEventListener("webglcontextlost", function (t) {
          t.preventDefault(), this.gl = null
        }.bind(this), !1)
      }
      var i = t("webglew");
      n.prototype = {
        supported: function () {
          if (this.gl || (this.gl = this.canvas.getContext("webgl")), !this.gl) return !1;
          var t = i(this.gl);
          return t.OES_texture_float
        }
      }, e.exports = n
    }, {
      webglew: 62
    }],
    19: [function (t, e, r) {
      e.exports = function (t, e) {
        for (var r = 0; r < e.length; ++r)
          if (e[r].name.toLowerCase() === t.toLowerCase()) return e[r]
      }
    }, {}],
    20: [function (t, e, r) {
      e.exports = function (t, e, r) {
        return Math.max(0, Math.min(1, (r - t) / (e - t)))
      }
    }, {}],
    21: [function (t, e, r) {
      e.exports = function () {}
    }, {}],
    22: [function (e, r, n) {
      console.log('BezierEasing 1')
      ! function (e) {
        "object" == typeof n ? r.exports = e() : "function" == typeof t && t.amd ? t([], e) : window.BezierEasing = e()
        console.log('BezierEasing 2', window.BezierEasing)
      }(function () {
        function t(t, e) {
          return 1 - 3 * e + 3 * t
        }

        function e(t, e) {
          return 3 * e - 6 * t
        }

        function r(t) {
          return 3 * t
        }

        function n(n, i, s) {
          return ((t(i, s) * n + e(i, s)) * n + r(i)) * n
        }

        function i(n, i, s) {
          return 3 * t(i, s) * n * n + 2 * e(i, s) * n + r(i)
        }

        function s(t, e, r, i, s) {
          var a, o, u = 0;
          do o = e + (r - e) / 2, a = n(o, i, s) - t, a > 0 ? r = o : e = o; while (Math.abs(a) > f && ++u < l);
          return o
        }

        function a(t, e, r, a) {
          function o(e, s) {
            for (var a = 0; u > a; ++a) {
              var o = i(s, t, r);
              if (0 === o) return s;
              var h = n(s, t, r) - e;
              s -= h / o
            }
            return s
          }

          function f() {
            for (var e = 0; c > e; ++e) m[e] = n(e * p, t, r)
          }

          function l(e) {
            for (var n = 0, a = 1, u = c - 1; a != u && m[a] <= e; ++a) n += p;
            --a;
            var f = (e - m[a]) / (m[a + 1] - m[a]),
              l = n + f * p,
              d = i(l, t, r);
            return d >= h ? o(e, l) : 0 === d ? l : s(e, n, n + p, t, r)
          }

          function g() {
            v = !0, (t != e || r != a) && f()
          }
          if (4 !== arguments.length) throw new Error("BezierEasing requires 4 arguments.");
          for (var _ = 0; 4 > _; ++_)
            if ("number" != typeof arguments[_] || isNaN(arguments[_]) || !isFinite(arguments[_])) throw new Error("BezierEasing arguments should be integers.");
          if (0 > t || t > 1 || 0 > r || r > 1) throw new Error("BezierEasing x values must be in [0, 1] range.");
          var m = d ? new Float32Array(c) : new Array(c),
            v = !1,
            y = function (i) {
              return v || g(), t === e && r === a ? i : 0 === i ? 0 : 1 === i ? 1 : n(l(i), e, a)
            };
          y.getControlPoints = function () {
            return [{
              x: t,
              y: e
            }, {
              x: r,
              y: a
            }]
          };
          var b = [t, e, r, a],
            w = "BezierEasing(" + b + ")";
          y.toString = function () {
            return w
          };
          var E = "cubic-bezier(" + b + ")";
          return y.toCSS = function () {
            return E
          }, y
        }
        var o = this,
          u = 4,
          h = .001,
          f = 1e-7,
          l = 10,
          c = 11,
          p = 1 / (c - 1),
          d = "Float32Array" in o;
        return a.css = {
          ease: a(.25, .1, .25, 1),
          linear: a(0, 0, 1, 1),
          "ease-in": a(.42, 0, 1, 1),
          "ease-out": a(0, 0, .58, 1),
          "ease-in-out": a(.42, 0, .58, 1)
        }, a
      })
    }, {}],
    23: [function (t, e, r) {
      function n(t, e) {
        var r = this;
        if (!(r instanceof n)) return new n(t, e);
        var i, s = typeof t;
        if ("number" === s) i = +t;
        else if ("string" === s) i = n.byteLength(t, e);
        else {
          if ("object" !== s || null === t) throw new TypeError("must start with number, buffer, array or string");
          "Buffer" === t.type && O(t.data) && (t = t.data), i = +t.length
        }
        if (i > P) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + P.toString(16) + " bytes");
        0 > i ? i = 0 : i >>>= 0, n.TYPED_ARRAY_SUPPORT ? r = n._augment(new Uint8Array(i)) : (r.length = i, r._isBuffer = !0);
        var a;
        if (n.TYPED_ARRAY_SUPPORT && "number" == typeof t.byteLength) r._set(t);
        else if (x(t))
          if (n.isBuffer(t))
            for (a = 0; i > a; a++) r[a] = t.readUInt8(a);
          else
            for (a = 0; i > a; a++) r[a] = (t[a] % 256 + 256) % 256;
        else if ("string" === s) r.write(t, 0, e);
        else if ("number" === s && !n.TYPED_ARRAY_SUPPORT)
          for (a = 0; i > a; a++) r[a] = 0;
        return i > 0 && i <= n.poolSize && (r.parent = M), r
      }

      function i(t, e) {
        if (!(this instanceof i)) return new i(t, e);
        var r = new n(t, e);
        return delete r.parent, r
      }

      function s(t, e, r, n) {
        r = Number(r) || 0;
        var i = t.length - r;
        n ? (n = Number(n), n > i && (n = i)) : n = i;
        var s = e.length;
        if (s % 2 !== 0) throw new Error("Invalid hex string");
        n > s / 2 && (n = s / 2);
        for (var a = 0; n > a; a++) {
          var o = parseInt(e.substr(2 * a, 2), 16);
          if (isNaN(o)) throw new Error("Invalid hex string");
          t[r + a] = o
        }
        return a
      }

      function a(t, e, r, n) {
        var i = F(S(e, t.length - r), t, r, n);
        return i
      }

      function o(t, e, r, n) {
        var i = F(N(e), t, r, n);
        return i
      }

      function u(t, e, r, n) {
        return o(t, e, r, n)
      }

      function h(t, e, r, n) {
        var i = F(B(e), t, r, n);
        return i
      }

      function f(t, e, r, n) {
        var i = F(L(e, t.length - r), t, r, n);
        return i
      }

      function l(t, e, r) {
        return C.fromByteArray(0 === e && r === t.length ? t : t.slice(e, r))
      }

      function c(t, e, r) {
        var n = "",
          i = "";
        r = Math.min(t.length, r);
        for (var s = e; r > s; s++) t[s] <= 127 ? (n += U(i) + String.fromCharCode(t[s]), i = "") : i += "%" + t[s].toString(16);
        return n + U(i)
      }

      function p(t, e, r) {
        var n = "";
        r = Math.min(t.length, r);
        for (var i = e; r > i; i++) n += String.fromCharCode(127 & t[i]);
        return n
      }

      function d(t, e, r) {
        var n = "";
        r = Math.min(t.length, r);
        for (var i = e; r > i; i++) n += String.fromCharCode(t[i]);
        return n
      }

      function g(t, e, r) {
        var n = t.length;
        (!e || 0 > e) && (e = 0), (!r || 0 > r || r > n) && (r = n);
        for (var i = "", s = e; r > s; s++) i += I(t[s]);
        return i
      }

      function _(t, e, r) {
        for (var n = t.slice(e, r), i = "", s = 0; s < n.length; s += 2) i += String.fromCharCode(n[s] + 256 * n[s + 1]);
        return i
      }

      function m(t, e, r) {
        if (t % 1 !== 0 || 0 > t) throw new RangeError("offset is not uint");
        if (t + e > r) throw new RangeError("Trying to access beyond buffer length")
      }

      function v(t, e, r, i, s, a) {
        if (!n.isBuffer(t)) throw new TypeError("buffer must be a Buffer instance");
        if (e > s || a > e) throw new RangeError("value is out of bounds");
        if (r + i > t.length) throw new RangeError("index out of range")
      }

      function y(t, e, r, n) {
        0 > e && (e = 65535 + e + 1);
        for (var i = 0, s = Math.min(t.length - r, 2); s > i; i++) t[r + i] = (e & 255 << 8 * (n ? i : 1 - i)) >>> 8 * (n ? i : 1 - i)
      }

      function b(t, e, r, n) {
        0 > e && (e = 4294967295 + e + 1);
        for (var i = 0, s = Math.min(t.length - r, 4); s > i; i++) t[r + i] = e >>> 8 * (n ? i : 3 - i) & 255
      }

      function w(t, e, r, n, i, s) {
        if (e > i || s > e) throw new RangeError("value is out of bounds");
        if (r + n > t.length) throw new RangeError("index out of range");
        if (0 > r) throw new RangeError("index out of range")
      }

      function E(t, e, r, n, i) {
        return i || w(t, e, r, 4, 3.4028234663852886e38, -3.4028234663852886e38), j.write(t, e, r, n, 23, 4), r + 4
      }

      function T(t, e, r, n, i) {
        return i || w(t, e, r, 8, 1.7976931348623157e308, -1.7976931348623157e308), j.write(t, e, r, n, 52, 8), r + 8
      }

      function A(t) {
        if (t = R(t).replace(k, ""), t.length < 2) return "";
        for (; t.length % 4 !== 0;) t += "=";
        return t
      }

      function R(t) {
        return t.trim ? t.trim() : t.replace(/^\s+|\s+$/g, "")
      }

      function x(t) {
        return O(t) || n.isBuffer(t) || t && "object" == typeof t && "number" == typeof t.length
      }

      function I(t) {
        return 16 > t ? "0" + t.toString(16) : t.toString(16)
      }

      function S(t, e) {
        e = e || 1 / 0;
        for (var r, n = t.length, i = null, s = [], a = 0; n > a; a++) {
          if (r = t.charCodeAt(a), r > 55295 && 57344 > r) {
            if (!i) {
              if (r > 56319) {
                (e -= 3) > -1 && s.push(239, 191, 189);
                continue
              }
              if (a + 1 === n) {
                (e -= 3) > -1 && s.push(239, 191, 189);

                continue
              }
              i = r;
              continue
            }
            if (56320 > r) {
              (e -= 3) > -1 && s.push(239, 191, 189), i = r;
              continue
            }
            r = i - 55296 << 10 | r - 56320 | 65536, i = null
          } else i && ((e -= 3) > -1 && s.push(239, 191, 189), i = null);
          if (128 > r) {
            if ((e -= 1) < 0) break;
            s.push(r)
          } else if (2048 > r) {
            if ((e -= 2) < 0) break;
            s.push(r >> 6 | 192, 63 & r | 128)
          } else if (65536 > r) {
            if ((e -= 3) < 0) break;
            s.push(r >> 12 | 224, r >> 6 & 63 | 128, 63 & r | 128)
          } else {
            if (!(2097152 > r)) throw new Error("Invalid code point");
            if ((e -= 4) < 0) break;
            s.push(r >> 18 | 240, r >> 12 & 63 | 128, r >> 6 & 63 | 128, 63 & r | 128)
          }
        }
        return s
      }

      function N(t) {
        for (var e = [], r = 0; r < t.length; r++) e.push(255 & t.charCodeAt(r));
        return e
      }

      function L(t, e) {
        for (var r, n, i, s = [], a = 0; a < t.length && !((e -= 2) < 0); a++) r = t.charCodeAt(a), n = r >> 8, i = r % 256, s.push(i), s.push(n);
        return s
      }

      function B(t) {
        return C.toByteArray(A(t))
      }

      function F(t, e, r, n) {
        for (var i = 0; n > i && !(i + r >= e.length || i >= t.length); i++) e[i + r] = t[i];
        return i
      }

      function U(t) {
        try {
          return decodeURIComponent(t)
        } catch (e) {
          return String.fromCharCode(65533)
        }
      }
      var C = t("base64-js"),
        j = t("ieee754"),
        O = t("is-array");
      r.Buffer = n, r.SlowBuffer = i, r.INSPECT_MAX_BYTES = 50, n.poolSize = 8192;
      var P = 1073741823,
        M = {};
      n.TYPED_ARRAY_SUPPORT = function () {
        try {
          var t = new ArrayBuffer(0),
            e = new Uint8Array(t);
          return e.foo = function () {
            return 42
          }, 42 === e.foo() && "function" == typeof e.subarray && 0 === new Uint8Array(1).subarray(1, 1).byteLength
        } catch (r) {
          return !1
        }
      }(), n.isBuffer = function (t) {
        return !(null == t || !t._isBuffer)
      }, n.compare = function (t, e) {
        if (!n.isBuffer(t) || !n.isBuffer(e)) throw new TypeError("Arguments must be Buffers");
        if (t === e) return 0;
        for (var r = t.length, i = e.length, s = 0, a = Math.min(r, i); a > s && t[s] === e[s]; s++);
        return s !== a && (r = t[s], i = e[s]), i > r ? -1 : r > i ? 1 : 0
      }, n.isEncoding = function (t) {
        switch (String(t).toLowerCase()) {
          case "hex":
          case "utf8":
          case "utf-8":
          case "ascii":
          case "binary":
          case "base64":
          case "raw":
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return !0;
          default:
            return !1
        }
      }, n.concat = function (t, e) {
        if (!O(t)) throw new TypeError("list argument must be an Array of Buffers.");
        if (0 === t.length) return new n(0);
        if (1 === t.length) return t[0];
        var r;
        if (void 0 === e)
          for (e = 0, r = 0; r < t.length; r++) e += t[r].length;
        var i = new n(e),
          s = 0;
        for (r = 0; r < t.length; r++) {
          var a = t[r];
          a.copy(i, s), s += a.length
        }
        return i
      }, n.byteLength = function (t, e) {
        var r;
        switch (t += "", e || "utf8") {
          case "ascii":
          case "binary":
          case "raw":
            r = t.length;
            break;
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            r = 2 * t.length;
            break;
          case "hex":
            r = t.length >>> 1;
            break;
          case "utf8":
          case "utf-8":
            r = S(t).length;
            break;
          case "base64":
            r = B(t).length;
            break;
          default:
            r = t.length
        }
        return r
      }, n.prototype.length = void 0, n.prototype.parent = void 0, n.prototype.toString = function (t, e, r) {
        var n = !1;
        if (e >>>= 0, r = void 0 === r || r === 1 / 0 ? this.length : r >>> 0, t || (t = "utf8"), 0 > e && (e = 0), r > this.length && (r = this.length), e >= r) return "";
        for (;;) switch (t) {
          case "hex":
            return g(this, e, r);
          case "utf8":
          case "utf-8":
            return c(this, e, r);
          case "ascii":
            return p(this, e, r);
          case "binary":
            return d(this, e, r);
          case "base64":
            return l(this, e, r);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return _(this, e, r);
          default:
            if (n) throw new TypeError("Unknown encoding: " + t);
            t = (t + "").toLowerCase(), n = !0
        }
      }, n.prototype.equals = function (t) {
        if (!n.isBuffer(t)) throw new TypeError("Argument must be a Buffer");
        return this === t ? !0 : 0 === n.compare(this, t)
      }, n.prototype.inspect = function () {
        var t = "",
          e = r.INSPECT_MAX_BYTES;
        return this.length > 0 && (t = this.toString("hex", 0, e).match(/.{2}/g).join(" "), this.length > e && (t += " ... ")), "<Buffer " + t + ">"
      }, n.prototype.compare = function (t) {
        if (!n.isBuffer(t)) throw new TypeError("Argument must be a Buffer");
        return this === t ? 0 : n.compare(this, t)
      }, n.prototype.indexOf = function (t, e) {
        function r(t, e, r) {
          for (var n = -1, i = 0; r + i < t.length; i++)
            if (t[r + i] === e[-1 === n ? 0 : i - n]) {
              if (-1 === n && (n = i), i - n + 1 === e.length) return r + n
            } else n = -1;
          return -1
        }
        if (e > 2147483647 ? e = 2147483647 : -2147483648 > e && (e = -2147483648), e >>= 0, 0 === this.length) return -1;
        if (e >= this.length) return -1;
        if (0 > e && (e = Math.max(this.length + e, 0)), "string" == typeof t) return 0 === t.length ? -1 : String.prototype.indexOf.call(this, t, e);
        if (n.isBuffer(t)) return r(this, t, e);
        if ("number" == typeof t) return n.TYPED_ARRAY_SUPPORT && "function" === Uint8Array.prototype.indexOf ? Uint8Array.prototype.indexOf.call(this, t, e) : r(this, [t], e);
        throw new TypeError("val must be string, number or Buffer")
      }, n.prototype.get = function (t) {
        return console.log(".get() is deprecated. Access using array indexes instead."), this.readUInt8(t)
      }, n.prototype.set = function (t, e) {
        return console.log(".set() is deprecated. Access using array indexes instead."), this.writeUInt8(t, e)
      }, n.prototype.write = function (t, e, r, n) {
        if (isFinite(e)) isFinite(r) || (n = r, r = void 0);
        else {
          var i = n;
          n = e, e = r, r = i
        }
        if (e = Number(e) || 0, 0 > r || 0 > e || e > this.length) throw new RangeError("attempt to write outside buffer bounds");
        var l = this.length - e;
        r ? (r = Number(r), r > l && (r = l)) : r = l, n = String(n || "utf8").toLowerCase();
        var c;
        switch (n) {
          case "hex":
            c = s(this, t, e, r);
            break;
          case "utf8":
          case "utf-8":
            c = a(this, t, e, r);
            break;
          case "ascii":
            c = o(this, t, e, r);
            break;
          case "binary":
            c = u(this, t, e, r);
            break;
          case "base64":
            c = h(this, t, e, r);
            break;
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            c = f(this, t, e, r);
            break;
          default:
            throw new TypeError("Unknown encoding: " + n)
        }
        return c
      }, n.prototype.toJSON = function () {
        return {
          type: "Buffer",
          data: Array.prototype.slice.call(this._arr || this, 0)
        }
      }, n.prototype.slice = function (t, e) {
        var r = this.length;
        t = ~~t, e = void 0 === e ? r : ~~e, 0 > t ? (t += r, 0 > t && (t = 0)) : t > r && (t = r), 0 > e ? (e += r, 0 > e && (e = 0)) : e > r && (e = r), t > e && (e = t);
        var i;
        if (n.TYPED_ARRAY_SUPPORT) i = n._augment(this.subarray(t, e));
        else {
          var s = e - t;
          i = new n(s, void 0);
          for (var a = 0; s > a; a++) i[a] = this[a + t]
        }
        return i.length && (i.parent = this.parent || this), i
      }, n.prototype.readUIntLE = function (t, e, r) {
        t >>>= 0, e >>>= 0, r || m(t, e, this.length);
        for (var n = this[t], i = 1, s = 0; ++s < e && (i *= 256);) n += this[t + s] * i;
        return n
      }, n.prototype.readUIntBE = function (t, e, r) {
        t >>>= 0, e >>>= 0, r || m(t, e, this.length);
        for (var n = this[t + --e], i = 1; e > 0 && (i *= 256);) n += this[t + --e] * i;
        return n
      }, n.prototype.readUInt8 = function (t, e) {
        return e || m(t, 1, this.length), this[t]
      }, n.prototype.readUInt16LE = function (t, e) {
        return e || m(t, 2, this.length), this[t] | this[t + 1] << 8
      }, n.prototype.readUInt16BE = function (t, e) {
        return e || m(t, 2, this.length), this[t] << 8 | this[t + 1]
      }, n.prototype.readUInt32LE = function (t, e) {
        return e || m(t, 4, this.length), (this[t] | this[t + 1] << 8 | this[t + 2] << 16) + 16777216 * this[t + 3]
      }, n.prototype.readUInt32BE = function (t, e) {
        return e || m(t, 4, this.length), 16777216 * this[t] + (this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3])
      }, n.prototype.readIntLE = function (t, e, r) {
        t >>>= 0, e >>>= 0, r || m(t, e, this.length);
        for (var n = this[t], i = 1, s = 0; ++s < e && (i *= 256);) n += this[t + s] * i;
        return i *= 128, n >= i && (n -= Math.pow(2, 8 * e)), n
      }, n.prototype.readIntBE = function (t, e, r) {
        t >>>= 0, e >>>= 0, r || m(t, e, this.length);
        for (var n = e, i = 1, s = this[t + --n]; n > 0 && (i *= 256);) s += this[t + --n] * i;
        return i *= 128, s >= i && (s -= Math.pow(2, 8 * e)), s
      }, n.prototype.readInt8 = function (t, e) {
        return e || m(t, 1, this.length), 128 & this[t] ? -1 * (255 - this[t] + 1) : this[t]
      }, n.prototype.readInt16LE = function (t, e) {
        e || m(t, 2, this.length);
        var r = this[t] | this[t + 1] << 8;
        return 32768 & r ? 4294901760 | r : r
      }, n.prototype.readInt16BE = function (t, e) {
        e || m(t, 2, this.length);
        var r = this[t + 1] | this[t] << 8;
        return 32768 & r ? 4294901760 | r : r
      }, n.prototype.readInt32LE = function (t, e) {
        return e || m(t, 4, this.length), this[t] | this[t + 1] << 8 | this[t + 2] << 16 | this[t + 3] << 24
      }, n.prototype.readInt32BE = function (t, e) {
        return e || m(t, 4, this.length), this[t] << 24 | this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3]
      }, n.prototype.readFloatLE = function (t, e) {
        return e || m(t, 4, this.length), j.read(this, t, !0, 23, 4)
      }, n.prototype.readFloatBE = function (t, e) {
        return e || m(t, 4, this.length), j.read(this, t, !1, 23, 4)
      }, n.prototype.readDoubleLE = function (t, e) {
        return e || m(t, 8, this.length), j.read(this, t, !0, 52, 8)
      }, n.prototype.readDoubleBE = function (t, e) {
        return e || m(t, 8, this.length), j.read(this, t, !1, 52, 8)
      }, n.prototype.writeUIntLE = function (t, e, r, n) {
        t = +t, e >>>= 0, r >>>= 0, n || v(this, t, e, r, Math.pow(2, 8 * r), 0);
        var i = 1,
          s = 0;
        for (this[e] = 255 & t; ++s < r && (i *= 256);) this[e + s] = t / i >>> 0 & 255;
        return e + r
      }, n.prototype.writeUIntBE = function (t, e, r, n) {
        t = +t, e >>>= 0, r >>>= 0, n || v(this, t, e, r, Math.pow(2, 8 * r), 0);
        var i = r - 1,
          s = 1;
        for (this[e + i] = 255 & t; --i >= 0 && (s *= 256);) this[e + i] = t / s >>> 0 & 255;
        return e + r
      }, n.prototype.writeUInt8 = function (t, e, r) {
        return t = +t, e >>>= 0, r || v(this, t, e, 1, 255, 0), n.TYPED_ARRAY_SUPPORT || (t = Math.floor(t)), this[e] = t, e + 1
      }, n.prototype.writeUInt16LE = function (t, e, r) {
        return t = +t, e >>>= 0, r || v(this, t, e, 2, 65535, 0), n.TYPED_ARRAY_SUPPORT ? (this[e] = t, this[e + 1] = t >>> 8) : y(this, t, e, !0), e + 2
      }, n.prototype.writeUInt16BE = function (t, e, r) {
        return t = +t, e >>>= 0, r || v(this, t, e, 2, 65535, 0), n.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 8, this[e + 1] = t) : y(this, t, e, !1), e + 2
      }, n.prototype.writeUInt32LE = function (t, e, r) {
        return t = +t, e >>>= 0, r || v(this, t, e, 4, 4294967295, 0), n.TYPED_ARRAY_SUPPORT ? (this[e + 3] = t >>> 24, this[e + 2] = t >>> 16, this[e + 1] = t >>> 8, this[e] = t) : b(this, t, e, !0), e + 4
      }, n.prototype.writeUInt32BE = function (t, e, r) {
        return t = +t, e >>>= 0, r || v(this, t, e, 4, 4294967295, 0), n.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 24, this[e + 1] = t >>> 16, this[e + 2] = t >>> 8, this[e + 3] = t) : b(this, t, e, !1), e + 4
      }, n.prototype.writeIntLE = function (t, e, r, n) {
        t = +t, e >>>= 0, n || v(this, t, e, r, Math.pow(2, 8 * r - 1) - 1, -Math.pow(2, 8 * r - 1));
        var i = 0,
          s = 1,
          a = 0 > t ? 1 : 0;
        for (this[e] = 255 & t; ++i < r && (s *= 256);) this[e + i] = (t / s >> 0) - a & 255;
        return e + r
      }, n.prototype.writeIntBE = function (t, e, r, n) {
        t = +t, e >>>= 0, n || v(this, t, e, r, Math.pow(2, 8 * r - 1) - 1, -Math.pow(2, 8 * r - 1));
        var i = r - 1,
          s = 1,
          a = 0 > t ? 1 : 0;
        for (this[e + i] = 255 & t; --i >= 0 && (s *= 256);) this[e + i] = (t / s >> 0) - a & 255;
        return e + r
      }, n.prototype.writeInt8 = function (t, e, r) {
        return t = +t, e >>>= 0, r || v(this, t, e, 1, 127, -128), n.TYPED_ARRAY_SUPPORT || (t = Math.floor(t)), 0 > t && (t = 255 + t + 1), this[e] = t, e + 1
      }, n.prototype.writeInt16LE = function (t, e, r) {
        return t = +t, e >>>= 0, r || v(this, t, e, 2, 32767, -32768), n.TYPED_ARRAY_SUPPORT ? (this[e] = t, this[e + 1] = t >>> 8) : y(this, t, e, !0), e + 2
      }, n.prototype.writeInt16BE = function (t, e, r) {
        return t = +t, e >>>= 0, r || v(this, t, e, 2, 32767, -32768), n.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 8, this[e + 1] = t) : y(this, t, e, !1), e + 2
      }, n.prototype.writeInt32LE = function (t, e, r) {
        return t = +t, e >>>= 0, r || v(this, t, e, 4, 2147483647, -2147483648), n.TYPED_ARRAY_SUPPORT ? (this[e] = t, this[e + 1] = t >>> 8, this[e + 2] = t >>> 16, this[e + 3] = t >>> 24) : b(this, t, e, !0), e + 4
      }, n.prototype.writeInt32BE = function (t, e, r) {
        return t = +t, e >>>= 0, r || v(this, t, e, 4, 2147483647, -2147483648), 0 > t && (t = 4294967295 + t + 1), n.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 24, this[e + 1] = t >>> 16, this[e + 2] = t >>> 8, this[e + 3] = t) : b(this, t, e, !1), e + 4
      }, n.prototype.writeFloatLE = function (t, e, r) {
        return E(this, t, e, !0, r)
      }, n.prototype.writeFloatBE = function (t, e, r) {
        return E(this, t, e, !1, r)
      }, n.prototype.writeDoubleLE = function (t, e, r) {
        return T(this, t, e, !0, r)
      }, n.prototype.writeDoubleBE = function (t, e, r) {
        return T(this, t, e, !1, r)
      }, n.prototype.copy = function (t, e, r, i) {
        if (r || (r = 0), i || 0 === i || (i = this.length), e >= t.length && (e = t.length), e || (e = 0), i > 0 && r > i && (i = r), i === r) return 0;
        if (0 === t.length || 0 === this.length) return 0;
        if (0 > e) throw new RangeError("targetStart out of bounds");
        if (0 > r || r >= this.length) throw new RangeError("sourceStart out of bounds");
        if (0 > i) throw new RangeError("sourceEnd out of bounds");
        i > this.length && (i = this.length), t.length - e < i - r && (i = t.length - e + r);
        var s = i - r;
        if (1e3 > s || !n.TYPED_ARRAY_SUPPORT)
          for (var a = 0; s > a; a++) t[a + e] = this[a + r];
        else t._set(this.subarray(r, r + s), e);
        return s
      }, n.prototype.fill = function (t, e, r) {
        if (t || (t = 0), e || (e = 0), r || (r = this.length), e > r) throw new RangeError("end < start");
        if (r !== e && 0 !== this.length) {
          if (0 > e || e >= this.length) throw new RangeError("start out of bounds");
          if (0 > r || r > this.length) throw new RangeError("end out of bounds");
          var n;
          if ("number" == typeof t)
            for (n = e; r > n; n++) this[n] = t;
          else {
            var i = S(t.toString()),
              s = i.length;
            for (n = e; r > n; n++) this[n] = i[n % s]
          }
          return this
        }
      }, n.prototype.toArrayBuffer = function () {
        if ("undefined" != typeof Uint8Array) {
          if (n.TYPED_ARRAY_SUPPORT) return new n(this).buffer;
          for (var t = new Uint8Array(this.length), e = 0, r = t.length; r > e; e += 1) t[e] = this[e];
          return t.buffer
        }
        throw new TypeError("Buffer.toArrayBuffer not supported in this browser")
      };
      var D = n.prototype;
      n._augment = function (t) {
        return t.constructor = n, t._isBuffer = !0, t._set = t.set, t.get = D.get, t.set = D.set, t.write = D.write, t.toString = D.toString, t.toLocaleString = D.toString, t.toJSON = D.toJSON, t.equals = D.equals, t.compare = D.compare, t.indexOf = D.indexOf, t.copy = D.copy, t.slice = D.slice, t.readUIntLE = D.readUIntLE, t.readUIntBE = D.readUIntBE, t.readUInt8 = D.readUInt8, t.readUInt16LE = D.readUInt16LE, t.readUInt16BE = D.readUInt16BE, t.readUInt32LE = D.readUInt32LE, t.readUInt32BE = D.readUInt32BE, t.readIntLE = D.readIntLE, t.readIntBE = D.readIntBE, t.readInt8 = D.readInt8, t.readInt16LE = D.readInt16LE, t.readInt16BE = D.readInt16BE, t.readInt32LE = D.readInt32LE, t.readInt32BE = D.readInt32BE, t.readFloatLE = D.readFloatLE, t.readFloatBE = D.readFloatBE, t.readDoubleLE = D.readDoubleLE, t.readDoubleBE = D.readDoubleBE, t.writeUInt8 = D.writeUInt8, t.writeUIntLE = D.writeUIntLE, t.writeUIntBE = D.writeUIntBE, t.writeUInt16LE = D.writeUInt16LE, t.writeUInt16BE = D.writeUInt16BE, t.writeUInt32LE = D.writeUInt32LE, t.writeUInt32BE = D.writeUInt32BE, t.writeIntLE = D.writeIntLE, t.writeIntBE = D.writeIntBE, t.writeInt8 = D.writeInt8, t.writeInt16LE = D.writeInt16LE, t.writeInt16BE = D.writeInt16BE, t.writeInt32LE = D.writeInt32LE, t.writeInt32BE = D.writeInt32BE, t.writeFloatLE = D.writeFloatLE, t.writeFloatBE = D.writeFloatBE, t.writeDoubleLE = D.writeDoubleLE, t.writeDoubleBE = D.writeDoubleBE, t.fill = D.fill, t.inspect = D.inspect, t.toArrayBuffer = D.toArrayBuffer, t
      };
      var k = /[^+\/0-9A-z\-]/g
    }, {
      "base64-js": 24,
      ieee754: 25,
      "is-array": 26
    }],
    24: [function (t, e, r) {
      var n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      ! function (t) {
        "use strict";

        function e(t) {
          var e = t.charCodeAt(0);
          return e === a || e === l ? 62 : e === o || e === c ? 63 : u > e ? -1 : u + 10 > e ? e - u + 26 + 26 : f + 26 > e ? e - f : h + 26 > e ? e - h + 26 : void 0
        }

        function r(t) {
          function r(t) {
            h[l++] = t
          }
          var n, i, a, o, u, h;
          if (t.length % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
          var f = t.length;
          u = "=" === t.charAt(f - 2) ? 2 : "=" === t.charAt(f - 1) ? 1 : 0, h = new s(3 * t.length / 4 - u), a = u > 0 ? t.length - 4 : t.length;
          var l = 0;
          for (n = 0, i = 0; a > n; n += 4, i += 3) o = e(t.charAt(n)) << 18 | e(t.charAt(n + 1)) << 12 | e(t.charAt(n + 2)) << 6 | e(t.charAt(n + 3)), r((16711680 & o) >> 16), r((65280 & o) >> 8), r(255 & o);
          return 2 === u ? (o = e(t.charAt(n)) << 2 | e(t.charAt(n + 1)) >> 4, r(255 & o)) : 1 === u && (o = e(t.charAt(n)) << 10 | e(t.charAt(n + 1)) << 4 | e(t.charAt(n + 2)) >> 2, r(o >> 8 & 255), r(255 & o)), h
        }

        function i(t) {
          function e(t) {
            return n.charAt(t)
          }

          function r(t) {
            return e(t >> 18 & 63) + e(t >> 12 & 63) + e(t >> 6 & 63) + e(63 & t)
          }
          var i, s, a, o = t.length % 3,
            u = "";
          for (i = 0, a = t.length - o; a > i; i += 3) s = (t[i] << 16) + (t[i + 1] << 8) + t[i + 2], u += r(s);
          switch (o) {
            case 1:
              s = t[t.length - 1], u += e(s >> 2), u += e(s << 4 & 63), u += "==";
              break;
            case 2:
              s = (t[t.length - 2] << 8) + t[t.length - 1], u += e(s >> 10), u += e(s >> 4 & 63), u += e(s << 2 & 63), u += "="
          }
          return u
        }
        var s = "undefined" != typeof Uint8Array ? Uint8Array : Array,
          a = "+".charCodeAt(0),
          o = "/".charCodeAt(0),
          u = "0".charCodeAt(0),
          h = "a".charCodeAt(0),
          f = "A".charCodeAt(0),
          l = "-".charCodeAt(0),
          c = "_".charCodeAt(0);
        t.toByteArray = r, t.fromByteArray = i
      }("undefined" == typeof r ? this.base64js = {} : r)
    }, {}],
    25: [function (t, e, r) {
      r.read = function (t, e, r, n, i) {
        var s, a, o = 8 * i - n - 1,
          u = (1 << o) - 1,
          h = u >> 1,
          f = -7,
          l = r ? i - 1 : 0,
          c = r ? -1 : 1,
          p = t[e + l];
        for (l += c, s = p & (1 << -f) - 1, p >>= -f, f += o; f > 0; s = 256 * s + t[e + l], l += c, f -= 8);
        for (a = s & (1 << -f) - 1, s >>= -f, f += n; f > 0; a = 256 * a + t[e + l], l += c, f -= 8);
        if (0 === s) s = 1 - h;
        else {
          if (s === u) return a ? 0 / 0 : (p ? -1 : 1) * (1 / 0);
          a += Math.pow(2, n), s -= h
        }
        return (p ? -1 : 1) * a * Math.pow(2, s - n)
      }, r.write = function (t, e, r, n, i, s) {
        var a, o, u, h = 8 * s - i - 1,
          f = (1 << h) - 1,
          l = f >> 1,
          c = 23 === i ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
          p = n ? 0 : s - 1,
          d = n ? 1 : -1,
          g = 0 > e || 0 === e && 0 > 1 / e ? 1 : 0;
        for (e = Math.abs(e), isNaN(e) || e === 1 / 0 ? (o = isNaN(e) ? 1 : 0, a = f) : (a = Math.floor(Math.log(e) / Math.LN2), e * (u = Math.pow(2, -a)) < 1 && (a--, u *= 2), e += a + l >= 1 ? c / u : c * Math.pow(2, 1 - l), e * u >= 2 && (a++, u /= 2), a + l >= f ? (o = 0, a = f) : a + l >= 1 ? (o = (e * u - 1) * Math.pow(2, i), a += l) : (o = e * Math.pow(2, l - 1) * Math.pow(2, i), a = 0)); i >= 8; t[r + p] = 255 & o, p += d, o /= 256, i -= 8);
        for (a = a << i | o, h += i; h > 0; t[r + p] = 255 & a, p += d, a /= 256, h -= 8);
        t[r + p - d] |= 128 * g
      }
    }, {}],
    26: [function (t, e, r) {
      var n = Array.isArray,
        i = Object.prototype.toString;
      e.exports = n || function (t) {
        return !!t && "[object Array]" == i.call(t)
      }
    }, {}],
    27: [function (t, e, r) {
      function n() {
        this._events = this._events || {}, this._maxListeners = this._maxListeners || void 0
      }

      function i(t) {
        return "function" == typeof t
      }

      function s(t) {
        return "number" == typeof t
      }

      function a(t) {
        return "object" == typeof t && null !== t
      }

      function o(t) {
        return void 0 === t
      }
      e.exports = n, n.EventEmitter = n, n.prototype._events = void 0, n.prototype._maxListeners = void 0, n.defaultMaxListeners = 10, n.prototype.setMaxListeners = function (t) {
        if (!s(t) || 0 > t || isNaN(t)) throw TypeError("n must be a positive number");
        return this._maxListeners = t, this
      }, n.prototype.emit = function (t) {
        var e, r, n, s, u, h;
        if (this._events || (this._events = {}), "error" === t && (!this._events.error || a(this._events.error) && !this._events.error.length)) {
          if (e = arguments[1], e instanceof Error) throw e;
          throw TypeError('Uncaught, unspecified "error" event.')
        }
        if (r = this._events[t], o(r)) return !1;
        if (i(r)) switch (arguments.length) {
          case 1:
            r.call(this);
            break;
          case 2:
            r.call(this, arguments[1]);
            break;
          case 3:
            r.call(this, arguments[1], arguments[2]);
            break;
          default:
            for (n = arguments.length, s = new Array(n - 1), u = 1; n > u; u++) s[u - 1] = arguments[u];
            r.apply(this, s)
        } else if (a(r)) {
          for (n = arguments.length, s = new Array(n - 1), u = 1; n > u; u++) s[u - 1] = arguments[u];
          for (h = r.slice(), n = h.length, u = 0; n > u; u++) h[u].apply(this, s)
        }
        return !0
      }, n.prototype.addListener = function (t, e) {
        var r;
        if (!i(e)) throw TypeError("listener must be a function");
        if (this._events || (this._events = {}), this._events.newListener && this.emit("newListener", t, i(e.listener) ? e.listener : e), this._events[t] ? a(this._events[t]) ? this._events[t].push(e) : this._events[t] = [this._events[t], e] : this._events[t] = e, a(this._events[t]) && !this._events[t].warned) {
          var r;
          r = o(this._maxListeners) ? n.defaultMaxListeners : this._maxListeners, r && r > 0 && this._events[t].length > r && (this._events[t].warned = !0, console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.", this._events[t].length), "function" == typeof console.trace && console.trace())
        }
        return this
      }, n.prototype.on = n.prototype.addListener, n.prototype.once = function (t, e) {
        function r() {
          this.removeListener(t, r), n || (n = !0, e.apply(this, arguments))
        }
        if (!i(e)) throw TypeError("listener must be a function");
        var n = !1;
        return r.listener = e, this.on(t, r), this
      }, n.prototype.removeListener = function (t, e) {
        var r, n, s, o;
        if (!i(e)) throw TypeError("listener must be a function");
        if (!this._events || !this._events[t]) return this;
        if (r = this._events[t], s = r.length, n = -1, r === e || i(r.listener) && r.listener === e) delete this._events[t], this._events.removeListener && this.emit("removeListener", t, e);
        else if (a(r)) {
          for (o = s; o-- > 0;)
            if (r[o] === e || r[o].listener && r[o].listener === e) {
              n = o;
              break
            }
          if (0 > n) return this;
          1 === r.length ? (r.length = 0, delete this._events[t]) : r.splice(n, 1), this._events.removeListener && this.emit("removeListener", t, e)
        }
        return this
      }, n.prototype.removeAllListeners = function (t) {
        var e, r;
        if (!this._events) return this;
        if (!this._events.removeListener) return 0 === arguments.length ? this._events = {} : this._events[t] && delete this._events[t], this;
        if (0 === arguments.length) {
          for (e in this._events) "removeListener" !== e && this.removeAllListeners(e);
          return this.removeAllListeners("removeListener"), this._events = {}, this
        }
        if (r = this._events[t], i(r)) this.removeListener(t, r);
        else
          for (; r.length;) this.removeListener(t, r[r.length - 1]);
        return delete this._events[t], this
      }, n.prototype.listeners = function (t) {
        var e;
        return e = this._events && this._events[t] ? i(this._events[t]) ? [this._events[t]] : this._events[t].slice() : []
      }, n.listenerCount = function (t, e) {
        var r;
        return r = t._events && t._events[e] ? i(t._events[e]) ? 1 : t._events[e].length : 0
      }
    }, {}],
    28: [function (t, e, r) {
      function n() {
        if (!o) {
          o = !0;
          for (var t, e = a.length; e;) {
            t = a, a = [];
            for (var r = -1; ++r < e;) t[r]();
            e = a.length
          }
          o = !1
        }
      }

      function i() {}
      var s = e.exports = {},
        a = [],
        o = !1;
      s.nextTick = function (t) {
        a.push(t), o || setTimeout(n, 0)
      }, s.title = "browser", s.browser = !0, s.env = {}, s.argv = [], s.version = "", s.versions = {}, s.on = i, s.addListener = i, s.once = i, s.off = i, s.removeListener = i, s.removeAllListeners = i, s.emit = i, s.binding = function (t) {
        throw new Error("process.binding is not supported")
      }, s.cwd = function () {
        return "/"
      }, s.chdir = function (t) {
        throw new Error("process.chdir is not supported")
      }, s.umask = function () {
        return 0
      }
    }, {}],
    29: [function (t, e, r) {
      "use strict";

      function n(t) {
        var e = t.getParameter(t.FRAMEBUFFER_BINDING),
          r = t.getParameter(t.RENDERBUFFER_BINDING),
          n = t.getParameter(t.TEXTURE_BINDING_2D);
        return [e, r, n]
      }

      function i(t, e) {
        t.bindFramebuffer(t.FRAMEBUFFER, e[0]), t.bindRenderbuffer(t.RENDERBUFFER, e[1]), t.bindTexture(t.TEXTURE_2D, e[2])
      }

      function s(t, e) {
        var r = t.getParameter(e.MAX_COLOR_ATTACHMENTS_WEBGL);
        y = new Array(r + 1);
        for (var n = 0; r >= n; ++n) {
          for (var i = new Array(r), s = 0; n > s; ++s) i[s] = t.COLOR_ATTACHMENT0 + s;
          for (var s = n; r > s; ++s) i[s] = t.NONE;
          y[n] = i
        }
      }

      function a(t) {
        switch (t) {
          case g:
            throw new Error("gl-fbo: Framebuffer unsupported");
          case _:
            throw new Error("gl-fbo: Framebuffer incomplete attachment");
          case m:
            throw new Error("gl-fbo: Framebuffer incomplete dimensions");
          case v:
            throw new Error("gl-fbo: Framebuffer incomplete missing attachment");
          default:
            throw new Error("gl-fbo: Framebuffer failed for unspecified reason")
        }
      }

      function o(t, e, r, n, i, s) {
        if (!n) return null;
        var a = d(t, e, r, i, n);
        return a.magFilter = t.NEAREST, a.minFilter = t.NEAREST, a.mipSamples = 1, a.bind(), t.framebufferTexture2D(t.FRAMEBUFFER, s, t.TEXTURE_2D, a.handle, 0), a
      }

      function u(t, e, r, n, i) {
        var s = t.createRenderbuffer();
        return t.bindRenderbuffer(t.RENDERBUFFER, s), t.renderbufferStorage(t.RENDERBUFFER, n, e, r), t.framebufferRenderbuffer(t.FRAMEBUFFER, i, t.RENDERBUFFER, s), s
      }

      function h(t) {
        var e = n(t.gl),
          r = t.gl,
          s = t.handle = r.createFramebuffer(),
          h = t._shape[0],
          f = t._shape[1],
          l = t.color.length,
          c = t._ext,
          d = t._useStencil,
          g = t._useDepth,
          _ = t._colorType,
          m = p(r);
        r.bindFramebuffer(r.FRAMEBUFFER, s);
        for (var v = 0; l > v; ++v) t.color[v] = o(r, h, f, _, r.RGBA, r.COLOR_ATTACHMENT0 + v);
        0 === l ? (t._color_rb = u(r, h, f, r.RGBA4, r.COLOR_ATTACHMENT0), c && c.drawBuffersWEBGL(y[0])) : l > 1 && c.drawBuffersWEBGL(y[numColor]), m.WEBGL_depth_texture ? d ? t.depth = o(r, h, f, m.WEBGL_depth_texture.UNSIGNED_INT_24_8_WEBGL, r.DEPTH_STENCIL, r.DEPTH_STENCIL_ATTACHMENT) : g && (t.depth = o(r, h, f, r.UNSIGNED_SHORT, r.DEPTH_COMPONENT, r.DEPTH_ATTACHMENT)) : g && d ? t._depth_rb = u(r, h, f, r.DEPTH_STENCIL, r.DEPTH_STENCIL_ATTACHMENT) : g ? t._depth_rb = u(r, h, f, r.DEPTH_COMPONENT16, r.DEPTH_ATTACHMENT) : d && (t._depth_rb = u(r, h, f, r.STENCIL_INDEX, r.STENCIL_ATTACHMENT));
        var b = r.checkFramebufferStatus(r.FRAMEBUFFER);
        if (b !== r.FRAMEBUFFER_COMPLETE) {
          t._destroyed = !0, r.bindFramebuffer(r.FRAMEBUFFER, null), r.deleteFramebuffer(t.handle), t.handle = null, t.depth && (t.depth.dispose(), t.depth = null), t._depth_rb && (r.deleteRenderbuffer(t._depth_rb), t._depth_rb = null);
          for (var v = 0; v < t.color.length; ++v) t.color[v].dispose(), t.color[v] = null;
          t._color_rb && (r.deleteRenderbuffer(t._color_rb), t._color_rb = null), i(r, e), a(b)
        }
        i(r, e)
      }

      function f(t, e, r, n, i, s, a, o) {
        p(t);
        this.gl = t, this._shape = [0 | e, 0 | r], this._destroyed = !1, this._ext = o, this.color = new Array(i);
        for (var u = 0; i > u; ++u) this.color[u] = null;
        this._color_rb = null, this.depth = null, this._depth_rb = null, this._colorType = n, this._useDepth = s, this._useStencil = a;
        var f = this,
          l = [0 | e, 0 | r];
        Object.defineProperties(l, {
          0: {
            get: function () {
              return f._shape[0]
            },
            set: function (t) {
              return f.width = t
            }
          },
          1: {
            get: function () {
              return f._shape[1]
            },
            set: function (t) {
              return f.height = t
            }
          }
        }), this._shapeVector = l, h(this)
      }

      function l(t, e, r) {
        if (t._destroyed) throw new Error("gl-fbo: Can't resize destroyed FBO");
        if (t._shape[0] !== e || t._shape[1] !== r) {
          var s = t.gl,
            o = s.getParameter(s.MAX_RENDERBUFFER_SIZE);
          if (0 > e || e > o || 0 > r || r > o) throw new Error("gl-fbo: Can't resize FBO, invalid dimensions");
          t._shape[0] = e, t._shape[1] = r;
          for (var u = n(s), h = 0; h < t.color.length; ++h) t.color[h].shape = t._shape;
          t._color_rb && (s.bindRenderbuffer(s.RENDERBUFFER, t._color_rb), s.renderbufferStorage(s.RENDERBUFFER, s.RGBA4, t._shape[0], t._shape[1])), t.depth && (t.depth.shape = t._shape), t._depth_rb && (s.bindRenderbuffer(s.RENDERBUFFER, t._depth_rb), t._useDepth && t._useStencil ? s.renderbufferStorage(s.RENDERBUFFER, s.DEPTH_STENCIL, t._shape[0], t._shape[1]) : t._useDepth ? s.renderbufferStorage(s.RENDERBUFFER, s.DEPTH_COMPONENT16, t._shape[0], t._shape[1]) : t._useStencil && s.renderbufferStorage(s.RENDERBUFFER, s.STENCIL_INDEX, t._shape[0], t._shape[1])), s.bindFramebuffer(s.FRAMEBUFFER, t.handle);
          var f = s.checkFramebufferStatus(s.FRAMEBUFFER);
          f !== s.FRAMEBUFFER_COMPLETE && (t.dispose(), i(s, u), a(f)), i(s, u)
        }
      }

      function c(t, e, r, n) {
        g || (g = t.FRAMEBUFFER_UNSUPPORTED, _ = t.FRAMEBUFFER_INCOMPLETE_ATTACHMENT, m = t.FRAMEBUFFER_INCOMPLETE_DIMENSIONS, v = t.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT);
        var i = p(t);
        if (!y && i.WEBGL_draw_buffers && s(t, i.WEBGL_draw_buffers), Array.isArray(e) && (n = r, r = 0 | e[1], e = 0 | e[0]), "number" != typeof e) throw new Error("gl-fbo: Missing shape parameter");
        var a = t.getParameter(t.MAX_RENDERBUFFER_SIZE);
        if (0 > e || e > a || 0 > r || r > a) throw new Error("gl-fbo: Parameters are too large for FBO");
        n = n || {};
        var o = 1;
        if ("color" in n) {
          if (o = Math.max(0 | n.color, 0), 0 > o) throw new Error("gl-fbo: Must specify a nonnegative number of colors");
          if (o > 1) {
            var u = i.WEBGL_draw_buffers;
            if (!u) throw new Error("gl-fbo: Multiple draw buffer extension not supported");
            if (o > t.getParameter(u.MAX_COLOR_ATTACHMENTS_WEBGL)) throw new Error("gl-fbo: Context does not support " + o + " draw buffers")
          }
        }
        var h = t.UNSIGNED_BYTE;
        if (n["float"] && o > 0) {
          if (!i.OES_texture_float) throw new Error("gl-fbo: Context does not support floating point textures");
          h = t.FLOAT
        } else n.preferFloat && o > 0 && i.OES_texture_float && (h = t.FLOAT);
        var l = !0;
        "depth" in n && (l = !!n.depth);
        var c = !1;
        return "stencil" in n && (c = !!n.stencil), new f(t, e, r, h, o, l, c, i.WEBGL_draw_buffers)
      }
      var p = t("webglew"),
        d = t("gl-texture2d");
      e.exports = c;
      var g, _, m, v, y = null,
        b = f.prototype;
      Object.defineProperties(b, {
        shape: {
          get: function () {
            return this._destroyed ? [0, 0] : this._shapeVector
          },
          set: function (t) {
            if (Array.isArray(t) || (t = [0 | t, 0 | t]), 2 !== t.length) throw new Error("gl-fbo: Shape vector must be length 2");
            var e = 0 | t[0],
              r = 0 | t[1];
            return l(this, e, r), [e, r]
          },
          enumerable: !1
        },
        width: {
          get: function () {
            return this._destroyed ? 0 : this._shape[0]
          },
          set: function (t) {
            return t = 0 | t, l(this, t, this._shape[1]), t
          },
          enumerable: !1
        },
        height: {
          get: function () {
            return this._destroyed ? 0 : this._shape[1]
          },
          set: function (t) {
            return t = 0 | t, l(this, this._shape[0], t), t
          },
          enumerable: !1
        }
      }), b.bind = function () {
        if (!this._destroyed) {
          var t = this.gl;
          t.bindFramebuffer(t.FRAMEBUFFER, this.handle), t.viewport(0, 0, this._shape[0], this._shape[1])
        }
      }, b.dispose = function () {
        if (!this._destroyed) {
          this._destroyed = !0;
          var t = this.gl;
          t.deleteFramebuffer(this.handle), this.handle = null, this.depth && (this.depth.dispose(), this.depth = null), this._depth_rb && (t.deleteRenderbuffer(this._depth_rb), this._depth_rb = null);
          for (var e = 0; e < this.color.length; ++e) this.color[e].dispose(), this.color[e] = null;
          this._color_rb && (t.deleteRenderbuffer(this._color_rb), this._color_rb = null)
        }
      }
    }, {
      "gl-texture2d": 47,
      webglew: 62
    }],
    30: [function (t, e, r) {
      "use strict";

      function n(t) {
        this.gl = t, this._vref = this._fref = this._relink = this.vertShader = this.fragShader = this.program = this.attributes = this.uniforms = this.types = null
      }

      function i(t, e) {
        return t.name < e.name ? -1 : 1
      }

      function s(t, e, r, i, s) {
        var a = new n(t);
        return a.update(e, r, i, s), a
      }
      var a = t("./lib/create-uniforms"),
        o = t("./lib/create-attributes"),
        u = t("./lib/reflect"),
        h = t("./lib/shader-cache"),
        f = t("./lib/runtime-reflect"),
        l = n.prototype;
      l.bind = function () {
        this.program || this._relink(), this.gl.useProgram(this.program)
      }, l.dispose = function () {
        this._fref && this._fref.dispose(), this._vref && this._vref.dispose(), this.attributes = this.types = this.vertShader = this.fragShader = this.program = this._relink = this._fref = this._vref = null
      }, l.update = function (t, e, r, n) {
        function s() {
          c.program = h.program(p, c._vref, c._fref, y, b);
          for (var t = 0; t < r.length; ++t) I[t] = p.getUniformLocation(c.program, r[t].name)
        }
        if (!e || 1 === arguments.length) {
          var l = t;
          t = l.vertex, e = l.fragment, r = l.uniforms, n = l.attributes
        }
        var c = this,
          p = c.gl,
          d = c._vref;
        c._vref = h.shader(p, p.VERTEX_SHADER, t), d && d.dispose(), c.vertShader = c._vref.shader;
        var g = this._fref;
        if (c._fref = h.shader(p, p.FRAGMENT_SHADER, e), g && g.dispose(), c.fragShader = c._fref.shader, !r || !n) {
          var _ = p.createProgram();
          if (p.attachShader(_, c.fragShader), p.attachShader(_, c.vertShader), p.linkProgram(_), !p.getProgramParameter(_, p.LINK_STATUS)) {
            var m = p.getProgramInfoLog(_);
            throw console.error("gl-shader: Error linking program:", m), new Error("gl-shader: Error linking program:" + m)
          }
          r = r || f.uniforms(p, _), n = n || f.attributes(p, _), p.deleteProgram(_)
        }
        n = n.slice(), n.sort(i);
        for (var v = [], y = [], b = [], w = 0; w < n.length; ++w) {
          var E = n[w];
          if (E.type.indexOf("mat") >= 0) {
            for (var T = 0 | E.type.charAt(E.type.length - 1), A = new Array(T), R = 0; T > R; ++R) A[R] = b.length, y.push(E.name + "[" + R + "]"), b.push("number" == typeof E.location ? E.location + R : Array.isArray(E.location) && E.location.length === T && "number" == typeof E.location[R] ? 0 | E.location[R] : -1);
            v.push({
              name: E.name,
              type: E.type,
              locations: A
            })
          } else v.push({
            name: E.name,
            type: E.type,
            locations: [b.length]
          }), y.push(E.name), b.push("number" == typeof E.location ? 0 | E.location : -1)
        }
        for (var x = 0, w = 0; w < b.length; ++w)
          if (b[w] < 0) {
            for (; b.indexOf(x) >= 0;) x += 1;
            b[w] = x
          }
        var I = new Array(r.length);
        s(), c._relink = s, c.types = {
          uniforms: u(r),
          attributes: u(n)
        }, c.attributes = o(p, c, v, b), Object.defineProperty(c, "uniforms", a(p, c, r, I))
      }, e.exports = s
    }, {
      "./lib/create-attributes": 31,
      "./lib/create-uniforms": 32,
      "./lib/reflect": 33,
      "./lib/runtime-reflect": 34,
      "./lib/shader-cache": 35
    }],
    31: [function (t, e, r) {
      "use strict";

      function n(t, e, r, n, i, s) {
        this._gl = t, this._wrapper = e, this._index = r, this._locations = n, this._dimension = i, this._constFunc = s
      }

      function i(t, e, r, i, s, a, o) {
        for (var u = ["gl", "v"], h = [], f = 0; s > f; ++f) u.push("x" + f), h.push("x" + f);
        u.push("if(x0.length===void 0){return gl.vertexAttrib" + s + "f(v," + h.join() + ")}else{return gl.vertexAttrib" + s + "fv(v,x0)}");
        var l = Function.apply(null, u),
          c = new n(t, e, r, i, s, l);
        Object.defineProperty(a, o, {
          set: function (e) {
            return t.disableVertexAttribArray(i[r]), l(t, i[r], e), e
          },
          get: function () {
            return c
          },
          enumerable: !0
        })
      }

      function s(t, e, r, n, s, a, o) {
        for (var u = new Array(s), h = new Array(s), f = 0; s > f; ++f) i(t, e, r[f], n, s, u, f), h[f] = u[f];
        Object.defineProperty(u, "location", {
          set: function (t) {
            if (Array.isArray)
              for (var e = 0; s > e; ++e) h[e].location = t[e];
            else
              for (var e = 0; s > e; ++e) result[e] = h[e].location = t + e;
            return t
          },
          get: function () {
            for (var t = new Array(s), e = 0; s > e; ++e) t[e] = n[r[e]];
            return t
          },
          enumerable: !0
        }), u.pointer = function (e, i, a, o) {
          e = e || t.FLOAT, i = !!i, a = a || s * s, o = o || 0;
          for (var u = 0; s > u; ++u) {
            var h = n[r[u]];
            t.vertexAttribPointer(h, s, e, i, a, o + u * s), t.enableVertexAttribArray(h)
          }
        };
        var l = new Array(s),
          c = t["vertexAttrib" + s + "fv"];
        Object.defineProperty(a, o, {
          set: function (e) {
            for (var i = 0; s > i; ++i) {
              var a = n[r[i]];
              if (t.disableVertexAttribArray(a), Array.isArray(e[0])) c.call(t, a, e[i]);
              else {
                for (var o = 0; s > o; ++o) l[o] = e[s * i + o];
                c.call(t, a, l)
              }
            }
            return e
          },
          get: function () {
            return u
          },
          enumerable: !0
        })
      }

      function a(t, e, r, n) {
        for (var a = {}, o = 0, u = r.length; u > o; ++o) {
          var h = r[o],
            f = h.name,
            l = h.type,
            c = h.locations;
          switch (l) {
            case "bool":
            case "int":
            case "float":
              i(t, e, c[0], n, 1, a, f);
              break;
            default:
              if (l.indexOf("vec") >= 0) {
                var p = l.charCodeAt(l.length - 1) - 48;
                if (2 > p || p > 4) throw new Error("gl-shader: Invalid data type for attribute " + f + ": " + l);
                i(t, e, c[0], n, p, a, f)
              } else {
                if (!(l.indexOf("mat") >= 0)) throw new Error("gl-shader: Unknown data type for attribute " + f + ": " + l);
                var p = l.charCodeAt(l.length - 1) - 48;
                if (2 > p || p > 4) throw new Error("gl-shader: Invalid data type for attribute " + f + ": " + l);
                s(t, e, c, n, p, a, f)
              }
          }
        }
        return a
      }
      e.exports = a;
      var o = n.prototype;
      o.pointer = function (t, e, r, n) {
        var i = this,
          s = i._gl,
          a = i._locations[i._index];
        s.vertexAttribPointer(a, i._dimension, t || s.FLOAT, !!e, r || 0, n || 0), s.enableVertexAttribArray(a)
      }, o.set = function (t, e, r, n) {
        return this._constFunc(this._locations[this._index], t, e, r, n)
      }, Object.defineProperty(o, "location", {
        get: function () {
          return this._locations[this._index]
        },
        set: function (t) {
          return t !== this._locations[this._index] && (this._locations[this._index] = 0 | t, this._wrapper.program = null), 0 | t
        }
      })
    }, {}],
    32: [function (t, e, r) {
      "use strict";

      function n(t) {
        var e = new Function("y", "return function(){return y}");
        return e(t)
      }

      function i(t, e) {
        for (var r = new Array(t), n = 0; t > n; ++n) r[n] = e;
        return r
      }

      function s(t, e, r, s) {
        function o(r) {
          var n = new Function("gl", "wrapper", "locations", "return function(){return gl.getUniform(wrapper.program,locations[" + r + "])}");
          return n(t, e, s)
        }

        function u(t, e, r) {
          switch (r) {
            case "bool":
            case "int":
            case "sampler2D":
            case "samplerCube":
              return "gl.uniform1i(locations[" + e + "],obj" + t + ")";
            case "float":
              return "gl.uniform1f(locations[" + e + "],obj" + t + ")";
            default:
              var n = r.indexOf("vec");
              if (!(n >= 0 && 1 >= n && r.length === 4 + n)) {
                if (0 === r.indexOf("mat") && 4 === r.length) {
                  var i = r.charCodeAt(r.length - 1) - 48;
                  if (2 > i || i > 4) throw new Error("gl-shader: Invalid uniform dimension type for matrix " + name + ": " + r);
                  return "gl.uniformMatrix" + i + "fv(locations[" + e + "],false,obj" + t + ")"
                }
                throw new Error("gl-shader: Unknown uniform data type for " + name + ": " + r)
              }
              var i = r.charCodeAt(r.length - 1) - 48;
              if (2 > i || i > 4) throw new Error("gl-shader: Invalid data type");

              switch (r.charAt(0)) {
                case "b":
                case "i":
                  return "gl.uniform" + i + "iv(locations[" + e + "],obj" + t + ")";
                case "v":
                  return "gl.uniform" + i + "fv(locations[" + e + "],obj" + t + ")";
                default:
                  throw new Error("gl-shader: Unrecognized data type for vector " + name + ": " + r)
              }
          }
        }

        function h(t, e) {
          if ("object" != typeof e) return [
            [t, e]
          ];
          var r = [];
          for (var n in e) {
            var i = e[n],
              s = t;
            s += parseInt(n) + "" === n ? "[" + n + "]" : "." + n, "object" == typeof i ? r.push.apply(r, h(s, i)) : r.push([s, i])
          }
          return r
        }

        function f(e) {
          for (var n = ["return function updateProperty(obj){"], i = h("", e), a = 0; a < i.length; ++a) {
            var o = i[a],
              f = o[0],
              l = o[1];
            s[l] && n.push(u(f, l, r[l].type))
          }
          n.push("return obj}");
          var c = new Function("gl", "locations", n.join("\n"));
          return c(t, s)
        }

        function l(t) {
          switch (t) {
            case "bool":
              return !1;
            case "int":
            case "sampler2D":
            case "samplerCube":
              return 0;
            case "float":
              return 0;
            default:
              var e = t.indexOf("vec");
              if (e >= 0 && 1 >= e && t.length === 4 + e) {
                var r = t.charCodeAt(t.length - 1) - 48;
                if (2 > r || r > 4) throw new Error("gl-shader: Invalid data type");
                return "b" === t.charAt(0) ? i(r, !1) : i(r, 0)
              }
              if (0 === t.indexOf("mat") && 4 === t.length) {
                var r = t.charCodeAt(t.length - 1) - 48;
                if (2 > r || r > 4) throw new Error("gl-shader: Invalid uniform dimension type for matrix " + name + ": " + t);
                return i(r * r, 0)
              }
              throw new Error("gl-shader: Unknown uniform data type for " + name + ": " + t)
          }
        }

        function c(t, e, i) {
          if ("object" == typeof i) {
            var a = p(i);
            Object.defineProperty(t, e, {
              get: n(a),
              set: f(i),
              enumerable: !0,
              configurable: !1
            })
          } else s[i] ? Object.defineProperty(t, e, {
            get: o(i),
            set: f(i),
            enumerable: !0,
            configurable: !1
          }) : t[e] = l(r[i].type)
        }

        function p(t) {
          var e;
          if (Array.isArray(t)) {
            e = new Array(t.length);
            for (var r = 0; r < t.length; ++r) c(e, r, t[r])
          } else {
            e = {};
            for (var n in t) c(e, n, t[n])
          }
          return e
        }
        var d = a(r, !0);
        return {
          get: n(p(d)),
          set: f(d),
          enumerable: !0,
          configurable: !0
        }
      }
      var a = t("./reflect");
      e.exports = s
    }, {
      "./reflect": 33
    }],
    33: [function (t, e, r) {
      "use strict";

      function n(t, e) {
        for (var r = {}, n = 0; n < t.length; ++n)
          for (var i = t[n].name, s = i.split("."), a = r, o = 0; o < s.length; ++o) {
            var u = s[o].split("[");
            if (u.length > 1) {
              u[0] in a || (a[u[0]] = []), a = a[u[0]];
              for (var h = 1; h < u.length; ++h) {
                var f = parseInt(u[h]);
                h < u.length - 1 || o < s.length - 1 ? (f in a || (h < u.length - 1 ? a[f] = [] : a[f] = {}), a = a[f]) : e ? a[f] = n : a[f] = t[n].type
              }
            } else o < s.length - 1 ? (u[0] in a || (a[u[0]] = {}), a = a[u[0]]) : e ? a[u[0]] = n : a[u[0]] = t[n].type
          }
        return r
      }
      e.exports = n
    }, {}],
    34: [function (t, e, r) {
      "use strict";

      function n(t, e) {
        if (!o) {
          var r = Object.keys(a);
          o = {};
          for (var n = 0; n < r.length; ++n) {
            var i = r[n];
            o[t[i]] = a[i]
          }
        }
        return o[e]
      }

      function i(t, e) {
        for (var r = t.getProgramParameter(e, t.ACTIVE_UNIFORMS), i = [], s = 0; r > s; ++s) {
          var a = t.getActiveUniform(e, s);
          a && i.push({
            name: a.name,
            type: n(t, a.type)
          })
        }
        return i
      }

      function s(t, e) {
        for (var r = t.getProgramParameter(e, t.ACTIVE_ATTRIBUTES), i = [], s = 0; r > s; ++s) {
          var a = t.getActiveAttrib(e, s);
          a && i.push({
            name: a.name,
            type: n(t, a.type)
          })
        }
        return i
      }
      r.uniforms = i, r.attributes = s;
      var a = {
          FLOAT: "float",
          FLOAT_VEC2: "vec2",
          FLOAT_VEC3: "vec3",
          FLOAT_VEC4: "vec4",
          INT: "int",
          INT_VEC2: "ivec2",
          INT_VEC3: "ivec3",
          INT_VEC4: "ivec4",
          BOOL: "bool",
          BOOL_VEC2: "bvec2",
          BOOL_VEC3: "bvec3",
          BOOL_VEC4: "bvec4",
          FLOAT_MAT2: "mat2",
          FLOAT_MAT3: "mat3",
          FLOAT_MAT4: "mat4",
          SAMPLER_2D: "sampler2D",
          SAMPLER_CUBE: "samplerCube"
        },
        o = null
    }, {}],
    35: [function (t, e, r) {
      "use strict";

      function n(t, e, r, n, i, s, a) {
        this.id = t, this.src = e, this.type = r, this.shader = n, this.count = s, this.programs = [], this.cache = a
      }

      function i(t) {
        this.gl = t, this.shaders = [{}, {}], this.programs = {}
      }

      function s(t, e, r) {
        var n = t.createShader(e);
        if (t.shaderSource(n, r), t.compileShader(n), !t.getShaderParameter(n, t.COMPILE_STATUS)) {
          var i = t.getShaderInfoLog(n);
          throw console.error("gl-shader: Error compiling shader:", i), new Error("gl-shader: Error compiling shader:" + i)
        }
        return n
      }

      function a(t, e, r, n, i) {
        var s = t.createProgram();
        t.attachShader(s, e), t.attachShader(s, r);
        for (var a = 0; a < n.length; ++a) t.bindAttribLocation(s, i[a], n[a]);
        if (t.linkProgram(s), !t.getProgramParameter(s, t.LINK_STATUS)) {
          var o = t.getProgramInfoLog(s);
          throw console.error("gl-shader: Error linking program:", o), new Error("gl-shader: Error linking program:" + o)
        }
        return s
      }

      function o(t) {
        var e = l.get(t);
        return e || (e = new i(t), l.set(t, e)), e
      }

      function u(t, e, r) {
        return o(t).getShaderReference(e, r)
      }

      function h(t, e, r, n, i) {
        return o(t).getProgram(e, r, n, i)
      }
      r.shader = u, r.program = h;
      var f = "undefined" == typeof WeakMap ? t("weakmap-shim") : WeakMap,
        l = new f,
        c = 0;
      n.prototype.dispose = function () {
        if (0 === --this.count) {
          for (var t = this.cache, e = t.gl, r = this.programs, n = 0, i = r.length; i > n; ++n) {
            var s = t.programs[r[n]];
            s && (delete t.programs[n], e.deleteProgram(s))
          }
          e.deleteShader(this.shader), delete t.shaders[this.type === e.FRAGMENT_SHADER | 0][this.src]
        }
      };
      var p = i.prototype;
      p.getShaderReference = function (t, e) {
        var r = this.gl,
          i = this.shaders[t === r.FRAGMENT_SHADER | 0],
          a = i[e];
        if (a) a.count += 1;
        else {
          var o = s(r, t, e);
          a = i[e] = new n(c++, e, t, o, [], 1, this)
        }
        return a
      }, p.getProgram = function (t, e, r, n) {
        var i = [t.id, e.id, r.join(":"), n.join(":")].join("@"),
          s = this.programs[i];
        return s || (this.programs[i] = s = a(this.gl, t.shader, e.shader, r, n), t.programs.push(i), e.programs.push(i)), s
      }
    }, {
      "weakmap-shim": 38
    }],
    36: [function (t, e, r) {
      function n() {
        var t = {};
        return function (e) {
          if (("object" != typeof e || null === e) && "function" != typeof e) throw new Error("Weakmap-shim: Key must be object");
          var r = e.valueOf(t);
          return r && r.identity === t ? r : i(e, t)
        }
      }
      var i = t("./hidden-store.js");
      e.exports = n
    }, {
      "./hidden-store.js": 37
    }],
    37: [function (t, e, r) {
      function n(t, e) {
        var r = {
            identity: e
          },
          n = t.valueOf;
        return Object.defineProperty(t, "valueOf", {
          value: function (t) {
            return t !== e ? n.apply(this, arguments) : r
          },
          writable: !0
        }), r
      }
      e.exports = n
    }, {}],
    38: [function (t, e, r) {
      function n() {
        var t = i();
        return {
          get: function (e, r) {
            var n = t(e);
            return n.hasOwnProperty("value") ? n.value : r
          },
          set: function (e, r) {
            t(e).value = r
          },
          has: function (e) {
            return "value" in t(e)
          },
          "delete": function (e) {
            return delete t(e).value
          }
        }
      }
      var i = t("./create-store.js");
      e.exports = n
    }, {
      "./create-store.js": 36
    }],
    39: [function (t, e, r) {
      "use strict";

      function n(t) {
        if (!t) return o;
        for (var e = 0; e < t.args.length; ++e) {
          var r = t.args[e];
          0 === e ? t.args[e] = {
            name: r,
            lvalue: !0,
            rvalue: !!t.rvalue,
            count: t.count || 1
          } : t.args[e] = {
            name: r,
            lvalue: !1,
            rvalue: !0,
            count: 1
          }
        }
        return t.thisVars || (t.thisVars = []), t.localVars || (t.localVars = []), t
      }

      function i(t) {
        return a({
          args: t.args,
          pre: n(t.pre),
          body: n(t.body),
          post: n(t.proc),
          funcName: t.funcName
        })
      }

      function s(t) {
        for (var e = [], r = 0; r < t.args.length; ++r) e.push("a" + r);
        var n = new Function("P", ["return function ", t.funcName, "_ndarrayops(", e.join(","), ") {P(", e.join(","), ");return a0}"].join(""));
        return n(i(t))
      }
      var a = t("cwise-compiler"),
        o = {
          body: "",
          args: [],
          thisVars: [],
          localVars: []
        },
        u = {
          add: "+",
          sub: "-",
          mul: "*",
          div: "/",
          mod: "%",
          band: "&",
          bor: "|",
          bxor: "^",
          lshift: "<<",
          rshift: ">>",
          rrshift: ">>>"
        };
      ! function () {
        for (var t in u) {
          var e = u[t];
          r[t] = s({
            args: ["array", "array", "array"],
            body: {
              args: ["a", "b", "c"],
              body: "a=b" + e + "c"
            },
            funcName: t
          }), r[t + "eq"] = s({
            args: ["array", "array"],
            body: {
              args: ["a", "b"],
              body: "a" + e + "=b"
            },
            rvalue: !0,
            funcName: t + "eq"
          }), r[t + "s"] = s({
            args: ["array", "array", "scalar"],
            body: {
              args: ["a", "b", "s"],
              body: "a=b" + e + "s"
            },
            funcName: t + "s"
          }), r[t + "seq"] = s({
            args: ["array", "scalar"],
            body: {
              args: ["a", "s"],
              body: "a" + e + "=s"
            },
            rvalue: !0,
            funcName: t + "seq"
          })
        }
      }();
      var h = {
        not: "!",
        bnot: "~",
        neg: "-",
        recip: "1.0/"
      };
      ! function () {
        for (var t in h) {
          var e = h[t];
          r[t] = s({
            args: ["array", "array"],
            body: {
              args: ["a", "b"],
              body: "a=" + e + "b"
            },
            funcName: t
          }), r[t + "eq"] = s({
            args: ["array"],
            body: {
              args: ["a"],
              body: "a=" + e + "a"
            },
            rvalue: !0,
            count: 2,
            funcName: t + "eq"
          })
        }
      }();
      var f = {
        and: "&&",
        or: "||",
        eq: "===",
        neq: "!==",
        lt: "<",
        gt: ">",
        leq: "<=",
        geq: ">="
      };
      ! function () {
        for (var t in f) {
          var e = f[t];
          r[t] = s({
            args: ["array", "array", "array"],
            body: {
              args: ["a", "b", "c"],
              body: "a=b" + e + "c"
            },
            funcName: t
          }), r[t + "s"] = s({
            args: ["array", "array", "scalar"],
            body: {
              args: ["a", "b", "s"],
              body: "a=b" + e + "s"
            },
            funcName: t + "s"
          }), r[t + "eq"] = s({
            args: ["array", "array"],
            body: {
              args: ["a", "b"],
              body: "a=a" + e + "b"
            },
            rvalue: !0,
            count: 2,
            funcName: t + "eq"
          }), r[t + "seq"] = s({
            args: ["array", "scalar"],
            body: {
              args: ["a", "s"],
              body: "a=a" + e + "s"
            },
            rvalue: !0,
            count: 2,
            funcName: t + "seq"
          })
        }
      }();
      var l = ["abs", "acos", "asin", "atan", "ceil", "cos", "exp", "floor", "log", "round", "sin", "sqrt", "tan"];
      ! function () {
        for (var t = 0; t < l.length; ++t) {
          var e = l[t];
          r[e] = s({
            args: ["array", "array"],
            pre: {
              args: [],
              body: "this_f=Math." + e,
              thisVars: ["this_f"]
            },
            body: {
              args: ["a", "b"],
              body: "a=this_f(b)",
              thisVars: ["this_f"]
            },
            funcName: e
          }), r[e + "eq"] = s({
            args: ["array"],
            pre: {
              args: [],
              body: "this_f=Math." + e,
              thisVars: ["this_f"]
            },
            body: {
              args: ["a"],
              body: "a=this_f(a)",
              thisVars: ["this_f"]
            },
            rvalue: !0,
            count: 2,
            funcName: e + "eq"
          })
        }
      }();
      var c = ["max", "min", "atan2", "pow"];
      ! function () {
        for (var t = 0; t < c.length; ++t) {
          var e = c[t];
          r[e] = s({
            args: ["array", "array", "array"],
            pre: {
              args: [],
              body: "this_f=Math." + e,
              thisVars: ["this_f"]
            },
            body: {
              args: ["a", "b", "c"],
              body: "a=this_f(b,c)",
              thisVars: ["this_f"]
            },
            funcName: e
          }), r[e + "s"] = s({
            args: ["array", "array", "scalar"],
            pre: {
              args: [],
              body: "this_f=Math." + e,
              thisVars: ["this_f"]
            },
            body: {
              args: ["a", "b", "c"],
              body: "a=this_f(b,c)",
              thisVars: ["this_f"]
            },
            funcName: e + "s"
          }), r[e + "eq"] = s({
            args: ["array", "array"],
            pre: {
              args: [],
              body: "this_f=Math." + e,
              thisVars: ["this_f"]
            },
            body: {
              args: ["a", "b"],
              body: "a=this_f(a,b)",
              thisVars: ["this_f"]
            },
            rvalue: !0,
            count: 2,
            funcName: e + "eq"
          }), r[e + "seq"] = s({
            args: ["array", "scalar"],
            pre: {
              args: [],
              body: "this_f=Math." + e,
              thisVars: ["this_f"]
            },
            body: {
              args: ["a", "b"],
              body: "a=this_f(a,b)",
              thisVars: ["this_f"]
            },
            rvalue: !0,
            count: 2,
            funcName: e + "seq"
          })
        }
      }();
      var p = ["atan2", "pow"];
      ! function () {
        for (var t = 0; t < p.length; ++t) {
          var e = p[t];
          r[e + "op"] = s({
            args: ["array", "array", "array"],
            pre: {
              args: [],
              body: "this_f=Math." + e,
              thisVars: ["this_f"]
            },
            body: {
              args: ["a", "b", "c"],
              body: "a=this_f(c,b)",
              thisVars: ["this_f"]
            },
            funcName: e + "op"
          }), r[e + "ops"] = s({
            args: ["array", "array", "scalar"],
            pre: {
              args: [],
              body: "this_f=Math." + e,
              thisVars: ["this_f"]
            },
            body: {
              args: ["a", "b", "c"],
              body: "a=this_f(c,b)",
              thisVars: ["this_f"]
            },
            funcName: e + "ops"
          }), r[e + "opeq"] = s({
            args: ["array", "array"],
            pre: {
              args: [],
              body: "this_f=Math." + e,
              thisVars: ["this_f"]
            },
            body: {
              args: ["a", "b"],
              body: "a=this_f(b,a)",
              thisVars: ["this_f"]
            },
            rvalue: !0,
            count: 2,
            funcName: e + "opeq"
          }), r[e + "opseq"] = s({
            args: ["array", "scalar"],
            pre: {
              args: [],
              body: "this_f=Math." + e,
              thisVars: ["this_f"]
            },
            body: {
              args: ["a", "b"],
              body: "a=this_f(b,a)",
              thisVars: ["this_f"]
            },
            rvalue: !0,
            count: 2,
            funcName: e + "opseq"
          })
        }
      }(), r.any = a({
        args: ["array"],
        pre: o,
        body: {
          args: [{
            name: "a",
            lvalue: !1,
            rvalue: !0,
            count: 1
          }],
          body: "if(a){return true}",
          localVars: [],
          thisVars: []
        },
        post: {
          args: [],
          localVars: [],
          thisVars: [],
          body: "return false"
        },
        funcName: "any"
      }), r.all = a({
        args: ["array"],
        pre: o,
        body: {
          args: [{
            name: "x",
            lvalue: !1,
            rvalue: !0,
            count: 1
          }],
          body: "if(!x){return false}",
          localVars: [],
          thisVars: []
        },
        post: {
          args: [],
          localVars: [],
          thisVars: [],
          body: "return true"
        },
        funcName: "all"
      }), r.sum = a({
        args: ["array"],
        pre: {
          args: [],
          localVars: [],
          thisVars: ["this_s"],
          body: "this_s=0"
        },
        body: {
          args: [{
            name: "a",
            lvalue: !1,
            rvalue: !0,
            count: 1
          }],
          body: "this_s+=a",
          localVars: [],
          thisVars: ["this_s"]
        },
        post: {
          args: [],
          localVars: [],
          thisVars: ["this_s"],
          body: "return this_s"
        },
        funcName: "sum"
      }), r.prod = a({
        args: ["array"],
        pre: {
          args: [],
          localVars: [],
          thisVars: ["this_s"],
          body: "this_s=1"
        },
        body: {
          args: [{
            name: "a",
            lvalue: !1,
            rvalue: !0,
            count: 1
          }],
          body: "this_s*=a",
          localVars: [],
          thisVars: ["this_s"]
        },
        post: {
          args: [],
          localVars: [],
          thisVars: ["this_s"],
          body: "return this_s"
        },
        funcName: "prod"
      }), r.norm2squared = a({
        args: ["array"],
        pre: {
          args: [],
          localVars: [],
          thisVars: ["this_s"],
          body: "this_s=0"
        },
        body: {
          args: [{
            name: "a",
            lvalue: !1,
            rvalue: !0,
            count: 2
          }],
          body: "this_s+=a*a",
          localVars: [],
          thisVars: ["this_s"]
        },
        post: {
          args: [],
          localVars: [],
          thisVars: ["this_s"],
          body: "return this_s"
        },
        funcName: "norm2squared"
      }), r.norm2 = a({
        args: ["array"],
        pre: {
          args: [],
          localVars: [],
          thisVars: ["this_s"],
          body: "this_s=0"
        },
        body: {
          args: [{
            name: "a",
            lvalue: !1,
            rvalue: !0,
            count: 2
          }],
          body: "this_s+=a*a",
          localVars: [],
          thisVars: ["this_s"]
        },
        post: {
          args: [],
          localVars: [],
          thisVars: ["this_s"],
          body: "return Math.sqrt(this_s)"
        },
        funcName: "norm2"
      }), r.norminf = a({
        args: ["array"],
        pre: {
          args: [],
          localVars: [],
          thisVars: ["this_s"],
          body: "this_s=0"
        },
        body: {
          args: [{
            name: "a",
            lvalue: !1,
            rvalue: !0,
            count: 4
          }],
          body: "if(-a>this_s){this_s=-a}else if(a>this_s){this_s=a}",
          localVars: [],
          thisVars: ["this_s"]
        },
        post: {
          args: [],
          localVars: [],
          thisVars: ["this_s"],
          body: "return this_s"
        },
        funcName: "norminf"
      }), r.norm1 = a({
        args: ["array"],
        pre: {
          args: [],
          localVars: [],
          thisVars: ["this_s"],
          body: "this_s=0"
        },
        body: {
          args: [{
            name: "a",
            lvalue: !1,
            rvalue: !0,
            count: 3
          }],
          body: "this_s+=a<0?-a:a",
          localVars: [],
          thisVars: ["this_s"]
        },
        post: {
          args: [],
          localVars: [],
          thisVars: ["this_s"],
          body: "return this_s"
        },
        funcName: "norm1"
      }), r.sup = a({
        args: ["array"],
        pre: {
          body: "this_h=-Infinity",
          args: [],
          thisVars: ["this_h"],
          localVars: []
        },
        body: {
          body: "if(_inline_1_arg0_>this_h)this_h=_inline_1_arg0_",
          args: [{
            name: "_inline_1_arg0_",
            lvalue: !1,
            rvalue: !0,
            count: 2
          }],
          thisVars: ["this_h"],
          localVars: []
        },
        post: {
          body: "return this_h",
          args: [],
          thisVars: ["this_h"],
          localVars: []
        }
      }), r.inf = a({
        args: ["array"],
        pre: {
          body: "this_h=Infinity",
          args: [],
          thisVars: ["this_h"],
          localVars: []
        },
        body: {
          body: "if(_inline_1_arg0_<this_h)this_h=_inline_1_arg0_",
          args: [{
            name: "_inline_1_arg0_",
            lvalue: !1,
            rvalue: !0,
            count: 2
          }],
          thisVars: ["this_h"],
          localVars: []
        },
        post: {
          body: "return this_h",
          args: [],
          thisVars: ["this_h"],
          localVars: []
        }
      }), r.argmin = a({
        args: ["index", "array", "shape"],
        pre: {
          body: "{this_v=Infinity;this_i=_inline_0_arg2_.slice(0)}",
          args: [{
            name: "_inline_0_arg0_",
            lvalue: !1,
            rvalue: !1,
            count: 0
          }, {
            name: "_inline_0_arg1_",
            lvalue: !1,
            rvalue: !1,
            count: 0
          }, {
            name: "_inline_0_arg2_",
            lvalue: !1,
            rvalue: !0,
            count: 1
          }],
          thisVars: ["this_i", "this_v"],
          localVars: []
        },
        body: {
          body: "{if(_inline_1_arg1_<this_v){this_v=_inline_1_arg1_;for(var _inline_1_k=0;_inline_1_k<_inline_1_arg0_.length;++_inline_1_k){this_i[_inline_1_k]=_inline_1_arg0_[_inline_1_k]}}}",
          args: [{
            name: "_inline_1_arg0_",
            lvalue: !1,
            rvalue: !0,
            count: 2
          }, {
            name: "_inline_1_arg1_",
            lvalue: !1,
            rvalue: !0,
            count: 2
          }],
          thisVars: ["this_i", "this_v"],
          localVars: ["_inline_1_k"]
        },
        post: {
          body: "{return this_i}",
          args: [],
          thisVars: ["this_i"],
          localVars: []
        }
      }), r.argmax = a({
        args: ["index", "array", "shape"],
        pre: {
          body: "{this_v=-Infinity;this_i=_inline_0_arg2_.slice(0)}",
          args: [{
            name: "_inline_0_arg0_",
            lvalue: !1,
            rvalue: !1,
            count: 0
          }, {
            name: "_inline_0_arg1_",
            lvalue: !1,
            rvalue: !1,
            count: 0
          }, {
            name: "_inline_0_arg2_",
            lvalue: !1,
            rvalue: !0,
            count: 1
          }],
          thisVars: ["this_i", "this_v"],
          localVars: []
        },
        body: {
          body: "{if(_inline_1_arg1_>this_v){this_v=_inline_1_arg1_;for(var _inline_1_k=0;_inline_1_k<_inline_1_arg0_.length;++_inline_1_k){this_i[_inline_1_k]=_inline_1_arg0_[_inline_1_k]}}}",
          args: [{
            name: "_inline_1_arg0_",
            lvalue: !1,
            rvalue: !0,
            count: 2
          }, {
            name: "_inline_1_arg1_",
            lvalue: !1,
            rvalue: !0,
            count: 2
          }],
          thisVars: ["this_i", "this_v"],
          localVars: ["_inline_1_k"]
        },
        post: {
          body: "{return this_i}",
          args: [],
          thisVars: ["this_i"],
          localVars: []
        }
      }), r.random = s({
        args: ["array"],
        pre: {
          args: [],
          body: "this_f=Math.random",
          thisVars: ["this_f"]
        },
        body: {
          args: ["a"],
          body: "a=this_f()",
          thisVars: ["this_f"]
        },
        funcName: "random"
      }), r.assign = s({
        args: ["array", "array"],
        body: {
          args: ["a", "b"],
          body: "a=b"
        },
        funcName: "assign"
      }), r.assigns = s({
        args: ["array", "scalar"],
        body: {
          args: ["a", "b"],
          body: "a=b"
        },
        funcName: "assigns"
      }), r.equals = a({
        args: ["array", "array"],
        pre: o,
        body: {
          args: [{
            name: "x",
            lvalue: !1,
            rvalue: !0,
            count: 1
          }, {
            name: "y",
            lvalue: !1,
            rvalue: !0,
            count: 1
          }],
          body: "if(x!==y){return false}",
          localVars: [],
          thisVars: []
        },
        post: {
          args: [],
          localVars: [],
          thisVars: [],
          body: "return true"
        },
        funcName: "equals"
      })
    }, {
      "cwise-compiler": 40
    }],
    40: [function (t, e, r) {
      "use strict";

      function n() {
        this.argTypes = [], this.shimArgs = [], this.arrayArgs = [], this.arrayBlockIndices = [], this.scalarArgs = [], this.offsetArgs = [], this.offsetArgIndex = [], this.indexArgs = [], this.shapeArgs = [], this.funcName = "", this.pre = null, this.body = null, this.post = null, this.debug = !1
      }

      function i(t) {
        var e = new n;
        e.pre = t.pre, e.body = t.body, e.post = t.post;
        var r = t.args.slice(0);
        e.argTypes = r;
        for (var i = 0; i < r.length; ++i) {
          var a = r[i];
          if ("array" === a || "object" == typeof a && a.blockIndices) {
            if (e.argTypes[i] = "array", e.arrayArgs.push(i), e.arrayBlockIndices.push(a.blockIndices ? a.blockIndices : 0), e.shimArgs.push("array" + i), i < e.pre.args.length && e.pre.args[i].count > 0) throw new Error("cwise: pre() block may not reference array args");
            if (i < e.post.args.length && e.post.args[i].count > 0) throw new Error("cwise: post() block may not reference array args")
          } else if ("scalar" === a) e.scalarArgs.push(i), e.shimArgs.push("scalar" + i);
          else if ("index" === a) {
            if (e.indexArgs.push(i), i < e.pre.args.length && e.pre.args[i].count > 0) throw new Error("cwise: pre() block may not reference array index");
            if (i < e.body.args.length && e.body.args[i].lvalue) throw new Error("cwise: body() block may not write to array index");
            if (i < e.post.args.length && e.post.args[i].count > 0) throw new Error("cwise: post() block may not reference array index")
          } else if ("shape" === a) {
            if (e.shapeArgs.push(i), i < e.pre.args.length && e.pre.args[i].lvalue) throw new Error("cwise: pre() block may not write to array shape");
            if (i < e.body.args.length && e.body.args[i].lvalue) throw new Error("cwise: body() block may not write to array shape");
            if (i < e.post.args.length && e.post.args[i].lvalue) throw new Error("cwise: post() block may not write to array shape")
          } else {
            if ("object" != typeof a || !a.offset) throw new Error("cwise: Unknown argument type " + r[i]);
            e.argTypes[i] = "offset", e.offsetArgs.push({
              array: a.array,
              offset: a.offset
            }), e.offsetArgIndex.push(i)
          }
        }
        if (e.arrayArgs.length <= 0) throw new Error("cwise: No array arguments specified");
        if (e.pre.args.length > r.length) throw new Error("cwise: Too many arguments in pre() block");
        if (e.body.args.length > r.length) throw new Error("cwise: Too many arguments in body() block");
        if (e.post.args.length > r.length) throw new Error("cwise: Too many arguments in post() block");
        return e.debug = !!t.printCode || !!t.debug, e.funcName = t.funcName || "cwise", e.blockSize = t.blockSize || 64, s(e)
      }
      var s = t("./lib/thunk.js");
      e.exports = i
    }, {
      "./lib/thunk.js": 42
    }],
    41: [function (t, e, r) {
      "use strict";

      function n(t, e, r) {
        var n, i, s = t.length,
          a = e.arrayArgs.length,
          o = e.indexArgs.length > 0,
          u = [],
          h = [],
          f = 0,
          l = 0;
        for (n = 0; s > n; ++n) h.push(["i", n, "=0"].join(""));
        for (i = 0; a > i; ++i)
          for (n = 0; s > n; ++n) l = f, f = t[n], h.push(0 === n ? ["d", i, "s", n, "=t", i, "p", f].join("") : ["d", i, "s", n, "=(t", i, "p", f, "-s", l, "*t", i, "p", l, ")"].join(""));
        for (u.push("var " + h.join(",")), n = s - 1; n >= 0; --n) f = t[n], u.push(["for(i", n, "=0;i", n, "<s", f, ";++i", n, "){"].join(""));
        for (u.push(r), n = 0; s > n; ++n) {
          for (l = f, f = t[n], i = 0; a > i; ++i) u.push(["p", i, "+=d", i, "s", n].join(""));
          o && (n > 0 && u.push(["index[", l, "]-=s", l].join("")), u.push(["++index[", f, "]"].join(""))), u.push("}")
        }
        return u.join("\n")
      }

      function i(t, e, r, i) {
        for (var s = e.length, a = r.arrayArgs.length, o = r.blockSize, u = r.indexArgs.length > 0, h = [], f = 0; a > f; ++f) h.push(["var offset", f, "=p", f].join(""));
        for (var f = t; s > f; ++f) h.push(["for(var j" + f + "=SS[", e[f], "]|0;j", f, ">0;){"].join("")), h.push(["if(j", f, "<", o, "){"].join("")), h.push(["s", e[f], "=j", f].join("")), h.push(["j", f, "=0"].join("")), h.push(["}else{s", e[f], "=", o].join("")), h.push(["j", f, "-=", o, "}"].join("")), u && h.push(["index[", e[f], "]=j", f].join(""));
        for (var f = 0; a > f; ++f) {
          for (var l = ["offset" + f], c = t; s > c; ++c) l.push(["j", c, "*t", f, "p", e[c]].join(""));
          h.push(["p", f, "=(", l.join("+"), ")"].join(""))
        }
        h.push(n(e, r, i));
        for (var f = t; s > f; ++f) h.push("}");
        return h.join("\n")
      }

      function s(t) {
        for (var e = 0, r = t[0].length; r > e;) {
          for (var n = 1; n < t.length; ++n)
            if (t[n][e] !== t[0][e]) return e;
          ++e
        }
        return e
      }

      function a(t, e, r) {
        for (var n = t.body, i = [], s = [], a = 0; a < t.args.length; ++a) {
          var o = t.args[a];
          if (!(o.count <= 0)) {
            var u = new RegExp(o.name, "g"),
              h = "",
              f = e.arrayArgs.indexOf(a);
            switch (e.argTypes[a]) {
              case "offset":
                var l = e.offsetArgIndex.indexOf(a),
                  c = e.offsetArgs[l];
                f = c.array, h = "+q" + l;
              case "array":
                h = "p" + f + h;
                var p = "l" + a,
                  d = "a" + f;
                if (0 === e.arrayBlockIndices[f]) 1 === o.count ? "generic" === r[f] ? o.lvalue ? (i.push(["var ", p, "=", d, ".get(", h, ")"].join("")), n = n.replace(u, p), s.push([d, ".set(", h, ",", p, ")"].join(""))) : n = n.replace(u, [d, ".get(", h, ")"].join("")) : n = n.replace(u, [d, "[", h, "]"].join("")) : "generic" === r[f] ? (i.push(["var ", p, "=", d, ".get(", h, ")"].join("")), n = n.replace(u, p), o.lvalue && s.push([d, ".set(", h, ",", p, ")"].join(""))) : (i.push(["var ", p, "=", d, "[", h, "]"].join("")), n = n.replace(u, p), o.lvalue && s.push([d, "[", h, "]=", p].join("")));
                else {
                  for (var g = [o.name], _ = [h], m = 0; m < Math.abs(e.arrayBlockIndices[f]); m++) g.push("\\s*\\[([^\\]]+)\\]"), _.push("$" + (m + 1) + "*t" + f + "b" + m);
                  if (u = new RegExp(g.join(""), "g"), h = _.join("+"), "generic" === r[f]) throw new Error("cwise: Generic arrays not supported in combination with blocks!");
                  n = n.replace(u, [d, "[", h, "]"].join(""))
                }
                break;
              case "scalar":
                n = n.replace(u, "Y" + e.scalarArgs.indexOf(a));
                break;
              case "index":
                n = n.replace(u, "index");
                break;
              case "shape":
                n = n.replace(u, "shape")
            }
          }
        }
        return [i.join("\n"), n, s.join("\n")].join("\n").trim()
      }

      function o(t) {
        for (var e = new Array(t.length), r = !0, n = 0; n < t.length; ++n) {
          var i = t[n],
            s = i.match(/\d+/);
          s = s ? s[0] : "", 0 === i.charAt(0) ? e[n] = "u" + i.charAt(1) + s : e[n] = i.charAt(0) + s, n > 0 && (r = r && e[n] === e[n - 1])
        }
        return r ? e[0] : e.join("")
      }

      function u(t, e) {
        for (var r = e[1].length - Math.abs(t.arrayBlockIndices[0]) | 0, u = new Array(t.arrayArgs.length), f = new Array(t.arrayArgs.length), l = 0; l < t.arrayArgs.length; ++l) f[l] = e[2 * l], u[l] = e[2 * l + 1];
        for (var c = [], p = [], d = [], g = [], _ = [], l = 0; l < t.arrayArgs.length; ++l) {
          t.arrayBlockIndices[l] < 0 ? (d.push(0), g.push(r), c.push(r), p.push(r + t.arrayBlockIndices[l])) : (d.push(t.arrayBlockIndices[l]), g.push(t.arrayBlockIndices[l] + r), c.push(0), p.push(t.arrayBlockIndices[l]));
          for (var m = [], v = 0; v < u[l].length; v++) d[l] <= u[l][v] && u[l][v] < g[l] && m.push(u[l][v] - d[l]);
          _.push(m)
        }
        for (var y = ["SS"], b = ["'use strict'"], w = [], v = 0; r > v; ++v) w.push(["s", v, "=SS[", v, "]"].join(""));
        for (var l = 0; l < t.arrayArgs.length; ++l) {
          y.push("a" + l), y.push("t" + l), y.push("p" + l);
          for (var v = 0; r > v; ++v) w.push(["t", l, "p", v, "=t", l, "[", d[l] + v, "]"].join(""));
          for (var v = 0; v < Math.abs(t.arrayBlockIndices[l]); ++v) w.push(["t", l, "b", v, "=t", l, "[", c[l] + v, "]"].join(""))
        }
        for (var l = 0; l < t.scalarArgs.length; ++l) y.push("Y" + l);
        if (t.shapeArgs.length > 0 && w.push("shape=SS.slice(0)"), t.indexArgs.length > 0) {
          for (var E = new Array(r), l = 0; r > l; ++l) E[l] = "0";
          w.push(["index=[", E.join(","), "]"].join(""))
        }
        for (var l = 0; l < t.offsetArgs.length; ++l) {
          for (var T = t.offsetArgs[l], A = [], v = 0; v < T.offset.length; ++v) 0 !== T.offset[v] && A.push(1 === T.offset[v] ? ["t", T.array, "p", v].join("") : [T.offset[v], "*t", T.array, "p", v].join(""));
          w.push(0 === A.length ? "q" + l + "=0" : ["q", l, "=", A.join("+")].join(""))
        }
        var R = h([].concat(t.pre.thisVars).concat(t.body.thisVars).concat(t.post.thisVars));
        w = w.concat(R), b.push("var " + w.join(","));
        for (var l = 0; l < t.arrayArgs.length; ++l) b.push("p" + l + "|=0");
        t.pre.body.length > 3 && b.push(a(t.pre, t, f));
        var x = a(t.body, t, f),
          I = s(_);
        b.push(r > I ? i(I, _[0], t, x) : n(_[0], t, x)), t.post.body.length > 3 && b.push(a(t.post, t, f)), t.debug && console.log("-----Generated cwise routine for ", e, ":\n" + b.join("\n") + "\n----------");
        var S = [t.funcName || "unnamed", "_cwise_loop_", u[0].join("s"), "m", I, o(f)].join(""),
          N = new Function(["function ", S, "(", y.join(","), "){", b.join("\n"), "} return ", S].join(""));
        return N()
      }
      var h = t("uniq");
      e.exports = u
    }, {
      uniq: 43
    }],
    42: [function (t, e, r) {
      "use strict";

      function n(t) {
        var e = ["'use strict'", "var CACHED={}"],
          r = [],
          n = t.funcName + "_cwise_thunk";
        e.push(["return function ", n, "(", t.shimArgs.join(","), "){"].join(""));
        for (var s = [], a = [], o = [
            ["array", t.arrayArgs[0], ".shape.slice(", Math.max(0, t.arrayBlockIndices[u]), t.arrayBlockIndices[u] < 0 ? "," + t.arrayBlockIndices[u] + ")" : ")"].join("")
          ], u = 0; u < t.arrayArgs.length; ++u) {
          var h = t.arrayArgs[u];
          r.push(["t", h, "=array", h, ".dtype,", "r", h, "=array", h, ".order"].join("")), s.push("t" + h), s.push("r" + h), a.push("t" + h), a.push("r" + h + ".join()"), o.push("array" + h + ".data"), o.push("array" + h + ".stride"), o.push("array" + h + ".offset|0")
        }
        for (var u = 0; u < t.scalarArgs.length; ++u) o.push("scalar" + t.scalarArgs[u]);
        r.push(["type=[", a.join(","), "].join()"].join("")), r.push("proc=CACHED[type]"), e.push("var " + r.join(",")), e.push(["if(!proc){", "CACHED[type]=proc=compile([", s.join(","), "])}", "return proc(", o.join(","), ")}"].join("")), t.debug && console.log("-----Generated thunk:\n" + e.join("\n") + "\n----------");
        var f = new Function("compile", e.join("\n"));
        return f(i.bind(void 0, t))
      }
      var i = t("./compile.js");
      e.exports = n
    }, {
      "./compile.js": 41
    }],
    43: [function (t, e, r) {
      "use strict";

      function n(t, e) {
        for (var r = 1, n = t.length, i = t[0], s = t[0], a = 1; n > a; ++a)
          if (s = i, i = t[a], e(i, s)) {
            if (a === r) {
              r++;
              continue
            }
            t[r++] = i
          }
        return t.length = r, t
      }

      function i(t) {
        for (var e = 1, r = t.length, n = t[0], i = t[0], s = 1; r > s; ++s, i = n)
          if (i = n, n = t[s], n !== i) {
            if (s === e) {
              e++;
              continue
            }
            t[e++] = n
          }
        return t.length = e, t
      }

      function s(t, e, r) {
        return 0 === t.length ? t : e ? (r || t.sort(e), n(t, e)) : (r || t.sort(), i(t))
      }
      e.exports = s
    }, {}],
    44: [function (t, e, r) {
      "use strict";
      "use restrict";

      function n(t) {
        var e = 32;
        return t &= -t, t && e--, 65535 & t && (e -= 16), 16711935 & t && (e -= 8), 252645135 & t && (e -= 4), 858993459 & t && (e -= 2), 1431655765 & t && (e -= 1), e
      }
      var i = 32;
      r.INT_BITS = i, r.INT_MAX = 2147483647, r.INT_MIN = -1 << i - 1, r.sign = function (t) {
        return (t > 0) - (0 > t)
      }, r.abs = function (t) {
        var e = t >> i - 1;
        return (t ^ e) - e
      }, r.min = function (t, e) {
        return e ^ (t ^ e) & -(e > t)
      }, r.max = function (t, e) {
        return t ^ (t ^ e) & -(e > t)
      }, r.isPow2 = function (t) {
        return !(t & t - 1 || !t)
      }, r.log2 = function (t) {
        var e, r;
        return e = (t > 65535) << 4, t >>>= e, r = (t > 255) << 3, t >>>= r, e |= r, r = (t > 15) << 2, t >>>= r, e |= r, r = (t > 3) << 1, t >>>= r, e |= r, e | t >> 1
      }, r.log10 = function (t) {
        return t >= 1e9 ? 9 : t >= 1e8 ? 8 : t >= 1e7 ? 7 : t >= 1e6 ? 6 : t >= 1e5 ? 5 : t >= 1e4 ? 4 : t >= 1e3 ? 3 : t >= 100 ? 2 : t >= 10 ? 1 : 0
      }, r.popCount = function (t) {
        return t -= t >>> 1 & 1431655765, t = (858993459 & t) + (t >>> 2 & 858993459), 16843009 * (t + (t >>> 4) & 252645135) >>> 24
      }, r.countTrailingZeros = n, r.nextPow2 = function (t) {
        return t += 0 === t, --t, t |= t >>> 1, t |= t >>> 2, t |= t >>> 4, t |= t >>> 8, t |= t >>> 16, t + 1
      }, r.prevPow2 = function (t) {
        return t |= t >>> 1, t |= t >>> 2, t |= t >>> 4, t |= t >>> 8, t |= t >>> 16, t - (t >>> 1)
      }, r.parity = function (t) {
        return t ^= t >>> 16, t ^= t >>> 8, t ^= t >>> 4, t &= 15, 27030 >>> t & 1
      };
      var s = new Array(256);
      ! function (t) {
        for (var e = 0; 256 > e; ++e) {
          var r = e,
            n = e,
            i = 7;
          for (r >>>= 1; r; r >>>= 1) n <<= 1, n |= 1 & r, --i;
          t[e] = n << i & 255
        }
      }(s), r.reverse = function (t) {
        return s[255 & t] << 24 | s[t >>> 8 & 255] << 16 | s[t >>> 16 & 255] << 8 | s[t >>> 24 & 255]
      }, r.interleave2 = function (t, e) {
        return t &= 65535, t = 16711935 & (t | t << 8), t = 252645135 & (t | t << 4), t = 858993459 & (t | t << 2), t = 1431655765 & (t | t << 1), e &= 65535, e = 16711935 & (e | e << 8), e = 252645135 & (e | e << 4), e = 858993459 & (e | e << 2), e = 1431655765 & (e | e << 1), t | e << 1
      }, r.deinterleave2 = function (t, e) {
        return t = t >>> e & 1431655765, t = 858993459 & (t | t >>> 1), t = 252645135 & (t | t >>> 2), t = 16711935 & (t | t >>> 4), t = 65535 & (t | t >>> 16), t << 16 >> 16
      }, r.interleave3 = function (t, e, r) {
        return t &= 1023, t = 4278190335 & (t | t << 16), t = 251719695 & (t | t << 8), t = 3272356035 & (t | t << 4), t = 1227133513 & (t | t << 2), e &= 1023, e = 4278190335 & (e | e << 16), e = 251719695 & (e | e << 8), e = 3272356035 & (e | e << 4), e = 1227133513 & (e | e << 2), t |= e << 1, r &= 1023, r = 4278190335 & (r | r << 16), r = 251719695 & (r | r << 8), r = 3272356035 & (r | r << 4), r = 1227133513 & (r | r << 2), t | r << 2
      }, r.deinterleave3 = function (t, e) {
        return t = t >>> e & 1227133513, t = 3272356035 & (t | t >>> 2), t = 251719695 & (t | t >>> 4), t = 4278190335 & (t | t >>> 8), t = 1023 & (t | t >>> 16), t << 22 >> 22
      }, r.nextCombination = function (t) {
        var e = t | t - 1;
        return e + 1 | (~e & -~e) - 1 >>> n(t) + 1
      }
    }, {}],
    45: [function (t, e, r) {
      "use strict";

      function n(t, e, r) {
        var i = 0 | t[r];
        if (0 >= i) return [];
        var s, a = new Array(i);
        if (r === t.length - 1)
          for (s = 0; i > s; ++s) a[s] = e;
        else
          for (s = 0; i > s; ++s) a[s] = n(t, e, r + 1);
        return a
      }

      function i(t, e) {
        var r, n;
        for (r = new Array(t), n = 0; t > n; ++n) r[n] = e;
        return r
      }

      function s(t, e) {
        switch ("undefined" == typeof e && (e = 0), typeof t) {
          case "number":
            if (t > 0) return i(0 | t, e);
            break;
          case "object":
            if ("number" == typeof t.length) return n(t, e, 0)
        }
        return []
      }
      e.exports = s
    }, {}],
    46: [function (t, e, r) {
      (function (e, n) {
        "use strict";

        function i(t) {
          if (t) {
            var e = t.length || t.byteLength,
              r = v.log2(e);
            E[r].push(t)
          }
        }

        function s(t) {
          i(t.buffer)
        }

        function a(t) {
          var t = v.nextPow2(t),
            e = v.log2(t),
            r = E[e];
          return r.length > 0 ? r.pop() : new ArrayBuffer(t)
        }

        function o(t) {
          return new Uint8Array(a(t), 0, t)
        }

        function u(t) {
          return new Uint16Array(a(2 * t), 0, t)
        }

        function h(t) {
          return new Uint32Array(a(4 * t), 0, t)
        }

        function f(t) {
          return new Int8Array(a(t), 0, t)
        }

        function l(t) {
          return new Int16Array(a(2 * t), 0, t)
        }

        function c(t) {
          return new Int32Array(a(4 * t), 0, t)
        }

        function p(t) {
          return new Float32Array(a(4 * t), 0, t)
        }

        function d(t) {
          return new Float64Array(a(8 * t), 0, t)
        }

        function g(t) {
          return b ? new Uint8ClampedArray(a(t), 0, t) : o(t)
        }

        function _(t) {
          return new DataView(a(t), 0, t)
        }

        function m(t) {
          t = v.nextPow2(t);
          var e = v.log2(t),
            r = T[e];
          return r.length > 0 ? r.pop() : new n(t)
        }
        var v = t("bit-twiddle"),
          y = t("dup");
        e.__TYPEDARRAY_POOL || (e.__TYPEDARRAY_POOL = {
          UINT8: y([32, 0]),
          UINT16: y([32, 0]),
          UINT32: y([32, 0]),
          INT8: y([32, 0]),
          INT16: y([32, 0]),
          INT32: y([32, 0]),
          FLOAT: y([32, 0]),
          DOUBLE: y([32, 0]),
          DATA: y([32, 0]),
          UINT8C: y([32, 0]),
          BUFFER: y([32, 0])
        });
        var b = "undefined" != typeof Uint8ClampedArray,
          w = e.__TYPEDARRAY_POOL;
        w.UINT8C || (w.UINT8C = y([32, 0])), w.BUFFER || (w.BUFFER = y([32, 0]));
        var E = w.DATA,
          T = w.BUFFER;
        r.free = function (t) {
          if (n.isBuffer(t)) T[v.log2(t.length)].push(t);
          else {
            if ("[object ArrayBuffer]" !== Object.prototype.toString.call(t) && (t = t.buffer), !t) return;
            var e = t.length || t.byteLength,
              r = 0 | v.log2(e);
            E[r].push(t)
          }
        }, r.freeUint8 = r.freeUint16 = r.freeUint32 = r.freeInt8 = r.freeInt16 = r.freeInt32 = r.freeFloat32 = r.freeFloat = r.freeFloat64 = r.freeDouble = r.freeUint8Clamped = r.freeDataView = s, r.freeArrayBuffer = i, r.freeBuffer = function (t) {
          T[v.log2(t.length)].push(t)
        }, r.malloc = function (t, e) {
          if (void 0 === e || "arraybuffer" === e) return a(t);
          switch (e) {
            case "uint8":
              return o(t);
            case "uint16":
              return u(t);
            case "uint32":
              return h(t);
            case "int8":
              return f(t);
            case "int16":
              return l(t);
            case "int32":
              return c(t);
            case "float":
            case "float32":
              return p(t);
            case "double":
            case "float64":
              return d(t);
            case "uint8_clamped":
              return g(t);
            case "buffer":
              return m(t);
            case "data":
            case "dataview":
              return _(t);
            default:
              return null
          }
          return null
        }, r.mallocArrayBuffer = a, r.mallocUint8 = o, r.mallocUint16 = u, r.mallocUint32 = h, r.mallocInt8 = f, r.mallocInt16 = l, r.mallocInt32 = c, r.mallocFloat32 = r.mallocFloat = p, r.mallocFloat64 = r.mallocDouble = d, r.mallocUint8Clamped = g, r.mallocDataView = _, r.mallocBuffer = m, r.clearCache = function () {
          for (var t = 0; 32 > t; ++t) w.UINT8[t].length = 0, w.UINT16[t].length = 0, w.UINT32[t].length = 0, w.INT8[t].length = 0, w.INT16[t].length = 0, w.INT32[t].length = 0, w.FLOAT[t].length = 0, w.DOUBLE[t].length = 0, w.UINT8C[t].length = 0, E[t].length = 0, T[t].length = 0
        }
      }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {}, t("buffer").Buffer)
    }, {
      "bit-twiddle": 44,
      buffer: 23,
      dup: 45
    }],
    47: [function (t, e, r) {
      "use strict";

      function n(t) {
        m = [t.LINEAR, t.NEAREST_MIPMAP_LINEAR, t.LINEAR_MIPMAP_NEAREST, t.LINEAR_MIPMAP_NEAREST], v = [t.NEAREST, t.LINEAR, t.NEAREST_MIPMAP_NEAREST, t.NEAREST_MIPMAP_LINEAR, t.LINEAR_MIPMAP_NEAREST, t.LINEAR_MIPMAP_LINEAR], y = [t.REPEAT, t.CLAMP_TO_EDGE, t.MIRRORED_REPEAT]
      }

      function i(t, e, r) {
        var n = t.gl,
          i = n.getParameter(n.MAX_TEXTURE_SIZE);
        if (0 > e || e > i || 0 > r || r > i) throw new Error("gl-texture2d: Invalid texture size");
        return t._shape = [e, r], t.bind(), n.texImage2D(n.TEXTURE_2D, 0, t.format, e, r, 0, t.format, t.type, null), t._mipLevels = [0], t
      }

      function s(t, e, r, n, i, s) {
        this.gl = t, this.handle = e, this.format = i, this.type = s, this._shape = [r, n], this._mipLevels = [0], this._magFilter = t.NEAREST, this._minFilter = t.NEAREST, this._wrapS = t.CLAMP_TO_EDGE, this._wrapT = t.CLAMP_TO_EDGE, this._anisoSamples = 1;
        var a = this,
          o = [this._wrapS, this._wrapT];
        Object.defineProperties(o, [{
          get: function () {
            return a._wrapS
          },
          set: function (t) {
            return a.wrapS = t
          }
        }, {
          get: function () {
            return a._wrapT
          },
          set: function (t) {
            return a.wrapT = t
          }
        }]), this._wrapVector = o;
        var u = [this._shape[0], this._shape[1]];
        Object.defineProperties(u, [{
          get: function () {
            return a._shape[0]
          },
          set: function (t) {
            return a.width = t
          }
        }, {
          get: function () {
            return a._shape[1]
          },
          set: function (t) {
            return a.height = t
          }
        }]), this._shapeVector = u
      }

      function a(t, e) {
        return 3 === t.length ? 1 === e[2] && e[1] === t[0] * t[2] && e[0] === t[2] : 1 === e[0] && e[1] === t[0]
      }

      function o(t, e, r, n, i, s, o, u) {
        var h = u.dtype,
          f = u.shape.slice();
        if (f.length < 2 || f.length > 3) throw new Error("gl-texture2d: Invalid ndarray, must be 2d or 3d");
        var l = 0,
          c = 0,
          _ = a(f, u.stride.slice());
        "float32" === h ? l = t.FLOAT : "float64" === h ? (l = t.FLOAT, _ = !1, h = "float32") : "uint8" === h ? l = t.UNSIGNED_BYTE : (l = t.UNSIGNED_BYTE, _ = !1, h = "uint8");
        var m = 1;
        if (2 === f.length) c = t.LUMINANCE, f = [f[0], f[1], 1], u = p(u.data, f, [u.stride[0], u.stride[1], 1], u.offset);
        else {
          if (3 !== f.length) throw new Error("gl-texture2d: Invalid shape for texture");
          if (1 === f[2]) c = t.ALPHA;
          else if (2 === f[2]) c = t.LUMINANCE_ALPHA;
          else if (3 === f[2]) c = t.RGB;
          else {
            if (4 !== f[2]) throw new Error("gl-texture2d: Invalid shape for pixel coords");
            c = t.RGBA
          }
          m = f[2]
        }
        if (c !== t.LUMINANCE && c !== t.ALPHA || i !== t.LUMINANCE && i !== t.ALPHA || (c = i), c !== i) throw new Error("gl-texture2d: Incompatible texture format for setPixels");
        var v = u.size,
          y = o.indexOf(n) < 0;
        if (y && o.push(n), l === s && _) 0 === u.offset && u.data.length === v ? y ? t.texImage2D(t.TEXTURE_2D, n, i, f[0], f[1], 0, i, s, u.data) : t.texSubImage2D(t.TEXTURE_2D, n, e, r, f[0], f[1], i, s, u.data) : y ? t.texImage2D(t.TEXTURE_2D, n, i, f[0], f[1], 0, i, s, u.data.subarray(u.offset, u.offset + v)) : t.texSubImage2D(t.TEXTURE_2D, n, e, r, f[0], f[1], i, s, u.data.subarray(u.offset, u.offset + v));
        else {
          var w;
          w = s === t.FLOAT ? g.mallocFloat32(v) : g.mallocUint8(v);
          var E = p(w, f, [f[2], f[2] * f[0], 1]);
          l === t.FLOAT && s === t.UNSIGNED_BYTE ? b(E, u) : d.assign(E, u), y ? t.texImage2D(t.TEXTURE_2D, n, i, f[0], f[1], 0, i, s, w.subarray(0, v)) : t.texSubImage2D(t.TEXTURE_2D, n, e, r, f[0], f[1], i, s, w.subarray(0, v)),
            s === t.FLOAT ? g.freeFloat32(w) : g.freeUint8(w)
        }
      }

      function u(t) {
        var e = t.createTexture();
        return t.bindTexture(t.TEXTURE_2D, e), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.NEAREST), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.NEAREST), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE), e
      }

      function h(t, e, r, n, i) {
        var a = t.getParameter(t.MAX_TEXTURE_SIZE);
        if (0 > e || e > a || 0 > r || r > a) throw new Error("gl-texture2d: Invalid texture shape");
        if (i === t.FLOAT && !_(t).texture_float) throw new Error("gl-texture2d: Floating point textures not supported on this platform");
        var o = u(t);
        return t.texImage2D(t.TEXTURE_2D, 0, n, e, r, 0, n, i, null), new s(t, o, e, r, n, i)
      }

      function f(t, e, r, n) {
        var i = u(t);
        return t.texImage2D(t.TEXTURE_2D, 0, r, r, n, e), new s(t, i, 0 | e.width, 0 | e.height, r, n)
      }

      function l(t, e) {
        var r = e.dtype,
          n = e.shape.slice(),
          i = t.getParameter(t.MAX_TEXTURE_SIZE);
        if (n[0] < 0 || n[0] > i || n[1] < 0 || n[1] > i) throw new Error("gl-texture2d: Invalid texture size");
        var o = a(n, e.stride.slice()),
          h = 0;
        "float32" === r ? h = t.FLOAT : "float64" === r ? (h = t.FLOAT, o = !1, r = "float32") : "uint8" === r ? h = t.UNSIGNED_BYTE : (h = t.UNSIGNED_BYTE, o = !1, r = "uint8");
        var f = 0;
        if (2 === n.length) f = t.LUMINANCE, n = [n[0], n[1], 1], e = p(e.data, n, [e.stride[0], e.stride[1], 1], e.offset);
        else {
          if (3 !== n.length) throw new Error("gl-texture2d: Invalid shape for texture");
          if (1 === n[2]) f = t.ALPHA;
          else if (2 === n[2]) f = t.LUMINANCE_ALPHA;
          else if (3 === n[2]) f = t.RGB;
          else {
            if (4 !== n[2]) throw new Error("gl-texture2d: Invalid shape for pixel coords");
            f = t.RGBA
          }
        }
        h !== t.FLOAT || _(t).texture_float || (h = t.UNSIGNED_BYTE, o = !1);
        var l, c, m = e.size;
        if (o) l = 0 === e.offset && e.data.length === m ? e.data : e.data.subarray(e.offset, e.offset + m);
        else {
          var v = [n[2], n[2] * n[0], 1];
          c = g.malloc(m, r);
          var y = p(c, n, v, 0);
          "float32" !== r && "float64" !== r || h !== t.UNSIGNED_BYTE ? d.assign(y, e) : b(y, e), l = c.subarray(0, m)
        }
        var w = u(t);
        return t.texImage2D(t.TEXTURE_2D, 0, f, n[0], n[1], 0, f, h, l), o || g.free(c), new s(t, w, n[0], n[1], f, h)
      }

      function c(t) {
        if (arguments.length <= 1) throw new Error("gl-texture2d: Missing arguments for texture2d constructor");
        if (m || n(t), "number" == typeof arguments[1]) return h(t, arguments[1], arguments[2], arguments[3] || t.RGBA, arguments[4] || t.UNSIGNED_BYTE);
        if (Array.isArray(arguments[1])) return h(t, 0 | arguments[1][0], 0 | arguments[1][1], arguments[2] || t.RGBA, arguments[3] || t.UNSIGNED_BYTE);
        if ("object" == typeof arguments[1]) {
          var e = arguments[1];
          if (e instanceof HTMLCanvasElement || e instanceof HTMLImageElement || e instanceof HTMLVideoElement || e instanceof ImageData) return f(t, e, arguments[2] || t.RGBA, arguments[3] || t.UNSIGNED_BYTE);
          if (e.shape && e.data && e.stride) return l(t, e)
        }
        throw new Error("gl-texture2d: Invalid arguments for texture2d constructor")
      }
      var p = t("ndarray"),
        d = t("ndarray-ops"),
        g = t("typedarray-pool"),
        _ = t("webglew");
      e.exports = c;
      var m = null,
        v = null,
        y = null,
        b = function (t, e) {
          d.muls(t, e, 255)
        },
        w = s.prototype;
      Object.defineProperties(w, {
        minFilter: {
          get: function () {
            return this._minFilter
          },
          set: function (t) {
            this.bind();
            var e = this.gl;
            if (this.type === e.FLOAT && m.indexOf(t) >= 0 && (_(e).texture_float_linear || (t = e.NEAREST)), v.indexOf(t) < 0) throw new Error("gl-texture2d: Unknown filter mode " + t);
            return e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, t), this._minFilter = t
          }
        },
        magFilter: {
          get: function () {
            return this._magFilter
          },
          set: function (t) {
            this.bind();
            var e = this.gl;
            if (this.type === e.FLOAT && m.indexOf(t) >= 0 && (_(e).texture_float_linear || (t = e.NEAREST)), v.indexOf(t) < 0) throw new Error("gl-texture2d: Unknown filter mode " + t);
            return e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, t), this._magFilter = t
          }
        },
        mipSamples: {
          get: function () {
            return this._anisoSamples
          },
          set: function (t) {
            var e = this._anisoSamples;
            if (this._anisoSamples = 0 | Math.max(t, 1), e !== this._anisoSamples) {
              var r = _(this.gl).EXT_texture_filter_anisotropic;
              r && this.gl.texParameterf(this.gl.TEXTURE_2D, r.TEXTURE_MAX_ANISOTROPY_EXT, this._anisoSamples)
            }
            return this._anisoSamples
          }
        },
        wrapS: {
          get: function () {
            return this._wrapS
          },
          set: function (t) {
            if (this.bind(), y.indexOf(t) < 0) throw new Error("gl-texture2d: Unknown wrap mode " + t);
            return this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, t), this._wrapS = t
          }
        },
        wrapT: {
          get: function () {
            return this._wrapT
          },
          set: function (t) {
            if (this.bind(), y.indexOf(t) < 0) throw new Error("gl-texture2d: Unknown wrap mode " + t);
            return this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, t), this._wrapT = t
          }
        },
        wrap: {
          get: function () {
            return this._wrapVector
          },
          set: function (t) {
            if (Array.isArray(t) || (t = [t, t]), 2 !== t.length) throw new Error("gl-texture2d: Must specify wrap mode for rows and columns");
            for (var e = 0; 2 > e; ++e)
              if (y.indexOf(t[e]) < 0) throw new Error("gl-texture2d: Unknown wrap mode " + t);
            this._wrapS = t[0], this._wrapT = t[1];
            var r = this.gl;
            return this.bind(), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_WRAP_S, this._wrapS), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_WRAP_T, this._wrapT), t
          }
        },
        shape: {
          get: function () {
            return this._shapeVector
          },
          set: function (t) {
            if (Array.isArray(t)) {
              if (2 !== t.length) throw new Error("gl-texture2d: Invalid texture shape")
            } else t = [0 | t, 0 | t];
            return i(this, 0 | t[0], 0 | t[1]), [0 | t[0], 0 | t[1]]
          }
        },
        width: {
          get: function () {
            return this._shape[0]
          },
          set: function (t) {
            return t = 0 | t, i(this, t, this._shape[1]), t
          }
        },
        height: {
          get: function () {
            return this._shape[1]
          },
          set: function (t) {
            return t = 0 | t, i(this, this._shape[0], t), t
          }
        }
      }), w.bind = function (t) {
        var e = this.gl;
        return void 0 !== t && e.activeTexture(e.TEXTURE0 + (0 | t)), e.bindTexture(e.TEXTURE_2D, this.handle), void 0 !== t ? 0 | t : e.getParameter(e.ACTIVE_TEXTURE) - e.TEXTURE0
      }, w.dispose = function () {
        this.gl.deleteTexture(this.handle)
      }, w.generateMipmap = function () {
        this.bind(), this.gl.generateMipmap(this.gl.TEXTURE_2D);
        for (var t = Math.min(this._shape[0], this._shape[1]), e = 0; t > 0; ++e, t >>>= 1) this._mipLevels.indexOf(e) < 0 && this._mipLevels.push(e)
      }, w.setPixels = function (t, e, r, n) {
        var i = this.gl;
        if (this.bind(), Array.isArray(e) ? (n = r, r = 0 | e[1], e = 0 | e[0]) : (e = e || 0, r = r || 0), n = n || 0, t instanceof HTMLCanvasElement || t instanceof ImageData || t instanceof HTMLImageElement || t instanceof HTMLVideoElement) {
          var s = this._mipLevels.indexOf(n) < 0;
          s ? (i.texImage2D(i.TEXTURE_2D, 0, this.format, this.format, this.type, t), this._mipLevels.push(n)) : i.texSubImage2D(i.TEXTURE_2D, n, e, r, this.format, this.type, t)
        } else {
          if (!(t.shape && t.stride && t.data)) throw new Error("gl-texture2d: Unsupported data type");
          if (t.shape.length < 2 || e + t.shape[1] > this._shape[1] >>> n || r + t.shape[0] > this._shape[0] >>> n || 0 > e || 0 > r) throw new Error("gl-texture2d: Texture dimensions are out of bounds");
          o(i, e, r, n, this.format, this.type, this._mipLevels, t)
        }
      }
    }, {
      ndarray: 53,
      "ndarray-ops": 39,
      "typedarray-pool": 46,
      webglew: 62
    }],
    48: [function (t, e, r) {
      e.exports = {
        glsl: "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform vec2 resolution;uniform sampler2D from, to;uniform float progress;void main() {vec2 p = gl_FragCoord.xy / resolution;gl_FragColor = mix(texture2D(from, p), texture2D(to, p), progress);}",
        uniforms: {},
        id: "7e61b1f44a391f0c0894",
        name: "fade",
        owner: "glslioadmin",
        html_url: "https://gist.github.com/glslioadmin/7e61b1f44a391f0c0894",
        created_at: "2014-05-16T00:00:00Z",
        updated_at: "2014-05-16T00:00:00Z",
        stars: 0
      }
    }, {}],
    49: [function (t, e, r) {
      function n(t, e) {
        return this instanceof n ? (this.gl = t, this.shader = i(t, s, e), void(this.buffer = t.createBuffer())) : new n(t, e)
      }
      var i = t("gl-shader"),
        s = "attribute vec2 position; void main() { gl_Position = vec4(2.0*position-1.0, 0.0, 1.0);}";
      e.exports = n, n.prototype = {
        dispose: function () {
          this.shader.dispose(), this.gl.deleteBuffer(this.buffer), this.shader = null, this.buffer = null
        },
        render: function (t, e, r, n) {
          var i = this.gl,
            s = this.shader,
            a = 0;
          s.bind(), this._checkViewport(), s.uniforms.progress = t, s.uniforms.from = e.bind(a++), s.uniforms.to = r.bind(a++);
          for (var o in n) {
            var u = n[o];
            u && u.bind ? s.uniforms[o] = u.bind(a++) : s.uniforms[o] !== u && (s.uniforms[o] = u)
          }
          i.drawArrays(i.TRIANGLES, 0, 6)
        },
        _checkViewport: function () {
          var t = this.gl,
            e = t.canvas,
            r = e.width,
            n = e.height;
          (this._w !== r || this._h !== n) && (this._syncViewport(r, n), this._w = r, this._h = n)
        },
        _syncViewport: function (t, e) {
          var r = this.gl,
            n = this.shader,
            i = this.buffer,
            s = 0,
            a = t,
            o = 0,
            u = e;
          n.uniforms.resolution = new Float32Array([t, e]), r.bindBuffer(r.ARRAY_BUFFER, i), n.attributes.position.pointer(), r.bufferData(r.ARRAY_BUFFER, new Float32Array([s, o, a, o, s, u, s, u, a, o, a, u]), r.STATIC_DRAW), r.viewport(s, o, a, u)
        }
      }
    }, {
      "gl-shader": 30
    }],
    50: [function (t, e, r) {
      function n(t) {
        this.elt = t, "absolute" !== t.style.position && (t.style.position = "relative"), t.style.overflow = "hidden"
      }
      var i = t("vendor-prefix"),
        s = i("transform"),
        a = i("transform-origin");
      n.prototype = {
        clamped: !0,
        rgb: [0, 0, 0],
        getViewport: function () {
          return this.elt.getBoundingClientRect()
        },
        abort: function () {
          this.reset()
        },
        _transformForRect: function (t) {
          var e = this.getViewport(),
            r = e.width / t[2],
            n = [-t[0] + "px", -t[1] + "px"];
          return "scale(" + r + ") translate(" + n + ")"
        },
        _reset: function () {
          this.elt.style.backgroundColor = "rgb(" + this.rgb.map(function (t) {
            return 255 * t
          }) + ")", this.elt.innerHTML = ""
        },
        _setImage: function (t) {
          t !== this.image && (this._reset(), this.elt.appendChild(t), t.style.position = "absolute", t.style.top = 0, t.style.left = 0, t.style[a] = "0% 0%", this.image = t)
        },
        _positionImage: function (t) {
          this.image.style[s] = this._transformForRect(t)
        },
        runStart: function (t) {
          this._setImage(t)
        },
        draw: function (t, e) {
          this._positionImage(e)
        }
      }, e.exports = n
    }, {
      "vendor-prefix": 51
    }],
    51: [function (t, e, r) {
      "use strict";

      console.log('create p 1')
      function n(t) {
        return t in f ? f[t] : f[t] = i(t)
      }

      function i(t) {
        var e, r = t.replace(/-([a-z])/g, function (t, e) {
            return e.toUpperCase()
          }),
          n = u.length;
        if (void 0 !== o[r]) return r;
        for (r = s(t); n--;)
          if (e = u[n] + r, void 0 !== o[e]) return e;
        throw new Error("unable to prefix " + t)
      }

      function s(t) {
        return t.charAt(0).toUpperCase() + t.slice(1)
      }

      function a(t) {
        var e = n(t),
          r = /([A-Z])/g;
        return r.test(e) && (e = (h.test(e) ? "-" : "") + e.replace(r, "-$1")), e.toLowerCase()
      }
      var o = document.createElement("p").style,
        u = "O ms Moz webkit".split(" "),
        h = /^(o|ms|moz|webkit)/,
        f = {};
      e.exports = n, e.exports.dash = a
    }, {}],
    52: [function (t, e, r) {
      function n(t) {
        return this instanceof n ? (this.gl = t, this.shader = i(t, "#define GLSLIFY 1\n\n\nvarying vec2 uv;\n\nattribute vec2 p;\n\nuniform vec2 imgRes; // image size\nuniform vec2 pos; // bound position\nuniform vec2 dim; // bound size\n\nvoid main() {\n  uv = pos/imgRes + ((p * vec2(1.,-1.)+1.)/2.) * (dim/imgRes);\n  gl_Position = vec4(p,0.,1.);\n}\n", "#define GLSLIFY 1\n\nprecision highp float;\n\nvarying vec2 uv;\n\nuniform sampler2D img;\nuniform vec3 bg;\n\nvoid main() {\n  if(uv.x<0.||uv.x>1.||uv.y<0.||uv.y>1.)\n    gl_FragColor = vec4(bg, 1.0);\n  else\n    gl_FragColor = texture2D(img, uv);\n}\n"), this.buffer = t.createBuffer(), t.bindBuffer(t.ARRAY_BUFFER, this.buffer), void t.bufferData(t.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), t.STATIC_DRAW)) : new n(t)
      }
      var i = t("gl-shader");
      n.prototype = {
        clamped: !0,
        rgb: [0, 0, 0],
        dispose: function () {
          this.shader.dispose(), this.gl.deleteBuffer(this.buffer), this.gl = null, this.shader = null, this.buffer = null
        },
        render: function (t, e) {
          var r = e[0],
            n = e[1],
            i = e[2],
            s = e[3];
          if (isNaN(r) || isNaN(n) || isNaN(i) || isNaN(s)) throw new Error("invalid numbers in bound: " + e);
          var a = this.gl,
            o = this.shader;
          o.bind(), a.bindBuffer(a.ARRAY_BUFFER, this.buffer), o.attributes.p.pointer(), o.uniforms.imgRes = t.shape.slice(0, 2), o.uniforms.bg = this.rgb, o.uniforms.img = t.bind(), o.uniforms.pos = [r, n], o.uniforms.dim = [i, s], a.drawArrays(a.TRIANGLES, 0, 6)
        },
        getViewport: function () {
          return {
            width: this.gl.drawingBufferWidth,
            height: this.gl.drawingBufferHeight
          }
        }
      }, e.exports = n
    }, {
      "gl-shader": 30
    }],
    53: [function (t, e, r) {
      (function (r) {
        function n(t, e) {
          return t[0] - e[0]
        }

        function i() {
          var t, e = this.stride,
            r = new Array(e.length);
          for (t = 0; t < r.length; ++t) r[t] = [Math.abs(e[t]), t];
          r.sort(n);
          var i = new Array(r.length);
          for (t = 0; t < i.length; ++t) i[t] = r[t][1];
          return i
        }

        function s(t, e) {
          var r = ["View", e, "d", t].join("");
          0 > e && (r = "View_Nil" + t);
          var n = "generic" === t;
          if (-1 === e) {
            var s = "function " + r + "(a){this.data=a;};var proto=" + r + ".prototype;proto.dtype='" + t + "';proto.index=function(){return -1};proto.size=0;proto.dimension=-1;proto.shape=proto.stride=proto.order=[];proto.lo=proto.hi=proto.transpose=proto.step=function(){return new " + r + "(this.data);};proto.get=proto.set=function(){};proto.pick=function(){return null};return function construct_" + r + "(a){return new " + r + "(a);}",
              a = new Function(s);
            return a()
          }
          if (0 === e) {
            var s = "function " + r + "(a,d) {this.data = a;this.offset = d};var proto=" + r + ".prototype;proto.dtype='" + t + "';proto.index=function(){return this.offset};proto.dimension=0;proto.size=1;proto.shape=proto.stride=proto.order=[];proto.lo=proto.hi=proto.transpose=proto.step=function " + r + "_copy() {return new " + r + "(this.data,this.offset)};proto.pick=function " + r + "_pick(){return TrivialArray(this.data);};proto.valueOf=proto.get=function " + r + "_get(){return " + (n ? "this.data.get(this.offset)" : "this.data[this.offset]") + "};proto.set=function " + r + "_set(v){return " + (n ? "this.data.set(this.offset,v)" : "this.data[this.offset]=v") + "};return function construct_" + r + "(a,b,c,d){return new " + r + "(a,d)}",
              a = new Function("TrivialArray", s);
            return a(l[t][0])
          }
          var s = ["'use strict'"],
            o = u(e),
            h = o.map(function (t) {
              return "i" + t
            }),
            f = "this.offset+" + o.map(function (t) {
              return "this.stride[" + t + "]*i" + t
            }).join("+"),
            c = o.map(function (t) {
              return "b" + t
            }).join(","),
            p = o.map(function (t) {
              return "c" + t
            }).join(",");
          s.push("function " + r + "(a," + c + "," + p + ",d){this.data=a", "this.shape=[" + c + "]", "this.stride=[" + p + "]", "this.offset=d|0}", "var proto=" + r + ".prototype", "proto.dtype='" + t + "'", "proto.dimension=" + e), s.push("Object.defineProperty(proto,'size',{get:function " + r + "_size(){return " + o.map(function (t) {
            return "this.shape[" + t + "]"
          }).join("*"), "}})"), 1 === e ? s.push("proto.order=[0]") : (s.push("Object.defineProperty(proto,'order',{get:"), 4 > e ? (s.push("function " + r + "_order(){"), 2 === e ? s.push("return (Math.abs(this.stride[0])>Math.abs(this.stride[1]))?[1,0]:[0,1]}})") : 3 === e && s.push("var s0=Math.abs(this.stride[0]),s1=Math.abs(this.stride[1]),s2=Math.abs(this.stride[2]);if(s0>s1){if(s1>s2){return [2,1,0];}else if(s0>s2){return [1,2,0];}else{return [1,0,2];}}else if(s0>s2){return [2,0,1];}else if(s2>s1){return [0,1,2];}else{return [0,2,1];}}})")) : s.push("ORDER})")), s.push("proto.set=function " + r + "_set(" + h.join(",") + ",v){"), s.push(n ? "return this.data.set(" + f + ",v)}" : "return this.data[" + f + "]=v}"), s.push("proto.get=function " + r + "_get(" + h.join(",") + "){"), s.push(n ? "return this.data.get(" + f + ")}" : "return this.data[" + f + "]}"), s.push("proto.index=function " + r + "_index(", h.join(), "){return " + f + "}"), s.push("proto.hi=function " + r + "_hi(" + h.join(",") + "){return new " + r + "(this.data," + o.map(function (t) {
            return ["(typeof i", t, "!=='number'||i", t, "<0)?this.shape[", t, "]:i", t, "|0"].join("")
          }).join(",") + "," + o.map(function (t) {
            return "this.stride[" + t + "]"
          }).join(",") + ",this.offset)}");
          var d = o.map(function (t) {
              return "a" + t + "=this.shape[" + t + "]"
            }),
            g = o.map(function (t) {
              return "c" + t + "=this.stride[" + t + "]"
            });
          s.push("proto.lo=function " + r + "_lo(" + h.join(",") + "){var b=this.offset,d=0," + d.join(",") + "," + g.join(","));
          for (var _ = 0; e > _; ++_) s.push("if(typeof i" + _ + "==='number'&&i" + _ + ">=0){d=i" + _ + "|0;b+=c" + _ + "*d;a" + _ + "-=d}");
          s.push("return new " + r + "(this.data," + o.map(function (t) {
            return "a" + t
          }).join(",") + "," + o.map(function (t) {
            return "c" + t
          }).join(",") + ",b)}"), s.push("proto.step=function " + r + "_step(" + h.join(",") + "){var " + o.map(function (t) {
            return "a" + t + "=this.shape[" + t + "]"
          }).join(",") + "," + o.map(function (t) {
            return "b" + t + "=this.stride[" + t + "]"
          }).join(",") + ",c=this.offset,d=0,ceil=Math.ceil");
          for (var _ = 0; e > _; ++_) s.push("if(typeof i" + _ + "==='number'){d=i" + _ + "|0;if(d<0){c+=b" + _ + "*(a" + _ + "-1);a" + _ + "=ceil(-a" + _ + "/d)}else{a" + _ + "=ceil(a" + _ + "/d)}b" + _ + "*=d}");
          s.push("return new " + r + "(this.data," + o.map(function (t) {
            return "a" + t
          }).join(",") + "," + o.map(function (t) {
            return "b" + t
          }).join(",") + ",c)}");
          for (var m = new Array(e), v = new Array(e), _ = 0; e > _; ++_) m[_] = "a[i" + _ + "]", v[_] = "b[i" + _ + "]";
          s.push("proto.transpose=function " + r + "_transpose(" + h + "){" + h.map(function (t, e) {
            return t + "=(" + t + "===undefined?" + e + ":" + t + "|0)"
          }).join(";"), "var a=this.shape,b=this.stride;return new " + r + "(this.data," + m.join(",") + "," + v.join(",") + ",this.offset)}"), s.push("proto.pick=function " + r + "_pick(" + h + "){var a=[],b=[],c=this.offset");
          for (var _ = 0; e > _; ++_) s.push("if(typeof i" + _ + "==='number'&&i" + _ + ">=0){c=(c+this.stride[" + _ + "]*i" + _ + ")|0}else{a.push(this.shape[" + _ + "]);b.push(this.stride[" + _ + "])}");
          s.push("var ctor=CTOR_LIST[a.length+1];return ctor(this.data,a,b,c)}"), s.push("return function construct_" + r + "(data,shape,stride,offset){return new " + r + "(data," + o.map(function (t) {
            return "shape[" + t + "]"
          }).join(",") + "," + o.map(function (t) {
            return "stride[" + t + "]"
          }).join(",") + ",offset)}");
          var a = new Function("CTOR_LIST", "ORDER", s.join("\n"));
          return a(l[t], i)
        }

        function a(t) {
          if (f && r.isBuffer(t)) return "buffer";
          if (h) switch (Object.prototype.toString.call(t)) {
            case "[object Float64Array]":
              return "float64";
            case "[object Float32Array]":
              return "float32";
            case "[object Int8Array]":
              return "int8";
            case "[object Int16Array]":
              return "int16";
            case "[object Int32Array]":
              return "int32";
            case "[object Uint8Array]":
              return "uint8";
            case "[object Uint16Array]":
              return "uint16";
            case "[object Uint32Array]":
              return "uint32";
            case "[object Uint8ClampedArray]":
              return "uint8_clamped"
          }
          return Array.isArray(t) ? "array" : "generic"
        }

        function o(t, e, r, n) {
          if (void 0 === t) {
            var i = l.array[0];
            return i([])
          }
          "number" == typeof t && (t = [t]), void 0 === e && (e = [t.length]);
          var o = e.length;
          if (void 0 === r) {
            r = new Array(o);
            for (var u = o - 1, h = 1; u >= 0; --u) r[u] = h, h *= e[u]
          }
          if (void 0 === n) {
            n = 0;
            for (var u = 0; o > u; ++u) r[u] < 0 && (n -= (e[u] - 1) * r[u])
          }
          for (var f = a(t), c = l[f]; c.length <= o + 1;) c.push(s(f, c.length - 1));
          var i = c[o + 1];
          return i(t, e, r, n)
        }
        var u = t("iota-array"),
          h = "undefined" != typeof Float64Array,
          f = "undefined" != typeof r,
          l = {
            float32: [],
            float64: [],
            int8: [],
            int16: [],
            int32: [],
            uint8: [],
            uint16: [],
            uint32: [],
            array: [],
            uint8_clamped: [],
            buffer: [],
            generic: []
          };
        e.exports = o
      }).call(this, t("buffer").Buffer)
    }, {
      buffer: 23,
      "iota-array": 54
    }],
    54: [function (t, e, r) {
      "use strict";

      function n(t) {
        for (var e = new Array(t), r = 0; t > r; ++r) e[r] = r;
        return e
      }
      e.exports = n
    }, {}],
    55: [function (t, e, r) {
      "use strict";

      function n(t) {
        if (null == t) throw new TypeError("Object.assign cannot be called with null or undefined");
        return Object(t)
      }
      e.exports = Object.assign || function (t, e) {
        for (var r, i, s = n(t), a = 1; a < arguments.length; a++) {
          r = arguments[a], i = Object.keys(Object(r));
          for (var o = 0; o < i.length; o++) s[i[o]] = r[i[o]]
        }
        return s
      }
    }, {}],
    56: [function (t, e, r) {
      for (var n = t("performance-now"), i = "undefined" == typeof window ? {} : window, s = ["moz", "webkit"], a = "AnimationFrame", o = i["request" + a], u = i["cancel" + a] || i["cancelRequest" + a], h = !0, f = 0; f < s.length && !o; f++) o = i[s[f] + "Request" + a], u = i[s[f] + "Cancel" + a] || i[s[f] + "CancelRequest" + a];
      if (!o || !u) {
        h = !1;
        var l = 0,
          c = 0,
          p = [],
          d = 1e3 / 60;
        o = function (t) {
          if (0 === p.length) {
            var e = n(),
              r = Math.max(0, d - (e - l));
            l = r + e, setTimeout(function () {
              var t = p.slice(0);
              p.length = 0;
              for (var e = 0; e < t.length; e++)
                if (!t[e].cancelled) try {
                  t[e].callback(l)
                } catch (r) {
                  setTimeout(function () {
                    throw r
                  }, 0)
                }
            }, Math.round(r))
          }
          return p.push({
            handle: ++c,
            callback: t,
            cancelled: !1
          }), c
        }, u = function (t) {
          for (var e = 0; e < p.length; e++) p[e].handle === t && (p[e].cancelled = !0)
        }
      }
      e.exports = function (t) {
        return h ? o.call(i, function () {
          try {
            t.apply(this, arguments)
          } catch (e) {
            setTimeout(function () {
              throw e
            }, 0)
          }
        }) : o.call(i, t)
      }, e.exports.cancel = function () {
        u.apply(i, arguments)
      }
    }, {
      "performance-now": 57
    }],
    57: [function (t, e, r) {
      (function (t) {
        (function () {
          var r, n, i;
          "undefined" != typeof performance && null !== performance && performance.now ? e.exports = function () {
            return performance.now()
          } : "undefined" != typeof t && null !== t && t.hrtime ? (e.exports = function () {
            return (r() - i) / 1e6
          }, n = t.hrtime, r = function () {
            var t;
            return t = n(), 1e9 * t[0] + t[1]
          }, i = r()) : Date.now ? (e.exports = function () {
            return Date.now() - i
          }, i = Date.now()) : (e.exports = function () {
            return (new Date).getTime() - i
          }, i = (new Date).getTime())
        }).call(this)
      }).call(this, t("_process"))
    }, {
      _process: 28
    }],
    58: [function (t, e, r) {
      e.exports = function (t, e) {
        var r = t[2],
          n = t[3],
          i = e[2],
          s = e[3],
          a = r / n;
        return r > i && (r = i, n = ~~(r / a)), n > s && (n = s, r = ~~(n * a)), [e[0] + Math.max(0, Math.min(t[0], i - r)), e[1] + Math.max(0, Math.min(t[1], s - n)), r, n]
      }
    }, {}],
    59: [function (t, e, r) {
      function n(t, e) {
        return e || (e = [.5, .5]),
          function (r, n) {
            var i = r.width / r.height,
              s = n.width / n.height,
              a = Math.max(i, s),
              o = [i / a * n.width * t, s / a * n.height * t];
            return [n.width * e[0] - o[0] / 2, n.height * e[1] - o[1] / 2, o[0], o[1]]
          }
      }
      n.largest = n(1), e.exports = n
    }, {}],
    60: [function (t, e, r) {
      function n(t, e, r) {
        return t * (1 - r) + e * r
      }
      e.exports = function (t, e, r) {
        for (var i = [], s = 0; 4 > s; ++s) i[s] = n(t[s], e[s], r);
        return i
      }
    }, {}],
    61: [function (t, e, r) {
      ! function () {
        "use strict";

        function t(e) {
          e.permitHostObjects___ && e.permitHostObjects___(t)
        }

        function r(t) {
          return !(t.substr(0, p.length) == p && "___" === t.substr(t.length - 3))
        }

        function n(t) {
          if (t !== Object(t)) throw new TypeError("Not an object: " + t);
          var e = t[d];
          if (e && e.key === t) return e;
          if (!c(t)) return void 0;
          e = {
            key: t
          };
          try {
            return l(t, d, {
              value: e,
              writable: !1,
              enumerable: !1,
              configurable: !1
            }), e
          } catch (r) {
            return void 0
          }
        }

        function i(t) {
          return t.prototype = null, Object.freeze(t)
        }

        function s() {
          v || "undefined" == typeof console || (v = !0, console.warn("WeakMap should be invoked as new WeakMap(), not WeakMap(). This will be an error in the future."))
        }
        if ("undefined" == typeof ses || !ses.ok || ses.ok()) {
          "undefined" != typeof ses && (ses.weakMapPermitHostObjects = t);
          var a = !1;
          if ("function" == typeof WeakMap) {
            var o = WeakMap;
            if ("undefined" != typeof navigator && /Firefox/.test(navigator.userAgent));
            else {
              var u = new o,
                h = Object.freeze({});
              if (u.set(h, 1), 1 === u.get(h)) return void(e.exports = WeakMap);
              a = !0
            }
          }
          var f = (Object.prototype.hasOwnProperty, Object.getOwnPropertyNames),
            l = Object.defineProperty,
            c = Object.isExtensible,
            p = "weakmap:",
            d = p + "ident:" + Math.random() + "___";
          if ("undefined" != typeof crypto && "function" == typeof crypto.getRandomValues && "function" == typeof ArrayBuffer && "function" == typeof Uint8Array) {
            var g = new ArrayBuffer(25),
              _ = new Uint8Array(g);
            crypto.getRandomValues(_), d = p + "rand:" + Array.prototype.map.call(_, function (t) {
              return (t % 36).toString(36)
            }).join("") + "___"
          }
          if (l(Object, "getOwnPropertyNames", {
              value: function (t) {
                return f(t).filter(r)
              }
            }), "getPropertyNames" in Object) {
            var m = Object.getPropertyNames;
            l(Object, "getPropertyNames", {
              value: function (t) {
                return m(t).filter(r)
              }
            })
          }! function () {
            var t = Object.freeze;
            l(Object, "freeze", {
              value: function (e) {
                return n(e), t(e)
              }
            });
            var e = Object.seal;
            l(Object, "seal", {
              value: function (t) {
                return n(t), e(t)
              }
            });
            var r = Object.preventExtensions;
            l(Object, "preventExtensions", {
              value: function (t) {
                return n(t), r(t)
              }
            })
          }();
          var v = !1,
            y = 0,
            b = function () {
              function t(t, e) {
                var r, i = n(t);
                return i ? h in i ? i[h] : e : (r = o.indexOf(t), r >= 0 ? u[r] : e)
              }

              function e(t) {
                var e = n(t);
                return e ? h in e : o.indexOf(t) >= 0
              }

              function r(t, e) {
                var r, i = n(t);
                return i ? i[h] = e : (r = o.indexOf(t), r >= 0 ? u[r] = e : (r = o.length, u[r] = e, o[r] = t)), this
              }

              function a(t) {
                var e, r, i = n(t);
                return i ? h in i && delete i[h] : (e = o.indexOf(t), 0 > e ? !1 : (r = o.length - 1, o[e] = void 0, u[e] = u[r], o[e] = o[r], o.length = r, u.length = r, !0))
              }
              this instanceof b || s();
              var o = [],
                u = [],
                h = y++;
              return Object.create(b.prototype, {
                get___: {
                  value: i(t)
                },
                has___: {
                  value: i(e)
                },
                set___: {
                  value: i(r)
                },
                delete___: {
                  value: i(a)
                }
              })
            };
          b.prototype = Object.create(Object.prototype, {
            get: {
              value: function (t, e) {
                return this.get___(t, e)
              },
              writable: !0,
              configurable: !0
            },
            has: {
              value: function (t) {
                return this.has___(t)
              },
              writable: !0,
              configurable: !0
            },
            set: {
              value: function (t, e) {
                return this.set___(t, e)
              },
              writable: !0,
              configurable: !0
            },
            "delete": {
              value: function (t) {
                return this.delete___(t)
              },
              writable: !0,
              configurable: !0
            }
          }), "function" == typeof o ? ! function () {
            function r() {
              function e(t, e) {
                return f ? h.has(t) ? h.get(t) : f.get___(t, e) : h.get(t, e)
              }

              function r(t) {
                return h.has(t) || (f ? f.has___(t) : !1)
              }

              function n(t) {
                var e = !!h["delete"](t);
                return f ? f.delete___(t) || e : e
              }
              this instanceof b || s();
              var u, h = new o,
                f = void 0,
                l = !1;
              return u = a ? function (t, e) {
                return h.set(t, e), h.has(t) || (f || (f = new b), f.set(t, e)), this
              } : function (t, e) {
                if (l) try {
                  h.set(t, e)
                } catch (r) {
                  f || (f = new b), f.set___(t, e)
                } else h.set(t, e);
                return this
              }, Object.create(b.prototype, {
                get___: {
                  value: i(e)
                },
                has___: {
                  value: i(r)
                },
                set___: {
                  value: i(u)
                },
                delete___: {
                  value: i(n)
                },
                permitHostObjects___: {
                  value: i(function (e) {
                    if (e !== t) throw new Error("bogus call to permitHostObjects___");
                    l = !0
                  })
                }
              })
            }
            a && "undefined" != typeof Proxy && (Proxy = void 0), r.prototype = b.prototype, e.exports = r, Object.defineProperty(WeakMap.prototype, "constructor", {
              value: WeakMap,
              enumerable: !1,
              configurable: !0,
              writable: !0
            })
          }() : ("undefined" != typeof Proxy && (Proxy = void 0), e.exports = b)
        }
      }()
    }, {}],
    62: [function (t, e, r) {
      "use strict";

      function n(t) {
        return t.replace(/^[A-Z]+_/, "")
      }

      function i(t) {
        var e = a.get(t);
        if (e) return e;
        for (var r = {}, i = t.getSupportedExtensions(), s = 0; s < i.length; ++s) {
          var o = i[s];
          if (0 !== o.indexOf("MOZ_")) {
            var u = t.getExtension(i[s]);
            if (u)
              for (;;) {
                r[o] = u;
                var h = n(o);
                if (h === o) break;
                o = h
              }
          }
        }
        return a.set(t, r), r
      }
      var s = "undefined" == typeof WeakMap ? t("weak-map") : WeakMap,
        a = new s;
      e.exports = i
    }, {
      "weak-map": 61
    }]
  }, {}, [1])(1)
});