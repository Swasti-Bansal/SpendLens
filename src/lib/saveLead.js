// src/lib/saveLead.js
// What: Saves lead data to Firebase Firestore
// Why: This is the business value for Credex — capturing emails of people
//      with high AI spend so they can be offered discounted credits

import { db } from './firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export async function saveLead({ email, companyName, role, auditId, auditSummary }) {
  try {
    await addDoc(collection(db, 'leads'), {
      email,
      companyName: companyName || '',
      role: role || '',
      auditId,
      totalSavings: auditSummary.totalSavings,
      totalCurrentSpend: auditSummary.totalCurrentSpend,
      annualSavings: auditSummary.annualSavings,
      savingsTier: auditSummary.savingsTier,
      createdAt: serverTimestamp(),
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to save lead:', error)
    return { success: false, error }
  }
}