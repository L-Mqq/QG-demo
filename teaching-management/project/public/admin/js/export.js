//导出成绩
async function exportScores() {
  const classId = document.getElementById('class')?.value || '';
  const subject = document.getElementById('subject')?.value || '';
  const studentId = document.getElementById('studentId')?.value || '';

  const params = new URLSearchParams();
  if (classId) params.append('classId', classId);
  if (subject) params.append('subject', subject);
  if (studentId) params.append('studentId', studentId);

  const url = `/api/scores/export?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: { 'Authorization': localStorage.getItem('token') }
    });

    if (response.status === 404) {
      const result = await response.json();
      alert(result.message);
      return;
    }

    if (!response.ok) {
      alert('导出失败');
      return;
    }

    // 下载文件
    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `scores_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(downloadUrl);

  } catch (err) {
    console.error('导出失败:', err);
    alert('导出失败');
  }
}

document.querySelector('#exportBtn').addEventListener('click', exportScores);

