const { v4: uuidv4 } = require('uuid');
const zlib = require('zlib');
const $root = require('./message.js');
const crypto = require('crypto');

const regex = /<\|BEGIN_SYSTEM\|>.*?<\|END_SYSTEM\|>.*?<\|BEGIN_USER\|>.*?<\|END_USER\|>/s;

async function stringToHex(messages, modelName) {
  const formattedMessages = messages.map((msg) => ({
    ...msg,
    role: msg.role === 'user' ? 1 : 2,
    message_id: uuidv4(),
  }));

  const message = {
    messages: formattedMessages,
    instructions: {
      instruction: 'Always respond in 中文',
    },
    projectPath: '/path/to/project',
    model: {
      name: modelName,
      empty: '',
    },
    requestId: uuidv4(),
    summary: '',
    conversationId: uuidv4(),
  };
  const errMsg = $root.ChatMessage.verify(message);
  if (errMsg) throw Error(errMsg);

  const messageInstance = $root.ChatMessage.create(message);

  const buffer = $root.ChatMessage.encode(messageInstance).finish();
  const hexString = (buffer.length.toString(16).padStart(10, '0') + buffer.toString('hex')).toUpperCase();

  return Buffer.from(hexString, 'hex');
}

async function chunkToUtf8String(chunk) {
  try {
    let hex = Buffer.from(chunk).toString('hex');

    let offset = 0;
    let results = [];

    while (offset < hex.length) {
      if (offset + 10 > hex.length) break;

      const dataLength = parseInt(hex.slice(offset, offset + 10), 16);
      offset += 10;

      if (offset + dataLength * 2 > hex.length) break;

      const messageHex = hex.slice(offset, offset + dataLength * 2);
      offset += dataLength * 2;

      const messageBuffer = Buffer.from(messageHex, 'hex');
      const message = $root.ResMessage.decode(messageBuffer);
      results.push(message.msg);
    }

    if (results.length == 0) {
      return gunzip(chunk);
    }
    return results.join('');
  } catch (err) {
    return gunzip(chunk);
  }
}

function gunzip(chunk) {
  return new Promise((resolve, reject) => {
    zlib.gunzip(chunk.slice(5), (err, decompressed) => {
      if (err) {
        resolve('');
      } else {
        const text = decompressed.toString('utf-8');
        // 这里只是尝试解析错误数据，如果是包含了全量的返回结果直接忽略
        if (regex.test(text)) {
          resolve('');
        } else {
          resolve(text);
        }
      }
    });
  });
}

function getRandomIDPro({ size, dictType, customDict }) {
  let random = '';
  if (!customDict) {
    switch (dictType) {
      case 'alphabet':
        customDict = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        break;
      case 'max':
        customDict = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
        break;
      default:
        customDict = '0123456789';
    }
  }
  for (; size--; ) random += customDict[(Math.random() * customDict.length) | 0];
  return random;
}

function generateHashed64Hex(input, salt = '') {
  const hash = crypto.createHash('sha256');
  hash.update(input + salt);
  return hash.digest('hex');
}

function obfuscateBytes(byteArray) {
  let t = 165;
  for (let r = 0; r < byteArray.length; r++) {
    byteArray[r] = (byteArray[r] ^ t) + (r % 256);
    t = byteArray[r];
  }
  return byteArray;
}

function generateCursorChecksum(token) {
  // 生成machineId和macMachineId
  const machineId = generateHashed64Hex(token, 'machineId');
  const macMachineId = generateHashed64Hex(token, 'macMachineId');

  // 获取时间戳并转换为字节数组
  const timestamp = Math.floor(Date.now() / 1e6);
  const byteArray = new Uint8Array([
    (timestamp >> 40) & 255,
    (timestamp >> 32) & 255,
    (timestamp >> 24) & 255,
    (timestamp >> 16) & 255,
    (timestamp >> 8) & 255,
    255 & timestamp,
  ]);

  // 混淆字节数组并进行base64编码
  const obfuscatedBytes = obfuscateBytes(byteArray);
  const encodedChecksum = Buffer.from(obfuscatedBytes).toString('base64');

  // 组合最终的checksum
  return `${encodedChecksum}${machineId}/${macMachineId}`;
}

module.exports = {
  stringToHex,
  chunkToUtf8String,
  getRandomIDPro,
  generateCursorChecksum,
};
