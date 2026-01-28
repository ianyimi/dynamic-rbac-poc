# Product Mission

## Problem

Epsilon3 is building a dynamic RBAC system where users can define their own roles and permissions. During a technical interview, the discussion revealed that a static, code-defined permission system (like the one built at Edapt) doesn't solve this. The platform needs user-defined roles that operate within system-level guardrails.

This POC demonstrates a two-tier RBAC architecture that solves this problem, serving as a concrete follow-up artifact to link in a post-interview email.

## Target Users

The hiring team at Epsilon3 -- specifically Scott (the interviewer) and the hiring coordinator. This is a single-purpose demo meant to show architectural thinking and execution speed.

## Solution

A two-tier permission system where:

1. **System-level resources and constraints** are defined in code and remain immutable from the UI
2. **User-defined roles and permissions** live in the database but must conform to system-level constraints
3. **Permission evaluation** checks system rules first, then evaluates user-defined rules within those bounds

Users get flexibility to create roles and assign permissions without being able to escalate beyond what the system allows. The demo uses a simulated user switcher (no real auth) so reviewers can instantly see how permissions affect access across 4 resource types.
