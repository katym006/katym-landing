/**
 * Кружок-курсор с блюром вместо системного указателя.
 * Плавно следует за мышью и слегка увеличивается над элементами
 * с классом .hoverable (ссылки, кнопки, карточки портфолио и т.д.).
 * На тач-устройствах (pointer: coarse) ничего не делает.
 */
export function initCursor() {
  if (!matchMedia('(pointer: fine)').matches) return

  const dot = document.getElementById('cursorDot')
  if (!dot) return

  document.documentElement.classList.add('has-custom-cursor')

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  let x = innerWidth / 2
  let y = innerHeight / 2
  let tx = x
  let ty = y
  const scaleDefault = 1
  const scaleHover = 1.5
  let scale = scaleDefault
  let tScale = scaleDefault

  addEventListener(
    'pointermove',
    e => {
      tx = e.clientX
      ty = e.clientY
      dot.classList.add('is-visible')
      const hovering = e.target.closest && e.target.closest('.hoverable')
      tScale = hovering ? scaleHover : scaleDefault
      dot.classList.toggle('is-hover', !!hovering)
    },
    { passive: true }
  )

  addEventListener('pointerleave', () => dot.classList.remove('is-visible'))
  addEventListener('blur', () => dot.classList.remove('is-visible'))

  function render() {
    const ease = reduce ? 1 : 0.18
    x += (tx - x) * ease
    y += (ty - y) * ease
    scale += (tScale - scale) * ease
    dot.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale.toFixed(3)})`
    requestAnimationFrame(render)
  }
  requestAnimationFrame(render)
}
