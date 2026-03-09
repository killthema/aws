package com.example.coldwatefishproject.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    @Value("${cloud.aws.region.static}")
    private String region;

    /**
     * [작동 순서]:
     * 1. 파일이 겹치지 않게 '랜덤ID_파일명'으로 새 이름을 짓습니다.
     * 2. S3 창고에 넣을 박스(PutObjectRequest)를 준비합니다.
     * 3. 실제 사진 데이터를 S3로 전송합니다.
     * 4. 업로드된 사진의 인터넷 주소(URL)를 문자열로 만들어 반환합니다.
     */
    public String uploadFile(MultipartFile file) throws IOException {
        // [역할]: 전 세계에서 하나뿐인 이름(UUID)을 붙여 파일 덮어쓰기를 방지합니다.
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(fileName)
                .contentType(file.getContentType())
                .build();

        // [작동]: S3Client를 이용해 실제로 파일을 전송합니다.
        s3Client.putObject(putObjectRequest,
                RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        // [역할]: 버지니아 리전(us-east-1) 전용 URL 형식을 만들어 리액트로 보내줍니다.
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucket, region, fileName);
    }
}