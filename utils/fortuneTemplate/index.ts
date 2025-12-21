/**
 * 템플릿 기반 운세 생성 시스템
 * 메인 export 파일
 */

// 타입 정의
export type {
  IljuPersonality,
  UnseongTheme,
  HolidayMessage,
  FortuneTemplates,
  EnergyLevel,
  ActivityLevel,
  FortuneInput,
  GeneratedFortune,
  HolidayInfo,
} from './types';

// 메인 함수
export { generateFortune, formatFortune } from './fortuneGenerator';

// 데이터 로더
export {
  loadIljuPersonalities,
  loadUnseongThemes,
  loadHolidayMessages,
  loadFortuneTemplates,
  getIljuPersonality,
  getUnseongTheme,
  getHolidayMessage,
  preloadAllData,
  clearCache,
} from './dataLoader';

// 유틸리티 함수
export {
  replacePlaceholders,
  replacePlaceholdersInArray,
  replaceHolidayPlaceholders,
  replaceActionPlanPlaceholders,
} from './placeholderReplacer';

export {
  dateToSeed,
  selectFromArray,
  selectMultipleFromArray,
  calculateMentalEnergy,
  calculateEnergyLevel,
  calculateActivityLevel,
} from './templateSelector';

export {
  checkHoliday,
  isHoliday,
  getHolidayName,
} from './holidayChecker';
