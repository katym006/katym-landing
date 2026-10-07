/**
 * Кнопка «ещё!» в портфолио: показывает скрытую 4ю карточку
 * и прячет саму кнопку, когда показывать больше нечего.
 */
export function initPortfolioMore() {
  const btn = document.getElementById('portfolioMore')
  const hiddenCards = document.querySelectorAll('.portfolio__card--hidden')
  if (!btn || !hiddenCards.length) return

  let i = 0
  btn.addEventListener('click', () => {
    if (i >= hiddenCards.length) return
    const card = hiddenCards[i]
    card.hidden = false
    card.classList.add('portfolio__card--reveal')
    i += 1
    if (i >= hiddenCards.length) btn.hidden = true
  })
}
