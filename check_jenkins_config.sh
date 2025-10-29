#!/bin/bash

echo "🔍 Checking Jenkins Build Triggers Configuration"
echo "=============================================="
echo ""

JENKINS_URL="http://jenkins.local"
JOB_NAME="demo_devops"

echo "1. Checking if Jenkins is accessible..."
if curl -s "$JENKINS_URL" > /dev/null; then
    echo "   ✅ Jenkins is accessible at $JENKINS_URL"
else
    echo "   ❌ Cannot access Jenkins at $JENKINS_URL"
    exit 1
fi

echo ""
echo "2. Checking job configuration..."
CONFIG=$(curl -s "$JENKINS_URL/job/$JOB_NAME/config.xml" 2>/dev/null)

if [ -z "$CONFIG" ]; then
    echo "   ❌ Could not retrieve job configuration"
    exit 1
fi

echo "   ✅ Job '$JOB_NAME' found"

echo ""
echo "3. Checking Build Triggers..."
if echo "$CONFIG" | grep -q "<triggers/>"; then
    echo "   ❌ NO BUILD TRIGGERS CONFIGURED!"
    echo ""
    echo "   The triggers section is empty: <triggers/>"
    echo ""
    echo "   📋 To enable webhook triggers, you need to:"
    echo "   1. Open: http://jenkins.local/job/$JOB_NAME/configure"
    echo "   2. Scroll to 'Build Triggers' section"
    echo "   3. Check: ✅ 'GitHub hook trigger for GITScm polling'"
    echo "   4. Click 'Save'"
elif echo "$CONFIG" | grep -q "GitHub\|github\|webhook\|trigger"; then
    echo "   ✅ Build triggers found!"
    echo ""
    echo "$CONFIG" | grep -A 5 -B 2 "GitHub\|trigger" | head -20
else
    echo "   ⚠️  Build triggers section exists but no GitHub/webhook triggers detected"
fi

echo ""
echo "4. Checking if GitHub Plugin is installed..."
if curl -s "$JENKINS_URL/pluginManager/installed" | grep -qi "github"; then
    echo "   ✅ GitHub plugin appears to be installed"
else
    echo "   ⚠️  GitHub plugin status unclear (check manually)"
    echo "   📋 To install: http://jenkins.local/pluginManager/available"
fi

echo ""
echo "=============================================="
echo ""
echo "📝 Quick Actions:"
echo "   • View Job: http://jenkins.local/job/$JOB_NAME/"
echo "   • Configure: http://jenkins.local/job/$JOB_NAME/configure"
echo "   • Build History: http://jenkins.local/job/$JOB_NAME/buildHistory"
echo ""

