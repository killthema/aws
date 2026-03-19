/**
 * [코드의 역할]
 * 리액트 앱의 '엔진'을 켜는 파일입니다. 
 * HTML의 빈 공간(<div id="root">)을 찾아 리액트 화면을 채워 넣습니다.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// [작동 순서 1] 같은 폴더(./)에 있는 App.jsx를 정확한 이름으로 불러옵니다.

import App from './FixApp.jsx'

// [작동 순서 2] root 엘리먼트에 앱을 렌더링(그리기) 시작합니다.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);