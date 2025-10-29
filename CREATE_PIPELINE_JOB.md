# How to Create a Pipeline Job in Jenkins

## Step-by-Step Guide

### Step 1: Access Jenkins and Create New Job

1. **Open Jenkins Dashboard**
   - Go to: `http://jenkins.local`

2. **Click "New Item"** (top left) or "Create a job" link

3. **Enter Job Name**
   - Type: `demo_devops` (or any name you prefer)

4. **Select Job Type**
   - Choose: **⭕ Pipeline** (this is the key step!)
   - ⚠️ Do NOT select "Freestyle project"
   - ⚠️ Do NOT select "Multibranch Pipeline" (unless you want that)

5. **Click "OK"**

---

### Step 2: Configure Pipeline Settings

After clicking OK, you'll see the configuration page. Fill in:

#### General Section (at the top)
- **Description** (optional): "Build, test, and deploy demo_devops app to minikube"

#### Pipeline Section (scroll down to find this)

1. **Pipeline Definition**
   - Select: **"Pipeline script from SCM"**
     - This tells Jenkins to read the Jenkinsfile from your repository

2. **SCM**
   - Select: **"Git"**

3. **Repository Configuration**
   - **Repository URL**: `https://github.com/SeoulX/demo_devops.git`
   - **Credentials**: Select `demo-app-git` from dropdown
     - If not visible, click "Add" to add your GitHub credentials
   - **Branch Specifier**: `*/main`
     - This tells Jenkins to build the main branch
     - You can also use `*/main` or just `main`

4. **Script Path**
   - Leave as: `Jenkinsfile`
     - This is the default and matches your repository

5. **Lightweight checkout** (optional)
   - You can leave unchecked for now

#### Build Triggers Section (if you want UI config, optional)
- The Generic Webhook Trigger is already configured in Jenkinsfile
- You don't need to change anything here

---

### Step 3: Save the Configuration

1. **Click "Save"** button at the bottom

2. You'll be taken to the job page

---

### Step 4: Test the Pipeline

1. **Click "Build Now"** (left sidebar)

2. **Watch the Build**
   - Click on the build number (#1, #2, etc.) in "Build History"
   - Click "Console Output" to see real-time logs
   - You should see stages:
     - Checkout
     - Prepare
     - Build Backend
     - Build Frontend
     - Test Backend
     - Test Frontend
     - Deploy to Minikube
     - Verify Deployment

3. **Check Build Status**
   - Green ✅ = Success
   - Red ❌ = Failed (check console output for errors)

---

### Step 5: Set Up GitHub Webhook (for automatic triggers)

Now that you have a Pipeline job, the Generic Webhook Trigger in your Jenkinsfile will work.

1. **Go to your GitHub repository**
   - Repository: `https://github.com/SeoulX/demo_devops`

2. **Add Webhook**
   - Click: **Settings** → **Webhooks** → **Add webhook**

3. **Configure Webhook**
   - **Payload URL**: 
     ```
     http://jenkins.local/generic-webhook-trigger/invoke?token=demo-devops-token
     ```
     - ⚠️ If Jenkins is on localhost, you'll need ngrok or expose Jenkins to internet
     - For localhost: Use ngrok: `ngrok http 8080`, then use ngrok URL
   
   - **Content type**: `application/json`
   
   - **Secret**: (Optional - leave empty for testing)
   
   - **Which events**: Select **"Just the push event"**
   
   - ✅ **Active**: Checked

4. **Click "Add webhook"**

5. **Test It**
   ```bash
   git push origin main
   ```
   - Pipeline should trigger within seconds!

---

## Troubleshooting

### ❌ Pipeline shows "Finished: SUCCESS" but no stages run

- **Problem**: Job might still be Freestyle type
- **Solution**: Delete and recreate as Pipeline type

### ❌ "No such file: Jenkinsfile"

- **Problem**: Script Path might be wrong
- **Solution**: Check Script Path is exactly `Jenkinsfile` (case-sensitive)

### ❌ "Repository not found" or authentication error

- **Problem**: Credentials not configured correctly
- **Solution**: 
  - Go to Jenkins → Manage Jenkins → Manage Credentials
  - Add GitHub credentials with username/password or token
  - Use those credentials in pipeline config

### ❌ Build fails at checkout

- **Problem**: Branch name or URL might be wrong
- **Solution**: 
  - Verify Repository URL
  - Check Branch Specifier matches your branch name (`main` vs `master`)

### ❌ Webhook not triggering

- **Problem**: Jenkins might not be accessible from internet
- **Solution**: 
  - Use ngrok: `ngrok http 8080`
  - Update webhook URL with ngrok URL
  - Or expose Jenkins to your network

---

## Quick Reference: Pipeline vs Freestyle

| Feature | Freestyle Project | Pipeline Project |
|---------|-------------------|------------------|
| Uses Jenkinsfile | ❌ No | ✅ Yes |
| Declarative Syntax | ❌ No | ✅ Yes |
| Complex Workflows | ⚠️ Limited | ✅ Full Support |
| Code as Configuration | ❌ No | ✅ Yes |
| Webhook Integration | ⚠️ Basic | ✅ Advanced |

---

## Next Steps After Creating Pipeline

1. ✅ Test manual build
2. ✅ Set up GitHub webhook
3. ✅ Verify auto-trigger on push
4. ✅ Monitor builds in Jenkins dashboard

Your pipeline is now ready to automatically build, test, and deploy on every push to `main`! 🚀

