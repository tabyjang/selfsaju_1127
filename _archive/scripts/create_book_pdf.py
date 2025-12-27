"""
분할된 강의 자료를 PDF 책으로 재가공하는 스크립트

사용법:
python create_book_pdf.py --input-dir public/theories/content/sibsin-guide --output sibsin_guide_book.pdf --title "십신 가이드" --author "셀프사주"
python create_book_pdf.py --input-dir public/theories/content/yeonghaejapyeong --output yeonghaejapyeong_book.pdf --title "연해자평" --author "셀프사주"
"""

import os
import argparse
import re
from pathlib import Path
import subprocess
import sys


def get_lesson_files(input_dir):
    """강의 파일들을 순서대로 가져오기"""
    lesson_files = []

    # 디렉토리 내의 모든 .md 파일 찾기
    for file in sorted(os.listdir(input_dir)):
        if file.endswith('.md') and re.match(r'.*-\d+.*\.md', file):
            lesson_files.append(os.path.join(input_dir, file))

    # 파일명으로 정렬 (숫자 순서)
    lesson_files.sort()

    return lesson_files


def create_combined_markdown(lesson_files, output_file, title, author):
    """여러 강의 파일을 하나의 마크다운으로 합치기"""

    with open(output_file, 'w', encoding='utf-8') as outfile:
        # YAML 메타데이터 작성 (표지 정보)
        outfile.write('---\n')
        outfile.write(f'title: "{title}"\n')
        outfile.write(f'author: "{author}"\n')
        outfile.write('date: \\today\n')
        outfile.write('documentclass: book\n')
        outfile.write('geometry: margin=1in\n')
        outfile.write('fontsize: 11pt\n')
        outfile.write('toc: true\n')  # 목차 생성
        outfile.write('toc-depth: 2\n')
        outfile.write('numbersections: true\n')
        outfile.write('---\n\n')

        # 각 강의 파일 내용 추가
        for i, lesson_file in enumerate(lesson_files, 1):
            print(f"Processing: {lesson_file}")

            with open(lesson_file, 'r', encoding='utf-8') as infile:
                content = infile.read()

                # YAML front matter 제거 (있는 경우)
                content = re.sub(r'^---\n.*?---\n', '', content, flags=re.DOTALL)

                # 새 챕터 시작 (각 강마다 새 페이지)
                outfile.write(f'\\newpage\n\n')

                # 내용 추가
                outfile.write(content)
                outfile.write('\n\n')

    print(f"\n통합 마크다운 파일 생성 완료: {output_file}")


def convert_to_pdf(markdown_file, output_pdf, title):
    """Pandoc을 사용하여 마크다운을 PDF로 변환"""

    # Pandoc 설치 확인
    try:
        subprocess.run(['pandoc', '--version'], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("오류: Pandoc이 설치되어 있지 않습니다.")
        print("다음 사이트에서 Pandoc을 설치해주세요: https://pandoc.org/installing.html")
        return False

    # PDF 변환 명령어
    cmd = [
        'pandoc',
        markdown_file,
        '-o', output_pdf,
        '--pdf-engine=xelatex',  # 한글 지원을 위해 xelatex 사용
        '--toc',  # 목차 생성
        '--toc-depth=2',
        '--number-sections',  # 섹션 번호 자동 생성
        '-V', 'geometry:margin=1in',
        '-V', 'fontsize=11pt',
        '-V', 'documentclass=book',
        '-V', f'title={title}',
        # 한글 폰트 설정 (시스템에 설치된 한글 폰트 사용)
        '-V', 'mainfont=Malgun Gothic',
        '-V', 'CJKmainfont=Malgun Gothic',
    ]

    print(f"\nPDF 변환 중...")
    print(f"명령어: {' '.join(cmd)}")

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"\nPDF 생성 완료: {output_pdf}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"PDF 변환 중 오류 발생:")
        print(f"stdout: {e.stdout}")
        print(f"stderr: {e.stderr}")

        # xelatex가 없으면 pdflatex 시도
        print("\nxelatex가 없습니다. pdflatex로 재시도합니다...")
        cmd_alt = [
            'pandoc',
            markdown_file,
            '-o', output_pdf,
            '--pdf-engine=pdflatex',
            '--toc',
            '--toc-depth=2',
            '--number-sections',
            '-V', 'geometry:margin=1in',
            '-V', 'fontsize=11pt',
            '-V', 'documentclass=book',
        ]

        try:
            subprocess.run(cmd_alt, capture_output=True, text=True, check=True)
            print(f"\nPDF 생성 완료: {output_pdf}")
            print("주의: 한글이 제대로 표시되지 않을 수 있습니다. xelatex 설치를 권장합니다.")
            return True
        except subprocess.CalledProcessError as e2:
            print(f"pdflatex로도 변환 실패:")
            print(f"stderr: {e2.stderr}")
            return False


def main():
    parser = argparse.ArgumentParser(description='분할된 강의 자료를 PDF 책으로 변환')
    parser.add_argument('--input-dir', required=True, help='강의 파일들이 있는 디렉토리')
    parser.add_argument('--output', required=True, help='출력 PDF 파일명')
    parser.add_argument('--title', required=True, help='책 제목')
    parser.add_argument('--author', default='셀프사주', help='저자명 (기본값: 셀프사주)')
    parser.add_argument('--keep-md', action='store_true', help='중간 마크다운 파일 유지')

    args = parser.parse_args()

    # 입력 디렉토리 확인
    if not os.path.isdir(args.input_dir):
        print(f"오류: 디렉토리를 찾을 수 없습니다: {args.input_dir}")
        sys.exit(1)

    # 강의 파일 찾기
    lesson_files = get_lesson_files(args.input_dir)

    if not lesson_files:
        print(f"오류: {args.input_dir}에서 강의 파일을 찾을 수 없습니다.")
        sys.exit(1)

    print(f"\n찾은 강의 파일: {len(lesson_files)}개")
    for f in lesson_files:
        print(f"  - {os.path.basename(f)}")

    # 중간 마크다운 파일명
    temp_md = args.output.replace('.pdf', '_combined.md')

    # 1단계: 통합 마크다운 생성
    print(f"\n=== 1단계: 통합 마크다운 생성 ===")
    create_combined_markdown(lesson_files, temp_md, args.title, args.author)

    # 2단계: PDF 변환
    print(f"\n=== 2단계: PDF 변환 ===")
    success = convert_to_pdf(temp_md, args.output, args.title)

    # 중간 파일 삭제 (옵션에 따라)
    if not args.keep_md and os.path.exists(temp_md):
        os.remove(temp_md)
        print(f"중간 파일 삭제: {temp_md}")

    if success:
        print(f"\n✅ 책 생성 완료!")
        print(f"📚 출력 파일: {args.output}")
    else:
        print(f"\n⚠️  PDF 변환에 실패했습니다.")
        print(f"💡 대안: 통합 마크다운 파일({temp_md})을 다른 도구로 변환해보세요.")


if __name__ == '__main__':
    main()
