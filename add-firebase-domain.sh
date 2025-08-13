#!/bin/bash

# Script to add Firebase hosting domain to Firebase Auth authorized domains
# You'll need to authenticate with gcloud first: gcloud auth login

PROJECT_ID="pawsome-new"
DOMAIN="pawsome-new.web.app"

echo "🔐 Adding Firebase hosting domain to Firebase Auth..."
echo "Project: $PROJECT_ID"
echo "Domain: $DOMAIN"
echo ""

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI (gcloud) is not installed."
    echo "📥 Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter="status:ACTIVE" --format="value(account)" | head -n1 > /dev/null; then
    echo "❌ You're not authenticated with gcloud."
    echo "🔑 Please run: gcloud auth login"
    exit 1
fi

echo "✅ gcloud is installed and authenticated"

# Get current Firebase Identity Toolkit configuration
echo "📋 Getting current configuration..."
CURRENT_CONFIG=$(gcloud alpha identity projects describe "$PROJECT_ID" --format=json 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ Failed to get current configuration. Make sure:"
    echo "   1. Project ID is correct: $PROJECT_ID"
    echo "   2. You have the necessary permissions"
    echo "   3. Identity Toolkit API is enabled"
    exit 1
fi

# Extract current authorized domains
CURRENT_DOMAINS=$(echo "$CURRENT_CONFIG" | jq -r '.authorizedDomains[]? // empty' 2>/dev/null | tr '\n' ' ')

echo "Current authorized domains: $CURRENT_DOMAINS"

# Check if domain already exists
if echo "$CURRENT_DOMAINS" | grep -q "$DOMAIN"; then
    echo "✅ Domain $DOMAIN is already in the authorized domains list!"
    exit 0
fi

# Add the new domain
echo "➕ Adding domain $DOMAIN..."

# Create updated domains list
NEW_DOMAINS_JSON=$(echo "$CURRENT_CONFIG" | jq --arg domain "$DOMAIN" '.authorizedDomains += [$domain] | {authorizedDomains}' 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ Failed to create updated domains list"
    exit 1
fi

# Update the configuration
echo "$NEW_DOMAINS_JSON" > temp_config.json

echo "🔄 Updating Firebase Auth configuration..."
gcloud alpha identity projects update "$PROJECT_ID" --update-file=temp_config.json

if [ $? -eq 0 ]; then
    echo "✅ Successfully added $DOMAIN to authorized domains!"
    echo "🎉 You can now use Firebase Auth from your Firebase hosting deployment"
    echo "🌐 Your app is live at: https://$DOMAIN"
    rm -f temp_config.json
else
    echo "❌ Failed to update configuration"
    rm -f temp_config.json
    exit 1
fi
