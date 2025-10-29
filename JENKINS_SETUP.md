# Jenkins Pipeline Setup Guide

## Automatic Triggers

The Jenkinsfile is configured to automatically trigger **instantly** when code is pushed to the `main` branch using webhooks.

## Setup Instructions

### GitHub Webhook Setup (Recommended)

#### Step 1: Install GitHub Plugin in Jenkins

1. Go to Jenkins Dashboard → **Manage Jenkins** → **Manage Plugins**
2. Click on **Available** tab
3. Search for **"GitHub plugin"**
4. Check the box and click **Install without restart** (or **Download now and install after restart**)
5. Restart Jenkins if needed

#### Step 2: Configure Jenkins Job for Webhooks

1. Open your Jenkins pipeline job
2. Click **Configure**
3. Scroll down to **Build Triggers** section
4. Check the box: ✅ **GitHub hook trigger for GITScm polling**
5. Click **Save**

#### Step 3: Configure GitHub Repository Webhook

1. Go to your GitHub repository on GitHub.com
2. Click **Settings** → **Webhooks** → **Add webhook**
3. Fill in the webhook settings:
   - **Payload URL**: `http://YOUR_JENKINS_IP:8080/github-webhook/`
     - If Jenkins is on localhost: `http://localhost:8080/github-webhook/`
     - If Jenkins is on a server: `http://your-server-ip:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Secret**: (Optional, leave empty for testing)
   - **Which events?**: Select **"Just the push event"**
   - ✅ **Active** checkbox should be checked
4. Click **Add webhook**

#### Step 4: Make Jenkins Accessible (if not localhost)

If Jenkins is running on your local machine, you may need:

**Option A: Use a tunneling service** (easiest for testing):
- Use [ngrok](https://ngrok.com/) or similar:
  ```bash
  ngrok http 8080
  ```
- Use the ngrok URL in the GitHub webhook: `https://your-ngrok-url.ngrok.io/github-webhook/`

**Option B: Expose Jenkins to your network**:
- Ensure Jenkins is accessible from GitHub
- Configure firewall rules if needed

### Testing the Webhook

1. **Push to main branch**:
   ```bash
   git push origin main
   ```

2. **Check Jenkins**:
   - Pipeline should start **within seconds** (not minutes!)
   - Go to Jenkins Dashboard → Your Job → Check build history

3. **Check Webhook Delivery** (in GitHub):
   - Repository → Settings → Webhooks
   - Click on your webhook
   - Check "Recent Deliveries" - should show successful requests

#### If you're using GitLab instead of GitHub:

1. **Install GitLab Plugin**:
   - Manage Jenkins → Manage Plugins
   - Search for "GitLab plugin" and install

2. **Update Jenkinsfile triggers**:
   ```groovy
   triggers {
       gitlab(triggerOnPush: true, triggerOnMergeRequest: false)
   }
   ```

3. **Configure GitLab Webhook**:
   - GitLab Project → Settings → Webhooks
   - **URL**: `http://your-jenkins-server:8080/project/your-job-name`
   - **Trigger**: Push events
   - Generate Secret Token

4. **Update Jenkinsfile triggers section** (already done):
   ```groovy
   triggers {
       gitlab(triggerOnPush: true, triggerOnMergeRequest: false)
   }
   ```
   
   **Note**: You'll need to modify the Jenkinsfile to use `gitlab()` instead of `githubPush()` if using GitLab.

## How It Works

When you push to the `main` branch:
1. GitHub/GitLab sends a webhook request to Jenkins
2. Jenkins receives the webhook **instantly** (not after polling)
3. Pipeline automatically starts within seconds
4. Build → Test → Deploy to minikube

**No waiting for polling - instant activation!** ⚡

## Manual Trigger

You can also trigger the pipeline manually:
- Jenkins Dashboard → Your Job → "Build Now"

## Branch Protection

The pipeline is configured to **only run on the `main` branch**. If triggered on other branches, it will abort with an error message.

## Troubleshooting

### ❌ Pipeline not triggering on push:

1. **Check Jenkins Job Configuration**:
   - Ensure "GitHub hook trigger for GITScm polling" is ✅ checked
   - Go to: Jenkins Job → Configure → Build Triggers

2. **Verify Webhook is Reaching Jenkins**:
   - GitHub: Repository → Settings → Webhooks → Click your webhook → Check "Recent Deliveries"
   - Look for 200 OK responses
   - If you see errors, check the response body

3. **Check Jenkins is Accessible**:
   - Test webhook URL manually:
     ```bash
     curl -X POST http://your-jenkins:8080/github-webhook/ \
       -H "Content-Type: application/json" \
       -d '{"ref":"refs/heads/main"}'
     ```

4. **Check Jenkins Logs**:
   - Jenkins Dashboard → Manage Jenkins → System Log
   - Look for webhook-related errors

5. **Verify GitHub Plugin is Installed**:
   - Manage Jenkins → Manage Plugins → Installed
   - Search for "GitHub plugin"

6. **Check Branch Name**:
   - Ensure you're pushing to `main` branch (not `master` or other branches)

### ❌ Pipeline triggered but failing:
- Check pipeline console output
- Verify minikube is running: `minikube status`
- Check kubectl access: `kubectl get nodes`

## Quick Reference

**Current Setup**: Webhook-based instant triggers (no cron polling)

**When you push to main** → Pipeline starts within seconds ⚡

**No setup needed in Jenkinsfile** - just configure:
1. GitHub webhook in your repository
2. Enable "GitHub hook trigger" in Jenkins job settings

That's it! Every push to `main` will automatically build, test, and deploy.

