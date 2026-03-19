import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shopApi } from '../api/api';
import './Shop.css';

/**
 * [파일의 역할]: AI 추천 엔진과 제품 이미지가 결합된 지능형 스토어 페이지
 * [작동 순서]: 제품 클릭 -> 파이썬 AI에게 추천 어종 요청 -> 팝업으로 결과 출력
 */
const Shop = () => {
  const navigate = useNavigate();
  const [recommendResults, setRecommendResults] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // [데이터]: public/images 폴더에 저장된 사진 경로를 매칭합니다.
  const products = [
    { 
      id: 1, 
      name: "프리미엄 해수염 20kg", 
      price: "45,000원", 
      category: "소모품", 
      img:  "/images/fish/salt.jpg",
      desc: "바다의 미네랄을 그대로 담은 고순도 해수염" 
    },
    { 
      id: 2, 
      name: "냉각기", 
      price: "450,000원", 
      category: "장비", 
      img: "/images/fish/chiller.jpg",
      desc: "냉수어의 생존을 결정짓는 정밀 수온 제어" 
    },
    { 
      id: 3, 
      name: "고성능 외부 여과기", 
      price: "125,000원", 
      category: "장비", 
      img: "/images/fish/filter.jpg",
      desc: "강력한 여과력으로 계곡 같은 수질 유지" 
    }
  ];

  const handlePurchase = async (itemName) => {
    try {
      const data = await shopApi.getAiRecommend(itemName);
      setRecommendResults(data);
      setShowModal(true);
    } catch (error) {
      console.error("AI 연결 에러:", error);
      alert("AI 추천 엔진 연결에 실패했습니다.");
    }
  };

  return (
    <div className="shop-container">
      <header className="shop-header">
        <button className="back-btn" onClick={() => navigate('/menu')}>← 나가기</button>
        <h1> 해수어 샵</h1>
      </header>

      <div className="product-grid">
        {products.map(p => (
          <div key={p.id} className="product-card">
            {/* [추가]: 제품 이미지 영역 */}
            <div className="product-img-wrapper">
              <img src={p.img} alt={p.name} className="product-img" />
            </div>
            
            <div className="category-tag">{p.category}</div>
            <h3>{p.name}</h3>
            <p className="product-desc">{p.desc}</p>
            
            <div className="card-footer">
              <span className="price">{p.price}</span>
              <button className="buy-btn" onClick={() => handlePurchase(p.name)}>구매 및 가이드 보기</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && recommendResults && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ai-modal" onClick={e => e.stopPropagation()}>
            <div className="ai-header">
              <h2> AI 스마트 가이드</h2>
              <p className="modal-title">{recommendResults.title}</p>
            </div>
            <div className="fish-list">
              {recommendResults.fish_list.map((fish, i) => (
                <div key={i} className="fish-item">
                  <span className="fish-name">[{fish.name}]</span>
                  <span className="fish-reason">{fish.reason}</span>
                </div>
              ))}
            </div>
            <button className="close-btn" onClick={() => setShowModal(false)}>확인</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;