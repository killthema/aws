import os
import io
import numpy as np
import pymysql
import random
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# [설정] 로그 출력 최적화
os.environ["TF_USE_LEGACY_KERAS"] = "1"
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# [DB] AWS RDS 접속 정보 (기존 유지)
DB_HOST = os.getenv('DB_HOST', 'coldwaterfish.ctyike4yosu5.ap-northeast-2.rds.amazonaws.com')
DB_USER = os.getenv('DB_USER', 'trout_master')
DB_PASS = os.getenv('DB_PASSWORD', 'secure_pass123!')
DB_NAME = os.getenv('DB_NAME', 'coldwaterfish')

# [AI] 이미지 판독 모델 로드 (쇼핑몰 내 '내 물고기 찾기' 기능용으로 유지)
vision_model = load_model(os.path.join(BASE_DIR, 'fish_model_v2.h5'), compile=False)
IMG_SIZE = (vision_model.input_shape[1], vision_model.input_shape[2])
print(" AI 이미지 분석 엔진 가동 중...")

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
# [핵심 로직] AI 장비-어종 매칭 데이터베이스
# ---------------------------------------------------------
# 쇼핑몰 아이템의 키워드에 따라 추천할 어종과 이유를 정의합니다.
RECOMMENDATION_DATA = {
    "salt": {
        "title": " 인공 해수염 기반 추천 어종",
        "fish_list": [
            {"name": "조피볼락(우럭)", "reason": "고염도의 깨끗한 해수 환경에서 면역력이 강해집니다."},
            {"name": "넙치(광어)", "reason": "바닥 생활을 하는 해수어로, 염도 유지가 성장에 필수적입니다."},
            {"name": "방어", "reason": "높은 산소 포화도와 염도가 확보된 환경에서 활동성이 증가합니다."}
        ]
    },
    "chiller": {
        "title": " 강력 냉각기 기반 추천 어종",
        "fish_list": [
            {"name": "무지개송어", "reason": "15도 이하의 냉수에서 가장 건강한 발색을 보여줍니다."},
            {"name": "산천어", "reason": "저수온 환경이 아니면 스트레스로 인해 폐사 위험이 큽니다."},
            {"name": "열목어", "reason": "계곡물 수준의 차가운 수온 유지를 위한 필수 장비입니다."}
        ]
    },
    "filter": {
        "title": " 고성능 여과기 기반 추천 어종",
        "fish_list": [
            {"name": "연어", "reason": "풍부한 유량과 깨끗한 수질에서 대형견 수준의 성장이 가능합니다."},
            {"name": "곤들매기", "reason": "암모니아 수치에 매우 민감하여 정밀한 여과가 필요합니다."}
        ]
    }
}


# ---------------------------------------------------------
# API 라우터 (쇼핑몰 전용)
# ---------------------------------------------------------

@app.route('/')
def home():
    return {"status": "success", "message": "Smart Shop AI Server is Running!"}


# [기능 1] 이미지 판독 (제품 추천을 위한 전제 조건으로 활용 가능)
@app.route('/predict', methods=['POST'])
def predict():
    file = request.files['file']
    img = Image.open(io.BytesIO(file.read())).convert('RGB').resize(IMG_SIZE)
    img_array = preprocess_input(np.expand_dims(img_to_array(img), axis=0))
    prediction = vision_model.predict(img_array)
    idx = np.argmax(prediction[0])
    return jsonify({
        "name": korean_map.get(class_names[idx], "알 수 없음"),
        "confidence": f"{float(prediction[0][idx]) * 100:.1f}%"
    })


# [기능 2] AI 장비 기반 어종 추천 API (신규)
@app.route('/api/shop/recommend', methods=['POST'])
def recommend_by_item():
    """
    [코드의 역할]: 리액트 쇼핑몰에서 보낸 상품명을 분석해 맞춤형 가이드를 제공합니다.
    [작동 순서]:
    1. 요청 본문에서 itemName을 추출합니다.
    2. 상품명에 포함된 키워드(해수염, 냉각기 등)를 식별합니다.
    3. 매칭되는 AI 가이드 데이터를 JSON 형태로 반환합니다.
    """
    data = request.get_json()
    item_name = data.get('itemName', '').strip() if data else ''

    # 기본값 설정
    result = {
        "title": " 일반 관리 가이드",
        "fish_list": [{"name": "공통", "reason": "모든 관상어의 건강한 생태계를 지원하는 기본 장비입니다."}]
    }

    # 키워드 매칭 로직
    if "해수염" in item_name:
        result = RECOMMENDATION_DATA["salt"]
    elif "냉각기" in item_name:
        result = RECOMMENDATION_DATA["chiller"]
    elif "여과기" in item_name:
        result = RECOMMENDATION_DATA["filter"]

    return jsonify(result)


if __name__ == '__main__':
    # AWS EC2 환경에서 5000번 포트로 가동
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)