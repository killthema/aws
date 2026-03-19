package com.example.coldwatefishproject.controller;

import com.example.coldwatefishproject.entity.Fish;
import com.example.coldwatefishproject.entity.Member;
import com.example.coldwatefishproject.entity.MyTank;
import com.example.coldwatefishproject.repository.FishRepository;
import com.example.coldwatefishproject.repository.MemberRepository;
import com.example.coldwatefishproject.repository.MyTankRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * [통합 역할]: 로그인한 회원을 위한 도감 조회, 수조 저장, 물고기 매칭 기능을 전담합니다.
 * [기존 ColdWaterController의 기능을 흡수 완료!]
 */
@RestController
@RequestMapping("/api/tanks") // 모든 주소는 /api/tanks로 통일됩니다.
@RequiredArgsConstructor

public class MyTankController {

    private final MyTankRepository myTankRepository;
    private final MemberRepository memberRepository;
    private final FishRepository fishRepository;

    // ==========================================================
    // 1. [도감 기능] 전체 물고기 목록 조회
    // [작동 순서]: GET "/api/tanks/fish-list" 호출 -> DB 전체 조회 -> 결과 반환
    // [메모리]: 반환된 List<Fish>는 전송 완료 후 GC에 의해 정리됩니다.
    // ==========================================================
    @GetMapping("/fish-list")
    public List<Fish> getAllFish() {
        return fishRepository.findAll();
    }

    // ==========================================================
    // 2. [도감 기능] 이름으로 물고기 검색
    // [작동 순서]: 사용자가 입력한 keyword를 받아 DB의 species_name 컬럼에서 부분 일치 검색 수행
    // ==========================================================
    @GetMapping("/fish-search")
    public List<Fish> searchFish(@RequestParam String keyword) {
        // [코드 역할]: 도감 검색창에 입력한 단어가 포함된 모든 물고기를 찾아줍니다.
        return fishRepository.findBySpeciesNameContaining(keyword);
    }

    // ==========================================================
    // 3. [개인화 기능] 수조 저장 및 즉시 매칭 결과 반환
    // [작동 순서]:
    //   1. 전달받은 memberId로 회원 존재 확인
    //   2. 신규 MyTank 객체 생성 및 값 세팅
    //   3. DB 저장(save)
    //   4. 입력된 크기를 기준으로 추천 물고기 조회 후 반환
    // ==========================================================
    @PostMapping("/save-and-match")
    public List<Fish> saveAndMatch(@RequestBody TankRequestDto request) {
        // [역할]: 잘못된 회원 ID가 들어올 경우 에러를 발생시켜 안전하게 보호합니다.
        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다!"));

        MyTank myTank = new MyTank();
        myTank.setMember(member);
        myTank.setTankName(request.getTankName());
        myTank.setTankSize(request.getTankSize());
        myTank.setVolumeLiter(request.getVolumeLiter()); // 매칭 기준 값

        // [메모리]: 영속성 컨텍스트에 저장되었다가 트랜잭션 종료 시 DB에 반영됩니다.
        myTankRepository.save(myTank);

        return fishRepository.findByMinTankSizeLessThanEqual(request.getVolumeLiter());
    }

    // ==========================================================
    // 4. [개인화 기능] 내가 저장한 수조 목록 불러오기
    // [작동 순서]: 회원 고유 번호(memberId)를 경로변수로 받아 해당 유저의 수조만 필터링 조회
    // ==========================================================
    @GetMapping("/user/{memberId}")
    public List<MyTank> getMyTanks(@PathVariable Long memberId) {
        return myTankRepository.findByMemberId(memberId);
    }

    // ==========================================================
    // 5. [개인화 기능] 특정 수조 기록 삭제
    // [작동 순서]: 수조의 PK(id)를 받아 DB에서 해당 행(Row)을 삭제
    // ==========================================================
    @DeleteMapping("/{id}")
    public void deleteTank(@PathVariable("id") Long id) {
        myTankRepository.deleteById(id);
        System.out.println("🗑️ 회원의 수조 기록 삭제 완료: ID = " + id);
    }

    /**
     * [데이터 전송 객체]: 리액트에서 보낸 JSON 데이터를 자바 객체로 담는 가방 역할을 합니다.
     * [메모리]: 요청 시 생성되어 메서드 종료 후 소멸하는 짧은 생명주기를 가집니다.
     */
    @Data
    public static class TankRequestDto {
        private Long memberId;      // 누구의 수조인가?
        private String tankName;    // 수조 별명
        private String tankSize;    // 규격 (예: 2자 광폭)
        private Integer volumeLiter; // 매칭용 수치 (가로길이 등)
    }
}