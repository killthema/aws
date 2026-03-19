package com.example.coldwatefishproject.repository;

import com.example.coldwatefishproject.entity.Disease;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DiseaseRepository extends JpaRepository<Disease, Long> {

    /**
     * [역할]: 증상(symptoms) 컬럼에 특정 단어가 포함된 모든 질병을 찾습니다.
     * [SQL 예시]: SELECT * FROM fish_disease WHERE symptoms LIKE '%키워드%';
     */
    List<Disease> findBySymptomsContaining(String keyword);
}