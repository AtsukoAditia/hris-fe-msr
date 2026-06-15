export const initialFormData = {
  name: '',
  email: '',
  nik: '',
  phone: '',
  address: '',
  birth_date: '',
  gender: '',
  department_id: '',
  position_id: '',
  join_date: '',
  employment_type: 'permanent',
  status: 'active',
  role: 'employee',
}

export const normalizeDateInput = (value) => {
  if (!value || typeof value !== 'string') return ''
  return value.includes('T') ? value.split('T')[0] : value
}

export const normalizeEmployee = (employee) => {
  if (!employee) return null

  const isActive = typeof employee.is_active === 'boolean' ? employee.is_active : employee.status !== 'inactive'
  const faceImageUrl = employee.face_image_url || employee.faceImageUrl || null
  const departmentMaster = employee.department_master || employee.departmentMaster || null
  const positionMaster = employee.position_master || employee.positionMaster || null
  const departmentName = employee.department_name || departmentMaster?.name || employee.department || ''
  const positionName = employee.position_name || positionMaster?.name || employee.position || ''

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
    department_id: employee.department_id || departmentMaster?.id || '',
    department: departmentName,
    department_name: departmentName,
    department_code: employee.department_code || departmentMaster?.code || '',
    department_master: departmentMaster,
    position_id: employee.position_id || positionMaster?.id || '',
    position: positionName,
    position_name: positionName,
    position_code: employee.position_code || positionMaster?.code || '',
    position_master: positionMaster,
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
    is_face_registered: typeof employee.is_face_registered === 'boolean' ? employee.is_face_registered : Boolean(employee.face_image || faceImageUrl),
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
  department_id: formData.department_id ? Number(formData.department_id) : null,
  position_id: formData.position_id ? Number(formData.position_id) : null,
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
