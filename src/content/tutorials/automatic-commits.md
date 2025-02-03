---
title: "Create Smarter & Better Git Commits with AI"
dateCreated: 2025-02-03
dateUpdated: 2025-02-03
published: true
slug: commit
icon: ./icons/send_comment.png
aiImage: ./images/automatic-commits.webp
tags:
  - Git
  - Bash Scripting
  - AI
  - Developer Tools
  - Automation
  - Python
  - DevOps
category: DevOps
type: tutorial
description: Learn how to automate Git commit messages using AI and Bash scripting. This tutorial shows you how to create meaningful, consistent commits with minimal effort.
hnLink: https://news.ycombinator.com/item?id=42916404
redditLink: https://www.reddit.com/r/programming/comments/1igldwg/create_smarter_better_and_faster_git_commits_with/
---

How many times have you stared at your terminal, trying to craft the perfect git commit message? Probably not much.

I know what you have done often though...

```bash
git add --all
git commit -m "fix"
git push
```

If you are a super lazy person like, me you maybe even created a git alias for that and only have to do:
```bash
git cm "fix"
gp
```

Today I decided to change this forever. I decided to be the most thoughtful person in he world and think about my future self an anyone who is going to search for my code in the future...

Enter `commit`.

## 🙏 The Script

```bash
#!/bin/bash

check_git_repo() {
    if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        exit 1
    fi
}

check_changes() {
    if [ -z "$(git status --porcelain)" ]; then
        exit 0
    fi
}

generate_commit_message() {
    local diff_content=$(git diff --cached)
    local files_changed=$(git status --porcelain)

    echo -e "Files changed:\n$files_changed\n\nChanges:\n$diff_content" | \
        llm -m anthropic/claude-3-5-sonnet-latest \
        "Generate a git commit message for these changes. The message must have:

        1. TITLE LINE: A specific, concise summary (max 50 chars) that clearly
           describes the primary change or feature. This should not be generic like
           'Update files' but rather describe the actual change like 'Add user
           authentication to API endpoints'

        2. BLANK LINE

        3. DETAILED DESCRIPTION: A thorough explanation including:
           - What changes were made
           - Why they were necessary
           - Any important technical details
           - Breaking changes or important notes
           Wrap this at 72 chars.

        IMPORTANT:
        - Output ONLY the commit message
        - Make sure the title is specific to these changes
        - Focus on the what and why, not just the how"
}

# Main execution
main() {
    check_git_repo
    check_changes
    git add --all
    commit_message=$(generate_commit_message)
    git commit -m "$commit_message"
}

main "$@"
```

## ⚒️ Breaking it Down


1. **Repository Validation**
```bash
check_git_repo() {
    if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        exit 1
    fi
}
```
This function ensures we're working within a git repository.

2. **Change Detection**
```bash
check_changes() {
    if [ -z "$(git status --porcelain)" ]; then
        exit 0
    fi
}
```
Verifies that there are actually changes to commit.

3. **AI-Powered Message Generation**
```bash
generate_commit_message() {
    local diff_content=$(git diff --cached)
    local files_changed=$(git status --porcelain)

    echo -e "Files changed:\n$files_changed\n\nChanges:\n$diff_content" | \
        llm -m anthropic/claude-3-5-sonnet-latest \
        "Generate a git commit message for these changes. The message must have:

        1. TITLE LINE: A specific, concise summary (max 50 chars) that clearly
           describes the primary change or feature. This should not be generic like
           'Update files' but rather describe the actual change like 'Add user
           authentication to API endpoints'

        2. BLANK LINE

        3. DETAILED DESCRIPTION: A thorough explanation including:
           - What changes were made
           - Why they were necessary
           - Any important technical details
           - Breaking changes or important notes
           Wrap this at 72 chars.

        IMPORTANT:
        - Output ONLY the commit message
        - Make sure the title is specific to these changes
        - Focus on the what and why, not just the how"
}
```
This is where the magic happens - the script analyzes your changes and uses AI to generate a meaningful commit message.

The script uses [Simon Willison](https://simonwillison.net/)'s `llm` [command-line tool](https://github.com/simonw/llm), which is an incredibly useful utility for interacting with various AI models directly from your terminal. Head over to his [documentation](https://llm.datasette.io/) to learn more about it. How to set it up and actually use it.

Please note that I use anthropic's model in this script, which means you will have to set up the [llm-anthropic](https://github.com/simonw/llm-anthropic) plugin.

## 💻 Setting it up

To run this, just create a commit file and add it your bin directory, such that it ends up in you PATH.

Don't forget to run
```bash
chmod +x ~/.local/bin/commit
```
to make the script executable. Of course, update the path to the script depending on where you save it.


## 🎉 Yay

Now after working hard on your code you'll just have to run `commit` and you'll get a commit message generated by AI.
