package com.example.coldwatefishproject.controller;

import com.example.coldwatefishproject.entity.FishCompatibility;
import com.example.coldwatefishproject.repository.CompatibilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap; // [필수]: 데이터가 없을 때 Map을 만들기 위해 필요합니다.
import java.util.List;    // [필수]: 리스트를 처리하기 위해 필요합니다.
import java.util.Map;

@RestController
@RequestMapping("/api/compatibility")

@RequiredArgsConstructor
public class CompatibilityController {

    private final CompatibilityRepository compatibilityRepository;


    @GetMapping
    public ResponseEntity<?> checkCompatibility(@RequestParam String a, @RequestParam String b) {
        // [코드의 역할]: 사용자가 입력한 값의 앞뒤 공백을 강제로 제거하여 검색 성공률을 높입니다.
        // [작동 순서]: " 브라운송어 " -> "브라운송어"로 변환 후 DB 조회
        String trimmedA = a.trim();
        String trimmedB = b.trim();

        List<FishCompatibility> results = compatibilityRepository.findCompatibility(trimmedA, trimmedB);

        if (!results.isEmpty()) {
            return ResponseEntity.ok(results.get(0));
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("status", "정보 없음");
            response.put("reason", "[" + trimmedA + "]와 [" + trimmedB + "]의 합사 정보가 도감에 없습니다.");
            return ResponseEntity.ok(response);
        }
    }
}