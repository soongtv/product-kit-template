import { readFile, writeFile } from "fs/promises"

/**
 * ThreatPulse AI - AI Analysis with GitHub Models
 * 🤖 Analyzes threats and generates risk scores
 * 🌰 Powered by chestnut wisdom
 */

const GITHUB_MODELS_API = "https://models.inference.ai.azure.com"
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

/**
 * Analyze a single threat using AI
 */
async function analyzeThreatWithAI(threat) {
  const prompt = `
You are a cybersecurity threat analyst. Analyze this security threat and provide:

1. **Risk Score** (0-100): Overall risk level
2. **Impact Assessment**: Brief description of potential impact
3. **Affected Industries**: List of likely affected sectors
4. **Recommended Actions**: 2-3 actionable steps
5. **Urgency**: low/medium/high/critical

Threat Details:
- Title: ${threat.title}
- Description: ${threat.description?.substring(0, 500)}
- Source: ${threat.source}
- Severity: ${threat.severity || 'unknown'}
- CVE: ${threat.cve_id || 'N/A'}

Respond in JSON format:
{
  "risk_score": number,
  "impact_assessment": "string",
  "affected_industries": ["string"],
  "recommended_actions": ["string"],
  "urgency": "low|medium|high|critical"
}
`.trim()

  try {
    const response = await fetch(`${GITHUB_MODELS_API}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a cybersecurity expert. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    })

    if (response.ok) {
      const data = await response.json()
      const content = data.choices?.[0]?.message?.content
      
      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    }
  } catch (error) {
    console.error(`AI analysis failed for ${threat.id}:`, error.message)
  }

  // Fallback analysis if AI fails
  return generateFallbackAnalysis(threat)
}

/**
 * Generate fallback analysis without AI
 */
function generateFallbackAnalysis(threat) {
  const severityScores = {
    critical: 90,
    high: 75,
    medium: 50,
    low: 25
  }

  const baseScore = severityScores[threat.severity] || 50
  
  // Adjust based on source
  const sourceBonus = threat.source === 'NVD CVE' ? 10 : 0
  
  const risk_score = Math.min(100, baseScore + sourceBonus)
  
  const urgencyMap = {
    critical: 'critical',
    high: 'high',
    medium: 'medium',
    low: 'low'
  }

  return {
    risk_score,
    impact_assessment: `Potential security vulnerability with ${threat.severity || 'medium'} severity. ${threat.cve_id ? `CVE: ${threat.cve_id}.` : ''}`,
    affected_industries: ['Technology', 'General'],
    recommended_actions: [
      'Review affected systems',
      'Apply security patches if available',
      'Monitor for suspicious activity'
    ],
    urgency: urgencyMap[threat.severity] || 'medium'
  }
}

/**
 * Batch analyze threats with rate limiting
 */
async function batchAnalyze(threats, batchSize = 5) {
  const analyzed = []
  
  for (let i = 0; i < threats.length; i += batchSize) {
    const batch = threats.slice(i, i + batchSize)
    console.log(`🤖 Analyzing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(threats.length / batchSize)}...`)
    
    const results = await Promise.all(
      batch.map(async (threat) => {
        const analysis = await analyzeThreatWithAI(threat)
        return {
          ...threat,
          ai_analysis: analysis,
          risk_score: analysis.risk_score
        }
      })
    )
    
    analyzed.push(...results)
    
    // Rate limiting delay
    if (i + batchSize < threats.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  return analyzed
}

/**
 * Generate summary statistics
 */
function generateStats(threats) {
  const severityCount = {}
  const sourceCount = {}
  const urgencyCount = {}
  
  let totalRisk = 0
  
  for (const threat of threats) {
    // Severity
    const sev = threat.severity || 'unknown'
    severityCount[sev] = (severityCount[sev] || 0) + 1
    
    // Source
    const src = threat.source
    sourceCount[src] = (sourceCount[src] || 0) + 1
    
    // Urgency
    const urg = threat.ai_analysis?.urgency || 'unknown'
    urgencyCount[urg] = (urgencyCount[urg] || 0) + 1
    
    // Risk score
    totalRisk += threat.risk_score || 0
  }
  
  return {
    total_threats: threats.length,
    average_risk_score: Math.round(totalRisk / threats.length) || 0,
    by_severity: severityCount,
    by_source: sourceCount,
    by_urgency: urgencyCount,
    last_updated: new Date().toISOString()
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🤖 ThreatPulse AI - Starting AI analysis...\n')
  
  // Load threats
  const threatsData = await readFile('data/threats.json', 'utf-8')
  const threats = JSON.parse(threatsData)
  
  console.log(`📊 Loaded ${threats.length} threats for analysis`)
  
  // Analyze
  const analyzed = await batchAnalyze(threats)
  
  // Generate stats
  const stats = generateStats(analyzed)
  
  // Save analyzed data
  await writeFile('data/threats-analyzed.json', JSON.stringify(analyzed, null, 2), 'utf-8')
  await writeFile('data/stats.json', JSON.stringify(stats, null, 2), 'utf-8')
  
  console.log('\n✅ AI analysis completed!')
  console.log(`📈 Average risk score: ${stats.average_risk_score}`)
  console.log(`⚠️  Critical/High threats: ${(stats.by_urgency.critical || 0) + (stats.by_urgency.high || 0)}`)
  console.log('🌰🌰🌰 AI powered by chestnut wisdom! 🌰🌰🌰')
}

main().catch(console.error)
