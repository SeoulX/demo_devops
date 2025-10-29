# Kubernetes Manifests

This directory contains Kubernetes manifest files for deploying the demo-devops application to minikube.

## Files

- **namespace.yaml** - Creates the Kubernetes namespace for the application
- **configmap.yaml** - Contains frontend environment variables (API base URL)
- **mongodb.yaml** - MongoDB deployment and service
- **backend.yaml** - Backend FastAPI deployment and service
- **frontend.yaml** - Frontend Next.js deployment and service (NodePort)

## Usage

These manifests are automatically used by the Jenkins pipeline. The pipeline replaces the following environment variables:

- `${K8S_NAMESPACE}` - Kubernetes namespace (default: `demo-apps-jenkins`)
- `${BACKEND_IMAGE}` - Backend Docker image tag
- `${FRONTEND_IMAGE}` - Frontend Docker image tag

## Manual Deployment

To deploy manually, replace the variables and apply:

```bash
# Replace variables and apply
export K8S_NAMESPACE=demo-apps-jenkins
export BACKEND_IMAGE=localhost:5000/demo-devops-backend:1
export FRONTEND_IMAGE=localhost:5000/demo-devops-frontend:1

# Apply manifests in order
envsubst < manifests/namespace.yaml | kubectl apply -f -
envsubst < manifests/configmap.yaml | kubectl apply -f -
envsubst < manifests/mongodb.yaml | kubectl apply -f -
envsubst < manifests/backend.yaml | kubectl apply -f -
envsubst < manifests/frontend.yaml | kubectl apply -f -
```

## Notes

- The MongoDB deployment uses an `emptyDir` volume (data is lost on pod restart)
- For production, consider using a PersistentVolume for MongoDB
- The frontend service is exposed as NodePort for easy access via minikube
- Health checks (liveness and readiness probes) are configured for backend and frontend

