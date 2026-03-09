# [역할]: 가장 안정적인 자바 21 환경(Eclipse Temurin)으로 변경합니다. [cite: 2026-01-06]
FROM eclipse-temurin:21-jdk-jammy

# [작동 순서 1]: 컨테이너 내부 작업 공간 설정
WORKDIR /app

# [작동 순서 2]: 아까 빌드했던 app.jar 파일을 컨테이너로 복사합니다. [cite: 2026-01-06]
COPY build/libs/app.jar app.jar

# [역할]: 자바 서버가 사용할 8090 포트를 엽니다.
EXPOSE 8090

# [작동 순서 3]: 서버 실행 명령
ENTRYPOINT ["java", "-jar", "app.jar"]