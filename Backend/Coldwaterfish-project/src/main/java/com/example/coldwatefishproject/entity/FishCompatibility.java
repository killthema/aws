package com.example.coldwatefishproject.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter @Setter
@Table(name = "fish_compatibility")
public class FishCompatibility {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "fish_a") // DB의 fish_a 컬럼과 연결
    private String fishA;

    @Column(name = "fish_b") // DB의 fish_b 컬럼과 연결
    private String fishB;

    private String status;   // 궁합 상태 (가능, 주의, 불가능 등)
    private String reason;   // 상세 이유
}