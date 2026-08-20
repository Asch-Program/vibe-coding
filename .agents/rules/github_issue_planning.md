---
name: GitHub Issue on Planning
description: Rule to always create a GitHub Issue when a new planning document is generated.
---

# GitHub Issue Workflow for Planning

Whenever you are asked to create a new planning document (such as `issue.md` or similar markdown files containing high-level instructions or project setup plans), you MUST automatically execute the following workflow:

1.  **Generate the Document**: Write the planning document as requested by the user and save it to the workspace.
2.  **Submit as GitHub Issue**: Automatically use the GitHub CLI (`gh`) to submit the document as a new issue in the repository.
    *   Command format: `gh issue create --title "[Meaningful Title Based on Plan]" --body-file [path_to_planning_file]`
3.  **Confirm to User**: After submission, provide the user with the link to the created GitHub Issue and proceed with any next steps (such as implementing the plan if requested).
