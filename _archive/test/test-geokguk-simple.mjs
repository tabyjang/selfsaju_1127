/**
 * 격국 판단 시스템 간단 테스트
 * Node.js에서 직접 실행 가능
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// TypeScript 파일을 직접 실행할 수 없으므로
// 대신 실제 코드를 검증하는 간단한 테스트

console.log('🧪 격국 판단 시스템 테스트\n');
console.log('⚠️  TypeScript 파일이므로 직접 실행할 수 없습니다.\n');
console.log('대신 다음 방법으로 테스트하세요:\n');
console.log('1. Vite 개발 서버 실행:');
console.log('   npm run dev\n');
console.log('2. 브라우저 콘솔에서:');
console.log('   import { runAllTests } from "./utils/geokguk.test.ts";');
console.log('   runAllTests();\n');
console.log('3. 또는 간단한 테스트 페이지 생성\n');

// 파일 존재 확인
const testFiles = [
  'utils/geokguk-data.ts',
  'utils/gyeokguk.ts',
  'utils/geokguk-special.ts',
  'utils/geokguk-naegyeok.ts',
  'utils/geokguk.test.ts',
];

console.log('📁 파일 존재 확인:');
let allExist = true;
for (const file of testFiles) {
  try {
    readFileSync(join(__dirname, file), 'utf-8');
    console.log(`   ✅ ${file}`);
  } catch (e) {
    console.log(`   ❌ ${file} - 파일 없음`);
    allExist = false;
  }
}

if (allExist) {
  console.log('\n✅ 모든 테스트 파일이 존재합니다!');
} else {
  console.log('\n❌ 일부 파일이 없습니다.');
}

console.log('\n💡 실제 테스트는 Vite 개발 서버에서 실행하세요.\n');

