import pygame
import asyncio
import random
import os
import sys

# ---------------------------------------------------------
# 기초 환경 설정
#    게임이 실행될 환경 PC와 웹을 감지하고 필요한 데이터를 준비한다.
# ---------------------------------------------------------

#  웹 브라우저(Pybag)환경인지 일반 pc환경인지 확인하여 이미지 경로를 설정한다.
# 각 환경에 맞는 이미지 파일 경로를 성정한다
if 'pyodide' in sys.modules or 'emscripten' in sys.modules:
    # 웹 환경에서는 현재 (.)를 기준으로 파일을 찾는다.
    BASE_DIR = "."
else:
    # pc 환경에서는 이 파이썬 파일이 저장된 위치를 자동으로 찾아낸다.
    BASE_DIR = os.path.dirname(os.path.abspath(__file__)) #로컬 개발용 환경용 경로
#이미지 폴더 경로 설정 (물고기, 킹크랩, 레이저 등이 있는곳)
GAME_IMG_DIR = os.path.join(BASE_DIR, "dataset", "gameimages")

WIDTH, HEIGHT = 800, 600#해상도 프레임 설정 1초에 60번 화면을 새로 그려 부드러운 움직임을 만든더.
FPS = 60

#물고기 충돌 시 출력할 법적 근거 데이터베이스 입니다.
#적 생성시 이미지 이름을 매칭하여 위반내용과 법령 내용을 연결
FISH_LAW_DATA = {
    "brown.png": {"name": "브라운송어", "basis": "생태계교란생물 관리법", "rule": "생태계교란종을 허가 없이 보관 및 방생하여 적발! 법령에 의해 처벌되었습니다."},
    "lenok.png": {"name": "열목어", "basis": "야생생물 보호법", "rule": "채집 금지 지역에서 포획 적발! 2년 이하의 징역 또는 2천만원 이하의 벌금에 처해졌습니다."},
    "pollack.png": {"name": "명태", "basis": "수산자원관리법", "rule": "명태는 연중 포획이 전면 금지된 어종입니다! 자원 고갈 위반으로 처벌되었습니다."},
    "cod.png": {"name": "대구", "basis": "수산자원관리법", "rule": "대구 금어기 위반 또는 금지체장(35cm) 미달 포획 적발! 징역형에 처해집니다."},
    "green.png": {"name": "쥐노래미", "basis": "수산자원관리법", "rule": "산란기 금어기(11~12월) 위반 포획! 수산자원 보호법 위반으로 벌금이 부과되었습니다."},
    "hairtail.png": {"name": "갈치", "basis": "수산자원관리법", "rule": "갈치 금어기(7월) 위반 또는 어린 갈치(항문장 18cm) 포획으로 적발되었습니다."},
    "mackerel.png": {"name": "고등어", "basis": "수산자원관리법", "rule": "고등어 금어기 위반 또는 어린 고등어(21cm) 포획 적발! 과태료가 부과됩니다."},
    "masou.png": {"name": "산천어", "basis": "수산자원관리법", "rule": "산천어 금지체장(20cm) 미달 포획! 어린 물고기 보호 위반으로 처벌되었습니다."},
    "salmon.png": {"name": "연어", "basis": "수산자원관리법", "rule": "연어 산란기 포획 금지 기간(10~11월) 위반! 강력한 법적 처벌을 받게 됩니다."}
}

#게임 엔진 초기화 및 윈도우 창 설정
pygame.init()
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("킹크랩이여 생태계를 구하라!")


# ---------------------------------------------------------
# 게임 내 등장하는 모든 개체 (플레이어, 적, 레이저의 행동을 정의합니다)
# ---------------------------------------------------------

