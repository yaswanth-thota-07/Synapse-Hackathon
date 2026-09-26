# 🔍 Dynamic Peer Group Discovery Engine

> **AI-powered company peer discovery based on business, financial, and market similarity**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Open%20App-success?style=for-the-badge)](https://synapse-hackathon-fvwx.onrender.com/)

---

## 🚀 Live Demo

🌐 **[https://synapse-hackathon-fvwx.onrender.com/](https://synapse-hackathon-fvwx.onrender.com/)**

---

## 📌 Problem Statement

Exchanges and analysts often compare a company with its **peer companies** to understand its relative financial and market position.

However, peer groups are often:

- Decided manually
- Based mainly on industry classification
- Difficult to update
- Unable to capture actual business and financial similarities

Two companies may belong to the same broad industry but have very different financial characteristics, while companies with different labels may exhibit similar business and market behavior.

### The Challenge

Build an intelligent system that automatically discovers which companies are truly similar to a selected company based on their **actual business, financial, and market characteristics**, rather than relying only on industry labels.

---

# 💡 Our Solution

**Dynamic Peer Group Discovery Engine** automatically identifies and ranks companies that are most similar to a selected company.

The system uses two independent scores:

### 1. 🔍 Similarity Score

Measures:

> **"How similar is this company to the selected company?"**

The system analyzes financial and market features, normalizes them, applies feature weights, and calculates a similarity score.

### 2. 📊 Company Strength Score

Measures:

> **"How strong is this company according to our selected financial and market criteria?"**

This score is completely independent of similarity.

A company can therefore be:

- Highly similar but have a lower strength score
- Less similar but have a higher strength score

This provides a more informative view than ranking companies using only one metric.

---

# 🧠 How It Works

```text
                    User selects company
                            │
                            ▼
                 Identify sector / industry
                            │
                            ▼
                  Build peer universe
                            │
                            ▼
                 Clean financial data
                            │
                            ▼
                  Normalize features
                            │
                            ▼
                Calculate similarity
                            │
                            ▼
              Rank companies by similarity
                            │
             ┌──────────────┴──────────────┐
             ▼                             ▼
       Similarity Score              Company Score
             │                             │
             ▼                             ▼
       View Similarity                View Score
             │                             │
             └──────────────┬──────────────┘
                            ▼
                      AI Analysis
