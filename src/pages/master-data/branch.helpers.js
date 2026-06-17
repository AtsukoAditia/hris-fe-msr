export const initialBranchForm = {
  code: '',
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  radius_meters: '100',
  timezone: 'Asia/Jakarta',
  is_active: true,
}

export const normalizeBranch = (branch) => {
  if (!branch) return null

  return {
    id: branch.id,
    code: branch.code || '',
    name: branch.name || '',
    address: branch.address || '',
    latitude: branch.latitude ?? '',
    longitude: branch.longitude ?? '',
    radius_meters: Number(branch.radius_meters ?? 100),
    timezone: branch.timezone || 'Asia/Jakarta',
    is_active: branch.is_active !== false,
    employees_count: Number(branch.employees_count ?? 0),
  }
}

export const normalizeBranchRows = (response) => {
  const payload = response?.data?.data ?? response?.data ?? response
  if (!Array.isArray(payload)) return []

  return payload.map(normalizeBranch).filter(Boolean)
}

export const mapBranchFormToPayload = (formData) => ({
  code: formData.code?.trim().toUpperCase(),
  name: formData.name?.trim(),
  address: formData.address?.trim() || null,
  latitude: formData.latitude === '' ? null : Number(formData.latitude),
  longitude: formData.longitude === '' ? null : Number(formData.longitude),
  radius_meters: Number(formData.radius_meters || 100),
  timezone: formData.timezone?.trim() || 'Asia/Jakarta',
  is_active: Boolean(formData.is_active),
})
