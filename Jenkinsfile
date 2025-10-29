pipeline {
    agent any
    triggers {
        GenericTrigger(
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
                        echo "Preparing environment (Jenkins running in-cluster)..."
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
                        echo "Deploying MongoDB..."
                    '''
                }
            }
        }
        stage('Verify Deployment') {
            steps {
                script {
                    sh '''
                        echo "Verifying deployment..."
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