# 📦 Guide des Migrations - Kerygma API

## 🎯 Workflow recommandé pour éviter les problèmes de synchronisation DB

### **⚠️ RÈGLE D'OR ⚠️**
**Toujours générer une migration après modification d'entité !**

---

## 🔄 **Workflow complet**

### 1. **Modifier une entité**
```typescript
// src/modules/offerings/entities/offering.entity.ts
@Column({ type: 'enum', enum: Status, default: Status.PENDING })
status: Status;  // ← Nouvelle colonne ajoutée
```

### 2. **Générer la migration OBLIGATOIREMENT**
```bash
# Avant de commiter ou déployer !
pnpm typeorm migration:generate src/migrations/AddStatusToOffering -d src/config/typeorm-migration.config.ts
```

### 3. **Vérifier le fichier généré**
```bash
# Regarder ce qui a été généré
cat src/migrations/[TIMESTAMP]-AddStatusToOffering.ts
```

### 4. **Commiter la migration**
```bash
git add src/migrations/
git commit -m "feat: add status column to offering entity"
git push origin main
```

### 5. **Déployer**
```bash
./scripts/deploy-manual.sh
```

---

## 🛡️ **Protection automatique**

### **Script de vérification**
```bash
# Vérifier s'il y a des migrations manquantes
./scripts/check-migrations.sh
```

### **Protection intégrée dans le déploiement**
Le script `deploy-manual.sh` vérifie automatiquement les migrations manquantes et **bloque le déploiement** si des changements non migrés sont détectés.

---

## 🚨 **Messages d'erreur courants**

### **"Unknown column 'table.column_name' in 'field list'"**
**Cause :** Modification d'entité sans migration  
**Solution :** Générer et déployer la migration manquante

### **"Table 'database.table_name' doesn't exist"**
**Cause :** Nouvelle entité sans migration de création  
**Solution :** Générer la migration pour créer la table

---

## 🔧 **Commandes utiles**

```bash
# Générer une migration automatique
pnpm typeorm migration:generate src/migrations/NomMigration -d src/config/typeorm-migration.config.ts

# Créer une migration vide (pour changements manuels)
pnpm typeorm migration:create src/migrations/NomMigration

# Voir le statut des migrations
pnpm typeorm migration:show -d src/config/typeorm-migration.config.ts

# Exécuter les migrations manuellement
pnpm typeorm migration:run -d src/config/typeorm-migration.config.ts

# Annuler la dernière migration
pnpm typeorm migration:revert -d src/config/typeorm-migration.config.ts
```

---

## ✅ **Checklist avant déploiement**

- [ ] J'ai modifié des entités
- [ ] J'ai généré les migrations correspondantes
- [ ] J'ai vérifié le contenu des migrations générées
- [ ] J'ai commité les migrations sur Git
- [ ] Je peux maintenant déployer en sécurité

---

## 💡 **Bonnes pratiques**

1. **Une migration par changement logique**
2. **Noms de migration descriptifs**
3. **Vérifier le SQL généré avant commit**
4. **Tester en local d'abord**
5. **Ne jamais modifier une migration déjà déployée**