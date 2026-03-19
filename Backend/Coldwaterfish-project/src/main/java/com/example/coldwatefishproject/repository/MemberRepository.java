package com.example.coldwatefishproject.repository;

import com.example.coldwatefishproject.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    // [작동]: 아이디로 검색 (로그인용)
    Optional<Member> findByUsername(String username);

    // [작동]: 이메일로 검색 (아이디 찾기용)
    Optional<Member> findByEmail(String email);

    // [작동]: 아이디와 이메일로 검색 (비밀번호 찾기용)
    Optional<Member> findByUsernameAndEmail(String username, String email);
}