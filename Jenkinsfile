pipeline {
    agent any
    
    // Trigger pipeline instantly on push to main branch using Generic Webhook Trigger
    // Webhook URL: http://jenkins.local/generic-webhook-trigger/invoke?token=demo-devops-token
    triggers {
        GenericTrigger(
            genericVariables: [
                // Extract ref (e.g., refs/heads/main)
                [key: 'ref', value: '$.ref'],
                // Extract branch name from ref (e.g., main from refs/heads/main)
                [key: 'branch', value: '$.ref', expressionType: 'JSONPath', regexpFilter: 'refs/heads/(.*)'],
                // Extract commit SHA
                [key: 'commit', value: '$.after'],
                // Extract repository name
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
        // No registry needed - images are built directly into minikube's Docker daemon
        K8S_NAMESPACE = 'demo-apps-jenkins'
        BACKEND_IMAGE = "demo-devops-backend:${BUILD_NUMBER}"
        FRONTEND_IMAGE = "demo-devops-frontend:${BUILD_NUMBER}"
        // Also tag as 'latest' for convenience
        BACKEND_IMAGE_LATEST = "demo-devops-backend:latest"
        FRONTEND_IMAGE_LATEST = "demo-devops-frontend:latest"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    def branch = env.GIT_BRANCH ?: env.BRANCH_NAME ?: 'main'
                    // Remove 'origin/' prefix if present
                    branch = branch.replaceAll(/^origin\//, '')
                    echo "Building for branch: ${branch}"
                    
                    // Only proceed if on main branch
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
                    // Jenkins is running in-cluster, no minikube needed
                    sh '''
                        echo "Preparing environment (Jenkins running in-cluster)..."
                        
                        // # Verify kubectl is available (should work in-cluster)
                        // echo "Checking kubectl..."
                        // kubectl version --client || echo "Warning: kubectl not available"
                        // kubectl config current-context || echo "Warning: kubectl context not set"
                        // kubectl cluster-info || echo "Warning: Cannot reach cluster"
                        
                        // # Check if Docker is available (might need Docker socket mounted)
                        // echo "Checking Docker..."
                        // if command -v docker &> /dev/null; then
                        //     docker info | head -5 || echo "Warning: Docker daemon not accessible (may need socket mount)"
                        // else
                        //     echo "Docker not found - will use alternative build method"
                        // fi
                        
                        // # Verify we're in the right namespace context
                        // echo "Current namespace context:"
                        // kubectl config view --minify --output 'jsonpath={..namespace}' || echo "default"
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
                            
                            // # Try to build with Docker (if available)
                            // if command -v docker &> /dev/null && docker info &> /dev/null; then
                            //     echo "Using Docker to build image..."
                            //     docker build -t ${BACKEND_IMAGE} -t ${BACKEND_IMAGE_LATEST} .
                            //     docker images | grep demo-devops-backend
                            //     echo "Image built successfully"
                            //     echo "NOTE: Ensure imagePullPolicy is set to 'IfNotPresent' or 'Never' in manifests"
                            // else
                            //     echo "ERROR: Docker not available for building images"
                            //     echo "For in-cluster Jenkins, you need to:"
                            //     echo "  1. Mount Docker socket: /var/run/docker.sock (in Helm values)"
                            //     echo "  2. OR use Kaniko for in-cluster building"
                            //     exit 1
                            fi
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
                            
                            // # Try to build with Docker (if available)
                            // if command -v docker &> /dev/null && docker info &> /dev/null; then
                            //     echo "Using Docker to build image..."
                            //     docker build -t ${FRONTEND_IMAGE} -t ${FRONTEND_IMAGE_LATEST} .
                            //     docker images | grep demo-devops-frontend
                            //     echo "Image built successfully"
                            //     echo "NOTE: Ensure imagePullPolicy is set to 'IfNotPresent' or 'Never' in manifests"
                            // else
                            //     echo "ERROR: Docker not available for building images"
                            //     exit 1
                            // fi
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
                            // python3 -m venv venv || true
                            // source venv/bin/activate || true
                            // pip install -q -r requirements.txt
                            // pytest app/test/ -v || true
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
                            // npm ci --silent || npm install
                            // npm run lint || true
                            // npm test -- --passWithNoTests || true
                        '''
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    sh '''
                        echo "Deploying to Kubernetes cluster (in-cluster Jenkins)..."
                        
                        # Function to replace environment variables in manifest files
                        apply_manifest() {
                            local file=$1
                            sed -e "s|\\${K8S_NAMESPACE}|${K8S_NAMESPACE}|g" \
                                -e "s|\\${BACKEND_IMAGE}|${BACKEND_IMAGE_LATEST}|g" \
                                -e "s|\\${FRONTEND_IMAGE}|${FRONTEND_IMAGE_LATEST}|g" \
                                $file | kubectl apply -f -
                        }
                        
                        # Apply manifests in order
                        echo "Creating namespace..."
                        apply_manifest manifests/namespace.yaml
                        
                        echo "Creating ConfigMap..."
                        apply_manifest manifests/configmap.yaml
                        
                        echo "Deploying MongoDB..."
                        // apply_manifest manifests/mongodb.yaml
                        
                        // echo "Deploying Backend..."
                        // apply_manifest manifests/backend.yaml
                        
                        // echo "Deploying Frontend..."
                        // apply_manifest manifests/frontend.yaml
                        
                        // echo "Waiting for deployments to be ready..."
                        // kubectl rollout status deployment/demo-devops-backend -n ${K8S_NAMESPACE} --timeout=5m
                        // kubectl rollout status deployment/demo-devops-frontend -n ${K8S_NAMESPACE} --timeout=5m
                        
                        // echo "Deployment complete!"
                        // echo ""
                        // echo "Service URLs:"
                        // kubectl get svc -n ${K8S_NAMESPACE}
                        // echo ""
                        // echo "To access services, use port-forward or ingress:"
                        // echo "  kubectl port-forward svc/demo-devops-frontend-svc 3000:3000 -n ${K8S_NAMESPACE}"
                    '''
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                script {
                    sh '''
                        echo "Verifying deployment..."
                        // kubectl get pods -n ${K8S_NAMESPACE}
                        // kubectl get svc -n ${K8S_NAMESPACE}
                        
                        // # Check if backend is responding
                        // echo "Testing backend health..."
                        // kubectl run test-backend --image=curlimages/curl --rm -i --restart=Never -n ${K8S_NAMESPACE} -- \
                        //   curl -f http://demo-devops-backend-svc.${K8S_NAMESPACE}.svc.cluster.local/fastapi/get_init || echo "Backend test skipped"
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
            deleteDir()
        }
    }
}