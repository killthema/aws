import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { utilApi } from '../api/api'; // : 공통 설정된 Axios 인스턴스를 사용하여 서버 주소 관리를 일원화합니다.


/**
 *  
 * MariaDB의 fish_compatibility 테이블 데이터를 기반으로 선택된 두 어종의 합사 궁합을 판단합니다.
 * 정해진 22종 리스트만 제공하여 오타로 인한 404 에러를 방지합니다. 
 */
const CompatibilityPage = () => {
  const navigate = useNavigate();
  
  // : 하드코딩된 '절대 변하지 않는' 물고기 22종 리스트입니다.
  // DB에 있는 이름과 100% 똑같이 맞춰두어 통신 에러(404)를 원천 차단합니다.

  const fishList = [
    '조피볼락', '무지개송어', '넙치', '산천어', '황복', '빙어', '대구', '연어', 
    '갈치', '고등어', '미유기', '버들치', '옥돔', '임연수어', '곤들매기', 
    '황아귀', '명태', '방어', '쥐노래미', '황어', '열목어', '브라운송어'
  ];

  const [fishA, setFishA] = useState('');
  const [fishB, setFishB] = useState('');
// 왼쪽과 오른쪽 드롭다운에서 선택한 물고기 이름을 기억합니다 //

  const [result, setResult] = useState(null); //백엔드 서버가 판별해 준 궁합 결과(상태, 이유)를 담는 바구니입니다.


  /**
   * 결과 보기 버튼을 눌렀을때 작동하는 핵심 엔진 입니다.
   */
  const handleCheck = async () => {

    // [방어 로직 1]: 둘 중 하나라도 안 골랐으면 튕겨냅니다.

    if (!fishA || !fishB) return alert("물고기를 두 마리 선택해주세요.");
    // [방어 로직 2]: 똑같은 물고기를 두 마리 고르면 튕겨냅니다. (당연히 합사가 되니까요!)

    if (fishA === fishB) return alert("서로 다른 물고기를 선택해야 정확한 궁합 확인이 가능합니다.");
    
    try {

      //  자바 서버로 두 물고기 이름을 보내고 결과를 기다립니다(await).
      // utilApi 안에 axios 코드가 예쁘게 숨어있어 코드가 훨씬 깔끔해졌습니다

      const data = await utilApi.checkCompatibility(fishA, fishB);
      setResult(data);
    } catch (error) {
      console.error("합사 판별 통신 오류:", error);
      alert("서버와 통신할 수 없습니다. 자바 서버(8090) 상태를 확인하세요.");
    }
  };
  //  서버가 준 데이터(예: { status: '주의', reason: '크기 차이로 먹힐 수 있음' })를 저장합니다.

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/menu')} style={styles.backBtn}>← 메뉴로 나가기</button>
      
      <h2 style={styles.title}> 냉수어 합사 판단기</h2>
      <p style={styles.subtitle}>함께 키울 물고기들의 궁합을 확인해 보세요.</p>
      
      {/*: 물고기 선택 영역 === */}
      <div style={styles.selectionArea}>
        {/*  fishList 배열을 순회하며 드롭다운 옵션을 생성합니다. */}
        <select value={fishA} onChange={(e) => setFishA(e.target.value)} style={styles.select}>
          <option value="">물고기 1 선택</option>
           {/* 배열.map()을 써서 22마리의 <option> 태그를 순식간에 찍어냅니다. */}

          {fishList.map(name => <option key={`a-${name}`} value={name}>{name}</option>)}
        </select>

        <span style={styles.vsText}>VS</span>

        <select value={fishB} onChange={(e) => setFishB(e.target.value)} style={styles.select}>
          <option value="">물고기 2 선택</option>
          {fishList.map(name => <option key={`b-${name}`} value={name}>{name}</option>)}
        </select>

        <button onClick={handleCheck} style={styles.checkBtn}>결과 보기</button>
      </div>

        {/* 결과 출력 영역 */}
      {/* result 메모리에 데이터가 들어왔을 때만 이 카드를 화면에 그립니다. */}


      {result && (
        <div style={{ 
          ...styles.resultCard, 
          // 시각 효과 : 상태가 '가능'이면 초록 '주의'면 노랑, 나머지는 빨강 테두리를 칠합니다.

          borderColor: result.status === '가능' ? '#2ecc71' : result.status === '주의' ? '#f1c40f' : '#e74c3c' 
        }}>
          <h3 style={styles.resultStatus}>판정 결과: [{result.status}]</h3>
          <p style={styles.resultReason}>{result.reason}</p>
        </div>
      )}
    </div>
  );
};

// 역할: 컴포넌트 내부에서 사용할 스타일 객체입니다.
const styles = {
  container: { padding: '40px 20px', textAlign: 'center', backgroundColor: '#f4f7f6', minHeight: '100vh' },
  title: { color: '#2c3e50', marginBottom: '10px' },
  subtitle: { color: '#7f8c8d', marginBottom: '30px' },
  selectionArea: { marginBottom: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' },
  select: { padding: '12px', borderRadius: '8px', border: '1px solid #bdc3c7', fontSize: '15px' },
  vsText: { fontWeight: 'bold', fontSize: '18px', color: '#95a5a6' },
  checkBtn: { padding: '12px 25px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  backBtn: { padding: '8px 15px', position: 'absolute', top: '20px', left: '20px', backgroundColor: '#ecf0f1', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer' },
  resultCard: { 
    maxWidth: '600px', margin: '0 auto', padding: '25px', backgroundColor: 'white', 
    border: '3px solid', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' 
  },
  resultStatus: { marginTop: 0, marginBottom: '15px' },
  resultReason: { fontSize: '16px', lineHeight: '1.6', color: '#34495e', wordBreak: 'keep-all' }
};

export default CompatibilityPage;