package com.example.coldwatefishproject.repository;

import com.example.coldwatefishproject.entity.Fish;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

/**
 * [코드의 역할]:
 * 이 인터페이스는 MariaDB의 'fish_species' 테이블에 접근하는 '마법 지팡이'입니다.
 * SQL을 직접 짜지 않아도 메서드 이름만으로 데이터를 조회할 수 있게 해줍니다.
 */
public interface FishRepository extends JpaRepository<Fish, Long> {

    // ############################################################
    // [1] 키워드 검색용 (도감 검색창에서 사용)
    // [작동 순서]: 사용자가 '송어'라고 치면 -> SQL의 'WHERE species_name LIKE %송어%'가 실행됩니다.
    // [역할]: 이름의 일부만 알아도 관련 물고기를 모두 리스트로 가져옵니다.
    // ############################################################
    List<Fish> findBySpeciesNameContaining(String keyword);

    // ############################################################
    // [2] 수조 크기 필터링 (추천 기능에서 사용)
    // [작동 순서]: 사용자의 수조 사이즈(size)보다 '작거나 같은(LessThanEqual)' 물고기를 모두 찾습니다.
    // [역할]: "60cm 수조" 입력 시, 60cm 이하에서 살 수 있는 모든 어종을 한꺼번에 가져옵니다.
    // ############################################################
    List<Fish> findByMinTankSizeLessThanEqual(Integer size);

    // ############################################################
    // [3] AI 판독용 (정확한 1:1 매칭 - 현재 에러 해결 포인트!)
    // [작동 순서]: AI가 전달한 정확한 이름과 DB의 'species_name' 컬럼이 일치하는 데이터를 찾습니다.
    // [역할]: AiController에서 호출하는 바로 그 메서드입니다. Optional을 사용하여 결과가 없을 때의 예외 처리를 돕습니다.
    // ############################################################
    Optional<Fish> findBySpeciesName(String speciesName);

}