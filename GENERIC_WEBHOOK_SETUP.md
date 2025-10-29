# Generic Webhook Trigger Setup Guide

This guide shows how to configure Generic Webhook Trigger for instant pipeline activation on push to `main` branch.

## ✅ Current Configuration

The Jenkinsfile is already configured with Generic Webhook Trigger! You just need to:

1. **Install the plugin** (if not already installed)
2. **Set up the webhook in GitHub**

## Step 1: Install Generic Webhook Trigger Plugin

1. Go to: `http://jenkins.local/pluginManager/available`
2. Search for: **"Generic Webhook Trigger Plugin"**
3. Click **Install without restart** (or **Download now and install after restart**)
4. Restart Jenkins if prompted

## Step 2: Configure GitHub Webhook

1. Go to your GitHub repository
2. Navigate to: **Settings → Webhooks → Add webhook**

3. Configure the webhook:
   - **Payload URL**: 
     ```
     http://jenkins.local/generic-webhook-trigger/invoke?token=demo-devops-token
     ```
     - If Jenkins is on a different server, replace `jenkins.local` with your Jenkins IP/domain
     - If Jenkins uses a different port, add it: `http://jenkins.local:8080/generic-webhook-trigger/invoke?token=demo-devops-token`
   
   - **Content type**: `application/json`
   
   - **Secret**: (Optional - leave empty for testing, add secret for production)
   
   - **Which events?**: Select **"Just the push event"** (or "Send me everything" for testing)
   
   - ✅ **Active**: Checked

4. Click **Add webhook**

## Step 3: Test the Setup

### Test from GitHub:
```bash
# Push to main branch
git push origin main
```

The pipeline should trigger **within seconds**!

### Test Manually:
You can also test the webhook manually:

```bash
curl -X POST "http://jenkins.local/generic-webhook-trigger/invoke?token=demo-devops-token" \
  -H "Content-Type: application/json" \
  -d '{
    "ref": "refs/heads/main",
    "after": "abc123",
    "repository": {
      "name": "demo_devops"
    }
  }'
```

## How It Works

1. **You push to GitHub** → GitHub sends webhook payload
2. **Webhook reaches Jenkins** → Generic Webhook Trigger receives it at `/generic-webhook-trigger/invoke`
3. **Filter checks branch** → Only `refs/heads/main` triggers the build
4. **Pipeline starts** → Build → Test → Deploy to minikube

## Configuration Details

The current Jenkinsfile configuration:

```groovy
triggers {
    genericTrigger(
        genericVariables: [
            [key: 'ref', value: '$.ref'],           // Full ref: refs/heads/main
            [key: 'branch', value: '$.ref', ...],  // Branch: main
            [key: 'commit', value: '$.after'],      // Commit SHA
            [key: 'repo', value: '$.repository.name'] // Repo name
        ],
        token: 'demo-devops-token',                // Security token
        regexpFilterText: '$ref',                  // Filter on ref
        regexpFilterExpression: '^refs/heads/main$' // Only trigger on main
    )
}
```

### Key Features:
- ✅ **Token-based security**: Only requests with `token=demo-devops-token` are accepted
- ✅ **Branch filtering**: Only triggers on `main` branch pushes
- ✅ **Variable extraction**: Extracts branch, commit, repo from webhook payload
- ✅ **No UI configuration needed**: Everything is in the Jenkinsfile

## Change the Token (Optional)

If you want to use a different token for security:

1. **Update Jenkinsfile**:
   ```groovy
   token: 'your-custom-token-here'
   ```

2. **Update GitHub webhook URL**:
   ```
   http://jenkins.local/generic-webhook-trigger/invoke?token=your-custom-token-here
   ```

## Troubleshooting

### ❌ Webhook not triggering pipeline:

1. **Check plugin is installed**:
   - `http://jenkins.local/pluginManager/installed`
   - Search for "Generic Webhook Trigger"

2. **Check webhook URL is correct**:
   - Must include `?token=demo-devops-token`
   - Must be accessible from GitHub

3. **Check GitHub webhook delivery**:
   - GitHub → Settings → Webhooks → Click your webhook
   - Check "Recent Deliveries" for errors
   - Should show 200 OK responses

4. **Check Jenkins logs**:
   - Jenkins Dashboard → Manage Jenkins → System Log
   - Look for webhook-related errors

5. **Test manually**:
   ```bash
   curl -X POST "http://jenkins.local/generic-webhook-trigger/invoke?token=demo-devops-token" \
     -H "Content-Type: application/json" \
     -d '{"ref":"refs/heads/main","after":"test123","repository":{"name":"demo_devops"}}'
   ```

### ❌ Webhook triggering on wrong branches:

- The regex filter `^refs/heads/main$` should only match main branch
- Check the `ref` value in GitHub webhook payload logs
- Ensure you're pushing to `main` branch (not `master` or other branches)

### ⚠️ Jenkins not accessible from internet:

If Jenkins is on localhost, you need:

**Option A: Use ngrok**:
```bash
ngrok http 8080
# Use the ngrok URL in GitHub webhook
```

**Option B: Expose Jenkins**:
- Configure firewall/port forwarding
- Make Jenkins accessible from GitHub servers

## Security Recommendations

1. **Use a strong token**: Change `demo-devops-token` to something random
2. **Use GitHub webhook secret**: Configure secret in GitHub webhook settings
3. **Restrict webhook to Jenkins network**: Use firewall rules if possible
4. **Monitor webhook deliveries**: Regularly check GitHub webhook logs

## Next Steps

1. ✅ Install Generic Webhook Trigger plugin
2. ✅ Add webhook to GitHub repository
3. ✅ Push to main branch and watch it trigger!
4. 🎉 Your pipeline is now fully automated!

