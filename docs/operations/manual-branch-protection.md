# Manual Branch Protection Setup Guide

Since GitHub Actions workflows don't have admin permissions by default, you'll need to set up branch protection rules manually.

## 🛡️ Setting Up Branch Protection

### 1. Navigate to Branch Protection Settings

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Click **Branches** in the left sidebar
4. Click **Add rule** next to "Branch protection rules"

### 2. Configure Main Branch Protection

#### Branch Name Pattern

```
main
```

#### Protection Settings

Check these boxes:

**Restrict pushes that create files**

- ✅ **Require a pull request before merging**
  - ✅ Require approvals: **1**
  - ✅ Dismiss stale PR approvals when new commits are pushed
  - ✅ Require review from code owners (if you want stricter control)

**Require status checks to pass**

- ✅ **Require status checks to pass before merging**
- ✅ **Require branches to be up to date before merging**

**Required Status Checks** (add these):

```
test (20.x)
test (22.x)
security
code-quality
compatibility (ubuntu-latest, 20.x)
compatibility (windows-latest, 20.x)
compatibility (macos-latest, 20.x)
```

**Additional Restrictions**

- ✅ **Require conversation resolution before merging**
- ✅ **Restrict pushes that create files**
- ❌ **Allow force pushes** (keep unchecked)
- ❌ **Allow deletions** (keep unchecked)

### 3. Save the Rule

Click **Create** to save the branch protection rule.

## 🔍 Verification

After setting up, verify the protection works:

1. Try to push directly to main (should be blocked)
2. Create a test PR and ensure status checks are required
3. Verify that PRs require approval before merging

## 🚨 Alternative: Use the Workflow

If you have admin permissions, you can run the branch protection workflow:

1. Go to **Actions** tab
2. Find **Branch Protection** workflow
3. Click **Run workflow**
4. The workflow will attempt to set up protection rules automatically

## 📋 Quick Setup Checklist

- [ ] Navigate to Settings → Branches
- [ ] Add protection rule for `main` branch
- [ ] Require pull request reviews (1 approval)
- [ ] Require status checks to pass
- [ ] Add all required status check names
- [ ] Require conversation resolution
- [ ] Disable force pushes and deletions
- [ ] Save the rule
- [ ] Test with a sample PR

## 🎯 Expected Behavior After Setup

- ✅ Direct pushes to main are blocked
- ✅ PRs require 1 approval
- ✅ All CI checks must pass
- ✅ Conversations must be resolved
- ✅ Stale reviews are dismissed on new commits

This ensures code quality and prevents accidental direct pushes to the main branch!
