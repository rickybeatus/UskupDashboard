import { describe, it, expect, beforeEach } from 'vitest'
import { 
  hashPassword, 
  verifyPassword, 
  validatePassword, 
  generateSecurePassword,
  isPlainTextPassword 
} from '@/lib/password'
import bcrypt from 'bcryptjs'

describe('Password Security Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a valid password', async () => {
      const password = 'SecurePass123!'
      const hashed = await hashPassword(password)
      
      expect(hashed).toBeTruthy()
      expect(hashed).not.toBe(password)
      expect(hashed).toMatch(/^\$2a\$12\$/) // bcrypt format
    })

    it('should throw error for empty password', async () => {
      await expect(hashPassword('')).rejects.toThrow('Password must be at least 6 characters long')
    })

    it('should throw error for short password', async () => {
      await expect(hashPassword('12345')).rejects.toThrow('Password must be at least 6 characters long')
    })
  })

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'SecurePass123!'
      const hashed = await hashPassword(password)
      const isValid = await verifyPassword(password, hashed)
      
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'SecurePass123!'
      const wrongPassword = 'WrongPass123!'
      const hashed = await hashPassword(password)
      const isValid = await verifyPassword(wrongPassword, hashed)
      
      expect(isValid).toBe(false)
    })

    it('should handle empty inputs gracefully', async () => {
      expect(await verifyPassword('', 'hashed')).toBe(false)
      expect(await verifyPassword('password', '')).toBe(false)
      expect(await verifyPassword('', '')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const strongPassword = 'SecurePass123!'
      const result = validatePassword(strongPassword)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject short password', () => {
      const shortPassword = 'Abc1!'
      const result = validatePassword(shortPassword)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must be at least 8 characters long')
    })

    it('should reject password without uppercase', () => {
      const noUpperPassword = 'password123!'
      const result = validatePassword(noUpperPassword)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
    })

    it('should reject password without lowercase', () => {
      const noLowerPassword = 'PASSWORD123!'
      const result = validatePassword(noLowerPassword)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one lowercase letter')
    })

    it('should reject password without numbers', () => {
      const noNumberPassword = 'Password!'
      const result = validatePassword(noNumberPassword)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one number')
    })

    it('should reject password without special characters', () => {
      const noSpecialPassword = 'Password123'
      const result = validatePassword(noSpecialPassword)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one special character')
    })

    it('should return multiple errors for weak password', () => {
      const weakPassword = 'abc'
      const result = validatePassword(weakPassword)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })

  describe('generateSecurePassword', () => {
    it('should generate password with default length', () => {
      const password = generateSecurePassword()
      
      expect(password).toBeTruthy()
      expect(password.length).toBe(12)
    })

    it('should generate password with custom length', () => {
      const password = generateSecurePassword(16)
      
      expect(password).toBeTruthy()
      expect(password.length).toBe(16)
    })

    it('should contain various character types', () => {
      const password = generateSecurePassword(20)
      
      // Check for uppercase
      expect(/[A-Z]/.test(password)).toBe(true)
      // Check for lowercase  
      expect(/[a-z]/.test(password)).toBe(true)
      // Check for numbers
      expect(/[0-9]/.test(password)).toBe(true)
      // Check for special characters
      expect(/[!@#$%^&*]/.test(password)).toBe(true)
    })

    it('should generate different passwords each time', () => {
      const password1 = generateSecurePassword()
      const password2 = generateSecurePassword()
      
      expect(password1).not.toBe(password2)
    })
  })

  describe('isPlainTextPassword', () => {
    it('should identify common plain text passwords', () => {
      expect(isPlainTextPassword('uskup2025')).toBe(true)
      expect(isPlainTextPassword('password')).toBe(true)
      expect(isPlainTextPassword('123456')).toBe(true)
      expect(isPlainTextPassword('admin')).toBe(true)
    })

    it('should not identify secure passwords as plain text', () => {
      expect(isPlainTextPassword('SecurePass123!')).toBe(false)
      expect(isPlainTextPassword('MyPassword2023!')).toBe(false)
      expect(isPlainTextPassword('Abc123Def456!')).toBe(false)
    })
  })

  describe('Password Security Integration', () => {
    it('should maintain password security through hash/verify cycle', async () => {
      const originalPassword = 'MySecurePassword123!'
      const hashedPassword = await hashPassword(originalPassword)
      
      // Password should not be recoverable from hash
      expect(hashedPassword).not.toContain(originalPassword)
      
      // Should verify correctly
      expect(await verifyPassword(originalPassword, hashedPassword)).toBe(true)
      
      // Should reject wrong password
      expect(await verifyPassword('WrongPassword', hashedPassword)).toBe(false)
    })

    it('should use proper salt rounds', async () => {
      const password = 'TestPassword123!'
      const hashed = await hashPassword(password)
      
      // Extract salt rounds from hash
      const saltRounds = hashed.split('$')[2]
      
      expect(saltRounds).toBe('12') // 12 rounds as configured
    })
  })
})