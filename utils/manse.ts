import { solarTermsData } from './solarTerms';
import type { Gender, Daewoon, SajuInfo, Ohaeng, YinYang, Pillar, Gan, Ji, Sibsin, DaewoonPillar, SewoonPillar } from '../types';

const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// KST is based on 135°E longitude. The offset is (135 - local longitude) * 4 minutes.
export const birthLocations = [
    { name: '서울 부근', offsetMinutes: 32 },
    { name: '부산 부근', offsetMinutes: 24 },
    { name: '대구 부근', offsetMinutes: 26 },
    { name: '인천 부근', offsetMinutes: 33 },
    { name: '대전 부근', offsetMinutes: 30 },
    { name: '광주 부근', offsetMinutes: 32 },
    { name: '전주 부근', offsetMinutes: 32 },
    { name: '춘천 부근', offsetMinutes: 29 },
    { name: '제주 부근', offsetMinutes: 34 },
    { name: '목포 부근', offsetMinutes: 34 },
    { name: '강릉 부근', offsetMinutes: 24 },
    { name: '포항 부근', offsetMinutes: 22 },
    { name: '경주 부근', offsetMinutes: 23 },
    { name: '중국 연길', offsetMinutes: 22 },
];

const unseongCycleNames = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양'];
const unseongCycleHanja = ['長生', '沐浴', '冠帶', '建祿', '帝旺', '衰', '病', '死', '墓', '絶', '胎', '養'];

const ganjiCycle: string[] = [];
for (let i = 0; i < 60; i++) {
    ganjiCycle.push(heavenlyStems[i % 10] + earthlyBranches[i % 12]);
}

export const earthlyBranchGanInfo: { [key: string]: { ohaeng: Ohaeng; yinYang: YinYang } } = {
    // Cheongan
    '甲': { ohaeng: 'wood', yinYang: 'yang' }, '乙': { ohaeng: 'wood', yinYang: 'yin' },
    '丙': { ohaeng: 'fire', yinYang: 'yang' }, '丁': { ohaeng: 'fire', yinYang: 'yin' },
    '戊': { ohaeng: 'earth', yinYang: 'yang' }, '己': { ohaeng: 'earth', yinYang: 'yin' },
    '庚': { ohaeng: 'metal', yinYang: 'yang' }, '辛': { ohaeng: 'metal', yinYang: 'yin' },
    '壬': { ohaeng: 'water', yinYang: 'yang' }, '癸': { ohaeng: 'water', yinYang: 'yin' },
    // Jiji
    '子': { ohaeng: 'water', yinYang: 'yin' },
    '丑': { ohaeng: 'earth', yinYang: 'yin' },
    '寅': { ohaeng: 'wood', yinYang: 'yang' },
    '卯': { ohaeng: 'wood', yinYang: 'yin' },
    '辰': { ohaeng: 'earth', yinYang: 'yang' },
    '巳': { ohaeng: 'fire', yinYang: 'yang' },
    '午': { ohaeng: 'fire', yinYang: 'yin' },
    '未': { ohaeng: 'earth', yinYang: 'yin' },
    '申': { ohaeng: 'metal', yinYang: 'yang' },
    '酉': { ohaeng: 'metal', yinYang: 'yin' },
    '戌': { ohaeng: 'earth', yinYang: 'yang' },
    '亥': { ohaeng: 'water', yinYang: 'yang' },
};

const jijangganData: { [key: string]: string[] } = {
    '子': ['壬', '癸'], '丑': ['癸', '辛', '己'], '寅': ['戊', '丙', '甲'],
    '卯': ['甲', '乙'], '辰': ['乙', '癸', '戊'], '巳': ['戊', '庚', '丙'],
    '午': ['丙', '己', '丁'], '未': ['丁', '乙', '己'], '申': ['戊', '壬', '庚'],
    '酉': ['庚', '辛'], '戌': ['辛', '丁', '戊'], '亥': ['戊', '甲', '壬'],
};

