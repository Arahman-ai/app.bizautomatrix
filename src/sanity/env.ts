export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-05-08'

const configuredDataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const configuredProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID

export const isSanityConfigured = Boolean(configuredDataset && configuredProjectId)

export const dataset = configuredDataset || 'production'

export const projectId = configuredProjectId || 'dummy'
