# 🚀 Kubernetes Testing Guide

## 🔧 **Environment Variable Fix**

Your ConfigMap and code have a mismatch:

**ConfigMap sets**: `NEXT_PUBLIC_BASE_API_URL`
**Code expects**: `NEXT_PUBLIC_API_BASE_URL`

### Fix Option 1: Update ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: demo-devops-ui-cm-staging
  namespace: demo-apps
data:
  NEXT_PUBLIC_API_BASE_URL: "http://demo-devops-fast-api-svc-staging.demo-apps.svc.cluster.local"
```

### Fix Option 2: Update Code
```typescript
// In frontend/pages/api/login.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL;
```

## 🧪 **Testing Strategy for Kubernetes Deployment**

### 1. **Local Testing with Docker Compose**
```bash
# Test locally first
docker-compose up --build

# Test API endpoints
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 2. **Kubernetes Testing Commands**

#### Check Pod Status
```bash
kubectl get pods -n demo-apps
kubectl describe pod <pod-name> -n demo-apps
```

#### Check Services
```bash
kubectl get svc -n demo-apps
kubectl describe svc demo-devops-fast-api-svc-staging -n demo-apps
```

#### Check ConfigMaps
```bash
kubectl get configmap -n demo-apps
kubectl describe configmap demo-devops-ui-cm-staging -n demo-apps
```

#### Test Service Connectivity
```bash
# Port forward to test locally
kubectl port-forward svc/demo-devops-fast-api-svc-staging 8000:8000 -n demo-apps

# Test API
curl http://localhost:8000/fastapi/get_init
```

### 3. **End-to-End Testing**

#### Test Frontend to Backend Communication
```bash
# Port forward both services
kubectl port-forward svc/demo-devops-ui-svc-staging 3000:3000 -n demo-apps &
kubectl port-forward svc/demo-devops-fast-api-svc-staging 8000:8000 -n demo-apps &

# Test login flow
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 4. **Health Checks**

#### Backend Health Check
```bash
kubectl exec -it <backend-pod> -n demo-apps -- curl http://localhost:8000/fastapi/get_init
```

#### Frontend Health Check
```bash
kubectl exec -it <frontend-pod> -n demo-apps -- curl http://localhost:3000
```

## 🔄 **CI/CD Integration with Kubernetes**

### 1. **Update GitHub Actions for K8s Testing**

Add this to your `.github/workflows/test-and-lint.yml`:

```yaml
  k8s-test:
    runs-on: ubuntu-latest
    needs: [backend-test, frontend-test]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup kubectl
        uses: azure/setup-kubectl@v3
        with:
          version: 'v1.28.0'

      - name: Test Kubernetes deployment
        run: |
          # Test ConfigMap
          kubectl get configmap demo-devops-ui-cm-staging -n demo-apps
          
          # Test service connectivity
          kubectl run test-pod --image=curlimages/curl --rm -i --restart=Never -- \
            curl -f http://demo-devops-fast-api-svc-staging.demo-apps.svc.cluster.local/fastapi/get_init
```

### 2. **ArgoCD Integration Testing**

Since you're using ArgoCD (based on the annotation), test the sync:

```bash
# Check ArgoCD application status
argocd app get demo-devops-ui-staging

# Sync application
argocd app sync demo-devops-ui-staging

# Check sync status
argocd app wait demo-devops-ui-staging
```

## 🐛 **Troubleshooting Common Issues**

### 1. **Service Discovery Issues**
```bash
# Check if services can resolve each other
kubectl run test-pod --image=busybox --rm -i --restart=Never -- nslookup demo-devops-fast-api-svc-staging.demo-apps.svc.cluster.local
```

### 2. **Environment Variable Issues**
```bash
# Check if env vars are loaded
kubectl exec -it <frontend-pod> -n demo-apps -- env | grep NEXT_PUBLIC
```

### 3. **Network Connectivity**
```bash
# Test network connectivity
kubectl run test-pod --image=curlimages/curl --rm -i --restart=Never -- \
  curl -v http://demo-devops-fast-api-svc-staging.demo-apps.svc.cluster.local/fastapi/get_init
```

## 📊 **Monitoring and Observability**

### 1. **Check Logs**
```bash
# Backend logs
kubectl logs -f deployment/demo-devops-fast-api-staging -n demo-apps

# Frontend logs
kubectl logs -f deployment/demo-devops-ui-staging -n demo-apps
```

### 2. **Resource Usage**
```bash
kubectl top pods -n demo-apps
kubectl describe nodes
```

## 🚀 **Deployment Testing Checklist**

- [ ] ConfigMap environment variables match code expectations
- [ ] Services are running and healthy
- [ ] Network connectivity between frontend and backend
- [ ] API endpoints respond correctly
- [ ] Frontend can authenticate with backend
- [ ] MongoDB connection works in K8s environment
- [ ] ArgoCD sync is successful
- [ ] All pods are in Running state
- [ ] No error logs in any containers

## 🔧 **Quick Fix Commands**

```bash
# Fix environment variable mismatch
kubectl patch configmap demo-devops-ui-cm-staging -n demo-apps --type merge -p '{"data":{"NEXT_PUBLIC_API_BASE_URL":"http://demo-devops-fast-api-svc-staging.demo-apps.svc.cluster.local"}}'

# Restart frontend deployment to pick up new config
kubectl rollout restart deployment/demo-devops-ui-staging -n demo-apps

# Check rollout status
kubectl rollout status deployment/demo-devops-ui-staging -n demo-apps
```
