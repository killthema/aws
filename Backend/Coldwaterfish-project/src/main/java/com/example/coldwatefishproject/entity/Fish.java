package com.example.coldwatefishproject.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter @Setter
@Table(name = "fish_species")
public class Fish {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "species_id")
    private Long id;

    /**
     * [코드의 역할]: DB의 'species_name' 컬럼과 연결합니다.
     * [작동 순서]:
     * 1. @JsonProperty("name") 덕분에 자바에서는 speciesName이라고 쓰지만,
     * 2. 리액트로 데이터를 보낼 때는 "name": "물고기이름" 형태로 변환되어 나갑니다.
     * 3. 따라서 리액트에서 기존처럼 fish.name으로 쓸 수 있습니다!
     */
    @Column(name = "species_name", nullable = false)
    @JsonProperty("name")
    private String speciesName;

    @Column(name = "group_type")
    private String groupType;

    @Column(name = "min_count")
    private Integer minCount;

    @Column(name = "habitat")
    private String habitat;

    @Column(name = "temp_min")
    private Double tempMin;

    @Column(name = "temp_max")
    private Double tempMax;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "min_tank_size")
    private Integer minTankSize;

    /**
     * [보너스 기능]: 수온 범위를 "10.5 ~ 20.0" 형태의 문자열로 합쳐서 리액트에 보냅니다.
     */
    public String getTempRange() {
        return tempMin + " ~ " + tempMax + "°C";
    }
}