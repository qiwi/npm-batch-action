import { readFileSync } from 'fs'

export const readFileToString = (path: string): string => readFileSync(path).toString()
