# Chunk Analysis Report

**Generated:** 2025-12-31T12:33:37.440Z

## Summary

- **Total Chunks:** 25
- **Total Size:** 4.03MB
- **Chunks with Issues:** 10
- **Chunks Over Limit (>500KB):** 2
- **Chunks Under Limit (<20KB):** 8

## APP Chunks

| Name | Size (KB) | Size (MB) | Issues | Recommendations |
|------|-----------|-----------|--------|-----------------|
| ⚠️ app-ui-feed-DXDMB4fP.js | 1738.30 | 1.70 | Too large (1738.30KB > 500KB) | Split into smaller chunks for better parallel loading; Feed chunk is large - consider splitting into feed-core, feed-comments, feed-interactions |
| ⚠️ standard-wall-EqKq0aOQ.js | 520.62 | 0.51 | Too large (520.62KB > 500KB) | Split into smaller chunks for better parallel loading |
| ✅ app-react-core-S9j7jKh3.js | 306.64 | 0.30 | None | Optimal |
| ✅ embed-DvcWiuCN.js | 95.58 | 0.09 | None | Optimal |
| ✅ core-sdk-Gyi7elNG.js | 37.13 | 0.04 | None | Optimal |
| ✅ group-pill-CiTxv1gR.js | 27.54 | 0.03 | None | Optimal |
| ⚠️ mention-input-CFh_QAQs.js | 19.47 | 0.02 | Too small (19.47KB < 20KB) | Consider merging with related chunks to reduce HTTP overhead |
| ⚠️ index-BO0IrroD.js | 18.00 | 0.02 | Too small (18.00KB < 20KB) | Consider merging with related chunks to reduce HTTP overhead |
| ⚠️ index-C9t91Tlt.js | 8.89 | 0.01 | Too small (8.89KB < 20KB) | Consider merging with related chunks to reduce HTTP overhead |
| ⚠️ index-CPe5r9Cc.js | 3.31 | 0.00 | Too small (3.31KB < 20KB) | Consider merging with related chunks to reduce HTTP overhead |
| ⚠️ pills-DZx2pcaW.js | 1.08 | 0.00 | Too small (1.08KB < 20KB) | Consider merging with related chunks to reduce HTTP overhead |
| ⚠️ react-query-provider-BBrxZw5z.js | 0.30 | 0.00 | Too small (0.30KB < 20KB) | Consider merging with related chunks to reduce HTTP overhead |

## VENDOR Chunks

| Name | Size (KB) | Size (MB) | Issues | Recommendations |
|------|-----------|-----------|--------|-----------------|
| ✅ vendor-utils-D0iMcUcY.js | 214.00 | 0.21 | None | Optimal |
| ✅ vendor-analytics-Bq9iaG8z.js | 207.01 | 0.20 | None | Optimal |
| ✅ vendor-radix-DryIyqnQ.js | 184.02 | 0.18 | None | Optimal |
| ✅ vendor-animation-player-CjHVS9JG.js | 167.53 | 0.16 | None | Optimal |
| ✅ vendor-animation-motion-Oz_aY03S.js | 157.93 | 0.15 | None | Optimal |
| ✅ vendor-animation-carousel-CJMbl9PX.js | 152.68 | 0.15 | None | Optimal |
| ✅ vendor-forms-validation-C8CdEaUR.js | 85.42 | 0.08 | None | Optimal |
| ✅ vendor-react-query-B2Ujufki.js | 53.78 | 0.05 | None | Optimal |
| ✅ vendor-external-iABOZpNa.js | 48.15 | 0.05 | None | Optimal |
| ✅ vendor-forms-core-DJR3TgaZ.js | 35.70 | 0.03 | None | Optimal |
| ⚠️ vendor-icons-emikqui-.js | 7.41 | 0.01 | Too small (7.41KB < 20KB) | Consider merging with related chunks to reduce HTTP overhead |

## SDK Chunks

| Name | Size (KB) | Size (MB) | Issues | Recommendations |
|------|-----------|-----------|--------|-----------------|
| ✅ genuin-sdk-CB_NWWKe.js | 31.04 | 0.03 | None | Optimal |

## LOADER Chunks

| Name | Size (KB) | Size (MB) | Issues | Recommendations |
|------|-----------|-----------|--------|-----------------|
| ⚠️ gen_sdk.min.js | 6.31 | 0.01 | Too small (6.31KB < 20KB) | Consider merging with related chunks to reduce HTTP overhead |

## Overall Recommendations

### Split Large Chunks

- **app-ui-feed-DXDMB4fP.js** (1.70MB): Split into smaller chunks for better parallel loading, Feed chunk is large - consider splitting into feed-core, feed-comments, feed-interactions
- **standard-wall-EqKq0aOQ.js** (0.51MB): Split into smaller chunks for better parallel loading

### Merge Small Chunks

- **mention-input-CFh_QAQs.js** (19.47KB): Consider merging with related chunks to reduce HTTP overhead
- **index-BO0IrroD.js** (18.00KB): Consider merging with related chunks to reduce HTTP overhead
- **index-C9t91Tlt.js** (8.89KB): Consider merging with related chunks to reduce HTTP overhead
- **vendor-icons-emikqui-.js** (7.41KB): Consider merging with related chunks to reduce HTTP overhead
- **gen_sdk.min.js** (6.31KB): Consider merging with related chunks to reduce HTTP overhead
- **index-CPe5r9Cc.js** (3.31KB): Consider merging with related chunks to reduce HTTP overhead
- **pills-DZx2pcaW.js** (1.08KB): Consider merging with related chunks to reduce HTTP overhead
- **react-query-provider-BBrxZw5z.js** (0.30KB): Consider merging with related chunks to reduce HTTP overhead

