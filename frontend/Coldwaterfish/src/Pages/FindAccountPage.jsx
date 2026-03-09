import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { memberApi } from '../api/api'; 
import '../App.css'; 

const FindAccountPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('id');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState(''); 
    const [resultMessage, setResultMessage] = useState('');

    const handleFindId = async () => {
        if (!email) return alert("이메일을 입력해주세요!");
        try {
            // [작동 순서]: api.js의 memberApi를 통해 아이디 찾기를 진행합니다.
            const message = await memberApi.findId(email);
            setResultMessage(message); 
        } catch (error) {
            setResultMessage("정보를 찾을 수 없습니다.");
        }
    };

    const handleFindPw = async () => {
        if (!username || !email) return alert("아이디와 이메일을 입력해주세요!");
        try {
            const message = await memberApi.findPw(username, email);
            setResultMessage(message);
        } catch (error) {
            setResultMessage("정보가 일치하지 않습니다.");
        }
    };

    return (
        <div className="login-card" style={{ maxWidth: '400px', margin: '50px auto' }}>
            <h2 style={{color: '#006064', textAlign: 'center'}}>계정 찾기</h2>
            <div className="tab-buttons" style={{marginTop: '20px'}}>
                <button className={`tab-btn ${activeTab === 'id' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('id'); setResultMessage(''); }}>아이디 찾기</button>
                <button className={`tab-btn ${activeTab === 'pw' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('pw'); setResultMessage(''); }}>비밀번호 찾기</button>
            </div>
            <div style={{marginTop: '20px'}}>
                {activeTab === 'id' ? (
                    <div>
                        <input className="form-input" placeholder="가입 이메일" value={email} onChange={e => setEmail(e.target.value)} />
                        <button className="btn-primary" onClick={handleFindId}>아이디 찾기 메일 발송</button>
                    </div>
                ) : (
                    <div>
                        <input className="form-input" placeholder="아이디" value={username} onChange={e => setUsername(e.target.value)} />
                        <input className="form-input" placeholder="가입 이메일" value={email} onChange={e => setEmail(e.target.value)} />
                        <button className="btn-primary" onClick={handleFindPw}>비밀번호 찾기 메일 발송</button>
                    </div>
                )}
            </div>
            {resultMessage && <div style={{marginTop: '20px', padding: '15px', backgroundColor: '#e0f7fa', color: '#006064', borderRadius: '8px', textAlign: 'center'}}>{resultMessage}</div>}
            <button onClick={() => navigate('/login')} className="btn-link" style={{marginTop: '20px', width: '100%'}}>로그인으로 돌아가기</button>
        </div>
    );
};

export default FindAccountPage;