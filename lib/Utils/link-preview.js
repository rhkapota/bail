const getUrlInfo = async (text, opts = {
thumbnailWidth: THUMBNAIL_WIDTH_PX,
fetchOpts: { timeout: 3000 }
}) => {
let retries = 0
const maxRetry = 5
try {
const { getLinkPreview } = await import('tool-preview-js')
let previewLink = text
if (!text.startsWith('http://') && !text.startsWith('https://')) {
previewLink = 'https://' + previewLink
}
const info = await getLinkPreview(previewLink, {
followRedirects: 'follow',
handleRedirects: (baseURL, forwardedURL) => {
retries++
const urlObj = new URL(baseURL)
const forwardedURLObj = new URL(forwardedURL)
if (retries >= maxRetry) return false
return (
forwardedURLObj.hostname === urlObj.hostname ||
forwardedURLObj.hostname === 'www.' + urlObj.hostname ||
'www.' + forwardedURLObj.hostname === urlObj.hostname
)
},
...opts.fetchOpts
})
if (info?.title) {
const image = info.images?.[0]
const urlInfo = {
'canonical-url': info.url,
'matched-text': text,
title: info.title,
description: info.description,
originalThumbnailUrl: image
}
if (opts.uploadImage) {
const { imageMessage } = await (0, messages_1.prepareWAMessageMedia)(
{ image: { url: image } },
{
upload: opts.uploadImage,
mediaTypeOverride: 'thumbnail-link',
options: opts.fetchOpts
}
)
urlInfo.jpegThumbnail = imageMessage?.jpegThumbnail
? Buffer.from(imageMessage.jpegThumbnail)
: undefined
urlInfo.highQualityThumbnail = imageMessage || undefined
} else {
try {
urlInfo.jpegThumbnail = image
? (await getCompressedJpegThumbnail(image, opts)).buffer
: undefined
} catch (error) {
opts.logger?.debug({ err: error.stack, url: previewLink }, 'error in generating thumbnail')
}
}
return urlInfo
}
} catch (error) {
if (!error.message.includes('receive a valid')) {
throw error
}
}
}