import time
import threading
from datetime import datetime
import os
import io
import numpy as np
import pymysql
from PIL import Image
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import random

# ---------------------------------------------------------
#  서버 실행에 필요한 환경을 조성하고 보안 정보를 로드합니다.



# ---------------------------------------------------------
# TensorFlow의 로그 출력을 조절하여 터미널을 깨끗하게 유지하고 하위 호환성을 설정합니다.
os.environ["TF_USE_LEGACY_KERAS"] = "1"
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

app = Flask(__name__)
CORS(app) #프론트 앤드에서 이 서버로 접속이 가능하도록 문을 열어주는 보안 설정

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_ROOT = os.path.join(BASE_DIR, "dataset")

#  하드코딩된 비밀번호를 지우고, .env에서 읽어오도록 변경했습니다.
#  AWS 환경에서 코드가 노출되어도 DB가 해킹당하지 않게 보호합니다.
# 하드코딩된 비밀번호를 지움으로써 깃허브 등에 코드가 노출되어도 DB 해킹을 방지합니다.
DB_HOST = os.getenv('DB_HOST', 'coldwaterfish.ctyike4yosu5.ap-northeast-2.rds.amazonaws.com')
DB_USER = os.getenv('DB_USER', 'trout_master')
DB_PASS = os.getenv('DB_PASSWORD', 'secure_pass123!')
DB_NAME = os.getenv('DB_NAME', 'coldwaterfish')

# ---------------------------------------------------------
# 코드의 역할: AWS RDS(클라우드 DB)와 통신할 수 있는 통로를 만듭니다.
# ---------------------------------------------------------
def get_db_connection():
    try: #설정된 정보를 바탕으로 설정된 정보를 바탕으로 PyMySQL을 이용하여 AWS RDS 서버의 문을 두드립니다.
        return pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME,
            port=3306,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor,
            ssl={'ssl': {}}, # AWS RDS 전용 보안 연결 설정
            connect_timeout=10
        )
    except Exception as e:
        print(f" AWS RDS 접속 실패: {e}")
        return None

# ---------------------------------------------------------
# AI 이미지 판독 모델 로드
# 학습된 AI 모델을 메모리에 올리고 판독 결과를 한국어로 변환할 준비를 한다.
# ---------------------------------------------------------

#서버가  서버가 켜지자마자 'fish_model_v2.h5' 파일을 읽어 AI 엔진을 예열합니다.
vision_model = load_model(os.path.join(BASE_DIR, 'fish_model_v2.h5'), compile=False)
IMG_SIZE = (vision_model.input_shape[1], vision_model.input_shape[2])
print(" 물고기 판독 AI 엔진 준비 완료!")

#영어로 된 학습 라벨을 사용자에게 보여줄 친절한 한국어 이름으로 변경
korean_map = {
    'atka_mackerel': '임연수어', 'brown_trout': '브라운 송어', 'catfish': '미유기',
    'cod': '대구', 'dace': '황어', 'dolly_varden': '곤들매기', 'flatfish': '넙치',
    'greenling': '쥐노래미', 'hairtail': '갈치', 'jacopever': '조피볼락',
    'lenok': '열목어', 'mackerel': '고등어', 'masou_salmon': '산천어',
    'minnow': '버들치', 'monkfish': '황아귀', 'pollack': '명태',
    'rainbow_trout': '무지개송어', 'river_puffer': '황복', 'salmon': '연어',
    'smelt': '빙어', 'tilefish': '옥돔', 'yellowtail': '방어'
}
class_names = list(korean_map.keys())

# ---------------------------------------------------------
# API 라우터들 모음
# 리액트 앱으로부터 요청을 받아 결과를 돌려주는 창구입니다.
# ---------------------------------------------------------
@app.route('/')
def home():
    return {"status": "success", "message": "Fish AI Server is Running!"}

@app.route('/predict', methods=['POST'])
#전송 받은 물고기 사진이 무엇인지 판독 합니다.
def predict():
    # 1. 리액트가 보낸 이미지 파일을 읽어 RGB 형태로 변환하고 AI 규격에 맞게 크기를 조절합니다.
    # 2. 이미지를 숫자로 변환(Numpy)하고 0~1 사이로 정규화(preprocess_input)합니다.
    # 3. AI 모델이 예측한 확률 값 중 가장 높은 인덱스를 찾아 한국어 이름을 반환합니다.
    file = request.files['file']
    img = Image.open(io.BytesIO(file.read())).convert('RGB').resize(IMG_SIZE)
    img_array = preprocess_input(np.expand_dims(img_to_array(img), axis=0))
    prediction = vision_model.predict(img_array)
    idx = np.argmax(prediction[0])
    return jsonify({
        "name": korean_map.get(class_names[idx], "알 수 없음"),
        "confidence": f"{float(prediction[0][idx]) * 100:.1f}%"
    })

# -------------- 리액트 챗봇 화면과 통신---------------
@app.route('/api/ai/advice', methods=['POST'])

