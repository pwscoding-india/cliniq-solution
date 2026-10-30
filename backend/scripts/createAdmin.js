// Script to create the first admin user
// Run with: node scripts/createAdmin.js

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const { Admin, sequelize } = require('../models')

async function createAdmin() {
  try {
    await sequelize.authenticate()
    console.log('Connected to database')

    // Get admin credentials from environment variables
    const adminData = {
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@cliniq.com',
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
      name: process.env.DEFAULT_ADMIN_NAME || 'Super Admin'
    }

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ where: { email: adminData.email } })

    if (existingAdmin) {
      console.log('Admin already exists with email:', adminData.email)
      console.log('Admin ID:', existingAdmin.id)
    } else {
      const admin = await Admin.create(adminData)
      console.log('Admin created successfully!')
      console.log('Email:', admin.email)
      console.log('Password:', adminData.password)
      console.log('Admin ID:', admin.id)
    }

    console.log('\n⚠️  IMPORTANT: Change the default password after first login!')

    process.exit(0)
  } catch (error) {
    console.error('Error creating admin:', error)
    process.exit(1)
  }
}

createAdmin()
