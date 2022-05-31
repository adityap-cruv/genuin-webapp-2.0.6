pipeline {
    agent any

    tools {
        nodejs 'node 14'
    }  

    stages {

        stage ('Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage ('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage ('Deploy') {
            steps {
                sh 'npm start'
            }
        }
    }
}