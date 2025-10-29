# Setup Minikube Access for Jenkins

## Problem
Jenkins pipeline fails with: `minikube: not found`

This happens because Jenkins agent doesn't have access to minikube.

## Solution Options

### Option 1: Install Minikube on Jenkins Agent (Recommended)

If Jenkins is running as a container or separate machine:

1. **SSH into Jenkins agent/node**:
   ```bash
   # If Jenkins is in Docker:
   docker exec -it <jenkins-container> /bin/bash
   
   # If Jenkins is on VM/server:
   ssh <jenkins-server>
   ```

2. **Install minikube**:
   ```bash
   # Download minikube
   curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
   sudo install minikube-linux-amd64 /usr/local/bin/minikube
   
   # Or use package manager
   # Ubuntu/Debian: wget https://github.com/kubernetes/minikube/releases/latest/download/minikube_latest_amd64.deb
   # sudo dpkg -i minikube_latest_amd64.deb
   ```

3. **Install kubectl** (if not already installed):
   ```bash
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
   ```

4. **Grant Jenkins user access**:
   ```bash
   # Add jenkins user to docker group (if needed)
   sudo usermod -aG docker jenkins
   
   # Copy minikube config to jenkins home (if minikube was set up as different user)
   sudo mkdir -p /var/jenkins_home/.kube
   sudo cp ~/.kube/config /var/jenkins_home/.kube/config
   sudo chown -R jenkins:jenkins /var/jenkins_home/.kube
   ```

5. **Restart Jenkins**:
   ```bash
   # If Docker container:
   docker restart <jenkins-container>
   
   # If systemd:
   sudo systemctl restart jenkins
   ```

### Option 2: Use Host's Minikube from Jenkins Container

If Jenkins is running in Docker and minikube is on the host:

1. **Mount minikube binary and config**:
   ```bash
   docker run -d \
     --name jenkins \
     -v /var/run/docker.sock:/var/run/docker.sock \
     -v $(which minikube):/usr/local/bin/minikube \
     -v ~/.kube:/var/jenkins_home/.kube \
     -v ~/.minikube:/var/jenkins_home/.minikube \
     -p 8080:8080 \
     jenkins/jenkins:lts
   ```

2. **Or install in Jenkins container**:
   ```bash
   docker exec -it <jenkins-container> /bin/bash
   # Then follow Option 1 steps 2-3
   ```

### Option 3: Pre-configure Minikube Context

If you can't install minikube on Jenkins agent:

1. **On the host machine** (where minikube runs):
   ```bash
   # Ensure minikube is running
   minikube start
   
   # Get kubectl config and copy to Jenkins
   kubectl config view --flatten > /tmp/kubeconfig
   ```

2. **Copy to Jenkins agent**:
   ```bash
   # If Jenkins is container:
   docker cp /tmp/kubeconfig <jenkins-container>:/var/jenkins_home/.kube/config
   
   # If Jenkins is on different machine:
   scp /tmp/kubeconfig jenkins@<jenkins-host>:/var/jenkins_home/.kube/config
   ```

3. **Configure Docker socket** (for building images):
   ```bash
   # Mount Docker socket from host to Jenkins container
   # This allows Jenkins to use host's Docker (which has minikube images)
   
   # If using docker-compose, add:
   volumes:
     - /var/run/docker.sock:/var/run/docker.sock
   ```

### Option 4: Build Images on Host, Deploy via Jenkins

Alternative architecture:

1. **Build images on host** (where minikube is):
   ```bash
   eval $(minikube docker-env)
   docker build -t demo-devops-backend:latest ./backend
   docker build -t demo-devops-frontend:latest ./frontend
   ```

2. **Pipeline only deploys** (assumes images already exist):
   - Remove Build stages from Jenkinsfile
   - Or use image names that already exist in minikube

## Verify Setup

After setup, test in Jenkins:

1. **Create a test pipeline** or use Script Console:
   ```groovy
   sh '''
     which minikube || echo "minikube not found"
     which kubectl || echo "kubectl not found"
     kubectl config current-context || echo "kubeconfig not set"
     docker info | head -5 || echo "Docker not accessible"
   '''
   ```

2. **Check if minikube cluster is accessible**:
   ```bash
   kubectl get nodes
   kubectl get pods -A
   ```

## Quick Fix for Current Issue

For immediate fix, the updated Jenkinsfile now handles missing minikube gracefully:

- If minikube exists → uses it
- If minikube doesn't exist → assumes environment is pre-configured
- Pipeline won't fail immediately, but you still need kubectl and Docker access

**You must ensure**:
- ✅ kubectl is installed and configured (can access minikube cluster)
- ✅ Docker is accessible (for building images)
- ✅ Images built by Jenkins are accessible to minikube's Kubernetes

## Recommended Architecture

For production-like setups:

```
Host Machine:
├── Minikube (Kubernetes cluster)
├── Docker (shared with minikube via docker-env)
└── Jenkins Container:
    ├── Mounts /var/run/docker.sock (uses host Docker)
    ├── Has minikube binary (to manage cluster)
    └── Has kubectl (to deploy to minikube)
```

This way:
- Jenkins builds images in Docker → Images available to minikube
- Jenkins uses kubectl → Deploys to minikube cluster
- All on same machine/network

