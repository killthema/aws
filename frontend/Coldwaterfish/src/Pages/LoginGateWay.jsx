

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { memberApi } from '../api/api'; 
import '../App.css'; 
// 화면 왼쪽에 보여줄 산천어 이미지를 불러옵니다.

import masuImage from '../assets/masu.jpg'; 


const LoginGateWay = () => {
  //로그인 성공 시 메인 화면으로 회원가입/비밀번호 찾기 페이지 이동 시킬때 사용한다.
  const navigate = useNavigate();
  //메모리 상태: 사용자가 입력하는 아이디와 비밀번호를 실시간으로 저장하는 공간 입니다.
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  //  사용자가 아이디/비밀번호를 입력하면 실시간으로 데이터를 수집합니다.
  const handleChange = (e) => {

    // 기존 데이터(...loginData)를 유지하면서, 현재 타이핑 중인 입력창(name)의 값(value)만 갱신합니다.
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    


  };

  /**
   * 탐험 시작하기 버튼을 누르면 실행되는 로그인 검증 핵심 로직
   */
 /**
 * [작동 순서]:
 * 1. 사용자가 '탐험 시작하기' 버튼을 누름.
 * 2. 아이디와 비밀번호가 담긴 loginData 객체를 통째로 memberApi.login에 전달.
 * 3. 서버 응답 결과에 따라 페이지를 이동하거나 경고창을 띄움.
 */
const handleLogin = async (e) => {
  e.preventDefault();
  try {
    // [수정 포인트]: 재료를 따로 보내지 말고, loginData 객체 하나를 통째로 보냅니다.
    // loginData 안에는 { username: '...', password: '...' }가 이미 들어있습니다.
    const message = await memberApi.login(loginData); 
    
    if (message.includes("성공")) {
      // 신분증(아이디)을 브라우저에 저장하고 메인 메뉴로 이동
      localStorage.setItem('user', loginData.username);
      navigate('/menu'); 
    } else {
      // "비밀번호가 틀렸습니다" 등의 서버 메시지 출력
      alert(message); 
    }
  } catch (error) {
    alert("서버와 연결할 수 없습니다. IP 주소와 백엔드 실행 상태를 확인하세요!"); 
  }
};

  return (
    <div className="landing-container">
      
      {/*  소개글 + 이미지 */}
      <div className="landing-hero">
        <h1>차가운 물속의<br/>신비한 친구들</h1>
        <p>
          대한민국 계곡과 강에 서식하는 냉수어종을<br/>
          <strong>AI로 쉽고 빠르게</strong> 찾아보세요.
        </p>
         {/* 인라인 스타일을 적용해 이미지를 가운데 정렬하고 둥글게(borderRadius) 꾸몄습니다. */}

        <div style={{ margin: '30px 0', textAlign: 'center' }}>
            <img 
              src={masuImage} 
              alt="산천어 사진" 
              style={{ 
                width: '100%', 
                maxWidth: '400px', 
                borderRadius: '15px', 
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)' 
              }} 
            />
        </div>
        
        <ul className="feature-list">
          <li> <strong>이친구의 이름이 뭔지 아시나요?</strong> 산천어에요 </li>
          <li> <strong>가족이 되는 건 어때요?</strong> 냉수어 탐험을 지금 시작해 보세요!</li>
        </ul>
      </div>

      {/* [오른쪽 영역] 로그인 카드 */}
      <div className="login-card">
        <h2 style={{color: '#006064', marginBottom: '20px'}}>로그인</h2>
         {/* onSubmit: 폼 안에서 엔터키를 치거나 submit 버튼을 누르면 handleLogin 실행 */}
        <form onSubmit={handleLogin}>
           {/* required 속성을 넣어 빈칸일 경우 브라우저가 자체적으로 경고를 띄우게 했습니다. */}

          <input 
            className="form-input" 
            name="username" 
            placeholder="아이디" 
            onChange={handleChange} 
            required
          />
          <input 
            className="form-input" 
            type="password" 
            name="password" 
            placeholder="비밀번호" 
            onChange={handleChange} 
            required
          />
          <button type="submit" className="btn-primary">탐험 시작하기</button>
        </form>
        {/* 회원가입 및 비밀번호 찾기 링크 버튼들 */}
        <div style={{marginTop: '20px', fontSize: '0.9rem'}}>
         
          <button onClick={() => navigate('/SignupPage')} className="btn-link">
            처음 오셨나요? <strong>회원가입</strong>
          </button>
          <br/>
          <button onClick={() => navigate('/find')} className="btn-link" style={{color: '#999'}}>
            계정을 잊으셨나요?
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginGateWay;