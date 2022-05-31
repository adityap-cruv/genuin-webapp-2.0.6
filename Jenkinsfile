pipeline {
    agent any

    stages {

        stage ('Dependencies') {
            steps {
                nodejs('node 14')
                sh 'pwd'
                sh 'ls'
                sh 'npm install'
            }
        }

        stage ('Build') {
            steps {
                sh 'npm run build'
            }
        }

        // stage ('Deploy') {
        //     steps {
        //         
        //     }
        // }
    }
}