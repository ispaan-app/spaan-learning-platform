// Service Worker for iSpaan Platform
const CACHE_NAME = 'ispaan-v1'
const STATIC_CACHE = 'ispaan-static-v1'
const DYNAMIC_CACHE = 'ispaan-dynamic-v1'

// Files to cache for offline use
const STATIC_FILES = [
  '/',
  '/login',
  '/apply',
  '/manifest.json',
  '/offline.html'
]

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files...')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('Static files cached successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Failed to cache static files:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return
  }

  // Skip API requests (let them fail gracefully)
  if (url.pathname.startsWith('/api/')) {
    return
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('Serving from cache:', request.url)
          return cachedResponse
        }

        // If not in cache, fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone the response
            const responseToCache = response.clone()

            // Cache the response
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache)
              })

            return response
          })
          .catch(() => {
            // If network fails, show offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/offline.html')
            }
            
            // For other requests, return a basic response
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            })
          })
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      syncOfflineActions()
    )
  }
})

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from iSpaan',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('iSpaan Platform', options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Helper function to sync offline actions
async function syncOfflineActions() {
  try {
    console.log('Syncing offline actions...')
    
    // Get pending actions from IndexedDB
    const pendingActions = await getPendingActions()
    
    for (const action of pendingActions) {
      try {
        await syncAction(action)
        await removePendingAction(action.id)
      } catch (error) {
        console.error('Failed to sync action:', action, error)
      }
    }
    
    console.log('Offline sync completed')
  } catch (error) {
    console.error('Offline sync failed:', error)
  }
}

// Helper function to get pending actions from IndexedDB
async function getPendingActions() {
  return new Promise((resolve) => {
    const request = indexedDB.open('ispaan-offline', 1)
    
    request.onsuccess = (event) => {
      const db = event.target.result
      const transaction = db.transaction(['actions'], 'readonly')
      const store = transaction.objectStore('actions')
      const getAllRequest = store.getAll()
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result || [])
      }
      
      getAllRequest.onerror = () => {
        resolve([])
      }
    }
    
    request.onerror = () => {
      resolve([])
    }
  })
}

// Helper function to sync a single action
async function syncAction(action) {
  const response = await fetch(action.url, {
    method: action.method,
    headers: action.headers,
    body: action.body
  })
  
  if (!response.ok) {
    throw new Error(`Sync failed: ${response.status}`)
  }
  
  return response
}

// Helper function to remove a pending action
async function removePendingAction(actionId) {
  return new Promise((resolve) => {
    const request = indexedDB.open('ispaan-offline', 1)
    
    request.onsuccess = (event) => {
      const db = event.target.result
      const transaction = db.transaction(['actions'], 'readwrite')
      const store = transaction.objectStore('actions')
      const deleteRequest = store.delete(actionId)
      
      deleteRequest.onsuccess = () => resolve()
      deleteRequest.onerror = () => resolve()
    }
    
    request.onerror = () => resolve()
  })
}

// Initialize IndexedDB for offline storage
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'INIT_INDEXEDDB') {
    initIndexedDB()
  }
})

function initIndexedDB() {
  const request = indexedDB.open('ispaan-offline', 1)
  
  request.onupgradeneeded = (event) => {
    const db = event.target.result
    
    if (!db.objectStoreNames.contains('actions')) {
      db.createObjectStore('actions', { keyPath: 'id' })
    }
    
    if (!db.objectStoreNames.contains('cache')) {
      db.createObjectStore('cache', { keyPath: 'key' })
    }
  }
}

