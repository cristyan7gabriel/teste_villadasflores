// src/sanity.js
import { createClient } from '@sanity/client'

export const client = createClient({
    projectId: '1s9ddy64', // Pegue no sanity.config.ts do outro projeto
    dataset: 'production',
    useCdn: true,
    apiVersion: '2026-05-22', // Data de hoje
})