const sibsinMap: { name: string, hanja: string }[] = [
    { name: '비견', hanja: '比肩' }, { name: '겁재', hanja: '劫財' },
    { name: '식신', hanja: '食神' }, { name: '상관', hanja: '傷官' },
    { name: '편재', hanja: '偏財' }, { name: '정재', hanja: '正財' },
    { name: '편관', hanja: '偏官' }, { name: '정관', hanja: '正官' },
    { name: '편인', hanja: '偏印' }, { name: '정인', hanja: '正印' },
];

const ohaengRelation: { [key in Ohaeng]: { [key in Ohaeng]: number } } = {
    wood: { wood: 0, fire: 2, earth: 4, metal: 6, water: 8 },
    fire: { fire: 0, earth: 2, metal: 4, water: 6, wood: 8 },
    earth: { earth: 0, metal: 2, water: 4, wood: 6, fire: 8 },
    metal: { metal: 0, water: 2, wood: 4, fire: 6, earth: 8 },
    water: { water: 0, wood: 2, fire: 4, earth: 6, metal: 8 },
};

const getSibsin = (ilgan: string, targetGan: string): Sibsin => {
    const ilganInfo = earthlyBranchGanInfo[ilgan];
    const targetInfo = earthlyBranchGanInfo[targetGan];
    if (!ilganInfo || !targetInfo) return { name: '-', hanja: '-' };

    const relationIndex = ohaengRelation[ilganInfo.ohaeng][targetInfo.ohaeng];
    const yinYangIndex = ilganInfo.yinYang === targetInfo.yinYang ? 0 : 1;

    return sibsinMap[relationIndex + yinYangIndex];
};

const yangUnseongStartIndex: { [key: string]: number } = { '甲': 11, '丙': 2, '戊': 2, '庚': 5, '壬': 8 };
const yinUnseongStartIndex: { [key: string]: number } = { '乙': 6, '丁': 9, '己': 9, '辛': 0, '癸': 3 };

const getUnseong = (ilgan: string, targetJiji: string) => {
    const ilganIsYang = earthlyBranchGanInfo[ilgan].yinYang === 'yang';
    const startIndex = ilganIsYang ? yangUnseongStartIndex[ilgan] : yinUnseongStartIndex[ilgan];
    if (startIndex === undefined) return { name: '-', hanja: '-' };

    const targetIndex = earthlyBranches.indexOf(targetJiji);

    let diff = targetIndex - startIndex;
    if (!ilganIsYang) diff = -diff;

    const unseongIndex = (diff + 12) % 12;

    return { name: unseongCycleNames[unseongIndex], hanja: unseongCycleHanja[unseongIndex] };
}

const getDaewoonPillars = (
    monthPillarGanji: string,
    daewoonDirection: Daewoon,
    daewoonNumber: number,
    ilGan: string
): DaewoonPillar[] => {
    const pillars: DaewoonPillar[] = [];
    const startIndex = ganjiCycle.indexOf(monthPillarGanji);
    if (startIndex === -1) return [];

    for (let i = 0; i < 10; i++) {
        let pillarIndex;
        if (daewoonDirection === 'sunhaeng') {
            pillarIndex = (startIndex + 1 + i + 60) % 60;
        } else {
            pillarIndex = (startIndex - 1 - i + 120) % 60;
        }

        const ganji = ganjiCycle[pillarIndex];
        const gan = ganji[0];
        const ji = ganji[1];

        const cheonGan: Gan = {
            char: gan,
            ohaeng: earthlyBranchGanInfo[gan].ohaeng,
            sibsin: getSibsin(ilGan, gan),
        };

        const jiJi: Ji = {
            char: ji,
            ohaeng: earthlyBranchGanInfo[ji].ohaeng,
            sibsin: getSibsin(ilGan, ji),
            jijanggan: (jijangganData[ji] || []).map(jigan => ({
                char: jigan,
                ohaeng: earthlyBranchGanInfo[jigan].ohaeng,
                sibsin: getSibsin(ilGan, jigan),
            })),
            unseong: getUnseong(ilGan, ji),
        };

        pillars.push({
            age: daewoonNumber + (i * 10),
            ganji,
            cheonGan,
            jiJi,
        });
    }

    return pillars;
};

