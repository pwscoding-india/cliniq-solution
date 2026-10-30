// Demo data for the one-click demo (/demo).
// Run with: node scripts/demo.js          -> create missing demo data
//           node scripts/demo.js --reset  -> also restart today's demo queue fresh

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const { sequelize } = require('../models')
const { ensureDemoData, resetDemoToday } = require('../services/demoData')

async function run() {
  try {
    await sequelize.authenticate()
    if (process.argv.includes('--reset')) {
      await resetDemoToday()
      console.log("Today's demo queue reset")
    }
    const { doctor, assistant, clinic } = await ensureDemoData()
    console.log(`Demo ready: ${clinic.name} - Dr. ${doctor.name} / ${assistant.name}`)
  } catch (error) {
    console.error('Demo seed failed:', error)
    process.exitCode = 1
  } finally {
    await sequelize.close()
  }
}

run()
