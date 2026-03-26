import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { Truck, Phone } from 'lucide-react'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await api.login(phone)
      localStorage.setItem('driver_token', data.token)
      localStorage.setItem('driver_name', data.driver.name)
      localStorage.setItem('driver_id', data.driver.id)
      navigate('/driver/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500 rounded-[28px] shadow-xl shadow-orange-200 mb-5">
            <Truck size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Driver App</h1>
          <p className="text-gray-500 font-medium mt-1">Warung BuJo</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-[32px] shadow-xl shadow-gray-100 p-8 space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
              Nomor HP Terdaftar
            </label>
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                autoFocus
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="08xxx / 628xxx"
                className="w-full h-14 pl-12 pr-4 bg-gray-50 rounded-2xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-600 font-bold text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-orange-500 text-white rounded-2xl text-base font-black uppercase tracking-widest shadow-lg shadow-orange-200 hover:bg-orange-600 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </button>

          <p className="text-center text-xs text-gray-400 font-medium leading-relaxed">
            Belum terdaftar? Hubungi admin Warung BuJo untuk mendaftarkan akun driver kamu.
          </p>
        </form>
      </div>
    </div>
  )
}
