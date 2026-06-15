export const initialPositionForm = {
  department_id: '',
  code: '',
  name: '',
  description: '',
  is_active: true,
}

export const normalizePosition = (position) => {
  if (!position) return null

  return {
    id: position.id,
    department_id: position.department_id || position.department?.id || '',
    code: position.code || '',
    name: position.name || '',
    description: position.description || '',
    is_active: position.is_active !== false,
    department: position.department || null,
  }
}

export const normalizePositionRows = (response) => {
  const payload = response?.data?.data ?? response?.data ?? response
  if (!Array.isArray(payload)) return []

  return payload.map(normalizePosition).filter(Boolean)
}

export const mapPositionFormToPayload = (formData) => ({
  department_id: formData.department_id ? Number(formData.department_id) : null,
  code: formData.code?.trim().toUpperCase(),
  name: formData.name?.trim(),
  description: formData.description?.trim() || null,
  is_active: Boolean(formData.is_active),
})
