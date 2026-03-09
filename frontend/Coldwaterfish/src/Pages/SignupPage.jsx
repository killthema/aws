import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// 백엔드 서버(Spring Boot 등)와 통신하기 위해 미리 만들어둔 API 함수를 불러옵니다.

import { memberApi } from '../api/api';
import '../App.css';

const SignupPage = () => {
  //페이지 이동을 도와주는 Hook 가입 성공 시 로그인 창으로 보낼때 사용 
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '', 
    password: '',
    nickname: '', 
    email: '',
    phone: ''
  });
  // [역할]: 사용자가 키보드를 칠 때마다 실행되어 바구니(formData)의 내용을 업데이트하는 함수입

  const handleChange = (e) => {

      // ...formData는 기존에 입력된 데이터들을 그대로 복사해 오는 역할(스프레드 연산자)입니다.
    // [e.target.name]은 현재 입력 중인 input의 name 속성(예: 'username')을 찾아서,
    // 그 값만 e.target.value(사용자가 방금 친 글자)로 덮어씌웁니다.


    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
     // '가입완료' 버튼을 눌렀을 때 실행되는 최종 제출 함수입니다.

  const handleSubmit = async (e) => {
    //폼 제출시 브라우자가 새로 고침 되는 기본 동작을 저지해준다
    e.preventDefault();
      //필수 입력 값 확인 (빈칸 검사)
    if (!formData.username || !formData.password || !formData.nickname) {
      alert("아이디, 비밀번호, 닉네임은 필수입니다!");
      return;// 빈칸이 있으면 여기서 함수를 즉시 종료하고 아래 API 통신을 막는다.

    }

    try {
       // 백엔드 API 호출
      //await를 써서 백엔드 서버에서 처리(DB 저장 등)가 끝날 때까지 얌전히 기다립니다.

      const message = await memberApi.signup(formData);
      alert(message); // 서버에서 보내준 성공 메시지(예: "가입 성공!")를 띄웁니다.

      navigate('/login'); // 회원가입이 끝났으니 로그인 페이지로 화면을 전환합니다.


    } catch (error) {
      console.error("가입 실패:", error);
      alert("회원가입 중 오류가 발생했습니다.");// 서버가 꺼져있거나, 이미 존재하는 아이디라서 에러가 났을 때 실행됩니다.

    }
  };

  return (
    <div className="login-card">
      <div className="login-header">
        <h1></h1> {/*  로고나 빈공간 */}
        <h2>회원가입</h2>
      </div>
        {/* onSubmit: 폼 안에서 엔터를 치거나 submit 버튼을 누르면 handleSubmit이 실행됩니다. */}

      <form onSubmit={handleSubmit}>
         {/* name 속성이 formData의 키값(username)과 똑같아야 handleChange가 정상 작동합니다. */}

        <input 
          className="form-input" 
          name="username" 
          placeholder="아이디" 
          onChange={handleChange} 
        />
        <input 
          className="form-input" 
          type="password" 
          name="password" 
          placeholder="비밀번호" 
          onChange={handleChange} 
        />
        <input 
          className="form-input" 
          name="nickname" 
          placeholder="닉네임 (별명)" 
          onChange={handleChange} 
        />
        <input 
          className="form-input" 
          name="email" 
          type="email" 
          placeholder="이메일 (ID 찾기용)" 
          onChange={handleChange} 
        />
        <input 
          className="form-input" 
          name="phone" 
          placeholder="전화번호" 
          onChange={handleChange} 
        />
        
        {/* 버튼도 똑같은 파란색 버튼 적용 */}
        <button type="submit" className="btn-primary">
          가입완료
        </button>
      </form>

      {/* 뒤로가기 버튼 */}
      <button onClick={() => navigate('/login')} className="btn-link">
         로그인 화면으로 돌아가기
      </button>
    </div>
  );
};

export default SignupPage;









