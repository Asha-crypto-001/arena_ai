import { db } from './db.js';
import { Educator, LearnerRequest, Match } from './types.js';

export interface MatchEvaluation {
  educator: ReturnType<typeof db.findEducatorById>;
  match_score: number;
  match_reasons: string[];
  breakdown: {
    skillMatch: number; // Max 35
    formatMatch: number; // Max 20
    locationMatch: number; // Max 15
    budgetMatch: number; // Max 15
    experienceMatch: number; // Max 15
  };
}

export function computeMatchesForRequest(request: LearnerRequest): MatchEvaluation[] {
  const educators = db.getEducators().filter(e => e.status === 'active' || e.status === 'approved');
  const results: MatchEvaluation[] = [];

  const reqSkillLower = (request.skill_name || '').toLowerCase();
  const reqLocLower = (request.location || '').toLowerCase();

  for (const edu of educators) {
    const fullEdu = db.findEducatorById(edu.id);
    if (!fullEdu) continue;

    let skillScore = 0;
    let formatScore = 0;
    let locationScore = 0;
    let budgetScore = 0;
    let experienceScore = 0;
    const reasons: string[] = [];

    // 1. Skill Match (Max 35 pts)
    const eduTitleLower = fullEdu.title.toLowerCase();
    const eduSkills = fullEdu.skills || [];
    
    const exactSkill = eduSkills.some(s => s.skill_name.toLowerCase().includes(reqSkillLower) || reqSkillLower.includes(s.skill_name.toLowerCase()));
    const titleMatch = eduTitleLower.includes(reqSkillLower) || reqSkillLower.split(' ').some(w => w.length > 3 && eduTitleLower.includes(w));

    if (exactSkill) {
      skillScore = 35;
      reasons.push(`Direct skill specialization in ${request.skill_name}`);
    } else if (titleMatch) {
      skillScore = 28;
      reasons.push(`Strong profile alignment with ${request.skill_name}`);
    } else {
      // Check category overlap
      skillScore = 10;
    }

    // 2. Format Compatibility (Max 20 pts)
    const requestedFormat = request.format_preference;
    const educatorFormats = fullEdu.teaching_formats || [];

    if (requestedFormat === 'hybrid' && educatorFormats.includes('hybrid')) {
      formatScore = 20;
      reasons.push('Supports preferred hybrid learning (theory + workshop)');
    } else if (educatorFormats.includes(requestedFormat)) {
      formatScore = 20;
      reasons.push(`Offers requested ${requestedFormat} teaching format`);
    } else if (requestedFormat === 'online' && educatorFormats.includes('hybrid')) {
      formatScore = 15;
      reasons.push('Offers hybrid setup with remote online capabilities');
    } else if (requestedFormat === 'in-person' && educatorFormats.includes('hybrid')) {
      formatScore = 18;
      reasons.push('Offers in-person sessions at equipped workshop');
    } else {
      formatScore = 5;
    }

    // 3. Location Proximity (Max 15 pts)
    const eduLocLower = (fullEdu.location + ' ' + fullEdu.service_area).toLowerCase();
    if (requestedFormat === 'online') {
      locationScore = 15;
      reasons.push('Location agnostic for online learning sessions');
    } else {
      // Common Ugandan hubs & proximity checks
      const commonAreas = ['kampala', 'makindye', 'nakawa', 'rubaga', 'kawempe', 'kiyembe', 'ntinda', 'bugolobi', 'kololo', 'entebbe', 'gayaza', 'wakiso', 'jinja'];
      const sharedArea = commonAreas.find(area => reqLocLower.includes(area) && eduLocLower.includes(area));

      if (sharedArea) {
        locationScore = 15;
        reasons.push(`Located close in ${sharedArea.toUpperCase()} service perimeter`);
      } else if (eduLocLower.includes('kampala') && reqLocLower.includes('kampala')) {
        locationScore = 12;
        reasons.push('Both within Greater Kampala metropolitan area');
      } else {
        locationScore = 6;
      }
    }

    // 4. Budget Compatibility (Max 15 pts)
    const educatorHourly = fullEdu.hourly_rate_ugx || 35000;
    const requestBudget = request.budget_ugx || 200000;
    
    // Estimate if standard 6-8 hr course or single session fits
    const estimatedCost = educatorHourly * 6;
    if (educatorHourly * 4 <= requestBudget) {
      budgetScore = 15;
      reasons.push(`Budget compatible (UGX ${educatorHourly.toLocaleString()}/hr within UGX ${requestBudget.toLocaleString()} allocation)`);
    } else if (educatorHourly * 2 <= requestBudget) {
      budgetScore = 11;
      reasons.push(`Hourly rate (UGX ${educatorHourly.toLocaleString()}/hr) matches single-module budget`);
    } else {
      budgetScore = 6;
    }

    // 5. Experience & Verification (Max 15 pts)
    if (fullEdu.years_experience >= 10 && fullEdu.rating >= 4.8) {
      experienceScore = 15;
      reasons.push(`Senior master practitioner (${fullEdu.years_experience}+ yrs exp, ${fullEdu.rating}★ rating)`);
    } else if (fullEdu.years_experience >= 5) {
      experienceScore = 12;
      reasons.push(`Experienced educator (${fullEdu.years_experience} yrs exp)`);
    } else {
      experienceScore = 8;
    }

    const totalScore = Math.min(100, Math.max(30, skillScore + formatScore + locationScore + budgetScore + experienceScore));

    results.push({
      educator: fullEdu,
      match_score: totalScore,
      match_reasons: reasons,
      breakdown: {
        skillMatch: skillScore,
        formatMatch: formatScore,
        locationMatch: locationScore,
        budgetMatch: budgetScore,
        experienceMatch: experienceScore
      }
    });
  }

  // Sort descending by score
  return results.sort((a, b) => b.match_score - a.match_score);
}
