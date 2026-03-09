package com.example.coldwatefishproject.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 모든 주소에 대해
                .allowedOriginPatterns("*") // [추가]: 어디서 접속하든 무조건 프리패스 허용!
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // 모든 방식 허용
                .allowedHeaders("*"); // 모든 헤더 허용
    }
}