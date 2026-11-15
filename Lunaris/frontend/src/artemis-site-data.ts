import artemisSiteRecords from './artemis-sites.json'

export type ArtemisSite = (typeof artemisSiteRecords)[number]

export const artemisSites = artemisSiteRecords
