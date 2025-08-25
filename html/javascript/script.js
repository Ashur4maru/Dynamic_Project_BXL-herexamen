document.addEventListener('DOMContentLoaded', () => {
    console.log('Script geladen - Brussels Explorer');
    
    // Initialize the map
    const map = L.map('map').setView([50.85045, 4.34878], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    let locationsData = [];
    let markers = [];

    // Test data pour les cas où l'API ne fonctionne pas
    const testData = [
        {
            name_nl: "Parking Albertina",
            adres_: "Albertinastraat 1, 1000 Brussel",
            capacity: 350,
            operator_fr: "City Parking",
            contact_phone: "+32 2 123 4567",
            disabledcapacity: 15,
            geo_point_2d: { lat: 50.8466, lon: 4.3528 }
        },
        {
            name_nl: "Parking Anneessens",
            adres_: "Anneessensplein 1, 1000 Brussel",
            capacity: 180,
            operator_fr: "Interparking",
            contact_phone: "+32 2 234 5678",
            disabledcapacity: 8,
            geo_point_2d: { lat: 50.8445, lon: 4.3488 }
        },
        {
            name_nl: "Parking Grote Markt",
            adres_: "Grote Markt 1, 1000 Brussel",
            capacity: 120,
            operator_fr: "Q-Park",
            contact_phone: "+32 2 345 6789",
            disabledcapacity: 6,
            geo_point_2d: { lat: 50.8467, lon: 4.3525 }
        },
        {
            name_nl: "Parking Centraal Station",
            adres_: "Carrefour de l'Europe 2, 1000 Brussel",
            capacity: 850,
            operator_fr: "Europlaza",
            contact_phone: "+32 2 456 7890",
            disabledcapacity: 40,
            geo_point_2d: { lat: 50.8458, lon: 4.3571 }
        }
    ];

    // Fonction pour créer la boîte des emplacements
    function createLocationBox() {
        const locationsContainer = document.getElementById('locations');
        if (!locationsContainer) {
            console.error('Locations container niet gevonden');
            return;
        }
        
        locationsContainer.innerHTML = `
            <div class="locations-header">
                <h3>Parkeerlocaties</h3>
                <div class="loading-indicator" style="display: none;">
                    <p>Data wordt geladen...</p>
                </div>
            </div>
            <div class="locations-list"></div>
        `;
    }

    // Fonction pour créer un élément de lieu de parking
    function createLocationElement(location) {
        const element = document.createElement('div');
        element.classList.add('location-item');
        
        // Fallbacks sécurisés pour les données manquantes
        const name = location.name_nl || location.nom_fr || 'Naamloos parking';
        const address = location.adres_ || location.adresse || 'Adres niet beschikbaar';
        const capacity = location.capacity || 'Onbekend';
        const operator = location.operator_fr || location.operator_nl || 'Onbekend';
        const phone = location.contact_phone || 'Niet beschikbaar';
        const disabled = location.disabledcapacity || location.disabled_capacity || 'Niet opgegeven';
        
        // Vérifier si cet élément est déjà un favori
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const isFavorite = favorites.some(fav => {
            const favName = fav.name_nl || fav.nom_fr;
            return favName === name;
        });
        
        element.innerHTML = `
            <h4>${name}</h4>
            <p class="adres"><strong>📍</strong> ${address}</p>
            <p class="capacity"><strong>🚗</strong> ${capacity} plaatsen</p>
            <p class="operator"><strong>🏢</strong> ${operator}</p>
            <p class="phone"><strong>📞</strong> ${phone}</p>
            <p class="handicap"><strong>♿</strong> ${disabled} ${disabled === 'Niet opgegeven' ? '' : 'handicap plaatsen'}</p>
            <button class="favorite-button ${isFavorite ? 'favorited' : ''}" 
                    data-location='${JSON.stringify(location).replace(/'/g, "&apos;")}'
                    ${isFavorite ? 'disabled' : ''}
                    style="
                        background: ${isFavorite ? '#6c757d' : '#38577C'};
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: ${isFavorite ? 'not-allowed' : 'pointer'};
                        margin-top: 10px;
                        width: 100%;
                        transition: all 0.3s ease;
                    ">
                ${isFavorite ? '✓ In favorieten' : '❤ Voeg toe aan favorieten'}
            </button>
        `;
        return element;
    }

    // Fonction pour afficher tous les emplacements
    function displayLocations(data) {
        console.log('Displaying locations:', data.length);
        
        const locationsList = document.querySelector('.locations-list');
        if (!locationsList) {
            console.error('Locations list niet gevonden');
            return;
        }

        // Effacer le contenu existant
        locationsList.innerHTML = '';
        clearMarkers();

        if (data.length === 0) {
            locationsList.innerHTML = '<p class="no-results">Geen parkeerlocaties gevonden.</p>';
            return;
        }

        data.forEach((location, index) => {
            try {
                const locationElement = createLocationElement(location);
                locationsList.appendChild(locationElement);

                // Ajouter un marqueur à la carte
                if (location.geo_point_2d && location.geo_point_2d.lat && location.geo_point_2d.lon) {
                    createMarker(location, index);
                }
            } catch (error) {
                console.error('Fout bij het maken van locatie element:', error, location);
            }
        });

        // Mettre à jour le compteur dans l'en-tête
        const header = document.querySelector('.locations-header h3');
        if (header) {
            header.textContent = `Parkeerlocaties (${data.length})`;
        }
    }

    // Fonction pour créer un marqueur
    function createMarker(location, index) {
        try {
            const marker = L.circleMarker(
                [location.geo_point_2d.lat, location.geo_point_2d.lon], 
                {
                    color: getColor(location.capacity),
                    radius: 8,
                    fillOpacity: 0.8,
                    weight: 2
                }
            ).addTo(map);

            const name = location.name_nl || location.nom_fr || 'Naamloos parking';
            const address = location.adres_ || location.adresse || 'Adres niet beschikbaar';
            const capacity = location.capacity || 'Onbekend';

            marker.bindPopup(`
                <div class="popup-content">
                    <h3>${name}</h3>
                    <p><strong>Adres:</strong> ${address}</p>
                    <p><strong>Capaciteit:</strong> ${capacity} plaatsen</p>
                </div>
            `);

            markers.push(marker);
        } catch (error) {
            console.error('Fout bij het maken van marker:', error, location);
        }
    }

    // Effacer tous les marqueurs
    function clearMarkers() {
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
    }

    // Déterminer la couleur en fonction de la capacité
    function getColor(capacity) {
        if (!capacity || capacity === 'Onbekend') return 'gray';
        const cap = parseInt(capacity);
        return cap > 500 ? 'blue' : cap > 100 ? 'green' : 'red';
    }

    // Fonction pour afficher la section des favoris sur la page principale
    function displayFavoritesSection() {
        const favoritesList = document.getElementById('favorite-locations');
        if (!favoritesList) {
            return; // Cette fonction est optionnelle pour la page des favoris
        }

        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        if (favorites.length === 0) {
            favoritesList.innerHTML = '<p class="no-favorites">Nog geen favoriete parkeerlocaties toegevoegd.</p>';
            return;
        }

        // Afficher seulement les 3 premiers favoris sur la page principale
        const favoritesToShow = favorites.slice(0, 3);
        const favoritesHTML = favoritesToShow.map((location, index) => {
            const name = location.name_nl || location.nom_fr || 'Naamloos parking';
            const address = location.adres_ || location.adresse || 'Adres niet beschikbaar';
            const capacity = location.capacity || 'Onbekend';
            
            return `
                <div class="favorite-item">
                    <h4>${name}</h4>
                    <p><strong>📍</strong> ${address}</p>
                    <p><strong>🚗</strong> ${capacity} plaatsen</p>
                    <button class="remove-favorite" data-index="${index}" data-name="${name}">
                        🗑️ Verwijder
                    </button>
                </div>
            `;
        }).join('');

        favoritesList.innerHTML = `
            ${favoritesHTML}
            ${favorites.length > 3 ? `<p style="text-align: center; margin-top: 15px;"><a href="favorites.html">Bekijk alle ${favorites.length} favorieten</a></p>` : ''}
        `;
    }

    // Initialiser la boîte d'emplacements
    createLocationBox();

    // Event listeners pour les filtres
    document.getElementById('filterButton')?.addEventListener('click', () => {
        const searchQuery = document.getElementById('search')?.value.toLowerCase() || '';
        const filteredData = locationsData.filter(location => {
            const name = (location.name_nl || location.nom_fr || '').toLowerCase();
            const address = (location.adres_ || location.adresse || '').toLowerCase();
            return name.includes(searchQuery) || address.includes(searchQuery);
        });
        displayLocations(filteredData);
    });

    // Rechercher avec la touche Entrée
    document.getElementById('search')?.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            document.getElementById('filterButton')?.click();
        }
    });

    let isCapacityDescending = true;
    document.getElementById('capaciteit')?.addEventListener('click', () => {
        const sortedData = [...locationsData].sort((a, b) => {
            const capacityA = parseInt(a.capacity) || 0;
            const capacityB = parseInt(b.capacity) || 0;
            return isCapacityDescending ? capacityB - capacityA : capacityA - capacityB;
        });
        isCapacityDescending = !isCapacityDescending;
        displayLocations(sortedData);
    });

    document.getElementById('alfabetisch')?.addEventListener('click', () => {
        const sortedData = [...locationsData].sort((a, b) => {
            const nameA = a.name_nl || a.nom_fr || '';
            const nameB = b.name_nl || b.nom_fr || '';
            return nameA.localeCompare(nameB);
        });
        displayLocations(sortedData);
    });

    // Event delegation pour les éléments dynamiques
    document.addEventListener('click', (event) => {
        // Clic sur le bouton favori
        if (event.target.classList.contains('favorite-button') && !event.target.disabled) {
            try {
                const locationData = JSON.parse(event.target.dataset.location.replace(/&apos;/g, "'"));
                const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                const name = locationData.name_nl || locationData.nom_fr || 'Naamloos parking';
                
                // Vérifier si ce n'est pas déjà un favori
                const isAlreadyFavorite = favorites.some(fav => {
                    const favName = fav.name_nl || fav.nom_fr;
                    return favName === name;
                });
                
                if (!isAlreadyFavorite) {
                    favorites.push(locationData);
                    localStorage.setItem('favorites', JSON.stringify(favorites));
                    
                    // Mettre à jour l'état du bouton
                    event.target.textContent = '✓ In favorieten';
                    event.target.disabled = true;
                    event.target.classList.add('favorited');
                    event.target.style.background = '#6c757d';
                    event.target.style.cursor = 'not-allowed';
                    
                    // Mettre à jour la section des favoris
                    displayFavoritesSection();
                    
                    console.log('Favoriet toegevoegd:', name);
                    
                    // Afficher notification de succès
                    showNotification(`"${name}" is toegevoegd aan je favorieten!`);
                }
            } catch (error) {
                console.error('Fout bij toevoegen favoriet:', error);
                showNotification('Er is een fout opgetreden bij het toevoegen van de favoriet.', 'error');
            }
        }

        // Clic sur le bouton supprimer favori (depuis la section favoris de la page principale)
        if (event.target.classList.contains('remove-favorite')) {
            const index = parseInt(event.target.dataset.index);
            const name = event.target.dataset.name;
            
            if (confirm(`Weet je zeker dat je "${name}" wilt verwijderen uit je favorieten?`)) {
                const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                favorites.splice(index, 1);
                localStorage.setItem('favorites', JSON.stringify(favorites));
                
                // Mettre à jour la section des favoris
                displayFavoritesSection();
                
                // Réactiver le bouton "Voeg toe aan favorieten" s'il existe
                const addButtons = document.querySelectorAll('.favorite-button');
                addButtons.forEach(button => {
                    try {
                        const locationData = JSON.parse(button.dataset.location.replace(/&apos;/g, "'"));
                        const buttonName = locationData.name_nl || locationData.nom_fr;
                        if (buttonName === name) {
                            button.textContent = '❤ Voeg toe aan favorieten';
                            button.disabled = false;
                            button.classList.remove('favorited');
                            button.style.background = '#38577C';
                            button.style.cursor = 'pointer';
                        }
                    } catch (error) {
                        console.error('Fout bij updaten favorite button:', error);
                    }
                });
                
                console.log('Favoriet verwijderd:', name);
                showNotification(`"${name}" is verwijderd uit je favorieten.`);
            }
        }
    });

    // Fonction pour afficher les notifications
    function showNotification(message, type = 'success') {
        // Supprimer les notifications existantes
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: white;
            border-radius: 8px;
            padding: 15px 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            z-index: 10000;
            min-width: 300px;
            animation: slideInRight 0.3s ease;
            border-left: 4px solid ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        `;
        
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close" style="
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #999;
            ">&times;</button>
        `;

        // Ajouter à la page
        document.body.appendChild(notification);

        // Auto supprimer après 3 secondes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);

        // Fermeture manuelle
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    // Fonction pour charger les données
    async function loadData() {
        console.log('Laden van parkeerdata...');
        
        const loadingIndicator = document.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }
        
        const apiUrls = [
            'https://bruxellesdata.opendatasoft.com/api/explore/v2.1/catalog/datasets/bruxelles_parkings_publics/records?limit=50&offset=0',
            'https://opendata.brussels.be/api/explore/v2.1/catalog/datasets/bruxelles_parkings_publics/records?limit=50&offset=0'
        ];

        let dataLoaded = false;

        for (const url of apiUrls) {
            try {
                console.log(`Proberen API URL: ${url}`);
                const response = await fetch(url);
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.results && data.results.length > 0) {
                        console.log(`Succesvol data geladen van: ${url}`, data.results.length, 'items');
                        locationsData = data.results;
                        displayLocations(locationsData);
                        dataLoaded = true;
                        break;
                    }
                }
            } catch (error) {
                console.warn(`API URL ${url} werkt niet:`, error);
                continue;
            }
        }

        // Si aucune API ne fonctionne, utiliser les données de test
        if (!dataLoaded) {
            console.log('API niet beschikbaar, gebruik test data');
            locationsData = testData;
            displayLocations(locationsData);
            
            // Afficher un avis à l'utilisateur
            const locationsList = document.querySelector('.locations-list');
            if (locationsList) {
                const notice = document.createElement('div');
                notice.style.cssText = 'background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin-bottom: 15px; border-radius: 5px; color: #856404;';
                notice.innerHTML = '<strong>Opmerking:</strong> API tijdelijk niet beschikbaar. Toont demo data.';
                locationsList.insertBefore(notice, locationsList.firstChild);
            }
        }

        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }

        // Charger les favoris après le chargement des données
        displayFavoritesSection();
    }

    // Ajouter le CSS pour l'animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .favorite-button:hover:not(:disabled) {
            background: #2a4158 !important;
            transform: translateY(-1px);
        }
        
        .favorite-button.favorited {
            background: #6c757d !important;
            cursor: not-allowed !important;
        }
        
        .location-item:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateY(-2px);
            border-color: #38577C;
        }
    `;
    document.head.appendChild(style);

    // Démarrer le chargement des données
    loadData();

    console.log('Script setup compleet');
});