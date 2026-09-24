import '../stylesheets/style.css'
import { initHeroSphere } from './hero-sphere.js'

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroSphere)
} else {
  initHeroSphere()
}
