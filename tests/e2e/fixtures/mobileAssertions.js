import { expect } from '@playwright/test'

export const expectNoDocumentOverflow = async (page) => {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }))

  expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.viewport + 1)
}

export const expectScrollableTable = async (page) => {
  const table = page.locator('table').first()
  await expect(table).toBeVisible()
  const metrics = await table.locator('..').evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    overflowX: window.getComputedStyle(element).overflowX,
  }))

  expect(metrics.scrollWidth).toBeGreaterThanOrEqual(metrics.clientWidth)
  expect(['auto', 'scroll']).toContain(metrics.overflowX)
}

export const expectModalFitsViewport = async (page, headingName) => {
  const heading = page.getByRole('heading', { name: headingName })
  await expect(heading).toBeVisible()
  const panel = heading.locator('xpath=ancestor::*[contains(@class, "bg-white")][1]')
  const box = await panel.boundingBox()
  const viewport = page.viewportSize()

  expect(box).not.toBeNull()
  expect(box.x).toBeGreaterThanOrEqual(0)
  expect(box.width).toBeLessThanOrEqual(viewport.width)
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1)
}

export const selectContainingOption = (page, optionText) => page.locator('select').filter({
  has: page.locator('option', { hasText: optionText }),
})
