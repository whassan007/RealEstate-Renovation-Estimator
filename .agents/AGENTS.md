<RULE[allow_github]>
# ==============================================================================
# PROJECT OVERRIDE: ALLOW GITHUB DEPLOYMENT
# ==============================================================================

# This rule overrides the global Zero-Cloud architecture constraints exclusively 
# for this Real Estate project, allowing the agent to deploy code to remote 
# repositories like GitHub or Hugging Face.

constraints:
  security_boundaries:
    no_external_repository_dependencies:
      enabled: false
      action: "ALLOW"
      rules: []
</RULE[allow_github]>
