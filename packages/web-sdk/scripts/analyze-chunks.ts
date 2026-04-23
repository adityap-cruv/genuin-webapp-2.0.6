/**
 * Chunk Analysis Script
 *
 * Analyzes chunk sizes, dependencies, and loading order to provide optimization recommendations.
 */

import { readdir, readFile, stat } from 'fs/promises'
import { resolve, join, basename } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const distDir = resolve(__dirname, '../dist')
const chunksDir = resolve(distDir, 'chunks')

interface ChunkAnalysis {
  name: string
  path: string
  size: number
  sizeKB: number
  sizeMB: number
  category: 'vendor' | 'app' | 'loader' | 'sdk'
  subcategory?: string
  issues: string[]
  recommendations: string[]
}

const OPTIMAL_SIZE_MIN = 20 * 1024 // 20KB
const OPTIMAL_SIZE_MAX = 500 * 1024 // 500KB
const OPTIMAL_SIZE_TARGET = 200 * 1024 // 200KB

function categorizeChunk(name: string): { category: ChunkAnalysis['category']; subcategory?: string } {
  if (name.includes('gen_sdk') || name.includes('loader')) {
    return { category: 'loader' }
  }
  if (name.includes('genuin-sdk') && !name.includes('legacy')) {
    return { category: 'sdk' }
  }
  if (name.includes('vendor-')) {
    const subcategory = name.replace('vendor-', '').split('-')[0]
    return { category: 'vendor', subcategory }
  }
  if (name.includes('embed') || name.includes('feed') || name.includes('index')) {
    return { category: 'app', subcategory: name.split('-')[0] }
  }
  return { category: 'app' }
}

function analyzeChunk(chunk: { name: string; size: number; path: string }): ChunkAnalysis {
  const { category, subcategory } = categorizeChunk(chunk.name)
  const issues: string[] = []
  const recommendations: string[] = []

  // Check size issues
  if (chunk.size < OPTIMAL_SIZE_MIN) {
    issues.push(`Too small (${(chunk.size / 1024).toFixed(2)}KB < ${OPTIMAL_SIZE_MIN / 1024}KB)`)
    recommendations.push('Consider merging with related chunks to reduce HTTP overhead')
  } else if (chunk.size > OPTIMAL_SIZE_MAX) {
    issues.push(`Too large (${(chunk.size / 1024).toFixed(2)}KB > ${OPTIMAL_SIZE_MAX / 1024}KB)`)
    recommendations.push('Split into smaller chunks for better parallel loading')
  } else if (chunk.size > OPTIMAL_SIZE_TARGET * 2) {
    issues.push(`Larger than optimal (${(chunk.size / 1024).toFixed(2)}KB > ${OPTIMAL_SIZE_TARGET * 2 / 1024}KB)`)
    recommendations.push('Consider splitting if this chunk blocks other critical resources')
  }

  // Category-specific recommendations
  if (category === 'vendor' && chunk.size > 400 * 1024) {
    recommendations.push('Large vendor chunk - consider splitting by library or feature')
  }
  if (category === 'app' && chunk.name.includes('index') && chunk.size > 200 * 1024) {
    recommendations.push('Index chunk is large - check for eager imports and use selective exports')
  }
  if (category === 'app' && chunk.name.includes('feed') && chunk.size > 300 * 1024) {
    recommendations.push('Feed chunk is large - consider splitting into feed-core, feed-comments, feed-interactions')
  }

  return {
    name: chunk.name,
    path: chunk.path,
    size: chunk.size,
    sizeKB: chunk.size / 1024,
    sizeMB: chunk.size / (1024 * 1024),
    category,
    subcategory,
    issues,
    recommendations,
  }
}

async function analyzeAllChunks(): Promise<ChunkAnalysis[]> {
  const chunks: ChunkAnalysis[] = []

  // Analyze chunks directory
  try {
    const files = await readdir(chunksDir)
    for (const file of files) {
      if (file.endsWith('.js')) {
        const filePath = join(chunksDir, file)
        const stats = await stat(filePath)
        const analysis = analyzeChunk({
          name: file,
          size: stats.size,
          path: filePath,
        })
        chunks.push(analysis)
      }
    }
  } catch (error) {
    console.warn('Could not read chunks directory:', error)
  }

  // Analyze main SDK files
  try {
    const files = await readdir(distDir)
    for (const file of files) {
      if (file.endsWith('.js') && (file.includes('gen_sdk') || file.includes('genuin-sdk'))) {
        const filePath = join(distDir, file)
        const stats = await stat(filePath)
        const analysis = analyzeChunk({
          name: file,
          size: stats.size,
          path: filePath,
        })
        chunks.push(analysis)
      }
    }
  } catch (error) {
    console.warn('Could not read dist directory:', error)
  }

  return chunks.sort((a, b) => b.size - a.size)
}

