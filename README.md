# 🎬 Movie API R6

Ce projet est une API développée avec **Hapi.js**, utilisant **Objection.js** (ORM) et **RabbitMQ** pour la gestion asynchrone des exports de données par email.

---

## ⚙️ Configuration

Toutes les variables d'environnement nécessaires sont listées dans le fichier :
👉 `server/.env-example`

> **Important** : Copiez ce fichier vers un nouveau fichier `.env` et adaptez les valeurs selon votre configuration locale avant de lancer les services.

---

## 🐳 Services externes (Docker)

Utilisez les commandes suivantes pour déployer les conteneurs nécessaires :

### 1. MySQL (Base de données)
La base de données est configurée pour être accessible sur le port **3307**.
```bash
docker run -d \
  --name mysql-movie-api \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=iut_project \
  -p 3307:3306 \
  mysql:8.0

```

### 2. RabbitMQ (Broker de messages)

Nécessaire pour la file d'attente d'exportation CSV. L'interface de gestion est accessible sur le port `15672`.

```bash
docker run -d \
  --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management
```

---

## 🚀 Lancement du projet

### 1. Installation des dépendances

```bash
npm install

```

### 2. Base de données (Migrations)

Pour créer et mettre à jour la structure de vos tables :

```bash
npx knex migrate:latest

```

### 3. Lancer le serveur (Développement)

Utilisation de **nodemon** pour surveiller les changements dans le répertoire `server` :

```bash
nodemon --watch server/index.js

```

### 4. Lancer le Worker d'export

Le worker doit être lancé dans un terminal séparé pour traiter les demandes d'export envoyées dans RabbitMQ :

```bash
node rabmq.js

```

---

## 🧪 Tests

Pour exécuter la suite de tests unitaires et d'intégration (via Lab & Code) :

```bash
npm test

```
## 🔑 Utilisation du Token JWT
Une fois connecté via la route /user/connect, vous recevrez un jeton (token). Pour accéder aux routes protégées :

Copiez le token reçu.

Dans votre client API (Postman, Insomnia, etc.), ajoutez un header Authorization.

La valeur doit impérativement commencer par Bearer suivi d'un espace et de votre token.

Exemple :
Authorization: Bearer <votre_token_ici>
---

## 🛠️ Stack Technique

* **Framework :** Hapi.js
* **Validation :** Joi
* **ORM :** Objection.js & Knex.js
* **Messaging :** RabbitMQ (via amqplib)
* **Email :** Nodemailer (utilisant un compte de test Ethereal)
* **Chiffrement :** @hugoheml/iut-encrypt Merci Hugo