export const getSajuInfoFromCharacters = (
    characters: string[],
    gender: Gender,
    daewoon: Daewoon,
    daewoonNumber: number,
    birthDate: { year: number; month: number; day: number; hour: number; minute: number; },
    birthRegion: string,
): SajuInfo => {
    const [siGan, siJi, ilGan, ilJi, wolGan, wolJi, nyeonGan, nyeonJi] = characters;

    const createPillar = (label: string, gan: string, ji: string): Pillar => {
        const isIlju = label === '일주';
        const cheonGan: Gan = {
            char: gan,
            ohaeng: earthlyBranchGanInfo[gan].ohaeng,
            sibsin: isIlju ? { name: '일간', hanja: '日干' } : getSibsin(ilGan, gan),
        };

        const jiJi: Ji = {
            char: ji,
            ohaeng: earthlyBranchGanInfo[ji].ohaeng,
            sibsin: getSibsin(ilGan, ji),
            jijanggan: (jijangganData[ji] || []).map(jigan => ({
                char: jigan,
                ohaeng: earthlyBranchGanInfo[jigan].ohaeng,
                sibsin: getSibsin(ilGan, jigan),
            })),
            unseong: getUnseong(ilGan, ji),
        };

        return {
            label,
            ganji: `${gan}${ji}`,
            cheonGan,
            jiJi
        };
    };

    const wolJuGanji = `${wolGan}${wolJi}`;
    const daewoonPillars = getDaewoonPillars(wolJuGanji, daewoon, daewoonNumber, ilGan);

    return {
        pillars: {
            hour: createPillar('시주', siGan, siJi),
            day: createPillar('일주', ilGan, ilJi),
            month: createPillar('월주', wolGan, wolJi),
            year: createPillar('년주', nyeonGan, nyeonJi),
        },
        gender,
        daewoon,
        daewoonNumber,
        daewoonPillars,
        birthDate,
        birthRegion,
    };
};

