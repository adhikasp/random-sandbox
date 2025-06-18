// SuperMap - Advanced Mapping Application
class SuperMap {
    constructor() {
        this.map = null;
        this.baseLayers = {};
        this.overlayLayers = {};
        this.currentQuery = null;
        this.userLocation = null;
        this.weatherData = null;
        this.searchResults = [];
        
        // Register service worker first
        this.registerServiceWorker();
        
        this.initializeMap();
        this.setupEventListeners();
        this.loadWeatherData();
        this.setupLocationTracking();
        this.setupPWAFeatures();
    }

    // Register service worker for PWA functionality
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered successfully:', registration);
                
                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'activated') {
                            this.showStatus('App updated! Restart for new features.');
                        }
                    });
                });

            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        }
    }

    // Setup PWA features
    setupPWAFeatures() {
        // Install prompt
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install button if needed
            this.showInstallPrompt(deferredPrompt);
        });

        // Track installation
        window.addEventListener('appinstalled', () => {
            console.log('🎉 SuperMap installed as PWA!');
            this.showStatus('SuperMap installed successfully!');
        });

        // Add install button to header if not already installed
        if (!window.matchMedia('(display-mode: standalone)').matches) {
            this.addInstallButton();
        }
    }

    // Show install prompt
    showInstallPrompt(deferredPrompt) {
        // You could show a custom install banner here
        console.log('📱 Install prompt available');
    }

    // Add install button to header
    addInstallButton() {
        const headerControls = document.querySelector('.header-controls');
        const installBtn = document.createElement('button');
        installBtn.className = 'btn btn-secondary';
        installBtn.innerHTML = '<i class="fas fa-download"></i> Install';
        installBtn.id = 'installBtn';
        
        installBtn.addEventListener('click', async () => {
            if ('serviceWorker' in navigator) {
                try {
                    // Try to trigger install prompt
                    this.showStatus('SuperMap can be installed as an app!');
                } catch (error) {
                    this.showStatus('Installation not available on this device');
                }
            }
        });

        headerControls.insertBefore(installBtn, headerControls.firstChild);
    }

    // Initialize the main map
    initializeMap() {
        // Setup online status monitoring
        this.setupOnlineStatus();
        
        // Jakarta coordinates
        const jakartaCoords = [-6.2088, 106.8456];
        
        // Initialize map
        this.map = L.map('map', {
            center: jakartaCoords,
            zoom: 12,
            zoomControl: false,
            attributionControl: false
        });

        // Add custom zoom control
        L.control.zoom({
            position: 'bottomright'
        }).addTo(this.map);

        // Setup base layers
        this.setupBaseLayers();
        
        // Setup overlay layers
        this.setupOverlayLayers();
        
        // Add landmarks
        this.addLandmarks();
        
        // Setup map events
        this.setupMapEvents();
        
        console.log('🗺️ SuperMap initialized successfully!');
    }

    // Setup different base map layers
    setupBaseLayers() {
        // OpenStreetMap
        this.baseLayers.osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        });

        // Satellite (using Esri)
        this.baseLayers.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© <a href="https://www.esri.com/">Esri</a>',
            maxZoom: 17
        });

        // Terrain
        this.baseLayers.terrain = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://opentopomap.org">OpenTopoMap</a>',
            maxZoom: 15
        });

        // Dark mode
        this.baseLayers.dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 19
        });

        // Set default layer
        this.baseLayers.osm.addTo(this.map);
    }

    // Setup overlay layers
    setupOverlayLayers() {
        // Traffic layer (simulated with real-time updates)
        this.overlayLayers.traffic = L.layerGroup();
        
        // Weather layer
        this.overlayLayers.weather = L.layerGroup();
        
        // Transit layer
        this.overlayLayers.transit = L.layerGroup();
        
        // Bike lanes
        this.overlayLayers.bike = L.layerGroup();
    }

    // Add Jakarta landmarks with enhanced popups
    addLandmarks() {
        const landmarks = [
            {
                name: "Monas (National Monument)",
                coords: [-6.1754, 106.8272],
                description: "Jakarta's iconic tower and symbol of Indonesian independence",
                category: "monument",
                icon: "🗼",
                rating: 4.5,
                photos: ["monas1.jpg", "monas2.jpg"]
            },
            {
                name: "Istiqlal Mosque",
                coords: [-6.1702, 106.8317],
                description: "The largest mosque in Southeast Asia with stunning architecture",
                category: "religious",
                icon: "🕌",
                rating: 4.7,
                photos: ["istiqlal1.jpg"]
            },
            {
                name: "Jakarta Cathedral",
                coords: [-6.1703, 106.8314],
                description: "Historic neo-gothic Catholic cathedral built in 1901",
                category: "religious",
                icon: "⛪",
                rating: 4.4,
                photos: ["cathedral1.jpg"]
            },
            {
                name: "Kota Tua Jakarta",
                coords: [-6.1352, 106.8133],
                description: "Jakarta's charming colonial old town with museums and cafes",
                category: "historic",
                icon: "🏛️",
                rating: 4.2,
                photos: ["kotatua1.jpg", "kotatua2.jpg"]
            },
            {
                name: "Soekarno-Hatta Airport",
                coords: [-6.1256, 106.6558],
                description: "Indonesia's main international gateway",
                category: "transport",
                icon: "✈️",
                rating: 4.0,
                photos: ["airport1.jpg"]
            }
        ];

        landmarks.forEach(landmark => {
            const marker = this.createAdvancedMarker(landmark);
            marker.addTo(this.map);
        });
    }

    // Create advanced markers with rich popups
    createAdvancedMarker(data) {
        const marker = L.marker(data.coords, {
            icon: this.createCustomIcon(data.category, data.icon)
        });

        const popupContent = this.createAdvancedPopup(data);
        marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'custom-popup'
        });

        return marker;
    }

    // Create custom icons
    createCustomIcon(category, emoji) {
        const colors = {
            monument: '#e74c3c',
            religious: '#9b59b6',
            historic: '#f39c12',
            transport: '#3498db',
            default: '#2ecc71'
        };

        const color = colors[category] || colors.default;

        return L.divIcon({
            html: `<div style="background: ${color}; border: 3px solid white; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">${emoji}</div>`,
            className: 'custom-landmark-icon',
            iconSize: [35, 35],
            iconAnchor: [17.5, 17.5]
        });
    }

    // Create advanced popup content
    createAdvancedPopup(data) {
        const stars = '★'.repeat(Math.floor(data.rating)) + '☆'.repeat(5 - Math.floor(data.rating));
        
        return `
            <div class="custom-popup">
                <div class="popup-header">
                    <div class="popup-icon">${data.icon}</div>
                    <div>
                        <div class="popup-title">${data.name}</div>
                        <div style="color: #f39c12; font-size: 12px;">${stars} (${data.rating})</div>
                    </div>
                </div>
                <div class="popup-details">
                    <p style="margin-bottom: 10px;">${data.description}</p>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button onclick="superMap.getDirections(${data.coords[0]}, ${data.coords[1]})" 
                                style="background: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 11px;">
                            <i class="fas fa-route"></i> Directions
                        </button>
                        <button onclick="superMap.shareLocation(${data.coords[0]}, ${data.coords[1]}, '${data.name}')" 
                                style="background: #2ecc71; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 11px;">
                            <i class="fas fa-share"></i> Share
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Setup event listeners
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', this.debounce((e) => {
            this.performSearch(e.target.value);
        }, 300));

        // Sidebar toggle
        document.getElementById('toggleSidebar').addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('collapsed');
        });

        // Base layer switching
        document.querySelectorAll('input[name="baseLayer"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.switchBaseLayer(e.target.value);
            });
        });

        // Overlay layer toggles
        ['trafficLayer', 'weatherLayer', 'transitLayer', 'bikeLayer'].forEach(layerId => {
            document.getElementById(layerId).addEventListener('change', (e) => {
                this.toggleOverlay(layerId.replace('Layer', ''), e.target.checked);
            });
        });

        // Quick action buttons
        document.querySelectorAll('.quick-action').forEach(action => {
            action.addEventListener('click', (e) => {
                const query = e.currentTarget.dataset.query;
                this.quickSearch(query);
            });
        });

        // Share location
        document.getElementById('shareLocation').addEventListener('click', () => {
            this.shareCurrentView();
        });

        // Fullscreen
        document.getElementById('fullscreen').addEventListener('click', () => {
            this.toggleFullscreen();
        });
    }

    // Setup map events
    setupMapEvents() {
        // Click to show coordinates
        this.map.on('click', (e) => {
            const lat = e.latlng.lat.toFixed(6);
            const lng = e.latlng.lng.toFixed(6);
            
            const popup = L.popup()
                .setLatLng(e.latlng)
                .setContent(`
                    <div class="custom-popup">
                        <div class="popup-header">
                            <div class="popup-icon">📍</div>
                            <div class="popup-title">Location</div>
                        </div>
                        <div class="popup-details">
                            <p><strong>Coordinates:</strong></p>
                            <p>Lat: ${lat}</p>
                            <p>Lng: ${lng}</p>
                            <div style="margin-top: 10px;">
                                <button onclick="superMap.getDirections(${lat}, ${lng})" 
                                        style="background: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 11px; margin-right: 5px;">
                                    Get Directions
                                </button>
                                <button onclick="superMap.saveLocation(${lat}, ${lng})" 
                                        style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 11px;">
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                `)
                .openOn(this.map);
        });

        // Map move event for dynamic loading
        this.map.on('moveend', () => {
            this.updateVisibleData();
        });
    }

    // Switch base layer
    switchBaseLayer(layerName) {
        // Remove current base layer
        Object.values(this.baseLayers).forEach(layer => {
            this.map.removeLayer(layer);
        });

        // Add new base layer
        if (this.baseLayers[layerName]) {
            this.baseLayers[layerName].addTo(this.map);
            this.showStatus(`Switched to ${layerName} view`);
        }
    }

    // Toggle overlay layers
    toggleOverlay(layerName, enabled) {
        if (enabled) {
            this.loadOverlayData(layerName);
        } else {
            this.map.removeLayer(this.overlayLayers[layerName]);
        }
    }

    // Load overlay data
    async loadOverlayData(layerName) {
        this.showStatus(`Loading ${layerName} data...`);

        switch (layerName) {
            case 'traffic':
                await this.loadTrafficData();
                break;
            case 'weather':
                await this.loadWeatherOverlay();
                break;
            case 'transit':
                await this.loadTransitData();
                break;
            case 'bike':
                await this.loadBikeData();
                break;
        }

        this.overlayLayers[layerName].addTo(this.map);
        this.showStatus(`${layerName} data loaded`);
    }

    // Load traffic data (simulated)
    async loadTrafficData() {
        // Simulate traffic data
        const trafficRoutes = [
            { coords: [[-6.2088, 106.8456], [-6.1754, 106.8272]], level: 'heavy', color: '#e74c3c' },
            { coords: [[-6.1754, 106.8272], [-6.1702, 106.8317]], level: 'moderate', color: '#f39c12' },
            { coords: [[-6.1702, 106.8317], [-6.1352, 106.8133]], level: 'light', color: '#2ecc71' }
        ];

        trafficRoutes.forEach(route => {
            const polyline = L.polyline(route.coords, {
                color: route.color,
                weight: 6,
                opacity: 0.7
            }).bindPopup(`Traffic: ${route.level}`);
            
            this.overlayLayers.traffic.addLayer(polyline);
        });
    }

    // Load weather overlay
    async loadWeatherOverlay() {
        // Add weather radar circles (simulated)
        const weatherZones = [
            { center: [-6.2088, 106.8456], radius: 5000, intensity: 0.3, type: 'light_rain' },
            { center: [-6.1754, 106.8272], radius: 3000, intensity: 0.6, type: 'moderate_rain' }
        ];

        weatherZones.forEach(zone => {
            const circle = L.circle(zone.center, {
                radius: zone.radius,
                fillColor: '#3498db',
                fillOpacity: zone.intensity,
                color: '#2980b9',
                weight: 2
            }).bindPopup(`Weather: ${zone.type.replace('_', ' ')}`);
            
            this.overlayLayers.weather.addLayer(circle);
        });
    }

    // Load transit data
    async loadTransitData() {
        // Jakarta TransJakarta routes (simplified)
        const transitRoutes = [
            {
                name: "Corridor 1",
                coords: [[-6.1754, 106.8272], [-6.2088, 106.8456], [-6.2400, 106.8700]],
                color: '#e74c3c'
            },
            {
                name: "Corridor 2", 
                coords: [[-6.1352, 106.8133], [-6.1702, 106.8317], [-6.2000, 106.8500]],
                color: '#3498db'
            }
        ];

        transitRoutes.forEach(route => {
            const polyline = L.polyline(route.coords, {
                color: route.color,
                weight: 4,
                opacity: 0.8,
                dashArray: '10, 5'
            }).bindPopup(`TransJakarta ${route.name}`);
            
            this.overlayLayers.transit.addLayer(polyline);
        });
    }

    // Load bike lane data
    async loadBikeData() {
        // Bike lanes (simulated)
        const bikeRoutes = [
            [[-6.1754, 106.8272], [-6.1800, 106.8300], [-6.1850, 106.8350]],
            [[-6.2000, 106.8400], [-6.2050, 106.8450], [-6.2100, 106.8500]]
        ];

        bikeRoutes.forEach(route => {
            const polyline = L.polyline(route, {
                color: '#2ecc71',
                weight: 3,
                opacity: 0.7,
                dashArray: '5, 5'
            }).bindPopup('Bike Lane');
            
            this.overlayLayers.bike.addLayer(polyline);
        });
    }

    // Perform search
    async performSearch(query) {
        if (!query || query.length < 3) return;

        this.showStatus('Searching...');

        try {
            // Use Nominatim for geocoding
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' Jakarta')}&limit=5`
            );
            const results = await response.json();

            this.displaySearchResults(results);
            this.showStatus(`Found ${results.length} results`);
        } catch (error) {
            console.error('Search error:', error);
            this.showStatus('Search failed', 'error');
        }
    }

    // Display search results
    displaySearchResults(results) {
        // Clear previous search results
        if (this.searchLayer) {
            this.map.removeLayer(this.searchLayer);
        }
        
        this.searchLayer = L.layerGroup();

        results.forEach((result, index) => {
            const marker = L.marker([result.lat, result.lon], {
                icon: this.createCustomIcon('search', '🔍')
            });

            marker.bindPopup(`
                <div class="custom-popup">
                    <div class="popup-header">
                        <div class="popup-icon">🔍</div>
                        <div class="popup-title">${result.display_name}</div>
                    </div>
                    <div class="popup-details">
                        <p>Type: ${result.type}</p>
                        <p>Lat: ${parseFloat(result.lat).toFixed(6)}</p>
                        <p>Lng: ${parseFloat(result.lon).toFixed(6)}</p>
                    </div>
                </div>
            `);

            this.searchLayer.addLayer(marker);
        });

        this.searchLayer.addTo(this.map);

        // Zoom to first result
        if (results.length > 0) {
            this.map.setView([results[0].lat, results[0].lon], 15);
        }
    }

    // Quick search for POIs
    async quickSearch(amenityType) {
        this.showStatus(`Searching for ${amenityType}...`);

        try {
            const bounds = this.map.getBounds();
            const query = this.buildOverpassQuery(amenityType, bounds);
            
            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `data=${encodeURIComponent(query)}`
            });

            const data = await response.json();
            this.displayPOIResults(data, amenityType);
            
        } catch (error) {
            console.error('Quick search error:', error);
            this.showStatus('Search failed', 'error');
        }
    }

    // Build Overpass query
    buildOverpassQuery(amenityType, bounds) {
        const south = bounds.getSouth();
        const west = bounds.getWest();
        const north = bounds.getNorth();
        const east = bounds.getEast();
        
        return `
            [out:json][timeout:25];
            (
              node["amenity"="${amenityType}"](${south},${west},${north},${east});
              way["amenity"="${amenityType}"](${south},${west},${north},${east});
            );
            out geom;
        `;
    }

    // Display POI results
    displayPOIResults(data, amenityType) {
        // Clear previous POI results
        if (this.poiLayer) {
            this.map.removeLayer(this.poiLayer);
        }
        
        this.poiLayer = L.layerGroup();
        let count = 0;

        const icons = {
            restaurant: '🍽️', cafe: '☕', hospital: '🏥', fuel: '⛽',
            bank: '🏦', hotel: '🏨', school: '🏫', pharmacy: '💊', atm: '🏧'
        };

        data.elements.forEach(element => {
            let lat, lng, name = 'Unknown';
            
            if (element.type === 'node') {
                lat = element.lat;
                lng = element.lon;
            } else if (element.center) {
                lat = element.center.lat;
                lng = element.center.lon;
            } else return;

            if (element.tags && element.tags.name) {
                name = element.tags.name;
            }

            const marker = L.marker([lat, lng], {
                icon: this.createCustomIcon(amenityType, icons[amenityType] || '📍')
            });

            marker.bindPopup(this.createPOIPopup(name, amenityType, element.tags, lat, lng));
            this.poiLayer.addLayer(marker);
            count++;
        });

        this.poiLayer.addTo(this.map);
        this.showStatus(`Found ${count} ${amenityType}${count !== 1 ? 's' : ''}`);
    }

    // Create POI popup
    createPOIPopup(name, type, tags, lat, lng) {
        let content = `
            <div class="custom-popup">
                <div class="popup-header">
                    <div class="popup-icon">${this.getIconForType(type)}</div>
                    <div class="popup-title">${name}</div>
                </div>
                <div class="popup-details">
                    <p><strong>Type:</strong> ${type}</p>
        `;

        if (tags) {
            if (tags.opening_hours) content += `<p><strong>Hours:</strong> ${tags.opening_hours}</p>`;
            if (tags.phone) content += `<p><strong>Phone:</strong> ${tags.phone}</p>`;
            if (tags.website) content += `<p><strong>Website:</strong> <a href="${tags.website}" target="_blank">Visit</a></p>`;
        }

        content += `
                    <div style="margin-top: 10px;">
                        <button onclick="superMap.getDirections(${lat}, ${lng})" 
                                style="background: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 11px; margin-right: 5px;">
                            Directions
                        </button>
                        <button onclick="superMap.saveLocation(${lat}, ${lng})" 
                                style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 11px;">
                            Save
                        </button>
                    </div>
                </div>
            </div>
        `;

        return content;
    }

    // Get icon for POI type
    getIconForType(type) {
        const icons = {
            restaurant: '🍽️', cafe: '☕', hospital: '🏥', fuel: '⛽',
            bank: '🏦', hotel: '🏨', school: '🏫', pharmacy: '💊', atm: '🏧'
        };
        return icons[type] || '📍';
    }

    // Load weather data
    async loadWeatherData() {
        try {
            // Using OpenWeatherMap API (replace with your API key)
            const apiKey = 'demo'; // Replace with actual API key
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=-6.2088&lon=106.8456&appid=${apiKey}&units=metric`;
            
            // For demo purposes, use mock data
            this.weatherData = {
                temperature: 29,
                description: 'Partly cloudy',
                humidity: 75,
                windSpeed: 12
            };

            this.updateWeatherDisplay();
        } catch (error) {
            console.error('Weather loading error:', error);
            document.getElementById('weatherInfo').textContent = 'Weather data unavailable';
        }
    }

    // Update weather display
    updateWeatherDisplay() {
        const weatherInfo = document.getElementById('weatherInfo');
        if (this.weatherData) {
            weatherInfo.innerHTML = `
                ${this.weatherData.temperature}°C, ${this.weatherData.description}<br>
                <small>Humidity: ${this.weatherData.humidity}% • Wind: ${this.weatherData.windSpeed} km/h</small>
            `;
        }
    }

    // Setup location tracking
    setupLocationTracking() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = [position.coords.latitude, position.coords.longitude];
                    this.addUserLocationMarker();
                },
                (error) => {
                    console.log('Geolocation error:', error);
                }
            );
        }
    }

    // Add user location marker
    addUserLocationMarker() {
        if (this.userLocation) {
            const marker = L.marker(this.userLocation, {
                icon: this.createCustomIcon('user', '👤')
            }).addTo(this.map);

            marker.bindPopup('Your Location');
        }
    }

    // Get directions
    getDirections(lat, lng) {
        if (this.userLocation) {
            const url = `https://www.openstreetmap.org/directions?from=${this.userLocation[0]},${this.userLocation[1]}&to=${lat},${lng}&route=foot`;
            window.open(url, '_blank');
        } else {
            alert('Location access required for directions');
        }
    }

    // Share location
    shareLocation(lat, lng, name = 'Location') {
        const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`;
        if (navigator.share) {
            navigator.share({
                title: `${name} - SuperMap`,
                text: `Check out this location: ${name}`,
                url: url
            });
        } else {
            navigator.clipboard.writeText(url);
            this.showStatus('Location link copied to clipboard');
        }
    }

    // Enhanced share current view with PWA features
    shareCurrentView() {
        const center = this.map.getCenter();
        const zoom = this.map.getZoom();
        const url = `${window.location.origin}${window.location.pathname}?lat=${center.lat}&lng=${center.lng}&zoom=${zoom}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'SuperMap View',
                text: 'Check out this map view on SuperMap - Better than Google Maps!',
                url: url
            });
        } else {
            navigator.clipboard.writeText(url);
            this.showStatus('Map view link copied to clipboard');
        }
    }

    // Save location
    saveLocation(lat, lng) {
        const savedLocations = JSON.parse(localStorage.getItem('supermap_saved') || '[]');
        const newLocation = {
            id: Date.now(),
            lat: lat,
            lng: lng,
            timestamp: new Date().toISOString(),
            name: prompt('Enter a name for this location:') || 'Saved Location'
        };
        
        savedLocations.push(newLocation);
        localStorage.setItem('supermap_saved', JSON.stringify(savedLocations));
        this.showStatus('Location saved successfully');
    }

    // Toggle fullscreen
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    // Update visible data based on map bounds
    updateVisibleData() {
        // This would update visible POIs, traffic, etc. based on current view
        // Implementation depends on data sources and performance requirements
    }

    // Show status message
    showStatus(message, type = 'info') {
        const statusBar = document.getElementById('statusBar');
        const statusText = document.getElementById('statusText');
        
        statusText.textContent = message;
        statusBar.className = `status-bar show ${type}`;
        
        setTimeout(() => {
            statusBar.classList.remove('show');
        }, 3000);
    }

    // Debounce utility
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Check online status and show indicator
    setupOnlineStatus() {
        const updateOnlineStatus = () => {
            if (navigator.onLine) {
                this.showStatus('Back online! All features available.', 'success');
            } else {
                this.showStatus('You\'re offline. Using cached data.', 'warning');
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
    }
}

// Initialize SuperMap when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.superMap = new SuperMap();
});

// URL parameter handling for shared links
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const lat = urlParams.get('lat');
    const lng = urlParams.get('lng');
    const zoom = urlParams.get('zoom');
    
    if (lat && lng) {
        window.superMap.map.setView([parseFloat(lat), parseFloat(lng)], parseInt(zoom) || 15);
    }
});

console.log('🚀 SuperMap application loaded successfully!');