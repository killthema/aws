package com.example.coldwatefishproject.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter @Setter
@Table(name = "member_account")
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "login_id", unique = true)
    private String username;  // [아이디]: 리액트에서 보내는 username을 받음

    @Column(name = "password")
    private String password;

    @Column(name = "username")
    private String nickname;  // [이름]: DB의 username 컬럼

    @Column(name = "email")
    private String email;

    @Column(name = "role")
    private String role;
}