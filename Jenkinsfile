/**
* Make sure Docker is installed on your system and Jenkins can execute docker commands
* 
* # Necessary Plugins and Credentials for using this Jenkinsfile 
*
* -- AWS credentials -- 
* - Create AWS credentials with following fields (Pipeline AWS Steps Plugin)
* @ID - ECR credentials
* @Access Key ID
* @Secret Access Key
* ## Will be used in withAWS(){} block
* ## Make sure user has necessary IAM role -- ECR registry Full Access
*
* -- Config files for .env.production.local --
* - Path -> Manage Jenkins - Managed files (Config File Provider Plugin)
* !IDs
* @qa_env
* @prod_env
* ## One of these files are used during build process
*
*/

pipeline {
    agent any
    
    parameters {
        string(name: 'VERSION', defaultValue: '1.0.0', description: 'Version of application')
        choice(name: 'ENVIRONMENT', choices: ['qa', 'prod'], description: 'Environment for build')
    }
    
    environment {
        AWS_ACCOUNT_ID="685016229870"
        AWS_DEFAULT_REGION="us-east-2"
        IMAGE_REPO_NAME="genuin-webapp-${ENVIRONMENT}"
        IMAGE_TAG="latest"
        REPOSITORY_URI = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${IMAGE_REPO_NAME}"
    }
   
    stages {
        
        // Using aws CLI to get ECR access
        stage('Logging into AWS ECR') {
            steps {
                withAWS(credentials: 'ECR credentials') {
                    sh "aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
                }
            }
        }
  
        // Building Docker images
        stage('Docker build') {
            steps{
                configFileProvider([configFile(fileId: "${ENVIRONMENT}_env", targetLocation: '.env.production.local')]) {
                    sh 'docker-compose build '
                }
                sh 'docker-compose -f docker-compose.production.yml build'
            }
        }
   
        // Uploading Docker images into AWS ECR
        stage('Pushing to ECR') {
            steps{  
                script {
                    // Image with tag latest
                    sh "docker tag ${IMAGE_REPO_NAME}:${IMAGE_TAG} ${REPOSITORY_URI}:${IMAGE_TAG}"
                    sh "docker push ${REPOSITORY_URI}:${IMAGE_TAG}"
                    // Image with tag version
                    sh "docker tag ${IMAGE_REPO_NAME}:${IMAGE_TAG} ${REPOSITORY_URI}:${VERSION}"
                    sh "docker push ${REPOSITORY_URI}:${VERSION}"
                }
            }
        }
        
        // Removing all the images from host machine
        stage('Remove Images') {
            steps {
                sh 'docker image rm genuin-webapp-build'
                sh 'docker image rm ${IMAGE_REPO_NAME}:${IMAGE_TAG}'
                sh 'docker image rm ${REPOSITORY_URI}:${IMAGE_TAG}'
                sh 'docker image rm ${REPOSITORY_URI}:${VERSION}'
            }
        }
    }
}