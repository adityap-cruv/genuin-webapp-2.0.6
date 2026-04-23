/**
 * Baseline Measurement Script
 *
 * Analyzes the production build to establish baseline metrics for performance optimization.
 * Generates a report with chunk sizes, dependencies, and loading timeline.
 */

import { readdir, readFile, stat } from 'fs/promises'
import { resolve, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const distDir = resolve(__dirname, '../dist')
const chunksDir = resolve(distDir, 'chunks')

interface ChunkInfo {
  name: string
  path: string
  size: number
  sizeKB: number
  sizeMB: number
  compressedEstimate: number // Rough estimate of gzipped size (usually ~30% of original)
}

interface BaselineReport {
  timestamp: string
  loaderSize: ChunkInfo | null
  sdkSize: ChunkInfo | null
  chunks: ChunkInfo[]
  totalSize: number
  totalSizeKB: number
  totalSizeMB: number
  largestChunk: ChunkInfo | null
  averageChunkSize: number
  chunkCount: number
  chunksOverLimit: ChunkInfo[] // Chunks > 500KB
  chunksUnderLimit: ChunkInfo[] // Chunks < 20KB
  recommendations: string[]
}

async function getFileSize(filePath: string): Promise<number> {
  try {
    const stats = await stat(filePath)
    return stats.size
  } catch (error) {
    return 0
  }
}

async function analyzeChunks(): Promise<ChunkInfo[]> {
  const chunks: ChunkInfo[] = []

  try {
    const files = await readdir(chunksDir)

    for (const file of files) {
      if (file.endsWith('.js')) {
        const filePath = join(chunksDir, file)
        const size = await getFileSize(filePath)

        chunks.push({
          name: file,
          path: filePath,
          size,
          sizeKB: size / 1024,
          sizeMB: size / (1024 * 1024),
          compressedEstimate: size * 0.3, // Rough estimate
        })
      }
    }
  } catch (error) {
    console.warn('Could not read chunks directory:', error)
  }

  return chunks.sort((a, b) => b.size - a.size)
}

async function findSDKFiles(): Promise<{
  loader: ChunkInfo | null
  sdk: ChunkInfo | null
}> {
  let loader: ChunkInfo | null = null
  let sdk: ChunkInfo | null = null

  try {
    const files = await readdir(distDir)

    for (const file of files) {
      if (file.endsWith('.js')) {
        const filePath = join(distDir, file)
        const size = await getFileSize(filePath)

        const info: ChunkInfo = {
          name: file,
          path: filePath,
          size,
          sizeKB: size / 1024,
          sizeMB: size / (1024 * 1024),
          compressedEstimate: size * 0.3,
        }

        if (file.includes('gen_sdk') || file.includes('loader')) {
          loader = info
        } else if (file.includes('genuin-sdk') && !file.includes('legacy')) {
          sdk = info
        }
      }
    }
  } catch (error) {
    console.warn('Could not read dist directory:', error)
  }

  return { loader, sdk }
}

function generateRecommendations(report: BaselineReport): string[] {
  const recommendations: string[] = []

  // Check for oversized chunks
  if (report.chunksOverLimit.length > 0) {
    recommendations.push(
      `⚠️ Found ${report.chunksOverLimit.length} chunk(s) over 500KB limit:`
    )
    report.chunksOverLimit.forEach((chunk) => {
      recommendations.push(
        `  - ${chunk.name}: ${chunk.sizeMB.toFixed(2)}MB (should be split)`
      )
    })
  }

  // Check for undersized chunks
  if (report.chunksUnderLimit.length > 0) {
    recommendations.push(
      `⚠️ Found ${report.chunksUnderLimit.length} chunk(s) under 20KB (consider merging):`
    )
    report.chunksUnderLimit.forEach((chunk) => {
      recommendations.push(`  - ${chunk.name}: ${chunk.sizeKB.toFixed(2)}KB`)
    })
  }

  // Check index chunk size
  const indexChunk = report.chunks.find((c) => c.name.includes('index'))
  if (indexChunk && indexChunk.size > 200 * 1024) {
    recommendations.push(
      `⚠️ Index chunk is ${indexChunk.sizeMB.toFixed(2)}MB (target: <200KB). Consider:`
    )
    recommendations.push('  - Lazy loading CSS imports')
    recommendations.push('  - Using selective exports instead of export *')
    recommendations.push('  - Splitting into core vs. full SDK exports')
  }

  // Check total chunk count
  if (report.chunkCount > 20) {
    recommendations.push(
      `⚠️ Total chunk count is ${report.chunkCount} (optimal: 5-15). Consider merging related chunks.`
    )
  } else if (report.chunkCount < 5) {
    recommendations.push(
      `⚠️ Total chunk count is ${report.chunkCount} (optimal: 5-15). Consider splitting large chunks for better parallel loading.`
    )
  }

  // Check average chunk size
  if (report.averageChunkSize > 400 * 1024) {
    recommendations.push(
      `⚠️ Average chunk size is ${(report.averageChunkSize / 1024).toFixed(2)}KB (optimal: 150-300KB). Consider splitting large chunks.`
    )
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ Chunk sizes are within optimal ranges!')
  }

  return recommendations
}

async function generateReport(): Promise<BaselineReport> {
  console.log('📊 Analyzing baseline metrics...\n')

  const chunks = await analyzeChunks()
  const { loader, sdk } = await findSDKFiles()

  const allFiles = [...chunks]
  if (loader) allFiles.push(loader)
  if (sdk) allFiles.push(sdk)

  const totalSize = allFiles.reduce((sum, file) => sum + file.size, 0)
  const averageChunkSize =
    chunks.length > 0 ? chunks.reduce((sum, c) => sum + c.size, 0) / chunks.length : 0

  const chunksOverLimit = chunks.filter((c) => c.size > 500 * 1024)
  const chunksUnderLimit = chunks.filter((c) => c.size < 20 * 1024)
  const largestChunk = chunks.length > 0 ? chunks[0] : null

  const report: BaselineReport = {
    timestamp: new Date().toISOString(),
    loaderSize: loader,
    sdkSize: sdk,
    chunks,
    totalSize,
    totalSizeKB: totalSize / 1024,
    totalSizeMB: totalSize / (1024 * 1024),
    largestChunk,
    averageChunkSize,
    chunkCount: chunks.length,
    chunksOverLimit,
    chunksUnderLimit,
    recommendations: [],
  }

  report.recommendations = generateRecommendations(report)

  return report
}

function formatReport(report: BaselineReport): string {
  let output = '# Genuin SDK Baseline Performance Metrics\n\n'
  output += `**Generated:** ${report.timestamp}\n\n`

  output += '## Summary\n\n'
  output += `- **Total Size:** ${report.totalSizeMB.toFixed(2)}MB (${report.totalSizeKB.toFixed(2)}KB)\n`
  output += `- **Loader Size:** ${report.loaderSize ? `${report.loaderSize.sizeKB.toFixed(2)}KB` : 'N/A'}\n`
  output += `- **SDK Size:** ${report.sdkSize ? `${report.sdkSize.sizeKB.toFixed(2)}KB` : 'N/A'}\n`
  output += `- **Chunk Count:** ${report.chunkCount}\n`
  output += `- **Largest Chunk:** ${report.largestChunk ? `${report.largestChunk.name} (${report.largestChunk.sizeMB.toFixed(2)}MB)` : 'N/A'}\n`
  output += `- **Average Chunk Size:** ${(report.averageChunkSize / 1024).toFixed(2)}KB\n\n`

  output += '## Chunk Breakdown\n\n'
  output += '| Chunk Name | Size (KB) | Size (MB) | Est. Compressed (KB) |\n'
  output += '|------------|-----------|-----------|---------------------|\n'

  report.chunks.forEach((chunk) => {
    const marker = chunk.size > 500 * 1024 ? '⚠️ ' : chunk.size < 20 * 1024 ? '🔹 ' : ''
    output += `| ${marker}${chunk.name} | ${chunk.sizeKB.toFixed(2)} | ${chunk.sizeMB.toFixed(2)} | ${(chunk.compressedEstimate / 1024).toFixed(2)} |\n`
  })

  if (report.loaderSize) {
    output += `| ${report.loaderSize.name} | ${report.loaderSize.sizeKB.toFixed(2)} | ${report.loaderSize.sizeMB.toFixed(2)} | ${(report.loaderSize.compressedEstimate / 1024).toFixed(2)} |\n`
  }

  if (report.sdkSize) {
    output += `| ${report.sdkSize.name} | ${report.sdkSize.sizeKB.toFixed(2)} | ${report.sdkSize.sizeMB.toFixed(2)} | ${(report.sdkSize.compressedEstimate / 1024).toFixed(2)} |\n`
  }

  output += '\n## Recommendations\n\n'
  report.recommendations.forEach((rec) => {
    output += `${rec}\n`
  })

  output += '\n## Optimal Targets\n\n'
  output += '- **Largest chunk:** < 300KB uncompressed\n'
  output += '- **Average chunk size:** 150-250KB uncompressed\n'
  output += '- **Total chunk count:** 10-15 chunks\n'
  output += '- **No chunks < 20KB** (merged with related chunks)\n'
  output += '- **No chunks > 500KB** (split into smaller chunks)\n'
  output += '- **Index chunk:** < 200KB uncompressed\n'

  return output
}

async function main() {
  try {
    const report = await generateReport()
    const formatted = formatReport(report)

    // Write to file
    const reportPath = resolve(__dirname, '../docs/performance/PERFORMANCE_BASELINE.md')
    await import('fs/promises').then((fs) =>
      fs.writeFile(reportPath, formatted, 'utf-8')
    )

    console.log(formatted)
    console.log(`\n✅ Baseline report written to: ${reportPath}`)
  } catch (error) {
    console.error('❌ Error generating baseline report:', error)
    process.exit(1)
  }
}

main()

