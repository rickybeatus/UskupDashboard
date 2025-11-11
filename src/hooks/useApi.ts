import { useState, useEffect } from 'react'
import { showError } from '@/lib/alerts'

// Generic hook for fetching data
export function useApiData<T>(endpoint: string, dependencies: any[] = []) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(endpoint, {
        credentials: 'include' // Include cookies for authentication
      })
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to fetch data')
        showError(result.error || 'Failed to fetch data')
      }
    } catch (err) {
      const errorMessage = 'Network error occurred'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, dependencies)

  const refetch = () => {
    fetchData()
  }

  return { data, loading, error, refetch }
}

// Hook for managing CRUD operations
export function useCrud<T>(endpoint: string) {
  const [loading, setLoading] = useState(false)

  const create = async (itemData: Partial<T>) => {
    setLoading(true)
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(itemData),
      })
      const result = await response.json()

      if (result.success) {
        return { success: true, data: result.data }
      } else {
        showError(result.error || 'Failed to create item')
        return { success: false, error: result.error }
      }
    } catch (error) {
      showError('Network error occurred')
      return { success: false, error: 'Network error' }
    } finally {
      setLoading(false)
    }
  }

  const update = async (id: string, updates: Partial<T>) => {
    setLoading(true)
    try {
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(updates),
      })
      const result = await response.json()

      if (result.success) {
        return { success: true, data: result.data }
      } else {
        showError(result.error || 'Failed to update item')
        return { success: false, error: result.error }
      }
    } catch (error) {
      showError('Network error occurred')
      return { success: false, error: 'Network error' }
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies for authentication
      })
      const result = await response.json()

      if (result.success) {
        return { success: true }
      } else {
        showError(result.error || 'Failed to delete item')
        return { success: false, error: result.error }
      }
    } catch (error) {
      showError('Network error occurred')
      return { success: false, error: 'Network error' }
    } finally {
      setLoading(false)
    }
  }

  return { create, update, remove, loading }
}

// Specific hooks for each entity
export function useAgenda() {
  return useApiData<any>('/api/agenda')
}

export function useTasks() {
  return useApiData<any>('/api/tasks')
}

export function useNotulensi() {
  return useApiData<any>('/api/notulensi', [Date.now()]) // Add timestamp to force refresh
}

export function useImam() {
  return useApiData<any>('/api/imam')
}

export function useSurat() {
  return useApiData<any>('/api/surat')
}

export function useDecisions() {
  return useApiData<any>('/api/decisions')
}
