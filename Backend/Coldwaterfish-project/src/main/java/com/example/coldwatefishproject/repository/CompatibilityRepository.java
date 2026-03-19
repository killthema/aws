package com.example.coldwatefishproject.repository;

import com.example.coldwatefishproject.entity.FishCompatibility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List; // [필수]: 리스트를 사용하기 위해 반드시 필요합니다.

public interface CompatibilityRepository extends JpaRepository<FishCompatibility, Long> {

    /**
     * [작동 순서]:
     * 1. 리액트에서 보낸 두 이름(a, b)을 받습니다.
     * 2. DB에서 (A-B) 또는 (B-A) 조합이 있는지 모두 찾습니다.
     * 3. 결과가 여러 개라도 에러가 나지 않게 List 상자에 담아 반환합니다.
     */
    @Query("SELECT c FROM FishCompatibility c WHERE (c.fishA = :a AND c.fishB = :b) OR (c.fishA = :b AND c.fishB = :a)")
    List<FishCompatibility> findCompatibility(@Param("a") String a, @Param("b") String b);
}