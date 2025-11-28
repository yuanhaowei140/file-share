package com.sharefile.service;

import com.sharefile.dto.FileResponseDto;
import com.sharefile.entity.ShareFile;
import com.sharefile.repository.ShareFileRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
public class FileShareService {

    @Autowired
    private ShareFileRepository shareFileRepository;

    /**
     * 上传文件
     */
    public FileResponseDto uploadFile(MultipartFile file, String description, int expiryDays) throws IOException {
        String fileId = UUID.randomUUID().toString();
        // 将 shareUrl 存为文件的实际 id（UUID），前端以此拼接分享页面 URL
        String shareUrl = fileId;

        ShareFile shareFile = new ShareFile();
        shareFile.setId(fileId);
        shareFile.setFileName(file.getOriginalFilename());
        shareFile.setFileSize(file.getSize());
        shareFile.setFileData(file.getBytes());
        shareFile.setUploadTime(LocalDateTime.now());
        shareFile.setShareUrl(shareUrl);
        shareFile.setExpiryTime(LocalDateTime.now().plusDays(expiryDays));
        shareFile.setDescription(description);
        shareFile.setDownloadCount(0);

        shareFileRepository.save(shareFile);
        log.info("文件已上传: {}", fileId);

        return convertToDto(shareFile);
    }

    /**
     * 获取文件列表
     */
    public List<FileResponseDto> getAllFiles() {
        LocalDateTime now = LocalDateTime.now();
        return shareFileRepository.findByExpiryTimeAfter(now)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * 获取文件详情
     */
    public Optional<FileResponseDto> getFileInfo(String fileId) {
        return shareFileRepository.findById(fileId)
                .filter(f -> f.getExpiryTime().isAfter(LocalDateTime.now()))
                .map(this::convertToDto);
    }

    /**
     * 下载文件
     */
    public Optional<ShareFile> downloadFile(String fileId) {
        Optional<ShareFile> file = shareFileRepository.findById(fileId);
        if (file.isPresent()) {
            ShareFile shareFile = file.get();
            if (shareFile.getExpiryTime().isBefore(LocalDateTime.now())) {
                shareFileRepository.delete(shareFile);
                return Optional.empty();
            }
            shareFile.setDownloadCount(shareFile.getDownloadCount() + 1);
            shareFileRepository.save(shareFile);
            log.info("文件已下载: {}, 下载次数: {}", fileId, shareFile.getDownloadCount());
        }
        return file;
    }

    /**
     * 删除文件
     */
    public boolean deleteFile(String fileId) {
        if (shareFileRepository.existsById(fileId)) {
            shareFileRepository.deleteById(fileId);
            log.info("文件已删除: {}", fileId);
            return true;
        }
        return false;
    }

    /**
     * 清理过期文件
     */
    public void cleanExpiredFiles() {
        List<ShareFile> expiredFiles = shareFileRepository.findByExpiryTimeBefore(LocalDateTime.now());
        shareFileRepository.deleteAll(expiredFiles);
        log.info("已清理 {} 个过期文件", expiredFiles.size());
    }

    /**
     * 转换为 DTO
     */
    private FileResponseDto convertToDto(ShareFile shareFile) {
        return new FileResponseDto(
                shareFile.getId(),
                shareFile.getFileName(),
                shareFile.getFileSize(),
                shareFile.getUploadTime(),
                shareFile.getShareUrl(),
                shareFile.getExpiryTime(),
                shareFile.getDownloadCount(),
                shareFile.getDescription()
        );
    }
}
