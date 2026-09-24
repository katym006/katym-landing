/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/javascripts/hero-sphere.js
/**
 * Текст, обёрнутый вокруг «сферы» в главном экране лендинга.
 * Три строки идут кольцами вокруг круга и едут по вертикали за курсором,
 * а по горизонтали медленно вращаются (курсор слева/справа ускоряет вращение).
 *
 * Использование: initHeroSphere() — сам находит нужные узлы в DOM
 * (#hero, #heroSphere, #heroScene, #heroBelt) и ничего не делает, если их нет.
 */

var LINES = ['Привет! Меня зовут Катя, я проектирую интерфейсы:', 'от исследования до готового к разработке продукта.', 'Познакомимся поближе?'];
var CFG = {
  ringScale: 1.05,
  // радиус текстовой ленты относительно радиуса круга
  fontScale: 0.0853,
  // размер шрифта относительно радиуса круга
  lineGap: 1.28,
  // расстояние между строками, в размерах шрифта
  perspective: 4.6,
  // перспектива, в радиусах круга
  followEase: 4.5,
  // как быстро лента догоняет курсор по вертикали
  spinEase: 3.0,
  // инерция вращения по горизонтали
  autoSpin: -0.18,
  // фоновое вращение, рад/с (минус = текст плывёт влево)
  mouseSpin: 0.9,
  // насколько курсор слева/справа разгоняет вращение, рад/с
  maxLat: 1.38 // предел смещения ленты к полюсу, рад (~79°)
};
function initHeroSphere() {
  var sphere = document.getElementById('heroSphere');
  var scene = document.getElementById('heroScene');
  var belt = document.getElementById('heroBelt');
  if (!sphere || !scene || !belt) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function clamp(v, a, b) {
    return Math.min(b, Math.max(a, v));
  };
  var R,
    Rt,
    mag,
    dLat,
    rings = [];
  var lat = 0,
    spin = 0,
    spinVel = CFG.autoSpin;
  var pointer = {
    x: 0,
    y: 0,
    active: false
  };
  function build() {
    var box = sphere.getBoundingClientRect();
    R = box.width / 2;
    Rt = R * CFG.ringScale;
    var fs = R * CFG.fontScale;
    dLat = fs * CFG.lineGap / Rt;
    var P = R * CFG.perspective;
    scene.style.perspective = P + 'px';
    mag = P / (P - Rt);
    belt.style.setProperty('--fs', fs + 'px');
    belt.innerHTML = '';
    rings = [];
    var occ = document.createElement('div');
    occ.className = 'hero__occ';
    occ.style.cssText = "left:".concat(-R, "px;top:").concat(-R, "px;width:").concat(2 * R, "px;height:").concat(2 * R, "px");
    belt.appendChild(occ);
    var ctx = document.createElement('canvas').getContext('2d');
    ctx.font = "500 ".concat(fs, "px \"Golos Text\", system-ui, sans-serif");
    var circ = 2 * Math.PI * Rt;
    LINES.forEach(function (line, i) {
      // кольцо содержит весь абзац начиная со своей строки, замкнутый по кругу
      var order = LINES.map(function (_, j) {
        return LINES[(i + j) % LINES.length];
      }).join(' ') + ' ';
      var total = ctx.measureText(order).width;
      var repeats = Math.max(1, Math.round(circ / total));
      var text = order.repeat(repeats);
      var k = circ / (total * repeats); // растяжение под длину окружности
      var glyphScale = Math.min(1, k);
      // середина своей строки должна стоять ровно по центру спереди
      var offset = ctx.measureText(line).width / 2 * k / Rt;
      var ring = document.createElement('div');
      ring.className = 'hero__ring';
      var frag = document.createDocumentFragment();
      for (var n = 0; n < text.length; n++) {
        var ch = text[n];
        if (ch === ' ') continue;
        var x0 = ctx.measureText(text.slice(0, n)).width;
        var x1 = ctx.measureText(text.slice(0, n + 1)).width;
        var angle = (x0 + x1) / 2 * k / Rt - offset;
        var el = document.createElement('span');
        el.className = 'hero__ch';
        el.style.setProperty('--a', angle.toFixed(5));
        el.innerHTML = '<span class="hero__f"></span><span class="hero__b"></span>';
        el.firstChild.textContent = ch;
        el.lastChild.textContent = ch;
        frag.appendChild(el);
      }
      ring.appendChild(frag);
      belt.appendChild(ring);
      rings.push({
        el: ring,
        gs: glyphScale
      });
    });
    render();
  }
  function render() {
    var mid = (rings.length - 1) / 2;
    rings.forEach(function (_ref, i) {
      var ring = _ref.el,
        gs = _ref.gs;
      // i = 0 — верхняя строка; положительная широта — выше экватора
      var phi = clamp(lat + (mid - i) * dLat, -1.5, 1.5);
      var y = -Rt * Math.sin(phi);
      var r = Rt * Math.cos(phi);
      ring.style.transform = "translateY(".concat(y.toFixed(2), "px) rotateY(").concat(spin.toFixed(4), "rad)");
      ring.style.setProperty('--r', r.toFixed(2) + 'px');
      ring.style.setProperty('--phi', phi.toFixed(4) + 'rad');
      ring.style.setProperty('--s', (Math.cos(phi) * gs).toFixed(4));
    });
  }
  var last = performance.now();
  function tick(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    var box = sphere.getBoundingClientRect();
    var cx = box.left + box.width / 2;
    var cy = box.top + box.height / 2;
    var targetLat = 0;
    var targetVel = CFG.autoSpin;
    if (pointer.active) {
      var s = clamp((pointer.y - cy) / (mag * Rt), -0.98, 0.98);
      targetLat = clamp(-Math.asin(s), -CFG.maxLat, CFG.maxLat);
      var nx = clamp((pointer.x - cx) / (innerWidth / 2), -1, 1);
      targetVel = CFG.autoSpin + nx * CFG.mouseSpin;
    }
    lat += (targetLat - lat) * (1 - Math.exp(-CFG.followEase * dt));
    spinVel += (targetVel - spinVel) * (1 - Math.exp(-CFG.spinEase * dt));
    spin += spinVel * dt;
    render();
    requestAnimationFrame(tick);
  }
  addEventListener('pointermove', function (e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
  }, {
    passive: true
  });
  document.documentElement.addEventListener('pointerleave', function () {
    pointer.active = false;
  });
  addEventListener('blur', function () {
    pointer.active = false;
  });
  var resizeTimer;
  addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 120);
  });
  var start = function start() {
    build();
    if (!reduce) requestAnimationFrame(function (t) {
      last = t;
      tick(t);
    });
  };
  var fontReady = document.fonts && document.fonts.load ? document.fonts.load('500 20px "Golos Text"')["catch"](function () {}) : Promise.resolve();
  Promise.race([fontReady, new Promise(function (r) {
    return setTimeout(r, 1500);
  })]).then(start);
}
;// ./src/javascripts/index.js


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroSphere);
} else {
  initHeroSphere();
}
/******/ })()
;