import json

def add_unse_wrapper(input_file):
    """
    "장생", "목욕" 등이 바로 있는 파일을 "운세" 키로 감싸기
    """
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 운세나 십이운성 키가 없고, 장생이 바로 있는 경우
    if '운세' not in data and '십이운성' not in data and '장생' in data:
        # 십이운성 목록
        unsung_list = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양']

        # 운세 객체 생성
        unse = {}
        for unsung in unsung_list:
            if unsung in data:
                unse[unsung] = data[unsung]
                del data[unsung]

        # 운세 키로 감싸기
        data['운세'] = unse

        # 한자 추가 (없으면)
        if '한자' not in data:
            ilju_hanja = {
                '경신': '庚申',
                '경술': '庚戌'
            }
            if data.get('일주') in ilju_hanja:
                data['한자'] = ilju_hanja[data['일주']]

        # 파일 저장
        with open(input_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"[OK] {input_file} 구조 수정 완료 (운세 키 추가)")
    else:
        print(f"[SKIP] {input_file} - 이미 올바른 구조")

if __name__ == '__main__':
    files = [
        'today_unse/stories/41_경신.json',
        'today_unse/stories/42_경술.json'
    ]

    for file_path in files:
        try:
            add_unse_wrapper(file_path)
        except Exception as e:
            print(f"[ERROR] {file_path}: {e}")
