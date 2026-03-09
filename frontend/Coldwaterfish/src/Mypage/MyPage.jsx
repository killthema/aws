import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tankApi } from '../api/api'; 
import '../App.css';

/**수조의 크기를 입력 받아서 수조 리터(L)을 계산하고   */
/**자바 백엔드와 통신하여 해당 수조에 살수 있는 냉수어를 추천 받아 기록합니다. */



const MyPage = () => {
    const navigate = useNavigate();
    //로그인 정보를 가져오거나 기본 값을 설정한다 
    const username = localStorage.getItem('user') || '사용자';
    const memberId = 1; //실제 서비스 시에는 로그인한 고유 ID를 사용합니다.

    const [form, setForm] = useState({ name: '', w: '', d: '', h: '' });//수조 입력 폼
    const [matchingFish, setMatchingFish] = useState([]); //매칭된 물고기 목록
    const [myTanks, setMyTanks] = useState([]);//나의 수조 이력
    const [liter, setLiter] = useState(0);//계산된 리터 값

    const loadMyTanks = () => {
        //  api.js의 tankApi를 호출하여 사용자의 수조 목록을 불러옵니다.
        tankApi.getMyTanks(memberId)
            .then(res => setMyTanks(res.data))
            .catch(e => console.error("데이터 로딩 실패", e));
    };

    useEffect(loadMyTanks, []);
        /**
         * 
         * 1.입력된 가로 세로 높이 값을 검증합니다.
         * 2.가로*세로*높이/1000 공식을 통해 수조 용량(L)을 계산한다
         * 3.자바 서버로 수조 정보를(POST)하고, 결과로 매칭된 '물고기 리스트'를 받습니다.
         * 4. 성공 시 목록을 새로 고침 함
         */
    const handleSaveAndMatch = async () => {
        const { name, w, d, h } = form;
        if (!name || !w || !d || !h) return alert("빈칸을 채워주세요!");

        const calcL = Math.floor((w * d * h) / 1000); 
        setLiter(calcL);
            // [역할]: 자바 백엔드 서버의 /tanks/save-and-match 엔드포인트와 통신합니다.
        try {
            const res = await tankApi.saveTank({
                memberId, 
                tankName: name, 
                tankSize: `${w}x${d}x${h}`, 
                volumeLiter: calcL
            }); 
            //서버가 계산된 용량에 맞춰 추천해준 물고기들을 상태에 저장한다 

            setMatchingFish(res.data);
            //목록 최신화 
            loadMyTanks(); 
            alert("수조 정보가 저장되었으며, 적합 어종 매칭을 완료했습니다!");
        } catch (e) { 
            alert("서버 오류가 발생했습니다."); 
        }
    };

    return (
        <div className="mypage-wrapper" style={{ paddingTop: '60px' }}>
            <div className="top-nav-bar">
                <span className="exit-btn" onClick={() => navigate('/menu')}>나가기</span>
            </div>
            <div className="login-card" style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
                <div className="login-header"><h2> {username}님의 연구소</h2></div>
                <div className="tank-form">
                    <input className="form-input" placeholder="수조 별명" 
                           onChange={e => setForm({...form, name: e.target.value})} />
                    <div style={{ display: 'flex', gap: '10px', margin: '10px 0' }}>
                        {['w', 'd', 'h'].map(k => (
                            <input key={k} className="form-input" type="number" 
                                   placeholder={k==='w'?'가로':k==='d'?'세로':'높이'} 
                                   onChange={e => setForm({...form, [k]: e.target.value})} />
                        ))}
                    </div>
                </div>
                <button className="btn-primary" onClick={handleSaveAndMatch}> 저장 및 매칭 시작</button>
                {liter > 0 && (
                    <div className="result-section" style={{ marginTop: '30px' }}>
                        <h3 style={{ borderBottom: '2px solid #006064' }}> {liter}L 적합 어종</h3>
                        <div className="fish-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                            {matchingFish.map(fish => (
                                <div key={fish.id} className="mini-card" style={{ padding: '15px', background: '#f8f9fa', borderRadius: '10px', borderLeft: '5px solid #006064' }}>
                                    <b>{fish.name}</b><br/><small>권장 수조: {fish.minTankSize}cm</small>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="history-section" style={{ marginTop: '50px', textAlign: 'left' }}>
                    <h3 style={{ borderBottom: '2px solid #ccc' }}> 나의 연구 기록</h3>
                    {myTanks.map(tank => (
                        <div key={tank.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #eee' }}>
                            <span><strong>{tank.tankName}</strong> ({tank.tankSize})</span>
                            <span style={{ color: '#006064', fontWeight: 'bold' }}>{tank.volumeLiter}L</span>
                        </div>
                    ))}
                </div>
            </div> 
        </div>
    );
};

export default MyPage;