# Fix three-tier-app Pipeline - Empty Dropdown Solution

## Problem
The Pipeline dropdown shows nothing, so you can't select "Pipeline script from SCM"

## Solution 1: Use "Pipeline script" Directly (Temporary Workaround)

Instead of using "Pipeline script from SCM", paste the Jenkinsfile content directly:

1. **Go to**: http://jenkins.local/job/three-tier-app/configure

2. **Scroll to "Pipeline" section**

3. **Look for dropdown** - If you see a dropdown, try these options:
   - **"Pipeline script"** (NOT "Pipeline script from SCM")
   - This lets you paste the Jenkinsfile directly

4. **If you see a text area**, paste this entire Jenkinsfile content:

```groovy
pipeline {
    agent any
    
    triggers {
        genericTrigger(
            genericVariables: [
                [key: 'ref', value: '$.ref'],
                [key: 'branch', value: '$.ref', expressionType: 'JSONPath', regexpFilter: 'refs/heads/(.*)'],
                [key: 'commit', value: '$.after'],
                [key: 'repo', value: '$.repository.name']
            ],
            token: 'demo-devops-token',
            tokenCredentialId: '',
            printContributedVariables: true,
            printPostContent: false,
            causeString: 'Triggered by push to branch: $branch',
            regexpFilterText: '$ref',
            regexpFilterExpression: '^refs/heads/main$'
        )
    }
    
    environment {
        K8S_NAMESPACE = 'demo-apps-jenkins'
        BACKEND_IMAGE = "demo-devops-backend:${BUILD_NUMBER}"
        FRONTEND_IMAGE = "demo-devops-frontend:${BUILD_NUMBER}"
        BACKEND_IMAGE_LATEST = "demo-devops-backend:latest"
        FRONTEND_IMAGE_LATEST = "demo-devops-frontend:latest"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    def branch = env.GIT_BRANCH ?: env.BRANCH_NAME ?: 'main'
                    branch = branch.replaceAll(/^origin\//, '')
                    echo "Building for branch: ${branch}"
                    if (branch != 'main') {
                        currentBuild.result = 'ABORTED'
                        error("Pipeline only runs on main branch. Current branch: ${branch}")
                    }
                }
            }
        }
        stage('Prepare') {
            steps {
                script {
                    sh '''
                        echo "Checking minikube status..."
                        minikube status || minikube start
                        echo "Setting up Docker to use minikube's Docker daemon..."
                        eval $(minikube docker-env)
                        docker info | head -5
                    '''
                }
            }
        }
        stage('Build Backend') {
            steps {
                dir('backend') {
                    script {
                        sh '''
                            echo "Building backend Docker image..."
                            eval $(minikube docker-env)
                            docker build -t ${BACKEND_IMAGE} -t ${BACKEND_IMAGE_LATEST} .
                            docker images | grep demo-devops-backend
                        '''
                    }
                }
            }
        }
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    script {
                        sh '''
                            echo "Building frontend Docker image..."
                            eval $(minikube docker-env)
                            docker build -t ${FRONTEND_IMAGE} -t ${FRONTEND_IMAGE_LATEST} .
                            docker images | grep demo-devops-frontend
                        '''
                    }
                }
            }
        }
        stage('Test Backend') {
            steps {
                dir('backend') {
                    script {
                        sh '''
                            echo "Running backend tests..."
                            python3 -m venv venv || true
                            source venv/bin/activate || true
                            pip install -q -r requirements.txt
                            pytest app/test/ -v || true
                        '''
                    }
                }
            }
        }
        stage('Test Frontend') {
            steps {
                dir('frontend') {
                    script {
                        sh '''
                            echo "Running frontend tests..."
                            npm ci --silent || npm install
                            npm run lint || true
                            npm test -- --passWithNoTests || true
                        '''
                    }
                }
            }
        }
        stage('Deploy to Minikube') {
            steps {
                script {
                    sh '''
                        echo "Deploying to minikube..."
                        kubectl config use-context minikube
                        apply_manifest() {
                            local file=$1
                            sed -e "s|\\${K8S_NAMESPACE}|${K8S_NAMESPACE}|g" \
                                -e "s|\\${BACKEND_IMAGE}|${BACKEND_IMAGE}|g" \
                                -e "s|\\${FRONTEND_IMAGE}|${FRONTEND_IMAGE}|g" \
                                $file | kubectl apply -f -
                        }
                        echo "Creating namespace..."
                        apply_manifest manifests/namespace.yaml
                        echo "Creating ConfigMap..."
                        apply_manifest manifests/configmap.yaml
                        echo "Deploying MongoDB..."
                        apply_manifest manifests/mongodb.yaml
                        echo "Deploying Backend..."
                        apply_manifest manifests/backend.yaml
                        echo "Deploying Frontend..."
                        apply_manifest manifests/frontend.yaml
                        echo "Waiting for deployments to be ready..."
                        kubectl rollout status deployment/demo-devops-backend -n ${K8S_NAMESPACE} --timeout=5m
                        kubectl rollout status deployment/demo-devops-frontend -n ${K8S_NAMESPACE} --timeout=5m
                        echo "Deployment complete!"
                        kubectl get svc -n ${K8S_NAMESPACE}
                    '''
                }
            }
        }
        stage('Verify Deployment') {
            steps {
                script {
                    sh '''
                        echo "Verifying deployment..."
                        kubectl get pods -n ${K8S_NAMESPACE}
                        kubectl get svc -n ${K8S_NAMESPACE}
                        echo "Testing backend health..."
                        kubectl run test-backend --image=curlimages/curl --rm -i --restart=Never -n ${K8S_NAMESPACE} -- \
                          curl -f http://demo-devops-backend-svc.${K8S_NAMESPACE}.svc.cluster.local/fastapi/get_init || echo "Backend test skipped"
                    '''
                }
            }
        }
    }
    post {
        always {
            echo 'Pipeline execution completed'
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
        cleanup {
            cleanWs()
        }
    }
}
```

5. **Click "Save"**

⚠️ **Note**: This won't work for checkout because there's no SCM configured. You'll need Solution 2.

---

## Solution 2: Configure SCM First (Recommended)

If the Pipeline section doesn't show anything, you need to:

1. **Check if Git Plugin is installed**:
   - Go to: http://jenkins.local/pluginManager/installed
   - Search for "Git plugin"
   - If not installed, install it

2. **After Git Plugin is installed**, go back to configure and you should see:
   - Pipeline definition dropdown with options
   - Or SCM section appears

---

## Solution 3: Recreate the Job Properly

If nothing works:

1. **Delete current job**: http://jenkins.local/job/three-tier-app/delete

2. **Create new Pipeline job** (following CREATE_PIPELINE_STEPS.md)

3. The new job should have proper pipeline options

---

## Solution 4: Manual SCM Configuration via UI

If you see ANY dropdowns or sections:

1. Look for **"Pipeline"** or **"Build"** section
2. Look for **"Source Code Management"** section (might be separate)
3. Configure SCM there:
   - Select "Git"
   - Add repository URL
   - Add credentials
   - Set branch

Then the Pipeline section should populate.

---

## What to Check in the Configure Page

Look for these sections (they might be in different places):

- [ ] **"Source Code Management"** section
- [ ] **"Pipeline"** section  
- [ ] **"Build"** section
- [ ] Any dropdown that says "Definition" or "Pipeline"

If NONE of these appear, the Pipeline plugin might not be fully installed or needs restart.

