import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Building2, Mail, MapPin, UserRound } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import profileService from '../../services/profileService'
import ContactFormModal from './components/ContactFormModal'
import EmergencyContactList from './components/EmergencyContactList'
import ProfileForm from './components/ProfileForm'
import {
  initialContactForm,
  initialProfileForm,
  mapContactFormToPayload,
  mapProfileFormToPayload,
  normalizeProfileResponse,
  toContactForm,
  toProfileForm,
} from './profile.helpers'

const ProfilePage = () => {
  const { employeeId } = useParams()
  const isAdministrativeView = Boolean(employeeId)
  const [profileData, setProfileData] = useState(null)
  const [profileForm, setProfileForm] = useState(initialProfileForm)
  const [profileErrors, setProfileErrors] = useState({})
  const [selectedContact, setSelectedContact] = useState(null)
  const [contactForm, setContactForm] = useState(initialContactForm)
  const [contactErrors, setContactErrors] = useState({})
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingContact, setSavingContact] = useState(false)
  const [pageError, setPageError] = useState('')
  const [toast, setToast] = useState(null)

  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 3000)
  }, [])

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setPageError('')

    try {
      const response = isAdministrativeView
        ? await profileService.getByEmployee(employeeId)
        : await profileService.getMine()
      const normalized = normalizeProfileResponse(response)
      setProfileData(normalized)
      setProfileForm(toProfileForm(normalized))
    } catch (error) {
      setProfileData(null)
      setPageError(error.response?.data?.message || 'Gagal memuat profil karyawan.')
    } finally {
      setLoading(false)
    }
  }, [employeeId, isAdministrativeView])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const changeProfile = (event) => {
    const { name, value } = event.target
    setProfileForm((current) => ({ ...current, [name]: value }))
    setProfileErrors((current) => ({ ...current, [name]: undefined }))
  }

  const submitProfile = async (event) => {
    event.preventDefault()
    setSavingProfile(true)
    setProfileErrors({})

    try {
      const payload = mapProfileFormToPayload(profileForm)
      const response = isAdministrativeView
        ? await profileService.updateByEmployee(employeeId, payload)
        : await profileService.updateMine(payload)
      const normalized = normalizeProfileResponse(response)
      setProfileData(normalized)
      setProfileForm(toProfileForm(normalized))
      notify('Profil berhasil diperbarui.')
    } catch (error) {
      setProfileErrors(error.response?.data?.errors || {})
      notify(error.response?.data?.message || 'Gagal memperbarui profil.', 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  const openCreateContact = () => {
    setSelectedContact(null)
    setContactForm(initialContactForm)
    setContactErrors({})
    setContactModalOpen(true)
  }

  const openEditContact = (contact) => {
    setSelectedContact(contact)
    setContactForm(toContactForm(contact))
    setContactErrors({})
    setContactModalOpen(true)
  }

  const changeContact = (event) => {
    const { name, value, type, checked } = event.target
    setContactForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setContactErrors((current) => ({ ...current, [name]: undefined }))
  }

  const submitContact = async (event) => {
    event.preventDefault()
    setSavingContact(true)
    setContactErrors({})

    try {
      const payload = mapContactFormToPayload(contactForm)
      if (isAdministrativeView) {
        if (selectedContact) await profileService.updateEmployeeContact(employeeId, selectedContact.id, payload)
        else await profileService.createEmployeeContact(employeeId, payload)
      } else if (selectedContact) {
        await profileService.updateMineContact(selectedContact.id, payload)
      } else {
        await profileService.createMineContact(payload)
      }

      setContactModalOpen(false)
      notify(selectedContact ? 'Kontak darurat berhasil diperbarui.' : 'Kontak darurat berhasil ditambahkan.')
      await loadProfile()
    } catch (error) {
      setContactErrors(error.response?.data?.errors || {})
      notify(error.response?.data?.message || 'Gagal menyimpan kontak darurat.', 'error')
    } finally {
      setSavingContact(false)
    }
  }

  const deleteContact = async (contact) => {
    if (!window.confirm(`Hapus kontak darurat ${contact.name}?`)) return

    try {
      if (isAdministrativeView) await profileService.deleteEmployeeContact(employeeId, contact.id)
      else await profileService.deleteMineContact(contact.id)
      notify('Kontak darurat berhasil dihapus.')
      await loadProfile()
    } catch (error) {
      notify(error.response?.data?.message || 'Gagal menghapus kontak darurat.', 'error')
    }
  }

  if (loading) {
    return <div className="rounded-xl border bg-white p-10 text-center text-gray-500 shadow-sm">Memuat profil karyawan...</div>
  }

  if (pageError || !profileData) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="font-medium text-red-800">{pageError || 'Profil tidak tersedia.'}</p>
        <button type="button" onClick={loadProfile} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white">Coba Lagi</button>
      </div>
    )
  }

  const { employee, emergency_contacts: contacts, completion } = profileData
  const percentage = Math.max(0, Math.min(100, Number(completion?.percentage || 0)))

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          {isAdministrativeView && (
            <Link to="/employee" aria-label="Kembali ke daftar karyawan" className="mt-1 rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isAdministrativeView ? 'Profil Karyawan' : 'Profil Saya'}</h1>
            <p className="mt-1 text-gray-600">Lengkapi data pribadi dan kontak darurat.</p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100">
              <UserRound className="h-7 w-7 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-gray-900">{employee.name || '-'}</h2>
              <p className="mt-1 text-sm text-gray-500">{employee.employee_number || '-'}</p>
              <div className="mt-4 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                <Summary icon={Mail} text={employee.work_email || '-'} />
                <Summary icon={Building2} text={employee.department?.name || 'Tanpa Departemen'} />
                <Summary icon={UserRound} text={employee.position?.name || 'Tanpa Jabatan'} />
                <Summary icon={MapPin} text={employee.branch?.name || 'Tanpa Cabang'} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600">Kelengkapan Profil</p><p className="mt-1 text-3xl font-bold text-indigo-600">{percentage}%</p></div>
            <div className="text-right text-xs text-gray-500"><p>{completion.completed_fields?.length || 0} dari {completion.total_fields || 12}</p><p>indikator lengkap</p></div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${percentage}%` }} /></div>
          {completion.missing_fields?.length > 0 && <p className="mt-3 text-xs text-gray-500">Masih perlu dilengkapi: {completion.missing_fields.slice(0, 3).join(', ')}{completion.missing_fields.length > 3 ? ', ...' : ''}</p>}
        </div>
      </section>

      <ProfileForm formData={profileForm} errors={profileErrors} isSubmitting={savingProfile} onChange={changeProfile} onSubmit={submitProfile} isAdministrativeView={isAdministrativeView} />
      <EmergencyContactList contacts={contacts} onCreate={openCreateContact} onEdit={openEditContact} onDelete={deleteContact} />

      {contactModalOpen && <ContactFormModal contact={selectedContact} formData={contactForm} errors={contactErrors} isSubmitting={savingContact} onChange={changeContact} onClose={() => !savingContact && setContactModalOpen(false)} onSubmit={submitContact} />}
      {toast && <div className={`fixed right-4 top-4 z-[60] max-w-sm rounded-lg px-5 py-3 text-sm text-white shadow-lg ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>{toast.message}</div>}
    </div>
  )
}

const Summary = ({ icon: Icon, text }) => <div className="flex min-w-0 items-center gap-2"><Icon className="h-4 w-4 shrink-0 text-gray-400" /><span className="truncate">{text}</span></div>

export default ProfilePage
