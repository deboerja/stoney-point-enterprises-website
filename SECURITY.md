# Security Policy

This repository contains the source for a static informational website
(no server-side application, no database, no user accounts, no data
collection beyond what's described in [Privacy](https://stoneypointenterprises.com/privacy)).
The practical attack surface is limited to the build pipeline and the
static output itself.

## Reporting a vulnerability

If you find a security issue with this website (e.g. a supply-chain
concern in a dependency, an XSS vector in the built output, or a
misconfigured deployment), please report it privately rather than
opening a public issue:

**Jacob.Deboer@stoneypointenterprises.com**

Please include:

- A description of the issue and its potential impact
- Steps to reproduce, if applicable
- Any relevant URLs or file paths

We'll acknowledge reports within a reasonable timeframe and follow up
once the issue is assessed or resolved. We don't currently run a
formal bug-bounty program.

## Scope

In scope:

- This repository's source code, build configuration, and GitHub
  Actions workflows
- The deployed static site at stoneypointenterprises.com

Out of scope:

- Third-party services referenced or linked from this site
- Social engineering or physical-access attacks
