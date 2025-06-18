// SuperMap Service Worker
const CACHE_NAME = 'supermap-v1.0.0';
const STATIC_CACHE = 'supermap-static-v1.0.0';
const DYNAMIC_CACHE = 'supermap-dynamic-v1.0.0';

// Files to cache immediately (critical resources)
const STATIC_FILES = [
    '/',
    '/index.html',
    '/app.js',
    '/manifest.json',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('📦 Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('✅ Service Worker: Installation complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Service Worker: Installation failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('🗑️ Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Activation complete');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle different types of requests
    if (request.method !== 'GET') {
        return;
    }

    // Handle map tiles with specific caching strategy
    if (url.hostname.includes('tile') || url.pathname.includes('/tile/')) {
        event.respondWith(handleMapTiles(request));
        return;
    }

    // Handle API requests
    if (url.hostname.includes('api') || url.pathname.includes('/api/')) {
        event.respondWith(handleApiRequests(request));
        return;
    }

    // Handle static resources
    event.respondWith(handleStaticResources(request));
});

// Handle map tiles with cache-first strategy
async function handleMapTiles(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    
    try {
        // Try cache first
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            // Optionally update cache in background
            updateTileCache(request, cache);
            return cachedResponse;
        }

        // Fetch from network
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // Cache successful responses
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;

    } catch (error) {
        console.log('🗺️ Map tile offline:', request.url);
        
        // Return a placeholder tile when offline
        return new Response(
            createPlaceholderTile(),
            {
                headers: {
                    'Content-Type': 'image/png',
                    'Cache-Control': 'no-cache'
                }
            }
        );
    }
}

// Handle API requests with network-first strategy
async function handleApiRequests(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    
    try {
        // Try network first for fresh data
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;

    } catch (error) {
        console.log('🌐 API request offline:', request.url);
        
        // Fall back to cache
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline indicator
        return new Response(
            JSON.stringify({
                error: 'Offline',
                message: 'This request is not available offline',
                offline: true
            }),
            {
                status: 503,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            }
        );
    }
}

// Handle static resources with cache-first strategy
async function handleStaticResources(request) {
    try {
        // Check static cache first
        const staticCache = await caches.open(STATIC_CACHE);
        const staticCached = await staticCache.match(request);
        if (staticCached) {
            return staticCached;
        }

        // Check dynamic cache
        const dynamicCache = await caches.open(DYNAMIC_CACHE);
        const dynamicCached = await dynamicCache.match(request);
        if (dynamicCached) {
            return dynamicCached;
        }

        // Fetch from network
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            dynamicCache.put(request, networkResponse.clone());
        }
        return networkResponse;

    } catch (error) {
        console.log('📄 Static resource offline:', request.url);
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            const offlineCache = await caches.open(STATIC_CACHE);
            return offlineCache.match('/') || offlineCache.match('/index.html');
        }

        // Return basic response for other requests
        return new Response(
            'Offline - Resource not available',
            {
                status: 503,
                headers: {
                    'Content-Type': 'text/plain',
                    'Cache-Control': 'no-cache'
                }
            }
        );
    }
}

// Update tile cache in background
async function updateTileCache(request, cache) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response);
        }
    } catch (error) {
        // Silently fail - we already have cached version
    }
}

// Create placeholder tile for offline mode
function createPlaceholderTile() {
    // Create a simple SVG placeholder tile
    const svg = `
        <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
            <rect width="256" height="256" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
            <text x="128" y="128" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="14">
                Offline
            </text>
            <text x="128" y="148" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="12">
                Map tile unavailable
            </text>
        </svg>
    `;
    
    // Convert SVG to PNG-like blob
    return new Blob([svg], { type: 'image/svg+xml' });
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('🔄 Service Worker: Background sync triggered', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(handleBackgroundSync());
    }
});

// Handle background sync operations
async function handleBackgroundSync() {
    try {
        // Sync any pending operations when back online
        const savedData = await getStoredOfflineData();
        
        for (const item of savedData) {
            try {
                await syncOfflineData(item);
                await removeStoredOfflineData(item.id);
            } catch (error) {
                console.error('Sync failed for item:', item, error);
            }
        }
        
        console.log('✅ Background sync completed');
    } catch (error) {
        console.error('❌ Background sync failed:', error);
    }
}

// Get stored offline data
async function getStoredOfflineData() {
    // This would retrieve data stored locally while offline
    // Implementation depends on your specific offline data needs
    return [];
}

// Sync offline data to server
async function syncOfflineData(item) {
    // Implementation for syncing offline actions
    // e.g., saved locations, search history, etc.
}

// Remove synced offline data
async function removeStoredOfflineData(id) {
    // Remove successfully synced data from local storage
}

// Handle push notifications (for future features)
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const options = {
        body: event.data.text(),
        icon: '/manifest-icon-192.png',
        badge: '/manifest-icon-192.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Open Map',
                icon: '/manifest-icon-192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/manifest-icon-192.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('SuperMap', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Provide cache status to main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'GET_CACHE_STATUS') {
        getCacheStatus().then(status => {
            event.ports[0].postMessage(status);
        });
    }
});

// Get current cache status
async function getCacheStatus() {
    const staticCache = await caches.open(STATIC_CACHE);
    const dynamicCache = await caches.open(DYNAMIC_CACHE);
    
    const staticKeys = await staticCache.keys();
    const dynamicKeys = await dynamicCache.keys();
    
    return {
        staticCached: staticKeys.length,
        dynamicCached: dynamicKeys.length,
        totalCached: staticKeys.length + dynamicKeys.length,
        version: CACHE_NAME
    };
}

console.log('🚀 SuperMap Service Worker loaded successfully!');