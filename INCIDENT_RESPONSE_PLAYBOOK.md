# Incident Response Playbook - Pack System

## 🚨 Emergency Contacts
- **Primary On-Call**: [Your Name] - [Phone/Email]
- **Secondary On-Call**: [Backup Name] - [Phone/Email]
- **Escalation**: [Manager Name] - [Phone/Email]

## 🔧 Quick Rollback Commands

### Feature Flag Rollbacks (Instant)
```bash
# Disable pack purchases (Vercel Dashboard > Environment Variables)
NEXT_PUBLIC_ENABLE_PACK_PURCHASE=false

# Hide active entitlements section
NEXT_PUBLIC_SHOW_ACTIVE_ENTITLEMENTS=false
```

### Firebase Functions Rollback
```bash
# Rollback to previous version
firebase functions:rollback

# Deploy specific version
firebase deploy --only functions --project ensei-6c8e0
```

## 📊 Monitoring Dashboards

### Primary Monitoring
- **Health Check**: `https://us-central1-ensei-6c8e0.cloudfunctions.net/api/health/packs`
- **Metrics**: `https://us-central1-ensei-6c8e0.cloudfunctions.net/api/metrics/packs`
- **Admin Dashboard**: `https://ensei-platform-f9kwp51ok-izecubes-projects-b81ca540.vercel.app/admin/monitoring`

### Alert Thresholds
- **Error Rate**: ≥2% WARN, ≥5% PAGE
- **Latency**: p95 >800ms reads, >1500ms purchases WARN
- **Cold Starts**: >3x baseline in 10m WARN
- **Purchase Success**: <95% in 30m PAGE
- **Duplicate Purchases**: >3% in 30m WARN

## 🚨 Incident Scenarios & Response

### 1. High Error Rate (5xx spike)
**Symptoms**: Error rate >5% on pack endpoints
**Immediate Actions**:
1. Flip `NEXT_PUBLIC_ENABLE_PACK_PURCHASE=false` (Vercel)
2. Check Firebase Functions logs for common error patterns
3. Look for `clientRequestId` correlation in logs
4. Verify Firestore connectivity

**Investigation**:
```bash
# Check recent errors
firebase functions:log --only api --project ensei-6c8e0

# Check specific error patterns
grep "CRITICAL_PURCHASE_ERROR" logs/
grep "pack_purchase_failed" logs/
```

**Recovery**:
- If Firestore issue: Check Firebase status page
- If memory issue: Increase Functions memory allocation
- If code issue: Deploy hotfix or rollback

### 2. High Latency (p95 >1500ms)
**Symptoms**: Purchase latency >1500ms
**Immediate Actions**:
1. Check Firebase Functions memory allocation
2. Verify region performance
3. Check for cold start spikes

**Investigation**:
```bash
# Check latency patterns
grep "HIGH_LATENCY_PURCHASE" logs/
grep "latencyMs" logs/ | tail -20
```

**Recovery**:
- Increase Functions memory: `firebase functions:config:set functions.memory=1GB`
- Redeploy with higher memory
- Check for region issues

### 3. Purchase Success Rate <95%
**Symptoms**: Many failed purchases, user complaints
**Immediate Actions**:
1. Check entitlement creation success rate
2. Verify transaction atomicity
3. Look for balance validation issues

**Investigation**:
```bash
# Check purchase success patterns
grep "pack_purchased" logs/ | wc -l
grep "pack_purchase_failed" logs/ | wc -l

# Check specific failure reasons
grep "insufficient" logs/
grep "balance" logs/
```

**Recovery**:
- If balance issues: Check wallet balance calculations
- If transaction issues: Verify Firestore transaction logic
- If entitlement issues: Check entitlement creation process

### 4. Duplicate Purchase Issues
**Symptoms**: Multiple charges for single purchase
**Immediate Actions**:
1. Check idempotency key implementation
2. Verify `clientRequestId` uniqueness
3. Look for retry logic issues

**Investigation**:
```bash
# Check duplicate request patterns
grep "IDEMPOTENCY_KEY_EXISTS" logs/
grep "Duplicate request detected" logs/
```

**Recovery**:
- If idempotency broken: Check Firestore idempotency store
- If retry issues: Verify client retry logic
- If key generation: Check `clientRequestId` generation

### 5. Entitlement Mismatch
**Symptoms**: Users can't use purchased packs
**Immediate Actions**:
1. Check entitlement status and expiration
2. Verify quota calculations
3. Look for mission creation failures

