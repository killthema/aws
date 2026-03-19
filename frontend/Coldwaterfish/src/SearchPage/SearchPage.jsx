/**
 * ============================================================================
 * [파일의 역할]: 사용자가 물고기 이름을 검색하거나 사진을 올려 AI 판독을 받을 수 있는 도감 페이지입니다.
 * * [작동 순서 (이름 검색)]:
 * 1. 사용자가 검색어 입력 후 '검색' 버튼 클릭 -> onSearch 함수 실행
 * 2. api.js의 fishApi.searchFish(keyword) 호출 -> AWS 자바 서버(8090)로 데이터 요청
 * 3. 자바 서버가 DB에서 찾은 결과를 반환 -> setResults에 저장 -> 화면(ResultCard)에 출력
 * * [작동 순서 (AI 사진 검색)]:
 * 1. 사용자가 사진 선택 후 'AI 분석 시작' 클릭 -> onAiAnalyze 함수 실행
 * 2. api.js의 fishApi.predictFish(file) 호출 -> AWS 파이썬 서버(5000)로 사진 전송 및 판독
 * 3. 파이썬 서버가 물고기 이름(예: 연어) 반환 -> 해당 이름으로 다시 자바 서버(8090)에 상세 정보 요청
 * 4. 최종 통합된 데이터 화면(ResultCard)에 출력
 * ============================================================================
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fishApi } from '../api/api'; 
import './SearchPage.css';

const SearchPage = () => {
    const navigate = useNavigate();
    // 탭 상태 관리 ('dictionary': 텍스트 검색 모드, 'ai': 사진 검색 모드)
    const [activeTab, setActiveTab] = useState('dictionary'); 
    
    // 사용자가 검색창에 입력한 키워드를 저장하는 상태
    const [keyword, setKeyword] = useState(''); 
    // 서버로부터 받아온 최종 검색 결과를 배열 형태로 저장하는 상태
    const [results, setResults] = useState([]); 

    // AI 사진 판독 시 화면에 보여줄 임시 미리보기 이미지 주소
    const [preview, setPreview] = useState(null); 
    // 서버와 통신 중일 때 버튼을 비활성화하고 '로딩 중' 글씨를 띄우기 위한 상태
    const [loading, setLoading] = useState(false); 
    // 사용자가 PC/모바일에서 선택한 실제 이미지 파일 데이터
    const [selectedFile, setSelectedFile] = useState(null); 

    // 이미지 로딩 실패 시 순차적으로 시도할 확장자 목록
    const extensions = ['jpg', 'png', 'jpeg', 'webp']; 

    /**
     * [함수 역할]: 이미지 엑스박스(깨짐) 방지용 백업 함수
     * [작동 원리]: .jpg가 없으면 .png 시도 -> 다 실패하면 default_fish.jpg 출력
     */
    const handleImageError = (e) => {
        if (e.target.dataset.dead === 'true') return;
        const attempt = parseInt(e.target.dataset.attempt || '0');
        if (attempt < extensions.length) {
            const nextExt = extensions[attempt];
            const fishName = e.target.alt;
            e.target.src = `/images/fish/${fishName}.${nextExt}`;
            e.target.dataset.attempt = attempt + 1;
        } else {
            e.target.dataset.dead = 'true';
            e.target.onerror = null;
            e.target.src = '/images/fish/default_fish.jpg'; 
        }
    };

    /**
     * [함수 역할]: 일반 텍스트 검색을 실행합니다.
     */
    const onSearch = async () => {
        if (loading) return; // 이미 검색 중이면 중복 클릭 방지
        if (!keyword) return alert("물고기 이름을 입력하세요!"); // 빈칸 검사

        setLoading(true);
        setResults([]); // 기존 검색 결과 초기화

        try {
            // 자바 DB(8090) 통신
            const dbFacts = await fishApi.searchFish(keyword);

            if (dbFacts && dbFacts.length > 0) {
                // 데이터가 존재하면 결과창에 띄우기 위해 양식을 맞춥니다.
                const mappedResults = dbFacts.map(fact => ({
                    ...fact,
                    searchKeyword: keyword
                }));
                setResults(mappedResults);
            } else {
                alert("등록되지 않은 어종입니다.");
            }
        } catch (e) {
            console.error("통합 검색 오류:", e);
            alert("서버 통신에 실패했습니다. (자바 8090 포트 확인)");
        } finally {
            setLoading(false); // 로딩 상태 해제
        }
    };

    /**
     * [함수 역할]: 사진을 파이썬 AI로 보내고, 결과를 바탕으로 DB를 조회합니다.
     */
    const onAiAnalyze = async () => {
        if (!selectedFile) return alert("사진을 선택해 주세요!");
        setLoading(true);
        setResults([]);

        try {
            // 1. 파이썬 서버(5000)로 사진을 전송하여 이름을 받아옵니다.
            const aiResponse = await fishApi.predictFish(selectedFile); 
            const fishName = aiResponse.name || "알 수 없음";

            // 2. 일치율이 50% 미만이면 가짜 결과로 판단하고 방어합니다.
            if (parseFloat(aiResponse.confidence) < 50.0) {
                setResults([{ 
                    speciesName: "판독 불가", 
                    description: "더 선명하게 찍어주세요.", 
                    aiConfidence: aiResponse.confidence 
                }]);
                return;
            }

            // 3. 파이썬이 알려준 이름(fishName)으로 자바 서버(8090)에서 상세 정보를 가져옵니다.
            const dbData = await fishApi.searchFish(fishName);
            const dbFact = (dbData && dbData.length > 0) ? dbData[0] : null;
            
            // 4. 최종 데이터를 합쳐서 화면에 출력합니다.
            setResults([{ 
                ...(dbFact || {}), 
                searchKeyword: fishName, 
                aiConfidence: aiResponse.confidence 
            }]);

        } catch (e) {
            console.error("AI 판독 오류:", e);
            alert("AI 서버 통신에 실패했습니다. (파이썬 5000 포트 확인)");
        } finally {
            setLoading(false);
        }
    };

    /**
     * [컴포넌트 역할]: 검색 결과를 화면에 예쁜 카드 형태로 그려주는 부품입니다.
     */
    const ResultCard = ({ data }) => {
        // 서버마다 데이터 변수명이 다를 수 있어 OR(||) 연산자로 안전하게 가져옵니다.
        const displayName = data.speciesName || data.species_name || data.name || data.searchKeyword;
        const displayDesc = data.description || data.detail || data.info || "상세 정보 없음";
        const displayTank = data.minTankSize || data.min_tank_size || "알 수 없음";
        const displayTempMin = data.tempMin || data.temp_min || "?";
        const displayTempMax = data.tempMax || data.temp_max || "?";
        const displayHabitat = data.habitat || "알 수 없음";
        const imgSrc = data.imageUrl || preview || `/images/fish/${displayName}.jpg`;

        return (
            <div className={`result-card-clean slide-up ${displayName === "판독 불가" ? 'warning-mode' : ''}`} style={{ marginBottom: '20px' }}>
                <div className="fish-image-frame" style={{ textAlign: 'center' }}>
                    <img src={imgSrc} alt={displayName} className="fish-result-img"
                        data-attempt="0" onError={handleImageError} 
                        style={{ width: '100%', maxWidth: '350px', borderRadius: '15px' }} />
                </div>
                <div className="clean-content" style={{ padding: '20px' }}>
                    <h3 className="clean-title" style={{ fontSize: '26px', color: '#2c3e50' }}>
                        {displayName} {data.aiConfidence && <span className="conf-badge">AI 일치율: {data.aiConfidence}</span>}
                    </h3>
                    {displayName !== "판독 불가" && (
                        <div className="fact-box" style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
                            <p><strong> 권장 수조:</strong> {displayTank}L 이상</p>
                            <p><strong> 사육 환경:</strong> {displayHabitat} (수온 {displayTempMin}~{displayTempMax}°C)</p>
                            <div style={{ marginTop: '10px', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                                <strong> 상세 정보:</strong>
                                <p style={{ whiteSpace: 'pre-wrap', marginTop: '5px' }}>{displayDesc}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="search-page-wrapper">
            <div className="search-container-styled">
                <h2 className="page-headline">냉수어 AI 탐험 센터</h2>
                
                {/* 탭 메뉴 */}
                <div className="tab-menu-styled">
                    <button className={activeTab === 'dictionary' ? 'active' : ''} onClick={() => { setActiveTab('dictionary'); setResults([]); }}>이름 검색</button>
                    <button className={activeTab === 'ai' ? 'active' : ''} onClick={() => { setActiveTab('ai'); setResults([]); setPreview(null); setSelectedFile(null); }}>AI 사진 판독</button>
                </div>

                {activeTab === 'dictionary' ? (
                    <div className="search-bar-styled">
                        <input value={keyword} onChange={e => setKeyword(e.target.value)} onKeyPress={e => e.key === 'Enter' && onSearch()} placeholder="물고기 이름 입력" />
                        <button onClick={onSearch} disabled={loading}>{loading ? "검색 중..." : "검색"}</button>
                    </div>
                ) : (
                    <div className="upload-box-wrapper">
                        <div className="upload-box-styled">
                            <input type="file" id="ai-upload" onChange={(e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                setSelectedFile(file);
                                setPreview(URL.createObjectURL(file));
                                setResults([]);
                            }} hidden accept="image/*" />
                            <label htmlFor="ai-upload" className="upload-label">
                                {preview ? <img src={preview} className="preview-img-styled" alt="preview" /> : "여기를 눌러 사진을 선택하세요"}
                            </label>
                        </div>
                        <div className="search-bar-styled" style={{ marginTop: '10px' }}>
                            <button onClick={onAiAnalyze} disabled={loading || !selectedFile} style={{ width: '100%' }}>{loading ? "AI 분석 중..." : "AI 분석 시작"}</button>
                        </div>
                    </div>
                )}

                {/* 검색 결과 출력 영역 */}
                {!loading && results.length > 0 && (
                    <div className="results-list-container">
                        {results.map((res, index) => <ResultCard key={index} data={res} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;