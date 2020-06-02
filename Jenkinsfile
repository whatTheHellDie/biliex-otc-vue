env.PROJECT_NAME = "external_payment_center_vue"
env.GIT_URL = "http://47.92.137.95:3000/daadaa113/external-payment-center-vue"
env.EXPRESS_GIT_URL = "http://47.92.137.95:3000/daadaa113/express.git"
env.PORT=8191

node{
    stage('git clone'){
        echo "git pull code ......"
        if("${GIT_BRANCH}" == "") {
              git branch: 'master', credentialsId: "28498dc0-c8da-46ed-aad8-4258bc88ac3b", url: "${GIT_URL}"
         } else {
              git branch: "${GIT_BRANCH}", credentialsId: "28498dc0-c8da-46ed-aad8-4258bc88ac3b", url: "${GIT_URL}"
         }
    }

    def NODEJS_HOME = tool 'nodejs'
    def CNPM_HOME = "/usr/local/lib/node_modules/cnpm"
    def BASE_HOME = "/usr/local"
    env.PATH = "${NODEJS_HOME}/bin:${CNPM_HOME}/bin:${BASE_HOME}/bin:${env.PATH}"

    stage('npm install and build'){


        sh '''
            rm -rf ${JENKINS_WORK_SPACE}/${PROJECT_NAME}/dist/*

            cd ${JENKINS_WORK_SPACE}/${PROJECT_NAME}

            cnpm install

            cnpm run build --${ENV}
        '''

    }

    stage('create express'){

        sh '''
            mkdir -p ${JENKINS_WORK_SPACE}/${PROJECT_NAME}/${PROJECT_NAME}-express

            cd ${JENKINS_WORK_SPACE}/${PROJECT_NAME}/${PROJECT_NAME}-express &&  cnpm install

        '''

        dir(path: "${JENKINS_WORK_SPACE}/${PROJECT_NAME}/${PROJECT_NAME}-express") {
            git(
                branch: "master",
                credentialsID: "28498dc0-c8da-46ed-aad8-4258bc88ac3b",
                url : "${EXPRESS_GIT_URL}",
                changelog: true
            )
            sh """
                git checkout
                git branch
            """
        }

        sh '''
            rm -rf ${JENKINS_WORK_SPACE}/${PROJECT_NAME}/${PROJECT_NAME}-express/views/*
            cp -rf ${JENKINS_WORK_SPACE}/${PROJECT_NAME}/dist/* ${JENKINS_WORK_SPACE}/${PROJECT_NAME}/${PROJECT_NAME}-express/views/
        '''
    }

    stage('deploy'){
        sh '''

            sed -i "s/PORT/8191/" ${PROJECT_NAME}-express/bin/www

            tar -zcvf ${PROJECT_NAME}-${TAG}.tar.gz ${PROJECT_NAME}-express

            scp ${PROJECT_NAME}-${TAG}.tar.gz root@${SERVER_IP}:/home

            ssh root@${SERVER_IP} "/home/jenkins_deploy_vue.sh ${PROJECT_NAME} ${TAG} ${ENV}"
        '''
    }
}
