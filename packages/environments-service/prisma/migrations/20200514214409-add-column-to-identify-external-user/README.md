# Migration `20200514214409-add-column-to-identify-external-user`

This migration has been generated by Gabriel Mendez at 5/14/2020, 9:44:09 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'CONTRIBUTOR');
ALTER TABLE "environments"."EnvironmentMember" ALTER COLUMN "environmentRole" DROP DEFAULT,
                        ALTER COLUMN "environmentRole" TYPE "Role_new" USING ("environmentRole"::text::"Role_new"),
                        ALTER COLUMN "environmentRole" SET DEFAULT 'ADMIN';
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old"

ALTER TABLE "environments"."Environment" ADD COLUMN "ownerUserId" integer  NOT NULL ;

ALTER TABLE "environments"."EnvironmentMember" ALTER COLUMN "environmentRole" SET DEFAULT 'CONTRIBUTOR';
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200514213514-init..20200514214409-add-column-to-identify-external-user
--- datamodel.dml
+++ datamodel.dml
@@ -1,17 +1,18 @@
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url      = env("DATABASE_URL")
 }
 generator client {
   provider = "prisma-client-js"
 }
 model Environment {
-  id      Int                 @default(autoincrement()) @id
-  name    String
-  members EnvironmentMember[]
+  id          Int                 @default(autoincrement()) @id
+  name        String
+  members     EnvironmentMember[]
+  ownerUserId Int
 }
 model EnvironmentMember {
   id              Int          @default(autoincrement()) @id
@@ -20,8 +21,7 @@
   environmentRole Role         @default(CONTRIBUTOR)
 }
 enum Role {
-  OWNER
   ADMIN
   CONTRIBUTOR
 }
```