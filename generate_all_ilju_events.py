import json
import os

# 일주 성격 데이터 로드
with open('today_unse/ilju_personalities.json', 'r', encoding='utf-8') as f:
    personalities = json.load(f)

# 기존 이벤트 데이터 로드 (갑자, 을축은 이미 작성됨)
with open('today_unse/ilju_daily_events.json', 'r', encoding='utf-8') as f:
    events = json.load(f)

# 이벤트 템플릿 생성 함수
def generate_events_for_ilju(hanja, personality):
    ilju = personality['일주']
    core = personality['핵심특성']
    strength = personality['강점']
    comm = personality['소통스타일']
    emotion = personality['감정표현']
    work = personality['업무스타일']
    extra = personality['추가특징']

    # 강점을 리스트로 변환
    if isinstance(strength, list):
        strengths_list = strength
    else:
        strengths_list = [s.strip() for s in strength.split(',')]

    return {
        "일주": ilju,
        "한자": hanja,
        "오늘의이벤트": {
            "인연": [
                f"오전 10-11시쯤, {core} 당신에게 공감하는 사람과 의미 있는 대화 나눌 수 있어요",
                f"점심시간에 당신과 잘 맞는 사람이 먼저 말을 걸어올 거예요",
                f"오후 3-4시, {strengths_list[0]}을(를) 알아봐주는 사람과 협업 기회가 생길 수 있어요",
                f"퇴근 후 우연한 만남에서 깊은 인연으로 발전할 수 있어요",
                f"저녁 약속에서 당신의 {strengths_list[1] if len(strengths_list) > 1 else strengths_list[0]}에 감탄하는 사람 만날 수 있어요"
            ],
            "재미": [
                f"유쾌한 하루! 오전에 예상치 못한 재밌는 상황 만날 수 있어요",
                f"점심 후 동료나 친구가 보낸 메시지 보고 공감하며 웃을 거예요",
                f"오후 2-3시쯤 당신의 스타일과 딱 맞는 콘텐츠 발견하고 빠져들 거예요",
                f"저녁에 예상 외의 재밌는 일이 생겨서 뿌듯할 거예요",
                f"밤에 우연히 본 영상이나 글이 당신의 취향 저격할 수 있어요"
            ],
            "행운": [
                f"오늘 오후 4시 이후, {strengths_list[0]}을(를) 발휘한 게 인정받아 좋은 소식 들을 거예요",
                f"당신의 방식이 오늘은 특히 빛을 발해서 일이 술술 풀릴 수 있어요",
                f"점심시간 전후로 {core} 당신에게 유리한 상황이나 제안이 들어올 거예요",
                f"오후에 {strengths_list[1] if len(strengths_list) > 1 else strengths_list[0]}이(가) 필요한 순간, 딱 맞는 기회 생길 수 있어요",
                f"저녁에 당신의 말이 누군가의 마음을 움직여 좋은 결과 얻을 거예요"
            ],
            "영감": [
                f"아침 루틴 중 새로운 아이디어 떠올릴 수 있어요",
                f"영감의 순간! 점심 후 휴식 시간에 당신의 감성이 자극받아 영감 받을 거예요",
                f"오후 작업 중 당신만의 관점이 새로운 해결책을 열어줄 수 있어요",
                f"저녁 산책이나 이동 중 통찰 얻을 거예요. 이 아이디어가 나중에 큰 도움 될 수 있어요",
                f"밤에 새로운 방법 떠오를 수 있어요"
            ],
            "도전": [
                f"평소보다 조금 더 표현해보면 좋은 반응 받을 거예요",
                f"{core} 당신이라면 새로운 방식 시도해도 금방 적응하고 성과 낼 수 있어요",
                f"점심시간에 의견 제시하면 설득력 있게 전달될 거예요",
                f"오후에 {strengths_list[0]}을(를) 활용한 프로젝트 시작하면 몰입하게 될 거예요",
                f"저녁이나 주말에 새로운 취미 시작하면 재밌을 거예요"
            ]
        },
        "시간대별예측": {
            "새벽": f"6-8시, {core} 당신답게 하루를 여는 시간. 좋은 기운으로 시작될 거예요",
            "오전": f"9-12시, {strengths_list[0]} 발휘하기 좋은 시간. 중요한 일은 11시 전후가 베스트",
            "점심": f"12-2시, 대화하거나 여유 갖기 좋아요",
            "오후": f"3-6시, 집중하면 높은 성과 낼 수 있는 골든타임",
            "저녁": f"7-9시, {core} 당신답게 감정 표현하거나 쉬기 좋은 시간",
            "밤": f"10시 이후, 내일 계획 세우거나 충분히 쉬세요"
        },
        "요일별테마": {
            "월요일": f"새로운 한 주! {core} 당신답게 시작하면 한 주 내내 안정적일 거예요",
            "화요일": f"{core} 당신의 강점 드러나는 날. 점심쯤 좋은 피드백 받을 수 있어요",
            "수요일": f"중반 고비! {strengths_list[0]}을(를) 활용하면 오후에 돌파구 찾을 거예요",
            "목요일": f"거의 다 왔어요. 동료들과 소통하면 힐링돼요",
            "금요일": f"불금! {core} 당신답게 한 주 마무리하고 저녁은 마음껏 즐기세요",
            "토요일": f"여유로운 주말. {core} 당신에게 맞는 활동이나 휴식 즐기면 좋아요",
            "일요일": f"재충전의 날. {core} 당신답게 다음 주 준비하세요"
        },
        "에너지조합": {
            "활동높음_마음높음": f"{core} 당신이 최고조! 오후 2-4시가 골든타임",
            "활동높음_마음보통": f"에너지 넘쳐요. 오전 집중, 오후 여유",
            "활동높음_마음낮음": f"몸은 괜찮은데 마음이 무거워요. 활동하면 기분 나아질 거예요",
            "활동보통_마음높음": f"기분 좋은 날! 소통하면 더 즐거워요",
            "활동보통_마음보통": f"평온한 하루. 루틴 지키면 저녁에 뿌듯해요",
            "활동보통_마음낮음": f"무리하지 마세요. 감정 인정하고 쉬어가세요",
            "활동낮음_마음높음": f"몸은 쉬고 싶지만 마음은 설레요. 계획 세우면 기분 좋아져요",
            "활동낮음_마음보통": f"쉬어가는 날. 여유롭게 즐기세요",
            "활동낮음_마음낮음": f"충전이 필요해요. {core} 당신답게 푹 쉬고 스스로 돌보세요"
        }
    }

# 이미 작성된 일주 제외하고 나머지 58개 생성
already_done = ['甲子', '乙丑']
count = 0

for hanja, personality in personalities.items():
    if hanja in already_done:
        continue

    events[hanja] = generate_events_for_ilju(hanja, personality)
    count += 1
    print(f"생성 완료: {personality['일주']} ({count}/58)")

# 저장
with open('today_unse/ilju_daily_events.json', 'w', encoding='utf-8') as f:
    json.dump(events, f, ensure_ascii=False, indent=2)

print(f"\n✅ 총 {count + 2}개 일주 이벤트 데이터 생성 완료!")
print("파일: today_unse/ilju_daily_events.json")
