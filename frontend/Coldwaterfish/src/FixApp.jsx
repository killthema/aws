/**
 * [파일의 역할]: 전체 앱의 '내비게이션 지도' 역할을 합니다. 
 * [작동 순서]: 접속 주소를 확인 -> 로그인 여부 체크(isAuthenticated) -> 해당 페이지 컴포넌트 호출 
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginGateWay from './Pages/LoginGateWay';
import SignupPage from './Pages/SignupPage';
import FindAccountPage from './Pages/FindAccountPage';
import Menu from './MenuPage/Menu';
import SearchPage from './SearchPage/SearchPage';
import MyPage from './Mypage/MyPage'; 
import DiseasePage from './Disease/DiseasePage';
import CompatibilityPage from './Compatibility/CompatibilityPage';
import Shop from './Shoping/Shop';
function App() {
  //  로컬 스토리지에 사용자 정보가 있는지 확인하여 로그인 여부를 판단합니다. 
  const isAuthenticated = localStorage.getItem('user');

  return (
    <Router>
      <Routes>
        {/* 1. 기본 화면: 로그인이 안 되어 있으면 무조건 로그인 페이지로 */}
        <Route path="/" element={<LoginGateWay />} />
        <Route path="/login" element={<LoginGateWay />} />
        
        {/* 2. 보호된 라우트: 로그인한 사람만 접근 가능, 아니면 로그인으로 튕겨냄 */}
        <Route path="/menu" element={isAuthenticated ? <Menu /> : <Navigate to="/login" replace />} />
        <Route path="/search" element={isAuthenticated ? <SearchPage /> : <Navigate to="/login" replace />} />
        <Route path="/mypage" element={isAuthenticated ? <MyPage /> : <Navigate to="/login" replace />} />
        
        <Route 
          path="/compatibilitypage" 
          element={isAuthenticated ? <CompatibilityPage /> : <Navigate to="/login" replace />} 
        />
              
       <Route 
      path="/shop" 
      element={isAuthenticated ? <Shop /> : <Navigate to="/login" replace />} 
    />
        
        {/* 질병페이지 */}
        <Route path="/disease" element={isAuthenticated ? <DiseasePage /> : <Navigate to="/login" replace />} />

        {/* 3. 기타 회원 관리 페이지 */}
        <Route path="/SignupPage" element={<SignupPage />} />
        <Route path="/find" element={<FindAccountPage />} />

        {/* 4. 잘못된 주소 처리: 정의되지 않은 모든 주소는 로그인으로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;