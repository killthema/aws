package com.example.coldwatefishproject.controller;

import com.example.coldwatefishproject.entity.Fish;
import com.example.coldwatefishproject.repository.FishRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * [역할]: 순수하게 DB에 저장된 물고기 데이터를 관리합니다.
 *
 */
@RestController
@RequestMapping("/api/fish-list")

@RequiredArgsConstructor
public class FishController {

    private final FishRepository fishRepository;

    /**
     * [1. 전체 조회]: 도감 메인 화면용
     */
    @GetMapping
    public List<Fish> getAllFish() {
        return fishRepository.findAll();
    }

    /**
     * [2. 이름 검색 기능]: 키워드로 DB 검색
     */

    /**
     * [2. 이름 검색 기능]: 키워드로 DB 검색
     * [작동 순서]:
     * 1. 리액트에서 /api/fish-list/search?keyword=송어 요청을 보냄.
     * 2. @RequestParam이 '송어'를 낚아채서 변수 keyword에 담음.
     * 3. 리포지토리의 바뀐 메서드(findBySpeciesNameContaining)를 호출하여 결과를 반환함.
     */
    @GetMapping("/search")
    public List<Fish> searchFish(@RequestParam("keyword") String keyword) {
        // [수정 포인트]: findByNameContaining -> findBySpeciesNameContaining
        return fishRepository.findBySpeciesNameContaining(keyword);
    }



}