const major = parseInt(process.versions.node.split('.')[0], 10)
if (major < 22) {
  console.error(
`\n❌ Paket ini membutuhkan Node.js versi 22 atau lebih tinggi.\n` +
`   Saat ini kamu menggunakan Node.js versi ${process.versions.node}.\n` +
`   Silakan perbarui ke Node.js 22 atau lebih tinggi untuk dapat menjalankan paket ini.\n`
)
process.exit(1)
}