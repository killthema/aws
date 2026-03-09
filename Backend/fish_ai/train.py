import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model

#------------ 코드의 역할: 데이터의 위치와 AI가 사진을 읽어올 규격을 정합니다.--------------
#작동 순서
#1. 사진이 담긴 폴더 경로를 지정합니다.
# 2. AI가 처리하기 좋은 크기(224x224)와 한 번에 공부할 양(Batch)을 정합니다.
DATA_DIR = './dataset'
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
#-----------------------------------------------------------------------------------------
# 데이터 증강  부족한 사진 데이터를 인위적으로 늘려 AI의 응용력을 높입니다.
#-------------------------------------------------------------------------------------------

# 1.사진을 뒤집고 마는 이미지 변형 규칙 생성
# 2. 80%는 공부용(Training), 20%는 시험용(Validation)으로 자동 분할합니다.
datagen = ImageDataGenerator(

    #상세 설명:  MobileNetV2 모델이 요구하는 숫자 형식으로 사진 픽셀값을 조정합니다.
    preprocessing_function=tf.keras.applications.mobilenet_v2.preprocess_input,
    rotation_range=20,      # 사진 회전
    width_shift_range=0.2,  # 좌우 이동
    height_shift_range=0.2, # 상하 이동
    horizontal_flip=True,   # 좌우 반전 (물고기가 왼쪽/오른쪽 보는 경우 모두 학습)
    validation_split=0.2    # 전체 사진 중 20%는 모의고사(검증)용으로 빼둠
)
#--------------------------------------------------------------------------------------

#이미지 생성기 구축
#폴더 내 사진들을 AI 모델에 주입하기 쉬운 데이터 묶음으로 변환합니다.
#---------------------------------------------------------------------------------------
#작동 순서 : 폴더 이름을 보고 자동으로 라벨등을 붙혀 데이터를 생성한합니다.
train_generator = datagen.flow_from_directory(
    DATA_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical', #다종 분류 (총 22종)설정
    subset='training' #공부용 데이터 묶음
)


val_generator = datagen.flow_from_directory(
    DATA_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation'# 시험용 데이터 묶음
)

# AI가 어떤 폴더를 어떤 숫자로 인식했는지 출력 (매핑 확인용)
print(" AI가 인식한 폴더(클래스) 순서:", train_generator.class_indices)

#--------------------------------------------------------------------------------------
# 똑똑한 AI(MobileNetV2)의 뇌를 빌려와 물고기만 새로 배웁니다.
#------------------------------------------------------------------------------------

# 1. 구글이 만든 MobileNetV2 모델(천만 장 이상 사진 학습)을 가져옵니다.
# 2. 기존의 '상식' 부분은 건드리지 않게 고정(Freezing)합니다.
# 3. 마지막 출력 부분만 우리 물고기(22종)에 맞게 새로 조립합니다.

base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
base_model.trainable = False

# 기존 지식(가중치)은 업데이트하지 않음


x = base_model.output
x = GlobalAveragePooling2D()(x) #3D 데이터를 1D로 압축

#최종적으로 22가지 물고기 중 어디에 속할지 확률(Softmax)로 내뱉는 층이다.
predictions = Dense(22, activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=predictions)
#--------------------------------------------------------

#어떻게 시험하고 공부하고 시험 치를지 규칙을 정하고 공부를 시작한다.
#---------------------------------------------------------

#오답을 어떻게 줄일지(Adam), 점수를 어떻게 매길지(Crossentropy) 설정합니다.
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])


# 10번(Epochs) 반복해서 사진들을 훑으며 실력을 쌓습니다.
print(" 물고기 도감 AI 공장 초기화 및 재학습을 시작합니다...")
history = model.fit(
    train_generator,
    epochs=10,
    validation_data=val_generator
)

# ---------------------------------------------------------
#
#완성된 AI의 '지식'을 파일로 저장하여 서버에서 쓸 수 있게 합니다.
# ---------------------------------------------------------

# 작동 순서: 모든 학습이 끝나면 .h5 확장자 파일로 내보냅니다.
model.save('fish_model_v2.h5')
print(" 깔끔하게 포맷된 새 모델(fish_model_v2.h5)이 저장되었습니다!")