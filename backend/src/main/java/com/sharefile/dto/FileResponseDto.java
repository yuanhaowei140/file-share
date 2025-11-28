package com.sharefile.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileResponseDto {
    private String id;
    private String fileName;
    private long fileSize;
    private LocalDateTime uploadTime;
    private String shareUrl;
    private LocalDateTime expiryTime;
    private int downloadCount;
    private String description;
}
