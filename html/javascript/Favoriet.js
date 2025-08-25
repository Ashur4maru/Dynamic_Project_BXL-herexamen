// Favorieten Pagina JavaScript - Version Corrigée
document.addEventListener('DOMContentLoaded', () => {
    console.log('Favorieten pagina geladen');
    
    // Fonction pour afficher les favoris
    function displayFavorites() {
        const favoritesList = document.getElementById('favorite-locations');
        if (!favoritesList) {
            console.error('Favorites container niet gevonden');
            return;
        }

        // Récupérer les favoris depuis localStorage
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        console.log('Geladen favorieten:', favorites.length, favorites);

        if (favorites.length === 0) {
            favoritesList.innerHTML = `
                <div class="no-favorites" style="
                    text-align: center;
                    padding: 60px 20px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    margin: 20px 0;
                ">
                    <h3 style="color: #38577C; font-size: 24px; margin-bottom: 15px;">Nog geen favorieten</h3>
                    <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 10px;">
                        Je hebt nog geen favoriete parkeerlocaties toegevoegd.
                    </p>
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">
                        Ga naar de <a href="index.html#explore" style="color: #38577C; text-decoration: none; font-weight: bold;">hoofdpagina</a> 
                        om parkeerlocaties te verkennen en toe te voegen aan je favorieten.
                    </p>
                </div>
            `;
            return;
        }

        // Créer le HTML pour chaque favori
        const favoritesHTML = favorites.map((location, index) => {
            const name = location.name_nl || location.nom_fr || 'Naamloos parking';
            const address = location.adres_ || location.adresse || 'Adres niet beschikbaar';
            const capacity = location.capacity || 'Onbekend';
            const operator = location.operator_fr || location.operator_nl || 'Onbekend';
            const phone = location.contact_phone || 'Niet beschikbaar';
            
            // Gestion améliorée des places handicapées
            let disabled = 'Niet opgegeven';
            if (location.disabledcapacity !== undefined && location.disabledcapacity !== null && location.disabledcapacity !== '') {
                disabled = location.disabledcapacity;
            } else if (location.disabled_capacity !== undefined && location.disabled_capacity !== null && location.disabled_capacity !== '') {
                disabled = location.disabled_capacity;
            }
            
            // S'assurer que c'est un nombre
            if (disabled !== 'Niet opgegeven' && !isNaN(disabled)) {
                disabled = parseInt(disabled) || 0;
            }

            return `
                <div class="favorite-item" data-index="${index}" style="
                    background: white;
                    border: 1px solid #e9ecef;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    margin-bottom: 20px;
                    transition: all 0.3s ease;
                ">
                    <div class="favorite-header" style="
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 15px;
                    ">
                        <h4 style="
                            color: #38577C;
                            margin: 0;
                            font-size: 18px;
                            flex: 1;
                            margin-right: 10px;
                        ">${name}</h4>
                        <button class="remove-favorite" data-index="${index}" title="Verwijder uit favorieten" style="
                            background: #f44336;
                            color: white;
                            border: none;
                            width: 30px;
                            height: 30px;
                            border-radius: 50%;
                            cursor: pointer;
                            font-size: 14px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            transition: all 0.3s ease;
                        ">
                            🗑️
                        </button>
                    </div>
                    <div class="favorite-details">
                        <p style="margin-bottom: 8px; font-size: 14px; color: #555;">
                            <strong style="color: #38577C;">📍</strong> ${address}
                        </p>
                        <p style="margin-bottom: 8px; font-size: 14px; color: #555;">
                            <strong style="color: #38577C;">🚗</strong> ${capacity} plaatsen
                        </p>
                        <p style="margin-bottom: 8px; font-size: 14px; color: #555;">
                            <strong style="color: #38577C;">🏢</strong> ${operator}
                        </p>
                        <p style="margin-bottom: 8px; font-size: 14px; color: #555;">
                            <strong style="color: #38577C;">📞</strong> ${phone}
                        </p>
                        <p style="margin-bottom: 8px; font-size: 14px; color: #555;">
                            <strong style="color: #38577C;">♿</strong> ${disabled} ${disabled === 'Niet opgegeven' ? '' : 'handicap plaatsen'}
                        </p>
                    </div>
                    <div class="favorite-actions" style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
                        ${location.geo_point_2d ? `
                            <button class="show-directions" 
                                    data-lat="${location.geo_point_2d.lat}" 
                                    data-lon="${location.geo_point_2d.lon}"
                                    style="
                                        background: #38577C;
                                        color: white;
                                        border: none;
                                        padding: 8px 12px;
                                        border-radius: 6px;
                                        cursor: pointer;
                                        font-size: 13px;
                                        transition: all 0.3s ease;
                                        flex: 1;
                                    ">
                                🗺️ Routebeschrijving
                            </button>
                        ` : ''}
                        <button class="copy-address" 
                                data-address="${address}"
                                style="
                                    background: #4CAF50;
                                    color: white;
                                    border: none;
                                    padding: 8px 12px;
                                    border-radius: 6px;
                                    cursor: pointer;
                                    font-size: 13px;
                                    transition: all 0.3s ease;
                                    flex: 1;
                                ">
                            📋 Kopieer adres
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        favoritesList.innerHTML = `
            <div class="favorites-header" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding: 20px;
                background: linear-gradient(135deg, #38577C 0%, #7897BC 100%);
                color: white;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            ">
                <h3 style="color: white; margin: 0; font-size: 24px;">
                    Je hebt ${favorites.length} favoriet${favorites.length === 1 ? '' : 'e'} parkeerlocatie${favorites.length === 1 ? '' : 's'}
                </h3>
                <div class="favorites-actions" style="display: flex; gap: 10px;">
                    <button id="clear-all-favorites" style="
                        background: rgba(255, 255, 255, 0.2);
                        color: white;
                        border: 2px solid rgba(255, 255, 255, 0.3);
                        padding: 8px 16px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.3s ease;
                    ">
                        🗑️ Wis alle favorieten
                    </button>
                    <button id="export-favorites" style="
                        background: rgba(255, 255, 255, 0.2);
                        color: white;
                        border: 2px solid rgba(255, 255, 255, 0.3);
                        padding: 8px 16px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.3s ease;
                    ">
                        📤 Exporteer favorieten
                    </button>
                </div>
            </div>
            <div class="favorites-grid" style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 20px;
                margin-bottom: 40px;
            ">
                ${favoritesHTML}
            </div>
        `;

        // Ajouter les événements pour les boutons hover
        addHoverEffects();
    }

    // Fonction pour ajouter les effets hover
    function addHoverEffects() {
        // Boutons remove favorite
        document.querySelectorAll('.remove-favorite').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.background = '#d32f2f';
                btn.style.transform = 'scale(1.1)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = '#f44336';
                btn.style.transform = 'scale(1)';
            });
        });

        // Boutons show directions
        document.querySelectorAll('.show-directions').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.background = '#2a4158';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = '#38577C';
            });
        });

        // Boutons copy address
        document.querySelectorAll('.copy-address').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.background = '#45a049';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = '#4CAF50';
            });
        });

        // Boutons header
        const clearBtn = document.getElementById('clear-all-favorites');
        const exportBtn = document.getElementById('export-favorites');
        
        if (clearBtn) {
            clearBtn.addEventListener('mouseenter', () => {
                clearBtn.style.background = '#f44336';
                clearBtn.style.borderColor = '#f44336';
            });
            clearBtn.addEventListener('mouseleave', () => {
                clearBtn.style.background = 'rgba(255, 255, 255, 0.2)';
                clearBtn.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            });
        }

        if (exportBtn) {
            exportBtn.addEventListener('mouseenter', () => {
                exportBtn.style.background = '#4CAF50';
                exportBtn.style.borderColor = '#4CAF50';
            });
            exportBtn.addEventListener('mouseleave', () => {
                exportBtn.style.background = 'rgba(255, 255, 255, 0.2)';
                exportBtn.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            });
        }
    }

    // Event listeners principaux
    document.addEventListener('click', (event) => {
        // Supprimer favoris
        if (event.target.classList.contains('remove-favorite')) {
            const index = parseInt(event.target.dataset.index);
            removeFavorite(index);
        }

        // Afficher directions
        if (event.target.classList.contains('show-directions')) {
            const lat = event.target.dataset.lat;
            const lon = event.target.dataset.lon;
            showDirections(lat, lon);
        }

        // Copier adresse
        if (event.target.classList.contains('copy-address')) {
            const address = event.target.dataset.address;
            copyToClipboard(address);
        }

        // Effacer tous les favoris
        if (event.target.id === 'clear-all-favorites') {
            clearAllFavorites();
        }

        // Exporter favoris
        if (event.target.id === 'export-favorites') {
            exportFavorites();
        }
    });

    // Fonction pour supprimer un favoris
    function removeFavorite(index) {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        if (index >= 0 && index < favorites.length) {
            const locationName = favorites[index].name_nl || favorites[index].nom_fr || 'Parkeerlocatie';
            
            if (confirm(`Weet je zeker dat je "${locationName}" wilt verwijderen uit je favorieten?`)) {
                favorites.splice(index, 1);
                localStorage.setItem('favorites', JSON.stringify(favorites));
                displayFavorites(); // Recharger la liste
                
                // Afficher confirmation
                showNotification(`"${locationName}" is verwijderd uit je favorieten.`, 'success');
            }
        }
    }

    // Fonction pour effacer tous les favoris
    function clearAllFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        if (favorites.length === 0) {
            showNotification('Je hebt geen favorieten om te wissen.', 'info');
            return;
        }

        if (confirm(`Weet je zeker dat je alle ${favorites.length} favorieten wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`)) {
            localStorage.removeItem('favorites');
            displayFavorites();
            showNotification('Alle favorieten zijn gewist.', 'success');
        }
    }

    // Fonction pour afficher les directions
    function showDirections(lat, lon) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
        window.open(url, '_blank');
    }

    // Fonction pour copier l'adresse
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            showNotification('Adres gekopieerd naar klembord!', 'success');
        } catch (err) {
            // Fallback pour navigateurs plus anciens
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                showNotification('Adres gekopieerd naar klembord!', 'success');
            } catch (err) {
                showNotification('Kon adres niet kopiëren.', 'error');
            }
            
            document.body.removeChild(textArea);
        }
    }

    // Fonction pour exporter les favoris
    function exportFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        if (favorites.length === 0) {
            showNotification('Je hebt geen favorieten om te exporteren.', 'info');
            return;
        }

        // Créer fichier CSV
        const headers = ['Naam', 'Adres', 'Capaciteit', 'Operator', 'Telefoon', 'Handicap Plaatsen'];
        const csvContent = [
            headers.join(','),
            ...favorites.map(location => {
                const name = (location.name_nl || location.nom_fr || 'Naamloos parking').replace(/,/g, ';');
                const address = (location.adres_ || location.adresse || 'Niet beschikbaar').replace(/,/g, ';');
                const capacity = location.capacity || 'Onbekend';
                const operator = (location.operator_fr || location.operator_nl || 'Onbekend').replace(/,/g, ';');
                const phone = location.contact_phone || 'Niet beschikbaar';
                const disabled = location.disabledcapacity || location.disabled_capacity || 'Niet opgegeven';
                
                return [name, address, capacity, operator, phone, disabled].join(',');
            })
        ].join('\n');

        // Télécharger fichier
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'mijn-favoriete-parkings.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Favorieten geëxporteerd als CSV bestand!', 'success');
    }

    // Fonction pour afficher les notifications
    function showNotification(message, type = 'info') {
        // Supprimer notifications existantes
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
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">&times;</button>
        `;

        // Ajouter à la page
        document.body.appendChild(notification);

        // Animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        // Auto supprimer après 5 secondes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Fermeture manuelle
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    // Initialiser la page
    displayFavorites();
    
    console.log('Favorieten pagina setup compleet');
});