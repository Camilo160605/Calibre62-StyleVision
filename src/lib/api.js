import { APPOINTMENTS, SERVICES, STAFF } from '../data/mock.js'

/*
  Actividad correspondiente a la guia de la semana 5.
  Este modulo centraliza el acceso a datos y deja evidencia de:
  - listas de objetos como simulacion de base de datos local
  - transformacion de cadenas con split(), join() y replace()
  - validacion basica de entradas antes de persistir informacion
  - manejo de errores con try/catch para activar el modo fallback
*/

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

const clone = (value) => JSON.parse(JSON.stringify(value))

const normalizeTextValue = (value = '') => value.replace(/\s+/g, ' ').trim()

const initialsFromName = (name = '') =>
  normalizeTextValue(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

const normalizeStaffMember = (member) => ({
  ...member,
  name: normalizeTextValue(member.name),
  role: normalizeTextValue(member.role),
  specialty: normalizeTextValue(member.specialty),
  initials: member.initials || member.avatar || initialsFromName(member.name),
})

// Estas listas de objetos funcionan como una base de datos local sencilla.
// Cada objeto conserva pares clave:valor equivalentes al uso academico de
// diccionarios para representar entidades con varios atributos.
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
  // Se construye un indice clave:valor para consultar precios por nombre sin
  // recorrer la lista completa de servicios cada vez que se procesa una cita.
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

async function withFallback(remoteCall, fallbackCall) {
  // `try/catch` permite mantener funcional la interfaz aunque la API remota
  // falle. Si ocurre un error, el sistema continua con los datos locales.
  try {
    return await remoteCall()
  } catch (error) {
    return fallbackCall(error)
  }
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
  const normalizedPayload = {
    ...payload,
    name: normalizeTextValue(payload.name),
  }

  return withFallback(
    () =>
      request('/services', {
        method: 'POST',
        body: JSON.stringify(normalizedPayload),
      }),
    () => {
      const service = {
        id: fallbackIds.service++,
        ...normalizedPayload,
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
  const normalizedPayload = {
    ...payload,
    name: normalizeTextValue(payload.name),
    role: normalizeTextValue(payload.role),
    specialty: normalizeTextValue(payload.specialty),
  }

  return withFallback(
    () =>
      request('/staff', {
        method: 'POST',
        body: JSON.stringify(normalizedPayload),
      }),
    () => {
      const staffMember = {
        id: fallbackIds.staff++,
        ...normalizedPayload,
        initials: initialsFromName(normalizedPayload.name),
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
