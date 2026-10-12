import type { Page } from '@playwright/test'

const DB_NAME = 'appli-tsa-sdi-tdah'

export async function resetApp(page: Page, url = '/') {
  await page.goto(url)
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

export async function completeProfile(page: Page) {
  await page.getByRole('checkbox', { name: 'TSA' }).check()
  await page.getByLabel('Votre âge').fill('30')
  await page.getByRole('button', { name: 'Continuer' }).click()
}

export async function completeFastOnboarding(page: Page, testerCode?: string) {
  await page.getByRole('button', { name: 'Entrer' }).click()
  if (testerCode) await page.getByRole('textbox', { name: 'Code testeur' }).fill(testerCode)
  await page.getByRole('button', { name: 'Continuer' }).click()
  await page.getByRole('button', { name: 'Continuer sans partager' }).click()
  await completeProfile(page)
  await page.getByRole('button', { name: '5' }).click()
  await page.getByRole('button', { name: 'Valider' }).click()
  await page.waitForSelector('h1:has-text("AuDHD")')
}
