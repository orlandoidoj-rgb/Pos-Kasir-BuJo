import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { Truck, LogOut, Package, CheckCircle, AlertCircle, Clock, MapPin, Phone } from 'lucide-react'

interface OrderItem {
  productName: string
  qty: number
  subtotal: string
}

interface Order {
  id: string
  orderNumber: string
  deliveryAddress: string
  deliveryNotes: string
  total: string
  customer: { name: string; phone: string }
  items: OrderItem[]
  createdAt: string
}

function fmt(n: string | number) {
  return 'Rp ' + Number(n).toLocaleString('id-ID')
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [history, setHistory] = useState<Order[]>([])
  const [driverStatus, setDriverStatus] = useState<'available' | 'offline'>('available')
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState<string | null>(null)

  const driverName = localStorage.getItem('driver_name') || 'Driver'

  const loadData = useCallback(async () => {
    try {
      const [ordersData, historyData, meData] = await Promise.all([
        api.getOrders().catch(() => []),
        api.getHistory().catch(() => []),
        api.me().catch(() => null),
      ])
      setOrders(ordersData)
      setHistory(historyData)
      if (meData) setDriverStatus(meData.status === 'available' ? 'available' : 'offline')
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [loadData])

  const handleStatusToggle = async () => {
    const newStatus = driverStatus === 'available' ? 'offline' : 'available'
    try {
      await api.setStatus(newStatus)
      setDriverStatus(newStatus)
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleComplete = async (orderId: string) => {
    if (!confirm('Yakin pesanan sudah diantar?')) return
    setCompleting(orderId)
    try {
      await api.completeOrder(orderId)
      await loadData()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setCompleting(null)
    }
  }

  const handleLogout = () => {
    if (confirm('Keluar dari Driver App?')) {
      localStorage.removeItem('driver_token')
      localStorage.removeItem('driver_name')
      localStorage.removeItem('driver_id')
      navigate('/driver/login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 font-bold">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center">
            <Truck size={20} className="text-white" />
          </div>
          <div>
            <p className="font-black text-gray-900 text-sm">{driverName}</p>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${driverStatus === 'available' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              <span className="text-xs font-bold text-gray-500">
                {driverStatus === 'available' ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleStatusToggle}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              driverStatus === 'available'
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
            }`}
          >
            {driverStatus === 'available' ? 'Go Offline' : 'Go Online'}
          </button>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-gray-700">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-10">
        {/* Active Orders */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Package size={16} className="text-orange-500" />
            <h2 className="font-black text-gray-900 text-sm uppercase tracking-widest">
              Orderan Aktif
              {orders.length > 0 && (
                <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {orders.length}
                </span>
              )}
            </h2>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-[24px] p-8 text-center border border-gray-100">
              <div className="text-4xl mb-3">🛵</div>
              <p className="font-black text-gray-700">Tidak ada orderan aktif</p>
              <p className="text-sm text-gray-400 mt-1 font-medium">
                {driverStatus === 'offline' ? 'Ubah status ke Online untuk menerima orderan' : 'Tunggu kasir mengassign orderan untukmu'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black text-orange-500 uppercase tracking-widest">
                        #{order.orderNumber}
                      </span>
                      <span className="bg-orange-100 text-orange-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
                        Sedang Diantar
                      </span>
                    </div>

                    <h3 className="font-black text-gray-900 text-lg">{order.customer?.name || 'Customer'}</h3>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-bold text-gray-700">{order.deliveryAddress}</p>
                          {order.deliveryNotes && (
                            <p className="text-xs text-gray-400 font-medium mt-0.5">Patokan: {order.deliveryNotes}</p>
                          )}
                        </div>
                      </div>
                      {order.customer?.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={14} className="text-gray-400 shrink-0" />
                          <p className="font-bold text-gray-600">{order.customer.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5 bg-gray-50 space-y-1.5">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{item.qty}x {item.productName}</span>
                        <span className="font-bold text-gray-900">{fmt(item.subtotal)}</span>
                      </div>
                    ))}
                    <div className="pt-2 mt-1 border-t border-gray-200 flex justify-between">
                      <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Total</span>
                      <span className="font-black text-gray-900">{fmt(order.total)}</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <a
                        href={`https://wa.me/${order.customer?.phone}?text=${encodeURIComponent(`Halo ${order.customer?.name}, saya kurir Warung BuJo. Pesanan #${order.orderNumber} sedang dalam perjalanan ke alamat Anda.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 h-12 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-black border border-emerald-100 hover:bg-emerald-100 transition-all"
                      >
                        <Phone size={16} /> Chat Customer
                      </a>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(order.deliveryAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 h-12 bg-blue-50 text-blue-700 rounded-2xl text-sm font-black border border-blue-100 hover:bg-blue-100 transition-all"
                      >
                        <MapPin size={16} /> Buka Maps
                      </a>
                    </div>

                    <button
                      onClick={() => handleComplete(order.id)}
                      disabled={completing === order.id}
                      className="w-full h-16 bg-emerald-500 text-white rounded-2xl text-base font-black uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-3"
                    >
                      <CheckCircle size={22} />
                      {completing === order.id ? 'Memproses...' : 'SELESAI ANTAR'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* History */}
        {history.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-gray-400" />
              <h2 className="font-black text-gray-900 text-sm uppercase tracking-widest">
                Selesai Hari Ini
                <span className="ml-2 bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{history.length}</span>
              </h2>
            </div>
            <div className="bg-white rounded-[24px] border border-gray-100 divide-y divide-gray-50">
              {history.map(order => (
                <div key={order.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-black text-gray-900 text-sm">#{order.orderNumber}</p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{order.deliveryAddress?.slice(0, 40)}...</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900 text-sm">{fmt(order.total)}</p>
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <CheckCircle size={12} className="text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-500">Selesai</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
