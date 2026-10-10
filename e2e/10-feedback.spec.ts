import { expect, test, type Page } from '@playwright/test'
import { ADMIN_CREDENTIAL_HASHES } from '../src/domain/rules/adminCredentials'
import { completeFastOnboarding, resetApp } from './helpers/reset'

async function grantAdminKey(page: Page, adminKey: string) {
  await page.evaluate(
    (key) =>
      new Promise<void>((resolve, reject) => {
        const open = indexedDB.open('appli-tsa-sdi-tdah')
        open.onerror = () => reject(open.error)
        open.onsuccess = () => {
          const tx = open.result.transaction('settings', 'readwrite')
          const store = tx.objectStore('settings')
          const all = store.getAll()
          all.onsuccess = () => {
            for (const row of all.result) store.put({ ...row, admin_key: key })
          }
          tx.oncomplete = () => {
            open.result.close()
            resolve()
          }
          tx.onerror = () => reject(tx.error)
        }
      }),
    adminKey,
  )
  await page.reload()
  await page.waitForSelector('h1:has-text("AuDHD")')
}

test.beforeEach(async ({ page }) => {
  await page.route('**/*supabase.co/**', (route) => route.abort())
  await resetApp(page)
})

test('T58 — créer un retour avec une capture conserve le retour local sans backend réel', async ({ page }) => {
  await completeFastOnboarding(page, 'dev')
  await grantAdminKey(page, ADMIN_CREDENTIAL_HASHES.dev)
  await page.getByRole('button', { name: 'Signaler un retour' }).click()
  await expect(page.getByRole('heading', { name: 'Nouveau retour' })).toBeVisible()

  await page.getByLabel('Choisir une image').setInputFiles({
    name: 'capture.png',
    mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL96QAAAABJRU5ErkJggg==', 'base64'),
  })
  await page.getByLabel('Commentaire').fill('Le bouton est trop petit')
  await page.getByRole('button', { name: 'Envoyer' }).click()

  await expect(page.getByRole('heading', { name: 'Mes retours' })).toBeVisible()
  await expect(page.getByText('Le bouton est trop petit')).toBeVisible()
  await expect(page.getByText('En attente d’activation du partage')).toBeVisible()
})

test('T58b — le bouton Signaler un retour est absent sans mot de passe admin', async ({ page }) => {
  await completeFastOnboarding(page, 'dev')
  await expect(page.getByRole('button', { name: 'Signaler un retour' })).toHaveCount(0)
})
