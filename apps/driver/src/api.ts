const BASE = '/api/driver'

function getToken() {
  return localStorage.getItem('driver_token') || ''
}

function headers() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }
}

async function req(method: string, path: string, body?: any) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error?.message || 'Terjadi kesalahan')
  return data.data
}

export const api = {
  login: (phone: string) => req('POST', '/login', { phone }),
  me: () => req('GET', '/me'),
  setStatus: (status: string) => req('PUT', '/status', { status }),
  getOrders: () => req('GET', '/orders'),
  getHistory: () => req('GET', '/history'),
  completeOrder: (id: string) => req('PUT', `/orders/${id}/complete`),
}