**Investigation**:
```bash
# Check entitlement usage patterns
grep "entitlement_used" logs/
grep "insufficient quota" logs/
grep "expired entitlement" logs/
```

**Recovery**:
- If quota issues: Recalculate user quotas
- If expiration issues: Check `endsAt` timestamps
- If mission issues: Verify mission creation logic

## 🔍 Log Analysis Commands

### Common Log Searches
```bash
# Recent pack purchases
grep "pack_purchased" logs/ | tail -20

# Recent errors
grep "ERROR" logs/ | tail -20

# High latency events
grep "HIGH_LATENCY" logs/

# Critical errors
grep "CRITICAL" logs/

# User-specific issues
grep "userId:USER_ID" logs/
```

### Performance Analysis
```bash
# Latency distribution
grep "latencyMs" logs/ | awk '{print $NF}' | sort -n

# Error rate calculation
TOTAL=$(grep "pack_purchase" logs/ | wc -l)
ERRORS=$(grep "pack_purchase_failed" logs/ | wc -l)
echo "Error rate: $((ERRORS * 100 / TOTAL))%"
```

## 📞 Escalation Procedures

### Level 1 (0-15 minutes)
- Check monitoring dashboards
- Apply feature flag rollbacks
- Check Firebase Functions logs
- Verify basic connectivity

### Level 2 (15-30 minutes)
- Deep dive into error patterns
- Check Firestore performance
- Verify transaction integrity
- Contact Firebase support if needed

### Level 3 (30+ minutes)
- Escalate to management
- Consider full system rollback
- Prepare user communication
- Document incident timeline

## 📝 Post-Incident Actions

### Immediate (Within 1 hour)
1. Document incident timeline
2. Identify root cause
3. Implement hotfix if needed
4. Update monitoring thresholds

### Follow-up (Within 24 hours)
1. Write incident report
2. Update runbooks
3. Improve monitoring
4. Conduct team retrospective

### Long-term (Within 1 week)
1. Implement preventive measures
2. Update alerting rules
3. Improve error handling
4. Enhance testing procedures

## 🛠️ Recovery Procedures

### Full System Rollback
```bash
# Rollback Firebase Functions
firebase functions:rollback --project ensei-6c8e0

# Rollback Vercel deployment
vercel rollback [deployment-url]

# Disable all pack features
NEXT_PUBLIC_ENABLE_PACK_PURCHASE=false
NEXT_PUBLIC_SHOW_ACTIVE_ENTITLEMENTS=false
```

### Data Recovery
```bash
# Check Firestore backup status
gcloud firestore operations list --project ensei-6c8e0

# Restore from backup if needed
gcloud firestore import gs://[backup-bucket]/[backup-path] --project ensei-6c8e0
```

## 📋 Communication Templates

### User Communication (High Impact)
```
Subject: Temporary Service Disruption - Pack System

We're currently experiencing issues with our pack purchase system. 
We're working to resolve this quickly and will update you as soon as possible.

Impact: Pack purchases temporarily unavailable
ETA: [Time estimate]
Status: [Link to status page]

Thank you for your patience.
```

### Internal Communication
```
Subject: INCIDENT: Pack System [Severity] - [Brief Description]

Status: [Investigating/Identified/Monitoring/Resolved]
Impact: [User-facing impact]
ETA: [Time estimate]
Owner: [Incident commander]
Next Update: [Time]

Actions Taken:
- [List of actions]

Next Steps:
- [List of next steps]
```

## 🔄 Testing Procedures

### Post-Incident Testing
1. **Health Check**: Verify `/health/packs` returns healthy
2. **Purchase Flow**: Test end-to-end pack purchase
3. **Entitlement Usage**: Test mission creation with pack
4. **Error Handling**: Test error scenarios
5. **Performance**: Verify latency within thresholds

### Synthetic Testing
```bash
# Health check
curl https://us-central1-ensei-6c8e0.cloudfunctions.net/api/health/packs

# Metrics check
curl https://us-central1-ensei-6c8e0.cloudfunctions.net/api/metrics/packs

# Pack catalog check
curl https://us-central1-ensei-6c8e0.cloudfunctions.net/api/v1/packs
```

---

**Last Updated**: [Current Date]
**Version**: 1.0
**Next Review**: [Date + 30 days]
