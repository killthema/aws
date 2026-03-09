import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fishApi, askToFishAi } from '../api/api'; 
import './SearchPage.css';


/*1. 일반 텍스트 검색을 통해 자바 DB의 물고기 정보를 조회합니다. **/
/*2. 사진을 업로드하면 파이썬 AI가 판독하고, 그 결과를 다시 자바 DB에서 찾아 상세 정보를 출력합니다. **/

const SearchPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dictionary'); //'dictionary'검색
    const [keyword, setKeyword] = useState('');             //검색창에 입력한 텍스트
        
    const [results, setResults] = useState([]);             //화면에 보여줄 검색결과 리스트

    const [preview, setPreview] = useState(null);           //AI판독 전 미리보기 이미지 URL
    const [loading, setLoading] = useState(false);         //서버 통신 중 로딩 상태 표시
    const [selectedFile, setSelectedFile] = useState(null); //유저가 선택한 실제 이미지 파일

    const extensions = ['jpg', 'png', 'jpeg', 'webp']; //유틸리티 이미지 로딩 실패 방어 코드

    /**DB에 저장된 확장자와 실제 파일 확장자가 다를 경우를 대비해서 순차적으로 재시도 합니다. */
    /** .JPG로 시도 -> 실패시 .png -> 모두가 실패하면 기본 이미지 출력 */
        
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
            e.target.src = '/images/fish/default_fish.jpg';  //최종 실패시 기본 이미지//
        }
    };
/* 이름으로 검색하기 **/
/*1.자바 서버(DB)에서 물고기 상세 정보 조회 + 파이썬 서버(AI)에서 사육 조언 조회를 동시에 시작합니다. **/
/** 2. 두 서버의 응답이 모두 오면(Promise.allSettled) 데이터를 하나로 합칩니다. **/
/* 3.결과가 있으면 화면에 카드 형태로 뿌려줍니다 **/

    const onSearch = async () => {
        if (loading) return;
        if (!keyword) return alert("물고기 이름을 입력하세요!");
        setLoading(true);
        setResults([]);
        try {
            // 두 개의 서로 다른 서버(java, Python)에 무전을 동시에 보냅니다.
            const [javaRes, pythonRes] = await Promise.allSettled([
                fishApi.searchFish(keyword),
                askToFishAi(keyword) 
            ]);

            let dbFacts = (javaRes.status === 'fulfilled' && javaRes.value?.length > 0) ? javaRes.value : [];
            let aiInfo = (pythonRes.status === 'fulfilled') ? pythonRes.value : { answer: "" };

            if (dbFacts.length > 0) {
                //두 서버의 데이터를 융합(Merge)하여 저장합니다.
                const mappedResults = dbFacts.map(fact => ({
                    ...fact,
                    searchKeyword: keyword,
                    aiAdvice: aiInfo.answer
                }));
                setResults(mappedResults);
            } else {
                alert("등록되지 않은 어종입니다.");
            }
        } catch (e) {
            console.error("통합 검색 오류:", e);
        } finally {
            setLoading(false);
        }
    };
        //AI 기능 판독하기 (aiAI Analysis)

        //1.유저 유저가 올린 파일을 파이썬 AI 서버(/predict)로 전송합니다.
        //2.AI가 "이것은 연어입니다(확률 98%)"라고 답을 줍니다.
        //3. AI가 준 이름(연어)을 가지고 다시 자바 DB를 뒤져서 상세 사육 정보를 가져옵니다.

    const onAiAnalyze = async () => {
        if (!selectedFile) return alert("사진을 선택해 주세요!");
        setLoading(true);
        setResults([]);
        try {
            //파이썬 서버에 AI서버 이미지 판독 요청 
            const aiResponse = await fishApi.predictFish(selectedFile); 
            const fishName = aiResponse.name || "알 수 없음";
            //신뢰도가 너무 낮으면(50% 미만 ) 결과를 보여주지 않고 재촬영을 권고 합니다.
            if (parseFloat(aiResponse.confidence) < 50.0) {
                setResults([{ speciesName: "판독 불가", description: "더 선명하게 찍어주세요.", aiConfidence: aiResponse.confidence }]);
                return;
            }
            // 판독된 이름을 키워드로 자바 서버에서 상세 데이터 로드
            const dbData = await fishApi.searchFish(fishName);
            const dbFact = (dbData && dbData.length > 0) ? dbData[0] : null;
            setResults([{ ...(dbFact || {}), searchKeyword: fishName, aiConfidence: aiResponse.confidence }]);
        } catch (e) {
            console.error("AI 판독 오류:", e);
        } finally {
            setLoading(false);
        }
    };

    const ResultCard = ({ data }) => {
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
                                {data.aiAdvice && <p style={{ marginTop: '10px', color: '#006064' }}><strong> AI 조언:</strong> {data.aiAdvice}</p>}
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