'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit,
  Unsubscribe,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface RealtimeDataOptions {
  enabled?: boolean
  onError?: (error: Error) => void
  onSuccess?: (data: any) => void
}

interface RealtimeDataState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  lastUpdated: Date | null
}

export function useRealtimeData<T = DocumentData>(
  collectionName: string,
  documentId?: string,
  options: RealtimeDataOptions = {}
) {
  const [state, setState] = useState<RealtimeDataState<T>>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null
  })

  const unsubscribeRef = useRef<Unsubscribe | null>(null)
  const { enabled = true, onError, onSuccess } = options

  useEffect(() => {
    if (!enabled) {
      setState(prev => ({ ...prev, loading: false }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      let q
      
      if (documentId) {
        // Single document
        const docRef = doc(db, collectionName, documentId)
        q = docRef
      } else {
        // Collection query
        q = collection(db, collectionName)
      }

      unsubscribeRef.current = onSnapshot(
        q as any,
        (snapshot: QuerySnapshot<DocumentData>) => {
          try {
            let data: T | null = null

            if (documentId) {
              // Single document - snapshot is DocumentSnapshot
              data = (snapshot as any).exists() ? ((snapshot as any).data() as T) : null
            } else {
              // Collection - snapshot is QuerySnapshot
              data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              })) as T
            }

            setState({
              data,
              loading: false,
              error: null,
              lastUpdated: new Date()
            })

            onSuccess?.(data)
          } catch (error) {
            const err = error as Error
            setState(prev => ({
              ...prev,
              loading: false,
              error: err
            }))
            onError?.(err)
          }
        },
        (error) => {
          setState(prev => ({
            ...prev,
            loading: false,
            error
          }))
          onError?.(error)
        }
      )
    } catch (error) {
      const err = error as Error
      setState(prev => ({
        ...prev,
        loading: false,
        error: err
      }))
      onError?.(err)
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [collectionName, documentId, enabled, onError, onSuccess])

  return {
    ...state,
    refetch: () => {
      // Force re-fetch by toggling enabled state
      setState(prev => ({ ...prev, loading: true }))
    }
  }
}

// Specialized hooks for common use cases
export function useUserData(userId: string, enabled = true) {
  return useRealtimeData('users', userId, { enabled })
}

export function useLearnerData(learnerId: string, enabled = true) {
  return useRealtimeData('learners', learnerId, { enabled })
}

export function usePlacements(enabled = true) {
  return useRealtimeData('placements', undefined, { enabled })
}

export function useRecentActivity(limitCount = 10, enabled = true) {
  const [state, setState] = useState<RealtimeDataState<any[]>>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null
  })

  const unsubscribeRef = useRef<Unsubscribe | null>(null)

  useEffect(() => {
    if (!enabled) {
      setState(prev => ({ ...prev, loading: false }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const q = query(
        collection(db, 'audit-logs'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      )

      unsubscribeRef.current = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))

          setState({
            data,
            loading: false,
            error: null,
            lastUpdated: new Date()
          })
        },
        (error) => {
          setState(prev => ({
            ...prev,
            loading: false,
            error
          }))
        }
      )
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error
      }))
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [limitCount, enabled])

  return state
}

export function useLearnerHours(learnerId: string, month: string, enabled = true) {
  const [state, setState] = useState<RealtimeDataState<any[]>>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null
  })

  const unsubscribeRef = useRef<Unsubscribe | null>(null)

  useEffect(() => {
    if (!enabled || !learnerId || !month) {
      setState(prev => ({ ...prev, loading: false }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const q = query(
        collection(db, 'work-hours'),
        where('learnerId', '==', learnerId),
        where('month', '==', month),
        orderBy('date', 'desc')
      )

      unsubscribeRef.current = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))

          setState({
            data,
            loading: false,
            error: null,
            lastUpdated: new Date()
          })
        },
        (error) => {
          setState(prev => ({
            ...prev,
            loading: false,
            error
          }))
        }
      )
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error
      }))
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [learnerId, month, enabled])

  return state
}
