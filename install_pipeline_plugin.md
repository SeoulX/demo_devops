# Install Pipeline Plugin in Jenkins

## Problem
You don't see the "Pipeline" option when creating a new job - only "Freestyle" is available.

## Solution: Install Pipeline Plugin

### Step 1: Access Plugin Manager

1. **Go to Jenkins Dashboard**
   - Open: `http://jenkins.local`

2. **Go to Plugin Management**
   - Click: **"Manage Jenkins"** (in left sidebar or top menu)
   - Click: **"Manage Plugins"** or **"Plugins"**

### Step 2: Install Pipeline Plugin

1. **Click "Available" tab** (at the top)

2. **Search for Pipeline Plugin**
   - In the search box, type: `Pipeline`
   - Look for: **"Pipeline"** or **"Pipeline Plugin"**

3. **Select and Install**
   - ✅ Check the box next to **"Pipeline"**
   - You might also want to install:
     - ✅ **"Pipeline: Stage View Plugin"** (for better visualization)
     - ✅ **"Pipeline: Build Step"** (if not included)
   
4. **Install Options**
   - Click: **"Install without restart"** (if available)
   - OR: **"Download now and install after restart"**
   
5. **Wait for Installation**
   - You'll see a progress bar
   - Wait until installation completes
   - If it says "Restart Jenkins", restart it

### Step 3: Restart Jenkins (if needed)

If Jenkins asks to restart:
1. Click **"Restart Jenkins when installation is complete and no jobs are running"**
2. Wait for Jenkins to restart (you'll see a countdown)
3. Login again when it comes back

### Step 4: Verify Pipeline Plugin

1. **Go back to Dashboard**
2. **Click "New Item"**
3. **You should now see "Pipeline" option!** ✅

---

## Alternative: Install via Command Line (if web UI doesn't work)

If the web UI doesn't work, you can install via Jenkins CLI or directly:

### Method 1: Jenkins CLI

```bash
# Download jenkins-cli.jar
curl http://jenkins.local/jnlpJars/jenkins-cli.jar -o jenkins-cli.jar

# Install Pipeline plugin
java -jar jenkins-cli.jar -s http://jenkins.local install-plugin pipeline

# Restart Jenkins
java -jar jenkins-cli.jar -s http://jenkins.local restart
```

### Method 2: Direct Plugin Installation URL

Visit this URL (replace with your Jenkins URL if different):
```
http://jenkins.local/pluginManager/install?plugin.0=pipeline
```

Then restart Jenkins:
```
http://jenkins.local/safeRestart
```

---

## Required Plugins List

For your Jenkinsfile to work fully, you may want to install these plugins:

1. ✅ **Pipeline** - Core plugin (required!)
2. ✅ **Generic Webhook Trigger Plugin** - Already installed
3. ✅ **Git Plugin** - Already installed (probably)
4. ✅ **Pipeline: Stage View Plugin** - Visual stage view
5. ✅ **Pipeline: Build Step** - Build steps support

---

## After Installation

Once Pipeline plugin is installed:

1. **Create New Pipeline Job**:
   - New Item → Select "Pipeline" ✅
   - Configure as described in `CREATE_PIPELINE_JOB.md`

2. **Your Jenkinsfile will work**:
   - All stages will run
   - Webhook triggers will work
   - Full CI/CD pipeline will execute

---

## Troubleshooting

### ❌ "Pipeline" option still not showing after restart

- **Solution**: Clear browser cache, hard refresh (Ctrl+F5)
- Check if plugin actually installed: Go to "Manage Plugins" → "Installed" tab → Search "Pipeline"

### ❌ Plugin installation fails

- Check Jenkins logs: `http://jenkins.local/log`
- Try installing dependencies first
- Make sure Jenkins has internet access to download plugins

### ❌ Jenkins version too old

- Pipeline plugin requires Jenkins 2.x or newer
- Check version: `http://jenkins.local/systemInfo` (look for "Jenkins Version")
- If very old, you may need to upgrade Jenkins

---

## Quick Command Reference

```bash
# Check Jenkins version
curl -s http://jenkins.local/api/json | grep -i version

# Check installed plugins
curl -s http://jenkins.local/pluginManager/installed | grep -i pipeline

# Install plugin via URL (open in browser)
# http://jenkins.local/pluginManager/install?plugin.0=pipeline
```

