# Step-by-Step: Create Pipeline Job in Jenkins

## Follow These Exact Steps

### Step 1: Open Jenkins
1. Open your browser
2. Go to: **http://jenkins.local**

### Step 2: Create New Job
1. Click **"New Item"** button (top left of dashboard)
   - OR click **"Create a job"** link

### Step 3: Configure Job Name and Type
1. **Job Name**: Type `demo_devops`
2. **Job Type**: Select **⭕ Pipeline** (IMPORTANT!)
   - Scroll down if you don't see it immediately
   - Make sure it's "Pipeline", NOT "Freestyle project"
3. Click **"OK"** button

### Step 4: Configure Pipeline Settings

You'll see a configuration page. Scroll down and find **"Pipeline"** section:

#### In "Pipeline" Section:

1. **Pipeline Definition** (dropdown):
   - Select: **"Pipeline script from SCM"**
   - This tells Jenkins to read your Jenkinsfile from GitHub

2. **SCM** (dropdown below):
   - Select: **"Git"**

3. **Repository Configuration**:
   - **Repository URL**: 
     ```
     https://github.com/SeoulX/demo_devops.git
     ```
   - **Credentials**: 
     - Click the dropdown, select: **`demo-app-git`**
     - If not visible, click "Add" button and add your GitHub credentials
   
   - **Branch Specifier**: 
     ```
     */main
     ```
     - Or just type: `main`
   
   - **Script Path**: 
     ```
     Jenkinsfile
     ```
     - Leave this as default (should already say "Jenkinsfile")

4. **Optional Settings** (you can leave these):
   - Lightweight checkout: Unchecked (default)
   - Additional Behaviors: Leave default

### Step 5: Save Configuration
1. Scroll to the bottom
2. Click **"Save"** button

### Step 6: Test the Pipeline
1. You'll see the job page
2. In the left sidebar, click **"Build Now"**
3. You'll see build #1 appear in "Build History" (bottom left)
4. Click on the build number (#1)
5. Click **"Console Output"** (left sidebar)
6. **Watch it run!** You should see:
   ```
   Started by user [your-name]
   [Pipeline] Start of Pipeline
   [Pipeline] Checkout
   [Pipeline] stage
   [Pipeline] { (Checkout)
   [Pipeline] stage
   [Pipeline] { (Prepare)
   [Pipeline] stage
   [Pipeline] { (Build Backend)
   ...
   ```

---

## What You Should See

### ✅ Success Indicators:
- ✅ Build shows green checkmark ✅
- ✅ Console output shows all stages:
  - Checkout
  - Prepare  
  - Build Backend
  - Build Frontend
  - Test Backend
  - Test Frontend
  - Deploy to Minikube
  - Verify Deployment

### ❌ If Something Goes Wrong:
- **Red X** ❌ = Build failed
- Check "Console Output" for error messages
- Common issues:
  - Credentials wrong → Fix credentials
  - Branch name wrong → Check Branch Specifier
  - Script Path wrong → Should be exactly "Jenkinsfile"

---

## Quick Checklist

- [ ] Opened http://jenkins.local
- [ ] Clicked "New Item"
- [ ] Entered name: `demo_devops`
- [ ] Selected **Pipeline** (not Freestyle!)
- [ ] Clicked OK
- [ ] Set Pipeline definition: "Pipeline script from SCM"
- [ ] Set SCM: Git
- [ ] Set Repository URL: https://github.com/SeoulX/demo_devops.git
- [ ] Set Credentials: demo-app-git
- [ ] Set Branch: */main
- [ ] Set Script Path: Jenkinsfile
- [ ] Clicked Save
- [ ] Clicked Build Now
- [ ] Checked Console Output - all stages running ✅

---

## Next Steps After Job is Created

1. ✅ Test manual build works
2. ✅ Set up GitHub webhook (see GENERIC_WEBHOOK_SETUP.md)
3. ✅ Push to main branch and watch it auto-trigger!

---

## Visual Guide

```
Jenkins Dashboard
    ↓
[New Item] button
    ↓
Enter "demo_devops" → Select "Pipeline" → [OK]
    ↓
Pipeline Section:
    Pipeline definition: [Pipeline script from SCM ▼]
    SCM: [Git ▼]
    Repository URL: [https://github.com/SeoulX/demo_devops.git]
    Credentials: [demo-app-git ▼]
    Branch: [*/main]
    Script Path: [Jenkinsfile]
    ↓
[Save] button
    ↓
Job created! → [Build Now] → Watch it run!
```

---

Your pipeline is ready to build, test, and deploy automatically! 🚀

