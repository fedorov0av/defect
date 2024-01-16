(function(){"use strict";try{if(typeof document<"u"){var i=document.createElement("style");i.appendChild(document.createTextNode(".v-pagination{display:flex;justify-content:flex-start;box-sizing:border-box}.v-pagination--right{justify-content:flex-end}.v-pagination--center{justify-content:center}.v-pagination.v-pagination--disabled a,.v-pagination.v-pagination--disabled select{color:#999!important}.v-pagination.v-pagination--disabled.v-pagination--border a,.v-pagination.v-pagination--disabled.v-pagination--border a:hover{background-color:#fafafa}.v-pagination ul{margin:0;padding:0;display:flex}.v-pagination ul li{list-style:none;display:flex}.v-pagination ul li.v-pagination__info a,.v-pagination ul li.v-pagination__list a{cursor:default;color:#333}.v-pagination ul li a{padding:.3rem .6rem;text-decoration:none;line-height:1.3;font-size:14px;margin:0;outline:0;color:#333;border-radius:.25rem;display:inline-flex;align-items:center}.v-pagination ul li:not(.active):not(.disabled):not(.v-pagination__list):not(.v-pagination__info):not(.v-pagination__slot) a:hover{background-color:#fafafa}.v-pagination ul li.active a{background-color:#eee;color:#aaa}.v-pagination ul li.disabled a{color:#999!important;cursor:default}.v-pagination ul li select{width:auto!important;font-size:12px;padding:0;outline:0;margin:0 0 0 5px;border:1px solid #ccc;color:#333;border-radius:.3rem}.v-pagination.v-pagination--border ul{box-shadow:0 1px 2px #0000000d;border-radius:.25rem}.v-pagination.v-pagination--border ul li:not(:first-child) a{margin-left:-1px}.v-pagination.v-pagination--border ul li a{border:1px solid #DEE2E6;border-radius:0}.v-pagination.v-pagination--border ul li:first-child>a{border-bottom-left-radius:.25rem;border-top-left-radius:.25rem}.v-pagination.v-pagination--border ul li:last-child>a{border-top-right-radius:.25rem;border-bottom-right-radius:.25rem}.v-pagination.v-pagination--border ul li.active a{color:#999;background-color:#eee}")),document.head.appendChild(i)}}catch(a){console.error("vite-plugin-css-injected-by-js",a)}})();
import { defineComponent as F, toRefs as V, ref as N, computed as b, watch as k, onMounted as D, h as u } from "vue";
const [
  O,
  z,
  T,
  G,
  Z
] = ["cn", "en", "de", "jp", "pt"], B = {
  [O]: {
    pageLength: "每页记录数 ",
    pageInfo: "当前显示第 #pageNumber# / #totalPage# 页（共#totalRow#条记录）",
    first: "首页",
    previous: "«",
    next: "»",
    last: "尾页",
    all: "全部"
  },
  [z]: {
    pageLength: "Page length ",
    pageInfo: "Current #pageNumber# / #totalPage# (total #totalRow# records)",
    first: "First",
    previous: "«",
    next: "»",
    last: "Last",
    all: "All"
  },
  [T]: {
    pageLength: "Seitenlänge ",
    pageInfo: "Aktuell #pageNumber# / #totalPage# (gesamt #totalRow# Aufzeichnungen)",
    first: "Zuerst",
    previous: "«",
    next: "»",
    last: "Letzte",
    all: "Alle"
  },
  [G]: {
    pageLength: "ページごとの記録数",
    pageInfo: "現在の第 #pageNumber# / #totalPage# ページ（全部で #totalRow# 条の記録）",
    first: "トップページ",
    previous: "«",
    next: "»",
    last: "尾のページ",
    all: "すべて"
  },
  [Z]: {
    pageLength: "Resultados por página ",
    pageInfo: "#pageNumber# / #totalPage# (total de #totalRow#)",
    first: "Início",
    previous: "<",
    next: ">",
    last: "Fim",
    all: "Todos"
  }
}, r = 1, J = 5, x = 10, q = [x, 20, 50, 100], I = 0;
function H(e, s, t) {
  if (s <= t)
    return r;
  const v = Math.floor(t / 2), n = s - t + 1, o = e - v;
  return o < r ? r : o > n ? n : o;
}
function K(e, s, t) {
  const v = H(e, s, t);
  return Array.from({ length: t }).map((n, o) => v + o).filter((n) => n >= r && n <= s);
}
const R = F({
  name: "PaginationBar",
  props: {
    modelValue: { type: Number, default: 0 },
    totalRow: { type: Number, default: 0 },
    language: { type: String, default: z },
    /**
     * Page size list
     * false: close page size list
     * array: custom page sizes list
     */
    pageSizeMenu: {
      type: [Boolean, Array],
      default: () => q
    },
    /**
     * Pagination alignment direction
     * `left`, `center` and `right`(default)
     */
    align: { type: String, default: "right" },
    disabled: { type: Boolean, default: !1 },
    border: { type: Boolean, default: !1 },
    info: { type: Boolean, default: !0 },
    pageNumber: { type: Boolean, default: !0 },
    /** first page button */
    first: { type: Boolean, default: !0 },
    /** last page button */
    last: { type: Boolean, default: !0 },
    /** display all records */
    displayAll: { type: Boolean, default: !1 }
  },
  emits: ["update:modelValue", "change"],
  setup(e, { emit: s, slots: t, expose: v }) {
    const { pageSizeMenu: n, totalRow: o } = V(e), l = N(0), f = N(
      n.value === !1 ? x : n.value[0]
    ), _ = N(J), g = N(B[e.language] || B[z]), m = N(-1), p = b(() => f.value === I ? r : Math.ceil(o.value / f.value)), C = b(() => K(
      l.value,
      p.value,
      _.value
    )), M = b(() => g.value.pageInfo.replace("#pageNumber#", l.value).replace("#totalPage#", p.value).replace("#totalRow#", o.value)), j = b(() => ({
      "v-pagination": !0,
      "v-pagination--border": e.border,
      "v-pagination--right": e.align === "right",
      "v-pagination--center": e.align === "center",
      "v-pagination--disabled": e.disabled
    })), A = b(() => l.value === r), L = b(() => l.value === p.value);
    k(
      () => e.modelValue,
      (a) => {
        typeof a == "number" && a > 0 && h(a, !1);
      }
    );
    function h(a = r, P = !0) {
      if (e.disabled || typeof a != "number")
        return;
      let c = a < r ? r : a;
      a > p.value && p.value > 0 && (c = p.value), !(c === l.value && f.value === m.value) && (l.value = c, P && s("update:modelValue", l.value), m.value = f.value, w());
    }
    function w() {
      s("change", {
        pageNumber: l.value,
        pageSize: Number(f.value)
      });
    }
    function y(a, P, c) {
      return u("li", { class: a }, [u("a", {
        href: "javascript:void(0)",
        onClick: () => h(P)
      }, c)]);
    }
    return D(() => {
      h(e.modelValue || r);
    }), v({
      current: l,
      totalPage: p,
      pageNumbers: C,
      goPage: h,
      reload: w
    }), () => {
      const a = [];
      if (Array.isArray(n.value) && n.value.length) {
        const i = {
          disabled: e.disabled,
          onChange: (S) => {
            f.value = Number(S.target.value), h();
          }
        }, d = n.value.map(
          (S) => u("option", { value: S }, S)
        );
        e.displayAll && d.push(
          u("option", { value: I }, g.value.all)
        );
        const E = u("li", { class: "v-pagination__list" }, [
          u("a", { href: "javascript:void(0)" }, [
            u("span", g.value.pageLength),
            u("select", i, d)
          ])
        ]);
        a.push(E);
      }
      if (e.info && a.push(
        u("li", { class: "v-pagination__info" }, [
          u("a", { href: "javascript:void(0)" }, M.value)
        ])
      ), "default" in t) {
        const i = {
          pageNumber: l.value,
          pageSize: f.value,
          totalPage: p.value,
          totalRow: o.value,
          isFirst: A.value,
          isLast: L.value
        }, d = u("li", { class: "v-pagination__slot" }, [
          u("a", t.default(i))
        ]);
        a.push(d);
      }
      if (e.first) {
        const i = ["v-pagination__first", { disabled: A.value }];
        a.push(y(i, r, g.value.first));
      }
      const P = ["v-pagination__previous", { disabled: A.value }];
      a.push(
        y(P, l.value - 1, g.value.previous)
      ), e.pageNumber && a.push(
        ...C.value.map((i) => {
          const d = { active: i === l.value };
          return y(d, i, i);
        })
      );
      const c = ["v-pagination__next", { disabled: L.value }];
      if (a.push(
        y(c, l.value + 1, g.value.next)
      ), e.last) {
        const i = ["v-pagination__last", { disabled: L.value }];
        a.push(
          y(i, p.value, g.value.last)
        );
      }
      return u("div", { class: j.value }, [u("ul", a)]);
    };
  }
});
R.install = (e, s = {}) => {
  if (Object.keys(s).length) {
    const { props: t } = R, {
      language: v,
      align: n,
      info: o,
      border: l,
      pageNumber: f,
      first: _,
      last: g,
      pageSizeMenu: m
    } = s;
    v && (t.language.default = v), n && (t.align.default = n), typeof o == "boolean" && (t.info.default = o), typeof l == "boolean" && (t.border.default = l), typeof f == "boolean" && (t.pageNumber.default = f), typeof _ == "boolean" && (t.first.default = _), typeof g == "boolean" && (t.last.default = g), typeof m < "u" && (t.pageSizeMenu.default = m);
  }
  e.component(R.name, R);
};
export {
  R as PaginationBar,
  R as default
};