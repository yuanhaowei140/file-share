import { useState, useRef, useEffect } from 'react'
import { Upload, Download, Copy, Share2, Trash2, CheckCircle } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import './App.css'
import { API_BASE_URL, SHARE_HASH_PREFIX } from './config'

// 为 URL 添加时间戳参数以防止浏览器缓存
const withTimestamp = (url: string): string => {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}_t=${Date.now()}`
}

function FileDownloadPage({ fileId }: { fileId: string }) {
  const [file, setFile] = useState<FileItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await fetch(withTimestamp(`${API_BASE_URL}/files/${fileId}/info`))
        if (!res.ok) {
          setError('未找到文件或已过期')
          setLoading(false)
          return
        }
        const data = await res.json()
        setFile(data)
      } catch (e) {
        setError('获取文件信息失败')
      } finally {
        setLoading(false)
      }
    }
    fetchInfo()
  }, [fileId])

  const handleDownload = () => {
    if (!file) return
    const downloadUrl = `${API_BASE_URL}/files/${file.id}/download`
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = file.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const buildFullShare = () => {
    // 获取不包含 hash 和 query 的根 URL
    const url = new URL(window.location.href)
    const base = `${url.protocol}//${url.host}${url.pathname.split('#')[0]}`
    return `${base}#${SHARE_HASH_PREFIX}/${fileId}&_t=${Date.now()}`
  }

  const handleCopyLink = async () => {
    try {
      const text = buildFullShare()
      // 先尝试使用 Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        // 备用方案：使用传统的复制方法
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
      alert('复制失败，请重试')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatTime = (dateString: string): string => new Date(dateString).toLocaleString('zh-CN')

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div style={{ fontSize: '16px', color: '#666' }}>正在加载文件信息…</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <div style={{ fontSize: '18px', color: '#d32f2f', marginBottom: '8px' }}>{error}</div>
          <div style={{ fontSize: '14px', color: '#999' }}>可能文件已过期或不存在</div>
        </div>
      </div>
    )
  }

  if (!file) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <div style={{ fontSize: '16px', color: '#666' }}>未找到文件</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        width: '100%',
        padding: 'max(20px, 5vw)',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* 文件图标 */}
        <div style={{ textAlign: 'center', marginBottom: 'max(20px, 4vw)' }}>
          <div style={{ fontSize: 'clamp(48px, 15vw, 64px)', marginBottom: '12px' }}>📄</div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: 'clamp(20px, 6vw, 28px)', fontWeight: 'bold', color: '#333', wordBreak: 'break-word' }}>
            {file.fileName}
          </h1>
        </div>

        {/* 文件信息卡片 */}
        <div style={{
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          padding: 'clamp(12px, 3vw, 16px)',
          marginBottom: 'max(20px, 4vw)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 'clamp(12px, 3vw, 16px)',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>文件大小</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{formatFileSize(file.fileSize)}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>下载次数</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{file.downloadCount} 次</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>上传时间</div>
            <div style={{ fontSize: '14px', color: '#666' }}>{formatTime(file.uploadTime)}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>过期时间</div>
            <div style={{ fontSize: '14px', color: '#666' }}>{formatTime(file.expiryTime)}</div>
          </div>
        </div>

        {/* 二维码分享部分 */}
        <div style={{ marginBottom: 'max(20px, 4vw)' }}>
          <div style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 'bold', color: '#333', marginBottom: 'clamp(8px, 2vw, 12px)', textAlign: 'center' }}>
            分享二维码
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px', padding: 'clamp(12px, 3vw, 16px)' }}>
            <QRCodeCanvas value={buildFullShare()} size={Math.min(200, Math.max(150, window.innerWidth * 0.35))} level="H" includeMargin={true} />
          </div>
        </div>

        {/* 分享链接 */}
        <div style={{ marginBottom: 'max(20px, 4vw)' }}>
          <div style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 'bold', color: '#333', marginBottom: 'clamp(8px, 2vw, 12px)' }}>分享链接</div>
          <div style={{ display: 'flex', gap: 'clamp(6px, 2vw, 8px)', flexWrap: 'wrap', flexDirection: window.innerWidth < 480 ? 'column' : 'row' }}>
            <input
              type="text"
              value={buildFullShare()}
              readOnly
              style={{
                flex: 1,
                minWidth: window.innerWidth < 480 ? '100%' : '200px',
                padding: 'clamp(8px, 2vw, 12px)',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: 'clamp(11px, 2.5vw, 13px)',
                color: '#666',
                backgroundColor: '#f9f9f9',
                fontFamily: 'monospace',
              }}
            />
            <button
              onClick={handleCopyLink}
              style={{
                padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)',
                backgroundColor: copied ? '#4caf50' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                transition: 'background-color 0.3s',
                whiteSpace: 'nowrap',
                width: window.innerWidth < 480 ? '100%' : 'auto',
              }}
            >
              {copied ? '✓ 已复制' : '复制'}
            </button>
          </div>
        </div>

        {/* 操作按钮 */}
        <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 12px)', flexDirection: window.innerWidth < 480 ? 'column' : 'row' }}>
          <button
            onClick={handleDownload}
            style={{
              padding: 'clamp(12px, 3vw, 16px) clamp(20px, 4vw, 24px)',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: 'clamp(14px, 3vw, 16px)',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              flex: 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#5568d3')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#667eea')}
          >
            📥 下载文件
          </button>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: 'clamp(12px, 3vw, 16px) clamp(20px, 4vw, 24px)',
              backgroundColor: '#f0f0f0',
              color: '#333',
              border: 'none',
              borderRadius: '8px',
              fontSize: 'clamp(12px, 3vw, 14px)',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              flex: 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0e0e0')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
          >
            ← 返回
          </button>
        </div>

        {/* 底部提示 */}
        <div style={{ marginTop: 'max(12px, 2vw)', textAlign: 'center', fontSize: 'clamp(11px, 2vw, 12px)', color: '#999' }}>
          文件将于 {formatTime(file.expiryTime)} 自动过期
        </div>
      </div>
    </div>
  )
}

