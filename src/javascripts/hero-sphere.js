/**
 * Текст, обёрнутый вокруг «сферы» в главном экране лендинга.
 * Три строки идут кольцами вокруг круга и едут по вертикали за курсором,
 * а по горизонтали медленно вращаются (курсор слева/справа ускоряет вращение).
 *
 * Использование: initHeroSphere() — сам находит нужные узлы в DOM
 * (#hero, #heroSphere, #heroScene, #heroBelt) и ничего не делает, если их нет.
 */

const LINES = [
  'Привет! Меня зовут Катя, я проектирую интерфейсы:',
  'от исследования до готового к разработке продукта.',
  'Познакомимся поближе?'
]

const CFG = {
  ringScale: 1.05, // радиус текстовой ленты относительно радиуса круга
  fontScale: 0.0853, // размер шрифта относительно радиуса круга
  lineGap: 1.28, // расстояние между строками, в размерах шрифта
  perspective: 4.6, // перспектива, в радиусах круга
  followEase: 4.5, // как быстро лента догоняет курсор по вертикали
  spinEase: 3.0, // инерция вращения по горизонтали
  autoSpin: -0.18, // фоновое вращение, рад/с (минус = текст плывёт влево)
  mouseSpin: 0.9, // насколько курсор слева/справа разгоняет вращение, рад/с
  maxLat: 1.38 // предел смещения ленты к полюсу, рад (~79°)
}

export function initHeroSphere() {
  const sphere = document.getElementById('heroSphere')
  const scene = document.getElementById('heroScene')
  const belt = document.getElementById('heroBelt')
  if (!sphere || !scene || !belt) return

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

  let R, Rt, mag, dLat, rings = []
  let lat = 0, spin = 0, spinVel = CFG.autoSpin
  const pointer = { x: 0, y: 0, active: false }

  function build() {
    const box = sphere.getBoundingClientRect()
    R = box.width / 2
    Rt = R * CFG.ringScale
    const fs = R * CFG.fontScale
    dLat = (fs * CFG.lineGap) / Rt

    const P = R * CFG.perspective
    scene.style.perspective = P + 'px'
    mag = P / (P - Rt)

    belt.style.setProperty('--fs', fs + 'px')
    belt.innerHTML = ''
    rings = []

    const occ = document.createElement('div')
    occ.className = 'hero__occ'
    occ.style.cssText = `left:${-R}px;top:${-R}px;width:${2 * R}px;height:${2 * R}px`
    belt.appendChild(occ)

    const ctx = document.createElement('canvas').getContext('2d')
    ctx.font = `500 ${fs}px "Golos Text", system-ui, sans-serif`
    const circ = 2 * Math.PI * Rt

    LINES.forEach((line, i) => {
      // кольцо содержит весь абзац начиная со своей строки, замкнутый по кругу
      const order = LINES.map((_, j) => LINES[(i + j) % LINES.length]).join(' ') + ' '
      const total = ctx.measureText(order).width
      const repeats = Math.max(1, Math.round(circ / total))
      const text = order.repeat(repeats)
      const k = circ / (total * repeats) // растяжение под длину окружности
      const glyphScale = Math.min(1, k)
      // середина своей строки должна стоять ровно по центру спереди
      const offset = (ctx.measureText(line).width / 2) * k / Rt

      const ring = document.createElement('div')
      ring.className = 'hero__ring'
      const frag = document.createDocumentFragment()

      for (let n = 0; n < text.length; n++) {
        const ch = text[n]
        if (ch === ' ') continue
        const x0 = ctx.measureText(text.slice(0, n)).width
        const x1 = ctx.measureText(text.slice(0, n + 1)).width
        const angle = ((x0 + x1) / 2) * k / Rt - offset

        const el = document.createElement('span')
        el.className = 'hero__ch'
        el.style.setProperty('--a', angle.toFixed(5))
        el.innerHTML = '<span class="hero__f"></span><span class="hero__b"></span>'
        el.firstChild.textContent = ch
        el.lastChild.textContent = ch
        frag.appendChild(el)
      }
      ring.appendChild(frag)
      belt.appendChild(ring)
      rings.push({ el: ring, gs: glyphScale })
    })

    render()
  }

  function render() {
    const mid = (rings.length - 1) / 2
    rings.forEach(({ el: ring, gs }, i) => {
      // i = 0 — верхняя строка; положительная широта — выше экватора
      const phi = clamp(lat + (mid - i) * dLat, -1.5, 1.5)
      const y = -Rt * Math.sin(phi)
      const r = Rt * Math.cos(phi)
      ring.style.transform = `translateY(${y.toFixed(2)}px) rotateY(${spin.toFixed(4)}rad)`
      ring.style.setProperty('--r', r.toFixed(2) + 'px')
      ring.style.setProperty('--phi', phi.toFixed(4) + 'rad')
      ring.style.setProperty('--s', (Math.cos(phi) * gs).toFixed(4))
    })
  }

  let last = performance.now()
  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now

    const box = sphere.getBoundingClientRect()
    const cx = box.left + box.width / 2
    const cy = box.top + box.height / 2

    let targetLat = 0
    let targetVel = CFG.autoSpin
    if (pointer.active) {
      const s = clamp((pointer.y - cy) / (mag * Rt), -0.98, 0.98)
      targetLat = clamp(-Math.asin(s), -CFG.maxLat, CFG.maxLat)
      const nx = clamp((pointer.x - cx) / (innerWidth / 2), -1, 1)
      targetVel = CFG.autoSpin + nx * CFG.mouseSpin
    }

    lat += (targetLat - lat) * (1 - Math.exp(-CFG.followEase * dt))
    spinVel += (targetVel - spinVel) * (1 - Math.exp(-CFG.spinEase * dt))
    spin += spinVel * dt

    render()
    requestAnimationFrame(tick)
  }

  addEventListener(
    'pointermove',
    e => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.active = true
    },
    { passive: true }
  )
  document.documentElement.addEventListener('pointerleave', () => {
    pointer.active = false
  })
  addEventListener('blur', () => {
    pointer.active = false
  })

  let resizeTimer
  addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(build, 120)
  })

  const start = () => {
    build()
    if (!reduce) requestAnimationFrame(t => { last = t; tick(t) })
  }
  const fontReady =
    document.fonts && document.fonts.load
      ? document.fonts.load('500 20px "Golos Text"').catch(() => {})
      : Promise.resolve()
  Promise.race([fontReady, new Promise(r => setTimeout(r, 1500))]).then(start)
}