const parseSolarTermDate = (year: number, termStr: string): Date => {
    const [monthDay, time] = termStr.split(' ');
    const [month, day] = monthDay.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    const isoStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+09:00`;
    return new Date(isoStr);
};

export const getSajuFromDate = (
    birthDate: Date,
    gender: Gender,
    timeOffsetMinutes: number,
    isYajasi: boolean
): { characters: string[]; daewoon: Daewoon; daewoonNumber: number } => {
    // Adjust birth date from KST to Local Mean Time based on longitude
    const adjustedBirthDate = new Date(birthDate.getTime() - timeOffsetMinutes * 60 * 1000);

    if (isNaN(adjustedBirthDate.getTime())) {
        throw new Error("유효하지 않은 날짜입니다. 입력값을 확인해주세요.");
    }

    const year = adjustedBirthDate.getFullYear();
    const originalHour = birthDate.getHours();
    const originalMinute = birthDate.getMinutes();

    const yearTerms = solarTermsData[year.toString()];
    if (!yearTerms) {
        throw new Error(`Solar term data not available for year ${year}. Please use years between 1940-2050.`);
    }

    // --- 1. 년주 (Year Pillar) 계산 ---
    // 사주 상의 연도는 입춘(Ipchun)을 기준으로 바뀜
    const ipchun = parseSolarTermDate(year, yearTerms[2]);
    const sajuYear = adjustedBirthDate < ipchun ? year - 1 : year;

    const yearGapjaIndex = (sajuYear - 4 + 60) % 60;
    const yearStemIndex = yearGapjaIndex % 10;
    const yearBranchIndex = yearGapjaIndex % 12;
    const yearStem = heavenlyStems[yearStemIndex];
    const yearBranch = earthlyBranches[yearBranchIndex];

    // --- 2. 월주 (Month Pillar) 계산 ---
    // 각 사주 월의 시작이 되는 절기(Jeolgi) 인덱스: 2(입춘), 4(경칩), ..., 0(소한)
    const jeolgiIndices = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 0];
    const sajuMonthBranches = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];

    let monthBranch = '';
    let monthBranchIndexInCycle = -1;
    let currentTermDate: Date | null = null;
    let nextTermDate: Date | null = null;

    const sajuYearTerms = solarTermsData[sajuYear.toString()];
    const nextSolarYearTerms = solarTermsData[(sajuYear + 1).toString()];

    if (!sajuYearTerms || !nextSolarYearTerms) {
        throw new Error(`Solar term data not available for Saju year ${sajuYear}. Please use years between 1940-2050.`);
    }

    // 사주 연도(입춘~다음입춘)에 해당하는 13개의 절기 시점을 리스트로 만듦
    const jeolgiDates: Date[] = [];
    for (let i = 0; i < jeolgiIndices.length; i++) {
        const termIndex = jeolgiIndices[i];
        // 소한(0)은 다음 해의 데이터를 사용
        const yearDataToUse = termIndex === 0 ? nextSolarYearTerms : sajuYearTerms;
        const yearToParse = termIndex === 0 ? sajuYear + 1 : sajuYear;
        jeolgiDates.push(parseSolarTermDate(yearToParse, yearDataToUse[termIndex]));
    }
    // 마지막 경계선으로 다음 해의 입춘을 추가
    jeolgiDates.push(parseSolarTermDate(sajuYear + 1, nextSolarYearTerms[2]));

    // 생일이 어느 절기 사이에 있는지 찾아 월지를 결정
    for (let i = 0; i < 12; i++) {
        if (adjustedBirthDate >= jeolgiDates[i] && adjustedBirthDate < jeolgiDates[i + 1]) {
            monthBranch = sajuMonthBranches[i];
            monthBranchIndexInCycle = i;
            currentTermDate = jeolgiDates[i];
            nextTermDate = jeolgiDates[i + 1];
            break;
        }
    }

    if (monthBranch === '') {
        throw new Error("월주를 계산할 수 없습니다. 날짜를 확인해주세요.");
    }

    // 월두법(月頭法)으로 월간 계산
    let monthStemStartForInWol: number;
    if (yearStemIndex === 0 || yearStemIndex === 5) monthStemStartForInWol = 2; // 갑기 -> 병
    else if (yearStemIndex === 1 || yearStemIndex === 6) monthStemStartForInWol = 4; // 을경 -> 무
    else if (yearStemIndex === 2 || yearStemIndex === 7) monthStemStartForInWol = 6; // 병신 -> 경
    else if (yearStemIndex === 3 || yearStemIndex === 8) monthStemStartForInWol = 8; // 정임 -> 임
    else monthStemStartForInWol = 0; // 무계 -> 갑

    const monthStemIndex = (monthStemStartForInWol + monthBranchIndexInCycle) % 10;
    const monthStem = heavenlyStems[monthStemIndex];

    // --- 3. 일주 (Day Pillar) 계산 ---
    const dayPillarDate = new Date(adjustedBirthDate.getTime());
    const isYajasiTimeWindow = originalHour === 23 && originalMinute >= 30;

    // 야자시 적용이 아니고, 보정된 시간이 23시 이후일 때만 날짜를 하루 더함.
    if (!isYajasi || !isYajasiTimeWindow) {
        if (adjustedBirthDate.getHours() >= 23) {
            dayPillarDate.setDate(dayPillarDate.getDate() + 1);
        }
    }
    // 야자시 적용 대상(isYajasi && isYajasiTimeWindow)인 경우, 날짜를 변경하지 않음.

    const refDateUTC = Date.UTC(2000, 0, 1);
    const birthDateUTC = Date.UTC(
        dayPillarDate.getFullYear(),
        dayPillarDate.getMonth(),
        dayPillarDate.getDate()
    );

    const daysDiff = Math.floor((birthDateUTC - refDateUTC) / (1000 * 60 * 60 * 24));

    const dayGapjaIndex = (54 + daysDiff) % 60;
    const finalDayGapjaIndex = dayGapjaIndex < 0 ? dayGapjaIndex + 60 : dayGapjaIndex;

    const dayStemIndex = finalDayGapjaIndex % 10;
    const dayBranch = earthlyBranches[finalDayGapjaIndex % 12];
    const dayStem = heavenlyStems[dayStemIndex];

    // --- 4. 시주 (Hour Pillar) 계산 ---
    // 시주 계산 시 야자시 적용 여부와 관계 없이 KST 23:00~00:59는 자시(子時)로 처리
    const timeBranchIndex = originalHour === 23 ? 0 : Math.floor((originalHour + 1) / 2) % 12;
    const timeBranch = earthlyBranches[timeBranchIndex];

    // 시두법(時頭法)으로 시간(時干) 계산
    // 일간(日干)에 따라 자시(子時)의 천간이 정해지고, 이후 시간의 흐름에 따라 순행합니다.
    // (예: 甲己일에는 甲子시, 乙丑시, 丙寅시... 순서로 시간이 정해짐)
    const hourStemStartMap: { [key: number]: number } = {
        0: 0, 5: 0, // 甲(0), 己(5)일 -> 甲子(0)시 부터 시작
        1: 2, 6: 2, // 乙(1), 庚(6)일 -> 丙子(2)시 부터 시작
        2: 4, 7: 4, // 丙(2), 辛(7)일 -> 戊子(4)시 부터 시작
        3: 6, 8: 6, // 丁(3), 壬(8)일 -> 庚子(6)시 부터 시작
        4: 8, 9: 8, // 戊(4), 癸(9)일 -> 壬子(8)시 부터 시작
    };

    const timeStemStartForJaSi = hourStemStartMap[dayStemIndex];
    if (timeStemStartForJaSi === undefined) {
        throw new Error(`Could not determine hour stem start for day stem index: ${dayStemIndex}`);
    }

    const timeStemIndex = (timeStemStartForJaSi + timeBranchIndex) % 10;
    const timeStem = heavenlyStems[timeStemIndex];

    const characters = [timeStem, timeBranch, dayStem, dayBranch, monthStem, monthBranch, yearStem, yearBranch];

    // --- 5. 대운 (Daewoon) 정보 계산 ---
    const isYearStemYang = yearStemIndex % 2 === 0;
    let daewoon: Daewoon;
    // 양년생 남자, 음년생 여자는 순행
    if ((isYearStemYang && gender === 'male') || (!isYearStemYang && gender === 'female')) {
        daewoon = 'sunhaeng';
    } else {
        daewoon = 'yeokhaeng';
    }

    // 대운수 계산 (생일과 가까운 절기 사이의 날짜를 3으로 나눔)
    let diff;
    if (daewoon === 'sunhaeng') {
        if (!nextTermDate) throw new Error("대운 계산을 위한 다음 절기를 찾을 수 없습니다.");
        diff = nextTermDate.getTime() - adjustedBirthDate.getTime();
    } else {
        if (!currentTermDate) throw new Error("대운 계산을 위한 이전 절기를 찾을 수 없습니다.");
        diff = adjustedBirthDate.getTime() - currentTermDate.getTime();
    }
    let daewoonNumber = Math.round((diff / (1000 * 60 * 60 * 24)) / 3);
    if (daewoonNumber < 1) daewoonNumber = 1;
    if (daewoonNumber > 10) daewoonNumber = 10;

    return {
        characters,
        daewoon,
        daewoonNumber,
    };
};

export const getSewoonPillars = (startYear: number, count: number, ilGan: string): SewoonPillar[] => {
    const pillars: SewoonPillar[] = [];
    for (let i = 0; i < count; i++) {
        const year = startYear + i;
        const yearGapjaIndex = (year - 4 + 60) % 60;
        const ganji = ganjiCycle[yearGapjaIndex];
        const gan = ganji[0];
        const ji = ganji[1];

        const cheonGan: Gan = {
            char: gan,
            ohaeng: earthlyBranchGanInfo[gan].ohaeng,
            sibsin: getSibsin(ilGan, gan),
        };

        const jiJi: Ji = {
            char: ji,
            ohaeng: earthlyBranchGanInfo[ji].ohaeng,
            sibsin: getSibsin(ilGan, ji),
            jijanggan: (jijangganData[ji] || []).map(jigan => ({
                char: jigan,
                ohaeng: earthlyBranchGanInfo[jigan].ohaeng,
                sibsin: getSibsin(ilGan, jigan),
            })),
            unseong: getUnseong(ilGan, ji),
        };

        pillars.push({
            year,
            ganji,
            cheonGan,
            jiJi,
        });
    }
    return pillars;
};