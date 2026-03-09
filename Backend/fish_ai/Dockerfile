# [역할]: 질문자님이 사용하시는 Python 3.10 환경을 기본 베이스로 가져옵니다.
FROM python:3.10-slim

# [작동 순서 1]: 컨테이너 내부의 작업 공간을 '/app'으로 지정합니다.
WORKDIR /app

# [작동 순서 2]: 내 컴퓨터의 파일들(app.py, 모델 등)을 컨테이너 안으로 복사합니다.
COPY . /app

# [역할]: AI 실행에 필요한 라이브러리(TensorFlow 등)를 명단에 따라 설치합니다.
RUN pip install --no-cache-dir -r requirements.txt

# [역할]: 리액트가 신호를 보낼 5000번 포트를 열어둡니다.
EXPOSE 5000

# [작동 순서 3]: 모든 준비가 끝나면 파이썬 서버를 가동합니다.
CMD ["python", "main.py"]