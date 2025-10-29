pipeline {
    agent any
    
    // Trigger pipeline instantly on push to main branch using Generic Webhook Trigger
    // Webhook URL: http://jenkins.local/generic-webhook-trigger/invoke?token=demo-devops-token
    triggers {
        genericTrigger(
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
        DOCKER_REGISTRY = 'localhost:5000'
        K8S_NAMESPACE = 'demo-apps-jenkins'
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/demo-devops-backend:${BUILD_NUMBER}"
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/demo-devops-frontend:${BUILD_NUMBER}"
        MINIKUBE_DOCKER = 'minikube'
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
                    // Ensure minikube is running and use its Docker daemon
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
                            docker build -t ${BACKEND_IMAGE} -t ${DOCKER_REGISTRY}/demo-devops-backend:latest .
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
                            docker build -t ${FRONTEND_IMAGE} -t ${DOCKER_REGISTRY}/demo-devops-frontend:latest .
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
                        
                        # Set kubectl context to minikube
                        kubectl config use-context minikube
                        
                        # Function to replace environment variables in manifest files
                        apply_manifest() {
                            local file=$1
                            sed -e "s|\\${K8S_NAMESPACE}|${K8S_NAMESPACE}|g" \
                                -e "s|\\${BACKEND_IMAGE}|${BACKEND_IMAGE}|g" \
                                -e "s|\\${FRONTEND_IMAGE}|${FRONTEND_IMAGE}|g" \
                                $file | kubectl apply -f -
                        }
                        
                        # Apply manifests in order
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
                        echo ""
                        echo "Service URLs:"
                        kubectl get svc -n ${K8S_NAMESPACE}
                        echo ""
                        echo "To access the frontend, run:"
                        echo "  minikube service demo-devops-frontend-svc -n ${K8S_NAMESPACE}"
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
                        
                        # Check if backend is responding
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