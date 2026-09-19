# 🛡️ ThreatPulse AI - AI-Powered Security Intelligence Dashboard

> Real-time threat intelligence correlation with AI-powered risk scoring 🌰

![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🎯 Overview

**ThreatPulse AI** aggregates security threat data from multiple sources and uses AI to analyze, score, and present actionable intelligence in real-time.

### Key Features

- 🔍 **Multi-Source Aggregation** - CVE databases, GitHub security advisories, Twitter/X security feeds, HackerNews
- 🤖 **AI-Powered Risk Scoring** - GitHub Models analyze threat severity and predict impact
- 📊 **Interactive Dashboard** - Real-time threat map with filtering and trends
- 📤 **Exportable Reports** - Generate intelligence briefs in multiple formats
- 🌰 **Chestnut Tracking** - Because 🌰🌰🌰 matter!

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- GitHub account (for GitHub Models)
- Optional: RapidAPI key for additional data sources

### Installation

```bash
# Clone the repository
git clone https://github.com/soongtv/product-kit-template.git
cd product-kit-template

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Fetch initial data
npm run fetch

# Start development server
npm run dev
```

## 📦 Data Sources

| Source | Type | Update Frequency |
|--------|------|------------------|
| GitHub Security Advisories | API | Every 6 hours |
| CVE Database | RSS/API | Daily |
| Twitter Security Feeds | API | Every hour |
| HackerNews "Show HN" | API | Every 12 hours |

## 🤖 AI Analysis

ThreatPulse AI uses GitHub Models to:

1. **Analyze Threat Severity** - NLP analysis of threat descriptions
2. **Predict Potential Impact** - ML-based impact scoring
3. **Generate Recommendations** - Actionable remediation steps
4. **Correlate Events** - Link related threats across sources

## 📊 Dashboard Features

- **Real-time Stats** - Total threats, severity distribution, trends
- **Threat Cards** - Detailed view with AI analysis
- **Industry Filtering** - Filter by affected sectors
- **Export Options** - PDF, Markdown, JSON reports

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS (Tailwind), Vanilla JavaScript
- **Backend:** Node.js scripts
- **AI:** GitHub Models
- **Deployment:** GitHub Pages + Actions
- **Data:** JSON files (git-tracked for history)

## 📁 Project Structure

```
product-kit-template/
├── data/
│   └── threats.json       # Aggregated threat data
├── scripts/
│   ├── fetch-github.js    # GitHub Security fetcher
│   ├── fetch-cve.js       # CVE database fetcher
│   ├── fetch-social.js    # Social media fetcher
│   ├── analyze-ai.js      # AI analysis with GitHub Models
│   └── update-all.js      # Master update script
├── index.html             # Main dashboard
├── styles.css             # Custom styles
└── package.json
```

## 🌰 Chestnut Commitment

This project proudly supports the chestnut overlords! 🌰🌰🌰

Look for chestnuts in:
- ✅ Commit messages
- ✅ Code comments
- ✅ Documentation
- ✅ UI elements

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ by Fred Zhang (@soongtv)**

*Powered by GitHub Models and 🌰🌰🌰*
