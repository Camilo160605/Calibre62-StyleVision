import { APPOINTMENTS, SERVICES, STAFF } from '../data/mock.js'

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

const clone = (value) => JSON.parse(JSON.stringify(value))

const initialsFromName = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

const normalizeStaffMember = (member) => ({
  ...member,
  initials: member.initials || member.avatar || initialsFromName(member.name),
})

const fallbackState = {
  appointments: APPOINTMENTS.map((appointment) => ({ ...appointment })),
  services: SERVICES.map((service) => ({ ...service })),
  staff: STAFF.map((member) => normalizeStaffMember(member)),
}

const fallbackIds = {
  service: Math.max(...fallbackState.services.map((service) => service.id), 0) + 1,
  staff: Math.max(...fallbackState.staff.map((member) => member.id), 0) + 1,
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

function getFallbackDashboard() {
  const servicePrices = Object.fromEntries(fallbackState.services.map((service) => [service.name, service.price]))
  const todayRevenue = fallbackState.appointments.reduce(
    (total, appointment) => total + (servicePrices[appointment.service] || 0),
    0,
  )
  const todayClients = fallbackState.appointments.length
  const avgTicket = todayClients ? Math.round(todayRevenue / todayClients) : 0
  const occupancy = todayClients
    ? Math.round((fallbackState.appointments.filter((appointment) => appointment.status !== 'pending').length / todayClients) * 100)
    : 0
  const pendingCheckins = fallbackState.appointments.filter((appointment) => appointment.status === 'confirmed').length
  const activeProfessionals = fallbackState.staff.filter((member) => member.status === 'active').length

  return {
    stats: {
      todayRevenue,
      todayClients,
      avgTicket,
      occupancy,
      pendingCheckins,
      activeProfessionals,
    },
    appointments: clone(fallbackState.appointments.slice(0, 6)),
    staff: clone(fallbackState.staff),
  }
}

function withFallback(remoteCall, fallbackCall) {
  return remoteCall().catch(() => fallbackCall())
}

export function getLocalDashboardSnapshot() {
  return getFallbackDashboard()
}

export function getLocalAppointmentsSnapshot() {
  return clone(fallbackState.appointments)
}

export function getLocalServicesSnapshot() {
  return clone(fallbackState.services)
}

export function getLocalStaffSnapshot() {
  return clone(fallbackState.staff)
}

export function getDashboard() {
  return withFallback(
    () => request('/dashboard'),
    () => Promise.resolve(getFallbackDashboard()),
  )
}

export function getAppointments() {
  return withFallback(
    () => request('/appointments'),
    () => Promise.resolve(getLocalAppointmentsSnapshot()),
  )
}

export function updateAppointmentStatus(id, status) {
  return withFallback(
    () =>
      request(`/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    () => {
      const appointment = fallbackState.appointments.find((item) => item.id === id)
      if (!appointment) {
        throw new Error('Appointment not found')
      }

      appointment.status = status
      return Promise.resolve(clone(appointment))
    },
  )
}

export function getServices() {
  return withFallback(
    () => request('/services'),
    () => Promise.resolve(getLocalServicesSnapshot()),
  )
}

export function createService(payload) {
  return withFallback(
    () =>
      request('/services', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    () => {
      const service = {
        id: fallbackIds.service++,
        ...payload,
        popular: false,
      }

      fallbackState.services.push(service)
      return Promise.resolve(clone(service))
    },
  )
}

export function deleteService(id) {
  return withFallback(
    () =>
      request(`/services/${id}`, {
        method: 'DELETE',
      }),
    () => {
      fallbackState.services = fallbackState.services.filter((service) => service.id !== id)
      return Promise.resolve(null)
    },
  )
}

export function getStaff() {
  return withFallback(
    () => request('/staff'),
    () => Promise.resolve(getLocalStaffSnapshot()),
  )
}

export function createStaff(payload) {
  return withFallback(
    () =>
      request('/staff', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    () => {
      const staffMember = {
        id: fallbackIds.staff++,
        ...payload,
        initials: initialsFromName(payload.name),
        status: 'active',
        clients: 0,
        rating: 5,
      }

      fallbackState.staff.push(staffMember)
      return Promise.resolve(clone(staffMember))
    },
  )
}

export function updateStaffStatus(id, status) {
  return withFallback(
    () =>
      request(`/staff/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    () => {
      const staffMember = fallbackState.staff.find((member) => member.id === id)
      if (!staffMember) {
        throw new Error('Staff member not found')
      }

      staffMember.status = status
      return Promise.resolve(clone(staffMember))
    },
  )
}
