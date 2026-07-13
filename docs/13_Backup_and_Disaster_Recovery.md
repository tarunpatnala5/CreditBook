# Credit Book — Backup and Disaster Recovery
**Version:** 1.0.0  
**Date:** 2026-07-13

---

## 1. Backup Philosophy

> "Financial data is irreplaceable. Backups are not optional."

Credit Book implements a **3-2-1 backup strategy** adapted for free tiers:
- **3** copies of data
- **2** different storage types
- **1** offsite location

| Copy | Location | Type | Frequency |
|------|----------|------|-----------|
| Primary | PostgreSQL on Render | Live database | Continuous |
| Secondary | Backblaze B2 | Daily pg_dump | Daily at 2 AM |
| Tertiary | Local admin machine | Manual export | Weekly/Monthly |

---

## 2. Automated Daily Backup

### 2.1 Backup Job (`jobs/backup.job.js`)

```javascript
const cron = require('node-cron');
const { exec } = require('child_process');
const B2 = require('backblaze-b2');
const fs = require('fs');
const path = require('path');

async function runDailyBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `creditbook-backup-${timestamp}.sql.gz`;
  const tmpPath = path.join('/tmp', filename);
  
  try {
    // Step 1: Run pg_dump and compress
    await new Promise((resolve, reject) => {
      exec(
        `pg_dump ${process.env.DATABASE_URL} | gzip > ${tmpPath}`,
        (error) => error ? reject(error) : resolve()
      );
    });
    
    // Step 2: Upload to Backblaze B2
    const b2 = new B2({
      applicationKeyId: process.env.B2_KEY_ID,
      applicationKey: process.env.B2_APPLICATION_KEY,
    });
    
    await b2.authorize();
    const { uploadUrl, authorizationToken } = await b2.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID
    });
    
    const fileData = fs.readFileSync(tmpPath);
    await b2.uploadFile({
      uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName: `backups/${filename}`,
      data: fileData,
      contentType: 'application/gzip'
    });
    
    // Step 3: Record backup in database
    await db.backups.create({
      data: {
        filename,
        location: `b2://${process.env.B2_BUCKET_ID}/backups/${filename}`,
        sizeBytes: fileData.length,
        status: 'success'
      }
    });
    
    // Step 4: Write audit log
    await auditService.log({
      action: 'backup.completed',
      resourceType: 'system',
      afterData: { filename, size: fileData.length }
    });
    
    // Step 5: Cleanup old backups (retain 30 days)
    await cleanupOldBackups();
    
    logger.info(`Backup completed: ${filename}`);
    
  } catch (error) {
    logger.error(`Backup failed: ${error.message}`);
    await db.backups.create({
      data: {
        filename,
        status: 'failed',
        errorMessage: error.message
      }
    });
  } finally {
    // Always cleanup temp file
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  }
}

async function cleanupOldBackups() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);
  
  const oldBackups = await db.backups.findMany({
    where: {
      createdAt: { lt: cutoffDate },
      status: 'success'
    }
  });
  
  const b2 = new B2({ /* ... */ });
  await b2.authorize();
  
  for (const backup of oldBackups) {
    // Delete from Backblaze
    // await b2.deleteFileVersion({ ... });
    await db.backups.delete({ where: { id: backup.id } });
  }
}

// Schedule: Daily at 2 AM
cron.schedule('0 2 * * *', runDailyBackup);
```

---

## 3. Backup Verification

Every backup should be verified monthly by the admin:

1. Download latest backup from Backblaze B2
2. Restore to a test PostgreSQL instance
3. Verify data integrity (row counts, recent transactions visible)
4. Delete test instance

### 3.1 Restore Command

```bash
# Restore from backup file
gunzip -c creditbook-backup-2026-07-13.sql.gz | psql $DATABASE_URL

# Verify restore
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM transactions;"
```

---

## 4. Disaster Recovery Scenarios

### Scenario 1: Accidental Data Deletion

**Detection:** User reports missing data / admin notices issue  
**RTO (Recovery Time Objective):** 2 hours  
**RPO (Recovery Point Objective):** 24 hours (last backup)

**Steps:**
1. Identify what was deleted (check audit logs)
2. If soft-deleted: restore from Recycle Bin (Admin Panel)
3. If permanently deleted: restore from last night's backup to a new DB
4. Extract specific records and INSERT into production DB
5. Notify affected users

### Scenario 2: Database Corruption

**Detection:** API errors, data inconsistency  
**RTO:** 4 hours  
**RPO:** 24 hours

**Steps:**
1. Put API in maintenance mode (return 503 with message)
2. Provision new PostgreSQL instance on Render
3. Restore latest backup
4. Run all pending migrations (`prisma migrate deploy`)
5. Update `DATABASE_URL` environment variable
6. Restart API service
7. Verify data integrity
8. Remove maintenance mode

### Scenario 3: Render Service Outage

**Detection:** Web app returns 503  
**RTO:** 1 hour (Render recovery) or 4 hours (migrate to alternative)

**Steps:**
1. Check Render status page (status.render.com)
2. If temporary: wait for Render to recover
3. If prolonged: deploy backend to Railway (free tier alternative)
4. Update DNS/environment variables

### Scenario 4: Complete Data Loss

**Detection:** Database empty or inaccessible  
**RTO:** 8 hours  
**RPO:** 24 hours

**Steps:**
1. Download latest backup from Backblaze B2
2. Provision new PostgreSQL database
3. Restore backup
4. Run migrations
5. Redeploy API with new DATABASE_URL
6. Test all functionality
7. Notify users of recovery

---

## 5. Keep-Alive Strategy

Render free tier services sleep after 15 minutes of inactivity. This job prevents it:

```javascript
// jobs/keepAlive.job.js
const cron = require('node-cron');
const https = require('https');

// Ping own health endpoint every 14 minutes
cron.schedule('*/14 * * * *', () => {
  https.get(`https://creditbook-api.onrender.com/health`, (res) => {
    logger.debug(`Keep-alive ping: ${res.statusCode}`);
  }).on('error', (err) => {
    logger.warn(`Keep-alive failed: ${err.message}`);
  });
});
```

**External ping service (free):** Use UptimeRobot (free tier — 50 monitors) to ping the health endpoint every 5 minutes. This keeps Render service awake and monitors uptime.

---

## 6. Backup Monitoring

### 6.1 Health Check Endpoint

```javascript
// GET /health
app.get('/health', async (req, res) => {
  const lastBackup = await db.backups.findFirst({
    where: { status: 'success' },
    orderBy: { createdAt: 'desc' }
  });
  
  const hoursAgo = lastBackup
    ? Math.floor((Date.now() - lastBackup.createdAt.getTime()) / 3600000)
    : null;
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    lastBackup: lastBackup?.createdAt,
    lastBackupHoursAgo: hoursAgo,
    backupHealthy: hoursAgo !== null && hoursAgo < 26  // Alert if > 26 hours
  });
});
```

---

## 7. Backblaze B2 Setup (Free Tier)

1. Create account at backblaze.com
2. Create a private bucket named `creditbook-backups`
3. Create an Application Key with:
   - Read + Write access
   - Restricted to `creditbook-backups` bucket
4. Add credentials to environment variables:
   ```
   B2_KEY_ID=xxxx
   B2_APPLICATION_KEY=xxxx
   B2_BUCKET_ID=xxxx
   ```

**Free tier limits:**
- 10 GB storage
- 1 GB/day download
- At ~5MB per backup (compressed), 10GB = ~2,000 days of backups

---

*Credit Book Backup and Disaster Recovery — v1.0.0*
