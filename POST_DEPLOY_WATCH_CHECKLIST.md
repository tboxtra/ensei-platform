# Post-Deploy Watch Checklist - Pack System

## 🚀 T+0 to T+2 Hours (Critical Window)

### ✅ Immediate Checks (T+0)
- [ ] **Health Check**: `/health/packs` returns `healthy`
- [ ] **Metrics Endpoint**: `/metrics/packs` returns data
- [ ] **Admin Dashboard**: Accessible at `/admin/monitoring`
- [ ] **Feature Flags**: Both set to `true` in production
- [ ] **Environment Variables**: All `NEXT_PUBLIC_*` variables set correctly

### ✅ Manual Testing (T+0 to T+30min)
- [ ] **Pack Catalog**: Loads correctly on packs page
- [ ] **Purchase Flow**: Complete end-to-end pack purchase
- [ ] **Entitlement Creation**: Verify entitlement appears in "My Packs"
- [ ] **Mission Creation**: Use pack to create a mission
- [ ] **Quota Deduction**: Verify quota decreases after mission creation
- [ ] **Error Handling**: Test with insufficient balance

### ✅ Monitoring Setup (T+0 to T+1h)
- [ ] **Error Rate**: <2% on pack endpoints
- [ ] **Latency**: p95 <800ms for reads, <1500ms for purchases
- [ ] **Purchase Success**: >95% success rate
- [ ] **Cold Starts**: <3x baseline
- [ ] **Firestore**: No connection errors

### ✅ Alert Configuration (T+1h to T+2h)
- [ ] **PagerDuty/Slack**: Alerts configured for critical thresholds
- [ ] **Email Alerts**: Set up for WARN level issues
- [ ] **Dashboard Monitoring**: Real-time metrics visible
- [ ] **Log Aggregation**: Centralized logging working

## 📊 T+2 to T+24 Hours (Stabilization)

### ✅ Performance Monitoring
- [ ] **Latency Trends**: Stable or improving
- [ ] **Error Patterns**: No recurring issues
- [ ] **User Behavior**: Normal purchase patterns
- [ ] **Resource Usage**: Functions memory/CPU within limits

### ✅ Business Metrics
- [ ] **Purchase Volume**: Expected transaction volume
- [ ] **Revenue Tracking**: Accurate revenue calculations
- [ ] **Entitlement Usage**: Normal quota utilization
- [ ] **Mission Creation**: Pack-based missions working

### ✅ Data Integrity
- [ ] **Transaction Consistency**: No orphaned transactions
- [ ] **Entitlement Accuracy**: Quota calculations correct
- [ ] **Balance Updates**: Wallet balances accurate
- [ ] **Expiration Handling**: Expired entitlements handled correctly

## 📈 T+24 to T+168 Hours (Week 1)

### ✅ Weekly Review
- [ ] **Purchase Success Rate**: >95% maintained
- [ ] **Top 3 Errors**: Identified and addressed
- [ ] **Catalog Consistency**: No missing or invalid packs
- [ ] **User Feedback**: No critical user complaints
- [ ] **Performance Trends**: Stable or improving metrics

### ✅ System Health
- [ ] **Firestore Performance**: No degradation
- [ ] **Functions Scaling**: Handles load appropriately
- [ ] **Error Recovery**: System recovers from transient issues
- [ ] **Feature Flags**: No need for emergency rollbacks

## 🔍 Monitoring Commands

### Real-time Health Check
```bash
# Check system health
curl -s https://us-central1-ensei-6c8e0.cloudfunctions.net/api/health/packs | jq

# Check metrics
curl -s https://us-central1-ensei-6c8e0.cloudfunctions.net/api/metrics/packs | jq

# Check pack catalog
curl -s https://us-central1-ensei-6c8e0.cloudfunctions.net/api/v1/packs | jq
```

### Log Monitoring
```bash
# Recent pack purchases
firebase functions:log --only api --project ensei-6c8e0 | grep "pack_purchased" | tail -10

# Recent errors
firebase functions:log --only api --project ensei-6c8e0 | grep "ERROR" | tail -10

# High latency events
firebase functions:log --only api --project ensei-6c8e0 | grep "HIGH_LATENCY" | tail -5
```

### Performance Analysis
```bash
# Calculate error rate
TOTAL=$(firebase functions:log --only api --project ensei-6c8e0 | grep "pack_purchase" | wc -l)
ERRORS=$(firebase functions:log --only api --project ensei-6c8e0 | grep "pack_purchase_failed" | wc -l)
echo "Error rate: $((ERRORS * 100 / TOTAL))%"

# Check latency distribution
firebase functions:log --only api --project ensei-6c8e0 | grep "latencyMs" | awk '{print $NF}' | sort -n | tail -10
```

## 🚨 Alert Thresholds

### Critical (PAGE)
- Error rate ≥5% for 5 minutes
- Purchase success rate <95% for 30 minutes
- p95 latency >1500ms for 10 minutes
- Cold starts >3x baseline for 10 minutes

### Warning (WARN)
- Error rate ≥2% for 5 minutes
- p95 latency >800ms for 5 minutes
- Duplicate purchases >3% for 30 minutes
- Failed mission publishes >10 in 15 minutes

### Info (INFO)
- Pack catalog count outside [18±2]
- New entitlements with missing expiresAt
- High quota utilization (>80%)

## 📋 Daily Checklist

### Morning (9 AM)
- [ ] Check overnight error rates
- [ ] Review purchase success metrics
- [ ] Check for any alert notifications
- [ ] Verify system health status

### Afternoon (2 PM)
- [ ] Review peak usage performance
- [ ] Check for any user-reported issues
- [ ] Verify entitlement usage patterns
- [ ] Review transaction volume

### Evening (6 PM)
- [ ] Check daily performance summary
- [ ] Review any threshold breaches
- [ ] Verify system stability
- [ ] Plan next day monitoring focus

## 🔧 Troubleshooting Quick Reference

### High Error Rate
1. Check Firebase Functions logs
2. Verify Firestore connectivity
3. Check for memory/CPU issues
4. Review recent deployments

### High Latency
1. Check Functions memory allocation
2. Verify region performance
3. Look for cold start spikes
4. Check Firestore performance

### Purchase Failures
1. Check balance validation logic
2. Verify transaction atomicity
3. Review entitlement creation
4. Check idempotency implementation

### Data Inconsistencies
1. Check transaction logs
2. Verify entitlement status
3. Review quota calculations
4. Check expiration handling

## 📊 Success Metrics

### Technical KPIs
- **Uptime**: >99.9%
- **Error Rate**: <1%
- **Latency**: p95 <500ms
- **Purchase Success**: >98%

### Business KPIs
- **Purchase Volume**: Meeting projections
- **Revenue Accuracy**: 100% accurate
- **User Satisfaction**: No critical complaints
- **Feature Adoption**: Expected usage patterns

## 🎯 Go-Live Success Criteria

### ✅ Technical Readiness
- [ ] All health checks passing
- [ ] Error rate <1%
- [ ] Latency within thresholds
- [ ] Monitoring fully operational

### ✅ Business Readiness
- [ ] Purchase flow working end-to-end
- [ ] Revenue tracking accurate
- [ ] User experience smooth
- [ ] Support processes ready

### ✅ Operational Readiness
- [ ] Incident response plan tested
- [ ] Rollback procedures verified
- [ ] Monitoring alerts configured
- [ ] Team trained on procedures

---

**Deployment Date**: [Date]
**Deployed By**: [Name]
**Next Review**: [Date + 7 days]
**Status**: [In Progress/Complete]
