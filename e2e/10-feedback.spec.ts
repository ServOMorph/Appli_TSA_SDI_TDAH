import { expect, test } from '@playwright/test'
import { completeFastOnboarding, resetApp } from './helpers/reset'

test.beforeEach(async ({ page }) => {
  await page.route('**/*supabase.co/**', (route) => route.fulfill({ status: 200, body: 'true' }))
  await resetApp(page)
  await completeFastOnboarding(page)
})

test('T58 — créer un retour avec une capture conserve le retour local sans backend réel', async ({ page }) => {
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
  await expect(page.getByText('En attente d’envoi')).toBeVisible()
})
