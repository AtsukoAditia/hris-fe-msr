export const mobileAdmin = {
  id: 1,
  name: 'Mobile Acceptance Admin',
  email: 'mobile.admin@hris.test',
  role: 'admin',
  is_active: true,
}

export const departments = [
  { id: 1, code: 'IT', name: 'Information Technology', description: 'Technology team', is_active: true },
  { id: 2, code: 'HR', name: 'Human Resources', description: 'People operations', is_active: true },
]

export const positions = [
  { id: 10, department_id: 1, code: 'ENGINEERING-MANAGER', name: 'Engineering Manager', description: 'Engineering lead', is_active: true, department: departments[0] },
  { id: 11, department_id: 1, code: 'SOFTWARE-ENGINEER', name: 'Software Engineer', description: 'Product engineering', is_active: true, department: departments[0] },
]

export const branches = [
  {
    id: 1,
    code: 'HQ-JKT',
    name: 'Head Office Jakarta',
    address: 'Jakarta',
    latitude: -6.2,
    longitude: 106.8166667,
    radius_meters: 150,
    timezone: 'Asia/Jakarta',
    is_active: true,
    employees_count: 2,
  },
]

const branchRelation = {
  id: 1,
  code: 'HQ-JKT',
  name: 'Head Office Jakarta',
  address: 'Jakarta',
  radius_meters: 150,
  timezone: 'Asia/Jakarta',
}

export const employees = [
  {
    id: 20,
    user_id: 20,
    employee_number: 'IT-0020',
    formatted_employee_number: 'IT-0020',
    nik: '3171000000000020',
    department_id: 1,
    department_name: 'Information Technology',
    department_code: 'IT',
    position_id: 10,
    position_name: 'Engineering Manager',
    position_code: 'ENGINEERING-MANAGER',
    branch_id: 1,
    branch_name: 'Head Office Jakarta',
    branch_code: 'HQ-JKT',
    branch: branchRelation,
    manager_id: null,
    join_date: '2024-01-01',
    employment_type: 'permanent',
    is_active: true,
    user: { id: 20, name: 'Engineering Lead', email: 'engineering.lead@hris.test', role: 'manager', is_active: true },
  },
  {
    id: 99,
    user_id: 99,
    employee_number: 'IT-0099',
    formatted_employee_number: 'IT-0099',
    nik: '3171000000000099',
    department_id: 1,
    department_name: 'Information Technology',
    department_code: 'IT',
    position_id: 11,
    position_name: 'Software Engineer',
    position_code: 'SOFTWARE-ENGINEER',
    branch_id: 1,
    branch_name: 'Head Office Jakarta',
    branch_code: 'HQ-JKT',
    branch: branchRelation,
    manager_id: 20,
    manager_name: 'Engineering Lead',
    manager_employee_number: 'IT-0020',
    manager_position_name: 'Engineering Manager',
    join_date: '2025-01-01',
    employment_type: 'permanent',
    is_active: true,
    user: { id: 99, name: 'Managed Employee', email: 'managed.employee@hris.test', role: 'employee', is_active: true },
  },
]
