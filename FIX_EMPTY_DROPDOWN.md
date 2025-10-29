# Fix Empty Pipeline Dropdown - Quick Solution

## Problem
Pipeline dropdown shows nothing - can't select "Pipeline script from SCM"

## Solution: Use Jenkins Script Console

This bypasses the UI and configures the job directly:

### Step 1: Open Script Console

1. Go to: **http://jenkins.local/script**
2. This is Jenkins Script Console (Groovy scripting interface)

### Step 2: Run This Script

Copy and paste this entire script into the console:

```groovy
import jenkins.model.Jenkins
import org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition
import org.jenkinsci.plugins.workflow.job.WorkflowJob
import hudson.plugins.git.GitSCM
import hudson.plugins.git.BranchSpec
import hudson.plugins.git.UserRemoteConfig

def jobName = 'three-tier-app'
def jenkins = Jenkins.instance
def job = jenkins.getItem(jobName) as WorkflowJob

if (job == null) {
    println "ERROR: Job '$jobName' not found!"
    return
}

// Configure Git SCM
def gitScm = new GitSCM([new UserRemoteConfig(
    'https://github.com/SeoulX/demo_devops.git',
    null,
    null,
    'demo-app-git'
)])
gitScm.branches = [new BranchSpec('*/main')]

// Create Pipeline definition with SCM
def flowDefinition = new CpsScmFlowDefinition(gitScm, 'Jenkinsfile')
job.definition = flowDefinition

// Save the job
job.save()

println "✅ SUCCESS: Job '$jobName' configured!"
println ""
println "Pipeline Definition: Pipeline script from SCM"
println "Repository: https://github.com/SeoulX/demo_devops.git"
println "Branch: */main"
println "Script Path: Jenkinsfile"
println ""
println "Now go to: http://jenkins.local/job/$jobName/"
println "And click 'Build Now' to test!"
```

### Step 3: Execute

1. Click **"Run"** button (or press Enter)
2. You should see success message
3. Go to the job page and click **"Build Now"**

---

## Alternative: Check if Plugins Are Missing

If Script Console doesn't work, check for missing plugins:

1. Go to: http://jenkins.local/pluginManager/installed
2. Search for these plugins (should be installed):
   - ✅ **Pipeline** (core plugin)
   - ✅ **Pipeline: SCM Step** (workflow-scm-step)
   - ✅ **Pipeline: Groovy** (workflow-cps)
   - ✅ **Git Plugin** (git)

If any are missing, install them:
- Go to: http://jenkins.local/pluginManager/available
- Search and install missing plugins
- Restart Jenkins

---

## After Configuration

1. ✅ Test with "Build Now"
2. ✅ Verify all stages run
3. ✅ Set up GitHub webhook (see GENERIC_WEBHOOK_SETUP.md)
4. ✅ Push to main and watch it auto-trigger!

---

## Quick Test

After running the script:

```bash
# Check if config was updated
curl -s "http://jenkins.local/job/three-tier-app/config.xml" | grep -i "scm\|definition" | head -5
```

You should see SCM and definition sections now!

