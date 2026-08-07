// Capabilities: Human Resources (HR) Subsystem (Employees, Payroll, Attendance & Leave)

import { EventBus } from '../../foundation/EventBus.js';

export interface Employee {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  department: string;
  position: string;
  salaryMonthly: number;
  status: 'active' | 'on_leave' | 'terminated';
  hiredAt: string;
}

export class HREngine {
  private static instance: HREngine;
  private employees: Map<string, Employee> = new Map();
  private eventBus = EventBus.getInstance();

  private constructor() {
    this.seedDefaultEmployees();
  }

  public static getInstance(): HREngine {
    if (!HREngine.instance) {
      HREngine.instance = new HREngine();
    }
    return HREngine.instance;
  }

  private seedDefaultEmployees() {
    const defaultEmp: Employee = {
      id: 'emp_1',
      tenantId: 'tenant_default',
      name: 'Sarah Connor',
      email: 'sarah.connor@acme.com',
      department: 'Engineering',
      position: 'VP of Technology',
      salaryMonthly: 12500,
      status: 'active',
      hiredAt: new Date().toISOString(),
    };
    this.employees.set(defaultEmp.id, defaultEmp);
  }

  public addEmployee(emp: Omit<Employee, 'id' | 'hiredAt'>): Employee {
    const employee: Employee = {
      ...emp,
      id: `emp_${Date.now()}`,
      hiredAt: new Date().toISOString(),
    };

    this.employees.set(employee.id, employee);
    this.eventBus.publish('hr.employee.created', employee, { tenantId: emp.tenantId });
    return employee;
  }

  public listEmployees(tenantId: string): Employee[] {
    return Array.from(this.employees.values()).filter((e) => e.tenantId === tenantId);
  }
}
