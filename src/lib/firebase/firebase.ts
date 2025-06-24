/* eslint-disable @typescript-eslint/no-explicit-any */
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import serviceAccount from './nextjs-ecommerce-2025-firebase-adminsdk-fbsvc-7003a7dea6.json'

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any),
  })
}

export const adminAuth = getAuth()