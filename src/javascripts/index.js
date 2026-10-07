import '../stylesheets/style.css'
import { initHeroSphere } from './hero-sphere.js'
import { initCursor } from './cursor.js'
import { initPortfolioMore } from './portfolio.js'

function init() {
  initHeroSphere()
  initCursor()
  initPortfolioMore()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
