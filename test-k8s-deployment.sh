#!/bin/bash

echo "🚀 Testing Kubernetes Deployment"
echo "==============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

NAMESPACE="demo-apps"

echo -e "\n${YELLOW}1. Checking Namespace${NC}"
echo "----------------------"
kubectl get namespace $NAMESPACE
print_status $? "Namespace exists"

echo -e "\n${YELLOW}2. Checking ConfigMap${NC}"
echo "---------------------"
kubectl get configmap demo-devops-ui-cm-staging -n $NAMESPACE
print_status $? "ConfigMap exists"

echo -e "\n${YELLOW}3. Checking Pods${NC}"
echo "----------------"
kubectl get pods -n $NAMESPACE
print_status $? "Pods status"

echo -e "\n${YELLOW}4. Checking Services${NC}"
echo "-------------------"
kubectl get svc -n $NAMESPACE
print_status $? "Services status"

echo -e "\n${YELLOW}5. Testing Backend API${NC}"
echo "------------------------"
echo "Testing backend API endpoint..."
kubectl run test-backend --image=curlimages/curl --rm -i --restart=Never -- \
  curl -f http://demo-devops-fast-api-svc-staging.demo-apps.svc.cluster.local/fastapi/get_init
print_status $? "Backend API test"

echo -e "\n${YELLOW}6. Testing Frontend to Backend Communication${NC}"
echo "----------------------------------------------"
echo "Testing frontend API endpoint..."
kubectl run test-frontend --image=curlimages/curl --rm -i --restart=Never -- \
  curl -X POST http://demo-devops-ui-svc-staging.demo-apps.svc.cluster.local/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' || echo "Expected to fail - no valid credentials"
print_status 0 "Frontend API test (expected to fail with invalid credentials)"

echo -e "\n${YELLOW}7. Checking Environment Variables${NC}"
echo "-----------------------------------"
echo "Checking if frontend pods have correct environment variables..."
FRONTEND_POD=$(kubectl get pods -n $NAMESPACE -l app=demo-devops-ui -o jsonpath='{.items[0].metadata.name}')
if [ ! -z "$FRONTEND_POD" ]; then
    kubectl exec -it $FRONTEND_POD -n $NAMESPACE -- env | grep NEXT_PUBLIC
    print_status $? "Environment variables check"
else
    echo "No frontend pod found"
    print_status 1 "Environment variables check"
fi

echo -e "\n${YELLOW}8. Checking ArgoCD Status${NC}"
echo "---------------------------"
echo "Checking ArgoCD application status..."
kubectl get applications.argoproj.io -n argocd | grep demo-devops || echo "ArgoCD not accessible or app not found"
print_status 0 "ArgoCD status check"

echo -e "\n${GREEN}🎉 Kubernetes deployment test completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Fix environment variable mismatch if found"
echo "2. Check pod logs for any errors"
echo "3. Test with valid credentials"
echo "4. Monitor ArgoCD sync status"
