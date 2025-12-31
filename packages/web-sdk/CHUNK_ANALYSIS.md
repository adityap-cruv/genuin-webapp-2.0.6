# Chunk Analysis Report

**Generated:** 2025-12-31T12:38:29.937Z

## Summary

- **Total Chunks:** 29
- **Total Size:** 4.03MB
- **Chunks with Issues:** 14
- **Chunks Over Limit (>500KB):** 2
- **Chunks Under Limit (<20KB):** 12

## APP Chunks

| Name | Size (KB) | Size (MB) | Issues | Recommendations |
|------|-----------|-----------|--------|-----------------|
| ⚠️ app-ui-feed-Su38KHlp.js | 1722.06 | 1.68 | Too large (1722.06KB > 500KB) | Split into smaller chunks for better parallel loading; Feed chunk is large - consider splitting into feed-core, feed-comments, feed-interactions |
| ⚠️ standard-wall-7AjC3k35.js | 520.76 | 0.51 | Too large (520.76KB > 500KB) | Split into smaller chunks for better parallel loading |
| ✅ app-react-core-PbfxydPS.js | 306.64 | 0.30 | None | Optimal |
| ✅ embed-Dzbw7Ae0.js | 95.65 | 0.09 | None | Optimal |
| ✅ core-sdk-DLQvGKcj.js | 37.13 | 0.04 | None | Optimal |
| ✅ group-pill-DLsFpxCi.js | 27.59 | 0.03 | None | Optimal |
| ⚠️ mention-input-DHrizCtD.js | 19.47 | 0.02 | Too small (19.47KB < 20KB) | Consider merging with related chunks to reduce HTTP overhead |
| ⚠️ index-BD5ukr_j.js | 17.99 | 0.02 | Too small (17.99KB < 20KB) | Consider merging with related chunks to reduce HTTP overhead |
| ⚠️ index-Diq58EN0.js | 8.88 | 0.01 | Too small (8.88KB < 20KB) | Consider merging with related chunks to reduce HTTP overhead |
| ⚠️ repost-modal-ODuMor-U.js | 6.97 | 0.01 | Too small (6.97KB < 20KB) | Consider merging with related chunks to reduce HTTP overhead |
| ⚠️ index-CgKruC0_.js | 5.34 | 0.01 | Too small (5.34KB < 20KB) | Consider merging with related chunks to reduce HTTP overhead |
| ⚠️ group-privacy-info-Bw6HtVDX.js | 4.71 | 0.00 | Too small (4.71KB < 20KB) | Consider merging with related chunks to reduce HTTP overhead |
| ⚠️ index-90yXnYSk.js | 3.30 | 0.00 | Too small (3.30KB < 20KB) | Consider merging with related chunks to reduce HTTP overhead |
| ⚠️ pills-CHFD15Zv.js | 1.08 | 0.00 | Too small (1.08KB < 20KB) | Consider merging with related chunks to reduce HTTP overhead |
| ⚠️ community-privacy-info-BTJFbnP-.js | 0.63 | 0.00 | Too small (0.63KB < 20KB) | Consider merging with related chunks to reduce HTTP overhead |
| ⚠️ react-query-provider-CrgZeq-T.js | 0.30 | 0.00 | Too small (0.30KB < 20KB) | Consider merging with related chunks to reduce HTTP overhead |

## VENDOR Chunks

| Name | Size (KB) | Size (MB) | Issues | Recommendations |
|------|-----------|-----------|--------|-----------------|
| ✅ vendor-utils-BMQx54xq.js | 214.00 | 0.21 | None | Optimal |
| ✅ vendor-analytics-Bq9iaG8z.js | 207.01 | 0.20 | None | Optimal |
| ✅ vendor-radix-D7w96pgC.js | 184.02 | 0.18 | None | Optimal |
| ✅ vendor-animation-player-CjHVS9JG.js | 167.53 | 0.16 | None | Optimal |
| ✅ vendor-animation-motion-DRN5Dmha.js | 157.93 | 0.15 | None | Optimal |
| ✅ vendor-animation-carousel-DB-v85Bd.js | 152.68 | 0.15 | None | Optimal |
| ✅ vendor-forms-validation-C8CdEaUR.js | 85.42 | 0.08 | None | Optimal |
| ✅ vendor-react-query-DSsq-rL_.js | 53.78 | 0.05 | None | Optimal |
| ✅ vendor-external-DC2RqgR3.js | 48.15 | 0.05 | None | Optimal |
| ✅ vendor-forms-core-CzIs5Lqq.js | 35.70 | 0.03 | None | Optimal |
| ⚠️ vendor-icons-GOteAaA3.js | 7.41 | 0.01 | Too small (7.41KB < 20KB) | Consider merging with related chunks to reduce HTTP overhead |

## SDK Chunks

| Name | Size (KB) | Size (MB) | Issues | Recommendations |
|------|-----------|-----------|--------|-----------------|
| ✅ genuin-sdk-CqCaKJAV.js | 31.04 | 0.03 | None | Optimal |

## LOADER Chunks

| Name | Size (KB) | Size (MB) | Issues | Recommendations |
|------|-----------|-----------|--------|-----------------|
| ⚠️ gen_sdk.min.js | 6.31 | 0.01 | Too small (6.31KB < 20KB) | Consider merging with related chunks to reduce HTTP overhead |

## Overall Recommendations

### Split Large Chunks

- **app-ui-feed-Su38KHlp.js** (1.68MB): Split into smaller chunks for better parallel loading, Feed chunk is large - consider splitting into feed-core, feed-comments, feed-interactions
- **standard-wall-7AjC3k35.js** (0.51MB): Split into smaller chunks for better parallel loading

### Merge Small Chunks

- **mention-input-DHrizCtD.js** (19.47KB): Consider merging with related chunks to reduce HTTP overhead
- **index-BD5ukr_j.js** (17.99KB): Consider merging with related chunks to reduce HTTP overhead
- **index-Diq58EN0.js** (8.88KB): Consider merging with related chunks to reduce HTTP overhead
- **vendor-icons-GOteAaA3.js** (7.41KB): Consider merging with related chunks to reduce HTTP overhead
- **repost-modal-ODuMor-U.js** (6.97KB): Consider merging with related chunks to reduce HTTP overhead
- **gen_sdk.min.js** (6.31KB): Consider merging with related chunks to reduce HTTP overhead
- **index-CgKruC0_.js** (5.34KB): Consider merging with related chunks to reduce HTTP overhead
- **group-privacy-info-Bw6HtVDX.js** (4.71KB): Consider merging with related chunks to reduce HTTP overhead
- **index-90yXnYSk.js** (3.30KB): Consider merging with related chunks to reduce HTTP overhead
- **pills-CHFD15Zv.js** (1.08KB): Consider merging with related chunks to reduce HTTP overhead
- **community-privacy-info-BTJFbnP-.js** (0.63KB): Consider merging with related chunks to reduce HTTP overhead
- **react-query-provider-CrgZeq-T.js** (0.30KB): Consider merging with related chunks to reduce HTTP overhead

