pipeline {
    agent any

    stages {

        stage('Add enviroment variables') {
            steps {
                writeFile file: '.env.production.local', text: '''hostname=https://app.qa.begenuin.com
apiurl=https://nodejs.qa.begenuin.com
flask_api_url=https://python.qa.begenuin.com
genuinurl=https://begenuin.com/
apps_flyer_url=https://video.begenuin.com/9YGw?pid=Genuin&af_web_dp=https%3A%2F%2Fapp.qa.begenuin.com%2Fvideo&af_dp=genuinappqa%3A%2F%2F&af_android_url=https%3A%2F%2Fapp.qa.begenuin.com%2Fvideo&af_ios_url=https%3A%2F%2Fapp.qa.begenuin.com%2Fvideo&video_id=
rt_apps_flyer_url=https://video.begenuin.com/9YGw?pid=Genuin&af_web_dp=https://app.qa.begenuin.com/roundtable&af_dp=genuinappqa://&af_android_url=https://app.qa.begenuin.com/roundtable&af_ios_url=https://app.qa.begenuin.com/roundtable&chat_id=
qt_apps_flyer_url=https://video.begenuin.com/9YGw?pid=Genuin&af_web_dp=https://app.qa.begenuin.com/question&af_dp=genuinappqa://&af_android_url=https://app.qa.begenuin.com/question&af_ios_url=https://app.qa.begenuin.com/question&question_id=
profile_apps_flyer_url=https://video.begenuin.com/9YGw?pid=Genuin&af_web_dp=https://app.qa.begenuin.com/profile&af_dp=genuinappqa://&user_id=
record_apps_flyer_url=https://video.begenuin.com/9YGw?pid=Genuin&af_web_dp=https://app.qa.begenuin.com/profile?user_id={{user_id}}&af_dp=genuinappqa://&af_android_url=https://app.qa.begenuin.com/qr_code&af_ios_url=https://app.qa.begenuin.com/qr_code&qr_code=
installurl=https://install.begenuin.com/9YGw?pid=Genuin&is_retargeting=true&af_dp=genuinappqa%3A%2F%2F&video_id=
productionAppUrl=https://admin.begenuin.com/''' 
            }
        }

        stage('Docker build') {
            steps{
                sh '''
                    docker-compose build 
                    docker-compose -f docker-compose.production.yml build
                    docker image rm genuin-webapp-build
                '''
            }
        }

        // stage('Push image') {
        //     steps{
        //         // Add ECR push
        //     }
        // }
    }

    post {
        success {
            sh 'docker image rm genuin-webapp-prod'
        }
    }

}
