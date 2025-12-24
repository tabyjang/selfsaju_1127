import json
import sys

def convert_structure(input_file):
    """
    십이운성.장생.fortunes → 운세.장생 형식으로 변경
    """
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 구조 확인 및 변경
    if '십이운성' in data:
        # fortunes 중간 키 제거
        new_unse = {}
        for unsung_name, unsung_data in data['십이운성'].items():
            if isinstance(unsung_data, dict) and 'fortunes' in unsung_data:
                new_unse[unsung_name] = unsung_data['fortunes']
            else:
                new_unse[unsung_name] = unsung_data

        # 십이운성 → 운세로 변경
        data['운세'] = new_unse
        del data['십이운성']

    # 파일 저장
    with open(input_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"[OK] {input_file} 구조 변경 완료")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        for file_path in sys.argv[1:]:
            convert_structure(file_path)
    else:
        print("파일 경로를 인자로 제공하세요")
