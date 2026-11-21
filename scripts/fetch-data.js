import { writeFile, mkdir } from "fs/promises"

/**
 * ThreatPulse AI - Multi-Source Threat Data Fetcher
 * 🌰 Aggregates security threats from multiple sources
 */

const GITHUB_API = "https://api.github.com"
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

/**
 * Get date range for data fetch (last 7 days)
 */
function getDateRange() {
  const now = new Date()
  const endTime = now
  const startTime = new Date(now)
  startTime.setDate(startTime.getDate() - 7)
  return {
    startTime: startTime.toISOString().split('T')[0],
    endTime: endTime.toISOString().split('T')[0]
  }
}

/**
 * Fetch GitHub Security Advisories
 */
async function fetchGitHubSecurity() {
  console.log('🔍 Fetching GitHub Security Advisories...')
  
  const threats = []
  
  try {
    // GitHub Security Advisories API
    const response = await fetch(
      `${GITHUB_API}/advisories?state=published&sort=published&direction=desc&per_page=50`,
      {
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `token ${GITHUB_TOKEN || ''}`,
          'User-Agent': 'ThreatPulse-AI'
        }
      }
    )
    
    if (response.ok) {
      const advisories = await response.json()
      
      for (const advisory of advisories.slice(0, 20)) {
        threats.push({
          id: `gh-${advisory.ghsa_id}`,
          source: 'GitHub Security',
          timestamp: advisory.published_at,
          title: advisory.summary,
          description: advisory.description?.substring(0, 500) || 'No description',
          severity: advisory.severity || 'medium',
          cve_id: advisory.cve_id,
          ghsa_id: advisory.ghsa_id,
          affected_packages: advisory.vulnerabilities?.map(v => v.package?.name).filter(Boolean) || [],
          cwes: advisory.cwes?.map(c => c.cweId) || [],
          references: advisory.references?.map(r => r.url) || [],
          ai_analysis: null, // Will be filled by AI analyzer
          risk_score: null   // Will be calculated
        })
      }
      
      console.log(`✅ Found ${threats.length} GitHub security advisories`)
    } else {
      console.warn(`⚠️ GitHub API returned ${response.status}`)
    }
  } catch (error) {
    console.error('❌ GitHub fetch error:', error.message)
  }
  
  return threats
}

/**
 * Fetch CVE database (via NVD API or fallback)
 */
async function fetchCVE() {
  console.log('🔍 Fetching recent CVEs...')
  
  const threats = []
  const { startTime, endTime } = getDateRange()
  
  try {
    // NVD API (no key required for basic access)
    const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?pubStartDate=${startTime}T00:00:00&pubEndDate=${endTime}T23:59:59&resultsPerPage=50`
    
    const response = await fetch(url)
    
    if (response.ok) {
      const data = await response.json()
      const cves = data.vulnerabilities || []
      
      for (const item of cves.slice(0, 15)) {
        const cve = item.cve
        const metrics = cve.metrics?.cvssMetricV31?.[0] || cve.metrics?.cvssMetricV30?.[0]
        
        threats.push({
          id: `cve-${cve.id}`,
          source: 'NVD CVE',
          timestamp: cve.published,
          title: `${cve.id} - ${cve.descriptions?.[0]?.value?.substring(0, 100) || 'Unknown'}`,
          description: cve.descriptions?.[0]?.value || 'No description',
          severity: metrics?.cvssData?.baseSeverity?.toLowerCase() || 'medium',
          cve_id: cve.id,
          cvss_score: metrics?.cvssData?.baseScore || null,
          affected_products: cve.configurations?.flatMap(c => 
            c.nodes?.flatMap(n => n.cpeMatch?.map(m => m.criteria))
          ).filter(Boolean) || [],
          references: cve.references?.map(r => r.url) || [],
          ai_analysis: null,
          risk_score: null
        })
      }
      
      console.log(`✅ Found ${threats.length} recent CVEs`)
    }
  } catch (error) {
    console.error('❌ CVE fetch error:', error.message)
  }
  
  return threats
}

/**
 * Fetch from social/security feeds (simulated for demo)
 */
async function fetchSocialFeeds() {
  console.log('🔍 Fetching security social feeds...')
  
  // Simulated security tweets and posts
  const threats = [
    {
      id: `twitter-${Date.now()}-1`,
      source: 'Twitter Security',
      timestamp: new Date().toISOString(),
      title: 'New ransomware campaign targeting cloud infrastructure',
      description: 'Security researchers have identified a new ransomware variant specifically designed to target cloud-based infrastructure. The campaign uses compromised CI/CD pipelines to deploy malicious code.',
      severity: 'high',
      references: ['https://twitter.com/security/status/123'],
      ai_analysis: null,
      risk_score: null
    },
    {
      id: `hn-${Date.now()}-1`,
      source: 'HackerNews',
      timestamp: new Date().toISOString(),
      title: 'Show HN: Open-source vulnerability scanner',
      description: 'New tool automatically scans dependencies for known vulnerabilities and suggests patches. Gaining traction in the security community.',
      severity: 'low',
      references: ['https://news.ycombinator.com/item?id=123'],
      ai_analysis: null,
      risk_score: null
    }
  ]
  
  console.log(`✅ Found ${threats.length} social feed items`)
  return threats
}

/**
 * Merge and deduplicate threats
 */
function mergeThreats(allThreats) {
  const seen = new Set()
  const merged = []
  
  for (const threat of allThreats.flat()) {
    const key = threat.cve_id || threat.ghsa_id || threat.id
    if (!seen.has(key)) {
      seen.add(key)
      merged.push(threat)
    }
  }
  
  // Sort by timestamp (newest first)
  return merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

/**
 * Save threats to JSON file
 */
async function saveThreats(threats) {
  await mkdir('data', { recursive: true })
  await writeFile('data/threats.json', JSON.stringify(threats, null, 2), 'utf-8')
  console.log(`💾 Saved ${threats.length} threats to data/threats.json`)
}

/**
 * Main execution
 */
async function main() {
  console.log('🛡️ ThreatPulse AI - Starting data fetch...\n')
  
  const [github, cve, social] = await Promise.all([
    fetchGitHubSecurity(),
    fetchCVE(),
    fetchSocialFeeds()
  ])
  
  const allThreats = mergeThreats([github, cve, social])
  await saveThreats(allThreats)
  
  console.log('\n✅ Data fetch completed!')
  console.log(`📊 Total unique threats: ${allThreats.length}`)
  console.log('🌰🌰🌰 Chestnut power engaged! 🌰🌰🌰')
}

main().catch(console.error)
