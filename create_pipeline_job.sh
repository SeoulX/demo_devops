#!/bin/bash

echo "🚀 Creating Pipeline Job via Jenkins API"
echo "========================================"
echo ""

JENKINS_URL="http://jenkins.local"
JOB_NAME="demo_devops"
CONFIG_FILE="create_pipeline_via_api.xml"

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Config file not found: $CONFIG_FILE"
    exit 1
fi

echo "Attempting to create pipeline job: $JOB_NAME"
echo ""

# Try with curl
echo "Method 1: Using curl + CSRF token..."
CRUMB=$(curl -s -u admin:admin "$JENKINS_URL/crumbIssuer/api/xml?xpath=concat(//crumbRequestField,\":\",//crumb)" 2>/dev/null || echo "")

if [ -z "$CRUMB" ]; then
    echo "⚠️  Could not get CSRF token (might need authentication)"
    echo ""
    echo "📋 MANUAL STEPS REQUIRED:"
    echo ""
    echo "Since API creation requires authentication, please create it manually:"
    echo ""
    echo "1. Go to: $JENKINS_URL"
    echo "2. Click 'New Item'"
    echo "3. Enter name: $JOB_NAME"
    echo "4. Select: ⭕ Pipeline"
    echo "5. Click OK"
    echo ""
    echo "6. Configure:"
    echo "   • Pipeline definition: Pipeline script from SCM"
    echo "   • SCM: Git"
    echo "   • Repository URL: https://github.com/SeoulX/demo_devops.git"
    echo "   • Credentials: demo-app-git"
    echo "   • Branch: */main"
    echo "   • Script Path: Jenkinsfile"
    echo ""
    echo "7. Click Save"
    echo ""
    echo "8. Click 'Build Now' to test"
    exit 0
fi

CRUMB_FIELD=$(echo $CRUMB | cut -d: -f1)
CRUMB_VALUE=$(echo $CRUMB | cut -d: -f2)

echo "Got CSRF token, attempting to create job..."
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "$CRUMB_FIELD: $CRUMB_VALUE" \
    -H "Content-Type: application/xml" \
    --data-binary "@$CONFIG_FILE" \
    "$JENKINS_URL/createItem?name=$JOB_NAME" 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "✅ Pipeline job created successfully!"
    echo ""
    echo "View job at: $JENKINS_URL/job/$JOB_NAME/"
    echo ""
    echo "Next steps:"
    echo "1. Go to: $JENKINS_URL/job/$JOB_NAME/"
    echo "2. Click 'Build Now' to test"
    echo "3. Check console output to see all stages running"
else
    echo "❌ Failed to create job via API (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
    echo ""
    echo "📋 Please create manually using the instructions above"
fi

