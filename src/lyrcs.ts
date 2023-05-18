export type Loop = {
  start: number,
  end: number,
  content: string,
}

export function generateLrc(loops: Loop[], title: string) {
  let contents = [
    `[ti:${title}]`,
    '[by:ABLoopRecorder]'
  ];

  for (let i = 0; i < loops.length; i++) {
    const loop = loops[i];
    const startStr = new Date(loop.start * 1000).toISOString().substr(14, 8);
    const endStr = new Date(loop.end * 1000).toISOString().substr(14, 8);
    contents.push(`[${startStr}]${loop.content}`);
    contents.push(`[${endStr}]`);
  }

  let data = contents.join('\n');
  let filename = `${title}.lrc`;
  let blob = new Blob([data], { type: 'application/octet-stream' });
  let link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(link.href);
}