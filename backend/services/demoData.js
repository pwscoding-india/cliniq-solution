// Demo clinic data for the public one-click demo (/demo on the frontend).
// Everything here is keyed by fixed demo clerkIds, so real users are never touched.
const { Op } = require('sequelize')
const { User, Clinic, ClinicDoctor, DoctorAssistant, Patient, Queue, Token } = require('../models')

const DEMO_CLERK_IDS = {
  doctor: 'demo_doctor_ananya',
  assistant: 'demo_assistant_priya'
}

const CLINIC_NAME = 'Sunrise Family Clinic'

const TODAY_PATIENTS = [
  ['Rohan Verma', '9819023456'], ['Sneha Iyer', '9867012345'], ['Imran Shaikh', '9930045678'],
  ['Kavya Nair', '9821098765'], ['Arjun Patel', '9892034567'], ['Meera Joshi', '9769056789'],
  ['Vikram Singh', '9833067890'], ['Fatima Khan', '9004078901'], ['Aditya Rao', '9920089012'],
  ['Pooja Desai', '9870090123'], ['Rahul Gupta', '9821112233'], ['Neha Kulkarni', '9819445566']
]
const FIRST = ['Aarav', 'Diya', 'Kabir', 'Isha', 'Reyansh', 'Anaya', 'Vihaan', 'Saanvi', 'Zaid', 'Myra', 'Arnav', 'Tara', 'Yusuf', 'Riya', 'Dev', 'Nisha', 'Omar', 'Priya', 'Karan', 'Sara']
const LAST = ['Shah', 'Menon', 'Ansari', 'Pillai', 'Chopra', 'Reddy', 'Bhatt', 'Kapoor', 'Mishra', 'Fernandes']

// Same local-date format the queue routes use
const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const minutesAgo = (m) => new Date(Date.now() - m * 60000)

async function ensureUsersAndClinic() {
  const [doctor] = await User.findOrCreate({
    where: { clerkId: DEMO_CLERK_IDS.doctor },
    defaults: { name: 'Ananya Mehta', email: 'demo.doctor@cliniq.test', phone: '9820011223', role: 'doctor', status: 'approved' }
  })
  const [assistant] = await User.findOrCreate({
    where: { clerkId: DEMO_CLERK_IDS.assistant },
    defaults: { name: 'Priya Sharma', email: 'demo.assistant@cliniq.test', phone: '9820044556', role: 'assistant', status: 'approved' }
  })
  const [clinic] = await Clinic.findOrCreate({
    where: { ownerId: doctor.id },
    defaults: { name: CLINIC_NAME, address: 'Andheri West, Mumbai', phone: '022-26350011', openTime: '09:00', closeTime: '21:00', registrationNumber: 'MH-CL-48213' }
  })
  await ClinicDoctor.findOrCreate({ where: { clinicId: clinic.id, userId: doctor.id } })
  await DoctorAssistant.findOrCreate({ where: { doctorId: doctor.id, assistantId: assistant.id } })
  return { doctor, assistant, clinic }
}

async function ensurePatients() {
  const today = []
  for (const [name, phone] of TODAY_PATIENTS) {
    const [p] = await Patient.findOrCreate({ where: { phone }, defaults: { name } })
    today.push(p)
  }
  const pool = []
  for (let i = 0; i < 60; i++) {
    const phone = String(9700000000 + i * 104729)
    const [p] = await Patient.findOrCreate({ where: { phone }, defaults: { name: `${FIRST[i % FIRST.length]} ${LAST[(i * 7) % LAST.length]}` } })
    pool.push(p)
  }
  return { today, pool }
}

