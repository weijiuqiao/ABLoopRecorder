export type Config = {
  title?: string,
  ytUrlPlaceholder?: string,
  btnR?: string
  btnAutoRecord?: string
  btnS?: string
  btnE?: string
  btnD?: string
  docs?: string
  recordingUnSupported?: string,
  cannotPlayMediaAt?: string,
  error?: string,
  abort?: string,
}

/**
 * key needs to be in lower-case
 */
const config: { [key: string]: Config } = {
  'zh-cn': {
    title: '久违 AB 复读机',
    ytUrlPlaceholder: 'YouTube 视频链接',
    recordingUnSupported: '该浏览器不支持录音功能',
    cannotPlayMediaAt: '无法播放：',
    error: '错误：',
    abort: '退出(A)',
    btnR: '录音(R)',
    btnAutoRecord: '自动录音',
    btnS: '保留片段(S)',
    btnE: '编辑片段(E)',
    btnD: '导出歌词(D)',
    docs: /*html*/`
    ↑: 上一片段 ↓: 下一片段 ⏎: 播放片段 ⌫: 移除片段(长按回收图标清空)。
    <br/>所有信息保存在本地，不会有数据上传。
    <br/>推荐 Chrome 或火狐浏览器。 在 <a href="https://github.com/weijiuqiao/ABLoopRecorder">Github</a> 上查看原代码。
    `
  }
}

export default config;