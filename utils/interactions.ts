import type { Pillar } from '../types';

export interface Interactions {
  hyeong: string[];
  chung: string[];
  hab: string[];
  hoe: string[];
}

export function analyzeInteractions(pillars: {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
}): Interactions {
    const branches = [
        pillars.year.jiJi.char,
        pillars.month.jiJi.char,
        pillars.day.jiJi.char,
        pillars.hour.jiJi.char,
    ];
    
    const uniqueBranches = [...new Set(branches)];
    
    const result: Interactions = {
        hyeong: [],
        chung: [],
        hab: [],
        hoe: [],
    };

    // 1. 충 (Chung - Clashes)
    const chungMap: { [key: string]: string } = {
        '子': '午', '午': '子', '丑': '未', '未': '丑',
        '寅': '申', '申': '寅', '卯': '酉', '酉': '卯',
        '辰': '戌', '戌': '辰', '巳': '亥', '亥': '巳',
    };
    const foundChung = new Set<string>();
    for (const b1 of uniqueBranches) {
        for (const b2 of uniqueBranches) {
            if (b1 >= b2) continue;
            if (chungMap[b1] === b2) {
                const pair = [b1, b2].sort().join('-');
                if (!foundChung.has(pair)) {
                    result.chung.push(`${b1}·${b2} 충`);
                    foundChung.add(pair);
                }
            }
        }
    }

    // 2. 형 (Hyeong - Punishments)
    if (uniqueBranches.includes('寅') && uniqueBranches.includes('巳') && uniqueBranches.includes('申')) {
        result.hyeong.push('寅·巳·申 삼형');
    }
    if (uniqueBranches.includes('丑') && uniqueBranches.includes('戌') && uniqueBranches.includes('未')) {
        result.hyeong.push('丑·戌·未 삼형');
    }
    if (uniqueBranches.includes('子') && uniqueBranches.includes('卯')) {
        result.hyeong.push('子·卯 상형');
    }
    const selfHyeong = ['辰', '午', '酉', '亥'];
    for (const sh of selfHyeong) {
        if (branches.filter(b => b === sh).length >= 2) {
            result.hyeong.push(`${sh}·${sh} 자형`);
        }
    }

    // 3. 회 (Hoe - Directional Combinations)
    const hoeGroups = {
        '寅·卯·辰 방합 (木)': ['寅', '卯', '辰'],
        '巳·午·未 방합 (火)': ['巳', '午', '未'],
        '申·酉·戌 방합 (金)': ['申', '酉', '戌'],
        '亥·子·丑 방합 (水)': ['亥', '子', '丑'],
    };
    for (const [name, group] of Object.entries(hoeGroups)) {
        if (group.every(b => uniqueBranches.includes(b))) {
            result.hoe.push(name);
        }
    }

    // 4. 합 (Hab - Trine and Paired Combinations)
    // 4-1. 삼합 (Samhab - Trine Combinations)
    const samhabGroups = {
        '亥·卯·未 삼합 (木)': ['亥', '卯', '未'], '寅·午·戌 삼합 (火)': ['寅', '午', '戌'],
        '巳·酉·丑 삼합 (金)': ['巳', '酉', '丑'], '申·子·辰 삼합 (水)': ['申', '子', '辰'],
    };
    const foundSamhabs: string[] = [];
    for (const [name, group] of Object.entries(samhabGroups)) {
        if (group.every(b => uniqueBranches.includes(b))) {
            result.hab.push(name);
            foundSamhabs.push(...group);
        }
    }

    // 4-2. 반합 (Banhab - Half-Combinations)
    const banhabGroups = {
        '木': { center: '卯', others: ['亥', '未'] }, '火': { center: '午', others: ['寅', '戌'] },
        '金': { center: '酉', others: ['巳', '丑'] }, '水': { center: '子', others: ['申', '辰'] },
    };
    for (const [element, group] of Object.entries(banhabGroups)) {
        if (uniqueBranches.includes(group.center)) {
            for (const other of group.others) {
                if (uniqueBranches.includes(other)) {
                    if (!foundSamhabs.includes(group.center) && !foundSamhabs.includes(other)) {
                        const pair = [group.center, other].sort();
                        result.hab.push(`${pair[0]}·${pair[1]} 반합 (${element})`);
                    }
                }
            }
        }
    }

    // 4-3. 육합 (Yukhab - Six Harmonies)
    const yukhabMap: { [key: string]: string } = {
        '子': '丑', '丑': '子', '寅': '亥', '亥': '寅',
        '卯': '戌', '戌': '卯', '辰': '酉', '酉': '辰',
        '巳': '申', '申': '巳', '午': '未', '未': '午',
    };
    const foundYukhab = new Set<string>();
    for (const b1 of uniqueBranches) {
        for (const b2 of uniqueBranches) {
            if (b1 >= b2) continue;
            if (yukhabMap[b1] === b2) {
                 const pair = [b1, b2].sort().join('-');
                 if (!foundYukhab.has(pair)) {
                    result.hab.push(`${b1}·${b2} 육합`);
                    foundYukhab.add(pair);
                 }
            }
        }
    }

    return result;
}