// ~4 weeks of closed queues so reports and analytics look realistic
async function ensureHistory(doctor, clinic, patients) {
  let seed = 42
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  const all = [...patients.today, ...patients.pool]

  for (let d = 1; d <= 29; d++) {
    const day = new Date()
    day.setDate(day.getDate() - d)
    const n = 10 + Math.floor(rand() * 9)
    if (day.getDay() === 0) continue // Sunday off
    const date = formatDate(day)
    const exists = await Queue.findOne({ where: { doctorId: doctor.id, date } })
    if (exists) continue

    const queue = await Queue.create({ clinicId: clinic.id, doctorId: doctor.id, date, status: 'closed', lastTokenNumber: n })
    const open = new Date(day)
    open.setHours(10, 0, 0, 0)
    const tokens = []
    for (let i = 0; i < n; i++) {
      const created = new Date(open.getTime() + i * 14 * 60000)
      const called = new Date(created.getTime() + (8 + rand() * 14) * 60000)
      const r = rand()
      const status = r < 0.88 ? 'completed' : r < 0.95 ? 'no_show' : 'skipped'
      tokens.push({
        queueId: queue.id,
        patientId: all[Math.floor(rand() * all.length)].id,
        tokenNumber: i + 1,
        position: i + 1,
        status,
        isEmergency: rand() < 0.05,
        calledAt: called,
        startedAt: status === 'completed' ? called : null,
        completedAt: status === 'completed' ? new Date(called.getTime() + (7 + rand() * 6) * 60000) : null,
        createdAt: created,
        updatedAt: created
      })
    }
    await Token.bulkCreate(tokens)
  }
}

// Today's live queue: 3 done, 1 with the doctor, 5 waiting (one emergency)
async function ensureToday(doctor, clinic, patients) {
  const date = formatDate(new Date())
  const existing = await Queue.findOne({ where: { doctorId: doctor.id, date } })
  if (existing) {
    const tokenCount = await Token.count({ where: { queueId: existing.id } })
    if (tokenCount > 0) return existing
    await existing.destroy()
  }

  const queue = await Queue.create({ clinicId: clinic.id, doctorId: doctor.id, date, status: 'open', lastTokenNumber: 9 })
  const plan = ['completed', 'completed', 'completed', 'in_progress', 'waiting', 'waiting', 'waiting', 'waiting', 'waiting']
  let current = null
  for (let i = 0; i < plan.length; i++) {
    const status = plan[i]
    const t0 = minutesAgo(50 - i * 5)
    const token = await Token.create({
      queueId: queue.id,
      patientId: patients.today[i].id,
      tokenNumber: i + 1,
      position: i + 1,
      status,
      isEmergency: i === 6,
      calledAt: status !== 'waiting' ? t0 : null,
      startedAt: status !== 'waiting' ? t0 : null,
      completedAt: status === 'completed' ? new Date(t0.getTime() + 4 * 60000) : null
    })
    if (status === 'in_progress') current = token
  }
  await queue.update({ currentTokenId: current.id })
  return queue
}

async function seedDemoData() {
  const { doctor, assistant, clinic } = await ensureUsersAndClinic()
  const patients = await ensurePatients()
  await ensureHistory(doctor, clinic, patients)
  const todayQueue = await ensureToday(doctor, clinic, patients)
  return { doctor, assistant, clinic, todayQueue }
}

/** Idempotent: creates whatever demo data is missing (users, clinic, history, today's queue). */
async function ensureDemoData() {
  try {
    return await seedDemoData()
  } catch (error) {
    // Two visitors seeding at the same moment: the other request created the row, so just re-read
    if (error.name === 'SequelizeUniqueConstraintError') return seedDemoData()
    throw error
  }
}

/** Wipes today's demo queue so the next ensureDemoData() call starts it fresh. */
async function resetDemoToday() {
  const doctor = await User.findOne({ where: { clerkId: DEMO_CLERK_IDS.doctor } })
  if (!doctor) return
  const queue = await Queue.findOne({ where: { doctorId: doctor.id, date: formatDate(new Date()) } })
  if (!queue) return
  await queue.update({ currentTokenId: null })
  await Token.destroy({ where: { queueId: queue.id } })
  await queue.destroy()
}

/** A waiting token from today's demo queue, for the patient live view. */
async function getDemoPatientTokenId() {
  const doctor = await User.findOne({ where: { clerkId: DEMO_CLERK_IDS.doctor } })
  if (!doctor) return null
  const queue = await Queue.findOne({ where: { doctorId: doctor.id, date: formatDate(new Date()) } })
  if (!queue) return null
  const token = await Token.findOne({
    where: { queueId: queue.id, status: { [Op.in]: ['waiting', 'called'] } },
    order: [['position', 'ASC']],
    offset: 1
  }) || await Token.findOne({ where: { queueId: queue.id }, order: [['position', 'DESC']] })
  return token ? token.id : null
}

module.exports = { DEMO_CLERK_IDS, ensureDemoData, resetDemoToday, getDemoPatientTokenId }
