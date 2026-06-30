import type { Page } from '@playwright/test'

const DB_NAME = 'appli-tsa-sdi-tdah'

export async function resetApp(page: Page) {
  await page.goto('/')
  await page.evaluate(async (dbName) => {
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase(dbName)
      req.onsuccess = () => resolve()
      req.onerror = () => resolve()
      req.onblocked = () => resolve()
    })
  }, DB_NAME)
  await page.reload()
  await page.waitForSelector('h1')
}

export async function completeFastOnboarding(page: Page) {
  await page.getByRole('button', { name: 'Entrer' }).click()
  await page.getByRole('button', { name: 'Étudiant' }).click()
  await page.getByRole('button', { name: '5' }).click()
  await page.getByRole('button', { name: 'Valider' }).click()
  await page.getByRole('button', { name: 'Ignorer' }).click()
  await page.waitForSelector('h1:has-text("Appli pour AuDHD")')
}