function generateReport(analyses: ChunkAnalysis[]): string {
  let report = '# Chunk Analysis Report\n\n'
  report += `**Generated:** ${new Date().toISOString()}\n\n`

  // Summary
  const totalSize = analyses.reduce((sum, a) => sum + a.size, 0)
  const chunksWithIssues = analyses.filter((a) => a.issues.length > 0)
  const chunksOverLimit = analyses.filter((a) => a.size > OPTIMAL_SIZE_MAX)
  const chunksUnderLimit = analyses.filter((a) => a.size < OPTIMAL_SIZE_MIN)

  report += '## Summary\n\n'
  report += `- **Total Chunks:** ${analyses.length}\n`
  report += `- **Total Size:** ${(totalSize / (1024 * 1024)).toFixed(2)}MB\n`
  report += `- **Chunks with Issues:** ${chunksWithIssues.length}\n`
  report += `- **Chunks Over Limit (>500KB):** ${chunksOverLimit.length}\n`
  report += `- **Chunks Under Limit (<20KB):** ${chunksUnderLimit.length}\n\n`

  // Detailed analysis by category
  const byCategory = analyses.reduce((acc, analysis) => {
    if (!acc[analysis.category]) {
      acc[analysis.category] = []
    }
    acc[analysis.category].push(analysis)
    return acc
  }, {} as Record<string, ChunkAnalysis[]>)

  for (const [category, chunks] of Object.entries(byCategory)) {
    report += `## ${category.toUpperCase()} Chunks\n\n`
    report += '| Name | Size (KB) | Size (MB) | Issues | Recommendations |\n'
    report += '|------|-----------|-----------|--------|-----------------|\n'

    for (const chunk of chunks) {
      const issues = chunk.issues.length > 0 ? chunk.issues.join('; ') : 'None'
      const recommendations =
        chunk.recommendations.length > 0 ? chunk.recommendations.join('; ') : 'Optimal'
      const marker = chunk.issues.length > 0 ? '⚠️ ' : '✅ '
      report += `| ${marker}${chunk.name} | ${chunk.sizeKB.toFixed(2)} | ${chunk.sizeMB.toFixed(2)} | ${issues} | ${recommendations} |\n`
    }
    report += '\n'
  }

  // Recommendations
  report += '## Overall Recommendations\n\n'
  if (chunksOverLimit.length > 0) {
    report += '### Split Large Chunks\n\n'
    chunksOverLimit.forEach((chunk) => {
      report += `- **${chunk.name}** (${chunk.sizeMB.toFixed(2)}MB): ${chunk.recommendations.join(', ')}\n`
    })
    report += '\n'
  }

  if (chunksUnderLimit.length > 0) {
    report += '### Merge Small Chunks\n\n'
    chunksUnderLimit.forEach((chunk) => {
      report += `- **${chunk.name}** (${chunk.sizeKB.toFixed(2)}KB): ${chunk.recommendations.join(', ')}\n`
    })
    report += '\n'
  }

  if (chunksWithIssues.length === 0) {
    report += '✅ All chunks are within optimal size ranges!\n\n'
  }

  return report
}

async function main() {
  try {
    console.log('📊 Analyzing chunks...\n')
    const analyses = await analyzeAllChunks()
    const report = generateReport(analyses)

    // Write report
    const reportPath = resolve(__dirname, '../docs/performance/CHUNK_ANALYSIS.md')
    await import('fs/promises').then((fs) =>
      fs.writeFile(reportPath, report, 'utf-8')
    )

    console.log(report)
    console.log(`\n✅ Analysis report written to: ${reportPath}`)
  } catch (error) {
    console.error('❌ Error analyzing chunks:', error)
    process.exit(1)
  }
}

main()

