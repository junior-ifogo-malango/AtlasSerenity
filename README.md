# 🌿 AtlasSerenity

Plateforme web de réservation dédiée à l'écotourisme au Maroc.

## 📋 Description

AtlasSerenity est une marketplace bilatérale mettant en relation 
des opérateurs locaux marocains (guides, coopératives, éco-lodges) 
et des voyageurs autour d'activités à faible impact environnemental.

## 🚀 Fonctionnalités

### Espace Voyageur
- Recherche tolérante aux variantes grammaticales
- Réservation d'activités avec billet QR hors-ligne
- Système de favoris
- Interface bilingue FR/EN

### Espace Opérateur
- Création et gestion des activités
- Gestion des disponibilités et photos
- Questionnaire éco-responsable
- Vérification d'identité

### Espace Administrateur
- Validation des comptes et activités
- Attribution du badge éco-responsable
- Dashboard CRM

## 🛠️ Stack technique

- **Frontend** : React + Tailwind CSS
- **Backend** : Laravel (PHP) + API REST + Sanctum
- **Base de données** : MySQL (13 tables)
- **Hébergement prévu** : Nindohost (Maroc)
🚧 Déploiement en cours — hébergement prévu sur Nindohost.

### Prérequis
- PHP 8.x
- Node.js
- MySQL
- Laragon (environnement local recommandé)

### Lancer en local

# Cloner le projet
git clone https://github.com/junior-ifogo-malango/atlasserenity.git

# Backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed

# Frontend
cd frontend
npm install
npm run dev

## 📸 Captures d'écran

### Page d'accueil
<img width="850" height="1150" alt="image" src="https://github.com/user-attachments/assets/d19ccc4f-9c9a-4865-a9ca-6d896db07124" />


### Recherche par mot-clé
<img width="615" height="310" alt="Capture d&#39;écran 2026-07-22 194738" src="https://github.com/user-attachments/assets/ef4b18d1-94e5-41f1-890e-25faae54403e" />


### Billet QR
<img width="550" height="650" alt="image" src="https://github.com/user-attachments/assets/7a51c579-f820-4880-b7ea-310b972bdfcb" />


### Espace opérateur
<img width="945" height="634" alt="image" src="https://github.com/user-attachments/assets/a9cd0c6f-72bd-4c10-b5c4-c2391a312692" />


### Dashboard CRM
<img width="944" height="811" alt="image" src="https://github.com/user-attachments/assets/2c810c8f-4b3c-4cf2-97c4-a6ad0366b519" />


## 👨‍💻 Auteur

**Ifogo MALANGO Junior**  
Étudiant en DUT Génie Logiciel — EST de Fès  
Stage d'initiation chez Incubooster — Juillet 2026

## 📄 Licence

Projet académique — Stage d'initiation EST de Fès
