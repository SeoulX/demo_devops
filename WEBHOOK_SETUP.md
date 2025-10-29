# Webhook Setup Guide for Jenkins

If you don't have the "GitHub hook trigger for GITScm polling" option in Jenkins UI, here are alternatives:

## Option 1: Install Generic Webhook Trigger Plugin (Recommended)

This plugin works with **any Git provider** (GitHub, GitLab, Bitbucket, etc.) and doesn't require special UI configuration.

### Install Plugin:
1. Go to: `http://jenkins.local/pluginManager/available`
2. Search for: **"Generic Webhook Trigger Plugin"**
3. Install it and restart Jenkins

### Configure in Jenkinsfile:
Update your Jenkinsfile triggers section:

```groovy
triggers {
    genericTrigger(
        genericVariables: [
            [key: 'ref', value: '$.ref'],
            [key: 'branch', value: '$.ref', expressionType: 'JSONPath', regexpFilter: 'refs/heads/(.*)']
        ],
        token: 'your-secret-token-here',
        causeString: 'Triggered by push to $branch',
        printContributedVariables: true,
        printPostContent: true
    )
}
```

### Setup GitHub Webhook:
1. GitHub Repository → Settings → Webhooks → Add webhook
2. **Payload URL**: `http://jenkins.local/generic-webhook-trigger/invoke?token=your-secret-token-here`
3. **Content type**: `application/json`
4. **Events**: Select "Just the push event"

## Option 2: Use SCM Polling (Already in Jenkinsfile)

The current Jenkinsfile uses SCM polling every minute. This works **without any plugins** but checks for changes periodically.

**Pros**: 
- No plugin needed
- Works immediately
- Simple setup

**Cons**:
- Not instant (up to 1 minute delay)
- Less efficient (polls even when no changes)

## Option 3: Install GitHub Plugin Properly

If you want the GitHub-specific trigger:

### Check if GitHub Plugin is Installed:
1. Go to: `http://jenkins.local/pluginManager/installed`
2. Search for "GitHub" or "GitHub Branch Source Plugin"
3. If not found, install:
   - **GitHub Branch Source Plugin**
   - **GitHub Plugin**

### After Installation:
1. Go to: `http://jenkins.local/configure`
2. Scroll to "GitHub" section
3. Add GitHub server configuration
4. Then the "GitHub hook trigger" option should appear in job configuration

## Option 4: Manual Trigger via API

You can trigger builds via Jenkins API when you push:

```bash
# Trigger build via API (after push)
curl -X POST http://jenkins.local/job/demo_devops/build \
  --user username:password_or_token
```

## Current Configuration

Your Jenkinsfile is currently set to use **SCM polling** which:
- ✅ Works immediately (no plugin needed)
- ✅ Checks for changes every 1 minute
- ⚠️  Not instant but functional

## Recommended Next Steps

1. **For immediate use**: Keep the current `pollSCM` configuration (already working)
2. **For instant triggers**: Install "Generic Webhook Trigger Plugin" and update Jenkinsfile
3. **For GitHub-specific**: Install GitHub Branch Source Plugin

## Testing Your Current Setup

The current setup with `pollSCM` should already work:

```bash
# Push to main branch
git push origin main

# Wait up to 1 minute - Jenkins will detect the change and start the build
```

You can check if it's working by watching the Jenkins dashboard after a push.

