pipeline {
    agent any
    triggers {
        githubPush()  // This enables GitHub webhook trigger
    }
    stages {
        stage('Build') {
            steps {
                echo 'Building...'
            }
        }
        stage('Test') {
            steps {
                echo 'Running tests...'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying application...'
                echo 'GOOOOOOOOOOOOOOOOOOOOO'
            }
        }
    }
}
