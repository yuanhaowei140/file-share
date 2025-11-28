package com.sharefile.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * P2P 信令接口已移除。保留一个占位控制器以避免旧路由产生 404 之外的错误。
 */
@RestController
@RequestMapping("/api/direct")
public class DirectTransferController {

    @RequestMapping("/**")
    public ResponseEntity<String> removed() {
        return ResponseEntity.status(410).body("P2P direct transfer endpoints have been removed") ;
    }
}
