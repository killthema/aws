package com.example.coldwatefishproject.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // ==========================================================
    // [1] 리액트 라우팅(주소) 설정: 새로고침 시 404 에러 방지
    // ==========================================================
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // [역할]: 주소에 '.png'나 '.js' 같은 확장자가 없는 모든 요청(/menu, /login 등)을
        // 리액트의 대문인 'index.html'로 돌려보냅니다. (어제 서버를 죽였던 복잡한 패턴을 아주 단순하게 바꿨습니다!)
        registry.addViewController("/{path:[^\\.]*}")
                .setViewName("forward:/index.html");
        registry.addViewController("/**/{path:[^\\.]*}")
                .setViewName("forward:/index.html");
    }

    // ==========================================================
    // [2] CORS 설정: 리액트와 자바 간의 통신 허가
    // ==========================================================
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // 역할: 어디서 접속하든 무조건 프리패스 통과시켜 줍니다!
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}