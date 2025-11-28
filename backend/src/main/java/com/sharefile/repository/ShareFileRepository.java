package com.sharefile.repository;

import com.sharefile.entity.ShareFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShareFileRepository extends JpaRepository<ShareFile, String> {
    Optional<ShareFile> findById(String id);
    List<ShareFile> findByExpiryTimeAfter(LocalDateTime now);
    List<ShareFile> findByExpiryTimeBefore(LocalDateTime now);
}
