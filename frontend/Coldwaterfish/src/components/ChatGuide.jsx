import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { askToFishAi } from '../api/api'; 
import './ChatGuide.css';

/**
 * 스마트 어항 관리 시스템의 상태를 확인하고 파이썬 백그라운드 서버와 통신하는 메인 컴포넌트입니다. 
 */
const ChatGuide = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  
  // [작동 순서 1]: 첫 인사말을 챗봇에서 '어항 관리 시스템' 컨셉으로 변경했습니다. 
  const [messages, setMessages] = useState([
    { sender: 'ai', text: ' 스마트 어항 관리 시스템에 연결되었습니다. 아무 메시지나 입력하여 현재 백그라운드에서 관리 중인 어종과 상태를 확인해 보세요!' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef();

  // [역할]: '나가기' 버튼 클릭 시 사용자 확인 후 메뉴 화면으로 이동시킵니다. 
  const handleExit = () => {
    if (window.confirm("상태 확인을 종료하고 메뉴로 돌아가시겠습니까?")) {
      navigate('/menu'); 
    }
  };

  // [역할]: 새로운 메시지가 추가될 때마다 채팅창 스크롤을 자동으로 맨 아래로 내립니다. 
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ############################################################
  //  1.입력값 검증 -> 2.사용자 메시지 표시 -> 3.파이썬 서버 통신 -> 4.상태 브리핑 출력 
  // ############################################################
  const handleSend = async () => {
    console.log("전송 버튼이 클릭되었습니다."); 
    
    if (!input.trim() || isLoading) return; 

    const userText = input;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');       
    setIsLoading(true); // 로딩바 켜기

    try {
      // 3. api.js의 askToFishAi 함수를 통해 파이썬 서버로 상태 확인 요청을 던집니다.
      const data = await askToFishAi(userText); 
      
      let aiResponseText = "";
      if (data && data.answer) {
        aiResponseText = data.answer;
      } else if (typeof data === 'string') {
        aiResponseText = data;
      } else {
        aiResponseText = "상태 정보를 가져왔지만 형식이 올바르지 않습니다.";
      }

      // 4. 파이썬이 보내준 '어항 상태 브리핑'을 화면에 보여줍니다.
      setMessages(prev => [...prev, { sender: 'ai', text: aiResponseText }]); 

    } catch (error) {
      console.error("통신 에러가 발생했습니다:", error);
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: '서버 응답이 없습니다. 파이썬 서버가 켜져 있는지 확인해 주세요.' 
      }]);
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button className="exit-btn" onClick={handleExit}>← 나가기</button>
        {/* 타이틀 변경: 챗봇 -> 스마트 어항 관리 시스템 */}
        <h2>스마트 어항 관리 패널</h2>
        <div style={{ width: '80px' }}></div> 
      </div>

      <div className="chat-messages" ref={scrollRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.sender}`}>
            <div className="message-bubble" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
          </div>
        ))}
        {/* 로딩 문구 변경: 이제 2~3분이 걸리지 않고 0.1초 만에 답이 오기 때문에 문구를 깔끔하게 바꿨습니다. */}
        {isLoading && (
          <div className="message-wrapper ai">
            <div className="message-bubble loading">시스템 상태를 조회 중입니다...</div>
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="시스템 상태를 확인하려면 메시지를 입력하세요."
          disabled={isLoading}
        />
        <button className="send-btn" onClick={handleSend} disabled={isLoading}>확인</button>
      </div>
    </div>
  );
};

export default ChatGuide;