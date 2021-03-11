def pipelineConfig=[
  // A. ENV-SPECIFIC VALUES (MAY DIFFER ON OTHER JENKINS/KUBERNETES/NEXUS) -------------------
  
  npmRegistryUrl: 'https://nexus-cit-retail.skytap-tss.vodafone.com/repository/greece_cit_retail_app_group/',
  npmPrivateRegistryUrl: 'https://nexus-cit-retail.skytap-tss.vodafone.com/repository/greece_cit_retail_app_repo/',
  //The same user will be used for the npm and docker registries hosted on Nexus
  npmRegistryCredentialsId: 'nexusBase64Encoded',
  filename: 'package.json',
  localMarket_test: '5ea6af209ad2df0d63f9ee18',
  localMarket_dev: '5eaa8ab54578a933c0523b83',
  localMarket_stage: '5ea6af209ad2df0d63f9ee18',
  
]

def _deployNpmPkg(def pipelineConfig) {
  
  //Create .npmrc file with connection details and credentials for npm registries
  
  def npmConfig="""
#Default group registry to download packages
registry=${pipelineConfig.npmRegistryUrl}
always-auth=true
_auth=\${NPM_AUTH}
#Private registry to download packages (use additional "--scope=@privateRegistry" argument in the npm commands)
@privateRegistry:registry=${pipelineConfig.npmPrivateRegistryUrl}
//DOMAIN/FEED/:always-auth=true
//DOMAIN/FEED/:_auth=\${NPM_AUTH}
"""
  
  writeFile(file: ".npmrc", text: npmConfig)
  
  // Get base64 encoded "user:password"
  withCredentials([string(credentialsId: pipelineConfig.npmRegistryCredentialsId, variable: 'NPM_AUTH')]) {
    //Build the docker image
    sh "npm i"
    sh "npm run build"
    sh "npm publish --scope=@privateRegistry"
  }
}

 def _triggerAppBuilder(def pipelineConfig) {
    // def jsonObj = readJSON file: "${pipelineConfig.filename}"
    // def version = "${jsonObj.version}"
    // def name = "${jsonObj.name}"
    def name = sh(script:"cat ${pipelineConfig.filename} | grep -w name | cut -d'\"' -f4", returnStdout: true).trim()
    def version = sh(script:"cat ${pipelineConfig.filename} | grep -w version | cut -d'\"' -f4", returnStdout: true).trim()
    sh "curl -k -d 'localMarket=${pipelineConfig.localMarket_test}&name=${name}&version=${version}' https://app-builder.app-test.digitalretail.vodafone.com/api/appbuilder/repository/widgets"
    sh "curl -k -d 'localMarket=${pipelineConfig.localMarket_dev}&name=${name}&version=${version}' https://app-builder.app-dev.digitalretail.vodafone.com/api/appbuilder/repository/widgets"
    sh "curl -k -d 'localMarket=${pipelineConfig.localMarket_stage}&name=${name}&version=${version}' https://app-builder.app-stage.digitalretail.vodafone.com/api/appbuilder/repository/widgets"
}
 

pipeline {
  agent { label 'android-slave' }
   
  options {
    disableConcurrentBuilds()
    timestamps()
    timeout(time: 1, unit: 'HOURS')
    preserveStashes(buildCount: 5)
    disableResume()
    //Skip the default checkout to clear the workspace first and then checkout in an "Initialize" stage.
    skipDefaultCheckout()
  }
  
  //parameters {}
  //environment {}
  
  stages {
    //Initialize the workspace
    stage('Checkout clean workspace') {
     steps {
        cleanWs()
        checkout scm
      }
    }
  stage('Publish npm artifacts') {
	  when {
	    branch 'master'
	  }
      steps {
         _deployNpmPkg(pipelineConfig)
      }
    }
    stage('Trigger App Builder') {
      steps {
         _triggerAppBuilder(pipelineConfig)
      }
    }
  }
   
  post {
    always {
      script {
        //Send slack notification 
        def color=null
        
        if (currentBuild.currentResult == 'SUCCESS') {
          color='#00FF00'
        } else if (currentBuild.currentResult == 'FAILURE') {
          color='#FF0000'
        } else {
          color='#FFFF00'
        }
        /* Disabled the slack notifications because the Jenkins CI app is disabled on Vodafone's Slack
        catchError(catchInterruptions: false, stageResult: 'SUCCESS', buildResult: 'SUCCESS') {
          //The "channel" argument is not set, the default channel is used frin the Global Jenkins Configuration
          slackSend(color: color, message: "Status: ${currentBuild.currentResult}, Build: ${env.BUILD_URL}")
        }
        */
      }
    }
  }
}

