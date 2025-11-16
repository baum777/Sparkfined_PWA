// Bot detection
export { computeBotScore } from './botScore';

// Sanity checks
export { sanityCheck } from './sanity';

// Market structure (L1)
export {
  computeRangeStructure,
  computeKeyLevels,
  computePriceZones,
  computeBias,
} from './marketStructure';

// Flow & volume (L2)
export {
  computeFlowVolumeSnapshot,
  analyzeVolumeProfile,
  detectVolumeSpikes,
} from './flowVolume';

// Playbook generation (L3)
export {
  generatePlaybookEntries,
  generateSimplePlaybook,
} from './playbook';
