package com.sharefile.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "share_files")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShareFile {

    @Id
    private String id;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private long fileSize;

    @Column(nullable = false, columnDefinition = "LONGBLOB")
    private byte[] fileData;

    @Column(nullable = false)
    private LocalDateTime uploadTime;

    @Column(nullable = false)
    private String shareUrl;

    @Column(nullable = false)
    private LocalDateTime expiryTime;

    @Column
    private String uploader;

    @Column
    private int downloadCount;

    @Column
    private String description;
}
