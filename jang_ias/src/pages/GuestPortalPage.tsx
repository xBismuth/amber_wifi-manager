import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { opsApi } from '../lib/opsApi'

export function GuestPortalPage() {
  const [params] = useSearchParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [voucher, setVoucher] = useState('')
  const [aup, setAup] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ id: string; applicationStatus: string; networkAuthorized: boolean; message: string } | null>(null)
  const [poll, setPoll] = useState<Record<string, unknown> | null>(null)
  const mac = params.get('id') || params.get('mac') || ''
  const ssid = params.get('ssid') || ''

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const r = (await opsApi.registerGuest({
        name,
        email,
        voucher: voucher || undefined,
        aupAccepted: true,
        mac: mac || undefined,
        deviceName: navigator.userAgent.slice(0, 80),
      })) as { id: string; applicationStatus: string; networkAuthorized: boolean; message: string }
      setResult(r)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    }
  }

  useEffect(() => {
    if (!result?.id) return
    const t = window.setInterval(() => {
      void opsApi.guestStatus(result.id).then((row) => setPoll(row as Record<string, unknown>))
    }, 4000)
    return () => window.clearInterval(t)
  }, [result?.id])

  const status = String(poll?.status ?? result?.applicationStatus ?? '')
  const net = Boolean(poll?.network_authorized ?? result?.networkAuthorized)

  return (
    <div className="min-h-svh bg-[#f1efea] text-[#261b13]">
      <header className="bg-[#2a1f17] px-5 py-6 text-[#efe7de]">
        <p className="text-xs uppercase tracking-[0.2em] text-[#e8a317]">Amber Cafe</p>
        <h1 className="mt-2 text-2xl font-semibold">Guest Wi-Fi</h1>
        <p className="mt-1 text-sm text-[#cfc4b8]">{ssid ? `Network ${ssid}` : 'AmberCafe-Guest'}</p>
      </header>
      <main className="mx-auto max-w-md px-5 py-8">
        {!result ? (
          <form onSubmit={onSubmit} className="space-y-4 rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-[#5b4f45]">
              Welcome. Completing this form records your request. It does not by itself put your device on the internet.
            </p>
            <label className="block text-sm">
              Name
              <input className="mt-1 w-full rounded-md border border-[#e3ded6] px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="block text-sm">
              Email (optional)
              <input className="mt-1 w-full rounded-md border border-[#e3ded6] px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            </label>
            <label className="block text-sm">
              Voucher code (only if the cafe issued one)
              <input className="mt-1 w-full rounded-md border border-[#e3ded6] px-3 py-2" value={voucher} onChange={(e) => setVoucher(e.target.value)} />
            </label>
            {mac && <p className="font-mono text-xs text-[#7d7167]">Device id from portal redirect: {mac}</p>}
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={aup} onChange={(e) => setAup(e.target.checked)} required />
              <span>
                I accept Amber Cafe’s Wi-Fi acceptable-use policy and privacy notice. No unlawful activity, no attacking other
                guests, and no attempt to reach staff or payment systems.
              </span>
            </label>
            {error && <p className="text-sm text-[#ad3526]">{error}</p>}
            <button disabled={!aup} className="w-full rounded-md bg-[#2a1f17] py-3 font-semibold text-white disabled:opacity-50">
              Request access
            </button>
          </form>
        ) : (
          <section className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Request {status || 'received'}</h2>
            <p className="text-sm text-[#5b4f45]">{String(poll?.network_message ?? result.message)}</p>
            <dl className="text-sm">
              <div className="flex justify-between gap-4 border-t border-[#e3ded6] py-2">
                <dt>Application status</dt>
                <dd className="font-semibold">{status}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-[#e3ded6] py-2">
                <dt>Network authorization</dt>
                <dd className="font-semibold">{net ? 'Confirmed by provider' : 'Not confirmed'}</dd>
              </div>
            </dl>
            {status === 'pending' && <p className="text-sm">A staff member still needs to approve this request.</p>}
            {status === 'approved' && !net && (
              <p className="text-sm">Staff approved the request in the app. Your phone is online only if the access point confirmed it.</p>
            )}
            {status === 'rejected' && <p className="text-sm">This request was rejected. Ask staff if you need another attempt.</p>}
          </section>
        )}
        <p className="mt-6 text-center text-xs text-[#7d7167]">
          Staff: <Link to="/login">sign in</Link>
        </p>
      </main>
    </div>
  )
}
