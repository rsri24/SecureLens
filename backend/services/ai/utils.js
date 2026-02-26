// simple helper to split text into chunks not exceeding maxLength characters
function chunkText(text, maxLength = 15000) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + maxLength));
    start += maxLength;
  }
  return chunks;
}

module.exports = { chunkText };
