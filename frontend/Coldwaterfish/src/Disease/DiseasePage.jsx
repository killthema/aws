import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { utilApi } from '../api/api'; 
import '../App.css';

const DiseasePage = () => {
    const navigate = useNavigate();
    const [allDiseases, setAllDiseases] = useState([]); 
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // [작동 순서]: api.js의 utilApi를 사용하여 질병 리스트를 불러옵니다.
        utilApi.getDiseases()
            .then(data => {
                setAllDiseases(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(e => {
                console.error("로딩 실패:", e);
                setLoading(false);
            });
    }, []); 

    const filteredDiseases = allDiseases.filter(d => 
        d.name?.includes(searchTerm) || d.symptoms?.includes(searchTerm)
    );

    return (
        <div className="disease-wrapper" style={{ paddingTop: '60px' }}>
            <div className="top-nav-bar">
                <span className="exit-btn" onClick={() => navigate('/menu')}>나가기</span>
            </div>
            <div className="login-card" style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
                <div className="login-header">
                    <h2> 질병 진단 서비스</h2>
                    <input className="form-input" placeholder="증상 검색 (예: 하얀 점)" onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="disease-grid" style={{ marginTop: '20px' }}>
                    {loading ? <p>로딩 중...</p> : filteredDiseases.length > 0 ? (
                        filteredDiseases.map(disease => (
                            <div key={disease.id} className="mini-card" style={{ padding: '15px', marginBottom: '10px', borderLeft: '5px solid red', textAlign: 'left' }}>
                                <h3 style={{color: 'red'}}>{disease.name}</h3>
                                <p><strong>증상:</strong> {disease.symptoms}</p>
                                <p><strong>치료:</strong> {disease.treatment}</p>
                            </div>
                        ))
                    ) : <p>결과가 없습니다.</p>}
                </div>
            </div>
        </div>
    );
};

export default DiseasePage;