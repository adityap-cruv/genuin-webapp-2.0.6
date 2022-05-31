Pipeline {
    agent any

    tools {
        node 'node 14'
    }

    stages {

        stage ('Dependencies') {
            sh 'npm install'
        }

        stage ('Build') {
            sh 'npm run build'
        }

        stage ('Deploy') {
            sh 'npm start'
        }
    }
}