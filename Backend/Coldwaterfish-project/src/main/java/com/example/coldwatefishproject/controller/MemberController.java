package com.example.coldwatefishproject.controller;

import com.example.coldwatefishproject.entity.Member;
import com.example.coldwatefishproject.repository.MemberRepository;
import com.example.coldwatefishproject.service.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor

public class MemberController {

    private final MemberRepository memberRepository;
    private final MailService mailService;

    // 1. 로그인
    @PostMapping("/login")
    public String login(@RequestBody Member member) {
        // [작동 순서]: 1. 아이디로 DB 조회 -> 2. 비번 대조 -> 3. 결과 반환 
        Member foundMember = memberRepository.findByUsername(member.getUsername()).orElse(null);

        if (foundMember == null) return "로그인 실패: 아이디가 존재하지 않습니다.";
        if (!foundMember.getPassword().equals(member.getPassword())) return "로그인 실패: 비밀번호가 틀렸습니다.";

        return "로그인 성공! " + foundMember.getNickname() + "님 어서오세요";
    }

    // 2. 비밀번호 찾기
    @PostMapping("/find-pw")
    public String findPw(@RequestBody Member member) {
        Member foundMember = memberRepository.findByUsernameAndEmail(member.getUsername(), member.getEmail())
                .orElse(null);

        if (foundMember == null) return "정보가 일치하지 않습니다.";

        mailService.sendEmail(foundMember.getEmail(), "[ColdwaterFish] 비밀번호 안내",
                foundMember.getNickname() + "님! 비번은 [" + foundMember.getPassword() + "] 입니다.");
        return "메일로 비밀번호를 발송했습니다.";
    }

    // 3. 아이디 찾기
    @PostMapping("/find-id")
    public String findId(@RequestBody Member member) {
        Member foundMember = memberRepository.findByEmail(member.getEmail()).orElse(null);
        if (foundMember == null) return "일치하는 정보가 없습니다.";

        mailService.sendEmail(foundMember.getEmail(), "[ColdwaterFish] 아이디 안내",
                "아이디는 [" + foundMember.getUsername() + "] 입니다.");
        return "메일로 아이디를 발송했습니다.";
    }
    // 4. 회원가입 (신규 회원 전용 대문)
    @PostMapping("/join")
    public String join(@RequestBody Member member) {
        /**
         * [역할]: 새로운 탐험가를 DB(member_account 테이블)에 정식 등록합니다.
         * [작동 순서]:
         * 1. 중복 체크: 이미 쓰고 있는 아이디인지 확인합니다.
         * 2. 권한 부여: 신규 유저에게 "USER"라는 이름표를 달아줍니다.
         * 3. 영구 저장: Repository를 통해 DB에 정보를 저장합니다.
         */

        // 1. 아이디 중복 확인 (이미 있으면 가입 불가)
        if (memberRepository.findByUsername(member.getUsername()).isPresent()) {
            return "회원가입 실패: 이미 사용 중인 아이디입니다.";
        }

        // 2. 기본 권한 설정 (기본값 USER)
        if (member.getRole() == null) {
            member.setRole("USER");
        }

        // 3. DB에 회원 정보 저장
        memberRepository.save(member);

        return "회원가입 성공! " + member.getNickname() + "님, 이제 자신만의 수조 연구소를 시작해보세요!";
    }



}