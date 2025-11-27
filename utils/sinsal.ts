import type { SajuInfo } from '../types';

export type SinsalResult = Record<string, string[]>;

const pillarLabels: (keyof SajuInfo['pillars'])[] = ['year', 'month', 'day', 'hour'];
const pillarKoreanLabels: Record<keyof SajuInfo['pillars'], string> = {
    year: '년주',
    month: '월주',
    day: '일주',
    hour: '시주'
};
const jijiKoreanLabels: Record<keyof SajuInfo['pillars'], string> = {
    year: '년지',
    month: '월지',
    day: '일지',
    hour: '시지'
};

// 천을귀인 맵은 외부에서도 사용하므로 export 유지
export const cheonEulGwiInMap: { [key: string]: string[] } = {
    '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
    '乙': ['子', '申'], '己': ['子', '申'],
    '丙': ['亥', '酉'], '丁': ['亥', '酉'],
    '壬': ['卯', '巳'], '癸': ['卯', '巳'],
    '辛': ['寅', '午'],
};

export function analyzeSinsal(sajuInfo: SajuInfo): SinsalResult {
    const result: SinsalResult = {};
    const { pillars } = sajuInfo;
    const ilgan = pillars.day.cheonGan.char;
    const ilji = pillars.day.jiJi.char;

    const allJijis = pillarLabels.map(p => pillars[p].jiJi.char);
    
    const addSinsal = (name: string, value: string) => {
        if (!result[name]) {
            result[name] = [];
        }
        // Avoid duplicate entries
        if (!result[name].includes(value)) {
            result[name].push(value);
        }
    };

    // --- 귀인 (Gwi-in) Series ---

    // 1. 천을귀인 (Cheoneulgwiin)
    const cheonEulGwis = cheonEulGwiInMap[ilgan] || [];
    pillarLabels.forEach(label => {
        if (cheonEulGwis.includes(pillars[label].jiJi.char)) {
            addSinsal('천을귀인', `${jijiKoreanLabels[label]}(${pillars[label].jiJi.char})`);
        }
    });

    // 2. 학당귀인 (Hakdanggwiin)
    const hakdangMap: { [key: string]: string } = { '甲': '亥', '乙': '午', '丙': '寅', '丁': '酉', '戊': '寅', '己': '酉', '庚': '巳', '辛': '子', '壬': '申', '癸': '卯' };
    const hakdangGwi = hakdangMap[ilgan];
    pillarLabels.forEach(label => {
        if (pillars[label].jiJi.char === hakdangGwi) {
            addSinsal('학당귀인', `${jijiKoreanLabels[label]}(${pillars[label].jiJi.char})`);
        }
    });

    // 3. 문곡귀인 (Mungokgwiin)
    const mungokMap: { [key: string]: string } = { '甲': '亥', '乙': '子', '丙': '寅', '丁': '卯', '戊': '巳', '己': '午', '庚': '申', '辛': '酉', '壬': '亥', '癸': '子' };
    const mungokGwi = mungokMap[ilgan];
    pillarLabels.forEach(label => {
        if (pillars[label].jiJi.char === mungokGwi) {
            addSinsal('문곡귀인', `${jijiKoreanLabels[label]}(${pillars[label].jiJi.char})`);
        }
    });

    // 4. 태극귀인 (Taegeukgwiin)
    const taegeukMap: { [key: string]: string[] } = {
        '甲': ['子'], '乙': ['午'], '丙': ['卯'], '丁': ['酉'],
        '戊': ['辰', '戌', '丑', '未'], '己': ['辰', '戌', '丑', '未'],
        '庚': ['亥'], '辛': ['寅'], '壬': ['申'], '癸': ['巳'],
    };
    const taegeukGwis = taegeukMap[ilgan] || [];
    pillarLabels.forEach(label => {
        if (taegeukGwis.includes(pillars[label].jiJi.char)) {
            addSinsal('태극귀인', `${jijiKoreanLabels[label]}(${pillars[label].jiJi.char})`);
        }
    });
    
    // 5. 문창귀인 (Munchanggwiin) - NEW
    const munchangMap: { [key: string]: string } = {
        '甲': '巳', '乙': '午', '丙': '申', '丁': '酉', '戊': '申', '己': '酉',
        '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯',
    };
    const munchangGwi = munchangMap[ilgan];
    pillarLabels.forEach(label => {
        if (pillars[label].jiJi.char === munchangGwi) {
            addSinsal('문창귀인', `${jijiKoreanLabels[label]}(${pillars[label].jiJi.char})`);
        }
    });

    // --- 록 (Rok) Series ---

    // 6. 암록 (Amrok)
    const amrokMap: { [key: string]: string } = {
        '甲': '亥', '乙': '戌', '丙': '申', '丁': '未', '戊': '申', '己': '未',
        '庚': '巳', '辛': '辰', '壬': '寅', '癸': '丑',
    };
    const amrokJi = amrokMap[ilgan];
    pillarLabels.forEach(label => {
        if (pillars[label].jiJi.char === amrokJi) {
            addSinsal('암록', `${jijiKoreanLabels[label]}(${amrokJi})`);
        }
    });

    // 7. 금여록 (Geumyeorok) - NEW
    const geumyeoMap: { [key: string]: string } = {
        '甲': '辰', '乙': '巳', '丙': '戌', '丁': '亥', '戊': '未', '己': '申',
        '庚': '丑', '辛': '寅', '壬': '辰', '癸': '巳',
    };
    const geumyeoJi = geumyeoMap[ilgan];
    pillarLabels.forEach(label => {
        if (pillars[label].jiJi.char === geumyeoJi) {
            addSinsal('금여록', `${jijiKoreanLabels[label]}(${geumyeoJi})`);
        }
    });

    // 8. 건록 (Geonrok) - Renamed from Geumnok
    const geonrokMap: { [key: string]: string } = {
        '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午', '戊': '巳', '己': '午',
        '庚': '申', '辛': '酉', '壬': '亥', '癸': '子',
    };
    const geonrokJi = geonrokMap[ilgan];
     pillarLabels.forEach(label => {
        if (pillars[label].jiJi.char === geonrokJi) {
            addSinsal('건록', `${jijiKoreanLabels[label]}(${geonrokJi})`);
        }
    });
    
    // 9. 협록 (Hyeoplok)
    const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    if (geonrokJi) {
        const geonrokIndex = earthlyBranches.indexOf(geonrokJi);
        const prevJi = earthlyBranches[(geonrokIndex - 1 + 12) % 12];
        const nextJi = earthlyBranches[(geonrokIndex + 1) % 12];
        const uniqueJijis = [...new Set(allJijis)];
        if (uniqueJijis.includes(prevJi) && uniqueJijis.includes(nextJi)) {
            addSinsal('협록', `${prevJi}·${nextJi} 협(夾)`);
        }
    }

    // --- 살 (Sal) Series ---

    // 10. 도화살 (Dohwasal)
    const dohwaMap: { [key: string]: string } = {
        '亥': '子', '卯': '子', '未': '子',
        '寅': '卯', '午': '卯', '戌': '卯',
        '巳': '午', '酉': '午', '丑': '午',
        '申': '酉', '子': '酉', '辰': '酉',
    };
    const dohwaJi = dohwaMap[ilji];
    if (dohwaJi) {
         pillarLabels.forEach(label => {
            if (pillars[label].jiJi.char === dohwaJi) {
                addSinsal('도화살', `${jijiKoreanLabels[label]}(${dohwaJi})`);
            }
        });
    }

    // 11. 홍염살 (Hongyeomsal)
    const hongyeomMap: { [key: string]: string } = {
        '甲': '午', '乙': '午', '丙': '寅', '丁': '未',
        '戊': '辰', '己': '辰', '庚': '戌', '辛': '酉', '壬': '子', '癸': '申',
    };
    const hongyeomJi = hongyeomMap[ilgan];
    pillarLabels.forEach(label => {
        if (pillars[label].jiJi.char === hongyeomJi) {
            addSinsal('홍염살', `${jijiKoreanLabels[label]}(${hongyeomJi})`);
        }
    });
    
    // 12. 괴강살 (Goegangsal)
    const goegangGanjis = ['庚辰', '庚戌', '壬辰', '壬戌', '戊辰', '戊戌'];
    pillarLabels.forEach(label => {
        if (goegangGanjis.includes(pillars[label].ganji)) {
            addSinsal('괴강살', `${pillarKoreanLabels[label]}(${pillars[label].ganji})`);
        }
    });
    
    // 13. 양인살 (Yanginsal)
    const yanginMapFinal: { [key: string]: string } = {
        '甲': '卯', '丙': '午', '戊': '午', '庚': '酉', '壬': '子',
    };
    const yanginJi = yanginMapFinal[ilgan];
    if (yanginJi) {
        pillarLabels.forEach(label => {
            if (pillars[label].jiJi.char === yanginJi) {
                addSinsal('양인살', `${jijiKoreanLabels[label]}(${yanginJi})`);
            }
        });
    }
    
    // 14. 현침살 (Hyeonchimsal)
    const hyeonchimChars = ['甲', '申', '卯', '午', '未', '辛'];
    pillarLabels.forEach(label => {
        const gan = pillars[label].cheonGan.char;
        const ji = pillars[label].jiJi.char;
        if (hyeonchimChars.includes(gan)) {
            addSinsal('현침살', `${pillarKoreanLabels[label]} 천간(${gan})`);
        }
        if (hyeonchimChars.includes(ji)) {
             addSinsal('현침살', `${jijiKoreanLabels[label]}(${ji})`);
        }
    });

    // 15. 역마살 (Yeokmasal)
    const yeokmaMap: { [key: string]: string } = {
        '寅': '申', '午': '申', '戌': '申',
        '巳': '亥', '酉': '亥', '丑': '亥',
        '申': '寅', '子': '寅', '辰': '寅',
        '亥': '巳', '卯': '巳', '未': '巳',
    };
    const nyeonji = pillars.year.jiJi.char;

    const yeokmaForNyeonji = yeokmaMap[nyeonji];
    const yeokmaForIlji = yeokmaMap[ilji];
    
    const targetYeokmaChars = [...new Set([yeokmaForNyeonji, yeokmaForIlji])].filter((c): c is string => !!c);

    targetYeokmaChars.forEach(yeokmaChar => {
        pillarLabels.forEach(label => {
            if (pillars[label].jiJi.char === yeokmaChar) {
                addSinsal('역마살', `${jijiKoreanLabels[label]}(${yeokmaChar})`);
            }
        });
    });

    return result;
}