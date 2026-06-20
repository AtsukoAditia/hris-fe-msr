export const getDownloadFilename = (response, fallback) => {
  const disposition = response?.headers?.['content-disposition'] || ''
  const marker = 'filename='
  const position = disposition.toLowerCase().indexOf(marker)
  if (position < 0) return fallback

  const raw = disposition.slice(position + marker.length).split(';')[0].trim()
  const filename = raw.replaceAll('"', '').replaceAll("'", '')
  return filename || fallback
}

export const saveBlobResponse = (response, fallbackFilename) => {
  const fileBlob = response?.data instanceof Blob ? response.data : new Blob([response?.data ?? ''])
  const objectUrl = URL.createObjectURL(fileBlob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = getDownloadFilename(response, fallbackFilename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}
