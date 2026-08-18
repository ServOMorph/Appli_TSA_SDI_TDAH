import { beforeEach, describe, expect, it } from 'vitest'
import { getDeviceIdentity } from './deviceIdentity'

beforeEach(() => {
  localStorage.clear()
})

describe('getDeviceIdentity', () => {
  it('génère un identifiant et un secret au premier appel', () => {
    const { deviceId, deviceSecret } = getDeviceIdentity()
    expect(deviceId).toBeTruthy()
    expect(deviceSecret).toBeTruthy()
    expect(deviceId).not.toBe(deviceSecret)
  })

  it('retourne la même identité entre deux appels', () => {
    const first = getDeviceIdentity()
    const second = getDeviceIdentity()
    expect(second).toEqual(first)
  })

  it('persiste l’identité entre deux appels comme au redémarrage de l’app', () => {
    const first = getDeviceIdentity()
    const stored = {
      deviceId: localStorage.getItem('sync_device_id'),
      deviceSecret: localStorage.getItem('sync_device_secret'),
    }
    expect(stored.deviceId).toBe(first.deviceId)
    expect(stored.deviceSecret).toBe(first.deviceSecret)
  })
})
