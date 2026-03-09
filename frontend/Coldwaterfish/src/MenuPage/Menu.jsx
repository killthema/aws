import React, { useState, useEffect } from 'react'; //변경사항  : 수신기를 달기 위해 useEffect를 가져옵니다.
import { useNavigate } from 'react-router-dom';
import { gameApi } from '../api/api'; //추가 사항  방금 완성한 api.js에서 게임 저장 기능을 가져옵니다. (경로는 실제 위치에 맞게 수정하세요)
import './MenuPage.css';

const Menu = () => {
  const navigate = useNavigate();
  const [isGameActive, setIsGameActive] = useState(false);

  // ==========================================================
  // [기능 추가]: 게임 결과 수신 및 DB 저장 로직
  // ==========================================================
  useEffect(() => {
    /**
     * [역할]: 파이썬 게임(iframe)이 보내는 종료 신호를 감지합니다.
     * [작동 순서]:
     * 1. 게임 종료 -> game.py에서 postMessage 발송
     * 2. React가 이를 감지하여 데이터 파싱
     * 3. gameApi를 통해 Java 서버(DB)로 점수 전송
     */
    const handleGameMessage = async (event) => {
      // 신호가 'game_result:'로 시작하는지 검증합니다.
      if (typeof event.data === 'string' && event.data.startsWith('game_result:')) {
        const result = JSON.parse(event.data.split('game_result:')[1]);
        console.log(" 게임 결과 수신 완료:", result);

        // 로그인된 유저의 ID를 가져옵니다. (localStorage 저장 방식에 맞춰 파싱)
        const storedUser = localStorage.getItem('user');
        // 예시: user가 JSON 객체라면 파싱하고, 아니면 기본값 1을 줍니다. 실제 환경에 맞게 조절하세요.
        const memberId = storedUser ? JSON.parse(storedUser).id : 1; 

        try {
          // api.js를 호출하여 DB에 점수와 기소 내역을 저장합니다.
          await gameApi.saveGameResult(memberId, result.kills, result.violations);
          alert(`축하합니다! 총 ${result.kills}마리를 검거하여 기록이 저장되었습니다!`);
          
          // 게임이 끝났으니 화면을 다시 일반 메뉴로 돌려놓습니다.
          setIsGameActive(false); 
        } catch (error) {
          console.error("기록 저장 중 서버 오류 발생:", error);
          alert("기록 저장에 실패했습니다.");
        }
      }
    };

    // 브라우저에 귀(Listener)를 달아줍니다.
    window.addEventListener('message', handleGameMessage);
    
    // 컴포넌트가 꺼질 때 귀를 떼어줍니다. (메모리 누수 방지)
    return () => window.removeEventListener('message', handleGameMessage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleGame = () => {
    setIsGameActive(!isGameActive);
  };

  return (
    <div className="menu-page">
      <nav className="black-header">
        <div className="nav-inner">
          <div className="nav-item" onClick={() => navigate('/search')}>물고기 도감</div>
          <div className="nav-item" onClick={() => navigate('/mypage')}>나의 수조 체크하기</div>
          <div className="nav-item" onClick={() => navigate('/disease')}>물고기 질병 치료법</div>
          <div className="nav-item" onClick={() => navigate('/compatibilitypage')}>합사 판단</div>
          
          <div className={`nav-item game-link ${isGameActive ? 'active' : ''}`} onClick={toggleGame}>
            {isGameActive ? ' 홈으로' : ' 킹크랩 게임 시작'}
          </div>
          
          <div className="nav-item ai-link" onClick={() => navigate('/chatguide')}>챗봇 가이드</div>
          <div className="nav-item logout" onClick={handleLogout}>로그아웃</div>
        </div>
      </nav>

      <main className="main-content">
        {isGameActive ? (
          <div className="game-wrapper">
            <div className="game-header">
              <h2>킹크랩 생태계 수호 작전</h2>
              <p>파이썬으로 구현된 게임이 브라우저에서 직접 실행 중입니다. (스페이스바: 레이저 / 방향키: 이동)</p>
            </div>
            {/* [작동 순서]: pygbag으로 빌드된 index.html을 화면에 띄웁니다. */}
            <iframe 
              src="/king-crab-game/index.html" 
              title="King Crab Laser Game"
              width="800" 
              height="600" 
              className="game-frame"
              style={{ border: 'none', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}
            />
          </div>
        ) : (
          <div className="intro-section">
            <h2 className="main-title">연구소 메뉴</h2>
            <p>상단의 '킹크랩 게임 시작' 버튼을 누르면 생태계 수호 작전이 시작됩니다.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Menu;