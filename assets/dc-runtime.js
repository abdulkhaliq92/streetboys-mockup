/* Street Boys mockups — tiny standalone player for the design-canvas screens.
   Renders the screen template, fills {{ holes }}, runs <sc-for>/<sc-if>, wires onClick handlers
   and re-renders on setState. No dependencies; works from file:// and offline. */
(function () {
  'use strict';
  var pending = false, inst = null, tplContent = null, root = null;

  function DCLogic(props) { this.props = props || {}; this.state = {}; }
  DCLogic.prototype.setState = function (p, cb) {
    var v = typeof p === 'function' ? p(this.state, this.props) : p;
    this.state = Object.assign({}, this.state, v);
    schedule(); if (cb) cb();
  };
  DCLogic.prototype.forceUpdate = function () { schedule(); };
  window.DCLogic = DCLogic;

  function schedule() {
    if (pending) return; pending = true;
    Promise.resolve().then(function () { pending = false; render(); });
  }

  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g, WHOLE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;
  function lookup(path, scope) {
    path = path.trim();
    if (path === 'true') return true; if (path === 'false') return false; if (path === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(path)) return +path;
    if (/^(['"]).*\1$/.test(path)) return path.slice(1, -1);
    var v = scope, parts = path.split('.');
    for (var i = 0; i < parts.length; i++) { if (v == null) return undefined; v = v[parts[i]]; }
    return v;
  }
  function interp(str, scope) {
    return str.replace(HOLE, function (m, p) { var v = lookup(p, scope); return v == null ? '' : String(v); });
  }
  function renderChildren(src, scope, out) {
    var kids = src.childNodes;
    for (var i = 0; i < kids.length; i++) renderNode(kids[i], scope, out);
  }
  function renderNode(n, scope, out) {
    if (n.nodeType === 3) {
      out.appendChild(document.createTextNode(n.nodeValue.indexOf('{{') >= 0 ? interp(n.nodeValue, scope) : n.nodeValue));
      return;
    }
    if (n.nodeType !== 1) return;
    if (n.tagName === 'TEMPLATE' && n.hasAttribute('data-scfor')) {
      var m = (n.getAttribute('list') || '').match(WHOLE);
      var list = m ? lookup(m[1], scope) : null, as = n.getAttribute('as') || 'item';
      (list || []).forEach(function (it, idx) {
        var s = Object.create(scope); s[as] = it; s.$index = idx;
        renderChildren(n.content, s, out);
      });
      return;
    }
    if (n.tagName === 'TEMPLATE' && n.hasAttribute('data-scif')) {
      var c = (n.getAttribute('value') || '').match(WHOLE);
      if (c && lookup(c[1], scope)) renderChildren(n.content, scope, out);
      return;
    }
    var el = n.cloneNode(false);
    var attrs = Array.prototype.slice.call(el.attributes);
    for (var a = 0; a < attrs.length; a++) {
      var name = attrs[a].name, val = attrs[a].value;
      if (name.indexOf('hint-') === 0) { el.removeAttribute(name); continue; }
      if (val.indexOf('{{') < 0) continue;
      var w = val.match(WHOLE);
      if (w) {
        var v = lookup(w[1], scope);
        if (/^on/i.test(name) && typeof v === 'function') {
          el.removeAttribute(name);
          el.addEventListener(name.slice(2).toLowerCase(), v);
        } else if (v === false || v == null) {
          if (/^aria-/.test(name)) el.setAttribute(name, 'false'); else el.removeAttribute(name);
        } else el.setAttribute(name, String(v));
      } else el.setAttribute(name, interp(val, scope));
    }
    renderChildren(n, scope, el);
    out.appendChild(el);
  }
  function render() {
    var vals = inst.renderVals ? (inst.renderVals() || {}) : {};
    var frag = document.createDocumentFragment();
    renderChildren(tplContent, vals, frag);
    root.replaceChildren(frag);
  }

  function boot() {
    var src = document.getElementById('dc-template');
    var code = document.getElementById('dc-logic');
    var html = src.textContent;
    var helmet = html.match(/<helmet>([\s\S]*?)<\/helmet>/);
    if (helmet) { document.head.insertAdjacentHTML('beforeend', helmet[1]); html = html.replace(helmet[0], ''); }
    html = html.replace(/<sc-for\b/g, '<template data-scfor').replace(/<\/sc-for>/g, '</template>')
               .replace(/<sc-if\b/g, '<template data-scif').replace(/<\/sc-if>/g, '</template>');
    var t = document.createElement('template'); t.innerHTML = html; tplContent = t.content;
    root = document.getElementById('dc-root');
    var props = {};
    try {
      var decl = JSON.parse(code.getAttribute('data-props') || '{}');
      Object.keys(decl).forEach(function (k) { if (k[0] !== '$' && decl[k] && 'default' in decl[k]) props[k] = decl[k]['default']; });
    } catch (e) {}
    var Component = new Function('DCLogic', code.textContent + '\nreturn Component;')(DCLogic);
    inst = new Component(props);
    render();
    if (inst.componentDidMount) inst.componentDidMount();
    if (location.hash) { var target = document.getElementById(location.hash.slice(1)); if (target) target.scrollIntoView(); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
