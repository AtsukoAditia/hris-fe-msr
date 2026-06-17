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
  branch_id: '',
  manager_id: '',
  join_date: '',
  employment_type: 'permanent',
  status: 'active',
  role: 'employee',
}

export const normalizeDateInput = (value) => {
  if (!value || typeof value !== 'string') return ''
  return value.includes('T') ? value.split('T')[0] : value
}

export const normalizeManagerOptions = (response) => {
  const payload = response?.data?.data ?? response?.data ?? response
  if (!Array.isArray(payload)) return []

  return payload
    .filter((item) => item?.id != null)
    .map((item) => ({
      id: item.id,
      employee_number: item.employee_number || '',
      name: item.name || item.user?.name || '',
      email: item.email || item.user?.email || '',
      role: item.role || item.user?.role || '',
      department_id: item.department_id || '',
      department_code: item.department_code || '',
      department_name: item.department_name || '',
      position_id: item.position_id || '',
      position_code: item.position_code || '',
      position_name: item.position_name || '',
      branch_id: item.branch_id || '',
      branch_code: item.branch_code || '',
      branch_name: item.branch_name || '',
      label: item.label || `${item.name || item.user?.name || 'Karyawan'} — ${item.position_name || 'Tanpa Jabatan'} (${item.employee_number || '-'})`,
    }))
}

export const normalizeEmployee = (employee) => {
  if (!employee) return null

  const isActive = typeof employee.is_active === 'boolean' ? employee.is_active : employee.status !== 'inactive'
  const faceImageUrl = employee.face_image_url || employee.faceImageUrl || null
  const departmentMaster = employee.department_master || employee.departmentMaster || null
  const positionMaster = employee.position_master || employee.positionMaster || null
  const branchMaster = employee.branch || employee.branch_master || employee.branchMaster || null
  const managerMaster = employee.manager || employee.manager_master || employee.managerMaster || null
  const departmentName = employee.department_name || departmentMaster?.name || employee.department || ''
  const positionName = employee.position_name || positionMaster?.name || employee.position || ''
  const branchName = employee.branch_name || branchMaster?.name || ''
  const managerName = employee.manager_name || managerMaster?.user?.name || managerMaster?.name || ''

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
    branch_id: employee.branch_id || branchMaster?.id || '',
    branch: branchMaster,
    branch_name: branchName,
    branch_code: employee.branch_code || branchMaster?.code || '',
    manager_id: employee.manager_id ?? managerMaster?.id ?? '',
    manager: managerMaster,
    manager_name: managerName,
    manager_employee_number: employee.manager_employee_number || managerMaster?.employee_number || '',
    manager_position_name: employee.manager_position_name || managerMaster?.position_name || managerMaster?.position_master?.name || managerMaster?.position || '',
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
  branch_id: formData.branch_id ? Number(formData.branch_id) : null,
  manager_id: formData.manager_id ? Number(formData.manager_id) : null,
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
