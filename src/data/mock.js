// ── STAFF ──────────────────────────────────────────────────────────────────
export const STAFF = [
  { id: 1, name: 'Miguel Ángel', role: 'Barbero Senior', specialty: 'Fade & Barba', avatar: 'MA', status: 'active', clients: 312, rating: 4.9 },
  { id: 2, name: 'Laura García',  role: 'Estilista',      specialty: 'Color & Tratamientos', avatar: 'LG', status: 'active', clients: 198, rating: 4.8 },
  { id: 3, name: 'Carlos Díaz',   role: 'Barbero',         specialty: 'Clásico & Diseño', avatar: 'CD', status: 'active', clients: 241, rating: 4.7 },
  { id: 4, name: 'Sofía Ramos',   role: 'Estilista',      specialty: 'Cortes Modernos', avatar: 'SR', status: 'off',    clients: 155, rating: 4.9 },
]

// ── SERVICES ───────────────────────────────────────────────────────────────
export const SERVICES = [
  { id: 1, name: 'Corte Clásico',          category: 'Corte',     price: 35000,  duration: 30,  popular: true },
  { id: 2, name: 'Fade + Diseño',           category: 'Corte',     price: 50000,  duration: 45,  popular: true },
  { id: 3, name: 'Afeitado Tradicional',    category: 'Barba',     price: 30000,  duration: 30,  popular: false },
  { id: 4, name: 'Arreglo de Barba',        category: 'Barba',     price: 25000,  duration: 20,  popular: true },
  { id: 5, name: 'Corte + Barba',           category: 'Combo',     price: 70000,  duration: 60,  popular: true },
  { id: 6, name: 'Keratina Express',        category: 'Tratamiento', price: 120000, duration: 90,  popular: false },
  { id: 7, name: 'Coloración Completa',     category: 'Color',     price: 150000, duration: 120, popular: false },
  { id: 8, name: 'Balayage',               category: 'Color',     price: 200000, duration: 150, popular: false },
  { id: 9, name: 'Hidratación Profunda',    category: 'Tratamiento', price: 80000,  duration: 60,  popular: false },
  { id: 10, name: 'Pompadour Premium',      category: 'Corte',     price: 60000,  duration: 50,  popular: false },
]

// ── APPOINTMENTS ──────────────────────────────────────────────────────────
export const APPOINTMENTS = [
  { id: 1,  client: 'Sebastián Ruiz',   initials: 'SR', service: 'Fade + Diseño',        barber: 'Miguel Ángel', time: '09:00', duration: 45, status: 'confirmed', visits: 14 },
  { id: 2,  client: 'Valentina Torres', initials: 'VT', service: 'Coloración Completa',  barber: 'Laura García',  time: '09:30', duration: 120, status: 'confirmed', visits: 7 },
  { id: 3,  client: 'Andrés Molina',    initials: 'AM', service: 'Afeitado Tradicional', barber: 'Carlos Díaz',   time: '10:00', duration: 30, status: 'checkin',   visits: 22 },
  { id: 4,  client: 'Camila Herrera',   initials: 'CH', service: 'Hidratación Profunda', barber: 'Laura García',  time: '10:30', duration: 60, status: 'confirmed', visits: 3 },
  { id: 5,  client: 'Diego Vargas',     initials: 'DV', service: 'Corte + Barba',        barber: 'Miguel Ángel', time: '11:00', duration: 60, status: 'confirmed', visits: 8 },
  { id: 6,  client: 'Mariana López',    initials: 'ML', service: 'Balayage',             barber: 'Laura García',  time: '11:30', duration: 150, status: 'confirmed', visits: 5 },
  { id: 7,  client: 'Julián Pérez',     initials: 'JP', service: 'Corte Clásico',        barber: 'Carlos Díaz',   time: '12:00', duration: 30, status: 'pending',   visits: 1 },
  { id: 8,  client: 'Natalia Gómez',    initials: 'NG', service: 'Keratina Express',     barber: 'Sofía Ramos',   time: '13:00', duration: 90, status: 'pending',   visits: 11 },
  { id: 9,  client: 'Ricardo Silva',    initials: 'RS', service: 'Pompadour Premium',    barber: 'Miguel Ángel', time: '14:00', duration: 50, status: 'confirmed', visits: 6 },
  { id: 10, client: 'Isabella Mora',    initials: 'IM', service: 'Arreglo de Barba',     barber: 'Carlos Díaz',   time: '14:30', duration: 20, status: 'confirmed', visits: 9 },
]

export const STATS = {
  todayRevenue: 875000,
  todayClients: 10,
  avgTicket: 87500,
  occupancy: 82,
}
