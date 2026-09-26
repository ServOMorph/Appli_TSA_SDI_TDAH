import { newId } from '@/app/repositories'

const DEVICE_ID_KEY = 'sync_device_id'
const DEVICE_SECRET_KEY = 'sync_device_secret'

/**
 * Identifiant et secret d'appareil, generes une seule fois puis persistes en localStorage.
 * Aucun ecran de connexion : ce secret authentifie silencieusement les envois de cet appareil.
 */
export function getDeviceIdentity(): { deviceId: string; deviceSecret: string } {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY)
  if (!deviceId) {
    deviceId = newId()
    localStorage.setItem(DEVICE_ID_KEY, deviceId)
  }

  let deviceSecret = localStorage.getItem(DEVICE_SECRET_KEY)
  if (!deviceSecret) {
    deviceSecret = newId()
    localStorage.setItem(DEVICE_SECRET_KEY, deviceSecret)
  }

  return { deviceId, deviceSecret }
}

/**
 * Restaure une identite d'appareil issue d'un export (E117Export) : la synchronisation et
 * le fil de retours continuent alors sous la meme identite cote serveur apres une reinstallation
 * ou un changement d'adresse, plutot que de repartir en nouvel appareil.
 */
export function setDeviceIdentity(deviceId: string, deviceSecret: string): void {
  localStorage.setItem(DEVICE_ID_KEY, deviceId)
  localStorage.setItem(DEVICE_SECRET_KEY, deviceSecret)
}
