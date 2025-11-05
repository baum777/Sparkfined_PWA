#!/usr/bin/env tsx
/**
 * Signal Orchestrator CLI
 * 
 * Command-line interface for signal orchestration tasks
 * 
 * Usage:
 *   npm run signal:demo     - Generate demo data
 *   npm run signal:lessons  - Generate lessons from outcomes
 *   npm run signal:export   - Export all data
 *   npm run signal:stats    - Show statistics
 * 
 * @module scripts/signal-orchestrator-cli
 */

import { Command } from 'commander'

// ============================================================================
// COMMAND: DEMO DATA GENERATION
// ============================================================================

async function generateDemo() {
  console.log('📊 Signal Orchestrator - Demo Data Generator\n')
  
  try {
    // Dynamic import to avoid bundling issues
    const { generateDemoDataset } = await import('../src/lib/demoDataGenerator.js')
    
    const count = process.env.DEMO_COUNT ? parseInt(process.env.DEMO_COUNT) : 20
    
    console.log(`Generating ${count} demo trades...`)
    const dataset = await generateDemoDataset(count)
    
    console.log('\n✅ Demo data generated successfully!')
    console.log(`   Signals: ${dataset.signals.length}`)
    console.log(`   Plans: ${dataset.plans.length}`)
    console.log(`   Outcomes: ${dataset.outcomes.length}`)
    console.log(`   Nodes: ${dataset.nodes.length}`)
    
  } catch (error) {
    console.error('❌ Error generating demo data:', error)
    process.exit(1)
  }
}

// ============================================================================
// COMMAND: LESSON GENERATION
// ============================================================================

async function generateLessons() {
  console.log('🧠 Signal Orchestrator - Lesson Generator\n')
  
  try {
    const { runLessonWorker } = await import('../src/lib/lessonGenerator.js')
    
    console.log('Analyzing trade outcomes and generating lessons...')
    const result = await runLessonWorker()
    
    if (result.success) {
      console.log(`\n✅ Lessons generated successfully!`)
      console.log(`   Generated: ${result.lessons_generated} lessons`)
    } else {
      console.error(`\n❌ Lesson generation failed:`)
      for (const error of result.errors) {
        console.error(`   - ${error}`)
      }
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ Error generating lessons:', error)
    process.exit(1)
  }
}

// ============================================================================
// COMMAND: DATA EXPORT
// ============================================================================

async function exportData() {
  console.log('📤 Signal Orchestrator - Data Export\n')
  
  try {
    const { exportAllData } = await import('../src/lib/signalDb.js')
    const { exportLessonsAsMarkdown } = await import('../src/lib/lessonGenerator.js')
    const fs = await import('fs')
    const path = await import('path')
    
    // Export all data as JSON
    console.log('Exporting all data...')
    const allData = await exportAllData()
    
    const exportDir = path.join(process.cwd(), 'exports')
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true })
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const jsonPath = path.join(exportDir, `signal-orchestrator-${timestamp}.json`)
    
    fs.writeFileSync(jsonPath, JSON.stringify(allData, null, 2))
    console.log(`✅ JSON export saved: ${jsonPath}`)
    
    // Export lessons as Markdown
    console.log('Exporting lessons as Markdown...')
    const markdown = await exportLessonsAsMarkdown()
    const mdPath = path.join(exportDir, `lessons-${timestamp}.md`)
    
    fs.writeFileSync(mdPath, markdown)
    console.log(`✅ Markdown export saved: ${mdPath}`)
    
    // Stats
    console.log('\n📊 Export Summary:')
    console.log(`   Signals: ${allData.signals.length}`)
    console.log(`   Trade Plans: ${allData.trade_plans.length}`)
    console.log(`   Action Nodes: ${allData.action_nodes.length}`)
    console.log(`   Lessons: ${allData.lessons.length}`)
    console.log(`   Trade Outcomes: ${allData.trade_outcomes.length}`)
    
  } catch (error) {
    console.error('❌ Error exporting data:', error)
    process.exit(1)
  }
}

// ============================================================================
// COMMAND: STATISTICS
// ============================================================================

