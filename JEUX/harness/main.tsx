import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import App from '@/App'
import { JeuxLauncher } from './JeuxLauncher'
import { seedTestDatabase } from './seed'

async function start() {
  await seedTestDatabase()
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
      <JeuxLauncher />
    </StrictMode>,
  )
}

void start()
