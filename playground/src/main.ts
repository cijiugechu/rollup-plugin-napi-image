import './style.css'
import typescriptLogo from './typescript.svg'
import unoptimized1 from './un-optimized.jpg'
import unoptimized2 from './un-optimized.png'
import optimized1 from './optimized.jpg'
import optimized2 from './optimized.png'
import { setupCounter } from './counter'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
    <img src=${unoptimized1} />
    <img src=${unoptimized2} />
    <img src=${optimized1} />
    <img src=${optimized2} />
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
