import reviewedData from './emberville-preview-2026-09-27.json'
import { parseEmbervilleDataset } from '../lib/embervilleData'

// Imported once through the same validator used for candidate datasets.
export const EMBERVILLE_CATALOG = parseEmbervilleDataset(reviewedData)
