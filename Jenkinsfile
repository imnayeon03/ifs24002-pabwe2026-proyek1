pipeline {
  agent any
  tools { nodejs 'node-22' }   // sesuaikan nama NodeJS installation di Jenkins
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Install Backend') { steps { dir('backend') { sh 'npm ci' } } }
    stage('Test Backend') { steps { dir('backend') { sh 'npm test' } } }
    stage('Install Frontend') { steps { dir('frontend') { sh 'npm ci' } } }
    stage('Build Frontend') { steps { dir('frontend') { sh 'npm run build' } } }
  }
  post {
    success { echo 'Pipeline berhasil: tes backend lulus dan frontend berhasil di-build.' }
    failure { echo 'Pipeline gagal, cek log stage di atas.' }
  }
}
