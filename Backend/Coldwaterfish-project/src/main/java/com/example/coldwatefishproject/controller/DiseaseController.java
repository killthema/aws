package com.example.coldwatefishproject.controller;

import com.example.coldwatefishproject.entity.Disease;
import com.example.coldwatefishproject.repository.DiseaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diseases")

@RequiredArgsConstructor
public class DiseaseController {

    private final DiseaseRepository diseaseController;

    /**
     * [작동 순서 1]: 전체 질병 목록 반환
     */
    @GetMapping
    public List<Disease> getAllDiseases() {
        return diseaseController.findAll();
    }

    /**
     * [작동 순서 2]: 증상별 맞춤 검색
     *
     */
    @GetMapping("/search")
    public List<Disease> searchBySymptoms(@RequestParam String keyword) {
        return diseaseController.findBySymptomsContaining(keyword);
    }
}