class laser(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.Surface((4, 15)) # 4x15크기의 탄환 생성하여 발사위치에 둔다.
        self.image.fill((0, 255, 100))# 연두색 레이저
        self.rect = self.image.get_rect(center=(x, y))
        self.speed = -10 #위로 올라가야해서 음수 값 설정

    def update(self):
        #매 프레임마다 속도만큼 이동하다가 화면 밖으로 나가면 스스로 삭제(kill)
        self.rect.y += self.speed
        if self.rect.bottom < 0:
            self.kill()


class BossLaser(pygame.sprite.Sprite):
    #보스가 아래로 발사하는 레이저 클래스
    def __init__(self, x, y):
        super().__init__()
        # 작동 순서: laser.png 이미지를 불러와 빨간색 계열로 보이도록 크기를 조정합니다.
        full_path = os.path.join(GAME_IMG_DIR, "laser.png")
        try:
            temp_img = pygame.image.load(full_path).convert_alpha()
            temp_img.set_colorkey((255, 255, 255))
            self.image = pygame.transform.scale(temp_img, (15, 40))
        except:
            self.image = pygame.Surface((8, 20))
            self.image.fill((255, 50, 50))
        self.rect = self.image.get_rect(center=(x, y))
        self.speed = 8 #

    def update(self):
        self.rect.y += self.speed
        if self.rect.top > HEIGHT:
            self.kill()


class kingCrab(pygame.sprite.Sprite):
    def __init__(self):
        #플레이어가 조종하는 킹크랩 클래스
        super().__init__()
        full_path = os.path.join(GAME_IMG_DIR, "king.png")
        try:
            self.image = pygame.image.load(full_path).convert_alpha()
            self.image = pygame.transform.scale(self.image, (80, 50))
        except:
            self.image.fill((139, 69, 19))
        self.rect = self.image.get_rect(center=(WIDTH // 2, HEIGHT - 50))
        self.speed = 7

    def update(self):
        # 키보드 입력을 실시간으로 체크하여 화면 밖으로 못 나가게 이동시킵니다.
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT] and self.rect.left > 0:
            self.rect.x -= self.speed
        if keys[pygame.K_RIGHT] and self.rect.right < WIDTH:
            self.rect.x += self.speed


class Enemy(pygame.sprite.Sprite):
    #위에서 떨어지는 적 입니다.. 일반과 보스 몬스터를 겸 합니다
    def __init__(self, image_name, is_boss=False):
        super().__init__()
        self.is_boss = is_boss
        self.hp = 25 if is_boss else 1#보스몹은 25번 공격 받아아 죽습니다.

        #법령 데이터에서 위반 정보를 가져옵니다.
        if image_name in FISH_LAW_DATA:
            law_info = FISH_LAW_DATA[image_name]
            target_file = image_name
        else:
            law_info = {
                "name": "미확인 변질 장어",
                "basis": "관세법 및 야생생물법",
                "rule": "세관에 허가받지 않고 무단으로 반입하였습니다.조사를 받았습니다.."
            }
            target_file = "who.png"

        self.fish_name = law_info["name"]
        self.legal_basis = law_info["basis"]
        self.detailed_rule = law_info["rule"]
        # 이미지 로드 및 보스 유무에 따른 크기 조정
        full_path = os.path.join(GAME_IMG_DIR, target_file)
        try:
            temp_img = pygame.image.load(full_path).convert_alpha()
            if target_file == "who.png":
                temp_img.set_colorkey((0, 0, 0))
            size = (250, 150) if is_boss else (100, 70)
            self.image = pygame.transform.scale(temp_img, size)
        except:
            self.image = pygame.Surface((100, 70))
            self.image.fill((200, 0, 0))

        spawn_y = -150 if is_boss else -80
        #작동 순서 화면 왼쪽(-150)무작위 위치에서 스폰 됩니다.
        self.rect = self.image.get_rect(x=random.randint(0, WIDTH - self.image.get_width()), y=spawn_y)
        self.speed = 1 if is_boss else random.randint(3, 6)

    def update(self):
        self.rect.y += self.speed
        if self.rect.top > HEIGHT:
            self.kill()


# ---------------------------------------------------------
# 리액트와 연결 통신기능
# ---------------------------------------------------------

#  게임이 끝났을 때 리액트 웹페이지로 점수를 쏴준다.
def send_result_to_react(kills, basis_list):
    #게임의 점수와 자신의 패배 원인 목록을 리액트로 보낸다.
    if 'pyodide' in sys.modules or 'emscripten' in sys.modules:
        import js
        import json
        data = json.dumps({"kills": kills, "violations": basis_list})
        #'postMessage'를 통해 iframe 밖의 리액트 부모 창으로 무전을 칩니다
        js.window.parent.postMessage(f"game_result:{data}", "*")
        print("리액트로 데이터 전송 성공:", data)


def show_prosecution_screen(screen, fish_name, basis, rule):
    #역할 플레이어와 적이 충돌했을때 나타나는 경고 화면
    overlay = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
    overlay.fill((0, 0, 0, 200))#검정색 반투명 막 검은 배경의 물고기사진을 이걸로 대체
    screen.blit(overlay, (0, 0))

    font_title = pygame.font.SysFont("malgungothic", 40, bold=True)
    font_sub = pygame.font.SysFont("malgungothic", 25, bold=True)
    font_rule = pygame.font.SysFont("malgungothic", 20)

    t1 = font_title.render("경고 공격받고 있습니다.!", True, (255, 50, 50))
    t2 = font_sub.render(f"대상: {fish_name} ({basis} 위반)", True, (255, 200, 100))
    t3 = font_rule.render(rule, True, (255, 255, 255))
        #중앙 정렬후 출격
    screen.blit(t1, (WIDTH // 2 - t1.get_width() // 2, HEIGHT // 2 - 80))
    screen.blit(t2, (WIDTH // 2 - t2.get_width() // 2, HEIGHT // 2 - 20))
    screen.blit(t3, (WIDTH // 2 - t3.get_width() // 2, HEIGHT // 2 + 30))

    pygame.display.flip()
    pygame.time.delay(2500)

#--------------스테이지 클리어 화면---------------#

def show_stage_clear(screen, message):
    overlay = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
    overlay.fill((255, 255, 255, 200))
    screen.blit(overlay, (0, 0))

    font_title = pygame.font.SysFont("malgungothic", 40, bold=True)
    t1 = font_title.render(message, True, (0, 50, 200))

    screen.blit(t1, (WIDTH // 2 - t1.get_width() // 2, HEIGHT // 2 - 20))
    pygame.display.flip()
    pygame.time.delay(3500)


# ---------------------------------------------------------
# 게임의 시작과 끝
#
# ---------------------------------------------------------
async def main():
    # 그룹 및 변수 초기화
    all_sprites = pygame.sprite.Group()
    lasers = pygame.sprite.Group()
    enemies = pygame.sprite.Group()
    enemy_lasers = pygame.sprite.Group()

    player = kingCrab()
    all_sprites.add(player)

    current_stage = 1
    phase = "START"
    kill_count = 0
    total_kill_count = 0  # 1, 2스테이지 합산 킬 수 기록용
    boss_spawned = False
    violation_history = []  # 유저가 위반한 법령 목록 기록용

    fish_pool = ["brown.png", "lenok.png"]

    clock = pygame.time.Clock()
    running = True
    # 무한 루프 시작
    while running:
        # 키보드의 입력을 받아서 레이저를 발사한다
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    new_laser = laser(player.rect.centerx, player.rect.top)
                    all_sprites.add(new_laser)
                    lasers.add(new_laser)
        #킬 수에 따른 난이도 및 스테이지 관리
        if current_stage == 1:
            bg_color = (10, 30, 15)
            if phase == "START" and kill_count >= 15:
                phase = "MID_BOSS"
            elif phase == "AFTER_MID" and kill_count >= 30:
                phase = "FINAL_BOSS"
                #적 보스 스폰
        elif current_stage == 2:
            bg_color = (0, 0, 50)
            if phase == "START" and kill_count >= 15:
                phase = "MID_BOSS"
            elif phase == "AFTER_MID" and kill_count >= 30:
                phase = "FINAL_BOSS"

        if not boss_spawned:
            if phase == "MID_BOSS":
                b_name = "masou.png" if current_stage == 1 else "mackerel.png"
                boss = Enemy(b_name, is_boss=True)
                all_sprites.add(boss)
                enemies.add(boss)
                boss_spawned = True
            elif phase == "FINAL_BOSS":
                b_name = "salmon.png" if current_stage == 1 else "hairtail.png"
                boss = Enemy(b_name, is_boss=True)
                all_sprites.add(boss)
                enemies.add(boss)
                boss_spawned = True
            elif random.random() < 0.04: #4%확률로 일반 몹 생성
                new_fish = Enemy(random.choice(fish_pool))
                all_sprites.add(new_fish)
                enemies.add(new_fish)
        else:
            #보스의 수하들 소환
            for enemy in enemies:
                if enemy.is_boss and random.random() < 0.03:
                    if current_stage == 1:
                        atk = BossLaser(enemy.rect.centerx, enemy.rect.bottom)
                        all_sprites.add(atk)
                        enemy_lasers.add(atk)
                    elif current_stage == 2:
                        summoned_eel = Enemy("who.png", is_boss=False)
                        summoned_eel.rect.centerx = enemy.rect.centerx
                        summoned_eel.rect.top = enemy.rect.bottom
                        all_sprites.add(summoned_eel)
                        enemies.add(summoned_eel)
        #충돌 판정 1 공격 성공했을 경우
        hits = pygame.sprite.groupcollide(enemies, lasers, False, True)
        for enemy, hit_lasers in hits.items():
            enemy.hp -= len(hit_lasers)
            if enemy.hp <= 0:
                enemy.kill()
                kill_count += 1
                total_kill_count += 1  # 적을 잡을때마다 총 누적 킬수도 올립니다.

                if enemy.is_boss:
                    boss_spawned = False
                    if phase == "MID_BOSS":
                        phase = "AFTER_MID"
                        new_fish = "masou.png" if current_stage == 1 else "mackerel.png"
                        if new_fish not in fish_pool: fish_pool.append(new_fish)
                    elif phase == "FINAL_BOSS":
                        if current_stage == 1:
                            #1스테이지 클리어 시 초기화
                            show_stage_clear(screen, "1스테이지 클리어! 바다로 진입합니다!")
                            current_stage = 2
                            phase = "START"
                            kill_count = 0
                            fish_pool = ["cod.png", "green.png"]

                            for e in enemies: e.kill()
                            for el in enemy_lasers: el.kill()
                            for l in lasers: l.kill()
                        else:
                            show_stage_clear(screen, "게임 클리어! 생태계를 구원하셨습니다!")
                            # 2스테이지 클리어 최종 엔딩
                            send_result_to_react(total_kill_count, violation_history)
                            running = False
        # 충돌 판정2 플레이어 피격시
        collided_enemies = pygame.sprite.spritecollide(player, enemies, True)
        if collided_enemies:
            guilty_fish = collided_enemies[0]
            # [추가]: 피격 당했을 때 어떤 법률을 위반했는지 장부에 적습니다.
            if guilty_fish.legal_basis not in violation_history:
                violation_history.append(guilty_fish.legal_basis)

            show_prosecution_screen(screen, guilty_fish.fish_name, guilty_fish.legal_basis, guilty_fish.detailed_rule)

            # : 피격되어 게임 오버 처리 시 리액트로 여태까지 모은 점수를 전송합니다.
            send_result_to_react(total_kill_count, violation_history)
            running = False  # 게임 루프를 종료합니다.

        collided_lasers = pygame.sprite.spritecollide(player, enemy_lasers, True)
        if collided_lasers:
            show_prosecution_screen(screen, "앗 적이 공격합니다. ", "킹크랩이 아파합니다..",
                                    " 지친 킹크랩은 생테계를 구원하는걸 포기하기로 하였습니다.")
        # 화면 그리기
        all_sprites.update()
        screen.fill(bg_color)
        all_sprites.draw(screen)

        #UI로 스테이지와 킬 수 출력
        font_ui = pygame.font.SysFont(None, 30)
        st_text = "FRESHWATER" if current_stage == 1 else "SEAWATER"
        ui = font_ui.render(f"Stage: {st_text} | Kills: {kill_count}", True, (255, 255, 255))
        screen.blit(ui, (10, 10))


        #웹에서 멈춤 방지를 위한 비 동기 숨 고르기
        pygame.display.flip()
        await asyncio.sleep(0)
        clock.tick(FPS)

    pygame.quit()

#실제 게임 실행
if __name__ == "__main__":
    asyncio.run(main())