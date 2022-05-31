pipeline {
    agent any

    tools {
        nodejs 'node 14'
    }  

    stages {

        stage ('Dependencies') {
            steps {
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