pipeline {
    agent {
        docker {
            image 'node:14'
            args '-p 4000:4000'
        }
    }

    stages {
        stage ('Build') {
            steps {
                sh 'npm install'
            }
        }
    }
}