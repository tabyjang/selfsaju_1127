import json

# 기존 템플릿 로드
with open('today_unse/fortune_templates.json', 'r', encoding='utf-8') as f:
    templates = json.load(f)

# 새로운 이벤트 중심 템플릿 추가
new_templates = {
    # 설레임 중심 오프닝 (에너지 연동)
    "event_opening_exciting": [
        "🔥 활동 에너지 {activity_energy}  💎 마음 에너지 {mental_energy}\n\n오늘 {event_time}쯤, {event_preview} 설레지 않나요?",
        "오늘은 재밌는 일이 생길 것 같은 예감! {event_time}에 {event_preview}",
        "{ilju.핵심특성} 당신에게 오늘은 특별해요. {event_time}, {event_preview}",
        "좋은 소식! 오늘 {event_time}쯤 {event_preview} 기대해도 좋아요",
        "설레는 하루가 될 거예요. 특히 {event_time}에 {event_preview}"
    ],

    # 에너지 상태별 인사 (활동/마음 조합)
    "event_energy_status": [
        "🔥💎 오늘 에너지 최고조! 몸도 마음도 가볍고 뭐든 잘 될 것 같은 기분이에요",
        "🔥 몸은 에너지 넘치는데 마음은 차분해요. 실행력 발휘하기 딱 좋은 날!",
        "🔥 몸은 활발한데 마음이 조금 무거울 수 있어요. 운동하면 기분 전환될 거예요",
        "💎 마음은 설레는데 몸이 좀 피곤할 수 있어요. 가벼운 만남이 힐링될 거예요",
        "오늘은 평온한 에너지. 무리하지 않고 루틴대로 하면 저녁에 뿌듯해요",
        "몸도 마음도 쉬고 싶어 하네요. 오후쯤 기분 좋은 소식 올 수 있으니 기다려보세요",
        "💎 마음은 설레는데 몸은 쉬고 싶어요. 침대에서 새 계획 세우면 기분 좋아져요",
        "에너지 충전이 필요한 날. 푹 쉬면서 좋아하는 걸 하면 힐링될 거예요",
        "오늘은 완전 힐링 모드. 쉬면서 내일을 위해 충전하는 게 최선이에요"
    ],

    # 인연 이벤트 메인
    "event_main_connection": [
        "{event_detail} {ilju.소통스타일} 당신답게 열린 마음으로 대화해 보세요!",
        "오늘 새로운 인연의 예감! {event_detail} 자연스럽게 다가가면 좋은 관계로 발전할 수 있어요",
        "{event_detail} {ilju.핵심특성} 당신의 매력이 빛날 순간이에요",
        "인연운이 좋은 날! {event_detail} 연락처 주고받게 될 수도 있어요",
        "{event_detail} 이 만남이 의외로 중요한 인연이 될 수 있어요"
    ],

    # 재미 이벤트 메인
    "event_main_fun": [
        "웃음 터질 일 생길 거예요! {event_detail} 기분 좋은 하루 될 거예요",
        "{event_detail} {ilju.감정표현} 당신도 공감하며 웃을 거예요",
        "오늘은 즐거운 일이 생길 예정! {event_detail} 주변 사람들과 함께 웃으세요",
        "{event_detail} 이런 소소한 재미가 하루를 밝게 만들어요",
        "재밌는 발견! {event_detail} {ilju.핵심특성} 당신의 취향 저격일 거예요"
    ],

    # 행운 이벤트 메인
    "event_main_luck": [
        "오늘 행운 떴어요! {event_detail} 놓치지 마세요",
        "{event_detail} {ilju.업무스타일} 당신의 노력이 빛을 발하는 순간이에요",
        "좋은 일 생길 예정! {event_detail} 기대해도 좋아요",
        "{event_detail} 이런 작은 행운들이 모여 큰 기쁨이 돼요",
        "운이 따르는 날! {event_detail} {ilju.강점}을 발휘할 기회예요"
    ],

    # 영감 이벤트 메인
    "event_main_inspiration": [
        "아이디어가 떠오를 거예요! {event_detail} 메모 꼭 해두세요",
        "{event_detail} {ilju.핵심특성} 당신만의 관점으로 통찰을 얻을 거예요",
        "영감의 순간! {event_detail} 이 아이디어가 나중에 큰 도움 될 수 있어요",
        "{event_detail} 평소 고민하던 문제의 해결책이 보일 수 있어요",
        "창의력이 샘솟는 날! {event_detail} {ilju.강점}을 활용해 보세요"
    ],

    # 도전 이벤트 메인
    "event_main_challenge": [
        "도전해볼까요? {event_detail} {ilju.핵심특성} 당신이라면 충분히 잘할 수 있어요",
        "{event_detail} 평소 망설였던 거라면 오늘이 기회예요",
        "새로운 시작! {event_detail} {ilju.업무스타일} 당신의 스타일로 접근하면 성공할 거예요",
        "{event_detail} 첫 걸음이 중요해요. 일단 시작해 보세요!",
        "변화의 시간! {event_detail} {ilju.강점}을 믿고 도전하세요"
    ],

    # 시간대별 예측
    "event_time_prediction": [
        "{time_period}에 {event_detail} 이 시간대 주목하세요!",
        "오늘의 골든타임은 {time_period}! {event_detail}",
        "{time_period}쯤 {event_detail} 이 타이밍 놓치지 마세요",
        "타이밍이 중요해요. {time_period}에 {event_detail}",
        "{time_period}, {event_detail} {ilju.핵심특성} 당신에게 딱 맞는 시간이에요"
    ],

    # 요일별 테마 (이벤트 연동)
    "event_weekday_theme": [
        "{weekday_event} {ilju.업무스타일} 당신답게 시작해 보세요!",
        "오늘은 {weekday}! {weekday_event} 기대되지 않나요?",
        "{weekday}의 특별함! {weekday_event}",
        "{weekday_event} {ilju.핵심특성} 당신에게 맞는 하루가 될 거예요",
        "{weekday}이니까! {weekday_event} 즐겨보세요"
    ],

    # 액션 플랜 (구체적 이벤트 기반)
    "event_action_plans": [
        "{event_action} - 오늘 꼭 해보세요!",
        "오늘의 미션: {event_action}",
        "{event_action} 이거 하나만 해도 오늘 성공!",
        "추천 액션: {event_action}",
        "{event_action} {ilju.강점}을 발휘할 기회예요"
    ],

    # 마무리 (설레임 중심)
    "event_closing_exciting": [
        "**오늘은 뭔가 특별한 일이 생길 거예요. {ilju.핵심특성} 당신답게 즐겨보세요!**",
        "**기대하세요! 오늘 {ilju.강점}이 빛날 순간이 올 거예요**",
        "**재밌는 하루 될 거예요. {ilju.소통스타일} 당신의 매력을 마음껏 발산하세요!**",
        "**오늘 하루, 설레는 순간들을 놓치지 마세요. 당신은 할 수 있어요!**",
        "**{ilju.핵심특성} 당신에게 오늘은 특별한 날이 될 거예요. 기대 가득!**"
    ]
}

# 기존 템플릿에 병합
templates.update(new_templates)

# 저장
with open('today_unse/fortune_templates.json', 'w', encoding='utf-8') as f:
    json.dump(templates, f, ensure_ascii=False, indent=2)

print("✅ 이벤트 중심 템플릿 추가 완료!")
print(f"추가된 템플릿 카테고리: {len(new_templates)}개")
print(f"전체 템플릿 카테고리: {len(templates)}개")
