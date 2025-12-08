import { describe, it, expect } from 'vitest'
import {
  DEFAULT_DEPARTMENTS,
  DEFAULT_EMPLOYEES,
  DEFAULT_TASKS,
  DEFAULT_SECRETARIES,
  generateId,
} from '../constants/officeMockData'

describe('officeMockData', () => {
  describe('DEFAULT_DEPARTMENTS', () => {
    it('should have 4 departments', () => {
      expect(DEFAULT_DEPARTMENTS).toHaveLength(4)
    })

    it('each department should have required fields', () => {
      DEFAULT_DEPARTMENTS.forEach((dept) => {
        expect(dept).toHaveProperty('id')
        expect(dept).toHaveProperty('name')
        expect(dept).toHaveProperty('icon')
        expect(dept).toHaveProperty('color')
        expect(dept).toHaveProperty('description')
      })
    })

    it('department ids should be unique', () => {
      const ids = DEFAULT_DEPARTMENTS.map((d) => d.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should include expected department names', () => {
      const names = DEFAULT_DEPARTMENTS.map((d) => d.name)
      expect(names).toContain('技术部')
      expect(names).toContain('设计部')
      expect(names).toContain('市场部')
      expect(names).toContain('数据部')
    })
  })

  describe('DEFAULT_EMPLOYEES', () => {
    it('should have 6 employees', () => {
      expect(DEFAULT_EMPLOYEES).toHaveLength(6)
    })

    it('each employee should have required fields', () => {
      DEFAULT_EMPLOYEES.forEach((emp) => {
        expect(emp).toHaveProperty('id')
        expect(emp).toHaveProperty('name')
        expect(emp).toHaveProperty('role')
        expect(emp).toHaveProperty('status')
        expect(emp).toHaveProperty('skills')
        expect(emp).toHaveProperty('performance')
        expect(emp).toHaveProperty('avatarColor')
        expect(emp).toHaveProperty('position')
        expect(emp).toHaveProperty('departmentId')
      })
    })

    it('employee ids should be unique', () => {
      const ids = DEFAULT_EMPLOYEES.map((e) => e.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('each employee should belong to an existing department', () => {
      const deptIds = DEFAULT_DEPARTMENTS.map((d) => d.id)
      DEFAULT_EMPLOYEES.forEach((emp) => {
        expect(deptIds).toContain(emp.departmentId)
      })
    })

    it('performance should be between 0 and 100', () => {
      DEFAULT_EMPLOYEES.forEach((emp) => {
        expect(emp.performance).toBeGreaterThanOrEqual(0)
        expect(emp.performance).toBeLessThanOrEqual(100)
      })
    })

    it('position should have x and y coordinates', () => {
      DEFAULT_EMPLOYEES.forEach((emp) => {
        expect(emp.position).toHaveProperty('x')
        expect(emp.position).toHaveProperty('y')
        expect(typeof emp.position.x).toBe('number')
        expect(typeof emp.position.y).toBe('number')
      })
    })
  })

  describe('DEFAULT_TASKS', () => {
    it('should have 5 tasks', () => {
      expect(DEFAULT_TASKS).toHaveLength(5)
    })

    it('each task should have required fields', () => {
      DEFAULT_TASKS.forEach((task) => {
        expect(task).toHaveProperty('id')
        expect(task).toHaveProperty('title')
        expect(task).toHaveProperty('status')
        expect(task).toHaveProperty('priority')
        expect(task).toHaveProperty('progress')
        expect(task).toHaveProperty('description')
      })
    })

    it('task ids should be unique', () => {
      const ids = DEFAULT_TASKS.map((t) => t.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('progress should be between 0 and 100', () => {
      DEFAULT_TASKS.forEach((task) => {
        expect(task.progress).toBeGreaterThanOrEqual(0)
        expect(task.progress).toBeLessThanOrEqual(100)
      })
    })

    it('valid task statuses', () => {
      const validStatuses = ['pending', 'in-progress', 'completed']
      DEFAULT_TASKS.forEach((task) => {
        expect(validStatuses).toContain(task.status)
      })
    })

    it('valid task priorities', () => {
      const validPriorities = ['low', 'medium', 'high']
      DEFAULT_TASKS.forEach((task) => {
        expect(validPriorities).toContain(task.priority)
      })
    })
  })

  describe('DEFAULT_SECRETARIES', () => {
    it('should have 3 secretaries', () => {
      expect(DEFAULT_SECRETARIES).toHaveLength(3)
    })

    it('each secretary should have required fields', () => {
      DEFAULT_SECRETARIES.forEach((sec) => {
        expect(sec).toHaveProperty('id')
        expect(sec).toHaveProperty('name')
        expect(sec).toHaveProperty('type')
        expect(sec).toHaveProperty('avatar')
        expect(sec).toHaveProperty('status')
      })
    })

    it('secretary ids should be unique', () => {
      const ids = DEFAULT_SECRETARIES.map((s) => s.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('valid secretary types', () => {
      const validTypes = ['business', 'life', 'personal']
      DEFAULT_SECRETARIES.forEach((sec) => {
        expect(validTypes).toContain(sec.type)
      })
    })
  })

  describe('generateId', () => {
    it('should return a string', () => {
      const id = generateId()
      expect(typeof id).toBe('string')
    })

    it('should return a non-empty string', () => {
      const id = generateId()
      expect(id.length).toBeGreaterThan(0)
    })

    it('should generate unique ids', () => {
      const ids = new Set<string>()
      for (let i = 0; i < 100; i++) {
        ids.add(generateId())
      }
      // All generated IDs should be unique
      expect(ids.size).toBe(100)
    })

    it('should return alphanumeric characters only', () => {
      for (let i = 0; i < 10; i++) {
        const id = generateId()
        expect(id).toMatch(/^[a-z0-9]+$/)
      }
    })

    it('should return string of expected length (around 7 chars)', () => {
      const id = generateId()
      // substring(2, 9) gives max 7 chars
      expect(id.length).toBeLessThanOrEqual(7)
    })
  })
})