def advise():
    global my_random_fish
    food_list = FISH_FOOD_DATA.get(my_random_fish, ["일반 열대어 사료"])
    recommended_food = random.choice(food_list)
        #리액트 챗봇 화면에 타이머 상태와 어항 관리 팁을 제공합니다
    answer = (
        f" [스마트 어항 관리 시스템]\n"
        f"현재 키우고 있는 어종: <{my_random_fish}>\n"
        f" 오늘의 추천 특식: {recommended_food}\n"
        f" 먹이 주기 알림: {FEEDING_INTERVAL}초 간격 작동 중\n"
        f" 청소/환수 알림: {CLEANING_INTERVAL}초 간격 작동 중\n\n"
        f"터미널 창에서 파이썬 서버가 실시간으로 타이머를 돌리고 있습니다!"
    )
    return jsonify({"answer": answer})

# -------------------------------------
#  청소, 물갈이 타이머 설정
# 서버가 켜져 있는 동안 정해진 시간마다 관리 메시지를 터미널에 띄웁니다.
# ---------------------------------


# 어종별 선호 먹이 데이터
# 서버가 켜져 있는 동안 정해진 시간마다 관리 메시지를 터미널에 띄웁니다.
# 타이머가 울릴때마다 무작위로 추천해준다.
FISH_FOOD_DATA = {
    "열목어": ["사료", "냉동 장구벌레", "작은 물고기"],
    "브라운송어": ["사료", "냉동 장구벌레", "작은 물고기"],
    "무지개송어": ["사료", "냉동 장구벌레", "작은 물고기"],
    "조피볼락": ["작은 갑각류", "사료", "작은 어종"],
    "넙치": ["사료", "작은 물고기"],
    "산천어": ["사료", "냉동 장구벌레", "작은 물고기"],
    "황복": ["사료", "작은 물고기"],
    "빙어": ["냉동 장구벌레", "사료"],
    "대구": ["사료", "작은 물고기", "작은 갑각류"],
    "연어": ["사료", "냉동 장구벌레"],
    "갈치": ["작은 물고기", "사료"],
    "고등어": ["작은 물고기", "사료"],
    "미유기": ["냉동 장구벌레", "사료"],
    "버들치": ["냉동 장구벌레", "사료"],
    "옥돔": ["작은 물고기", "사료"],
    "임연수어": ["작은 물고기", "사료"],
    "곤들매기": ["사료", "냉동 장구벌레", "작은 물고기"],
    "황아귀": ["작은 물고기", "갑각류"],
    "명태": ["작은 물고기", "사료"],
    "방어": ["작은 물고기", "갑각류"],
    "쥐노래미": ["작은 물고기", "갑각류"],
    "황어": ["작은 물고기", "사료", "냉동 장구벌레"]
}

FEEDING_INTERVAL = 10 # 10초마다 먹이 알림
CLEANING_INTERVAL = 30 # 30초마다 청소 알림
SEASON_CHECK_INTERVAL = 60  # 60초마다 수온 체크

class FishTimer:
    # 별도의 쓰레드(Thread)를 생성하여 게임 외적으로 관리 알림을 수행합니다
    def __init__(self, my_fish_name):
        self.my_fish_name = my_fish_name
        self.is_running = False

    def feeding_timer(self):
        # 지정된 초(Interval)만큼 잠들었다가 깨어나서 먹이 알림을 출력합니다. 무한 반복됩니다.
        while self.is_running:
            time.sleep(FEEDING_INTERVAL)
            if self.is_running:
                now = datetime.now().strftime("%H:%M:%S")
                food_list = FISH_FOOD_DATA.get(self.my_fish_name, ["일반 열대어 사료"])
                recommended_food = random.choice(food_list)
                print(f" [{now}] 삐빅! <{self.my_fish_name}> 먹이 시간! (오늘의 추천 특식: {recommended_food})")

    def cleaning_timer(self):
        #:지정된 초(Interval)만큼 잠들었다가 깨어나서 먹이 알림을 출력하며 무한 반복

        while self.is_running:
            time.sleep(CLEANING_INTERVAL)
            if self.is_running:
                now = datetime.now().strftime("%H:%M:%S")
                print(f" [{now}] 삐삑! <{self.my_fish_name}> 어항 물갈이(환수)와 여과기 청소시간입니다!")

    def season_timer(self):
        while self.is_running:
            time.sleep(SEASON_CHECK_INTERVAL)
            if self.is_running:
                now = datetime.now().strftime("%H:%M:%S")
                print(f" [{now}] 안내: <{self.my_fish_name}>의 서식 수온이 적당한지 수온 체크 해보십시오!")

    def start_timers(self):
        # 1. 3개의 알림 기능을 각각 독립된 쓰레드로 실행합니다.
        # 2. daemon=True 설정을 통해 메인 서버가 종료되면 타이머도 함께 종료되게 합니다.
        self.is_running = True
        print(f" <{self.my_fish_name}> 전용 스마트 어항 타이머 백그라운드 가동!")
        t1 = threading.Thread(target=self.feeding_timer)
        t2 = threading.Thread(target=self.cleaning_timer)
        t3 = threading.Thread(target=self.season_timer)
        t1.daemon = True
        t2.daemon = True
        t3.daemon = True
        t1.start()
        t2.start()
        t3.start()

# =========================================================
# 메인 실행 구간
# =========================================================
if __name__ == '__main__':
    global my_random_fish
    #1.초기 관리 대상 어종을 무작위로 선택한다
    fish_names = list(FISH_FOOD_DATA.keys())
    my_random_fish = random.choice(fish_names)

    #스마트 타이머 시스템을 가동한다
    my_timer = FishTimer(my_random_fish)
    my_timer.start_timers()

    # 역할: 5000번 포트로 서버를 엽니다. (Docker 내부)
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)