async function showStats() {
  console.log('📊 Signal Orchestrator - Statistics\n')
  
  try {
    const {
      getAllSignals,
      getAllTradePlans,
      getAllActionNodes,
      getAllLessons,
      getAllTradeOutcomes,
    } = await import('../src/lib/signalDb.js')
    
    const [signals, plans, nodes, lessons, outcomes] = await Promise.all([
      getAllSignals(),
      getAllTradePlans(),
      getAllActionNodes(),
      getAllLessons(),
      getAllTradeOutcomes(),
    ])
    
    console.log('📈 Overall Statistics:\n')
    console.log(`   Total Signals: ${signals.length}`)
    console.log(`   Total Trade Plans: ${plans.length}`)
    console.log(`   Total Action Nodes: ${nodes.length}`)
    console.log(`   Total Lessons: ${lessons.length}`)
    console.log(`   Total Trade Outcomes: ${outcomes.length}`)
    
    // Pattern breakdown
    console.log('\n📊 Signals by Pattern:')
    const patternCounts = new Map<string, number>()
    for (const signal of signals) {
      patternCounts.set(signal.pattern, (patternCounts.get(signal.pattern) || 0) + 1)
    }
    for (const [pattern, count] of patternCounts.entries()) {
      console.log(`   ${pattern}: ${count}`)
    }
    
    // Trade outcomes
    if (outcomes.length > 0) {
      const wins = outcomes.filter((o) => o.result === 'win')
      const losses = outcomes.filter((o) => o.result === 'loss')
      const winRate = wins.length / outcomes.length
      const avgPnl = outcomes.reduce((sum, o) => sum + o.pnl_usd, 0) / outcomes.length
      const avgRR = outcomes.reduce((sum, o) => sum + o.rr_actual, 0) / outcomes.length
      
      console.log('\n💰 Trading Performance:')
      console.log(`   Win Rate: ${(winRate * 100).toFixed(1)}%`)
      console.log(`   Wins: ${wins.length}`)
      console.log(`   Losses: ${losses.length}`)
      console.log(`   Avg P&L: $${avgPnl.toFixed(2)}`)
      console.log(`   Avg R:R: ${avgRR.toFixed(2)}`)
    }
    
    // Lessons
    if (lessons.length > 0) {
      console.log('\n🧠 Top Lessons:')
      lessons.sort((a, b) => b.score - a.score)
      for (const lesson of lessons.slice(0, 5)) {
        console.log(`   ${lesson.pattern} (score: ${(lesson.score * 100).toFixed(0)}%)`)
        if (lesson.stats) {
          console.log(`      Win rate: ${(lesson.stats.win_rate * 100).toFixed(0)}%, Avg R:R: ${lesson.stats.avg_rr.toFixed(2)}`)
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error fetching statistics:', error)
    process.exit(1)
  }
}

// ============================================================================
// COMMAND: CLEAR DATA
// ============================================================================

async function clearData() {
  console.log('🗑️  Signal Orchestrator - Clear Data\n')
  console.log('⚠️  This will delete all signals, plans, nodes, lessons, and outcomes.')
  console.log('⚠️  This action cannot be undone!\n')
  
  // Ask for confirmation
  const readline = await import('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  
  rl.question('Type "DELETE" to confirm: ', async (answer) => {
    rl.close()
    
    if (answer !== 'DELETE') {
      console.log('❌ Cancelled. No data was deleted.')
      return
    }
    
    try {
      // Delete all data by clearing the database
      const { initSignalDB } = await import('../src/lib/signalDb.js')
      const db = await initSignalDB()
      
      const stores = ['signals', 'trade_plans', 'action_nodes', 'lessons', 'trade_outcomes', 'edges']
      
      for (const store of stores) {
        const transaction = db.transaction([store], 'readwrite')
        const objectStore = transaction.objectStore(store)
        await objectStore.clear()
      }
      
      console.log('✅ All data cleared successfully!')
      
    } catch (error) {
      console.error('❌ Error clearing data:', error)
      process.exit(1)
    }
  })
}

// ============================================================================
// CLI SETUP
// ============================================================================

const program = new Command()

program
  .name('signal-orchestrator')
  .description('AI Signal Orchestrator & Learning Architect CLI')
  .version('1.0.0')

program
  .command('demo')
  .description('Generate demo trading data (signals, plans, outcomes)')
  .option('-c, --count <number>', 'Number of demo trades to generate', '20')
  .action((options) => {
    process.env.DEMO_COUNT = options.count
    generateDemo()
  })

program
  .command('lessons')
  .description('Generate lessons from trade outcomes')
  .action(generateLessons)

program
  .command('export')
  .description('Export all data to JSON and Markdown')
  .action(exportData)

program
  .command('stats')
  .description('Show trading statistics')
  .action(showStats)

program
  .command('clear')
  .description('Clear all data (requires confirmation)')
  .action(clearData)

// Parse CLI arguments
program.parse(process.argv)

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp()
}
