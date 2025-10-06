#!/bin/bash

# Git Push Script for BBFS Implementation
# This script helps push the BBFS changes to GitHub

echo "🚀 Git Push Script for BBFS Implementation"
echo "=========================================="

# Check current git status
echo "📋 Checking current git status..."
git status

echo ""
echo "📊 Latest commit details:"
git log --oneline -1

echo ""
echo "🔍 Files in latest commit:"
git show --name-only HEAD

echo ""
echo "🌐 Push Options:"
echo "1. Push to existing remote"
echo "2. Add new remote and push"
echo "3. Just show push commands"

read -p "Choose option (1-3): " choice

case $choice in
    1)
        echo "📤 Pushing to existing remote..."
        git remote -v
        read -p "Enter remote name (default: origin): " remote_name
        remote_name=${remote_name:-origin}
        read -p "Enter branch name (default: master): " branch_name
        branch_name=${branch_name:-master}
        
        git push $remote_name $branch_name
        ;;
    2)
        echo "➕ Adding new remote..."
        read -p "Enter GitHub repository URL: " repo_url
        git remote add origin $repo_url
        echo "✅ Remote added successfully!"
        
        read -p "Enter branch name (default: master): " branch_name
        branch_name=${branch_name:-master}
        
        echo "📤 Pushing to new remote..."
        git push -u origin $branch_name
        ;;
    3)
        echo "📝 Here are the push commands you can run manually:"
        echo ""
        echo "# For existing remote:"
        echo "git push origin master"
        echo ""
        echo "# For new remote:"
        echo "git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
        echo "git push -u origin master"
        echo ""
        echo "# Check current remotes:"
        echo "git remote -v"
        ;;
    *)
        echo "❌ Invalid option selected"
        exit 1
        ;;
esac

echo ""
echo "✅ Process completed!"
echo "🎉 BBFS implementation is ready to share with the world!"