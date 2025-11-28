package com.sharefile.controller;

import com.sharefile.dto.FileResponseDto;
import com.sharefile.entity.ShareFile;
import com.sharefile.service.FileShareService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/files")
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class FileController {

    @Autowired
    private FileShareService fileShareService;

    /**
     * 上传文件
     */
    @PostMapping("/upload")
    public ResponseEntity<FileResponseDto> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false, defaultValue = "") String description,
            @RequestParam(value = "expiryDays", required = false, defaultValue = "7") int expiryDays
    ) {
        try {
            FileResponseDto responseDto = fileShareService.uploadFile(file, description, expiryDays);
            return ResponseEntity.ok(responseDto);
        } catch (IOException e) {
            log.error("文件上传失败", e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * 获取所有文件列表
     */
    @GetMapping("/list")
    public ResponseEntity<List<FileResponseDto>> listFiles() {
        List<FileResponseDto> files = fileShareService.getAllFiles();
        return ResponseEntity.ok(files);
    }

    /**
     * 获取文件详情
     */
    @GetMapping("/{fileId}/info")
    public ResponseEntity<FileResponseDto> getFileInfo(@PathVariable String fileId) {
        Optional<FileResponseDto> file = fileShareService.getFileInfo(fileId);
        return file.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 下载文件
     */
    @GetMapping("/{fileId}/download")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String fileId) {
        Optional<ShareFile> file = fileShareService.downloadFile(fileId);
        if (file.isPresent()) {
            ShareFile shareFile = file.get();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                           "attachment; filename=\"" + shareFile.getFileName() + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE)
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(shareFile.getFileSize()))
                    .body(shareFile.getFileData());
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * 删除文件
     */
    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> deleteFile(@PathVariable String fileId) {
        if (fileShareService.deleteFile(fileId)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * 清理过期文件
     */
    @PostMapping("/cleanup")
    public ResponseEntity<Void> cleanupExpiredFiles() {
        fileShareService.cleanExpiredFiles();
        return ResponseEntity.ok().build();
    }
}
