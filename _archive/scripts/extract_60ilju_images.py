import os
from docx import Document
from PIL import Image
import io

# 경로 설정
base_path = r'C:\NewProject\saju_master_main\selfsaju_1127_main\selfsaju_1127'
word_path = os.path.join(base_path, r'public\theories\content\00_saju_study_wordfiles\60ilju_word_files')
output_img_path = os.path.join(base_path, r'public\60ilju')

# 60ilju 폴더 생성
os.makedirs(output_img_path, exist_ok=True)

# Word 파일 목록 가져오기
word_files = [f for f in os.listdir(word_path) if f.endswith('.docx')]
print(f"총 {len(word_files)}개 Word 파일 발견")

# 각 Word 파일에서 이미지 추출
for word_file in sorted(word_files):
    ilju_name = word_file.replace('.docx', '')
    ilju_folder = os.path.join(output_img_path, ilju_name)
    os.makedirs(ilju_folder, exist_ok=True)

    # Word 파일 열기
    doc_path = os.path.join(word_path, word_file)
    try:
        doc = Document(doc_path)

        # 이미지 추출
        img_count = 0
        for rel in doc.part.rels.values():
            if "image" in rel.target_ref:
                img_count += 1
                img_data = rel.target_part.blob

                # 이미지를 webp로 변환
                img = Image.open(io.BytesIO(img_data))
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')

                output_file = os.path.join(ilju_folder, f'img-{img_count:02d}.webp')
                img.save(output_file, 'WEBP', quality=85)

        print(f"[OK] {ilju_name}: {img_count}개 이미지")
    except Exception as e:
        print(f"[ERR] {ilju_name}: {str(e)[:50]}")

print("\n이미지 추출 완료!")
