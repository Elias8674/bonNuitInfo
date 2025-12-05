# Déploiement en production

## Sur un VPS avec Docker

### Option 1 : Avec docker-compose (recommandé)

```bash
# Builder et lancer l'image de production
docker compose -f docker-compose.prod.yml up -d --build

# Voir les logs
docker compose -f docker-compose.prod.yml logs -f

# Arrêter
docker compose -f docker-compose.prod.yml down
```

### Option 2 : Avec Docker directement

```bash
# Builder l'image
docker build --target production -t ndi-stack:prod .

# Lancer le conteneur
docker run -d -p 80:80 --name ndi-stack --restart unless-stopped ndi-stack:prod

# Voir les logs
docker logs -f ndi-stack

# Arrêter
docker stop ndi-stack
docker rm ndi-stack
```

### Option 3 : Avec un port personnalisé

Si vous voulez utiliser un autre port (par exemple 8080), modifiez le fichier `docker-compose.prod.yml` :

```yaml
ports:
  - "8080:80"
```

Puis lancez :
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Ou avec Docker directement :
```bash
docker run -d -p 8080:80 --name ndi-stack --restart unless-stopped ndi-stack:prod
```

## Mise à jour de l'application

Pour mettre à jour l'application après avoir fait des changements :

```bash
# Avec docker-compose
docker compose -f docker-compose.prod.yml up -d --build

# Avec Docker directement
docker build --target production -t ndi-stack:prod .
docker stop ndi-stack
docker rm ndi-stack
docker run -d -p 80:80 --name ndi-stack --restart unless-stopped ndi-stack:prod
```

## Reverse Proxy (optionnel)

Si vous utilisez un reverse proxy comme Nginx ou Traefik, vous pouvez exposer le conteneur sur un port interne (ex: 8080) et laisser le reverse proxy gérer le port 80/443.

