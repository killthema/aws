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
@RequiredArgsConstructor //  S3Config에서 만든 S3Client를 자동으로 가져옵니다(생성자 주입).
public class S3Service {

    private final S3Client s3Client;

    @Value("${cloud.aws.s3.bucket}") //  application.properties에 적은 창고 이름을 가져옵니다.
    private String bucketName;

    /**
     * [기능] 이미지를 S3에 업로드하고, 저장된 URL 주소를 반환합니다.
     */
    public String uploadFile(MultipartFile file) throws IOException {
        // 1. 파일 이름 중복 방지를 위해 랜덤한 이름을 생성합니다 (예: UUID_물고기.jpg).
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        // 2. S3에 "이 창고의 이 이름으로 파일을 넣겠다"는 요청서를 작성합니다.
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(file.getContentType()) // 파일 형식(image/jpeg 등)을 지정합니다.
                .build();

        // 3. 실제로 S3 창고에 파일을 전송합니다.
        s3Client.putObject(putObjectRequest,
                RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        // 4. 업로드된 파일의 공개 주소(URL)를 만들어서 반환합니다.
        // 포트폴리오용이므로 누구나 이 주소로 사진을 볼 수 있게 됩니다.
        return String.format("https://%s.s3.ap-northeast-2.amazonaws.com/%s", bucketName, fileName);
    }
}