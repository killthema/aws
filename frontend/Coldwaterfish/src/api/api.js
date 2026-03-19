import axios from 'axios';
//서버를 동적으로 결정한다 //

const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://13.124.50.152:8090/api';
const BASE_AI_URL = import.meta.env.VITE_AI_URL || 'http://13.124.50.152:5000';


/// : 서버 주소를 동적으로 결정합니다. (AWS 배포 시 .env 파일의 주소를 우선 사용)
const api = axios.create({ baseURL: BASE_API_URL, headers: { 'Content-Type': 'application/json' } });
///파이썬 AI용 무전기입니다. 사진 판독 시 시간이 걸릴 수 있어 타임아웃 제한을 풉니다.////
const aiApi = axios.create({ baseURL: BASE_AI_URL, timeout: 0 });

// 1. 도감 & AI 분석 
export const fishApi = {
  getAllFish: async () => (await api.get('/fish-list')).data,

  // [추가]: 도감 검색 기능을 위해 자바 서버의 /fish-list/search로 요청을 보냅니다.
  // 작동 순서: 리액트에서 입력한 키워드를 쿼리 파라미터(?keyword=...)에 담아 전송합니다.
  searchFish: async (keyword) => (await api.get('/fish-list/search', { params: { keyword } })).data,

  predictFish: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await aiApi.post('/predict', formData, { 
      headers: { 'Content-Type': 'multipart/form-data' }, 
      timeout: 90000 
    });
    return response.data;
  }
};

export const shopApi = {
  // 사용자가 쇼핑몰에서 아이템을 클릭/구매했을 때 파이썬 AI에게 추천 어종을 물어봅니다.
  getAiRecommend: async (itemName) => {
    // 파이썬 서버(5000번 포트)의 /api/shop/recommend 경로로 상품명을 보냅니다.
    const response = await aiApi.post('/api/shop/recommend', { itemName });
    return response.data;
  }
};

// 3. 수조 & 킹크랩 게임 결과 저장 
export const tankApi = {
  saveTank: (data) => api.post('/tanks/save-and-match', data), //수조 저장 및 자동 어종 매칭
  getMyTanks: (memberId) => api.get(`/tanks/user/${memberId}`) // 내 계정의 수조들 불러오기
};
//킹크랩 게임에서 보낸 점수와 법령 위반 내역을 자바DB에 최종 기록 합니다.
export const gameApi = {
  saveGameResult: async (memberId, killCount, violations) => 
    (await api.post('/game/result', { memberId, score: killCount, violations })).data
};

// 4. 기타 유틸리티 (질병, 합사)

export const utilApi = {
  checkCompatibility: (fishA, fishB) => api.get(`/compatibility?a=${fishA}&b=${fishB}`).then(res => res.data),
  //두 물고기 이름을 쿼리 파라미터로 보내서 같이 키워도 되는지 답을 얻습니다.
  getDiseases: () => api.get('/diseases').then(res => res.data)

  //자바 서버에 저장된 냉수어 질병 백과사전 데이터를 가져온다

  
};

//  회원가입, 로그인, 계정 찾기 등 '사용자 관련' 통신을 담당합니다.
export const memberApi = {
  //  회원가입 폼 데이터를 받아 자바 서버의 /member/signup 주소로 보냅니다.
  signup: async (formData) => (await api.post('/members/join', formData)).data,

  //  이메일을 보내 아이디 찾기를 요청합니다.
  findId: async (email) => (await api.post('/members/find-id', { email })).data,

  //  아이디와 이메일을 함께 보내 임시 비밀번호 발송을 요청합니다.
 findPw: async (username, email) => (await api.post('/members/find-pw', { username, email })).data,
  //  로그인 기능도 보통 여기서 관리합니다.
login: async (credentials) => (await api.post('/members/login', credentials)).data
};