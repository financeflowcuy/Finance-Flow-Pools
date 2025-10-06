import crypto from 'crypto'

export class SecureLottoSystem {
  private static readonly ALGORITHM = 'aes-256-gcm'
  private static readonly KEY_LENGTH = 32
  private static readonly IV_LENGTH = 16
  private static readonly TAG_LENGTH = 16

  /**
   * Generate cryptographically secure random numbers
   * Uses multiple entropy sources for maximum randomness
   */
  static generateSecureNumbers(count: number, min: number = 0, max: number = 9): number[] {
    const numbers: number[] = []
    const timestamp = Date.now().toString()
    const processInfo = process.pid.toString()
    
    for (let i = 0; i < count; i++) {
      // Combine multiple entropy sources
      const entropySources = [
        crypto.randomBytes(32),
        Buffer.from(timestamp + processInfo + i),
        crypto.randomBytes(16),
        Buffer.from(performance.now().toString())
      ]
      
      // Create combined entropy
      const combinedEntropy = Buffer.concat(entropySources)
      
      // Generate hash from combined entropy
      const hash = crypto.createHash('sha512').update(combinedEntropy).digest()
      
      // Extract number from hash
      const range = max - min + 1
      const number = min + (hash.readUInt32BE(0) % range)
      numbers.push(number)
    }
    
    return numbers
  }

  /**
   * Create a provably fair seed for lottery draws
   */
  static generateProvablyFairSeed(): {
    seed: string
    hash: string
    timestamp: number
  } {
    const seed = crypto.randomBytes(64).toString('hex')
    const hash = crypto.createHash('sha256').update(seed).digest('hex')
    const timestamp = Date.now()
    
    return { seed, hash, timestamp }
  }

  /**
   * Verify that a seed matches its hash (for provable fairness)
   */
  static verifySeed(seed: string, hash: string): boolean {
    const computedHash = crypto.createHash('sha256').update(seed).digest('hex')
    return computedHash === hash
  }

  /**
   * Generate lottery numbers using a seed (for provable fairness)
   */
  static generateNumbersFromSeed(
    seed: string, 
    count: number, 
    min: number = 0, 
    max: number = 9
  ): number[] {
    const numbers: number[] = []
    const hash = crypto.createHash('sha512').update(seed).digest()
    
    for (let i = 0; i < count; i++) {
      // Use different parts of the hash for each number
      const startIndex = (i * 4) % (hash.length - 4)
      const range = max - min + 1
      const number = min + (hash.readUInt32BE(startIndex) % range)
      numbers.push(number)
    }
    
    return numbers
  }

  /**
   * Encrypt sensitive data (like user bets)
   */
  static encrypt(data: string, key: string): {
    encrypted: string
    iv: string
    tag: string
  } {
    const iv = crypto.randomBytes(this.IV_LENGTH)
    const cipher = crypto.createCipherGCM(this.ALGORITHM, Buffer.from(key, 'hex'), iv)
    cipher.setAAD(Buffer.from('batik-pools'))
    
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const tag = cipher.getAuthTag()
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    }
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(
    encryptedData: string, 
    key: string, 
    iv: string, 
    tag: string
  ): string {
    const decipher = crypto.createDecipherGCM(this.ALGORITHM, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'))
    decipher.setAAD(Buffer.from('batik-pools'))
    decipher.setAuthTag(Buffer.from(tag, 'hex'))
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }

  /**
   * Generate a unique transaction ID
   */
  static generateTransactionId(): string {
    const timestamp = Date.now().toString(36)
    const randomBytes = crypto.randomBytes(8).toString('hex')
    return `BPK-${timestamp}-${randomBytes}`.toUpperCase()
  }

  /**
   * Create a digital signature for lottery results
   */
  static signResult(result: number[], privateKey: string): string {
    const resultString = result.join(',')
    const sign = crypto.createSign('RSA-SHA256')
    sign.update(resultString)
    sign.end()
    
    return sign.sign(privateKey, 'hex')
  }

  /**
   * Verify a digital signature
   */
  static verifySignature(
    result: number[], 
    signature: string, 
    publicKey: string
  ): boolean {
    const resultString = result.join(',')
    const verify = crypto.createVerify('RSA-SHA256')
    verify.update(resultString)
    verify.end()
    
    return verify.verify(publicKey, signature, 'hex')
  }

  /**
   * Generate RSA key pair for signing
   */
  static generateRSAKeyPair(): {
    publicKey: string
    privateKey: string
  } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    })
    
    return { publicKey, privateKey }
  }
}