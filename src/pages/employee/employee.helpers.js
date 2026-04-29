export const initialFormData = {
  name: '',
  email: '',
  nik: '',
  phone: '',
  address: '',
  position: '',
  department: '',
  join_date: '',
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

  return {
    id: employee.id,
    user_id: employee.user_id,
    name: employee.user?.name || employee.name || '',
    email: employee.user?.email || employee.email || '',
    nik: employee.nik || '',
    phone: employee.phone || '',
    address: employee.address || '',
    position: employee.position || '',
    department: employee.department || '',
    join_date: normalizeDateInput(employee.join_date),
    role: employee.user?.role || employee.role || 'employee',
    status: employee.is_active ? 'active' : 'inactive',
    is_active: Boolean(employee.is_active),
    employee_number: employee.employee_number || employee.formatted_employee_number || '',
    formatted_employee_number: employee.formatted_employee_number || employee.employee_number || '',
    photo: employee.photo || employee.user?.photo || null,
    user: employee.user || null,
    shift: employee.shift || null,
    raw: employee,
  }
}

export const mapFormDataToPayload = (formData) => ({
  name: formData.name,
  email: formData.email,
  nik: formData.nik,
  phone: formData.phone,
  address: formData.address,
  position: formData.position,
  department: formData.department,
  join_date: formData.join_date,
  role: formData.role,
  status: formData.status,
  is_active: formData.status === 'active',
})
