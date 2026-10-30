const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string | null
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const config: RequestInit = {
    method,
    headers,
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_URL}${endpoint}`, config)
  const data = await response.json()

  if (!response.ok) {
    throw {
      status: response.status,
      ...data
    }
  }

  return data
}

// Auth
export const authApi = {
  verify: (clerkId: string, email?: string, name?: string) =>
    request<{ success: boolean; token: string; user: User }>('/api/auth/verify', {
      method: 'POST',
      body: { clerkId, email, name }
    }),

  register: (data: { clerkId: string; email?: string; name: string; phone?: string; role?: string }) =>
    request<{ success: boolean; user: User }>('/api/auth/register', {
      method: 'POST',
      body: data
    }),

  me: (token: string) =>
    request<{ success: boolean; user: User }>('/api/auth/me', { token }),

  demo: (role: 'doctor' | 'assistant') =>
    request<{ success: boolean; token: string; user: User }>('/api/auth/demo', {
      method: 'POST',
      body: { role }
    }),

  demoPatientToken: () =>
    request<{ success: boolean; tokenId: number | null }>('/api/auth/demo/patient-token')
}

// Queues
export const queuesApi = {
  create: (token: string, data: { clinicId?: number; doctorId?: number }) =>
    request<{ success: boolean; queue: Queue; isNew: boolean }>('/api/queues', {
      method: 'POST',
      body: data,
      token
    }),

  getToday: (token: string, doctorId?: number) =>
    request<{ success: boolean; queue: Queue; stats: QueueStats }>(`/api/queues/today${doctorId ? `?doctorId=${doctorId}` : ''}`, { token }),

  getById: (token: string, id: number) =>
    request<{ success: boolean; queue: Queue }>(`/api/queues/${id}`, { token }),

  pause: (token: string, id: number) =>
    request<{ success: boolean; queue: { id: number; status: string } }>(`/api/queues/${id}/pause`, {
      method: 'PATCH',
      token
    }),

  resume: (token: string, id: number) =>
    request<{ success: boolean; queue: { id: number; status: string } }>(`/api/queues/${id}/resume`, {
      method: 'PATCH',
      token
    }),

  close: (token: string, id: number) =>
    request<{ success: boolean; queue: { id: number; status: string }; stats: QueueStats }>(`/api/queues/${id}/close`, {
      method: 'PATCH',
      token
    }),

  reopen: (token: string, id: number) =>
    request<{ success: boolean; queue: { id: number; status: string }; stats: QueueStats }>(`/api/queues/${id}/reopen`, {
      method: 'PATCH',
      token
    })
}

// Tokens
export const tokensApi = {
  add: (token: string, data: { queueId: number; patientId?: number; patientName?: string; patientPhone?: string; isEmergency?: boolean }) =>
    request<{ success: boolean; token: Token; queueUrl: string }>('/api/tokens', {
      method: 'POST',
      body: data,
      token
    }),

  list: (token: string, queueId: number, status?: string) =>
    request<{ success: boolean; tokens: Token[]; total: number }>(`/api/tokens?queueId=${queueId}${status ? `&status=${status}` : ''}`, { token }),

  skip: (token: string, id: number) =>
    request<{ success: boolean; token: Token }>(`/api/tokens/${id}/skip`, {
      method: 'PATCH',
      token
    }),

  noshow: (token: string, id: number) =>
    request<{ success: boolean; token: Token }>(`/api/tokens/${id}/noshow`, {
      method: 'PATCH',
      token
    }),

  readd: (token: string, id: number) =>
    request<{ success: boolean; token: Token }>(`/api/tokens/${id}/readd`, {
      method: 'PATCH',
      token
    }),

  cancel: (token: string, id: number) =>
    request<{ success: boolean }>(`/api/tokens/${id}`, {
      method: 'DELETE',
      token
    })
}

// Doctor actions
export const doctorApi = {
  callNext: (token: string) =>
    request<{ success: boolean; token: Token; waitingCount: number }>('/api/doctor/call-next', {
      method: 'POST',
      token
    }),

  start: (token: string) =>
    request<{ success: boolean; token: Token }>('/api/doctor/start', {
      method: 'POST',
      token
    }),

  complete: (token: string) =>
    request<{ success: boolean; token: Token; waitingCount: number }>('/api/doctor/complete', {
      method: 'POST',
      token
    }),

  getCurrent: (token: string) =>
    request<{ success: boolean; queueStatus: string; currentToken: Token | null; nextToken: Token | null; waitingCount: number }>('/api/doctor/current', { token }),

  getAssistants: (token: string) =>
    request<{ success: boolean; assistants: Assistant[]; count: number }>('/api/doctor/assistants', { token }),

  createPrescription: (token: string, data: CreatePrescriptionData) =>
    request<{ success: boolean; prescription: Prescription; whatsAppUrl?: string }>('/api/doctor/prescription', {
      method: 'POST',
      body: data,
      token
    }),

  getPrescription: (token: string, tokenId: number) =>
    request<{ success: boolean; prescription: Prescription | null }>(`/api/doctor/prescription/${tokenId}`, { token }),

  getPatientPrescriptions: (token: string, patientId: number) =>
    request<{ success: boolean; prescriptions: Prescription[]; count: number }>(`/api/doctor/patient/${patientId}/prescriptions`, { token })
}

// Patients
export const patientsApi = {
  search: (token: string, phone?: string, name?: string) =>
    request<{ success: boolean; patients: Patient[] }>(`/api/patients?${phone ? `phone=${phone}` : `name=${name}`}`, { token }),

  getById: (token: string, id: number) =>
    request<{ success: boolean; patient: Patient }>(`/api/patients/${id}`, { token }),

  create: (token: string, data: { name: string; phone: string }) =>
    request<{ success: boolean; patient: Patient }>('/api/patients', {
      method: 'POST',
      body: data,
      token
    })
}

// Admin
export const adminApi = {
  getUsers: (token: string, status?: string, role?: string) =>
    request<{ success: boolean; users: User[]; total: number }>(`/api/admin/users?${status ? `status=${status}&` : ''}${role ? `role=${role}` : ''}`, { token }),

  approveUser: (token: string, id: number, role?: string) =>
    request<{ success: boolean; user: User }>(`/api/admin/users/${id}/approve`, {
      method: 'PATCH',
      body: { role },
      token
    }),

  blockUser: (token: string, id: number) =>
    request<{ success: boolean }>(`/api/admin/users/${id}/block`, {
      method: 'PATCH',
      token
    }),

  unblockUser: (token: string, id: number) =>
    request<{ success: boolean }>(`/api/admin/users/${id}/unblock`, {
      method: 'PATCH',
      token
    }),

  getClinics: (token: string) =>
    request<{ success: boolean; clinics: Clinic[] }>('/api/admin/clinics', { token }),

  createClinic: (token: string, data: { name: string; address?: string; phone?: string }) =>
    request<{ success: boolean; clinic: Clinic }>('/api/admin/clinics', {
      method: 'POST',
      body: data,
      token
    }),

  assignDoctorToClinic: (token: string, clinicId: number, userId: number) =>
    request<{ success: boolean }>('/api/admin/clinic-doctors', {
      method: 'POST',
      body: { clinicId, userId },
      token
    }),

  assignAssistantToDoctor: (token: string, doctorId: number, assistantId: number) =>
    request<{ success: boolean }>('/api/admin/doctor-assistants', {
      method: 'POST',
      body: { doctorId, assistantId },
      token
    })
}

// Reports
export const reportsApi = {
  getDaily: (token: string, date?: string, doctorId?: number) => {
    const params = new URLSearchParams()
    if (date) params.append('date', date)
    if (doctorId) params.append('doctorId', doctorId.toString())
    return request<{ success: boolean; report: DailyReport }>(`/api/reports/daily?${params}`, { token })
  },

  getHistory: (token: string, startDate: string, endDate: string, doctorId?: number) => {
    const params = new URLSearchParams({ startDate, endDate })
    if (doctorId) params.append('doctorId', doctorId.toString())
    return request<{ success: boolean; history: ReportSummary[] }>(`/api/reports/history?${params}`, { token })
  },

  downloadCSV: async (token: string, date?: string, doctorId?: number) => {
    const params = new URLSearchParams()
    if (date) params.append('date', date)
    if (doctorId) params.append('doctorId', doctorId.toString())

    const response = await fetch(`${API_URL}/api/reports/download?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!response.ok) {
      throw new Error('Failed to download report')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const now = new Date()
    const localYMD = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    a.download = `report-${date || localYMD}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }
}

// Public (no auth)
export const publicApi = {
  getQueue: (queueId: number) =>
    request<{ success: boolean; clinicName: string; doctorName: string; status: string; currentToken: { tokenNumber: number; status: string } | null; waitingCount: number; tokens: { tokenNumber: number; status: string; isEmergency: boolean }[] }>(`/api/public/queue/${queueId}`),

  getToken: (tokenId: number) =>
    request<{ success: boolean; tokenNumber: number; status: string; position: number | null; currentToken: number | null; estimatedWait: string | null; queueStatus: string; clinicName: string; doctorName: string }>(`/api/public/token/${tokenId}`)
}

// Types
export interface User {
  id: number
  clerkId?: string
  name: string
  email: string
  phone?: string
  role: 'admin' | 'doctor' | 'assistant'
  status: 'pending' | 'approved' | 'blocked'
  clinics?: Clinic[]
  doctors?: User[]
}

export interface Clinic {
  id: number
  name: string
  address?: string
  phone?: string
  openTime?: string
  closeTime?: string
}

export interface Queue {
  id: number
  clinicId: number
  doctorId: number
  date: string
  status: 'open' | 'paused' | 'closed'
  currentTokenId?: number
  lastTokenNumber: number
  clinic?: Clinic
  doctor?: User
  tokens?: Token[]
  currentToken?: Token
}

export interface Token {
  id: number
  queueId: number
  patientId: number
  tokenNumber: number
  status: 'waiting' | 'called' | 'in_progress' | 'completed' | 'skipped' | 'no_show' | 'cancelled'
  isEmergency: boolean
  position: number
  calledAt?: string
  startedAt?: string
  completedAt?: string
  patient?: Patient
}

export interface Patient {
  id: number
  name: string
  phone: string
  lastVisit?: string
  visitHistory?: { date: string; tokenNumber: number }[]
}

export interface Assistant {
  id: number
  name: string
  email: string
  phone?: string
  status: 'pending' | 'approved' | 'blocked'
  assignedAt: string
}

export interface MedicineItem {
  name: string
  dosage: string
  duration: string
  instructions: string
}

export interface Prescription {
  id: number
  tokenId: number
  patientId: number
  doctorId: number
  medicines: MedicineItem[]
  notes?: string
  imageUrl?: string
  sentViaWhatsApp: boolean
  createdAt: string
  updatedAt: string
  patient?: Patient
  doctor?: { id: number; name: string; email: string }
}

export interface CreatePrescriptionData {
  tokenId: number
  medicines: MedicineItem[]
  notes?: string
  imageUrl?: string
  sendWhatsApp: boolean
}

export interface QueueStats {
  total: number
  waiting: number
  completed: number
  inProgress?: number
  skipped: number
  noShow: number
  cancelled?: number
}

export interface ReportToken {
  id: number
  tokenNumber: number
  patientName: string
  patientPhone: string
  status: string
  isEmergency: boolean
  addedAt: string | null
  calledAt: string | null
  startedAt: string | null
  completedAt: string | null
  waitTime: string | null
  consultationTime: string | null
}

export interface ReportSummary {
  date: string
  queueId: number
  queueStatus: string
  clinicName?: string
  total: number
  completed: number
  skipped: number
  noShow: number
  cancelled: number
  avgWaitTime?: string | null
  avgConsultationTime?: string | null
}

export interface DailyReport {
  date: string
  queueId?: number
  queueStatus?: string
  clinic: { id: number; name: string; address?: string } | null
  doctor: { id: number; name: string } | null
  summary: {
    total: number
    completed: number
    skipped: number
    noShow: number
    cancelled: number
    waiting: number
    inProgress?: number
    avgWaitTime: string | null
    avgConsultationTime: string | null
  }
  tokens: ReportToken[]
}
