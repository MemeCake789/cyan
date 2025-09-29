

import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ASCII() {
  const bgRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    window.params = {};
    window.params.seed = params.get('seed') || Math.random().toString(10).substring(2, 10);

  }, [location.search]);
    !(function () {
    "use strict";
    function t(t, e, o, i, A, n, s) {
        let r = 6 * t * 2,
            a = 6 * t * 2;
        const h = i,
            l = A,
            c = i + n,
            f = A,
            g = i + n,
            d = A + s,
            w = i,
            M = A + s;
        (e[r++] = h),
            (e[r++] = l),
            (e[r++] = c),
            (e[r++] = f),
            (e[r++] = w),
            (e[r++] = M),
            (e[r++] = w),
            (e[r++] = M),
            (e[r++] = c),
            (e[r++] = f),
            (e[r++] = g),
            (e[r++] = d),
            null !== o && ((o[a++] = 0), (o[a++] = 0), (o[a++] = 1), (o[a++] = 0), (o[a++] = 0), (o[a++] = 1), (o[a++] = 0), (o[a++] = 1), (o[a++] = 1), (o[a++] = 0), (o[a++] = 1), (o[a++] = 1));
    }
    function e(t, e, o) {
        let i = 6 * t * 3;
        for (let t = 0; t < 6; t++) (e[i++] = o[0]), (e[i++] = o[1]), (e[i++] = o[2]);
    }
    class o {
        constructor(t, e, o, i) {
            (this.gl = t), (this.attributeName = e), (this.buffer = t.createBuffer()), (this._4e = o), (this._4f = i), (this.data = new Float32Array(i * o));
        }
        enable(t) {
            const e = this.gl,
                o = e.getAttribLocation(t, this.attributeName);
            e.bindBuffer(e.ARRAY_BUFFER, this.buffer), e.enableVertexAttribArray(o), e.vertexAttribPointer(o, this._4e, this.gl.FLOAT, !1, 0, 0);
        }
        bufferData(t = this.gl.DYNAMIC_DRAW) {
            const e = this.gl;
            e.bindBuffer(e.ARRAY_BUFFER, this.buffer), e.bufferData(e.ARRAY_BUFFER, this.data, t);
        }
    }
    const i = (function () {
        const t = document.createElement("a");
        return (
            document.body.appendChild(t),
            (t.style.display = "none"),
            function (e, o) {
                (t.href = URL.createObjectURL(e)), (t.download = o), t.click();
            }
        );
    })();
    function A(t, e, o) {
        const i = t.createShader(o);
        if ((t.shaderSource(i, e), t.compileShader(i), !0 !== t.getShaderParameter(i, t.COMPILE_STATUS))) throw t.getShaderInfoLog(i);
        return i;
    }
    class n {
        gl;
        program;
        uniforms;
        constructor(t, e) {
            (this.gl = t), (this.program = e), (this.uniforms = []), (this.locations = []);
            const o = t.getProgramParameter(e, t.ACTIVE_UNIFORMS);
            for (let i = 0; i < o; ++i) {
                const o = t.getActiveUniform(e, i),
                    A = o.name,
                    n = t.getUniformLocation(e, A);
                (this.uniforms[A] = this.#t(o.type, n)), (this.locations[A] = n);
            }
            const i = t.getProgramParameter(e, t.ACTIVE_ATTRIBUTES);
            for (let o = 0; o < i; ++o) {
                const i = t.getActiveAttrib(e, o).name,
                    A = t.getAttribLocation(e, i);
                this.locations[i] = A;
            }
        }
        set(t, ...e) {
            this.uniforms[t] && this.uniforms[t](...e);
        }
        #t(t, e) {
            const o = this.gl;
            switch (t) {
                case o.BOOL:
                case o.INT:
                case o.SAMPLER_2D:
                case o.SAMPLER_2D_RECT:
                case o.SAMPLER_CUBE:
                    return function (t) {
                        return o.uniform1i(e, t), this;
                    };
                case o.FLOAT:
                    return function (t) {
                        return o.uniform1f(e, t), this;
                    };
                case o.FLOAT_VEC2:
                    return function (t, i) {
                        o.uniform2f(e, t, i);
                    };
                case o.FLOAT_VEC3:
                    return function (t, i, A) {
                        o.uniform3f(e, t, i, A);
                    };
                case o.FLOAT_VEC4:
                    return function (t, i, A, n) {
                        o.uniform4f(e, t, i, A, n);
                    };
                case o.FLOAT_MAT3:
                    return function (t) {
                        o.uniformMatrix3fv(e, !1, t.toFloat32Array());
                    };
                case o.FLOAT_MAT4:
                    return function (t) {
                        o.uniformMatrix4fv(e, !1, t.toFloat32Array());
                    };
            }
            return function () {
                throw "Don’t know how to set type: " + t;
            };
        }
        use() {
            this.gl.useProgram(this.program);
        }
        _a5() {
            const t = this.gl,
                e = this.program;
            if ((t.linkProgram(e), !0 !== t.getProgramParameter(e, t.LINK_STATUS))) throw t.getProgramInfoLog(e);
            return !0;
        }
    }
    function s(t, e) {
        const o = (function (t) {
                return new Uint8Array(
                    atob(t)
                        .split("")
                        .map((t) => t.charCodeAt(0))
                );
            })(t),
            i = new Uint8Array(e);
        for (let t = 0; t < e; t++) {
            const e = Math.floor(t % 8),
                A = Math.floor(t / 8);
            i[t] = r(o[A], e);
        }
        return i;
    }
    const r = (t, e) => (t >> e) % 2,
        a = [
            "◆☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼",
            " !\"#$%&'()*+,-./0123456789:;<=>?",
            "@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_",
            "`abcdefghijklmnopqrstuvwxyz{|}~⌂",
            "Çüéâäàåçêë↗↖↙↘╱╲╳æÆôöòûùÿÖÜ¢£¥₧ƒ",
            "áíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐",
            "└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀",
            "αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■□",
        ]
            .join("")
            .split("");
    class h {
        constructor(t, e, o = Array) {
            (this.type = o), this.resize(t, e);
        }
        resize(t, e, o = 0) {
            (this.width = Math.max(0, t) || 0), (this.height = Math.max(0, e) || 0), (this.data = new this.type(t * e)), "function" == typeof o ? this.fill(o) : this.data.fill(o);
        }
        _4(t, e, o, i, A) {
            for (let n = 0; n < i; n++) for (let i = 0; i < o; i++) this.set(t + i, e + n, A);
            return this;
        }
        fill(t) {
            let e = 0;
            for (let o = 0; o < this.height; o++) for (let i = 0; i < this.width; i++) this.set(i, o, t(i, o, e++, this.width, this.height));
            return this;
        }
        _a3(t) {
            let e = 0;
            for (let o = 0; o < this.height; o++) for (let i = 0; i < this.width; i++) t(i, o, e++, this.width, this.height);
            return this;
        }
        _a6() {
            let t = 0;
            return this.data.forEach((e) => (t = Math.max(e, t))), t;
        }
        get(t, e) {
            return t < 0 || e < 0 || t >= this.width || e >= this.height ? null : this.data[t + e * this.width];
        }
        _7(t, e) {
            const o = 1 - Math.abs((Math.abs(t) % 2) - 1),
                i = 1 - Math.abs((Math.abs(e) % 2) - 1),
                A = Math.round(o * (this.width - 1)),
                n = Math.round(i * (this.height - 1));
            return this.get(A, n);
        }
        sample(t, e) {
            const o = t * this.width - 0.5,
                i = e * this.height - 0.5;
            let A = Math.floor(o),
                n = Math.floor(i),
                s = A + 1,
                r = n + 1;
            const a = o - A,
                h = i - n,
                c = l(this.get(A, n), this.get(s, n), a),
                f = l(this.get(A, r), this.get(s, r), a);
            return l(c, f, h);
        }
        _90(t = 0, e = 0, o = 0) {
            let i, A;
            1 == o || 2 == o ? ((i = this.height), (A = this.width)) : ((i = this.width), (A = this.height));
            const n = new h(i, A, this.type);
            for (let i = 0; i < n.height; i++)
                for (let A = 0; A < n.width; A++) {
                    let s, r;
                    0 == o ? ((s = A), (r = i)) : 1 == o ? ((s = n.height - i - 1), (r = A)) : 2 == o ? ((s = n.width - A - 1), (r = n.height - i - 1)) : 3 == o && ((s = i), (r = n.width - A - 1)),
                        (s = t ? n.width - 1 - s : s),
                        (r = e ? n.height - 1 - r : r),
                        n.set(s, r, this.get(A, i));
                }
            return n;
        }
        _a7(t, e, o, i) {
            const A = new h(o, i, this.type);
            for (let o = 0; o < A.height; o++) for (let i = 0; i < A.width; i++) A.set(i, o, this.get(i + t, o + e));
            return A;
        }
        set(t, e, o) {
            t < 0 || e < 0 || t >= this.width || e >= this.height || (this.data[t + e * this.width] = o);
        }
        _95(t) {
            t.length == this.data.length && t.forEach((t, e) => (this.data[e] = t));
        }
        _93(t, e, o, i, A) {
            for (let n = 0; n < i; n++) for (let i = 0; i < o; i++) this.set(t + i, e + n, A[i + o * n]);
        }
        _94(t, e, o) {
            this._93(t, e, o.width, o.height, o.data);
        }
    }
    function l(t, e, o) {
        return t * (1 - o) + e * o;
    }
    class c {
        constructor(t = 1e3) {
            (this._6e = t), (this.fps = 0), (this._72 = 0), (this._70 = 0);
        }
        tick(t) {
            return t >= this._70 + this._6e && ((this.fps = (this._72 * this._6e) / (t - this._70)), (this._70 = t), (this._72 = 0)), this._72++, this.fps;
        }
    }
    const f = 1 / 2 ** 32;
    class g {
        int() {}
        float(t = 1) {
            return this.int() * f * t;
        }
        _80(t) {
            return this.float() < t;
        }
        norm(t = 1) {
            return 2 * (this.int() * f - 0.5) * t;
        }
        _81(t, e) {
            const o = this._84(t, e);
            return this.float() < 0.5 ? o : -o;
        }
        _84(t, e) {
            return this.float() * (e - t) + t;
        }
        _83(t, e) {
            const o = (0 | e) - (t |= 0);
            return o ? t + (this.int() % o) : t;
        }
        _82(t, e) {
            const o = (e >>> 0) - (t >>>= 0);
            return o ? t + (this.int() % o) : t;
        }
        _87() {
            let t;
            return (t = 1 == arguments.length && Array.isArray(arguments[0]) ? arguments[0] : [...arguments]), t[this._83(0, t.length)];
        }
        _a8(t) {
            for (let e = t.length - 1; e > 0; e--) {
                const o = Math.floor(this.float() * (e + 1));
                [t[e], t[o]] = [t[o], t[e]];
            }
            return t;
        }
        _85(t) {
            const e = Object.keys(t).map((e) => [t[e]._75, e]);
            return this._86(e);
        }
        _86(t) {
            const e = t.map((t) => t[0]),
                o = t.map((t) => t[1]),
                i = [];
            for (let t = 0; t < e.length; t++) i[t] = e[t] + (i[t - 1] || 0);
            const A = i[i.length - 1] * this.float();
            for (let t = 0; t < o.length; t++) if (i[t] >= A) return o[t];
        }
    }
    class d extends g {
        constructor(t) {
            super(), (this.buffer = new Uint32Array(4)), this.seed(t);
        }
        copy() {
            return new d(this.buffer);
        }
        _a9() {
            return new Uint8Array(this.buffer.buffer);
        }
        int() {
            const t = this.buffer,
                e = (((t[0] + t[1]) >>> 0) + t[3]) >>> 0;
            return (t[3] = (t[3] + 1) >>> 0), (t[0] = t[1] ^ (t[1] >>> 9)), (t[1] = (t[2] + (t[2] << 3)) >>> 0), (t[2] = (((t[2] << 21) | (t[2] >>> 11)) + e) >>> 0), e;
        }
        seed(t) {
            return this.buffer.set(t), this;
        }
    }
    const w = {
        D1: { density: " ,;:¿?¡!‼¶§[](){}|/@#%&0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ«»^'\"°ⁿ²½¼Σ√┐┌┘└┼├┤┴┬│╗╔╝╚╬╠╣╩╦║▄▀▐▌█▓▒░╱╲╳■∙-+*÷±=<>═─↓↙←↖↑↗→↘→←↔▲▼►◄⌂", _75: 16 },
        D2: { density: " .,;:¿?¡!‼¶§[](){}|/@#%&0123456789«»'\"°ⁿ²½¼Σ√┐┌┘└┼├┤┴┬│╗╔╝╚╬╠╣╩╦║▄▀▐▌█▓▒░╱╲╳■∙-+*÷±=<>═─↓↙←↖↑↗→↘→←↔▲▼►◄⌂", _75: 16 },
        D3: { density: " ◆☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↓↙←↖↑↗→↘▲▼!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_'abcdefghijklmnopqrstuvwxyz", _75: 16 },
        D4: { density: " 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,;:?!()", _75: 16 },
        D5: { density: " •■↓↙←↖↑↗→↘░▒▓█", _75: 1 },
    };
    class M {
        constructor() {
            this.reset();
        }
        _73(t, e) {
            (this.fg = t), (this.bg = e);
        }
        reset() {
            (this.dest = 0), (this.index = 0), (this.fg = [0, 0, 0]), (this.bg = [0, 0, 0]);
        }
        clone() {
            const t = new M();
            return (t.dest = this.dest), (t.index = this.index), (t.fg = [...this.fg]), (t.bg = [...this.bg]), t;
        }
    }
    const m = ["0", "6ff6", "ff6"],
        u = "6666",
        p = "136",
        I = "776",
        D = ["7effffffffffff7e", "ffffffffffff7e"],
        B = "0",
        y = "7e7e7e7e7e7e7e00",
        E = "7e7e7e7e7e7e7e7e",
        N = "103070f1f3f7e",
        j = "7f7f7f7f7f7f7e",
        b = ["0", "ff00000000000000", "ff7e7e3c3c181800", "102040810204080", "fffefcf8f0e0c080"],
        _ = {
            T8: { _76: 8, _77: !1, _96: !0, data: [...b.map((t) => Object.create({ _74: t }))] },
            T8f: { _76: 8, _77: !1, _96: !0, data: [...b.map((t) => Object.create({ _74: t })), { _74: "ffffffffffffffff" }] },
            S8: {
                _76: 8,
                _77: !1,
                _96: !1,
                data: [
                    ...[
                        "ffffffffffffffff",
                        "f0fffffffffffff0",
                        "f0f0f0fffff0f0f0",
                        "f0f0fffff0f000",
                        "18f8f8fffff8f818",
                        "18ffffffffffff18",
                        "ffffffffffff18",
                        "f8f8f8f8f8f818",
                        "f8f8181818",
                        "181818f8f8181818",
                        "181818ffff181818",
                        "ffff000000",
                    ].map((t) => Object.create({ _74: t })),
                ],
            },
            W8oo: { _76: 8, _77: !1, _96: !1, data: [...D.map((t) => Object.create({ _74: t })), { _74: N, _75: 8 }, { _74: E }] },
            W8ss: { _76: 8, _77: !0, _96: !1, data: [{ _74: B }, ...D.map((t) => Object.create({ _74: t })), { _74: j, _75: 8 }, { _74: E }, { _74: y }] },
            W8o: { _76: 8, _77: !1, _96: !1, data: [...D.map((t) => Object.create({ _74: t })), { _74: N }, { _74: E }] },
            W8s: { _76: 8, _77: !0, _96: !1, data: [{ _74: B }, ...D.map((t) => Object.create({ _74: t })), { _74: j }, { _74: E }, { _74: y }] },
            W8oh: { _76: 8, _77: !0, _96: !1, data: [{ _74: B }, ...D.map((t) => Object.create({ _74: t })), { _74: N }, { _74: E, _75: 16 }] },
            W8sh: { _76: 8, _77: !0, _96: !1, data: [{ _74: B }, ...D.map((t) => Object.create({ _74: t })), { _74: j }, { _74: E, _75: 16 }, { _74: y }] },
            W4ss: { _76: 4, _77: !0, _96: !1, data: [...m.map((t) => Object.create({ _74: t })), { _74: I, _75: 8 }, { _74: u }] },
            W4o: { _76: 4, _77: !0, _96: !1, data: [...m.map((t) => Object.create({ _74: t })), { _74: p }, { _74: u }] },
            W4s: { _76: 4, _77: !0, _96: !1, data: [...m.map((t) => Object.create({ _74: t })), { _74: I }, { _74: u }] },
            W4oh: { _76: 4, _77: !0, _96: !1, data: [...m.map((t) => Object.create({ _74: t })), { _74: p }, { _74: u, _75: 16 }] },
            W4sh: { _76: 4, _77: !0, _96: !1, data: [...m.map((t) => Object.create({ _74: t })), { _74: I }, { _74: u, _75: 16 }] },
        };
    function x(t) {
        return t - Math.floor(t);
    }
    function T(t, e, o) {
        return (1 - o) * t + o * e;
    }
    class S {
        constructor(t) {
            (this._52 = t), (this._78 = new h(0, 0));
        }
        _aa() {
            const t = this._78.get(0, 0)._88();
            return this._78.data.every((e) => e._88() == t);
        }
        resize(t = this._78.width, e = this._78.height) {
            this._78.resize(t, e), this._78.fill((t, e, o) => new R(t, e));
        }
        init() {
            this._78.data.forEach((t) => {
                (t._8ad = !1),
                    (t._7a = Array(this._52.length)
                        .fill()
                        .map((t, e) => e));
            });
        }
        _6(t) {
            for (let e = 0; e < this._78.width; e++) this._7b(e, 0, t), this._7b(e, this._78.height - 1, t);
            for (let e = 0; e < this._78.height; e++) this._7b(0, e, t), this._7b(this._78.width - 1, e, t);
        }
        _79() {
            let t = !1;
            return (
                this._78.data
                    .filter((t) => {
                        if (t._89()) return !1;
                        const e = this._78.get(t.x + 1, t.y);
                        if (e && e._89()) return !0;
                        const o = this._78.get(t.x - 1, t.y);
                        if (o && o._89()) return !0;
                        const i = this._78.get(t.x, t.y + 1);
                        if (i && i._89()) return !0;
                        const A = this._78.get(t.x, t.y - 1);
                        return !(!A || !A._89());
                    })
                    .forEach((e) => {
                        const o = this._78.get(e.x + 1, e.y),
                            i = this._78.get(e.x - 1, e.y),
                            A = this._78.get(e.x, e.y + 1),
                            n = this._78.get(e.x, e.y - 1);
                        o &&
                            (e._7a = e._7a.filter((t) => {
                                const e = this._52[t];
                                return o._7a.some((t) => e.fit._7e.indexOf(t) >= 0);
                            })),
                            i &&
                                (e._7a = e._7a.filter((t) => {
                                    const e = this._52[t];
                                    return i._7a.some((t) => e.fit.left.indexOf(t) >= 0);
                                })),
                            A &&
                                (e._7a = e._7a.filter((t) => {
                                    const e = this._52[t];
                                    return A._7a.some((t) => e.fit._7f.indexOf(t) >= 0);
                                })),
                            n &&
                                (e._7a = e._7a.filter((t) => {
                                    const e = this._52[t];
                                    return n._7a.some((t) => e.fit._7d.indexOf(t) >= 0);
                                })),
                            0 == e._7a.length && (t = !0);
                    }),
                t
            );
        }
        _8a(t, e = 0) {
            let o = 1 / 0;
            const i = [];
            if (
                (this._78.data.forEach((t) => {
                    if (!t._89()) {
                        const e = t._8b();
                        e == o ? i.push(t) : e < o && ((i.length = 0), i.push(t), (o = e));
                    }
                }),
                i.length > 0)
            ) {
                const o = t._87(i),
                    A = [];
                for (const t of o._7a) A.push([this._52[t]._75, t]);
                const n = t._86(A);
                if ((o._8a(n), t._80(e))) {
                    const t = this._78.get(this._78.width - o.x - 1, o.y);
                    if (t != o) {
                        const e = this._52[n]._7c.fx;
                        -1 != t._7a.indexOf(e) && t._8a(e);
                    }
                }
                return !1;
            }
            return !0;
        }
        print() {
            let t = "";
            for (let e = 0; e < this._78.height; e++) {
                for (let o = 0; o < this._78.width; o++) {
                    t += "|" + (1 == this._78.get(o, e)._7a.length ? this._78.get(o, e)._7a : ".").toString().padStart(3, " ");
                }
                t += "|\n";
            }
            console.log("%c" + t, "font-family: monospace;");
        }
        _7b(t, e, o) {
            this._78.get(t, e)?._8a(o);
        }
    }
    function G(t, e) {
        for (let o = 0; o < t.length; o++) if (t[o]._ab._91(e._ab)) return o;
        return -1;
    }
    function C(t, e) {
        for (let o = 0; o < t._ab.height; o++) if (t._ab.get(t._ab.width - 1, o) !== e._ab.get(0, o)) return !1;
        return !0;
    }
    function Y(t, e) {
        for (let o = 0; o < t._ab.width; o++) if (t._ab.get(o, t._ab.height - 1) !== e._ab.get(o, 0)) return !1;
        return !0;
    }
    class R {
        constructor(t, e) {
            (this.x = t), (this.y = e), (this._8ad = !1), (this._7a = []);
        }
        _8a(t) {
            (this._8ad = !0), (this._7a.length = 0), this._7a.push(t);
        }
        _89() {
            return this._8ad;
        }
        _88() {
            return this._89 ? this._7a[0] : null;
        }
        _8b() {
            return this._7a.length;
        }
    }
    class P {
        constructor(t, e, o) {
            (this._ab = new h(e, o, Array)), this._ab._95(t._74), (this._75 = void 0 !== t._75 ? t._75 : 1), (this.fit = { _7d: [], left: [], _7e: [], _7f: [] }), (this._7c = { fx: null });
        }
        print() {
            let t = "";
            const e = [".", "X"];
            for (let o = 0; o < this._ab.height; o++) {
                for (let i = 0; i < this._ab.width; i++) {
                    t += e[this._ab.get(i, o)] || "-";
                }
                t += "\n";
            }
            console.log("%c" + t, "font-family: monospace;");
        }
    }
    function v(t, e, o, i) {
        return Math.abs(o - t) + Math.abs(i - e);
    }
    function z(t, e, o) {
        return t < e ? e : t > o ? o : t;
    }
    function H(t, e) {
        return e < t ? 0 : 1;
    }
    var O = "#version 300 es\nprecision highp float;uniform sampler2D _6a;in vec4 _5a,_59;in vec2 st;out vec4 color;void main(){color=mix(_59,_5a,texture(_6a,st).s);}\n",
        k =
            "#version 300 es\nprecision highp float;uniform vec2 _64;in float _57,_54;in vec3 _56,_55;in vec2 _58,a_uv;uniform float _5f;uniform vec2 _60,_61;out vec4 _5a,_59;out vec2 st;vec2 v;void main(){vec4 f=vec4(2./_64.s,-2./_64.t,-1,1);gl_Position=vec4(_58.st*f.st+f.pq,0,1);_5a=vec4(_56,1);_59=vec4(_55,1);float u=_61.s;v.s=mod(_57,u);v.t=floor(_57/u);st=(a_uv+v)/_61;}\n";
    const L = { _2f: "Too many attempts. Halted." },
        Z = 100;
    function F(t, e, o, i) {
        const A = new S(i);
        8 == e._2c ? A.resize(t._b_cols_8, t._b_rows_8) : A.resize(t._b_cols_4, t._b_rows_4);
        let n = 0;
        for (; U(A); ) {
            let t = !0,
                e = !1;
            for (; t; ) {
                if (n++ > Z) {
                    console.warn(L._2f);
                    break;
                }
                for (A.init(), o.Border && A._6(0); !e && ((t = A._79()), !t); ) e = A._8a(_8, o.Simmetry);
            }
        }
        return A;
    }
    function U(t) {
        const e = t._78._a7(1, 1, t._78.width - 2, t._78.height - 2),
            o = e.get(0, 0)._88();
        return e.data.every((t) => t._88() == o);
    }
    class Q {
        constructor(t) {
            (this.wfc = new S(t)), (this._5 = 0), (this.noiseScl = 1), (this.noiseZ = 0);
        }
        _swap(t) {
            [t._52A, t._52B] = [t._52B, t._52A];
        }
        __8d(t, e) {
            this.wfc._78._a3((o, i, A) => {
                const n = this.wfc._78.get(o, i)._7a[0] || 0,
                    s = t.tile_ox + o * t._2c,
                    r = t.tile_oy + i * t._2c;
                e._52A._94(s, r, this.wfc._52[n]._ab);
            });
        }
        _gen(t) {
            let e = !0,
                o = !1,
                i = 0;
            for (; e; ) {
                if (i++ > Z) {
                    console.warn(L._2f);
                    break;
                }
                for (this.wfc.init(); !o && ((e = this.wfc._79()), !e); ) o = this.wfc._8a(_8, t.Simmetry);
            }
        }
        _8e(t, e, o) {
            this._swap(e), this._gen(o), this.__8d(t, e), (this._5 = 0), (this.noiseScl = _8._84(4, 12)), (this.noiseZ = _8._84(-1, 1));
        }
        resize(t, e, o, i) {
            let A = Math.floor(t.cols / t._2c),
                n = Math.floor(t.rows / t._2c);
            (A = 2 * Math.floor(A / 2) + 2 + (8 == t._2c ? 1 : 0)), (n = 2 * Math.floor(n / 2) + 2 + (8 == t._2c ? 1 : 0)), this.wfc.resize(A, n);
            const s = Math.floor((A - i._78.width) / 2),
                r = Math.floor((n - i._78.height) / 2);
            let a = !0,
                h = !1,
                l = 0;
            for (; a; ) {
                if (l++ > Z) {
                    console.warn(L._2f);
                    break;
                }
                this.wfc.init();
                for (let t = 1; t < i._78.height - 1; t++)
                    for (let e = 1; e < i._78.width - 1; e++) {
                        const o = i._78.get(e, t)._7a[0];
                        this.wfc._7b(s + e, r + t, o);
                    }
                for (; !h && ((a = this.wfc._79()), !a); ) h = this.wfc._8a(_8, o.Simmetry);
            }
            this.__8d(t, e), this._8e(t, e, o);
        }
        _a3(t, e, o, i) {
            const A = ((n = this._5), (r = -1) + ((n - (s = 0)) / (300 - s)) * (1 - r));
            var n, s, r;
            o.mask._a3((t, e, i, n, s) => {
                const r = e / s;
                0.5 * _9((t / n) * this.noiseScl, r * this.noiseScl, this.noiseZ) + 0.5 < A ? o.mask.set(t, e, o._52A.get(t, e)) : o.mask.set(t, e, o._52B.get(t, e));
            }),
                e._2e || (this._5 >= 300 && this._8e(e, o, i), this._5++);
        }
    }
    const W = [
            [0, 0],
            [0, -1],
            [1, -1],
            [1, 0],
            [1, 1],
            [0, 1],
            [-1, 1],
            [-1, 0],
            [-1, -1],
        ],
        K = [0, 1, 8, 7, 6, 5, 4, 3, 2];
    class J {
        constructor() {}
        _8e(t, e) {
            const o = _8._87(Object.keys(X)),
                i = X[o](t);
            (this.warp_fn = i.fn), (this._5 = i.short ? _8._83(20, 80) : _8._83(200, 800)), (this.simmetry = !!i._9b || _8._87(!0, !1));
        }
        _a3(t, e, o) {
            const i = this.simmetry ? e.cols / 2 : e.cols,
                A = Math.floor(e.cols / 1) - 1,
                n = Math.floor(e.rows / 1) - 1,
                s = (e.cols / e.rows) * e._19;
            for (let r = 0; r < e.rows; r++)
                for (let a = 0; a < i; a++) {
                    const i = ((a / A) * 2 - 1) * s,
                        h = (r / n) * 2 - 1,
                        l = this.warp_fn(i, h, a, r, t);
                    o.warp.set(a, r, l), this.simmetry && o.warp.set(e.cols - a - 1, r, K[l]);
                }
            ([o._9e, o._9f] = [o._9f, o._9e]),
                o.mask._a3((t, i, A, n, s) => {
                    if (1 == o.mask.get(t, i)) {
                        const A = o.warp.get(t, i),
                            n = W[A].map((e, o) => e + [t, i][o]);
                        (n[0] = z(n[0], 0, e.cols - 1)), (n[1] = z(n[1], 0, e.rows - 1));
                        const s = o._9f.get(...n);
                        o._9e.set(t, i, s);
                    } else {
                        const e = o.background.get(t, i);
                        o._9e.set(t, i, e);
                    }
                }),
                this._5-- <= 0 && this._8e(e, o);
        }
    }
    const X = {
            _9d: (t) => {
                const e = _8._84(0.003, 0.02) * _8._87(-1, 1),
                    o = _8._84(0.003, 0.02) * _8._87(-1, 1),
                    i = _8._84(0.001, 0.005) * _8._87(-1, 1),
                    A = _8._84(0.75, 1.5);
                return {
                    short: !1,
                    _9b: !1,
                    fn: (t, n, s, r, a) => {
                        const h = 1 * Math.cos(a * e),
                            l = 1 * Math.sin(a * o),
                            c = Math.sin(a * i),
                            f = 0.5 * _9(t * A + h, n * A + l, c) + 0.5;
                        return (Math.floor(8 * f) % 8) + 1;
                    },
                };
            },
            Plasma: (t) => {
                const e = _8._84(0.5, 3),
                    o = _8._84(1, 4),
                    i = _8._84(0.001, 0.03) * _8._87(-1, 1),
                    A = _8._84(0.001, 0.03) * _8._87(-1, 1),
                    n = _8._84(0.001, 0.03) * _8._87(-1, 1);
                return {
                    short: !1,
                    _9b: !1,
                    fn: (t, s, r, a, h) => {
                        const l = Math.sqrt(t * t + s * s) * o,
                            c = Math.sin(h * i) * e,
                            f = Math.cos(h * A) * e,
                            g = Math.sin(t * c + s * f) + 1;
                        const d = Math.cos(l + h * n) + 1;
                        return (Math.floor(2 * (g + d)) % 8) + 1;
                    },
                };
            },
            Fan_1: (t) => {
                const e = _8._87(4, 8, 12),
                    o = _8._87(-1, 1),
                    i = (_8._84(0.01, 0.04) / e) * o;
                return {
                    short: !1,
                    _9b: !1,
                    fn: (t, o, A, n, s) => {
                        const r = ((((Math.atan2(o, t) / Math.PI + s * i) % 2) + 2) % 2) * e;
                        return (Math.round(r) % 8) + 1;
                    },
                };
            },
            Fan_2: (t) => {
                const e = _8._84(0.01, 0.02) * _8._87(-1, 1),
                    o = _8._84(0.005, 0.01) * _8._87(-1, 1),
                    i = _8._87(4, 8, 12),
                    A = _8._87(-1, 1),
                    n = (_8._84(0.02, 0.06) / i) * A;
                return {
                    short: !1,
                    _9b: !0,
                    fn: (t, A, s, r, a) => {
                        const h = Math.cos(a * e),
                            l = Math.sin(a * o),
                            c = ((((Math.atan2(A + l, t + h) / Math.PI + a * n) % 2) + 2) % 2) * i;
                        return (Math.round(c) % 8) + 1;
                    },
                };
            },
            _9c: (t) => {
                const e = _8._87(2, 4, 8, 16),
                    o = _8._87(0, 1);
                return {
                    short: !0,
                    _9b: !1,
                    fn: _8._87(
                        (i, A, n, s, r) => {
                            const a = s - t.tile_oy;
                            return 3 + 4 * (Math.floor(a / e + o) % 2);
                        },
                        (i, A, n, s, r) => {
                            const a = n - t.tile_ox;
                            return 1 + 4 * (Math.floor(a / e + o) % 2);
                        }
                    ),
                };
            },
            Flat: (t) => {
                const e = _8._83(1, 9);
                return { short: !0, _9b: !0, fn: (t, o, i, A, n) => e };
            },
            Box: (t) => {
                const e = _8._87(2, 4, 8, 16),
                    o = _8._83(0, 4),
                    i = _8._87(-1, 1),
                    A = _8._87(0, 1);
                return { short: !0, fn: (t, n, s, r, a) => ((((o + Math.floor(s / e) + i * Math.floor(r / e)) % 4) + 4) % 4) * 2 + A };
            },
        },
        V = {
            _ac: (t) => {
                const e = _8._87(0, (t.rows - 1) / 2, t.rows - 1),
                    o = (t.cols - 1) / 2,
                    i = v;
                return (t, A) => {
                    const n = i(o, e, t, A);
                    return Math.max(0, Math.floor(n));
                };
            },
            Flat: (t) => {
                const e = _8._86([
                    [6, 0],
                    [6, 1],
                    [1, 2],
                    [1, 3],
                ]);
                return 0 == e ? (t, e) => e : 1 == e ? (e, o) => t.rows - o - 1 : 2 == e ? (t, e) => t : 3 == e ? (e, o) => t.cols - e - 1 : void 0;
            },
        },
        q = {
            _ac: (t, e, o, i, A) => {
                const n = _8._87(0, 1),
                    s = _8._83(1, t._a0) * n,
                    r = _8._83(0, t._a0),
                    a = (t.cols / t.rows) * t._19,
                    h = (i / 2) * _8._87(0.5, 1, 2),
                    l = _8._87(-1, 0, 1),
                    c = v;
                return (e, o, n, f) => {
                    const g = c(0, l, 1 - (n / (i - 1)) * 2, (1 - (f / (A - 1)) * 2) / a) * h;
                    let d = r + Math.floor(g);
                    return (d += (Math.floor(e + o) % 2) * s), d % t._a0;
                };
            },
            Flat: (t, e, o, i, A) => {
                const n = _8._83(0, t._a0);
                return (e, o, i, A) => (n + i) % t._a0;
            },
            Checker: (t, e, o, i, A) => {
                const n = _8._87(0, _8._83(0, t._a0));
                let s = n;
                for (; s == n; ) s = _8._83(0, t._a0);
                return (e, o, i, A) => ((i + A) % 2 == 0 ? n : s) % t._a0;
            },
        };
    class $ {
        constructor() {
            (this._3 = 0), (this.snap = 0);
        }
        _8e(t, e) {
            const o = _8._87(1, 2, 4, 8),
                i = _8._87(1, 2, 4, 8),
                A = 2 * Math.ceil(t.cols / o / 2) + (o % 2 == 0 ? 1 : 0),
                n = 2 * Math.ceil(t.rows / i / 2) + (i % 2 == 0 ? 1 : 0),
                s = -(t.cols - A * o) / 2,
                r = -(t.rows - n * i) / 2,
                a = _8._87(Object.keys(q)),
                h = q[a](t, o, i, A, n),
                l = e._a1;
            l._a3((t, e, A, n, a) => {
                const c = Math.floor((t + s) / o),
                    f = Math.floor((e + r) / i),
                    g = h(t, e, c, f, (t + s) % o, (e + r) % i);
                l.set(t, e, g);
            });
            const c = _8._87(Object.keys(V)),
                f = V[c](t),
                g = e._a2;
            g._a3((t, e, o, i, A) => {
                const n = f(t, e);
                g.set(t, e, n);
            }),
                t._2e ? (this._3 = _8._83(80, 140)) : (this._3 = _8._83(0, 200));
        }
        _a3(t, e, o) {
            let i = !0;
            o.background._a3((t, A, n, s, r) => {
                if (0 == o._a2.data[n]) {
                    const t = o.background.data[n];
                    if (t != o._a1.data[n]) {
                        i = !1;
                        const A = (t + 1) % e._a0;
                        o.background.data[n] = A;
                    }
                } else (i = !1), o._a2.data[n]--;
            }),
                e._2e ? (this._3-- <= 0 || i) && (e.forceStop = !0) : this._3-- <= 0 && this._8e(e, o);
        }
    }
    const tt = "data:image/png;base64,",
        et = {
            icon32: tt + "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAQAAAABbAUdZAAAAH0lEQVR4AWPkYVBngBAHGHggBEVin+GEPcMBMEGRGABBDhgJhx1DmgAAAABJRU5ErkJggg==",
            icon48: tt + "iVBORw0KGgoAAAANSUhEUgAAADAAAAAwAQAAAAB/ecQqAAAAJ0lEQVR4AWMgG/DwGBsjqAMHzpyBUjSS+/z5/38EZW8Pp2giRy4AABsxT7EmhKkzAAAAAElFTkSuQmCC",
            icon192: tt + "iVBORw0KGgoAAAANSUhEUgAAAMAAAADAAQAAAAB6p1GqAAAAQUlEQVR4Ae3RMQoAIRQD0b3/pf8KEUutA28+KXTK+fACmGxyrWLOcl1CDz300KNQrFcWWsX+7hZ66KGHHgXiCoAf1Zv7PQ1KRx4AAAAASUVORK5CYII=",
            icon300: tt + "iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQAAAABRBrPYAAAAYklEQVR4Ae3TAQbAMAyG0bCD9eo7WMhAY8AYEH2fCniA/iFJkvSjq+59V/bDZrI2ffsFNofZqZ1idorZKWanmJ0eySpj1b5djmVYvMxkhvnkdorZKWanmJ1ih+0U+06SJOkBQ2A1ZsswJrIAAAAASUVORK5CYII=",
            icon512:
                tt +
                "iVBORw0KGgoAAAANSUhEUgAAAgAAAAIAAQAAAADcA+lXAAAAo0lEQVR4Ae3WsQ2EMBBE0evg+u+SDoYEITFkbLjvB8iJX8j4J0mSJEmSJEmSNC45nqd/Uh8AAABYANx3+9QfAAAAWADYBQAAALALAAAAYBcAAADAOxEAAAC8EwEAAMA7cQgAAABArt9mnaoNAAAAALzvrgEAAADALgAAAIBdAAAAALsAAAAAduETAAAAAHYBAAAA7AIAAAAMkiRJkiRJkiRJOgGTaCKSKn3JkQAAAABJRU5ErkJggg==",
            iconSVG:
                "data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHdpZHRoPSI1MTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0ibTAgMGg1MTJ2NTEyaC01MTJ6Ii8+PGcgc3Ryb2tlLXdpZHRoPSIyMCI+PGcgZmlsbD0iI2ZmZiI+PHBhdGggZD0ibTEzNiA5NmgyMHYyMGgtMjB6Ii8+PHBhdGggZD0ibTIxNiA5NmgyMHYyMGgtMjB6Ii8+PHBhdGggZD0ibTk2IDExNmgyMHYyMGgtMjB6Ii8+PHBhdGggZD0ibTE3NiAxMTZoMjB2MjBoLTIweiIvPjxwYXRoIGQ9Im0xMzYgMTM2aDIwdjIwaC0yMHoiLz48cGF0aCBkPSJtMjE2IDEzNmgyMHYyMGgtMjB6Ii8+PHBhdGggZD0ibTk2IDE1NmgyMHYyMGgtMjB6Ii8+PHBhdGggZD0ibTE3NiAxNTZoMjB2MjBoLTIweiIvPjxwYXRoIGQ9Im0xMzYgMTc2aDIwdjIwaC0yMHoiLz48cGF0aCBkPSJtMjE2IDE3NmgyMHYyMGgtMjB6Ii8+PHBhdGggZD0ibTk2IDE5NmgyMHYyMGgtMjB6Ii8+PHBhdGggZD0ibTE3NiAxOTZoMjB2MjBoLTIweiIvPjxwYXRoIGQ9Im0xMzYgMjE2aDIwdjIwaC0yMHoiLz48cGF0aCBkPSJtMjE2IDIxNmgyMHYyMGgtMjB6Ii8+PHBhdGggZD0ibTk2IDIzNmgyMHYyMGgtMjB6Ii8+PHBhdGggZD0ibTE3NiAyMzZoMjB2MjBoLTIweiIvPjwvZz48ZyBmaWxsPSIjZmZmIj48cGF0aCBkPSJtMjc2IDk2aDIwdjIwaC0yMHoiLz48cGF0aCBkPSJtMzE2IDk2aDIwdjIwaC0yMHoiLz48cGF0aCBkPSJtMzU2IDk2aDIwdjIwaC0yMHoiLz48cGF0aCBkPSJtMzk2IDk2aDIwdjIwaC0yMHoiLz48cGF0aCBkPSJtMjU2IDExNmgyMHYyMGgtMjB6Ii8+PHBhdGggZD0ibTI5NiAxMTZoMjB2MjBoLTIweiIvPjxwYXRoIGQ9Im0zMzYgMTE2aDIwdjIwaC0yMHoiLz48cGF0aCBkPSJtMzc2IDExNmgyMHYyMGgtMjB6Ii8+PHBhdGggZD0ibTI3NiAxMzZoMjB2MjBoLTIweiIvPjxwYXRoIGQ9Im0zMTYgMTM2aDIwdjIwaC0yMHoiLz48cGF0aCBkPSJtMzU2IDEzNmgyMHYyMGgtMjB6Ii8+PHBhdGggZD0ibTM5NiAxMzZoMjB2MjBoLTIweiIvPjxwYXRoIGQ9Im0yNTYgMTU2aDIwdjIwaC0yMHoiLz48cGF0aCBkPSJtMjk2IDE1NmgyMHYyMGgtMjB6Ii8+PHBhdGggZD0ibTMzNiAxNTZoMjB2MjBoLTIweiIvPjxwYXRoIGQ9Im0zNzYgMTU2aDIwdjIwaC0yMHoiLz48cGF0aCBkPSJtMjc2IDE3NmgyMHYyMGgtMjB6Ii8+PHBhdGggZD0ibTMxNiAxNzZoMjB2MjBoLTIweiIvPjxwYXRoIGQ9Im0zNTYgMTc2aDIwdjIwaC0yMHoiLz48cGF0aCBkPSJtMzk2IDE3NmgyMHYyMGgtMjB6Ii8+PHBhdGggZD0ibTI1NiAxOTZoMjB2MjBoLTIweiIvPjxwYXRoIGQ9Im0yOTYgMTk2aDIwdjIwaC0yMHoiLz48cGF0aCBkPSJtMzM2IDE5NmgyMHYyMGgtMjB6Ii8+PHBhdGggZD0ibTM3NiAxOTZoMjB2MjBoLTIweiIvPjxwYXRoIGQ9Im0yNzYgMjE2aDIwdjIwaC0yMHoiLz48cGF0aCBkPSJtMzE2IDIxNmgyMHYyMGgtMjB6Ii8+PHBhdGggZD0ibTM1NiAyMTZoMjB2MjBoLTIweiIvPjxwYXRoIGQ9Im0zOTYgMjE2aDIwdjIwaC0yMHoiLz48cGF0aCBkPSJtMjU2IDIzNmgyMHYyMGgtMjB6Ii8+PHBhdGggZD0ibTI5NiAyMzZoMjB2MjBoLTIweiIvPjxwYXRoIGQ9Im0zMzYgMjM2aDIwdjIwaC0yMHoiLz48cGF0aCBkPSJtMzc2IDIzNmgyMHYyMGgtMjB6Ii8+PC9nPjxnPjxwYXRoIGQ9Im05NiAyNTZoMzIwdjE2MGgtMzIweiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Im0xMzYgMjU2aDIwdjIwaC0yMHoiLz48cGF0aCBkPSJtMjE2IDI1NmgyMHYyMGgtMjB6Ii8+PHBhdGggZD0ibTk2IDI3NmgyMHYyMGgtMjB6Ii8+PHBhdGggZD0ibTE3NiAyNzZoMjB2MjBoLTIweiIvPjxwYXRoIGQ9Im0xMzYgMjk2aDIwdjIwaC0yMHoiLz48cGF0aCBkPSJtMjE2IDI5NmgyMHYyMGgtMjB6Ii8+PHBhdGggZD0ibTk2IDMxNmgyMHYyMGgtMjB6Ii8+PHBhdGggZD0ibTE3NiAzMTZoMjB2MjBoLTIweiIvPjxwYXRoIGQ9Im0xMzYgMzM2aDIwdjIwaC0yMHoiLz48cGF0aCBkPSJtMjE2IDMzNmgyMHYyMGgtMjB6Ii8+PHBhdGggZD0ibTk2IDM1NmgyMHYyMGgtMjB6Ii8+PHBhdGggZD0ibTE3NiAzNTZoMjB2MjBoLTIweiIvPjxwYXRoIGQ9Im0xMzYgMzc2aDIwdjIwaC0yMHoiLz48cGF0aCBkPSJtMjE2IDM3NmgyMHYyMGgtMjB6Ii8+PHBhdGggZD0ibTk2IDM5NmgyMHYyMGgtMjB6Ii8+PHBhdGggZD0ibTE3NiAzOTZoMjB2MjBoLTIweiIvPjwvZz48L2c+PC9zdmc+",
        };
    function ot(t) {
        return [((t >> 8) & 15) / 15, ((t >> 4) & 15) / 15, (15 & t) / 15];
    }
    const it = {
            TV: [3986, 3986, 3986, 2031],
            Sakura: [2560, 3840, 4015, 4095],
            "EGA 1": [2570, 3935, 2640, 4085, 2730, 160, 170, 1535, 2560, 3925],
            "EGA 2": [2735, 1455, 1370, 2565, 3840, 4010, 4095],
            "EGA 3": [1280, 2730, 2730, 2730, 2730, 1365, 2560, 2730, 1365, 170],
            "EGA 4": [1365, 10, 1375, 160, 1525, 170, 1535, 2560, 3925, 2570, 3935, 2640, 4085, 2730, 4095],
            "EGA 5": [10, 1375, 1450, 1525, 4085, 4095, 2730, 3925, 2570],
            "EGA 6": [4090, 3930, 3920, 3845, 2565, 90, 170, 1365],
            "EGA 7": [1285, 2570, 3855, 2730, 4e3, 4080, 4095],
            "EGA 8": [1285, 2645, 4005, 4080, 2805, 1525, 170, 1370],
            "CGA 1": [1535, 3935, 4095],
            "CGA 2": [170, 2570, 2730],
            "CGA 3": [1525, 3925, 4085],
            "4 Bit": [1365, 1375, 1525, 1535, 3925, 3935, 4085, 2730, 10, 160, 170, 2560, 2570, 2720, 4095],
            F00: [2730, 3840],
            C00: [1365, 2730, 3072],
            FAA: [2730, 4010],
            BSOD: [2730, 15, 4095],
            Gray: [1365, 2730, 4095],
            Console: [192],
            Com: [10, 143, 197, 819, 1600, 1911, 2048, 2806, 2814, 3003, 3148, 3461, 3815, 3959, 4095],
        },
        At = {
            _a4: "Sharp8",
            _23: 2,
            _24: 8,
            _1a: 8,
            _22: 256,
            _28: [
                "CH5+NggcCAD/AP94PHx+CBSB/38cHBwA/zzDcGZsZioipdt/Pms+GOdmmVhmfH4cQYH/f39/f",
                "zzDQr0ePAxmdyKl2z4+az48w0K9MxgMdhwUmeccHAgIGOdmmTN+D3cqCIH/CAgcHAD/PMMeGA",
                "8HCAB+fgAAAAAA/wD/AAAAAAABQAhmfn4ADAgIAAAAAAAAB3AcZmsDAB4cCBAEACQIfx98PmZ",
                "rPgA/KgggAgNCHH9/fwhmbmMADAgIf38D/z4+H3w+Zmg+fz8IKiACA0J/HAdwHABoYH8eCBwQ",
                "BH8kfwgBQAhmaD9/DAgIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYNjYYAB4cMAwAAAAAAEAAG",
                "DY2fmMzGBgYNhgAAABgABg2fwMzGwwMMBwYAAAAMAAYADY+GA4ADDB/fgA+ABgAGAB/YAxbAA",
                "wwHBgcAAAMAAAANj9mMwAYGDYYGAAcBgAYADYYY24AMAwAAAwAHAMAAAAAAAAAAAAAAAAAAAA",
                "APgw+fzh/PH8+PgAAMAAGPmMOYzA8AwZgY2MYGBgADGNzDWAYNj8DMGNjGBgMfhhgaww4MDNg",
                "Pxg+fgAABgAwMGcMDmB/YGMMY2AAGAwAGBhjDANjMGNjDGNjGBAYfgwAPj9/PjA+Pgw+PhgIM",
                "AAGGAAAAAAAAAAAAAAAAAAAAAA+HD8+H39/PmMefGMDY2M+YzZjYzMDA2NjDDAzA3dnY3NjYw",
                "NjAwMDYwwwGwN/b2NbYz8DYx8fA38MMA8Da3tjc39jA2MDA3NjDDMbA2NzYwNjY2MzAwNjYww",
                "zMwNjY2M+Yz8+H38DfmMeHmN/Y2M+AAAAAAAAAAAAAAAAAAAAAD8+Pz4/Y2NjYzN/PAM8CABj",
                "Y2NjDGNjY2MzYAwGMBwAY2NjAwxjY2M2MzAMDDA2AD9jPz4MYzZrHB4YDBgwYwADaxtgDGM2f",
                "zYMDAwwMAAAAzMzYwxjHHdjDAYMYDAAAANuYz4MPhxjYwx/PEA8AH8AAAAAAAAAAAAAAAAAAA",
                "AAHAADAGAAPAADDDADDgAAAAwAAwBgAGYAAwAAAwwAAAAYPjs+bj4GfjsOODMMMz0+AGBnA3N",
                "jH2NnDDAbDH9nYwB+YwNjfwZ+YwwzHwxrY2MAY2NjYwMGYGMMMzMMa2NjAH4/Pn5+Bj5jHh5j",
                "HmNjPgAAAAAAAAAAAAAAAAAAAAAAAAAABgAAAAAAADgMB24AAAAAAAYAAAAAAAAMDAw7AD8+P",
                "X4/Y2NjY2N/DBwMAAhjM2cDBmNjazZjMAcYOAAcPz4DPgZjY2scfhwMHAwANgMwA2BmYzZ/Nm",
                "AGDBwMAGMDcAM/PF4cNmM/fzgMBwB/AAAAAAAAAAAAAAAAAAAAAD5jEAg2BAgACDYAAAAAgAF",
                "jAAgUAAgAABQAeB5AAkACAwA+Hh4eHj4+PmAGIAQgBGNjYzAwMDADY2NQChJIEAg+Y38+Pj4+",
                "Y39/SBIKUAgQYGMDMzMzMz4DAwQgBmAEIDxePl5eXl4/Pj4CQB54AkAAAAAAAAAAAAAAAAAAA",
                "AGAgQB8CDYECAQ2NmMAHEIPOEIANhQACBQIAAAAGDYkE2wkNjMAAAAAAGM+Y34GfhMMGFh/Pj",
                "4+Y2NjY2MDDxgvHhg+M2NjY2NjfmNjAwZ+cwwkGzNjY2NjY2BjY35mGCMNQn5zPj4+Xl4/Pj4",
                "YPxhjBoEAAAAAAAAAAAAAAAAAAAAIEBAIAH8cHBgAADExGAAABAgIBD8AFjYAAAAZGRjMMx4A",
                "AAAAZxY2GAAADQ0AZmYwHD5jO288HAw/P3Y2GDPMPhhjY2d7AAAGAzBDKxhmZjMYY2Njcz4+Z",
                "gMwMX0YzDNePD5eY2MAADwAAHAgGAAAAAAAAAAAAAAAAAAAAAAAAESquxAQECgAACgoACgoEA",
                "ARVe4QEBAoAAAoKAAoKBAARKq7EBAfKAAfLyg/LygfABFV7hAfEC8/ECAoICA/EB9EqrsQEB8",
                "oKB8vKC8/AB8QEVXuEBAQKCgQKCgoAAAAEESquxAQECgoECgoKAAAABARVe4QEBAoKBAoKCgA",
                "AAAQEBAAEAAQECgoACgAKAAoEBAQABAAEBAoKAAoACgAKBAQEAAQABDwKOj47//o/+//8P//8",
                "P//EOgICAAACAAAAAAAEBAAEPAo+Oj/7+j/7/8AABAQABAQKAAoACgoACgAAAAQEAAQECgAKA",
                "AoKAAoAAAAEBAAEBAoACgAKCgAKAAoAAAoEAAAKBAQAP8AD/D/KAAAKBAAACgQEAD/AA/w/yj",
                "/ACjw8AAo/xAA/wAP8P//AP/4EBD4/xAf8P8AD/D/AP8oAPDwKCj/ABD//w/wAAAQKAAAECgo",
                "EAAQ//8P8AAAECgAABAoKBAAEP//D/AAABAoAAAQKCgQABD//w/wAAA+fwB/AAAAfj4cOABgf",
                "D5uY2N/Zn5mbhhjNgwAPgZjOz8DNgwbZjs8Y2MYNlkDYzNjAzYYG24YZn9jPmtJf2MzZwM2DB",
                "t+GDxjIjNrTQNjOzsDNmYbJhgYYzYzNj4GY24DAzZ/DgMYfj53HgADfGMAAAAAAAAAAAAAAAA",
                "AAAAAfhgMMHAYAAAcAABwHhwAAAAYGBjYGBhuNgAAMDYwAAAAfjAM2BgAOzYAADA2GDwefhgY",
                "GBgYfgAcGAAYNjw8EgAYDDAYGwBuABgYGwAAPBIAAAAAGBsYOwAAAB4AADwefn5+fhgOAAAAA",
                "AAMAAAAAAAAAAAYAAAAAAAAAAAAAAA=",
            ],
            _27: 16,
            _26: 16,
        };
    window.addEventListener("load", (r) => {
        !(function () {
           
        })(),
            (function () {
                const r = "Gyricon",
                    l = 65536,
                    f = !1,
                    g = Symbol(),
                    m = Symbol(),
                    u = Symbol(),
                    p = { width: 400, height: 672, cols: 24, rows: 40, _b_cols_8: 5, _b_rows_8: 7, _b_cols_4: 8, _b_rows_4: 12, _b: null },
                    I = { width: 480, height: 600, cols: 24, rows: 34, _b_cols_8: 5, _b_rows_8: 7, _b_cols_4: 8, _b_rows_4: 10, _b: null },
                    D = [0, 0, 0],
                    B = [1, 1, 1],
                    y = ot(2730),
                    E = ot(819);
                let N,
                    j,
                    b,
                    S,
                    R,
                    v = !1,
                    z = !0,
                    L = !1;
                const Z = Object.assign({ seed: Math.random().toString(16).substring(2), tokenId: null, env: null, mode: null, res: null }, window.params),
                    U = new URLSearchParams(location.search),
                    W = { scale: parseInt(U.get("scale")) || 0, fps: parseInt(U.get("fps")) || 0, canvasWidth: parseInt(U.get("canvasWidth")) || 0, canvasHeight: parseInt(U.get("canvasHeight")) || 0 };
               
                    
                    (document.documentElement.style.height = "100%"),
                    (document.body.style.height = "100%"),
                    (document.body.style.width = "100%"),
                    (document.body.style.margin = 0),
                    (document.body.style.padding = 0),
                    (document.body.style.overflow = "hidden"),
                    (document.body.style.backgroundColor = "rgba(0,0,0,0)"),
                    (document.body.style.display = "flex"),
                    (document.body.style.alignItems = "center"),
                    (document.body.style.justifyContent = "center");
                const K = document.createElement("canvas");
                document.body.appendChild(K),
                    (K.style.display = "block"),
                    (K.style.fontSmooth = "none"),
                    (K.style.fontSmooth = "never"),
                    (K.style["-webkitFontSmoothing"] = "none"),
                    (K.style.imageRendering = "crisp-edges"),
                    (K.style.imageRendering = "pixelated");
                const X = K.getContext("webgl2", { preserveDrawingBuffer: !0 });
                if (!X) {
                    const t = document.createElement("pre");
                    return (t.innerHTML = "WebGL error.\nProgram halted."), void document.body.insertBefore(t, document.body.firstChild);
                }
                let V;
                window.addEventListener("resize", (t) => {
                    clearTimeout(V),
                        (K.style.visibility = "hidden"),
                        (V = setTimeout((t) => {
                            (K.style.visibility = "visible"), (z = !0);
                        }, 1000));
                }),
                    console.log("Using seed: " + Z.seed);
                const q = (function (t) {
                    let e = 2166136261;
                    for (let o = 0; o < t.length; o++) e = Math.imul(e ^ t.charCodeAt(o), 16777619);
                    return function () {
                        return (e += e << 13), (e ^= e >>> 7), (e += e << 3), (e ^= e >>> 17), (e += e << 5) >>> 0;
                    };
                })(Z.seed);
                let tt;
                window._8 = new d([q(), q(), q(), q()]);
                window._9 = ((t = 0) => {
                        function e(e, o, i) {
                            return (e = 50 * x(0.3283079 * e + 0.7091)), (o = 50 * x(0.3283079 * o + 0.1131)), (i = 50 * x(0.3283079 * i + 0.3291)), 2 * x(1.36959861 * t + e * o * i * (e + o + i)) - 1;
                        }
                        return {
                            _99: function (t, o, i) {
                                let A = Math.floor(t),
                                    n = Math.floor(o),
                                    s = Math.floor(i),
                                    r = x(t),
                                    a = x(o),
                                    h = x(i),
                                    l = r * r * (3 - 2 * r),
                                    c = a * a * (3 - 2 * a);
                                return T(
                                    T(T(e(A + 0, n + 0, s + 0), e(A + 1, n + 0, s + 0), l), T(e(A + 0, n + 1, s + 0), e(A + 1, n + 1, s + 0), l), c),
                                    T(T(e(A + 0, n + 0, s + 1), e(A + 1, n + 0, s + 1), l), T(e(A + 0, n + 1, s + 1), e(A + 1, n + 1, s + 1), l), c),
                                    h * h * (3 - 2 * h)
                                );
                            },
                        };
                    })(1e6 * _8.float())._99),
                    "renderer" == Z.env && "stax" == Z.mode ? ((S = g), (R = p)) : "renderer" == Z.env && "flex" == Z.mode ? ((S = g), (R = I)) : "renderer" == Z.env && "standard" == Z.mode ? ((S = m), (R = p)) : ((S = u), (R = p));
                tt = "renderer" == Z.env;
                (N = W.scale || 1), (j = W.fps || 30);
                const et = {
                    W0: { front: { fg: [B], bg: B }, back: { fg: [D], bg: D }, _75: 1 },
                    W1: { front: { fg: new Array(_8._83(1, 6)).fill(D), bg: B }, back: { fg: [D], bg: D }, _75: 16 },
                    W2: { front: { fg: [B], bg: B }, back: { fg: new Array(_8._83(1, 4)).fill(B), bg: D }, _75: 4 },
                };
                _8._80(0.5) && (et.W1.front.fg.push(B), et.W2.back.fg.push(D));
                const nt = (function () {
                        const t = _8._85(w),
                            e = _8._87(Object.keys(_));
                        return {
                            Wave: e,
                            Density: t,
                            Mono: _8._85(et),
                            Palette: _8._87(Object.keys(it)),
                            Spacing: Math.pow(2, _8._83(1, 7)),
                            Simmetry: _8._86([
                                [2, 0],
                                [3, 0.6],
                                [1, 0.9],
                                [1, 1],
                            ]),
                            Border: _[e]._77,
                        };
                    })(),
                    st = (tt ? w[nt.Density].density.replaceAll("█", "") : w[nt.Density].density).split(""),
                    rt = _8._86([
                        [1, 0],
                        [4, _8._83(0, st.length)],
                    ]),
                    at = _[nt.Wave],
                    ht = 1.553,
                    lt = Z.res || 1852,
                    ct = Math.floor(lt * ht),
                    ft = Object.seal({ cols: 0, rows: 0, tile_cols: 0, tile_rows: 0, tile_ox: 0, tile_oy: 0, _35: 0, _3a: 0, forceStop: !1, _2e: tt, _2c: at._76, _19: At._24 / At._1a, _a0: st.length }),
                    gt = et[nt.Mono],
                    dt = it[nt.Palette].map(ot);
                _8._80(0.5) && dt.reverse();
                const wt = { front: { fg: Gt(dt, _8._83(0, dt.length)), bg: D }, back: { fg: [E], bg: D } },
                    Mt = {};
                a.forEach((t, e) => (Mt[t] = e));
                const mt = new n(
                        X,
                        (function (t, e, o) {
                            const i = A(t, e, t.VERTEX_SHADER),
                                n = A(t, o, t.FRAGMENT_SHADER),
                                s = t.createProgram();
                            if ((t.attachShader(s, i), t.attachShader(s, n), t.linkProgram(s), !0 !== t.getProgramParameter(s, t.LINK_STATUS))) throw t.getProgramInfoLog(s);
                            return s;
                        })(X, k, O)
                    ),
                    ut = { _5as: new o(X, "_56", 3, 6 * l), _59s: new o(X, "_55", 3, 6 * l), _5bs: new o(X, "_57", 1, 6 * l), _6d: new o(X, "_58", 2, 6 * l), uvs: new o(X, "a_uv", 2, 6 * l) },
                    pt = {
                        _9e: new h(0, 0, Array),
                        _9f: new h(0, 0, Array),
                        background: new h(0, 0, Array),
                        _a1: new h(0, 0, Array),
                        _a2: new h(0, 0, Array),
                        _52A: new h(0, 0, Array),
                        _52B: new h(0, 0, Array),
                        warp: new h(0, 0, Array),
                        mask: new h(0, 0, Array),
                    },
                    It = new h(0, 0, Array),
                    Dt = X.createTexture();
                {
                    X.bindTexture(X.TEXTURE_2D, Dt), X.pixelStorei(X.UNPACK_ALIGNMENT, 1);
                    const t = 0,
                        e = X.LUMINANCE,
                        o = At._27 * At._24,
                        i = At._26 * At._1a,
                        A = 0,
                        n = X.LUMINANCE,
                        r = X.UNSIGNED_BYTE,
                        a = s(At._28.join(""), o * i).map((t) => 255 * t);
                    X.texImage2D(X.TEXTURE_2D, t, e, o, i, A, n, r, a),
                        X.texParameteri(X.TEXTURE_2D, X.TEXTURE_WRAP_S, X.CLAMP_TO_EDGE),
                        X.texParameteri(X.TEXTURE_2D, X.TEXTURE_WRAP_T, X.CLAMP_TO_EDGE),
                        X.texParameteri(X.TEXTURE_2D, X.TEXTURE_MIN_FILTER, X.NEAREST),
                        X.texParameteri(X.TEXTURE_2D, X.TEXTURE_MAG_FILTER, X.NEAREST);
                }
                const Bt = [],
                    yt = !!at._96 && _8._87(!0, !1);
                at.data.forEach((t) => {
                    const e = {
                        _74: BigInt("0x" + t._74)
                            .toString(2)
                            .padStart(at._76 * at._76, "0")
                            .split("")
                            .map((t) => (yt ? ("0" == t ? 1 : 0) : "0" == t ? 0 : 1)),
                        _75: t._75,
                    };
                    !(function (t, e, o, i) {
                        if (0 === e._75) return;
                        (!1 === e._92 ? ["r0"] : ["r0", "r1", "r2", "r3"]).forEach((A) => {
                            const n = new P(e, o, i),
                                s = A[0],
                                r = A[1],
                                a = "r" == s ? parseInt(r) : 0;
                            if (((n._ab = n._ab._90(0, 0, a)), -1 == G(t, n))) {
                                t.push(n);
                                const A = t.length - 1,
                                    s = new P(e, o, i);
                                s._ab = n._ab._90(1, 0, 0);
                                let r = G(t, s);
                                -1 == r && (t.push(s), (r = t.length - 1)), (s._7c.fx = A), (n._7c.fx = r);
                            }
                        });
                    })(Bt, e, at._76, at._76);
                }),
                    (function (t) {
                        for (let e = 0; e < t.length; e++)
                            for (let o = 0; o < t.length; o++) {
                                const i = t[o],
                                    A = t[e];
                                C(i, A) && (i.fit._7e.push(e), A.fit.left.push(o)), Y(i, A) && (i.fit._7f.push(e), A.fit._7d.push(o));
                            }
                    })(Bt),
                    (p._b = F(p, ft, nt, Bt)),
                    (I._b = F(I, ft, nt, Bt));
                const Et = { _37: new Q(Bt), BG: new $(), _a: new J() },
                    Nt = new c(1e3);
                let jt = 0,
                    bt = -1e3;
                function _t(t) {
                    const e = requestAnimationFrame(_t),
                        o = t - bt,
                        A = 1e3 / j;
                    if (!(o < A)) {
                        if (((bt = t - (o % A)), z)) {
                            z = !1;
                            xt(X, ut, pt, It, mt, N, ft, R, tt ? m : S, W), Et.BG._8e(ft, pt), Et._a._8e(ft, pt), Et._37.resize(ft, pt, nt, R._b);
                        }
                        Et._37._a3(jt, ft, pt, nt), Et.BG._a3(jt, ft, pt), Et._a._a3(jt, ft, pt);
                        {
                            const t = 8,
                                e = t * 64,
                                o = Math.floor(jt / e),
                                i = (jt % e) / t;
                            It._a3((e, A, n, s, r) => {
                                const a = It.data[n],
                                    h = 1 == pt.mask.data[n];
                                let l;
                                if (S == m && f) l = wt;
                                else if (S == g || S == m) {
                                    l = e >= ft._35 && e < ft._35 + R.cols && A >= ft._3a && A < ft._3a + R.rows ? gt : wt;
                                } else l = wt;
                                const c = (pt._9e.data[n] + (h ? rt : 0)) % st.length,
                                    d = st[c],
                                    w = Mt[d];
                                if (((a.index = w), h)) {
                                    const e = l.front.fg.length,
                                        n = H(1, i + (A % t) / t) + o,
                                        s = (Math.floor(a.index / nt.Spacing) + n) % e;
                                    (a.fg = l.front.fg[s]), (a.bg = l.front.bg);
                                } else {
                                    const e = l.back.fg.length,
                                        n = H(1, i + (A % t) / t) + o,
                                        s = (Math.floor(a.index / nt.Spacing) + n) % e;
                                    (a.fg = l.back.fg[s]), (a.bg = l.back.bg);
                                }
                            });
                        }
                        if (v) {
                            const e = Math.round(Nt.tick(t)),
                                o = "~F~",
                                i = 12;
                            let A = "";
                            (A += o + "\n"),
                                (A += "fps".padEnd(i) + e + "←" + j + "\n"),
                                (A += "frame".padEnd(i) + jt + "\n"),
                                (A += o + "\n"),
                                (A += "cols".padEnd(i) + ft.cols + "\n"),
                                (A += "rows".padEnd(i) + ft.rows + "\n"),
                                (A += "width".padEnd(i) + X.canvas.width + "\n"),
                                (A += "height".padEnd(i) + X.canvas.height + "\n"),
                                (A += o + "\n"),
                                (A += "seed".padEnd(i) + Ct(Z.seed, i - 1) + "\n"),
                                (A += "tokenId".padEnd(i) + Ct(Z.tokenId, i - 1) + "\n"),
                                (A += o + "\n");
                            for (const t in nt) A += t.padEnd(i) + Ct(nt[t], i - 1) + "\n";
                            (A += o + "\n"),
                                (A += "i".padEnd(2).padStart(i) + "toggle info\n"),
                                (A += o + "\n"),
                                (A += "s".padEnd(2).padStart(i) + "toggle STAX\n"),
                                (A += "f".padEnd(2).padStart(i) + "toggle FLEX\n"),
                                (A += o + "\n"),
                                (A += "t".padEnd(2).padStart(i) + "export TXT\n"),
                                (A += "p".padEnd(2).padStart(i) + "export PNG∙1\n"),
                                (A += "P".padEnd(2).padStart(i) + "export PNG∙4\n"),
                                (A += o + "\n"),
                                (A += "↓↑".padEnd(3).padStart(i) + "change scale\n"),
                                (A += "0".padEnd(2).padStart(i) + "reset scale\n"),
                                (A += o + "\n"),
                                (A += "c".padEnd(2).padStart(i) + "hide cursor\n"),
                                (A += "x".padEnd(2).padStart(i) + "fullscreen\n"),
                                (A += o + "\n"),
                                A.trim()
                                    .replaceAll(o, "".padEnd(2 * i, "─"))
                                    .split("\n")
                                    .forEach((t, e) => {
                                        t.padEnd(2 * i, " ")
                                            .split("")
                                            .map((t) => a.indexOf(t))
                                            .forEach((t, o) => {
                                                const i = It.get(o, e);
                                                null !== i && ((i.index = t), (i.fg = y), (i.bg = D));
                                            });
                                    });
                        }
                        if (ft.forceStop) {
                            let t;
                            cancelAnimationFrame(e),
                                S == g ? ((t = It._a7(ft._35, ft._3a, R.cols, R.rows)), (t.data = t.data.map((t) => t || new M())), xt(X, ut, pt, It, mt, 1, ft, R, g, W)) : (t = It),
                                Tt(X, ut, mt, Dt, t, ft),
                                (document.complete = !0);
                        } else Tt(X, ut, mt, Dt, It, ft);
                        if ((jt++, b > 0)) {
                            const t = K.width * b,
                                e = K.height * b,
                                o = St();
                            (o.width = t), (o.height = e);
                            const A = o.getContext("2d");
                            (A.imageSmoothingEnabled = !1), A.drawImage(K, 0, 0, t, e);
                            const s = Date.now();
                            (n = r + "_" + s + "_x" + b + ".png"), o.toBlob((t) => i(t, n)), (b = 0);
                        }
                        var n;
                        if (L) {
                            let t = "";
                            It._a3((e, o, i, A, n) => {
                                const s = It.data[i].index,
                                    r = a[s];
                                (t += r), e == A - 1 && (t += "\n");
                            });
                            const e = Date.now(),
                                o = r + "_" + e + ".txt",
                                A = new Blob([t], { type: "text/plain;charset=utf-8" });
                            i(A, o), (L = !1);
                        }
                    }
                }
                function xt(e, o, i, A, n, s, r, a, h, c) {
                    const f = e.canvas;
                    let d;
                    h == g
                        ? ((f.width = a.width), (f.height = a.height), (d = 1))
                        : h == m
                        ? ((f.width = lt), (f.height = ct), (d = 2))
                        : ((f.width = c.canvasWidth || Math.floor(innerWidth / s)), (f.height = c.canvasHeight || Math.floor(innerHeight / s)), (d = 1)),
                        console.log(innerWidth, innerHeight, s),
                        (f.style.width = Math.floor((f.width * s) / d) + "px"),
                        (f.style.height = Math.floor((f.height * s) / d) + "px");
                    const w = f.width,
                        u = f.height;
                    let p = At._23 * d;
                    const I = 0,
                        D = 0,
                        B = 0,
                        y = 0;
                    let E, N;
                    h == g ? ((E = a.cols), (N = a.rows)) : ((E = Math.floor((w - 2 * I) / ((At._24 + B) * p))), (N = Math.floor((u - 2 * D) / ((At._1a + y) * p))), (E = 2 * Math.floor(E / 2)), (N = 2 * Math.floor(N / 2))),
                        (E + 2) * (N + 2) >= l && (N = Math.floor(l / (E + 2)) - 2),
                        (E = Math.max(2, E)),
                        (N = Math.max(2, N));
                    let j = Math.floor(E / r._2c),
                        b = Math.floor(N / r._2c);
                    (j = 2 * Math.floor(j / 2) + 2 + (8 == r._2c ? 1 : 0)),
                        (b = 2 * Math.floor(b / 2) + 2 + (8 == r._2c ? 1 : 0)),
                        (r.cols = E),
                        (r.rows = N),
                        (r.tile_cols = j),
                        (r.tile_rows = b),
                        (r.tile_ox = (E - j * r._2c) / 2),
                        (r.tile_oy = (N - b * r._2c) / 2),
                        (r._35 = (E - a.cols) / 2),
                        (r._3a = (N - a.rows) / 2);
                    const _ = Math.floor((w - (E * At._24 * p + (E - 1) * B)) / 2),
                        x = Math.floor((u - (N * At._1a * p + (N - 1) * y)) / 2),
                        T = At._24 * p,
                        S = At._1a * p,
                        G = At._24 * p + B,
                        C = At._1a * p + y;
                    let Y = 0;
                    for (let e = 0; e < N; e++)
                        for (let i = 0; i < E; i++) {
                            const A = _ + i * G,
                                n = x + e * C;
                            t(Y++, o._6d.data, o.uvs.data, A, n, T, S);
                        }
                    for (let e = 0; e < E; e++) {
                        const i = _ + e * G,
                            A = 0,
                            n = x + N * C;
                        t(Y++, o._6d.data, o.uvs.data, i, A, T, x), t(Y++, o._6d.data, o.uvs.data, i, n, T, x);
                    }
                    for (let e = 0; e < N; e++) {
                        const i = 0,
                            A = _ + E * G,
                            n = x + e * C;
                        t(Y++, o._6d.data, o.uvs.data, i, n, _, S), t(Y++, o._6d.data, o.uvs.data, A, n, _, S);
                    }
                    t(Y++, o._6d.data, o.uvs.data, 0, 0, _, x),
                        t(Y++, o._6d.data, o.uvs.data, _ + E * G, 0, _, x),
                        t(Y++, o._6d.data, o.uvs.data, _ + E * G, x + N * C, _, x),
                        t(Y++, o._6d.data, o.uvs.data, 0, x + N * C, _, x),
                        o.uvs.enable(n.program),
                        o.uvs.bufferData(e.STATIC_DRAW),
                        (o.uvs._6c = !0),
                        o._6d.enable(n.program),
                        o._6d.bufferData(e.STATIC_DRAW),
                        (o._6d._6c = !0),
                        Object.keys(i).forEach((t) => {
                            i[t].resize(E, N);
                        }),
                        A.resize(E, N, (t, e, o) => new M());
                }
                function Tt(t, o, i, A, n, s) {
                    n.data.forEach((t, i) => {
                        !(function (t, e, o) {
                            let i = 2 * t * 3;
                            for (let t = 0; t < 6; t++) e[i++] = o;
                        })(i, o._5bs.data, t.index),
                            e(i, o._59s.data, t.bg),
                            e(i, o._5as.data, t.fg);
                    });
                    {
                        let t = n.data.length;
                        for (let i = 0; i < s.cols; i++) {
                            const A = n.get(i, 0);
                            e(t, o._5as.data, A.bg), e(t, o._59s.data, A.bg), t++;
                            const r = n.get(i, s.rows - 1);
                            e(t, o._5as.data, r.bg), e(t, o._59s.data, r.bg), t++;
                        }
                        for (let i = 0; i < s.rows; i++) {
                            const A = n.get(0, i);
                            e(t, o._5as.data, A.bg), e(t, o._59s.data, A.bg), t++;
                            const r = n.get(s.cols - 1, i);
                            e(t, o._5as.data, r.bg), e(t, o._59s.data, r.bg), t++;
                        }
                        [n.get(0, 0), n.get(s.cols - 1, 0), n.get(s.cols - 1, s.rows - 1), n.get(0, s.rows - 1)].forEach((i) => {
                            e(t, o._5as.data, i.bg), e(t, o._59s.data, i.bg), t++;
                        });
                    }
                    (o._5bs._6c = !0), (o._5as._6c = !0), (o._59s._6c = !0), t.bindTexture(t.TEXTURE_2D, null), t.bindFramebuffer(t.FRAMEBUFFER, null), t.viewport(0, 0, t.canvas.width, t.canvas.height);
                    const r = 0;
                    t.activeTexture(t.TEXTURE0 + r),
                        t.bindTexture(t.TEXTURE_2D, A),
                        i.use(),
                        i.set("_64", t.canvas.width, t.canvas.height),
                        i.set("_61", At._27, At._26),
                        i.set("_6a", r),
                        Object.keys(o).forEach((e) => {
                            o[e]._6c && (o[e].enable(i.program), o[e].bufferData(t.DYNAMIC_DRAW), (o[e]._6c = !1));
                        });
                    const a = s.cols * s.rows + (2 * s.cols + 2 * s.rows + 4);
                    t.clearColor(0, 0, 0, 1), t.clear(t.COLOR_BUFFER_BIT), t.drawArrays(t.TRIANGLES, 0, 6 * a);
                }
                function St() {
                    if (!document.querySelector("#export_canvas")) {
                        const t = document.createElement("canvas");
                        (t.id = "export_canvas"), (t.style.display = "none"), (t.style.imageRendering = "pixelated"), document.body.appendChild(t);
                    }
                    return document.querySelector("#export_canvas");
                }
                function Gt(t, e) {
                    for (let o = 0; o < e; o++) t.push(t.shift());
                    return t;
                }
                function Ct(t, e) {
                    const o = String(t);
                    return o.length > e ? "..." + o.substring(o.length - e + 3) : o;
                }
                requestAnimationFrame(_t);
            })();
    });
})();

  return (
    <div className="ascii" ref={bgRef}></div>
  );
}