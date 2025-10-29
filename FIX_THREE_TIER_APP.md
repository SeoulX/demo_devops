# Fix three-tier-app Pipeline Job

## Problems Found

1. ❌ **No Pipeline Definition**: The job has no SCM or script configured
2. ❌ **Never Been Built**: `lastBuild: null` - job has never run
3. ❌ **Jenkinsfile Syntax Error**: Missing `steps {` wrapper in Checkout stage

## Solution

### Step 1: Fix Jenkinsfile Syntax Error

The Checkout stage is missing the `steps {` wrapper. Update line 39-54:

**Current (WRONG):**
```groovy
stage('Checkout') {
    checkout scm
    script {
        ...
    }
}
```

**Should be:**
```groovy
stage('Checkout') {
    steps {
        checkout scm
        script {
            ...
        }
    }
}
```

### Step 2: Configure the Pipeline Job

1. **Go to**: http://jenkins.local/job/three-tier-app/configure

2. **Scroll to "Pipeline" section**

3. **Configure**:
   - **Pipeline definition**: Select **"Pipeline script from SCM"**
   - **SCM**: Select **"Git"**
   - **Repository URL**: `https://github.com/SeoulX/demo_devops.git`
   - **Credentials**: Select `demo-app-git`
   - **Branch**: `*/main`
   - **Script Path**: `Jenkinsfile`

4. **Click "Save"**

5. **Test**: Click "Build Now"

---

## Quick Fix Checklist

- [ ] Fix Jenkinsfile syntax (add `steps {` in Checkout stage)
- [ ] Configure pipeline job with SCM
- [ ] Point to correct repository and branch
- [ ] Set Script Path to Jenkinsfile
- [ ] Save configuration
- [ ] Test with Build Now

---

Once fixed, the pipeline will:
- ✅ Run all stages when triggered
- ✅ Accept webhook triggers
- ✅ Build, test, and deploy to minikube

