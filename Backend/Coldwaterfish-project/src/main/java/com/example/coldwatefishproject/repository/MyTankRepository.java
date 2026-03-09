package com.example.coldwatefishproject.repository;

import com.example.coldwatefishproject.entity.MyTank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * [역할]: DB의 'my_tanks' 테이블에 접근하는 창고지기입니다.
 * [중요]: 반드시 interface여야 하며, JpaRepository를 상속받아야 합니다.
 */
@Repository
public interface MyTankRepository extends JpaRepository<MyTank, Long> {

    // [작동 순서]: 컨트롤러가 memberId를 주면, JPA가 마법처럼 SELECT 쿼리를 날려 목록을 가져옵니다.
    List<MyTank> findByMemberId(Long memberId);
}