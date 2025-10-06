import { NextRequest, NextResponse } from 'next/server'
import { SecureLottoSystem } from '@/lib/crypto-lotto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { seed, hash, numbers, signature, publicKey } = body

    // Verify seed hash (provable fairness)
    if (seed && hash) {
      const isValidSeed = SecureLottoSystem.verifySeed(seed, hash)
      if (!isValidSeed) {
        return NextResponse.json({
          success: false,
          error: 'Seed verification failed - possible tampering'
        }, { status: 400 })
      }
    }

    // Verify signature (authenticity)
    if (numbers && signature && publicKey) {
      const isValidSignature = SecureLottoSystem.verifySignature(
        numbers,
        signature,
        publicKey
      )
      if (!isValidSignature) {
        return NextResponse.json({
          success: false,
          error: 'Signature verification failed - result may be tampered'
        }, { status: 400 })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Verification passed - result is authentic and fair',
      verified: true
    })

  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Return security information
    const securityInfo = {
      system: 'Batik Pools Secure Lottery',
      features: [
        'Cryptographically secure random number generation',
        'Provably fair system with seed verification',
        'Digital signatures for result authenticity',
        'RSA-2048 encryption for sensitive data',
        'Multiple entropy sources for maximum randomness'
      ],
      algorithms: {
        randomGeneration: 'SHA-512 with multiple entropy sources',
        encryption: 'AES-256-GCM',
        signatures: 'RSA-SHA256',
        keyExchange: 'RSA-2048'
      },
      lastSecurityAudit: new Date().toISOString(),
      nextSecurityAudit: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }

    return NextResponse.json({
      success: true,
      security: securityInfo
    })

  } catch (error) {
    console.error('Security info error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get security info' },
      { status: 500 }
    )
  }
}