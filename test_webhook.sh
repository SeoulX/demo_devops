#!/bin/bash

echo "🔧 Testing Generic Webhook Trigger Setup"
echo "========================================"
echo ""

JENKINS_URL="http://jenkins.local"
JOB_NAME="demo_devops"
TOKEN="demo-devops-token"

echo "1. Checking if Generic Webhook Trigger plugin is installed..."
if curl -s "$JENKINS_URL/pluginManager/installed" | grep -qi "generic-webhook-trigger"; then
    echo "   ✅ Plugin is installed"
else
    echo "   ❌ Plugin NOT installed"
    echo "   📋 Install from: $JENKINS_URL/pluginManager/available"
    exit 1
fi

echo ""
echo "2. Checking job configuration..."
CONFIG=$(curl -s "$JENKINS_URL/job/$JOB_NAME/config.xml")
TOKEN_IN_CONFIG=$(echo "$CONFIG" | grep -oP '(?<=<token>)[^<]*')

if [ -z "$TOKEN_IN_CONFIG" ] || [ "$TOKEN_IN_CONFIG" = "" ]; then
    echo "   ❌ Token is NOT configured in Jenkins job!"
    echo "   ⚠️  The Jenkinsfile configuration hasn't been applied yet."
    echo ""
    echo "   📋 SOLUTION: Reload the Jenkinsfile:"
    echo "   1. Go to: $JENKINS_URL/job/$JOB_NAME/configure"
    echo "   2. Click 'Build with Parameters' or trigger a manual build"
    echo "   3. OR click 'Scan Multibranch Pipeline Now' (if using multibranch)"
    echo "   4. The Jenkinsfile will be re-read and trigger configuration will be applied"
else
    echo "   ✅ Token found in config: $TOKEN_IN_CONFIG"
fi

echo ""
echo "3. Testing webhook endpoint..."
TEST_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$JENKINS_URL/generic-webhook-trigger/invoke?token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ref": "refs/heads/main",
    "after": "abc123",
    "repository": {
      "name": "demo_devops"
    }
  }')

HTTP_CODE=$(echo "$TEST_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$TEST_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Webhook endpoint is accessible (HTTP $HTTP_CODE)"
    echo "   Response: $RESPONSE_BODY" | head -c 100
    echo "..."
else
    echo "   ❌ Webhook endpoint returned HTTP $HTTP_CODE"
    echo "   Response: $RESPONSE_BODY"
fi

echo ""
echo "4. Checking GitHub webhook setup..."
echo "   📋 Manual check needed:"
echo "   1. Go to your GitHub repository"
echo "   2. Settings → Webhooks"
echo "   3. Check if webhook exists with URL:"
echo "      $JENKINS_URL/generic-webhook-trigger/invoke?token=$TOKEN"
echo ""
echo "   If webhook doesn't exist, add it:"
echo "   • Payload URL: $JENKINS_URL/generic-webhook-trigger/invoke?token=$TOKEN"
echo "   • Content type: application/json"
echo "   • Events: Just the push event"

echo ""
echo "========================================"
echo ""
echo "🚀 Quick Fix Steps:"
echo ""
echo "1. RELOAD JENKINSFILE (IMPORTANT!):"
echo "   • Trigger a manual build, OR"
echo "   • Push any change to trigger a build"
echo "   • This will reload the Jenkinsfile and apply the trigger config"
echo ""
echo "2. ADD WEBHOOK IN GITHUB:"
echo "   • Repository → Settings → Webhooks → Add webhook"
echo "   • URL: $JENKINS_URL/generic-webhook-trigger/invoke?token=$TOKEN"
echo "   • Content type: application/json"
echo "   • Events: Just the push event"
echo ""
echo "3. TEST IT:"
echo "   git push origin main"
echo ""

