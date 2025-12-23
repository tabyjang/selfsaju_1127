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
  IljuDailyEvent,
  EnergyCombo,
  EventCategory,
  Weekday,
} from './types';

// 메인 함수
export { generateFortune, formatFortune } from './fortuneGenerator';
export { generateEventBasedFortune } from './eventFortuneGenerator';
export { generateStoryFortune, formatStoryFortune } from './storyFortuneGenerator';

// 스토리 로더
export {
  loadStoryForIlju,
  selectStoryVersion,
  clearStoryCache,
  getStoryCacheStatus,
} from './storyLoader';
export type { StoryVersion, IljuStoryData } from './storyLoader';

// 데이터 로더
export {
  loadIljuPersonalities,
  loadUnseongThemes,
  loadHolidayMessages,
  loadFortuneTemplates,
  loadIljuDailyEvents,
  getIljuPersonality,
  getUnseongTheme,
  getHolidayMessage,
  getIljuDailyEvent,
  preloadAllData,
  clearCache,
} from './dataLoader';

// 유틸리티 함수
export {
  replacePlaceholders,
  replacePlaceholdersInArray,
  replaceHolidayPlaceholders,
  replaceActionPlanPlaceholders,
  replaceStoryPlaceholders,
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
