export const initialDepartmentForm = {
  code: '',
  name: '',
  description: '',
  is_active: true,
}

export const normalizeDepartment = (department) => {
  if (!department) return null

  return {
    id: department.id,
    code: department.code || '',
    name: department.name || '',
    description: department.description || '',
    is_active: department.is_active !== false,
    created_at: department.created_at || null,
    updated_at: department.updated_at || null,
  }
}

export const normalizeDepartmentRows = (response) => {
  const payload = response?.data?.data ?? response?.data ?? response
  if (!Array.isArray(payload)) return []

  return payload.map(normalizeDepartment).filter(Boolean)
}

export const mapDepartmentFormToPayload = (formData) => ({
  code: formData.code?.trim().toUpperCase(),
  name: formData.name?.trim(),
  description: formData.description?.trim() || null,
  is_active: Boolean(formData.is_active),
})

export const getValidationErrors = (error) => error?.response?.data?.errors || {}
