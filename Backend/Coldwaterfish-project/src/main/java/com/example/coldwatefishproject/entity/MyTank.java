package com.example.coldwatefishproject.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

/**
 * [역할]: 'my_tanks' 테이블과 연결된 자바 객체입니다.
 */
@Entity
@Getter @Setter
@Table(name = "my_tanks")
public class MyTank {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tank_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "member_id")
    private Member member;

    @Column(name = "tank_name")
    private String tankName;

    @ManyToOne
    @JoinColumn(name = "species_id")
    private Fish fish;

    @Column(name = "tank_size")
    private String tankSize;

    @Column(name = "volume_liter")
    private Integer volumeLiter;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}