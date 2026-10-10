import type { Page } from '@playwright/test'

export async function pickStartTime(page: Page, time: string, label = 'Heure de début') {
  await page.getByRole('button', { name: label, exact: true }).click()
  const keypad = page.getByRole('group', { name: 'Pavé numérique' })
  for (const digit of time.replace(':', '')) {
    await keypad.getByRole('button', { name: digit, exact: true }).click()
  }
}

export async function pickHours(page: Page, hours: string) {
  await page.getByRole('button', { name: 'Heures', exact: true }).click()
  const digits = page.getByRole('group', { name: 'Chiffres pour heures' })
  for (const digit of hours) {
    await digits.getByRole('button', { name: digit, exact: true }).click()
  }
}

export async function openTools(page: Page) {
  const toggle = page.getByRole('button', { name: 'Déplier les outils' })
  if (await toggle.isVisible()) await toggle.click()
}