interface FileItem {
  id: string
  fileName: string
  fileSize: number
  uploadTime: string
  shareUrl: string
  expiryTime: string
  downloadCount: number
  description: string
}

function App() {
  // hash 路由支持：监听 hash 变化以触发组件重新渲染
  const [hash, setHash] = useState<string>(typeof window !== 'undefined' ? window.location.hash : '')

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash)
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // 简单的 hash 路由支持：如果 URL 包含 #/file/{id}，渲染独立的下载页面
  if (hash && hash.startsWith('#' + SHARE_HASH_PREFIX + '/')) {
    let fileId = hash.replace('#' + SHARE_HASH_PREFIX + '/', '')
    // 移除可能存在的查询参数（如 &_t=...）
    fileId = fileId.split('&')[0].split('?')[0]
    return <FileDownloadPage fileId={fileId} />
  }

  const [files, setFiles] = useState<FileItem[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const response = await fetch(withTimestamp(`${API_BASE_URL}/files/list`))
      if (response.ok) {
        const data = await response.json()
        setFiles(data)
      }
    } catch (error) {
      console.error('获取文件列表失败:', error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files
    if (!uploadedFiles) return

    setLoading(true)
    try {
      for (const file of Array.from(uploadedFiles)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('expiryDays', '7')
        formData.append('description', '')

        const response = await fetch(`${API_BASE_URL}/files/upload`, {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const newFile = await response.json()
          setFiles((prev) => [newFile, ...prev])
        } else {
          alert(`上传失败: ${file.name}`)
        }
      }
    } catch (error) {
      console.error('上传文件失败:', error)
      alert('上传文件失败，请检查后端服务是否运行')
    } finally {
      setLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const copyToClipboard = async (text: string, fileId: string) => {
    try {
      // 如果传入的是短 id（既不是 http 也不包含 hash），转换为完整的分享页面链接
      let toCopy = text
      if (toCopy && !toCopy.startsWith('http') && !toCopy.startsWith('#') && !toCopy.includes(SHARE_HASH_PREFIX)) {
        toCopy = buildShareLink(toCopy)
      }
      
      // 先尝试使用 Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(toCopy)
      } else {
        // 备用方案：使用传统的复制方法
        const textArea = document.createElement('textarea')
        textArea.value = toCopy
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      
      setCopied(fileId)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('复制失败:', err)
      alert('复制失败，请重试')
    }
  }

  const downloadFile = (file: FileItem) => {
    const downloadUrl = `${API_BASE_URL}/files/${file.id}/download`
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = file.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 生成展示/复制用的分享链接（优先使用后端给出的 shareUrl；如果是短 id，则拼接为 hash 路径）
  const buildShareLink = (shareUrl: string) => {
    if (!shareUrl) return ''
    let id = shareUrl

    // 如果是完整的 http(s) 链接，尝试解析出后端的 file id（如果是 /api/files/{id}/download）
    if (shareUrl.startsWith('http')) {
      try {
        const u = new URL(shareUrl)
        // 如果路径符合 /api/files/:id/download，提取 id
        const m = u.pathname.match(/\/api\/files\/([^\/]+)\/download/) // 捕获 id
        if (m) {
          id = m[1]
        } else {
          // 其它外部链接，直接返回（保守策略）
          return shareUrl
        }
      } catch (e) {
        // 解析失败则回退到原始值
        return shareUrl
      }
    }

    // 生成 hash 分享页链接，时间戳放在 hash 内（用 & 分隔）
    // 获取不包含 hash 和 query 的根 URL
    const url = new URL(window.location.href)
    const base = `${url.protocol}//${url.host}${url.pathname.split('#')[0]}`
    return `${base}#${SHARE_HASH_PREFIX}/${id}&_t=${Date.now()}`
  }

  const deleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/${fileId}`, { method: 'DELETE' })
      if (response.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId))
        setSelectedFile(null)
      } else alert('删除文件失败')
    } catch (error) {
      console.error('删除文件失败:', error)
      alert('删除文件失败')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatTime = (dateString: string): string => new Date(dateString).toLocaleString('zh-CN')

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Share2 size={32} className="logo-icon" />
          <h1>ShareFile</h1>
        </div>

        <div className="upload-section">
          <label className="upload-label">
            <div className="upload-box">
              <Upload size={48} />
              <span>点击或拖放文件</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={loading}
              className="file-input"
            />
          </label>
        </div>

        <div className="stats">
          <div className="stat-item">
            <span className="stat-number">{files.length}</span>
            <span className="stat-label">文件数量</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{formatFileSize(files.reduce((sum, f) => sum + f.fileSize, 0))}</span>
            <span className="stat-label">总大小</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {selectedFile ? (
          <div className="file-detail">
            <button className="back-button" onClick={() => setSelectedFile(null)}>
              ← 返回列表
            </button>

            <div className="detail-container">
              <div className="qr-section">
                <h2>分享二维码</h2>
                <div className="qr-box" id="qr-code-container">
                  <QRCodeCanvas value={buildShareLink(selectedFile.shareUrl)} size={256} level="H" includeMargin={true} />
                </div>
                <p className="qr-tip">扫描二维码打开下载页面</p>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    const canvas = document.querySelector('#qr-code-container canvas') as HTMLCanvasElement
                    if (canvas) {
                      const link = document.createElement('a')
                      link.href = canvas.toDataURL('image/png')
                      link.download = `${selectedFile.fileName}-qrcode.png`
                      link.click()
                    }
                  }}
                  style={{ marginTop: '12px', fontSize: '12px', padding: '6px 12px', display: 'block', margin: '12px auto 0' }}
                >
                  💾 下载二维码
                </button>
              </div>

              <div className="share-section">
                <h2>分享链接</h2>
                <div className="file-info">
                  <div className="info-item">
                    <span className="info-label">文件名:</span>
                    <span className="info-value">{selectedFile.fileName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">大小:</span>
                    <span className="info-value">{formatFileSize(selectedFile.fileSize)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">上传时间:</span>
                    <span className="info-value">{formatTime(selectedFile.uploadTime)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">过期时间:</span>
                    <span className="info-value">{formatTime(selectedFile.expiryTime)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">下载次数:</span>
                    <span className="info-value">{selectedFile.downloadCount}</span>
                  </div>
                </div>

                <div className="share-link-box">
                  <input type="text" value={buildShareLink(selectedFile.shareUrl)} readOnly className="share-link-input" />
                  <button className={`copy-button ${copied === selectedFile.id ? 'copied' : ''}`} onClick={() => copyToClipboard(selectedFile.shareUrl, selectedFile.id)}>
                    {copied === selectedFile.id ? (
                      <><CheckCircle size={20} /><span>已复制</span></>
                    ) : (
                      <><Copy size={20} /><span>复制链接</span></>
                    )}
                  </button>
                </div>

                <div className="action-buttons">
                  <button className="btn btn-primary" onClick={() => downloadFile(selectedFile)}>
                    <Download size={20} />
                    <span>下载文件</span>
                  </button>
                  <button className="btn btn-danger" onClick={() => deleteFile(selectedFile.id)}>
                    <Trash2 size={20} />
                    <span>删除文件</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="file-list-container">
            <div className="list-header">
              <h2>我的文件 ({files.length})</h2>
            </div>

            {files.length === 0 ? (
              <div className="empty-state">
                <Share2 size={64} />
                <h3>还没有上传任何文件</h3>
                <p>上传文件开始分享吧</p>
              </div>
            ) : (
              <div className="files-grid">
                {files.map((file) => (
                  <div key={file.id} className="file-card" onClick={() => setSelectedFile(file)}>
                    <div className="file-header">
                      <div className="file-icon">📄</div>
                      <button className="delete-btn" onClick={(e) => { e.stopPropagation(); deleteFile(file.id) }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="file-name">{file.fileName}</div>
                    <div className="file-size">{formatFileSize(file.fileSize)}</div>
                    <div className="file-time">{formatTime(file.uploadTime)}</div>
                    <div className="file-actions">
                        <button className="action-btn" onClick={(e) => { e.stopPropagation(); copyToClipboard(file.shareUrl, file.id) }}>
                          {copied === file.id ? <CheckCircle size={16} /> : <Copy size={16} />}
                      </button>
                      <button className="action-btn" onClick={(e) => { e.stopPropagation(); downloadFile(file) }}>
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
