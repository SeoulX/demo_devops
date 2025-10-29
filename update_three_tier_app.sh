#!/bin/bash

echo "🔧 Updating three-tier-app Pipeline Configuration"
echo "================================================="
echo ""

JENKINS_URL="http://jenkins.local"
JOB_NAME="three-tier-app"
CONFIG_FILE="three-tier-app-config.xml"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Config file not found: $CONFIG_FILE"
    exit 1
fi

echo "Attempting to update job configuration via API..."
echo ""

# Get CSRF crumb
echo "Step 1: Getting CSRF token..."
CRUMB=$(curl -s "$JENKINS_URL/crumbIssuer/api/xml?xpath=concat(//crumbRequestField,\":\",//crumb)" 2>/dev/null)

if [ -z "$CRUMB" ]; then
    echo "⚠️  Could not get CSRF token automatically"
    echo ""
    echo "📋 MANUAL METHOD:"
    echo ""
    echo "Since the dropdown is empty, you have two options:"
    echo ""
    echo "OPTION A: Update config.xml directly via browser"
    echo "------------------------------------------------"
    echo "1. Open Jenkins in browser: $JENKINS_URL"
    echo "2. Install 'Config File Provider Plugin' or use script console"
    echo "3. OR use this direct URL method:"
    echo ""
    echo "   Save the content from 'three-tier-app-config.xml' file"
    echo "   Then visit: $JENKINS_URL/job/$JOB_NAME/config.xml"
    echo "   And replace all content with the new config"
    echo ""
    echo "OPTION B: Use Jenkins Script Console (Recommended)"
    echo "---------------------------------------------------"
    echo "1. Go to: $JENKINS_URL/script"
    echo "2. Paste and run this script:"
    echo ""
    cat << 'EOF'
def jobName = 'three-tier-app'
def job = Jenkins.instance.getItem(jobName)
if (job == null) {
    println "Job not found: $jobName"
    return
}

// Read the new config
def configXml = new File('three-tier-app-config.xml').text
// OR paste the XML content directly here

// Update job config
def xmlStream = new ByteArrayInputStream(configXml.getBytes())
job.updateByXml(new XmlSlurper().parse(xmlStream))
job.save()

println "Job $jobName updated successfully!"
EOF
    echo ""
    echo "OPTION C: Delete and Recreate Job"
    echo "----------------------------------"
    echo "1. Delete current job: $JENKINS_URL/job/$JOB_NAME/delete"
    echo "2. Create new Pipeline job following: CREATE_PIPELINE_STEPS.md"
    echo ""
    exit 0
fi

CRUMB_FIELD=$(echo $CRUMB | cut -d: -f1)
CRUMB_VALUE=$(echo $CRUMB | cut -d: -f2)

echo "Got CSRF token, updating job configuration..."
echo ""

# Try to update config
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "$CRUMB_FIELD: $CRUMB_VALUE" \
    -H "Content-Type: application/xml" \
    --data-binary "@$CONFIG_FILE" \
    "$JENKINS_URL/job/$JOB_NAME/config.xml" 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Job configuration updated successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Go to: $JENKINS_URL/job/$JOB_NAME/"
    echo "2. Click 'Build Now' to test"
    echo "3. Check console output - should see all stages running"
else
    echo "❌ Failed to update via API (HTTP $HTTP_CODE)"
    echo ""
    echo "Use one of the manual methods above"
fi

