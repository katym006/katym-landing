/** Минималистичный курсор «+» вместо системного указателя. */
export function initCursor() {
  if (!matchMedia('(pointer: fine)').matches) return

  const dot = document.getElementById('cursorDot')
  if (!dot) return

  document.documentElement.classList.add('has-custom-cursor')

  addEventListener(
    'pointermove',
    e => {
      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      dot.classList.add('is-visible')
    },
    { passive: true }
  )

  addEventListener('pointerleave', () => dot.classList.remove('is-visible'))
  addEventListener('blur', () => dot.classList.remove('is-visible'))
}
