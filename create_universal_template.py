import requests
import json
import time

# --- CONFIGURATION ---
NOTION_TOKEN = "ntn_x71325876248iP57tCYBL88kMxTcfNtQutdFkfLajUl4IA"  # VOTRE token
PARENT_PAGE_ID = "30b1a922a66880308242e672bf62558a"  # La page où créer le template

headers = {
    "Authorization": f"Bearer {NOTION_TOKEN}",
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28"
}

def create_universal_template():
    """Crée un template universel avec tous les types de contenus NFC"""
    
    url = "https://api.notion.com/v1/databases"
    
    # Structure de la base avec toutes les colonnes nécessaires
    data = {
        "parent": {"type": "page_id", "page_id": PARENT_PAGE_ID},
        "title": [
            {
                "type": "text",
                "text": {
                    "content": "📱 Tags NFC Universels (Template)"
                }
            }
        ],
        "properties": {
            # Informations de base
            "Nom du Tag": {
                "title": {}
            },
            "UID": {
                "rich_text": {}
            },
            
            # Type de contenu (menu déroulant)
            "Type de contenu": {
                "select": {
                    "options": [
                        {"name": "🔗 URL / Lien web", "color": "blue"},
                        {"name": "📄 Texte simple", "color": "gray"},
                        {"name": "📇 Contact (VCard)", "color": "green"},
                        {"name": "📶 WiFi", "color": "purple"},
                        {"name": "📞 Téléphone", "color": "red"},
                        {"name": "✉️ Email", "color": "yellow"},
                        {"name": "💬 SMS", "color": "orange"},
                        {"name": "📍 Localisation", "color": "pink"}
                    ]
                }
            },
            
            # Contenu principal selon le type
            "URL / Lien": {
                "url": {}
            },
            "Texte": {
                "rich_text": {}
            },
            
            # Pour les contacts (VCard)
            "Contact - Nom": {
                "rich_text": {}
            },
            "Contact - Téléphone": {
                "rich_text": {}
            },
            "Contact - Email": {
                "email": {}
            },
            "Contact - Adresse": {
                "rich_text": {}
            },
            "Contact - Société": {
                "rich_text": {}
            },
            "Contact - Note": {
                "rich_text": {}
            },
            
            # Pour WiFi
            "WiFi - SSID": {
                "rich_text": {}
            },
            "WiFi - Mot de passe": {
                "rich_text": {}
            },
            "WiFi - Type de sécurité": {
                "select": {
                    "options": [
                        {"name": "WPA/WPA2", "color": "green"},
                        {"name": "WEP", "color": "yellow"},
                        {"name": "Aucun", "color": "red"}
                    ]
                }
            },
            
            # Pour Téléphone/SMS
            "Numéro de téléphone": {
                "phone_number": {}
            },
            "Message prédefini": {
                "rich_text": {}
            },
            
            # Pour Email
            "Adresse email": {
                "email": {}
            },
            "Objet email": {
                "rich_text": {}
            },
            "Corps email": {
                "rich_text": {}
            },
            
            # Pour Localisation
            "Latitude": {
                "number": {}
            },
            "Longitude": {
                "number": {}
            },
            "Adresse": {
                "rich_text": {}
            },
            
            # Pour les fichiers
            "Fichier PDF": {
                "files": {}
            },
            
            # Métadonnées
            "Statut": {
                "select": {
                    "options": [
                        {"name": "Actif", "color": "green"},
                        {"name": "Inactif", "color": "red"},
                        {"name": "À configurer", "color": "yellow"},
                        {"name": "En maintenance", "color": "orange"}
                    ]
                }
            },
            "Support": {
                "select": {
                    "options": [
                        {"name": "Carte PVC", "color": "blue"},
                        {"name": "Sticker NFC", "color": "orange"},
                        {"name": "Porte-clé", "color": "purple"},
                        {"name": "Collier animal", "color": "green"},
                        {"name": "Support comptoir", "color": "pink"}
                    ]
                }
            },
            "Date de création": {
                "date": {}
            },
            "Dernière modification": {
                "date": {}
            },
            "Scans totaux": {
                "number": {"format": "number"}
            },
            "Notes": {
                "rich_text": {}
            }
        }
    }
    
    print("🚀 Création du template universel NFC...")
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 200:
        db_data = response.json()
        db_id = db_data["id"]
        print(f"✅ Template créé avec succès !")
        print(f"📊 ID de la base : {db_id}")
        print(f"🔗 URL directe : https://notion.so/{db_id.replace('-', '')}")
        return db_id
    else:
        print(f"❌ Erreur : {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        return None

def add_examples(db_id):
    """Ajoute des exemples pour chaque type de contenu"""
    
    url = "https://api.notion.com/v1/pages"
    
    # Exemple 1 : URL (Avis Google)
    exemple1 = {
        "parent": {"database_id": db_id},
        "properties": {
            "Nom du Tag": {"title": [{"text": {"content": "Avis Google Restaurant"}}]},
            "UID": {"rich_text": [{"text": {"content": "AVIS-001"}}]},
            "Type de contenu": {"select": {"name": "🔗 URL / Lien web"}},
            "URL / Lien": {"url": "https://g.page/restaurant-avis"},
            "Statut": {"select": {"name": "Actif"}},
            "Support": {"select": {"name": "Sticker NFC"}},
            "Date de création": {"date": {"start": time.strftime("%Y-%m-%d")}},
            "Scans totaux": {"number": 0}
        }
    }
    
    # Exemple 2 : Contact (Collier animal)
    exemple2 = {
        "parent": {"database_id": db_id},
        "properties": {
            "Nom du Tag": {"title": [{"text": {"content": "Collier - Médor"}}]},
            "UID": {"rich_text": [{"text": {"content": "ANIMAL-001"}}]},
            "Type de contenu": {"select": {"name": "📇 Contact (VCard)"}},
            "Contact - Nom": {"rich_text": [{"text": {"content": "Médor (Chien)"}}]},
            "Contact - Téléphone": {"rich_text": [{"text": {"content": "06 12 34 56 78"}}]},
            "Contact - Note": {"rich_text": [{"text": {"content": "Propriétaire: Jean Dupont - En cas de perte, appeler. Récompense assurée."}}]},
            "Statut": {"select": {"name": "Actif"}},
            "Support": {"select": {"name": "Collier animal"}},
            "Date de création": {"date": {"start": time.strftime("%Y-%m-%d")}},
            "Scans totaux": {"number": 0}
        }
    }
    
    # Exemple 3 : WiFi Client
    exemple3 = {
        "parent": {"database_id": db_id},
        "properties": {
            "Nom du Tag": {"title": [{"text": {"content": "WiFi Restaurant"}}]},
            "UID": {"rich_text": [{"text": {"content": "WIFI-001"}}]},
            "Type de contenu": {"select": {"name": "📶 WiFi"}},
            "WiFi - SSID": {"rich_text": [{"text": {"content": "Restaurant-Guest"}}]},
            "WiFi - Mot de passe": {"rich_text": [{"text": {"content": "bienvenue123"}}]},
            "WiFi - Type de sécurité": {"select": {"name": "WPA/WPA2"}},
            "Statut": {"select": {"name": "Actif"}},
            "Support": {"select": {"name": "Carte PVC"}},
            "Date de création": {"date": {"start": time.strftime("%Y-%m-%d")}},
            "Scans totaux": {"number": 0}
        }
    }
    
    # Exemple 4 : Menu PDF
    exemple4 = {
        "parent": {"database_id": db_id},
        "properties": {
            "Nom du Tag": {"title": [{"text": {"content": "Menu du Restaurant"}}]},
            "UID": {"rich_text": [{"text": {"content": "MENU-001"}}]},
            "Type de contenu": {"select": {"name": "🔗 URL / Lien web"}},
            "URL / Lien": {"url": "https://drive.google.com/file/d/12345/view"},
            "Statut": {"select": {"name": "Actif"}},
            "Support": {"select": {"name": "Support comptoir"}},
            "Date de création": {"date": {"start": time.strftime("%Y-%m-%d")}},
            "Scans totaux": {"number": 0}
        }
    }
    
    # Exemple 5 : Appel direct
    exemple5 = {
        "parent": {"database_id": db_id},
        "properties": {
            "Nom du Tag": {"title": [{"text": {"content": "Contact Urgence"}}]},
            "UID": {"rich_text": [{"text": {"content": "URGENCE-001"}}]},
            "Type de contenu": {"select": {"name": "📞 Téléphone"}},
            "Numéro de téléphone": {"phone_number": "+33123456789"},
            "Statut": {"select": {"name": "Actif"}},
            "Support": {"select": {"name": "Porte-clé"}},
            "Date de création": {"date": {"start": time.strftime("%Y-%m-%d")}},
            "Scans totaux": {"number": 0}
        }
    }
    
    # Exemple 6 : Email
    exemple6 = {
        "parent": {"database_id": db_id},
        "properties": {
            "Nom du Tag": {"title": [{"text": {"content": "Contact Commercial"}}]},
            "UID": {"rich_text": [{"text": {"content": "EMAIL-001"}}]},
            "Type de contenu": {"select": {"name": "✉️ Email"}},
            "Adresse email": {"email": "contact@restaurant.fr"},
            "Objet email": {"rich_text": [{"text": {"content": "Demande de réservation"}}]},
            "Corps email": {"rich_text": [{"text": {"content": "Bonjour, je souhaiterais réserver une table pour ..."}}]},
            "Statut": {"select": {"name": "Actif"}},
            "Support": {"select": {"name": "Carte PVC"}},
            "Date de création": {"date": {"start": time.strftime("%Y-%m-%d")}},
            "Scans totaux": {"number": 0}
        }
    }
    
    exemples = [exemple1, exemple2, exemple3, exemple4, exemple5, exemple6]
    
    print("\n📝 Ajout des exemples...")
    for i, exemple in enumerate(exemples, 1):
        response = requests.post(url, headers=headers, json=exemple)
        if response.status_code == 200:
            print(f"  ✅ Exemple {i} ajouté")
        else:
            print(f"  ❌ Erreur exemple {i}: {response.status_code}")
        time.sleep(0.5)  # Petite pause pour éviter de surcharger l'API
    
    print("\n🎯 Exemples ajoutés avec succès !")

def make_template_public(db_id):
    """Rend la base publiable comme template"""
    
    print("\n🔓 Configuration du partage public...")
    
    # Note: Cette étape doit être faite manuellement dans l'interface Notion
    print("""
    ⚠️  Pour rendre ce template public et duplicable :
    
    1. Ouvrez la base dans Notion : https://notion.so/""" + db_id.replace('-', '') + """
    2. Cliquez sur "Partager" en haut à droite
    3. Activez "Partager sur le web"
    4. COCHEZ "Autoriser la duplication comme template"
    5. Copiez le lien public généré
    """)

if __name__ == "__main__":
    print("="*60)
    print("🗄️  CRÉATION DU TEMPLATE UNIVERSEL NFC")
    print("="*60)
    
    # Étape 1 : Créer la base
    db_id = create_universal_template()
    
    if db_id:
        time.sleep(2)  # Pause pour laisser l'API se stabiliser
        
        # Étape 2 : Ajouter des exemples
        add_examples(db_id)
        
        # Étape 3 : Instructions pour rendre public
        make_template_public(db_id)
        
        print("\n" + "="*60)
        print("🎉 TEMPLATE CRÉÉ AVEC SUCCÈS !")
        print("="*60)
        print(f"\n📁 Votre template est prêt :")
        print(f"🔗 https://notion.so/{db_id.replace('-', '')}")
        print("\n📝 Prochaines étapes :")
        print("1. Rendez-le public (instructions ci-dessus)")
        print("2. Mettez à jour votre formulaire avec ce lien")
        print("3. Supprimez les exemples ou gardez-les pour guider les clients")