pipeline {
    agent
    {
    kubernetes {
            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: docker
    image: docker:24.0
    command:
    - cat
    tty: true
    volumeMounts:
    - mountPath: /var/run/docker.sock
      name: docker-sock
  volumes:
  - name: docker-sock
    hostPath:
      path: /var/run/docker.sock
"""
        }
    }
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
        DOCKERHUB_REPO = "aadinnr/demo_devops"   // replace with your repo
    }
    triggers {
        githubPush()   // auto build on GitHub push
    }
    stages {
        stage('Login to Docker Hub') {
            steps {
                script {
                    sh """
                    echo "Logging in to Docker Hub..."
                    echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin
                    """
                }
            }
        }

        stage('Set Docker Tag') {
            steps {
                script {
                    // Jenkins provides GIT_BRANCH or GIT_TAG (if using multibranch pipeline)
                    def tagName = env.GIT_BRANCH ?: "latest"
                    tagName = tagName.replaceAll("/", "-")  // clean branch names like feature/x
                    env.IMAGE_TAG = tagName
                }
                echo "Docker Tag set to: ${env.IMAGE_TAG}"
            }
        }

        stage('Build & Push Backend') {
            steps {
                sh '''
                docker build -t $DOCKERHUB_USER/$REPO_NAME:backend-${IMAGE_TAG} ./backend
                docker push $DOCKERHUB_USER/$REPO_NAME:backend-${IMAGE_TAG}
                '''
            }
        }

        stage('Build & Push Frontend') {
            steps {
                sh '''
                docker build -t $DOCKERHUB_USER/$REPO_NAME:frontend-${IMAGE_TAG} ./frontend
                docker push $DOCKERHUB_USER/$REPO_NAME:frontend-${IMAGE_TAG}
                '''
            }
        }
    }
}
