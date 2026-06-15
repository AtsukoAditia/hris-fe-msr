export const initialFormData = {
  name: '',
  email: '',
  nik: '',
  phone: '',
  address: '',
  birth_date: '',
  gender: '',
  position: '',
  department_id: '',
  join_date: '',
  employment_type: 'permanent',
  status: 'active',
  role: 'employee',
}

export const normalizeDateInput = (value) => {
  if (!value) return ''
  if (typeof value !== 'string') return ''
  return value.includes('T') ? value.split('T')[0] : value
}

export const normalizeEmployee = (employee) => {
  if (!employee) return null

  const isActive = typeof employee.is_active === 'boolean'
    ? employee.is_active
    : employee.status !== 'inactive'

  const faceImageUrl = employee.face_image_url || employee.faceImageUrl || null
  const isFaceRegistered = typeof employee.is_face_registered === 'boolean'
    ? employee.is_face_registered
    : Boolean(employee.face_image || faceImageUrl)
  const departmentMaster = employee.department_master || employee.departmentMaster || null
  const departmentName = employee.department_name || departmentMaster?.name || employee.department || ''
  const departmentCode = employee.department_code || departmentMaster?.code || ''

  return {
    id: employee.id,
    user_id: employee.user_id,
    name: employee.user?.name || employee.name || '',
    email: employee.user?.email || employee.email || '',
    nik: employee.nik || '',
    phone: employee.phone || '',
    address: employee.address || '',
    birth_date: normalizeDateInput(employee.birth_date),
    gender: employee.gender || '',
    position: employee.position || '',
    department_id: employee.department_id || departmentMaster?.id || '',
    department: departmentName,
    department_name: departmentName,
    department_code: departmentCode,
    department_master: departmentMaster,
    join_date: normalizeDateInput(employee.join_date),
    employment_type: employee.employment_type || 'permanent',
    role: employee.user?.role || employee.role || 'employee',
    status: isActive ? 'active' : 'inactive',
    is_active: isActive,
    employee_number: employee.formatted_employee_number || employee.employee_number || '',
    formatted_employee_number: employee.formatted_employee_number || employee.employee_number || '',
    photo: faceImageUrl || employee.photo || employee.user?.photo || null,
    face_image: employee.face_image || null,
    face_image_url: faceImageUrl,
    face_registered_at: employee.face_registered_at || null,
    is_face_registered: isFaceRegistered,
    user: employee.user || null,
    shift: employee.shift || null,
    raw: employee,
  }
}

export const mapFormDataToPayload = (formData) => ({
  name: formData.name?.trim(),
  email: formData.email?.trim(),
  nik: formData.nik?.trim(),
  phone: formData.phone?.trim(),
  address: formData.address?.trim(),
  birth_date: formData.birth_date || null,
  gender: formData.gender || null,
  position: formData.position?.trim(),
  department_id: formData.department_id ? Number(formData.department_id) : null,
  join_date: formData.join_date,
  employment_type: formData.employment_type || 'permanent',
  role: formData.role,
  status: formData.status,
  is_active: formData.status === 'active',
})

export const normalizeRows = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

export const normalizePagination = (payload) => {
  const page = payload?.data || payload

  return {
    current_page: page?.current_page || 1,
    last_page: page?.last_page || 1,
    per_page: page?.per_page || 15,
    total: page?.total || 0,
  }
}
